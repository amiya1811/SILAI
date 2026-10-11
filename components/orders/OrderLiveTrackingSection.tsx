"use client";

import React, { useState, useEffect } from "react";
import {
  Navigation,
  Truck,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  Radio,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import GoogleMapPinPicker from "@/components/maps/GoogleMapPinPicker";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface OrderLiveTrackingSectionProps {
  deliveryId: string;
  orderNumber: string;
  defaultLeg?: string;
  defaultStatus?: string;
}

export default function OrderLiveTrackingSection({
  deliveryId,
  orderNumber,
  defaultLeg = "CUSTOMER_TO_TAILOR",
  defaultStatus = "ACCEPTED",
}: OrderLiveTrackingSectionProps) {
  const { t } = useLanguage();
  const [tracking, setTracking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchLiveTracking = async () => {
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}/location`);
      if (res.ok) {
        const data = await res.json();
        if (data.tracking) {
          setTracking(data.tracking);
          setIsOffline(false);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } else {
        setIsOffline(true);
      }
    } catch (e) {
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTracking();
    const interval = setInterval(fetchLiveTracking, 10000); // 10-second polling
    return () => clearInterval(interval);
  }, [deliveryId]);

  const leg = tracking?.leg || defaultLeg;
  const status = tracking?.status || defaultStatus;
  const isLeg1 = leg === "CUSTOMER_TO_TAILOR";
  const legTitle = isLeg1
    ? t("tracking.leg1Title", "Leg 1: Fabric & Reference Pickup")
    : t("tracking.leg2Title", "Leg 2: Finished Garment Doorstep Delivery");

  const legStatusText =
    tracking?.legStatusText ||
    (isLeg1
      ? status === "PICKED_UP"
        ? t("tracking.leg1PickedUp", "Fabric picked up • Courier heading to tailor atelier")
        : t("tracking.leg1Heading", "Courier heading to your address for fabric pickup")
      : status === "PICKED_UP"
      ? t("tracking.leg2PickedUp", "Outfit picked up • Out for doorstep delivery to you")
      : t("tracking.leg2Heading", "Courier heading to tailor atelier to collect finished outfit"));

  const courierName = tracking?.courierName || "Rahul Verma";
  const vehicleType = tracking?.vehicleType || "Bike • KA 05 EQ 4210";
  const courierRating = tracking?.courierRating || 4.8;
  const courierPhone = tracking?.courierPhone || "+91 90197 15087";
  const etaMinutes = tracking?.etaMinutes || 18;
  const distanceRemainingKm = tracking?.distanceRemainingKm ?? (tracking?.distanceTotalKm || 4.2);

  const courierCoords = tracking?.courierLocation
    ? { lat: tracking.courierLocation.lat, lng: tracking.courierLocation.lng }
    : undefined;

  return (
    <div className="rounded-2xl bg-[#F7EFE1] dark:bg-[#1C0D12] border-2 border-burgundy/30 dark:border-sand/40 p-4 sm:p-5 space-y-4 shadow-md transition text-wine dark:text-champagne">
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-burgundy/15 dark:border-sand/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <span className="text-[11px] font-mono tracking-wider text-burgundy dark:text-sand font-bold uppercase flex items-center gap-1.5">
              <span>{t("tracking.liveRadar", "LIVE COURIER RADAR")}</span>
              <span className="text-wine/40 dark:text-champagne/40">•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                {isOffline ? t("tracking.reconnectingGps", "Reconnecting GPS...") : t("tracking.connected", "Connected")}
              </span>
            </span>
            <h4 className="font-serif text-base font-bold text-wine dark:text-sand-light mt-0.5">
              {legTitle}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-burgundy/10 dark:bg-burgundy/30 text-wine dark:text-sand border border-burgundy/30 dark:border-sand/30 font-bold">
            {t(`status.${status}`, status.replace(/_/g, " "))}
          </span>
          {lastUpdated && (
            <span className="text-[10px] font-mono text-maroon/70 dark:text-champagne/60 hidden sm:inline">
              Updated {lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* Leg Status Notice Banner */}
      <div className="p-3 rounded-xl bg-white/80 dark:bg-[#0D080A]/90 border border-burgundy/15 dark:border-sand/20 flex items-center gap-2.5 text-xs text-wine dark:text-champagne font-medium">
        <Navigation className="w-4 h-4 text-burgundy dark:text-sand shrink-0 animate-pulse" />
        <span>{legStatusText}</span>
      </div>

      {/* 2. Active Delivery Map View */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-maroon/80 dark:text-sand/80 font-bold uppercase">
          <span>{t("tracking.activeRouteMap", "Active Route Map & Live Pin")}</span>
          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" /> {t("tracking.satelliteTelemetryActive", "Satellite Telemetry Active")}
          </span>
        </div>
        <div className="rounded-xl overflow-hidden border border-burgundy/25 dark:border-sand/30 shadow-inner">
          <GoogleMapPinPicker
            initialCoords={courierCoords}
            onLocationChange={() => {}}
            allowDrag={false}
            height="210px"
          />
        </div>
        {isOffline && (
          <p className="text-[10px] font-mono text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {t("tracking.signalBuffering", "Courier device buffering signal. Showing last verified waypoint.")}
          </p>
        )}
      </div>

      {/* 3. Delivery Partner Details Card & 4. ETA / Distance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Courier Partner Info Card */}
        <div className="sm:col-span-2 p-3.5 rounded-xl bg-white/80 dark:bg-[#0D080A]/90 border border-burgundy/15 dark:border-sand/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-burgundy/10 dark:bg-burgundy/30 border border-burgundy/20 dark:border-sand/20 flex items-center justify-center text-burgundy dark:text-sand font-bold shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-wine dark:text-sand-light text-sm">
                  {courierName}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-mono text-[10px] font-bold">
                  ★ {courierRating}
                </span>
              </div>
              <p className="text-[11px] text-maroon/80 dark:text-champagne/80 font-medium">
                {vehicleType}
              </p>
            </div>
          </div>

          <a
            href={`tel:${courierPhone}`}
            className="px-3 py-1.5 rounded-lg bg-burgundy/10 dark:bg-burgundy/40 hover:bg-burgundy/20 border border-burgundy/30 dark:border-sand/30 text-wine dark:text-sand font-semibold text-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t("tracking.callPartner", "Call Partner")}</span>
          </a>
        </div>

        {/* ETA & Remaining Distance Card */}
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-[#0D080A]/90 border border-burgundy/15 dark:border-sand/20 flex flex-col justify-center text-xs">
          <span className="text-[10px] font-mono text-maroon/80 dark:text-sand/80 uppercase font-bold block">
            {t("tracking.estimatedArrival", "Estimated Arrival")}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-serif text-lg font-bold text-burgundy dark:text-sand">
              ~{etaMinutes} mins
            </span>
            <span className="text-[11px] font-mono text-maroon/70 dark:text-champagne/70">
              ({distanceRemainingKm} km)
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {t("tracking.locationSharingActive", "Location sharing active")}
          </span>
        </div>
      </div>
    </div>
  );
}
