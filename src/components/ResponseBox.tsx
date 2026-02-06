import { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const GlassCard = styled(motion.div)`
  position: relative;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  padding: 20px 24px;

  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.45); /* 투명도 */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.6);

  font-size: 15px;
  line-height: 1.7;
  color: #1a1a2e;
  white-space: pre-wrap;
  word-break: break-word;

  /* Light reflection: diagonal shine across the glass surface */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    background: linear-gradient(
      105deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.1) 40%,
      transparent 50%,
      transparent 100%
    );
    pointer-events: none;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(31, 38, 135, 0.15);
    border-radius: 2px;
  }

  @media (max-width: 430px) {
    padding: 16px 20px;
    font-size: 14px;
    border-radius: 20px;
    max-height: 250px;
  }
`;

interface ResponseBoxProps {
  content: string | null;
}

export default function ResponseBox({ content }: ResponseBoxProps) {
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    if (!content) {
      setDisplayedContent("");
      return;
    }

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 30); // 타자 속도 (ms)

    return () => clearInterval(typingInterval);
  }, [content]);

  return (
    <AnimatePresence>
      {content && (
        <GlassCard
          initial={{ opacity: 0, y: 12, filter: "blur(0px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{
            opacity: [1, 1, 0], // 처음엔 불투명하다가 나중에 사라짐
            y: [0, -10, -60], // 살짝 떴다가 확 날아감
            scale: [1, 1.02, 1.2], // 팽창하다가 터짐
            filter: [
              "blur(0px) url(#dissolve-filter-weak)", // 초기: 미세한 노이즈
              "blur(2px) url(#dissolve-filter)", // 중반: 흩어짐 시작
              "blur(12px) url(#dissolve-filter)", // 후반: 완전 분해
            ],
            transition: { duration: 2.2, times: [0, 0.3, 1], ease: "anticipate" },
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {displayedContent}
        </GlassCard>
      )}
    </AnimatePresence>
  );
}
