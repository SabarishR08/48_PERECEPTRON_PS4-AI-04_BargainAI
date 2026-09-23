'use client';

import React, { useState } from 'react';
import LandingNav from '@/components/LandingNav';
import LandingHero from '@/components/LandingHero';
import LandingFeatures from '@/components/LandingFeatures';
import ItemInputForm from '@/components/ItemInputForm';
import PriceResultCard from '@/components/PriceResultCard';
import NegotiationTipsCard from '@/components/NegotiationTipsCard';
import { EstimateResponse, ItemCategory, LocalityTier } from '@/lib/types';
import { Sparkles, TrendingUp, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Home() {
  const [estimateData, setEstimateData] = useState<EstimateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async (formData: {
    itemText: string;
    itemPhoto: string | null;
    location: { city: string; locality: string; tier: LocalityTier };
    categoryHint?: ItemCategory;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with status ${response.status}`);
      }
      const result: EstimateResponse = await response.json();
      setEstimateData(result);
    } catch (err: any) {
      console.error('Error fetching estimate:', err);
      setError(err?.message || 'Failed to estimate fair price. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0B]">

      {/* ── Animated landing nav ── */}
      <LandingNav />

      {/* ── Animated hero ── */}
      <LandingHero />

      {/* ── Animated feature strip ── */}
      <LandingFeatures />

      {/* ── Divider ── */}
      <div className="border-t border-[#2A2A2D]" />

      {/* ── Interactive App Section ── */}
      <section id="app" className="bg-[#0D0D0F] scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

          {/* Section header */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151517] border border-[#2A2A2D] text-xs font-semibold text-[#9A9A9E] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#C0C0C6]" strokeWidth={1.5} />
              Powered by Gemini 2.5 Vision
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E8E8EA] tracking-tight">
              Get your price estimate
            </h2>
            <p className="mt-2 text-sm text-[#9A9A9E]">
              Snap a photo or describe the item — select your city and let BargainAI do the rest.
            </p>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: Input form */}
            <div className="lg:col-span-6 space-y-5">
              <ItemInputForm onSubmit={handleEstimate} isLoading={isLoading} />

              {/* Scope reminder */}
              <div className="bg-[#151517] border border-[#2A2A2D] rounded-2xl p-4 text-xs text-[#9A9A9E]">
                <span className="font-semibold text-[#C0C0C6] block mb-1.5">
                  Demo MVP scope — 3 categories:
                </span>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong className="text-[#E8E8EA]">Fresh produce:</strong> Tomatoes, onions, potatoes, bananas, apples…</li>
                  <li><strong className="text-[#E8E8EA]">Electronics accessories:</strong> USB cables, earphones, adapters, tempered glass.</li>
                  <li><strong className="text-[#E8E8EA]">Apparel:</strong> Cotton t-shirts, kurtis, denim jeans, belts, socks.</li>
                </ul>
              </div>
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-950/50 rounded-2xl border border-red-900/50 text-xs sm:text-sm text-red-300 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div>
                    <p className="font-bold text-red-200">Error:</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {estimateData ? (
                <div className="space-y-5 animate-fadeIn">
                  <PriceResultCard data={estimateData} />
                  <NegotiationTipsCard
                    tips={estimateData.negotiationTips}
                    playbook={estimateData.playbook}
                  />
                </div>
              ) : (
                <div className="bg-[#151517] rounded-3xl p-8 sm:p-12 text-center border border-dashed border-[#2A2A2D] flex flex-col items-center justify-center min-h-[420px]">
                  <div className="w-16 h-16 rounded-2xl bg-[#1C1C1F] border border-[#2A2A2D] flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-[#C0C0C6]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-[#E8E8EA] mb-1">
                    Ready for your first negotiation
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9A9A9E] max-w-sm mb-6">
                    Photograph an item from the street market or type its name on the left to see the fair price breakdown and bargaining script.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-[#9A9A9E]">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C0C0C6]" strokeWidth={1.5} />
                      Supabase price bands
                    </span>
                    <span className="hidden sm:inline text-[#2A2A2D]">•</span>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C0C0C6]" strokeWidth={1.5} />
                      Gemini 2.5 structured output
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A2D] bg-[#0A0A0B] py-6 mt-auto text-center text-xs text-[#9A9A9E]">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[#5A5A5E]">BargainAI — GenAI local market price negotiation assistant</p>
          <p className="mt-1 text-[11px] text-[#3A3A3E]">
            Powered by Google Gemini &amp; Supabase Postgres · Designed for local buyers &amp; street vendors
          </p>
        </div>
      </footer>
    </div>
  );
}
