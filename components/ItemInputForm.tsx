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
  { label: 'Delhi - Sarojini Nagar / Chandni Chowk (Tier 1)', city: 'Delhi', locality: 'Sarojini Nagar', tier: 'tier1_metro' },
  { label: 'Mumbai - Colaba / Crawford Market (Tier 1)', city: 'Mumbai', locality: 'Crawford Market', tier: 'tier1_metro' },
  { label: 'Bangalore - KR Market / Commercial Street (Tier 1)', city: 'Bangalore', locality: 'KR Market', tier: 'tier1_metro' },
  { label: 'Jaipur - Bapu Bazaar (Tier 2)', city: 'Jaipur', locality: 'Bapu Bazaar', tier: 'tier2_city' },
  { label: 'Lucknow - Aminabad (Tier 2)', city: 'Lucknow', locality: 'Aminabad', tier: 'tier2_city' },
  { label: 'Rural Mandi / Tehsil Market', city: 'Sonipat', locality: 'Rural Mandi', tier: 'rural' },
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
    <form onSubmit={handleSubmit} className="bg-[#151517] rounded-3xl p-6 sm:p-8 border border-[#2A2A2D]">
      <div className="space-y-6">
        
        {/* Step 1: Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-[#E8E8EA] mb-2">
            1. Photo of the Item (Optional but Recommended)
          </label>
          <ImageUploader
            onImageSelected={setPhotoBase64}
            onAnalysisComplete={handleVisionAnalysisComplete}
          />
          {visionData && (
            <div className="mt-3 p-3 bg-[#4ADE80]/10 rounded-xl border border-[#4ADE80]/25 text-xs text-[#4ADE80] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#E8E8EA]">Gemini Vision Detected: </span>
                <span className="text-[#E8E8EA]">{visionData.identifiedItem} (Category: {visionData.category}, Condition: {visionData.condition}).</span>
                <p className="mt-0.5 text-[#4ADE80]/80 italic">{visionData.visualObservations}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Item Name & Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-[#E8E8EA]">
              2. Describe the Item
            </label>
            <span className="text-xs text-[#9A9A9E]">e.g., condition, quantity</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9A9A9E]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={itemText}
              onChange={(e) => setItemText(e.target.value)}
              placeholder="e.g. 1kg Fresh Country Tomatoes, or Type-C 20W Fast Cable, or Plain Crewneck T-Shirt"
              className="w-full pl-10 pr-4 py-3 bg-[#0D0D0F] border border-[#2A2A2D] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C0C0C6] focus:bg-[#1C1C1F] transition-all text-[#E8E8EA] placeholder:text-[#9A9A9E]/60"
            />
          </div>

          {/* Quick Item Samples */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-[#9A9A9E]">
            <span className="font-medium text-[#9A9A9E]">Popular:</span>
            <button
              type="button"
              onClick={() => handleSampleSelect('1 kg Red Country Tomatoes', 'produce')}
              className="px-2.5 py-1 bg-[#2A2A2D] hover:bg-[#C0C0C6] hover:text-[#0A0A0B] text-[#C0C0C6] rounded-lg transition-colors"
            >
              🍅 Tomatoes (1kg)
            </button>
            <button
              type="button"
              onClick={() => handleSampleSelect('Braided Type-C Fast Charging Cable', 'electronics')}
              className="px-2.5 py-1 bg-[#2A2A2D] hover:bg-[#C0C0C6] hover:text-[#0A0A0B] text-[#C0C0C6] rounded-lg transition-colors"
            >
              🔌 Type-C Cable
            </button>
            <button
              type="button"
              onClick={() => handleSampleSelect('Men Cotton Crewneck T-Shirt', 'apparel')}
              className="px-2.5 py-1 bg-[#2A2A2D] hover:bg-[#C0C0C6] hover:text-[#0A0A0B] text-[#C0C0C6] rounded-lg transition-colors"
            >
              👕 Cotton T-Shirt
            </button>
          </div>
        </div>

        {/* Step 3: Category Selector (3 MVP categories) */}
        <div>
          <label className="block text-sm font-semibold text-[#E8E8EA] mb-2">
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
                      ? 'border-[#C0C0C6] bg-[#C0C0C6]/10 text-[#C0C0C6] ring-1 ring-[#C0C0C6]/20'
                      : 'border-[#2A2A2D] bg-[#0D0D0F] hover:bg-[#1C1C1F] text-[#9A9A9E]'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#C0C0C6] text-[#0A0A0B]' : 'bg-[#2A2A2D] text-[#9A9A9E]'}`}>
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
            <label className="text-sm font-semibold text-[#E8E8EA] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C0C0C6]" />
              <span>4. Market Location & Locality Tier</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCustomLocation(!isCustomLocation)}
              className="text-xs font-semibold text-[#C0C0C6] hover:text-[#E8E8EA] hover:underline"
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
              className="w-full px-4 py-3 bg-[#0D0D0F] border border-[#2A2A2D] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C0C0C6] text-[#E8E8EA]"
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
                className="px-3.5 py-2.5 bg-[#0D0D0F] border border-[#2A2A2D] rounded-xl text-xs focus:ring-1 focus:ring-[#C0C0C6] text-[#E8E8EA] placeholder:text-[#9A9A9E]/60"
              />
              <input
                type="text"
                value={customLocality}
                onChange={(e) => setCustomLocality(e.target.value)}
                placeholder="Market (e.g. Haat)"
                className="px-3.5 py-2.5 bg-[#0D0D0F] border border-[#2A2A2D] rounded-xl text-xs focus:ring-1 focus:ring-[#C0C0C6] text-[#E8E8EA] placeholder:text-[#9A9A9E]/60"
              />
              <select
                value={customTier}
                onChange={(e) => setCustomTier(e.target.value as LocalityTier)}
                className="px-3 py-2.5 bg-[#0D0D0F] border border-[#2A2A2D] rounded-xl text-xs focus:ring-1 focus:ring-[#C0C0C6] text-[#E8E8EA]"
              >
                <option value="tier1_metro">Tier-1 Metro (+25% rent)</option>
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
          className="w-full py-4 px-6 bg-[#E8E8EA] hover:bg-[#C0C0C6] disabled:opacity-50 text-[#0A0A0B] font-semibold rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 transform active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing market data & generating playbook...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-[#0A0A0B]/70" />
              <span>Get Fair Price & Negotiation Playbook</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-[#9A9A9E] text-center">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Responses combine Supabase price bands + Gemini 2.5 reasoning</span>
        </div>
      </div>
    </form>
  );
}
