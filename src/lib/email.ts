import "server-only";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import type { StoreSettings } from "@/lib/settings-defaults";
import { getPaymentMethod } from "@/lib/payments";
import { renderCampaignEmail, type CampaignProduct } from "@/lib/campaign-template";

/**
 * Transactional + marketing email. Reads SMTP config from store Settings (so
 * the team can connect a mailbox from the admin) and falls back to SMTP_* env
 * vars. When nothing is configured it logs to the server console (dev fallback)
 * so the pipeline stays testable without credentials.
 */

function buildTransport(s: StoreSettings) {
  const host = s.smtpHost || process.env.SMTP_HOST;
  const user = s.smtpUser || process.env.SMTP_USER;
  const pass = s.smtpPass || process.env.SMTP_PASS;
  const port = Number(s.smtpPort || process.env.SMTP_PORT) || 587;
 
 console.log("SMTP_USER:", process.env.SMTP_USER);  
 console.log("SMTP_PASS length:", process.env.SMTP_PASS?.length);
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,  
    port,  
    secure: port === 465,        // true only for 465  
    requireTLS: port === 587,    // force STARTTLS on 587  
    auth: { user, pass },
  });
}

function fromAddress(s: StoreSettings) {
  const email = s.smtpFromEmail || s.smtpUser || process.env.SMTP_USER;
  const name = s.smtpFromName || s.storeName || "Eco Global Foods";
  if (process.env.SMTP_FROM && !s.smtpFromEmail) return process.env.SMTP_FROM;
  return email ? `${name} <${email}>` : "Eco Global Foods <support@ecoglobalfoods.com>";
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
  const s = await getSettings();
  const transport = buildTransport(s);

  if (!transport) {
    console.log(
      `\n📧  [email:dev-fallback] No SMTP configured - would send:\n` +
        `    to: ${opts.to}${opts.bcc ? ` (bcc ${opts.bcc})` : ""}\n` +
        `    subject: ${opts.subject}\n`,
    );
    return { sent: false, reason: "SMTP not configured" };
  }

  await transport.sendMail({
    from: fromAddress(s),
    to: opts.to,
    bcc: opts.bcc,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  return { sent: true };
}

/** Send a simple test email to verify the SMTP connection from admin Settings. */
export async function sendTestEmail(to: string): Promise<SendResult> {
  const s = await getSettings();
  const body = `
    <p style="color:#2a0f28;font-size:15px;margin:0 0 12px;">
      This is a test email from your Eco Global Foods admin. 🎉
    </p>
    <p style="color:#5e3052;font-size:14px;margin:0;">
      If you're reading this, your email sending is connected and working.
    </p>`;
  return deliver({
    to,
    subject: "Test email from Eco Global Foods",
    html: shell({
      storeName: s.storeName,
      storeLegalName: s.storeLegalName,
      storePhone: s.storePhone,
      storeEmail: s.storeEmail,
      heading: "Email connected ✅",
      body,
    }),
    text: "Test email from Eco Global Foods admin. Your email sending is working.",
  });
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

/** Email a staff member their one-time admin login code. */
export async function sendAdminOtp(
  email: string,
  code: string,
  name?: string,
): Promise<SendResult> {
  const settings = await getSettings();
  const first = (name ?? "").split(" ")[0] || "there";
  const body = `
    <p style="color:#2a0f28;font-size:15px;margin:0 0 16px;">
      Hi ${escapeHtml(first)}, use this code to finish signing in to the ${escapeHtml(settings.storeName)} admin. It expires in 10 minutes.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;background:#f4fbef;border:1px solid #d9edcb;border-radius:14px;padding:16px 28px;font-size:34px;font-weight:700;letter-spacing:10px;color:#233f18;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
        ${escapeHtml(code)}
      </div>
    </div>
    <p style="color:#99628d;font-size:13px;margin:0;">
      If you didn't try to sign in, someone may have your password — change it and let the team know. Do not share this code with anyone.
    </p>`;

  return deliver({
    to: email,
    subject: `${code} is your admin login code`,
    html: shell({
      storeName: settings.storeName,
      storeLegalName: settings.storeLegalName,
      storePhone: settings.storePhone,
      storeEmail: settings.storeEmail,
      heading: "Your login code 🔐",
      body,
    }),
    text:
      `Your ${settings.storeName} admin login code is ${code}. It expires in 10 minutes.\n\n` +
      `If you didn't try to sign in, change your password and tell the team. Never share this code.`,
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
  preheader?: string;
  bannerImage?: string;
  headline?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  products?: CampaignProduct[];
  unsubscribeUrl: string;
}): Promise<SendResult> {
  const settings = await getSettings();

  const { html, text } = renderCampaignEmail({
    storeName: settings.storeName,
    storeLegalName: settings.storeLegalName,
    storePhone: settings.storePhone,
    storeEmail: settings.storeEmail,
    subject: opts.subject,
    preheader: opts.preheader,
    bannerImage: opts.bannerImage,
    headline: opts.headline,
    body: opts.body,
    ctaLabel: opts.ctaLabel,
    ctaUrl: opts.ctaUrl,
    products: opts.products,
    unsubscribeUrl: opts.unsubscribeUrl,
  });

  return deliver({ to: opts.to, subject: opts.subject, html, text });
}

/**
 * Nudge a shopper who left items in their cart to come back and finish.
 *
 * `stage` is which nudge this is in the sequence. The second is worded
 * differently on purpose: the same message twice reads as a retry rather than
 * a follow-up, and it leans on cash-on-delivery, which is the objection most
 * likely to have stopped a first-time shopper here.
 */
export async function sendAbandonedRecovery(
  abandonedId: string,
  stage: 1 | 2 = 1,
): Promise<SendResult> {
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

  const opening =
    stage === 1
      ? `Hi ${escapeHtml(first)}, you left some good food in your cart. We saved it for you 🛒`
      : `Hi ${escapeHtml(first)}, your cart is still here. We'll hold it a little longer in case you'd like it.`;

  const closing =
    stage === 1
      ? "Pick up right where you left off - it only takes a moment to check out."
      : "No payment up front: pay cash when it arrives at your door, anywhere in Pakistan.";

  const body = `
    <p style="color:#2a0f28;font-size:15px;margin:0 0 16px;">${opening}</p>
    ${itemsLine ? `<div style="padding:14px 16px;background:#f4fbef;border-radius:12px;font-size:14px;color:#2a0f28;">${itemsLine}</div>` : ""}
    <p style="color:#5e3052;font-size:14px;margin:16px 0 0;">${closing}</p>
    ${ctaButton(`${siteUrl}/cart`, "Return to my cart")}`;

  return deliver({
    to: cart.email,
    subject:
      stage === 1
        ? "You left something in your cart 🛒"
        : "Your cart is still waiting 🌿",
    html: shell({
      storeName: settings.storeName,
      storeLegalName: settings.storeLegalName,
      storePhone: settings.storePhone,
      storeEmail: settings.storeEmail,
      heading: stage === 1 ? "Still thinking it over?" : "Your cart is still waiting",
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

/** Where staff order alerts go: the dedicated address, else the store email. */
async function notifyRecipient(): Promise<string> {
  const s = await getSettings();
  return (s.orderNotifyEmail || s.storeEmail || "").trim();
}

/**
 * Alert staff that a new order came in. Internal-facing: worded and subjected
 * for the team, not the customer, so it reads as an action item rather than
 * getting lost among the customer's own confirmation copy.
 */
export async function sendNewOrderStaffAlert(orderId: string): Promise<SendResult> {
  const [order, settings, to] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId }, include: { items: true } }),
    getSettings(),
    notifyRecipient(),
  ]);
  if (!order) return { sent: false, reason: "order not found" };
  if (!to) return { sent: false, reason: "no notify recipient configured" };

  const payment = getPaymentMethod(order.paymentMethod)?.label ?? order.paymentMethod;
  const paid = order.paymentStatus === "paid";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecoglobalfoods.com";
  const units = order.items.reduce((s, i) => s + i.quantity, 0);

  const itemsRows = order.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #ece0f7;color:#2a0f28;font-size:14px;">
          ${escapeHtml(it.title)}${it.variantTitle ? ` <span style="color:#9d68d2;">· ${escapeHtml(it.variantTitle)}</span>` : ""}
          <span style="color:#99628d;"> × ${it.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #ece0f7;text-align:right;color:#2a0f28;font-size:14px;">${formatPKR(it.total)}</td>
      </tr>`,
    )
    .join("");

  const html = `
  <div style="margin:0;padding:0;background:#faf6ef;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #ece0f7;border-radius:16px;padding:24px;">
        <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#9d68d2;">New order</div>
        <div style="font-size:24px;font-weight:700;color:#2a0f28;margin-top:4px;">#${order.orderNumber} · ${formatPKR(order.total)}</div>
        <div style="margin-top:6px;">
          <span style="display:inline-block;background:${paid ? "#e7f6ec" : "#fdf0da"};color:${paid ? "#267e47" : "#9a6a15"};font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;">
            ${paid ? "Paid" : "Collect on delivery"} · ${escapeHtml(payment)}
          </span>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-top:18px;">${itemsRows}</table>
        <div style="text-align:right;font-size:13px;color:#5e3052;margin-top:8px;">${units} item${units === 1 ? "" : "s"}</div>

        <div style="margin-top:18px;padding:14px;background:#faf6ef;border-radius:12px;font-size:13px;color:#2a0f28;line-height:1.6;">
          <strong>${escapeHtml(order.customerName)}</strong><br/>
          ${escapeHtml(order.phone)}${order.email ? ` · ${escapeHtml(order.email)}` : ""}<br/>
          ${escapeHtml(order.address)}${order.city ? `, ${escapeHtml(order.city)}` : ""}
        </div>

        <div style="text-align:center;margin-top:22px;">
          <a href="${siteUrl}/admin/orders/${order.id}" style="display:inline-block;background:linear-gradient(135deg,#3b1538,#233f18);color:#faf6ef;text-decoration:none;padding:11px 26px;border-radius:999px;font-size:14px;font-weight:600;">Open in dashboard</a>
        </div>
      </div>
    </div>
  </div>`;

  const text =
    `New order #${order.orderNumber} — ${formatPKR(order.total)} (${paid ? "Paid" : "COD"}, ${payment})\n\n` +
    `${order.customerName} · ${order.phone}\n${order.address}${order.city ? ", " + order.city : ""}\n\n` +
    order.items.map((i) => `- ${i.title} x${i.quantity}  ${formatPKR(i.total)}`).join("\n") +
    `\n\nOpen: ${siteUrl}/admin/orders/${order.id}`;

  return deliver({
    to,
    subject: `🆕 New order #${order.orderNumber} — ${formatPKR(order.total)}${paid ? "" : " (COD)"}`,
    html,
    text,
  });
}

/**
 * A once-a-day digest of the previous full day's orders. Sent by the cron so
 * the team gets a pulse even on days no one watches the dashboard.
 */
export async function sendDailyOrderSummary(now = new Date()): Promise<SendResult> {
  const to = await notifyRecipient();
  if (!to) return { sent: false, reason: "no notify recipient configured" };

  // Yesterday, bounded by Pakistan midnight — computed against a fixed +5h
  // offset (Pakistan has no DST) so it's the same window whether this runs on
  // the UTC Lambda or a local machine. setHours() alone would follow the
  // server's timezone and mislabel orders on Lambda.
  const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
  const shifted = new Date(now.getTime() + PKT_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0); // Pakistan midnight today, in shifted fields
  const end = new Date(shifted.getTime() - PKT_OFFSET_MS); // real UTC instant
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      where: { isDraft: false, createdAt: { gte: start, lt: end } },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { items: true } } },
    }),
    getSettings(),
  ]);

  const dayLabel = new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(start);

  const total = orders.reduce((s, o) => s + o.total, 0);
  const paidTotal = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);
  const codCount = orders.filter((o) => o.paymentStatus !== "paid").length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ecoglobalfoods.com";

  const rows =
    orders
      .map(
        (o) => `
      <tr>
        <td style="padding:7px 0;border-bottom:1px solid #ece0f7;font-size:13px;color:#2a0f28;">#${o.orderNumber} <span style="color:#99628d;">· ${escapeHtml(o.customerName)}</span></td>
        <td style="padding:7px 0;border-bottom:1px solid #ece0f7;text-align:right;font-size:13px;color:#2a0f28;">${formatPKR(o.total)}</td>
      </tr>`,
      )
      .join("") ||
    `<tr><td style="padding:12px 0;color:#99628d;font-size:14px;">No orders placed.</td></tr>`;

  const html = `
  <div style="margin:0;padding:0;background:#faf6ef;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #ece0f7;border-radius:16px;padding:24px;">
        <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#9d68d2;">Daily summary</div>
        <div style="font-size:20px;font-weight:700;color:#2a0f28;margin-top:4px;">${escapeHtml(dayLabel)}</div>

        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr>
            <td style="padding:12px;background:#faf6ef;border-radius:12px;text-align:center;">
              <div style="font-size:22px;font-weight:700;color:#2a0f28;">${orders.length}</div>
              <div style="font-size:12px;color:#99628d;">orders</div>
            </td>
            <td style="width:10px;"></td>
            <td style="padding:12px;background:#faf6ef;border-radius:12px;text-align:center;">
              <div style="font-size:22px;font-weight:700;color:#2a0f28;">${formatPKR(total)}</div>
              <div style="font-size:12px;color:#99628d;">total value</div>
            </td>
          </tr>
        </table>
        <div style="font-size:13px;color:#5e3052;margin-top:10px;">
          ${formatPKR(paidTotal)} already paid · ${codCount} to collect on delivery
        </div>

        <table style="width:100%;border-collapse:collapse;margin-top:18px;">${rows}</table>

        <div style="text-align:center;margin-top:22px;">
          <a href="${siteUrl}/admin/orders" style="display:inline-block;background:linear-gradient(135deg,#3b1538,#233f18);color:#faf6ef;text-decoration:none;padding:11px 26px;border-radius:999px;font-size:14px;font-weight:600;">View all orders</a>
        </div>
      </div>
      <p style="text-align:center;color:#99628d;font-size:12px;margin-top:16px;">${escapeHtml(settings.storeName)} · daily order summary</p>
    </div>
  </div>`;

  const text =
    `Daily summary — ${dayLabel}\n\n${orders.length} orders · ${formatPKR(total)} total\n` +
    `${formatPKR(paidTotal)} paid · ${codCount} COD\n\n` +
    orders.map((o) => `- #${o.orderNumber} ${o.customerName}  ${formatPKR(o.total)}`).join("\n") +
    `\n\n${siteUrl}/admin/orders`;

  return deliver({
    to,
    subject: `📊 ${orders.length} order${orders.length === 1 ? "" : "s"} on ${dayLabel} — ${formatPKR(total)}`,
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
