import { Loader2 } from "lucide-react";
import type React from "react";

type LanciSpinnerProps = {
  icon?: React.ComponentType<{ className?: string }>;
  text?: string;
  useLogo?: boolean;
  basicSpinner?: boolean;
};

// Lanci Logo component
const LanciLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    aria-labelledby="customIconTitle"
    className={className}
    fill="none"
    role="img"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title id="customIconTitle">Custom play arrow icon</title>
    <circle
      cx="50"
      cy="50"
      fill="none"
      r="45"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      d="M30 50 L45 35 L45 45 L70 45 L70 55 L45 55 L45 65 Z"
      fill="currentColor"
    />
  </svg>
);

const LanciSpinner: React.FC<LanciSpinnerProps> = ({
  icon: Icon,
  text = "",
  useLogo = false,
  basicSpinner = false,
}) => {
  // Determine which icon to use
  const SpinnerIcon = useLogo ? LanciLogo : Icon || Loader2;
  if (basicSpinner) {
    return <SpinnerIcon className="h-6 w-6 animate-spin text-primary" />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <SpinnerIcon className="h-8 w-8 animate-spin text-primary" />
        {text && (
          <p className="font-medium text-muted-foreground text-sm">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LanciSpinner;
