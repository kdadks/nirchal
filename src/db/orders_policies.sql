-- RLS and grants for customers, addresses, orders, order_items suitable for public checkout and authenticated account views

-- Customers: allow public upsert by email (to support guest checkout creating a customer record), public select filtered by nothing (we'll not expose customer list)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS customers_public_insert ON customers;
    CREATE POLICY customers_public_insert ON customers
      FOR INSERT TO PUBLIC WITH CHECK (true);
    DROP POLICY IF EXISTS customers_public_select_self ON customers;
    CREATE POLICY customers_public_select_self ON customers
      FOR SELECT TO authenticated USING (auth.email() = email);
    -- allow update by authenticated self
    DROP POLICY IF EXISTS customers_auth_update_self ON customers;
    CREATE POLICY customers_auth_update_self ON customers
      FOR UPDATE TO authenticated USING (auth.email() = email) WITH CHECK (auth.email() = email);
    GRANT INSERT, SELECT, UPDATE ON customers TO anon, authenticated;
  END IF;
END $$;

-- Customer addresses: allow insert/select for addresses for the authenticated user's customer record
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_addresses') THEN
    ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS addresses_auth_crud_own ON customer_addresses;
    CREATE POLICY addresses_auth_crud_own ON customer_addresses
      FOR ALL TO authenticated
      USING (customer_id IN (SELECT id FROM customers WHERE email = auth.email()))
      WITH CHECK (customer_id IN (SELECT id FROM customers WHERE email = auth.email()));
    GRANT INSERT, SELECT, UPDATE, DELETE ON customer_addresses TO authenticated;
    -- allow insert via guest checkout (no auth) if we ever need; kept disabled by default
  END IF;
END $$;

-- Orders: allow insert for public (checkout) and select for authenticated user's own orders
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS orders_public_insert ON orders;
    CREATE POLICY orders_public_insert ON orders FOR INSERT TO PUBLIC WITH CHECK (true);
    DROP POLICY IF EXISTS orders_auth_select_own ON orders;
    CREATE POLICY orders_auth_select_own ON orders
      FOR SELECT TO authenticated USING (
        customer_id IN (
          SELECT id FROM customers WHERE email = auth.email()
        )
      );
    GRANT INSERT, SELECT ON orders TO anon, authenticated;
  END IF;
END $$;

-- Order items: allow insert (with new order) and select for authenticated users if the parent order is theirs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS order_items_public_insert ON order_items;
    CREATE POLICY order_items_public_insert ON order_items FOR INSERT TO PUBLIC WITH CHECK (true);
    DROP POLICY IF EXISTS order_items_auth_select_own ON order_items;
    CREATE POLICY order_items_auth_select_own ON order_items
      FOR SELECT TO authenticated USING (
        order_id IN (
          SELECT o.id FROM orders o
          WHERE o.customer_id IN (SELECT id FROM customers WHERE email = auth.email())
        )
      );
    GRANT INSERT, SELECT ON order_items TO anon, authenticated;
  END IF;
END $$;
