import React from "react";
import VirtualTryOnStudio from "@/components/try-on/VirtualTryOnStudio";

export const metadata = {
  title: "Live Virtual Try-On & Digital Fitting Room | SILAI",
  description:
    "Step into SILAI's interactive digital fitting room. Drag custom blouse, kurti, and lehenga designs onto your live mirror preview before booking your master tailor.",
};

export default function TryOnPage() {
  return (
    <div className="py-6">
      <VirtualTryOnStudio />
    </div>
  );
}
