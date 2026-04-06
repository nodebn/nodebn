-- Check RLS policies and permissions - run in Supabase SQL Editor

-- Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'product_variants', 'orders');

-- Check existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'product_variants', 'orders');

-- Check if anon role has permissions
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants 
WHERE grantee = 'anon' 
AND table_name IN ('products', 'product_variants', 'orders');

-- Test if we can update (this should work if RLS is disabled)
UPDATE product_variants 
SET stock_quantity = 999 
WHERE id = '029b7a5e-533a-4cc3-a904-00b8a6219f01';

-- Check if update actually happened
SELECT id, name, stock_quantity 
FROM product_variants 
WHERE id = '029b7a5e-533a-4cc3-a904-00b8a6219f01';

-- Reset if it changed
UPDATE product_variants 
SET stock_quantity = 4 
WHERE id = '029b7a5e-533a-4cc3-a904-00b8a6219f01';
