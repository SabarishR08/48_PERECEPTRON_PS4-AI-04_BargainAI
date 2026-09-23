import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { 
  VisionIdentificationResult, 
  EstimateResponse, 
  ItemCategory, 
  LocalityTier, 
  ItemCondition,
  UserRole,
  SeasonalFactor,
  PriceBand,
  TrendDirection
} from './types';
import { VISION_IDENTIFICATION_SYSTEM_PROMPT } from './prompts/vision';
import { getPriceEstimationSystemPrompt } from './prompts/pricing';
import { SEASONAL_INSIGHT_SYSTEM_PROMPT } from './prompts/seasonal';

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

// Memory cache for the discovered working model to avoid repeated queries
let cachedWorkingModel: string | null = null;

// Default active valid model (gemini-3.6-flash is recommended by Google GenAI)
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// Prioritized list of active, valid models for Gemini API (generateContent + Vision)
const FALLBACK_MODEL_CANDIDATES = [
  DEFAULT_GEMINI_MODEL,
  'gemini-3.6-flash',
  'gemini-3.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-pro'
].filter((m, i, arr) => m && arr.indexOf(m) === i) as string[];

/**
 * Discovers available models for this specific API key via ListModels
 */
async function resolveWorkingModels(): Promise<string[]> {
  if (cachedWorkingModel) {
    return [cachedWorkingModel, ...FALLBACK_MODEL_CANDIDATES.filter(m => m !== cachedWorkingModel)];
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const data = await res.json();
        const available = (data.models || [])
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''));

        // Match against preferred candidate order
        for (const candidate of FALLBACK_MODEL_CANDIDATES) {
          if (available.includes(candidate)) {
            cachedWorkingModel = candidate;
            console.log(`Discovered active matching Gemini model: ${candidate}`);
            return [candidate, ...available.filter((m: string) => m !== candidate)];
          }
        }
        if (available.length > 0) {
          const flash = available.find((m: string) => m.includes('flash'));
          cachedWorkingModel = flash || available[0];
          console.log(`Selected available Gemini model: ${cachedWorkingModel}`);
          return [cachedWorkingModel, ...available.filter((m: string) => m !== cachedWorkingModel)];
        }
      }
    } catch (e) {
      console.warn('Could not query dynamic Gemini model list, using candidate chain:', e);
    }
  }

  return FALLBACK_MODEL_CANDIDATES;
}

/**
 * Executes a Promise with a strict timeout rejection
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Executes a Gemini operation with automatic model fallback across candidate versions,
 * strictly bounded by totalTimeoutMs to prevent Vercel 504 serverless invocation timeouts.
 */
async function executeWithModelFallback<T>(
  genAI: GoogleGenerativeAI,
  operation: (modelName: string) => Promise<T>,
  totalTimeoutMs: number = 7000
): Promise<T> {
  const deadline = Date.now() + totalTimeoutMs;
  let primary = cachedWorkingModel;
  if (!primary) {
    const models = await resolveWorkingModels();
    primary = models[0] || DEFAULT_GEMINI_MODEL;
  }

  const primaryBudget = Math.min(totalTimeoutMs, Math.max(1500, deadline - Date.now()));
  try {
    const result = await withTimeout(operation(primary), primaryBudget, `Primary model (${primary})`);
    cachedWorkingModel = primary;
    return result;
  } catch (err: any) {
    const remainingTime = deadline - Date.now();
    if (remainingTime < 2000) {
      // Under 2s remaining — throw immediately so caller can return local deterministic fallback in < 10ms
      console.warn(`Primary model "${primary}" failed or timed out (${err?.message}). Insufficient time for candidate fallback (${remainingTime}ms remaining).`);
      throw err;
    }

    console.warn(`Primary model "${primary}" failed (${err?.message}). Attempting fast candidate fallback with ${remainingTime}ms remaining...`);
    const fallbackCandidates = FALLBACK_MODEL_CANDIDATES.filter(m => m !== primary);
    const candidate = fallbackCandidates[0] || 'gemini-3.6-flash';
    
    try {
      const result = await withTimeout(operation(candidate), remainingTime - 400, `Fallback model (${candidate})`);
      cachedWorkingModel = candidate;
      return result;
    } catch (fallbackErr: any) {
      console.warn(`Candidate model "${candidate}" failed (${fallbackErr?.message || fallbackErr}). Triggering algorithmic fallback.`);
      throw fallbackErr || err;
    }
  }
}

