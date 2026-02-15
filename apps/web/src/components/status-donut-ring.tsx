import { useEffect, useState } from "react";

type StatusSegment = {
  color: string;
  value: number;
  statusName: string;
};

type StatusDonutRingProps = {
  segments: StatusSegment[];
  size?: number;
  thickness?: number;
  className?: string;
  ignoredStatuses?: string[];
};

export function StatusDonutRing({
  segments,
  size = 44,
  thickness = 4,
  className,
  ignoredStatuses = [],
}: StatusDonutRingProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter segments that should be displayed in the center and cycled through
  const visibleSegments = segments.filter(
    (s) => !ignoredStatuses.includes(s.statusName)
  );

  const total = segments.reduce((acc, curr) => acc + curr.value, 0);
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (visibleSegments.length <= 1) return;
    const interval = setInterval(() => {
      setPrevIndex(activeIndex);
      setActiveIndex((prev) => (prev + 1) % visibleSegments.length);
      setIsAnimating(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [visibleSegments.length, activeIndex]);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  if (total === 0) {
    return (
      <svg className={className} height={size} width={size}>
        <title>Empty Status Ring</title>
        <circle
          className="text-muted/20"
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth={thickness}
        />
      </svg>
    );
  }

  let currentOffset = 0;
  const activeSegment = visibleSegments[activeIndex];
  const prevSegment = visibleSegments[prevIndex];

  const percentage = activeSegment
    ? Math.round((activeSegment.value / total) * 100)
    : 0;

  const prevPercentage = prevSegment
    ? Math.round((prevSegment.value / total) * 100)
    : 0;

  return (
    <svg
      className={className}
      height={size}
      style={{ overflow: "visible" }}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
    >
      <title>Status Distribution Ring</title>
      <g transform={`rotate(-90 ${center} ${center})`}>
        {segments.map((segment, index) => {
          const segmentLength = (segment.value / total) * circumference;
          const dashArray = `${segmentLength} ${circumference}`;
          const dashOffset = -currentOffset;
          currentOffset += segmentLength;

          // If ignored, we skip rendering the stroke but still advance the offset
          if (ignoredStatuses.includes(segment.statusName)) {
            return null;
          }

          // Check if this segment is the active one being displayed
          const isActive = activeSegment?.statusName === segment.statusName;

          return (
            <circle
              className="transition-all duration-300"
              cx={center}
              cy={center}
              fill="transparent"
              key={index}
              opacity={isActive ? 1 : 0.3}
              r={radius}
              stroke={segment.color || "currentColor"}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeWidth={isActive ? thickness + 1 : thickness}
            />
          );
        })}
      </g>

      {/* Exiting Text */}
      {isAnimating && (
        <text
          className="select-none fill-foreground"
          dominantBaseline="central"
          fontSize={size * 0.25}
          fontWeight="bold"
          style={{
            opacity: 0,
            transform: "translateX(-10px)",
            transition: "all 0.5s ease-in-out",
            transformBox: "fill-box",
            transformOrigin: "center",
          }}
          textAnchor="middle"
          x="50%"
          y="50%"
        >
          {prevPercentage}%
        </text>
      )}

      {/* Entering/Active Text */}
      <text
        className="select-none fill-foreground"
        dominantBaseline="central"
        fontSize={size * 0.25}
        fontWeight="bold"
        style={{
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? "translateX(10px)" : "translateX(0)",
          animation: isAnimating ? "slideIn 0.5s forwards" : "none",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
        textAnchor="middle"
        x="50%"
        y="50%"
      >
        {percentage}%
      </text>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </svg>
  );
}
