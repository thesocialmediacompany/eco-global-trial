// scripts/migrate-shopify-csv.ts
// Dry run:  npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/migrate-shopify-csv.ts --dry-run
// Live run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/migrate-shopify-csv.ts
// Rollback: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/migrate-shopify-csv.ts rollback --confirm

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('\n🧪 DRY RUN MODE — no data will be written\n');

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function toInt(val: string | undefined | null): number {
  return Math.round(parseFloat(val || '0') || 0);
}
function mapPaymentStatus(financial: string | null): string {
  if (!financial)             return 'pending';
  if (financial === 'paid')   return 'paid';
  if (financial === 'voided') return 'refunded';
  return 'pending';
}
function mapFulfillmentStatus(fulfillment: string | null, cancelledAt: string | null): string {
  if (cancelledAt)                 return 'cancelled';
  if (fulfillment === 'fulfilled') return 'fulfilled';
  return 'unfulfilled';
}
function mapPaymentMethod(method: string | null): string {
  if (!method) return 'cod';
  const m = method.toLowerCase();
  if (m.includes('bank'))               return 'bank';
  if (m.includes('cod') || m.includes('cash')) return 'cod';
  return 'cod';
}

// ─── 1. MIGRATE CUSTOMERS ────────────────────────────────────────────────────
async function migrateCustomers() {
  console.log('👥 Migrating Customers...');

  const csvPath = path.join(__dirname, '../data/customers_export.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`  ❌ File not found: ${csvPath}`);
    process.exit(1);
  }

  const raw  = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];

  let willCreate = 0, willSkip = 0;
  const errors: string[] = [];

  for (const r of rows) {
    const email = r['Email']?.trim();
    if (!email) { willSkip++; continue; }

    const firstName = r['First Name']?.trim() || '';
    const lastName  = r['Last Name']?.trim()  || '';
    let   name      = `${firstName} ${lastName}`.trim();
    if (!name) name = email.split('@')[0];

    if (DRY_RUN) {
      if (!email.includes('@')) errors.push(`Invalid email: "${email}"`);
      if (!name)                errors.push(`Customer ${email}: no name`);
      willCreate++;
      continue;
    }

    try {
      await prisma.customer.upsert({
        where:  { email },
        update: {},
        create: {
          email,
          name,
          phone:        r['Default Address Phone']?.trim() || '',
          address:      r['Default Address Address1']?.trim() || '',
          city:         r['Default Address City']?.trim() || '',
          passwordHash: '',
        },
      });
      willCreate++;
    } catch (e: any) {
      errors.push(`Customer ${email}: ${e.message}`);
    }
  }

  console.log(`  ${DRY_RUN ? '📋 Would create' : '✅ Upserted'}: ${willCreate} | ⏭️  Skipped: ${willSkip}`);
  if (errors.length) {
    console.log(`  ⚠️  Issues (${errors.length}):`);
    errors.slice(0, 20).forEach(e => console.log(`    - ${e}`));
  } else {
    console.log('  ✅ No issues found');
  }

  return errors;
}

