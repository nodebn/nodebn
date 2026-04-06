-- Debug the RPC function - run in Supabase SQL Editor

-- Create a debug version that logs what it does
CREATE OR REPLACE FUNCTION debug_decrement_variant_stock(variant_id UUID, quantity INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INTEGER;
  result_text TEXT := '';
BEGIN
  result_text := result_text || 'Function called with variant_id: ' || variant_id::TEXT || ', quantity: ' || quantity::TEXT || E'\n';
  
  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM product_variants
  WHERE id = variant_id;
  
  result_text := result_text || 'Current stock in DB: ' || COALESCE(current_stock::TEXT, 'NULL') || E'\n';
  
  -- Check conditions
  IF quantity = 0 THEN
    result_text := result_text || 'Quantity is 0, returning' || E'\n';
    RETURN result_text;
  END IF;
  
  IF current_stock IS NULL THEN
    result_text := result_text || 'Stock is NULL (unlimited), returning' || E'\n';
    RETURN result_text;
  END IF;
  
  IF current_stock < quantity THEN
    result_text := result_text || 'Insufficient stock: ' || current_stock::TEXT || ' < ' || quantity::TEXT || E'\n';
    RETURN result_text;
  END IF;
  
  -- Try to update
  result_text := result_text || 'Attempting update...' || E'\n';
  UPDATE product_variants
  SET stock_quantity = stock_quantity - quantity
  WHERE id = variant_id;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  result_text := result_text || 'Update affected ' || affected_rows::TEXT || ' rows' || E'\n';
  
  -- Check new stock
  SELECT stock_quantity INTO current_stock
  FROM product_variants
  WHERE id = variant_id;
  
  result_text := result_text || 'New stock: ' || COALESCE(current_stock::TEXT, 'NULL') || E'\n';
  
  RETURN result_text;
END;
$$;

-- Test the debug function
-- SELECT debug_decrement_variant_stock('1b3eb4ce-eb52-48ca-b2e7-2d34ac1b9f2c', 1);
