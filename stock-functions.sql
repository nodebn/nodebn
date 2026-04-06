-- Create RPC functions for stock management

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
