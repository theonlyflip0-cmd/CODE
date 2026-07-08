import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Heart,
  Phone,
  MapPin,
  Flame,
  Plus,
  Minus,
  X,
  Check,
  Loader2,
  PartyPopper,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CinematicIntro } from "@/components/CinematicIntro";
import { EmberField } from "@/components/EmberField";
import { Reveal } from "@/components/Reveal";
import { cn, euro, hhmm, uid } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { DEMO_MENU_ROWS } from "@/data/demo";
import {
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type Category,
  SAUCE_OPTS,
  SALAD_OPTS,
  BAKJE_OPTS,
  BAKJE_PRICE,
  DRANK_OPTS,
  IDEAL_BANKS,
  SPIES_OPTS,
  spiesPrice,
  spiesCountFor,
  allowsExtraSpies,
  requiredSpiesArePaid,
  modalConfigFor,
  SPICY_SLUGS,
  imageForItem,
  resolveZone,
} from "@/data/menu";

export const Route = createFileRoute("/")({
  component: CustomerSite,
});

// ── Core types ───────────────────────────────────────────────────────────────

type Lang = "nl" | "en";
type Mode = "delivery" | "pickup";
type PaymentMethod = "ideal" | "applepay" | "googlepay" | "cash";
type When = "asap" | "schedule";

type ItemOptions = {
  patatRijst?: "Patat" | "Rijst";
  sauces: string[];
  salades: string[];
  extras: string[]; // bakje sauzen
  drank?: string;
  note?: string;
  spies?: string[]; // required skewer choices
  extraSpies?: string[]; // optional additional skewers
};

type CartLine = {
  lineId: string;
  itemId: string;
  qty: number;
  options: ItemOptions;
  optionsPrice: number;
};

type MenuItem = {
  id: string;
  slug: string;
  name: { nl: string; en: string };
  desc: { nl: string; en: string };
  price: number;
  image: string;
  spicy?: boolean;
  popular?: boolean;
  available: boolean;
  category: string;
};

// ── Translations ─────────────────────────────────────────────────────────────

const T = {
  nl: {
    open: "Open tot 01:00",
    address: "Paul Krugerlaan 28, Den Haag",
    bestelNu: "Bestel nu",
    eyebrow: "🔥 HOUTSKOOL GEGRILD · DEN HAAG SINDS 2018",
    heroLine1: "Echte vlam.",
    heroLine2: "Verse lavash.",
    heroLine3: "Tot je deur.",
    heroSub:
      "Houtskool gegrilde durum, verse lavash en huisgemaakte sauzen — warm bij je thuisbezorgd of klaar om af te halen.",
    delivery: "Bezorgen",
    pickup: "Afhalen",
    postcodePh: "Bijv. 2571",
    check: "Check",
    feeZone1: "Top! Wij bezorgen bij jou — bezorgkosten €1,50.",
    feeZone2: "Gelukt! Wij bezorgen bij jou — bezorgkosten €2,50.",
    outZone: "Helaas, dit adres valt buiten ons bezorggebied. Afhalen kan altijd!",
    zoneTitle: "Bezorgen we naar jouw straat?",
    zoneSub: "Vul je postcode in en zie het direct.",
    zone1Chip: "€1.50 BINNEN 2 KM",
    zone2Chip: "€2.50 BINNEN 5 KM",
    storyEyebrow: "HET VERHAAL ACHTER DE VLAM",
    story:
      "Sinds 2018 grillen we elke spies op echte houtskool — geen kortere weg, alleen vlam, lavash en liefde.",
    reviewsEyebrow: "GOOGLE · 44 REVIEWS",
    reviewsTitle: "WAT ONZE GASTEN ZEGGEN",
    happy: "100K+ Blije Klanten",
    closed: "We zijn momenteel gesloten voor online bestellingen. Tot snel! 🔥",
    yourOrder: "JOUW BESTELLING",
    when: "WANNEER?",
    asap: "Zo snel mogelijk",
    schedule: "Plan vooruit",
    emptyCart: "Nog niets toegevoegd. Begin met het kiezen van iets lekkers ↗",
    discountLabel: "10% KORTING VANAF €20",
    teGaan: "TE GAAN",
    discountBanner: "10% korting op bezorgbestellingen vanaf €20",
    payMethod: "BETAALMETHODE",
    tipLabel: "FOOI VOOR DE BEZORGER",
    leaveAtDoor: "Aan de deur laten",
    instructionsPh: "Bezorginstructies (huisnr., portiekcode)",
    subtotal: "Subtotaal",
    deliveryFee: "Bezorgkosten",
    free: "Gratis",
    discount: "Korting",
    tip: "Fooi",
    totalLabel: "Totaal",
    placeOrder: "BESTELLING PLAATSEN",
    name: "Naam",
    phone: "Telefoon",
    addressField: "Adres + huisnummer",
    postcodeField: "Postcode",
    add: "Toevoegen",
    soldOut: "Uitverkocht",
    mostOrdered: "Most Ordered",
    kiesMax2: "KIES MAXIMAAL 2",
    optioneel: "OPTIONEEL",
    gratis: "GRATIS",
    required: "VERPLICHT",
    sausTitle: "Saus",
    saladeTitle: "Salade",
    bakjeTitle: "Extra Bakje Saus",
    drankTitle: "Drank",
    patatRijstTitle: "Patat of Rijst",
    spiesTitle: "Spies",
    extraSpiesTitle: "Extra spies",
    noteTitle: "Opmerking",
    notePh: "Bijv. niet te pittig…",
    addToOrder: "Toevoegen aan bestelling",
    kiesBank: "Kies je bank",
    betaalNu: "Betaal nu",
    processing: "Je betaling wordt verwerkt…",
    orderPlaced: "Gelukt! Je bestelling is geplaatst",
    orderNumber: "Bestelnummer",
    readyAt: "Klaar om",
    countdown: "Nog ongeveer",
    minutes: "min",
    newOrder: "Nieuwe bestelling",
    requireName: "Vul je naam en telefoonnummer in.",
    requireAddress: "Vul je bezorgadres in.",
    noBackend:
      "Supabase is nog niet geconfigureerd (.env). Bestellen werkt zodra de keys zijn ingevuld.",
    openTimes: "Openingstijden",
    maza: "Ma–Za 11:00–01:00",
    zo: "Zo 12:00–01:00",
    location: "Locatie",
    route: "Route",
  },
  en: {
    open: "Open until 01:00",
    address: "Paul Krugerlaan 28, The Hague",
    bestelNu: "Order now",
    eyebrow: "🔥 CHARCOAL GRILLED · THE HAGUE SINCE 2018",
    heroLine1: "Real flame.",
    heroLine2: "Fresh lavash.",
    heroLine3: "To your door.",
    heroSub:
      "Charcoal-grilled durum, fresh lavash and house-made sauces — delivered hot or ready for pickup.",
    delivery: "Delivery",
    pickup: "Pickup",
    postcodePh: "e.g. 2571",
    check: "Check",
    feeZone1: "Great! We deliver to you — delivery fee €1.50.",
    feeZone2: "Done! We deliver to you — delivery fee €2.50.",
    outZone: "Sorry, this address is outside our delivery area. Pickup is always possible!",
    zoneTitle: "Do we deliver to your street?",
    zoneSub: "Enter your postcode and find out instantly.",
    zone1Chip: "€1.50 WITHIN 2 KM",
    zone2Chip: "€2.50 WITHIN 5 KM",
    storyEyebrow: "THE STORY BEHIND THE FLAME",
    story:
      "Since 2018 we grill every skewer over real charcoal — no shortcuts, just flame, lavash and love.",
    reviewsEyebrow: "GOOGLE · 44 REVIEWS",
    reviewsTitle: "WHAT OUR GUESTS SAY",
    happy: "100K+ Happy Customers",
    closed: "We're currently closed for online orders. See you soon! 🔥",
    yourOrder: "YOUR ORDER",
    when: "WHEN?",
    asap: "As soon as possible",
    schedule: "Schedule ahead",
    emptyCart: "Nothing added yet. Start by picking something tasty ↗",
    discountLabel: "10% OFF FROM €20",
    teGaan: "TO GO",
    discountBanner: "10% off delivery orders over €20",
    payMethod: "PAYMENT METHOD",
    tipLabel: "TIP FOR THE DRIVER",
    leaveAtDoor: "Leave at the door",
    instructionsPh: "Delivery instructions (house no., entry code)",
    subtotal: "Subtotal",
    deliveryFee: "Delivery fee",
    free: "Free",
    discount: "Discount",
    tip: "Tip",
    totalLabel: "Total",
    placeOrder: "PLACE ORDER",
    name: "Name",
    phone: "Phone",
    addressField: "Address + house number",
    postcodeField: "Postcode",
    add: "Add",
    soldOut: "Sold out",
    mostOrdered: "Most Ordered",
    kiesMax2: "CHOOSE UP TO 2",
    optioneel: "OPTIONAL",
    gratis: "FREE",
    required: "REQUIRED",
    sausTitle: "Sauce",
    saladeTitle: "Salad",
    bakjeTitle: "Extra Sauce Cup",
    drankTitle: "Drink",
    patatRijstTitle: "Fries or Rice",
    spiesTitle: "Skewer",
    extraSpiesTitle: "Extra skewers",
    noteTitle: "Note",
    notePh: "e.g. not too spicy…",
    addToOrder: "Add to order",
    kiesBank: "Choose your bank",
    betaalNu: "Pay now",
    processing: "Processing your payment…",
    orderPlaced: "Success! Your order is placed",
    orderNumber: "Order number",
    readyAt: "Ready at",
    countdown: "About",
    minutes: "min",
    newOrder: "New order",
    requireName: "Please enter your name and phone number.",
    requireAddress: "Please enter your delivery address.",
    noBackend:
      "Supabase isn't configured yet (.env). Ordering works once the keys are filled in.",
    openTimes: "Opening hours",
    maza: "Mon–Sat 11:00–01:00",
    zo: "Sun 12:00–01:00",
    location: "Location",
    route: "Route",
  },
} as const;

