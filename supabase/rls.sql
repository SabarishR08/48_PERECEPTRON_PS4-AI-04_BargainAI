ALTER TABLE price_bands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-only access to price_bands" ON price_bands;
CREATE POLICY "Allow public read-only access to price_bands" ON price_bands FOR SELECT USING (true);
