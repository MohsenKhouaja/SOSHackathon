import { useMemo } from "react";
import { Link, useLocation } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { MobileAppHeader } from "./mobile-app-header";
// import { ModeToggle } from "./mode-toggle";
import { NavUser, type NavUserProps } from "./nav-user";

type BreadcrumbResolver = (
  segment: string,
  index: number,
  allSegments: string[]
) => string;

interface AppHeaderProps extends NavUserProps {
  breadcrumbResolver?: BreadcrumbResolver;
  isBusiness?: boolean;
  isDeliveryCompany?: boolean;
}

import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { Separator } from "./separator";
import { SidebarTrigger } from "./sidebar";
import { ThemeToggleButton } from "./theme-toggle";

// import { ThemeToggle } from "./theme-toggle";

const UUID7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ROUTES_WITHOUT_APP_HEADER = ["route"];

function shouldHideAppHeader(pathname: string, isMobile: boolean) {
  return (
    ROUTES_WITHOUT_APP_HEADER.some((r) => pathname.includes(r)) && isMobile
  );
}

function getBreadcrumbs(pathname: string, resolver?: BreadcrumbResolver) {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string; isUuid: boolean }[] = [];

  let currentPath = "";
  for (let i = 0; i < paths.length; i++) {
    const segment = paths[i] || "";
    currentPath += `/${segment}`;

    let label = resolver
      ? resolver(segment, i, paths)
      : segment.charAt(0).toUpperCase() + segment.slice(1);

    let isUuid = false;
    // if label is uuid7 truncate it or something.
    if (label.match(UUID7_REGEX)) {
      label = `${label.slice(0, 8)}...`;
      isUuid = true;
    }

    breadcrumbs.push({
      label,
      href: currentPath,
      isUuid,
    });
  }

  return breadcrumbs;
}

export default function AppHeader({
  breadcrumbResolver,
  isBusiness,
  isDeliveryCompany,
  ...props
}: AppHeaderProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const isMobile = useIsMobile();

  const breadcrumbs = useMemo(
    () => getBreadcrumbs(pathname, breadcrumbResolver),
    [pathname, breadcrumbResolver]
  );

  if (shouldHideAppHeader(pathname, isMobile)) {
    return null;
  }

  if (isMobile) {
    return (
      <MobileAppHeader
        isBusiness={isBusiness}
        isDeliveryCompany={isDeliveryCompany}
      />
    );
  }

  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 border-b-[0.5px] bg-background transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div
                  className="flex flex-row items-center gap-3"
                  key={crumb.href}
                >
                  <BreadcrumbItem>
                    {index < breadcrumbs.length - 1 ? (
                      <BreadcrumbLink asChild>
                        <Link className="text-link" to={crumb.href}>
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex w-fit items-center gap-2">
          <ThemeToggleButton
            className="shrink-0 bg-background size-8"
            start="top-right"
            variant="circle"
          />
          {/* <ThemeToggle start="top-right" variant="circle" /> */}
          {/* <ModeToggle /> */}
          <NavUser {...props} />
        </div>
      </div>
    </header>
  );
}
