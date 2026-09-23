import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PriceBand, ItemCategory, LocalityTier } from './types';

// Baseline reference dataset matching supabase/seed.sql
// Used as fallback if Supabase credentials are not provided or during local offline testing
export const SEEDED_PRICE_BANDS: PriceBand[] = [
  // Produce
  { category: 'produce', item_name: 'Tomatoes (Hybrid/Country)', base_min_price: 25, base_max_price: 45, unit: 'kg', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'produce', item_name: 'Tomatoes (Hybrid/Country)', base_min_price: 35, base_max_price: 60, unit: 'kg', locality_tier: 'tier1_metro', locality_multiplier: 1.25 },
  { category: 'produce', item_name: 'Tomatoes (Hybrid/Country)', base_min_price: 18, base_max_price: 32, unit: 'kg', locality_tier: 'rural', locality_multiplier: 0.8 },
  { category: 'produce', item_name: 'Onions (Red)', base_min_price: 30, base_max_price: 50, unit: 'kg', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'produce', item_name: 'Onions (Red)', base_min_price: 40, base_max_price: 65, unit: 'kg', locality_tier: 'tier1_metro', locality_multiplier: 1.25 },
  { category: 'produce', item_name: 'Onions (Red)', base_min_price: 22, base_max_price: 38, unit: 'kg', locality_tier: 'rural', locality_multiplier: 0.8 },
  { category: 'produce', item_name: 'Potatoes (Jyoti/Pahari)', base_min_price: 20, base_max_price: 35, unit: 'kg', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'produce', item_name: 'Potatoes (Jyoti/Pahari)', base_min_price: 28, base_max_price: 45, unit: 'kg', locality_tier: 'tier1_metro', locality_multiplier: 1.2 },
  { category: 'produce', item_name: 'Bananas (Robusta/Cavendish)', base_min_price: 35, base_max_price: 50, unit: 'dozen', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'produce', item_name: 'Bananas (Robusta/Cavendish)', base_min_price: 45, base_max_price: 70, unit: 'dozen', locality_tier: 'tier1_metro', locality_multiplier: 1.25 },
  { category: 'produce', item_name: 'Apples (Royal Gala/Shimla)', base_min_price: 120, base_max_price: 180, unit: 'kg', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'produce', item_name: 'Apples (Royal Gala/Shimla)', base_min_price: 150, base_max_price: 240, unit: 'kg', locality_tier: 'tier1_metro', locality_multiplier: 1.3 },
  { category: 'produce', item_name: 'Spinach (Palak)', base_min_price: 15, base_max_price: 25, unit: 'bunch', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'produce', item_name: 'Green Chillies', base_min_price: 40, base_max_price: 70, unit: 'kg', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'produce', item_name: 'Ginger (Adrak)', base_min_price: 80, base_max_price: 130, unit: 'kg', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'produce', item_name: 'Mangoes (Alphonso/Banganapalli)', base_min_price: 90, base_max_price: 160, unit: 'kg', locality_tier: 'tier2_city', locality_multiplier: 1.0 },

  // Electronics
  { category: 'electronics', item_name: 'USB-C Fast Charging Cable (1m/Braided)', base_min_price: 100, base_max_price: 220, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'electronics', item_name: 'USB-C Fast Charging Cable (1m/Braided)', base_min_price: 150, base_max_price: 300, unit: 'piece', locality_tier: 'tier1_metro', locality_multiplier: 1.25 },
  { category: 'electronics', item_name: 'USB-C Fast Charging Cable (1m/Braided)', base_min_price: 80, base_max_price: 180, unit: 'piece', locality_tier: 'rural', locality_multiplier: 0.85 },
  { category: 'electronics', item_name: 'Micro-USB Cable (1m)', base_min_price: 50, base_max_price: 120, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'electronics', item_name: 'Wired 3.5mm Earphones (with Mic)', base_min_price: 120, base_max_price: 250, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'electronics', item_name: 'Wired 3.5mm Earphones (with Mic)', base_min_price: 150, base_max_price: 320, unit: 'piece', locality_tier: 'tier1_metro', locality_multiplier: 1.25 },
  { category: 'electronics', item_name: 'Wall Charger Adapter (18W-20W QuickCharge)', base_min_price: 180, base_max_price: 350, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'electronics', item_name: 'Wall Charger Adapter (18W-20W QuickCharge)', base_min_price: 220, base_max_price: 450, unit: 'piece', locality_tier: 'tier1_metro', locality_multiplier: 1.25 },
  { category: 'electronics', item_name: 'Tempered Glass Screen Protector (Standard)', base_min_price: 70, base_max_price: 150, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'electronics', item_name: 'Tempered Glass Screen Protector (Standard)', base_min_price: 100, base_max_price: 200, unit: 'piece', locality_tier: 'tier1_metro', locality_multiplier: 1.3 },
  { category: 'electronics', item_name: 'Clear Silicon Mobile Back Cover', base_min_price: 80, base_max_price: 180, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'electronics', item_name: 'Bluetooth Wireless Neckband', base_min_price: 350, base_max_price: 750, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'electronics', item_name: 'OTG Adapter (USB to Type-C)', base_min_price: 40, base_max_price: 90, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },

  // Apparel
  { category: 'apparel', item_name: 'Men Plain Cotton T-Shirt (Crew Neck)', base_min_price: 180, base_max_price: 350, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'apparel', item_name: 'Men Plain Cotton T-Shirt (Crew Neck)', base_min_price: 250, base_max_price: 480, unit: 'piece', locality_tier: 'tier1_metro', locality_multiplier: 1.25 },
  { category: 'apparel', item_name: 'Women Cotton Kurti (Daily Wear)', base_min_price: 250, base_max_price: 500, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'apparel', item_name: 'Women Cotton Kurti (Daily Wear)', base_min_price: 350, base_max_price: 700, unit: 'piece', locality_tier: 'tier1_metro', locality_multiplier: 1.3 },
  { category: 'apparel', item_name: 'Denim Jeans (Non-branded / Local Stall)', base_min_price: 350, base_max_price: 650, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'apparel', item_name: 'Denim Jeans (Non-branded / Local Stall)', base_min_price: 450, base_max_price: 850, unit: 'piece', locality_tier: 'tier1_metro', locality_multiplier: 1.25 },
  { category: 'apparel', item_name: 'Cotton Socks (Pack of 3 Pairs)', base_min_price: 70, base_max_price: 140, unit: 'pack', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'apparel', item_name: 'Formal / Casual Leather-Finish Belt', base_min_price: 120, base_max_price: 250, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'apparel', item_name: 'Casual Track Pants / Joggers', base_min_price: 220, base_max_price: 420, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'apparel', item_name: 'Silk/Chiffon Printed Dupatta or Scarf', base_min_price: 100, base_max_price: 220, unit: 'piece', locality_tier: 'tier2_city', locality_multiplier: 1.0 },
  { category: 'apparel', item_name: 'Cotton Handkerchief (Pack of 6)', base_min_price: 50, base_max_price: 100, unit: 'pack', locality_tier: 'tier2_city', locality_multiplier: 1.0 }
];

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your-project-ref')) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false }
    });
  }
  return supabaseInstance;
}

