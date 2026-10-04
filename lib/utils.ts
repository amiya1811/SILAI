import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount?: number | null): string {
  const validAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(validAmount);
}

export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString?: string | Date | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateOrderNumber(): string {
  const prefix = "SIL";
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${rand}`;
}

export function generateDeliveryOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function getStatusBadge(status?: string | null) {
  if (!status) {
    return { label: "Pending", bg: "bg-amber-900/30 text-amber-300 border-amber-700/50" };
  }
  switch (status) {
    case "PENDING_PAYMENT":
      return { label: "Waiting for Tailor Confirmation", bg: "bg-amber-900/30 text-amber-300 border-amber-700/50" };
    case "CANCELLED":
      return { label: "Cancelled", bg: "bg-rose-900/40 text-rose-300 border-rose-700/50" };
    case "PAID":
      return { label: "Paid", bg: "bg-emerald-900/30 text-emerald-300 border-emerald-700/50" };
    case "PICKUP_SCHEDULED":
      return { label: "Pickup Scheduled", bg: "bg-blue-900/30 text-blue-300 border-blue-700/50" };
    case "PICKED_UP":
      return { label: "Fabric Picked Up", bg: "bg-indigo-900/30 text-indigo-300 border-indigo-700/50" };
    case "WITH_TAILOR":
      return { label: "With Tailor", bg: "bg-purple-900/30 text-purple-300 border-purple-700/50" };
    case "STITCHING":
      return { label: "In Stitching", bg: "bg-burgundy/40 text-sand-light border-burgundy/60" };
    case "READY":
      return { label: "Ready & Packed", bg: "bg-teal-900/30 text-teal-300 border-teal-700/50" };
    case "OUT_FOR_DELIVERY":
      return { label: "Out For Delivery", bg: "bg-amber-800/40 text-sand border-amber-600/50" };
    case "DELIVERED":
    case "COMPLETED":
      return { label: "Delivered", bg: "bg-emerald-900/40 text-emerald-300 border-emerald-600/60" };
    case "CORRECTION_REQUESTED":
    case "CORRECTION_IN_PROGRESS":
      return { label: "Correction in Progress", bg: "bg-rose-900/40 text-rose-300 border-rose-700/50" };
    default:
      return { label: status.replace(/_/g, " "), bg: "bg-wine-light/50 text-champagne border-wine" };
  }
}
