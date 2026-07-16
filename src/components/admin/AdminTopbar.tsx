"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, ChevronDown, LogOut, ExternalLink } from "lucide-react";
import { logout } from "@/app/admin/login/actions";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export function AdminTopbar({
  userName = "EGF Admin",
  role,
}: {
  userName?: string;
  role?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-purple-100 bg-white/90 px-4 backdrop-blur lg:px-6">
      <AdminMobileNav role={role} />
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-900/40" />
        <input
          type="search"
          placeholder="Search products, customers, orders…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full rounded-lg border border-purple-100 bg-cream/60 py-2 pl-9 pr-3 text-sm text-purple-900 outline-none transition focus:border-purple-300 focus:bg-white"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-lg text-purple-900/70 transition-colors hover:bg-purple-50"
        >
          <Bell className="h-[1.15rem] w-[1.15rem]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-green-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-purple-50"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full gradient-purple-green text-xs font-bold text-cream">
              {initials}
            </span>
            <span className="hidden text-sm font-medium text-purple-900 sm:block">
              {userName}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-purple-900/50 sm:block" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-lg">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-900 hover:bg-purple-50"
                >
                  <ExternalLink className="h-4 w-4 text-purple-900/50" /> View storefront
                </Link>
                <form action={logout}>
                  <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}