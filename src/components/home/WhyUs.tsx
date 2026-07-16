import { Leaf, ShieldCheck, Truck, Headset } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import type { StoreSettings } from "@/lib/settings-defaults";

export function WhyUs({ s }: { s: StoreSettings }) {
  const features = [
    { icon: Leaf, title: s.whyUsF1Title, body: s.whyUsF1Body },
    { icon: ShieldCheck, title: s.whyUsF2Title, body: s.whyUsF2Body },
    { icon: Truck, title: s.whyUsF3Title, body: s.whyUsF3Body },
    { icon: Headset, title: s.whyUsF4Title, body: s.whyUsF4Body },
  ];
  return (
    <section id="why" className="relative overflow-hidden gradient-purple py-12 text-cream sm:py-16">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          tone="light"
          eyebrow={s.whyUsEyebrow}
          title={s.whyUsTitle}
          description={s.whyUsDescription}
        />

        <RevealGroup
          stagger={0.1}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f) => (
            <RevealItem key={f.title}>
              <div className="group h-full rounded-3xl border border-cream/15 bg-white/5 p-7 backdrop-blur transition-colors hover:bg-white/10">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 text-cream shadow-lg shadow-green-900/30 transition-transform group-hover:scale-110">
                  <f.icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-cream/70">{f.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
