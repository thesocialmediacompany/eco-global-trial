import type { Metadata } from "next";
import Link from "next/link";
import {
  Target,
  Eye,
  Heart,
  Sprout,
  ShieldCheck,
  BadgeCheck,
  Leaf,
  Globe2,
  Landmark,
  Award,
  Scale,
  TrendingUp,
  GraduationCap,
  Handshake,
  Recycle,
  Package2,
  Box,
  Store,
  ShoppingBag,
} from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getGalleryImages, getCatalogFiles } from "@/lib/media";
import { PageCover } from "@/components/store/PageCover";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { GetQuote } from "@/components/store/GetQuote";
import { Gallery } from "@/components/store/Gallery";
import { CatalogDownloads } from "@/components/store/CatalogDownloads";

export const metadata: Metadata = {
  title: "Our Story | Eco Global Foods",
  description:
    "Eco Global Foods (SMC-PVT) Ltd. has been making food in Pakistan since 1999. ISO 22000, HACCP and Halal certified, with bulk and private-label packaging for businesses.",
};

const values = [
  { icon: Sprout, title: "Natural & Pure", body: "Good natural ingredients, never artificial flavours or additives." },
  { icon: Target, title: "Innovation", body: "Technology and knowledge applied to advance food processing and value." },
  { icon: Heart, title: "Well-being", body: "Food that is delicious and thoughtfully made for active, balanced living." },
  { icon: Eye, title: "Quality", body: "The highest standards of quality, safety and satisfaction in every batch." },
];

const certifications = [
  { icon: ShieldCheck, title: "ISO 22000 & HACCP", body: "Food safety and quality management systems." },
  { icon: BadgeCheck, title: "Halal & Organic", body: "Certified Halal and organic production." },
  { icon: Leaf, title: "ISO 14001", body: "Environmental management systems." },
  { icon: Globe2, title: "International Standards", body: "Aligned with global food industry benchmarks." },
  { icon: Landmark, title: "PSQCA & Food Authority", body: "Regulatory approvals, verified by the Pakistan Food Authority." },
];

const qualityPolicy = [
  { icon: Award, title: "Customer Satisfaction", body: "We prioritise our customers' needs, aim to exceed expectations with every product, and actively seek feedback to keep improving." },
  { icon: Scale, title: "Compliance", body: "We adhere to all relevant regulatory requirements, industry standards and internal quality controls for safe, legal, honest products." },
  { icon: TrendingUp, title: "Continuous Improvement", body: "Our people look for ways to do better at every stage of production, from sourcing to packing." },
  { icon: GraduationCap, title: "Training & Development", body: "We invest in our employees' skills, knowledge and resources so they can uphold our quality standards." },
  { icon: Handshake, title: "Supplier Relationships", body: "Close collaboration with suppliers ensures the quality and consistency of every raw material and ingredient." },
  { icon: Recycle, title: "Environmental Responsibility", body: "We work to cut waste, save energy and use resources responsibly across the business." },
];

const packagingOptions = [
  { icon: Package2, title: "Bulk Loose Packing", body: "Ideal for commercial use." },
  { icon: Box, title: "Non-Branded Consumer Pack", body: "Standard packaging suitable for various retail outlets." },
  { icon: Store, title: "Own Brand Bulk Pack", body: "Customised packaging for major retailers (Hyperstar, Metro)." },
  { icon: ShoppingBag, title: "Own Brand Consumer Pack", body: "Consumer-friendly retail packaging (Hyperstar, Metro)." },
];

const timeline = [
  { year: "1999", title: "The beginning", body: "Eco Global Foods is founded with a commitment to high-quality food products." },
  { year: "2010", title: "Growing range", body: "Expansion across spices, flours, seeds and natural pantry staples." },
  { year: "2020", title: "Modern living", body: "Focus shifts to wholesome, convenient foods for modern lifestyles." },
  { year: "Today", title: "A new range", body: "Granola, oats, malted drinks and protein bars for the way people eat now." },
];

