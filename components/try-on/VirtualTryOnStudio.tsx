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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 4: Result State
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle Photo Uploads with Base64 Conversion
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage("Image exceeds 8MB. Please select an optimized photo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserPhoto(event.target?.result as string);
        setTryOnResult(null);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage("Design image exceeds 8MB. Please select an optimized photo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setDesignPhoto(event.target?.result as string);
        setDesignTitle((file?.name || "Garment Design").replace(/\.[^/.]+$/, ""));
        setTryOnResult(null);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Virtual Try-On via Real Gemini AI Backend
  const handleGenerate = async () => {
    if (!userPhoto) {
      setErrorMessage("Please upload your customer photo in Step 1 to proceed.");
      return;
    }
    if (!designPhoto) {
      setErrorMessage("Please upload a garment design reference in Step 2 to proceed.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationStep("Connecting to Gemini AI Haute Couture Atelier...");

    const step1Timer = setTimeout(() => {
      setGenerationStep("Analyzing body silhouette & posture contours...");
    }, 900);

    const step2Timer = setTimeout(() => {
      setGenerationStep("Harmonizing silk fabric drape, embroidery & neckline...");
    }, 2200);

    try {
      const res = await fetch("/api/try-on/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userImage: userPhoto,
          designImage: designPhoto,
          designTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error || "Virtual try-on synthesis could not be completed. Please try again."
        );
        setTryOnResult(null);
      } else {
        setTryOnResult(data.generatedImageUrl);
        setErrorMessage(null);
      }
    } catch (err: any) {
      setErrorMessage(
        "Network error connecting to Gemini AI Virtual Try-On service. Please try again."
      );
      setTryOnResult(null);
    } finally {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleSaveResult = () => {
    if (!tryOnResult) return;
    try {
      const link = document.createElement("a");
      link.href = tryOnResult;
      link.download = `silai-virtual-try-on-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const isReadyToGenerate = Boolean(userPhoto && designPhoto);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy text-champagne border border-sand/30 text-xs font-mono tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-sand" /> SILAI VIRTUAL ATELIER
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-champagne-light dark:text-champagne-light">
          AI Virtual Try-On
        </h1>
        <p className="text-xs sm:text-sm text-sand/80 dark:text-sand/70 leading-relaxed">
          Upload your photo and a clothing design to see an instant visual preview before stitching.
        </p>
      </div>

      {/* Error / Quota Notice */}
      {errorMessage && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-900 font-serif">Virtual Try-On Notice</p>
            <p className="text-rose-700 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* RESULT VIEW (If Generated) */}
      {tryOnResult ? (
        <div className="rounded-3xl bg-[#FAF4E8] dark:bg-[#160B0E] border-2 border-burgundy/30 dark:border-burgundy/50 p-6 sm:p-10 shadow-xl space-y-8 animate-in zoom-in-95 duration-300 text-wine dark:text-champagne">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-burgundy/15 dark:border-burgundy/30 pb-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-burgundy dark:text-sand font-bold uppercase">
                STEP 4: RESULT
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wine dark:text-sand-light">
                Your Virtual Try-On
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerate}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F2E5C6] dark:bg-wine/30 hover:bg-[#F2D9A0] dark:hover:bg-wine/50 text-wine dark:text-champagne border border-burgundy/25 dark:border-sand/30 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-burgundy dark:text-sand" /> Generate Again
              </button>
              <button
                onClick={handleSaveResult}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-burgundy hover:bg-maroon text-sand-light border border-sand/30 flex items-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-sand" /> {saveSuccess ? "Saved!" : "Save Result"}
              </button>
              <button
                onClick={() => setTryOnResult(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 transition"
              >
                Remove Result
              </button>
            </div>
          </div>

          {/* Visual Display: Generated Preview vs Original Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* 1. AI Generated Preview */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-burgundy dark:text-sand font-bold block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-burgundy dark:text-sand" /> Virtual Try-On Preview
              </span>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-burgundy/30 dark:border-sand/30 bg-black/60 shadow-lg">
                {tryOnResult ? (
                  <img
                    src={tryOnResult}
                    alt="Gemini AI Generated Virtual Try-On Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : userPhoto ? (
                  <img
                    src={userPhoto}
                    alt="User"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/85 border border-sand/30 text-[10px] text-sand font-mono">
                  Gemini AI Atelier Simulation
                </div>
              </div>
            </div>

            {/* 2. Original Design Reference (Must remain separate) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-burgundy dark:text-sand font-bold block flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-burgundy dark:text-sand" /> Original Design Reference
                </span>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-mono bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 font-semibold">
                  Passed to Tailor
                </span>
              </div>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-burgundy/20 dark:border-burgundy/40 bg-[#F2E5C6]/60 dark:bg-[#0D080A]/80">
                {designPhoto && (
                  <img
                    src={designPhoto}
                    alt="Original Design"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/85 border border-sand/20 text-xs text-champagne">
                  <p className="font-bold text-sand">{designTitle}</p>
                  <p className="text-[10px] text-champagne/80 mt-0.5">
                    Original unedited reference garment image
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="p-4 rounded-xl bg-[#F2E5C6] dark:bg-wine/25 border border-burgundy/20 dark:border-burgundy/40 text-xs text-maroon dark:text-champagne flex items-start gap-3">
            <Info className="w-4 h-4 text-burgundy dark:text-sand flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-burgundy dark:text-sand">Important:</strong> "Virtual try-on is a visual preview and may not represent exact fit, measurements or final stitching."
            </p>
          </div>

          {/* Workflow Action Buttons */}
          <div className="pt-4 border-t border-burgundy/20 dark:border-burgundy/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setDesignPhoto(null);
                  setTryOnResult(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-wine dark:text-champagne bg-[#F2E5C6] dark:bg-wine/30 border border-burgundy/30 dark:border-sand/30 hover:bg-[#F2D9A0] dark:hover:bg-wine/50 transition"
              >
                Try Another Design
              </button>
              <button
                onClick={() => {
                  setUserPhoto(null);
                  setTryOnResult(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-maroon/90 dark:text-champagne/80 hover:text-wine dark:hover:text-sand transition"
              >
                Change My Photo
              </button>
            </div>

            <Link
              href="/explore"
              className="w-full sm:w-auto px-7 py-3 rounded-full font-bold text-xs text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 shadow-sm hover:scale-[1.02] transition flex items-center justify-center gap-2"
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
            <div className="rounded-3xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between text-wine dark:text-champagne">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-burgundy dark:text-sand font-bold uppercase">
                  STEP 1
                </span>
                <h3 className="font-serif text-2xl font-bold text-wine dark:text-sand-light mt-0.5">
                  Upload Your Photo
                </h3>
                <p className="text-xs text-maroon/90 dark:text-champagne/85 mt-1 font-medium">
                  Upload a clear photo of yourself.
                </p>
                <p className="text-[11px] text-maroon/70 dark:text-champagne/60 mt-0.5 italic">
                  For a better visual preview, use a clear and well-lit photo.
                </p>
              </div>

              {/* Photo Display / Upload Area */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-dashed border-burgundy/30 dark:border-sand/30 bg-[#F2E5C6]/40 dark:bg-[#0D080A]/60 flex flex-col items-center justify-center p-4">
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
                        className="px-3 py-1.5 rounded-lg bg-black/85 text-xs text-sand-light border border-sand/30 hover:bg-black transition font-semibold"
                      >
                        Replace Image
                      </button>
                      <button
                        onClick={() => setUserPhoto(null)}
                        className="p-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800/50 hover:bg-rose-900 transition"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-burgundy border border-sand/30 flex items-center justify-center mx-auto text-champagne">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-wine dark:text-sand-light font-bold">
                        Drag photo or click to browse
                      </p>
                      <p className="text-[10px] text-maroon/70 dark:text-champagne/60 mt-0.5 font-medium">
                        JPG, PNG, WebP supported
                      </p>
                    </div>
                    <button
                      onClick={() => userPhotoInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-burgundy text-sand-light border border-sand/30 hover:bg-maroon transition shadow-sm"
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
                <div className="pt-2 border-t border-burgundy/15 dark:border-burgundy/30">
                  <span className="text-[10px] font-mono text-maroon/90 dark:text-sand uppercase font-bold block mb-1.5">
                    Or pick a test sample model:
                  </span>
                  <div className="flex gap-2">
                    {SAMPLE_PHOTOS.map((m) => (
                      <button
                        key={m.name}
                        onClick={() => setUserPhoto(m.url)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F2E5C6] dark:bg-wine/30 hover:bg-[#F2D9A0] dark:hover:bg-wine/50 text-[11px] text-wine dark:text-champagne border border-burgundy/20 dark:border-sand/20 transition font-medium"
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
            <div className="rounded-3xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between text-wine dark:text-champagne">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-burgundy dark:text-sand font-bold uppercase">
                  STEP 2
                </span>
                <h3 className="font-serif text-2xl font-bold text-wine dark:text-sand-light mt-0.5">
                  Upload Your Design
                </h3>
                <p className="text-xs text-maroon/90 dark:text-champagne/85 mt-1 font-medium">
                  Upload the dress, outfit or clothing design you want to try.
                </p>
              </div>

              {/* Design Display / Upload Area */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-dashed border-burgundy/30 dark:border-sand/30 bg-[#F2E5C6]/40 dark:bg-[#0D080A]/60 flex flex-col items-center justify-center p-4">
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
                        className="px-3 py-1.5 rounded-lg bg-black/85 text-xs text-sand-light border border-sand/30 hover:bg-black transition font-semibold"
                      >
                        Replace Design
                      </button>
                      <button
                        onClick={() => setDesignPhoto(null)}
                        className="p-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800/50 hover:bg-rose-900 transition"
                        title="Remove Design"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-burgundy border border-sand/30 flex items-center justify-center mx-auto text-champagne">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-wine dark:text-sand-light font-bold">
                        Upload dress, blouse or kurti image
                      </p>
                      <p className="text-[10px] text-maroon/60 mt-0.5">
                        Pinterest screenshot, catalog photo, or sketch
                      </p>
                    </div>
                    <button
                      onClick={() => designPhotoInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-burgundy text-champagne border border-sand/30 hover:bg-maroon transition shadow-sm"
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
                <div className="pt-2 border-t border-burgundy/15">
                  <span className="text-[10px] font-mono text-maroon/80 uppercase font-semibold block mb-1.5">
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
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F2E5C6] hover:bg-[#F2D9A0] text-[11px] text-wine border border-burgundy/20 transition"
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
          <div className="p-6 rounded-3xl bg-gradient-to-r from-burgundy via-maroon to-burgundy border-2 border-sand/40 text-center space-y-4 shadow-xl text-champagne">
            <div className="flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-wider text-champagne">
              <span className={userPhoto ? "text-sand font-bold" : "text-champagne/60"}>
                {userPhoto ? "✓ YOUR PHOTO READY" : "1. Photo Missing"}
              </span>
              <span>+</span>
              <span className={designPhoto ? "text-sand font-bold" : "text-champagne/60"}>
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
                  className={`w-full max-w-md py-4 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 mx-auto ${
                    isReadyToGenerate
                      ? "bg-gradient-to-r from-sand via-champagne to-sand-light text-wine border border-sand/60 shadow-gold-glow hover:scale-105 active:scale-95 cursor-pointer"
                      : "bg-maroon/50 text-champagne/40 border border-sand/15 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-wine" />
                  <span>Generate Virtual Try-On</span>
                </button>

                {!isReadyToGenerate && (
                  <p className="text-xs text-champagne/80 italic">
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
