import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getNavLinks } from "@/lib/navigation";
import { SocialLinks } from "@/components/site/SocialLinks";
import { BrandMark } from "@/components/site/BrandMark";
import { NewsletterForm } from "@/components/site/NewsletterForm";

export async function Footer() {
  const [s, shopLinks, companyLinks] = await Promise.all([
    getSettings(),
    getNavLinks("footer_shop"),
    getNavLinks("footer_company"),
  ]);
  return (
    <footer id="contact" className="bg-purple-950 text-cream/80">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <BrandMark className="h-10 w-10" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-semibold text-cream">
                  Eco Global Foods
                </span>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-green-400">
                  SMC-PVT Ltd.
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm text-cream/60">
              Natural, pure ingredients for true satisfaction. Wholesome choices for
              modern living, crafted in Pakistan since 1999.
            </p>

            {/* Newsletter signup */}
            <div className="mt-6 max-w-xs">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cream/70">
                Join our newsletter
              </p>
              <NewsletterForm variant="footer" source="footer" />
            </div>

            <div className="mt-6">
              <SocialLinks settings={s} variant="footer" />
            </div>
          </div>

          {/* Shop */}
          <FooterCol title="Shop">
            {shopLinks.map((l) => (
              <FooterLink key={l.id} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterCol>

          {/* Company */}
          <FooterCol title="Company">
            {companyLinks.map((l) => (
              <FooterLink key={l.id} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterCol>

          {/* Contact */}
          <FooterCol title="Get in Touch">
            <li className="flex gap-3 text-sm text-cream/65">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
              {s.storeAddress}
            </li>
            <li>
              <a
                href={`tel:${s.storePhoneRaw}`}
                className="flex items-center gap-3 text-sm text-cream/65 transition-colors hover:text-cream"
              >
                <Phone className="h-4 w-4 shrink-0 text-green-400" />
                {s.storePhone}
              </a>
            </li>
            {s.storePhoneSecondary && (
              <li>
                <a
                  href={`tel:${s.storePhoneSecondaryRaw || s.storePhoneSecondary}`}
                  className="flex items-center gap-3 text-sm text-cream/65 transition-colors hover:text-cream"
                >
                  <Phone className="h-4 w-4 shrink-0 text-green-400" />
                  {s.storePhoneSecondary}
                </a>
              </li>
            )}
            <li>
              <a
                href={`mailto:${s.storeEmail}`}
                className="flex items-center gap-3 text-sm text-cream/65 transition-colors hover:text-cream"
              >
                <Mail className="h-4 w-4 shrink-0 text-green-400" />
                {s.storeEmail}
              </a>
            </li>
          </FooterCol>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {s.storeLegalName} All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/policies/privacy" className="transition-colors hover:text-cream">
              Privacy Policy
            </Link>
            <Link href="/policies/terms" className="transition-colors hover:text-cream">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Designed-by credit */}
        <div className="mt-6 border-t border-cream/10 pt-6 text-center text-xs text-cream/45">
          <a
            href={s.footerCreditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-green-300"
          >
            {s.footerCredit}
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-cream">
        {title}
      </h4>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-cream/65 transition-colors hover:text-cream">
        {children}
      </Link>
    </li>
  );
}

