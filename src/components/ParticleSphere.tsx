import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleSphereProps {
  color?: string;
  onClick?: () => void;
  hasResponse?: boolean;
}

// ... (Constants remains same)
const PARTICLE_COUNT = 1700;
const SPHERE_RADIUS = 1;

// Vertex shader: Enhanced to react to uHover and uActive
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uHover;   // 0 -> 1 (Mouse Over)
  uniform float uActive;  // 0 -> 1 (Has Response)
  
  attribute float aRandom;
  attribute float aPhase;
  attribute float aBrightness;
  varying float vAlpha;
  varying float vHover; // Pass hover state to fragment

  // Compact 3D simplex-style noise (hash-based)
  vec3 hash3(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return fract(sin(p) * 43758.5453123);
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = dot(hash3(i), f);
    float b = dot(hash3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));
    float c = dot(hash3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));
    float d = dot(hash3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));
    float e = dot(hash3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));
    float g = dot(hash3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));
    float h = dot(hash3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));
    float j = dot(hash3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));
    return mix(
      mix(mix(a, b, f.x), mix(c, d, f.x), f.y),
      mix(mix(e, g, f.x), mix(h, j, f.x), f.y),
      f.z
    );
  }

  void main() {
    vHover = uHover;
    
    // Noise-based displacement: 
    // uActive increases amplitude slightly (breathing)
    // uHover makes it chaotic (vibration)
    vec3 dir = normalize(position);
    float noiseSpeed = 0.2 + uHover * 2.0; // Faster noise when hovered
    float n = noise3D(position * 2.5 + uTime * noiseSpeed);
    
    float baseDisplacement = (n - 0.5) * 0.08;
    float activeDisplacement = uActive * 0.05 * sin(uTime * 3.0); // Pulse
    float hoverDisplacement = uHover * (n - 0.5) * 0.3; // Strong vibration
    
    float displacement = baseDisplacement + activeDisplacement + hoverDisplacement;

    // Subtle breathing base
    float breathe = sin(uTime * 0.8 + aPhase * 6.2831) * 0.02 * aRandom;

    vec3 displaced = position + dir * (displacement + breathe);

    // Wave effect
    float wave = sin(uTime * (0.8 + aRandom * 1.2) + aPhase * 6.2831);
    displaced.y += wave * 0.12 * (0.5 + aRandom);

    // Shimmer & Brightness
    float shimmer = sin(uTime * (1.5 + uHover * 10.0 + aRandom * 2.0) + aPhase * 6.2831);
    shimmer = shimmer * 0.5 + 0.5; // 0→1
    
    // Brightness increases with activity and hover
    float brightness = pow(shimmer, 3.5) * 0.5 + aBrightness * 0.5;
    brightness += uActive * 0.2 + uHover * 0.5; 
    
    vAlpha = 0.2 + brightness * 0.6;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);

    // Particles get slightly larger when active/hovered
    float scale = 1.0 + uActive * 0.3 + uHover * 0.5;
    gl_PointSize = (scale + aBrightness * 1.5) * (50.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader: Color shift on hover
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vHover;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float strength = 1.0 - smoothstep(0.0, 0.5, dist);

    // Mix base color with a warning color (e.g., Red/Orange) based on hover
    vec3 warningColor = vec3(1.0, 0.3, 0.3); // Reddish
    vec3 finalColor = mix(uColor, warningColor, vHover * 0.8);

    gl_FragColor = vec4(finalColor, vAlpha * strength);
  }
`;

export default function ParticleSphere({
  color = "#4a90d9",
  onClick,
  hasResponse = false,
}: ParticleSphereProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const hoverRef = useRef(0); // 0: None, 1: Hovered (Target value)

  const { positions, randoms, phases, brightnesses } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const rnd = new Float32Array(PARTICLE_COUNT);
    const phs = new Float32Array(PARTICLE_COUNT);
    const brt = new Float32Array(PARTICLE_COUNT);

    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Fibonacci sphere for even surface distribution
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT);

      // Tight radius jitter: thin shell, less clumping
      const r = SPHERE_RADIUS * (0.97 + Math.random() * 0.06);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      rnd[i] = Math.random();
      phs[i] = Math.random();
      // Pre-baked brightness: power distribution so most are dim, few are bright
      brt[i] = Math.pow(Math.random(), 2.5);
    }

    return { positions: pos, randoms: rnd, phases: phs, brightnesses: brt };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uHover: { value: 0 },
      uActive: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Update color only when the color prop changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value.set(color);
    }
  }, [color]);

  useFrame((_, delta) => {
    if (materialRef.current) {
      // Smoothly interpolate uniforms
      const targetActive = hasResponse ? 1 : 0;
      // Only trigger red/chaotic hover effect if there's a response to clear
      const targetHover = hasResponse ? hoverRef.current : 0;
      
      materialRef.current.uniforms.uActive.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uActive.value,
        targetActive,
        delta * 3
      );
      
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value,
        targetHover,
        delta * 5
      );

      materialRef.current.uniforms.uTime.value += delta;
    }

    if (pointsRef.current) {
      // Base speed + Active speed + Hover speed (FAST)
      let rotationSpeed = 0.05;
      if (hasResponse) {
        rotationSpeed += 0.05; // Slightly faster when active
        if (hoverRef.current > 0.5) {
          rotationSpeed += 0.4; // MUCH faster on hover ONLY if hasResponse
        }
      }

      pointsRef.current.rotation.y += delta * rotationSpeed;
      pointsRef.current.rotation.x += delta * rotationSpeed * 0.6;
    }
  });

  return (
    <points 
      ref={pointsRef} 
      onClick={onClick}
      onPointerOver={() => { 
        hoverRef.current = 1; 
        if (hasResponse) document.body.style.cursor = "pointer"; 
      }}
      onPointerOut={() => { 
        hoverRef.current = 0; 
        document.body.style.cursor = "auto";
      }}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          args={[randoms, 1]}
          count={PARTICLE_COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          args={[phases, 1]}
          count={PARTICLE_COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aBrightness"
          args={[brightnesses, 1]}
          count={PARTICLE_COUNT}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
