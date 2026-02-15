/**
 * Professional Manifest PDF Generator for Delivery and Pickup
 * Built with @react-pdf/renderer for maintainable, component-based PDF generation
 *
 * Supports two manifest types:
 * - Delivery Manifest: For orders being delivered
 * - Pickup Manifest: For orders being picked up
 *
 * Supports two viewing modes:
 * - Business View: Single page showing only one business's orders
 * - Delivery Company View: Multi-page PDF with one page per business
 */

import {
  Document,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatCurrency } from "@repo/shared";
import type {
  DeliveryRow,
  OrderRow,
  PickupRow,
  ReturnRow,
} from "@repo/validators";

// =============================================================================
// Types
// =============================================================================

export type ManifestOrder = OrderRow;

export type ManifestBusinessInfo = {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string; // Matricule Fiscal (MF) - Required in Tunisia
  registrationNumber?: string; // Registre de Commerce
  website?: string;
};

export type ManifestType = "delivery" | "pickup" | "return";

export type ManifestMode = "business" | "delivery-company";

export type ManifestOptions = {
  orders: ManifestOrder[];
  businessInfo?: ManifestBusinessInfo;
  manifestNumber?: string;
  title?: string;
  notes?: string;
  manifestType?: ManifestType;
};

export type DeliveryManifestOptions = {
  delivery: DeliveryRow;
  mode: ManifestMode;
  manifestType?: ManifestType;
  /**
   * When mode is "business", this is the specific business ID to show orders for.
   */
  businessId?: string;
};

// Default Lanci business information
const DEFAULT_BUSINESS_INFO: ManifestBusinessInfo = {
  name: "Lanci LLC",
  address: "Tunisia",
  phone: "+216 XX XXX XXX",
  email: "contact@lanci.tn",
  taxId: "XXXXXXX/X/X/X/XXX",
  registrationNumber: "XXXXXXX",
  website: "www.lanci.tn",
};

// =============================================================================
// Utility Functions
// =============================================================================

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
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} à ${hours}:${minutes}`;
}

/**
 * Get status display text
 */
function getStatusText(status: ManifestOrder["status"]): string {
  if (!status?.name) return "N/A";
  return status.name.charAt(0).toUpperCase() + status.name.slice(1);
}

/**
 * Calculate order total from order products
 */
function calculateOrderTotal(order: ManifestOrder): number {
  if (!order.orderProducts?.length) return 0;
  return order.orderProducts.reduce((acc, op) => {
    const price = Number.parseFloat(op.product?.price ?? "0");
    const qty = Number.parseFloat(op.quantity ?? "0");
    return acc + price * qty;
  }, 0);
}

/**
 * Generate product designation string
 */
function getProductDesignation(order: ManifestOrder): string {
  if (!order.orderProducts?.length) return "N/A";
  return order.orderProducts
    .map((op) => {
      const productName = op.product?.name ?? "Produit";
      const qty = op.quantity ?? "0";
      return `${productName} (x${qty})`;
    })
    .join(", ");
}

/**
 * Generate a unique manifest number
 */
function generateManifestNumber(prefix = "MAN"): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}${month}${day}-${random}`;
}

/**
 * Get manifest title based on type
 */
function getManifestTitle(manifestType: ManifestType): string {
  switch (manifestType) {
    case "delivery":
      return "Manifeste de Livraison";
    case "pickup":
      return "Manifeste de Ramassage";
    case "return":
      return "Manifeste de Retour";
    default:
      return "Manifeste de Commandes";
  }
}

/**
 * Extract orders from delivery based on business filter
 */
function extractOrdersFromDelivery(
  delivery: DeliveryRow,
  businessId?: string
): ManifestOrder[] {
  const allOrders: ManifestOrder[] = [];

  // Get orders from process
  if (delivery.process?.orders) {
    allOrders.push(...(delivery.process.orders as ManifestOrder[]));
  }

  // Also check route stops for orders
  if (delivery.route?.stops) {
    for (const stop of delivery.route.stops) {
      if (stop.orders) {
        for (const order of stop.orders) {
          // Avoid duplicates
          if (!allOrders.some((o) => o.id === order.id)) {
            allOrders.push(order as ManifestOrder);
          }
        }
      }
    }
  }

  // Filter by business if specified
  if (businessId) {
    return allOrders.filter((order) => order.businessId === businessId);
  }

  return allOrders;
}

