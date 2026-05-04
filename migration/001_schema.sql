-- =============================================================
-- Schema bootstrap for external Supabase project
-- Target: clwjecqqmjbjcpivvgmd
-- Run this FIRST in the new project's SQL Editor.
-- Then run 002_data.sql, then 003_storage.sql.
-- =============================================================

BEGIN;

-- Extensions ---------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums --------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','editor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================
-- TABLES
-- =============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  name         text NOT NULL,
  telugu_name  text,
  description  text,
  image_url    text,
  sort_order   integer NOT NULL DEFAULT 0,
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  name         text NOT NULL,
  description  text,
  cover_image  text,
  featured     boolean NOT NULL DEFAULT false,
  sort_order   integer NOT NULL DEFAULT 0,
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.banners (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text,
  subtitle    text,
  image_url   text NOT NULL,
  cta_label   text,
  cta_link    text,
  sort_order  integer NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.offers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text,
  image_url    text,
  badge        text,
  valid_until  date,
  sort_order   integer NOT NULL DEFAULT 0,
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  name             text NOT NULL,
  description      text,
  category_id      uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  collection_id    uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  metal            text,
  weight_grams     numeric,
  occasion         text,
  stones           text,
  phone_number     text,
  whatsapp_number  text,
  enquiry_message  text,
  price_min        numeric,
  price_max        numeric,
  images           jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured         boolean NOT NULL DEFAULT false,
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products (active, featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON public.products (collection_id);

CREATE TABLE IF NOT EXISTS public.store_info (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL DEFAULT 'Lal Raja Gold And Diamond Jewellery',
  address         text NOT NULL,
  phone           text NOT NULL,
  whatsapp        text NOT NULL,
  email           text,
  map_embed_url   text,
  hours           jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery         jsonb NOT NULL DEFAULT '[]'::jsonb,
  announcement    text,
  instagram_url   text,
  facebook_url    text,
  youtube_url     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  message     text NOT NULL,
  rating      integer NOT NULL DEFAULT 5,
  occasion    text,
  photo_url   text,
  sort_order  integer NOT NULL DEFAULT 0,
  approved    boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  phone             text NOT NULL,
  email             text,
  preferred_date    date,
  appointment_type  text NOT NULL DEFAULT 'general',
  notes             text,
  status            text NOT NULL DEFAULT 'new',
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enquiries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text,
  phone       text,
  message     text NOT NULL,
  product_id  uuid REFERENCES public.products(id) ON DELETE SET NULL,
  status      text NOT NULL DEFAULT 'new',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  phone       text,
  full_name   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.app_role NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.admin_access_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  email        text NOT NULL,
  message      text,
  status       text NOT NULL DEFAULT 'pending',
  reviewed_by  uuid,
  reviewed_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_access_requests_status
  ON public.admin_access_requests (status, created_at DESC);

-- =============================================================
-- FUNCTIONS
-- =============================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','editor')
  )
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid)                  TO authenticated, anon;

-- =============================================================
-- TRIGGERS
-- =============================================================

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories','collections','banners','offers','products',
    'store_info','testimonials','profiles','admin_access_requests'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%1$s_set_updated_at ON public.%1$I;
       CREATE TRIGGER trg_%1$s_set_updated_at
       BEFORE UPDATE ON public.%1$I
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t);
  END LOOP;
END $$;

-- New user → profile trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_info            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_access_requests ENABLE ROW LEVEL SECURITY;

