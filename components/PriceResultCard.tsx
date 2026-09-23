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
import { EstimateResponse, ItemCategory } from '@/lib/types';
import SeasonalReportCard from './SeasonalReportCard';

interface PriceResultCardProps {
  data: EstimateResponse;
}

export default function PriceResultCard({ data }: PriceResultCardProps) {
  const [isWhyExpanded, setIsWhyExpanded] = useState(true);

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/25">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
            High Confidence
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/25">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            Medium Confidence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/25">
            <HelpCircle className="w-3.5 h-3.5 text-red-500" />
            Low Confidence / Unclear
          </span>
        );
    }
  };

  return (
    <div className="bg-[#151517] rounded-3xl p-6 sm:p-8 border border-[#2A2A2D] overflow-hidden relative">
      {/* Top Banner with Confidence & Item */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#2A2A2D]">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#9A9A9E]">
            Estimated Item
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#E8E8EA] mt-0.5">
            {data.identifiedItem}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#9A9A9E]">
            <span className="capitalize bg-[#2A2A2D] px-2.5 py-0.5 rounded-md font-medium text-[#C0C0C6]">
              Category: {data.matchedCategory}
            </span>
            <span>•</span>
            <span className="capitalize bg-[#2A2A2D] px-2.5 py-0.5 rounded-md font-medium text-[#C0C0C6]">
              Condition: {data.condition}
            </span>
          </div>
        </div>
        <div>{getConfidenceBadge(data.confidence)}</div>
      </div>

      {/* Clarification Alert if Low Confidence */}
      {data.clarificationMessage && (
        <div className="my-5 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/25 text-xs sm:text-sm text-amber-200 flex items-start gap-2.5">
          <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Needs Clarification:</p>
            <p className="mt-0.5">{data.clarificationMessage}</p>
          </div>
        </div>
      )}

      {/* Main Fair Price Range Display */}
      <div className="py-6 sm:py-8 text-center bg-gradient-to-b from-[#C0C0C6]/5 to-transparent rounded-2xl my-4 border border-[#2A2A2D]">
        <p className="text-xs sm:text-sm font-semibold text-[#C0C0C6] tracking-wide uppercase">
          Suggested Fair Street Price
        </p>
        <div className="mt-2 flex items-baseline justify-center gap-2 text-[#E8E8EA]">
          <span className="text-3xl sm:text-5xl font-black tracking-tight text-[#E8E8EA]">
            {data.priceRange.currency}{data.priceRange.min}
          </span>
          <span className="text-xl sm:text-2xl font-medium text-[#9A9A9E]">—</span>
          <span className="text-3xl sm:text-5xl font-black tracking-tight text-[#E8E8EA]">
            {data.priceRange.currency}{data.priceRange.max}
          </span>
          <span className="text-base sm:text-lg font-medium text-[#9A9A9E]">
            / {data.priceRange.unit}
          </span>
        </div>
        <p className="mt-2 text-xs text-[#9A9A9E]">
          Target fair purchase price in <span className="font-semibold text-[#E8E8EA]">{data.location}</span> ({data.localityTier.replace('_', ' ')})
        </p>
      </div>

      {/* Reference Data Breakdown Pills */}
      {data.referenceData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <div className="p-3 bg-[#0D0D0F] rounded-xl border border-[#2A2A2D] text-center">
            <span className="text-[10px] uppercase font-semibold text-[#9A9A9E] block">Baseline Band</span>
            <span className="text-xs font-bold text-[#E8E8EA]">
              ₹{data.referenceData.baselineMin} - ₹{data.referenceData.baselineMax}
            </span>
          </div>
          <div className="p-3 bg-[#0D0D0F] rounded-xl border border-[#2A2A2D] text-center">
            <span className="text-[10px] uppercase font-semibold text-[#9A9A9E] block">Locality Tier</span>
            <span className="text-xs font-bold text-[#E8E8EA] capitalize">
              {data.localityTier.replace('_', ' ')}
            </span>
          </div>
          <div className="p-3 bg-[#0D0D0F] rounded-xl border border-[#2A2A2D] text-center">
            <span className="text-[10px] uppercase font-semibold text-[#9A9A9E] block">Tier Multiplier</span>
            <span className="text-xs font-bold text-[#E8E8EA]">
              {data.referenceData.multiplier}x
            </span>
          </div>
          <div className="p-3 bg-[#0D0D0F] rounded-xl border border-[#2A2A2D] text-center">
            <span className="text-[10px] uppercase font-semibold text-[#9A9A9E] block">Data Source</span>
            <span className="text-xs font-bold text-[#E8E8EA] flex items-center justify-center gap-1">
              <Database className="w-3 h-3 text-[#C0C0C6]" />
              {data.referenceData.source === 'supabase' ? 'Supabase' : 'Seed Band'}
            </span>
          </div>
        </div>
      )}

      {/* Expandable "Why This Price?" section */}
      <div className="border border-[#2A2A2D] rounded-2xl overflow-hidden mb-6">
        <button
          onClick={() => setIsWhyExpanded(!isWhyExpanded)}
          className="w-full px-5 py-3.5 bg-[#0D0D0F] hover:bg-[#1C1C1F] flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C0C0C6]" />
            <span className="text-sm font-semibold text-[#E8E8EA]">
              Why this price? (Pricing Logic & Factors)
            </span>
          </div>
          {isWhyExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#9A9A9E]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#9A9A9E]" />
          )}
        </button>

        {isWhyExpanded && (
          <div className="p-5 bg-[#151517] text-xs sm:text-sm text-[#9A9A9E] leading-relaxed border-t border-[#2A2A2D] space-y-3">
            <p>{data.reasoning}</p>
          </div>
        )}
      </div>

      {/* Seasonal Report accordion */}
      {data.matchedCategory !== 'unknown' && (
        <div className="mb-6">
          <SeasonalReportCard
            category={data.matchedCategory as ItemCategory}
            itemName={data.identifiedItem}
            locality={data.location}
          />
        </div>
      )}

      {/* Explicit Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#0D0D0F] text-[#9A9A9E] text-xs text-center border border-[#2A2A2D] flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#9A9A9E] shrink-0" />
        <span>{data.disclaimer}</span>
      </div>
    </div>
  );
}
