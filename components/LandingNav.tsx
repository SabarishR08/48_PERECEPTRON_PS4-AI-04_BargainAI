'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Tag, Sparkles } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LandingNav() {
  const reduce = useReducedMotion();

  const links = ['How it works', 'Markets covered', 'Pricing'];

  return (
    <motion.header
      initial={{ opacity: 0, y: reduce ? 0 : -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
      className="border-b border-[#2A2A2D] bg-[#0A0A0B]/90 backdrop-blur-md sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo + Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#151517] border border-[#3A3A3E] flex items-center justify-center">
            <Tag className="w-4 h-4 text-[#D4D4D8] -rotate-12" strokeWidth={1.75} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-[#E8E8EA]">
              BargainAI
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 font-semibold bg-[#1C1C1F] border border-[#2A2A2D] text-[#9A9A9E] rounded-full">
              <Sparkles className="w-3 h-3 text-[#C0C0C6]" strokeWidth={1.5} />
              Gemini 2.5
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <div key={link} className="relative group cursor-pointer">
              <span className="text-sm font-medium text-[#9A9A9E] group-hover:text-[#E8E8EA] transition-colors duration-200">
                {link}
              </span>
              <motion.span
                className="absolute -bottom-0.5 left-0 h-px w-full bg-[#C0C0C6] origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </div>
          ))}
        </nav>

        {/* CTA — solid silver, black text (inverted) */}
        <motion.a
          href="#app"
          whileHover={{ scale: reduce ? 1 : 1.03 }}
          whileTap={{ scale: reduce ? 1 : 0.97 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#D4D4D8] text-[#0A0A0B] hover:bg-[#E8E8EA] transition-colors duration-200 ring-offset-[#0A0A0B] focus-visible:ring-2 focus-visible:ring-[#C0C0C6]"
        >
          Try it free
        </motion.a>
      </div>
    </motion.header>
  );
}
