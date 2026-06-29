# Product photos

Drop a product photo here and name the file after the item's **slug**. It is
picked up automatically (`IMAGE_BY_SLUG` in `src/data/menu.ts`) and replaces the
generated placeholder on the storefront, modal and cart — no code changes.

Accepted extensions: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`.

## Drinks added from product photos

| Photo                         | Filename to save                 | Product (slug)            |
| ----------------------------- | -------------------------------- | ------------------------- |
| Munzur water 0,5 L            | `water.png`                      | Munzur Water (`water`)    |
| Silifke Raïbi Pistache        | `ayran-raibi-pistache.png`       | `ayran-raibi-pistache`    |
| Silifke Raïbi Granaatappel    | `raibi-granaatappel.png`         | `raibi-granaatappel`      |
| Silifke Ayran Kers (cherry)   | `ayran-kers.png`                 | `ayran-kers`              |
| Silifke Yayık Ayran           | `ayran.png`                      | Yayık Ayran (`ayran`)     |

After adding the files: `npm run dev` (live) or `npm run demo` (single-file).
