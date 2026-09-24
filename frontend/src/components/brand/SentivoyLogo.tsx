import { cn } from "@/lib/utils";

export function SentivoyLogo({
  compact = false,
  inverse = false,
  className,
}: {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("sentivoy-brand", inverse && "sentivoy-brand-inverse", className)}>
      <img
        src="/sentivoy-logo.png"
        alt={compact ? "Sentivoy" : ""}
        width="36"
        height="36"
        className="sentivoy-brand-mark"
      />
      {!compact && (
        <span>
          Sentivoy<span className="brand-dot">.</span>
        </span>
      )}
    </span>
  );
}
