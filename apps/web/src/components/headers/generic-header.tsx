import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

interface GenericHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  variant?: "default" | "create";
  className?: string;
}

export default function GenericHeader({
  title,
  subtitle,
  icon,
  actions,
  className,
}: GenericHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b bg-background p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="rounded-lg bg-muted p-2">{icon}</div>}
        <div>
          <h1 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

