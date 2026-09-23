'use client';

import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Loader2, Sparkles } from 'lucide-react';
import { VisionIdentificationResult } from '@/lib/types';

interface ImageUploaderProps {
  onImageSelected: (base64: string | null) => void;
  onAnalysisComplete?: (result: VisionIdentificationResult) => void;
  isAnalyzing?: boolean;
}

export default function ImageUploader({
  onImageSelected,
  onAnalysisComplete,
  isAnalyzing = false
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onImageSelected(base64);

      // Trigger instant standalone identification if callback provided
      if (onAnalysisComplete) {
        setIsProcessing(true);
        try {
          const res = await fetch('/api/identify-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo: base64, mimeType: file.type })
          });
          const json = await res.json();
          if (json.success && json.data) {
            onAnalysisComplete(json.data);
          }
        } catch (err) {
          console.error('Auto photo identification error:', err);
        } finally {
          setIsProcessing(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all duration-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer text-center group bg-white shadow-xs"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors text-emerald-600">
            <Camera className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-1">
            Photograph or Upload Item
          </p>
          <p className="text-xs text-slate-500 max-w-xs">
            Snap a photo of the item at the stall or upload an image. Gemini Vision will identify condition & quality.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multimodal Vision Auto-Detection</span>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Item capture"
            className="w-full h-48 sm:h-56 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <button
            onClick={handleClear}
            type="button"
            className="absolute top-3 right-3 bg-slate-900/80 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors shadow-md"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>

          {(isProcessing || isAnalyzing) && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-400 mb-2" />
              <p className="text-xs font-medium tracking-wide">
                Analyzing item features with Gemini Vision...
              </p>
            </div>
          )}

          <div className="absolute bottom-2 left-2 bg-slate-900/85 text-slate-200 text-xs px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5">
            <Upload className="w-3 h-3 text-emerald-400" />
            <span>Photo loaded</span>
          </div>
        </div>
      )}
    </div>
  );
}
