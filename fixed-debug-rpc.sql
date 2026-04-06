-- Fixed debug function for PostgreSQL - run in Supabase SQL Editor

CREATE OR REPLACE FUNCTION debug_decrement_variant_stock(variant_id UUID, quantity INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INTEGER;
  affected_rows INTEGER := 0;
  result_text TEXT := '';
BEGIN
  result_text := result_text || 'Function called with variant_id: ' || variant_id::TEXT || ', quantity: ' || quantity::TEXT || E'\n';
  
  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM product_variants
  WHERE id = variant_id;
  
  result_text := result_text || 'Current stock in DB: ' || COALESCE(current_stock::TEXT, 'NULL') || E'\n';
  
  -- Handle quantity = 0
  IF quantity = 0 THEN
    result_text := result_text || 'Quantity is 0, returning' || E'\n';
    RETURN result_text;
  END IF;
  
  -- Handle unlimited stock
  IF current_stock IS NULL THEN
    result_text := result_text || 'Stock is NULL (unlimited), returning' || E'\n';
    RETURN result_text;
  END IF;
  
  -- Check sufficient stock
  IF current_stock < quantity THEN
    result_text := result_text || 'Insufficient stock: ' || current_stock::TEXT || ' < ' || quantity::TEXT || E'\n';
    RETURN result_text;
  END IF;
  
  -- Attempt update
  result_text := result_text || 'Attempting update...' || E'\n';
  UPDATE product_variants
  SET stock_quantity = stock_quantity - quantity
  WHERE id = variant_id;
  
  -- Check affected rows
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  result_text := result_text || 'Update affected ' || affected_rows::TEXT || ' rows' || E'\n';
  
  -- Check new stock
  SELECT stock_quantity INTO current_stock
  FROM product_variants
  WHERE id = variant_id;
  
  result_text := result_text || 'New stock after update: ' || COALESCE(current_stock::TEXT, 'NULL') || E'\n';
  
  RETURN result_text;
END;
$$;

-- Test the function
SELECT debug_decrement_variant_stock('1b3eb4ce-eb52-48ca-b2e7-2d34ac1b9f2c', 1);
