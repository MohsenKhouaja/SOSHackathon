"use client";

import { X } from "lucide-react";
import { useIsMobileOrTablet } from "../../hooks/use-mobile";
import { useSidePanelStore } from "../../stores/side-panel-store";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "./sidebar";

function SidePanelInner({
  title,
  description,
  content,
  onClose,
}: {
  title?: string;
  description?: string;
  content: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="h-full rounded-xl bg-background">
      <div className="flex h-full flex-col overflow-hidden rounded-xl bg-sidebar">
        {(title || description) && (
          <SidebarHeader className="flex flex-row items-center justify-between border-b px-4 py-2.5">
            <div className="flex flex-col gap-0.5">
              {title && <h3 className="font-semibold leading-none">{title}</h3>}
              {description && (
                <p className="text-muted-foreground text-sm">{description}</p>
              )}
            </div>
            <Button
              className="h-8 w-8"
              onClick={onClose}
              size="icon"
              variant="ghost"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SidebarHeader>
        )}
        <SidebarContent className="overflow-auto p-4">{content}</SidebarContent>
      </div>
    </div>
  );
}

export function GlobalSidePanel() {
  const { isOpen, setOpen, content, title, description } = useSidePanelStore();
  const isMobileOrTablet = useIsMobileOrTablet();

  // On mobile/tablet, render as a Sheet (drawer with overlay)
  if (isMobileOrTablet) {
    return (
      <Sheet onOpenChange={setOpen} open={isOpen}>
        <SheetContent
          className="w-[min(22rem,100vw-2rem)] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          side="right"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{title ?? "Side Panel"}</SheetTitle>
            <SheetDescription>
              {description ?? "Displays additional information."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col p-3 pt-3.5">
            <SidePanelInner
              content={content}
              description={description}
              onClose={() => setOpen(false)}
              title={title}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // On desktop, render as a sidebar
  return (
    <SidebarProvider
      className="h-full min-h-0 w-auto **:data-[slot=sidebar-container]:transition-none! **:data-[slot=sidebar-gap]:transition-none!"
      onOpenChange={(open) => !open && setOpen(false)}
      open={isOpen}
      style={
        {
          "--sidebar-width": "24rem",
        } as React.CSSProperties
      }
    >
      <Sidebar
        className="absolute inset-y-0 right-0 h-full bg-background p-3 pt-3.5 shadow-none"
        collapsible="offcanvas"
        side="right"
        variant="floating"
      >
        <SidePanelInner
          content={content}
          description={description}
          onClose={() => setOpen(false)}
          title={title}
        />
      </Sidebar>
    </SidebarProvider>
  );
}
