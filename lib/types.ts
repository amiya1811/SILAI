// ========================================================
// SILAI - TypeScript Domain Types & Interfaces
// ========================================================

export type Role = "CUSTOMER" | "TAILOR" | "DELIVERY_PARTNER" | "ADMIN";

export type TailorAvailability = "AVAILABLE" | "BUSY" | "NOT_ACCEPTING";

export type OrderStatus =
  | "DRAFT"
  | "PENDING_PAYMENT"
  | "PAID"
  | "PICKUP_SCHEDULED"
  | "PICKED_UP"
  | "WITH_TAILOR"
  | "STITCHING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CORRECTION_REQUESTED"
  | "CORRECTION_PICKUP"
  | "CORRECTION_WITH_TAILOR"
  | "CORRECTION_IN_PROGRESS"
  | "CORRECTION_RETURN_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type DeliveryStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "HEADING_TO_PICKUP"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED";

export type DeliveryType =
  | "CUSTOMER_TO_TAILOR"
  | "TAILOR_TO_CUSTOMER"
  | "CORRECTION_PICKUP"
  | "CORRECTION_RETURN";

export type ComplexityLevel = "SIMPLE" | "REGULAR" | "DESIGNER" | "HEAVY_BRIDAL";

export type GarmentCategory =
  | "BLOUSE"
  | "KURTI"
  | "SUIT"
  | "LEHENGA"
  | "SHIRT"
  | "PANTS"
  | "ALTERATIONS";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
}

export interface MenuItem {
  id: string;
  tailorId: string;
  category: GarmentCategory;
  name: string;
  description?: string;
  basePrice: number;
  estimatedDays: number;
  complexity: ComplexityLevel;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface TailorPortfolioItem {
  id: string;
  tailorId: string;
  title: string;
  description?: string;
  garmentCategory: string;
  imageUrl: string;
  tags?: string[];
}

export interface TailorProfile {
  id: string;
  userId: string;
  businessName: string;
  tagline?: string;
  bio?: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  city: string;
  address: string;
  distanceKm?: number;
  availability: TailorAvailability;
  specializations: string[];
  avgStitchingDays: number;
  isVerified: boolean;
  commissionRate: number; // e.g., 0.15 for 15%
  coverImageUrl?: string;
  avatarUrl?: string;
  menuItems: MenuItem[];
  portfolios: TailorPortfolioItem[];
}

export interface CustomerProfile {
  id: string;
  userId: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  preferredLanguage: string;
  membershipTier: "FREE" | "SILAI_CLUB" | "SILAI_ROYAL";
}

export interface DeliveryProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  vehicleType: string;
  isOnline: boolean;
  totalDeliveries: number;
  rating: number;
  earningsToday: number;
  earningsTotal: number;
}

export interface MeasurementData {
  // Blouse
  bust?: number;
  underbust?: number;
  waist?: number;
  shoulder?: number;
  armhole?: number;
  sleeveLength?: number;
  bicep?: number;
  frontNeckDepth?: number;
  backNeckDepth?: number;
  blouseLength?: number;
  
  // Kurti / Dress
  chest?: number;
  hip?: number;
  kurtiLength?: number;
  slitCut?: number;
  
  // Pants / Salwar / Trousers
  pantLength?: number;
  thigh?: number;
  crotchDepth?: number;
  bottomHem?: number;

  // General notes
  fitStyle?: "SLIM" | "COMFORT" | "REGULAR" | "RELAXED";
  specialNotes?: string;
}

export interface MeasurementProfile {
  id: string;
  customerId: string;
  profileName: string;
  garmentType: GarmentCategory;
  type: "SAVED" | "GUIDED" | "REFERENCE_GARMENT" | "DOORSTEP";
  measurements: MeasurementData;
  isDefault?: boolean;
  createdAt: string;
}

export interface DesignData {
  id: string;
  customerId: string;
  title: string;
  garmentType: GarmentCategory;
  referenceImageUrl: string;
  neckline?: string;
  sleeveStyle?: string;
  lengthPreference?: string;
  embroideryDetails?: string;
  pocketPreference?: string;
  fitPreference?: string;
  specialInstructions?: string;
  aiPreviewConfig?: {
    sleeveLength: string;
    neckline: string;
    garmentLength: string;
    colorHex: string;
    fabricPattern: string;
  };
  createdAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId?: string;
  garmentName: string;
  complexity: ComplexityLevel;
  unitPrice: number;
  quantity: number;
  customNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  tailorId: string;
  tailorName: string;
  tailorAddress: string;
  garmentName: string;
  garmentCategory: GarmentCategory;
  design?: DesignData;
  measurements?: MeasurementData;
  measurementType: "SAVED" | "REFERENCE_GARMENT" | "DOORSTEP";
  
  status: OrderStatus;
  
  // Server-computed financial breakdown
  stitchingPrice: number;
  doorstepDeliveryFee: number;
  discountAmount: number;
  membershipDiscount: number;
  taxAmount: number;
  finalPayableAmount: number;
  platformCommission: number;
  tailorEarnings: number;

  appliedCoupon?: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupScheduledAt?: string;
  expectedDeliveryDate?: string;
  deliveryOtp: string;
  correctionNotes?: string;
  finishedGarmentPhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface DeliveryJob {
  id: string;
  orderId: string;
  orderNumber: string;
  garmentName: string;
  type: DeliveryType;
  status: DeliveryStatus;
  pickupAddressMasked: string;
  dropAddressMasked: string;
  customerNameMasked: string;
  tailorName: string;
  distanceKm: number;
  payoutAmount: number;
  deliveryOtpVerified: boolean;
  assignedDriverId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  tailorId: string;
  rating: number;
  fitRating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  tailorId?: string;
  validUntil: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "ORDER_STATUS" | "PAYMENT" | "DELIVERY" | "SYSTEM";
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}
