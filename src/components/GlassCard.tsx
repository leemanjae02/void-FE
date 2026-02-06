import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const Card = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%; /* Desktop fixed width */
  min-width: 200px;
  padding: 12px 18px;
  overflow: hidden;

  /* Glassmorphism base */
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  box-shadow: 0 4px 12px 0 rgba(31, 38, 135, 0.08),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.4);

  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px 0 rgba(31, 38, 135, 0.15),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.6);
  }

  @media (max-width: 430px) {
    width: 100%; /* Mobile full width */
    max-width: 100%;
    padding: 10px 14px;
    font-size: 13px;
  }
`;

const ProgressBar = styled(motion.div)<{ $color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: ${(p) => p.$color};
  opacity: 0.35; /* Subtle fill */
  z-index: -1;
  border-radius: 12px 0 0 12px; /* Matching corner radius */
`;

const PercentageText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(26, 26, 46, 0.6);
`;

interface GlassCardProps {
  content: string | null;
  percentage?: number | string; /* "11%" 문자열 또는 숫자 모두 지원 */
  color?: string;
  visible?: boolean;
}

function parsePercentage(val: number | string): number {
  if (typeof val === "number") return val;
  return parseInt(val.replace("%", ""), 10) || 0;
}

export default function GlassCard({
  content,
  percentage = 0,
  color = "#a0a0ff",
  visible = true,
}: GlassCardProps) {
  const numPercent = parsePercentage(percentage);
  return (
    <AnimatePresence>
      {visible && content && (
        <Card
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Progress Bar Background */}
          <ProgressBar
            initial={{ width: 0 }}
            animate={{ width: `${numPercent}%` }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
            $color={color}
          />

          {/* Content Layer */}
          <span style={{ zIndex: 1 }}>{content}</span>
          <PercentageText>{numPercent}%</PercentageText>
        </Card>
      )}
    </AnimatePresence>
  );
}
