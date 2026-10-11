"use client";

/**
 * Loads the official Razorpay Checkout SDK script dynamically.
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve(false);
    }

    if ((window as any).Razorpay) {
      return resolve(true);
    }

    // Check if script tag is already in DOM
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout SDK script");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}