/**
 * Query price bands from Supabase, with automatic fallback to seeded baseline dataset.
 */
export async function queryPriceBands(
  category?: ItemCategory,
  queryText?: string,
  tier: LocalityTier = 'tier2_city'
): Promise<{ bands: PriceBand[]; source: 'supabase' | 'seeded_baseline' }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      let query = supabase.from('price_bands').select('*');
      if (category) {
        query = query.eq('category', category);
      }
      if (tier) {
        query = query.eq('locality_tier', tier);
      }
      if (queryText) {
        query = query.ilike('item_name', `%${queryText}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return { bands: data as PriceBand[], source: 'supabase' };
      }
    } catch (e) {
      console.warn('Supabase query error, falling back to seeded dataset:', e);
    }
  }

  // Fallback to in-memory seeded dataset
  let filtered = SEEDED_PRICE_BANDS;
  if (category) {
    filtered = filtered.filter(b => b.category === category);
  }
  if (tier) {
    const tierMatches = filtered.filter(b => b.locality_tier === tier);
    if (tierMatches.length > 0) {
      filtered = tierMatches;
    }
  }
  if (queryText) {
    const lower = queryText.toLowerCase();
    const queryMatches = filtered.filter(b => 
      b.item_name.toLowerCase().includes(lower) || 
      lower.includes(b.item_name.toLowerCase().split(' ')[0])
    );
    if (queryMatches.length > 0) {
      filtered = queryMatches;
    }
  }

  return { bands: filtered, source: 'seeded_baseline' };
}

/**
 * Determine locality tier from location string or city name
 */
export function determineLocalityTier(cityOrLocality: string): { tier: LocalityTier; multiplier: number } {
  const input = cityOrLocality.toLowerCase().trim();
  
  const tier1Metros = [
    'mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 
    'kolkata', 'pune', 'ahmedabad', 'gurugram', 'gurgaon', 'noida'
  ];

  const ruralKeywords = ['village', 'gram', 'rural', 'taluk', 'tehsil', 'basti', 'dehat'];

  if (tier1Metros.some(m => input.includes(m))) {
    return { tier: 'tier1_metro', multiplier: 1.25 };
  }

  if (ruralKeywords.some(r => input.includes(r))) {
    return { tier: 'rural', multiplier: 0.80 };
  }

  return { tier: 'tier2_city', multiplier: 1.00 };
}
