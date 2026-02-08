import { useRef, useState } from "react";
import { Upload, Trash2, Pencil } from "lucide-react";
import ImageEditor from "./ImageEditor";

interface BackgroundUploaderProps {
  onImageSelect: (croppedUrl: string, originalUrl: string) => void;
  onRemove: () => void;
  hasBackground: boolean;
  originalBackground?: string | null;
}

const BackgroundUploader = ({
  onImageSelect,
  onRemove,
  hasBackground,
  originalBackground,
}: BackgroundUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);

  // Convert image URL to scaled data URL for persistent storage
  const toDataUrl = (src: string, maxSize = 3840): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = img.width * scale;
        const h = img.height * scale;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } else {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    // Convert to data URL right away so it persists across reloads
    const dataUrl = await toDataUrl(objectUrl);
    URL.revokeObjectURL(objectUrl);
    originalDataRef.current = dataUrl;
    setEditingImage(dataUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const originalDataRef = useRef<string | null>(null);

  const handleEditorConfirm = (croppedUrl: string) => {
    const origUrl = originalDataRef.current || editingImage;
    setEditingImage(null);
    if (origUrl) {
      onImageSelect(croppedUrl, origUrl);
    }
  };

  const handleEditorCancel = () => {
    setEditingImage(null);
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          Upload nền
        </button>

        {hasBackground && (
          <>
            <button
              onClick={() => {
                if (originalBackground) {
                  originalDataRef.current = originalBackground;
                  setEditingImage(originalBackground);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600/80 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
            >
              <Pencil className="w-4 h-4" />
              Sửa nền
            </button>
            <button
              onClick={onRemove}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Xóa nền
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Image Editor Modal */}
      {editingImage && (
        <ImageEditor
          imageSrc={editingImage}
          onConfirm={handleEditorConfirm}
          onCancel={handleEditorCancel}
        />
      )}
    </>
  );
};

export default BackgroundUploader;
