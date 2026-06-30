/** Selectable brand + decorative gradients (CSS classes defined in globals.css). */
export const GRADIENTS: { value: string; label: string }[] = [
  { value: "gradient-purple-green", label: "Purple → Green (brand)" },
  { value: "gradient-purple", label: "Purple" },
  { value: "gradient-green", label: "Green" },
  { value: "gradient-plum-gold", label: "Plum → Gold" },
  { value: "gradient-sunset", label: "Sunset" },
  { value: "gradient-berry", label: "Berry" },
  { value: "gradient-rose", label: "Rose" },
  { value: "gradient-ocean", label: "Ocean" },
  { value: "gradient-emerald", label: "Emerald" },
  { value: "gradient-forest", label: "Forest" },
  { value: "gradient-gold", label: "Gold" },
  { value: "gradient-spice", label: "Spice" },
  { value: "gradient-midnight", label: "Midnight" },
];

export const GRADIENT_VALUES = GRADIENTS.map((g) => g.value);
