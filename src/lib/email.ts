import "server-only";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { getPaymentMethod } from "@/lib/payments";

/**
 * Transactional email. When SMTP_* env vars are set it sends via nodemailer;
 * otherwise it logs the message to the server console (dev fallback) so the
 * pipeline is fully wired and testable without credentials.
 */

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export interface SendResult {
  sent: boolean;
  reason?: string;
}

async function deliver(opts: {
  to: string;
  bcc?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const transport = getTransport();
  const from = process.env.SMTP_FROM || "Eco Global Foods <support@ecoglobalfoods.com>";

  if (!transport) {
    console.log(
      `\n📧  [email:dev-fallback] No SMTP configured - would send:\n` +
        `    to: ${opts.to}${opts.bcc ? ` (bcc ${opts.bcc})` : ""}\n` +
        `    subject: ${opts.subject}\n`,
    );
    return { sent: false, reason: "SMTP not configured" };
  }

  await transport.sendMail({
    from,
    to: opts.to,
    bcc: opts.bcc,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  return { sent: true };
}

/**
 * Shared branded email shell. `heading` sits in the gradient header, `sub` is
 * the small line beneath it, and `body` is the white card's inner HTML.
 */
function shell(opts: {
  storeName: string;
  storeLegalName: string;
  storePhone: string;
  storeEmail: string;
  heading: string;
  sub?: string;
  body: string;
}) {
  return `
  <div style="margin:0;padding:0;background:#faf6ef;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#19081a,#3b1538 45%,#233f18);border-radius:20px;padding:32px;text-align:center;color:#faf6ef;">
        <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#e7cf94;">${escapeHtml(opts.storeName)}</div>
        <div style="font-size:26px;font-weight:700;margin-top:8px;">${opts.heading}</div>
        ${opts.sub ? `<div style="opacity:.8;margin-top:6px;font-size:14px;">${opts.sub}</div>` : ""}
      </div>
      <div style="background:#ffffff;border:1px solid #ece0f7;border-top:none;border-radius:0 0 20px 20px;margin-top:-4px;padding:28px;">
        ${opts.body}
      </div>
      <p style="text-align:center;color:#99628d;font-size:12px;margin-top:18px;">
        ${escapeHtml(opts.storeLegalName)} · ${escapeHtml(opts.storePhone)} · ${escapeHtml(opts.storeEmail)}
      </p>
    </div>
  </div>`;
}

function ctaButton(href: string, label: string) {
  return `<div style="text-align:center;margin-top:24px;">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#3b1538,#233f18);color:#faf6ef;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:600;">${escapeHtml(label)}</a>
  </div>`;
}

/** Send a password-reset link to a customer. */
export async function sendPasswordReset(
  email: string,
  resetUrl: string,
  name?: string,
): Promise<SendResult> {
  const settings = await getSettings();
  const first = (name ?? "").split(" ")[0] || "there";
  const body = `
    <p style="color:#2a0f28;font-size:15px;margin:0 0 16px;">
      Hi ${escapeHtml(first)}, we received a request to reset your Eco Global Foods password.
      Click below to choose a new one. This link expires in 1 hour.
    </p>
    ${ctaButton(resetUrl, "Reset my password")}
    <p style="color:#99628d;font-size:13px;margin:22px 0 0;">
      If you didn't request this, you can safely ignore this email; your password stays unchanged.
    </p>
    <p style="color:#99628d;font-size:12px;word-break:break-all;margin:14px 0 0;">
      Or paste this link into your browser:<br/>${escapeHtml(resetUrl)}
    </p>`;

  return deliver({
    to: email,
    subject: "Reset your Eco Global Foods password",
    html: shell({
      storeName: settings.storeName,
      storeLegalName: settings.storeLegalName,
      storePhone: settings.storePhone,
      storeEmail: settings.storeEmail,
      heading: "Password reset 🔑",
      body,
    }),
    text:
      `Reset your Eco Global Foods password (link expires in 1 hour):\n${resetUrl}\n\n` +
      `If you didn't request this, ignore this email.`,
  });
}

/** Ask a customer to review the products from a delivered order. */
export async function sendReviewRequest(orderId: string): Promise<SendResult> {
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) return { sent: false, reason: "order not found" };
  if (!order.email) return { sent: false, reason: "no customer email" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecoglobalfoods.com";
  const first = order.customerName.split(" ")[0] || "there";

  // Link each line item to its product page reviews section where we can resolve a slug.
  const productIds = order.items.map((i) => i.productId).filter(Boolean) as string[];
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, slug: true, title: true } })
    : [];
  const slugById = new Map(products.map((p) => [p.id, p.slug]));

  const rows = order.items
    .map((it) => {
      const slug = it.productId ? slugById.get(it.productId) : null;
      const name = escapeHtml(it.title);
      return slug
        ? `<a href="${siteUrl}/product/${slug}#reviews" style="color:#267e47;text-decoration:none;font-weight:600;">${name} →</a>`
        : name;
    })
    .join("<br/>");

  const body = `
    <p style="color:#2a0f28;font-size:15px;margin:0 0 16px;">
      Hi ${escapeHtml(first)}, we hope you're enjoying your order! ⭐
    </p>
    <p style="color:#5e3052;font-size:14px;margin:0 0 16px;">
      A quick review helps other shoppers and means a lot to a family business like ours.
      Tap a product below to leave a rating:
    </p>
    <div style="padding:14px 16px;background:#f4fbef;border-radius:12px;font-size:14px;color:#2a0f28;">
      ${rows}
    </div>`;

  return deliver({
    to: order.email,
    subject: "How was your Eco Global Foods order? ⭐",
    html: shell({
      storeName: settings.storeName,
      storeLegalName: settings.storeLegalName,
      storePhone: settings.storePhone,
      storeEmail: settings.storeEmail,
      heading: "Mind leaving a review? ⭐",
      sub: `Order #${order.orderNumber}`,
      body,
    }),
    text:
      `How was your order #${order.orderNumber}? Leave a review:\n` +
      order.items
        .map((it) => {
          const slug = it.productId ? slugById.get(it.productId) : null;
          return slug ? `- ${it.title}: ${siteUrl}/product/${slug}#reviews` : `- ${it.title}`;
        })
        .join("\n"),
  });
}

