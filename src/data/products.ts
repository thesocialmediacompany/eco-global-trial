import type { Product } from "@/lib/types";

/**
 * The newly launched premium range from the product catalogue.
 * Prices are placeholder PKR values pending final pricing from the client.
 */
export const products: Product[] = [
  // ───────────────────────── Granola ─────────────────────────
  {
    id: "p-granola-chocolate",
    slug: "granola-goodness-chocolate",
    name: "Granola Goodness - Chocolate",
    category: "granola",
    tagline: "A perfect mix of taste & nutrition",
    description:
      "A delicious blend of premium whole grains and rich chocolate that offers a satisfying crunch and long-lasting energy for your mornings. Every bite is flavourful and wholesome.",
    price: 850,
    compareAtPrice: 1050,
    flavours: ["Chocolate", "Tropical Fruit", "Classic Cluster"],
    badges: ["Whole Grains", "No Artificial Flavours"],
    emoji: "🍫",
    gradient: "gradient-purple",
    rating: 4.9,
    reviewCount: 128,
    isNew: true,
    isBestseller: true,
    seo: {
      title: "Granola Goodness Chocolate",
      description:
        "Chocolate granola crafted with premium whole grains for a satisfying crunch and long-lasting morning energy.",
      keywords: ["chocolate granola", "granola goodness", "healthy breakfast"],
    },
  },
  {
    id: "p-granola-tropical",
    slug: "granola-goodness-tropical-fruit",
    name: "Granola Goodness - Tropical Fruit",
    category: "granola",
    tagline: "Sun-ripened fruit in every cluster",
    description:
      "Whole-grain granola tossed with tropical fruit for a naturally sweet, energising start to the day. Crunchy, wholesome and irresistible.",
    price: 850,
    flavours: ["Chocolate", "Tropical Fruit", "Classic Cluster"],
    badges: ["Whole Grains", "Real Fruit"],
    emoji: "🥭",
    gradient: "gradient-green",
    rating: 4.8,
    reviewCount: 94,
    isNew: true,
    seo: {
      title: "Granola Goodness Tropical Fruit",
      description:
        "Tropical fruit granola made with premium whole grains - naturally sweet, crunchy and wholesome.",
      keywords: ["tropical granola", "fruit granola", "healthy breakfast"],
    },
  },
  {
    id: "p-granola-classic",
    slug: "granola-goodness-classic-cluster",
    name: "Granola Goodness - Classic Cluster",
    category: "granola",
    tagline: "Timeless, golden clusters",
    description:
      "Our signature classic cluster granola - golden, crunchy and lightly sweet. The wholesome everyday choice for cereal, yoghurt bowls and snacking.",
    price: 820,
    flavours: ["Chocolate", "Tropical Fruit", "Classic Cluster"],
    badges: ["Whole Grains", "Everyday Favourite"],
    emoji: "🥣",
    gradient: "gradient-purple-green",
    rating: 4.8,
    reviewCount: 76,
    isNew: true,
    seo: {
      title: "Granola Goodness Classic Cluster",
      description:
        "Golden classic-cluster granola - crunchy, lightly sweet and wholesome for everyday breakfasts.",
      keywords: ["classic granola", "cluster granola", "breakfast cereal"],
    },
  },

  // ───────────────────────── Oats More ─────────────────────────
  {
    id: "p-oats-banana-nuts",
    slug: "oats-more-banana-nuts",
    name: "Oats More - Banana & Nuts",
    category: "oats",
    tagline: "Nutrient-rich goodness, ready in minutes",
    description:
      "Instant flavoured oatmeal packed with fibre and protein. Just add hot water or milk, stir and enjoy. Banana & nuts deliver lasting energy and support digestion.",
    price: 480,
    flavours: ["Banana & Nuts", "Strawberry", "Chatpatta", "Apple & Cinnamon", "Chicken"],
    badges: ["High Fibre", "5 Flavours"],
    emoji: "🍌",
    gradient: "gradient-green",
    rating: 4.7,
    reviewCount: 61,
    isNew: true,
    seo: {
      title: "Oats More Banana & Nuts Instant Oatmeal",
      description:
        "Fibre-rich instant oatmeal with banana & nuts - ready in minutes for a wholesome, energising breakfast.",
      keywords: ["instant oatmeal", "banana oats", "healthy breakfast"],
    },
  },
  {
    id: "p-oats-strawberry",
    slug: "oats-more-strawberry",
    name: "Oats More - Strawberry",
    category: "oats",
    tagline: "Fruity, fibre-rich & fast",
    description:
      "Whole oats with the bright taste of strawberry - a guilt-free instant breakfast delivering essential vitamins and minerals without excess calories.",
    price: 480,
    flavours: ["Banana & Nuts", "Strawberry", "Chatpatta", "Apple & Cinnamon", "Chicken"],
    badges: ["High Fibre", "No Artificial Additives"],
    emoji: "🍓",
    gradient: "gradient-purple",
    rating: 4.6,
    reviewCount: 48,
    isNew: true,
    seo: {
      title: "Oats More Strawberry Instant Oatmeal",
      description:
        "Strawberry instant oatmeal - whole oats and natural flavour for a quick, balanced breakfast.",
      keywords: ["strawberry oats", "instant oatmeal", "quick breakfast"],
    },
  },
  {
    id: "p-oats-chicken",
    slug: "oats-more-chicken",
    name: "Oats More - Chicken",
    category: "oats",
    tagline: "A savoury twist on oats",
    description:
      "A warm, savoury chicken-flavoured oatmeal - wholesome whole oats with a comforting taste. Add hot water, stir and enjoy a nourishing meal in minutes.",
    price: 500,
    flavours: ["Banana & Nuts", "Strawberry", "Chatpatta", "Apple & Cinnamon", "Chicken"],
    badges: ["Savoury", "High Fibre"],
    emoji: "🍲",
    gradient: "gradient-purple-green",
    rating: 4.5,
    reviewCount: 33,
    isNew: true,
    seo: {
      title: "Oats More Chicken Savoury Oatmeal",
      description:
        "Savoury chicken-flavoured instant oatmeal - wholesome whole oats ready in minutes.",
      keywords: ["savoury oats", "chicken oatmeal", "instant meal"],
    },
  },

  // ───────────────────────── NutriMalt ─────────────────────────
  {
    id: "p-nutrimalt-chocolate",
    slug: "nutrimalt-malted-milk-chocolate",
    name: "NutriMalt - Malted Milk Chocolate",
    category: "malted-drinks",
    tagline: "Energy, nutrition & rich chocolate",
    description:
      "A premium malted milk drink combining the rich flavours of malt and cocoa. A source of vitamins D, B12 & C plus calcium and iron - enjoy hot or cold.",
    price: 1150,
    compareAtPrice: 1300,
    flavours: ["Chocolate", "Original", "Vanilla"],
    badges: ["Vitamin D, B12 & C", "Hot or Cold"],
    emoji: "🍫",
    gradient: "gradient-purple",
    rating: 4.9,
    reviewCount: 142,
    isNew: true,
    isBestseller: true,
    seo: {
      title: "NutriMalt Malted Milk Chocolate",
      description:
        "Rich chocolate malted milk drink with vitamins D, B12 & C. Smooth, creamy energy in every cup - hot or cold.",
      keywords: ["malted milk chocolate", "nutrimalt", "energy drink"],
    },
  },
  {
    id: "p-nutrimalt-original",
    slug: "nutrimalt-malted-milk-original",
    name: "NutriMalt - Malted Milk Original",
    category: "malted-drinks",
    tagline: "Rich, creamy & naturally sweet",
    description:
      "Indulge in the smooth, creamy taste of malt and milk - naturally sweetened and packed with essential vitamins and minerals. Wonderful in shakes, baking and more.",
    price: 1100,
    flavours: ["Chocolate", "Original", "Vanilla"],
    badges: ["Naturally Sweet", "Versatile"],
    emoji: "🥛",
    gradient: "gradient-green",
    rating: 4.8,
    reviewCount: 88,
    isNew: true,
    seo: {
      title: "NutriMalt Malted Milk Original",
      description:
        "Smooth, creamy original malted milk - naturally sweet and packed with vitamins and minerals.",
      keywords: ["malted milk", "original malt drink", "nutrimalt"],
    },
  },
  {
    id: "p-nutrimalt-vanilla",
    slug: "nutrimalt-vanilla",
    name: "NutriMalt - Vanilla",
    category: "malted-drinks",
    tagline: "Proactive energy & nutrition",
    description:
      "Specially crafted for those who seek sustained energy, balanced nutrition and a rich vanilla flavour. A wholesome experience in every sip.",
    price: 1150,
    flavours: ["Chocolate", "Original", "Vanilla"],
    badges: ["Sustained Energy", "Rich Vanilla"],
    emoji: "🍦",
    gradient: "gradient-purple-green",
    rating: 4.7,
    reviewCount: 57,
    isNew: true,
    seo: {
      title: "NutriMalt Vanilla Malted Drink",
      description:
        "Rich vanilla malted drink crafted for sustained energy and balanced nutrition.",
      keywords: ["vanilla malt", "nutrimalt vanilla", "energy drink"],
    },
  },

  // ───────────────────────── Rolled grains ─────────────────────────
  {
    id: "p-rolled-oats",
    slug: "rolled-oats",
    name: "Rolled Oats",
    category: "oats",
    tagline: "Steamed & gently rolled",
    description:
      "Premium-quality whole oats, steamed and gently rolled to preserve their natural goodness. Rich in fibre and protein - perfect for porridge, overnight oats, granola and healthy baking.",
    price: 620,
    flavours: ["Original", "Chocolate"],
    badges: ["High Fibre", "Locally Produced"],
    emoji: "🌾",
    gradient: "gradient-green",
    rating: 4.8,
    reviewCount: 71,
    isNew: true,
    seo: {
      title: "Premium Rolled Oats",
      description:
        "Steamed and gently rolled whole oats - fibre-rich and perfect for porridge, overnight oats and baking.",
      keywords: ["rolled oats", "whole oats", "overnight oats", "porridge"],
    },
  },
  {
    id: "p-rolled-barley",
    slug: "rolled-barley",
    name: "Rolled Barley",
    category: "oats",
    tagline: "Mild, nutty & high in fibre",
    description:
      "A nutritious, versatile cereal made from carefully selected barley grains, steamed and rolled to perfection. Mild, nutty flavour with slow-release energy for hearty porridges and soups.",
    price: 600,
    badges: ["Slow-Release Energy", "High Fibre"],
    emoji: "🌾",
    gradient: "gradient-purple-green",
    rating: 4.7,
    reviewCount: 39,
    isNew: true,
    seo: {
      title: "Rolled Barley",
      description:
        "Mild, nutty rolled barley with high fibre and slow-release energy - ideal for porridges, soups and baking.",
      keywords: ["rolled barley", "barley flakes", "high fibre cereal"],
    },
  },

  // ───────────────────────── Protein Bars ─────────────────────────
  {
    id: "p-bar-cocoa",
    slug: "protein-bar-cocoa",
    name: "Protein Bar - Cocoa",
    category: "protein-bars",
    tagline: "A tasty blend of nutrition & energy",
    description:
      "High-protein, fibre-packed cocoa bar with real flavour and no added sugar. Supports muscle growth and repair - perfect pre-workout, post-workout or mid-day fuel.",
    price: 250,
    flavours: ["Cocoa", "Dates", "Strawberry Punch", "Tropical", "Apricot"],
    badges: ["High Protein", "No Added Sugar"],
    emoji: "🍫",
    gradient: "gradient-purple",
    rating: 4.8,
    reviewCount: 103,
    isNew: true,
    isBestseller: true,
    seo: {
      title: "Cocoa Protein Bar",
      description:
        "High-protein cocoa bar with no added sugar - real flavour and fibre for pre- or post-workout energy.",
      keywords: ["protein bar", "cocoa protein bar", "no added sugar"],
    },
  },
  {
    id: "p-bar-dates",
    slug: "protein-bar-dates",
    name: "Protein Bar - Dates",
    category: "protein-bars",
    tagline: "Naturally sweetened energy",
    description:
      "A wholesome dates protein bar, naturally sweetened with premium ingredients. Nutrient-rich and fibre-packed to keep you going through the day.",
    price: 250,
    flavours: ["Cocoa", "Dates", "Strawberry Punch", "Tropical", "Apricot"],
    badges: ["High Protein", "Naturally Sweetened"],
    emoji: "🌴",
    gradient: "gradient-green",
    rating: 4.7,
    reviewCount: 64,
    isNew: true,
    seo: {
      title: "Dates Protein Bar",
      description:
        "Naturally sweetened dates protein bar - nutrient-rich, fibre-packed energy with no artificial flavours.",
      keywords: ["dates protein bar", "natural protein bar", "energy bar"],
    },
  },
  {
    id: "p-bar-apricot",
    slug: "protein-bar-apricot",
    name: "Protein Bar - Apricot",
    category: "protein-bars",
    tagline: "Fruity, fresh & fibre-rich",
    description:
      "A fresh apricot protein bar with real fruit flavour and no artificial additives. The perfect protein snack for active, balanced living.",
    price: 250,
    flavours: ["Cocoa", "Dates", "Strawberry Punch", "Tropical", "Apricot"],
    badges: ["High Protein", "Real Flavour"],
    emoji: "🍑",
    gradient: "gradient-purple-green",
    rating: 4.6,
    reviewCount: 42,
    isNew: true,
    seo: {
      title: "Apricot Protein Bar",
      description:
        "Fresh apricot protein bar with real fruit flavour and no artificial additives - clean, balanced energy.",
      keywords: ["apricot protein bar", "fruit protein bar", "healthy snack"],
    },
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const featuredProducts = products.filter((p) => p.isBestseller || p.isNew);

export const newArrivals = products.filter((p) => p.isNew);
