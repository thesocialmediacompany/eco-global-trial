import type { Category } from "@/lib/types";

/**
 * Storefront categories - slugs MUST match the imported Collection slugs in the
 * database (captured from the live store) so navigation resolves correctly.
 * Used for nav menus, the home category grid, shop chips and the footer.
 */
export const categories: Category[] = [
  {
    id: "cat-granola",
    slug: "granola-cereals",
    name: "Granola & Cereal",
    tagline: "Crunchy, wholesome mornings",
    gradient: "gradient-purple",
    emoji: "🥣",
    isNew: true,
    seo: {
      title: "Granola & Cereal",
      description: "Whole-grain granola and cereals that taste as good as they are for you.",
      keywords: ["granola", "cereal", "healthy breakfast", "whole grains"],
    },
  },
  {
    id: "cat-oats",
    slug: "oats-family",
    name: "Oats Family",
    tagline: "Ready in minutes",
    gradient: "gradient-green",
    emoji: "🌾",
    isNew: true,
    seo: {
      title: "Oats Family",
      description: "Instant and rolled oats and barley. High in fibre, keeps you full for longer.",
      keywords: ["oats", "instant oatmeal", "rolled oats", "barley"],
    },
  },
  {
    id: "cat-morning",
    slug: "morning-essentials",
    name: "Morning Essentials",
    tagline: "Start the day right",
    gradient: "gradient-purple-green",
    emoji: "☀️",
    seo: {
      title: "Morning Essentials",
      description: "Wholesome breakfast essentials for an energising, balanced start to the day.",
      keywords: ["breakfast", "morning", "muesli", "healthy start"],
    },
  },
  {
    id: "cat-flours",
    slug: "flours-flours",
    name: "Flours",
    tagline: "From farm to flour",
    gradient: "gradient-green",
    emoji: "🌾",
    seo: {
      title: "Flours",
      description: "Naturally milled flours for wholesome home cooking and baking.",
      keywords: ["flour", "atta", "wholewheat", "baking"],
    },
  },
  {
    id: "cat-baking",
    slug: "baking-products",
    name: "Baking Products",
    tagline: "Bake with goodness",
    gradient: "gradient-purple",
    emoji: "🧁",
    seo: {
      title: "Baking Products",
      description: "Natural baking essentials for delicious, wholesome treats.",
      keywords: ["baking", "desserts", "natural ingredients"],
    },
  },
  {
    id: "cat-spices",
    slug: "spices-spices",
    name: "Spices",
    tagline: "Authentic, pure blends",
    gradient: "gradient-purple-green",
    emoji: "🌶️",
    seo: {
      title: "Spices",
      description: "Pure spices and masalas with no artificial colours or fillers.",
      keywords: ["spices", "masala", "natural spices"],
    },
  },
  {
    id: "cat-herbs",
    slug: "herbs",
    name: "Herbs",
    tagline: "Wellness from the earth",
    gradient: "gradient-green",
    emoji: "🌿",
    seo: {
      title: "Herbs",
      description: "Carefully sourced natural herbs for cooking and wellness.",
      keywords: ["herbs", "natural herbs", "wellness"],
    },
  },
  {
    id: "cat-seeds",
    slug: "seeds-grains",
    name: "Seeds & Grains",
    tagline: "Nature's tiny powerhouses",
    gradient: "gradient-green",
    emoji: "🌱",
    seo: {
      title: "Seeds & Grains",
      description: "Nutrient-dense seeds and whole grains for a balanced lifestyle.",
      keywords: ["seeds", "grains", "chia", "flax", "quinoa"],
    },
  },
  {
    id: "cat-dry-fruits",
    slug: "dry-fruits",
    name: "Dry Fruits",
    tagline: "Premium, hand-picked",
    gradient: "gradient-purple",
    emoji: "🥜",
    seo: {
      title: "Dry Fruits",
      description: "Hand-picked premium dry fruits and nuts, sealed for freshness.",
      keywords: ["dry fruits", "nuts", "almonds", "cashews"],
    },
  },
  {
    id: "cat-gluten-free",
    slug: "gluten-free",
    name: "Gluten Free",
    tagline: "Pure & worry-free",
    gradient: "gradient-purple-green",
    emoji: "🌾",
    seo: {
      title: "Gluten-Free Foods",
      description: "A dedicated gluten-free range for sensitive diets without compromising on taste.",
      keywords: ["gluten free", "celiac", "wheat free"],
    },
  },
  {
    id: "cat-batter",
    slug: "batter-marination",
    name: "Batter & Marination",
    tagline: "Restaurant taste at home",
    gradient: "gradient-purple",
    emoji: "🍗",
    seo: {
      title: "Batter & Marination",
      description: "Ready batter and marination mixes for crispy, flavourful meals in minutes.",
      keywords: ["batter mix", "marination", "coating"],
    },
  },
  {
    id: "cat-dehydrated",
    slug: "dehydrated-dehydrated",
    name: "Dehydrated",
    tagline: "Flavour, locked in",
    gradient: "gradient-green",
    emoji: "🧅",
    seo: {
      title: "Dehydrated Foods",
      description: "Dehydrated vegetables and foods that lock in nutrition and flavour.",
      keywords: ["dehydrated", "dried vegetables", "long shelf life"],
    },
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
