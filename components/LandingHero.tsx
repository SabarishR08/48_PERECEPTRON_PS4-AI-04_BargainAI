'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useInView, animate } from 'framer-motion';
import {
  Camera,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Store,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Count-up helper ───────────────────────────────────────────────────────────
function CountUp({
  from,
  to,
  duration = 0.8,
  start,
}: {
  from: number;
  to: number;
  duration?: number;
  start: boolean;
}) {
  const [display, setDisplay] = useState(from);
  useEffect(() => {
    if (!start) return;
    const ctrl = animate(from, to, {
      duration,
      ease: EASE,
      onUpdate(v) { setDisplay(Math.round(v)); },
    });
    return ctrl.stop;
  }, [start, from, to, duration]);
  return <>{display}</>;
}

// ── Preview card (right column) ───────────────────────────────────────────────
function PreviewCard({ started }: { started: boolean }) {
  const [chipVisible, setChipVisible] = useState(false);
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setChipVisible(true), 1050);
    return () => clearTimeout(t);
  }, [started]);

  return (
    <div className="bg-[#151517] border border-[#2A2A2D] rounded-2xl p-5 w-full max-w-sm mx-auto lg:mx-0 shadow-2xl shadow-black/50">
      {/* Item header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-[#1C1C1F] border border-[#2A2A2D] flex items-center justify-center shrink-0">
          <Store className="w-5 h-5 text-[#C0C0C6]" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#E8E8EA] truncate">Denim Jeans</p>
          <p className="text-xs text-[#9A9A9E] truncate">Apparel · Sarojini Nagar, Delhi</p>
        </div>
        <span className="ml-auto shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1C1C1F] border border-[#2A2A2D] text-[#C0C0C6]">
          High
        </span>
      </div>

      {/* Price band */}
      <div className="bg-[#0A0A0B] rounded-xl border border-[#2A2A2D] p-4 mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9A9E] mb-1.5">
          Fair price range
        </p>
        <p className="text-2xl font-extrabold text-[#E8E8EA] tabular-nums">
          ₹<CountUp from={0} to={350} start={started} />
          <span className="text-[#9A9A9E] font-normal text-lg"> – </span>
          ₹<CountUp from={0} to={520} start={started} />
        </p>
        <p className="text-xs text-[#9A9A9E] mt-1">Per piece · Tier 1 metro adjusted</p>
      </div>

      {/* Negotiation chip — fades in after price settles */}
      <div style={{ minHeight: 40 }}>
        {chipVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex items-center gap-2 bg-[#4ADE80]/10 border border-[#4ADE80]/25 rounded-xl px-3 py-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" strokeWidth={1.75} />
            <p className="text-xs font-medium text-[#4ADE80]">
              Open at ₹280 — walk away above ₹560
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export default function LandingHero() {
  const reduce = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.09,
        delayChildren: reduce ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.55, ease: EASE },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: reduce ? 0 : 0.5, ease: EASE, delay: reduce ? 0 : 0.38 },
    },
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const isCardInView = useInView(cardRef, { once: true, amount: 0.4 });

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

        {/* ── Left column ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151517] border border-[#2A2A2D] text-xs font-semibold text-[#9A9A9E]">
              <Store className="w-3.5 h-3.5 text-[#C0C0C6]" strokeWidth={1.5} />
              Built for InnovateX AI-04
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-[#E8E8EA] leading-[1.08]"
          >
            Know the fair price{' '}
            <span className="text-[#C0C0C6]">before you bargain</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            variants={itemVariants}
            className="text-base text-[#9A9A9E] leading-relaxed max-w-lg"
          >
            Photograph an item at any street market or bazaar. BargainAI identifies it,
            pulls a locality-adjusted price band, and hands you a step-by-step negotiation
            script — in under 3 seconds.
          </motion.p>

          {/* CTA row */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
            {/* Primary: silver fill, black text */}
            <motion.a
              href="#app"
              whileHover={{ scale: reduce ? 1 : 1.03 }}
              whileTap={{ scale: reduce ? 1 : 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#D4D4D8] text-[#0A0A0B] text-sm font-semibold hover:bg-[#E8E8EA] transition-colors duration-200"
            >
              <motion.span
                animate={reduce ? {} : { scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Camera className="w-4 h-4" strokeWidth={2} />
              </motion.span>
              Snap an item
            </motion.a>

            {/* Secondary: outline only */}
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: reduce ? 1 : 1.02 }}
              whileTap={{ scale: reduce ? 1 : 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl border border-[#3A3A3E] text-sm font-medium text-[#C0C0C6] hover:border-[#C0C0C6] hover:text-[#E8E8EA] transition-colors duration-200 group"
            >
              See how it works
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={1.75} />
            </motion.a>
          </motion.div>

          {/* Trust row */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 pt-1">
            {[
              { icon: <MapPin className="w-3.5 h-3.5 text-[#C0C0C6]" strokeWidth={1.5} />, label: '500+ localities covered' },
              { icon: <Zap className="w-3.5 h-3.5 text-[#C0C0C6]" strokeWidth={1.5} />, label: '<3s response' },
              { icon: <ShieldCheck className="w-3.5 h-3.5 text-[#9A9A9E]" strokeWidth={1.5} />, label: 'No sign-up needed' },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-[#9A9A9E]">
                {icon}{label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right column — preview card ── */}
        <motion.div
          ref={cardRef}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <PreviewCard started={isCardInView} />
        </motion.div>

      </div>
    </section>
  );
}
