-- Update stock functions with improved logic
-- Run these in Supabase SQL Editor

-- Function to decrement variant stock
CREATE OR REPLACE FUNCTION decrement_variant_stock(variant_id UUID, quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Handle quantity = 0 (no change needed)
  IF quantity = 0 THEN
    RETURN;
  END IF;

  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM product_variants
  WHERE id = variant_id;

  -- Check if variant exists and has stock tracking
  IF current_stock IS NULL THEN
    -- Unlimited stock - no change needed
    RETURN;
  END IF;

  -- Check if sufficient stock
  IF current_stock < quantity THEN
    RAISE EXCEPTION 'Insufficient stock for variant %: has % but needs %', variant_id, current_stock, quantity;
  END IF;

  -- Deduct stock
  UPDATE product_variants
  SET stock_quantity = stock_quantity - quantity
  WHERE id = variant_id;

END;
$$;

-- Function to decrement product stock
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id UUID, quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Handle quantity = 0 (no change needed)
  IF quantity = 0 THEN
    RETURN;
  END IF;

  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = product_id;

  -- Check if product exists and has stock tracking
  IF current_stock IS NULL THEN
    -- Unlimited stock - no change needed
    RETURN;
  END IF;

  -- Check if sufficient stock
  IF current_stock < quantity THEN
    RAISE EXCEPTION 'Insufficient stock for product %: has % but needs %', product_id, current_stock, quantity;
  END IF;

  -- Deduct stock
  UPDATE products
  SET stock_quantity = stock_quantity - quantity
  WHERE id = product_id;

END;
$$;
