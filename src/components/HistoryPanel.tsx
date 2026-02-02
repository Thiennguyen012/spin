import { Trophy, Trash2 } from 'lucide-react';

interface HistoryPanelProps {
  history: number[];
  onClear: () => void;
}

const HistoryPanel = ({ history, onClear }: HistoryPanelProps) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-2xl bg-card/50 rounded-xl border border-lucky-border/30 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-lucky-gold">
          <Trophy className="w-5 h-5" />
          <span className="font-bold text-sm sm:text-base">LỊCH SỬ QUAY SỐ</span>
        </div>
        <button
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive transition-colors text-sm flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Xóa tất cả
        </button>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {history.map((number, index) => (
          <div
            key={index}
            className="bg-secondary px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-lucky-border/30
                       transition-all duration-300 hover:border-lucky-gold"
          >
            <span className="text-muted-foreground text-xs sm:text-sm">#{index + 1}:</span>
            <span className="text-lucky-gold font-bold ml-1 text-sm sm:text-base">{number}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
