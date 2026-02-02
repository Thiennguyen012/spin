import { ArrowRight } from 'lucide-react';

interface RangeSelectorProps {
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  disabled: boolean;
}

const RangeSelector = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  disabled,
}: RangeSelectorProps) => {
  return (
    <div className="flex items-center gap-3 sm:gap-4 bg-secondary/50 rounded-full px-6 py-3 border border-lucky-border/30">
      <span className="text-muted-foreground text-sm sm:text-base font-medium">TỪ:</span>
      <input
        type="number"
        value={minValue}
        onChange={(e) => onMinChange(parseInt(e.target.value) || 1)}
        disabled={disabled}
        min={1}
        className="w-16 sm:w-20 bg-input rounded-lg px-3 py-2 text-center text-lucky-gold font-bold 
                   border border-lucky-border/30 focus:border-lucky-gold focus:outline-none
                   disabled:opacity-50"
      />
      <ArrowRight className="w-5 h-5 text-muted-foreground" />
      <span className="text-muted-foreground text-sm sm:text-base font-medium">ĐẾN:</span>
      <input
        type="number"
        value={maxValue}
        onChange={(e) => onMaxChange(parseInt(e.target.value) || 999)}
        disabled={disabled}
        min={minValue + 1}
        className="w-16 sm:w-20 bg-input rounded-lg px-3 py-2 text-center text-lucky-gold font-bold 
                   border border-lucky-border/30 focus:border-lucky-gold focus:outline-none
                   disabled:opacity-50"
      />
    </div>
  );
};

export default RangeSelector;
