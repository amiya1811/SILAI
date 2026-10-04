import {
  UserSession,
  Role,
  TailorProfile,
  MenuItem,
  Order,
  OrderStatus,
  DeliveryJob,
  DeliveryStatus,
  MeasurementProfile,
  DesignData,
  Offer,
  Review,
  AuditLog,
  PaymentRecord,
  CustomerProfile,
  DeliveryProfile,
} from "@/lib/types";
import {
  INITIAL_TAILORS,
  INITIAL_OFFERS,
  INITIAL_ORDERS,
  INITIAL_DELIVERY_JOBS,
  INITIAL_REVIEWS,
  INITIAL_MEASUREMENTS,
} from "./seed-data";
import { generateOrderNumber, generateDeliveryOtp } from "../utils";

// Demo users available for instant testing
export const DEMO_USERS: Record<string, { user: UserSession; passwordHash: string }> = {
  "priya@example.com": {
    user: {
      id: "cust-1",
      email: "priya@example.com",
      fullName: "Priya Sharma",
      role: "CUSTOMER",
      phone: "+91 98112 34567",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    // bcrypt hash for "Silai@2026"
    passwordHash: "$2a$10$wN9iLdG6aYqA1aV/uX50veV/5cEaZ5gQ67W7E2XgS7.0E9FqZ1r8e",
  },
  "meera@example.com": {
    user: {
      id: "tailor-1-user",
      email: "meera@example.com",
      fullName: "Meera Devi (Zari & Resham)",
      role: "TAILOR",
      phone: "+91 98765 43210",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    passwordHash: "$2a$10$wN9iLdG6aYqA1aV/uX50veV/5cEaZ5gQ67W7E2XgS7.0E9FqZ1r8e",
  },
  "rahul@example.com": {
    user: {
      id: "deliv-user-1",
      email: "rahul@example.com",
      fullName: "Rahul Verma (Delivery Partner)",
      role: "DELIVERY_PARTNER",
      phone: "+91 99887 76655",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    },
    passwordHash: "$2a$10$wN9iLdG6aYqA1aV/uX50veV/5cEaZ5gQ67W7E2XgS7.0E9FqZ1r8e",
  },
  "amiyaranjanpatra1811@gmail.com": {
    user: {
      id: "admin-1",
      email: "amiyaranjanpatra1811@gmail.com",
      fullName: "Amiya Admin (SILAI Platform)",
      role: "ADMIN",
      phone: "+91 99999 88888",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    },
    passwordHash: "$2a$10$wN9iLdG6aYqA1aV/uX50veV/5cEaZ5gQ67W7E2XgS7.0E9FqZ1r8e",
  },
};

// In-Memory Global State with persistence throughout the Node process
class SilaiDataStore {
  private tailors: TailorProfile[] = JSON.parse(JSON.stringify(INITIAL_TAILORS));
  private orders: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  private deliveries: DeliveryJob[] = JSON.parse(JSON.stringify(INITIAL_DELIVERY_JOBS));
  private offers: Offer[] = JSON.parse(JSON.stringify(INITIAL_OFFERS));
  private reviews: Review[] = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
  private measurements: MeasurementProfile[] = JSON.parse(JSON.stringify(INITIAL_MEASUREMENTS));
  private designs: DesignData[] = [];
  private payments: PaymentRecord[] = [];
  private auditLogs: AuditLog[] = [];
  private registeredUsers = new Map<string, { user: UserSession; passwordHash: string }>(
    Object.entries(DEMO_USERS)
  );

  private customerProfiles = new Map<string, CustomerProfile>([
    [
      "cust-user-1",
      {
        id: "cust-prof-1",
        userId: "cust-user-1",
        fullName: "Priya Sharma",
        email: "priya@example.com",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        address: "Flat 402, Royal Palms, Greater Kailash 1",
        city: "New Delhi",
        area: "Greater Kailash",
        postalCode: "110048",
        preferredLanguage: "Hindi, English",
        membershipTier: "SILAI_ROYAL",
        fitProfileChoice: "SAVED",
      },
    ],
  ]);

  private deliveryProfiles = new Map<string, DeliveryProfile>([
    [
      "deliv-user-1",
      {
        id: "deliv-prof-1",
        userId: "deliv-user-1",
        fullName: "Rahul Verma",
        email: "rahul@example.com",
        phone: "+91 99887 76655",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
        addressArea: "South Delhi Hub",
        vehicleType: "Two-Wheeler",
        vehicleDetails: "Honda Activa 6G (DL-3S-AB-1234)",
        isOnline: true,
        availability: "AVAILABLE",
        totalDeliveries: 142,
        rating: 4.9,
        earningsToday: 780,
        earningsTotal: 18450,
      },
    ],
  ]);

  // --- USER OPERATIONS ---
  public getUserByEmail(email: string) {
    return this.registeredUsers.get(email.toLowerCase().trim()) || null;
  }

  public registerUser(user: UserSession, passwordHash: string) {
    this.registeredUsers.set(user.email.toLowerCase().trim(), { user, passwordHash });
    this.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: "USER_REGISTERED",
      resource: "User",
      resourceId: user.id,
      details: { role: user.role, email: user.email },
    });
    return user;
  }

  // --- CUSTOMER PROFILE OPERATIONS ---
  public getCustomerProfile(userId: string): CustomerProfile {
    let prof = this.customerProfiles.get(userId);
    if (!prof) {
      prof = {
        id: `cust-prof-${Date.now()}`,
        userId,
        city: "New Delhi",
        preferredLanguage: "Hindi, English",
        membershipTier: "FREE",
      };
      this.customerProfiles.set(userId, prof);
    }
    return prof;
  }

  public updateCustomerProfile(userId: string, data: Partial<CustomerProfile>): CustomerProfile {
    const prof = this.getCustomerProfile(userId);
    Object.assign(prof, data);
    return prof;
  }

  // --- DELIVERY PROFILE OPERATIONS ---
  public getDeliveryProfile(userId: string): DeliveryProfile {
    let prof = this.deliveryProfiles.get(userId);
    if (!prof) {
      prof = {
        id: `deliv-prof-${Date.now()}`,
        userId,
        fullName: "Delivery Agent",
        phone: "+91 99000 11223",
        vehicleType: "Two-Wheeler",
        isOnline: true,
        totalDeliveries: 0,
        rating: 5.0,
        earningsToday: 0,
        earningsTotal: 0,
      };
      this.deliveryProfiles.set(userId, prof);
    }
    return prof;
  }

  public updateDeliveryProfile(userId: string, data: Partial<DeliveryProfile>): DeliveryProfile {
    const prof = this.getDeliveryProfile(userId);
    Object.assign(prof, data);
    return prof;
  }

  // --- TAILOR OPERATIONS ---
  public getTailors(): TailorProfile[] {
    return this.tailors;
  }

  public getTailorById(id: string): TailorProfile | null {
    return this.tailors.find((t) => t.id === id) || null;
  }

  public getTailorByUserId(userId: string): TailorProfile | null {
    // Check tailor-1 mapping to demo tailor
    if (userId === "tailor-1-user") return this.tailors[0];
    return this.tailors.find((t) => t.userId === userId) || null;
  }

  public updateTailorAvailability(tailorId: string, availability: "AVAILABLE" | "BUSY" | "NOT_ACCEPTING") {
    const tailor = this.getTailorById(tailorId);
    if (tailor) {
      tailor.availability = availability;
      return tailor;
    }
    return null;
  }

  public updateTailorProfile(tailorId: string, updates: Partial<TailorProfile>): TailorProfile | null {
    const tailor = this.getTailorById(tailorId);
    if (!tailor) return null;

    if (Array.isArray(updates.menuItems)) {
      tailor.menuItems = updates.menuItems.map((m, idx) => ({
        ...m,
        id: m.id || `menu-${tailor.id}-${Date.now()}-${idx}`,
        tailorId: tailor.id,
        isAvailable: m.isAvailable ?? true,
      }));
      delete (updates as any).menuItems;
    }

    Object.assign(tailor, updates);
    this.logAudit({
      action: "TAILOR_PROFILE_UPDATED",
      resource: "TailorProfile",
      resourceId: tailor.id,
      details: { businessName: tailor.businessName, shopType: tailor.shopType },
    });
    return tailor;
  }

  public addMenuItem(tailorId: string, item: Omit<MenuItem, "id" | "tailorId">): MenuItem | null {
    const tailor = this.getTailorById(tailorId);
    if (!tailor) return null;

    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tailorId,
    };
    tailor.menuItems.push(newItem);
    return newItem;
  }

  public updateMenuItem(tailorId: string, itemId: string, updates: Partial<MenuItem>): MenuItem | null {
    const tailor = this.getTailorById(tailorId);
    if (!tailor) return null;

    const index = tailor.menuItems.findIndex((m) => m.id === itemId);
    if (index === -1) return null;

    tailor.menuItems[index] = { ...tailor.menuItems[index], ...updates };
    return tailor.menuItems[index];
  }

  public deleteMenuItem(tailorId: string, itemId: string): boolean {
    const tailor = this.getTailorById(tailorId);
    if (!tailor) return false;

    const initialLen = tailor.menuItems.length;
    tailor.menuItems = tailor.menuItems.filter((m) => m.id !== itemId);
    return tailor.menuItems.length < initialLen;
  }

  // --- ORDER OPERATIONS ---
  public getOrders(filters?: { customerId?: string; tailorId?: string }): Order[] {
    let result = [...this.orders];
    if (filters?.customerId) {
      result = result.filter((o) => o.customerId === filters.customerId);
    }
    if (filters?.tailorId) {
      result = result.filter((o) => o.tailorId === filters.tailorId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | null {
    return this.orders.find((o) => o.id === id || o.orderNumber === id) || null;
  }

  public createOrder(data: {
    customerId: string;
    customerName: string;
    customerPhone?: string;
    tailorId: string;
    garmentName: string;
    garmentCategory: any;
    menuItemId?: string;
    pickupAddress: string;
    deliveryAddress: string;
    appliedCoupon?: string;
    measurementType: "SAVED" | "MANUAL" | "REFERENCE_GARMENT" | "DOORSTEP";
    measurements?: any;
    design?: any;
    isSilaiClubMember?: boolean;
  }): Order {
    const tailor = this.getTailorById(data.tailorId);
    if (!tailor) throw new Error("Tailor not found");

    // SERVER-SIDE PRICING CALCULATION - Never trust frontend price
    let basePrice = 850;
    if (data.menuItemId) {
      const menuItem = tailor.menuItems.find((m) => m.id === data.menuItemId);
      if (menuItem) basePrice = menuItem.basePrice;
    }

    const doorstepDeliveryFee = 100; // Standard doorstep logistics
    let discountAmount = 0;

    if (data.appliedCoupon) {
      const offer = this.getOfferByCode(data.appliedCoupon);
      if (offer && offer.isActive && basePrice >= offer.minOrderValue) {
        if (offer.discountType === "PERCENTAGE") {
          discountAmount = Math.min((basePrice * offer.discountValue) / 100, offer.maxDiscount || Infinity);
        } else {
          discountAmount = offer.discountValue;
        }
      }
    }

    const membershipDiscount = data.isSilaiClubMember ? 50 : 0;
    const taxableSubtotal = Math.max(0, basePrice - discountAmount - membershipDiscount);
    const taxAmount = Math.round(taxableSubtotal * 0.05); // 5% GST on custom apparel stitching
    const finalPayableAmount = taxableSubtotal + doorstepDeliveryFee + taxAmount;

    // Platform revenue (15% commission on stitching price)
    const platformCommission = Math.round(basePrice * tailor.commissionRate);
    const tailorEarnings = basePrice - platformCommission;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      tailorId: data.tailorId,
      tailorName: tailor.businessName,
      tailorAddress: tailor.address,
      garmentName: data.garmentName,
      garmentCategory: data.garmentCategory,
      status: "PENDING_PAYMENT",
      stitchingPrice: basePrice,
      doorstepDeliveryFee,
      discountAmount,
      membershipDiscount,
      taxAmount,
      finalPayableAmount,
      platformCommission,
      tailorEarnings,
      appliedCoupon: data.appliedCoupon,
      pickupAddress: data.pickupAddress,
      deliveryAddress: data.deliveryAddress,
      deliveryOtp: generateDeliveryOtp(),
      measurementType: data.measurementType,
      measurements: data.measurements,
      design: data.design,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);

    this.logAudit({
      userId: data.customerId,
      userName: data.customerName,
      action: "ORDER_CREATED",
      resource: "Order",
      resourceId: newOrder.id,
      details: { orderNumber: newOrder.orderNumber, finalAmount: finalPayableAmount },
    });

    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    extra?: { finishedGarmentPhoto?: string; correctionNotes?: string }
  ): Order | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (extra?.finishedGarmentPhoto) {
      order.finishedGarmentPhoto = extra.finishedGarmentPhoto;
    }
    if (extra?.correctionNotes) {
      order.correctionNotes = extra.correctionNotes;
    }

    // When order becomes PAID, automatically generate Fabric Pickup Delivery Job
    if (status === "PAID") {
      const deliveryJob: DeliveryJob = {
        id: `deliv-${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        garmentName: `${order.garmentName} (Fabric & Spec Pickup)`,
        type: "CUSTOMER_TO_TAILOR",
        status: "ASSIGNED",
        customerNameMasked: `${order.customerName.slice(0, 3)}•••`,
        pickupAddressMasked: order.pickupAddress.slice(0, 25) + "...",
        tailorName: order.tailorName,
        dropAddressMasked: order.tailorAddress.slice(0, 25) + "...",
        distanceKm: Math.round((2.5 + Math.random() * 5) * 10) / 10,
        payoutAmount: 90,
        deliveryOtpVerified: false,
        createdAt: new Date().toISOString(),
      };
      this.deliveries.unshift(deliveryJob);
    }

    // When order becomes READY, automatically generate Final Outfit Delivery Job
    if (status === "READY") {
      const deliveryJob: DeliveryJob = {
        id: `deliv-${Date.now()}-drop`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        garmentName: `${order.garmentName} (Finished Outfit)`,
        type: "TAILOR_TO_CUSTOMER",
        status: "ASSIGNED",
        customerNameMasked: `${order.customerName.slice(0, 3)}•••`,
        pickupAddressMasked: order.tailorAddress.slice(0, 25) + "...",
        tailorName: order.tailorName,
        dropAddressMasked: order.deliveryAddress.slice(0, 25) + "...",
        distanceKm: Math.round((2.5 + Math.random() * 5) * 10) / 10,
        payoutAmount: 95,
        deliveryOtpVerified: false,
        createdAt: new Date().toISOString(),
      };
      this.deliveries.unshift(deliveryJob);
    }

    this.logAudit({
      action: "ORDER_STATUS_UPDATED",
      resource: "Order",
      resourceId: order.id,
      details: { status, orderNumber: order.orderNumber },
    });

    return order;
  }

  // --- PAYMENT OPERATIONS ---
  public recordPayment(record: Omit<PaymentRecord, "id" | "createdAt">): PaymentRecord {
    const payment: PaymentRecord = {
      ...record,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.payments.push(payment);

    // If verified, mark order as PAID
    if (payment.status === "SUCCESS") {
      this.updateOrderStatus(payment.orderId, "PAID");
    }

    this.logAudit({
      action: "PAYMENT_RECORDED",
      resource: "Payment",
      resourceId: payment.id,
      details: {
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        razorpayPaymentId: payment.razorpayPaymentId,
      },
    });

    return payment;
  }

  // --- DELIVERY OPERATIONS ---
  public getDeliveryJobs(): DeliveryJob[] {
    return this.deliveries;
  }

  public getDeliveryJobById(id: string): DeliveryJob | null {
    return this.deliveries.find((d) => d.id === id) || null;
  }

  public updateDeliveryStatus(
    deliveryId: string,
    status: DeliveryStatus,
    driverId?: string
  ): DeliveryJob | null {
    const job = this.getDeliveryJobById(deliveryId);
    if (!job) return null;

    job.status = status;
    if (driverId) job.assignedDriverId = driverId;

    // Link back to Order status
    const order = this.getOrderById(job.orderId);
    if (order) {
      if (job.type === "CUSTOMER_TO_TAILOR") {
        if (status === "ACCEPTED") order.status = "PICKUP_SCHEDULED";
        if (status === "PICKED_UP") order.status = "PICKED_UP";
        if (status === "DELIVERED") order.status = "WITH_TAILOR";
      } else if (job.type === "TAILOR_TO_CUSTOMER") {
        if (status === "IN_TRANSIT" || status === "PICKED_UP") order.status = "OUT_FOR_DELIVERY";
        if (status === "DELIVERED") order.status = "DELIVERED";
      }
      order.updatedAt = new Date().toISOString();
    }

    return job;
  }

  public verifyDeliveryOtp(deliveryId: string, otp: string): { success: boolean; message: string } {
    const job = this.getDeliveryJobById(deliveryId);
    if (!job) return { success: false, message: "Delivery job not found" };

    const order = this.getOrderById(job.orderId);
    if (!order) return { success: false, message: "Associated order not found" };

    if (order.deliveryOtp !== otp.trim()) {
      return { success: false, message: "Invalid delivery OTP. Please verify with customer." };
    }

    job.deliveryOtpVerified = true;
    job.status = "DELIVERED";
    order.status = "DELIVERED";
    order.updatedAt = new Date().toISOString();

    this.logAudit({
      action: "DELIVERY_OTP_VERIFIED",
      resource: "Delivery",
      resourceId: job.id,
      details: { orderId: order.id, orderNumber: order.orderNumber },
    });

    return { success: true, message: "Delivery OTP verified and trip completed." };
  }

  public recordDeliveryPhotoVerification(
    deliveryId: string,
    params: {
      stage: "CUSTOMER_PICKUP" | "TAILOR_HANDOVER" | "FINISHED_PICKUP" | "FINAL_DELIVERY";
      photoUrl: string;
      packageCondition?: "Package OK" | "Visible Damage" | "Packaging Issue" | "Other";
      notes?: string;
      otp?: string;
    }
  ): { success: boolean; message: string; job: DeliveryJob | null } {
    const job = this.getDeliveryJobById(deliveryId);
    if (!job) return { success: false, message: "Delivery job not found", job: null };

    const order = this.getOrderById(job.orderId);
    const now = new Date().toISOString();

    if (params.stage === "CUSTOMER_PICKUP") {
      job.pickupPhotoUrl = params.photoUrl;
      job.packageCondition = params.packageCondition || "Package OK";
      job.pickupTimestamp = now;
      job.status = "PICKED_UP";
      if (order) {
        order.status = "PICKED_UP";
        order.updatedAt = now;
      }
    } else if (params.stage === "TAILOR_HANDOVER") {
      job.tailorHandoverPhotoUrl = params.photoUrl;
      job.tailorHandoverTimestamp = now;
      job.status = "DELIVERED"; // Handed over to tailor
      if (order) {
        order.status = "WITH_TAILOR";
        order.updatedAt = now;
      }
    } else if (params.stage === "FINISHED_PICKUP") {
      job.finishedPickupPhotoUrl = params.photoUrl;
      job.finishedPickupTimestamp = now;
      job.status = "IN_TRANSIT";
      if (order) {
        order.status = "OUT_FOR_DELIVERY";
        order.updatedAt = now;
      }
    } else if (params.stage === "FINAL_DELIVERY") {
      if (!params.otp || (order && order.deliveryOtp !== params.otp.trim())) {
        return { success: false, message: "Invalid customer delivery OTP.", job };
      }
      job.finalDeliveryPhotoUrl = params.photoUrl;
      job.finalDeliveryTimestamp = now;
      job.deliveryOtpVerified = true;
      job.customerConfirmationNotes = params.notes;
      job.status = "DELIVERED";
      if (order) {
        order.status = "DELIVERED";
        order.updatedAt = now;
      }
    }

    this.logAudit({
      action: `DELIVERY_${params.stage}_VERIFIED`,
      resource: "DeliveryJob",
      resourceId: job.id,
      details: { stage: params.stage, packageCondition: params.packageCondition },
    });

    return { success: true, message: `${params.stage.replace(/_/g, " ")} verified successfully.`, job };
  }

  public reportOrderIssue(orderId: string, issue: { reason: string; details: string }) {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    order.issueReport = {
      reason: issue.reason,
      details: issue.details,
      reportedAt: new Date().toISOString(),
    };
    order.updatedAt = new Date().toISOString();

    this.logAudit({
      action: "ORDER_ISSUE_REPORTED",
      resource: "Order",
      resourceId: order.id,
      details: { reason: issue.reason, orderNumber: order.orderNumber },
    });

    return order;
  }

  // --- MEASUREMENTS OPERATIONS ---
  public getMeasurements(customerId: string): MeasurementProfile[] {
    return this.measurements.filter((m) => m.customerId === customerId);
  }

  public saveMeasurement(data: Omit<MeasurementProfile, "id" | "createdAt">): MeasurementProfile {
    const profile: MeasurementProfile = {
      ...data,
      id: `meas-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.measurements.unshift(profile);
    return profile;
  }

  // --- OFFERS ---
  public getOffers(): Offer[] {
    return this.offers;
  }

  public getOfferByCode(code: string): Offer | null {
    return this.offers.find((o) => o.code.toUpperCase() === code.toUpperCase() && o.isActive) || null;
  }

  // --- REVIEWS ---
  public getReviewsByTailor(tailorId: string): Review[] {
    return this.reviews.filter((r) => r.tailorId === tailorId);
  }

  public addReview(reviewData: Omit<Review, "id" | "createdAt">): Review {
    const rev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(rev);
    return rev;
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs.slice(0, 50);
  }

  public logAudit(log: Omit<AuditLog, "id" | "createdAt">) {
    this.auditLogs.unshift({
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    });
  }
}

// Global Singleton to preserve data across HMR in development
const globalForSilai = globalThis as unknown as { silaiStore: SilaiDataStore | undefined };

export const store = globalForSilai.silaiStore ?? new SilaiDataStore();

if (process.env.NODE_ENV !== "production") {
  globalForSilai.silaiStore = store;
}
