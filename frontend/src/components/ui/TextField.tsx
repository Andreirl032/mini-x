import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
}

export function TextInput({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? props.name;
  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input
        id={inputId}
        className={cn(
          "h-11 rounded-xl border border-line bg-surface px-3 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className,
        )}
        {...props}
      />
      {hint && !error ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? props.name;
  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
      <span className="text-sm font-semibold text-ink">{label}</span>
      <textarea
        id={inputId}
        className={cn(
          "min-h-28 resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className,
        )}
        {...props}
      />
      {hint && !error ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
