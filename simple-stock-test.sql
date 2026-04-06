-- Simple stock test - run in Supabase SQL Editor

-- Check current stock
SELECT 'BEFORE' as test, id, name, stock_quantity 
FROM product_variants 
WHERE id = '1b3eb4ce-eb52-48ca-b2e7-2d34ac1b9f2c';

-- Try manual deduction
UPDATE product_variants 
SET stock_quantity = stock_quantity - 1 
WHERE id = '1b3eb4ce-eb52-48ca-b2e7-2d34ac1b9f2c' 
AND stock_quantity >= 1;

-- Check stock after manual update
SELECT 'AFTER MANUAL' as test, id, name, stock_quantity 
FROM product_variants 
WHERE id = '1b3eb4ce-eb52-48ca-b2e7-2d34ac1b9f2c';

-- Reset for testing
UPDATE product_variants 
SET stock_quantity = stock_quantity + 1 
WHERE id = '1b3eb4ce-eb52-48ca-b2e7-2d34ac1b9f2c';

-- Check final stock
SELECT 'RESET' as test, id, name, stock_quantity 
FROM product_variants 
WHERE id = '1b3eb4ce-eb52-48ca-b2e7-2d34ac1b9f2c';