/** Welcome a new newsletter subscriber. */
export async function sendNewsletterWelcome(email: string): Promise<SendResult> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecoglobalfoods.com";
  const body = `
    <p style="color:#2a0f28;font-size:15px;margin:0 0 16px;">
      Welcome to the Eco Global Foods family 🌿 Thanks for subscribing!
    </p>
    <p style="color:#5e3052;font-size:14px;margin:0 0 16px;">
      You'll be the first to hear about new products, recipes and special offers.
      Keep an eye on your inbox for your welcome discount.
    </p>
    ${ctaButton(`${siteUrl}/shop`, "Start shopping")}`;
  return deliver({
    to: email,
    subject: "Welcome to Eco Global Foods 🌿",
    html: shell({
      storeName: settings.storeName,
      storeLegalName: settings.storeLegalName,
      storePhone: settings.storePhone,
      storeEmail: settings.storeEmail,
      heading: "You're in! 🌿",
      body,
    }),
    text: `Welcome to Eco Global Foods! You're subscribed.\nShop: ${siteUrl}/shop`,
  });
}

/** Send one newsletter-campaign email to a subscriber, with an unsubscribe link. */
export async function sendCampaignEmail(opts: {
  to: string;
  subject: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  unsubscribeUrl: string;
}): Promise<SendResult> {
  const settings = await getSettings();

  // Plain-text body → HTML paragraphs (blank line separates paragraphs).
  const paragraphs = opts.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="color:#2a0f28;font-size:15px;line-height:1.6;margin:0 0 14px;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");

  const cta =
    opts.ctaLabel && opts.ctaUrl ? ctaButton(opts.ctaUrl, opts.ctaLabel) : "";

  const body = `
    ${paragraphs}
    ${cta}
    <p style="margin:24px 0 0;border-top:1px solid #ece0f7;padding-top:14px;text-align:center;color:#99628d;font-size:12px;">
      You're receiving this because you subscribed to Eco Global Foods.<br/>
      <a href="${opts.unsubscribeUrl}" style="color:#99628d;text-decoration:underline;">Unsubscribe</a>
    </p>`;

  return deliver({
    to: opts.to,
    subject: opts.subject,
    html: shell({
      storeName: settings.storeName,
      storeLegalName: settings.storeLegalName,
      storePhone: settings.storePhone,
      storeEmail: settings.storeEmail,
      heading: settings.storeName,
      body,
    }),
    text:
      `${opts.body}\n\n` +
      (opts.ctaLabel && opts.ctaUrl ? `${opts.ctaLabel}: ${opts.ctaUrl}\n\n` : "") +
      `Unsubscribe: ${opts.unsubscribeUrl}`,
  });
}

