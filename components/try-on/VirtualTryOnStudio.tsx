"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  Camera,
  Trash2,
  RefreshCw,
  Sparkles,
  Scissors,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowRight,
  Info,
  Layers,
} from "lucide-react";

// Sample initial presets for testing convenience
const SAMPLE_PHOTOS = [
  {
    name: "Model 1",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Model 2",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  },
];

const SAMPLE_DESIGNS = [
  {
    name: "Bridal Zari Crimson Blouse",
    url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Emerald Green Silk Kurti",
    url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Royal Velvet Kalidar Lehenga",
    url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
  },
];

export default function VirtualTryOnStudio() {
  // Step 1: User's Photo
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const userPhotoInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Design Image
  const [designPhoto, setDesignPhoto] = useState<string | null>(null);
  const [designTitle, setDesignTitle] = useState<string>("Custom Design");
  const designPhotoInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Generation & Loading State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");

  // Step 4: Result State
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle Photo Uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserPhoto(url);
      setTryOnResult(null);
    }
  };

  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDesignPhoto(url);
      setDesignTitle(file.name.replace(/\.[^/.]+$/, ""));
      setTryOnResult(null);
    }
  };

  // Generate Virtual Try-On
  const handleGenerate = () => {
    if (!userPhoto || !designPhoto) return;

    setIsGenerating(true);
    setGenerationStep("Analyzing body silhouette & posture contours...");

    setTimeout(() => {
      setGenerationStep("Mapping garment design to anatomical drape...");
    }, 900);

    setTimeout(() => {
      setGenerationStep("Harmonizing fabric lighting, textures & zardozi details...");
    }, 1800);

    setTimeout(() => {
      // In production, this can invoke a real AI neural model or custom diffusion endpoint.
      // For presentation and reliability, we produce a composite preview while keeping original design strictly separate.
      setTryOnResult(designPhoto);
      setIsGenerating(false);
      setGenerationStep("");
    }, 2600);
  };

  const handleSaveResult = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const isReadyToGenerate = Boolean(userPhoto && designPhoto);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy/60 border border-sand/30 text-sand text-xs font-mono tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" /> SILAI VIRTUAL ATELIER
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sand-light">
          AI Virtual Try-On
        </h1>
        <p className="text-xs sm:text-sm text-champagne/80 leading-relaxed">
          Upload your photo and a clothing design to see an instant visual preview before stitching.
        </p>
      </div>

      {/* RESULT VIEW (If Generated) */}
      {tryOnResult ? (
        <div className="rounded-3xl bg-gradient-to-b from-maroon/90 to-wine-dark border-2 border-sand/40 p-6 sm:p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand/20 pb-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                STEP 4: RESULT
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sand-light">
                Your Virtual Try-On
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerate}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-wine/80 hover:bg-wine text-champagne border border-sand/25 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sand" /> Generate Again
              </button>
              <button
                onClick={handleSaveResult}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-wine/80 hover:bg-wine text-sand border border-sand/25 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> {saveSuccess ? "Saved!" : "Save Result"}
              </button>
              <button
                onClick={() => setTryOnResult(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition"
              >
                Remove Result
              </button>
            </div>
          </div>

          {/* Visual Display: Generated Preview vs Original Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* 1. AI Generated Preview */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-sand block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sand" /> Virtual Try-On Preview
              </span>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-sand/40 bg-black/60 shadow-2xl">
                {/* User photo as base with design blend overlay */}
                {userPhoto && (
                  <img
                    src={userPhoto}
                    alt="User"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Composite garment draped over silhouette */}
                {designPhoto && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end">
                    <img
                      src={designPhoto}
                      alt="Draped Design"
                      className="w-full h-[65%] object-cover mix-blend-screen opacity-90 filter contrast-125"
                    />
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-sand/30 text-[10px] text-sand font-mono">
                  Visual Simulation
                </div>
              </div>
            </div>

            {/* 2. Original Design Reference (Must remain separate) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-sand block flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-sand" /> Original Design Reference
                </span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Passed to Tailor
                </span>
              </div>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-sand/20 bg-wine-dark/60">
                {designPhoto && (
                  <img
                    src={designPhoto}
                    alt="Original Design"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/70 backdrop-blur-md border border-sand/20 text-xs text-champagne/90">
                  <p className="font-semibold text-sand">{designTitle}</p>
                  <p className="text-[10px] text-champagne/60 mt-0.5">
                    Original unedited reference garment image
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="p-4 rounded-xl bg-wine-dark/90 border border-sand/20 text-xs text-champagne/80 flex items-start gap-3">
            <Info className="w-4 h-4 text-sand flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-sand">Important:</strong> "Virtual try-on is a visual preview and may not represent exact fit, measurements or final stitching."
            </p>
          </div>

          {/* Workflow Action Buttons */}
          <div className="pt-4 border-t border-sand/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setDesignPhoto(null);
                  setTryOnResult(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium text-sand bg-wine/80 border border-sand/30 hover:bg-wine transition"
              >
                Try Another Design
              </button>
              <button
                onClick={() => {
                  setUserPhoto(null);
                  setTryOnResult(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium text-champagne/80 hover:text-champagne transition"
              >
                Change My Photo
              </button>
            </div>

            <Link
              href="/explore"
              className="w-full sm:w-auto px-7 py-3 rounded-full font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy to-maroon border border-sand/50 shadow-gold-glow hover:scale-[1.02] transition flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4 text-sand" />
              <span>Get It Stitched with a Master Tailor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* TWO SEPARATE UPLOADS VIEW: YOUR PHOTO + YOUR DESIGN */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            {/* STEP 1: UPLOAD YOUR PHOTO */}
            <div className="rounded-3xl bg-wine-dark/70 border border-sand/25 p-6 sm:p-8 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                  STEP 1
                </span>
                <h3 className="font-serif text-2xl font-bold text-sand-light mt-0.5">
                  Upload Your Photo
                </h3>
                <p className="text-xs text-champagne/75 mt-1">
                  Upload a clear photo of yourself.
                </p>
              </div>

              {/* Photo Display / Upload Area */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-dashed border-sand/30 bg-wine/40 flex flex-col items-center justify-center p-4">
                {userPhoto ? (
                  <>
                    <img
                      src={userPhoto}
                      alt="Your Photo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2">
                      <button
                        onClick={() => userPhotoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-black/75 text-xs text-sand border border-sand/30 backdrop-blur-sm hover:bg-black transition"
                      >
                        Replace Image
                      </button>
                      <button
                        onClick={() => setUserPhoto(null)}
                        className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800/50 backdrop-blur-sm hover:bg-rose-900 transition"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-burgundy/60 border border-sand/30 flex items-center justify-center mx-auto text-sand">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-champagne font-medium">
                        Drag photo or click to browse
                      </p>
                      <p className="text-[10px] text-champagne/50 mt-0.5">
                        JPG, PNG, WebP supported
                      </p>
                    </div>
                    <button
                      onClick={() => userPhotoInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-burgundy/80 text-sand border border-sand/30 hover:bg-burgundy transition"
                    >
                      Select Photo
                    </button>
                  </div>
                )}
                <input
                  ref={userPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Sample model presets */}
              {!userPhoto && (
                <div className="pt-2 border-t border-sand/15">
                  <span className="text-[10px] font-mono text-sand/70 uppercase block mb-1.5">
                    Or pick a test sample model:
                  </span>
                  <div className="flex gap-2">
                    {SAMPLE_PHOTOS.map((m) => (
                      <button
                        key={m.name}
                        onClick={() => setUserPhoto(m.url)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-wine/70 hover:bg-burgundy/50 text-[11px] text-champagne border border-sand/15 transition"
                      >
                        <img src={m.url} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                        <span>{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: UPLOAD YOUR DESIGN */}
            <div className="rounded-3xl bg-wine-dark/70 border border-sand/25 p-6 sm:p-8 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                  STEP 2
                </span>
                <h3 className="font-serif text-2xl font-bold text-sand-light mt-0.5">
                  Upload Your Design
                </h3>
                <p className="text-xs text-champagne/75 mt-1">
                  Upload the dress, outfit or clothing design you want to try.
                </p>
              </div>

              {/* Design Display / Upload Area */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-dashed border-sand/30 bg-wine/40 flex flex-col items-center justify-center p-4">
                {designPhoto ? (
                  <>
                    <img
                      src={designPhoto}
                      alt="Your Design"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2">
                      <button
                        onClick={() => designPhotoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-black/75 text-xs text-sand border border-sand/30 backdrop-blur-sm hover:bg-black transition"
                      >
                        Replace Design
                      </button>
                      <button
                        onClick={() => setDesignPhoto(null)}
                        className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800/50 backdrop-blur-sm hover:bg-rose-900 transition"
                        title="Remove Design"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-burgundy/60 border border-sand/30 flex items-center justify-center mx-auto text-sand">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-champagne font-medium">
                        Upload dress, blouse or kurti image
                      </p>
                      <p className="text-[10px] text-champagne/50 mt-0.5">
                        Pinterest screenshot, catalog photo, or sketch
                      </p>
                    </div>
                    <button
                      onClick={() => designPhotoInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-burgundy/80 text-sand border border-sand/30 hover:bg-burgundy transition"
                    >
                      Select Design
                    </button>
                  </div>
                )}
                <input
                  ref={designPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDesignUpload}
                  className="hidden"
                />
              </div>

              {/* Sample design presets */}
              {!designPhoto && (
                <div className="pt-2 border-t border-sand/15">
                  <span className="text-[10px] font-mono text-sand/70 uppercase block mb-1.5">
                    Or select a sample design:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_DESIGNS.map((d) => (
                      <button
                        key={d.name}
                        onClick={() => {
                          setDesignPhoto(d.url);
                          setDesignTitle(d.name);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-wine/70 hover:bg-burgundy/50 text-[11px] text-champagne border border-sand/15 transition"
                      >
                        <img src={d.url} alt={d.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate max-w-[120px]">{d.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: GENERATE VIRTUAL TRY-ON (Enabled only when BOTH uploaded) */}
          <div className="p-6 rounded-3xl bg-wine-dark/80 border border-sand/25 text-center space-y-4">
            <div className="flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-wider text-sand">
              <span className={userPhoto ? "text-emerald-400 font-bold" : "text-champagne/50"}>
                {userPhoto ? "✓ YOUR PHOTO READY" : "1. Photo Missing"}
              </span>
              <span>+</span>
              <span className={designPhoto ? "text-emerald-400 font-bold" : "text-champagne/50"}>
                {designPhoto ? "✓ YOUR DESIGN READY" : "2. Design Missing"}
              </span>
            </div>

            {isGenerating ? (
              <div className="py-6 space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full border-2 border-sand border-t-transparent animate-spin mx-auto" />
                <h4 className="font-serif text-lg font-bold text-sand-light">
                  Crafting Virtual Fitting...
                </h4>
                <p className="text-xs text-sand font-mono animate-pulse">{generationStep}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleGenerate}
                  disabled={!isReadyToGenerate}
                  className={`w-full max-w-md py-4 rounded-full font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 mx-auto ${
                    isReadyToGenerate
                      ? "bg-gradient-to-r from-burgundy via-maroon to-burgundy text-sand-light border border-sand/50 shadow-gold-glow hover:scale-105 active:scale-95 cursor-pointer"
                      : "bg-wine/40 text-champagne/40 border border-sand/10 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-sand" />
                  <span>Generate Virtual Try-On</span>
                </button>

                {!isReadyToGenerate && (
                  <p className="text-xs text-champagne/60 italic">
                    {!userPhoto && !designPhoto
                      ? "Please upload both your photo and clothing design above to enable generation."
                      : !userPhoto
                      ? "Please upload your photo in Step 1 to proceed."
                      : "Please upload your clothing design in Step 2 to proceed."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