/** Shared shape both languages conform to (string-valued keys). */
type Translation = { [K in keyof (typeof T)["nl"]]: string };

const REVIEWS = [
  {
    quote:
      "Beste durum van Den Haag, echt op houtskool en je proeft het verschil. Bezorging was super snel.",
    name: "Sefa Y.",
    label: "LOCAL GUIDE",
  },
  {
    quote: "Verse lavash, royale porties en lekkere sauzen. Vaste klant geworden!",
    name: "Marloes B.",
    label: "12 REVIEWS",
  },
  {
    quote: "Kral Box is een aanrader. Vriendelijk personeel en alles klopt.",
    name: "Driss E.",
    label: "5 REVIEWS",
  },
  {
    quote: "Eindelijk een tent die smaak serieus neemt. Die flame doet z'n werk.",
    name: "Anouk V.",
    label: "NEW",
  },
];

const MAPS_SRC =
  "https://www.google.com/maps?q=Paul+Krugerlaan+28,+Den+Haag&t=k&z=15&output=embed";

const emptyOptions = (): ItemOptions => ({
  sauces: [],
  salades: [],
  extras: [],
});

const lineHasNoOptions = (l: CartLine) =>
  !l.options.patatRijst &&
  l.options.sauces.length === 0 &&
  l.options.salades.length === 0 &&
  l.options.extras.length === 0 &&
  !l.options.drank &&
  !l.options.note &&
  (l.options.spies?.length ?? 0) === 0 &&
  (l.options.extraSpies?.length ?? 0) === 0 &&
  l.optionsPrice === 0;

// ─────────────────────────────────────────────────────────────────────────────

type MenuRowLike = {
  id: string;
  slug: string;
  name_nl: string;
  name_en: string;
  description_nl: string | null;
  description_en: string | null;
  price: number | string;
  category: string;
  sort_order: number;
  is_popular: boolean;
  available: boolean;
};

function sortRows(rows: MenuRowLike[]): MenuRowLike[] {
  return [...rows].sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category as Category);
    const cb = CATEGORY_ORDER.indexOf(b.category as Category);
    if (ca !== cb) return ca - cb;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
}

function mapRows(rows: MenuRowLike[]): MenuItem[] {
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: { nl: r.name_nl, en: r.name_en },
    desc: { nl: r.description_nl ?? "", en: r.description_en ?? "" },
    price: Number(r.price),
    image: imageForItem(r.slug, r.category, r.name_nl),
    spicy: SPICY_SLUGS.has(r.slug),
    popular: r.is_popular,
    available: r.available,
    category: r.category,
  }));
}

