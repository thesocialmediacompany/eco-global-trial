import Link from "next/link";
import { Store, CreditCard, Truck, Users, Megaphone, Share2, Code, LineChart, Type, Mail, Palette, Sparkles, BookOpen, ShoppingBag, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { paymentMethods } from "@/lib/payments";
import { requireOwner } from "@/lib/admin-guard";
import { updateSettings, sendSettingsTestEmail } from "./actions";

export default async function SettingsPage() {
  await requireOwner();
  const [s, staff] = await Promise.all([
    getSettings(),
    prisma.staffUser.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <form action={updateSettings}>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-purple-900">Settings</h1>
          <button className="rounded-lg gradient-purple-green px-5 py-2 text-sm font-semibold text-cream">
            Save changes
          </button>
        </div>

        <div className="space-y-6">
          <Section icon={Store} title="Store details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Store name" name="storeName" value={s.storeName} />
              <Field label="Legal name" name="storeLegalName" value={s.storeLegalName} />
              <Field label="Tagline" name="storeTagline" value={s.storeTagline} />
              <Field label="Email" name="storeEmail" value={s.storeEmail} />
              <Field label="Phone (display)" name="storePhone" value={s.storePhone} />
              <Field label="Phone (tel: raw)" name="storePhoneRaw" value={s.storePhoneRaw} />
              <Field label="Backup phone (display)" name="storePhoneSecondary" value={s.storePhoneSecondary} />
              <Field label="Backup phone (tel: raw)" name="storePhoneSecondaryRaw" value={s.storePhoneSecondaryRaw} />
              <Field label="Address" name="storeAddress" value={s.storeAddress} full />
            </div>
          </Section>

          <Section icon={Share2} title="Social & contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instagram URL" name="instagramUrl" value={s.instagramUrl} />
              <Field label="Facebook URL" name="facebookUrl" value={s.facebookUrl} />
              <Field label="LinkedIn URL" name="linkedinUrl" value={s.linkedinUrl} />
              <Field label="YouTube URL" name="youtubeUrl" value={s.youtubeUrl} />
              <Field label="TikTok URL" name="tiktokUrl" value={s.tiktokUrl} />
              <Field label="Google (Maps/Business) URL" name="googleUrl" value={s.googleUrl} />
              <Field label="WhatsApp number" name="whatsappNumber" value={s.whatsappNumber} />
            </div>
          </Section>

          <Section icon={Truck} title="Shipping & delivery">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Free shipping threshold (PKR)" name="freeShippingThreshold" value={s.freeShippingThreshold} type="number" />
              <Field label="Flat shipping rate (PKR)" name="flatShippingRate" value={s.flatShippingRate} type="number" />
            </div>
          </Section>

          <Section icon={Megaphone} title="Announcement bar">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
                Messages (separate with &ldquo;|&rdquo;)
              </span>
              <textarea
                name="announcements"
                rows={3}
                defaultValue={s.announcements}
                className={input}
              />
            </label>
          </Section>

          <Section icon={Megaphone} title="Occasion / opening sticker">
            <label className="mb-3 flex items-center justify-between rounded-lg border border-purple-100 px-4 py-3">
              <span className="text-sm font-medium text-purple-900">
                Show occasion sticker at top of site
              </span>
              <input
                type="checkbox"
                name="occasionBannerEnabled"
                defaultChecked={s.occasionBannerEnabled === "true"}
                className="h-4 w-4 accent-green-600"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <Field label="Sticker text" name="occasionBannerText" value={s.occasionBannerText} />
              <Field label="Emoji" name="occasionBannerEmoji" value={s.occasionBannerEmoji} />
            </div>
            <p className="mt-2 text-xs text-purple-900/50">
              Use this for occasions like Eid Mubarak, a grand opening message, or a
              holiday notice. Toggle it off to hide. Changing the text re-shows it to
              everyone who dismissed the previous message.
            </p>
          </Section>

          <Section icon={Type} title="Homepage text">
            <p className="-mt-1 mb-3 text-xs text-purple-900/50">
              Edit the main words customers see on the homepage. No code needed.
            </p>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
                  Scrolling values band (separate with &ldquo;|&rdquo;)
                </span>
                <textarea name="valueTicker" rows={2} defaultValue={s.valueTicker} className={input} />
              </label>
              <Field label="Hero badge (small pill)" name="heroBadge" value={s.heroBadge} full />
              <Field label="Hero title (last word is highlighted)" name="heroTitle" value={s.heroTitle} full />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
                  Hero subtitle
                </span>
                <textarea name="heroSubtitle" rows={2} defaultValue={s.heroSubtitle} className={input} />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-purple-100 px-4 py-3">
                <span className="text-sm font-medium text-purple-900">
                  Show the discount offer on the newsletter block
                  <span className="mt-0.5 block text-xs font-normal text-purple-900/50">
                    Turn off when no discount is running — shows neutral &ldquo;Join our newsletter&rdquo; copy instead.
                  </span>
                </span>
                <input
                  type="checkbox"
                  name="newsletterOfferEnabled"
                  defaultChecked={s.newsletterOfferEnabled === "true"}
                  className="h-4 w-4 accent-green-600"
                />
              </label>
              <Field label="Newsletter heading (offer)" name="newsletterHeading" value={s.newsletterHeading} full />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
                  Newsletter subtext
                </span>
                <textarea name="newsletterSubtext" rows={2} defaultValue={s.newsletterSubtext} className={input} />
              </label>
              <Field label="Stockists heading" name="stockistHeading" value={s.stockistHeading} full />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
                  Stockists subtext
                </span>
                <textarea name="stockistSubtext" rows={2} defaultValue={s.stockistSubtext} className={input} />
              </label>
            </div>
          </Section>

          <Section icon={Sparkles} title="Homepage: Why choose us">
            <p className="-mt-1 mb-3 text-xs text-purple-900/50">
              The four-card trust band on the homepage. The icons stay fixed; you edit the words.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Eyebrow" name="whyUsEyebrow" value={s.whyUsEyebrow} />
              <Field label="Title" name="whyUsTitle" value={s.whyUsTitle} />
              <Field label="Description" name="whyUsDescription" value={s.whyUsDescription} full />
              <Field label="Card 1 title" name="whyUsF1Title" value={s.whyUsF1Title} />
              <Field label="Card 1 text" name="whyUsF1Body" value={s.whyUsF1Body} />
              <Field label="Card 2 title" name="whyUsF2Title" value={s.whyUsF2Title} />
              <Field label="Card 2 text" name="whyUsF2Body" value={s.whyUsF2Body} />
              <Field label="Card 3 title" name="whyUsF3Title" value={s.whyUsF3Title} />
              <Field label="Card 3 text" name="whyUsF3Body" value={s.whyUsF3Body} />
              <Field label="Card 4 title" name="whyUsF4Title" value={s.whyUsF4Title} />
              <Field label="Card 4 text" name="whyUsF4Body" value={s.whyUsF4Body} />
            </div>
          </Section>

          <Section icon={BookOpen} title="Homepage: Our story">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Eyebrow" name="brandStoryEyebrow" value={s.brandStoryEyebrow} />
                <Field label="Title" name="brandStoryTitle" value={s.brandStoryTitle} />
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Story text</span>
                <textarea name="brandStoryBody" rows={3} defaultValue={s.brandStoryBody} className={input} />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Stat 1 value" name="brandStoryStat1Value" value={s.brandStoryStat1Value} />
                <Field label="Stat 2 value" name="brandStoryStat2Value" value={s.brandStoryStat2Value} />
                <Field label="Stat 3 value" name="brandStoryStat3Value" value={s.brandStoryStat3Value} />
                <Field label="Stat 1 label" name="brandStoryStat1Label" value={s.brandStoryStat1Label} />
                <Field label="Stat 2 label" name="brandStoryStat2Label" value={s.brandStoryStat2Label} />
                <Field label="Stat 3 label" name="brandStoryStat3Label" value={s.brandStoryStat3Label} />
              </div>
            </div>
          </Section>

          <Section icon={ShoppingBag} title="Homepage: Why order online">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Eyebrow" name="whyOnlineEyebrow" value={s.whyOnlineEyebrow} />
                <Field label="Title" name="whyOnlineTitle" value={s.whyOnlineTitle} />
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Intro text</span>
                <textarea name="whyOnlineBody" rows={2} defaultValue={s.whyOnlineBody} className={input} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Point 1 title" name="whyOnlineP1Title" value={s.whyOnlineP1Title} />
                <Field label="Point 1 text" name="whyOnlineP1Body" value={s.whyOnlineP1Body} />
                <Field label="Point 2 title" name="whyOnlineP2Title" value={s.whyOnlineP2Title} />
                <Field label="Point 2 text" name="whyOnlineP2Body" value={s.whyOnlineP2Body} />
                <Field label="Point 3 title" name="whyOnlineP3Title" value={s.whyOnlineP3Title} />
                <Field label="Point 3 text" name="whyOnlineP3Body" value={s.whyOnlineP3Body} />
              </div>
            </div>
          </Section>

          <Section icon={Info} title="About page">
            <p className="-mt-1 mb-3 text-xs text-purple-900/50">
              The intro and Mission / Concept copy on the About page. Certifications and
              the timeline are kept in code.
            </p>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Eyebrow" name="aboutEyebrow" value={s.aboutEyebrow} />
                <Field label="Image badge" name="aboutBadge" value={s.aboutBadge} />
              </div>
              <Field label="Heading" name="aboutHeading" value={s.aboutHeading} full />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
                  Intro text (leave a blank line between paragraphs)
                </span>
                <textarea name="aboutBody" rows={5} defaultValue={s.aboutBody} className={input} />
              </label>
              <Field label="Mission title" name="aboutMissionTitle" value={s.aboutMissionTitle} full />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Mission text</span>
                <textarea name="aboutMissionBody" rows={4} defaultValue={s.aboutMissionBody} className={input} />
              </label>
              <Field label="Concept title" name="aboutConceptTitle" value={s.aboutConceptTitle} full />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">Concept text</span>
                <textarea name="aboutConceptBody" rows={4} defaultValue={s.aboutConceptBody} className={input} />
              </label>
            </div>
          </Section>

          <Section icon={Palette} title="Brand colours">
            <p className="-mt-1 mb-3 text-xs text-purple-900/50">
              Set your two brand anchor colours as hex codes (e.g. <code>#3b1538</code>
              and <code>#233f18</code>). The site&apos;s gradients (hero, buttons,
              category cards, banners) are regenerated from these. Leave both blank to
              use the default purple &amp; green theme.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary (purple) hex" name="brandPurple" value={s.brandPurple} />
              <Field label="Secondary (green) hex" name="brandGreen" value={s.brandGreen} />
            </div>
          </Section>

          <Section icon={CreditCard} title="Payment methods">
            <div className="space-y-2.5">
              {paymentMethods.map((m) => {
                const key = ("pay" + m.id.charAt(0).toUpperCase() + m.id.slice(1)) as
                  | "payCod" | "payJazzcash" | "payEasypaisa" | "payCard" | "payBank";
                return (
                  <label
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-purple-100 px-4 py-3"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-sm font-medium text-purple-900">{m.label}</span>
                    </span>
                    <input
                      type="checkbox"
                      name={key}
                      defaultChecked={s[key] === "true"}
                      className="h-4 w-4 accent-green-600"
                    />
                  </label>
                );
              })}
            </div>
          </Section>

          <Section icon={LineChart} title="Analytics & tracking">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Google Analytics 4 ID"
                name="ga4MeasurementId"
                value={s.ga4MeasurementId}
              />
              <Field label="Meta Pixel ID" name="metaPixelId" value={s.metaPixelId} />
              <Field label="Google Search Console token" name="googleSiteVerification" value={s.googleSiteVerification} full />
            </div>
            <p className="mt-2 text-xs text-purple-900/50">
              Leave blank to disable. GA4 looks like <code>G-XXXXXXXXXX</code>; the Meta
              Pixel ID is a number. Once set, page views, add-to-cart and purchase events
              are tracked automatically.
            </p>
          </Section>

          <Section icon={Mail} title="Email sending">
            <p className="-mt-1 mb-3 text-xs text-purple-900/50">
              Connect a mailbox so order, newsletter and campaign emails actually
              send. Use your provider&apos;s SMTP details. For Gmail/Google Workspace
              use <code>smtp.gmail.com</code> port <code>587</code> and an{" "}
              <strong>App Password</strong> (not your normal password). Zoho:{" "}
              <code>smtp.zoho.com</code>. Leave blank to keep emails in test mode.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SMTP host" name="smtpHost" value={s.smtpHost} />
              <Field label="SMTP port" name="smtpPort" value={s.smtpPort} type="number" />
              <Field label="Username (email)" name="smtpUser" value={s.smtpUser} />
              <Field label="Password / App password" name="smtpPass" value={s.smtpPass} type="password" />
              <Field label="From name" name="smtpFromName" value={s.smtpFromName} />
              <Field label="From email" name="smtpFromEmail" value={s.smtpFromEmail} />
              <Field
                label="Order alerts to (staff)"
                name="orderNotifyEmail"
                value={s.orderNotifyEmail}
                placeholder="Defaults to store email · comma-separate for several"
                full
              />
            </div>
            <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-purple-100 pt-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-purple-900/70">
                  Send a test to
                </span>
                <input
                  name="testEmailTo"
                  type="email"
                  placeholder="you@example.com"
                  className={`${input} sm:w-64`}
                />
              </label>
              <button
                formAction={sendSettingsTestEmail}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50"
              >
                <Mail className="h-4 w-4" /> Save &amp; send test
              </button>
              <p className="w-full text-[0.7rem] text-purple-900/40">
                &ldquo;Save &amp; send test&rdquo; saves these email settings and sends one test message to the address above.
              </p>
            </div>
          </Section>

          <Section icon={Code} title="Footer credit">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Credit text" name="footerCredit" value={s.footerCredit} />
              <Field label="Credit URL" name="footerCreditUrl" value={s.footerCreditUrl} />
            </div>
          </Section>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="rounded-lg gradient-purple-green px-6 py-2.5 text-sm font-semibold text-cream">
            Save changes
          </button>
        </div>
      </form>

      {/* staff */}
      <div className="mt-6">
        <Section icon={Users} title="Staff accounts">
          <div className="mb-4 flex justify-end">
            <Link
              href="/admin/staff"
              className="rounded-lg gradient-purple-green px-4 py-2 text-sm font-semibold text-cream"
            >
              Manage staff
            </Link>
          </div>
          <div className="space-y-2.5">
            {staff.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-purple-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full gradient-purple-green text-xs font-bold text-cream">
                    {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-purple-900">{u.name}</p>
                    <p className="text-xs text-purple-900/50">{u.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold capitalize text-purple-700">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm text-purple-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold text-purple-900">
        <Icon className="h-5 w-5 text-green-600" /> {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  type = "text",
  full = false,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  full?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-purple-900/70">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className={input}
      />
    </label>
  );
}
