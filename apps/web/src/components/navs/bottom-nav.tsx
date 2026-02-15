import { cn } from "@repo/ui/lib/utils";
import { Link, useLocation } from "react-router";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  icon: LucideIcon;
  url: string;
}

interface BottomNavProps {
  className?: string;
  items: NavItem[];
}

export function BottomNav({ className, items }: BottomNavProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        "flex items-center justify-around border-t bg-background p-2",
        className
      )}
    >
      {items.map((item) => {
        const isActive = location.pathname.startsWith(item.url);
        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex flex-col items-center gap-1 text-xs text-muted-foreground",
              isActive && "text-primary font-medium"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

