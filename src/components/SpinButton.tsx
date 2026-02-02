import { Sparkles } from 'lucide-react';

interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSpinning: boolean;
}

const SpinButton = ({ onClick, disabled, isSpinning }: SpinButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isSpinning}
      className={`
        group relative px-12 py-4 sm:px-16 sm:py-5
        bg-gradient-to-b from-lucky-gold to-amber-600
        rounded-full font-bold text-lg sm:text-xl text-lucky-darker
        transition-all duration-300
        hover:from-amber-400 hover:to-amber-500
        hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${isSpinning ? 'animate-pulse' : ''}
      `}
    >
      <span className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        <span>{isSpinning ? 'ĐANG QUAY...' : 'QUAY SỐ'}</span>
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
      </span>
    </button>
  );
};

export default SpinButton;
