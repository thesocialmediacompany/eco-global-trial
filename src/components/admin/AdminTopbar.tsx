"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, ExternalLink } from "lucide-react";
import { logout } from "@/app/admin/login/actions";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminSearchBox } from "@/components/admin/AdminSearchBox";
import { PushToggle } from "@/components/admin/PushToggle";
import { RefreshButton } from "@/components/admin/RefreshButton";

export function AdminTopbar({
  userName = "EGF Admin",
  role,
}: {
  userName?: string;
  role?: string;
}) {
  const [open, setOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-purple-100 bg-white/90 px-4 backdrop-blur lg:px-6 print:hidden">
      <AdminMobileNav role={role} />
      <AdminSearchBox />

      <div className="ml-auto flex items-center gap-2">
        <RefreshButton />
        <PushToggle />

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
