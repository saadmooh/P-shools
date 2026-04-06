-- Create offer_products linking table
CREATE TABLE IF NOT EXISTS offer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(offer_id, product_id)
);

-- Enable RLS
ALTER TABLE offer_products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view offer_products" ON offer_products FOR SELECT USING (true);
CREATE POLICY "Owners can manage offer_products" ON offer_products FOR ALL USING (
  EXISTS (SELECT 1 FROM stores WHERE id IN (SELECT store_id FROM offers WHERE id = offer_id) AND owner_id = auth.uid())
);