/**
 * Group orders by business
 */
function groupOrdersByBusiness(
  orders: ManifestOrder[],
  delivery: DeliveryRow
): Map<string, { business: ManifestBusinessInfo; orders: ManifestOrder[] }> {
  const grouped = new Map<
    string,
    { business: ManifestBusinessInfo; orders: ManifestOrder[] }
  >();

  // Get business info from delivery.businesses relation
  const businessMap = new Map<string, ManifestBusinessInfo>();
  if (delivery.businesses) {
    for (const business of delivery.businesses) {
      if (business.organization) {
        businessMap.set(business.id, {
          id: business.id,
          name: business.organization.name || "Unknown Business",
          address:
            [
              business.organization.streetAddress,
              business.organization.city,
              business.organization.state,
              business.organization.postalCode,
            ]
              .filter(Boolean)
              .join(", ") || undefined,
          phone:
            business.organization.contactPhone ||
            business.organization.phone ||
            undefined,
          email: business.organization.contactEmail || undefined,
          taxId: business.organization.taxId || undefined,
          registrationNumber:
            business.organization.businessLicense || undefined,
        });
      }
    }
  }

  // Group orders by businessId
  for (const order of orders) {
    const businessId = order.businessId;
    if (!businessId) continue;

    let group = grouped.get(businessId);
    if (!group) {
      const businessInfo = businessMap.get(businessId) || {
        id: businessId,
        name: "Unknown Business",
      };
      group = { business: businessInfo, orders: [] };
      grouped.set(businessId, group);
    }
    group.orders.push(order);
  }

  return grouped;
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 35,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerText: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 2,
  },
  separator: {
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1e293b",
  },
  businessInfoBox: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    flexDirection: "column",
  },
  businessInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    gap: 10,
  },
  businessInfoItem: {
    flex: 1,
  },
  businessInfoText: {
    fontSize: 8,
    color: "#1e293b",
    wordWrap: "break-word",
  },
  businessInfoLabel: {
    fontWeight: "bold",
  },
  // Delivery info uses same gray style as business info
  deliveryInfoBox: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    flexDirection: "column",
  },
  summaryBox: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
    width: "40%",
    alignSelf: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#ffffff",
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 9,
    color: "#ffffff",
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 25,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#3b82f6",
    borderBottomWidth: 0,
  },
  tableCol1: {
    width: "6%",
    padding: 5,
  },
  tableCol2: {
    width: "15%",
    padding: 5,
  },
  tableCol3: {
    width: "20%",
    padding: 5,
  },
  tableCol4: {
    width: "30%",
    padding: 5,
  },
  tableCol5: {
    width: "12%",
    padding: 5,
  },
  tableCol6: {
    width: "17%",
    padding: 5,
    textAlign: "right",
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 8,
    color: "#1e293b",
    wordWrap: "break-word",
  },
  tableCellCenter: {
    fontSize: 8,
    color: "#1e293b",
    textAlign: "center",
    wordWrap: "break-word",
  },
  tableCellRight: {
    fontSize: 8,
    color: "#1e293b",
    textAlign: "right",
    wordWrap: "break-word",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 7,
    color: "#64748b",
    fontStyle: "italic",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  notes: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#64748b",
  },
  notesText: {
    fontSize: 8,
    color: "#1e293b",
  },
});

// =============================================================================
// Components
// =============================================================================

type ManifestPageProps = {
  orders: ManifestOrder[];
  businessInfo: ManifestBusinessInfo;
  manifestNumber: string;
  title: string;
  notes?: string;
  totalAmount: number;
  totalProducts: number;
  deliveryInfo?: {
    driverName?: string;
    vehiclePlate?: string;
    deliveryCompany?: string;
  };
};

