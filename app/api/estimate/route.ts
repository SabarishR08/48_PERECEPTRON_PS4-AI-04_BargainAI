import { NextRequest, NextResponse } from 'next/server';
import { identifyItemFromImage, generatePriceEstimate } from '@/lib/gemini';
import { queryPriceBands, determineLocalityTier, getSeasonalMultiplier } from '@/lib/supabase';
import { ItemCategory, ItemCondition, LocalityTier, UserRole } from '@/lib/types';

export const maxDuration = 30; // 30s timeout for Vercel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemText, itemPhoto, location, categoryHint, role: rawRole } = body;

    const role: UserRole = rawRole === 'seller' ? 'seller' : 'buyer';

    if (!itemText && !itemPhoto) {
      return NextResponse.json(
        { error: 'Please provide either an item description or a photo.' },
        { status: 400 }
      );
    }

    let detectedName = itemText ? itemText.trim() : '';
    let detectedCategory: ItemCategory | 'unknown' = categoryHint || 'unknown';
    let detectedCondition: ItemCondition = 'fair';
    let visionConfidence: 'high' | 'medium' | 'low' = 'high';

    // Step 1: Process photo with Gemini Vision if provided
    if (itemPhoto) {
      const visionResult = await identifyItemFromImage(itemPhoto);
      if (visionResult) {
        if (!detectedName || visionResult.confidence === 'high') {
          detectedName = visionResult.identifiedItem || detectedName;
        }
        if (visionResult.category !== 'unknown') {
          detectedCategory = visionResult.category as ItemCategory;
        }
        detectedCondition = visionResult.condition;
        visionConfidence = visionResult.confidence;
      }
    }

    // Step 2: Determine Locality Tier
    const locationString = typeof location === 'string' 
      ? location 
      : `${location?.city || 'Local Market'} ${location?.locality || ''}`.trim();

    const { tier: derivedTier } = determineLocalityTier(locationString);
    const localityTier: LocalityTier = (location?.tier as LocalityTier) || derivedTier;

    // Step 3: Precise keyword matching with whole-word or specific token regex
    if (detectedCategory === 'unknown' && detectedName) {
      const lower = detectedName.toLowerCase();
      // Exclude false friends like 'vegetable oil' or 'cloth bag'
      const isProduce = /\b(tomato|tomatoes|onion|onions|potato|potatoes|banana|bananas|apple|apples|spinach|palak|sabzi|chilli|chillies|ginger|adrak|mango|mangoes)\b/i.test(lower);
      const isElectronics = /\b(cable|charger|charging|earphone|earphones|headphone|headphones|case|cover|tempered glass|usb|type-c|adapter|neckband|otg)\b/i.test(lower);
      const isApparel = /\b(t-shirt|tshirt|shirt|kurti|kurtis|jeans|denim|pant|pants|dupatta|socks|belt|trouser|trousers|jogger|joggers|handkerchief)\b/i.test(lower);

      if (isProduce) {
        detectedCategory = 'produce';
      } else if (isElectronics) {
        detectedCategory = 'electronics';
      } else if (isApparel) {
        detectedCategory = 'apparel';
      }
    }

    // Guard: If category is unknown OR (low confidence with no recognized item match), trigger clarification
    if (detectedCategory === 'unknown') {
      return NextResponse.json({
        success: false,
        role,
        confidence: 'low',
        priceRange: { min: 0, max: 0, currency: '₹', unit: 'piece' },
        matchedCategory: 'unknown',
        identifiedItem: detectedName || 'Unrecognized Item',
        localityTier,
        location: locationString,
        reasoning: 'The item could not be reliably matched to one of the 3 supported categories (Fresh Produce, Electronics Accessories, Basic Apparel).',
        clarificationMessage: 'Could you please specify the item name and select from Fresh Produce, Electronics Accessories, or Basic Apparel?',
        negotiationTips: [
          'Verify that the item is within supported categories for fair price guidance.',
          'Try taking a clearer, well-lit photo of the item on a plain background.',
          'Type the specific item name in the text box.'
        ],
        disclaimer: 'Estimate based on category pricing patterns, not live market data'
      });
    }

    // Step 4: Compute seasonal multiplier
    const seasonalFactor = getSeasonalMultiplier(detectedCategory, detectedName);

    // Step 5: Query seeded Supabase price bands
    const { bands, source } = await queryPriceBands(
      detectedCategory,
      detectedName,
      localityTier
    );

    // Step 6: Call Gemini text/structured mode for price estimate & negotiation advice
    const estimate = await generatePriceEstimate({
      itemName: detectedName || 'Local market merchandise',
      category: detectedCategory,
      condition: detectedCondition,
      location: locationString || 'Local Bazaar',
      localityTier,
      role,
      seasonalFactor,
      referenceBands: bands,
      referenceSource: source
    });

    return NextResponse.json({
      ...estimate,
      location: locationString,
      localityTier,
      seasonalFactor
    });
  } catch (error: any) {
    console.error('API /estimate error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process negotiation estimate' },
      { status: 500 }
    );
  }
}
