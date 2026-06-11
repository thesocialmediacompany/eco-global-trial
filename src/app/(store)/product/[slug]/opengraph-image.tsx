import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/products";
import { formatPKR } from "@/lib/utils";

export const runtime = "nodejs";
export const alt = "Eco Global Foods product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProductOgImage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  const name = product?.name ?? "Eco Global Foods";
  const tagline = product?.tagline ?? "Taste The Goodness";
  const price = product ? formatPKR(product.price) : "";
  const emoji = product?.emoji ?? "🌿";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg,#19081a,#3b1538 45%,#233f18)",
          color: "#faf6ef",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#e7cf94",
          }}
        >
          Eco Global Foods
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 200,
              height: 200,
              borderRadius: 40,
              background: "rgba(250,246,239,0.08)",
              fontSize: 120,
            }}
          >
            {emoji}
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
            <div style={{ fontSize: 30, marginTop: 16, color: "#cdbfe0" }}>{tagline}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {price && (
            <div
              style={{
                display: "flex",
                fontSize: 44,
                fontWeight: 700,
                background: "rgba(250,246,239,0.12)",
                padding: "14px 32px",
                borderRadius: 999,
              }}
            >
              {price}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 28, color: "#e7cf94" }}>
            ecoglobalfoods.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
