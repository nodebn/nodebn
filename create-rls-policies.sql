-- Create RLS policies for NodeBN e-commerce app
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

-- ========================================
-- ORDERS TABLE POLICIES
-- ========================================

-- Allow customers to read their own orders
CREATE POLICY "Customers read own orders" ON orders
FOR SELECT USING (auth.uid()::text = customer_id);

-- Allow store owners to read orders for their stores
CREATE POLICY "Store owners read store orders" ON orders
FOR SELECT USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- Allow customers to create orders
CREATE POLICY "Customers create orders" ON orders
FOR INSERT WITH CHECK (auth.uid()::text = customer_id);

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

-- Allow customers to read their order items
CREATE POLICY "Customers read own order items" ON order_items
FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders WHERE customer_id = auth.uid()::text
  )
);

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
FOR INSERT WITH CHECK (
  order_id IN (
    SELECT id FROM orders WHERE customer_id = auth.uid()::text
  )
);

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
