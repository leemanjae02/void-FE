import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const Card = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 280px; /* Fixed width for graph consistency */
  padding: 12px 18px;
  overflow: hidden; /* For progress bar clipping */

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
  percentage?: number; // 0 to 100
  color?: string;
  visible?: boolean;
}

export default function GlassCard({
  content,
  percentage = 0,
  color = "#a0a0ff",
  visible = true,
}: GlassCardProps) {
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
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
            $color={color}
          />
          
          {/* Content Layer */}
          <span style={{ zIndex: 1 }}>{content}</span>
          <PercentageText>{percentage}%</PercentageText>
        </Card>
      )}
    </AnimatePresence>
  );
}
