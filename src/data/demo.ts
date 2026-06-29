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
  m("wrap-kipfilet", "Wrap Kipfilet", "Chicken Fillet Wrap", "Gegrilde kipfilet in verse lavash.", "Grilled chicken fillet in fresh lavash.", 7.5, "wraps", 1, true),
  m("wrap-kippenvleugels", "Wrap Kippenvleugels", "Chicken Wings Wrap", "Gegrilde kippenvleugels, lavash en saus.", "Grilled chicken wings, lavash and sauce.", 8.0, "wraps", 2, false),
  m("wrap-adana", "Wrap Adana", "Adana Wrap", "Pittige adana gehaktspies in lavash.", "Spicy adana minced skewer in lavash.", 8.0, "wraps", 3, true),
  m("wrap-lamsvlees", "Wrap Lamsvlees", "Lamb Wrap", "Mals lamsvlees in verse lavash.", "Tender lamb in fresh lavash.", 8.5, "wraps", 4, false),
  // menus
  m("menu-kipfilet", "Menu Kipfilet", "Chicken Fillet Menu", "Wrap kipfilet + patat of rijst + drank.", "Chicken fillet wrap + fries or rice + drink.", 11.0, "menus", 1, true),
  m("menu-kippenvleugels", "Menu Kippenvleugels", "Chicken Wings Menu", "Wrap kippenvleugels + patat of rijst + drank.", "Chicken wings wrap + fries or rice + drink.", 11.5, "menus", 2, false),
  m("menu-adana", "Menu Adana", "Adana Menu", "Wrap adana + patat of rijst + drank.", "Adana wrap + fries or rice + drink.", 11.5, "menus", 3, false),
  m("menu-lamsvlees", "Menu Lamsvlees", "Lamb Menu", "Wrap lamsvlees + patat of rijst + drank.", "Lamb wrap + fries or rice + drink.", 12.0, "menus", 4, false),
  m("kral-box", "Kral Box", "Kral Box", "Onze signature box met spies naar keuze.", "Our signature box with a skewer of choice.", 14.5, "menus", 5, true),
  // schotels
  m("schotel-1", "Schotel 1 · Kipfilet", "Plate 1 · Chicken Fillet", "Patat of rijst, salade en 1 spies naar keuze.", "Fries or rice, salad and 1 skewer of choice.", 12.5, "schotels", 1, false),
  m("schotel-2", "Schotel 2 Spiezen", "Plate · 2 Skewers", "Patat of rijst, salade en 2 spiezen naar keuze.", "Fries or rice, salad and 2 skewers of choice.", 15.5, "schotels", 2, false),
  m("schotel-mix", "Schotel Mix", "Mixed Plate", "Patat of rijst, salade en 2 spiezen (mix).", "Fries or rice, salad and 2 mixed skewers.", 15.0, "schotels", 3, true),
  // losse
  m("patat", "Patat / Friet", "Fries", "Verse patat.", "Fresh fries.", 3.0, "losse", 1, false),
  m("rijst", "Rijst", "Rice", "Kruidige rijst.", "Seasoned rice.", 3.5, "losse", 2, false),
  m("linzensoep", "Linzensoep", "Lentil Soup", "Huisgemaakte linzensoep.", "House-made lentil soup.", 4.5, "losse", 3, false),
  m("zuur", "Zuur", "Pickles", "Turks tafelzuur.", "Turkish pickles.", 1.5, "losse", 4, false),
  m("cacik", "Cacık", "Cacık", "Yoghurt met komkommer en knoflook.", "Yoghurt with cucumber and garlic.", 2.5, "losse", 5, false),
  // dranken
  d("cola", "Coca-Cola", "Coca-Cola", 2.5, 1),
  d("cola-zero", "Coca-Cola Zero", "Coca-Cola Zero", 2.5, 2),
  d("pepsi", "Pepsi", "Pepsi", 2.5, 3),
  d("fanta-orange", "Fanta Orange", "Fanta Orange", 2.5, 4),
  d("fanta-straw-kiwi", "Fanta Strawberry Kiwi", "Fanta Strawberry Kiwi", 2.5, 5),
  d("fanta-lemon-zero", "Fanta Lemon Zero", "Fanta Lemon Zero", 2.5, 6),
  d("fanta-exotic", "Fanta Exotic", "Fanta Exotic", 2.5, 7),
  d("sprite-zero", "Sprite Zero", "Sprite Zero", 2.5, 8),
  d("energy", "Energy Drink", "Energy Drink", 3.0, 9),
  d("capri-sun", "Capri-Sun", "Capri-Sun", 2.0, 10),
  d("kizilay", "Kızılay", "Kızılay Sparkling", 2.5, 11),
  d("water", "Munzur Water 0,5L", "Munzur Water 0.5L", 2.0, 12),
  d("ayran", "Yayık Ayran", "Yayık Ayran", 2.0, 13),
  d("ayran-kers", "Ayran Kers", "Cherry Ayran", 2.5, 14),
  d("ayran-raibi-pistache", "Raïbi Pistache", "Raïbi Pistachio", 2.5, 15),
  d("raibi-granaatappel", "Raïbi Granaatappel", "Raïbi Pomegranate", 2.5, 16),
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

function d(slug: string, nl: string, en: string, price: number, sort: number): DemoMenuRow {
  return m(slug, nl, en, null, null, price, "dranken", sort, false, true);
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
      { id: "demo-cola", slug: "cola", name: "Coca-Cola", qty: 2, price: 2.5, options: {} },
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
      { id: "demo-wrap-kipfilet", slug: "wrap-kipfilet", name: "Wrap Kipfilet", qty: 2, price: 7.5, options: {} },
      { id: "demo-patat", slug: "patat", name: "Patat / Friet", qty: 1, price: 3.0, options: {} },
    ],
    subtotal: 18.0, delivery_fee: 0, tip: 0, discount: 0, total: 18.0, status: "ready", ready_minutes: 12, created_at: ago(20),
  },
  {
    id: "o4", order_number: 1039, customer_name: "Anouk Visser", customer_phone: "06 5544 3322",
    customer_address: "Goudsbloemlaan 5", postcode: "2565", order_type: "delivery",
    items: [{ id: "demo-schotel-mix", slug: "schotel-mix", name: "Schotel Mix", qty: 1, price: 15.0, options: {} }],
    subtotal: 15.0, delivery_fee: 2.5, tip: 0.5, discount: 0, total: 18.0, status: "delivered", ready_minutes: 30, created_at: ago(55),
  },
];
