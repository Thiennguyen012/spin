import { useRef, useState, useCallback, useEffect, ReactNode } from "react";
import { ZoomIn, ZoomOut, AlignCenterHorizontal } from "lucide-react";

interface Position {
  x: number;
  y: number;
}

interface DraggableProps {
  children: ReactNode;
  storageKey: string;
  defaultPosition?: Position;
  defaultScale?: number;
  editMode: boolean;
  className?: string;
}

const STORAGE_PREFIX = "lucky_drag_";
const SCALE_PREFIX = "lucky_scale_";
const MIN_SCALE = 0.3;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.1;
const SNAP_THRESHOLD = 8; // px proximity to snap to center

const Draggable = ({
  children,
  storageKey,
  defaultPosition = { x: 0, y: 0 },
  defaultScale = 1,
  editMode,
  className = "",
}: DraggableProps) => {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [scale, setScale] = useState<number>(defaultScale);
  const [isDragging, setIsDragging] = useState(false);
  const [showCenterLine, setShowCenterLine] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });

  // Load saved position & scale from localStorage
  useEffect(() => {
    const savedPos = localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch {
        // ignore parse errors
      }
    }
    const savedScale = localStorage.getItem(SCALE_PREFIX + storageKey);
    if (savedScale) {
      try {
        setScale(parseFloat(savedScale));
      } catch {
        // ignore
      }
    }
  }, [storageKey]);

  // Save position to localStorage
  const savePosition = useCallback(
    (pos: Position) => {
      localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(pos));
    },
    [storageKey],
  );

  // Save scale to localStorage
  const saveScale = useCallback(
    (s: number) => {
      localStorage.setItem(SCALE_PREFIX + storageKey, s.toString());
    },
    [storageKey],
  );

  const handleZoomIn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const newScale = Math.min(scale + SCALE_STEP, MAX_SCALE);
      setScale(newScale);
      saveScale(newScale);
    },
    [scale, saveScale],
  );

  const handleZoomOut = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const newScale = Math.max(scale - SCALE_STEP, MIN_SCALE);
      setScale(newScale);
      saveScale(newScale);
    },
    [scale, saveScale],
  );

  const handleCenter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const el = dragRef.current;
      if (!el) return;
      // Reset x to 0 (component is already in a flex centered container)
      // Keep y position unchanged
      const newPos = { x: 0, y: position.y };
      setPosition(newPos);
      savePosition(newPos);
    },
    [position.y, savePosition],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();

      const el = dragRef.current;
      if (!el) return;

      setIsDragging(true);
      el.setPointerCapture(e.pointerId);

      offsetRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [editMode, position],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      let newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;

      // Snap to horizontal center (x=0 means centered in flex container)
      if (Math.abs(newX) < SNAP_THRESHOLD) {
        newX = 0;
        setShowCenterLine(true);
      } else {
        setShowCenterLine(false);
      }

      setPosition({ x: newX, y: newY });
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      setShowCenterLine(false);

      const el = dragRef.current;
      if (el) el.releasePointerCapture(e.pointerId);

      savePosition(position);
    },
    [isDragging, position, savePosition],
  );

  return (
    <div
      ref={dragRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`${className} ${editMode ? "cursor-grab ring-2 ring-dashed ring-lucky-gold/50 rounded-lg" : ""} ${isDragging ? "cursor-grabbing opacity-80" : ""}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        transformOrigin: "center center",
        userSelect: isDragging ? "none" : "auto",
        touchAction: editMode ? "none" : "auto",
      }}
    >
      {children}

      {/* Center guide line */}
      {showCenterLine && (
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-px h-full pointer-events-none z-50"
          style={{
            background: "rgba(255, 200, 0, 0.6)",
            boxShadow: "0 0 6px rgba(255, 200, 0, 0.4)",
          }}
        />
      )}

      {/* Scale controls in edit mode */}
      {editMode && (
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 rounded-full px-2 py-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleZoomOut}
            className="p-1 text-white/70 hover:text-white transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white/70 text-xs min-w-[36px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 text-white/70 hover:text-white transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/30 mx-0.5" />
          <button
            onClick={handleCenter}
            className="p-1 text-white/70 hover:text-white transition-colors"
            title="Căn giữa"
          >
            <AlignCenterHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Draggable;
