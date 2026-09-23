'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Camera,
  MapPin,
  MessageCircle,
  TrendingUp,
  Share2,
  WifiOff,
  Languages,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Camera,
    title: 'Photograph, don\'t type',
    description:
      'Point your camera at any item — Gemini Vision identifies the product, category, and condition in seconds.',
  },
  {
    icon: MapPin,
    title: 'Locality-aware pricing',
    description:
      'Street prices vary wildly between Tier 1 metros, Tier 2 cities, and rural mandis. BargainAI applies the right multiplier.',
  },
  {
    icon: MessageCircle,
    title: 'A negotiation script',
    description:
      'Get an opening offer, target price, walk-away limit, concession rules, and colloquial bargaining phrases — ready to use.',
  },
  {
    icon: TrendingUp,
    title: 'Price trend badge',
    description:
      'See if prices are rising or falling. A small directional badge signals whether now is a good time to buy or wait.',
  },
  {
    icon: Share2,
    title: 'Share the deal',
    description:
      'One-tap share of the fair price and negotiation script via WhatsApp — useful for sending to a friend before you go shopping.',
  },
  {
    icon: WifiOff,
    title: 'Works offline',
    description:
      'Core price estimation keeps working without a live connection, using the built-in seeded baseline dataset as a fallback.',
  },
  {
    icon: Languages,
    title: 'Speak your language',
    description:
      'Negotiation phrases generated in the regional vernacular for your selected locality, with English translations alongside.',
  },
];

export default function LandingFeatures() {
  const reduce = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28"
    >
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
        className="text-center mb-12"
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9A9A9E] mb-3">
          Everything you need at the stall
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E8E8EA] tracking-tight">
          Built for the bazaar
        </h2>
      </motion.div>

      {/* Feature grid — 3 cols on md+, single col on mobile, horizontal scroll on sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {features.map(({ icon: Icon, title, description }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: reduce ? 0 : 0.5,
              ease: EASE,
              delay: reduce ? 0 : i * 0.1,
            }}
            whileHover={reduce ? {} : { y: -2, borderColor: '#C0C0C6' }}
            className="group bg-[#151517] border border-[#2A2A2D] rounded-2xl p-5 cursor-default transition-shadow duration-200 hover:shadow-lg hover:shadow-black/40"
          >
            {/* Icon badge */}
            <motion.div
              className="w-10 h-10 rounded-full bg-[#1C1C1F] border border-[#2A2A2D] flex items-center justify-center mb-4"
              whileHover={reduce ? {} : { y: [0, -3, 0] }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <Icon className="w-4.5 h-4.5 text-[#C0C0C6]" strokeWidth={1.5} style={{ width: 18, height: 18 }} />
            </motion.div>

            <h3 className="text-sm font-bold text-[#E8E8EA] mb-1.5 leading-snug">{title}</h3>
            <p className="text-xs text-[#9A9A9E] leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
