'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  TrendingDown, 
  DollarSign, 
  DoorClosed, 
  MessageSquare,
  ListChecks,
  Volume2,
  VolumeX
} from 'lucide-react';
import { NegotiationPlaybook } from '@/lib/types';

interface NegotiationTipsCardProps {
  tips: string[];
  playbook?: NegotiationPlaybook;
}

export default function NegotiationTipsCard({ tips, playbook }: NegotiationTipsCardProps) {
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const isSeller = playbook?.role === 'seller';

  const handleSpeak = (phrase: string, idx: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean up phrase: remove leading/trailing quotes, extract Hindi or first part if helpful
    const cleanText = phrase.replace(/^["']|["']$/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Prefer Hindi voice if available, else standard
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
    const indianEnglish = voices.find(v => v.lang === 'en-IN');
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    } else if (indianEnglish) {
      utterance.voice = indianEnglish;
    }

    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-[#151517] rounded-3xl p-6 sm:p-8 border border-[#2A2A2D] space-y-6">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#2A2A2D] pb-5">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            isSeller 
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' 
              : 'bg-[#C0C0C6]/10 border-[#C0C0C6]/25 text-[#C0C0C6]'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#E8E8EA]">
              {isSeller ? 'Seller Margin Defense & Counter-Strategy' : 'Street-Smart Negotiation Playbook'}
            </h3>
            <p className="text-xs text-[#9A9A9E]">
              {isSeller 
                ? 'Vendor tactics to protect profit margins while closing trades smoothly' 
                : 'Tactical sequence tailored for local Indian street markets'}
            </p>
          </div>
        </div>
      </div>

      {/* Playbook Pillars (3 Targets) */}
      {playbook && (
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wider text-[#9A9A9E] mb-3">
            {isSeller ? '3-Step Margin Defense Plan' : '3-Step Game Plan'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2D]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C0C0C6] uppercase tracking-wider mb-1">
                <DollarSign className="w-3.5 h-3.5 text-[#C0C0C6]" />
                <span>{isSeller ? 'Initial Asking Quote' : 'First Counter Offer'}</span>
              </div>
              <p className="text-lg font-black text-[#E8E8EA]">
                {playbook.openingOffer}
              </p>
              <p className="text-[11px] text-[#9A9A9E] mt-1">
                {isSeller
                  ? 'Quote this to establish premium value before factoring any volume discounts.'
                  : 'Start firm here to anchor the vendor’s expectations.'}
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
                {isSeller
                  ? 'Healthy transaction target maintaining solid operating margins.'
                  : 'Optimal win-win transaction price for local buyers.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2D]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                <DoorClosed className="w-3.5 h-3.5 text-red-400" />
                <span>{isSeller ? 'Margin Floor' : 'Walk-Away Ceiling'}</span>
              </div>
              <p className="text-lg font-black text-[#E8E8EA]">
                {playbook.walkAwayPrice}
              </p>
              <p className="text-[11px] text-[#9A9A9E] mt-1">
                {isSeller
                  ? 'Never sell below this line; it risks incurring wholesale cost loss.'
                  : 'If vendor refuses to go below this, politely thank them and move on.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Concession Strategy */}
      {playbook?.concessionStrategy && (
        <div className="p-4 rounded-2xl bg-[#0D0D0F] border border-[#2A2A2D] text-xs sm:text-sm text-[#9A9A9E]">
          <span className="font-bold text-[#E8E8EA] block mb-1">
            {isSeller ? 'Margin Defense & Concession Strategy:' : 'Concession Strategy:'}
          </span>
          <p>{playbook.concessionStrategy}</p>
        </div>
      )}

      {/* Negotiation Tips Checklist */}
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-[#9A9A9E] mb-3 flex items-center gap-1.5">
          <ListChecks className="w-4 h-4 text-[#C0C0C6]" />
          <span>{isSeller ? 'Actionable Vendor Margin Tactics' : 'Actionable Street Tips'}</span>
        </h4>
        <div className="space-y-2.5">
          {tips.map((tip, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-3 p-3 rounded-xl bg-[#0D0D0F] border border-[#2A2A2D] text-xs sm:text-sm text-[#E8E8EA]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Spoken Phrases with Voice-First TTS */}
      {playbook?.keyPhrases && playbook.keyPhrases.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#9A9A9E] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#C0C0C6]" />
              <span>{isSeller ? 'Vendor Defense Phrases (Hindi / English)' : 'Power Phrases to Use in Hindi / Local Dialect'}</span>
            </h4>
            <span className="text-[11px] text-[#C0C0C6] bg-[#2A2A2D] px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-[#C0C0C6]" /> Tap speaker to listen
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {playbook.keyPhrases.map((phrase, idx) => {
              const isPlaying = speakingIdx === idx;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2.5 transition-all ${
                    isPlaying 
                      ? 'bg-[#1C1C1F] border-[#C0C0C6] ring-1 ring-[#C0C0C6]/30 text-[#E8E8EA]' 
                      : 'bg-[#0D0D0F] border-[#2A2A2D] text-[#E8E8EA] hover:bg-[#151517]'
                  }`}
                >
                  <div className="flex items-start gap-2 flex-1">
                    <span className="w-4 h-4 rounded-full bg-[#2A2A2D] text-[#C0C0C6] flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="italic leading-relaxed">{phrase}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeak(phrase, idx)}
                    title={isPlaying ? 'Stop speaking' : 'Listen to phrase'}
                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isPlaying 
                        ? 'bg-[#E8E8EA] text-[#0A0A0B] animate-pulse' 
                        : 'bg-[#2A2A2D] hover:bg-[#3A3A3E] text-[#C0C0C6]'
                    }`}
                  >
                    {isPlaying ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
