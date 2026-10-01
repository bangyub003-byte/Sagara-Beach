export type UserRole = 'customer' | 'admin' | 'receptionist';

export type Language = 'id' | 'en';

export type BookingStatus =
  | 'pending_verification'
  | 'approved'
  | 'verified'
  | 'ready_checkin'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface RoomType {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  pricePerNight: number; // in IDR
  usdPricePerNight: number; // in USD
  capacityGuests: number;
  bedsCount: number;
  bathsCount: number;
  areaSqft: number;
  isAvailable: boolean;
  image: string;
  features: string[];
  featuresEn: string[];
  minRooms?: number;
  extraBedPrice?: number;
  maxExtraBeds?: number;
  bedInfo?: string;
  packageType?: 'per_kamar' | 'full_homestay';
  blockedDates?: string[]; // YYYY-MM-DD
  pricePerPersonNight?: number; // e.g. Rp75.000 for Sundak
  minGuests?: number; // e.g. 4 for Sundak
  floor?: 1 | 2; // Lantai 1 atau Lantai 2
  stockRooms?: number; // Jumlah unit kamar / stok tersedia
  gallery?: string[]; // Galeri foto kamar
}

export interface Property {
  id: string;
  name: string;
  tagline: string;
  taglineEn: string;
  category: 'Homestay' | 'Villa' | 'Pavilion' | string;
  location: string;
  fullAddress: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  badgeEn?: string;
  propertyType?: 'full_homestay' | 'individual_rooms';
  image: string;
  gallery: string[];
  description: string;
  descriptionEn: string;
  concept?: string;
  conceptEn?: string;
  highlights: string[];
  highlightsEn: string[];
  roomTypes: RoomType[];
  whatsappContact?: string;
  extraServices?: string[];
  blockedDates?: string[];
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  roomTypeId: string;
  roomTypeName: string;
  propertyImage: string;
  location: string;
  guestName: string;
  guestPhone: string;
  guestNik: string; // Indonesian NIK
  ktpImageUrl: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  guestsCount: number;
  roomsCount?: number;
  extraBedsCount?: number;
  extraBedsCost?: number;
  baseRoomCost?: number;
  totalAmount: number;
  // Detail Wajib Pemesan Homestay Keluarga:
  asalKota?: string;
  budgetPlan?: string;
  adultMalesCount?: number;
  adultFemalesCount?: number;
  childrenCount?: number;
  toddlerCount?: number;
  guestRelationship?: string;
  roomChoiceDetail?: string;
  vehicleDetail?: string;
  referralSource?: string;
  withWhom?: string;
  mahromConfirmed?: boolean;
  dpAmount?: number;
  dpPercentage?: number;
  remainingBalance?: number;
  paymentType?: 'dp_30' | 'dp_50' | 'full_100';
  paymentProofUrl: string;
  paymentMethod: 'bca_va' | 'mandiri_va' | 'qris' | 'credit_card';
  status: BookingStatus;
  createdAt: string;
  verifiedAt?: string;
  checkedInAt?: string;
  adminNotes?: string;
  rejectionReason?: string;
  qrCodeData?: string;
  signature?: string;
}

export interface GasIntegrationConfig {
  webAppUrl: string;
  spreadsheetId: string;
  driveFolderId: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export type {
  TB_Homepage_Content,
  TB_Homestay,
  TB_Room,
  TB_Media,
  TB_Website_Settings,
  TB_User,
  TB_Activity_Log,
  TB_Booking,
  TB_Payment,
  TB_Blocked_Date,
} from '../db/cmsDatabase';
