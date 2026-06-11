import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { total: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-purple-900">Customers</h1>
        <p className="mt-1 text-sm text-purple-900/60">{customers.length} customers</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100 text-left text-xs uppercase tracking-wide text-purple-900/50">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 text-right font-medium">Total spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const spent = c.orders.reduce((s, o) => s + o.total, 0);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-purple-50 last:border-0 hover:bg-cream/40"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="font-medium text-purple-900 hover:text-purple-700"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-purple-900/70">{c.email}</td>
                    <td className="px-5 py-3.5 text-purple-900/70">{c.city || " - "}</td>
                    <td className="px-5 py-3.5 text-purple-900/70">{c.orders.length}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-purple-900">
                      {formatPKR(spent)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
