import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { 
  VisionIdentificationResult, 
  EstimateResponse, 
  ItemCategory, 
  LocalityTier, 
  ItemCondition,
  PriceBand 
} from './types';
import { VISION_IDENTIFICATION_SYSTEM_PROMPT } from './prompts/vision';
import { PRICE_ESTIMATION_SYSTEM_PROMPT } from './prompts/pricing';

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Identify item from image base64 using Gemini Vision
 */
export async function identifyItemFromImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<VisionIdentificationResult> {
  const genAI = getGeminiClient();

  if (!genAI) {
    return {
      identifiedItem: 'Produce / Accessory / Apparel (API Key Pending)',
      category: 'unknown',
      condition: 'fair',
      confidence: 'low',
      visualObservations: 'GEMINI_API_KEY is not configured in .env.local. Please configure your key to enable live vision identification.',
      suggestedUnit: 'piece'
    };
  }

  // Clean data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            identifiedItem: { type: SchemaType.STRING },
            category: { 
              type: SchemaType.STRING, 
              format: 'enum',
              enum: ['produce', 'electronics', 'apparel', 'unknown'] 
            },
            condition: { 
              type: SchemaType.STRING, 
              format: 'enum',
              enum: ['new', 'used', 'damaged', 'fresh', 'fair'] 
            },
            confidence: { 
              type: SchemaType.STRING, 
              format: 'enum',
              enum: ['high', 'medium', 'low'] 
            },
            suggestedUnit: { type: SchemaType.STRING },
            visualObservations: { type: SchemaType.STRING }
          },
          required: ['identifiedItem', 'category', 'condition', 'confidence', 'suggestedUnit', 'visualObservations']
        } as any,
        temperature: 0.2
      },
      systemInstruction: VISION_IDENTIFICATION_SYSTEM_PROMPT
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data
        }
      },
      {
        text: 'Examine this item photo carefully. Output strict JSON with: identifiedItem, category (produce|electronics|apparel|unknown), condition (fresh|fair|new|used|damaged), confidence (high|medium|low), suggestedUnit, visualObservations.'
      }
    ]);

    const text = result.response.text();
    if (!text) {
      throw new Error('Empty response from Gemini Vision');
    }

    const parsed = JSON.parse(text) as VisionIdentificationResult;
    return parsed;
  } catch (error: any) {
    console.error('Gemini Vision Identification Error:', error);
    return {
      identifiedItem: 'Unrecognized Item',
      category: 'unknown',
      condition: 'fair',
      confidence: 'low',
      visualObservations: `Image analysis encountered an error: ${error?.message || 'Could not process photo'}.`,
      suggestedUnit: 'piece'
    };
  }
}

/**
 * Generate fair price range, reasoning, and negotiation tactics
 */
