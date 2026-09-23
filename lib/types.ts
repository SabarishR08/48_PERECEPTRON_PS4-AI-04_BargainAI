export type ItemCategory = 'produce' | 'electronics' | 'apparel';

export type LocalityTier = 'tier1_metro' | 'tier2_city' | 'rural';

export type ItemCondition = 'new' | 'used' | 'damaged' | 'fresh' | 'fair';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

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

export interface NegotiationPlaybook {
  openingOffer: string;
  targetPrice: string;
  walkAwayPrice: string;
  concessionStrategy: string;
  keyPhrases: string[];
}

export interface EstimateResponse {
  success: boolean;
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
  referenceData?: {
    source: 'supabase' | 'seeded_baseline';
    baselineMin: number;
    baselineMax: number;
    multiplier: number;
    unit: string;
  };
  clarificationMessage?: string;
  disclaimer: string;
}

export interface EstimateRequest {
  itemText: string;
  itemPhoto?: string; // base64 string
  location: {
    city: string;
    locality?: string;
    tier?: LocalityTier;
  };
  categoryHint?: ItemCategory;
}
