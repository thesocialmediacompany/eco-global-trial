import {
  Home,
  ShoppingCart,
  Package,
  Boxes,
  FolderTree,
  Users,
  Star,
  Tag,
  BarChart3,
  Settings,
  Truck,
  FileText,
  ShoppingBag,
  Gift,
  Mail,
  Send,
  Images,
  Building2,
  Navigation as NavIcon,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** only visible to owner-role staff */
  ownerOnly?: boolean;
}

/** Single source of truth for the admin navigation (desktop sidebar + mobile drawer). */
export const adminNav: AdminNavItem[] = [
  { label: "Home", href: "/admin", icon: Home },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Abandoned carts", href: "/admin/abandoned", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "HORECA", href: "/admin/horeca", icon: Building2 },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Bundles", href: "/admin/bundles", icon: Gift },
  { label: "Collections", href: "/admin/collections", icon: FolderTree },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { label: "Campaigns", href: "/admin/campaigns", icon: Send },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Media & gallery", href: "/admin/media", icon: Images, ownerOnly: true },
  { label: "Navigation", href: "/admin/navigation", icon: NavIcon, ownerOnly: true },
  { label: "Discounts", href: "/admin/discounts", icon: Tag, ownerOnly: true },
  { label: "Shipping", href: "/admin/shipping", icon: Truck },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, ownerOnly: true },
  { label: "Settings", href: "/admin/settings", icon: Settings, ownerOnly: true },
];

/** Nav items visible for a given role. */
export function navForRole(role?: string): AdminNavItem[] {
  return role === "owner" ? adminNav : adminNav.filter((i) => !i.ownerOnly);
}

/** Whether a nav item is the active route. */
export function isActiveAdminRoute(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
