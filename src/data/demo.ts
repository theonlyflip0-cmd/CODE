// Offline demo data — used when Supabase isn't configured so the storefront
// and admin board are fully browsable without a backend (e.g. a static export).

export type DemoMenuRow = {
  id: string;
  slug: string;
  name_nl: string;
  name_en: string;
  description_nl: string | null;
  description_en: string | null;
  price: number;
  category: string;
  sort_order: number;
  is_popular: boolean;
  available: boolean;
};

export const DEMO_MENU_ROWS: DemoMenuRow[] = [
  // wraps
  m("kip-durum", "Kip Durum", "Chicken Durum", "Houtskool gegrilde kip in verse lavash.", "Charcoal-grilled chicken in fresh lavash.", 8.5, "wraps", 1, true),
  m("lams-durum", "Lamsdurum", "Lamb Durum", "Mals lamsvlees, verse lavash en sauzen.", "Tender lamb, fresh lavash and sauces.", 9.5, "wraps", 2, false),
  m("mix-durum", "Mix Durum", "Mix Durum", "Kip én lam in één wrap.", "Chicken and lamb in one wrap.", 9.0, "wraps", 3, false),
  m("adana-durum", "Adana Durum", "Adana Durum", "Pittige gehaktspies, lavash en uitjes.", "Spicy minced skewer, lavash and onion.", 9.5, "wraps", 4, true),
  m("falafel-durum", "Falafel Durum", "Falafel Durum", "Knapperige falafel, hummus en salade.", "Crispy falafel, hummus and salad.", 8.0, "wraps", 5, false),
  m("veggie-durum", "Veggie Durum", "Veggie Durum", "Gegrilde groenten en huissaus.", "Grilled veggies and house sauce.", 8.0, "wraps", 6, false),
  // menus
  m("kip-menu", "Kip Menu", "Chicken Menu", "Kip durum + patat of rijst + drank.", "Chicken durum + fries or rice + drink.", 12.5, "menus", 1, true),
  m("lams-menu", "Lams Menu", "Lamb Menu", "Lamsdurum + patat of rijst + drank.", "Lamb durum + fries or rice + drink.", 13.5, "menus", 2, false),
  m("mix-menu", "Mix Menu", "Mix Menu", "Mix durum + patat of rijst + drank.", "Mix durum + fries or rice + drink.", 13.0, "menus", 3, false),
  m("kral-box", "Kral Box", "Kral Box", "Onze signature box met spies naar keuze.", "Our signature box with a skewer of choice.", 14.5, "menus", 4, true),
  // schotels
  m("schotel-1", "Schotel 1 Spies", "Plate · 1 Skewer", "Patat of rijst, salade, 1 spies naar keuze (gratis).", "Fries or rice, salad, 1 free skewer.", 12.5, "schotels", 1, false),
  m("schotel-2", "Schotel 2 Spiezen", "Plate · 2 Skewers", "Patat of rijst, salade, 2 spiezen naar keuze (gratis).", "Fries or rice, salad, 2 free skewers.", 15.5, "schotels", 2, false),
  m("schotel-3", "Schotel 3 Spiezen", "Plate · 3 Skewers", "Patat of rijst, salade, 3 spiezen naar keuze (gratis).", "Fries or rice, salad, 3 free skewers.", 18.5, "schotels", 3, true),
  m("kapsalon", "Kapsalon", "Kapsalon", "Patat, vlees, kaas, salade en saus.", "Fries, meat, cheese, salad and sauce.", 9.5, "schotels", 4, true),
  // losse
  m("patat", "Patat / Friet", "Fries", "Verse patat.", "Fresh fries.", 3.0, "losse", 1, false),
  m("kipnuggets", "Kipnuggets (6st)", "Chicken Nuggets", "6 krokante nuggets.", "6 crispy nuggets.", 4.5, "losse", 2, false),
  m("frikandel", "Frikandel", "Frikandel", "Klassieker.", "A classic.", 2.5, "losse", 3, false),
  m("loempia", "Loempia", "Spring Roll", "Vega loempia.", "Veggie spring roll.", 2.0, "losse", 4, false),
  m("kaassouffle", "Kaassoufflé", "Cheese Soufflé", "Smeltende kaas.", "Melting cheese.", 2.5, "losse", 5, false),
  // extras
  m("extra-lavash", "Extra Lavash", "Extra Lavash", "Een extra verse lavash.", "An extra fresh lavash.", 1.5, "extras", 1, false),
  m("extra-vlees", "Extra Vlees", "Extra Meat", "Extra portie vlees.", "Extra portion of meat.", 3.5, "extras", 2, false),
  m("portie-saus", "Portie Saus", "Sauce Portion", "Ruime portie saus.", "A generous portion.", 1.0, "extras", 3, false),
  // dranken
  d("cola", "Cola", "Coke", 2.5, 1, true),
  d("cola-zero", "Cola Zero", "Coke Zero", 2.5, 2, true),
  d("fanta", "Fanta Orange", "Fanta Orange", 2.5, 3, true),
  d("ayran", "Ayran", "Ayran", 2.0, 4, true),
  d("ayran-raibi-pistache", "Ayran Raïbi Pistache", "Ayran Raïbi Pistachio", 2.5, 5, false),
  d("water", "Water", "Water", 2.0, 6, true),
  // sauzen
  d("knoflooksaus", "Knoflooksaus", "Garlic Sauce", 1.0, 1, true),
  d("sambal", "Sambal", "Sambal", 1.0, 2, true),
  d("chilisaus", "Chilisaus", "Chili Sauce", 1.0, 3, true),
  d("katjangsaus", "Katjangsaus", "Peanut Sauce", 1.5, 4, true),
];

