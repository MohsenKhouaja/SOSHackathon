/**
 * Professional Shipping Label PDF Generator
 * Creates A4 shipping labels with QR code and barcode for individual orders
 * Built with @react-pdf/renderer and @bwip-js/browser
 */

import bwipjs from "@bwip-js/browser";
import {
  Document,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { encodeOrderQR, formatCurrency, formatWeight } from "@repo/shared";
import { generateQRCodeDataUrl } from "@repo/ui/components/kibo-ui/qr-code/utils";
import type { OrderRow } from "@repo/validators";

export type ShippingLabelOrder = OrderRow;

export type ShippingLabelBusinessInfo = {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
};

export type ShippingLabelOptions = {
  order: ShippingLabelOrder;
  businessInfo?: ShippingLabelBusinessInfo;
};

export type BulkShippingLabelOptions = {
  orders: ShippingLabelOrder[];
  businessInfo?: ShippingLabelBusinessInfo;
};

// Default Lanci business information
const DEFAULT_BUSINESS_INFO: ShippingLabelBusinessInfo = {
  name: "Lanci LLC",
  address: "Tunisia",
  phone: "+216 XX XXX XXX",
  email: "contact@lanci.tn",
};

/**
 * Generate barcode as base64 PNG using @bwip-js/browser
 */
async function generateBarcodeDataUrl(text: string): Promise<string> {
  try {
    // Create a canvas element for barcode generation
    const canvas = document.createElement("canvas");

    // Generate barcode on canvas
    await bwipjs.toCanvas(canvas, {
      bcid: "code128",
      text,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: "center",
      textsize: 10,
    });

    // Convert canvas to data URL
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Failed to generate barcode:", error);
    return "";
  }
}

/**
 * Generate QR code data URL using @repo/ui QR utility
 */
async function generateQRCode(data: string): Promise<string> {
  return await generateQRCodeDataUrl({
    data,
    width: 200,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}

/**
 * Format date in French locale
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Calculate order total from order products
 */
function calculateOrderTotal(order: ShippingLabelOrder): number {
  if (!order.orderProducts?.length) return 0;
  return order.orderProducts.reduce((acc, op) => {
    const price = Number.parseFloat(op.product?.price ?? "0");
    const qty = Number.parseFloat(op.quantity ?? "0");
    return acc + price * qty;
  }, 0);
}

/**
 * Get product summary string
 */
function getProductSummary(order: ShippingLabelOrder): string {
  if (!order.orderProducts?.length) return "N/A";
  return order.orderProducts
    .map((op) => {
      const productName = op.product?.name ?? "Product";
      const qty = op.quantity ?? "0";
      return `${productName} x${qty}`;
    })
    .join(" | ");
}

/**
 * Get total quantity of products
 */
function getTotalQuantity(order: ShippingLabelOrder): number {
  if (!order.orderProducts?.length) return 0;
  return order.orderProducts.reduce(
    (acc, op) => acc + Number.parseFloat(op.quantity || "0"),
    0
  );
}

// Styles for A4 shipping label
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Header section with business info
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
  },
  logo: {
    width: 100,
    height: 45,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  businessName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  businessDetail: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 2,
  },
  // Main content container
  mainContent: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  // Left column - Codes
  codesColumn: {
    width: "35%",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  qrCode: {
    width: 140,
    height: 140,
    marginBottom: 15,
  },
  barcode: {
    width: "100%",
    height: 60,
    marginTop: 10,
  },
  skuLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 10,
    textAlign: "center",
  },
  // Right column - Order details
  detailsColumn: {
    flex: 1,
  },
  // Section styling
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Destination (Client) section - emphasized
  destinationSection: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  destinationTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
  },
  clientAddress: {
    fontSize: 12,
    color: "#ffffff",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  clientPhone: {
    fontSize: 12,
    color: "#ffffff",
    marginTop: 6,
    fontWeight: "bold",
  },
  // Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 9,
    color: "#666666",
    flex: 1,
  },
  infoValue: {
    fontSize: 10,
    color: "#1a1a1a",
    fontWeight: "bold",
    flex: 2,
    textAlign: "right",
  },
  // Products section
  productsSection: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },
  productsList: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.5,
  },
  // Amount section
  amountSection: {
    padding: 15,
    backgroundColor: "#e8f4fd",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#3b82f6",
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 10,
    color: "#3b82f6",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  // Flags row
  flagsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginTop: 20,
    marginBottom: 15,
  },
  flag: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#fee2e2",
  },
  flagActive: {
    backgroundColor: "#fecaca",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  flagText: {
    fontSize: 9,
    color: "#dc2626",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  // Notes section
  notesSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fffbeb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: "#78350f",
  },
});

