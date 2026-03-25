export type LocaleCode = "en" | "lg";
export type LaunchZoneId = "namilyango" | "gwafu" | "njerere";
export type PaymentProvider = "mtn" | "airtel";
export type PaymentStatus = "pending" | "confirmed" | "failed";
export type OrderStatus = "Received" | "Preparing" | "Out for Delivery" | "Delivered";

export interface MapPin {
  lat: number;
  lng: number;
  zoneId?: LaunchZoneId | null;
  confirmedAt?: string;
}

export interface LaunchZone {
  id: LaunchZoneId;
  name: string;
  slug: string;
  description: string;
  center: MapPin;
  coverageKm: number;
  accent: string;
}

export interface SupplierCard {
  id: string;
  slug: string;
  name: string;
  area: LaunchZoneId;
  tagline: string;
  etaMinutes: number;
  verified: boolean;
  rating: number;
  categories: string[];
  hero: string;
  accent: string;
  minBasketUgx: number;
  distanceKm: number;
  open: boolean;
  pickupPartner: string;
}

export interface Product {
  id: string;
  supplierId: string;
  category: string;
  name: string;
  description: string;
  unitLabel: string;
  priceUgx: number;
  image: string;
  popular?: boolean;
}

export interface SupplierStorefront extends SupplierCard {
  story: string;
  prepWindow: string;
  badges: string[];
  products: Product[];
}

export interface CartLine {
  productId: string;
  supplierId: string;
  name: string;
  unitLabel: string;
  priceUgx: number;
  quantity: number;
  image: string;
}

export interface DeliveryQuote {
  distanceKm: number;
  deliveryFeeUgx: number;
  platformFeeUgx: number;
  subtotalUgx: number;
  totalUgx: number;
  serviceable: boolean;
  zoneName: string;
  reasons?: string[];
}

export interface CheckoutCustomer {
  fullName: string;
  phone: string;
  landmark: string;
  areaHint: string;
  notes: string;
  pin: MapPin | null;
  locale: LocaleCode;
}

export interface OtpStartResponse {
  phone: string;
  sessionId: string;
  expiresAt: string;
  devCode?: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
  token: string;
  customer: {
    fullName: string;
    phone: string;
  };
}

export interface CheckoutSession {
  orderId: string;
  paymentProvider: PaymentProvider;
  paymentReference: string;
  paymentStatus: PaymentStatus;
  nextStepTitle: string;
  nextStepBody: string;
  amountUgx: number;
}

export interface OrderSummary {
  orderId: string;
  supplierName: string;
  items: CartLine[];
  status: OrderStatus;
  paymentProvider: PaymentProvider;
  paymentReference: string;
  paymentStatus: PaymentStatus;
  timeline: Array<{ label: OrderStatus; complete: boolean }>;
  quote: DeliveryQuote;
  customer: CheckoutCustomer;
  createdAt: string;
  totalUgx: number;
}

export interface MarketplaceResponse {
  launchZones: LaunchZone[];
  suppliers: SupplierCard[];
  featuredMessage: string;
  platformFeeUgx: number;
}

