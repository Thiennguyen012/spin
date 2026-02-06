import { useEffect, useState } from "react";

interface NumberSlotProps {
  value: number;
  isSpinning: boolean;
  delay?: number;
}

const NumberSlot = ({ value, isSpinning, delay = 0 }: NumberSlotProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (isSpinning) {
      setSpinning(true);
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 10));
      }, 50);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setSpinning(false);
        setDisplayValue(value);
      }, 4500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setDisplayValue(value);
      setSpinning(false);
    }
  }, [isSpinning, value]);

  return (
    <div
      className={`
        relative w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40
        bg-lucky-slot rounded-lg border-2 border-lucky-border
        flex items-center justify-center
        transition-all duration-300
        ${spinning ? "lucky-glow-intense" : ""}
      `}
    >
      <span
        className={`
          font-display text-6xl sm:text-7xl md:text-8xl text-lucky-gold
          transition-all duration-100
          ${spinning ? "blur-sm" : "lucky-text-glow"}
        `}
      >
        {displayValue}
      </span>
    </div>
  );
};

export default NumberSlot;
