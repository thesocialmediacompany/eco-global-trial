import type { Metadata } from "next";
import Link from "next/link";
import { getFaqItems } from "@/lib/content-pages";
import { PageBanner } from "@/components/store/PageBanner";
import { FaqAccordion } from "@/components/store/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about ordering, delivery, payments, ingredients and more at Eco Global Foods.",
};

export default async function FaqPage() {
  const items = await getFaqItems();
  const faqs = items.map((f) => ({ q: f.question, a: f.answer }));
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
