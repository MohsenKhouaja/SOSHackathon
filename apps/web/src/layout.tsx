import LanciSpinner from "@repo/ui/components/spinner";
import AppHeader from "@repo/ui/components/ui/app-header";
import { AppSidebar } from "@repo/ui/components/ui/app-sidebar";
import { GlobalSidePanel } from "@repo/ui/components/ui/global-side-panel";
import { NavMain } from "@repo/ui/components/ui/nav-main";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { TeamSwitcher } from "@repo/ui/components/ui/team-switcher";
import { ThemeProvider } from "@repo/ui/hooks/theme-provider";
import {
  Baby,
  Bell,
  Building2,
  ClipboardList,
  GalleryVerticalEnd,
  Home,
  LayoutDashboard,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useSignoutMutation } from "./api/mutations/auth-mutations";
import { useCurrentUser } from "./api/queries/auth-queries";
import { useRoutePrefetch } from "./api/use-route-prefetch";
import { AlphaNoticeDialog } from "./components/dialogs/alpha-notice-dialog";
import { BottomNav } from "./components/navs/bottom-nav";

// Refactored nav links mapped exactly to your App router paths
const navLinks = {
  main: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/dashboard",
    },
    {
      title: "Programs",
      icon: Building2,
      url: "/programs",
    },
    {
      title: "Homes",
      icon: Home,
      url: "/homes",
    },
    {
      title: "Children",
      icon: Baby,
      url: "/children",
    },
    {
      title: "Incidents",
      icon: ShieldAlert,
      url: "/incidents",
    },
    {
      title: "Notifications",
      icon: Bell,
      url: "/notifications",
    },
  ],
  admin: [
    {
      title: "Users",
      icon: Users,
      url: "/users",
    },
    {
      title: "Audit Logs",
      icon: ClipboardList,
      url: "/audit",
    },
  ],
};

// Simplified for social workers / care providers on the go
const mobileNavLinks = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
    basePath: "/dashboard",
  },
  {
    title: "Children",
    icon: Baby,
    url: "/children",
    basePath: "/children",
  },
  {
    title: "Incidents",
    icon: ShieldAlert,
    url: "/incidents",
    basePath: "/incidents",
  },
  {
    title: "Alerts",
    icon: Bell,
    url: "/notifications",
    basePath: "/notifications",
  },
];

const validNavPaths = new Set([
  ...navLinks.main.map((i) => i.url),
  ...navLinks.admin.map((i) => i.url),
]);

export default function Layout() {
  const { data, isPending } = useCurrentUser();
  const location = useLocation();
  const handlePrefetch = useRoutePrefetch();
  const navigate = useNavigate();

  const signoutMutation = useSignoutMutation(
    undefined, 
    () => {
      navigate("/login");
    }
  );

  const handleSignout = () => {
    signoutMutation.mutate();
  };

  // Determine user role and admin status based on the database schema
  const userRole = data?.user?.role;
  const isAdmin = userRole === "NATIONAL_DIRECTOR" || userRole === "PROGRAM_DIRECTOR";

  if (isPending) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LanciSpinner />
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <SidebarProvider className="bg-sidebar">
        <AppSidebar
          header={
            <TeamSwitcher
              teams={[
                {
                  name: data?.user?.organization?.name || "SOS Children's Villages",
                  logo: GalleryVerticalEnd,
                  plan: "Protection Platform",
                },
              ]}
            />
          }
          signOut={handleSignout}
          user={{
            name: data?.user?.name || "Guest User",
            email: data?.user?.email || "guest@sos-villages.org",
            avatar: data?.user?.image || "https://github.com/shadcn.png",
          }}
        >
          <NavMain
            items={navLinks.main}
            onPrefetch={handlePrefetch}
            sectionName="Main Menu"
          />
          
          {/* Conditionally render admin routes mapped to the Router layout */}
          {isAdmin && (
            <NavMain
              items={navLinks.admin}
              onPrefetch={handlePrefetch}
              sectionName="Administration"
            />
          )}
        </AppSidebar>
        
        <SidebarInset className="relative flex h-dvh flex-col overflow-hidden">
          <AppHeader
            signOut={handleSignout}
            user={{
              name: data?.user?.name || "Guest User",
              email: data?.user?.email || "guest@sos-villages.org",
              avatar: data?.user?.image || "https://github.com/shadcn.png",
            }}
          />
          
          <div className="relative flex grow overflow-hidden">
            <div className="flex grow flex-col overflow-hidden">
              <Outlet />
            </div>
            <GlobalSidePanel />
          </div>

          {/* Render Mobile Navigation */}
          {validNavPaths.has(
            location.pathname.endsWith("/") && location.pathname.length > 1
              ? location.pathname.slice(0, -1)
              : location.pathname
          ) && (
            <div className="absolute right-0 bottom-0 left-0 flex justify-center md:hidden">
              <BottomNav
                className="w-full rounded-b-none"
                items={mobileNavLinks}
              />
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
      <Toaster closeButton richColors />
      <AlphaNoticeDialog />
    </ThemeProvider>
  );
}
