import { NextRequest, NextResponse } from 'next/server';
import { querySeasonalHistory } from '@/lib/supabase';
import { generateSeasonalInsight } from '@/lib/gemini';
import { ItemCategory, LocalityTier, QualityGrade, SeasonalReport, QualityBreakdown, TrendDirection } from '@/lib/types';
import { determineLocalityTier } from '@/lib/supabase';

const QUALITY_MULTIPLIERS: Record<QualityGrade, number> = {
  excellent: 1.15,
  good: 1.00,
  fair: 0.85,
  poor: 0.65,
};

function computeTrend(history: { avgPrice: number }[], currentIndex: number): TrendDirection {
  if (history.length < 4) return 'stable';
  const currentPrice = history[currentIndex]?.avgPrice ?? history[history.length - 1].avgPrice;
  const startIdx = Math.max(0, currentIndex - 3);
  const rollingAvg = history.slice(startIdx, currentIndex).reduce((s, p) => s + p.avgPrice, 0) / Math.max(1, currentIndex - startIdx);
  const delta = (currentPrice - rollingAvg) / rollingAvg;
  if (delta > 0.06) return 'rising';
  if (delta < -0.06) return 'falling';
  return 'stable';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as ItemCategory | null;
  const itemName = searchParams.get('item_name');
  const locality = searchParams.get('locality') ?? 'Delhi';
  const yearParam = searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (!category || !itemName) {
    return NextResponse.json({ error: 'category and item_name are required query parameters.' }, { status: 400 });
  }

  if (!['produce', 'electronics', 'apparel'].includes(category)) {
    return NextResponse.json({ error: 'category must be one of: produce, electronics, apparel' }, { status: 400 });
  }

  const { tier } = determineLocalityTier(locality);

  // 1. Fetch seasonal history
  const { history, source } = await querySeasonalHistory(itemName, category, tier, year);

  if (!history || history.length === 0) {
    return NextResponse.json({
      error: 'Not enough historical data for this item yet.',
      itemName,
      category,
    }, { status: 404 });
  }

  // 2. Determine current period (current calendar month)
  const nowMonth = new Date().getMonth(); // 0-indexed
  const currentPoint = history.find(h => h.monthIndex === nowMonth) ?? history[history.length - 1];

  // 3. Compute trend against rolling 3-month average
  const currentIdx = history.findIndex(h => h.monthIndex === nowMonth);
  const trend = computeTrend(history, currentIdx >= 0 ? currentIdx : history.length - 1);

  // 4. Best time to buy = historical low
  const bestTimeToBuy = history.reduce((best, h) => h.avgPrice < best.avgPrice ? h : best, history[0]);

  // 5. Quality breakdown for current period price
  const qualityBreakdown: QualityBreakdown[] = (Object.keys(QUALITY_MULTIPLIERS) as QualityGrade[]).map(grade => ({
    grade,
    multiplier: QUALITY_MULTIPLIERS[grade],
    estimatedPrice: Math.round(currentPoint.avgPrice * QUALITY_MULTIPLIERS[grade]),
  }));

  // 6. Ask Gemini for the one-line insight (best-effort, never blocks response)
  const FALLBACK_INSIGHT = 'Prices vary with the season and item condition — check the chart for this item\'s pattern.';
  let insight = FALLBACK_INSIGHT;
  try {
    insight = await generateSeasonalInsight({
      itemName,
      category,
      currentPeriod: currentPoint.period,
      currentPrice: currentPoint.avgPrice,
      historicalLow: bestTimeToBuy.avgPrice,
      historicalHigh: Math.max(...history.map(h => h.avgPrice)),
      trend,
    });
  } catch (e) {
    console.warn('Gemini seasonal insight failed, using fallback:', e);
  }

  const report: SeasonalReport = {
    itemName,
    category,
    localityTier: tier,
    year,
    history,
    currentSeasonPrice: { period: currentPoint.period, avgPrice: currentPoint.avgPrice },
    qualityBreakdown,
    trend,
    bestTimeToBuy: { period: bestTimeToBuy.period, avgPrice: bestTimeToBuy.avgPrice },
    insight,
    dataSource: source,
  };

  return NextResponse.json(report);
}
