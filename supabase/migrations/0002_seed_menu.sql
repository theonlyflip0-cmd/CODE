-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Kral Durum menu. Idempotent — re-run safe (upsert on slug).
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.menu_items
  (slug, name_nl, name_en, description_nl, description_en, price, category, sort_order, is_popular, available)
values
  -- wraps ---------------------------------------------------------------------
  ('kip-durum',   'Kip Durum',   'Chicken Durum', 'Houtskool gegrilde kip in verse lavash.', 'Charcoal-grilled chicken in fresh lavash.', 8.50, 'wraps', 1, true,  true),
  ('lams-durum',  'Lamsdurum',   'Lamb Durum',    'Mals lamsvlees, verse lavash en sauzen.', 'Tender lamb, fresh lavash and sauces.',     9.50, 'wraps', 2, false, true),
  ('mix-durum',   'Mix Durum',   'Mix Durum',     'Kip én lam in één wrap.',                  'Chicken and lamb in one wrap.',             9.00, 'wraps', 3, false, true),
  ('adana-durum', 'Adana Durum', 'Adana Durum',   'Pittige gehaktspies, lavash en uitjes.',   'Spicy minced skewer, lavash and onion.',    9.50, 'wraps', 4, true,  true),
  ('falafel-durum','Falafel Durum','Falafel Durum','Knapperige falafel, hummus en salade.',    'Crispy falafel, hummus and salad.',         8.00, 'wraps', 5, false, true),
  ('veggie-durum', 'Veggie Durum','Veggie Durum',  'Gegrilde groenten en huissaus.',           'Grilled veggies and house sauce.',          8.00, 'wraps', 6, false, true),

  -- menus ---------------------------------------------------------------------
  ('kip-menu',  'Kip Menu',  'Chicken Menu', 'Kip durum + patat of rijst + drank.', 'Chicken durum + fries or rice + drink.', 12.50, 'menus', 1, true,  true),
  ('lams-menu', 'Lams Menu', 'Lamb Menu',    'Lamsdurum + patat of rijst + drank.', 'Lamb durum + fries or rice + drink.',    13.50, 'menus', 2, false, true),
  ('mix-menu',  'Mix Menu',  'Mix Menu',     'Mix durum + patat of rijst + drank.', 'Mix durum + fries or rice + drink.',     13.00, 'menus', 3, false, true),
  ('kral-box',  'Kral Box',  'Kral Box',     'Onze signature box met spies naar keuze.', 'Our signature box with a skewer of choice.', 14.50, 'menus', 4, true, true),

  -- schotels ------------------------------------------------------------------
  ('schotel-1', 'Schotel 1 Spies',   'Plate · 1 Skewer',  'Patat of rijst, salade, 1 spies naar keuze (gratis).', 'Fries or rice, salad, 1 free skewer of choice.',  12.50, 'schotels', 1, false, true),
  ('schotel-2', 'Schotel 2 Spiezen', 'Plate · 2 Skewers', 'Patat of rijst, salade, 2 spiezen naar keuze (gratis).','Fries or rice, salad, 2 free skewers of choice.', 15.50, 'schotels', 2, false, true),
  ('schotel-3', 'Schotel 3 Spiezen', 'Plate · 3 Skewers', 'Patat of rijst, salade, 3 spiezen naar keuze (gratis).','Fries or rice, salad, 3 free skewers of choice.', 18.50, 'schotels', 3, true,  true),
  ('kapsalon',  'Kapsalon',          'Kapsalon',          'Patat, vlees, kaas, salade en saus.',                  'Fries, meat, cheese, salad and sauce.',           9.50,  'schotels', 4, true,  true),

  -- losse ---------------------------------------------------------------------
  ('patat',       'Patat / Friet',   'Fries',         'Verse patat.',           'Fresh fries.',           3.00, 'losse', 1, false, true),
  ('kipnuggets',  'Kipnuggets (6st)','Chicken Nuggets','6 krokante nuggets.',    '6 crispy nuggets.',      4.50, 'losse', 2, false, true),
  ('frikandel',   'Frikandel',       'Frikandel',     'Klassieker.',            'A classic.',             2.50, 'losse', 3, false, true),
  ('loempia',     'Loempia',         'Spring Roll',   'Vega loempia.',          'Veggie spring roll.',    2.00, 'losse', 4, false, true),
  ('kaassouffle', 'Kaassoufflé',     'Cheese Soufflé','Smeltende kaas.',        'Melting cheese.',        2.50, 'losse', 5, false, true),

  -- extras --------------------------------------------------------------------
  ('extra-lavash', 'Extra Lavash', 'Extra Lavash', 'Een extra verse lavash.', 'An extra fresh lavash.', 1.50, 'extras', 1, false, true),
  ('extra-vlees',  'Extra Vlees',  'Extra Meat',   'Extra portie vlees.',     'Extra portion of meat.', 3.50, 'extras', 2, false, true),
  ('portie-saus',  'Portie Saus',  'Sauce Portion','Ruime portie saus.',      'A generous portion.',    1.00, 'extras', 3, false, true),

  -- dranken -------------------------------------------------------------------
  ('cola',                  'Cola',                 'Coke',          null, null, 2.50, 'dranken', 1, false, true),
  ('cola-zero',             'Cola Zero',            'Coke Zero',     null, null, 2.50, 'dranken', 2, false, true),
  ('fanta',                 'Fanta Orange',         'Fanta Orange',  null, null, 2.50, 'dranken', 3, false, true),
  ('water',                 'Munzur Water 0,5L',    'Munzur Water 0.5L', 'Natuurlijk bronwater.', 'Natural spring water.', 2.00, 'dranken', 4, false, true),
  ('ayran',                 'Yayık Ayran',          'Yayık Ayran',   'Romige yoghurtdrank, 250 ml.', 'Creamy yoghurt drink, 250 ml.', 2.00, 'dranken', 5, false, true),
  ('ayran-kers',            'Ayran Kers',           'Cherry Ayran',  'Yoghurtdrank met kers, 250 ml.', 'Cherry yoghurt drink, 250 ml.', 2.50, 'dranken', 6, false, true),
  ('ayran-raibi-pistache',  'Raïbi Pistache',       'Raïbi Pistachio', 'Kefir-yoghurtdrank met pistache, 250 ml.', 'Kefir yoghurt drink with pistachio, 250 ml.', 2.50, 'dranken', 7, false, true),
  ('raibi-granaatappel',    'Raïbi Granaatappel',   'Raïbi Pomegranate', 'Kefir-yoghurtdrank met granaatappel, 250 ml.', 'Kefir yoghurt drink with pomegranate, 250 ml.', 2.50, 'dranken', 8, false, true),

  -- sauzen --------------------------------------------------------------------
  ('knoflooksaus', 'Knoflooksaus', 'Garlic Sauce', null, null, 1.00, 'sauzen', 1, false, true),
  ('sambal',       'Sambal',       'Sambal',       null, null, 1.00, 'sauzen', 2, false, true),
  ('chilisaus',    'Chilisaus',    'Chili Sauce',  null, null, 1.00, 'sauzen', 3, false, true),
  ('katjangsaus',  'Katjangsaus',  'Peanut Sauce', null, null, 1.50, 'sauzen', 4, false, true)
on conflict (slug) do update set
  name_nl = excluded.name_nl,
  name_en = excluded.name_en,
  description_nl = excluded.description_nl,
  description_en = excluded.description_en,
  price = excluded.price,
  category = excluded.category,
  sort_order = excluded.sort_order,
  is_popular = excluded.is_popular;
