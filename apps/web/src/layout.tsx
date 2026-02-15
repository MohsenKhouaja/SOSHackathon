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
  ArrowUpFromLine,
  AudioWaveform,
  Building2,
  Command,
  Frame,
  SquareTerminal,
  Users,
  GalleryVerticalEnd,
  GitCompareArrows,
  HandCoins,
  LayoutDashboard,
  MapIcon,
  MapPin,
  Package,
  PieChart,
  ScrollText,
  Settings,
  Shapes,
  Truck,
  Undo2,
  Warehouse,
  Waypoints,
  Workflow,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useSignoutMutation } from "./api/mutations/auth-mutations";
import {
  useCurrentUser,
  useIsBusiness,
  useIsDeliveryCompany,
} from "./api/queries/auth-queries";
import { useRoutePrefetch } from "./api/use-route-prefetch";
import { AlphaNoticeDialog } from "./components/dialogs/alpha-notice-dialog";
import { BottomNav } from "./components/navs/bottom-nav";

// This is sample data.
const mobileNavLinks = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
    basePath: "/dashboard",
  },
  {
    title: "Processes",
    icon: GitCompareArrows,
    url: "/processes/deliveries",
    basePath: "/processes",
  },
  {
    title: "Resources",
    icon: Shapes,
    url: "/resources/orders",
    basePath: "/resources",
  },
  {
    title: "Operations",
    icon: Building2,
    url: "/operations/dispatchings",
    basePath: "/operations",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings/delivery-policy",
    basePath: "/settings",
  },
];
const navLinks = {
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
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
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
      icon: Warehouse,
      url: "/homes",
    },
    {
      title: "Users",
      icon: Users,
      url: "/users",
    },
    {
      title: "Children",
      icon: HandCoins, // Using generic icon or Baby if available
      url: "/children",
    },
    {
      title: "Incidents",
      icon: AudioWaveform, // Using alert-like icon if available, or generic
      url: "/incidents",
    },
  ],
  processes: [
    {
      title: "Deliveries",
      url: "/processes/deliveries",
      icon: Truck,
    },
    {
      title: "Pickups",
      icon: ArrowUpFromLine,
      url: "/processes/pickups",
    },

    {
      title: "Returns",
      url: "/processes/returns",
      icon: Undo2,
    },
    {
      title: "Payments",
      url: "/processes/payments",
      icon: HandCoins,
    },
    {
      title: "Debriefings",
      url: "/processes/debriefings",
      icon: ScrollText,
    },
  ],

  resources: [
    {
      title: "Orders",
      url: "/resources/orders",
      icon: Package,
    },
    {
      title: "Products",
      url: "/resources/products",
      icon: Shapes,
    },
    {
      title: "Vehicles",
      url: "/resources/vehicles",
      icon: Truck,
    },
  ],

  operations: [
    {
      title: "Storages",
      url: "/operations/storages",
      items: [
        { title: "Teams", url: "/operations/storages/teams" },
        { title: "Employees", url: "/operations/storages/employees" },
        { title: "Managers", url: "/operations/storages/managers" },
        { title: "Team Leaders", url: "/operations/storages/team-leaders" },
      ],
      icon: Warehouse,
    },
    {
      title: "Dispatchings",
      url: "/operations/dispatchings",
      items: [
        { title: "Teams", url: "/operations/dispatchings/teams" },
        { title: "Drivers", url: "/operations/dispatchings/drivers" },
        { title: "Dispatchers", url: "/operations/dispatchings/dispatchers" },
        {
          title: "Dispatching Managers",
          url: "/operations/dispatchings/dispatching-managers",
        },
      ],
      icon: MapPin,
    },
  ],

  settings: [
    {
      title: "Workflows",
      url: "/resources/workflows",
      icon: Workflow,
    },
    {
      title: "Preferences",
      url: "/settings/organization-preferences",
      icon: Settings,
    },
    {
      title: "Connections",
      url: "/settings/connections",
      icon: Waypoints,
    },
    {
      title: "Policies",
      url: "/settings/delivery-policy",
      icon: ScrollText,
    },
  ],

  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: MapIcon,
    },
  ],
};

const validNavPaths = new Set([
  ...navLinks.main.map((i) => i.url),
  ...navLinks.processes.map((i) => i.url),
  ...navLinks.resources.map((i) => i.url),
  ...navLinks.settings.map((i) => i.url),
  ...navLinks.operations.flatMap((i) => [
    i.url,
    ...(i.items?.map((sub) => sub.url) || []),
  ]),
]);

export default function Layout() {
  const { data, isPending } = useCurrentUser();
  const location = useLocation();
  const isDeliveryCompany = useIsDeliveryCompany();
  const isBusiness = useIsBusiness();
  const handlePrefetch = useRoutePrefetch();
  const navigate = useNavigate();

  const signoutMutation = useSignoutMutation(
    undefined, // error state handled by toast in mutation
    () => {
      // Navigate to login after successful signout
      navigate("/login");
    }
  );

  const handleSignout = () => {
    signoutMutation.mutate();
  };

  // Filter navigation items based on user type
  const visibleResources = isDeliveryCompany
    ? navLinks.resources
    : navLinks.resources.filter(
      (item) => item.title === "Orders" || item.title === "Products"
    );

  // Filter settings - hide workflows for business users
  const visibleSettings = isBusiness
    ? navLinks.settings.filter((item) => item.title !== "Workflows")
    : navLinks.settings;

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
                  name: data?.user.organization?.name || "Guest",
                  logo: GalleryVerticalEnd,
                  plan: "Delivery",
                },
              ]}
            />
          }
          signOut={handleSignout}
          user={{
            name: data?.user.name || "Guest",
            email: data?.user.email || "guest@example.com",
            avatar: data?.user.image || "https://github.com/shadcn.png",
          }}
        >
          <NavMain
            items={navLinks.main}
            onPrefetch={handlePrefetch}
            sectionName="Main"
          />
          <NavMain
            items={navLinks.processes}
            onPrefetch={handlePrefetch}
            sectionName="Processes"
          />
          <NavMain
            items={visibleResources}
            onPrefetch={handlePrefetch}
            sectionName="Resources"
          />
          {isDeliveryCompany && (
            <NavMain
              items={navLinks.operations}
              onPrefetch={handlePrefetch}
              sectionName="Operations"
            />
          )}
          <NavMain
            items={visibleSettings}
            onPrefetch={handlePrefetch}
            sectionName="Settings"
          />
        </AppSidebar>
        <SidebarInset className="relative flex h-dvh flex-col overflow-hidden">
          <AppHeader
            isBusiness={isBusiness}
            isDeliveryCompany={isDeliveryCompany}
            signOut={handleSignout}
            user={{
              name: data?.user.name || "Guest",
              email: data?.user.email || "guest@example.com",
              avatar: data?.user.image || "https://github.com/shadcn.png",
            }}
          />
          <div className="relative flex grow overflow-hidden">
            <div className="flex grow flex-col overflow-hidden">
              <Outlet />
            </div>
            <GlobalSidePanel />
          </div>
          {validNavPaths.has(
            location.pathname.endsWith("/") && location.pathname.length > 1
              ? location.pathname.slice(0, -1)
              : location.pathname
          ) && (
              <div className="absolute right-0 bottom-0 left-0 flex justify-center md:hidden">
                <BottomNav
                  className="w-full rounded-b-none"
                  items={
                    isDeliveryCompany
                      ? mobileNavLinks
                      : mobileNavLinks.filter(
                        (link) => link.title !== "Operations"
                      )
                  }
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
