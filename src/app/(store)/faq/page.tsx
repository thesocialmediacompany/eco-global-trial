import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/store/PageBanner";
import { FaqAccordion, type FaqItem } from "@/components/store/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about ordering, delivery, payments, ingredients and more at Eco Global Foods.",
};

const faqs: FaqItem[] = [
  {
    q: "Where do you deliver?",
    a: "We deliver nationwide across Pakistan through our courier partners. Orders are typically dispatched within 1-2 business days.",
  },
  {
    q: "Is shipping free?",
    a: "Yes. Shipping is free on all orders over Rs 7,000. Orders below that have a flat Rs 250 delivery charge.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash on Delivery, JazzCash, Easypaisa, debit/credit cards and bank transfer. Choose your preferred method at checkout.",
  },
  {
    q: "Are your products really natural?",
    a: "Yes. Every Eco Global Foods product is made with natural ingredients and no artificial flavours or unnecessary additives.",
  },
  {
    q: "How should I store my products?",
    a: "Store in a cool, dry place away from direct sunlight. Reseal packs after opening to preserve freshness and crunch.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Yes. We offer a 30-day satisfaction guarantee. If something isn't right, contact us and we'll sort it out. See our refund policy for details.",
  },
  {
    q: "Do you offer wholesale or bulk pricing?",
    a: "We do! For wholesale and business enquiries, please reach out via our contact page or email support@ecoglobalfoods.com.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageBanner
        emoji="❓"
        eyebrow="Help Centre"
        title="Frequently Asked Questions"
        description="Everything you need to know about ordering, delivery and our products."
      />
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <FaqAccordion items={faqs} />
          <div className="mt-12 rounded-2xl gradient-purple-green p-8 text-center text-cream">
            <h2 className="font-display text-2xl font-semibold">Still have questions?</h2>
            <p className="mt-2 text-cream/80">Our team is happy to help.</p>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-full bg-cream px-7 py-3 text-sm font-semibold text-purple-900 hover:bg-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
