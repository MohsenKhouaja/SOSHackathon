import { cn } from "@repo/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

type Tab = {
  title: string;
  icon: LucideIcon;
  type?: never;
};

type Separator = {
  type: "separator";
  title?: never;
  icon?: never;
};

type TabItem = Tab | Separator;

type ExpandableTabsProps = {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
  selectedIndex?: number | null;
};

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

const transition = {
  delay: 0.1,
  type: "spring",
  bounce: 0,
  duration: 0.6,
} as const;

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
  selectedIndex,
}: ExpandableTabsProps) {
  const [internalSelected, setInternalSelected] = useState<number | null>(null);
  const outsideClickRef = useRef<HTMLDivElement>(null!);

  const isControlled = selectedIndex !== undefined;
  const selected = isControlled ? selectedIndex : internalSelected;

  useOnClickOutside(outsideClickRef, () => {
    if (!isControlled) {
      setInternalSelected(null);
      onChange?.(null);
    }
  });

  const handleSelect = (index: number) => {
    if (!isControlled) {
      setInternalSelected(index);
    }
    onChange?.(index);
  };

  const Separator = () => (
    <div aria-hidden="true" className="mx-1 h-[24px] w-[1.2px] bg-border" />
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between rounded-2xl border bg-background p-2 px-4 shadow-sm",
        className
      )}
      ref={outsideClickRef}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        return (
          <motion.button
            animate="animate"
            className={cn(
              "relative flex items-center rounded-xl px-12 py-2 font-medium transition-colors duration-300",
              selected === index
                ? cn("bg-muted", activeColor)
                : "shrin text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            custom={selected === index}
            initial={false}
            key={tab.title}
            onClick={() => handleSelect(index)}
            transition={transition}
            variants={buttonVariants}
          >
            <Icon size={22} />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  animate="animate"
                  className="overflow-hidden"
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
