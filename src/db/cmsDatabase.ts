/**
 * DATABASE & CMS STORAGE ENGINE - GRIYA BAROKAH HOMESTAY
 *
 * Struktur Tabel Database:
 * 1. TB_Homepage_Content  (Hero banner, judul, subjudul, deskripsi, CTA)
 * 2. TB_Homestay          (Data penginapan Sundak & Trenggole, lokasi, konsep, rating, kontak)
 * 3. TB_Room              (Data kamar, foto utama, galeri, harga, kapasitas, stok unit, status)
 * 4. TB_Media             (Media manager - URL permanen, nama file, tanggal upload)
 * 5. TB_Website_Settings  (Brand navbar, logo, kontak WA, jam check-in/out, syarat booking)
 * 6. TB_User              (Akun pengguna: Role Admin & Resepsionis)
 * 7. TB_Activity_Log      (Log aktivitas audit perubahan admin secara kronologis)
 *
 * Catatan Sistem Gambar:
 * - Tidak menyimpan gambar sebagai DataURL base64 di localStorage.
 * - Menggunakan storage gambar dengan URL permanen publik (/images/...).
 * - Database hanya menyimpan URL gambar yang valid dan ringan.
 * - Kompatibel 100% Android Chrome, Safari iPhone, dan Vercel.
 */

import { compressImageFile, uploadImageToSupabaseStorage } from '../utils/imageHelper';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// ==============================================================
// 1. DEFINISI TIPE & INTERFACE TABEL
// ==============================================================

export interface TB_Homepage_Content {
  id: string;
  hero_image: string; // URL permanen
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  cta_text: string;
  cta_link: string;
  location_badge: string;
}

export interface TB_Homestay {
  id: string;
  nama: string;
  lokasi: string;
  full_address: string;
  foto_utama: string; // URL permanen
  galeri: string[]; // Daftar URL permanen
  deskripsi: string;
  konsep: string; // Deskripsi konsep (Full House / Kamar Individual)
  harga: number;
  harga_label: string;
  kapasitas: number;
  min_booking: number;
  fasilitas: string[];
  peraturan: string[];
  status: 'aktif' | 'nonaktif';
  rating: number;
  reviews_count: number;
  badge: string;
  property_type: 'full_homestay' | 'individual_rooms';
  whatsapp_contact: string;
}

export interface TB_Room {
  id: string;
  homestay_id: string; // Relasi ke TB_Homestay.id
  nama_kamar: string;
  foto_utama: string; // URL permanen
  foto?: string; // Alias kompatibilitas
  galeri: string[]; // Daftar URL permanen
  harga: number;
  kapasitas: number;
  jumlah_stok: number; // Jumlah stok kamar / unit tersedia
  beds_count: number;
  baths_count: number;
  floor: 1 | 2;
  bed_info: string;
  fasilitas: string[];
  deskripsi: string;
  status: 'aktif' | 'nonaktif';
}

export interface TB_Media {
  id: string;
  kategori: 'hero' | 'penginapan' | 'kamar' | 'fasilitas' | 'galeri';
  url: string; // URL permanen publik
  nama_file: string;
  tanggal_upload: string;
  ukuran?: string;
}

export interface TB_Website_Settings {
  id: string;
  key: string;
  value: string;
  kategori: 'navbar' | 'homepage' | 'booking' | 'footer' | 'kontak' | 'aturan';
}

export interface TB_User {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: 'admin' | 'resepsionis';
  telepon?: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
}

export interface TB_Activity_Log {
  id: string;
  user_id: string;
  user_nama: string;
  role: 'admin' | 'resepsionis';
  aksi: string;
  kategori: 'homepage' | 'homestay' | 'kamar' | 'media' | 'settings' | 'booking' | 'user';
  detail?: string;
  waktu: string; // ISO format
}

export interface TB_Booking {
  id: string; // Format unik: GBH-YYMM-XXXX
  homestay_id: string; // Relasi ke TB_Homestay.id
  homestay_name: string;
  room_ids: string[]; // Relasi ke TB_Room.id[]
  room_name: string;
  guest_name: string;
  guest_phone: string;
  guest_city: string;
  guest_relation: string; // Hubungan keluarga / mahrom
  check_in_date: string; // YYYY-MM-DD
  check_out_date: string; // YYYY-MM-DD
  total_nights: number;
  total_guests: number;
  total_amount: number;
  status: 'pending_verification' | 'verified' | 'checked_in' | 'rejected' | 'cancelled';
  signature: string; // Hash tanda tangan keamanan digital QR
  created_at: string;
  verified_at?: string;
  checked_in_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
}

