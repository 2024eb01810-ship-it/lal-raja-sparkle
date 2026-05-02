#  Lal Raja Gold And Diamond Jewellery — Phase 1 Plan

A luxury, mobile-first jewelry website for Lal Raja Gold And Diamond Jewellery (Vijayawada). Phase 1 delivers the complete public-facing site with a real Supabase schema and seeded sample content so every page looks production-ready immediately. Phase 2 (separate plan after approval) adds the admin CMS with Admin/Editor roles.

---

## Design system

- **Colors** (HSL tokens in `index.css`): blush `#F2A7BB`, pearl `#FAF8F5`, powder blue `#B8D4E8`, gold `#C9A84C`, charcoal `#1A1A1A`.
- **Typography**: Cormorant Garamond (headings) + Montserrat (body), loaded via Google Fonts; Telugu accents use Noto Serif Telugu.
- **Luxury touches**: gold shimmer hover, sticky blurred header, hero parallax, image zoom on product pages, smooth scroll, fade/scale entrance animations, skeleton loaders, lazy-loaded images.
- **Mobile-first**: every layout designed at 375px first, then scaled up. **Bottom tab navigation** on mobile (Home, Collections, Bridal, Store, Contact) replaces a hamburger. Header collapses to logo + WhatsApp icon on mobile.
- **Always-visible WhatsApp floating button** above the bottom nav on mobile, bottom-right on desktop.

## Pages built in Phase 1

1. **Home** — announcement marquee, hero slideshow with parallax, shop-by-category horizontal scroller, featured collections grid, bridal highlight band, offers strip, brand legacy block, testimonials carousel, Instagram feed grid (static tiles for now), WhatsApp FAB.
2. **Collections** (`/collections` and `/collections/:category`) — filters (metal, occasion, price, type) in a mobile bottom-sheet / desktop sidebar, 2-col mobile / 4-col desktop grid, quick view modal on desktop hover.
3. **Product detail** (`/product/:slug`) — swipeable gallery with zoom, name/description/price range, metal/weight/stone specs, primary "Enquire on WhatsApp" + secondary "Call Now" CTAs (pre-filled message with product name), related products rail. No cart.
4. **Bridal** (`/bridal`) — dedicated hero, bridal sets showcase, "Book Bridal Appointment" form (writes to Supabase `appointments` table), testimonial wall with photos.
5. **Offers** (`/offers`) — current promotions grid, festival specials, exchange-offer details card.
6. **About** (`/about`) — brand story, craftsmanship section, BIS Hallmark / IGI certification badges, master craftsmen.
7. **Store** (`/store`) — Vijayawada address, embedded Google Map, timings table, photo gallery.
8. **Contact** (`/contact`) — WhatsApp + Call CTAs, address card, appointment form, simple message form (writes to Supabase `enquiries`).

A `NotFound` page already exists and stays.

## Supabase schema (created in Phase 1, used by public site, edited via Phase 2 admin)

- `banners` — hero/announcement slides (image, title, subtitle, cta, order, active).
- `categories` — the 7 jewelry categories (slug, name, telugu_name, image, order).
- `collections` — featured collections (slug, name, description, cover_image, featured, order).
- `products` — products (slug, name, description, category_id, collection_id, metal, weight_grams, stones, price_min, price_max, images jsonb, featured, active).
- `offers` — promotions (title, description, image, valid_until, active, order).
- `testimonials` — customer reviews (name, photo, message, rating, occasion, approved).
- `store_info` — singleton row (address, phone, whatsapp, hours jsonb, map_embed, gallery jsonb).
- `appointments` — bridal/general appointment requests (name, phone, date, type, notes).
- `enquiries` — contact-form messages (name, phone, email, message).
- `profiles` + `user_roles` (`app_role` enum: `admin`, `editor`) + `has_role()` security-definer function — created now so Phase 2 admin slots in cleanly.

**RLS**: public `SELECT` on content tables (banners/categories/collections/products/offers/testimonials/store_info) where `active = true`. `INSERT` allowed by anyone on `appointments` and `enquiries` (with length-validated inputs). All write/update/delete restricted to `admin` or `editor` roles via `has_role()`.

Seed data: ~20 sample products across all 7 categories using high-quality Unsplash jewelry placeholders, 3 hero banners, 4 collections, 3 offers, 5 testimonials, store info row.

## Tech details

- **Stack**: existing React + Vite + Tailwind + shadcn. Lovable Cloud for Supabase (auth + DB).
- **Routing**: React Router; routes added above the catch-all in `App.tsx`.
- **Data**: TanStack Query hooks per table (`useBanners`, `useProducts`, etc.) reading from Supabase.
- **WhatsApp link**: `https://wa.me/918184839498?text=...` with URL-encoded product context.
- **SEO**: per-page `<title>`, meta description, OpenGraph tags via a small `<Seo />` helper; JSON-LD `Product` schema on product pages, `LocalBusiness` schema on Store page.
- **Performance**: native `loading="lazy"` + `decoding="async"` on images, skeleton states via shadcn `Skeleton`, route-level code splitting with `React.lazy`.
- **Installability**: simple `manifest.json` with icons + `display: standalone` (no service worker — avoids preview-iframe issues; full offline PWA can be added later if needed).
- **Form validation**: zod schemas on appointment + contact forms, both client and server-enforced length limits.

## Out of scope for Phase 1 (covered in Phase 2)

- `/admin` login, dashboard, and CRUD UIs for banners/products/collections/offers/testimonials/store info.
- Image upload to Supabase Storage from admin (bucket + RLS will be created in Phase 2).
- Role assignment UI (admins managing editors).

## File structure (high level)

```text
src/
  components/
    layout/ Header, BottomNav, Footer, WhatsAppFab, AnnouncementTicker
    home/   HeroSlideshow, CategoryScroller, FeaturedCollections,
            BridalHighlight, OffersStrip, LegacyBlock,
            TestimonialsCarousel, InstagramGrid
    product/ ProductCard, ProductGrid, ProductGallery, FilterSheet
    common/ Seo, Skeletons, SectionHeading
  pages/    Index, Collections, Product, Bridal, Offers, About,
            Store, Contact, NotFound
  hooks/    useBanners, useCategories, useCollections, useProducts,
            useOffers, useTestimonials, useStoreInfo
  lib/      whatsapp.ts, supabase types
```

After approval I'll enable Lovable Cloud, create the schema + seed data, then build the pages top-down (design system → layout shell → Home → remaining pages).