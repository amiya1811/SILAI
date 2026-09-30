import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "TAILOR", "DELIVERY_PARTNER"]).default("CUSTOMER"),
});

export const CreateOrderSchema = z.object({
  tailorId: z.string().min(1, "Tailor is required"),
  garmentName: z.string().min(1, "Garment name is required"),
  garmentCategory: z.enum(["BLOUSE", "KURTI", "SUIT", "LEHENGA", "SHIRT", "PANTS", "ALTERATIONS"]),
  menuItemId: z.string().optional(),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  appliedCoupon: z.string().optional(),
  measurementType: z.enum(["SAVED", "REFERENCE_GARMENT", "DOORSTEP"]),
  measurements: z.record(z.any()).optional(),
  design: z.record(z.any()).optional(),
  isSilaiClubMember: z.boolean().optional(),
});

export const VerifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Signature is required"),
});

export const MenuItemSchema = z.object({
  category: z.enum(["BLOUSE", "KURTI", "SUIT", "LEHENGA", "SHIRT", "PANTS", "ALTERATIONS"]),
  name: z.string().min(2, "Service name required"),
  description: z.string().optional(),
  basePrice: z.number().positive("Price must be greater than 0"),
  estimatedDays: z.number().int().min(1).max(30),
  complexity: z.enum(["SIMPLE", "REGULAR", "DESIGNER", "HEAVY_BRIDAL"]),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
});

export const MeasurementProfileSchema = z.object({
  profileName: z.string().min(2, "Profile name required"),
  garmentType: z.enum(["BLOUSE", "KURTI", "SUIT", "LEHENGA", "SHIRT", "PANTS", "ALTERATIONS"]),
  type: z.enum(["SAVED", "GUIDED", "REFERENCE_GARMENT", "DOORSTEP"]).default("SAVED"),
  measurements: z.record(z.any()),
  isDefault: z.boolean().optional(),
});

export const DeliveryOtpSchema = z.object({
  deliveryId: z.string().min(1, "Delivery ID is required"),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

export const ReviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  rating: z.number().min(1).max(5),
  fitRating: z.number().min(1).max(5).default(5),
  comment: z.string().min(3, "Review comment required"),
});