export default async function AboutPage() {
  const [settings, gallery, catalogs] = await Promise.all([
    getSettings(),
    getGalleryImages(),
    getCatalogFiles(),
  ]);

  return (
    <>
      <PageCover pageKey="about"
        emoji="🌿"
        eyebrow="Who We Are"
        title="At the forefront of food innovation"
        description="A Lahore based food manufacturer, making honest food the right way since 1999."
      />

      {/* about */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal direction="right">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] gradient-purple-green p-1">
              <div className="grid h-full w-full place-items-center rounded-[1.8rem] bg-purple-950/20">
                <span className="text-[8rem]">🏭</span>
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cream/95 px-5 py-2 font-display text-sm font-semibold text-purple-900 shadow-lg">
                  25+ Years of Experience
                </span>
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-green-600">
                About
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-3xl font-semibold text-purple-900 sm:text-4xl">
                Wholesome choices for modern living
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-purple-900/70">
                Eco Global Foods (SMC-PVT) Ltd. stands at the forefront of the food
                manufacturing industry, integrating technology, knowledge and innovation to
                achieve excellence in food processing and advance the food ingredients and
                value chain in agribusiness.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-4 text-purple-900/70">
                Since our inception in 1999, we have been committed to delivering
                high-quality food products to meet the evolving needs of consumers and
                businesses alike.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* mission + concept */}
      <section className="bg-cream-dark/40 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-[2rem] gradient-purple p-8 text-cream sm:p-10">
                <Target className="h-9 w-9 text-gold-300" />
                <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
                  Mission Statement
                </h2>
                <p className="mt-4 leading-relaxed text-cream/80">
                  Our mission is to be a leading provider of innovative and sustainable food
                  solutions, leveraging our expertise in food processing, supply chain
                  management, and product development to deliver exceptional value to our
                  customers. We are dedicated to maintaining the highest standards of
                  quality, safety, and customer satisfaction in everything we do.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-[2rem] gradient-green p-8 text-cream sm:p-10">
                <Eye className="h-9 w-9 text-gold-300" />
                <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
                  Our Concept
                </h2>
                <p className="mt-4 leading-relaxed text-cream/80">
                  At Eco Global Foods, we operate on the principles of efficiency,
                  sustainability, and customer-centricity. Our team of skilled professionals
                  works tirelessly to optimise our supply chain, streamline production
                  processes, and innovate new products to meet market demands. We strive to
                  establish long-term partnerships with our customers and suppliers, built
                  on trust, transparency, and mutual respect.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* certifications */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Certifications & Compliance"
            title="Certified, verified, trusted"
            description="We adhere to strict quality, safety and environmental standards, holding certifications from recognised authorities."
          />
          <RevealGroup
            stagger={0.08}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
          >
            {certifications.map((c) => (
              <RevealItem key={c.title}>
                <div className="h-full rounded-3xl border border-purple-100 bg-white p-6 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-purple-green text-cream">
                    <c.icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold leading-tight text-purple-900">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-xs text-purple-900/60">{c.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* quality policy */}
      <section className="bg-cream-dark/40 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Quality Policy"
            title="Quality, embedded in everything"
            description="Quality runs through how we work every day, guided by a full Quality Management System."
          />
          <RevealGroup
            stagger={0.08}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {qualityPolicy.map((q) => (
              <RevealItem key={q.title}>
                <div className="h-full rounded-3xl border border-purple-100 bg-white p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-green-100 text-green-700">
                    <q.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-purple-900">
                    {q.title}
                  </h3>
                  <p className="mt-2 text-sm text-purple-900/60">{q.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* values */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <SectionHeading eyebrow="What we stand for" title="Our Values" />
          <RevealGroup
            stagger={0.1}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((v) => (
              <RevealItem key={v.title}>
                <div className="h-full rounded-3xl border border-purple-100 bg-white p-7">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-purple-green text-cream">
                    <v.icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-purple-900">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-purple-900/60">{v.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* packaging + quote (bulk buyers) */}
      <section id="bulk" className="bg-cream-dark/40 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Products & Packaging"
            title="Flexible packaging for every business"
            description="Dehydrated vegetables, spices, instant premixes, breakfast cereals, bars, soups and snack seasonings, packed the way you need them."
          />
          <RevealGroup
            stagger={0.08}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {packagingOptions.map((p) => (
              <RevealItem key={p.title}>
                <div className="h-full rounded-3xl border border-purple-100 bg-white p-7 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-purple-100 text-purple-700">
                    <p.icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold leading-tight text-purple-900">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-purple-900/60">{p.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <div className="mt-12">
            <GetQuote whatsappNumber={settings.whatsappNumber} />
          </div>
        </div>
      </section>

      {/* timeline */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <SectionHeading eyebrow="Our journey" title="25+ years of goodness" />
          <div className="mt-14 space-y-8">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.05}>
                <div className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full gradient-purple-green text-xs font-bold text-cream">
                      {t.year}
                    </span>
                    {i < timeline.length - 1 && <span className="mt-1 w-px flex-1 bg-purple-200" />}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-display text-lg font-semibold text-purple-900">{t.title}</h3>
                    <p className="mt-1 text-purple-900/60">{t.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="bg-cream/40 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading
              eyebrow="Gallery"
              title="A look inside Eco Global Foods"
              description="From our fields and mills to the finished range and the dishes you make with it."
            />
            <div className="mt-14">
              <Gallery items={gallery} />
            </div>
          </div>
        </section>
      )}

      {/* Catalogs / downloads */}
      {catalogs.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <SectionHeading
              eyebrow="Downloads"
              title="Product catalogs"
              description="Browse our full range and private-label capabilities. Download the catalogs below."
            />
            <div className="mt-14">
              <CatalogDownloads items={catalogs} />
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-5 pb-24 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] gradient-purple-green px-6 py-16 text-center text-cream">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Taste the goodness for yourself
          </h2>
          <p className="mx-auto mt-3 max-w-md text-cream/80">
            Explore our newly launched premium range of natural, wholesome foods.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-block rounded-full bg-cream px-8 py-3.5 text-sm font-semibold text-purple-900 transition hover:bg-white"
          >
            Shop the range
          </Link>
        </div>
      </section>
    </>
  );
}
