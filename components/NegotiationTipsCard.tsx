import React from 'react';
import { 
  Zap, 
  MessageSquare, 
  DoorClosed, 
  TrendingDown, 
  CheckCircle, 
  ListChecks,
  Compass
} from 'lucide-react';
import { NegotiationPlaybook } from '@/lib/types';

interface NegotiationTipsCardProps {
  tips: string[];
  playbook?: NegotiationPlaybook;
}

export default function NegotiationTipsCard({ tips, playbook }: NegotiationTipsCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Street Negotiation Playbook
            </h3>
            <p className="text-xs text-slate-500">
              Tactical bargaining advice, concession steps, and walk-away points
            </p>
          </div>
        </div>
      </div>

      {/* Playbook Metrics Matrix */}
      {playbook && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Opening Counter</span>
            </div>
            <p className="text-lg font-black text-emerald-950">
              {playbook.openingOffer}
            </p>
            <p className="text-[11px] text-emerald-700 mt-1">
              Start firm here to anchor the vendor’s expectations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-teal-600" />
              <span>Realistic Target</span>
            </div>
            <p className="text-lg font-black text-teal-950">
              {playbook.targetPrice}
            </p>
            <p className="text-[11px] text-teal-700 mt-1">
              Optimal win-win transaction price for local buyers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 uppercase tracking-wider mb-1">
              <DoorClosed className="w-3.5 h-3.5 text-rose-600" />
              <span>Walk-Away Point</span>
            </div>
            <p className="text-lg font-black text-rose-950">
              {playbook.walkAwayPrice}
            </p>
            <p className="text-[11px] text-rose-700 mt-1">
              If vendor refuses to go below this, politely thank them and move on.
            </p>
          </div>
        </div>
      )}

      {/* Concession Strategy */}
      {playbook?.concessionStrategy && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
          <span className="font-bold text-slate-900 block mb-1">Concession Strategy:</span>
          <p>{playbook.concessionStrategy}</p>
        </div>
      )}

      {/* Negotiation Tips Checklist */}
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <ListChecks className="w-4 h-4 text-emerald-600" />
          <span>Actionable Street Tips</span>
        </h4>
        <div className="space-y-2.5">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/70 transition-colors border border-slate-100 text-xs sm:text-sm text-slate-800"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Spoken Phrases */}
      {playbook?.keyPhrases && playbook.keyPhrases.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>Power Phrases to Use in Hindi / Local Dialect</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {playbook.keyPhrases.map((phrase, idx) => (
              <div
                key={idx}
                className="p-3 bg-teal-50/40 rounded-xl border border-teal-100 text-xs text-teal-950 flex items-start gap-2"
              >
                <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  {idx + 1}
                </span>
                <span className="italic">{phrase}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
