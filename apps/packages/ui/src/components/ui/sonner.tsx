import { useThemeReact } from "@repo/ui/hooks/theme-provider";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "light" } = useThemeReact();

  return (
    <Sonner
      className="toaster group"
      position="top-center"
      style={{ fontFamily: "inherit" }}
      theme={theme as ToasterProps["theme"]}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          title: "text-sm !font-semibold [&+div]:text-xs",
          description: "text-sm opacity-90",
          // description: "group-[.toast]:text-muted-foreground",
          // actionButton:
          //   "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          // cancelButton:
          //   "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "absolute !top-4 !right-0 !left-auto",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
