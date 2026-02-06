import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const Card = styled(motion.div)`
  position: relative;
  display: inline-block;
  max-width: 360px;
  padding: 12px 18px;

  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.45); /* 투명도 */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 20px 0 rgba(31, 38, 135, 0.12),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.6);

  font-size: 13px;
  line-height: 1.5;
  color: #1a1a2e;
  white-space: pre-wrap;
  word-break: break-word;

  /* Light reflection */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    background: linear-gradient(
      105deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.1) 40%,
      transparent 50%,
      transparent 100%
    );
    pointer-events: none;
  }
  &:hover {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.7);
  }
`;

interface GlassCardProps {
  content: string | null;
  visible?: boolean;
}

export default function GlassCard({ content, visible = true }: GlassCardProps) {
  return (
    <AnimatePresence>
      {visible && content && (
        <Card
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {content}
        </Card>
      )}
    </AnimatePresence>
  );
}
