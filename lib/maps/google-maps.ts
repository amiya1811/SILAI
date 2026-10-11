// ========================================================
// SILAI - Google Maps Platform & Location Utilities
// ========================================================

export interface LatLng {
  lat: number;
  lng: number;
}

export const DEFAULT_BANGALORE_CENTER: LatLng = {
  lat: 12.9716,
  lng: 77.5946,
};

/**
 * Centralized feature flag check for Google Maps Platform.
 * When false, applications gracefully degrade to manual entry and Coming Soon UI.
 */
export function isMapsEnabled(): boolean {
  if (
    process.env.NEXT_PUBLIC_MAPS_ENABLED === "false" ||
    process.env.MAPS_ENABLED === "false"
  ) {
    return false;
  }
  if (
    process.env.NEXT_PUBLIC_MAPS_ENABLED === "true" ||
    process.env.MAPS_ENABLED === "true"
  ) {
    return true;
  }
  // Default to false while Google Cloud billing / APIs are pending configuration
  return false;
}

/**
 * Loads the Google Maps JavaScript API dynamically if feature flag and API key are enabled
 */
export function loadGoogleMapsScript(apiKey?: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (!isMapsEnabled()) {
      resolve(false);
      return;
    }

    if ((window as any).google && (window as any).google.maps) {
      resolve(true);
      return;
    }

    const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key || key === "AIzaSy_YOUR_GOOGLE_MAPS_API_KEY") {
      resolve(false);
      return;
    }

    const existingScript = document.getElementById("silai-google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "silai-google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Gracefully requests browser GPS location with timeout and error handling
 */
export async function getCurrentBrowserLocation(): Promise<{
  success: boolean;
  coords?: LatLng;
  error?: string;
}> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return {
      success: false,
      error: "Geolocation is not supported by your browser.",
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        let msg = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Location permission was denied. You can manually position the pin.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location information is unavailable. Please position the pin manually.";
            break;
          case error.TIMEOUT:
            msg = "Location request timed out. Please try again or drag the pin.";
            break;
        }
        resolve({
          success: false,
          error: msg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Calculates great-circle distance between two points using the Haversine formula (km)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Generates an estimated delivery address breakdown from lat/long if geocoding isn't available
 */
export function approximateBangaloreAddress(lat: number, lng: number): {
  area: string;
  postalCode: string;
} {
  // Approximate known Bangalore zones based on coordinate thresholds
  if (lat > 12.98 && lng > 77.62) return { area: "Indiranagar", postalCode: "560038" };
  if (lat < 12.94 && lng > 77.60) return { area: "Koramangala", postalCode: "560034" };
  if (lat < 12.92 && lng > 77.63) return { area: "HSR Layout", postalCode: "560102" };
  if (lat < 12.92 && lng < 77.59) return { area: "Jayanagar", postalCode: "560011" };
  if (lat > 13.00 && lng > 77.56) return { area: "Malleshwaram", postalCode: "560003" };
  if (lat > 12.98 && lng > 77.70) return { area: "Whitefield", postalCode: "560066" };
  if (lat < 12.90 && lng < 77.60) return { area: "JP Nagar", postalCode: "560078" };
  return { area: "Central Bengaluru", postalCode: "560001" };
}
