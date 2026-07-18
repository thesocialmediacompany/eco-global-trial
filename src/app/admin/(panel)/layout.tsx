import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { PwaRegister } from "@/components/admin/PwaRegister";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin - Eco Global Foods",
  robots: { index: false, follow: false },
  // Makes the admin installable to the home screen as an app (PWA).
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "EGF Admin", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#2b0e47",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);

  // App-shell layout: the shell is exactly the viewport height and does not
  // scroll — only <main> scrolls. That keeps the sidebar and topbar anchored by
  // construction, without relying on position:sticky (which the storefront
  // body's overflow-x-hidden can quietly break). print: overrides drop the
  // fixed height so a long packing slip prints in full instead of clipping.
  return (
    <div className="flex h-screen w-full overflow-hidden bg-cream-dark/40 print:block print:h-auto print:overflow-visible print:bg-white">
      <PwaRegister />
      <AdminSidebar role={session?.role} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden print:overflow-visible">
        <AdminTopbar userName={session?.name ?? "EGF Admin"} role={session?.role} />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