function CustomerSite() {
  const [lang, setLang] = useState<Lang>("nl");
  const t: Translation = T[lang];

  const [mode, setMode] = useState<Mode>("delivery");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderingClosed, setOrderingClosed] = useState(false);

  const [postcode, setPostcode] = useState("");
  const [zoneMessage, setZoneMessage] = useState<{ kind: 1 | 2 | 0; text: string } | null>(
    null,
  );

  const [cart, setCart] = useState<CartLine[]>([]);
  const [tip, setTip] = useState("0.00");
  const [payment, setPayment] = useState<PaymentMethod>("ideal");
  const [when, setWhen] = useState<When>("asap");
  const [scheduleTime, setScheduleTime] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [leaveAtDoor, setLeaveAtDoor] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Overlays
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [idealOpen, setIdealOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    orderNumber: number | string;
    readyTime: string;
    minutes: number;
  } | null>(null);

  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  // ── Loading + realtime ─────────────────────────────────────────────────────
  async function load() {
    if (!isSupabaseConfigured) {
      // Offline demo mode — browse the full menu without a backend.
      setItems(mapRows(sortRows(DEMO_MENU_ROWS)));
      setOrderingClosed(false);
      setLoading(false);
      return;
    }
    const [menuRes, settingsRes] = await Promise.all([
      supabase.from("menu_items").select("*").order("category").order("sort_order"),
      supabase.from("settings").select("ordering_closed").eq("id", 1).maybeSingle(),
    ]);

    const rows = sortRows((menuRes.data ?? []) as unknown as MenuRowLike[]);
    setItems(mapRows(rows));
    setOrderingClosed(Boolean(settingsRes.data?.ordering_closed));
    setLoading(false);
  }

  useEffect(() => {
    void load();
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel("storefront")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Postcode check ─────────────────────────────────────────────────────────
  function checkPostcode() {
    const { zone } = resolveZone(postcode);
    if (zone === 1) setZoneMessage({ kind: 1, text: t.feeZone1 });
    else if (zone === 2) setZoneMessage({ kind: 2, text: t.feeZone2 });
    else setZoneMessage({ kind: 0, text: t.outZone });
  }

  // ── Cart math ──────────────────────────────────────────────────────────────
  const subtotal = useMemo(
    () =>
      cart.reduce((sum, l) => {
        const it = itemById.get(l.itemId);
        if (!it) return sum;
        return sum + (it.price + l.optionsPrice) * l.qty;
      }, 0),
    [cart, itemById],
  );

  const discount = subtotal >= 20 ? subtotal * 0.1 : 0;
  const tipNum = Math.max(0, Number.parseFloat(tip) || 0);
  const zoneInfo = resolveZone(postcode);
  const deliveryFee =
    mode === "pickup" || subtotal === 0
      ? 0
      : zoneInfo.zone === 1
        ? 1.5
        : zoneInfo.zone === 2
          ? 2.5
          : 2.5;
  const total = Math.max(0, subtotal - discount + deliveryFee + tipNum);
  const discountProgress = Math.min(100, (subtotal / 20) * 100);
  const remainingForDiscount = Math.max(0, 20 - subtotal);

  // ── Cart ops ───────────────────────────────────────────────────────────────
  function addLineDirect(item: MenuItem) {
    if (!item.available) return;
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.itemId === item.id && lineHasNoOptions(l));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [
        ...prev,
        {
          lineId: uid(),
          itemId: item.id,
          qty: 1,
          options: emptyOptions(),
          optionsPrice: 0,
        },
      ];
    });
  }

  function addCustomLine(item: MenuItem, options: ItemOptions, optionsPrice: number) {
    setCart((prev) => [
      ...prev,
      { lineId: uid(), itemId: item.id, qty: 1, options, optionsPrice },
    ]);
  }

  function incLine(lineId: string) {
    setCart((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + 1 } : l)),
    );
  }

  function decLine(lineId: string) {
    setCart((prev) =>
      prev.flatMap((l) =>
        l.lineId === lineId ? (l.qty <= 1 ? [] : [{ ...l, qty: l.qty - 1 }]) : [l],
      ),
    );
  }

  function onAddClick(item: MenuItem) {
    if (!item.available) return;
    const cfg = modalConfigFor(item.category);
    if (!cfg) {
      addLineDirect(item);
      return;
    }
    setModalItem(item);
  }

  // ── Checkout ───────────────────────────────────────────────────────────────
  function startCheckout() {
    setFormError(null);
    if (!name.trim() || !phone.trim()) {
      setFormError(t.requireName);
      return;
    }
    if (mode === "delivery" && !address.trim()) {
      setFormError(t.requireAddress);
      return;
    }
    if (payment === "ideal") {
      setIdealOpen(true);
    } else {
      runProcessing(2000);
    }
  }

  function confirmIdealBank() {
    setIdealOpen(false);
    runProcessing(3000);
  }

  function runProcessing(ms: number) {
    setProcessing(true);
    window.setTimeout(() => {
      void saveOrder();
    }, ms);
  }

  async function saveOrder() {
    const minutes = mode === "delivery" ? 30 : 12;
    const ready =
      when === "schedule" && scheduleTime
        ? scheduleTime
        : hhmm(new Date(Date.now() + minutes * 60_000));

    if (!isSupabaseConfigured) {
      // Offline demo: fabricate an order number + confirmation.
      setProcessing(false);
      setConfirmation({
        orderNumber: 1000 + Math.floor(Math.random() * 900),
        readyTime: ready,
        minutes,
      });
      setCart([]);
      setLeaveAtDoor(false);
      setInstructions("");
      return;
    }

    const itemsJson = cart.map((l) => {
      const it = itemById.get(l.itemId)!;
      return {
        id: it.id,
        slug: it.slug,
        name: it.name.nl,
        qty: l.qty,
        price: it.price + l.optionsPrice,
        options: l.options,
      };
    });

    const payload = {
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_address: mode === "delivery" ? address.trim() : null,
      postcode: mode === "delivery" ? postcode.replace(/\s/g, "") || null : null,
      order_type: mode,
      items: itemsJson,
      subtotal: round2(subtotal),
      delivery_fee: round2(deliveryFee),
      tip: round2(tipNum),
      discount: round2(discount),
      total: round2(total),
      status: "new" as const,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(payload)
      .select("order_number")
      .single();

    setProcessing(false);

    if (error || !data) {
      setFormError(error?.message ?? "Er ging iets mis bij het plaatsen van je bestelling.");
      return;
    }

    setConfirmation({ orderNumber: data.order_number, readyTime: ready, minutes });
    // Reset cart + form
    setCart([]);
    setLeaveAtDoor(false);
    setInstructions("");
  }

  // ── Grouped menu ───────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map<Category, MenuItem[]>();
    for (const c of CATEGORY_ORDER) map.set(c, []);
    for (const it of items) {
      const c = it.category as Category;
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(it);
    }
    return CATEGORY_ORDER.filter((c) => (map.get(c)?.length ?? 0) > 0).map((c) => ({
      category: c,
      items: map.get(c)!,
    }));
  }, [items]);

  const cartCount = cart.reduce((n, l) => n + l.qty, 0);

  function scrollToCategory(c: Category) {
    document.getElementById(`cat-${c}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top utility bar ── */}
      <div className="bg-charcoal text-white text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-4">
            <a href="tel:0707200097" className="flex items-center gap-1.5 hover:text-royal-red">
              <Phone className="size-3.5" /> 070 720 0097
            </a>
            <span className="hidden items-center gap-1.5 sm:flex text-white/80">
              <MapPin className="size-3.5" /> {t.address}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-white/80 sm:inline">{t.open}</span>
            <div className="flex overflow-hidden rounded-full border border-white/20">
              {(["nl", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-2.5 py-0.5 text-[11px] font-bold uppercase",
                    lang === l ? "bg-royal-gold text-white" : "text-white/70",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a href="#top" className="text-lg font-extrabold tracking-tight">
            KRAL DURUM <span className="italic text-royal-gold">·TO GO</span>
          </a>
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-royal-gold text-royal-gold" />
              ))}
            </div>
            <span className="text-sm font-semibold">
              5.0 <span className="text-muted-foreground">(44 Google)</span>
            </span>
            <span className="flex items-center gap-1 rounded-full bg-royal-gold-soft px-2.5 py-1 text-xs font-semibold text-royal-gold">
              <Heart className="size-3.5 fill-current" /> {t.happy}
            </span>
          </div>
          <Button
            variant="charcoal"
            className="rounded-full"
            onClick={() => scrollToCategory("wraps")}
          >
            {t.bestelNu} ›
          </Button>
        </div>
      </header>

      <main id="top">
        {orderingClosed && (
          <div className="bg-royal-gold px-4 py-3 text-center text-sm font-semibold text-white">
            {t.closed}
          </div>
        )}

        {/* ── Autoplay tandır intro (explodes into the menu) ── */}
        <CinematicIntro />

        {/* ── Menu + cart (ambient tandır-lit background) ── */}
        <section className="relative overflow-hidden bg-[#0d0a08]">
          {/* Soft, self-running fire flicker — as if lit by the tandır. Not
              tied to the cursor; pure CSS, pauses under reduced-motion. */}
          <div
            className="kd-flicker pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 70% at 50% 108%, rgba(255,110,40,0.22), transparent 60%), radial-gradient(90% 50% at 18% 100%, rgba(255,150,60,0.12), transparent 55%), radial-gradient(90% 50% at 82% 100%, rgba(255,90,30,0.12), transparent 55%)",
            }}
            aria-hidden
          />
          {/* Slowly drifting embers (self-running canvas, low opacity) */}
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <EmberField />
          </div>
          {/* Readability veil so cards + text always contrast the embers */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.6) 100%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-7xl px-4 py-12">
            {/* Category tabs */}
            <div className="sticky top-[57px] z-30 -mx-4 mb-6 overflow-x-auto border-b border-white/10 bg-black/60 px-4 py-2 backdrop-blur">
              <div className="flex gap-2">
                {grouped.map(({ category }) => (
                  <button
                    key={category}
                    onClick={() => scrollToCategory(category)}
                    className="whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-white/90 hover:border-royal-gold hover:text-royal-gold"
                  >
                    {CATEGORY_LABELS[category][lang]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Menu list */}
              <div className="lg:col-span-2">
                {loading ? (
                  <div className="flex items-center justify-center py-20 text-white/70">
                    <Loader2 className="mr-2 size-5 kd-spin" /> Menu laden…
                  </div>
                ) : grouped.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/20 p-10 text-center text-white/70">
                    {isSupabaseConfigured
                      ? "Nog geen menu-items gevonden. Voeg ze toe in Supabase."
                      : t.noBackend}
                  </div>
                ) : (
                  grouped.map(({ category, items: catItems }, catIdx) => (
                    <Reveal
                      key={category}
                      index={catIdx}
                      className="mb-10 scroll-mt-28 block"
                    >
                      <div id={`cat-${category}`}>
                        <h2 className="mb-4 font-serif text-2xl uppercase tracking-wide text-white">
                          {CATEGORY_LABELS[category][lang]}
                        </h2>
                        <div className="space-y-3">
                          {catItems.map((item, i) => (
                            <Reveal key={item.id} index={i} className="block">
                              <MenuCard
                                item={item}
                                lang={lang}
                                t={t}
                                onAdd={() => onAddClick(item)}
                              />
                            </Reveal>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  ))
                )}
              </div>

            {/* Cart sidebar */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-20">
                <CartSidebar
                  t={t}
                  lang={lang}
                  cart={cart}
                  itemById={itemById}
                  mode={mode}
                  when={when}
                  setWhen={setWhen}
                  scheduleTime={scheduleTime}
                  setScheduleTime={setScheduleTime}
                  subtotal={subtotal}
                  discount={discount}
                  deliveryFee={deliveryFee}
                  tip={tip}
                  setTip={setTip}
                  tipNum={tipNum}
                  total={total}
                  discountProgress={discountProgress}
                  remainingForDiscount={remainingForDiscount}
                  payment={payment}
                  setPayment={setPayment}
                  incLine={incLine}
                  decLine={decLine}
                  name={name}
                  setName={setName}
                  phone={phone}
                  setPhone={setPhone}
                  address={address}
                  setAddress={setAddress}
                  postcode={postcode}
                  setPostcode={setPostcode}
                  leaveAtDoor={leaveAtDoor}
                  setLeaveAtDoor={setLeaveAtDoor}
                  instructions={instructions}
                  setInstructions={setInstructions}
                  formError={formError}
                  orderingClosed={orderingClosed}
                  onPlaceOrder={startCheckout}
                />
              </div>
            </aside>
            </div>
          </div>
        </section>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-charcoal text-white">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(900px 400px at 80% 20%, rgba(192,57,43,0.55), transparent), radial-gradient(700px 500px at 90% 90%, rgba(211,84,0,0.4), transparent)",
            }}
          />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
            <div className="flex flex-col justify-center">
              <span className="mb-4 text-xs font-bold uppercase tracking-wider text-royal-gold">
                {t.eyebrow}
              </span>
              <h1 className="text-4xl font-black leading-[0.95] sm:text-6xl">
                {t.heroLine1}
                <br />
                {t.heroLine2}
                <br />
                <span className="italic text-royal-gold">{t.heroLine3}</span>
              </h1>
              <p className="mt-5 max-w-md text-white/75">{t.heroSub}</p>

              {/* Mode toggle + postcode */}
              <div className="mt-7 max-w-md rounded-2xl bg-charcoal-soft p-3 shadow-xl ring-1 ring-white/10">
                <div className="mb-3 flex rounded-full bg-black/40 p-1">
                  {(["delivery", "pickup"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={cn(
                        "flex-1 rounded-full py-2 text-sm font-bold transition",
                        mode === m ? "bg-black text-white" : "text-white/70",
                      )}
                    >
                      {m === "delivery" ? t.delivery : t.pickup}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder={t.postcodePh}
                    className="min-w-0 flex-1 rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-charcoal outline-none ring-2 ring-transparent focus:ring-royal-gold"
                  />
                  <Button onClick={checkPostcode}>{t.check}</Button>
                </div>
                {zoneMessage && (
                  <p
                    className={cn(
                      "mt-2 text-sm font-medium",
                      zoneMessage.kind === 0 ? "text-royal-red" : "text-white",
                    )}
                  >
                    {zoneMessage.text}
                  </p>
                )}
              </div>
            </div>
            <div className="hidden items-center justify-center md:flex">
              <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-3xl bg-gradient-to-br from-[#7a1d10] to-[#d35400] text-[10rem] shadow-2xl">
                🌯
              </div>
            </div>
          </div>
        </section>

        {/* ── Delivery zone band ── */}
        <section className="relative isolate min-h-[420px] overflow-hidden">
          <iframe
            title="Bezorggebied Den Haag"
            src={MAPS_SRC}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="pointer-events-none absolute inset-0 bg-charcoal/30" />
          <div className="relative mx-auto flex max-w-7xl items-center px-4 py-16">
            <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
              <h3 className="text-xl font-extrabold">{t.zoneTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.zoneSub}</p>
              <div className="mt-4 flex gap-2">
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder={t.postcodePh}
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-royal-gold"
                />
                <Button onClick={checkPostcode}>{t.check}</Button>
              </div>
              {zoneMessage && (
                <p
                  className={cn(
                    "mt-2 text-sm font-medium",
                    zoneMessage.kind === 0 ? "text-royal-gold" : "text-foreground",
                  )}
                >
                  {zoneMessage.text}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-royal-gold-soft px-3 py-1 text-xs font-bold text-royal-gold">
                  <span className="size-2 rounded-full bg-royal-gold" /> {t.zone1Chip}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-royal-red-soft px-3 py-1 text-xs font-bold text-charcoal">
                  <span className="size-2 rounded-full bg-royal-red" /> {t.zone2Chip}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Story banner ── */}
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-4 rounded-2xl bg-royal-gold-soft px-5 py-4">
            <Flame className="size-7 shrink-0 text-royal-gold" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-royal-gold">
                {t.storyEyebrow}
              </p>
              <p className="text-sm font-medium text-charcoal">{t.story}</p>
            </div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section className="mx-auto max-w-5xl px-4 py-12 text-center">
          <div className="mb-1 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5 fill-royal-gold text-royal-gold" />
            ))}
          </div>
          <div className="text-6xl font-black">5.0</div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.reviewsEyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
            {t.reviewsTitle}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-2xl bg-card p-6 text-left shadow-sm ring-1 ring-border">
                <div className="mb-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-royal-gold text-royal-gold" />
                  ))}
                </div>
                <p className="italic text-foreground/90">“{r.quote}”</p>
                <p className="mt-3 text-sm font-bold">
                  {r.name}{" "}
                  <span className="font-medium text-muted-foreground">· {r.label}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-royal-gold-soft px-4 py-2 text-sm font-bold text-royal-gold">
            <Heart className="size-4 fill-current" /> {t.happy}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-charcoal text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3">
            <div>
              <div className="text-lg font-extrabold">
                KRAL DURUM <span className="italic text-royal-gold">·TO GO</span>
              </div>
              <p className="mt-2 max-w-xs text-sm text-white/70">{t.story}</p>
              <a
                href="tel:0707200097"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold"
              >
                <Phone className="size-4" /> {lang === "nl" ? "Bel" : "Call"} 070 720 0097
              </a>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/60">
                {t.openTimes}
              </p>
              <p className="text-sm text-white/85">{t.maza}</p>
              <p className="text-sm text-white/85">{t.zo}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/60">
                {t.location}
              </p>
              <p className="text-sm text-white/85">Paul Krugerlaan 28</p>
              <p className="text-sm text-white/85">2571 HK Den Haag</p>
              <a
                href="https://www.google.com/maps?q=Paul+Krugerlaan+28+Den+Haag"
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm font-semibold text-royal-gold"
              >
                {t.route} ›
              </a>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 border-t border-white/10 py-4 text-center text-xs text-white/50">
            <span>© 2025 Kral Durum Den Haag</span>
            <span aria-hidden>·</span>
            <Link to="/admin" className="font-semibold text-white/70 hover:text-royal-gold">
              Admin
            </Link>
          </div>
        </footer>
      </main>

      {/* Mobile cart count chip */}
      {cartCount > 0 && (
        <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-30 flex justify-center lg:hidden">
          <div className="pointer-events-auto rounded-full bg-royal-gold px-5 py-2.5 text-sm font-bold text-white shadow-xl">
            {cartCount} {lang === "nl" ? "in winkelwagen" : "in cart"} · {euro(total)}
          </div>
        </div>
      )}

      {/* ── Customisation modal ── */}
      {modalItem && (
        <CustomizeModal
          item={modalItem}
          lang={lang}
          t={t}
          onClose={() => setModalItem(null)}
          onAdd={(options, optionsPrice) => {
            addCustomLine(modalItem, options, optionsPrice);
            setModalItem(null);
          }}
        />
      )}

      {/* ── iDEAL bank picker ── */}
      {idealOpen && (
        <Overlay onClose={() => setIdealOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold">{t.kiesBank}</h3>
              <button onClick={() => setIdealOpen(false)} className="rounded-full p-1 hover:bg-secondary">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {IDEAL_BANKS.map((b) => (
                <button
                  key={b}
                  onClick={confirmIdealBank}
                  className="rounded-lg border border-border px-3 py-3 text-sm font-semibold hover:border-ideal hover:bg-secondary"
                >
                  {b}
                </button>
              ))}
            </div>
            <Button
              onClick={confirmIdealBank}
              className="mt-4 w-full bg-ideal text-white hover:brightness-110"
              size="lg"
            >
              {t.betaalNu} {euro(total)}
            </Button>
          </div>
        </Overlay>
      )}

      {/* ── Processing spinner ── */}
      {processing && (
        <Overlay>
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-10 py-12">
            <Loader2 className="size-10 kd-spin text-royal-gold" />
            <p className="font-semibold">{t.processing}</p>
          </div>
        </Overlay>
      )}

      {/* ── Confirmation ── */}
      {confirmation && (
        <ConfirmationOverlay
          t={t}
          orderNumber={confirmation.orderNumber}
          readyTime={confirmation.readyTime}
          minutes={confirmation.minutes}
          onClose={() => setConfirmation(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Menu card
// ─────────────────────────────────────────────────────────────────────────────

function MenuCard({
  item,
  lang,
  t,
  onAdd,
}: {
  item: MenuItem;
  lang: Lang;
  t: Translation;
  onAdd: () => void;
}) {
  const soldOut = !item.available;
  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm transition",
        soldOut ? "opacity-60" : "hover:shadow-md",
      )}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl sm:size-28">
        <img src={item.image} alt={item.name[lang]} className="h-full w-full object-cover" />
        {item.popular && !soldOut && (
          <span className="absolute left-1 top-1 rounded-full bg-royal-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
            {t.mostOrdered}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-1.5 font-bold leading-tight">
            {item.name[lang]}
            {item.spicy && <Flame className="size-3.5 text-royal-gold" />}
          </h3>
          <span className="shrink-0 font-extrabold">{euro(item.price)}</span>
        </div>
        {item.desc[lang] && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.desc[lang]}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          {soldOut ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold uppercase text-muted-foreground">
              {t.soldOut}
            </span>
          ) : (
            <span />
          )}
          <button
            onClick={onAdd}
            disabled={soldOut}
            aria-label={t.add}
            className={cn(
              "flex size-9 items-center justify-center rounded-full bg-charcoal text-white transition",
              soldOut ? "cursor-not-allowed opacity-40" : "hover:bg-charcoal-soft active:scale-95",
            )}
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart sidebar
// ─────────────────────────────────────────────────────────────────────────────

type CartSidebarProps = {
  t: Translation;
  lang: Lang;
  cart: CartLine[];
  itemById: Map<string, MenuItem>;
  mode: Mode;
  when: When;
  setWhen: (w: When) => void;
  scheduleTime: string;
  setScheduleTime: (s: string) => void;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tip: string;
  setTip: (s: string) => void;
  tipNum: number;
  total: number;
  discountProgress: number;
  remainingForDiscount: number;
  payment: PaymentMethod;
  setPayment: (p: PaymentMethod) => void;
  incLine: (id: string) => void;
  decLine: (id: string) => void;
  name: string;
  setName: (s: string) => void;
  phone: string;
  setPhone: (s: string) => void;
  address: string;
  setAddress: (s: string) => void;
  postcode: string;
  setPostcode: (s: string) => void;
  leaveAtDoor: boolean;
  setLeaveAtDoor: (b: boolean) => void;
  instructions: string;
  setInstructions: (s: string) => void;
  formError: string | null;
  orderingClosed: boolean;
  onPlaceOrder: () => void;
};

const PAYMENTS: { id: PaymentMethod; label: string }[] = [
  { id: "ideal", label: "IDEAL" },
  { id: "applepay", label: "PAY" },
  { id: "googlepay", label: "G PAY" },
  { id: "cash", label: "CONTANT" },
];

function CartSidebar(p: CartSidebarProps) {
  const { t } = p;
  const empty = p.cart.length === 0;
  const etaBadge = p.mode === "delivery" ? "25–35m" : "10–15m";

  function lineLabel(l: CartLine): string {
    const it = p.itemById.get(l.itemId);
    return it ? it.name[p.lang] : "—";
  }

  function lineUnit(l: CartLine): number {
    const it = p.itemById.get(l.itemId);
    return (it?.price ?? 0) + l.optionsPrice;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-charcoal px-4 py-3 text-white">
        <span className="text-sm font-extrabold tracking-wide">{t.yourOrder}</span>
        <span className="rounded-full bg-royal-gold px-2.5 py-1 text-xs font-bold">{etaBadge}</span>
      </div>

      <div className="space-y-4 p-4">
        {/* When */}
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {t.when}
          </p>
          <div className="flex rounded-full bg-secondary p-1">
            {(["asap", "schedule"] as When[]).map((w) => (
              <button
                key={w}
                onClick={() => p.setWhen(w)}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-xs font-bold transition",
                  p.when === w ? "bg-card text-royal-gold shadow-sm" : "text-muted-foreground",
                )}
              >
                {w === "asap" ? t.asap : t.schedule}
              </button>
            ))}
          </div>
          {p.when === "schedule" && (
            <input
              type="time"
              value={p.scheduleTime}
              onChange={(e) => p.setScheduleTime(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-royal-gold"
            />
          )}
        </div>

        {/* Lines */}
        {empty ? (
          <p className="rounded-xl bg-secondary px-4 py-6 text-center text-sm text-muted-foreground">
            {t.emptyCart}
          </p>
        ) : (
          <ul className="space-y-2">
            {p.cart.map((l) => (
              <li key={l.lineId} className="flex items-start gap-2 rounded-xl bg-secondary/60 p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{lineLabel(l)}</p>
                  <OptionsSummary options={l.options} />
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {euro(lineUnit(l))} {l.qty > 1 ? `× ${l.qty}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => p.decLine(l.lineId)}
                    className="flex size-6 items-center justify-center rounded-full bg-card ring-1 ring-border hover:bg-secondary"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm font-bold">{l.qty}</span>
                  <button
                    onClick={() => p.incLine(l.lineId)}
                    className="flex size-6 items-center justify-center rounded-full bg-card ring-1 ring-border hover:bg-secondary"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Discount progress */}
        {p.mode === "delivery" && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-muted-foreground">{t.discountLabel}</span>
              {p.remainingForDiscount > 0 ? (
                <span className="text-royal-red">
                  {euro(p.remainingForDiscount)} {t.teGaan}
                </span>
              ) : (
                <span className="text-royal-gold">✓ -10%</span>
              )}
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-royal-gold transition-all"
                style={{ width: `${p.discountProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Customer details */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={p.name}
              onChange={(e) => p.setName(e.target.value)}
              placeholder={t.name}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-royal-gold"
            />
            <input
              value={p.phone}
              onChange={(e) => p.setPhone(e.target.value)}
              placeholder={t.phone}
              inputMode="tel"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-royal-gold"
            />
          </div>
          {p.mode === "delivery" && (
            <>
              <input
                value={p.address}
                onChange={(e) => p.setAddress(e.target.value)}
                placeholder={t.addressField}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-royal-gold"
              />
              <input
                value={p.postcode}
                onChange={(e) => p.setPostcode(e.target.value)}
                placeholder={t.postcodeField}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-royal-gold"
              />
            </>
          )}
        </div>

        {/* Payment */}
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {t.payMethod}
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {PAYMENTS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => p.setPayment(pm.id)}
                className={cn(
                  "rounded-lg py-2 text-[11px] font-bold transition",
                  p.payment === pm.id
                    ? "bg-charcoal text-white"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/70",
                )}
              >
                {pm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tip */}
        {p.mode === "delivery" && (
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t.tipLabel}
            </p>
            <div className="flex items-center rounded-lg border border-border bg-background px-3 focus-within:border-royal-gold">
              <span className="text-sm text-muted-foreground">€</span>
              <input
                type="number"
                min="0"
                step="0.50"
                value={p.tip}
                onChange={(e) => p.setTip(e.target.value)}
                onBlur={(e) =>
                  p.setTip((Number.parseFloat(e.target.value) || 0).toFixed(2))
                }
                className="w-full bg-transparent px-2 py-2 text-sm outline-none"
              />
            </div>
          </div>
        )}

        {/* Leave at door */}
        {p.mode === "delivery" && (
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={p.leaveAtDoor}
                onChange={(e) => p.setLeaveAtDoor(e.target.checked)}
                className="size-4 accent-[var(--royal-gold)]"
              />
              {t.leaveAtDoor}
            </label>
            <textarea
              value={p.instructions}
              onChange={(e) => p.setInstructions(e.target.value)}
              placeholder={t.instructionsPh}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-royal-gold"
            />
          </div>
        )}

        {/* Totals */}
        <div className="space-y-1 border-t border-border pt-3 text-sm">
          <Row label={t.subtotal} value={euro(p.subtotal)} />
          {p.discount > 0 && (
            <Row label={t.discount} value={`-${euro(p.discount)}`} accent />
          )}
          {p.mode === "delivery" && (
            <Row
              label={t.deliveryFee}
              value={p.deliveryFee === 0 ? t.free : euro(p.deliveryFee)}
            />
          )}
          {p.tipNum > 0 && <Row label={t.tip} value={euro(p.tipNum)} />}
          <div className="flex items-center justify-between pt-1 text-base font-extrabold">
            <span>{t.totalLabel}</span>
            <span>{euro(p.total)}</span>
          </div>
        </div>

        {p.formError && (
          <p className="rounded-lg bg-royal-gold-soft px-3 py-2 text-sm font-medium text-royal-gold">
            {p.formError}
          </p>
        )}

        <Button
          onClick={p.onPlaceOrder}
          disabled={empty || p.orderingClosed}
          size="lg"
          className="w-full"
        >
          {t.placeOrder} ›
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", accent && "text-royal-gold")}>{value}</span>
    </div>
  );
}

function OptionsSummary({ options }: { options: ItemOptions }) {
  const parts: string[] = [];
  if (options.patatRijst) parts.push(options.patatRijst);
  if (options.spies?.length) parts.push(options.spies.join(", "));
  if (options.extraSpies?.length) parts.push(`+ ${options.extraSpies.join(", ")}`);
  if (options.sauces.length) parts.push(options.sauces.join(", "));
  if (options.salades.length) parts.push(options.salades.join(", "));
  if (options.extras.length) parts.push(options.extras.join(", "));
  if (options.drank) parts.push(options.drank);
  if (options.note) parts.push(`“${options.note}”`);
  if (parts.length === 0) return null;
  return <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{parts.join(" · ")}</p>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Customisation modal
// ─────────────────────────────────────────────────────────────────────────────

function CustomizeModal({
  item,
  lang,
  t,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  lang: Lang;
  t: Translation;
  onClose: () => void;
  onAdd: (options: ItemOptions, optionsPrice: number) => void;
}) {
  const cfg = modalConfigFor(item.category)!;
  const spiesCount = spiesCountFor(item.slug);
  const showSpies = spiesCount > 0;
  const showExtraSpies = allowsExtraSpies(item.slug);
  const reqPaid = requiredSpiesArePaid(item.slug);

  const [patatRijst, setPatatRijst] = useState<"Patat" | "Rijst" | undefined>(
    cfg.patatRijst ? "Patat" : undefined,
  );
  const [sauces, setSauces] = useState<string[]>([]);
  const [salades, setSalades] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [drank, setDrank] = useState<string | undefined>(cfg.drank ? DRANK_OPTS[0] : undefined);
  const [note, setNote] = useState("");
  const [spies, setSpies] = useState<string[]>(
    Array.from({ length: spiesCount }, () => SPIES_OPTS[0].name),
  );
  const [extraSpies, setExtraSpies] = useState<string[]>([]);

  function toggleMax2(list: string[], value: string, set: (v: string[]) => void) {
    if (list.includes(value)) set(list.filter((v) => v !== value));
    else if (list.length < 2) set([...list, value]);
  }

  const saladeExtra = salades.reduce(
    (s, name) => s + (SALAD_OPTS.find((o) => o.name === name)?.price ?? 0),
    0,
  );
  const bakjeExtra = extras.length * BAKJE_PRICE;
  const extraSpiesExtra = extraSpies.reduce((s, n) => s + spiesPrice(n), 0);
  const reqSpiesExtra = reqPaid ? spies.reduce((s, n) => s + spiesPrice(n), 0) : 0;
  const optionsPrice = saladeExtra + bakjeExtra + extraSpiesExtra + reqSpiesExtra;
  const unitPrice = item.price + optionsPrice;

  function handleAdd() {
    const options: ItemOptions = {
      patatRijst: cfg.patatRijst ? patatRijst : undefined,
      sauces,
      salades,
      extras,
      drank: cfg.drank ? drank : undefined,
      note: note.trim() || undefined,
      spies: showSpies ? spies : undefined,
      extraSpies: showExtraSpies ? extraSpies : undefined,
    };
    onAdd(options, round2(optionsPrice));
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card">
        {/* Header */}
        <div className="relative flex items-start gap-3 border-b border-border p-4">
          <img src={item.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1 pr-8">
            <h3 className="font-extrabold leading-tight">{item.name[lang]}</h3>
            {item.desc[lang] && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{item.desc[lang]}</p>
            )}
            <p className="mt-1 font-bold">{euro(item.price)}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1 hover:bg-secondary"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {cfg.patatRijst && (
            <Section title={t.patatRijstTitle}>
              <div className="grid grid-cols-2 gap-2">
                {(["Patat", "Rijst"] as const).map((v) => (
                  <ChoiceChip
                    key={v}
                    active={patatRijst === v}
                    onClick={() => setPatatRijst(v)}
                    label={v}
                  />
                ))}
              </div>
            </Section>
          )}

          {showSpies && (
            <Section title={t.spiesTitle} hint={reqPaid ? t.required : t.gratis}>
              <div className="space-y-2">
                {spies.map((sel, idx) => (
                  <div key={idx} className="flex flex-wrap gap-1.5">
                    {SPIES_OPTS.map((opt) => (
                      <ChoiceChip
                        key={opt.name}
                        active={sel === opt.name}
                        onClick={() =>
                          setSpies((prev) => prev.map((v, i) => (i === idx ? opt.name : v)))
                        }
                        label={opt.name}
                        suffix={reqPaid ? `+${euro(opt.price)}` : undefined}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {showExtraSpies && (
            <Section title={t.extraSpiesTitle} hint={t.optioneel}>
              <div className="space-y-1.5">
                {SPIES_OPTS.map((opt) => (
                  <OptionRow
                    key={opt.name}
                    label={opt.name}
                    price={`+${euro(opt.price)}`}
                    checked={extraSpies.includes(opt.name)}
                    onToggle={() =>
                      setExtraSpies((prev) =>
                        prev.includes(opt.name)
                          ? prev.filter((v) => v !== opt.name)
                          : [...prev, opt.name],
                      )
                    }
                  />
                ))}
              </div>
            </Section>
          )}

          {cfg.saus && (
            <Section title={t.sausTitle} hint={t.kiesMax2}>
              <div className="grid grid-cols-2 gap-2">
                {SAUCE_OPTS.map((s) => (
                  <CheckboxRow
                    key={s}
                    label={s}
                    checked={sauces.includes(s)}
                    onToggle={() => toggleMax2(sauces, s, setSauces)}
                  />
                ))}
              </div>
            </Section>
          )}

          {cfg.salade && (
            <Section title={t.saladeTitle} hint={t.kiesMax2}>
              <div className="grid grid-cols-2 gap-2">
                {SALAD_OPTS.map((s) => (
                  <CheckboxRow
                    key={s.name}
                    label={s.name}
                    suffix={s.price > 0 ? `+${euro(s.price)}` : undefined}
                    checked={salades.includes(s.name)}
                    onToggle={() => toggleMax2(salades, s.name, setSalades)}
                  />
                ))}
              </div>
            </Section>
          )}

          {cfg.bakje && (
            <Section title={t.bakjeTitle} hint={t.optioneel}>
              <div className="space-y-1.5">
                {BAKJE_OPTS.map((b) => (
                  <OptionRow
                    key={b}
                    label={b}
                    price={`+${euro(BAKJE_PRICE)}`}
                    checked={extras.includes(b)}
                    onToggle={() =>
                      setExtras((prev) =>
                        prev.includes(b) ? prev.filter((v) => v !== b) : [...prev, b],
                      )
                    }
                  />
                ))}
              </div>
            </Section>
          )}

          {cfg.drank && (
            <Section title={t.drankTitle}>
              <div className="grid grid-cols-2 gap-2">
                {DRANK_OPTS.map((d) => (
                  <ChoiceChip key={d} active={drank === d} onClick={() => setDrank(d)} label={d} />
                ))}
              </div>
            </Section>
          )}

          <Section title={t.noteTitle}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.notePh}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-royal-gold"
            />
          </Section>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <Button onClick={handleAdd} size="lg" className="w-full">
            {t.addToOrder} — {euro(unitPrice)}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-bold">{title}</h4>
        {hint && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ChoiceChip({
  active,
  onClick,
  label,
  suffix,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  suffix?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm font-medium transition",
        active
          ? "border-royal-gold bg-royal-gold-soft text-royal-gold"
          : "border-border hover:bg-secondary",
      )}
    >
      {label}
      {suffix && <span className="ml-1 text-xs text-muted-foreground">{suffix}</span>}
    </button>
  );
}

function CheckboxRow({
  label,
  suffix,
  checked,
  onToggle,
}: {
  label: string;
  suffix?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-royal-gold has-[:checked]:bg-royal-gold-soft">
      <span className="flex items-center gap-2">
        <input type="checkbox" checked={checked} onChange={onToggle} className="size-4 accent-[var(--royal-gold)]" />
        {label}
      </span>
      {suffix && <span className="text-xs font-semibold text-royal-gold">{suffix}</span>}
    </label>
  );
}

function OptionRow({
  label,
  price,
  checked,
  onToggle,
}: {
  label: string;
  price: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5 text-sm has-[:checked]:border-royal-gold has-[:checked]:bg-royal-gold-soft">
      <span className="flex items-center gap-2">
        <input type="checkbox" checked={checked} onChange={onToggle} className="size-4 accent-[var(--royal-gold)]" />
        {label}
      </span>
      <span className="text-xs font-semibold text-royal-gold">{price}</span>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overlays
// ─────────────────────────────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}

function ConfirmationOverlay({
  t,
  orderNumber,
  readyTime,
  minutes,
  onClose,
}: {
  t: Translation;
  orderNumber: number | string;
  readyTime: string;
  minutes: number;
  onClose: () => void;
}) {
  const [left, setLeft] = useState(minutes * 60);
  useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");

  return (
    <Overlay onClose={onClose}>
      <div className="rounded-2xl bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-royal-gold-soft text-royal-gold">
          <PartyPopper className="size-8" />
        </div>
        <h3 className="flex items-center justify-center gap-2 text-xl font-extrabold">
          <Check className="size-5 text-royal-gold" /> {t.orderPlaced}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.orderNumber}: <span className="font-bold text-foreground">#{orderNumber}</span>
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3">
          <Clock className="size-5 text-royal-gold" />
          <span className="font-semibold">
            {t.readyAt} {readyTime}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {t.countdown}{" "}
          <span className="font-bold text-foreground">
            {mm}:{ss}
          </span>{" "}
          {t.minutes}
        </p>
        <Button onClick={onClose} variant="charcoal" className="mt-5 w-full" size="lg">
          {t.newOrder}
        </Button>
      </div>
    </Overlay>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
