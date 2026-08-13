import { useEffect } from "react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export function ImageLightbox({
  src,
  alt = "Image",
  onClose,
}: ImageLightboxProps) {
  useBodyScrollLock(Boolean(src));

  useEffect(() => {
    if (!src) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-ink/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label="Expanded image"
    >
      <button
        type="button"
        className="absolute right-4 top-4 cursor-pointer rounded-xl bg-surface/90 p-2 text-ink"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[min(960px,100%)] rounded-2xl object-contain"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