/** Nudge a shopper who left items in their cart to come back and finish. */
export async function sendAbandonedRecovery(abandonedId: string): Promise<SendResult> {
  const [cart, settings] = await Promise.all([
    prisma.abandonedCheckout.findUnique({ where: { id: abandonedId } }),
    getSettings(),
  ]);
  if (!cart) return { sent: false, reason: "cart not found" };
  if (!cart.email) return { sent: false, reason: "no email" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecoglobalfoods.com";
  const first = (cart.name || "").split(" ")[0] || "there";

  let items: { title: string; variantTitle?: string; quantity: number }[] = [];
  try {
    items = JSON.parse(cart.itemsJson);
  } catch {
    items = [];
  }
  const itemsLine = items
    .map((i) => `${escapeHtml(i.title)}${i.variantTitle ? ` · ${escapeHtml(i.variantTitle)}` : ""} × ${i.quantity}`)
    .join("<br/>");

  const body = `
    <p style="color:#2a0f28;font-size:15px;margin:0 0 16px;">
      Hi ${escapeHtml(first)}, you left some good food in your cart. We saved it for you 🛒
    </p>
    ${itemsLine ? `<div style="padding:14px 16px;background:#f4fbef;border-radius:12px;font-size:14px;color:#2a0f28;">${itemsLine}</div>` : ""}
    <p style="color:#5e3052;font-size:14px;margin:16px 0 0;">
      Pick up right where you left off - it only takes a moment to check out.
    </p>
    ${ctaButton(`${siteUrl}/cart`, "Return to my cart")}`;

  return deliver({
    to: cart.email,
    subject: "You left something in your cart 🛒",
    html: shell({
      storeName: settings.storeName,
      storeLegalName: settings.storeLegalName,
      storePhone: settings.storePhone,
      storeEmail: settings.storeEmail,
      heading: "Still thinking it over?",
      body,
    }),
    text:
      `You left items in your Eco Global Foods cart:\n` +
      items.map((i) => `- ${i.title} x${i.quantity}`).join("\n") +
      `\n\nReturn to your cart: ${siteUrl}/cart`,
  });
}

/** Notify the customer that their order has shipped, with courier + tracking. */
export async function sendShippingNotification(orderId: string): Promise<SendResult> {
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) return { sent: false, reason: "order not found" };
  if (!order.email) return { sent: false, reason: "no customer email" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecoglobalfoods.com";
  const first = order.customerName.split(" ")[0] || "there";
  const itemsLine = order.items
    .map((i) => `${escapeHtml(i.title)}${i.variantTitle ? ` · ${escapeHtml(i.variantTitle)}` : ""} × ${i.quantity}`)
    .join("<br/>");

  const trackingBlock = order.trackingNumber
    ? `<div style="margin-top:20px;padding:16px;background:#faf6ef;border-radius:12px;font-size:14px;color:#5e3052;">
         <strong style="color:#2a0f28;">Tracking</strong><br/>
         Courier: ${escapeHtml(order.courier || "Courier")}<br/>
         Tracking #: <strong style="color:#2a0f28;">${escapeHtml(order.trackingNumber)}</strong>
       </div>`
    : "";

  const body = `
    <p style="color:#2a0f28;font-size:15px;margin:0 0 16px;">
      Good news ${escapeHtml(first)} - your order #${order.orderNumber} is on its way! 🚚
    </p>
    <div style="padding:14px 16px;background:#f4fbef;border-radius:12px;font-size:14px;color:#2a0f28;">
      ${itemsLine}
    </div>
    ${trackingBlock}
    <div style="margin-top:20px;padding:16px;background:#faf6ef;border-radius:12px;font-size:13px;color:#5e3052;">
      <strong style="color:#2a0f28;">Delivering to</strong><br/>
      ${escapeHtml(order.customerName)}<br/>
      ${escapeHtml(order.address)}${order.city ? `, ${escapeHtml(order.city)}` : ""}<br/>
      ${escapeHtml(order.phone)}
    </div>
    ${ctaButton(`${siteUrl}/order/${order.orderNumber}`, "View your order")}`;

  return deliver({
    to: order.email,
    bcc: settings.storeEmail || undefined,
    subject: `Your Eco Global Foods order #${order.orderNumber} has shipped 🚚`,
    html: shell({
      storeName: settings.storeName,
      storeLegalName: settings.storeLegalName,
      storePhone: settings.storePhone,
      storeEmail: settings.storeEmail,
      heading: "On its way! 🚚",
      sub: `Order #${order.orderNumber}`,
      body,
    }),
    text:
      `Your order #${order.orderNumber} has shipped.\n` +
      (order.trackingNumber ? `Courier: ${order.courier}\nTracking #: ${order.trackingNumber}\n` : "") +
      `\nTrack: ${siteUrl}/order/${order.orderNumber}`,
  });
}

/** Send (or log) the order-confirmation email for a given order. */
export async function sendOrderConfirmation(orderId: string): Promise<SendResult> {
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) return { sent: false, reason: "order not found" };
  if (!order.email) return { sent: false, reason: "no customer email" };

  const payment = getPaymentMethod(order.paymentMethod)?.label ?? order.paymentMethod;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecoglobalfoods.com";

  const itemsRows = order.items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #ece0f7;color:#2a0f28;font-size:14px;">
          ${escapeHtml(it.title)}${it.variantTitle ? ` <span style="color:#9d68d2;">· ${escapeHtml(it.variantTitle)}</span>` : ""}
          <span style="color:#99628d;"> × ${it.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #ece0f7;text-align:right;color:#2a0f28;font-size:14px;font-weight:600;">
          ${formatPKR(it.total)}
        </td>
      </tr>`,
    )
    .join("");

  const html = `
  <div style="margin:0;padding:0;background:#faf6ef;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#19081a,#3b1538 45%,#233f18);border-radius:20px;padding:32px;text-align:center;color:#faf6ef;">
        <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#e7cf94;">${escapeHtml(settings.storeName)}</div>
        <div style="font-size:26px;font-weight:700;margin-top:8px;">Order confirmed 🎉</div>
        <div style="opacity:.8;margin-top:6px;font-size:14px;">Order #${order.orderNumber}</div>
      </div>

      <div style="background:#ffffff;border:1px solid #ece0f7;border-top:none;border-radius:0 0 20px 20px;margin-top:-4px;padding:28px;">
        <p style="color:#2a0f28;font-size:15px;margin:0 0 16px;">
          Hi ${escapeHtml(order.customerName.split(" ")[0] || "there")}, thank you for your order! We've received it and will be in touch shortly.
        </p>

        <table style="width:100%;border-collapse:collapse;">${itemsRows}</table>

        <table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:14px;color:#5e3052;">
          <tr><td style="padding:3px 0;">Subtotal</td><td style="padding:3px 0;text-align:right;color:#2a0f28;">${formatPKR(order.subtotal)}</td></tr>
          ${order.discount > 0 ? `<tr><td style="padding:3px 0;">Discount${order.discountCode ? ` (${escapeHtml(order.discountCode)})` : ""}</td><td style="padding:3px 0;text-align:right;color:#267e47;">− ${formatPKR(order.discount)}</td></tr>` : ""}
          <tr><td style="padding:3px 0;">Shipping</td><td style="padding:3px 0;text-align:right;color:#2a0f28;">${order.shipping === 0 ? "Free" : formatPKR(order.shipping)}</td></tr>
          <tr><td style="padding:10px 0 0;font-weight:700;color:#2a0f28;border-top:1px solid #ece0f7;">Total</td><td style="padding:10px 0 0;text-align:right;font-weight:700;color:#2a0f28;border-top:1px solid #ece0f7;">${formatPKR(order.total)}</td></tr>
        </table>

        <div style="margin-top:20px;padding:16px;background:#faf6ef;border-radius:12px;font-size:13px;color:#5e3052;">
          <strong style="color:#2a0f28;">Delivery</strong><br/>
          ${escapeHtml(order.customerName)}<br/>
          ${escapeHtml(order.address)}${order.city ? `, ${escapeHtml(order.city)}` : ""}<br/>
          ${escapeHtml(order.phone)}<br/>
          <span style="display:inline-block;margin-top:8px;color:#2a0f28;"><strong>Payment:</strong> ${escapeHtml(payment)}</span>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <a href="${siteUrl}/order/${order.orderNumber}" style="display:inline-block;background:linear-gradient(135deg,#3b1538,#233f18);color:#faf6ef;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:600;">View your order</a>
        </div>
      </div>

      <p style="text-align:center;color:#99628d;font-size:12px;margin-top:18px;">
        ${escapeHtml(settings.storeLegalName)} · ${escapeHtml(settings.storePhone)} · ${escapeHtml(settings.storeEmail)}
      </p>
    </div>
  </div>`;

  const text =
    `Order #${order.orderNumber} confirmed.\n\n` +
    order.items.map((i) => `- ${i.title} x${i.quantity}  ${formatPKR(i.total)}`).join("\n") +
    `\n\nTotal: ${formatPKR(order.total)}\nPayment: ${payment}\n` +
    `View: ${siteUrl}/order/${order.orderNumber}`;

  return deliver({
    to: order.email,
    bcc: settings.storeEmail || undefined,
    subject: `Your Eco Global Foods order #${order.orderNumber} 🌿`,
    html,
    text,
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
