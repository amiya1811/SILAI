"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Home,
  Briefcase,
  Plus,
  Navigation,
  Check,
  Building,
  Compass,
  AlertCircle,
  Save,
} from "lucide-react";
import { CustomerAddress } from "@/lib/types";
import GoogleMapPinPicker from "@/components/maps/GoogleMapPinPicker";
import {
  DEFAULT_BANGALORE_CENTER,
  approximateBangaloreAddress,
  LatLng,
} from "@/lib/maps/google-maps";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AddressSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: CustomerAddress) => void;
  selectedAddressId?: string;
}

export default function AddressSelectorModal({
  isOpen,
  onClose,
  onSelectAddress,
  selectedAddressId,
}: AddressSelectorModalProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"SAVED" | "ENTER_FORM" | "LOCATE_MAP">("SAVED");
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [label, setLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [houseBuilding, setHouseBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [areaLocality, setAreaLocality] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("560034");
  const [landmark, setLandmark] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Map Coordinates
  const [coords, setCoords] = useState<LatLng>(DEFAULT_BANGALORE_CENTER);

  // Fetch customer saved addresses
  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customer/addresses");
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data.addresses || []);
        if ((data.addresses || []).length === 0) {
          setMode("ENTER_FORM");
        }
      }
    } catch (e) {
      console.error("Failed to load saved addresses", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCoordsChange = (newCoords: LatLng) => {
    setCoords(newCoords);
    const approx = approximateBangaloreAddress(newCoords.lat, newCoords.lng);
    if (!areaLocality) {
      setAreaLocality(approx.area);
    }
    if (!postalCode) {
      setPostalCode(approx.postalCode);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!areaLocality.trim() || !houseBuilding.trim()) {
      setErrorMsg(t("address.validationError", "Please provide your house/flat number and area name."));
      return;
    }

    setIsSaving(true);

    const formattedAddress = `${houseBuilding.trim()}, ${
      street ? street.trim() + ", " : ""
    }${areaLocality.trim()}, ${city}, ${state} - ${postalCode}${
      landmark ? ` (Near ${landmark.trim()})` : ""
    }`;

    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          houseBuilding: houseBuilding.trim(),
          street: street.trim(),
          areaLocality: areaLocality.trim(),
          city,
          state,
          postalCode: postalCode.trim(),
          landmark: landmark.trim(),
          deliveryInstructions: deliveryInstructions.trim(),
          formattedAddress,
          latitude: coords.lat,
          longitude: coords.lng,
          isDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || t("address.saveError", "Failed to save address."));
      } else {
        onSelectAddress(data.address);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(t("address.networkError", "A network error occurred while saving."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#250812] to-[#0D0408] border border-[#F2D9A0]/30 shadow-2xl text-[#F2E5C6] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#F2D9A0]/15 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#560B18]/60 border border-[#F2D9A0]/30 flex items-center justify-center text-[#F2D9A0]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#F2D9A0]">
                {t("address.modalTitle", "Delivery Address & Coordinates")}
              </h2>
              <p className="text-[11px] text-[#F2E5C6]/60">
                {t("address.modalSubtitle", "Bengaluru Metro Service Area (Real-time GPS Pinpoint)")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#F2E5C6]/60 hover:text-[#F2D9A0] hover:bg-[#560B18]/40 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-3 border-b border-[#F2D9A0]/10 bg-[#16050C]/60 flex gap-2 flex-shrink-0">
          {savedAddresses.length > 0 && (
            <button
              type="button"
              onClick={() => setMode("SAVED")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "SAVED"
                  ? "bg-[#560B18] text-[#F2D9A0] border border-[#F2D9A0]/40 font-semibold"
                  : "text-[#F2E5C6]/60 hover:text-[#F2D9A0] hover:bg-[#3B010B]/30"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t("address.savedAddressesTab", "Saved Addresses")} ({savedAddresses.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMode("ENTER_FORM")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "ENTER_FORM"
                ? "bg-[#560B18] text-[#F2D9A0] border border-[#F2D9A0]/40 font-semibold"
                : "text-[#F2E5C6]/60 hover:text-[#F2D9A0] hover:bg-[#3B010B]/30"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>{t("address.enterAddressTab", "Enter Address")}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("LOCATE_MAP")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "LOCATE_MAP"
                ? "bg-[#560B18] text-[#F2D9A0] border border-[#F2D9A0]/40 font-semibold"
                : "text-[#F2E5C6]/60 hover:text-[#F2D9A0] hover:bg-[#3B010B]/30"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t("address.locateOnMapTab", "Locate on Map")}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE 1: SAVED ADDRESSES */}
          {mode === "SAVED" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#F2D9A0] tracking-wider">
                  {t("address.selectDeliveryLocation", "Select Delivery Location")}
                </span>
                <button
                  type="button"
                  onClick={() => setMode("ENTER_FORM")}
                  className="text-xs text-[#F2D9A0] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("address.addNew", "Add New")}</span>
                </button>
              </div>

              {savedAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      onSelectAddress(addr);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-[#560B18]/70 border-[#F2D9A0] shadow-md ring-1 ring-[#F2D9A0]/50"
                        : "bg-[#1B060F]/60 border-[#F2D9A0]/20 hover:border-[#F2D9A0]/50 hover:bg-[#250812]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {addr.label === "Home" ? (
                          <Home className="w-4 h-4 text-[#F2D9A0]" />
                        ) : addr.label === "Work" ? (
                          <Briefcase className="w-4 h-4 text-[#F2D9A0]" />
                        ) : (
                          <MapPin className="w-4 h-4 text-[#F2D9A0]" />
                        )}
                        <span className="font-semibold text-xs text-[#F2D9A0]">
                          {addr.label === "Home"
                            ? t("address.home", "Home")
                            : addr.label === "Work"
                            ? t("address.work", "Work")
                            : t("address.other", "Other")}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#75162D] text-[#F2E5C6] font-mono">
                            {t("address.defaultBadge", "DEFAULT")}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#F2D9A0] text-[#3B010B] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-[#F2E5C6]/90 leading-relaxed font-sans">
                      {addr.formattedAddress}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-[#F2E5C6]/50">
                      <span>{t("address.coordinates", "Coordinates")}:</span>
                      <span>
                        {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: ENTER ADDRESS FORM */}
          {mode === "ENTER_FORM" && (
            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Label selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1.5">
                  {t("address.saveAddressAs", "Save Address As")}
                </label>
                <div className="flex gap-2">
                  {(["Home", "Work", "Other"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLabel(l)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        label === l
                          ? "bg-[#560B18] text-[#F2D9A0] border-[#F2D9A0]"
                          : "bg-[#18060F] text-[#F2E5C6]/60 border-[#F2D9A0]/20 hover:border-[#F2D9A0]/40"
                      }`}
                    >
                      {l === "Home" && <Home className="w-3.5 h-3.5" />}
                      {l === "Work" && <Briefcase className="w-3.5 h-3.5" />}
                      {l === "Other" && <MapPin className="w-3.5 h-3.5" />}
                      <span>
                        {l === "Home"
                          ? t("address.home", "Home")
                          : l === "Work"
                          ? t("address.work", "Work")
                          : t("address.other", "Other")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* House / Flat / Building */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                  {t("address.flatHouseNumber", "Flat, House No., Building, Apartment *")}
                </label>
                <input
                  type="text"
                  required
                  value={houseBuilding}
                  onChange={(e) => setHouseBuilding(e.target.value)}
                  placeholder={t("address.flatHousePlaceholder", "e.g. Flat 302, Prestige Silver Springs")}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0]"
                />
              </div>

              {/* Street / Road */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                  {t("address.streetRoad", "Street, Road or Lane")}
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder={t("address.streetRoadPlaceholder", "e.g. 100 Feet Road, 4th Cross")}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0]"
                />
              </div>

              {/* Area / Locality & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                    {t("address.areaLocality", "Area, Locality *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={areaLocality}
                    onChange={(e) => setAreaLocality(e.target.value)}
                    placeholder={t("address.areaLocalityPlaceholder", "e.g. Indiranagar / Koramangala")}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                    {t("address.postalPincode", "Postal Pincode *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder={t("address.postalPincodePlaceholder", "e.g. 560038")}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0]"
                  />
                </div>
              </div>

              {/* City & State (Locked to Bengaluru, Karnataka for current launch) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                    {t("address.city", "City")}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={city}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#14060C] border border-[#F2D9A0]/15 text-[#F2E5C6]/70 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                    {t("address.state", "State")}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={state}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#14060C] border border-[#F2D9A0]/15 text-[#F2E5C6]/70 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Landmark & Instructions */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                  {t("address.landmark", "Nearby Landmark (Optional)")}
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={t("address.landmarkPlaceholder", "e.g. Opposite Sony Center / Near Metro Station")}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0]"
                />
              </div>

              {/* Interactive map preview */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1.5 flex items-center justify-between">
                  <span>{t("address.pinPreview", "Exact Delivery Pin Preview")}</span>
                  <span className="text-[10px] text-[#F2E5C6]/50">{t("address.clickToFineTune", "Click map to fine-tune")}</span>
                </label>
                <GoogleMapPinPicker
                  initialCoords={coords}
                  onLocationChange={handleCoordsChange}
                  height="160px"
                />
              </div>

              {/* Set as default checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-[#F2E5C6]/80">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-[#F2D9A0]/30 bg-[#1D0811] text-[#75162D] focus:ring-0 cursor-pointer"
                />
                <span>{t("address.setAsDefault", "Set this as my default delivery address")}</span>
              </label>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-xs text-[#3B010B] bg-gradient-to-r from-[#F2D9A0] via-[#F2E5C6] to-[#F2D9A0] hover:opacity-95 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-semibold"
                >
                  {isSaving ? (
                    <span>{t("address.savingAddress", "Saving Address...")}</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t("address.confirmUseThis", "Confirm & Use This Address")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: LOCATE ON MAP */}
          {mode === "LOCATE_MAP" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#560B18]/40 border border-[#F2D9A0]/20 text-xs text-[#F2E5C6]/90 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#F2D9A0] flex-shrink-0" />
                <span>
                  {t("address.mapHint", "Position the pin at your delivery doorstep or click the crosshair icon to use your GPS location.")}
                </span>
              </div>

              <GoogleMapPinPicker
                initialCoords={coords}
                onLocationChange={handleCoordsChange}
                height="280px"
              />

              <div className="p-3 rounded-xl bg-[#1B060F] border border-[#F2D9A0]/15 space-y-2">
                <div className="text-[11px] font-mono text-[#F2D9A0] uppercase">
                  {t("address.detectedLocation", "Detected Location")}
                </div>
                <div className="text-xs text-[#F2E5C6] font-medium">
                  {areaLocality || "Central Bengaluru"}, Bengaluru, Karnataka - {postalCode || "560001"}
                </div>
                <div className="text-[10px] font-mono text-[#F2E5C6]/50">
                  Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMode("ENTER_FORM")}
                className="w-full py-3 px-4 rounded-xl font-medium text-xs text-[#3B010B] bg-[#F2D9A0] hover:bg-[#F2E5C6] transition flex items-center justify-center gap-2 font-semibold cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{t("address.confirmPinAddDetails", "Confirm Pin & Add House/Flat Details")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
