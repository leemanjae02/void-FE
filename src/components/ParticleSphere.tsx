import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleSphereProps {
  color?: string;
}

/**
 * ParticleSphere - High-density, dots-only particle sphere.
 *
 * How the shader achieves the "dots only" look:
 * - THREE.Points renders each vertex as a single square point sprite — never a line.
 * - gl_PointSize is kept small (1–3 device pixels) so each particle reads as a fine dot/grain.
 * - The fragment shader uses a simple radial falloff to soften each dot, but the tiny size
 *   means they still read as individual specks, not soft circles.
 * - NO lines, trails, or streaks are ever generated — all "motion blur" texture comes from
 *   the sheer density of 30,000+ points and their varying brightness.
 *
 * Performance notes:
 * - BufferGeometry stores all vertex data in typed arrays uploaded once to the GPU.
 * - Custom ShaderMaterial runs all animation (noise displacement, shimmer) on the GPU.
 * - Single draw call for all 30k particles. Only one float uniform (uTime) updates per frame.
 */
const PARTICLE_COUNT = 1700;
const SPHERE_RADIUS = 1;

// Vertex shader: noise-based radial displacement for organic volume,
// per-particle shimmer brightness passed via varying.
const vertexShader = /* glsl */ `
  uniform float uTime;
  attribute float aRandom;
  attribute float aPhase;
  attribute float aBrightness;
  varying float vAlpha;

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
    // Noise-based displacement: gentle push along radial direction
    vec3 dir = normalize(position);
    float n = noise3D(position * 2.5 + uTime * 0.2);
    float displacement = (n - 0.5) * 0.08;

    // Subtle breathing: slow radial oscillation per particle
    float breathe = sin(uTime * 0.8 + aPhase * 6.2831) * 0.02 * aRandom;

    vec3 displaced = position + dir * (displacement + breathe);

    // Vertical wave: each particle bobs up/down at its own speed & phase
    float wave = sin(uTime * (0.8 + aRandom * 1.2) + aPhase * 6.2831);
    displaced.y += wave * 0.12 * (0.5 + aRandom);

    // Shimmer: smooth brightness variation
    float shimmer = sin(uTime * (1.5 + aRandom * 2.0) + aPhase * 6.2831);
    shimmer = shimmer * 0.5 + 0.5; // 0→1
    float brightness = pow(shimmer, 3.5) * 0.5 + aBrightness * 0.5;
    vAlpha = 0.2 + brightness * 0.6;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);

    // Point size tuned for ~1200 particles on radius 1: visible but not blobby
    gl_PointSize = (1.0 + aBrightness * 1.5) * (50.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader: renders each point as a tiny dot with soft radial falloff.
// The small gl_PointSize means even with softening, they read as discrete grains.
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Soft radial falloff for subtle anti-aliasing at dot edges
    float strength = 1.0 - smoothstep(0.0, 0.5, dist);

    // On white background: use color directly, control visibility through alpha only
    gl_FragColor = vec4(uColor, vAlpha * strength);
  }
`;

export default function ParticleSphere({
  color = "#4a90d9",
}: ParticleSphereProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uColor.value.set(color);
    }
    if (pointsRef.current) {
      // Diagonal rotation: left-top → right-bottom axis
      const speed = 0.05; // ← 회전 속도
      pointsRef.current.rotation.y += delta * speed;
      pointsRef.current.rotation.x += delta * speed * 0.6;
    }
  });

  return (
    <points ref={pointsRef}>
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
