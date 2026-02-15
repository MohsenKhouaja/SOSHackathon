/**
 * QR Code utility for generating data URLs
 * Used for embedding QR codes in PDFs and other non-DOM contexts
 */

import QR from "qrcode";

export type QRCodeDataUrlOptions = {
  data: string;
  width?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  foreground?: string;
  background?: string;
};

/**
 * Generate a QR code as a data URL (PNG)
 * Useful for embedding in PDFs or other contexts where DOM rendering isn't possible
 */
export async function generateQRCodeDataUrl(
  options: QRCodeDataUrlOptions
): Promise<string> {
  const {
    data,
    width = 200,
    margin = 1,
    errorCorrectionLevel = "M",
    foreground = "#000000",
    background = "#ffffff",
  } = options;

  try {
    const dataUrl = await QR.toDataURL(data, {
      width,
      margin,
      errorCorrectionLevel,
      color: {
        dark: foreground,
        light: background,
      },
    });
    return dataUrl;
  } catch (error) {
    console.error("Failed to generate QR code data URL:", error);
    return "";
  }
}
