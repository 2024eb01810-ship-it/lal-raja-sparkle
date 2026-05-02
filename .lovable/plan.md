## Goal

Re-skin the home page (and global header) to closely match the Malabar Gold & Diamonds reference — same structure, color language, and section rhythm — while keeping our existing data, routes, and brand name "Lal Raja".

Note: We will mirror the **layout and visual style**, not copy their logo, photography, or trademarks. Hero/product imagery will continue to come from your CMS (Banners, Categories, Products).

## Reference layout (top to bottom)

```text
[ Pink/magenta top bar | Logo · Search · Stores · Wishlist · Bag · Account ]
[ White sub-bar       | Nav links ............................. Live Gold Rate · Set Location ]
[ HERO slideshow      | Necklace cut-out left · Big serif word + tagline + Shop Now · dots ]
[ Shop By Category    | 6 rounded image tiles, horizontal scroll · "View all →" ]
[ Featured Pieces     | 4-up product grid ]
[ Featured Collections / Bridal / Offers / Legacy / Testimonials / Instagram ]
```

## Changes

### 1. Header (`src/components/layout/Header.tsx`)

- Two-row header on desktop:
  - **Row 1 (magenta `--brand` bar):** logo + brand name (white), centered search input ("What are you looking for today?"), right-side icon group (Stores, Phone, WhatsApp, Menu).
  - **Row 2 (white):** primary nav links left, **Live Gold Rate** chip + **Set Location** pill right.
- On mobile: single magenta bar with logo + hamburger + WhatsApp; search collapses into a full-width row underneath; nav goes into the existing slide-down menu.
- Sticky behavior preserved; z-index tokens unchanged.

### 2. Color system (`src/index.css`, `tailwind.config.ts`)

- Add a new brand palette alongside the existing gold tokens (do not remove gold — it remains the accent for buttons/badges):
  - `--brand` magenta `330 75% 38%`
  - `--brand-foreground` `0 0% 100%`
  - `--brand-soft` `330 60% 96%` (section tints)
- All values in HSL, exposed as Tailwind colors `brand`, `brand-foreground`, `brand-soft`.
- Buttons get a `brand` variant (filled magenta, white text, subtle shadow) and a `brand-outline` variant for the cream "Shop Now" hero CTA.

### 3. Hero (`src/components/home/HeroSlideshow.tsx`)

- New layout per slide:
  - Full-bleed background image (banner from CMS).
  - Left third: product/necklace cut-out (uses banner `secondary_image_url`; falls back gracefully to a single image).
  - Right third: large serif display word (banner title), thin caption line, 2-line tagline, cream rounded **Shop Now** CTA.
- Pagination dots centered under the slide (active dot in magenta).
- Keeps the existing skeleton + retry logic from the previous pass.

### 4. New "Shop By Category" rail (`src/components/home/CategoryScroller.tsx`)

- Section header: bold sans **"Shop By Category"** left, **"View all →"** link right (magenta).
- Rounded-rectangle tiles (~`aspect-[3/4]`) with category image and label overlay; horizontal scroll on mobile, 6-up grid on desktop.

### 5. Other home sections

- `FeaturedCollections`, `BridalHighlight`, `OffersStrip`, `LegacyBlock`, `TestimonialsCarousel`, `InstagramGrid`: keep current content, restyle headings to match (bold sans title + magenta "View all →" link, generous padding, `brand-soft` alternating background).
- `SectionHeading` component updated to support the new title/link pattern.

### 6. Live Gold Rate chip

- Static placeholder for now ("Live Gold Rate · ₹—/g (22kt)") wired to read from `site_settings` if present in `useContent`. Real feed can be added later via an edge function.

## Out of scope

- E-commerce features (cart, wishlist, account) — icons render but link to existing pages or are decorative.
- Multi-language and location selector logic.
- Live gold-price integration (placeholder only).

## Files to touch

- `src/index.css` — add brand HSL tokens, brand-soft section utility.
- `tailwind.config.ts` — register `brand`, `brand-foreground`, `brand-soft`.
- `src/components/layout/Header.tsx` — two-row magenta header + search + gold-rate chip.
- `src/components/home/HeroSlideshow.tsx` — split-layout hero with serif display word and cream CTA.
- `src/components/home/CategoryScroller.tsx` — Malabar-style tile rail with "View all".
- `src/components/common/SectionHeading.tsx` — title + right-aligned link variant.
- `src/components/home/FeaturedCollections.tsx`, `BridalHighlight.tsx`, `OffersStrip.tsx`, `LegacyBlock.tsx`, `TestimonialsCarousel.tsx`, `InstagramGrid.tsx` — heading + spacing pass.
- `src/pages/Index.tsx` — minor spacing/order tweaks only.

Approve this and I'll implement it in one pass.