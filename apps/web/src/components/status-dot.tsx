import { cn } from "@repo/ui/lib/utils";

type StatusDotProps = {
  color?: string;
  size?: "small" | "medium" | "large";
  className?: string;
};

const StatusDot = ({ className, color, size = "medium" }: StatusDotProps) => {
  const sizeClasses: Record<"small" | "medium" | "large", string> = {
    small: "h-2 w-2",
    medium: "h-3 w-3",
    large: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "relative flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
        )}
        style={{ backgroundColor: color }}
      />
      <span
        className={cn("relative inline-flex rounded-full", sizeClasses[size])}
        style={{ backgroundColor: color }}
      />
    </span>
  );
};

export default StatusDot;
