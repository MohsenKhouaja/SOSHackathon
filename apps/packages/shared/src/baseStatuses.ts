const COLORS = {
  green: "#22C55E",
  orange: "#F59E0B",
  yellow: "#EAB308",
  red: "#EF4444",
  blue: "#3B82F6",
};

export const baseStatuses = {} as const;

export type StopStatus = keyof typeof baseStatuses.stop;
