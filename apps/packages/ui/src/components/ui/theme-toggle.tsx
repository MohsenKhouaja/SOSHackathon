/** biome-ignore-all lint/a11y/noSvgWithoutTitle: good */
/** biome-ignore-all lint/style/noMagicNumbers: good */
import { cn } from "@repo/ui/lib/utils";
import { motion } from "framer-motion";
import { useId } from "react";
import { SidebarMenuButton } from "./sidebar";
import {
  type AnimationStart,
  type AnimationVariant,
  useThemeToggle,
} from "./theme-animations";

const ThemeIcon = ({
  isDark,
  className,
  id,
}: {
  isDark: boolean;
  className?: string;
  id: string;
}) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="currentColor"
    strokeLinecap="round"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <clipPath id={id}>
      <motion.path
        animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
        d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
        transition={{ ease: "easeInOut", duration: 0.35 }}
      />
    </clipPath>
    <g clipPath={`url(#${id})`}>
      <motion.circle
        animate={{ r: isDark ? 10 : 5.5 }}
        cx="16"
        cy="16"
        fill={isDark ? undefined : "currentColor"}
        stroke={isDark ? undefined : "currentColor"}
        strokeWidth={isDark ? undefined : "1.8"}
        transition={{ ease: "easeInOut", duration: 0.35 }}
      />
      <motion.g
        animate={{
          rotate: isDark ? -100 : 0,
          scale: isDark ? 0.5 : 1,
          opacity: isDark ? 0 : 1,
        }}
        stroke="currentColor"
        strokeWidth="1.7"
        transition={{ ease: "easeInOut", duration: 0.35 }}
      >
        <path d="M16 5.5v-4" />
        <path d="M16 30.5v-4" />
        <path d="M1.5 16h4" />
        <path d="M26.5 16h4" />
        <path d="m23.4 8.6 2.8-2.8" />
        <path d="m5.7 26.3 2.9-2.9" />
        <path d="m5.8 5.8 2.8 2.8" />
        <path d="m23.4 23.4 2.9 2.9" />
      </motion.g>
    </g>
  </svg>
);

export const ThemeToggleButton = ({
  className = "",
  variant = "circle",
  start = "center",
  blur = false,
  gifUrl = "",
  showLabel = false,
}: {
  className?: string;
  variant?: AnimationVariant;
  start?: AnimationStart;
  blur?: boolean;
  gifUrl?: string;
  showLabel?: boolean;
}) => {
  const { isDark, toggleTheme } = useThemeToggle({
    variant,
    start,
    blur,
    gifUrl,
  });
  const id = useId();

  if (showLabel) {
    return (
      <SidebarMenuButton
        className="h-10 justify-between"
        onClick={toggleTheme}
        tooltip="Toggle theme"
      >
        <span className="font-medium">{isDark ? "Dark" : "Light"} Mode</span>
        <ThemeIcon className="size-5" id={id} isDark={isDark} />
      </SidebarMenuButton>
    );
  }

  return (
    <button
      aria-label="Toggle theme"
      className={cn(
        "size-9 rounded-full border bg-background p-[5px] shadow-xs transition-all duration-300 hover:cursor-pointer hover:bg-accent hover:text-accent-foreground active:scale-95 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        isDark ? "bg-black text-white" : "bg-white text-black",
        className
      )}
      onClick={toggleTheme}
      type="button"
    >
      <span className="sr-only">Toggle theme</span>
      <ThemeIcon id={id} isDark={isDark} />
    </button>
  );
};
