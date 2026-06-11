# Stockist logos

Drop official retailer logo files here to show them in the homepage
"Also available at" section instead of the styled name badges.

Name each file by the retailer's **slug** (from `src/data/retailers.ts`):

| Retailer    | File name (any of these) |
|-------------|--------------------------|
| Al-Fatah    | `al-fatah.png`           |
| Naheed      | `naheed.png`             |
| Imtiaz      | `imtiaz.png`             |
| Rahim Store | `rahim-store.png`        |
| D.Watson    | `d-watson.png`           |
| CSD         | `csd.png`                |
| Risen       | `risen.png`              |
| Jalal Sons  | `jalal-sons.png`         |
| Carrefour   | `carrefour.png`          |

Supported extensions: `.svg`, `.png`, `.webp`, `.jpg`, `.jpeg`.
Prefer transparent PNG or SVG, roughly 300×120px. Logos are auto-detected on
the next page load — no code change needed. Only use logos you are licensed to
display (i.e. retailers that actually stock the product).
