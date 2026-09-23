'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  Sparkles, 
  Loader2, 
  Info,
  Apple,
  Cpu,
  Shirt
} from 'lucide-react';
import { ItemCategory, LocalityTier, VisionIdentificationResult } from '@/lib/types';
import ImageUploader from './ImageUploader';

interface ItemInputFormProps {
  onSubmit: (data: {
    itemText: string;
    itemPhoto: string | null;
    location: {
      city: string;
      locality: string;
      tier: LocalityTier;
    };
    categoryHint?: ItemCategory;
  }) => void;
  isLoading: boolean;
}

const CATEGORIES: { id: ItemCategory; label: string; icon: any }[] = [
  { id: 'produce', label: 'Produce (Fruits & Veggies)', icon: Apple },
  { id: 'electronics', label: 'Electronics Accessories', icon: Cpu },
  { id: 'apparel', label: 'Apparel & Clothing', icon: Shirt }
];

const PRESET_LOCATIONS: { label: string; city: string; locality: string; tier: LocalityTier }[] = [
  // Tier 1 — Metro mandis
  { label: 'Delhi - Sarojini Nagar / Chandni Chowk (Tier 1)', city: 'Delhi', locality: 'Sarojini Nagar', tier: 'tier1_metro' },
  { label: 'Delhi - Azadpur Mandi (Largest Produce Mandi) (Tier 1)', city: 'Delhi', locality: 'Azadpur Mandi', tier: 'tier1_metro' },
  { label: 'Mumbai - Crawford Market / Colaba (Tier 1)', city: 'Mumbai', locality: 'Crawford Market', tier: 'tier1_metro' },
  { label: 'Mumbai - Dadar Market (Tier 1)', city: 'Mumbai', locality: 'Dadar', tier: 'tier1_metro' },
  { label: 'Bangalore - KR Market / Commercial Street (Tier 1)', city: 'Bangalore', locality: 'KR Market', tier: 'tier1_metro' },
  { label: 'Chennai - Koyambedu Wholesale Market (Tier 1)', city: 'Chennai', locality: 'Koyambedu', tier: 'tier1_metro' },
  { label: 'Kolkata - New Market / Gariahat (Tier 1)', city: 'Kolkata', locality: 'Gariahat', tier: 'tier1_metro' },
  { label: 'Hyderabad - Begum Bazaar (Tier 1)', city: 'Hyderabad', locality: 'Begum Bazaar', tier: 'tier1_metro' },
  { label: 'Pune - Mandai / Laxmi Road (Tier 1)', city: 'Pune', locality: 'Mandai', tier: 'tier1_metro' },
  { label: 'Ahmedabad - Manek Chowk (Tier 1)', city: 'Ahmedabad', locality: 'Manek Chowk', tier: 'tier1_metro' },

  // Tier 2 — City bazaars
  { label: 'Jaipur - Bapu Bazaar (Tier 2)', city: 'Jaipur', locality: 'Bapu Bazaar', tier: 'tier2_city' },
  { label: 'Lucknow - Aminabad (Tier 2)', city: 'Lucknow', locality: 'Aminabad', tier: 'tier2_city' },
  { label: 'Indore - Sarafa Bazaar (Tier 2)', city: 'Indore', locality: 'Sarafa Bazaar', tier: 'tier2_city' },
  { label: 'Coimbatore - Town Hall Market (Tier 2)', city: 'Coimbatore', locality: 'Town Hall', tier: 'tier2_city' },
  { label: 'Patna - Hathwa Market (Tier 2)', city: 'Patna', locality: 'Hathwa Market', tier: 'tier2_city' },
  { label: 'Bhopal - Chowk Bazaar (Tier 2)', city: 'Bhopal', locality: 'Chowk', tier: 'tier2_city' },
  { label: 'Kochi - Broadway Market (Tier 2)', city: 'Kochi', locality: 'Broadway', tier: 'tier2_city' },
  { label: 'Varanasi - Godowlia Market (Tier 2)', city: 'Varanasi', locality: 'Godowlia', tier: 'tier2_city' },

  // Rural — Mandis & weekly haats
  { label: 'Haryana - Sonipat Rural Mandi', city: 'Sonipat', locality: 'Rural Mandi', tier: 'rural' },
  { label: 'UP - Weekly Village Haat (Dehat)', city: 'Barabanki', locality: 'Village Haat', tier: 'rural' },
  { label: 'Maharashtra - Taluka Market (Rural)', city: 'Nashik Rural', locality: 'Taluk Market', tier: 'rural' },
  { label: 'MP - Gram Haat (Rural)', city: 'Vidisha', locality: 'Gram Haat', tier: 'rural' },
];

