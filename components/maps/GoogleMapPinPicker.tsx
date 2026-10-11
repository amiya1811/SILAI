"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Search,
  Compass,
} from "lucide-react";
import {
  LatLng,
  DEFAULT_BANGALORE_CENTER,
  getCurrentBrowserLocation,
  loadGoogleMapsScript,
  isMapsEnabled,
} from "@/lib/maps/google-maps";

interface GoogleMapPinPickerProps {
  initialCoords?: LatLng;
  onLocationChange: (coords: LatLng, addressSnippet?: string) => void;
  height?: string;
  allowDrag?: boolean;
}

const KNOWN_OFFLINE_ZONES: Record<string, LatLng> = {
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  koramangala: { lat: 12.9352, lng: 77.6245 },
  hsr: { lat: 12.9121, lng: 77.6446 },
  "hsr layout": { lat: 12.9121, lng: 77.6446 },
  jayanagar: { lat: 12.9308, lng: 77.5838 },
  whitefield: { lat: 12.9698, lng: 77.7500 },
  jpnagar: { lat: 12.9063, lng: 77.5857 },
  "jp nagar": { lat: 12.9063, lng: 77.5857 },
  malleshwaram: { lat: 13.0031, lng: 77.5643 },
  mgroad: { lat: 12.9756, lng: 77.6066 },
  "mg road": { lat: 12.9756, lng: 77.6066 },
  hebbal: { lat: 13.0358, lng: 77.5970 },
  marathahalli: { lat: 12.9591, lng: 77.6974 },
  bellandur: { lat: 12.9260, lng: 77.6762 },
};

