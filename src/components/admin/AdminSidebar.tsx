"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Package,
  Boxes,
  FolderTree,
  Users,
  Star,
  Tag,
  BarChart3,
  Settings,
  Truck,
  FileText,
  ShoppingBag,
  Gift,
  Mail,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/site/BrandMark";

const nav = [
  { label: "Home", href: "/admin", icon: Home },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Abandoned carts", href: "/admin/abandoned", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Bundles", href: "/admin/bundles", icon: Gift },
  { label: "Collections", href: "/admin/collections", icon: FolderTree },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { label: "Campaigns", href: "/admin/campaigns", icon: Send },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Discounts", href: "/admin/discounts", icon: Tag },
  { label: "Shipping", href: "/admin/shipping", icon: Truck },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

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
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
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
