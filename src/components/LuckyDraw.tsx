import { useState, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { Gift, PartyPopper, Star } from "lucide-react";
import NumberSlot from "./NumberSlot";
import SpinButton from "./SpinButton";
import RangeSelector from "./RangeSelector";
import HistoryPanel from "./HistoryPanel";
import ParticleBackground from "./ParticleBackground";
import {
  saveSpinToHistory,
  clearSpinHistory,
  exportHistoryAsJSON,
  exportHistoryAsCSV,
  getSpinHistory,
} from "@/lib/historyStorage";

const LuckyDraw = () => {
  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(999);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = getSpinHistory();
    if (savedHistory && savedHistory.records.length > 0) {
      const historyNumbers = savedHistory.records.map(
        (record) => record.number,
      );
      setHistory(historyNumbers);
      // Set current number to the last spin result
      if (historyNumbers.length > 0) {
        setCurrentNumber(historyNumbers[historyNumbers.length - 1]);
      }
    }
  }, []);

  // Initialize available numbers
  useEffect(() => {
    const numbers: number[] = [];
    for (let i = minValue; i <= maxValue; i++) {
      if (!history.includes(i)) {
        numbers.push(i);
      }
    }
    setAvailableNumbers(numbers);
  }, [minValue, maxValue, history]);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 1000,
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: [
          "#FFD700",
          "#FFA500",
          "#FF6347",
          "#00FF00",
          "#00BFFF",
          "#FF1493",
        ],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: [
          "#FFD700",
          "#FFA500",
          "#FF6347",
          "#00FF00",
          "#00BFFF",
          "#FF1493",
        ],
      });
    }, 250);
  }, []);

  const handleSpin = useCallback(() => {
    if (availableNumbers.length === 0) {
      alert("Đã hết số để quay! Vui lòng xóa lịch sử hoặc điều chỉnh phạm vi.");
      return;
    }

    setIsSpinning(true);

    // Pick a random number from available numbers
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const selectedNumber = availableNumbers[randomIndex];

    setTimeout(() => {
      setCurrentNumber(selectedNumber);
      setHistory((prev) => [...prev, selectedNumber]);
      // Lưu vào localStorage
      saveSpinToHistory(selectedNumber, minValue, maxValue);
      setIsSpinning(false);
      fireConfetti();
    }, 2500);
  }, [availableNumbers, fireConfetti, minValue, maxValue]);

  const handleClearHistory = () => {
    setHistory([]);
    setCurrentNumber(null);
    // Xóa khỏi localStorage
    clearSpinHistory();
  };

  const getDigits = (num: number | null): [number, number, number] => {
    if (num === null) return [0, 0, 0];
    const padded = String(num).padStart(3, "0");
    return [parseInt(padded[0]), parseInt(padded[1]), parseInt(padded[2])];
  };

  const digits = getDigits(currentNumber);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start pt-8 sm:pt-12 px-4 pb-8 relative overflow-hidden">
      <ParticleBackground />

      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 z-10">
        <Star
          className="w-6 h-6 sm:w-8 sm:h-8 text-lucky-gold animate-float"
          style={{ animationDelay: "0s" }}
        />
        <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
        <Star
          className="w-6 h-6 sm:w-8 sm:h-8 text-lucky-gold animate-float"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-lucky-gold lucky-text-glow mb-2 sm:mb-4 z-10 tracking-wider">
        LUCKY DRAW
      </h1>

      <div className="flex items-center gap-2 text-muted-foreground mb-6 sm:mb-8 z-10">
        <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">Sự kiện cuối năm 2024</span>
        <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* Range Selector */}
      <div className="mb-6 sm:mb-8 z-10">
        <RangeSelector
          minValue={minValue}
          maxValue={maxValue}
          onMinChange={setMinValue}
          onMaxChange={setMaxValue}
          disabled={isSpinning}
        />
      </div>

      {/* Number Display */}
      <div className="relative mb-8 sm:mb-10 z-10">
        <div className="bg-card rounded-2xl p-6 sm:p-8 border-2 border-lucky-border lucky-glow">
          <div className="flex gap-3 sm:gap-4 md:gap-6">
            <NumberSlot value={digits[0]} isSpinning={isSpinning} delay={0} />
            <NumberSlot value={digits[1]} isSpinning={isSpinning} delay={200} />
            <NumberSlot value={digits[2]} isSpinning={isSpinning} delay={400} />
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-lucky-border" />
            ))}
          </div>
        </div>
      </div>

      {/* Remaining Numbers Info */}
      <div className="text-muted-foreground text-sm mb-4 z-10">
        Còn lại:{" "}
        <span className="text-lucky-gold font-bold">
          {availableNumbers.length}
        </span>{" "}
        số
      </div>

      {/* Spin Button */}
      <div className="mb-8 sm:mb-10 z-10">
        <SpinButton
          onClick={handleSpin}
          disabled={availableNumbers.length === 0}
          isSpinning={isSpinning}
        />
      </div>

      {/* History Panel */}
      <div className="z-10 w-full flex justify-center">
        <HistoryPanel history={history} onClear={handleClearHistory} />
      </div>
    </div>
  );
};

export default LuckyDraw;