export default function GoogleMapPinPicker({
  initialCoords = DEFAULT_BANGALORE_CENTER,
  onLocationChange,
  height = "260px",
  allowDrag = true,
}: GoogleMapPinPickerProps) {
  const mapsActive = isMapsEnabled();

  const [coords, setCoords] = useState<LatLng>(initialCoords);
  const [zoom, setZoom] = useState(15);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapsSdkLoaded, setMapsSdkLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const googleMarkerInstanceRef = useRef<any>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);

  // If Maps is disabled via feature flag, display premium Coming Soon state without breaking
  if (!mapsActive) {
    return (
      <div
        style={{ minHeight: height }}
        className="w-full p-6 bg-gradient-to-b from-[#1C0812] to-[#0D0408] border border-[#F2D9A0]/25 rounded-xl flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#F2D9A0 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="w-12 h-12 rounded-2xl bg-[#560B18]/60 border border-[#F2D9A0]/30 flex items-center justify-center text-[#F2D9A0] shadow-md relative z-10">
          <Compass className="w-6 h-6 animate-pulse" />
        </div>
        <div className="relative z-10">
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#560B18]/80 text-[#F2D9A0] border border-[#F2D9A0]/30 text-[10px] font-mono uppercase tracking-widest font-bold mb-1">
            Coming Soon
          </div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#F2D9A0]">
            Maps & Live Navigation
          </h3>
          <p className="text-xs text-[#F2E5C6]/75 max-w-sm mx-auto mt-1 leading-relaxed">
            Live maps, route navigation and real-time location tracking are being prepared for SILAI.
          </p>
        </div>
        <div className="relative z-10 text-[11px] font-mono text-[#F2D9A0]/70 pt-2 border-t border-[#F2D9A0]/15 w-full flex flex-col sm:flex-row items-center justify-between gap-1 px-2">
          <span>Bengaluru Metro Service Area</span>
          <span className="text-emerald-400">Manual Address Entry Active ✓</span>
        </div>
      </div>
    );
  }

  // Trigger real reverse geocoding if Google Maps API is loaded
  const triggerReverseGeocode = (newCoords: LatLng) => {
    if (typeof window !== "undefined" && (window as any).google?.maps?.Geocoder) {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ location: newCoords }, (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          onLocationChange(newCoords, results[0].formatted_address);
        } else {
          onLocationChange(newCoords);
        }
      });
    } else {
      onLocationChange(newCoords);
    }
  };

  // Initialize or check Google Maps SDK
  useEffect(() => {
    let isMounted = true;
    loadGoogleMapsScript().then((loaded) => {
      if (isMounted) {
        setMapsSdkLoaded(loaded);
        if (loaded && mapContainerRef.current && (window as any).google?.maps) {
          initGoogleMap();
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const initGoogleMap = () => {
    if (!mapContainerRef.current || !(window as any).google?.maps) return;

    const mapOptions = {
      center: coords,
      zoom: zoom,
      disableDefaultUI: true,
      zoomControl: false,
      styles: [
        // Luxury dark styled Google Map
        { elementType: "geometry", stylers: [{ color: "#241f21" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#241f21" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#d5c59f" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f2e5c6" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#c4a482" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#382d2f" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#211c1d" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#171214" }],
        },
      ],
    };

    const map = new (window as any).google.maps.Map(mapContainerRef.current, mapOptions);
    googleMapInstanceRef.current = map;

    const marker = new (window as any).google.maps.Marker({
      position: coords,
      map: map,
      draggable: allowDrag,
      title: "Delivery Location",
      animation: (window as any).google.maps.Animation.DROP,
    });
    googleMarkerInstanceRef.current = marker;

    if (allowDrag) {
      marker.addListener("dragend", (event: any) => {
        const newCoords = {
          lat: Number(event.latLng.lat().toFixed(6)),
          lng: Number(event.latLng.lng().toFixed(6)),
        };
        setCoords(newCoords);
        triggerReverseGeocode(newCoords);
      });

      map.addListener("click", (event: any) => {
        const newCoords = {
          lat: Number(event.latLng.lat().toFixed(6)),
          lng: Number(event.latLng.lng().toFixed(6)),
        };
        marker.setPosition(event.latLng);
        setCoords(newCoords);
        triggerReverseGeocode(newCoords);
      });
    }

    // Attach Google Places Autocomplete to the search input
    if (autocompleteInputRef.current && (window as any).google.maps.places) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        {
          componentRestrictions: { country: "in" },
          fields: ["geometry", "formatted_address", "name"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const newCoords = {
            lat: Number(place.geometry.location.lat().toFixed(6)),
            lng: Number(place.geometry.location.lng().toFixed(6)),
          };
          setCoords(newCoords);
          map.setCenter(newCoords);
          map.setZoom(16);
          marker.setPosition(newCoords);
          onLocationChange(newCoords, place.formatted_address || place.name);
        }
      });
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setGpsError(null);

    const result = await getCurrentBrowserLocation();
    setIsLocating(false);

    if (result.success && result.coords) {
      const newCoords = {
        lat: Number(result.coords.lat.toFixed(6)),
        lng: Number(result.coords.lng.toFixed(6)),
      };
      setCoords(newCoords);
      triggerReverseGeocode(newCoords);

      if (googleMapInstanceRef.current && googleMarkerInstanceRef.current) {
        googleMapInstanceRef.current.setCenter(newCoords);
        googleMarkerInstanceRef.current.setPosition(newCoords);
      }
    } else {
      setGpsError(result.error || "Could not detect location.");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    if (KNOWN_OFFLINE_ZONES[q]) {
      const target = KNOWN_OFFLINE_ZONES[q];
      setCoords(target);
      onLocationChange(target, searchQuery.trim());
      if (googleMapInstanceRef.current && googleMarkerInstanceRef.current) {
        googleMapInstanceRef.current.setCenter(target);
        googleMarkerInstanceRef.current.setPosition(target);
      }
    }
  };

  const handleZoom = (delta: number) => {
    const nextZoom = Math.min(Math.max(zoom + delta, 10), 20);
    setZoom(nextZoom);
    if (googleMapInstanceRef.current) {
      googleMapInstanceRef.current.setZoom(nextZoom);
    }
  };

  const handleMapSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mapsSdkLoaded || !allowDrag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dLat = ((y - rect.height / 2) / rect.height) * -0.04;
    const dLng = ((x - rect.width / 2) / rect.width) * 0.04;

    const newCoords = {
      lat: Number((coords.lat + dLat).toFixed(6)),
      lng: Number((coords.lng + dLng).toFixed(6)),
    };
    setCoords(newCoords);
    triggerReverseGeocode(newCoords);
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#F2D9A0]/25 relative bg-[#130B10]">
      {/* Places Autocomplete Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="p-2.5 bg-[#1B060F] border-b border-[#F2D9A0]/15 flex items-center gap-2"
      >
        <Search className="w-4 h-4 text-[#F2D9A0] flex-shrink-0" />
        <input
          ref={autocompleteInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search area, landmark or street (e.g. Indiranagar, Koramangala, HSR Layout)..."
          className="w-full bg-transparent text-xs text-[#F2E5C6] placeholder:text-[#F2E5C6]/40 focus:outline-none font-sans"
        />
      </form>

      {/* Map display */}
      <div
        ref={mapContainerRef}
        onClick={handleMapSurfaceClick}
        style={{ height }}
        className="w-full relative cursor-crosshair overflow-hidden"
      >
        {!mapsSdkLoaded && (
          <div className="absolute inset-0 bg-[#170E14] flex flex-col items-center justify-center p-4 select-none">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(#F2D9A0 1px, transparent 1px), linear-gradient(to right, #560B18 1px, transparent 1px), linear-gradient(to bottom, #560B18 1px, transparent 1px)",
                backgroundSize: "20px 20px, 40px 40px, 40px 40px",
              }}
            />

            <div className="absolute top-3 left-4 text-[10px] font-mono text-[#F2D9A0]/50 uppercase tracking-widest">
              Bengaluru Metro Core · Pin Locator
            </div>

            <div className="relative z-10 flex flex-col items-center -translate-y-4 animate-bounce">
              <div className="w-8 h-8 rounded-full bg-[#75162D] border-2 border-[#F2D9A0] shadow-xl flex items-center justify-center text-[#F2D9A0]">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="w-2.5 h-1 bg-[#F2D9A0]/60 rounded-full blur-[1px] mt-1" />
            </div>

            <div className="relative z-10 mt-3 text-center">
              <div className="text-[11px] font-semibold text-[#F2D9A0] flex items-center justify-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#F2D9A0]" />
                <span>Click anywhere or use GPS to adjust delivery pin</span>
              </div>
              <div className="text-[10px] font-mono text-[#F2E5C6]/60 mt-0.5">
                Coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="absolute top-12 right-3 flex flex-col gap-1.5 z-20">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          title="Use GPS Current Location"
          className="p-2 rounded-lg bg-[#3B010B]/90 hover:bg-[#560B18] border border-[#F2D9A0]/40 text-[#F2D9A0] shadow-md transition flex items-center justify-center cursor-pointer"
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(1)}
          title="Zoom In"
          className="p-2 rounded-lg bg-[#3B010B]/90 hover:bg-[#560B18] border border-[#F2D9A0]/40 text-[#F2D9A0] shadow-md transition flex items-center justify-center cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-1)}
          title="Zoom Out"
          className="p-2 rounded-lg bg-[#3B010B]/90 hover:bg-[#560B18] border border-[#F2D9A0]/40 text-[#F2D9A0] shadow-md transition flex items-center justify-center cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* GPS Error Toast */}
      {gpsError && (
        <div className="absolute bottom-10 left-2 right-2 p-2 rounded-lg bg-rose-950/90 border border-rose-500/50 text-rose-200 text-[11px] flex items-center gap-2 z-20">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
          <span className="flex-1">{gpsError}</span>
          <button
            type="button"
            onClick={() => setGpsError(null)}
            className="text-xs text-rose-300 hover:text-white px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Coordinate & Status Bar */}
      <div className="p-2.5 bg-[#1F0A14] border-t border-[#F2D9A0]/15 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-[#F2E5C6]/80 font-mono">
          <MapPin className="w-3.5 h-3.5 text-[#F2D9A0]" />
          <span>
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        </div>
        <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Bengaluru Delivery Zone</span>
        </div>
      </div>
    </div>
  );
}
