"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  sidebarMenuButtonVariants,
} from "@repo/ui/components/ui/sidebar";
import { cn } from "@repo/ui/lib/utils";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

export function NavMain({
  items,
  sectionName = "Platform",
  onPrefetch,
}: {
  sectionName?: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  onPrefetch?: (url: string) => void;
}) {
  const route = useLocation();

  // track which collapsible is open (accordion behavior)
  const [openItem, setOpenItem] = useState<string | null>(null);

  // when route changes, update the open group
  useEffect(() => {
    const active = items.find((item) => route.pathname.includes(item.url));
    if (active) {
      setOpenItem(active.url);
    }
  }, [route.pathname, items]);

  const handlePrefetch = (url: string) => {
    if (onPrefetch) {
      onPrefetch(url);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{sectionName}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => {
          const isOpen = openItem === item.url;
          if (!item.items) {
            return (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    (route.pathname.includes(item.url) && item.url !== "/") ||
                    (route.pathname === "/" && item.url === "/") ||
                    (route.pathname === "/" &&
                      item.url === "/processes/deliveries")
                  }
                  tooltip={item.title}
                >
                  <Link
                    className={cn(
                      sidebarMenuButtonVariants({
                        variant: "default",
                        size: "default",
                      }),
                      "justify-between",
                    )}
                    onFocus={() => {
                      handlePrefetch(item.url);
                    }}
                    onMouseEnter={() => {
                      handlePrefetch(item.url);
                    }}
                    to={item.url}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }
          return (
            <Collapsible
              className="group/collapsible"
              key={item.title}
              onOpenChange={(open) => setOpenItem(open ? item.url : null)}
              open={isOpen}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    isActive={route.pathname.includes(item.url)}
                    tooltip={item.title}
                  >
                    <Link
                      className={cn(
                        sidebarMenuButtonVariants({
                          variant: "default",
                          size: "default",
                        }),
                        "justify-between",
                      )}
                      onFocus={() => {
                        handlePrefetch(item.url);
                      }}
                      onMouseEnter={() => {
                        handlePrefetch(item.url);
                      }}
                      to={item.url}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </div>
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={
                            route.pathname === subItem.url ||
                            (subItem.url !== item.url &&
                              route.pathname.includes(subItem.url))
                          }
                        >
                          <Link
                            onFocus={() => {
                              handlePrefetch(subItem.url);
                            }}
                            onMouseEnter={() => {
                              handlePrefetch(subItem.url);
                            }}
                            to={subItem.url}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
