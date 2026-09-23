-- ==============================================================================
-- BargainAI - Supabase PostgreSQL Schema & Seed Data
-- Table: price_bands
-- Seed: 15-20 realistic baseline entries per category (Produce, Electronics, Apparel)
-- ==============================================================================

-- 1. Create table price_bands
CREATE TABLE IF NOT EXISTS price_bands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('produce', 'electronics', 'apparel')),
    item_name TEXT NOT NULL,
    base_min_price NUMERIC(10, 2) NOT NULL,
    base_max_price NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL, -- e.g., 'kg', 'piece', 'pair', 'meter'
    locality_tier TEXT NOT NULL CHECK (locality_tier IN ('tier1_metro', 'tier2_city', 'rural')),
    locality_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_price_bands_category ON price_bands(category);
CREATE INDEX IF NOT EXISTS idx_price_bands_item_name ON price_bands(item_name);
CREATE INDEX IF NOT EXISTS idx_price_bands_locality_tier ON price_bands(locality_tier);

-- 2. Clear existing entries to prevent duplication on re-runs
TRUNCATE TABLE price_bands;

-- 3. Seed Realistic Reference Price Bands
-- Currency standard: INR (₹) as typical local street / mandi / bazaar market reference
-- Tiers:
--  tier1_metro (multiplier 1.15 - 1.25 for higher rent/transport)
--  tier2_city  (multiplier 1.00 base standard)
--  rural       (multiplier 0.75 - 0.90 for farm-gate/lower overhead)

INSERT INTO price_bands (category, item_name, base_min_price, base_max_price, unit, locality_tier, locality_multiplier, last_updated) VALUES
-- =======================
-- CATEGORY: PRODUCE (Fruits & Vegetables)
-- =======================
('produce', 'Tomatoes (Hybrid/Country)', 25.00, 45.00, 'kg', 'tier2_city', 1.00, NOW()),
('produce', 'Tomatoes (Hybrid/Country)', 35.00, 60.00, 'kg', 'tier1_metro', 1.25, NOW()),
('produce', 'Tomatoes (Hybrid/Country)', 18.00, 32.00, 'kg', 'rural', 0.80, NOW()),

('produce', 'Onions (Red)', 30.00, 50.00, 'kg', 'tier2_city', 1.00, NOW()),
('produce', 'Onions (Red)', 40.00, 65.00, 'kg', 'tier1_metro', 1.25, NOW()),
('produce', 'Onions (Red)', 22.00, 38.00, 'kg', 'rural', 0.80, NOW()),

('produce', 'Potatoes (Jyoti/Pahari)', 20.00, 35.00, 'kg', 'tier2_city', 1.00, NOW()),
('produce', 'Potatoes (Jyoti/Pahari)', 28.00, 45.00, 'kg', 'tier1_metro', 1.20, NOW()),
('produce', 'Potatoes (Jyoti/Pahari)', 15.00, 25.00, 'kg', 'rural', 0.75, NOW()),

('produce', 'Bananas (Robusta/Cavendish)', 35.00, 50.00, 'dozen', 'tier2_city', 1.00, NOW()),
('produce', 'Bananas (Robusta/Cavendish)', 45.00, 70.00, 'dozen', 'tier1_metro', 1.25, NOW()),
('produce', 'Bananas (Robusta/Cavendish)', 25.00, 40.00, 'dozen', 'rural', 0.80, NOW()),

('produce', 'Apples (Royal Gala/Shimla)', 120.00, 180.00, 'kg', 'tier2_city', 1.00, NOW()),
('produce', 'Apples (Royal Gala/Shimla)', 150.00, 240.00, 'kg', 'tier1_metro', 1.30, NOW()),
('produce', 'Apples (Royal Gala/Shimla)', 90.00, 140.00, 'kg', 'rural', 0.80, NOW()),

('produce', 'Spinach (Palak)', 15.00, 25.00, 'bunch', 'tier2_city', 1.00, NOW()),
('produce', 'Spinach (Palak)', 20.00, 35.00, 'bunch', 'tier1_metro', 1.25, NOW()),
('produce', 'Spinach (Palak)', 10.00, 18.00, 'bunch', 'rural', 0.75, NOW()),

('produce', 'Green Chillies', 40.00, 70.00, 'kg', 'tier2_city', 1.00, NOW()),
('produce', 'Ginger (Adrak)', 80.00, 130.00, 'kg', 'tier2_city', 1.00, NOW()),
('produce', 'Mangoes (Alphonso/Banganapalli)', 90.00, 160.00, 'kg', 'tier2_city', 1.00, NOW()),

-- =======================
-- CATEGORY: ELECTRONICS (Basic Accessories)
-- =======================
('electronics', 'USB-C Fast Charging Cable (1m/Braided)', 100.00, 220.00, 'piece', 'tier2_city', 1.00, NOW()),
('electronics', 'USB-C Fast Charging Cable (1m/Braided)', 150.00, 300.00, 'piece', 'tier1_metro', 1.25, NOW()),
('electronics', 'USB-C Fast Charging Cable (1m/Braided)', 80.00, 180.00, 'piece', 'rural', 0.85, NOW()),

