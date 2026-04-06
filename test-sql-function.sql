-- Test the stock deduction function directly in SQL
-- Run this in Supabase SQL Editor

-- First, check current stock
SELECT id, name, stock_quantity 
FROM product_variants 
WHERE stock_quantity > 0 
LIMIT 1;

-- Then test the function (replace the ID with the actual ID from above)
-- SELECT decrement_variant_stock('your-variant-id-here', 1);

-- Check stock after function call
-- SELECT id, name, stock_quantity 
-- FROM product_variants 
-- WHERE id = 'your-variant-id-here';
