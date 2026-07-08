-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Kral Durum menu (matches the product photos in src/assets/products/).
-- Idempotent — re-run safe (upsert on slug).
--
-- NOTE: prices are PLACEHOLDERS — adjust to the real menu before going live.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.menu_items
  (slug, name_nl, name_en, description_nl, description_en, price, category, sort_order, is_popular, available)
values
  -- wraps ---------------------------------------------------------------------
  ('wrap-kipfilet',       'Wrap Kipfilet',       'Chicken Fillet Wrap', 'Gegrilde kipfilet in verse lavash.',        'Grilled chicken fillet in fresh lavash.',  7.50, 'wraps', 1, true,  true),
  ('wrap-kippenvleugels', 'Wrap Kippenvleugels', 'Chicken Wings Wrap',  'Gegrilde kippenvleugels, lavash en saus.',  'Grilled chicken wings, lavash and sauce.', 8.00, 'wraps', 2, false, true),
  ('wrap-adana',          'Wrap Adana',          'Adana Wrap',          'Pittige adana gehaktspies in lavash.',      'Spicy adana minced skewer in lavash.',     8.00, 'wraps', 3, true,  true),
  ('wrap-lamsvlees',      'Wrap Lamsvlees',      'Lamb Wrap',           'Mals lamsvlees in verse lavash.',           'Tender lamb in fresh lavash.',             8.50, 'wraps', 4, false, true),

  -- menus ---------------------------------------------------------------------
  ('menu-kipfilet',       'Menu Kipfilet',       'Chicken Fillet Menu', 'Wrap kipfilet + patat of rijst + drank.',       'Chicken fillet wrap + fries or rice + drink.', 11.00, 'menus', 1, true,  true),
  ('menu-kippenvleugels', 'Menu Kippenvleugels', 'Chicken Wings Menu',  'Wrap kippenvleugels + patat of rijst + drank.', 'Chicken wings wrap + fries or rice + drink.',  11.50, 'menus', 2, false, true),
  ('menu-adana',          'Menu Adana',          'Adana Menu',          'Wrap adana + patat of rijst + drank.',          'Adana wrap + fries or rice + drink.',          11.50, 'menus', 3, false, true),
  ('menu-lamsvlees',      'Menu Lamsvlees',      'Lamb Menu',           'Wrap lamsvlees + patat of rijst + drank.',      'Lamb wrap + fries or rice + drink.',           12.00, 'menus', 4, false, true),
  ('kral-box',            'Kral Box',            'Kral Box',            'Onze signature box met spies naar keuze.',      'Our signature box with a skewer of choice.',   14.50, 'menus', 5, true,  true),

  -- schotels ------------------------------------------------------------------
  ('schotel-1',   'Schotel 1 · Kipfilet', 'Plate 1 · Chicken Fillet', 'Patat of rijst, salade en 1 spies naar keuze.',  'Fries or rice, salad and 1 skewer of choice.',  12.50, 'schotels', 1, false, true),
  ('schotel-2',   'Schotel 2 Spiezen',    'Plate · 2 Skewers',        'Patat of rijst, salade en 2 spiezen naar keuze.', 'Fries or rice, salad and 2 skewers of choice.', 15.50, 'schotels', 2, false, true),
  ('schotel-mix', 'Schotel Mix',          'Mixed Plate',              'Patat of rijst, salade en 2 spiezen (mix).',      'Fries or rice, salad and 2 mixed skewers.',     15.00, 'schotels', 3, true,  true),

  -- losse ---------------------------------------------------------------------
  ('patat',      'Patat / Friet', 'Fries',       'Verse patat.',                          'Fresh fries.',                           3.00, 'losse', 1, false, true),
  ('rijst',      'Rijst',         'Rice',        'Kruidige rijst.',                       'Seasoned rice.',                         3.50, 'losse', 2, false, true),
  ('linzensoep', 'Linzensoep',    'Lentil Soup', 'Huisgemaakte linzensoep.',              'House-made lentil soup.',                4.50, 'losse', 3, false, true),
  ('zuur',       'Zuur',          'Pickles',     'Turks tafelzuur.',                      'Turkish pickles.',                       1.50, 'losse', 4, false, true),
  ('cacik',      'Cacık',         'Cacık',       'Yoghurt met komkommer en knoflook.',    'Yoghurt with cucumber and garlic.',      2.50, 'losse', 5, false, true),

  -- dranken -------------------------------------------------------------------
  ('cola',                 'Coca-Cola',             'Coca-Cola',             null, null, 2.50, 'dranken', 1,  false, true),
  ('cola-zero',            'Coca-Cola Zero',        'Coca-Cola Zero',        null, null, 2.50, 'dranken', 2,  false, true),
  ('pepsi',                'Pepsi',                 'Pepsi',                 null, null, 2.50, 'dranken', 3,  false, true),
  ('fanta-orange',         'Fanta Orange',          'Fanta Orange',          null, null, 2.50, 'dranken', 4,  false, true),
  ('fanta-straw-kiwi',     'Fanta Strawberry Kiwi', 'Fanta Strawberry Kiwi', null, null, 2.50, 'dranken', 5,  false, true),
  ('fanta-lemon-zero',     'Fanta Lemon Zero',      'Fanta Lemon Zero',      null, null, 2.50, 'dranken', 6,  false, true),
  ('fanta-exotic',         'Fanta Exotic',          'Fanta Exotic',          null, null, 2.50, 'dranken', 7,  false, true),
  ('sprite-zero',          'Sprite Zero',           'Sprite Zero',           null, null, 2.50, 'dranken', 8,  false, true),
  ('energy',               'Energy Drink',          'Energy Drink',          null, null, 3.00, 'dranken', 9,  false, true),
  ('capri-sun',            'Capri-Sun',             'Capri-Sun',             null, null, 2.00, 'dranken', 10, false, true),
  ('kizilay',              'Kızılay',               'Kızılay Sparkling',     'Bruisend mineraalwater.', 'Sparkling mineral water.', 2.50, 'dranken', 11, false, true),
  ('water',                'Munzur Water 0,5L',     'Munzur Water 0.5L',     'Natuurlijk bronwater.', 'Natural spring water.', 2.00, 'dranken', 12, false, true),
  ('ayran',                'Yayık Ayran',           'Yayık Ayran',           'Romige yoghurtdrank, 250 ml.', 'Creamy yoghurt drink, 250 ml.', 2.00, 'dranken', 13, false, true),
  ('ayran-kers',           'Ayran Kers',            'Cherry Ayran',          'Yoghurtdrank met kers, 250 ml.', 'Cherry yoghurt drink, 250 ml.', 2.50, 'dranken', 14, false, true),
  ('ayran-raibi-pistache', 'Raïbi Pistache',        'Raïbi Pistachio',       'Kefir-yoghurtdrank met pistache, 250 ml.', 'Kefir yoghurt drink with pistachio, 250 ml.', 2.50, 'dranken', 15, false, true),
  ('raibi-granaatappel',   'Raïbi Granaatappel',    'Raïbi Pomegranate',     'Kefir-yoghurtdrank met granaatappel, 250 ml.', 'Kefir yoghurt drink with pomegranate, 250 ml.', 2.50, 'dranken', 16, false, true)
on conflict (slug) do update set
  name_nl = excluded.name_nl,
  name_en = excluded.name_en,
  description_nl = excluded.description_nl,
  description_en = excluded.description_en,
  price = excluded.price,
  category = excluded.category,
  sort_order = excluded.sort_order,
  is_popular = excluded.is_popular;

-- Remove the old placeholder items that aren't part of this menu.
delete from public.menu_items where slug in (
  'kip-durum', 'lams-durum', 'mix-durum', 'adana-durum', 'falafel-durum', 'veggie-durum',
  'kip-menu', 'lams-menu', 'mix-menu', 'schotel-3', 'kapsalon',
  'kipnuggets', 'frikandel', 'loempia', 'kaassouffle',
  'extra-lavash', 'extra-vlees', 'portie-saus', 'fanta',
  'knoflooksaus', 'sambal', 'chilisaus', 'katjangsaus'
);