// Shipping Label Document Component
type ShippingLabelDocumentProps = {
  order: ShippingLabelOrder;
  businessInfo: ShippingLabelBusinessInfo;
  barcodeDataUrl: string;
  qrCodeDataUrl: string;
};

const ShippingLabelDocument = ({
  order,
  businessInfo,
  barcodeDataUrl,
  qrCodeDataUrl,
}: ShippingLabelDocumentProps) => {
  const orderTotal = calculateOrderTotal(order);
  const productSummary = getProductSummary(order);
  const totalQuantity = getTotalQuantity(order);
  const createdDate = order.createdAt ? new Date(order.createdAt) : new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Business Info */}
        <View style={styles.header}>
          <View>
            <Image cache={false} src="/assets/lanci.png" style={styles.logo} />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.businessName}>{businessInfo.name}</Text>
            {businessInfo.address && (
              <Text style={styles.businessDetail}>{businessInfo.address}</Text>
            )}
            {businessInfo.phone && (
              <Text style={styles.businessDetail}>
                Tel: {businessInfo.phone}
              </Text>
            )}
            {businessInfo.email && (
              <Text style={styles.businessDetail}>{businessInfo.email}</Text>
            )}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Left Column - QR Code and Barcode */}
          <View style={styles.codesColumn}>
            {qrCodeDataUrl && (
              <Image src={qrCodeDataUrl} style={styles.qrCode} />
            )}
            <Text
              style={[styles.skuLabel, { marginBottom: 30, marginTop: 20 }]}
            >
              {order.sku || "N/A"}
            </Text>
            {barcodeDataUrl && (
              <Image
                src={barcodeDataUrl}
                style={[styles.barcode, { marginTop: 20 }]}
              />
            )}
          </View>

          {/* Right Column - Order Details */}
          <View style={styles.detailsColumn}>
            {/* Destination Section - Emphasized */}
            <View style={styles.destinationSection}>
              <Text style={styles.destinationTitle}>Destinataire</Text>
              <Text style={styles.clientName}>
                {order.client?.fullName || "N/A"}
              </Text>
              <Text style={styles.clientAddress}>
                {order.client?.address || "Adresse non disponible"}
              </Text>
              {order.client?.phone && (
                <Text style={styles.clientPhone}>
                  Tel: {order.client.phone}
                </Text>
              )}
            </View>

            {/* Order Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Détails Commande</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>N° Commande:</Text>
                <Text style={styles.infoValue}>{order.sku || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(createdDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Articles:</Text>
                <Text style={styles.infoValue}>
                  {Math.round(totalQuantity)}
                </Text>
              </View>
              {order.weight && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Poids:</Text>
                  <Text style={styles.infoValue}>
                    {formatWeight(Number(order.weight))}
                  </Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Statut:</Text>
                <Text style={styles.infoValue}>
                  {order.status?.name || "N/A"}
                </Text>
              </View>
            </View>

            {/* Products Section */}
            <View style={styles.productsSection}>
              <Text style={styles.sectionTitle}>Produits</Text>
              <Text style={styles.productsList}>{productSummary}</Text>
            </View>

            {/* Amount Section - COD */}
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Montant à Collecter</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(orderTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Flags Row */}
        <View style={styles.flagsRow}>
          {order.fragile && (
            <View style={[styles.flag, styles.flagActive]}>
              <Text style={styles.flagText}>! FRAGILE</Text>
            </View>
          )}
          {order.allowOpenPackage && (
            <View
              style={[
                styles.flag,
                { backgroundColor: "#dbeafe", borderColor: "#3b82f6" },
              ]}
            >
              <Text style={[styles.flagText, { color: "#1d4ed8" }]}>
                OUVERTURE AUTORISEE
              </Text>
            </View>
          )}
          {order.deliveryCostIncluded && (
            <View
              style={[
                styles.flag,
                { backgroundColor: "#d1fae5", borderColor: "#10b981" },
              ]}
            >
              <Text style={[styles.flagText, { color: "#047857" }]}>
                LIVRAISON INCLUSE
              </Text>
            </View>
          )}
        </View>

        {/* Notes Section */}
        {order.note && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{order.note}</Text>
          </View>
        )}

        {/* Footer */}
        <View fixed style={styles.footer}>
          <Text style={styles.footerText}>
            Généré le {formatDate(new Date())}
          </Text>
          <Text style={styles.footerText}>Powered by Lanci</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
            style={styles.footerText}
          />
        </View>
      </Page>
    </Document>
  );
};

