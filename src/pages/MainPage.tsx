import { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import styled from "styled-components";
import ParticleSphere from "../components/ParticleSphere";
import ChatInput from "../components/ChatInput";
import SendButton from "../components/SendButton";
import ResponseBox from "../components/ResponseBox";
import GlassCard from "../components/GlassCard";

const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  // background: linear-gradient(
  //   135deg,
  //   #f5f0ff 0%,
  //   #f0f4ff 30%,
  //   #fff0f5 60%,
  //   #f0f8ff 100%
  // );
`;

/* 배경 그라디언트 blob: glass blur 대상이 되어 유리 투과 효과를 만듦 */
const BgBlob = styled.div<{
  $color: string;
  $size: number;
  $top: string;
  $left: string;
}>`
  position: absolute;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  top: ${(p) => p.$top};
  left: ${(p) => p.$left};
  border-radius: 50%;
  background: ${(p) => p.$color};
  filter: blur(80px);
  opacity: 0.6;
  pointer-events: none;
  z-index: 1;
`;

const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const ResponseArea = styled.div`
  position: absolute;
  left: 50%;
  top: calc(50% - 200px);
  transform: translate(-50%, -100%);
  width: min(600px, calc(100% - 40px));
  z-index: 10;
`;

const BottomBar = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(600px, calc(100% - 40px));
  z-index: 10;
`;

const KeywordArea = styled.div`
  position: absolute;
  top: 40px;
  left: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;
`;

const KeywordTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: rgba(26, 26, 46, 0.7);
  margin-bottom: 4px;
  letter-spacing: -0.02em;
`;

export default function MainPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    // Mock Error Check
    if (message.toLowerCase().includes("error")) {
      setError("입력하신 내용에 개인정보(예: 전화번호)가 포함되어 있습니다.");
      return;
    }

    setIsLoading(true);
    setResponse(null); // Clear previous response

    // Simulate network delay
    setTimeout(() => {
      setResponse(`You said: "${message}"`);
      setMessage("");
      setIsLoading(false);
    }, 1000);
  }, [message, isLoading]);

  const handleClearResponse = useCallback(() => {
    setResponse(null);
  }, []);

  return (
    <Container>
      <BgBlob $color="#c7b8ff" $size={400} $top="10%" $left="15%" />
      <BgBlob $color="#ffb8d0" $size={350} $top="55%" $left="65%" />
      <BgBlob $color="#b8e0ff" $size={300} $top="30%" $left="70%" />
      <BgBlob $color="#ffe0b8" $size={250} $top="70%" $left="10%" />

      <CanvasWrapper>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ParticleSphere
            color="#c0c0c0"
            onClick={handleClearResponse}
            hasResponse={!!response}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.4}
          />
        </Canvas>
      </CanvasWrapper>
      <KeywordArea>
        <KeywordTitle>현재 사용자가 가장 많이 선택한 키워드</KeywordTitle>
        <GlassCard content={"디지털 가디언"} percentage={72} color="#c7b8ff" />
        <GlassCard content={"사이버 보안"} percentage={45} color="#b8e0ff" />
        <GlassCard content={"미래 기술"} percentage={28} color="#ffb8d0" />
      </KeywordArea>

      <ResponseArea>
        <ResponseBox content={response} />
      </ResponseArea>

      <BottomBar>
        <ChatInput
          value={message}
          onChange={(val) => {
            setMessage(val);
            if (error) setError(null); // Clear error on typing
          }}
          onSubmit={handleSubmit}
          disabled={isLoading}
          error={error}
        />
        <SendButton onClick={handleSubmit} disabled={isLoading} />
      </BottomBar>
    </Container>
  );
}
