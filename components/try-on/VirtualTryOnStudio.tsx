"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Sliders, Camera, Upload, Check, Info, ArrowRight, Scissors } from "lucide-react";
import Image from "next/image";

interface TryOnSettings {
  garmentType: "BLOUSE" | "KURTI" | "LEHENGA" | "SHIRT";
  neckline: "Sweetheart" | "Deep V" | "Boat Neck" | "Round" | "Mandarin Collar";
  sleeveLength: "Sleeveless" | "Short" | "Elbow Length" | "3/4th Sleeve" | "Full Sleeve";
  garmentLength: "Cropped" | "Standard" | "Long";
  fabricColor: string;
  fabricName: string;
  pattern: "Plain Silk" | "Zari Brocade" | "Chikankari" | "Bandhani Print";
}

const FABRIC_SWATCHES = [
  { name: "Royal Wine", color: "#75162D", bgClass: "bg-[#75162D]" },
  { name: "Imperial Gold", color: "#D4AF37", bgClass: "bg-[#D4AF37]" },
  { name: "Dark Maroon", color: "#560B18", bgClass: "bg-[#560B18]" },
  { name: "Emerald Silk", color: "#0B4F3A", bgClass: "bg-[#0B4F3A]" },
  { name: "Midnight Navy", color: "#102A43", bgClass: "bg-[#102A43]" },
  { name: "Champagne Beige", color: "#F2E5C6", bgClass: "bg-[#F2E5C6]" },
];

