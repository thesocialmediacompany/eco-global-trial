import Link from "next/link";
import { ChevronLeft, Trash2, KeyRound, UserPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin-guard";
import { addStaff, updateStaffRole, resetStaffPassword, deleteStaff } from "./actions";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export default async function StaffPage() {
  await requireOwner();
  const staff = await prisma.staffUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/settings"
          className="grid h-9 w-9 place-items-center rounded-lg border border-purple-100 bg-white text-purple-900/70 hover:bg-purple-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-2xl font-semibold text-purple-900">Staff accounts</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* list */}
        <div className="space-y-3">
          {staff.map((u) => (
            <div key={u.id} className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full gradient-purple-green text-xs font-bold text-cream">
                    {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium text-purple-900">{u.name}</p>
                    <p className="text-xs text-purple-900/50">
                      {u.email} · joined {formatDate(u.createdAt)}
                    </p>
                  </div>
                </div>
                {staff.length > 1 && (
                  <form action={deleteStaff.bind(null, u.id)}>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-lg text-purple-900/40 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete staff"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <form action={updateStaffRole.bind(null, u.id)} className="flex items-end gap-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-purple-900/60">Role</span>
                    <select name="role" defaultValue={u.role} className={input}>
                      <option value="owner">Owner</option>
                      <option value="staff">Staff</option>
                    </select>
                  </label>
                  <button className="rounded-lg border border-purple-200 px-3 py-2 text-sm font-medium text-purple-900 hover:bg-purple-50">
                    Update
                  </button>
                </form>

                <form action={resetStaffPassword.bind(null, u.id)} className="flex items-end gap-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-purple-900/60">New password</span>
                    <input name="password" type="password" minLength={6} placeholder="min 6 chars" className={input} />
                  </label>
                  <button className="inline-flex items-center gap-1 rounded-lg border border-purple-200 px-3 py-2 text-sm font-medium text-purple-900 hover:bg-purple-50">
                    <KeyRound className="h-4 w-4" /> Reset
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {/* add */}
        <form action={addStaff} className="h-fit space-y-3 rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-purple-900">
            <UserPlus className="h-4 w-4 text-green-600" /> Add staff
          </h2>
          <input name="name" required placeholder="Full name" className={input} />
          <input name="email" type="email" required placeholder="Email" className={input} />
          <input name="password" type="password" required minLength={6} placeholder="Password (min 6)" className={input} />
          <select name="role" defaultValue="staff" className={input}>
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
          <button className="w-full rounded-lg gradient-purple-green py-2.5 text-sm font-semibold text-cream">
            Add staff member
          </button>
        </form>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";
