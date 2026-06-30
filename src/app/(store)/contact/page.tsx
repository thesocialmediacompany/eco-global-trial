import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PageCover } from "@/components/store/PageCover";
import { ContactForm } from "@/components/store/ContactForm";
import { SocialLinks } from "@/components/site/SocialLinks";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Eco Global Foods at 14 KM Multan Road, Lahore. Call (+92) 304 395 0505 or email support@ecoglobalfoods.com.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const details = [
    { icon: MapPin, label: "Visit us", value: settings.storeAddress },
    {
      icon: Phone,
      label: "Call us",
      value: settings.storePhone,
      href: `tel:${settings.storePhoneRaw}`,
    },
    ...(settings.storePhoneSecondary
      ? [
          {
            icon: Phone,
            label: "Backup line",
            value: settings.storePhoneSecondary,
            href: `tel:${settings.storePhoneSecondaryRaw || settings.storePhoneSecondary}`,
          },
        ]
      : []),
    {
      icon: Mail,
      label: "Email us",
      value: settings.storeEmail,
      href: `mailto:${settings.storeEmail}`,
    },
    { icon: Clock, label: "Hours", value: "Mon-Sat, 9:00 AM - 6:00 PM (PKT)" },
  ];
  return (
    <>
      <PageCover pageKey="contact"
        emoji="✉️"
        eyebrow="Contact"
        title="We'd love to hear from you"
        description="Questions, feedback or wholesale enquiries? Our team is here to help."
      />

      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          {/* info */}
          <div>
            <h2 className="font-display text-2xl font-semibold text-purple-900">
              Get in touch
            </h2>
            <p className="mt-2 text-purple-900/60">
              Reach us through any of the channels below.
            </p>
            <div className="mt-8 space-y-5">
              {details.map((d) => (
                <div key={d.label} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-purple-green text-cream">
                    <d.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-900/40">
                      {d.label}
                    </p>
                    {d.href ? (
                      <a
                        href={d.href}
                        className="text-purple-900 transition-colors hover:text-purple-700"
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p className="text-purple-900">{d.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <SocialLinks settings={settings} variant="light" />
            </div>
          </div>

          {/* form */}
          <ContactForm />
        </div>
      </section>
    </>
  );
}