('electronics', 'Micro-USB Cable (1m)', 50.00, 120.00, 'piece', 'tier2_city', 1.00, NOW()),
('electronics', 'Micro-USB Cable (1m)', 70.00, 150.00, 'piece', 'tier1_metro', 1.20, NOW()),

('electronics', 'Wired 3.5mm Earphones (with Mic)', 120.00, 250.00, 'piece', 'tier2_city', 1.00, NOW()),
('electronics', 'Wired 3.5mm Earphones (with Mic)', 150.00, 320.00, 'piece', 'tier1_metro', 1.25, NOW()),
('electronics', 'Wired 3.5mm Earphones (with Mic)', 100.00, 200.00, 'piece', 'rural', 0.85, NOW()),

('electronics', 'Wall Charger Adapter (18W-20W QuickCharge)', 180.00, 350.00, 'piece', 'tier2_city', 1.00, NOW()),
('electronics', 'Wall Charger Adapter (18W-20W QuickCharge)', 220.00, 450.00, 'piece', 'tier1_metro', 1.25, NOW()),
('electronics', 'Wall Charger Adapter (18W-20W QuickCharge)', 150.00, 280.00, 'piece', 'rural', 0.80, NOW()),

('electronics', 'Tempered Glass Screen Protector (Standard)', 70.00, 150.00, 'piece', 'tier2_city', 1.00, NOW()),
('electronics', 'Tempered Glass Screen Protector (Standard)', 100.00, 200.00, 'piece', 'tier1_metro', 1.30, NOW()),
('electronics', 'Tempered Glass Screen Protector (Standard)', 50.00, 100.00, 'piece', 'rural', 0.75, NOW()),

('electronics', 'Clear Silicon Mobile Back Cover', 80.00, 180.00, 'piece', 'tier2_city', 1.00, NOW()),
('electronics', 'Clear Silicon Mobile Back Cover', 120.00, 250.00, 'piece', 'tier1_metro', 1.30, NOW()),
('electronics', 'Bluetooth Wireless Neckband', 350.00, 750.00, 'piece', 'tier2_city', 1.00, NOW()),
('electronics', 'OTG Adapter (USB to Type-C)', 40.00, 90.00, 'piece', 'tier2_city', 1.00, NOW()),

-- =======================
-- CATEGORY: APPAREL (Basic Clothing Items)
-- =======================
('apparel', 'Men Plain Cotton T-Shirt (Crew Neck)', 180.00, 350.00, 'piece', 'tier2_city', 1.00, NOW()),
('apparel', 'Men Plain Cotton T-Shirt (Crew Neck)', 250.00, 480.00, 'piece', 'tier1_metro', 1.25, NOW()),
('apparel', 'Men Plain Cotton T-Shirt (Crew Neck)', 140.00, 280.00, 'piece', 'rural', 0.80, NOW()),

('apparel', 'Women Cotton Kurti (Daily Wear)', 250.00, 500.00, 'piece', 'tier2_city', 1.00, NOW()),
('apparel', 'Women Cotton Kurti (Daily Wear)', 350.00, 700.00, 'piece', 'tier1_metro', 1.30, NOW()),
('apparel', 'Women Cotton Kurti (Daily Wear)', 200.00, 400.00, 'piece', 'rural', 0.80, NOW()),

('apparel', 'Denim Jeans (Non-branded / Local Stall)', 350.00, 650.00, 'piece', 'tier2_city', 1.00, NOW()),
('apparel', 'Denim Jeans (Non-branded / Local Stall)', 450.00, 850.00, 'piece', 'tier1_metro', 1.25, NOW()),
('apparel', 'Denim Jeans (Non-branded / Local Stall)', 300.00, 550.00, 'piece', 'rural', 0.85, NOW()),

('apparel', 'Cotton Socks (Pack of 3 Pairs)', 70.00, 140.00, 'pack', 'tier2_city', 1.00, NOW()),
('apparel', 'Cotton Socks (Pack of 3 Pairs)', 90.00, 180.00, 'pack', 'tier1_metro', 1.25, NOW()),

('apparel', 'Formal / Casual Leather-Finish Belt', 120.00, 250.00, 'piece', 'tier2_city', 1.00, NOW()),
('apparel', 'Formal / Casual Leather-Finish Belt', 160.00, 320.00, 'piece', 'tier1_metro', 1.25, NOW()),

('apparel', 'Casual Track Pants / Joggers', 220.00, 420.00, 'piece', 'tier2_city', 1.00, NOW()),
('apparel', 'Casual Track Pants / Joggers', 280.00, 550.00, 'piece', 'tier1_metro', 1.25, NOW()),
('apparel', 'Silk/Chiffon Printed Dupatta or Scarf', 100.00, 220.00, 'piece', 'tier2_city', 1.00, NOW()),
('apparel', 'Cotton Handkerchief (Pack of 6)', 50.00, 100.00, 'pack', 'tier2_city', 1.00, NOW());
