import styled from "styled-components";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

const GlassButton = styled(motion.button)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  overflow: hidden;

  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.4); /* 투명도 */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.6);

  cursor: pointer;
  color: #1a1a2e;
  transition: background 0.2s ease, box-shadow 0.2s ease;

  /* Light reflection */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0.1) 40%,
      transparent 60%
    );
    pointer-events: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.7);
  }
`;

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SendButton({ onClick, disabled = false }: SendButtonProps) {
  return (
    <GlassButton
      onClick={!disabled ? onClick : undefined}
      whileTap={!disabled ? { scale: 0.9 } : undefined}
      whileHover={!disabled ? { scale: 1.08 } : undefined}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </GlassButton>
  );
}
