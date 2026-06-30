/** Seeds FaqItem + Policy from the previously hardcoded content (idempotent). */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FAQS: [string, string][] = [
  ["Where do you deliver?", "We deliver nationwide across Pakistan through our courier partners. Orders are typically dispatched within 1-2 business days."],
  ["Is shipping free?", "Yes. Shipping is free on all orders over Rs 7,000. Orders below that have a flat Rs 250 delivery charge."],
  ["What payment methods do you accept?", "We accept Cash on Delivery, JazzCash, Easypaisa, debit/credit cards and bank transfer. Choose your preferred method at checkout."],
  ["Are your products really natural?", "Yes. Every Eco Global Foods product is made with natural ingredients and no artificial flavours or unnecessary additives."],
  ["How should I store my products?", "Store in a cool, dry place away from direct sunlight. Reseal packs after opening to preserve freshness and crunch."],
  ["Can I return or exchange an item?", "Yes. We offer a 30-day satisfaction guarantee. If something isn't right, contact us and we'll sort it out. See our refund policy for details."],
  ["Do you offer wholesale or bulk pricing?", "We do! For wholesale and business enquiries, please reach out via our contact page or email support@ecoglobalfoods.com."],
];

const POLICIES: { slug: string; title: string; intro: string; sections: [string, string[]][] }[] = [
  {
    slug: "privacy", title: "Privacy Policy",
    intro: "Your privacy matters to us. This policy explains what information we collect and how we use it.",
    sections: [
      ["Information we collect", ["When you place an order, we collect your name, contact details and delivery address to fulfil and deliver your purchase.", "We may collect basic usage data to improve our website experience."]],
      ["How we use your information", ["To process orders, arrange delivery and provide customer support.", "To send you updates about your order and, with your consent, occasional offers."]],
      ["Data protection", ["We never sell your personal information. We apply reasonable safeguards to protect your data.", "For any privacy request, email support@ecoglobalfoods.com."]],
    ],
  },
  {
    slug: "terms", title: "Terms of Service",
    intro: "By using our website and placing an order, you agree to the following terms.",
    sections: [
      ["Orders", ["All orders are subject to product availability and acceptance.", "Prices are in Pakistani Rupees (PKR) and may change without prior notice."]],
      ["Pricing & payment", ["We accept Cash on Delivery, JazzCash, Easypaisa, card and bank transfer.", "Payment must be completed (or arranged for COD) before an order is dispatched."]],
      ["Liability", ["We are committed to quality but are not liable for indirect losses arising from product use beyond the purchase value."]],
    ],
  },
  {
    slug: "shipping", title: "Shipping & Delivery",
    intro: "Fast, tracked delivery across Pakistan through our trusted courier partners.",
    sections: [
      ["Delivery areas & times", ["We deliver nationwide across Pakistan. Orders are dispatched within 1-2 business days.", "Delivery typically takes 2-5 business days depending on your location."]],
      ["Shipping charges", ["Free shipping on orders over Rs 7,000.", "A flat Rs 250 charge applies to orders below the free-shipping threshold."]],
      ["Tracking", ["Once dispatched, you'll receive a tracking number to follow your parcel to your door."]],
    ],
  },
  {
    slug: "refund", title: "Returns & Refunds",
    intro: "We stand behind our products with a 30-day satisfaction promise.",
    sections: [
      ["Our guarantee", ["If you're not satisfied, contact us within 30 days of delivery and we'll make it right."]],
      ["How to request a return", ["Email support@ecoglobalfoods.com with your order number and reason.", "For quality issues, a photo helps us resolve things faster."]],
      ["Refunds", ["Approved refunds are processed to your original payment method or via bank transfer for COD orders, within 7-10 business days."]],
    ],
  },
];

async function main() {
  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({
      data: FAQS.map(([question, answer], i) => ({ question, answer, sortOrder: i })),
    });
    console.log(`Seeded ${FAQS.length} FAQ items`);
  } else {
    console.log("FAQ items already present, skipping");
  }

  for (let i = 0; i < POLICIES.length; i++) {
    const p = POLICIES[i];
    const body = p.sections.map(([h, paras]) => `## ${h}\n\n${paras.join("\n\n")}`).join("\n\n");
    await prisma.policy.upsert({
      where: { slug: p.slug },
      update: {},
      create: { slug: p.slug, title: p.title, intro: p.intro, body, sortOrder: i },
    });
  }
  console.log(`Upserted ${POLICIES.length} policies`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
