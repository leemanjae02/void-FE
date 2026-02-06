import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import styled from "styled-components";
import ParticleSphere from "../components/ParticleSphere";
import ChatInput from "../components/ChatInput";
import SendButton from "../components/SendButton";
import ResponseBox from "../components/ResponseBox";
import GlassCard from "../components/GlassCard";
import { userService } from "../services/userService";
import type { RankingItem } from "../@types/api";

const Container = styled.div`
  width: 100%;
  height: 100vh; /* fallback for older browsers */
  height: 100dvh;
  position: relative;
  overflow: hidden;
  /* background: linear-gradient(
    135deg,
    #f5f0ff 0%,
    #f0f4ff 30%,
    #fff0f5 60%,
    #f0f8ff 100%
  ); */
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
  &:hover {
    cursor: pointer;
  }
`;

const ResponseArea = styled.div`
  position: absolute;
  left: 50%;
  top: calc(50% - 200px);
  transform: translate(-50%, -100%);
  width: min(600px, calc(100% - 40px));
  z-index: 10;

  @media (max-width: 430px) {
    width: calc(100% - 32px);
    top: calc(50% - 150px); /* Slightly lower on mobile */
  }
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

  @media (max-width: 430px) {
    bottom: 24px;
    width: calc(100% - 32px);
  }
`;

const KeywordArea = styled.div`
  position: absolute;
  top: 40px;
  left: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;

  @media (max-width: 430px) {
    top: 24px;
    left: 20px;
    right: 20px; /* Full width with padding */
    width: auto;
    gap: 12px;
  }
`;

const KeywordTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: rgba(26, 26, 46, 0.7);
  margin-bottom: 4px;
  letter-spacing: -0.02em;

  @media (max-width: 430px) {
    font-size: 13px;
  }
`;

// Pre-defined colors for top 3 keywords
const KEYWORD_COLORS = ["#c7b8ff", "#ffb8d0", "#b8e0ff"];

export default function MainPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraZ, setCameraZ] = useState(6);
  const [keywords, setKeywords] = useState<RankingItem[]>([]);

  // Camera resize logic
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 430;
      setCameraZ(isMobile ? 9 : 6);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Poll Top 3 Keywords every 20 minutes

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const res = await userService.getTop3Keywords();

        if (res.isSuccess && Array.isArray(res.result)) {
          setKeywords(res.result);
        }
      } catch (err) {
        console.error("Failed to fetch keywords", err);
      }
    };

    fetchKeywords(); // Initial fetch

    const intervalId = setInterval(fetchKeywords, 20 * 60 * 1000); // 20 minutes

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    setResponse(null);
    setError(null);
    try {
      const res = await userService.ask(message);

      if (res.isSuccess) {
        setResponse(res.result.answer);
        setMessage("");
      } else {
        setError(res.message || "서버에서 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
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
        <Canvas gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, cameraZ]} fov={50} />
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
        {keywords.length > 0 ? (
          keywords.map((item, index) => (
            <GlassCard
              key={index}
              content={item.keyword}
              percentage={item.percentage}
              color={KEYWORD_COLORS[index % KEYWORD_COLORS.length]}
            />
          ))
        ) : (
          <>
            <GlassCard
              content="데이터 로딩 중..."
              percentage={0}
              color="#e0e0e0"
            />
            <GlassCard
              content="데이터 로딩 중..."
              percentage={0}
              color="#e0e0e0"
            />
            <GlassCard
              content="데이터 로딩 중..."
              percentage={0}
              color="#e0e0e0"
            />
          </>
        )}
      </KeywordArea>

      <ResponseArea>
        <ResponseBox content={response} />
      </ResponseArea>

      <BottomBar>
        <ChatInput
          value={message}
          onChange={(val) => {
            setMessage(val);
            if (error) setError(null);
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
