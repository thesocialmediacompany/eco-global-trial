import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GA4 is configured via the `ga4MeasurementId` DEFAULT in settings-defaults.ts.
 * We deliberately remove any DB override so the default (G-KQMBZ1CQJY) applies
 * and there is a single source of truth. Admin can re-add an override anytime.
 */
async function wake() {
  for (let i = 0; i < 8; i++) {
    try { await prisma.$queryRaw`select 1`; return; }
    catch { console.log("waking Neon...", i); await new Promise((r) => setTimeout(r, 5000)); }
  }
}

async function main() {
  await wake();
  const res = await prisma.setting.deleteMany({ where: { key: "ga4MeasurementId" } });
  console.log("removed ga4MeasurementId DB override rows:", res.count);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
