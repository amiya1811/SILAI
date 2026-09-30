# SILAI — Custom Made. Delivered Home.

> **SILAI** is a full-stack bespoke tailoring marketplace connecting customers, certified master karigars / boutiques, and doorstep logistics fleet partners across India. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL database architecture, and Razorpay payment integration with server-side signature verification.

---

## 🌟 Visual Identity & Brand Palette

SILAI is designed around an editorial, cinematic Indian aesthetic:

| Color Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Champagne Beige** | `#F2E5C6` | Primary soft contrast backgrounds & elegant borders |
| **Sand Gold** | `#F2D9A0` | Metallic accents, gold badges & highlights |
| **Burgundy** | `#75162D` | Primary CTA buttons, badges & glowing borders |
| **Dark Maroon** | `#560B18` | Luxury gradient mid-tones & card containers |
| **Deep Wine** | `#3B010B` | Deep atmospheric base canvas & shadows |

---

## 🚀 Key Architecture & Features

### 1. Multi-Role Ecosystem & Role-Based Access Control (RBAC)
- **Customer**:
  - Discover vetted tailors by location, rating, price, and turnaround speed.
  - Browse transparent digital menus with simple, designer, and heavy bridal options.
  - **AI Virtual Try-On Studio**: Interactive 2D silhouette preview for blouse necklines, sleeve cuts, and brocade fabrics.
  - **Fit Vault**: Encrypted measurement storage (Blouse, Kurti, Salwar, Bespoke Shirt, Trousers), sample garment pickup, or doorstep measuring master booking.
  - **Live Order Timeline**: Real-time stage tracking (Paid → Pickup Scheduled → Fabric Picked Up → With Tailor → In Stitching → Quality Ready → Out For Delivery → Delivered).
  - **100% Fit Guarantee Workflow**: Free doorstep alteration pickup if fitting requires adjustment.
- **Tailor / Boutique Partner**:
  - **Digital Menu Builder**: Add/edit/delete stitching services, base prices, complexity tiers, and estimated days.
  - **Live Availability Toggle**: `AVAILABLE`, `BUSY` (High demand), or `NOT_ACCEPTING`.
  - **Order Queue & Karigari Management**: Accept orders, advance stitching states, and upload finished outfit photos for customer inspection.
  - **Earnings Dashboard**: Transparent breakdown of Gross Order Value, SILAI Platform Contribution (15%), Net Tailor Earnings, Pending Payout, and Completed Payouts.
- **Delivery Fleet Partner**:
  - Dedicated mobile-first dashboard.
  - Accepts fabric pickup (Customer → Tailor) and finished outfit delivery (Tailor → Customer).
  - **Privacy Masking**: Customer and tailor phone numbers and exact internal details are masked.
  - **Secure OTP Delivery**: 4-digit customer OTP required to complete delivery and release driver payout.
- **Platform Admin**:
  - Global overview of Gross Merchandise Value (GMV), 15% platform contribution, active commissions, and KYC verified ateliers.
  - Immutable Security Audit Logs for all financial and operational events.

---

### 2. Payment Architecture & Razorpay Security
- **Strict Server-Side Price Calculation**: All stitching prices, discounts, GST, and logistics margins are calculated on the backend from database records. Never trusts client-submitted values.
- **HMAC SHA-256 Signature Verification**: Cryptographic verification ensures that payment confirmations cannot be spoofed by client-side responses.
- **Webhook Signature Protection**: Real-time webhook processing with `x-razorpay-signature` verification.
- **Idempotency & Duplicate Prevention**: Prevents double-charging or repeated workflow triggers.
- **Zero Card Data Storage**: Complies with PCI-DSS guidelines.

---

## 📁 Folder Structure

```
SILAI/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── metrics/route.ts
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── switch-demo/route.ts
│   │   ├── deliveries/
│   │   │   ├── route.ts
│   │   │   └── [id]/action/route.ts
│   │   ├── measurements/route.ts
│   │   ├── offers/validate/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── correction/route.ts
│   │   ├── payments/
│   │   │   ├── create/route.ts
│   │   │   ├── verify/route.ts
│   │   │   └── webhook/route.ts
│   │   └── tailors/
│   │       ├── route.ts
│   │       └── [id]/
│   │           ├── route.ts
│   │           └── menu/route.ts
│   ├── admin/page.tsx             # Admin Governance Console
│   ├── dashboard/page.tsx         # Customer Concierge Dashboard
│   ├── delivery-partner/page.tsx  # Delivery Fleet Hub
│   ├── explore/page.tsx           # Tailors Discovery Marketplace
│   ├── fit-profile/page.tsx       # Anatomical Fit Vault
│   ├── orders/page.tsx            # Live Orders & Alterations
│   ├── tailor-studio/page.tsx     # Tailor Partner Studio
│   ├── tailors/[id]/page.tsx      # Tailor Digital Menu & Booking
│   ├── try-on/page.tsx            # AI Virtual Try-On Studio
│   ├── globals.css                # Royal Brand CSS & Luxury Theme
│   ├── layout.tsx                 # Root Layout with Nav & Footer
│   └── page.tsx                   # Cinematic Landing Page
├── components/
│   ├── auth/                      # AuthModal & Session Handlers
│   ├── checkout/                  # Razorpay Checkout Modal
│   ├── orders/                    # OrderTimeline & Stage Tracker
│   ├── tailors/                   # TailorCard, FilterBar, Booking Wizard
│   ├── try-on/                    # VirtualTryOnStudio Canvas
│   └── ui/                        # Navbar, Footer
├── lib/
│   ├── auth/                      # JWT, Hash, Cookies & Guards
│   ├── db/                        # Data Store, Prisma & Seed Data
│   ├── payment/                   # Razorpay API & Signature Verifier
│   ├── validations/               # Zod Schemas
│   ├── types.ts                   # Domain Types
│   └── utils.ts                   # INR Formatter, Order Generator
├── prisma/
│   └── schema.prisma              # Production PostgreSQL Schema
├── public/
│   └── silai-logo.jpeg            # Official Brand Logo
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment variables:
```env
# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/silai_db?schema=public"

# Auth Secret (32+ character random string)
AUTH_SECRET="silai_super_secret_jwt_key_2026"

# Razorpay Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_silai_demo"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Configured Demo Accounts

For instant evaluation, SILAI includes a **1-Click Demo Switcher** bar at the top of every screen:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Customer** | Priya Sharma | `priya@example.com` | `Silai@2026` |
| **Tailor** | Meera Devi (Zari & Resham) | `meera@example.com` | `Silai@2026` |
| **Delivery Partner** | Rahul Verma | `rahul@example.com` | `Silai@2026` |
| **Platform Admin** | Amiya Admin | `admin@silai.luxury` | `Silai@2026` |

---

## 🛡️ Security Architecture

1. **Authentication**: Secure JWT tokens stored in HTTP-Only, SameSite cookies.
2. **Authorization**: Server-side Role-Based Access Control (`requireAuth`, `requireRole`) on every endpoint.
3. **Data Isolation**: Customers can only view their own measurements and orders; tailors can only manage their own menu and assigned orders.
4. **Payment Integrity**: Cryptographic HMAC SHA-256 signature verification ensures payments are authentic.
5. **Masked Delivery**: Delivery partners see only necessary routing info with delivery confirmation OTP.
6. **Input Validation**: Strict Zod schemas sanitize all requests.
