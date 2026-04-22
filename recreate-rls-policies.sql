-- NodeBN RLS Policies - Clean Version
-- Run this complete script in Supabase SQL Editor

-- Create seller_verification_tokens table if not exists
CREATE TABLE IF NOT EXISTS seller_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  used_at timestamp with time zone,
  user_id uuid,
  metadata jsonb
);

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Add missing columns
ALTER TABLE stores ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge_text TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge_style TEXT DEFAULT 'neutral';
ALTER TABLE products ADD COLUMN IF NOT EXISTS enable_fulfilment_scheduling BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_whatsapp TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfilment_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfilment_time TIME;
ALTER TABLE seller_verification_tokens ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Enable RLS on all tables
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
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Grant service role permissions
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_items TO service_role;

-- Drop ALL existing policies (comprehensive cleanup)
-- Individual drops as fallback if DO block fails
DROP POLICY IF EXISTS "public_read_active_products" ON products;
DROP POLICY IF EXISTS "authenticated_read_all_products" ON products;
DROP POLICY IF EXISTS "store_owners_manage_products" ON products;
DROP POLICY IF EXISTS "service_role_update_product_stock" ON products;
DROP POLICY IF EXISTS "service_role_manage_products" ON products;

DROP POLICY IF EXISTS "public_read_active_variants" ON product_variants;
DROP POLICY IF EXISTS "authenticated_read_all_variants" ON product_variants;
DROP POLICY IF EXISTS "store_owners_manage_variants" ON product_variants;
DROP POLICY IF EXISTS "service_role_update_variant_stock" ON product_variants;
DROP POLICY IF EXISTS "service_role_manage_variants" ON product_variants;

DROP POLICY IF EXISTS "service_role_full_orders_access" ON orders;
DROP POLICY IF EXISTS "allow_order_creation" ON orders;
DROP POLICY IF EXISTS "store_owners_read_orders" ON orders;
DROP POLICY IF EXISTS "store_owners_update_orders" ON orders;
DROP POLICY IF EXISTS "service_role_orders" ON orders;
DROP POLICY IF EXISTS "checkout_order_creation" ON orders;
DROP POLICY IF EXISTS "store_owners_manage" ON orders;
DROP POLICY IF EXISTS "allow_inserts" ON orders;
DROP POLICY IF EXISTS "service_role_all_access" ON orders;

DROP POLICY IF EXISTS "store_owners_read_order_items" ON order_items;
DROP POLICY IF EXISTS "allow_order_item_creation" ON order_items;
DROP POLICY IF EXISTS "service_role_manage_order_items" ON order_items;

DROP POLICY IF EXISTS "public_read_active_stores" ON stores;
DROP POLICY IF EXISTS "store_owners_manage_stores" ON stores;
DROP POLICY IF EXISTS "service_role_manage_stores" ON stores;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
DROP POLICY IF EXISTS "store_owners_manage_categories" ON categories;

DROP POLICY IF EXISTS "public_read_active_payments" ON payments;
DROP POLICY IF EXISTS "store_owners_manage_payments" ON payments;
DROP POLICY IF EXISTS "public_read_active_services" ON services;
DROP POLICY IF EXISTS "store_owners_manage_services" ON services;
DROP POLICY IF EXISTS "store_owners_manage_promo_codes" ON promo_codes;
DROP POLICY IF EXISTS "service_role_manage_verification_tokens" ON seller_verification_tokens;
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
DROP POLICY IF EXISTS "store_owners_manage_product_images" ON product_images;
DROP POLICY IF EXISTS "service_role_manage_product_images" ON product_images;
DROP POLICY IF EXISTS "users_read_own_subscription" ON subscriptions;

-- DO block as additional cleanup
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Create database function for order creation
CREATE OR REPLACE FUNCTION create_order_bypass_rls(
  p_store_id uuid,
  p_customer_name text,
  p_customer_address text,
  p_customer_notes text,
  p_total_cents integer,
  p_currency text,
  p_whatsapp_message text,
  p_customer_whatsapp text,
  p_fulfilment_date date,
  p_fulfilment_time time
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_id uuid;
BEGIN
  INSERT INTO orders (store_id, customer_name, customer_address, customer_notes, total_cents, currency, whatsapp_message, customer_whatsapp, fulfilment_date, fulfilment_time, status)
  VALUES (p_store_id, p_customer_name, p_customer_address, p_customer_notes, p_total_cents, p_currency, p_whatsapp_message, p_customer_whatsapp, p_fulfilment_date, p_fulfilment_time, 'completed')
  RETURNING id INTO order_id;

  RETURN order_id;
END;
$$;

-- PRODUCTS POLICIES
CREATE POLICY "public_read_active_products" ON products
FOR SELECT USING (is_active = true);

CREATE POLICY "store_owners_manage_products" ON products
FOR ALL USING (
  auth.uid() IN (
    SELECT owner_id FROM stores WHERE id = products.store_id
  )
);

CREATE POLICY "service_role_manage_products" ON products
FOR ALL USING (auth.role() = 'service_role');

-- PRODUCT VARIANTS POLICIES
CREATE POLICY "public_read_active_variants" ON product_variants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
    AND products.is_active = true
  )
);

