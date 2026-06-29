// ─────────────────────────────────────────────────────────────────────────────
// Kral Durum To Go — static menu config: categories, option lists, delivery
// zones, customisation-modal config and skewer (spies) rules.
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "wraps"
  | "menus"
  | "losse"
  | "schotels"
  | "extras"
  | "dranken"
  | "sauzen";

/** Fixed order categories render in, on the storefront and in the menu tabs. */
export const CATEGORY_ORDER: Category[] = [
  "wraps",
  "menus",
  "losse",
  "schotels",
  "extras",
  "dranken",
  "sauzen",
];

/** Tab / section labels per language. */
export const CATEGORY_LABELS: Record<Category, { nl: string; en: string }> = {
  wraps: { nl: "Losse Wraps", en: "Wraps" },
  menus: { nl: "Menu's", en: "Menus" },
  losse: { nl: "Losse Producten", en: "À la carte" },
  schotels: { nl: "Schotels", en: "Plates" },
  extras: { nl: "Extra's", en: "Extras" },
  dranken: { nl: "Dranken", en: "Drinks" },
  sauzen: { nl: "Sauzen", en: "Sauces" },
};

// ── Delivery zones (Den Haag) ────────────────────────────────────────────────

export const ZONE_1 = new Set([
  "2515", "2525", "2526", "2531", "2561", "2562", "2571", "2572", "2573", "2574",
]);

export const ZONE_2 = new Set([
  "2511", "2512", "2513", "2514", "2515", "2516", "2521", "2522", "2523", "2524",
  "2525", "2526", "2531", "2532", "2533", "2541", "2542", "2543", "2544", "2551",
  "2552", "2553", "2554", "2561", "2562", "2563", "2564", "2565", "2566", "2571",
  "2572", "2573", "2574", "2581", "2582", "2583", "2584", "2585", "2586", "2288",
]);

/** Normalise a raw postcode input to its 4-digit prefix. */
export function postcodePrefix(postcode: string): string {
  return postcode.replace(/\s/g, "").slice(0, 4);
}

export type ZoneResult = { zone: 1 | 2 | null; fee: number };

/** Resolve a postcode to its delivery zone + fee. ZONE_1 wins over ZONE_2. */
export function resolveZone(postcode: string): ZoneResult {
  const p = postcodePrefix(postcode);
  if (ZONE_1.has(p)) return { zone: 1, fee: 1.5 };
  if (ZONE_2.has(p)) return { zone: 2, fee: 2.5 };
  return { zone: null, fee: 0 };
}

// ── Option lists (customisation modal) ───────────────────────────────────────

/** Sauces — pick max 2, no surcharge. */
export const SAUCE_OPTS = [
  "Geen",
  "Knoflook",
  "Sambal",
  "Katjang",
  "Chilisaus",
  "Mayonaise",
  "Curry",
  "Ketchup",
] as const;

/** Salads — pick max 2; some carry a surcharge. */
export const SALAD_OPTS: { name: string; price: number }[] = [
  { name: "Geen", price: 0 },
  { name: "Sla", price: 0 },
  { name: "Uitjes", price: 0 },
  { name: "Mix salade", price: 0 },
  { name: "Tursu biber", price: 0.5 },
  { name: "Mix tursu", price: 0.5 },
];

/** Optional extra "bakje" sauces — each +€0.50. */
export const BAKJE_OPTS = [
  "Bakje Knoflook saus",
  "Bakje Sambal",
  "Bakje Chili saus",
  "Bakje Katjang Saus",
] as const;
export const BAKJE_PRICE = 0.5;

/** Drinks (menu combos). */
export const DRANK_OPTS = [
  "Cola",
  "Cola Zero",
  "Fanta Orange",
  "Fanta Strawberry Kiwi",
  "Fanta Lemon",
  "Fanta Exotic",
  "Sprite",
  "Pepsi",
  "Ayran",
  "Water",
] as const;

/** iDEAL bank picker options. */
export const IDEAL_BANKS = [
  "ABN AMRO",
  "ING",
  "Rabobank",
  "SNS",
  "ASN",
  "Bunq",
  "Knab",
  "Triodos",
] as const;

// ── Spies (skewers) ──────────────────────────────────────────────────────────

