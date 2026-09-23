import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PriceBand, ItemCategory, LocalityTier, SeasonalHistoryPoint, QualityGrade } from './types';

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

// ── Seasonal price history ───────────────────────────────────────────────────

// Quality multipliers applied on top of the baseline avg_price
const QUALITY_MULTIPLIERS: Record<QualityGrade, number> = {
  excellent: 1.15,
  good: 1.00,
  fair: 0.85,
  poor: 0.65,
};

// Month labels for electronics/apparel (month-based)
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Season labels for produce
const SEASON_LABELS = ['Summer','Monsoon','Post-Monsoon','Winter'];

/**
 * Generates a full 12-period seasonal curve for a produce item.
 * Swings are tied to real Indian harvest/supply patterns.
 */
function produceSeasonalCurve(itemName: string, baseAvg: number): number[] {
  const name = itemName.toLowerCase();
  // Each index = month 0..11, value = multiplier on baseAvg
  if (name.includes('tomato')) {
    // High in summer (peak demand, low supply), low post-monsoon harvest
    return [1.3,1.4,1.5,1.6,1.5,1.2,0.9,0.8,0.75,0.85,1.0,1.1];
  }
  if (name.includes('onion')) {
    // Classic: spikes pre-monsoon/early summer, crashes after rabi harvest
    return [1.1,1.0,1.0,1.2,1.5,1.6,1.3,0.9,0.8,0.75,0.85,1.0];
  }
  if (name.includes('potato')) {
    // Stable; slight rise summer, falls after Feb harvest
    return [0.85,0.8,0.9,1.0,1.1,1.1,1.0,0.95,0.9,0.85,0.9,0.9];
  }
  if (name.includes('mango')) {
    // Peak Apr-Jun (season), nearly zero rest of year → proxy to high off-season
    return [1.8,1.8,1.5,0.9,0.75,0.8,1.2,1.8,1.9,2.0,2.0,1.9];
  }
  if (name.includes('banana')) {
    // Fairly stable, mild dip in monsoon
    return [1.0,1.0,0.95,0.95,1.05,1.1,1.05,0.9,0.9,1.0,1.05,1.05];
  }
  if (name.includes('apple')) {
    // Peak Sep-Nov (Shimla harvest), high in summer (storage)
    return [1.2,1.3,1.3,1.4,1.4,1.3,1.1,0.9,0.8,0.85,1.0,1.1];
  }
  if (name.includes('spinach') || name.includes('palak')) {
    // Abundant in winter, scarce in summer
    return [0.8,0.8,0.9,1.1,1.3,1.4,1.3,1.2,1.1,0.9,0.8,0.75];
  }
  if (name.includes('chilli') || name.includes('ginger')) {
    return [1.0,0.95,0.95,1.1,1.3,1.4,1.2,1.0,0.9,0.9,0.95,1.0];
  }
  // Generic produce fallback
  return [1.0,1.0,1.05,1.1,1.2,1.2,1.1,0.95,0.9,0.9,0.95,1.0];
}

/**
 * Generates a 12-month curve for electronics/apparel.
 * Mostly flat with dips after Diwali/end-of-year sale seasons.
 */
function flatSeasonalCurve(itemName: string, baseAvg: number): number[] {
  const name = itemName.toLowerCase();
  // Apparel dips in post-season sale (Jan, Jul-Aug)
  if (['t-shirt','kurti','jeans','jogger','track','belt','socks','dupatta','handkerchief'].some(k => name.includes(k))) {
    return [0.88,0.92,0.97,1.0,1.0,1.02,0.9,0.88,0.95,1.02,1.08,1.05];
  }
  // Electronics: Diwali Oct/Nov bump, Jan post-sale dip
  return [0.92,0.93,0.95,0.97,0.98,0.98,0.97,0.97,0.99,1.05,1.08,1.0];
}

/**
 * Build seeded seasonal history for a given item+tier+year.
 * Returns one row per month (Jan-Dec), quality = 'good' (the dominant baseline grade).
 */
export function buildSeededSeasonalHistory(
  itemName: string,
  category: ItemCategory,
  baseAvg: number,
  tier: LocalityTier,
  year: number = new Date().getFullYear()
): SeasonalHistoryPoint[] {
  const tierMult = tier === 'tier1_metro' ? 1.25 : tier === 'rural' ? 0.80 : 1.0;
  
  // Apply a synthetic inflation/deflation factor of ~5% per year from 2026
  const baseYear = 2026;
  const yearDiff = year - baseYear;
  const inflationFactor = Math.pow(1.05, yearDiff);
  
  const adjustedBase = baseAvg * tierMult * inflationFactor;

  const curve = category === 'produce'
    ? produceSeasonalCurve(itemName, adjustedBase)
    : flatSeasonalCurve(itemName, adjustedBase);

  return MONTH_LABELS.map((label, i) => ({
    period: label,
    monthIndex: i,
    avgPrice: Math.round(adjustedBase * curve[i]),
    qualityGrade: 'good' as QualityGrade,
    sampleSize: 18 + Math.round(Math.random() * 24),
  }));
}


/**
 * Query seasonal history from Supabase, with seeded fallback.
 */
export async function querySeasonalHistory(
  itemName: string,
  category: ItemCategory,
  tier: LocalityTier,
  year: number = new Date().getFullYear()
): Promise<{ history: SeasonalHistoryPoint[]; source: 'supabase' | 'seeded_baseline' }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('seasonal_price_history')
        .select('*')
        .ilike('item_name', `%${itemName.split(' ')[0]}%`)
        .eq('category', category)
        .eq('locality_tier', tier)
        .eq('quality_grade', 'good')
        // if there's a year column we would add .eq('year', year), assuming year is not there
        .order('month', { ascending: true });

      if (!error && data && data.length >= 4) {
        const history: SeasonalHistoryPoint[] = data.map((row: any) => ({
          period: MONTH_LABELS[row.month - 1] ?? String(row.month),
          monthIndex: row.month - 1,
          avgPrice: row.avg_price,
          qualityGrade: row.quality_grade as QualityGrade,
          sampleSize: row.sample_size,
        }));
        return { history, source: 'supabase' };
      }
    } catch (e) {
      console.warn('Supabase seasonal query error, falling back:', e);
    }
  }

  // Seeded fallback — derive base avg from SEEDED_PRICE_BANDS
  const matchingBand = SEEDED_PRICE_BANDS.find(
    b => b.item_name.toLowerCase().includes(itemName.toLowerCase().split(' ')[0]) &&
         b.category === category &&
         b.locality_tier === tier
  ) ?? SEEDED_PRICE_BANDS.find(
    b => b.item_name.toLowerCase().includes(itemName.toLowerCase().split(' ')[0]) &&
         b.category === category
  );

  const baseAvg = matchingBand
    ? (matchingBand.base_min_price + matchingBand.base_max_price) / 2
    : 100;

  return {
    history: buildSeededSeasonalHistory(itemName, category, baseAvg, tier, year),
    source: 'seeded_baseline',
  };
}

