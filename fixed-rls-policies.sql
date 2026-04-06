-- Fixed RLS policies for NodeBN guest checkout system
-- Run in Supabase SQL Editor

-- ========================================
-- PRODUCTS TABLE POLICIES
-- ========================================

-- Allow anyone to read active products (for storefront)
CREATE POLICY "Public read active products" ON products
FOR SELECT USING (is_active = true);

-- Allow authenticated users to read all products (for dashboard)
CREATE POLICY "Authenticated read all products" ON products
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to manage their own store's products
CREATE POLICY "Store owners manage products" ON products
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM stores WHERE id = products.store_id
  )
);

-- ========================================
-- PRODUCT_VARIANTS TABLE POLICIES  
-- ========================================

-- Allow anyone to read variants of active products
CREATE POLICY "Public read variants of active products" ON product_variants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = product_variants.product_id 
    AND products.is_active = true
  )
);

-- Allow authenticated users to read all variants
CREATE POLICY "Authenticated read all variants" ON product_variants
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow store owners to manage variants
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

-- Allow service role to update stock (for order processing)
CREATE POLICY "Service role update variant stock" ON product_variants
FOR UPDATE USING (auth.role() = 'service_role');

-- ========================================
-- ORDERS TABLE POLICIES
-- ========================================

-- Allow store owners to read orders for their stores
CREATE POLICY "Store owners read store orders" ON orders
FOR SELECT USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- Allow anyone to create orders (guest checkout)
CREATE POLICY "Anyone can create orders" ON orders
FOR INSERT WITH CHECK (true);

-- Allow store owners to update orders (status changes)
CREATE POLICY "Store owners update orders" ON orders
FOR UPDATE USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- ========================================
-- ORDER_ITEMS TABLE POLICIES
-- ========================================

-- Allow store owners to read order items for their stores
CREATE POLICY "Store owners read order items" ON order_items
FOR SELECT USING (
  order_id IN (
    SELECT orders.id FROM orders 
    JOIN stores ON stores.id = orders.store_id 
    WHERE stores.owner_id = auth.uid()
  )
);

-- Allow order creation (through orders policy)
CREATE POLICY "Order items created with orders" ON order_items
FOR INSERT WITH CHECK (true);

-- ========================================
-- PRODUCTS STOCK UPDATE POLICY
-- ========================================

-- Allow service role to update product stock
CREATE POLICY "Service role update product stock" ON products
FOR UPDATE USING (auth.role() = 'service_role');

-- ========================================
-- STORES TABLE POLICIES
-- ========================================

-- Allow public read of active stores
CREATE POLICY "Public read active stores" ON stores
FOR SELECT USING (is_active = true);

-- Allow store owners to manage their stores
CREATE POLICY "Store owners manage stores" ON stores
FOR ALL USING (owner_id = auth.uid());

-- ========================================
-- CATEGORIES TABLE POLICIES
-- ========================================

-- Allow public read of categories
CREATE POLICY "Public read categories" ON categories
FOR SELECT USING (true);

-- Allow store owners to manage their categories
CREATE POLICY "Store owners manage categories" ON categories
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- ========================================
-- PAYMENTS TABLE POLICIES
-- ========================================

-- Allow store owners to manage payments
CREATE POLICY "Store owners manage payments" ON payments
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- ========================================
-- SERVICES TABLE POLICIES
-- ========================================

-- Allow store owners to manage services
CREATE POLICY "Store owners manage services" ON services
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- ========================================
-- PROMO CODES TABLE POLICIES
-- ========================================

-- Allow store owners to manage promo codes
CREATE POLICY "Store owners manage promo codes" ON promo_codes
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);