/**
 * Clean and robust JSON parsing for Gemini text responses (strips markdown code blocks and preambles)
 */
function parseGeminiJsonResponse<T>(text: string, fallback?: T): T {
  try {
    let cleaned = text.trim();
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      cleaned = jsonMatch[1].trim();
    } else {
      const objectMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (objectMatch) {
        cleaned = objectMatch[1].trim();
      }
    }
    return JSON.parse(cleaned) as T;
  } catch (err) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

/**
 * Identify item from image base64 using Gemini Vision with dynamic model fallback
 */
export async function identifyItemFromImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<VisionIdentificationResult> {
  const genAI = getGeminiClient();

  if (!genAI) {
    return {
      identifiedItem: 'Unidentified Item (API Key Pending)',
      category: 'unknown',
      condition: 'fair',
      confidence: 'low',
      visualObservations: 'GEMINI_API_KEY is not configured in .env.local. Please configure your key to enable live vision identification.',
      suggestedUnit: 'piece'
    };
  }

  // Extract actual MIME type from data URL if present
  let effectiveMime = mimeType;
  const mimeMatch = imageBase64.match(/^data:([^;]+);base64,/);
  if (mimeMatch) {
    effectiveMime = mimeMatch[1];
  }
  const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '');

  try {
    return await executeWithModelFallback(genAI, async (modelName) => {
      const model = genAI.getGenerativeModel({
        model: modelName,
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
            mimeType: effectiveMime,
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

      return parseGeminiJsonResponse<VisionIdentificationResult>(text);
    }, 7500);
  } catch (error: any) {
    console.error('Gemini Vision Identification Error after fallback chain:', error);
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
 * Generate fair price range, reasoning, and role-tailored negotiation tactics
 */
export async function generatePriceEstimate(params: {
  itemName: string;
  category: ItemCategory | 'unknown';
  condition: ItemCondition;
  localityTier: LocalityTier;
  location: string;
  role?: UserRole;
  matchingBand?: PriceBand | null;
  tierMatchingBand?: PriceBand | null;
  referenceBands?: PriceBand[];
  referenceSource?: 'supabase' | 'seeded_baseline';
  seasonalFactor?: SeasonalFactor | null;
}): Promise<EstimateResponse> {
  const {
    itemName,
    category,
    condition,
    localityTier,
    location,
    role = 'buyer',
    seasonalFactor,
    referenceBands
  } = params;

  const tierMatchingBand = params.tierMatchingBand || 
    (referenceBands?.find(b => b.locality_tier === localityTier) || referenceBands?.[0]);

  const rawMin = tierMatchingBand ? Number(tierMatchingBand.base_min_price) : 50;
  const rawMax = tierMatchingBand ? Number(tierMatchingBand.base_max_price) : 120;
  const unit = tierMatchingBand?.unit ?? 'piece';
  const multiplier = tierMatchingBand ? Number(tierMatchingBand.locality_multiplier) : 1.0;
  const referenceSource = params.referenceSource || (tierMatchingBand ? 'supabase' : 'seeded_baseline');

  // Apply seasonal multiplier if commodity is produce
  const seasonMult = seasonalFactor?.multiplier ?? 1.0;
  const baselineMin = Math.round(rawMin * seasonMult);
  const baselineMax = Math.round(rawMax * seasonMult);

  const genAI = getGeminiClient();

  // If Gemini client not available, generate deterministic fallback
  if (!genAI) {
    const calcMin = baselineMin;
    const calcMax = baselineMax;

    const buyerTips = [
      'Inspect product quality thoroughly (seams, cables, or freshness) before starting your counter-offer.',
      `Anchor your opening offer at ₹${Math.round(calcMin * 0.75)} to establish strong bargaining leverage.`,
      `Aim to settle between ₹${calcMin} and ₹${Math.round((calcMin + calcMax) / 2)}, which gives the seller a fair transaction margin.`,
      `Walk away if the seller refuses to go below ₹${calcMax} per ${unit}; similar items are available at neighboring stalls.`
    ];

    const sellerTips = [
      'Highlight origin and freshness immediately: inform the buyer your stock is fresh from morning wholesale arrivals.',
      `Start by quoting ₹${calcMax} per ${unit} to preserve room for customary customer bargaining.`,
      `Counter lowball offers with bundle volume: "Bhaiya, agar 2 loge toh ₹${Math.round((calcMin + calcMax) / 2)} me laga doonga."`,
      `Stand firm on your bottom line (₹${calcMin}) to safeguard daily stall margins.`,
      'Offer value reassurance: offer to let the customer inspect and weigh the goods on a digital scale.'
    ];

    return {
      success: true,
      role,
      priceRange: {
        min: calcMin,
        max: calcMax,
        currency: '₹',
        unit
      },
      confidence: category === 'unknown' ? 'low' : 'medium',
      reasoning: `Calculated from ${referenceSource} reference data: baseline [₹${rawMin} - ₹${rawMax}] with a ${multiplier}x multiplier for ${localityTier} (${location})${seasonalFactor ? ` and ${seasonalFactor.impactLabel} (${seasonalFactor.seasonName})` : ''}. Note: Configure GEMINI_API_KEY in .env.local for rich AI market negotiation insights!`,
      negotiationTips: role === 'seller' ? sellerTips : buyerTips,
      playbook: {
        role,
        openingOffer: role === 'seller' ? `₹${calcMax} per ${unit}` : `₹${Math.round(calcMin * 0.75)} per ${unit}`,
        targetPrice: `₹${calcMin} - ₹${Math.round((calcMin + calcMax) / 2)} per ${unit}`,
        walkAwayPrice: role === 'seller' ? `₹${calcMin} per ${unit} (Margin floor)` : `₹${calcMax} per ${unit} (Ceiling)`,
        concessionStrategy: role === 'seller'
          ? `Quote ₹${calcMax}. Only concede down towards ₹${Math.round((calcMin + calcMax) / 2)} if the customer buys volume or pays cash immediately.`
          : `Never accept the first quote. Offer ₹${Math.round(calcMin * 0.75)}, and if they hesitate, slowly inch up to ₹${calcMin} only if quality is unblemished.`,
        keyPhrases: role === 'seller'
          ? [
              `"Bhaiya subah mandi se chhan ke taaza maal laya hoon, ek daam badhiya quality hai." (Fresh handpicked stock from morning mandi)`,
              `"Aap regular customer ho, 2 piece loge toh thoda aur adjust kar doonga." (If you take 2 pieces, I can give a volume discount)`,
              `"Isse kam me toh lagat bhi nahi niklegi bhaiya." (Below this I cannot even recover wholesale cost)`
            ]
          : [
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
      seasonalFactor,
      referenceData: {
        source: referenceSource,
        baselineMin: rawMin,
        baselineMax: rawMax,
        multiplier,
        unit,
        lastUpdated: tierMatchingBand?.last_updated || new Date().toISOString()
      },
      disclaimer: 'Estimate based on category pricing patterns, not live market data'
    };
  }

  // Construct structured prompt for Gemini with role & seasonal context
  const promptInput = `
USER ROLE: ${role.toUpperCase()} (${role === 'seller' ? 'Vendor/Seller seeking fair margin defense' : 'Shopper/Buyer seeking fair price protection'})

ITEM TO ESTIMATE:
- Name: "${itemName}"
- Category: "${category}"
- Observed Condition: "${condition}"

LOCALITY CONTEXT:
- Location / City: "${location}"
- Locality Tier: "${localityTier}" (Multiplier ~${multiplier})
${seasonalFactor ? `- Seasonal Factor: "${seasonalFactor.seasonName}" (${seasonalFactor.impactLabel}, ${seasonalFactor.reason})` : ''}

REFERENCE PRICE BAND FROM DATABASE (${referenceSource}):
${tierMatchingBand ? JSON.stringify(tierMatchingBand) : 'No exact match found; utilize category baseline heuristics.'}
Adjusted Baseline Corridor: ₹${baselineMin} - ₹${baselineMax} / ${unit}

TASK:
1. Suggest an objective, fair market price range [min, max] in Indian Rupees (₹) and specified unit.
2. Ground your reasoning strictly on the reference data, locality multiplier, and seasonal factors.
3. If category is "unknown" or input is out of scope (not produce/electronics accessories/apparel), return confidence: "low", priceRange [0, 0], and a helpful clarification message.
4. Formulate 3-5 street-smart negotiation tips and a structured playbook specifically tailored for the ${role.toUpperCase()} role (openingOffer, targetPrice, walkAwayPrice, concessionStrategy, natural spoken vernacular bargaining phrases with English translation).
`;

  try {
    const parsed = await executeWithModelFallback(genAI, async (modelName) => {
      const model = genAI.getGenerativeModel({
        model: modelName,
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
              clarificationMessage: {
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
              }
            },
            required: ['priceRange', 'confidence', 'reasoning', 'negotiationTips', 'playbook']
          } as any,
          temperature: 0.3
        },
        systemInstruction: getPriceEstimationSystemPrompt(role)
      });

      const result = await model.generateContent(promptInput);
      const text = result.response.text();
      return parseGeminiJsonResponse<any>(text);
    }, 6500);

    return {
      success: true,
      role,
      priceRange: {
        min: parsed.priceRange.min,
        max: parsed.priceRange.max,
        currency: parsed.priceRange.currency || '₹',
        unit: parsed.priceRange.unit || unit
      },
      confidence: parsed.confidence || (category === 'unknown' ? 'low' : 'high'),
      reasoning: parsed.reasoning,
      negotiationTips: parsed.negotiationTips || [],
      playbook: {
        ...parsed.playbook,
        role
      },
      clarificationMessage: parsed.clarificationMessage,
      matchedCategory: category,
      identifiedItem: itemName,
      condition,
      localityTier,
      location,
      seasonalFactor,
      referenceData: {
        source: referenceSource,
        baselineMin: rawMin,
        baselineMax: rawMax,
        multiplier,
        unit,
        lastUpdated: tierMatchingBand?.last_updated || new Date().toISOString()
      },
      disclaimer: 'Estimate based on category pricing patterns, not live market data'
    };
  } catch (error: any) {
    console.error('Gemini Price Estimation Error after fallback chain:', error);
    return {
      success: false,
      role,
      priceRange: {
        min: baselineMin,
        max: baselineMax,
        currency: '₹',
        unit
      },
      confidence: 'low',
      reasoning: `Gemini API query encountered an issue (${error?.message || 'Unknown error'}). Fallback estimate generated based on baseline data.`,
      negotiationTips: role === 'seller' ? [
        'State your purchase costs and emphasize morning freshness.',
        'Offer discounts only on volume/bulk purchases.',
        'Politely decline prices below your wholesale cost.'
      ] : [
        'Always check the product quality before finalizing price.',
        'Offer 15-20% below the seller’s first quote.',
        'Compare across 2-3 nearby stalls in the market.'
      ],
      playbook: {
        role,
        openingOffer: role === 'seller' ? `₹${baselineMax}` : `₹${Math.round(baselineMin * 0.75)}`,
        targetPrice: `₹${baselineMin} - ₹${Math.round((baselineMin + baselineMax) / 2)}`,
        walkAwayPrice: role === 'seller' ? `₹${baselineMin}` : `₹${baselineMax}`,
        concessionStrategy: 'Hold firm on standard fair corridor values.',
        keyPhrases: [
          role === 'seller' ? '"Sahi lagaya hai bhaiya, ek daam taaza maal hai."' : '"Sahi daam lagao bhaiya, regular customer hoon."'
        ]
      },
      matchedCategory: category,
      identifiedItem: itemName,
      condition,
      localityTier,
      location,
      seasonalFactor,
      disclaimer: 'Estimate based on category pricing patterns, not live market data'
    };
  }
}

/**
 * Generate a one-sentence plain-English seasonal insight using Gemini.
 * Gemini only explains pre-computed numbers — it never invents them.
 */
export async function generateSeasonalInsight(params: {
  itemName: string;
  category: ItemCategory;
  currentPeriod: string;
  currentPrice: number;
  historicalLow: number;
  historicalHigh: number;
  trend: TrendDirection;
}): Promise<string> {
  const genAI = getGeminiClient();
  if (!genAI) throw new Error('Gemini API key not configured');

  const { itemName, category, currentPeriod, currentPrice, historicalLow, historicalHigh, trend } = params;

  const prompt = `Item: "${itemName}" (${category})
Current period: ${currentPeriod}, Current average price: ₹${currentPrice}
Historical low: ₹${historicalLow}, Historical high: ₹${historicalHigh}
Price trend: ${trend}

Output strict JSON: { "insight": "<one sentence, max 30 words, explaining WHY this seasonal pattern happens>" }`;

  return await executeWithModelFallback(genAI, async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: { insight: { type: SchemaType.STRING } },
          required: ['insight'],
        } as any,
        temperature: 0.4,
        maxOutputTokens: 80,
      },
      systemInstruction: SEASONAL_INSIGHT_SYSTEM_PROMPT,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseGeminiJsonResponse<{ insight: string }>(text);
    return parsed.insight;
  }, 3500);
}

export const estimatePrice = generatePriceEstimate;
