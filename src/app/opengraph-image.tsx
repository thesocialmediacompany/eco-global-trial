import { ImageResponse } from "next/og";

export const alt = "Eco Global Foods - Taste The Goodness";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function SiteOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "linear-gradient(135deg,#19081a,#3b1538 45%,#233f18)",
          color: "#faf6ef",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#e7cf94",
          }}
        >
          Eco Global Foods
        </div>
        <div style={{ fontSize: 86, fontWeight: 700 }}>Taste The Goodness 🌿</div>
        <div style={{ fontSize: 32, color: "#cdbfe0" }}>
          Natural food, made in Pakistan since 1999
        </div>
      </div>
    ),
    { ...size },
  );
}