// ─── 2. MIGRATE ORDERS ───────────────────────────────────────────────────────
async function migrateOrders() {
  console.log('\n📦 Migrating Orders...');

  const csvPath = path.join(__dirname, '../data/orders_export_1.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`  ❌ File not found: ${csvPath}`);
    process.exit(1);
  }

  const raw  = fs.readFileSync(csvPath, 'utf-8');
  const rows: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // Group rows by order Name (multi-line items share the same Name)
  const orderMap = new Map<string, Record<string, string>[]>();
  for (const r of rows) {
    const name = r['Name'];
    if (!orderMap.has(name)) orderMap.set(name, []);
    orderMap.get(name)!.push(r);
  }

  console.log(`  Found ${orderMap.size} unique orders across ${rows.length} rows`);

  let willCreate = 0, willSkip = 0;
  const errors: string[] = [];

  for (const [name, lineRows] of orderMap) {
    const first    = lineRows[0];
    const orderNum = parseInt(name.replace('#', ''), 10);

    if (isNaN(orderNum)) {
      errors.push(`Cannot parse order number from: "${name}"`);
      willSkip++;
      continue;
    }

    if (DRY_RUN) {
      const total = toInt(first['Total']);
      const items = lineRows.filter(r => r['Lineitem name']?.trim());
      if (total <= 0)      errors.push(`Order ${name}: total is PKR 0`);
      if (items.length === 0) errors.push(`Order ${name}: no line items`);
      if (!first['Email']?.trim()) errors.push(`Order ${name}: missing email`);
      willCreate++;
      continue;
    }

    try {
      const exists = await prisma.order.findUnique({ where: { orderNumber: orderNum } });
      if (exists) { willSkip++; continue; }

      const email    = first['Email']?.trim() || '';
      const customer = email
        ? await prisma.customer.findUnique({ where: { email } })
        : null;

      const items = lineRows
        .filter(r => r['Lineitem name']?.trim())
        .map(r => ({
          title:        r['Lineitem name']?.trim() || 'Unknown',
          variantTitle: '',
          quantity:     parseInt(r['Lineitem quantity'] || '1', 10),
          price:        toInt(r['Lineitem price']),
          total:        toInt(r['Lineitem price']) * parseInt(r['Lineitem quantity'] || '1', 10),
        }));

      await prisma.order.create({
        data: {
          orderNumber:       orderNum,
          customerId:        customer?.id ?? null,
          customerName:      first['Billing Name']?.trim()  || customer?.name || '',
          email,
          phone:             first['Billing Phone']?.trim() || first['Phone']?.trim() || '',
          address:           first['Billing Address1']?.trim() || '',
          city:              first['Billing City']?.trim()    || '',
          subtotal:          toInt(first['Subtotal']),
          shipping:          toInt(first['Shipping']),
          discount:          toInt(first['Discount Amount']),
          discountCode:      first['Discount Code']?.trim()  || '',
          total:             toInt(first['Total']),
          paymentMethod:     mapPaymentMethod(first['Payment Method']),
          paymentStatus:     mapPaymentStatus(first['Financial Status']),
          fulfillmentStatus: mapFulfillmentStatus(
            first['Fulfillment Status'],
            first['Cancelled at']
          ),
          note:      first['Notes']?.trim() || '',
          createdAt: first['Created at'] ? new Date(first['Created at']) : new Date(),
          items: { create: items },
        },
      });
      willCreate++;
    } catch (e: any) {
      errors.push(`Order ${name}: ${e.message}`);
    }
  }

  console.log(`  ${DRY_RUN ? '📋 Would create' : '✅ Created'}: ${willCreate} | ⏭️  Skipped: ${willSkip}`);
  if (errors.length) {
    console.log(`  ⚠️  Issues (${errors.length}):`);
    errors.slice(0, 20).forEach(e => console.log(`    - ${e}`));
  } else {
    console.log('  ✅ No issues found');
  }

  return errors;
}

// ─── 3. VERIFY (live run only) ───────────────────────────────────────────────
async function verify() {
  if (DRY_RUN) return;
  console.log('\n🔍 Post-migration counts:');
  console.log(`  Customers:  ${await prisma.customer.count()}`);
  console.log(`  Orders:     ${await prisma.order.count()}`);
  console.log(`  OrderItems: ${await prisma.orderItem.count()}`);

  const sample = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { items: true, customer: true },
  });
  if (sample) {
    console.log(`\n  Latest order: #${sample.orderNumber} — ${sample.customerName} — PKR ${sample.total}`);
    console.log(`  Items: ${sample.items.length} | Payment: ${sample.paymentMethod}/${sample.paymentStatus} | Fulfillment: ${sample.fulfillmentStatus}`);
  }
}

// ─── 4. ROLLBACK ─────────────────────────────────────────────────────────────
async function rollback() {
  console.log('\n🔴 ROLLBACK — deleting all migrated data...');
  const items     = await prisma.orderItem.deleteMany({});
  const orders    = await prisma.order.deleteMany({});
  const customers = await prisma.customer.deleteMany({});
  console.log(`  Deleted: ${items.count} order items, ${orders.count} orders, ${customers.count} customers`);
  console.log('  ✅ Rollback complete — database is clean');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const command = process.argv[2];

  if (command === 'rollback') {
    if (process.argv[3] !== '--confirm') {
      console.log('⚠️  To rollback run: migrate-shopify-csv.ts rollback --confirm');
      console.log('   This will DELETE all customers, orders, and order items.');
      return;
    }
    return await rollback();
  }

  console.log('🚀 Eco Global Foods — Shopify CSV → Neon.tech Migration');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  const custErrors  = await migrateCustomers();
  const orderErrors = await migrateOrders();
  await verify();

  const total = custErrors.length + orderErrors.length;
  if (total > 0) {
    console.log(`\n⚠️  Dry run found ${total} issue(s). Fix before running live.`);
  } else {
    console.log(`\n✅ ${DRY_RUN ? 'Dry run passed — safe to run live!' : 'Migration complete!'}`);
  }
}

main()
  .catch(e => { console.error('\n💥 Fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());