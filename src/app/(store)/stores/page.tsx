import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getStockists } from "@/lib/stockists";
import { PageBanner } from "@/components/store/PageBanner";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Stores available at",
  description:
    "Find Eco Global Foods products on the shelves of leading retailers across Pakistan, including Al-Fatah, Imtiaz, Naheed, Carrefour and more.",
};

const PHOTO_EXTS = ["jpg", "jpeg", "png", "webp"];

/** In-store display photos dropped into public/stores/photos. */
function findPhotos(): string[] {
  const dir = path.join(process.cwd(), "public", "stores", "photos");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => PHOTO_EXTS.includes(f.split(".").pop()?.toLowerCase() ?? ""))
    .sort()
    .map((f) => `/stores/photos/${f}`);
}

export default async function StoresPage() {
  const [s, items, photos] = await Promise.all([getSettings(), getStockists(), findPhotos()]);

  return (
    <>
      <PageBanner
        eyebrow="Where to buy"
        title="Stores available at"
        description="Prefer to shop in person? You'll find Eco Global Foods on the shelves of these trusted retailers across Pakistan."
        emoji="🛒"
      />

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        {/* Retail partners */}
        <RevealGroup
          stagger={0.05}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {items.map((r) => {
            const inner = r.logoUrl ? (
              <Image
                src={r.logoUrl}
                alt={r.name}
                width={180}
                height={80}
                className="max-h-16 w-auto object-contain"
              />
            ) : (
              <span
                className="text-center font-display text-xl font-bold leading-tight"
                style={{ color: r.color }}
              >
                {r.name}
              </span>
            );
            return (
              <RevealItem
                key={r.id}
                className="flex h-28 items-center justify-center rounded-2xl border border-purple-100 bg-white px-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
              >
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex h-full w-full items-center justify-center">
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>

        <p className="mt-8 text-center text-sm text-purple-900/45">
          Stockists shown are select retail partners. Availability may vary by branch.
        </p>

        {/* In-store photos (team drops images into public/stores/photos) */}
        {photos.length > 0 && (
          <div className="mt-16">
            <h2 className="text-center font-display text-2xl font-semibold text-purple-900 sm:text-3xl">
              On the shelves
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-purple-900/60">
              A look at our products in stores around the country.
            </p>
            <RevealGroup
              stagger={0.05}
              className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {photos.map((src, i) => (
                <RevealItem
                  key={src}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-purple-100 bg-cream shadow-sm"
                >
                  <Image
                    src={src}
                    alt={`Eco Global Foods in store ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        )}

        {/* Call to action */}
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-green-50 p-8 text-center sm:p-10">
          <MapPin className="mx-auto h-8 w-8 text-green-600" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-purple-900">
            Can&apos;t find us nearby?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-purple-900/65">
            Order online and we&apos;ll deliver fresh to your door anywhere in
            Pakistan, with cash on delivery available.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full gradient-purple-green px-6 py-3 text-sm font-semibold text-cream shadow-sm transition hover:opacity-95"
            >
              Shop online
            </Link>
            <a
              href={`tel:${s.storePhoneRaw}`}
              className="rounded-full border border-purple-200 bg-white px-6 py-3 text-sm font-semibold text-purple-900 transition hover:bg-purple-50"
            >
              Call {s.storePhone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
