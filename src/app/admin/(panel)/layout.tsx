import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin - Eco Global Foods",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);

  return (
    <div className="flex min-h-screen w-full bg-cream-dark/40">
      <AdminSidebar role={session?.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar userName={session?.name ?? "EGF Admin"} role={session?.role} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
