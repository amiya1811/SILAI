export type TranslateFn = (key: string, fallback?: string) => string;

/**
 * Universal Order Status Translator
 */
export function translateOrderStatus(
  status: string | null | undefined,
  t: TranslateFn
): string {
  if (!status) return t("status.PENDING", "Pending");
  const key = `status.${status}`;
  const translated = t(key);
  if (translated && translated !== key) return translated;

  // Fallback map
  switch (status) {
    case "DRAFT":
      return t("status.DRAFT", "Draft");
    case "PENDING_PAYMENT":
      return t("status.PENDING_PAYMENT", "Waiting for Tailor Confirmation");
    case "PAID":
      return t("status.PAID", "Confirmed by Tailor");
    case "PICKUP_SCHEDULED":
      return t("status.PICKUP_SCHEDULED", "Pickup Scheduled");
    case "PICKED_UP":
      return t("status.PICKED_UP", "Fabric Picked Up");
    case "WITH_TAILOR":
      return t("status.WITH_TAILOR", "At Tailor Atelier");
    case "STITCHING":
      return t("status.STITCHING", "Stitching in Progress");
    case "READY":
      return t("status.READY", "Ready & Packed");
    case "OUT_FOR_DELIVERY":
      return t("status.OUT_FOR_DELIVERY", "Out for Delivery");
    case "DELIVERED":
      return t("status.DELIVERED", "Delivered");
    case "COMPLETED":
      return t("status.COMPLETED", "Completed");
    case "CANCELLED":
      return t("status.CANCELLED", "Cancelled");
    case "CORRECTION_REQUESTED":
      return t("status.CORRECTION_REQUESTED", "Alteration Requested");
    case "CORRECTION_PICKUP":
      return t("status.CORRECTION_PICKUP", "Alteration Pickup Scheduled");
    case "CORRECTION_WITH_TAILOR":
      return t("status.CORRECTION_WITH_TAILOR", "With Tailor for Alteration");
    case "CORRECTION_IN_PROGRESS":
      return t("status.CORRECTION_IN_PROGRESS", "Alteration in Progress");
    case "CORRECTION_RETURN_DELIVERY":
      return t("status.CORRECTION_RETURN_DELIVERY", "Alteration Out for Delivery");
    default:
      return status.replace(/_/g, " ");
  }
}

/**
 * Universal Delivery Status Translator
 */
export function translateDeliveryStatus(
  status: string | null | undefined,
  t: TranslateFn
): string {
  if (!status) return t("status.ASSIGNED", "Assigned");
  const key = `status.${status}`;
  const translated = t(key);
  if (translated && translated !== key) return translated;

  switch (status) {
    case "ASSIGNED":
      return t("status.ASSIGNED", "Assigned");
    case "ACCEPTED":
      return t("status.ACCEPTED", "Accepted");
    case "HEADING_TO_PICKUP":
      return t("status.HEADING_TO_PICKUP", "Heading to Pickup");
    case "PICKED_UP":
      return t("status.PICKED_UP", "Fabric Picked Up");
    case "IN_TRANSIT":
      return t("status.IN_TRANSIT", "In Transit");
    case "DELIVERED":
      return t("status.DELIVERED", "Delivered");
    case "FAILED":
      return t("status.FAILED", "Failed");
    default:
      return status.replace(/_/g, " ");
  }
}

/**
 * Universal Role Translator
 */
export function translateRole(
  role: string | null | undefined,
  t: TranslateFn
): string {
  if (!role) return "";
  switch (role) {
    case "CUSTOMER":
      return t("status.CUSTOMER", "Customer");
    case "TAILOR":
      return t("status.TAILOR", "Tailor");
    case "DELIVERY_PARTNER":
      return t("status.DELIVERY_PARTNER", "Delivery Partner");
    case "ADMIN":
      return t("status.ADMIN", "Administrator");
    default:
      return role.replace(/_/g, " ");
  }
}

/**
 * Universal Payment Method Translator
 */
export function translatePaymentMethod(
  method: string | null | undefined,
  t: TranslateFn
): string {
  if (!method) return "";
  switch (method) {
    case "COD":
      return t("checkout.cashOnDelivery", "Cash on Delivery");
    case "UPI":
      return t("checkout.upi", "UPI");
    case "CREDIT_CARD":
      return t("checkout.creditCard", "Credit Card");
    case "DEBIT_CARD":
      return t("checkout.debitCard", "Debit Card");
    default:
      return method.replace(/_/g, " ");
  }
}
