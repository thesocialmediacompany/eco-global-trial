"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function TrackOrder() {
  const router = useRouter();
  const [num, setNum] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = num.replace(/\D/g, "");
        if (n) router.push(`/order/${n}`);
      }}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-900/40" />
        <input
          value={num}
          onChange={(e) => setNum(e.target.value)}
          placeholder="Order number, e.g. 1001"
          className="w-full rounded-full border border-purple-200 bg-white py-3.5 pl-12 pr-4 text-sm text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
        />
      </div>
      <button
        type="submit"
        className="rounded-full gradient-purple-green px-6 py-3.5 text-sm font-semibold text-cream"
      >
        Track
      </button>
    </form>
  );
}
