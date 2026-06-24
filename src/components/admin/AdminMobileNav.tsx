"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/site/BrandMark";
import { navForRole, isActiveAdminRoute } from "@/components/admin/admin-nav";
import { logout } from "@/app/admin/login/actions";

/** Hamburger + slide-out admin navigation for small screens (sidebar is desktop-only). */
export function AdminMobileNav({ role }: { role?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const adminNav = navForRole(role);

  // Portal target only exists on the client.
  useEffect(() => setMounted(true), []);

  // The drawer is rendered into <body> (not inside the backdrop-blurred top bar),
  // otherwise the header becomes the containing block for the `fixed` drawer and
  // its full-height sizing collapses.
  const drawer = (
    <AnimatePresence>
      {open && (
        <>
            <motion.div
              className="fixed inset-0 z-50 bg-purple-950/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 flex h-full w-72 max-w-[82vw] flex-col gradient-purple text-cream/90"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Brand + close */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5"
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
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-8 w-8 place-items-center rounded-lg text-cream/70 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                {adminNav.map((item) => {
                  const active = isActiveAdminRoute(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/15 text-cream"
                          : "text-cream/70 hover:bg-white/10 hover:text-cream",
                      )}
                    >
                      <item.icon className="h-[1.15rem] w-[1.15rem]" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="space-y-1 border-t border-white/10 p-3">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cream/70 hover:bg-white/10 hover:text-cream"
                >
                  <ExternalLink className="h-[1.15rem] w-[1.15rem]" /> View storefront
                </Link>
                <form action={logout}>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-rose-200 hover:bg-white/10">
                    <LogOut className="h-[1.15rem] w-[1.15rem]" /> Log out
                  </button>
                </form>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-9 w-9 place-items-center rounded-lg text-purple-900/70 transition-colors hover:bg-purple-50 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
