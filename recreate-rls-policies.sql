-- Recreate all RLS policies (drop existing first)
-- Run in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read active products" ON products;
DROP POLICY IF EXISTS "Authenticated read all products" ON products;
DROP POLICY IF EXISTS "Store owners manage products" ON products;
DROP POLICY IF EXISTS "Service role update product stock" ON products;

DROP POLICY IF EXISTS "Public read variants of active products" ON product_variants;
DROP POLICY IF EXISTS "Authenticated read all variants" ON product_variants;
DROP POLICY IF EXISTS "Store owners manage variants" ON product_variants;
DROP POLICY IF EXISTS "Service role update variant stock" ON product_variants;

DROP POLICY IF EXISTS "Store owners read store orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Store owners update orders" ON orders;

DROP POLICY IF EXISTS "Store owners read order items" ON order_items;
DROP POLICY IF EXISTS "Order items created with orders" ON order_items;

DROP POLICY IF EXISTS "Public read active stores" ON stores;
DROP POLICY IF EXISTS "Store owners manage stores" ON stores;
DROP POLICY IF EXISTS "Service role manage stores" ON stores;

DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Store owners manage categories" ON categories;

DROP POLICY IF EXISTS "Store owners manage payments" ON payments;
DROP POLICY IF EXISTS "Store owners manage services" ON services;
DROP POLICY IF EXISTS "Store owners manage promo codes" ON promo_codes;

DROP POLICY IF EXISTS "Service role manage verification tokens" ON seller_verification_tokens;

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Recreate all policies
CREATE POLICY "Public read active products" ON products
FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated read all products" ON products
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Store owners manage products" ON products
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM stores WHERE id = products.store_id
  )
);

CREATE POLICY "Service role update product stock" ON products
FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Public read variants of active products" ON product_variants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
    AND products.is_active = true
  )
);

CREATE POLICY "Authenticated read all variants" ON product_variants
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Store owners manage variants" ON product_variants
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
    AND products.store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Service role update variant stock" ON product_variants
FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Store owners read store orders" ON orders
FOR SELECT USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Anyone can create orders" ON orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Store owners update orders" ON orders
FOR UPDATE USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners read order items" ON order_items
FOR SELECT USING (
  order_id IN (
    SELECT orders.id FROM orders
    JOIN stores ON stores.id = orders.store_id
    WHERE stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Order items created with orders" ON order_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read active stores" ON stores
FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners manage stores" ON stores
FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Service role manage stores" ON stores
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read categories" ON categories
FOR SELECT USING (true);

CREATE POLICY "Store owners manage categories" ON categories
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners manage payments" ON payments
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners manage services" ON services
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners manage promo codes" ON promo_codes
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Service role manage verification tokens" ON seller_verification_tokens
FOR ALL USING (auth.role() = 'service_role');
