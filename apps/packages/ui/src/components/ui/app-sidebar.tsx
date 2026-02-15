"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/ui//sidebar";
import { TeamSwitcher } from "@repo/ui/components/ui//team-switcher";
import { GalleryVerticalEnd } from "lucide-react";
import type * as React from "react";
import { NavUser, type NavUserProps } from "./nav-user";
import { ThemeToggleButton } from "./theme-toggle";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
};

export type AppSidebarItem = {
  title: string;
  icon: React.ReactNode;
  url: string;
  items: AppSidebarItem[];
};

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  items?: AppSidebarItem[];
  user: NavUserProps["user"];
  signOut: NavUserProps["signOut"];
  header?: React.ReactNode;
};

export function AppSidebar({
  children,
  user,
  signOut,
  header,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {header ?? <TeamSwitcher teams={data.teams} />}
      </SidebarHeader>
      <SidebarContent className="grow">{children}</SidebarContent>
      <SidebarFooter className="md:hidden">
        <ThemeToggleButton showLabel start="top-right" variant="circle" />
        <NavUser isMobile signOut={signOut} user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
