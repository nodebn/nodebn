-- Check the actual structure of the orders table
-- Run in Supabase SQL Editor

-- See all columns in orders table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- See sample orders
SELECT * FROM orders LIMIT 2;

-- Check if there's a customer_id or similar field
SELECT DISTINCT customer_name FROM orders LIMIT 5;