function m(
  slug: string,
  nl: string,
  en: string,
  dnl: string | null,
  den: string | null,
  price: number,
  category: string,
  sort: number,
  popular: boolean,
  available = true,
): DemoMenuRow {
  return {
    id: "demo-" + slug,
    slug,
    name_nl: nl,
    name_en: en,
    description_nl: dnl,
    description_en: den,
    price,
    category,
    sort_order: sort,
    is_popular: popular,
    available,
  };
}

function d(slug: string, nl: string, en: string, price: number, sort: number, available: boolean): DemoMenuRow {
  return m(slug, nl, en, null, null, price, slug === "knoflooksaus" || slug === "sambal" || slug === "chilisaus" || slug === "katjangsaus" ? "sauzen" : "dranken", sort, false, available);
}

// ── Demo orders (admin board) ────────────────────────────────────────────────

export type DemoOrder = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  postcode: string | null;
  order_type: "delivery" | "pickup";
  items: { id: string; slug: string; name: string; qty: number; price: number; options: unknown }[];
  subtotal: number;
  delivery_fee: number;
  tip: number;
  discount: number;
  total: number;
  status: "new" | "accepted" | "ready" | "delivered";
  ready_minutes: number | null;
  created_at: string;
};

const now = Date.now();
const ago = (min: number) => new Date(now - min * 60_000).toISOString();

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: "o1", order_number: 1042, customer_name: "Sefa Yıldız", customer_phone: "06 1234 5678",
    customer_address: "Paul Krugerlaan 12", postcode: "2571", order_type: "delivery",
    items: [
      { id: "demo-kral-box", slug: "kral-box", name: "Kral Box", qty: 1, price: 18.0, options: {} },
      { id: "demo-cola", slug: "cola", name: "Cola", qty: 2, price: 2.5, options: {} },
    ],
    subtotal: 23.0, delivery_fee: 1.5, tip: 1.0, discount: 2.3, total: 23.2, status: "new", ready_minutes: null, created_at: ago(3),
  },
  {
    id: "o2", order_number: 1041, customer_name: "Marloes Bakker", customer_phone: "06 2233 4455",
    customer_address: "Weimarstraat 88", postcode: "2562", order_type: "delivery",
    items: [{ id: "demo-schotel-2", slug: "schotel-2", name: "Schotel 2 Spiezen", qty: 1, price: 15.5, options: {} }],
    subtotal: 15.5, delivery_fee: 1.5, tip: 0, discount: 0, total: 17.0, status: "accepted", ready_minutes: 30, created_at: ago(12),
  },
  {
    id: "o3", order_number: 1040, customer_name: "Driss El Amrani", customer_phone: "06 9988 7766",
    customer_address: null, postcode: null, order_type: "pickup",
    items: [
      { id: "demo-kip-durum", slug: "kip-durum", name: "Kip Durum", qty: 2, price: 9.0, options: {} },
      { id: "demo-frikandel", slug: "frikandel", name: "Frikandel", qty: 1, price: 2.5, options: {} },
    ],
    subtotal: 20.5, delivery_fee: 0, tip: 0, discount: 2.05, total: 18.45, status: "ready", ready_minutes: 12, created_at: ago(20),
  },
  {
    id: "o4", order_number: 1039, customer_name: "Anouk Visser", customer_phone: "06 5544 3322",
    customer_address: "Goudsbloemlaan 5", postcode: "2565", order_type: "delivery",
    items: [{ id: "demo-kapsalon", slug: "kapsalon", name: "Kapsalon", qty: 1, price: 9.5, options: {} }],
    subtotal: 9.5, delivery_fee: 2.5, tip: 0.5, discount: 0, total: 12.5, status: "delivered", ready_minutes: 30, created_at: ago(55),
  },
];
