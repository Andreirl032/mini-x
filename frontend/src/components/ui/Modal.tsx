import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-ink/45 p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-xl sm:max-w-xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex shrink-0 items-center justify-between border-b border-line bg-surface px-5 py-4">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-5">{children}</div>
      </div>
    </div>
  );
}