export default function VirtualTryOnStudio() {
  const [settings, setSettings] = useState<TryOnSettings>({
    garmentType: "BLOUSE",
    neckline: "Sweetheart",
    sleeveLength: "Elbow Length",
    garmentLength: "Standard",
    fabricColor: "#75162D",
    fabricName: "Royal Wine",
    pattern: "Zari Brocade",
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
    }
  };

  const simulateRender = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Studio Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy/60 border border-sand/30 text-sand text-xs font-mono tracking-widest uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" /> SILAI AI Fitting Studio
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sand-light">
          Virtual Silhouette & Design Preview
        </h1>
        <p className="text-sm text-champagne/80 mt-2">
          Visualize necklines, sleeve contours, and silk drapes before handing your fabric to our master tailors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Visual Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-[4/5] max-w-md rounded-2xl overflow-hidden bg-gradient-to-b from-wine-dark to-[#200005] border-2 border-sand/30 shadow-2xl flex flex-col items-center justify-center p-6">
            {/* Background Studio Lighting Glow */}
            <div
              className="absolute inset-0 opacity-40 transition-colors duration-700 blur-3xl pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${settings.fabricColor} 0%, transparent 70%)`,
              }}
            />

            {/* Mannequin / Garment Visualizer */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
              {/* Interactive SVG Rendering of Tailored Silhouette */}
              <div className="relative w-64 h-80 flex items-center justify-center transition-all duration-500">
                <svg
                  viewBox="0 0 240 320"
                  className="w-full h-full filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                >
                  <defs>
                    <linearGradient id="fabricShading" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={settings.fabricColor} stopOpacity="1" />
                      <stop offset="70%" stopColor={settings.fabricColor} stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#200005" stopOpacity="0.95" />
                    </linearGradient>
                    <pattern id="zariPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1.5" fill="#F2D9A0" fillOpacity="0.4" />
                      <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="#F2D9A0" strokeWidth="0.5" strokeOpacity="0.25" />
                    </pattern>
                  </defs>

                  {/* Body Silhouette Outline */}
                  <path
                    d="M95,30 Q120,45 145,30 Q175,55 180,85 Q165,130 155,190 Q150,250 150,310 L90,310 Q90,250 85,190 Q75,130 60,85 Q65,55 95,30 Z"
                    fill="#36171d"
                    opacity="0.5"
                  />

                  {/* Garment Base Body */}
                  {settings.garmentType === "BLOUSE" && (
                    <g className="transition-all duration-300">
                      {/* Blouse Body */}
                      <path
                        d={
                          settings.neckline === "Sweetheart"
                            ? "M75,70 Q120,105 165,70 L170,165 Q120,180 70,165 Z"
                            : settings.neckline === "Deep V"
                            ? "M75,65 L120,125 L165,65 L170,165 Q120,175 70,165 Z"
                            : settings.neckline === "Boat Neck"
                            ? "M65,70 Q120,80 175,70 L170,165 Q120,175 70,165 Z"
                            : "M80,65 Q120,95 160,65 L170,165 Q120,175 70,165 Z"
                        }
                        fill="url(#fabricShading)"
                        stroke="#F2D9A0"
                        strokeWidth="1.2"
                      />
                      {/* Pattern overlay */}
                      {settings.pattern === "Zari Brocade" && (
                        <path
                          d={
                            settings.neckline === "Sweetheart"
                              ? "M75,70 Q120,105 165,70 L170,165 Q120,180 70,165 Z"
                              : "M75,65 L120,125 L165,65 L170,165 Q120,175 70,165 Z"
                          }
                          fill="url(#zariPattern)"
                          opacity="0.8"
                        />
                      )}
                      {/* Sleeves */}
                      {settings.sleeveLength !== "Sleeveless" && (
                        <g>
                          {/* Left Sleeve */}
                          <path
                            d={
                              settings.sleeveLength === "Short"
                                ? "M75,70 L45,100 L55,115 L72,95 Z"
                                : settings.sleeveLength === "Elbow Length"
                                ? "M75,70 L35,130 L50,140 L72,110 Z"
                                : "M75,70 L20,190 L38,195 L72,120 Z"
                            }
                            fill="url(#fabricShading)"
                            stroke="#F2D9A0"
                            strokeWidth="1"
                          />
                          {/* Right Sleeve */}
                          <path
                            d={
                              settings.sleeveLength === "Short"
                                ? "M165,70 L195,100 L185,115 L168,95 Z"
                                : settings.sleeveLength === "Elbow Length"
                                ? "M165,70 L205,130 L190,140 L168,110 Z"
                                : "M165,70 L220,190 L202,195 L168,120 Z"
                            }
                            fill="url(#fabricShading)"
                            stroke="#F2D9A0"
                            strokeWidth="1"
                          />
                        </g>
                      )}
                    </g>
                  )}

                  {settings.garmentType === "KURTI" && (
                    <g className="transition-all duration-300">
                      {/* Kurti Body */}
                      <path
                        d="M75,65 Q120,95 165,65 L180,260 L145,265 L145,180 L95,180 L95,265 L60,260 Z"
                        fill="url(#fabricShading)"
                        stroke="#F2D9A0"
                        strokeWidth="1.2"
                      />
                      {settings.pattern === "Zari Brocade" && (
                        <path
                          d="M75,65 Q120,95 165,65 L180,260 L145,265 L145,180 L95,180 L95,265 L60,260 Z"
                          fill="url(#zariPattern)"
                          opacity="0.8"
                        />
                      )}
                      {/* Sleeve */}
                      <path
                        d={
                          settings.sleeveLength === "3/4th Sleeve"
                            ? "M75,65 L30,160 L48,168 L72,115 Z"
                            : "M75,65 L45,100 L58,115 L72,95 Z"
                        }
                        fill="url(#fabricShading)"
                        stroke="#F2D9A0"
                        strokeWidth="1"
                      />
                      <path
                        d={
                          settings.sleeveLength === "3/4th Sleeve"
                            ? "M165,65 L210,160 L192,168 L168,115 Z"
                            : "M165,65 L195,100 L182,115 L168,95 Z"
                        }
                        fill="url(#fabricShading)"
                        stroke="#F2D9A0"
                        strokeWidth="1"
                      />
                    </g>
                  )}

                  {settings.garmentType === "LEHENGA" && (
                    <g className="transition-all duration-300">
                      {/* Choli */}
                      <path
                        d="M75,65 Q120,105 165,65 L170,145 Q120,160 70,145 Z"
                        fill="url(#fabricShading)"
                        stroke="#F2D9A0"
                        strokeWidth="1.2"
                      />
                      {/* Lehenga Skirt */}
                      <path
                        d="M80,165 Q120,175 160,165 L215,310 Q120,325 25,310 Z"
                        fill="url(#fabricShading)"
                        stroke="#F2D9A0"
                        strokeWidth="1.2"
                      />
                      {settings.pattern === "Zari Brocade" && (
                        <path
                          d="M80,165 Q120,175 160,165 L215,310 Q120,325 25,310 Z"
                          fill="url(#zariPattern)"
                          opacity="0.8"
                        />
                      )}
                    </g>
                  )}

                  {settings.garmentType === "SHIRT" && (
                    <g className="transition-all duration-300">
                      {/* Shirt Body */}
                      <path
                        d="M70,55 L95,65 L120,55 L145,65 L170,55 L175,220 Q120,230 65,220 Z"
                        fill="url(#fabricShading)"
                        stroke="#F2D9A0"
                        strokeWidth="1.2"
                      />
                      {/* Collar */}
                      <polygon points="95,65 120,80 145,65 135,45 105,45" fill="#FAF4E8" opacity="0.9" />
                      {/* Placket */}
                      <line x1="120" y1="80" x2="120" y2="220" stroke="#F2D9A0" strokeWidth="2" strokeDasharray="6,4" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Garment badge tag */}
              <div className="mt-4 px-3 py-1 rounded-full bg-wine/80 border border-sand/30 text-[11px] text-sand font-mono">
                {settings.garmentType} • {settings.neckline} • {settings.sleeveLength}
              </div>
            </div>

            {/* Reference image thumbnail if uploaded */}
            {uploadedImage && (
              <div className="absolute top-4 left-4 flex items-center gap-2 p-1.5 rounded-lg bg-black/60 border border-sand/30 backdrop-blur-sm">
                <img src={uploadedImage} alt="Ref" className="w-10 h-10 object-cover rounded" />
                <span className="text-[10px] text-sand pr-1 font-mono">Fabric Sample</span>
              </div>
            )}
          </div>

          {/* Mandatory Disclaimers (Requirement 13) */}
          <div className="mt-4 max-w-md p-3.5 rounded-xl bg-wine-dark/70 border border-sand/20 text-xs text-champagne/80 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sand flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-sand font-medium">Virtual preview only.</strong> Final fit depends on your exact anatomical measurements, fabric drape, and the skilled hand of your assigned master tailor.
            </p>
          </div>
        </div>

        {/* Right: Studio Customization Controls */}
        <div className="lg:col-span-5 space-y-6 bg-wine-dark/60 p-6 rounded-2xl border border-sand/20 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-sand/15 pb-4">
            <h3 className="font-serif text-lg font-bold text-sand-light flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sand" /> Silhouette Controls
            </h3>
            <span className="text-xs text-sand/80 font-mono">Step 1 of 2</span>
          </div>

          {/* 1. Garment Type */}
          <div>
            <label className="block text-xs font-mono tracking-wider text-sand uppercase mb-2">
              Select Garment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["BLOUSE", "KURTI", "LEHENGA", "SHIRT"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSettings({ ...settings, garmentType: type });
                    simulateRender();
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${
                    settings.garmentType === type
                      ? "bg-burgundy text-sand-light border-sand shadow-sm"
                      : "bg-wine/60 text-champagne border-sand/20 hover:border-sand/40"
                  }`}
                >
                  {type === "BLOUSE" && "Saree Blouse"}
                  {type === "KURTI" && "Designer Kurti"}
                  {type === "LEHENGA" && "Lehenga Choli"}
                  {type === "SHIRT" && "Bespoke Shirt"}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Neckline Selection */}
          <div>
            <label className="block text-xs font-mono tracking-wider text-sand uppercase mb-2">
              Neckline Contour
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Sweetheart", "Deep V", "Boat Neck", "Round", "Mandarin Collar"] as const).map(
                (neck) => (
                  <button
                    key={neck}
                    onClick={() => {
                      setSettings({ ...settings, neckline: neck });
                      simulateRender();
                    }}
                    className={`py-2 px-2 text-[11px] font-medium rounded-lg border text-center transition ${
                      settings.neckline === neck
                        ? "bg-burgundy text-sand border-sand"
                        : "bg-wine/60 text-champagne/80 border-sand/20 hover:border-sand/40"
                    }`}
                  >
                    {neck}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 3. Sleeve Length */}
          <div>
            <label className="block text-xs font-mono tracking-wider text-sand uppercase mb-2">
              Sleeve Contouring
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Sleeveless", "Short", "Elbow Length", "3/4th Sleeve", "Full Sleeve"] as const).map(
                (sleeve) => (
                  <button
                    key={sleeve}
                    onClick={() => {
                      setSettings({ ...settings, sleeveLength: sleeve });
                      simulateRender();
                    }}
                    className={`py-2 px-2 text-[11px] font-medium rounded-lg border text-center transition ${
                      settings.sleeveLength === sleeve
                        ? "bg-burgundy text-sand border-sand"
                        : "bg-wine/60 text-champagne/80 border-sand/20 hover:border-sand/40"
                    }`}
                  >
                    {sleeve}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 4. Fabric Color Palette */}
          <div>
            <label className="block text-xs font-mono tracking-wider text-sand uppercase mb-2">
              Silk & Brocade Palette
            </label>
            <div className="flex items-center gap-3">
              {FABRIC_SWATCHES.map((swatch) => (
                <button
                  key={swatch.name}
                  onClick={() => {
                    setSettings({
                      ...settings,
                      fabricColor: swatch.color,
                      fabricName: swatch.name,
                    });
                    simulateRender();
                  }}
                  className={`w-9 h-9 rounded-full ${swatch.bgClass} border-2 transition transform ${
                    settings.fabricColor === swatch.color
                      ? "border-sand scale-110 shadow-gold-glow"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                  title={swatch.name}
                />
              ))}
            </div>
          </div>

          {/* 5. Upload Custom Fabric Photo */}
          <div className="pt-2 border-t border-sand/15">
            <label className="block text-xs font-mono tracking-wider text-sand uppercase mb-2">
              Upload Your Own Fabric / Design Photo
            </label>
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-sand/30 hover:border-sand/70 bg-wine/40 cursor-pointer transition">
              <Upload className="w-4 h-4 text-sand" />
              <span className="text-xs text-champagne/80">Select JPG / PNG photo from device</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Primary CTA (Requirement 13): "Try This Design" -> "Get It Stitched" */}
          <div className="pt-4 border-t border-sand/15">
            <Link
              href={`/explore?designGarment=${settings.garmentType}&neck=${encodeURIComponent(
                settings.neckline
              )}&sleeve=${encodeURIComponent(settings.sleeveLength)}`}
              className="w-full py-3.5 rounded-xl font-medium text-sm text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/50 shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4 text-sand" /> Get It Stitched by a Master Tailor
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-center text-champagne/60 mt-2">
              Browse certified boutiques offering this exact cut with doorstep pickup
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
