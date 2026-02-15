/**
 * Order QR Code utilities for encoding/decoding order data
 */

export type OrderQRData = {
  orderId: string;
  sku: string;
};

/**
 * Encode order data into a QR code string
 */
export const encodeOrderQR = (data: OrderQRData): string => {
  return JSON.stringify(data);
};

/**
 * Decode a QR code string into order data
 * Returns null if the format is invalid
 */
export const decodeOrderQR = (qrContent: string): OrderQRData | null => {
  try {
    const parsed = JSON.parse(qrContent);

    // Validate required fields
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.orderId === "string" &&
      typeof parsed.sku === "string"
    ) {
      return {
        orderId: parsed.orderId,
        sku: parsed.sku,
      };
    }

    return null;
  } catch {
    // If JSON parsing fails, try to treat the content as a raw order ID
    // This provides fallback for simple QR codes containing just the ID
    if (qrContent && typeof qrContent === "string" && qrContent.length > 0) {
      return {
        orderId: qrContent,
        sku: qrContent,
      };
    }
    return null;
  }
};

/**
 * Validate if a QR code content is a valid order QR
 */
export const isValidOrderQR = (qrContent: string): boolean => {
  return decodeOrderQR(qrContent) !== null;
};
