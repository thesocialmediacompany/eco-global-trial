"use client";

import { Printer } from "lucide-react";

/** Triggers the browser print dialog. Hidden when printing (print:hidden). */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream print:hidden"
    >
      <Printer className="h-4 w-4" /> Print
    </button>
  );
}
