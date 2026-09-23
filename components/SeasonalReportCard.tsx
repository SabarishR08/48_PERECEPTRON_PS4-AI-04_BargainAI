'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Star,
  Quote,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SeasonalReport, ItemCategory, LocalityTier, QualityGrade } from '@/lib/types';

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Inline SVG bar chart ──────────────────────────────────────────────────────
function PriceBarChart({ history, currentPeriod, reduce }: {
  history: SeasonalReport['history'];
  currentPeriod: string;
  reduce: boolean;
}) {
  const maxPrice = Math.max(...history.map(h => h.avgPrice));
  const minPrice = Math.min(...history.map(h => h.avgPrice));
  const range = maxPrice - minPrice || 1;
  const chartH = 64; // px, bar area height

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-[3px] min-w-[280px]" style={{ height: chartH + 28 }}>
        {history.map((point, i) => {
          const pct = (point.avgPrice - minPrice) / range; // 0..1
          const barH = Math.max(6, Math.round(pct * chartH));
          const isCurrent = point.period === currentPeriod;

          return (
            <div key={point.period} className="flex flex-col items-center flex-1 min-w-0 group relative">
              {/* Permanent Price Label */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div className={`text-[8px] font-semibold whitespace-nowrap ${
                  isCurrent ? 'text-[#C0C0C6]' : 'text-[#7A7A7E]'
                }`}>
                  ₹{point.avgPrice}
                </div>
              </div>

              {/* Bar */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: barH, opacity: 1 }}
                transition={reduce
                  ? { duration: 0 }
                  : { duration: 0.45, ease: EASE, delay: i * 0.03 }
                }
                className={`w-full rounded-t-sm ${
                  isCurrent
                    ? 'bg-[#C0C0C6]'
                    : 'bg-[#2A2A2D] group-hover:bg-[#3A3A3E]'
                } transition-colors duration-150`}
                style={{ minHeight: 6 }}
              />

              {/* Label */}
              <span
                className={`mt-1 text-[8px] font-medium truncate w-full text-center leading-none ${
                  isCurrent ? 'text-[#C0C0C6]' : 'text-[#9A9A9E]'
                }`}
              >
                {point.period.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Y-axis reference labels */}
      <div className="flex justify-between mt-1 text-[9px] text-[#5A5A5E]">
        <span>₹{minPrice} low</span>
        <span>₹{maxPrice} high</span>
      </div>
    </div>
  );
}

// ── Trend badge ───────────────────────────────────────────────────────────────
function TrendBadge({ trend, reduce }: { trend: SeasonalReport['trend']; reduce: boolean }) {
  const config = {
    rising:  { icon: TrendingUp,   label: 'Rising',  cls: 'bg-red-950/40 border-red-800/40 text-red-400' },
    falling: { icon: TrendingDown, label: 'Falling', cls: 'bg-[#4ADE80]/10 border-[#4ADE80]/25 text-[#4ADE80]' },
    stable:  { icon: Minus,        label: 'Stable',  cls: 'bg-[#1C1C1F] border-[#2A2A2D] text-[#9A9A9E]' },
  }[trend];
  const Icon = config.icon;

  return (
    <motion.span
      initial={{ scale: reduce ? 1 : 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${config.cls}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {config.label}
    </motion.span>
  );
}

// ── Quality grade row ─────────────────────────────────────────────────────────
const GRADE_LABELS: Record<QualityGrade, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

// ── Main component ────────────────────────────────────────────────────────────
interface SeasonalReportCardProps {
  category: ItemCategory;
  itemName: string;
  locality: string;
}

export default function SeasonalReportCard({ category, itemName, locality }: SeasonalReportCardProps) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<SeasonalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const fetchReport = async (year: number = selectedYear) => {
    setLoading(true);
    setFetchError(null);
    setNoData(false);
    try {
      const params = new URLSearchParams({ category, item_name: itemName, locality, year: year.toString() });
      const res = await fetch(`/api/seasonal-report?${params}`);
      if (res.status === 404) { setNoData(true); return; }
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data: SeasonalReport = await res.json();
      setReport(data);
    } catch (e: any) {
      setFetchError(e?.message ?? 'Failed to load seasonal report');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!open && !report) fetchReport(selectedYear);
    setOpen(v => !v);
  };

  return (
    <div className="border border-[#2A2A2D] rounded-2xl overflow-hidden">
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-[#151517] hover:bg-[#1C1C1F] transition-colors duration-150 text-left"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#C0C0C6]" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-[#E8E8EA]">View seasonal report</span>
          {report && (
            <span className="text-[10px] text-[#9A9A9E] font-normal">
              · {report.dataSource === 'supabase' ? 'Supabase' : 'Seeded baseline'}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#9A9A9E]" strokeWidth={1.5} />
          : <ChevronDown className="w-4 h-4 text-[#9A9A9E]" strokeWidth={1.5} />
        }
      </button>

      {/* Expanded panel */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
          className="bg-[#0D0D0F] border-t border-[#2A2A2D] p-5 space-y-5"
        >
          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-[#9A9A9E] py-4 justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-[#2A2A2D] border-t-[#C0C0C6] rounded-full"
              />
              Loading seasonal data…
            </div>
          )}

          {/* No data */}
          {noData && !loading && (
            <p className="text-sm text-[#9A9A9E] text-center py-4">
              Not enough historical data for this item yet.
            </p>
          )}

          {/* Error */}
          {fetchError && !loading && (
            <p className="text-sm text-red-400 text-center py-4">{fetchError}</p>
          )}

          {/* Report */}
          {report && !loading && (
            <>
              {/* 1. Header row: item name + trend */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs text-[#9A9A9E]">
                      {report.currentSeasonPrice.period} · {report.localityTier.replace('_', ' ')}
                    </p>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        const yr = parseInt(e.target.value);
                        setSelectedYear(yr);
                        fetchReport(yr);
                      }}
                      className="bg-[#1C1C1F] border border-[#2A2A2D] text-[#E8E8EA] text-[10px] rounded px-1.5 py-0.5 focus:outline-none"
                    >
                      {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    {selectedYear > 2026 && (
                      <span className="bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Forecast
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#E8E8EA] leading-snug">{report.itemName}</p>
                </div>
                <TrendBadge trend={report.trend} reduce={!!reduce} />
              </div>

              {/* 2. Bar chart */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9A9E] mb-3">
                  12-month price history
                </p>
                <PriceBarChart
                  history={report.history}
                  currentPeriod={report.currentSeasonPrice.period}
                  reduce={!!reduce}
                />
              </div>

              {/* 3. Best time to buy */}
              <div className="flex items-center gap-3 bg-[#4ADE80]/10 border border-[#4ADE80]/25 rounded-xl px-4 py-3">
                <Star className="w-4 h-4 text-[#4ADE80] shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4ADE80]">Best time to buy</p>
                  <p className="text-sm font-bold text-[#E8E8EA]">
                    {report.bestTimeToBuy.period} — avg ₹{report.bestTimeToBuy.avgPrice}
                  </p>
                </div>
              </div>

              {/* 4. Quality breakdown */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9A9E] mb-2">
                  Price by condition grade
                </p>
                <div className="space-y-1.5">
                  {report.qualityBreakdown.map((qb, i) => (
                    <motion.div
                      key={qb.grade}
                      initial={{ opacity: 0, x: reduce ? 0 : -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: reduce ? 0 : 0.3, ease: EASE, delay: reduce ? 0 : i * 0.06 }}
                      className="flex items-center justify-between bg-[#151517] border border-[#2A2A2D] rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#E8E8EA] w-16">
                          {GRADE_LABELS[qb.grade]}
                        </span>
                        <span className="text-[10px] text-[#9A9A9E]">{qb.multiplier}x baseline</span>
                      </div>
                      <span className="text-sm font-bold text-[#C0C0C6]">₹{qb.estimatedPrice}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 5. Gemini insight */}
              <div className="bg-[#151517] border border-[#2A2A2D] rounded-xl px-4 py-3 flex items-start gap-2.5">
                <Quote className="w-4 h-4 text-[#C0C0C6] shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-xs text-[#9A9A9E] leading-relaxed italic">{report.insight}</p>
              </div>

              {/* Data source footnote */}
              <div className="flex items-center gap-1.5 text-[10px] text-[#3A3A3E]">
                <Database className="w-3 h-3" strokeWidth={1.5} />
                Data source: {report.dataSource === 'supabase' ? 'Supabase seasonal_price_history' : 'Seeded baseline dataset'}
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
