# Kral Durum · To Go

Online bestel- en bezorgsite voor **Kral Durum Den Haag** — houtskool gegrilde
durum, verse lavash, bezorgen of afhalen. Klantensite + realtime adminbord.

> _Echte vlam. Verse lavash. Tot je deur._

## Stack

- **TanStack Router** (file-based routes) + **React 18** + **TypeScript**, gebouwd met **Vite**.
- **Supabase** (Postgres + Auth + Realtime) als backend.
- **Tailwind CSS v4** (`@theme inline`, oklch tokens) + shadcn/ui-stijl componenten in `src/components/ui`.
- **lucide-react** iconen.

## Routes

| Pad      | Bestand                  | Wat                                                            |
| -------- | ------------------------ | ------------------------------------------------------------- |
| `/`      | `src/routes/index.tsx`   | Volledige klantensite: hero, menu, cart, modal, checkout, betaling, bevestiging. |
| `/admin` | `src/routes/admin.tsx`   | Adminlogin + realtime dashboard.                              |
| (root)   | `src/routes/__root.tsx`  | Root layout / meta.                                           |

De route tree (`src/routeTree.gen.ts`) wordt gegenereerd door de TanStack Router
Vite-plugin; bij `npm run dev` / `npm run build` gebeurt dit automatisch (of
handmatig via `npm run routes`).

## Aan de slag

```bash
npm install
cp .env.example .env     # vul je Supabase-waarden in (zie hieronder)
npm run dev              # http://localhost:5173
```

Build / preview:

```bash
npm run build
npm run preview
```

### Environment

`.env` heeft twee variabelen nodig (Supabase → Project Settings → API):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

> De echte waarden staan in je Lovable `.env` — kopieer ze zelf over. Zonder
> `.env` rendert de site nog steeds, maar laat het menu/bestellen een
> "Supabase niet geconfigureerd"-melding zien.

### Offline demo (single HTML file)

Zonder `.env` draait de app in **demomodus**: de storefront en het adminbord
worden gevuld met voorbeelddata (menu + bestellingen) en zijn volledig
klikbaar, zonder backend. Handig om snel te bekijken.

Een los, zelfstandig HTML-bestand genereren dat je rechtstreeks vanaf schijf
(`file://`) kunt openen:

```bash
npm run demo        # -> kral-durum-demo.html
```

Dat bouwt met hash-routing (`#/`, `#/admin`) en inlinet alle CSS/JS in één
bestand. Open `kral-durum-demo.html` in een browser; klik **Admin** in de footer
(of zet `#/admin` achter de URL) voor het dashboard.

### Database

De Supabase-client staat in `src/integrations/supabase/`. Schema, RLS-policies,
auth-helpers, realtime en de menu-seed staan in `supabase/migrations/`:

- `0001_init.sql` — tabellen (`menu_items`, `settings`, `orders`, `profiles`),
  enums, RLS, `claim_admin_if_first()` + trigger, realtime-publicatie.
- `0002_seed_menu.sql` — het volledige menu (idempotent upsert op `slug`).

Draai ze in je eigen Supabase-project (SQL editor, of `supabase db push`).
Zet e-mailbevestiging in Supabase Auth desgewenst uit zodat het eerste
adminaccount direct kan inloggen.

## Admin

- Ga naar `/admin`, kies **Eerste keer? Maak account aan** en maak je account.
- De **eerste** ingelogde gebruiker wordt automatisch admin
  (`claim_admin_if_first()` promoot zichzelf zolang er nog geen admin is).
- Tabs: **Bestellingen** (realtime kanban: Nieuw → Geaccepteerd → Klaar →
  Bezorgd/Afgehaald, met dagstatistieken), **Menu Beheer** (beschikbaarheid per
  item), **Instellingen** (`Sluit bestellen` → toont direct de gesloten-banner
  op de klantensite via realtime).

## Bezorgzones (Den Haag)

Postcode wordt op de eerste 4 cijfers gematcht: **ZONE 1** → €1,50, **ZONE 2** →
€2,50, daarbuiten → afhalen. Korting: 10% op bezorgbestellingen vanaf €20.

## Design

Warme off-white pagina, charcoal hero/header/cart-blokken, **rood** als
actie-/accentkleur en **goud/amber** als secundaire highlight. Let op de
bewuste kleur-swap in `src/styles.css`: de variabele `--royal-gold` rendert
_rood_ en `--royal-red` rendert _goud_.

## shadcn/ui

`components.json` is geconfigureerd voor Tailwind v4. Nieuwe componenten
toevoegen kan met:

```bash
npx shadcn@latest add <component>
```
