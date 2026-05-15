-- =============================================================
-- Migration 004 — Live Price Breakup fields
-- Run this in the Supabase SQL Editor.
-- =============================================================

-- Add pricing breakdown columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gold_weight_grams           DECIMAL,
  ADD COLUMN IF NOT EXISTS stone_value                 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS making_charges_percent      DECIMAL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS making_charges_discount_percent DECIMAL DEFAULT 0;

-- Add live gold rate to store_info table
ALTER TABLE public.store_info
  ADD COLUMN IF NOT EXISTS gold_rate_22k INTEGER DEFAULT 7500;
