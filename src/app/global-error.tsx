"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
          background: "#faf6ef",
          color: "#2a0f28",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div>
          <div style={{ fontSize: 56 }}>🌧️</div>
          <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>Something went wrong</h1>
          <p style={{ color: "#5e3052", maxWidth: 420, margin: "0 auto 24px" }}>
            We hit an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 600,
              color: "#faf6ef",
              background: "linear-gradient(135deg,#3b1538,#233f18)",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