const ManifestPage = ({
  orders,
  businessInfo,
  manifestNumber,
  title,
  notes,
  totalAmount,
  totalProducts,
  deliveryInfo,
}: ManifestPageProps) => {
  const currentDate = new Date();

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Image cache={false} src="/assets/lanci.png" style={styles.logo} />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerText}>N: {manifestNumber}</Text>
          <Text style={styles.headerText}>Date: {formatDate(currentDate)}</Text>
          <Text style={styles.headerText}>Commandes: {orders.length}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Delivery Info (driver, vehicle, company) - using same gray box style */}
      {deliveryInfo &&
        (deliveryInfo.driverName ||
          deliveryInfo.vehiclePlate ||
          deliveryInfo.deliveryCompany) && (
          <View style={styles.deliveryInfoBox}>
            <View style={styles.businessInfoRow}>
              {deliveryInfo.driverName && (
                <View style={styles.businessInfoItem}>
                  <Text style={styles.businessInfoText}>
                    <Text style={styles.businessInfoLabel}>Livreur: </Text>
                    {deliveryInfo.driverName}
                  </Text>
                </View>
              )}
              {deliveryInfo.vehiclePlate && (
                <View style={styles.businessInfoItem}>
                  <Text style={styles.businessInfoText}>
                    <Text style={styles.businessInfoLabel}>Véhicule: </Text>
                    {deliveryInfo.vehiclePlate}
                  </Text>
                </View>
              )}
            </View>
            {deliveryInfo.deliveryCompany && (
              <View style={styles.businessInfoRow}>
                <View style={styles.businessInfoItem}>
                  <Text style={styles.businessInfoText}>
                    <Text style={styles.businessInfoLabel}>
                      Société de Livraison:{" "}
                    </Text>
                    {deliveryInfo.deliveryCompany}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

      {/* Business Information */}
      <View style={styles.businessInfoBox}>
        {/* Row 1: Company Name and MF */}
        <View style={styles.businessInfoRow}>
          <View style={styles.businessInfoItem}>
            <Text style={[styles.businessInfoText, styles.businessInfoLabel]}>
              {businessInfo.name}
            </Text>
          </View>
          <View style={styles.businessInfoItem}>
            {businessInfo.taxId && (
              <Text style={styles.businessInfoText}>
                <Text style={styles.businessInfoLabel}>MF: </Text>
                {businessInfo.taxId}
              </Text>
            )}
          </View>
        </View>

        {/* Row 2: Address and RC */}
        <View style={styles.businessInfoRow}>
          <View style={styles.businessInfoItem}>
            {businessInfo.address && (
              <Text style={styles.businessInfoText}>
                <Text style={styles.businessInfoLabel}>Adresse: </Text>
                {businessInfo.address}
              </Text>
            )}
          </View>
          <View style={styles.businessInfoItem}>
            {businessInfo.registrationNumber && (
              <Text style={styles.businessInfoText}>
                <Text style={styles.businessInfoLabel}>RC: </Text>
                {businessInfo.registrationNumber}
              </Text>
            )}
          </View>
        </View>

        {/* Row 3: Phone and Email */}
        <View style={styles.businessInfoRow}>
          <View style={styles.businessInfoItem}>
            {businessInfo.phone && (
              <Text style={styles.businessInfoText}>
                <Text style={styles.businessInfoLabel}>Tel: </Text>
                {businessInfo.phone}
              </Text>
            )}
          </View>
          <View style={styles.businessInfoItem}>
            {businessInfo.email && (
              <Text style={styles.businessInfoText}>
                <Text style={styles.businessInfoLabel}>Email: </Text>
                {businessInfo.email}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableCol1}>
            <Text style={styles.tableCellHeader}>#</Text>
          </View>
          <View style={styles.tableCol2}>
            <Text style={styles.tableCellHeader}>SKU</Text>
          </View>
          <View style={styles.tableCol3}>
            <Text style={styles.tableCellHeader}>Client</Text>
          </View>
          <View style={styles.tableCol4}>
            <Text style={styles.tableCellHeader}>Designation</Text>
          </View>
          <View style={styles.tableCol5}>
            <Text style={styles.tableCellHeader}>Statut</Text>
          </View>
          <View style={styles.tableCol6}>
            <Text style={styles.tableCellHeader}>Total</Text>
          </View>
        </View>

        {/* Table Rows */}
        {orders.map((order, index) => (
          <View key={order.id} style={styles.tableRow} wrap={false}>
            <View style={styles.tableCol1}>
              <Text style={styles.tableCellCenter}>{index + 1}</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.tableCell}>{order.sku || "N/A"}</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.tableCell}>
                {order.client?.fullName || "N/A"}
              </Text>
            </View>
            <View style={styles.tableCol4}>
              <Text style={styles.tableCell}>
                {getProductDesignation(order)}
              </Text>
            </View>
            <View style={styles.tableCol5}>
              <Text style={styles.tableCellCenter}>
                {getStatusText(order.status)}
              </Text>
            </View>
            <View style={styles.tableCol6}>
              <Text style={styles.tableCellRight}>
                {formatCurrency(calculateOrderTotal(order))}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Summary Box */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Commandes:</Text>
          <Text style={styles.summaryValue}>{orders.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Articles:</Text>
          <Text style={styles.summaryValue}>{Math.round(totalProducts)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      </View>

      {/* Notes */}
      {notes && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}

      {/* Footer */}
      <View fixed style={styles.footer}>
        <View style={styles.footerRow}>
          <Text>{businessInfo.name}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
          <Text>{formatDate(currentDate)}</Text>
        </View>
      </View>
    </Page>
  );
};

// Single Business Document
type SingleBusinessDocumentProps = {
  orders: ManifestOrder[];
  businessInfo: ManifestBusinessInfo;
  manifestNumber: string;
  title: string;
  notes?: string;
  deliveryInfo?: {
    driverName?: string;
    vehiclePlate?: string;
    deliveryCompany?: string;
  };
};

const SingleBusinessDocument = ({
  orders,
  businessInfo,
  manifestNumber,
  title,
  notes,
  deliveryInfo,
}: SingleBusinessDocumentProps) => {
  const totalAmount = orders.reduce(
    (acc, order) => acc + calculateOrderTotal(order),
    0
  );
  const totalProducts = orders.reduce(
    (acc, order) =>
      acc +
      (order.orderProducts?.reduce(
        (sum, op) => sum + Number.parseFloat(op.quantity || "0"),
        0
      ) ?? 0),
    0
  );

  return (
    <Document>
      <ManifestPage
        businessInfo={businessInfo}
        deliveryInfo={deliveryInfo}
        manifestNumber={manifestNumber}
        notes={notes}
        orders={orders}
        title={title}
        totalAmount={totalAmount}
        totalProducts={totalProducts}
      />
    </Document>
  );
};

type MultiBusinessDocumentProps = {
  businessGroups: Array<{
    business: ManifestBusinessInfo;
    orders: ManifestOrder[];
  }>;
  manifestNumber: string;
  title: string;
  deliveryInfo?: {
    driverName?: string;
    vehiclePlate?: string;
    deliveryCompany?: string;
  };
};

const MultiBusinessDocument = ({
  businessGroups,
  manifestNumber,
  title,
  deliveryInfo,
}: MultiBusinessDocumentProps) => (
  <Document>
    {businessGroups.map(({ business, orders }, index) => {
      const totalAmount = orders.reduce(
        (acc, order) => acc + calculateOrderTotal(order),
        0
      );
      const totalProducts = orders.reduce(
        (acc, order) =>
          acc +
          (order.orderProducts?.reduce(
            (sum, op) => sum + Number.parseFloat(op.quantity || "0"),
            0
          ) ?? 0),
        0
      );

      return (
        <ManifestPage
          businessInfo={business}
          deliveryInfo={deliveryInfo}
          key={business.id || index}
          manifestNumber={`${manifestNumber}-${index + 1}`}
          orders={orders}
          title={title}
          totalAmount={totalAmount}
          totalProducts={totalProducts}
        />
      );
    })}
  </Document>
);

// =============================================================================
// Main Export Functions
// =============================================================================

/**
 * Generate a manifest PDF for a delivery
 */
export async function generateDeliveryManifestPDF(
  options: DeliveryManifestOptions
): Promise<void> {
  const { delivery, mode, manifestType = "delivery", businessId } = options;

  const manifestNumber = generateManifestNumber(
    manifestType === "pickup" ? "RAM" : "LIV"
  );
  const title = getManifestTitle(manifestType);

  // Extract delivery info
  const deliveryInfo = {
    driverName: delivery.driver?.member?.user?.name || undefined,
    vehiclePlate: delivery.vehicle?.plateNumber || undefined,
    deliveryCompany:
      delivery.process?.deliveryCompany?.organization?.name || undefined,
  };

  // Extract all orders from delivery
  const allOrders = extractOrdersFromDelivery(delivery);

  if (mode === "business" && businessId) {
    // Business mode: single page for specific business
    const businessOrders = allOrders.filter((o) => o.businessId === businessId);

    // Find business info
    const businessData = delivery.businesses?.find((b) => b.id === businessId);
    const business: ManifestBusinessInfo = {
      id: businessId,
      name: businessData?.organization?.name || "Business",
      address:
        [
          businessData?.organization?.streetAddress,
          businessData?.organization?.city,
          businessData?.organization?.state,
        ]
          .filter(Boolean)
          .join(", ") || undefined,
      phone:
        businessData?.organization?.contactPhone ||
        businessData?.organization?.phone ||
        undefined,
      email: businessData?.organization?.contactEmail || undefined,
      taxId: businessData?.organization?.taxId || undefined,
      registrationNumber:
        businessData?.organization?.businessLicense || undefined,
    };

    const blob = await pdf(
      <SingleBusinessDocument
        businessInfo={business}
        deliveryInfo={deliveryInfo}
        manifestNumber={manifestNumber}
        orders={businessOrders}
        title={title}
      />
    ).toBlob();

    downloadPDF(blob, `manifeste-${manifestNumber}.pdf`);
  } else {
    // Delivery company mode: multi-page, one per business
    const grouped = groupOrdersByBusiness(allOrders, delivery);
    const businessGroups = [...grouped.values()];

    if (businessGroups.length === 0) {
      throw new Error("No orders found in this delivery");
    }

    const blob = await pdf(
      <MultiBusinessDocument
        businessGroups={businessGroups}
        deliveryInfo={deliveryInfo}
        manifestNumber={manifestNumber}
        title={title}
      />
    ).toBlob();

    downloadPDF(blob, `manifeste-${manifestNumber}.pdf`);
  }
}

/**
 * Helper to download PDF blob
 */
function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate manifest for a business (single page with their orders only)
 */
export function generateBusinessManifest(
  delivery: DeliveryRow,
  businessId: string,
  manifestType: ManifestType = "delivery"
): Promise<void> {
  return generateDeliveryManifestPDF({
    delivery,
    mode: "business",
    manifestType,
    businessId,
  });
}

/**
 * Generate manifest for a delivery company (multi-page, one per business)
 */
export function generateDeliveryCompanyManifest(
  delivery: DeliveryRow,
  manifestType: ManifestType = "delivery"
): Promise<void> {
  return generateDeliveryManifestPDF({
    delivery,
    mode: "delivery-company",
    manifestType,
  });
}

// =============================================================================
// Legacy Export (for backward compatibility)
// =============================================================================

/**
 * Main function to generate the manifest PDF (legacy, for direct order arrays)
 */
export async function generateManifestPDF(
  options: ManifestOptions
): Promise<void> {
  const {
    orders,
    businessInfo = DEFAULT_BUSINESS_INFO,
    manifestNumber = generateManifestNumber(),
    title = "Manifeste de Commandes",
    notes,
  } = options;

  // Calculate totals
  const totalAmount = orders.reduce(
    (acc, order) => acc + calculateOrderTotal(order),
    0
  );
  const totalProducts = orders.reduce(
    (acc, order) =>
      acc +
      (order.orderProducts?.reduce(
        (sum, op) => sum + Number.parseFloat(op.quantity || "0"),
        0
      ) ?? 0),
    0
  );

  // Generate PDF
  const blob = await pdf(
    <Document>
      <ManifestPage
        businessInfo={businessInfo}
        manifestNumber={manifestNumber}
        notes={notes}
        orders={orders}
        title={title}
        totalAmount={totalAmount}
        totalProducts={totalProducts}
      />
    </Document>
  ).toBlob();

  downloadPDF(blob, `manifeste-${manifestNumber}.pdf`);
}

/**
 * Quick helper to generate manifest for selected orders (legacy)
 */
export function generateOrdersManifest(
  orders: ManifestOrder[],
  businessInfo?: ManifestBusinessInfo
): Promise<void> {
  return generateManifestPDF({
    orders,
    businessInfo,
  });
}

// =============================================================================
// Pickup and Return Manifest Functions
// =============================================================================

/**
 * Extract orders from a pickup
 */
function extractOrdersFromPickup(pickup: PickupRow): ManifestOrder[] {
  return (pickup.process?.orders as ManifestOrder[]) || [];
}

/**
 * Extract orders from a return
 */
function extractOrdersFromReturn(returnItem: ReturnRow): ManifestOrder[] {
  return (returnItem.process?.orders as ManifestOrder[]) || [];
}

/**
 * Generate manifest for a pickup
 */
export async function generatePickupManifest(pickup: PickupRow): Promise<void> {
  const orders = extractOrdersFromPickup(pickup);

  if (orders.length === 0) {
    throw new Error("No orders found in this pickup");
  }

  // Get business info from pickup
  const businessInfo: ManifestBusinessInfo = pickup.business?.organization
    ? {
        id: pickup.business.id,
        name: pickup.business.organization.name || "Business",
        address:
          [
            pickup.business.organization.streetAddress,
            pickup.business.organization.city,
            pickup.business.organization.state,
          ]
            .filter(Boolean)
            .join(", ") || undefined,
        phone:
          pickup.business.organization.contactPhone ||
          pickup.business.organization.phone ||
          undefined,
        email: pickup.business.organization.contactEmail || undefined,
        taxId: pickup.business.organization.taxId || undefined,
        registrationNumber:
          pickup.business.organization.businessLicense || undefined,
      }
    : DEFAULT_BUSINESS_INFO;

  // Extract delivery info
  const deliveryInfo = {
    driverName: pickup.driver?.member?.user?.name || undefined,
    vehiclePlate: pickup.vehicle?.plateNumber || undefined,
    deliveryCompany:
      pickup.process?.deliveryCompany?.organization?.name || undefined,
  };

  const manifestNumber = generateManifestNumber("RAM");
  const title = getManifestTitle("pickup");

  // Calculate totals
  const totalAmount = orders.reduce(
    (acc, order) => acc + calculateOrderTotal(order),
    0
  );
  const totalProducts = orders.reduce(
    (acc, order) =>
      acc +
      (order.orderProducts?.reduce(
        (sum, op) => sum + Number.parseFloat(op.quantity || "0"),
        0
      ) ?? 0),
    0
  );

  const blob = await pdf(
    <Document>
      <ManifestPage
        businessInfo={businessInfo}
        deliveryInfo={deliveryInfo}
        manifestNumber={manifestNumber}
        orders={orders}
        title={title}
        totalAmount={totalAmount}
        totalProducts={totalProducts}
      />
    </Document>
  ).toBlob();

  downloadPDF(blob, `manifeste-${manifestNumber}.pdf`);
}

/**
 * Generate manifest for a return
 */
export async function generateReturnManifest(
  returnItem: ReturnRow
): Promise<void> {
  const orders = extractOrdersFromReturn(returnItem);

  if (orders.length === 0) {
    throw new Error("No orders found in this return");
  }

  // Get business info from return
  const businessInfo: ManifestBusinessInfo = returnItem.business?.organization
    ? {
        id: returnItem.business.id,
        name: returnItem.business.organization.name || "Business",
        address:
          [
            returnItem.business.organization.streetAddress,
            returnItem.business.organization.city,
            returnItem.business.organization.state,
          ]
            .filter(Boolean)
            .join(", ") || undefined,
        phone:
          returnItem.business.organization.contactPhone ||
          returnItem.business.organization.phone ||
          undefined,
        email: returnItem.business.organization.contactEmail || undefined,
        taxId: returnItem.business.organization.taxId || undefined,
        registrationNumber:
          returnItem.business.organization.businessLicense || undefined,
      }
    : DEFAULT_BUSINESS_INFO;

  // Extract delivery info
  const deliveryInfo = {
    driverName: returnItem.driver?.member?.user?.name || undefined,
    vehiclePlate: returnItem.vehicle?.plateNumber || undefined,
    deliveryCompany:
      returnItem.process?.deliveryCompany?.organization?.name || undefined,
  };

  const manifestNumber = generateManifestNumber("RET");
  const title = getManifestTitle("return");

  // Calculate totals
  const totalAmount = orders.reduce(
    (acc, order) => acc + calculateOrderTotal(order),
    0
  );
  const totalProducts = orders.reduce(
    (acc, order) =>
      acc +
      (order.orderProducts?.reduce(
        (sum, op) => sum + Number.parseFloat(op.quantity || "0"),
        0
      ) ?? 0),
    0
  );

  const blob = await pdf(
    <Document>
      <ManifestPage
        businessInfo={businessInfo}
        deliveryInfo={deliveryInfo}
        manifestNumber={manifestNumber}
        orders={orders}
        title={title}
        totalAmount={totalAmount}
        totalProducts={totalProducts}
      />
    </Document>
  ).toBlob();

  downloadPDF(blob, `manifeste-${manifestNumber}.pdf`);
}
