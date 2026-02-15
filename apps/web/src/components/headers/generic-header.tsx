import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

type GenericHeaderProps = {
  variant?: "create" | "details";
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  description?: string;
  actions?: ReactNode;
  bottomContent?: ReactNode;
  className?: string;
};

export default function GenericHeader({
  icon,
  title,
  subtitle,
  description,
  actions,
  bottomContent,
  className,
}: GenericHeaderProps) {
  return (
    <>
      {/* Mobile Layout */}
      <div className="fixed right-5 bottom-35 z-10 md:hidden">
        {actions && <div className="flex shrink-0 gap-1.5">{actions}</div>}
      </div>

      {/* Desktop Layout */}
      <div className={cn("hidden flex-col gap-3 md:flex", className)}>
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {icon}
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">{title}</h1>
              <div className="flex items-center gap-2">
                {(subtitle || description) && (
                  <p className="text-muted-foreground text-sm">
                    {subtitle || description}
                  </p>
                )}
              </div>
            </div>
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
        {bottomContent}
      </div>
    </>
  );
}
