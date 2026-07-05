import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

const FAILED_EMAILS = [
  'saadrajpoot1985@gmail.com',
  'mabbasm0333@gmail.com',
  'saima_zainab@hotmail.com',
  'raahemah@hotmail.com',
  'usamahyushausamahyusha@gmail.com',
  'ufaq.jahanzeab123@gmail.com',
  'shakeel@najeebconsultants.com',
  'naumanshafique@yahoo.com',
  'jackie.sanger13@gmail.com',
  'savera.jaff@gmail.com',
  'marzyyiahgondal@gmail.com',
  'Zainmughal1458@gmail.com',
  'wasimbaig.1@gmail.com',
];

async function main() {
  console.log(`🔄 Retrying ${FAILED_EMAILS.length} failed customers...\n`);

  const raw  = fs.readFileSync(path.join(__dirname, '../data/customers_export.csv'), 'utf-8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];

  const targets = rows.filter(r => FAILED_EMAILS.includes(r['Email']?.trim()));
  console.log(`  Found ${targets.length} matching rows in CSV`);

  let success = 0;
  for (const r of targets) {
    const email     = r['Email']?.trim();
    const firstName = r['First Name']?.trim() || '';
    const lastName  = r['Last Name']?.trim()  || '';
    let   name      = `${firstName} ${lastName}`.trim() || email.split('@')[0];

    try {
      // Small delay between each to avoid overwhelming Neon
      await new Promise(res => setTimeout(res, 300));
      await prisma.customer.upsert({
        where:  { email },
        update: {},
        create: {
          email,
          name,
          phone:        r['Default Address Phone']?.trim()    || '',
          address:      r['Default Address Address1']?.trim() || '',
          city:         r['Default Address City']?.trim()     || '',
          passwordHash: '',
        },
      });
      console.log(`  ✅ ${email}`);
      success++;
    } catch (e: any) {
      console.log(`  ❌ ${email}: ${e.message.split('\n')[0]}`);
    }
  }

  console.log(`\n  Done: ${success}/${targets.length} inserted`);
  console.log(`  Total customers now: ${await prisma.customer.count()}`);
}

main()
  .catch(e => { console.error('💥', e); process.exit(1); })
  .finally(() => prisma.$disconnect());