import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  LogOut,
  Loader2,
  Check,
  X,
  Clock,
  ShoppingBag,
  Euro,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, euro } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { OrderStatus, OrderItemJson } from "@/integrations/supabase/types";
import { CATEGORY_ORDER, CATEGORY_LABELS, type Category } from "@/data/menu";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type OrderRow = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  postcode: string | null;
  order_type: "delivery" | "pickup";
  items: OrderItemJson[];
  subtotal: number;
  delivery_fee: number;
  tip: number;
  discount: number;
  total: number;
  status: OrderStatus;
  ready_minutes: number | null;
  created_at: string;
};

type MenuRow = {
  id: string;
  slug: string;
  name_nl: string;
  price: number;
  category: string;
  sort_order: number;
  available: boolean;
};

const COLUMNS: { status: OrderStatus; label: string; ring: string; head: string }[] = [
  { status: "new", label: "NIEUW", ring: "ring-amber-300", head: "bg-amber-50 text-amber-700" },
  { status: "accepted", label: "GEACCEPTEERD", ring: "ring-yellow-300", head: "bg-yellow-50 text-yellow-700" },
  { status: "ready", label: "KLAAR", ring: "ring-emerald-300", head: "bg-emerald-50 text-emerald-700" },
  { status: "delivered", label: "BEZORGD / AFGEHAALD", ring: "ring-zinc-300", head: "bg-zinc-100 text-zinc-600" },
];

const ACCEPT_MINUTES = [15, 20, 30, 45, 60];

type Tab = "orders" | "menu" | "settings";

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) void supabase.rpc("claim_admin_if_first");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 kd-spin text-royal-gold" />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <CenteredCard>
        <p className="text-sm text-muted-foreground">
          Supabase is nog niet geconfigureerd. Vul <code>.env</code> in met je
          <code> VITE_SUPABASE_URL</code> en <code>VITE_SUPABASE_ANON_KEY</code>.
        </p>
      </CenteredCard>
    );
  }

  if (!session) return <Login />;
  return <Dashboard session={session} />;
}

// ── Login ────────────────────────────────────────────────────────────────────

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl">{children}</div>
    </div>
  );
}

