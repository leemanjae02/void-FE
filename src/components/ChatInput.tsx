import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  /* Light reflection overlay (only on input part, implemented via ::before on wrapper or kept on input) */
  /* Simplified for structure: The glare effect is best kept on the input itself or a wrapper around just the input */
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
  
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
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0.15) 35%,
      transparent 50%,
      transparent 100%
    );
    pointer-events: none;
  }
`;

const GlassInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 16px 24px;
  font-size: 16px;

  /* Glassmorphism */
  background: ${(p) =>
    p.$hasError
      ? "rgba(255, 50, 50, 0.15)"
      : "rgba(255, 255, 255, 0.35)"}; /* Error bg vs Normal */
  backdrop-filter: blur(20px);
  border: 1px solid
    ${(p) =>
      p.$hasError
        ? "rgba(255, 80, 80, 0.8)"
        : "rgba(255, 255, 255, 0.8)"}; /* Error border vs Normal */
  border-radius: 24px;
  box-shadow: ${(p) =>
    p.$hasError
      ? "0 8px 32px 0 rgba(255, 0, 0, 0.15), inset 0 1px 0 0 rgba(255, 200, 200, 0.6)"
      : "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)"};

  outline: none;
  color: #1a1a2e;
  transition: all 0.25s ease;

  &::placeholder {
    color: ${(p) => (p.$hasError ? "rgba(255, 100, 100, 0.6)" : "rgba(26, 26, 46, 0.4)")};
  }

  &:focus {
    border-color: ${(p) => (p.$hasError ? "#ff4d4d" : "rgba(180, 180, 255, 0.9)")};
    box-shadow: ${(p) =>
      p.$hasError
        ? "0 8px 32px 0 rgba(255, 0, 0, 0.2), 0 0 0 3px rgba(255, 50, 50, 0.2)"
        : "0 8px 32px 0 rgba(31, 38, 135, 0.2), 0 0 0 3px rgba(180, 180, 255, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)"};
  }
`;

const ErrorMessage = styled(motion.span)`
  margin-left: 16px;
  font-size: 13px;
  color: #ff4d4d;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything...",
  disabled = false,
  error = null,
}: ChatInputProps) {
  return (
    <InputWrapper>
      <InputContainer>
        <GlassInput
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && !disabled)
              onSubmit();
          }}
          placeholder={placeholder}
          disabled={disabled}
          $hasError={!!error}
          style={{
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
      </InputContainer>
      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
    </InputWrapper>
  );
}
