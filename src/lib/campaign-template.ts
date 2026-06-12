import { formatPKR } from "@/lib/utils";

/**
 * Pure renderer for a designed newsletter campaign email. No server-only deps,
 * so the same function powers the actual send (server) and the live preview
 * (client iframe). Email-client-friendly: inline styles + tables.
 */

export interface CampaignProduct {
  title: string;
  price: number;
  imageUrl?: string | null;
  url: string;
}

export interface CampaignData {
  storeName: string;
  storeLegalName: string;
  storePhone: string;
  storeEmail: string;
  subject: string;
  preheader?: string;
  bannerImage?: string;
  headline?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  products?: CampaignProduct[];
  unsubscribeUrl: string;
}

function esc(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function productGrid(products: CampaignProduct[]) {
  if (!products.length) return "";
  const arr = products.slice(0, 4);
  const cellArr = arr.map(
    (p) => `
      <td width="50%" valign="top" style="padding:8px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ece0f7;border-radius:14px;overflow:hidden;">
          <tr><td style="background:#faf6ef;text-align:center;padding:0;">
            ${
              p.imageUrl
                ? `<img src="${esc(p.imageUrl)}" alt="${esc(p.title)}" width="240" style="display:block;width:100%;max-width:240px;height:auto;margin:0 auto;" />`
                : `<div style="height:140px;line-height:140px;font-size:40px;">🌿</div>`
            }
          </td></tr>
          <tr><td style="padding:12px 14px;">
            <div style="font-size:14px;font-weight:600;color:#2a0f28;line-height:1.3;">${esc(p.title)}</div>
            <div style="font-size:13px;color:#5e3052;margin-top:4px;">${esc(formatPKR(p.price))}</div>
            <a href="${esc(p.url)}" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:600;color:#267e47;text-decoration:none;">Shop now &rarr;</a>
          </td></tr>
        </table>
      </td>`,
  );
  const realRows: string[] = [];
  for (let i = 0; i < cellArr.length; i += 2) {
    realRows.push(`<tr>${cellArr[i] ?? ""}${cellArr[i + 1] ?? ""}</tr>`);
  }
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">${realRows.join("")}</table>`;
}

export function renderCampaignEmail(d: CampaignData): { html: string; text: string } {
  const paragraphs = d.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="color:#2a0f28;font-size:15px;line-height:1.65;margin:0 0 14px;">${esc(p).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");

  const cta =
    d.ctaLabel && d.ctaUrl
      ? `<div style="text-align:center;margin-top:24px;">
           <a href="${esc(d.ctaUrl)}" style="display:inline-block;background:linear-gradient(135deg,#3b1538,#233f18);color:#faf6ef;text-decoration:none;padding:13px 30px;border-radius:999px;font-size:14px;font-weight:600;">${esc(d.ctaLabel)}</a>
         </div>`
      : "";

  const banner = d.bannerImage
    ? `<img src="${esc(d.bannerImage)}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:auto;border-radius:16px;margin:0 0 20px;" />`
    : "";

  const headline = d.headline
    ? `<h1 style="font-size:24px;font-weight:700;color:#2a0f28;margin:0 0 14px;">${esc(d.headline)}</h1>`
    : "";

  const products = d.products?.length ? productGrid(d.products) : "";

  const html = `
  <div style="margin:0;padding:0;background:#faf6ef;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(d.preheader || "")}</span>
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#19081a,#3b1538 45%,#233f18);border-radius:20px;padding:24px;text-align:center;color:#faf6ef;">
        <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#e7cf94;">${esc(d.storeName)}</div>
      </div>
      <div style="background:#ffffff;border:1px solid #ece0f7;border-top:none;border-radius:0 0 20px 20px;margin-top:-4px;padding:28px;">
        ${banner}
        ${headline}
        ${paragraphs}
        ${cta}
        ${products}
        <p style="margin:26px 0 0;border-top:1px solid #ece0f7;padding-top:14px;text-align:center;color:#99628d;font-size:12px;">
          You're receiving this because you subscribed to ${esc(d.storeName)}.<br/>
          <a href="${esc(d.unsubscribeUrl)}" style="color:#99628d;text-decoration:underline;">Unsubscribe</a>
        </p>
      </div>
      <p style="text-align:center;color:#99628d;font-size:12px;margin-top:18px;">
        ${esc(d.storeLegalName)} · ${esc(d.storePhone)} · ${esc(d.storeEmail)}
      </p>
    </div>
  </div>`;

  const text =
    (d.headline ? `${d.headline}\n\n` : "") +
    `${d.body}\n\n` +
    (d.ctaLabel && d.ctaUrl ? `${d.ctaLabel}: ${d.ctaUrl}\n\n` : "") +
    (d.products?.length ? d.products.map((p) => `- ${p.title} ${formatPKR(p.price)}: ${p.url}`).join("\n") + "\n\n" : "") +
    `Unsubscribe: ${d.unsubscribeUrl}`;

  return { html, text };
}
