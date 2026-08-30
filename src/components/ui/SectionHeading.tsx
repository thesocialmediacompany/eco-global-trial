import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  /** max-width utility for the description line (default keeps it tidy at 2xl;
   *  pass a wider value like "max-w-4xl" to keep a longer line unbroken). */
  descriptionClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
  descriptionClassName = "max-w-5xl",
}: Props) {
  const center = align === "center";
  return (
    <div className={cn(center ? "text-center" : "text-left")}>
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
            "mt-3 max-w-4xl font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl",
            center && "mx-auto",
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
              "mt-4 text-[19px] sm:text-[21px]",
              descriptionClassName,
              center && "mx-auto",
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