export default function ItemInputForm({ onSubmit, isLoading }: ItemInputFormProps) {
  const [itemText, setItemText] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>('');
  const [selectedLocation, setSelectedLocation] = useState(PRESET_LOCATIONS[0]);
  const [customCity, setCustomCity] = useState('');
  const [customLocality, setCustomLocality] = useState('');
  const [customTier, setCustomTier] = useState<LocalityTier>('tier2_city');
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [visionData, setVisionData] = useState<VisionIdentificationResult | null>(null);

  const handleVisionAnalysisComplete = (result: VisionIdentificationResult) => {
    setVisionData(result);
    if (result.identifiedItem && !itemText) {
      setItemText(result.identifiedItem);
    }
    if (result.category !== 'unknown') {
      setSelectedCategory(result.category as ItemCategory);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemText && !photoBase64) {
      alert('Please enter an item name or take a photo.');
      return;
    }

    const locationData = isCustomLocation
      ? {
          city: customCity || 'Local Market',
          locality: customLocality,
          tier: customTier
        }
      : {
          city: selectedLocation.city,
          locality: selectedLocation.locality,
          tier: selectedLocation.tier
        };

    onSubmit({
      itemText,
      itemPhoto: photoBase64,
      location: locationData,
      categoryHint: selectedCategory ? (selectedCategory as ItemCategory) : undefined
    });
  };

  const handleSampleSelect = (sampleName: string, cat: ItemCategory) => {
    setItemText(sampleName);
    setSelectedCategory(cat);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
      <div className="space-y-6">
        
        {/* Step 1: Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            1. Photo of the Item (Optional but Recommended)
          </label>
          <ImageUploader
            onImageSelected={setPhotoBase64}
            onAnalysisComplete={handleVisionAnalysisComplete}
          />
          {visionData && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Gemini Vision Detected: </span>
                {visionData.identifiedItem} (Category: {visionData.category}, Condition: {visionData.condition}).
                <p className="mt-0.5 text-emerald-700 italic">{visionData.visualObservations}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Item Name & Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-800">
              2. Describe the Item
            </label>
            <span className="text-xs text-slate-400">e.g., condition, quantity</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={itemText}
              onChange={(e) => setItemText(e.target.value)}
              placeholder="e.g. 1kg Fresh Country Tomatoes, or Type-C 20W Fast Cable, or Plain Crewneck T-Shirt"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
            />
          </div>

          {/* Quick Item Samples */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-400">Popular:</span>
            <button
              type="button"
              onClick={() => handleSampleSelect('1 kg Red Country Tomatoes', 'produce')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg transition-colors"
            >
              🍅 Tomatoes (1kg)
            </button>
            <button
              type="button"
              onClick={() => handleSampleSelect('Braided Type-C Fast Charging Cable', 'electronics')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg transition-colors"
            >
              🔌 Type-C Cable
            </button>
            <button
              type="button"
              onClick={() => handleSampleSelect('Men Cotton Crewneck T-Shirt', 'apparel')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg transition-colors"
            >
              👕 Cotton T-Shirt
            </button>
          </div>
        </div>

        {/* Step 3: Category Selector (3 MVP categories) */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            3. Market Category (Scope limited to 3)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Location & Market Setting */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>4. Market Location & Locality Tier</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCustomLocation(!isCustomLocation)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              {isCustomLocation ? 'Use Preset Mandis' : 'Enter Custom Locality'}
            </button>
          </div>

          {!isCustomLocation ? (
            <select
              value={selectedLocation.label}
              onChange={(e) => {
                const found = PRESET_LOCATIONS.find((loc) => loc.label === e.target.value);
                if (found) setSelectedLocation(found);
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.label} value={loc.label}>
                  {loc.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="City (e.g. Pune, Patna)"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
              <input
                type="text"
                value={customLocality}
                onChange={(e) => setCustomLocality(e.target.value)}
                placeholder="Market / Locality (e.g. Weekly Haat)"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
              <select
                value={customTier}
                onChange={(e) => setCustomTier(e.target.value as LocalityTier)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900"
              >
                <option value="tier1_metro">Tier-1 Metro (+25% rent/transport)</option>
                <option value="tier2_city">Tier-2 City (Base 1.0x)</option>
                <option value="rural">Rural / Village Mandi (0.8x)</option>
              </select>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!itemText && !photoBase64)}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2.5 transition-all duration-200 transform active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing market data & generating playbook...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-emerald-200" />
              <span>Get Fair Price & Negotiation Playbook</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 text-center">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Responses combine Supabase price bands + Gemini 2.5 reasoning</span>
        </div>
      </div>
    </form>
  );
}