export interface TB_Payment {
  id: string; // Format: PAY-XXXX
  booking_id: string; // Relasi ke TB_Booking.id
  payment_type: 'dp_30' | 'full_100';
  dp_percentage: number;
  dp_amount: number;
  remaining_balance: number;
  total_amount: number;
  payment_method: 'mandiri_va' | 'bca_va' | 'qris';
  proof_image_url: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface TB_Blocked_Date {
  id: string; // Format: BLK-XXXX
  homestay_id: string; // Relasi ke TB_Homestay.id
  room_id?: string; // Optional: Relasi ke TB_Room.id (untuk Trenggole)
  date: string; // YYYY-MM-DD
  reason?: string;
  created_at: string;
}

// ==============================================================
// 2. STORAGE KEYS
// ==============================================================
const STORAGE_KEY_HOMEPAGE = 'tb_homepage_content_v2';
const STORAGE_KEY_HOMESTAY = 'tb_homestay_v2';
const STORAGE_KEY_ROOM = 'tb_room_v2';
const STORAGE_KEY_MEDIA = 'tb_media_v2';
const STORAGE_KEY_SETTINGS = 'tb_website_settings_v2';
const STORAGE_KEY_USER = 'tb_user_v2';
const STORAGE_KEY_LOGS = 'tb_activity_logs_v2';
const STORAGE_KEY_BOOKINGS = 'tb_booking_v2';
const STORAGE_KEY_PAYMENTS = 'tb_payment_v2';
const STORAGE_KEY_BLOCKED_DATES = 'tb_blocked_dates_v2';

// ==============================================================
// 3. KATALOG GAMBAR PERMANEN PUBLIK (KOMPATIBEL VERCEL & SMARTPHONE)
// ==============================================================
export const PERMANENT_IMAGE_CATALOG: {
  id: string;
  label: string;
  url: string;
  kategori: TB_Media['kategori'];
}[] = [
  {
    id: 'perm-sundak-front',
    label: 'Sundak Full House (Tampak Depan Rumah)',
    url: '/images/sundak_fullhouse_1790552054893.jpg',
    kategori: 'penginapan',
  },
  {
    id: 'perm-trenggole-ext',
    label: 'Trenggole Bangunan Utama Dekat Pantai',
    url: '/images/trenggole_house_1790552065368.jpg',
    kategori: 'penginapan',
  },
  {
    id: 'perm-trenggole-room',
    label: 'Kamar Tidur AC View Pantai Trenggole',
    url: '/images/trenggole_room_1790552085510.jpg',
    kategori: 'kamar',
  },
  {
    id: 'perm-living-room',
    label: 'Ruang Tamu & Ruang Keluarga Santai Sundak',
    url: '/images/living_room_1790552074900.jpg',
    kategori: 'fasilitas',
  },
  {
    id: 'perm-sundak-aerial',
    label: 'Pantai Sundak Pasir Putih & Suasana Alam',
    url: '/images/sundak_aerial_1790552096758.jpg',
    kategori: 'hero',
  },
];

// ==============================================================
// 4. DATA SEED DEFAULT
// ==============================================================

export const DEFAULT_HOMEPAGE_CONTENT: TB_Homepage_Content = {
  id: 'primary',
  hero_image: '/images/sundak_fullhouse_1790552054893.jpg',
  hero_title: 'Penginapan Nyaman Dekat Pantai Sundak & Trenggole',
  hero_subtitle: 'Nikmati suasana pantai Gunungkidul bersama keluarga tercinta',
  hero_description:
    'Pilihan penginapan syariah terbaik berfasilitas lengkap AC, dapur masak komplit, ruang keluarga luas, dan berjarak jalan kaki langsung ke bibir pantai berpasir putih.',
  cta_text: 'Pilih & Pesan Homestay Sekarang',
  cta_link: 'accommodations',
  location_badge: 'Pantai Sundak & Pantai Trenggole, Yogyakarta',
};

export const DEFAULT_HOMESTAYS: TB_Homestay[] = [
  {
    id: 'homestay-sundak',
    nama: 'Griya Barokah Pantai Sundak',
    lokasi: 'Pantai Sundak, Gunungkidul, Yogyakarta',
    full_address: 'Kawasan Wisata Pantai Sundak, Sidoharjo, Kec. Tepus, Kabupaten Gunungkidul, D.I. Yogyakarta',
    foto_utama: '/images/sundak_fullhouse_1790552054893.jpg',
    galeri: [
      '/images/sundak_fullhouse_1790552054893.jpg',
      '/images/living_room_1790552074900.jpg',
      '/images/sundak_aerial_1790552096758.jpg',
    ],
    deskripsi:
      'Satu rumah penuh untuk keluarga/rombongan dekat pantai pasir putih Sundak. 4 kamar tidur AC, 3 kamar mandi, ruang keluarga luas, dapur lengkap alat masak & makan, mesin cuci, dan WiFi gratis.',
    konsep:
      'Konsep: Satu Rumah Penuh (Bukan Per Kamar). Tarif Rp75.000/orang/malam (minimal pemesanan 4 orang). Total biaya: Jumlah orang × Jumlah malam × Rp75.000.',
    harga: 75000,
    harga_label: '/orang/malam (Min. 4 orang)',
    kapasitas: 20,
    min_booking: 4,
    fasilitas: [
      '4 Kamar Tidur AC',
      '3 Kamar Mandi Dalam',
      'Ruang Keluarga Luas',
      'Dapur Lengkap Alat Masak',
      'Kulkas & Dispenser',
      'Mesin Cuci Pakaian',
      'TV & Kipas Angin',
      'WiFi Gratis Cepat',
      'Area Parkir Mobil Luas',
    ],
    peraturan: [
      'Khusus keluarga sah / mahrom atau rombongan sesama gender.',
      'Dilarang membawa minuman keras, narkoba, atau zat berbahaya.',
      'Menjaga kebersihan dan ketertiban lingkungan pantai syariah.',
    ],
    status: 'aktif',
    rating: 4.9,
    reviews_count: 168,
    badge: 'SATU RUMAH PENUH (FULL HOUSE)',
    property_type: 'full_homestay',
    whatsapp_contact: '082138613888',
  },
  {
    id: 'homestay-trenggole',
    nama: 'Griya Barokah Pantai Trenggole',
    lokasi: 'Pantai Trenggole, Gunungkidul, Yogyakarta',
    full_address: 'Kawasan Wisata Pantai Trenggole, Sidoharjo, Kec. Tepus, Kabupaten Gunungkidul, D.I. Yogyakarta',
    foto_utama: '/images/trenggole_house_1790552065368.jpg',
    galeri: [
      '/images/trenggole_house_1790552065368.jpg',
      '/images/trenggole_room_1790552085510.jpg',
      '/images/living_room_1790552074900.jpg',
    ],
    deskripsi:
      'Penginapan nyaman langsung dekat bibir pantai Trenggole. 4 pilihan kamar AC view pantai, 2 bed per kamar, kamar mandi dalam, perlengkapan mandi, dan WiFi.',
    konsep:
      'Konsep: Kamar Individual (Sewa Per Kamar). Tersedia 4 pilihan kamar tidur AC view pantai. Mulai Rp285.000/malam. Kapasitas standar 4 orang per kamar (2 bed: ranjang kayu + bed lantai).',
    harga: 285000,
    harga_label: '/malam (Kamar)',
    kapasitas: 16,
    min_booking: 1,
    fasilitas: [
      '4 Kamar Tidur AC Terpisah',
      'Semua Kamar View Pantai',
      '2 Bed per Kamar (±130x200 cm)',
      'Kamar Mandi Dalam',
      'Dapur Mini Bersama (Lantai 1)',
      'Bisa Tambah Extra Bed (Rp25rb)',
      'WiFi Cepat & Area Parkir',
    ],
    peraturan: [
      'Jumlah tamu wajib mengikuti kapasitas kamar yang dipesan.',
      'Pasangan tamu wajib suami-istri sah (menunjukkan KTP/identitas).',
      'Check-in mulai pukul 14:00, check-out maksimal pukul 12:00.',
    ],
    status: 'aktif',
    rating: 4.8,
    reviews_count: 96,
    badge: 'PENGINAPAN KAMAR & FULL HOUSE',
    property_type: 'individual_rooms',
    whatsapp_contact: '082138613888',
  },
];

export const DEFAULT_ROOMS: TB_Room[] = [
  {
    id: 'sundak-full-house',
    homestay_id: 'homestay-sundak',
    nama_kamar: 'Full House Griya Barokah Sundak',
    foto_utama: '/images/sundak_fullhouse_1790552054893.jpg',
    foto: '/images/sundak_fullhouse_1790552054893.jpg',
    galeri: [
      '/images/sundak_fullhouse_1790552054893.jpg',
      '/images/living_room_1790552074900.jpg',
    ],
    harga: 75000,
    kapasitas: 20,
    jumlah_stok: 1,
    beds_count: 4,
    baths_count: 3,
    floor: 1,
    bed_info: '4 Kamar AC (Keluarga Besar)',
    fasilitas: ['4 Kamar AC', '3 KM Dalam', 'Dapur Lengkap', 'Mesin Cuci', 'WiFi Cepat'],
    deskripsi: 'Satu rumah penuh untuk rombongan keluarga. Dapur alat masak, dispenser, kulkas, ruang tengah luas, dan parkir mobil.',
    status: 'aktif',
  },
  {
    id: 'trenggole-kamar-1',
    homestay_id: 'homestay-trenggole',
    nama_kamar: 'Kamar 1 – Pantai Trenggole',
    foto_utama: '/images/trenggole_room_1790552085510.jpg',
    foto: '/images/trenggole_room_1790552085510.jpg',
    galeri: ['/images/trenggole_room_1790552085510.jpg'],
    harga: 285000,
    kapasitas: 4,
    jumlah_stok: 1,
    beds_count: 2,
    baths_count: 1,
    floor: 1,
    bed_info: '1 Queen + 1 Single (2 Bed ±130x200 cm)',
    fasilitas: ['Lantai 1', 'View Pantai', 'AC Dingin', 'Kamar Mandi Dalam', 'WiFi'],
    deskripsi: 'Kamar lantai 1 dengan jendela menghadap pantai, 2 bed, kamar mandi dalam, dan WiFi lancar.',
    status: 'aktif',
  },
  {
    id: 'trenggole-kamar-2',
    homestay_id: 'homestay-trenggole',
    nama_kamar: 'Kamar 2 (Lantai 1 • Dapur Mini)',
    foto_utama: '/images/trenggole_room_1790552085510.jpg',
    foto: '/images/trenggole_room_1790552085510.jpg',
    galeri: ['/images/trenggole_room_1790552085510.jpg'],
    harga: 335000,
    kapasitas: 4,
    jumlah_stok: 1,
    beds_count: 2,
    baths_count: 1,
    floor: 1,
    bed_info: '1 Queen + 1 Single (2 Bed ±130x200 cm)',
    fasilitas: ['Lantai 1', 'Dapur Mini', 'View Pantai', 'AC Dingin', 'Kamar Mandi Dalam'],
    deskripsi: 'Kamar lantai 1 dengan akses dapur mini di dalam kamar, sangat cocok untuk keluarga yang ingin masak praktis.',
    status: 'aktif',
  },
  {
    id: 'trenggole-kamar-3',
    homestay_id: 'homestay-trenggole',
    nama_kamar: 'Kamar 3 (Lantai 2 • View Pantai)',
    foto_utama: '/images/trenggole_room_1790552085510.jpg',
    foto: '/images/trenggole_room_1790552085510.jpg',
    galeri: ['/images/trenggole_room_1790552085510.jpg'],
    harga: 315000,
    kapasitas: 4,
    jumlah_stok: 1,
    beds_count: 2,
    baths_count: 1,
    floor: 2,
    bed_info: '1 Queen + 1 Single (2 Bed ±130x200 cm)',
    fasilitas: ['Lantai 2', 'View Pantai Lepas', 'AC Dingin', 'Kamar Mandi Dalam', 'WiFi'],
    deskripsi: 'Kamar lantai 2 dengan panorama ombak pantai Trenggole yang eksotis dari ketinggian.',
    status: 'aktif',
  },
  {
    id: 'trenggole-kamar-4',
    homestay_id: 'homestay-trenggole',
    nama_kamar: 'Kamar 4 (Lantai 2 • Dapur Mini & View)',
    foto_utama: '/images/trenggole_room_1790552085510.jpg',
    foto: '/images/trenggole_room_1790552085510.jpg',
    galeri: ['/images/trenggole_room_1790552085510.jpg'],
    harga: 365000,
    kapasitas: 4,
    jumlah_stok: 1,
    beds_count: 2,
    baths_count: 1,
    floor: 2,
    bed_info: '1 Queen + 1 Single (2 Bed ±130x200 cm)',
    fasilitas: ['Lantai 2', 'Dapur Mini', 'View Pantai Lepas', 'AC Dingin', 'Kamar Mandi Dalam'],
    deskripsi: 'Kamar paling lengkap di lantai 2: dilengkapi fasilitas dapur mini, view pantai lepas, AC, dan WiFi.',
    status: 'aktif',
  },
];

export const DEFAULT_MEDIA: TB_Media[] = [
  {
    id: 'media-sundak-hero',
    kategori: 'hero',
    url: '/images/sundak_fullhouse_1790552054893.jpg',
    nama_file: 'sundak_fullhouse.jpg',
    tanggal_upload: '2025-10-01',
    ukuran: '420 KB',
  },
  {
    id: 'media-trenggole-ext',
    kategori: 'penginapan',
    url: '/images/trenggole_house_1790552065368.jpg',
    nama_file: 'trenggole_house.jpg',
    tanggal_upload: '2025-10-01',
    ukuran: '390 KB',
  },
  {
    id: 'media-trenggole-room',
    kategori: 'kamar',
    url: '/images/trenggole_room_1790552085510.jpg',
    nama_file: 'trenggole_room.jpg',
    tanggal_upload: '2025-10-01',
    ukuran: '360 KB',
  },
  {
    id: 'media-living-room',
    kategori: 'fasilitas',
    url: '/images/living_room_1790552074900.jpg',
    nama_file: 'living_room.jpg',
    tanggal_upload: '2025-10-01',
    ukuran: '310 KB',
  },
  {
    id: 'media-sundak-aerial',
    kategori: 'galeri',
    url: '/images/sundak_aerial_1790552096758.jpg',
    nama_file: 'sundak_aerial.jpg',
    tanggal_upload: '2025-10-01',
    ukuran: '450 KB',
  },
];

export const DEFAULT_WEBSITE_SETTINGS: TB_Website_Settings[] = [
  // Navbar & Branding
  { id: 'set-nav-brand', key: 'navbar_brand_name', value: 'Griya Barokah Homestay', kategori: 'navbar' },
  { id: 'set-nav-logo', key: 'navbar_logo_url', value: '/images/sundak_fullhouse_1790552054893.jpg', kategori: 'navbar' },
  { id: 'set-pwa-icon', key: 'pwa_icon', value: '/icon-192.png', kategori: 'navbar' },
  { id: 'set-nav-tag', key: 'navbar_tagline', value: 'Homestay Keluarga Pantai Gunungkidul', kategori: 'navbar' },

  // Homepage (Hero & Section Content)
  { id: 'set-home-hero-img', key: 'homepage_hero_image', value: '/images/sundak_fullhouse_1790552054893.jpg', kategori: 'homepage' },
  { id: 'set-home-hero-title', key: 'homepage_hero_title', value: 'Griya Barokah Homestay Pantai Sundak & Trenggole', kategori: 'homepage' },
  { id: 'set-home-hero-sub', key: 'homepage_hero_subtitle', value: 'HOMESTAY KELUARGA ASLI', kategori: 'homepage' },
  { id: 'set-home-hero-desc', key: 'homepage_hero_description', value: 'Penginapan keluarga nyaman dekat pantai Gunungkidul dengan fasilitas lengkap.', kategori: 'homepage' },
  { id: 'set-home-cta-text', key: 'homepage_cta_text', value: 'Pilih & Pesan Homestay Sekarang', kategori: 'homepage' },
  { id: 'set-home-cta-link', key: 'homepage_cta_link', value: 'accommodations', kategori: 'homepage' },
  { id: 'set-home-loc-badge', key: 'homepage_location_badge', value: 'Pantai Sundak & Trenggole, Gunungkidul', kategori: 'homepage' },
  { id: 'set-home-title', key: 'homepage_section_title', value: 'Pilihan Penginapan Homestay', kategori: 'homepage' },
  { id: 'set-home-desc', key: 'homepage_section_desc', value: 'Penginapan keluarga nyaman, ber-AC, dan dekat dengan pantai pasir putih', kategori: 'homepage' },
  { id: 'set-facility-banner-img', key: 'facility_banner_image', value: '/images/living_room_1790552074900.jpg', kategori: 'homepage' },
  { id: 'set-facility-banner-title', key: 'facility_banner_title', value: 'Ruang Keluarga & Fasilitas Bersama', kategori: 'homepage' },
  { id: 'set-facility-banner-sub', key: 'facility_banner_subtitle', value: 'Suasana hangat untuk berkumpul bersama keluarga santai', kategori: 'homepage' },
  { id: 'set-general-facilities', key: 'general_facilities', value: 'Semua Kamar Ber-AC, KM Duduk & Jongkok, Dapur Lengkap & Gas, Kulkas & TV Keluarga, Tersedia 13 Extra Bed, Free WiFi Cepat', kategori: 'homepage' },

  // Booking & Aturan
  { id: 'set-book-inst', key: 'booking_instruction', value: 'Pilih lokasi & tanggal menginap, isi data tamu mahrom, dan upload bukti transfer DP 30% atau Lunas 100%.', kategori: 'booking' },
  { id: 'set-book-terms', key: 'booking_terms', value: 'Khusus keluarga sah / mahrom atau rombongan sesama gender. Dilarang membawa miras, sajam, atau zat terlarang.', kategori: 'booking' },
  { id: 'set-book-mahrom', key: 'booking_mahrom_clause', value: '* Sesuai ketentuan homestay syariah barokah, tamu wajib bersama mahrom / keluarga sah atau sesama gender. Dilarang membawa minuman keras, narkoba, atau aktivitas non-halal.', kategori: 'aturan' },
  { id: 'set-book-relations', key: 'guest_relation_options', value: 'Keluarga Inti (Suami/Istri & Anak) - Mahrom, Rombongan Keluarga Besar (Mahrom), Pasangan Suami & Istri Sah (Pasutri), Rombongan Teman Sesama Pria (Ikhwan), Rombongan Teman Sesama Wanita (Akhwat), Komunitas / Lembaga / Majelis', kategori: 'booking' },
  { id: 'set-checkin-time', key: 'rules_checkin_time', value: '14:00 WIB', kategori: 'aturan' },
  { id: 'set-checkout-time', key: 'rules_checkout_time', value: '12:00 WIB', kategori: 'aturan' },

  // Rekening Pembayaran & QRIS
  { id: 'set-bank-bca-label', key: 'bank_bca_bank_name', value: 'BCA', kategori: 'booking' },
  { id: 'set-bank-bca-no', key: 'bank_bca_number', value: '8801 2940 1827 0049', kategori: 'booking' },
  { id: 'set-bank-bca-name', key: 'bank_bca_holder', value: 'Griya Barokah Homestay', kategori: 'booking' },
  { id: 'set-bank-man-label', key: 'bank_mandiri_bank_name', value: 'Mandiri', kategori: 'booking' },
  { id: 'set-bank-man-no', key: 'bank_mandiri_number', value: '8920 1829 4819 0021', kategori: 'booking' },
  { id: 'set-qris-code', key: 'payment_qris_payload', value: 'BELUM_AKTIF', kategori: 'booking' },

  // Footer & Kontak
  { id: 'set-foot-addr', key: 'footer_address', value: 'Kawasan Pantai Sundak & Pantai Trenggole, Sidoharjo, Kec. Tepus, Gunungkidul, D.I. Yogyakarta', kategori: 'footer' },
  { id: 'set-foot-wa', key: 'footer_whatsapp', value: '082138613888', kategori: 'kontak' },
  { id: 'set-admin-wa', key: 'admin_whatsapp', value: '082138613888', kategori: 'kontak' },
  { id: 'set-layanan-wa', key: 'layanan_tambahan_whatsapp', value: '082138613888', kategori: 'kontak' },
  { id: 'set-foot-phone', key: 'footer_phone', value: '+62 821-3861-3888', kategori: 'kontak' },
  { id: 'set-foot-hours', key: 'footer_service_hours', value: 'Setiap Hari (24 Jam Pelayanan Resepsionis)', kategori: 'footer' },
  { id: 'set-foot-extra', key: 'footer_extra_info', value: 'Pesanan hidangan makanan & seafood pantai, Sewa Jeep wisata jelajah pantai & tebing Gunungkidul, Informasi jual beli tanah / aset kawasan pantai', kategori: 'footer' },
];

export const DEFAULT_USERS: TB_User[] = [
  {
    id: 'user-admin-01',
    nama: 'Administrator Griya Barokah',
    email: 'admin@griyabarokah.com',
    password: 'admin123',
    role: 'admin',
    telepon: '082138613888',
    status: 'aktif',
    created_at: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'user-resep-01',
    nama: 'Resepsionis Pantai Griya Barokah',
    email: 'resepsionis@griyabarokah.com',
    password: 'resep123',
    role: 'resepsionis',
    telepon: '082138613888',
    status: 'aktif',
    created_at: '2025-10-01T08:00:00.000Z',
  },
];

export const DEFAULT_ACTIVITY_LOGS: TB_Activity_Log[] = [
  {
    id: 'log-seed-01',
    user_id: 'user-admin-01',
    user_nama: 'Administrator Griya Barokah',
    role: 'admin',
    aksi: 'Inisialisasi Sistem Database CMS',
    kategori: 'settings',
    detail: 'Konfigurasi awal struktur database website, penginapan Sundak & Trenggole.',
    waktu: '2025-10-01T08:30:00.000Z',
  },
];

// ==============================================================
// 5. KELAS UTAMA CMS DATABASE DENGAN PERSISTENSI
// ==============================================================

export class CMSDatabase {
  private static notifyChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cms_database_updated'));
    }
  }

  /**
   * Mengambil data cloud dari Supabase (Postgres) ke cache lokal secara non-blocking
   * Meliputi tabel: homestays, rooms, website_settings, media, blocked_dates, activity_log
   */
  static async syncFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const [
        { data: dbHomestays },
        { data: dbRooms },
        { data: dbSettings },
        { data: dbMedia },
        { data: dbBlocked },
        { data: dbLogs },
      ] = await Promise.all([
        supabase.from('homestays').select('*'),
        supabase.from('rooms').select('*'),
        supabase.from('website_settings').select('*'),
        supabase.from('media').select('*').order('tanggal_upload', { ascending: false }),
        supabase.from('blocked_dates').select('*'),
        supabase.from('activity_log').select('*').order('waktu', { ascending: false }).limit(100),
      ]);

      let hasChanges = false;
      if (Array.isArray(dbHomestays) && dbHomestays.length > 0) {
        localStorage.setItem(STORAGE_KEY_HOMESTAY, JSON.stringify(dbHomestays));
        hasChanges = true;
      }
      if (Array.isArray(dbRooms) && dbRooms.length > 0) {
        localStorage.setItem(STORAGE_KEY_ROOM, JSON.stringify(dbRooms));
        hasChanges = true;
      }
      if (Array.isArray(dbSettings) && dbSettings.length > 0) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(dbSettings));
        hasChanges = true;
      }
      if (Array.isArray(dbMedia) && dbMedia.length > 0) {
        localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(dbMedia));
        hasChanges = true;
      }
      if (Array.isArray(dbBlocked) && dbBlocked.length > 0) {
        localStorage.setItem(STORAGE_KEY_BLOCKED_DATES, JSON.stringify(dbBlocked));
        hasChanges = true;
      }
      if (Array.isArray(dbLogs) && dbLogs.length > 0) {
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(dbLogs));
        hasChanges = true;
      }

      if (hasChanges) {
        this.notifyChange();
      }
    } catch (err) {
      console.warn('[CMSDatabase] Supabase initial sync warning:', err);
    }
  }

  // --- 1. TB_Homepage_Content (Tersinkronisasi Terpadu melalui website_settings) ---
  static getHomepageContent(): TB_Homepage_Content {
    const heroImage =
      this.getSetting('homepage_hero_image') ||
      this.getSetting('hero_image') ||
      DEFAULT_HOMEPAGE_CONTENT.hero_image;
    const heroTitle =
      this.getSetting('homepage_hero_title') ||
      DEFAULT_HOMEPAGE_CONTENT.hero_title;
    const heroSubtitle =
      this.getSetting('homepage_hero_subtitle') ||
      DEFAULT_HOMEPAGE_CONTENT.hero_subtitle;
    const heroDescription =
      this.getSetting('homepage_hero_description') ||
      DEFAULT_HOMEPAGE_CONTENT.hero_description;
    const ctaText =
      this.getSetting('homepage_cta_text') ||
      DEFAULT_HOMEPAGE_CONTENT.cta_text;
    const ctaLink =
      this.getSetting('homepage_cta_link') ||
      DEFAULT_HOMEPAGE_CONTENT.cta_link;
    const locationBadge =
      this.getSetting('homepage_location_badge') ||
      DEFAULT_HOMEPAGE_CONTENT.location_badge;

    return {
      id: DEFAULT_HOMEPAGE_CONTENT.id,
      hero_image: heroImage,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_description: heroDescription,
      cta_text: ctaText,
      cta_link: ctaLink,
      location_badge: locationBadge,
    };
  }

  static saveHomepageContent(
    data: Partial<TB_Homepage_Content>,
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): TB_Homepage_Content {
    const recordsToSave: Record<string, { value: string; kategori?: TB_Website_Settings['kategori'] }> = {};

    if (data.hero_image !== undefined) {
      recordsToSave['homepage_hero_image'] = { value: data.hero_image, kategori: 'homepage' };
      recordsToSave['hero_image'] = { value: data.hero_image, kategori: 'homepage' };
    }
    if (data.hero_title !== undefined) {
      recordsToSave['homepage_hero_title'] = { value: data.hero_title, kategori: 'homepage' };
    }
    if (data.hero_subtitle !== undefined) {
      recordsToSave['homepage_hero_subtitle'] = { value: data.hero_subtitle, kategori: 'homepage' };
    }
    if (data.hero_description !== undefined) {
      recordsToSave['homepage_hero_description'] = { value: data.hero_description, kategori: 'homepage' };
    }
    if (data.cta_text !== undefined) {
      recordsToSave['homepage_cta_text'] = { value: data.cta_text, kategori: 'homepage' };
    }
    if (data.cta_link !== undefined) {
      recordsToSave['homepage_cta_link'] = { value: data.cta_link, kategori: 'homepage' };
    }
    if (data.location_badge !== undefined) {
      recordsToSave['homepage_location_badge'] = { value: data.location_badge, kategori: 'homepage' };
    }

    this.saveMultipleSettings(recordsToSave, user);

    const updated = this.getHomepageContent();
    try {
      localStorage.setItem(STORAGE_KEY_HOMEPAGE, JSON.stringify(updated));
    } catch {
      // ignore
    }

    this.logActivity({
      user_id: user?.id || 'admin',
      user_nama: user?.nama || 'Admin',
      role: user?.role || 'admin',
      aksi: 'Update Konten Hero Landing Page',
      kategori: 'homepage',
      detail: `Hero image & judul homepage disinkronkan ke website_settings`,
    });

    return updated;
  }

  // --- 2. TB_Homestay ---
  static getHomestays(): TB_Homestay[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HOMESTAY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((h: any) => ({
            ...h,
            foto_utama: h.foto_utama || '/images/sundak_fullhouse_1790552054893.jpg',
            galeri:
              Array.isArray(h.galeri) && h.galeri.length > 0
                ? h.galeri
                : [h.foto_utama || '/images/sundak_fullhouse_1790552054893.jpg'],
          }));
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_HOMESTAYS;
  }

  static getHomestayById(id: string): TB_Homestay | undefined {
    return this.getHomestays().find((h) => h.id === id);
  }

  static updateHomestay(
    id: string,
    data: Partial<TB_Homestay>,
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getHomestays();
    const idx = list.findIndex((h) => h.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data };
      try {
        localStorage.setItem(STORAGE_KEY_HOMESTAY, JSON.stringify(list));
        this.notifyChange();
        if (isSupabaseConfigured) {
          supabase.from('homestays').upsert(list[idx]).then(({ error }) => {
            if (error) console.warn('[Supabase homestays upsert error]', error.message);
          });
        }
        this.logActivity({
          user_id: user?.id || 'admin',
          user_nama: user?.nama || 'Admin',
          role: user?.role || 'admin',
          aksi: `Update Penginapan: ${list[idx].nama}`,
          kategori: 'homestay',
          detail: `Harga: Rp ${list[idx].harga.toLocaleString('id-ID')}, Status: ${list[idx].status}`,
        });
      } catch (err) {
        console.error('[CMSDatabase Error] Gagal update homestay:', err);
      }
    }
  }

  static addHomestay(
    homestay: TB_Homestay,
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getHomestays();
    const newHomestay: TB_Homestay = {
      ...homestay,
      id: homestay.id || `homestay-${Date.now()}`,
      foto_utama: homestay.foto_utama || '/images/sundak_fullhouse_1790552054893.jpg',
      galeri:
        Array.isArray(homestay.galeri) && homestay.galeri.length > 0
          ? homestay.galeri
          : [homestay.foto_utama || '/images/sundak_fullhouse_1790552054893.jpg'],
      fasilitas: Array.isArray(homestay.fasilitas) ? homestay.fasilitas : ['AC', 'WiFi'],
      peraturan: Array.isArray(homestay.peraturan) ? homestay.peraturan : ['Khusus keluarga sah / mahrom'],
      status: homestay.status || 'aktif',
    };
    list.push(newHomestay);
    try {
      localStorage.setItem(STORAGE_KEY_HOMESTAY, JSON.stringify(list));
      this.notifyChange();
      if (isSupabaseConfigured) {
        supabase.from('homestays').insert(newHomestay).then(({ error }) => {
          if (error) console.warn('[Supabase homestays insert error]', error.message);
        });
      }
      this.logActivity({
        user_id: user?.id || 'admin',
        user_nama: user?.nama || 'Admin',
        role: user?.role || 'admin',
        aksi: `Tambah Penginapan Baru: ${newHomestay.nama}`,
        kategori: 'homestay',
        detail: `ID: ${newHomestay.id}, Lokasi: ${newHomestay.lokasi}, Harga: Rp ${newHomestay.harga.toLocaleString('id-ID')}`,
      });
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal tambah homestay:', err);
    }
  }

  static deleteHomestay(
    id: string,
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getHomestays();
    const deleted = list.find((h) => h.id === id);
    const filtered = list.filter((h) => h.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_HOMESTAY, JSON.stringify(filtered));
      this.notifyChange();
      if (isSupabaseConfigured) {
        supabase.from('homestays').delete().eq('id', id).then(({ error }) => {
          if (error) console.warn('[Supabase homestays delete error]', error.message);
        });
      }
      this.logActivity({
        user_id: user?.id || 'admin',
        user_nama: user?.nama || 'Admin',
        role: user?.role || 'admin',
        aksi: `Hapus Penginapan: ${deleted?.nama || id}`,
        kategori: 'homestay',
      });
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal hapus homestay:', err);
    }
  }

  // --- 3. TB_Room ---
  static getRooms(homestayId?: string): TB_Room[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ROOM);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.map((r: any) => ({
            ...r,
            foto_utama: r.foto_utama || r.foto || '/images/trenggole_room_1790552085510.jpg',
            foto: r.foto_utama || r.foto || '/images/trenggole_room_1790552085510.jpg',
            galeri:
              Array.isArray(r.galeri) && r.galeri.length > 0
                ? r.galeri
                : [r.foto_utama || r.foto || '/images/trenggole_room_1790552085510.jpg'],
            jumlah_stok: r.jumlah_stok !== undefined ? Number(r.jumlah_stok) : 1,
          }));
          return homestayId ? valid.filter((r) => r.homestay_id === homestayId) : valid;
        }
      }
    } catch {
      // fallback
    }
    return homestayId
      ? DEFAULT_ROOMS.filter((r) => r.homestay_id === homestayId)
      : DEFAULT_ROOMS;
  }

  static getRoomById(id: string): TB_Room | undefined {
    return this.getRooms().find((r) => r.id === id);
  }

  static saveRoom(
    data: TB_Room,
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getRooms();
    const idx = list.findIndex((r) => r.id === data.id);
    const roomWithNormalizedPhotos = {
      ...data,
      foto_utama: data.foto_utama || data.foto || '/images/trenggole_room_1790552085510.jpg',
      foto: data.foto_utama || data.foto || '/images/trenggole_room_1790552085510.jpg',
      jumlah_stok: data.jumlah_stok !== undefined ? Number(data.jumlah_stok) : 1,
    };
    if (idx >= 0) {
      list[idx] = roomWithNormalizedPhotos;
    } else {
      list.push(roomWithNormalizedPhotos);
    }
    try {
      localStorage.setItem(STORAGE_KEY_ROOM, JSON.stringify(list));
      this.notifyChange();
      if (isSupabaseConfigured) {
        supabase.from('rooms').upsert(roomWithNormalizedPhotos).then(({ error }) => {
          if (error) console.warn('[Supabase rooms upsert error]', error.message);
        });
      }
      this.logActivity({
        user_id: user?.id || 'admin',
        user_nama: user?.nama || 'Admin',
        role: user?.role || 'admin',
        aksi: idx >= 0 ? `Update Kamar: ${data.nama_kamar}` : `Tambah Kamar Baru: ${data.nama_kamar}`,
        kategori: 'kamar',
        detail: `Harga: Rp ${data.harga.toLocaleString('id-ID')}, Stok: ${roomWithNormalizedPhotos.jumlah_stok}, Status: ${data.status}`,
      });
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal simpan kamar:', err);
    }
  }

  static updateRoom(
    id: string,
    partial: Partial<TB_Room>,
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getRooms();
    const idx = list.findIndex((r) => r.id === id);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...partial,
        foto_utama: partial.foto_utama || partial.foto || list[idx].foto_utama,
        foto: partial.foto_utama || partial.foto || list[idx].foto,
      };
      try {
        localStorage.setItem(STORAGE_KEY_ROOM, JSON.stringify(list));
        this.notifyChange();
        if (isSupabaseConfigured) {
          supabase.from('rooms').upsert(list[idx]).then(({ error }) => {
            if (error) console.warn('[Supabase rooms update error]', error.message);
          });
        }
        this.logActivity({
          user_id: user?.id || 'admin',
          user_nama: user?.nama || 'Admin',
          role: user?.role || 'admin',
          aksi: `Update Kamar: ${list[idx].nama_kamar}`,
          kategori: 'kamar',
          detail: `Stok: ${list[idx].jumlah_stok}, Harga: Rp ${list[idx].harga.toLocaleString('id-ID')}`,
        });
      } catch (err) {
        console.error('[CMSDatabase Error] Gagal update kamar:', err);
      }
    }
  }

  static deleteRoom(
    id: string,
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getRooms();
    const deleted = list.find((r) => r.id === id);
    const filtered = list.filter((r) => r.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_ROOM, JSON.stringify(filtered));
      this.notifyChange();
      if (isSupabaseConfigured) {
        supabase.from('rooms').delete().eq('id', id).then(({ error }) => {
          if (error) console.warn('[Supabase rooms delete error]', error.message);
        });
      }
      this.logActivity({
        user_id: user?.id || 'admin',
        user_nama: user?.nama || 'Admin',
        role: user?.role || 'admin',
        aksi: `Hapus Kamar: ${deleted?.nama_kamar || id}`,
        kategori: 'kamar',
      });
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal hapus kamar:', err);
    }
  }

  // --- 4. TB_Media (Sistem Gambar URL Cloud Supabase) ---
  static getMediaList(kategori?: string): TB_Media[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MEDIA);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return kategori ? parsed.filter((m: any) => m.kategori === kategori) : parsed;
        }
      }
    } catch {
      // fallback
    }
    return kategori ? DEFAULT_MEDIA.filter((m) => m.kategori === kategori) : DEFAULT_MEDIA;
  }

  static addMediaItem(
    item: Omit<TB_Media, 'id'>,
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): TB_Media {
    if (item.url && item.url.startsWith('data:')) {
      throw new Error('Upload gagal: Format gambar Base64 tidak diizinkan. Semua foto harus melalui Supabase Storage.');
    }
    const list = this.getMediaList();
    const newMedia: TB_Media = {
      ...item,
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tanggal_upload: item.tanggal_upload || new Date().toISOString().split('T')[0],
    };
    list.unshift(newMedia);
    try {
      localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(list));
      this.notifyChange();
      if (isSupabaseConfigured) {
        supabase.from('media').insert({
          id: newMedia.id,
          kategori: newMedia.kategori,
          url: newMedia.url,
          nama_file: newMedia.nama_file,
          tanggal_upload: newMedia.tanggal_upload,
          ukuran: newMedia.ukuran,
        }).then(({ error }) => {
          if (error) console.warn('[Supabase media insert error]', error.message);
        });
      }
      this.logActivity({
        user_id: user?.id || 'admin',
        user_nama: user?.nama || 'Admin',
        role: user?.role || 'admin',
        aksi: `Tambah Media: ${newMedia.nama_file}`,
        kategori: 'media',
        detail: `Kategori: ${newMedia.kategori}, File: ${newMedia.nama_file}`,
      });
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal tambah media:', err);
    }
    return newMedia;
  }

  /**
   * Upload Media Handler CMS:
   * Mengunggah gambar ke Supabase Storage (bucket "media") dan menyimpan public URL ke database Supabase
   */
  static async uploadMediaFile(
    file: File,
    kategori: TB_Media['kategori'],
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): Promise<TB_Media> {
    try {
      // 1. Upload ke Supabase Storage bucket 'media'
      const publicUrl = await uploadImageToSupabaseStorage(file, kategori);
      if (!publicUrl || publicUrl.startsWith('data:')) {
        throw new Error('Upload gagal, periksa koneksi internet dan coba lagi');
      }

      // Hitung perkiraan ukuran
      const approximateSizeKb = Math.round(file.size / 1024);

      const media = CMSDatabase.addMediaItem(
        {
          kategori,
          url: publicUrl,
          nama_file: file.name,
          tanggal_upload: new Date().toISOString().split('T')[0],
          ukuran: `${approximateSizeKb} KB`,
        },
        user
      );
      return media;
    } catch (err: any) {
      console.error('[CMSDatabase Error] Gagal proses upload file:', err);
      // Jika upload gagal, JANGAN simpan apapun sebagai gambar baru — lempar error agar admin mendapat notifikasi jelas
      throw new Error(err?.message || 'Upload gagal, periksa koneksi internet dan coba lagi');
    }
  }

  static deleteMediaItem(
    id: string,
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getMediaList();
    const deleted = list.find((m) => m.id === id);
    const filtered = list.filter((m) => m.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(filtered));
      this.notifyChange();
      if (isSupabaseConfigured) {
        supabase.from('media').delete().eq('id', id).then(({ error }) => {
          if (error) console.warn('[Supabase media delete error]', error.message);
        });
      }
      this.logActivity({
        user_id: user?.id || 'admin',
        user_nama: user?.nama || 'Admin',
        role: user?.role || 'admin',
        aksi: `Hapus Media: ${deleted?.nama_file || id}`,
        kategori: 'media',
      });
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal hapus media:', err);
    }
  }

  // --- 5. TB_Website_Settings ---
  static getWebsiteSettings(): TB_Website_Settings[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_WEBSITE_SETTINGS;
  }

  static getSetting(key: string, defaultValue: string = ''): string {
    const settings = this.getWebsiteSettings();
    const found = settings.find((s) => s.key === key);
    return found?.value || defaultValue;
  }

  static getWebsiteSetting(key: string, defaultValue: string = ''): string {
    return this.getSetting(key, defaultValue);
  }

  static saveWebsiteSetting(
    key: string,
    value: string,
    kategori: TB_Website_Settings['kategori'] = 'homepage',
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    this.saveSetting(key, value, kategori, user);
  }

  static saveSetting(
    key: string,
    value: string,
    kategori: TB_Website_Settings['kategori'] = 'homepage',
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getWebsiteSettings();
    const idx = list.findIndex((s) => s.key === key);
    if (idx >= 0) {
      list[idx].value = value;
    } else {
      list.push({
        id: `set_${key}`,
        key,
        value,
        kategori,
      });
    }
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(list));
      this.notifyChange();
      if (isSupabaseConfigured) {
        supabase.from('website_settings').upsert({
          id: `set_${key}`,
          key,
          value,
          kategori,
        }).then(({ error }) => {
          if (error) console.warn('[Supabase settings upsert error]', error.message);
        });
      }
      this.logActivity({
        user_id: user?.id || 'admin',
        user_nama: user?.nama || 'Admin',
        role: user?.role || 'admin',
        aksi: `Update Pengaturan: ${key}`,
        kategori: 'settings',
        detail: `Nilai baru: "${value.slice(0, 50)}..."`,
      });
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal simpan setting:', err);
    }
  }

  static saveMultipleSettings(
    records: Record<string, { value: string; kategori?: TB_Website_Settings['kategori'] }>,
    user?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getWebsiteSettings();
    const rowsToUpsert: any[] = [];
    Object.entries(records).forEach(([key, item]) => {
      const idx = list.findIndex((s) => s.key === key);
      const rowItem = {
        id: `set_${key}`,
        key,
        value: item.value,
        kategori: item.kategori || 'homepage',
      };
      if (idx >= 0) {
        list[idx].value = item.value;
      } else {
        list.push(rowItem);
      }
      rowsToUpsert.push(rowItem);
    });
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(list));
      this.notifyChange();
      if (isSupabaseConfigured && rowsToUpsert.length > 0) {
        supabase.from('website_settings').upsert(rowsToUpsert).then(({ error }) => {
          if (error) console.warn('[Supabase multiple settings upsert error]', error.message);
        });
      }
      this.logActivity({
        user_id: user?.id || 'admin',
        user_nama: user?.nama || 'Admin',
        role: user?.role || 'admin',
        aksi: 'Update Pengaturan Global Website',
        kategori: 'settings',
        detail: `${Object.keys(records).length} parameter diperbarui`,
      });
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal simpan multiple settings:', err);
    }
  }

  // --- 6. TB_User (Role Admin & Resepsionis) ---
  static getUsers(): TB_User[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_USERS;
  }

  static getUserById(id: string): TB_User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  static getUserByEmail(email: string): TB_User | undefined {
    return this.getUsers().find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
  }

  static saveUser(
    user: TB_User,
    byUser?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getUsers();
    const idx = list.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      list[idx] = user;
    } else {
      list.push(user);
    }
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(list));
      this.notifyChange();
      this.logActivity({
        user_id: byUser?.id || 'admin',
        user_nama: byUser?.nama || 'Admin',
        role: byUser?.role || 'admin',
        aksi: idx >= 0 ? `Update Pengguna: ${user.nama}` : `Tambah Pengguna: ${user.nama}`,
        kategori: 'user',
        detail: `Email: ${user.email}, Role: ${user.role}`,
      });
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal simpan pengguna:', err);
    }
  }

  static deleteUser(
    id: string,
    byUser?: { id: string; nama: string; role: 'admin' | 'resepsionis' }
  ): void {
    const list = this.getUsers();
    const deleted = list.find((u) => u.id === id);
    const filtered = list.filter((u) => u.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(filtered));
      this.notifyChange();
      this.logActivity({
        user_id: byUser?.id || 'admin',
        user_nama: byUser?.nama || 'Admin',
        role: byUser?.role || 'admin',
        aksi: `Hapus Pengguna: ${deleted?.nama || id}`,
        kategori: 'user',
      });
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal hapus pengguna:', err);
    }
  }

  // --- 7. TB_Activity_Log ---
  static getActivityLogs(): TB_Activity_Log[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_ACTIVITY_LOGS;
  }

  static logActivity(entry: Omit<TB_Activity_Log, 'id' | 'waktu'>): TB_Activity_Log {
    const list = this.getActivityLogs();
    const newLog: TB_Activity_Log = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      waktu: new Date().toISOString(),
    };
    list.unshift(newLog);
    // Batasi log maksimal 150 baris untuk efisiensi
    const trimmed = list.slice(0, 150);
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(trimmed));
      this.notifyChange();
      if (isSupabaseConfigured) {
        supabase.from('activity_log').insert({
          id: newLog.id,
          user_id: newLog.user_id,
          user_nama: newLog.user_nama,
          role: newLog.role,
          aksi: newLog.aksi,
          kategori: newLog.kategori,
          detail: newLog.detail || null,
          waktu: newLog.waktu,
        }).then(({ error }) => {
          if (error) console.warn('[Supabase activity_log insert error]', error.message);
        });
      }
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal catat log aktivitas:', err);
    }
    return newLog;
  }

  // --- 8. TB_Blocked_Date ---
  static getBlockedDates(): TB_Blocked_Date[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BLOCKED_DATES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  }

  static addBlockedDate(homestayId: string, date: string, roomId?: string, reason?: string): TB_Blocked_Date {
    const list = this.getBlockedDates();
    const newEntry: TB_Blocked_Date = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      homestay_id: homestayId,
      room_id: roomId,
      date,
      reason,
      created_at: new Date().toISOString(),
    };
    list.push(newEntry);
    try {
      localStorage.setItem(STORAGE_KEY_BLOCKED_DATES, JSON.stringify(list));
      this.notifyChange();
      if (isSupabaseConfigured) {
        supabase.from('blocked_dates').insert({
          id: newEntry.id,
          homestay_id: newEntry.homestay_id,
          room_id: newEntry.room_id || null,
          date: newEntry.date,
          reason: newEntry.reason || null,
          created_at: newEntry.created_at,
        }).then(({ error }) => {
          if (error) console.warn('[Supabase blocked_dates insert error]', error.message);
        });
      }
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal simpan blocked date:', err);
    }
    return newEntry;
  }

  static removeBlockedDate(homestayId: string, date: string, roomId?: string): void {
    const list = this.getBlockedDates();
    const filtered = list.filter((b) => {
      if (b.homestay_id !== homestayId || b.date !== date) return true;
      if (roomId && b.room_id !== roomId) return true;
      return false;
    });
    try {
      localStorage.setItem(STORAGE_KEY_BLOCKED_DATES, JSON.stringify(filtered));
      this.notifyChange();
      if (isSupabaseConfigured) {
        let q = supabase.from('blocked_dates').delete().eq('homestay_id', homestayId).eq('date', date);
        if (roomId) {
          q = q.eq('room_id', roomId);
        }
        q.then(({ error }) => {
          if (error) console.warn('[Supabase blocked_dates delete error]', error.message);
        });
      }
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal hapus blocked date:', err);
    }
  }

  static isDateRangeBlocked(homestayId: string, checkIn: string, checkOut: string, roomId?: string): boolean {
    const list = this.getBlockedDates();
    return list.some((b) => {
      if (b.homestay_id !== homestayId) return false;
      if (roomId && b.room_id && b.room_id !== roomId) return false;
      return b.date >= checkIn && b.date < checkOut;
    });
  }

  // --- Reset Database ke Konfigurasi Awal ---
  static resetDatabaseToDefaults(): void {
    try {
      localStorage.setItem(STORAGE_KEY_HOMEPAGE, JSON.stringify(DEFAULT_HOMEPAGE_CONTENT));
      localStorage.setItem(STORAGE_KEY_HOMESTAY, JSON.stringify(DEFAULT_HOMESTAYS));
      localStorage.setItem(STORAGE_KEY_ROOM, JSON.stringify(DEFAULT_ROOMS));
      localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(DEFAULT_MEDIA));
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_WEBSITE_SETTINGS));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(DEFAULT_ACTIVITY_LOGS));
      this.notifyChange();
    } catch (err) {
      console.error('[CMSDatabase Error] Gagal reset database:', err);
    }
  }
}

