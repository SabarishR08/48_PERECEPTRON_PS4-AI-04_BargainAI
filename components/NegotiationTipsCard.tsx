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
    <div className="bg-[#151517] rounded-3xl p-6 sm:p-8 border border-[#2A2A2D] space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2D]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2A2A2D] flex items-center justify-center text-[#E8E8EA]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#E8E8EA]">
              Street Negotiation Playbook
            </h3>
            <p className="text-xs text-[#9A9A9E]">
              Tactical bargaining advice, concession steps, and walk-away points
            </p>
          </div>
        </div>
      </div>

      {/* Playbook Metrics Matrix */}
      {playbook && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2D]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C0C0C6] uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5 text-[#C0C0C6]" />
              <span>Opening Counter</span>
            </div>
            <p className="text-lg font-black text-[#E8E8EA]">
              {playbook.openingOffer}
            </p>
            <p className="text-[11px] text-[#9A9A9E] mt-1">
              Start firm here to anchor the vendor’s expectations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2D]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C0C0C6] uppercase tracking-wider mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-[#C0C0C6]" />
              <span>Realistic Target</span>
            </div>
            <p className="text-lg font-black text-[#E8E8EA]">
              {playbook.targetPrice}
            </p>
            <p className="text-[11px] text-[#9A9A9E] mt-1">
              Optimal win-win transaction price for local buyers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2D]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
              <DoorClosed className="w-3.5 h-3.5 text-red-400" />
              <span>Walk-Away Point</span>
            </div>
            <p className="text-lg font-black text-[#E8E8EA]">
              {playbook.walkAwayPrice}
            </p>
            <p className="text-[11px] text-[#9A9A9E] mt-1">
              If vendor refuses to go below this, politely thank them and move on.
            </p>
          </div>
        </div>
      )}

      {/* Concession Strategy */}
      {playbook?.concessionStrategy && (
        <div className="p-4 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2D] text-xs sm:text-sm text-[#9A9A9E]">
          <span className="font-bold text-[#E8E8EA] block mb-1">Concession Strategy:</span>
          <p>{playbook.concessionStrategy}</p>
        </div>
      )}

      {/* Negotiation Tips Checklist */}
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-[#9A9A9E] mb-3 flex items-center gap-1.5">
          <ListChecks className="w-4 h-4 text-[#C0C0C6]" />
          <span>Actionable Street Tips</span>
        </h4>
        <div className="space-y-2.5">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0D0D0F] hover:bg-[#1C1C1F] transition-colors border border-[#2A2A2D] text-xs sm:text-sm text-[#E8E8EA]"
            >
              <CheckCircle className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Spoken Phrases */}
      {playbook?.keyPhrases && playbook.keyPhrases.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs uppercase font-bold tracking-wider text-[#9A9A9E] mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#C0C0C6]" />
            <span>Power Phrases to Use in Hindi / Local Dialect</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {playbook.keyPhrases.map((phrase, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0D0D0F] rounded-xl border border-[#2A2A2D] text-xs text-[#E8E8EA] flex items-start gap-2"
              >
                <span className="w-4 h-4 rounded-full bg-[#2A2A2D] text-[#C0C0C6] flex items-center justify-center shrink-0 font-bold text-[10px]">
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