function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setInfo(
            "Account aangemaakt. Bevestig je e-mail (of schakel e-mailbevestiging uit in Supabase) en log daarna in.",
          );
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <CenteredCard>
      <div className="mb-5 text-center">
        <div className="text-xl font-extrabold">
          KRAL DURUM <span className="text-royal-red">·ADMIN</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Log in om bestellingen te beheren" : "Maak je beheeraccount aan"}
        </p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-royal-gold"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wachtwoord"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-royal-gold"
        />
        {error && <p className="text-sm font-medium text-royal-gold">{error}</p>}
        {info && <p className="text-sm font-medium text-emerald-600">{info}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="size-4 kd-spin" /> : mode === "login" ? "Inloggen" : "Account aanmaken"}
        </Button>
      </form>
      <button
        onClick={() => {
          setMode((m) => (m === "login" ? "signup" : "login"));
          setError(null);
          setInfo(null);
        }}
        className="mt-4 w-full text-center text-sm font-semibold text-royal-gold hover:underline"
      >
        {mode === "login" ? "Eerste keer? Maak account aan" : "Heb je al een account? Inloggen"}
      </button>
    </CenteredCard>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [menu, setMenu] = useState<MenuRow[]>([]);
  const [orderingClosed, setOrderingClosed] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const [ordersRes, menuRes, settingsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("menu_items").select("id,slug,name_nl,price,category,sort_order,available").order("category").order("sort_order"),
      supabase.from("settings").select("ordering_closed").eq("id", 1).maybeSingle(),
    ]);
    setOrders((ordersRes.data as OrderRow[]) ?? []);
    setMenu((menuRes.data as MenuRow[]) ?? []);
    setOrderingClosed(Boolean(settingsRes.data?.ordering_closed));
    setLoading(false);
  }

  useEffect(() => {
    void loadAll();
    const channel = supabase
      .channel("admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => void loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, () => void loadAll())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  // ── Order actions ──
  async function acceptOrder(id: string, minutes: number) {
    await supabase.from("orders").update({ status: "accepted", ready_minutes: minutes }).eq("id", id);
  }
  async function rejectOrder(id: string) {
    await supabase.from("orders").delete().eq("id", id);
  }
  async function setStatus(id: string, status: OrderStatus) {
    await supabase.from("orders").update({ status }).eq("id", id);
  }

  // ── Menu actions ──
  async function toggleAvailable(id: string, available: boolean) {
    setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, available } : m)));
    await supabase.from("menu_items").update({ available }).eq("id", id);
  }

  // ── Settings ──
  async function toggleClosed(closed: boolean) {
    setOrderingClosed(closed);
    await supabase.from("settings").update({ ordering_closed: closed }).eq("id", 1);
  }

  // ── Today's stats ──
  const stats = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const today = orders.filter((o) => new Date(o.created_at) >= start);
    const revenue = today.reduce((s, o) => s + Number(o.total), 0);
    return {
      count: today.length,
      revenue,
      avg: today.length ? revenue / today.length : 0,
    };
  }, [orders]);

  const byStatus = (s: OrderStatus) => orders.filter((o) => o.status === s);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-charcoal text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="text-lg font-extrabold">
            KRAL DURUM <span className="text-royal-red">·ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                orderingClosed ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300",
              )}
            >
              <span className={cn("size-2 rounded-full", orderingClosed ? "bg-red-400" : "bg-emerald-400")} />
              {orderingClosed ? "Gesloten" : "✓ Open"}
            </span>
            <span className="hidden text-sm text-white/70 sm:inline">{session.user.email}</span>
            <button
              onClick={() => void supabase.auth.signOut()}
              className="rounded-full p-2 hover:bg-white/10"
              aria-label="Uitloggen"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="mx-auto flex max-w-7xl gap-6 px-4">
          {(
            [
              ["orders", "BESTELLINGEN"],
              ["menu", "MENU BEHEER"],
              ["settings", "INSTELLINGEN"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "relative py-3 text-sm font-bold tracking-wide transition",
                tab === id ? "text-white" : "text-white/50 hover:text-white/80",
              )}
            >
              {label}
              {tab === id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-royal-gold" />}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 size-5 kd-spin" /> Laden…
          </div>
        ) : tab === "orders" ? (
          <>
            {/* Stats */}
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <StatCard
                icon={<ShoppingBag className="size-5" />}
                label="Bestellingen vandaag"
                value={String(stats.count)}
              />
              <StatCard
                icon={<Euro className="size-5" />}
                label="Omzet vandaag"
                value={euro(stats.revenue)}
                highlight
              />
              <StatCard
                icon={<TrendingUp className="size-5" />}
                label="Gem. bestelling"
                value={euro(stats.avg)}
              />
            </div>

            {/* Kanban */}
            <div className="grid gap-4 lg:grid-cols-4">
              {COLUMNS.map((col) => {
                const colOrders = byStatus(col.status);
                return (
                  <div key={col.status} className={cn("rounded-2xl bg-card ring-1", col.ring)}>
                    <div className={cn("flex items-center justify-between rounded-t-2xl px-4 py-2.5 text-xs font-bold tracking-wide", col.head)}>
                      <span>{col.label}</span>
                      <span className="rounded-full bg-white/70 px-2 py-0.5">{colOrders.length}</span>
                    </div>
                    <div className="space-y-3 p-3">
                      {colOrders.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted-foreground">Geen bestellingen</p>
                      ) : (
                        colOrders.map((o) => (
                          <OrderCard
                            key={o.id}
                            order={o}
                            onAccept={acceptOrder}
                            onReject={rejectOrder}
                            onStatus={setStatus}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : tab === "menu" ? (
          <MenuManager menu={menu} onToggle={toggleAvailable} />
        ) : (
          <SettingsPanel orderingClosed={orderingClosed} onToggle={toggleClosed} />
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4 shadow-sm ring-1",
        highlight ? "bg-royal-red text-white ring-transparent" : "bg-card ring-border",
      )}
    >
      <div className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-wider", highlight ? "text-white/80" : "text-muted-foreground")}>
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

function OrderCard({
  order,
  onAccept,
  onReject,
  onStatus,
}: {
  order: OrderRow;
  onAccept: (id: string, minutes: number) => void;
  onReject: (id: string) => void;
  onStatus: (id: string, status: OrderStatus) => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const created = new Date(order.created_at).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-border bg-background p-3 text-sm shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-extrabold">#{order.order_number}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" /> {created}
        </span>
      </div>
      <p className="mt-1 font-semibold">{order.customer_name}</p>
      <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
      <p className="text-xs text-muted-foreground">
        {order.order_type === "delivery"
          ? `${order.customer_address ?? ""} ${order.postcode ?? ""}`.trim() || "Bezorgen"
          : "Afhalen"}
      </p>

      <ul className="mt-2 space-y-0.5 border-t border-border pt-2 text-xs">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between gap-2">
            <span className="truncate">
              {it.qty}× {it.name}
            </span>
            <span className="shrink-0 text-muted-foreground">{euro(it.price * it.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-bold">
        <span>Totaal</span>
        <span>{euro(Number(order.total))}</span>
      </div>
      {order.ready_minutes != null && order.status !== "new" && (
        <p className="mt-1 text-xs text-emerald-600">Klaar in ~{order.ready_minutes} min</p>
      )}

      {/* Actions */}
      <div className="mt-3">
        {order.status === "new" &&
          (accepting ? (
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase text-muted-foreground">Klaar over…</p>
              <div className="flex flex-wrap gap-1.5">
                {ACCEPT_MINUTES.map((m) => (
                  <button
                    key={m}
                    onClick={() => onAccept(order.id, m)}
                    className="rounded-md bg-charcoal px-2.5 py-1.5 text-xs font-bold text-white hover:bg-charcoal-soft"
                  >
                    {m}m
                  </button>
                ))}
                <button
                  onClick={() => setAccepting(false)}
                  className="rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
                >
                  Annuleer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => setAccepting(true)}>
                <Check className="size-4" /> Accepteer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-royal-gold"
                onClick={() => onReject(order.id)}
              >
                <X className="size-4" /> Weiger
              </Button>
            </div>
          ))}

        {order.status === "accepted" && (
          <Button size="sm" variant="charcoal" className="w-full" onClick={() => onStatus(order.id, "ready")}>
            Markeer als Klaar
          </Button>
        )}
        {order.status === "ready" && (
          <Button size="sm" variant="charcoal" className="w-full" onClick={() => onStatus(order.id, "delivered")}>
            {order.order_type === "delivery" ? "Markeer als Bezorgd" : "Markeer als Afgehaald"}
          </Button>
        )}
      </div>
    </div>
  );
}

function MenuManager({ menu, onToggle }: { menu: MenuRow[]; onToggle: (id: string, v: boolean) => void }) {
  const grouped = useMemo(() => {
    const map = new Map<string, MenuRow[]>();
    for (const m of menu) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({ category: c, rows: map.get(c)! }));
  }, [menu]);

  return (
    <div className="space-y-6">
      {grouped.map(({ category, rows }) => (
        <div key={category}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {CATEGORY_LABELS[category as Category][nlOr(category)]}
          </h3>
          <div className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-border">
            {rows.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-semibold">{m.name_nl}</p>
                  <p className="text-xs text-muted-foreground">{euro(Number(m.price))}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-xs font-bold uppercase",
                      m.available ? "text-emerald-600" : "text-amber-600",
                    )}
                  >
                    {m.available ? "Beschikbaar" : "Uitverkocht"}
                  </span>
                  <Toggle checked={m.available} onChange={(v) => onToggle(m.id, v)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsPanel({
  orderingClosed,
  onToggle,
}: {
  orderingClosed: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-card p-5 ring-1 ring-border">
        <div>
          <p className="font-bold">Sluit bestellen</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Zet online bestellen uit. Klanten zien direct een gesloten-banner op de site.
          </p>
        </div>
        <Toggle checked={orderingClosed} onChange={onToggle} danger />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  danger,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  const on = danger ? checked : checked;
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition",
        on ? (danger ? "bg-red-500" : "bg-emerald-500") : "bg-zinc-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
          on ? "left-[1.375rem]" : "left-0.5",
        )}
      />
    </button>
  );
}

function nlOr(_c: string): "nl" {
  return "nl";
}
