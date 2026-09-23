import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  HelpCircle, 
  Layers, 
  Database,
  Building,
  CheckCircle2
} from 'lucide-react';
import { EstimateResponse } from '@/lib/types';

interface PriceResultCardProps {
  data: EstimateResponse;
}

export default function PriceResultCard({ data }: PriceResultCardProps) {
  const [isWhyExpanded, setIsWhyExpanded] = useState(true);

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            High Confidence
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Medium Confidence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
            Low Confidence / Unclear
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 overflow-hidden relative">
      {/* Top Banner with Confidence & Item */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Estimated Item
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {data.identifiedItem}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span className="capitalize bg-slate-100 px-2.5 py-0.5 rounded-md font-medium text-slate-700">
              Category: {data.matchedCategory}
            </span>
            <span>•</span>
            <span className="capitalize bg-slate-100 px-2.5 py-0.5 rounded-md font-medium text-slate-700">
              Condition: {data.condition}
            </span>
          </div>
        </div>
        <div>{getConfidenceBadge(data.confidence)}</div>
      </div>

      {/* Clarification Alert if Low Confidence */}
      {data.clarificationMessage && (
        <div className="my-5 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Needs Clarification:</p>
            <p className="mt-0.5">{data.clarificationMessage}</p>
          </div>
        </div>
      )}

      {/* Main Fair Price Range Display */}
      <div className="py-6 sm:py-8 text-center bg-gradient-to-b from-emerald-50/50 to-transparent rounded-2xl my-4 border border-emerald-100/60">
        <p className="text-xs sm:text-sm font-semibold text-emerald-800 tracking-wide uppercase">
          Suggested Fair Street Price
        </p>
        <div className="mt-2 flex items-baseline justify-center gap-2 text-slate-900">
          <span className="text-3xl sm:text-5xl font-black tracking-tight text-emerald-600">
            {data.priceRange.currency}{data.priceRange.min}
          </span>
          <span className="text-xl sm:text-2xl font-medium text-slate-400">—</span>
          <span className="text-3xl sm:text-5xl font-black tracking-tight text-emerald-600">
            {data.priceRange.currency}{data.priceRange.max}
          </span>
          <span className="text-base sm:text-lg font-medium text-slate-500">
            / {data.priceRange.unit}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Target fair purchase price in <span className="font-semibold text-slate-700">{data.location}</span> ({data.localityTier.replace('_', ' ')})
        </p>
      </div>

      {/* Reference Data Breakdown Pills */}
      {data.referenceData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Baseline Band</span>
            <span className="text-xs font-bold text-slate-800">
              ₹{data.referenceData.baselineMin} - ₹{data.referenceData.baselineMax}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Locality Tier</span>
            <span className="text-xs font-bold text-slate-800 capitalize">
              {data.localityTier.replace('_', ' ')}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Tier Multiplier</span>
            <span className="text-xs font-bold text-slate-800">
              {data.referenceData.multiplier}x
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Data Source</span>
            <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
              <Database className="w-3 h-3 text-emerald-600" />
              {data.referenceData.source === 'supabase' ? 'Supabase' : 'Seed Band'}
            </span>
          </div>
        </div>
      )}

      {/* Expandable "Why This Price?" section */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
        <button
          onClick={() => setIsWhyExpanded(!isWhyExpanded)}
          className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-800">
              Why this price? (Pricing Logic & Factors)
            </span>
          </div>
          {isWhyExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {isWhyExpanded && (
          <div className="p-5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200 space-y-3">
            <p>{data.reasoning}</p>
          </div>
        )}
      </div>

      {/* Explicit Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-100 text-slate-500 text-xs text-center border border-slate-200 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
        <span>{data.disclaimer}</span>
      </div>
    </div>
  );
}
