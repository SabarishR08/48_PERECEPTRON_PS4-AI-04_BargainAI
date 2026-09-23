import { NextRequest, NextResponse } from 'next/server';
import { identifyItemFromImage, generatePriceEstimate } from '@/lib/gemini';
import { queryPriceBands, determineLocalityTier } from '@/lib/supabase';
import { ItemCategory, ItemCondition, LocalityTier } from '@/lib/types';

export const maxDuration = 30; // 30s timeout for Vercel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemText, itemPhoto, location, categoryHint } = body;

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

    // Step 3: Check if item fits supported categories
    // If not explicitly set and text hints exist, attempt quick match
    if (detectedCategory === 'unknown' && detectedName) {
      const lower = detectedName.toLowerCase();
      if (['tomato', 'onion', 'potato', 'banana', 'apple', 'spinach', 'fruit', 'vegetable', 'sabzi', 'chilli', 'mango'].some(w => lower.includes(w))) {
        detectedCategory = 'produce';
      } else if (['cable', 'charger', 'earphone', 'headphone', 'case', 'cover', 'glass', 'usb', 'type-c', 'adapter', 'neckband'].some(w => lower.includes(w))) {
        detectedCategory = 'electronics';
      } else if (['shirt', 't-shirt', 'kurti', 'jeans', 'pant', 'dupatta', 'socks', 'belt', 'cloth', 'apparel', 'trouser'].some(w => lower.includes(w))) {
        detectedCategory = 'apparel';
      }
    }

    // If ambiguous or unsupported category
    if (detectedCategory === 'unknown' && visionConfidence === 'low' && !itemText) {
      return NextResponse.json({
        success: false,
        confidence: 'low',
        priceRange: { min: 0, max: 0, currency: '₹', unit: 'piece' },
        matchedCategory: 'unknown',
        identifiedItem: detectedName || 'Unrecognized Item',
        localityTier,
        location: locationString,
        reasoning: 'The item could not be recognized as one of the 3 supported categories (Produce, Electronics Accessories, Apparel).',
        clarificationMessage: 'Could you please specify the item name and choose from Fresh Produce, Electronics Accessories, or Basic Apparel?',
        negotiationTips: [
          'Verify that the item is within supported categories for fair price guidance.',
          'Try taking a clearer, well-lit photo of the item on a plain background.',
          'Provide the specific item name in the text field.'
        ],
        disclaimer: 'Estimate based on category pricing patterns, not live market data'
      });
    }

    // Step 4: Query seeded Supabase price bands
    const { bands, source } = await queryPriceBands(
      detectedCategory === 'unknown' ? undefined : detectedCategory,
      detectedName,
      localityTier
    );

    // Step 5: Call Gemini text/structured mode for price estimate & negotiation advice
    const estimate = await generatePriceEstimate({
      itemName: detectedName || 'Local market merchandise',
      category: detectedCategory,
      condition: detectedCondition,
      location: locationString || 'Local Bazaar',
      localityTier,
      referenceBands: bands,
      referenceSource: source
    });

    return NextResponse.json({
      ...estimate,
      location: locationString,
      localityTier
    });
  } catch (error: any) {
    console.error('API /estimate error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process negotiation estimate' },
      { status: 500 }
    );
  }
}
