import styled from "styled-components";

const InputWrapper = styled.div`
  position: relative;
  width: 100%;

  /* Light reflection overlay */
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

const GlassInput = styled.input`
  width: 100%;
  padding: 16px 24px;
  font-size: 16px;

  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.35); /* 투명도 */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.6);

  outline: none;
  color: #1a1a2e;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;

  &::placeholder {
    color: rgba(26, 26, 46, 0.4);
  }

  &:focus {
    border-color: rgba(180, 180, 255, 0.9);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2),
      0 0 0 3px rgba(180, 180, 255, 0.2),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.6);
  }
`;

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything...",
  disabled = false,
}: ChatInputProps) {
  return (
    <InputWrapper>
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
        style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "text" }}
      />
    </InputWrapper>
  );
}
