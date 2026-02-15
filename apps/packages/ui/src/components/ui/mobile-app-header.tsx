"use client";

import { cn } from "@repo/ui/lib/utils";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import {
  ArrowLeft,
  ArrowUpFromLine,
  Crown,
  HandCoins,
  Headset,
  type LucideIcon,
  MapPin,
  Menu,
  MoreVertical,
  Package,
  Shapes,
  Truck,
  Undo2,
  User,
  UserCog,
  Users,
  Warehouse,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useDynamicTabsGap } from "../../hooks/use-dynamic-tabs-gap";
import { Button } from "./button";
import { useSidebar } from "./sidebar";
import { Switch } from "./switch";
import { Tabs, TabsList, TabsTrigger } from "./tabs";

const PROCESS_TABS = [
  { label: "Deliveries", href: "/processes/deliveries", icon: Truck },
  { label: "Pickups", href: "/processes/pickups", icon: ArrowUpFromLine },
  { label: "Returns", href: "/processes/returns", icon: Undo2 },
  { label: "Payments", href: "/processes/payments", icon: HandCoins },
];

const RESOURCE_TABS = [
  { label: "Orders", href: "/resources/orders", icon: Package },
  { label: "Products", href: "/resources/products", icon: Shapes },
  { label: "Vehicles", href: "/resources/vehicles", icon: Truck },
  { label: "Workflows", href: "/resources/workflows", icon: Workflow },
];

const STORAGE_TABS = [
  { label: "Storages", href: "/operations/storages", icon: Warehouse },
  {
    label: "Team Leaders",
    href: "/operations/storages/team-leaders",
    icon: Crown,
  },
  { label: "Employees", href: "/operations/storages/employees", icon: User },
  { label: "Teams", href: "/operations/storages/teams", icon: Users },
  { label: "Managers", href: "/operations/storages/managers", icon: UserCog },
];

const DISPATCHING_TABS = [
  { label: "Dispatchings", href: "/operations/dispatchings", icon: MapPin },
  {
    label: "Dispatchers",
    href: "/operations/dispatchings/dispatchers",
    icon: Headset,
  },
  { label: "Drivers", href: "/operations/dispatchings/drivers", icon: Truck },
  { label: "Teams", href: "/operations/dispatchings/teams", icon: Users },
  {
    label: "Managers",
    href: "/operations/dispatchings/dispatching-managers",
    icon: UserCog,
  },
];

export interface MobileAppHeaderProps {
  isBusiness?: boolean;
  isDeliveryCompany?: boolean;
}

export function MobileAppHeader({
  isBusiness,
  isDeliveryCompany,
}: MobileAppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    title,
    subtitle,
    variant,
    leftButton,
    onLeftClick,
    onRightActionClick,
    rightActions,
  } = useAppHeaderStore();
  const { toggleSidebar } = useSidebar();

  const isOperations = location.pathname.startsWith("/operations");
  const isDispatching = location.pathname.startsWith(
    "/operations/dispatchings"
  );

  let tabs: { label: string; href: string; icon: LucideIcon }[] = [];
  if (location.pathname.startsWith("/processes")) {
    tabs = PROCESS_TABS;
  } else if (location.pathname.startsWith("/resources")) {
    tabs = RESOURCE_TABS.filter((tab) => {
      if (tab.label === "Vehicles" && !isDeliveryCompany) return false;
      if (tab.label === "Workflows" && isBusiness) return false;
      return true;
    });
  } else if (isOperations) {
    tabs = isDispatching ? DISPATCHING_TABS : STORAGE_TABS;
  }

  const handleLeftClick = () => {
    if (onLeftClick) {
      onLeftClick();
      return;
    }

    if (variant === "default" || leftButton === "back") {
      navigate(-1);
    } else if (variant === "modal" || leftButton === "x") {
      navigate(-1);
    }
  };

  const showLeftButton =
    leftButton !== "none" && (leftButton || variant !== "main");

  return (
    <header className="sticky top-0 z-50 flex shrink-0 flex-col border-b-[0.5px] bg-background">
      <div className="flex h-16 w-full items-center justify-between px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Left Button */}
          {showLeftButton && (
            <Button
              className="-ml-2 shrink-0"
              id="header-left-button"
              onClick={handleLeftClick}
              size="icon"
              variant="ghost"
            >
              {(leftButton === "back" ||
                (variant === "default" && !leftButton)) && (
                <ArrowLeft className="size-5" />
              )}
              {(leftButton === "x" || (variant === "modal" && !leftButton)) && (
                <X className="size-5" />
              )}
            </Button>
          )}

          {/* Title and Subtitle */}
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate font-semibold text-base leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-muted-foreground text-xs leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {isOperations && (
            <div className="mr-2 flex items-center gap-3">
              <Warehouse
                className={cn(
                  "size-5 transition-colors",
                  isDispatching ? "text-muted-foreground" : "text-primary"
                )}
              />
              <Switch
                checked={isDispatching}
                onCheckedChange={(checked) =>
                  navigate(
                    checked
                      ? "/operations/dispatchings"
                      : "/operations/storages"
                  )
                }
              />
              <MapPin
                className={cn(
                  "size-5 transition-colors",
                  isDispatching ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
          )}

          {rightActions?.slice(0, 2).map((action, index) => (
            <Button
              aria-label={action.label}
              key={index}
              onClick={action.onClick}
              size="icon"
              variant="ghost"
            >
              <action.icon className="size-5" />
            </Button>
          ))}

          {/* Preset Variant Actions */}
          {variant === "main" && (
            <Button onClick={toggleSidebar} size="icon" variant="ghost">
              <Menu className="size-5" />
            </Button>
          )}

          {variant === "modal" && (
            <Button
              id="header-modal-trigger"
              onClick={() => {
                onRightActionClick?.();
              }}
              size="icon"
              variant="ghost"
            >
              <MoreVertical className="size-5" />
            </Button>
          )}
        </div>
      </div>

      {/* SubAppHeader (Tabs) for Main Variant */}
      {variant === "main" && tabs.length > 0 && (
        <TabsContainer pathname={location.pathname} tabs={tabs} />
      )}
    </header>
  );
}

function TabsContainer({
  tabs,
  pathname,
}: {
  tabs: { label: string; href: string; icon: LucideIcon }[];
  pathname: string;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const { gap } = useDynamicTabsGap({
    containerRef: tabsListRef,
    scrollContainerRef,
    minGap: 32,
    padding: 32, // px-4 on both sides (16px * 2)
  });

  // Force re-calculation on window resize
  const [_, setTick] = useState(0);
  useEffect(() => {
    const handleResize = () => setTick((t: number) => t + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // console.log({ gap });

  return (
    <div
      className="no-scrollbar flex w-full overflow-x-auto"
      ref={scrollContainerRef}
    >
      <Tabs
        className="w-full"
        value={tabs.find((tab) => pathname.startsWith(tab.href))?.href}
      >
        <TabsList
          className="h-auto w-fit justify-start gap-0 border-b-0 bg-transparent px-4 transition-all"
          ref={tabsListRef}
          size={"sm"}
          style={{ gap: `${gap}px` }}
          variant="line"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              asChild
              className="px-0 pt-0 pb-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              key={tab.href}
              value={tab.href}
            >
              <NavLink className="flex items-center gap-2" to={tab.href}>
                <tab.icon className="size-4" />
                {tab.label}
              </NavLink>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
