// import { Loader2 } from "lucide-react";
import "./LoadingDots.css";
import { cn } from "@repo/ui/lib/utils";

type LoadingProps = {
  className?: string;
  color?: string;
  size?: "small" | "medium" | "large";
};

export default function Loading({
  className,
  color = "bg-primary", // More professional gray default
  size = "medium",
}: LoadingProps) {
  const sizeClasses = {
    small: "h-1.5 w-1.5 mx-0.5",
    medium: "h-2 w-2 mx-1",
    large: "h-2.5 w-2.5 mx-1.5",
  };

  return (
    <div className="relative h-full w-full">
      <div
        className={cn(
          "absolute flex h-full w-full items-center justify-center",
          className
        )}
      >
        {[0, 1, 2].map((i) => (
          <div className="relative" key={i}>
            <div
              className={cn("rounded-full", sizeClasses[size], color)}
              style={{
                animation: "bounce 1s infinite",
                animationDelay: `${i * 0.15}s`,
                animationTimingFunction: "ease-in-out",
              }}
            />
            {/* Shadow underneath - more subtle */}
            <div
              className={cn(
                "-translate-x-1/2 absolute bottom-0 left-1/2 rounded-full bg-black/5 blur-[1px]",
                {
                  "h-[1px] w-1": size === "small",
                  "h-[1px] w-1.5": size === "medium",
                  "h-[1px] w-2": size === "large",
                }
              )}
              style={{
                animation: "shadow 1s infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// export default function Loading() {
//   return (
//     <div className="ml-3 h-10 w-10 animate-spin rounded-full border-primary border-t-2 border-b-2 ease-linear" />
//   );
// }

// export default function Loading() {
//   return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
// }