/** Skewer choices, with prices (used for paid required spies + extra spies). */
export const SPIES_OPTS: { name: string; price: number }[] = [
  { name: "Kipspies", price: 3.5 },
  { name: "Lamsspies", price: 4.5 },
  { name: "Shoarmaspies", price: 3.5 },
  { name: "Köfte spies", price: 3.5 },
  { name: "Adana spies", price: 4.0 },
];

export function spiesPrice(name: string): number {
  return SPIES_OPTS.find((s) => s.name === name)?.price ?? 0;
}

/** How many required skewers an item ships with. */
export function spiesCountFor(slug: string): number {
  switch (slug) {
    case "schotel-1":
      return 1;
    case "schotel-2":
      return 2;
    case "schotel-3":
      return 3;
    case "kral-box":
      return 1;
    default:
      return 0;
  }
}

/** Whether an item allows adding optional (paid) extra skewers. */
export function allowsExtraSpies(slug: string): boolean {
  return (
    slug === "schotel-1" ||
    slug === "schotel-2" ||
    slug === "schotel-3" ||
    slug === "kral-box"
  );
}

/**
 * Schotels' required skewers are gratis; the Kral Box's single required skewer
 * is paid. Extra skewers are always paid (handled separately).
 */
export function requiredSpiesArePaid(slug: string): boolean {
  return slug === "kral-box";
}

// ── Customisation modal config ───────────────────────────────────────────────

export interface ModalConfig {
  patatRijst: boolean;
  saus: boolean;
  salade: boolean;
  bakje: boolean;
  drank: boolean;
}

/** Returns the modal config for a category, or null when an item is added directly. */
export function modalConfigFor(category: string): ModalConfig | null {
  switch (category) {
    case "wraps":
      return { patatRijst: false, saus: true, salade: true, bakje: true, drank: false };
    case "menus":
      return { patatRijst: true, saus: true, salade: true, bakje: true, drank: true };
    case "schotels":
      return { patatRijst: true, saus: true, salade: true, bakje: true, drank: false };
    case "losse":
      return { patatRijst: false, saus: true, salade: false, bakje: true, drank: false };
    case "extras":
    case "dranken":
    case "sauzen":
    default:
      return null;
  }
}

// ── Spicy slugs + image fallbacks ────────────────────────────────────────────

/** Slugs flagged with a spice badge regardless of the DB `spicy` value. */
export const SPICY_SLUGS = new Set<string>([
  "kip-durum",
  "lams-durum",
  "mix-durum",
  "kral-box",
  "schotel-3",
  "adana-durum",
  "kapsalon",
]);

/**
 * Map of slug -> real photo URL. Real photography lives outside the repo, so
 * this is intentionally sparse; everything else falls back to a generated,
 * category-tinted placeholder.
 */
export const IMAGE_BY_SLUG: Record<string, string> = {};

const CATEGORY_TINT: Record<string, [string, string, string]> = {
  // [from, to, emoji]
  wraps: ["#7a1d10", "#c0392b", "🌯"],
  menus: ["#8a2b12", "#d35400", "🍱"],
  losse: ["#9c640c", "#d4ac0d", "🍟"],
  schotels: ["#7d1f0f", "#b03a2e", "🍢"],
  extras: ["#5d4037", "#8d6e63", "🥡"],
  dranken: ["#1a5276", "#2980b9", "🥤"],
  sauzen: ["#7b241c", "#cb4335", "🫙"],
};

/** A pleasant inline SVG placeholder, tinted per category. */
export function placeholderImage(category: string, label: string): string {
  const [from, to, emoji] = CATEGORY_TINT[category] ?? ["#5a2d0c", "#a0522d", "🍴"];
  const safe = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").slice(0, 28);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <text x="200" y="190" font-size="120" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    <text x="200" y="320" font-size="26" fill="#ffffff" fill-opacity="0.92" font-family="Inter, sans-serif" font-weight="700" text-anchor="middle">${safe}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Resolve the display image for an item: explicit map, else placeholder. */
export function imageForItem(slug: string, category: string, label: string): string {
  return IMAGE_BY_SLUG[slug] ?? placeholderImage(category, label);
}
