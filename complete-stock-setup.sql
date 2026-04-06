-- Complete SQL setup for stock management system
-- Run ALL of these commands in your Supabase SQL Editor

-- 1. Add stock_quantity columns (if not already done)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER;

ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER;

-- 2. Add status column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 3. Create RPC functions for stock management

-- Function to decrement variant stock
CREATE OR REPLACE FUNCTION decrement_variant_stock(variant_id UUID, quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only decrement if stock_quantity is not null (unlimited stock stays unlimited)
  UPDATE product_variants 
  SET stock_quantity = stock_quantity - quantity
  WHERE id = variant_id 
    AND stock_quantity IS NOT NULL 
    AND stock_quantity >= quantity;
    
  -- Check if update actually happened (stock was sufficient)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for variant %', variant_id;
  END IF;
END;
$$;

-- Function to decrement product stock  
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id UUID, quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only decrement if stock_quantity is not null (unlimited stock stays unlimited)
  UPDATE products 
  SET stock_quantity = stock_quantity - quantity
  WHERE id = product_id 
    AND stock_quantity IS NOT NULL 
    AND stock_quantity >= quantity;
    
  -- Check if update actually happened (stock was sufficient)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', product_id;
  END IF;
END;
$$;

-- 4. Optional: Add helpful comments
COMMENT ON COLUMN products.stock_quantity IS 'Stock quantity for non-variant products. NULL = unlimited stock';
COMMENT ON COLUMN product_variants.stock_quantity IS 'Stock quantity per variant. NULL = unlimited stock';
COMMENT ON COLUMN orders.status IS 'Order status: pending, completed, cancelled';
