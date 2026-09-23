import React from 'react';
import Image from 'next/image';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Image
              src="/icon.png"
              alt="BargainAI logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
                BargainAI
              </span>
              <span className="text-xs px-2 py-0.5 font-semibold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Gemini 2.5
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              GenAI Local Market Price Negotiation Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Street Mandi & Bazaar Smart</span>
          </div>
        </div>
      </div>
    </header>
  );
}
