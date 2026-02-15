import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { ExpandableTabs } from "../tabs/expandable-tabs";

export type BottomNavItem = {
  title: string;
  icon: LucideIcon;
  url: string;
  basePath?: string; // segment to match against location.pathname
};

interface BottomNavProps {
  items: BottomNavItem[];
  className?: string;
}

export function BottomNav({ items, className }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine which tab should be active based on current path
  const activeIndex = useMemo(() => {
    // We try to find the best match.
    // Usually items are like /dashboard, /processes, etc.
    // If we are at /processes/deliveries, it matches /processes
    const idx = items.findIndex((item) => {
      const match = item.basePath || item.url;
      if (match === "/") {
        return location.pathname === "/";
      }
      return location.pathname.startsWith(match);
    });
    return idx !== -1 ? idx : null;
  }, [items, location.pathname]);

  const handleChange = (index: number | null) => {
    if (index !== null) {
      const item = items[index];
      if (item) {
        navigate(item.url);
      }
    }
  };

  const tabsForDisplay = items.map((item) => ({
    title: item.title,
    icon: item.icon,
  }));

  return (
    <ExpandableTabs
      className={className}
      onChange={handleChange}
      selectedIndex={activeIndex}
      tabs={tabsForDisplay}
    />
  );
}