CREATE POLICY "store_owners_manage_variants" ON product_variants
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
    AND products.store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  )
);

CREATE POLICY "service_role_manage_variants" ON product_variants
FOR ALL USING (auth.role() = 'service_role');

-- ORDERS POLICIES (Critical for checkout)
CREATE POLICY "service_role_full_orders_access" ON orders
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "allow_order_creation" ON orders
FOR INSERT WITH CHECK (auth.role() = 'service_role' OR true);

CREATE POLICY "store_owners_read_orders" ON orders
FOR SELECT USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "store_owners_update_orders" ON orders
FOR UPDATE USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- ORDER ITEMS POLICIES
CREATE POLICY "store_owners_read_order_items" ON order_items
FOR SELECT USING (
  order_id IN (
    SELECT orders.id FROM orders
    JOIN stores ON stores.id = orders.store_id
    WHERE stores.owner_id = auth.uid()
  )
);

CREATE POLICY "allow_order_item_creation" ON order_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "service_role_manage_order_items" ON order_items
FOR ALL USING (auth.role() = 'service_role');

-- STORES POLICIES
CREATE POLICY "public_read_active_stores" ON stores
FOR SELECT USING (is_active = true);

CREATE POLICY "store_owners_manage_stores" ON stores
FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "service_role_manage_stores" ON stores
FOR ALL USING (auth.role() = 'service_role');

-- CATEGORIES POLICIES
CREATE POLICY "public_read_categories" ON categories
FOR SELECT USING (true);

CREATE POLICY "store_owners_manage_categories" ON categories
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- PAYMENTS POLICIES
CREATE POLICY "public_read_active_payments" ON payments
FOR SELECT USING (is_active = true);

CREATE POLICY "store_owners_manage_payments" ON payments
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- SERVICES POLICIES
CREATE POLICY "public_read_active_services" ON services
FOR SELECT USING (is_active = true);

CREATE POLICY "store_owners_manage_services" ON services
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- PROMO CODES POLICIES
CREATE POLICY "store_owners_manage_promo_codes" ON promo_codes
FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  )
);

-- VERIFICATION TOKENS POLICIES
CREATE POLICY "service_role_manage_verification_tokens" ON seller_verification_tokens
FOR ALL USING (auth.role() = 'service_role');

-- Allow order creation for authenticated users and anonymous (for storefront checkout)
CREATE POLICY "checkout_order_creation" ON orders
FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL OR auth.uid() IS NULL);



-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Customers create orders" ON orders;
DROP POLICY IF EXISTS "Store owners read store orders" ON orders;
DROP POLICY IF EXISTS "Store owners update orders" ON orders;

-- Create a database function to bypass RLS for order creation
CREATE OR REPLACE FUNCTION create_order_bypass_rls(
  p_store_id uuid,
  p_customer_name text,
  p_customer_address text,
  p_customer_notes text,
  p_total_cents integer,
  p_currency text,
  p_customer_whatsapp text,
  p_fulfilment_date date,
  p_fulfilment_time time
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_id uuid;
BEGIN
  INSERT INTO orders (store_id, customer_name, customer_address, customer_notes, total_cents, currency, whatsapp_message, customer_whatsapp, fulfilment_date, fulfilment_time, status)
  VALUES (p_store_id, p_customer_name, p_customer_address, p_customer_notes, p_total_cents, p_currency, p_whatsapp_message, p_customer_whatsapp, p_fulfilment_date, p_fulfilment_time, 'completed')
  RETURNING id INTO order_id;

  RETURN order_id;
END;
$$;

-- Create permissive policies for orders
CREATE POLICY "Service role can do anything with orders" ON orders
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can create orders" ON orders
FOR INSERT WITH CHECK (auth.role() = 'service_role' OR true);



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

-- PROFILES POLICIES (if exists)
CREATE POLICY "users_manage_own_profile" ON profiles
FOR ALL USING (auth.uid() = id);

-- PRODUCT IMAGES POLICIES
CREATE POLICY "public_read_product_images" ON product_images
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_images.product_id
    AND products.is_active = true
  )
);

CREATE POLICY "store_owners_manage_product_images" ON product_images
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_images.product_id
    AND products.store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  )
);

CREATE POLICY "service_role_manage_product_images" ON product_images
FOR ALL USING (auth.role() = 'service_role');

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "users_read_own_subscription" ON subscriptions
FOR ALL USING (user_id = auth.uid());

-- NOTIFICATIONS POLICIES
CREATE POLICY "users_manage_own_notifications" ON notifications
FOR ALL USING (user_id = auth.uid());

-- PROFILES POLICIES (if exists)


