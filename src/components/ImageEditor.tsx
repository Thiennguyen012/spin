import { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Check,
  X,
} from "lucide-react";

interface ImageEditorProps {
  imageSrc: string;
  onConfirm: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

// Max output dimension to avoid browser canvas size limits
const MAX_OUTPUT_SIZE = 3840; // 4K resolution

// Helper to create cropped image from canvas
const createCroppedImage = (
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
  flipH: boolean,
  flipV: boolean,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        // Scale factor: if image is too large, scale everything down
        const maxDim = Math.max(image.width, image.height);
        const scale = maxDim > MAX_OUTPUT_SIZE ? MAX_OUTPUT_SIZE / maxDim : 1;

        const scaledW = image.width * scale;
        const scaledH = image.height * scale;

        const rotRad = (rotation * Math.PI) / 180;

        // Calculate bounding box of the rotated (scaled) image
        const sin = Math.abs(Math.sin(rotRad));
        const cos = Math.abs(Math.cos(rotRad));
        const bBoxWidth = scaledW * cos + scaledH * sin;
        const bBoxHeight = scaledW * sin + scaledH * cos;

        // Draw rotated/flipped image onto first canvas
        const canvas = document.createElement("canvas");
        canvas.width = bBoxWidth;
        canvas.height = bBoxHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject("No 2d context");
          return;
        }

        ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
        ctx.rotate(rotRad);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.translate(-scaledW / 2, -scaledH / 2);
        ctx.drawImage(image, 0, 0, scaledW, scaledH);

        // Scale the crop coordinates
        const cropX = pixelCrop.x * scale;
        const cropY = pixelCrop.y * scale;
        const cropW = pixelCrop.width * scale;
        const cropH = pixelCrop.height * scale;

        // Extract cropped area
        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = cropW;
        croppedCanvas.height = cropH;
        const croppedCtx = croppedCanvas.getContext("2d");
        if (!croppedCtx) {
          reject("No 2d context");
          return;
        }

        croppedCtx.drawImage(
          canvas,
          cropX,
          cropY,
          cropW,
          cropH,
          0,
          0,
          cropW,
          cropH,
        );

        // Return as data URL for localStorage persistence
        const dataUrl = croppedCanvas.toDataURL("image/jpeg", 0.85);
        if (dataUrl && dataUrl !== "data:,") {
          resolve(dataUrl);
        } else {
          // Fallback to blob URL
          croppedCanvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(URL.createObjectURL(blob));
              } else {
                reject("Failed to create image");
              }
            },
            "image/jpeg",
            0.85,
          );
        }
      } catch (e) {
        reject(e);
      }
    };
    image.onerror = () => reject("Failed to load image");
    image.src = imageSrc;
  });
};

const ImageEditor = ({ imageSrc, onConfirm, onCancel }: ImageEditorProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedArea(croppedAreaPixels);
    },
    [],
  );

  const handleConfirm = async () => {
    if (!croppedArea) return;
    try {
      const croppedUrl = await createCroppedImage(
        imageSrc,
        croppedArea,
        rotation,
        flipH,
        flipV,
      );
      onConfirm(croppedUrl);
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  };

  // Use full screen ratio for background crop
  const aspectRatio = window.innerWidth / window.innerHeight;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10">
        <h2 className="text-white font-bold text-lg">Chỉnh sửa ảnh nền</h2>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            <Check className="w-4 h-4" />
            Áp dụng
          </button>
        </div>
      </div>

      {/* Crop Area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: {
              background: "#000",
            },
            mediaStyle: {
              transform: `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
            },
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-4 py-4 bg-black/80 border-t border-white/10 flex-wrap">
        {/* Zoom */}
        <div className="flex items-center gap-2">
          <ZoomOut className="w-4 h-4 text-white/60" />
          <input
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-32 accent-lucky-gold"
          />
          <ZoomIn className="w-4 h-4 text-white/60" />
          <span className="text-white/60 text-xs min-w-[40px]">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="w-px h-6 bg-white/20" />

        {/* Rotation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRotation((r) => r + 90)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Xoay 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-24 accent-lucky-gold"
          />
          <span className="text-white/60 text-xs min-w-[40px]">
            {rotation}°
          </span>
        </div>

        <div className="w-px h-6 bg-white/20" />

        {/* Flip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFlipH((f) => !f)}
            className={`p-2 rounded-lg transition-colors ${flipH ? "bg-lucky-gold/30 text-lucky-gold" : "bg-white/10 hover:bg-white/20 text-white"}`}
            title="Lật ngang"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFlipV((f) => !f)}
            className={`p-2 rounded-lg transition-colors ${flipV ? "bg-lucky-gold/30 text-lucky-gold" : "bg-white/10 hover:bg-white/20 text-white"}`}
            title="Lật dọc"
          >
            <FlipVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-white/20" />

        {/* Reset */}
        <button
          onClick={() => {
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
            setFlipH(false);
            setFlipV(false);
          }}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