export async function generatePriceEstimate(params: {
  itemName: string;
  category: ItemCategory | 'unknown';
  condition: ItemCondition;
  location: string;
  localityTier: LocalityTier;
  referenceBands: PriceBand[];
  referenceSource: 'supabase' | 'seeded_baseline';
}): Promise<EstimateResponse> {
  const {
    itemName,
    category,
    condition,
    location,
    localityTier,
    referenceBands,
    referenceSource
  } = params;

  // Find the best matching reference band for the target tier
  const tierMatchingBand = referenceBands.find(b => b.locality_tier === localityTier) || referenceBands[0];
  const baselineMin = tierMatchingBand ? Number(tierMatchingBand.base_min_price) : 50;
  const baselineMax = tierMatchingBand ? Number(tierMatchingBand.base_max_price) : 100;
  const multiplier = tierMatchingBand ? Number(tierMatchingBand.locality_multiplier) : 1.0;
  const unit = tierMatchingBand ? tierMatchingBand.unit : 'piece';

  const genAI = getGeminiClient();

  if (!genAI) {
    // Note: In our seed schema, base_min_price and base_max_price for tier1_metro/rural
    // are already adjusted for that specific tier, so we use them directly to prevent double-counting.
    const calcMin = Math.round(baselineMin);
    const calcMax = Math.round(baselineMax);

    return {
      success: true,
      priceRange: {
        min: calcMin,
        max: calcMax,
        currency: '₹',
        unit
      },
      confidence: category === 'unknown' ? 'low' : 'medium',
      reasoning: `Calculated from ${referenceSource} reference data: baseline [₹${baselineMin} - ₹${baselineMax}] with a ${multiplier}x multiplier for ${localityTier} (${location}). Factor in item condition (${condition}). Note: Configure GEMINI_API_KEY in .env.local for rich AI market negotiation insights!`,
      negotiationTips: [
        `Inspect the item condition thoroughly before mentioning any price.`,
        `Start your counter-offer at ₹${Math.round(calcMin * 0.75)} (${Math.round(calcMin * 0.75)} is ~25% below the lower bracket).`,
        `For produce/small items, ask for a round figure or volume deal (e.g., 'Do kilo ka kitna doge?').`,
        `Be polite but firm: 'Bhaiya, bagal wali dukan me ₹${calcMin} me mil raha tha.' (The adjacent stall is offering it for ₹${calcMin}).`,
        `Your walk-away threshold is ₹${calcMax}; beyond that, explore neighboring street stalls.`
      ],
      playbook: {
        openingOffer: `₹${Math.round(calcMin * 0.75)} per ${unit}`,
        targetPrice: `₹${calcMin} - ₹${Math.round((calcMin + calcMax) / 2)} per ${unit}`,
        walkAwayPrice: `₹${calcMax} per ${unit}`,
        concessionStrategy: `Never accept the first quote. Offer ₹${Math.round(calcMin * 0.75)}, and if they hesitate, slowly inch up to ₹${calcMin} only if quality is unblemished.`,
        keyPhrases: [
          `"Sahi daam lagao bhaiya, regular customer hoon." (Give me a fair price, I am a regular buyer)`,
          `"Thoda aur adjust karo, cash de raha hoon." (Give a little discount, I am paying cash)`,
          `"Theek hai, aage dekh lete hain." (Alright, let me check the other stalls)`
        ]
      },
      matchedCategory: category,
      identifiedItem: itemName,
      condition,
      localityTier,
      location,
      referenceData: {
        source: referenceSource,
        baselineMin,
        baselineMax,
        multiplier,
        unit
      },
      disclaimer: 'Estimate based on category pricing patterns, not live market data'
    };
  }

  // Construct structured prompt for Gemini
  const promptInput = `
ITEM TO ESTIMATE:
- Name: "${itemName}"
- Category: "${category}"
- Condition: "${condition}"

LOCALITY CONTEXT:
- Location / City: "${location}"
- Locality Tier: "${localityTier}" (Multiplier ~${multiplier})

REFERENCE PRICE BAND FROM DATABASE (${referenceSource}):
${tierMatchingBand ? JSON.stringify(tierMatchingBand) : 'No exact match found; utilize category baseline heuristics.'}

TASK:
1. Suggest a realistic fair price range [min, max] in Indian Rupees (₹) and specified unit.
2. Ground your reasoning strictly on the reference data and locality multiplier.
3. If category is "unknown" or input is out of scope (not produce/electronics accessories/apparel), return confidence: "low", priceRange [0, 0], and a helpful clarification message.
4. Formulate 3-5 street-smart local market negotiation tips + tactical playbook (opening offer, target, walk-away, concession strategy, natural spoken vernacular bargaining phrases with English translation).
`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            priceRange: {
              type: SchemaType.OBJECT,
              properties: {
                min: { type: SchemaType.NUMBER },
                max: { type: SchemaType.NUMBER },
                currency: { type: SchemaType.STRING },
                unit: { type: SchemaType.STRING }
              },
              required: ['min', 'max', 'currency', 'unit']
            },
            confidence: {
              type: SchemaType.STRING,
              format: 'enum',
              enum: ['high', 'medium', 'low']
            },
            reasoning: {
              type: SchemaType.STRING
            },
            negotiationTips: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            },
            playbook: {
              type: SchemaType.OBJECT,
              properties: {
                openingOffer: { type: SchemaType.STRING },
                targetPrice: { type: SchemaType.STRING },
                walkAwayPrice: { type: SchemaType.STRING },
                concessionStrategy: { type: SchemaType.STRING },
                keyPhrases: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING }
                }
              },
              required: ['openingOffer', 'targetPrice', 'walkAwayPrice', 'concessionStrategy', 'keyPhrases']
            },
            clarificationMessage: {
              type: SchemaType.STRING
            }
          },
          required: ['priceRange', 'confidence', 'reasoning', 'negotiationTips', 'playbook']
        } as any,
        temperature: 0.3
      },
      systemInstruction: PRICE_ESTIMATION_SYSTEM_PROMPT
    });

    const result = await model.generateContent(promptInput);
    const text = result.response.text();
    if (!text) {
      throw new Error('Empty response from Gemini Pricing');
    }

    const parsed = JSON.parse(text);

    return {
      success: true,
      priceRange: {
        min: parsed.priceRange.min,
        max: parsed.priceRange.max,
        currency: parsed.priceRange.currency || '₹',
        unit: parsed.priceRange.unit || unit
      },
      confidence: parsed.confidence || (category === 'unknown' ? 'low' : 'high'),
      reasoning: parsed.reasoning,
      negotiationTips: parsed.negotiationTips || [],
      playbook: parsed.playbook,
      clarificationMessage: parsed.clarificationMessage,
      matchedCategory: category,
      identifiedItem: itemName,
      condition,
      localityTier,
      location,
      referenceData: {
        source: referenceSource,
        baselineMin,
        baselineMax,
        multiplier,
        unit
      },
      disclaimer: 'Estimate based on category pricing patterns, not live market data'
    };
  } catch (error: any) {
    console.error('Gemini Price Estimation Error:', error);
    return {
      success: false,
      priceRange: {
        min: Math.round(baselineMin * multiplier),
        max: Math.round(baselineMax * multiplier),
        currency: '₹',
        unit
      },
      confidence: 'low',
      reasoning: `Gemini API query encountered an issue (${error?.message || 'Unknown error'}). Fallback estimate generated based on baseline data.`,
      negotiationTips: [
        'Always check the product quality before finalizing price.',
        'Offer 15-20% below the seller’s first quote.',
        'Compare across 2-3 nearby stalls in the market.'
      ],
      matchedCategory: category,
      identifiedItem: itemName,
      condition,
      localityTier,
      location,
      disclaimer: 'Estimate based on category pricing patterns, not live market data'
    };
  }
}
