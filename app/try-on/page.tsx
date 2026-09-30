import React from "react";
import VirtualTryOnStudio from "@/components/try-on/VirtualTryOnStudio";

export const metadata = {
  title: "AI Virtual Try-On Studio | SILAI",
  description:
    "Preview blouse necklines, sleeve cuts, and luxurious silk textures before booking your master tailor.",
};

export default function TryOnPage() {
  return (
    <div className="py-6">
      <VirtualTryOnStudio />
    </div>
  );
}
