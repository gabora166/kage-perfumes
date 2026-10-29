# KAGE brand configuration

Provisional Luxury Shinobi identity. Change the visible brand without hunting through components.

## Single source of truth

Edit [`lib/brand.ts`](../lib/brand.ts):

- `brand.name` / `brand.nameAr` — wordmark and SEO site name
- `brand.tagline` / `taglineEn` / `supportLine` / `conceptLine` / `announcement`
- `brand.email` / `brand.city` — contact and city line
- `brandAssets.*` — paths under `public/brand/`
- `storeLinks` — primary navigation
- `collections` — SHADOW / EMBER / MIST / SILK merchandising (mapped to existing families / mood text; no DB schema)

SEO helpers read from `brandSeo` via [`lib/seo/metadata.ts`](../lib/seo/metadata.ts).

## Logo & cinematic assets

| File | Use |
| --- | --- |
| `public/brand/kage-seal-hanko.jpg` | Primary 影 hanko (nav, cards) |
| `public/brand/kage-seal.svg` | SVG with 影 glyph |
| `public/brand/kage-seal-path.svg` | Path-only abstraction (no fonts) |
| `public/brand/kage-seal-light.svg` | Light seal on ivory |
| `public/brand/kage-hero-night.jpg` | Desktop hero landscape |
| `public/brand/kage-hero-night-portrait.jpg` | Mobile hero crop |
| `public/brand/collections/{shadow,ember,mist,silk}.jpg` | Collection atmosphere art |
| `public/brand/favicon.svg` | Favicon |
| `public/brand/kage-avatar.svg` | Social / OG avatar |

Replace these files in place, or update paths in `brandAssets`. Hero art is environmental only — never treat it as product photography.

## Design tokens

[`app/globals.css`](../app/globals.css): Obsidian `#111211`, Seal Red `#8D2028`, Washi Ivory `#EAE2D3`, Brass `#B39A70`, Charcoal `#1A1C1B`, mist `#B8B2A7`, border `#373633`.

Fonts: Cormorant Garamond (EN display), Manrope (EN UI), Alexandria (AR), Noto Sans JP (seal glyph only).

## Cart persistence

LocalStorage key remains `ateeqperfumes.cart` so existing carts are not wiped. Display name is independent of this key.

## Photography still needed

All published products without `images.bottle` continue to show the charcoal illustration with caption «رسم تحريري». Upload real bottle photography in admin; do not treat illustrations as photos.
