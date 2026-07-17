import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Order, OrderItem } from "@prisma/client";
import { formatPKR } from "@/lib/utils";
import { getPaymentMethod } from "@/lib/payments";
import type { StoreSettings } from "@/lib/settings-defaults";

/**
 * The packing slip as a real PDF. Generated server-side with react-pdf (no
 * headless browser), so the output has none of the date / URL / page-number
 * headers a browser stamps onto printed HTML. Mirrors the on-screen slip.
 */

const PURPLE = "#2a0f28";
const MUTED = "#6b5566";
const LINE = "#e6dced";
const GREEN = "#267e47";

const s = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 44, fontSize: 10, color: PURPLE, fontFamily: "Helvetica" },
  row: { flexDirection: "row" },
  between: { flexDirection: "row", justifyContent: "space-between" },
  headerWrap: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: LINE, paddingBottom: 14 },
  storeName: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  muted: { color: MUTED },
  small: { fontSize: 8, color: MUTED },
  slipTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "right" },
  orderNo: { fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "right", marginTop: 2 },
  collectBox: { marginTop: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1.5, borderColor: PURPLE, borderRadius: 4, paddingVertical: 10, paddingHorizontal: 14 },
  collectPaid: { borderColor: GREEN },
  collectLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  collectAmount: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  columns: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  colLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 3 },
  tHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LINE, borderTopWidth: 1, borderTopColor: LINE, paddingVertical: 5, marginTop: 20 },
  tRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1ebf5", paddingVertical: 7, alignItems: "center" },
  th: { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED, textTransform: "uppercase" },
  cPick: { width: 22 },
  cItem: { flex: 1 },
  cQty: { width: 40, textAlign: "center" },
  cPrice: { width: 70, textAlign: "right" },
  cTotal: { width: 80, textAlign: "right" },
  checkbox: { width: 9, height: 9, borderWidth: 0.75, borderColor: MUTED, borderRadius: 1.5 },
  totals: { marginTop: 12, marginLeft: "auto", width: 200 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: LINE, paddingTop: 5, marginTop: 3 },
  grandTotalText: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  note: { marginTop: 18, borderWidth: 1, borderColor: LINE, borderRadius: 4, padding: 10, fontSize: 9 },
  thanks: { marginTop: 28, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 12, textAlign: "center", fontSize: 8, color: MUTED },
});

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

type OrderWithItems = Order & { items: OrderItem[] };

function PackingSlipDocument({ order, settings }: { order: OrderWithItems; settings: StoreSettings }) {
  const isPaid = order.paymentStatus === "paid";
  const amountToCollect = isPaid ? 0 : order.total;
  const unitCount = order.items.reduce((sum, it) => sum + it.quantity, 0);
  const payment = getPaymentMethod(order.paymentMethod)?.label ?? order.paymentMethod;

  return (
    <Document title={`Packing Slip #${order.orderNumber}`}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerWrap}>
          <View>
            <Text style={s.storeName}>{settings.storeName}</Text>
            <Text style={[s.muted, { marginTop: 2 }]}>{settings.storeLegalName}</Text>
            <Text style={[s.small, { marginTop: 2 }]}>
              {settings.storePhone} · {settings.storeEmail}
            </Text>
          </View>
          <View>
            <Text style={s.slipTitle}>Packing Slip</Text>
            <Text style={s.orderNo}>#{order.orderNumber}</Text>
            <Text style={[s.small, { textAlign: "right", marginTop: 2 }]}>{formatDate(order.createdAt)}</Text>
            <Text style={[s.small, { textAlign: "right" }]}>
              {order.items.length} {order.items.length === 1 ? "line" : "lines"} · {unitCount}{" "}
              {unitCount === 1 ? "unit" : "units"}
            </Text>
          </View>
        </View>

        {/* Collect / paid callout */}
        <View style={[s.collectBox, isPaid ? s.collectPaid : {}]}>
          <Text style={s.collectLabel}>
            {amountToCollect > 0 ? "COLLECT ON DELIVERY" : "ALREADY PAID · COLLECT NOTHING"}
          </Text>
          <Text style={s.collectAmount}>{formatPKR(amountToCollect)}</Text>
        </View>

        {/* Ship to / Payment */}
        <View style={s.columns}>
          <View style={{ maxWidth: "60%" }}>
            <Text style={s.colLabel}>Ship to</Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{order.customerName}</Text>
            {order.address ? <Text style={s.muted}>{order.address}</Text> : null}
            {order.city ? <Text style={s.muted}>{order.city}</Text> : null}
            {order.phone ? <Text style={[s.muted, { marginTop: 2 }]}>{order.phone}</Text> : null}
          </View>
          <View>
            <Text style={[s.colLabel, { textAlign: "right" }]}>Payment</Text>
            <Text style={{ textAlign: "right" }}>{payment}</Text>
            <Text style={[s.muted, { textAlign: "right" }]}>
              {isPaid ? "Paid" : "Collect on delivery"}
            </Text>
            {order.courier ? (
              <>
                <Text style={[s.colLabel, { textAlign: "right", marginTop: 6 }]}>Courier</Text>
                <Text style={{ textAlign: "right" }}>
                  {order.courier}
                  {order.trackingNumber ? ` · ${order.trackingNumber}` : ""}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Items */}
        <View style={s.tHead}>
          <Text style={[s.th, s.cPick]}> </Text>
          <Text style={[s.th, s.cItem]}>Item</Text>
          <Text style={[s.th, s.cQty]}>Qty</Text>
          <Text style={[s.th, s.cPrice]}>Price</Text>
          <Text style={[s.th, s.cTotal]}>Total</Text>
        </View>
        {order.items.map((it) => (
          <View key={it.id} style={s.tRow} wrap={false}>
            <View style={s.cPick}>
              <View style={s.checkbox} />
            </View>
            <View style={s.cItem}>
              <Text>
                {it.title}
                {it.variantTitle ? ` · ${it.variantTitle}` : ""}
              </Text>
            </View>
            <Text style={s.cQty}>{it.quantity}</Text>
            <Text style={[s.cPrice, s.muted]}>{formatPKR(it.price)}</Text>
            <Text style={[s.cTotal, { fontFamily: "Helvetica-Bold" }]}>{formatPKR(it.total)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totals}>
          <View style={s.totalLine}>
            <Text style={s.muted}>Subtotal</Text>
            <Text>{formatPKR(order.subtotal)}</Text>
          </View>
          {order.discount > 0 ? (
            <View style={s.totalLine}>
              <Text style={s.muted}>Discount</Text>
              <Text>- {formatPKR(order.discount)}</Text>
            </View>
          ) : null}
          <View style={s.totalLine}>
            <Text style={s.muted}>Shipping</Text>
            <Text>{order.shipping === 0 ? "Free" : formatPKR(order.shipping)}</Text>
          </View>
          <View style={s.grandTotal}>
            <Text style={s.grandTotalText}>Total</Text>
            <Text style={s.grandTotalText}>{formatPKR(order.total)}</Text>
          </View>
        </View>

        {order.note ? (
          <View style={s.note}>
            <Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Note: </Text>
              {order.note}
            </Text>
          </View>
        ) : null}

        <Text style={s.thanks}>Thank you for shopping with {settings.storeName}.</Text>
      </Page>
    </Document>
  );
}

/** Render the packing slip to a PDF buffer. */
export function renderPackingSlipPdf(order: OrderWithItems, settings: StoreSettings): Promise<Buffer> {
  return renderToBuffer(<PackingSlipDocument order={order} settings={settings} />);
}
