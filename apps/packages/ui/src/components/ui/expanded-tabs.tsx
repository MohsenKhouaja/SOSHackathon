import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandedTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
  selectedIndex?: number | null; // ✅ NEW: default selected tab index from parent
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };

export function ExpandedTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
  selectedIndex,
}: ExpandedTabsProps) {
  const outsideClickRef = React.useRef<HTMLDivElement>(
    null as unknown as HTMLDivElement
  );

  useOnClickOutside(outsideClickRef, () => {
    onChange?.(null);
  });

  const Separator = () => (
    <div aria-hidden="true" className="h-[24px] w-[1.2px] bg-border" />
  );

  return (
    <div
      className={cn(
        "flex justify-between rounded-2xl border bg-slate-800 p-1 shadow-sm",
        className
      )}
      ref={outsideClickRef}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator")
          return <Separator key={`separator-${index}`} />;

        const Icon = tab.icon;
        const isSelected = selectedIndex === index; // ✅ use prop only

        return (
          <motion.button
            animate="animate"
            className={cn(
              "relative flex items-center rounded-xl px-4 py-2 font-medium text-sm transition-colors duration-300",
              isSelected
                ? cn("bg-slate-700", activeColor)
                : "text-muted hover:bg-slate-500 hover:text-foreground",
              "h-10"
            )}
            custom={isSelected}
            initial={false}
            key={tab.title}
            onClick={() => onChange?.(index)} // ✅ call only onChange
            transition={transition}
            variants={buttonVariants}
          >
            <Icon className="text-muted" size={20} />
            <AnimatePresence initial={false}>
              {isSelected && (
                <motion.span
                  animate="animate"
                  className="whitespace-nowrap text-muted"
                  exit="exit"
                  initial="initial"
                  transition={transition}
                  variants={spanVariants}
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