-- categories
DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT USING (active = true OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff write categories" ON public.categories;
CREATE POLICY "Staff write categories" ON public.categories
  FOR ALL USING (public.is_staff(auth.uid()))
         WITH CHECK (public.is_staff(auth.uid()));

-- collections
DROP POLICY IF EXISTS "Public read active collections" ON public.collections;
CREATE POLICY "Public read active collections" ON public.collections
  FOR SELECT USING (active = true OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff write collections" ON public.collections;
CREATE POLICY "Staff write collections" ON public.collections
  FOR ALL USING (public.is_staff(auth.uid()))
         WITH CHECK (public.is_staff(auth.uid()));

-- banners
DROP POLICY IF EXISTS "Public read active banners" ON public.banners;
CREATE POLICY "Public read active banners" ON public.banners
  FOR SELECT USING (active = true OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff write banners" ON public.banners;
CREATE POLICY "Staff write banners" ON public.banners
  FOR ALL USING (public.is_staff(auth.uid()))
         WITH CHECK (public.is_staff(auth.uid()));

-- offers
DROP POLICY IF EXISTS "Public read active offers" ON public.offers;
CREATE POLICY "Public read active offers" ON public.offers
  FOR SELECT USING (active = true OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff write offers" ON public.offers;
CREATE POLICY "Staff write offers" ON public.offers
  FOR ALL USING (public.is_staff(auth.uid()))
         WITH CHECK (public.is_staff(auth.uid()));

-- products
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (active = true OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff write products" ON public.products;
CREATE POLICY "Staff write products" ON public.products
  FOR ALL USING (public.is_staff(auth.uid()))
         WITH CHECK (public.is_staff(auth.uid()));

-- store_info
DROP POLICY IF EXISTS "Public read store info" ON public.store_info;
CREATE POLICY "Public read store info" ON public.store_info
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff write store info" ON public.store_info;
CREATE POLICY "Staff write store info" ON public.store_info
  FOR ALL USING (public.is_staff(auth.uid()))
         WITH CHECK (public.is_staff(auth.uid()));

-- testimonials
DROP POLICY IF EXISTS "Public read approved testimonials" ON public.testimonials;
CREATE POLICY "Public read approved testimonials" ON public.testimonials
  FOR SELECT USING (approved = true OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff write testimonials" ON public.testimonials;
CREATE POLICY "Staff write testimonials" ON public.testimonials
  FOR ALL USING (public.is_staff(auth.uid()))
         WITH CHECK (public.is_staff(auth.uid()));

-- appointments
DROP POLICY IF EXISTS "Anyone submits appointments" ON public.appointments;
CREATE POLICY "Anyone submits appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    char_length(name)  BETWEEN 1 AND 100
    AND char_length(phone) BETWEEN 1 AND 20
    AND (notes IS NULL OR char_length(notes) <= 1000)
  );
DROP POLICY IF EXISTS "Staff read appointments"   ON public.appointments;
CREATE POLICY "Staff read appointments"   ON public.appointments FOR SELECT USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff update appointments" ON public.appointments;
CREATE POLICY "Staff update appointments" ON public.appointments FOR UPDATE USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff delete appointments" ON public.appointments;
CREATE POLICY "Staff delete appointments" ON public.appointments FOR DELETE USING (public.is_staff(auth.uid()));

-- enquiries
DROP POLICY IF EXISTS "Anyone submits enquiries" ON public.enquiries;
CREATE POLICY "Anyone submits enquiries" ON public.enquiries
  FOR INSERT WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(message) BETWEEN 1 AND 2000
  );
DROP POLICY IF EXISTS "Staff read enquiries"   ON public.enquiries;
CREATE POLICY "Staff read enquiries"   ON public.enquiries FOR SELECT USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff update enquiries" ON public.enquiries;
CREATE POLICY "Staff update enquiries" ON public.enquiries FOR UPDATE USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff delete enquiries" ON public.enquiries;
CREATE POLICY "Staff delete enquiries" ON public.enquiries FOR DELETE USING (public.is_staff(auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Profiles viewable by self or admin" ON public.profiles;
CREATE POLICY "Profiles viewable by self or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- user_roles
DROP POLICY IF EXISTS "Users see own roles" ON public.user_roles;
CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
         WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- admin_access_requests
DROP POLICY IF EXISTS "Users can insert own access request" ON public.admin_access_requests;
CREATE POLICY "Users can insert own access request" ON public.admin_access_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own access request" ON public.admin_access_requests;
CREATE POLICY "Users can view own access request" ON public.admin_access_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update access requests" ON public.admin_access_requests;
CREATE POLICY "Admins can update access requests" ON public.admin_access_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete access requests" ON public.admin_access_requests;
CREATE POLICY "Admins can delete access requests" ON public.admin_access_requests
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

COMMIT;
