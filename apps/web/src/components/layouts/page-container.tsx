import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("flex flex-col gap-4 p-4 md:gap-8 md:p-8", className)}>
      {children}
    </div>
  );
}

export function TablePageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden bg-background",
        className
      )}
    >
      {children}
    </div>
  );
}