// Multi-page document for bulk printing
type BulkShippingLabelDocumentProps = {
  orders: Array<{
    order: ShippingLabelOrder;
    barcodeDataUrl: string;
    qrCodeDataUrl: string;
  }>;
  businessInfo: ShippingLabelBusinessInfo;
};

const BulkShippingLabelDocument = ({
  orders,
  businessInfo,
}: BulkShippingLabelDocumentProps) => {
  return (
    <Document>
      {orders.map(({ order, barcodeDataUrl, qrCodeDataUrl }) => {
        const orderTotal = calculateOrderTotal(order);
        const productSummary = getProductSummary(order);
        const totalQuantity = getTotalQuantity(order);
        const createdDate = order.createdAt
          ? new Date(order.createdAt)
          : new Date();

        return (
          <Page key={order.id} size="A4" style={styles.page}>
            {/* Header with Business Info */}
            <View style={styles.header}>
              <View>
                <Image
                  cache={false}
                  src="/assets/lanci.png"
                  style={styles.logo}
                />
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.businessName}>{businessInfo.name}</Text>
                {businessInfo.address && (
                  <Text style={styles.businessDetail}>
                    {businessInfo.address}
                  </Text>
                )}
                {businessInfo.phone && (
                  <Text style={styles.businessDetail}>
                    Tel: {businessInfo.phone}
                  </Text>
                )}
                {businessInfo.email && (
                  <Text style={styles.businessDetail}>
                    {businessInfo.email}
                  </Text>
                )}
              </View>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              {/* Left Column - QR Code and Barcode */}
              <View style={styles.codesColumn}>
                {qrCodeDataUrl && (
                  <Image src={qrCodeDataUrl} style={styles.qrCode} />
                )}
                <Text style={styles.skuLabel}>{order.sku || "N/A"}</Text>
                {barcodeDataUrl && (
                  <Image src={barcodeDataUrl} style={styles.barcode} />
                )}
              </View>

              {/* Right Column - Order Details */}
              <View style={styles.detailsColumn}>
                {/* Destination Section - Emphasized */}
                <View style={styles.destinationSection}>
                  <Text style={styles.destinationTitle}>Destinataire</Text>
                  <Text style={styles.clientName}>
                    {order.client?.fullName || "N/A"}
                  </Text>
                  <Text style={styles.clientAddress}>
                    {order.client?.address || "Adresse non disponible"}
                  </Text>
                  {order.client?.phone && (
                    <Text style={styles.clientPhone}>
                      Tel: {order.client.phone}
                    </Text>
                  )}
                </View>

                {/* Order Info Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Détails Commande</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>N° Commande:</Text>
                    <Text style={styles.infoValue}>{order.sku || "N/A"}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(createdDate)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Articles:</Text>
                    <Text style={styles.infoValue}>
                      {Math.round(totalQuantity)}
                    </Text>
                  </View>
                  {order.weight && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Poids:</Text>
                      <Text style={styles.infoValue}>
                        {formatWeight(Number(order.weight))}
                      </Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Statut:</Text>
                    <Text style={styles.infoValue}>
                      {order.status?.name || "N/A"}
                    </Text>
                  </View>
                </View>

                {/* Products Section */}
                <View style={styles.productsSection}>
                  <Text style={styles.sectionTitle}>Produits</Text>
                  <Text style={styles.productsList}>{productSummary}</Text>
                </View>

                {/* Amount Section - COD */}
                <View style={styles.amountSection}>
                  <Text style={styles.amountLabel}>Montant à Collecter</Text>
                  <Text style={styles.amountValue}>
                    {formatCurrency(orderTotal)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Flags Row */}
            <View style={styles.flagsRow}>
              {order.fragile && (
                <View style={[styles.flag, styles.flagActive]}>
                  <Text style={styles.flagText}>! FRAGILE</Text>
                </View>
              )}
              {order.allowOpenPackage && (
                <View
                  style={[
                    styles.flag,
                    { backgroundColor: "#dbeafe", borderColor: "#3b82f6" },
                  ]}
                >
                  <Text style={[styles.flagText, { color: "#1d4ed8" }]}>
                    OUVERTURE AUTORISEE
                  </Text>
                </View>
              )}
              {order.deliveryCostIncluded && (
                <View
                  style={[
                    styles.flag,
                    { backgroundColor: "#d1fae5", borderColor: "#10b981" },
                  ]}
                >
                  <Text style={[styles.flagText, { color: "#047857" }]}>
                    LIVRAISON INCLUSE
                  </Text>
                </View>
              )}
            </View>

            {/* Notes Section */}
            {order.note && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{order.note}</Text>
              </View>
            )}

            {/* Footer */}
            <View fixed style={styles.footer}>
              <Text style={styles.footerText}>
                Généré le {formatDate(new Date())}
              </Text>
              <Text style={styles.footerText}>Powered by Lanci</Text>
              <Text
                render={({ pageNumber, totalPages }) =>
                  `Page ${pageNumber} / ${totalPages}`
                }
                style={styles.footerText}
              />
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

/**
 * Generate a single shipping label PDF for one order
 */
export async function generateShippingLabelPDF(
  options: ShippingLabelOptions
): Promise<void> {
  const { order, businessInfo = DEFAULT_BUSINESS_INFO } = options;

  // Generate QR code data
  const qrData = encodeOrderQR({
    orderId: order.id,
    sku: order.sku || "",
  });

  // Generate barcode and QR code images
  const [barcodeDataUrl, qrCodeDataUrl] = await Promise.all([
    generateBarcodeDataUrl(order.sku || order.id),
    generateQRCode(qrData),
  ]);

  // Generate PDF
  const blob = await pdf(
    <ShippingLabelDocument
      barcodeDataUrl={barcodeDataUrl}
      businessInfo={businessInfo}
      order={order}
      qrCodeDataUrl={qrCodeDataUrl}
    />
  ).toBlob();

  // Download the PDF
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shipping-label-${order.sku || order.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate shipping labels for multiple orders (bulk print)
 */
export async function generateBulkShippingLabelsPDF(
  options: BulkShippingLabelOptions
): Promise<void> {
  const { orders, businessInfo = DEFAULT_BUSINESS_INFO } = options;

  // Generate barcodes and QR codes for all orders in parallel
  const ordersWithCodes = await Promise.all(
    orders.map(async (order) => {
      const qrData = encodeOrderQR({
        orderId: order.id,
        sku: order.sku || "",
      });

      const [barcodeDataUrl, qrCodeDataUrl] = await Promise.all([
        generateBarcodeDataUrl(order.sku || order.id),
        generateQRCode(qrData),
      ]);

      return {
        order,
        barcodeDataUrl,
        qrCodeDataUrl,
      };
    })
  );

  // Generate PDF
  const blob = await pdf(
    <BulkShippingLabelDocument
      businessInfo={businessInfo}
      orders={ordersWithCodes}
    />
  ).toBlob();

  // Download the PDF
  const timestamp = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shipping-labels-${timestamp}-${orders.length}orders.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Helper function to generate shipping label for a single order
 */
export function generateOrderShippingLabel(
  order: ShippingLabelOrder,
  businessInfo?: ShippingLabelBusinessInfo
): Promise<void> {
  return generateShippingLabelPDF({ order, businessInfo });
}

/**
 * Helper function to generate shipping labels for multiple orders
 */
export function generateOrdersShippingLabels(
  orders: ShippingLabelOrder[],
  businessInfo?: ShippingLabelBusinessInfo
): Promise<void> {
  return generateBulkShippingLabelsPDF({ orders, businessInfo });
}
