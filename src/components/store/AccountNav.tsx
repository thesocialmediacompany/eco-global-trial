"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, User, MapPin, LogOut } from "lucide-react";
import { logoutCustomer } from "@/app/(store)/account/actions";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Orders", href: "/account", icon: Package },
  { label: "Profile", href: "/account/profile", icon: User },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "gradient-purple-green text-cream"
                : "border border-purple-200 text-purple-900 hover:bg-purple-50",
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </Link>
        );
      })}
      <form action={logoutCustomer} className="ml-auto">
        <button className="inline-flex items-center gap-2 rounded-full border border-purple-200 px-4 py-2 text-sm font-medium text-purple-900 hover:bg-purple-50">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </form>
    </div>
  );
}
