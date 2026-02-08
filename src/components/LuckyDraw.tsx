import { useState, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { Gift, PartyPopper, Star, Settings, Move, Lock } from "lucide-react";
import NumberSlot from "./NumberSlot";
import SpinButton from "./SpinButton";
import RangeSelector from "./RangeSelector";
import HistoryPanel from "./HistoryPanel";
import ParticleBackground from "./ParticleBackground";
import BackgroundUploader from "./BackgroundUploader";
import Draggable from "./Draggable";
import { useSound } from "@/hooks/useSound";
import {
  saveSpinToHistory,
  clearSpinHistory,
  exportHistoryAsJSON,
  exportHistoryAsCSV,
  getSpinHistory,
  saveRangeSettings,
  getRangeSettings,
} from "@/lib/historyStorage";

const LuckyDraw = () => {
  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState<number | null>(199);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(
    () => {
      try {
        return localStorage.getItem("lucky_custom_background");
      } catch {
        return null;
      }
    },
  );

  // Initialize sound hook
  const playSpinSound = useSound("/sounds/spin.mp3");

  // Load history and range settings from localStorage on mount
  useEffect(() => {
    // Load range settings
    const savedRange = getRangeSettings();
    if (savedRange) {
      setMinValue(savedRange.minValue);
      setMaxValue(savedRange.maxValue ?? 199);
    }

    // Load history
    const savedHistory = getSpinHistory();
    if (savedHistory && savedHistory.records.length > 0) {
      const historyNumbers = savedHistory.records.map(
        (record) => record.number,
      );
      setHistory(historyNumbers);
    }
  }, []);

  // Initialize available numbers
  useEffect(() => {
    const numbers: number[] = [];
    // Use savedRange if maxValue is null
    let effectiveMaxValue = maxValue;
    if (effectiveMaxValue === null) {
      const savedRange = getRangeSettings();
      effectiveMaxValue = savedRange?.maxValue || null;
    }

    if (effectiveMaxValue !== null) {
      for (let i = minValue; i <= effectiveMaxValue; i++) {
        if (!history.includes(i)) {
          numbers.push(i);
        }
      }
    }
    setAvailableNumbers(numbers);
  }, [minValue, maxValue, history]);

  // Save range settings whenever they change
  useEffect(() => {
    saveRangeSettings(minValue, maxValue);
  }, [minValue, maxValue]);

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
    // Check if maxValue is empty and fallback to localStorage
    let effectiveMaxValue = maxValue;
    if (effectiveMaxValue === null) {
      const savedRange = getRangeSettings();
      effectiveMaxValue = savedRange?.maxValue || null;
    }

    if (effectiveMaxValue === null) {
      alert("Vui lòng nhập giá trị tối đa cho phạm vi!");
      return;
    }

    if (availableNumbers.length === 0) {
      alert("Đã hết số để quay! Vui lòng xóa lịch sử hoặc điều chỉnh phạm vi.");
      return;
    }

    setIsSpinning(true);
    playSpinSound();

    // Pick a random number from available numbers
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const selectedNumber = availableNumbers[randomIndex];

    setTimeout(() => {
      setCurrentNumber(selectedNumber);
      setHistory((prev) => [...prev, selectedNumber]);
      // Lưu vào localStorage with the effective max value
      saveSpinToHistory(selectedNumber, minValue, effectiveMaxValue);
      setIsSpinning(false);
      fireConfetti();
    }, 4500);
  }, [availableNumbers, fireConfetti, minValue, maxValue, playSpinSound]);

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
      <ParticleBackground customBackground={customBackground} />

      {/* Toggle History Button */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="fixed bottom-4 right-4 z-20 p-2 rounded-lg bg-lucky-gold/10 hover:bg-lucky-gold/20 text-lucky-gold transition-colors"
        title={showHistory ? "Hide settings" : "Show settings"}
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Edit Mode Toggle */}
      <button
        onClick={() => setEditMode(!editMode)}
        className={`fixed bottom-4 right-14 z-20 p-2 rounded-lg transition-colors ${
          editMode
            ? "bg-lucky-gold/30 text-lucky-gold ring-2 ring-lucky-gold"
            : "bg-lucky-gold/10 hover:bg-lucky-gold/20 text-lucky-gold"
        }`}
        title={editMode ? "Khóa vị trí" : "Điều chỉnh vị trí"}
      >
        {editMode ? <Lock className="w-6 h-6" /> : <Move className="w-6 h-6" />}
      </button>

      {/* Edit Mode Indicator */}
      {editMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 bg-lucky-gold/90 text-black px-4 py-2 rounded-lg text-sm font-bold">
          CHẾ ĐỘ CHỈNH SỬA - Kéo thả để di chuyển, +/- để phóng to thu nhỏ, nhấn
          🔒 để khóa
        </div>
      )}

      {/* Title - Draggable */}
      <Draggable storageKey="title" editMode={editMode} className="z-10">
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-lucky-gold lucky-text-glow mb-5 sm:mb-10 tracking-wider mt-[200px]">
          LUCKY DRAW
        </h1>
      </Draggable>

      {/* Number Display - Draggable */}
      <Draggable storageKey="numbers" editMode={editMode} className="z-10">
        <div className="relative mb-5 sm:mb-10">
          <div className="bg-card rounded-2xl p-6 sm:p-8 border-2 border-lucky-border lucky-glow">
            <div className="flex gap-3 sm:gap-4 md:gap-6">
              <NumberSlot value={digits[0]} isSpinning={isSpinning} delay={0} />
              <NumberSlot
                value={digits[1]}
                isSpinning={isSpinning}
                delay={200}
              />
              <NumberSlot
                value={digits[2]}
                isSpinning={isSpinning}
                delay={400}
              />
            </div>
          </div>
        </div>
      </Draggable>

      {/* Spin Button - Draggable */}
      <Draggable storageKey="spinButton" editMode={editMode} className="z-10">
        <div className="mb-8 sm:mb-10">
          <SpinButton
            onClick={editMode ? () => {} : handleSpin}
            disabled={editMode || availableNumbers.length === 0}
            isSpinning={isSpinning}
          />
        </div>
      </Draggable>

      {/* Settings Panel */}
      {showHistory && (
        <>
          {/* Background Uploader */}
          <div className="mb-5 sm:mb-5 z-10 mt-[200px]">
            <BackgroundUploader
              originalBackground={(() => {
                try {
                  return localStorage.getItem("lucky_original_background");
                } catch {
                  return null;
                }
              })()}
              onImageSelect={(croppedUrl, originalUrl) => {
                setCustomBackground(croppedUrl);
                try {
                  localStorage.setItem("lucky_custom_background", croppedUrl);
                  localStorage.setItem(
                    "lucky_original_background",
                    originalUrl,
                  );
                } catch (e) {
                  console.warn("Failed to save background:", e);
                }
              }}
              onRemove={() => {
                setCustomBackground(null);
                try {
                  localStorage.removeItem("lucky_custom_background");
                  localStorage.removeItem("lucky_original_background");
                } catch {
                  /* ignore */
                }
              }}
              hasBackground={!!customBackground}
            />
          </div>

          {/* Range Selector */}
          <div className="mb-5 sm:mb-5 z-10">
            <RangeSelector
              minValue={minValue}
              maxValue={maxValue}
              onMinChange={setMinValue}
              onMaxChange={setMaxValue}
              disabled={isSpinning}
            />
          </div>

          {/* remaining */}
          <div className="text-muted-foreground text-sm mb-4 z-10">
            Còn lại:{" "}
            <span className="text-lucky-gold font-bold">
              {availableNumbers.length}
            </span>{" "}
            số
          </div>

          {/* History Panel */}
          <div className="z-10 w-full flex justify-center">
            <HistoryPanel history={history} onClear={handleClearHistory} />
          </div>
        </>
      )}
    </div>
  );
};

export default LuckyDraw;
