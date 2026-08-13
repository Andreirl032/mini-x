import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  to?: string;
  className?: string;
  inverted?: boolean;
}

export function Logo({ to = "/", className, inverted }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <rect
          width="64"
          height="64"
          rx="16"
          fill={inverted ? "#0F8F86" : "#0B1220"}
        />
        <circle
          cx="32"
          cy="32"
          r="14"
          stroke={inverted ? "#0B1220" : "#0F8F86"}
          strokeWidth="4"
        />
        <path
          d="M32 18v28M18 32h28"
          stroke={inverted ? "#0B1220" : "#0F8F86"}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cn(
          "font-display text-[1.35rem] font-semibold leading-none tracking-normal",
          inverted ? "text-white" : "text-ink",
        )}
      >
        mini
        <span className={inverted ? "text-white/90" : "text-accent"}>x</span>
      </span>
    </span>
  );

  if (!to) return content;
  return (
    <Link to={to} className="inline-flex">
      {content}
    </Link>
  );
}
