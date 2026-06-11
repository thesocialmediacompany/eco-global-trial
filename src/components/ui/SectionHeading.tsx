import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
}: Props) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      {eyebrow && (
        <Reveal>
          <span
            className={cn(
              "inline-block text-xs font-bold uppercase tracking-[0.28em]",
              tone === "dark" ? "text-green-600" : "text-gold-300",
            )}
          >
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={cn(
            "mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl",
            tone === "dark" ? "text-purple-900" : "text-cream",
          )}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p
            className={cn(
              "mt-4 text-base sm:text-lg",
              tone === "dark" ? "text-purple-900/65" : "text-cream/75",
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
