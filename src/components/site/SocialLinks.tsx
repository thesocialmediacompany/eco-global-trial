import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/lib/settings-defaults";

/** Brand icons missing from lucide, drawn inline to inherit currentColor. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.35 11.1H12v2.97h5.35c-.5 2.6-2.62 4.1-5.35 4.1a5.92 5.92 0 1 1 0-11.84c1.5 0 2.86.55 3.92 1.45l2.23-2.23A8.97 8.97 0 0 0 12 3a9 9 0 1 0 0 18c5.19 0 8.63-3.65 8.63-8.79 0-.39-.04-.74-.1-1.11z" />
    </svg>
  );
}

interface Props {
  settings: StoreSettings;
  /** "footer" = round bordered icons on dark; "light" = bordered on light bg */
  variant?: "footer" | "light";
  className?: string;
}

export function SocialLinks({ settings: s, variant = "footer", className }: Props) {
  const links = [
    { label: "Instagram", href: s.instagramUrl, Icon: Instagram },
    { label: "Facebook", href: s.facebookUrl, Icon: Facebook },
    { label: "LinkedIn", href: s.linkedinUrl, Icon: Linkedin },
    { label: "YouTube", href: s.youtubeUrl, Icon: Youtube },
    { label: "TikTok", href: s.tiktokUrl, Icon: TikTokIcon },
    { label: "Google", href: s.googleUrl, Icon: GoogleIcon },
  ].filter((l) => l.href && l.href.trim() !== "");

  const iconCls =
    variant === "footer"
      ? "grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream/80 transition-colors hover:border-green-400 hover:bg-green-500/10 hover:text-cream"
      : "grid h-11 w-11 place-items-center rounded-full border border-purple-200 text-purple-900 transition hover:bg-purple-50";

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          className={iconCls}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
