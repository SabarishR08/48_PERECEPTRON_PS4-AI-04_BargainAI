export type ItemCategory = 'produce' | 'electronics' | 'apparel';

export type LocalityTier = 'tier1_metro' | 'tier2_city' | 'rural';

export type ItemCondition = 'new' | 'used' | 'damaged' | 'fresh' | 'fair';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type UserRole = 'buyer' | 'seller';

export interface PriceBand {
  id?: string;
  category: ItemCategory;
  item_name: string;
  base_min_price: number;
  base_max_price: number;
  unit: string;
  locality_tier: LocalityTier;
  locality_multiplier: number;
  last_updated?: string;
}

export interface VisionIdentificationResult {
  identifiedItem: string;
  category: ItemCategory | 'unknown';
  condition: ItemCondition;
  confidence: ConfidenceLevel;
  visualObservations: string;
  suggestedUnit: string;
}

export interface SeasonalFactor {
  seasonName: string;
  multiplier: number;
  impactLabel: string;
  reason: string;
}

export interface NegotiationPlaybook {
  role: UserRole;
  openingOffer: string; // For buyer: opening counter. For seller: initial asking quote.
  targetPrice: string;  // Fair settlement target.
  walkAwayPrice: string;// For buyer: ceiling price. For seller: bottom-line margin floor.
  concessionStrategy: string;
  keyPhrases: string[];
}

export interface EstimateResponse {
  success: boolean;
  role: UserRole;
  priceRange: {
    min: number;
    max: number;
    currency: string;
    unit: string;
  };
  reasoning: string;
  negotiationTips: string[];
  playbook?: NegotiationPlaybook;
  confidence: ConfidenceLevel;
  matchedCategory: ItemCategory | 'unknown';
  identifiedItem: string;
  condition: ItemCondition;
  localityTier: LocalityTier;
  location: string;
  seasonalFactor?: SeasonalFactor;
  referenceData?: {
    source: 'supabase' | 'seeded_baseline';
    baselineMin: number;
    baselineMax: number;
    multiplier: number;
    unit: string;
    lastUpdated?: string;
  };
  clarificationMessage?: string;
  disclaimer: string;
}

export interface EstimateRequest {
  itemText: string;
  itemPhoto?: string; // base64 string
  role?: UserRole;
  location: {
    city: string;
    locality?: string;
    tier?: LocalityTier;
  };
  categoryHint?: ItemCategory;
}
