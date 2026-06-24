"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/site/BrandMark";
import { navForRole, isActiveAdminRoute } from "@/components/admin/admin-nav";

export function AdminSidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const adminNav = navForRole(role);

  return (
    <aside className="hidden w-60 shrink-0 flex-col gradient-purple text-cream/90 lg:flex">
      {/* Brand */}
      <Link
        href="/admin"
        className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4"
      >
        <BrandMark className="h-9 w-9" rounded />
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-semibold text-cream">
            Eco Global
          </span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-green-300">
            Admin
          </span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {adminNav.map((item) => {
          const active = isActiveAdminRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/15 text-cream"
                  : "text-cream/70 hover:bg-white/8 hover:text-cream",
              )}
            >
              <item.icon className="h-[1.15rem] w-[1.15rem]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-cream/60 transition-colors hover:text-cream"
        >
          ← View storefront
        </Link>
      </div>
    </aside>
  );
}