// ==============================================================
// 6. HELPER KONVERSI KE STRUKTUR FRONTEND
// ==============================================================
export const convertCmsToProperties = (homestays: TB_Homestay[], rooms: TB_Room[]) => {
  return homestays.map((h) => {
    const homestayRooms = rooms.filter((r) => r.homestay_id === h.id);
    const mappedRoomTypes = homestayRooms.map((r) => ({
      id: r.id,
      name: r.nama_kamar,
      nameEn: r.nama_kamar,
      description: r.deskripsi || '',
      descriptionEn: r.deskripsi || '',
      pricePerNight: r.harga,
      usdPricePerNight: Math.round(r.harga / 15500),
      capacityGuests: r.kapasitas,
      bedsCount: r.beds_count,
      bathsCount: r.baths_count,
      areaSqft: 350,
      isAvailable: r.status === 'aktif' && (r.jumlah_stok === undefined || r.jumlah_stok > 0),
      image: r.foto_utama || r.foto || '/images/trenggole_room_1790552085510.jpg',
      gallery:
        Array.isArray(r.galeri) && r.galeri.length > 0
          ? r.galeri
          : [r.foto_utama || r.foto || '/images/trenggole_room_1790552085510.jpg'],
      features: Array.isArray(r.fasilitas) ? r.fasilitas : ['AC', 'WiFi'],
      featuresEn: Array.isArray(r.fasilitas) ? r.fasilitas : ['AC', 'WiFi'],
      bedInfo: r.bed_info,
      floor: r.floor || 1,
      stockRooms: r.jumlah_stok ?? 1,
      packageType: (h.property_type === 'full_homestay' ? 'full_homestay' : 'per_kamar') as
        | 'full_homestay'
        | 'per_kamar',
    }));

    return {
      id: h.id,
      name: h.nama,
      tagline: h.badge,
      taglineEn: h.badge,
      category: (h.property_type === 'full_homestay' ? 'Full House' : 'Homestay') as
        | 'Full House'
        | 'Homestay',
      propertyType: h.property_type,
      location: h.lokasi,
      fullAddress: h.full_address || h.lokasi,
      rating: h.rating || 4.8,
      reviewsCount: h.reviews_count || 100,
      badge: h.badge,
      badgeEn: h.badge,
      image: h.foto_utama || '/images/sundak_fullhouse_1790552054893.jpg',
      gallery:
        Array.isArray(h.galeri) && h.galeri.length > 0
          ? h.galeri
          : [h.foto_utama || '/images/sundak_fullhouse_1790552054893.jpg'],
      description: h.deskripsi,
      descriptionEn: h.deskripsi,
      concept: h.konsep,
      conceptEn: h.konsep,
      highlights: Array.isArray(h.fasilitas) ? h.fasilitas : ['AC', 'WiFi'],
      highlightsEn: Array.isArray(h.fasilitas) ? h.fasilitas : ['AC', 'WiFi'],
      roomTypes: mappedRoomTypes,
      whatsappContact: h.whatsapp_contact || '082138613888',
      extraServices: [
        'Pesanan Seafood & Nasi Kotak',
        'Sewa Jeep Wisata Pantai',
        'Informasi Investasi Tanah',
      ],
    };
  });
};
