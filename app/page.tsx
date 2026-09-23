'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import ItemInputForm from '@/components/ItemInputForm';
import PriceResultCard from '@/components/PriceResultCard';
import NegotiationTipsCard from '@/components/NegotiationTipsCard';
import { EstimateResponse, ItemCategory, LocalityTier } from '@/lib/types';
import { 
  Sparkles, 
  Store, 
  TrendingUp, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function Home() {
  const [estimateData, setEstimateData] = useState<EstimateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async (formData: {
    itemText: string;
    itemPhoto: string | null;
    role: import('@/lib/types').UserRole;
    location: {
      city: string;
      locality: string;
      tier: LocalityTier;
    };
    categoryHint?: ItemCategory;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
    <div className="flex-1 flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-4">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Local Street & Bazaar Price Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Never Overpay in <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">Local Markets</span> Again
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Snap a picture or describe an item, pick your locality, and BargainAI will reveal the realistic price band, explain why it costs that much, and give you street-smart bargaining tips.
          </p>
        </div>

        {/* Main Grid: Form + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-6 space-y-6">
            <ItemInputForm onSubmit={handleEstimate} isLoading={isLoading} />

            {/* Scope Badge & Supported items reminder */}
            <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block mb-1">
                Demo MVP Scope (3 Categories):
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li><strong className="text-slate-700">Fresh Produce:</strong> Tomatoes, Onions, Potatoes, Bananas, Apples, etc.</li>
                <li><strong className="text-slate-700">Electronics Accessories:</strong> Fast USB cables, 3.5mm earphones, adapters, tempered glass.</li>
                <li><strong className="text-slate-700">Apparel:</strong> Plain cotton t-shirts, kurtis, denim jeans, belts, socks.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Price Result & Negotiation Playbook */}
          <div className="lg:col-span-6 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs sm:text-sm text-rose-900 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Error:</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {estimateData ? (
              <div className="space-y-6 animate-fadeIn">
                <PriceResultCard data={estimateData} />
                <NegotiationTipsCard 
                  tips={estimateData.negotiationTips} 
                  playbook={estimateData.playbook} 
                />
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-300 flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-200">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Ready for your first negotiation
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
                  Photograph an item from the street market or type its name on the left to see the fair price breakdown and bargaining script.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Supabase Price Bands
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Gemini 2.5 Structured Output
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4">
          <p>BargainAI — GenAI Local Market Price Negotiation Assistant</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Powered by Google Gemini & Supabase Postgres • Designed for Local Buyers & Street Vendors
          </p>
        </div>
      </footer>
    </div>
  );
}
