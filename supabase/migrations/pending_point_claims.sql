-- Create pending_point_claims table for door QR system
CREATE TABLE IF NOT EXISTS pending_point_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES user_store_memberships(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ NULL,
  amount_claimed NUMERIC NULL,
  points_claimed INTEGER NULL
);

-- Enable RLS
ALTER TABLE pending_point_claims ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own pending claims" ON pending_point_claims FOR SELECT 
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own pending claims" ON pending_point_claims FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Store owners can manage all pending claims" ON pending_point_claims FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()
  ));

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_pending_claims_store_status 
  ON pending_point_claims(store_id, status) 
  WHERE status = 'waiting';

CREATE INDEX IF NOT EXISTS idx_pending_claims_user_store 
  ON pending_point_claims(user_id, store_id);

CREATE INDEX IF NOT EXISTS idx_pending_claims_created_at 
  ON pending_point_claims(created_at DESC);
