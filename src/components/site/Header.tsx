"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, ChevronDown, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { categories } from "@/data/categories";
import { HeaderSearch } from "@/components/site/HeaderSearch";

export interface HeaderNavItem {
  label: string;
  href: string;
  mega?: boolean;
}

const fallbackNav: HeaderNavItem[] = [
  { label: "Shop", href: "/shop", mega: true },
  { label: "Our Story", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header({ navLinks }: { navLinks?: HeaderNavItem[] }) {
  const nav = navLinks && navLinks.length > 0 ? navLinks : fallbackNav;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaLeft, setMegaLeft] = useState(0);
  const megaWrapRef = useRef<HTMLDivElement>(null);
  const { count, openCart } = useCart();
  const { count: wishCount } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Any nav item can be flagged Mega from the admin, so the 640px panel can be
   * triggered from an item near either end of the nav. Centring it on its
   * trigger would then push it past the screen edge, where body's
   * overflow-x-hidden silently clips it rather than showing a scrollbar.
   *
   * The offset is computed here rather than with `left-1/2 -translate-x-1/2`
   * because framer-motion writes an inline transform to animate y, which
   * overrides any transform-based centring. Staying on `left` sidesteps that.
   */
  useEffect(() => {
    if (!megaOpen) return;
    const update = () => {
      const el = megaWrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const width = Math.min(vw * 0.9, 640);
      const centred = (r.left + r.right) / 2 - width / 2;
      const clamped = Math.max(12, Math.min(centred, vw - 12 - width));
      setMegaLeft(clamped - r.left); // back to wrapper-relative
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [megaOpen]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(43,14,71,0.08)]"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center" aria-label="Eco Global Foods home">
          <Image
            src="/brand/logo-full.png"
            alt="Eco Global Foods"
            width={634}
            height={394}
            priority
            className={cn(
              "h-11 w-auto transition-transform group-hover:scale-105 sm:h-12",
              // subtle shadow so the transparent logo stays legible over the hero
              !scrolled && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]",
            )}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <div
              key={item.href}
              ref={item.mega ? megaWrapRef : undefined}
              className="relative"
              onMouseEnter={() => item.mega && setMegaOpen(true)}
              onMouseLeave={() => item.mega && setMegaOpen(false)}
            >
              <Link
                href={item.href}
                className="group relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-purple-900/80 transition-colors hover:text-purple-900"
              >
                {item.label}
                {item.mega && <ChevronDown className="h-3.5 w-3.5" />}
                <span className="absolute inset-x-4 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-green-500 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>

              {/* Mega menu */}
              {item.mega && (
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      style={{ left: megaLeft, width: "min(90vw, 640px)" }}
                      className="absolute top-full pt-3"
                    >
                      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-purple-100 bg-cream/95 p-3 shadow-xl backdrop-blur-xl sm:grid-cols-3">
                        {categories.map((c) => (
                          <Link
                            key={c.id}
                            href={`/category/${c.slug}`}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-purple-100/60"
                          >
                            <span className="text-xl">{c.emoji}</span>
                            <span className="flex flex-col">
                              <span className="text-sm font-medium text-purple-900">
                                {c.name}
                              </span>
                              <span className="text-[0.7rem] text-purple-900/50">
                                {c.tagline}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <HeaderSearch />
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative grid h-10 w-10 place-items-center rounded-full text-purple-900 transition-colors hover:bg-purple-100"
          >
            <Heart className="h-[1.15rem] w-[1.15rem]" />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[0.6rem] font-bold text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden h-10 w-10 place-items-center rounded-full text-purple-900 transition-colors hover:bg-purple-100 sm:grid"
          >
            <User className="h-[1.15rem] w-[1.15rem]" />
          </Link>
          <button
            onClick={openCart}
            aria-label="Cart"
            className="relative grid h-10 w-10 place-items-center rounded-full text-purple-900 transition-colors hover:bg-purple-100"
          >
            <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: [1.4, 1], opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-green-500 px-1 text-[0.6rem] font-bold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="ml-1 grid h-10 w-10 place-items-center rounded-full text-purple-900 transition-colors hover:bg-purple-100 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-purple-100 bg-cream/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-purple-900 transition-colors hover:bg-purple-100"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-1 border-t border-purple-100 pt-3">
                {categories.slice(0, 8).map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-purple-900/80 hover:bg-purple-100"
                  >
                    <span>{c.emoji}</span> {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
