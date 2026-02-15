/**
 * Business-Delivery Company connection status constants
 */
export type ConnectionStatus =
  | "pending"
  | "business_accepted"
  | "delivery_company_accepted"
  | "both_accepted"
  | "rejected";

/**
 * Individual status constants for type-safe usage
 */
export const CONNECTION_STATUS = {
  PENDING: "pending",
  BUSINESS_ACCEPTED: "business_accepted",
  DELIVERY_COMPANY_ACCEPTED: "delivery_company_accepted",
  BOTH_ACCEPTED: "both_accepted",
  REJECTED: "rejected",
} as const satisfies Record<string, ConnectionStatus>;
