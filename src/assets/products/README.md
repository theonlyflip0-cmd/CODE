# Product photos

Drop product photos here. Each file is picked up automatically and shown on the
storefront, modal and cart (no code changes). A file attaches to a product when
its **basename** equals the product's slug, **or** the slug→file alias in
`PHOTO_FILE_BY_SLUG` (`src/data/menu.ts`) points at it.

Accepted extensions: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`.

## Expected files (your menu)

These match the supplied filenames — keep them exactly as listed:

**Wraps**

- `wrap_kipfilet_feed.png` · `wrap_kippenvleugels_feed.png`
- `wrap_adana_feed.png` · `wrap_lamsflees_feed.png`

**Menu's**

- `menu_kipfilet_feed.png` · `menu_kippenvleugels_feed.png`
- `menu_adana_feed.png` · `menu_lamsvlees_feed.png` · `kralbox_feed.png`

**Schotels**

- `schotel_1_kipfilet_feed.png` · `schotel_2_feed.png` · `schotel_mix_feed.png`

**Losse producten**

- `patat.png` · `rijst.png` · `linzensoep.png` · `zuur.png` · `cacik.png`

**Dranken**

- `cocacola.png` · `cocacola-zero.png` · `pepsi.png`
- `fanta-orange.png` · `fanta-straw-kiwi.png` · `fanta-lemon-zero.png` · `fanta-exotic.png`
- `sprite-zero.png` · `energy.png` · `capri-sun.png` · `kizilay.png`
- `water.png` · `ayran.png` · `ayran-kers.png` · `ayran-raibi-pistache.png` · `raibi-granaatappel.png`

After adding the files: `npm run dev` (live) or `npm run demo` (single-file).
