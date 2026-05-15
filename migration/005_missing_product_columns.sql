-- =============================================================
-- Migration 005 — Add missing product columns
-- Run this in the Supabase SQL Editor.
-- Go to: https://supabase.com → Your Project → SQL Editor → New Query
-- Paste this entire script and click "Run"
-- =============================================================

-- These columns are used by the Add Product form
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS design_style          text,
  ADD COLUMN IF NOT EXISTS short_description     text,
  ADD COLUMN IF NOT EXISTS making_charges        numeric,
  ADD COLUMN IF NOT EXISTS stock_status          text NOT NULL DEFAULT 'In Stock',
  ADD COLUMN IF NOT EXISTS new_arrival           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order            integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meta_title            text,
  ADD COLUMN IF NOT EXISTS meta_description      text;

-- These columns are used by the Price Breakup feature (Migration 004)
-- Safe to run even if already added
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gold_weight_grams               DECIMAL,
  ADD COLUMN IF NOT EXISTS stone_value                     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS making_charges_percent          DECIMAL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS making_charges_discount_percent DECIMAL DEFAULT 0;

-- Used by live gold rate in Price Breakup
ALTER TABLE public.store_info
  ADD COLUMN IF NOT EXISTS gold_rate_22k INTEGER DEFAULT 7500;
