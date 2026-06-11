import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/store/PageBanner";

interface Policy {
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

const policies: Record<string, Policy> = {
  privacy: {
    title: "Privacy Policy",
    intro:
      "Your privacy matters to us. This policy explains what information we collect and how we use it.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "When you place an order, we collect your name, contact details and delivery address to fulfil and deliver your purchase.",
          "We may collect basic usage data to improve our website experience.",
        ],
      },
      {
        heading: "How we use your information",
        body: [
          "To process orders, arrange delivery and provide customer support.",
          "To send you updates about your order and, with your consent, occasional offers.",
        ],
      },
      {
        heading: "Data protection",
        body: [
          "We never sell your personal information. We apply reasonable safeguards to protect your data.",
          "For any privacy request, email support@ecoglobalfoods.com.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro: "By using our website and placing an order, you agree to the following terms.",
    sections: [
      {
        heading: "Orders",
        body: [
          "All orders are subject to product availability and acceptance.",
          "Prices are in Pakistani Rupees (PKR) and may change without prior notice.",
        ],
      },
      {
        heading: "Pricing & payment",
        body: [
          "We accept Cash on Delivery, JazzCash, Easypaisa, card and bank transfer.",
          "Payment must be completed (or arranged for COD) before an order is dispatched.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "We are committed to quality but are not liable for indirect losses arising from product use beyond the purchase value.",
        ],
      },
    ],
  },
  shipping: {
    title: "Shipping & Delivery",
    intro: "Fast, tracked delivery across Pakistan through our trusted courier partners.",
    sections: [
      {
        heading: "Delivery areas & times",
        body: [
          "We deliver nationwide across Pakistan. Orders are dispatched within 1-2 business days.",
          "Delivery typically takes 2-5 business days depending on your location.",
        ],
      },
      {
        heading: "Shipping charges",
        body: [
          "Free shipping on orders over Rs 7,000.",
          "A flat Rs 250 charge applies to orders below the free-shipping threshold.",
        ],
      },
      {
        heading: "Tracking",
        body: [
          "Once dispatched, you'll receive a tracking number to follow your parcel to your door.",
        ],
      },
    ],
  },
  refund: {
    title: "Returns & Refunds",
    intro: "We stand behind our products with a 30-day satisfaction promise.",
    sections: [
      {
        heading: "Our guarantee",
        body: [
          "If you're not satisfied, contact us within 30 days of delivery and we'll make it right.",
        ],
      },
      {
        heading: "How to request a return",
        body: [
          "Email support@ecoglobalfoods.com with your order number and reason.",
          "For quality issues, a photo helps us resolve things faster.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Approved refunds are processed to your original payment method or via bank transfer for COD orders, within 7-10 business days.",
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) return { title: "Policy" };
  return { title: policy.title, description: policy.intro };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();

  return (
    <>
      <PageBanner eyebrow="Policies" title={policy.title} description={policy.intro} />
      <section className="py-16 sm:py-24">
        <article className="mx-auto max-w-3xl space-y-10 px-5 lg:px-8">
          {policy.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-display text-2xl font-semibold text-purple-900">
                {s.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {s.body.map((p, i) => (
                  <p key={i} className="leading-relaxed text-purple-900/70">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
          <p className="border-t border-purple-100 pt-6 text-sm text-purple-900/40">
            Last updated: June 2026 · Eco Global Foods (SMC-PVT) Ltd.
          </p>
        </article>
      </section>
    </>
  );
}
