import {
  Sprout,
  Target,
  Heart,
  Eye,
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
  Factory,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Fixed icon registry for About page items. The admin picks a key from this
 * list, so the storefront design stays consistent and can't be broken by
 * arbitrary input. Add a new entry here to offer a new icon.
 */
export const ABOUT_ICONS: Record<string, LucideIcon> = {
  Sprout,
  Target,
  Heart,
  Eye,
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
  Factory,
  Truck,
  Users,
};

export const ABOUT_ICON_KEYS = Object.keys(ABOUT_ICONS);

/** Resolve an icon key to a component, falling back to a safe default. */
export function aboutIcon(key: string): LucideIcon {
  return ABOUT_ICONS[key] ?? Leaf;
}

/** The five editable grids on the About page. */
export const ABOUT_GRIDS = [
  { key: "values", label: "Our values", hasIcon: true, hasYear: false },
  { key: "certifications", label: "Certifications & compliance", hasIcon: true, hasYear: false },
  { key: "quality", label: "Quality policy", hasIcon: true, hasYear: false },
  { key: "packaging", label: "Packaging options", hasIcon: true, hasYear: false },
  { key: "timeline", label: "Timeline / milestones", hasIcon: false, hasYear: true },
] as const;

export type AboutGridKey = (typeof ABOUT_GRIDS)[number]["key"];
