/**
 * Utility Keamanan & Tanda Tangan Digital QR Code Tiket
 * Griya Barokah Homestay
 *
 * Mencegah pemalsuan tiket QR dengan tanda tangan digital (hash)
 * yang hanya bisa diverifikasi oleh sistem resepsionis & database.
 */

const SECRET_SALT = 'GBH_BAROKAH_SECURE_KEY_2026';

/**
 * Menghasilkan hash tanda tangan alfanumerik 8 karakter unik
 * berdasarkan ID booking dan data pemesan.
 */
export function generateBookingSignature(bookingId: string, guestPhone: string = ''): string {
  const cleanId = (bookingId || '').trim().toUpperCase();
  let cleanPhone = (guestPhone || '').replace(/\D/g, '');
  if (cleanPhone.startsWith('62')) {
    cleanPhone = '0' + cleanPhone.slice(2);
  }
  const raw = `${cleanId}:${cleanPhone}:${SECRET_SALT}`;

  // DJB2 + FNV-1a hybrid hash algorithm
  let hash1 = 5381;
  let hash2 = 2166136261;

  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char;
    hash2 = (hash2 ^ char) * 16777619;
  }

  const hex1 = Math.abs(hash1).toString(16).padStart(8, '0').slice(-4);
  const hex2 = Math.abs(hash2).toString(16).padStart(8, '0').slice(-4);
  return `${hex1}${hex2}`.toUpperCase();
}

/**
 * Memverifikasi apakah tanda tangan QR valid dan cocok dengan data di database.
 * Mendukung pencocokan langsung dengan storedSignature di data booking,
 * serta kalkulasi ulang dengan normalisasi nomor WhatsApp / telepon.
 */
export function verifyBookingSignature(
  bookingId: string,
  guestPhone: string,
  providedSignature: string,
  storedSignature?: string
): boolean {
  if (!providedSignature || !bookingId) return false;
  const prov = providedSignature.trim().toUpperCase();

  const expected = generateBookingSignature(bookingId, guestPhone);
  console.log('[DEBUG-VERIFY-DETAIL] Perbandingan nilai verifyBookingSignature:', {
    bookingId,
    guestPhone,
    providedSignature: prov,
    storedSignature: storedSignature || null,
    expectedRecomputed: expected,
    isMatchStored: Boolean(storedSignature && storedSignature.trim().toUpperCase() === prov),
    isMatchExpected: Boolean(expected.toUpperCase() === prov),
  });

  // 1. Verifikasi langsung dengan tanda tangan yang tersimpan di database
  if (storedSignature && storedSignature.trim().toUpperCase() === prov) {
    return true;
  }

  // 2. Verifikasi dengan kalkulasi ulang hash (dengan nomor HP ternormalisasi)
  if (expected.toUpperCase() === prov) {
    return true;
  }

  // 3. Fallback backward-compatibility jika nomor HP disimpan tanpa normalisasi 62/0
  const cleanId = (bookingId || '').trim().toUpperCase();
  const rawPhone = (guestPhone || '').replace(/\D/g, '');
  const rawFallback = `${cleanId}:${rawPhone}:${SECRET_SALT}`;
  let hash1 = 5381;
  let hash2 = 2166136261;
  for (let i = 0; i < rawFallback.length; i++) {
    const char = rawFallback.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char;
    hash2 = (hash2 ^ char) * 16777619;
  }
  const hex1 = Math.abs(hash1).toString(16).padStart(8, '0').slice(-4);
  const hex2 = Math.abs(hash2).toString(16).padStart(8, '0').slice(-4);
  if (`${hex1}${hex2}`.toUpperCase() === prov) {
    return true;
  }

  return false;
}

/**
 * Format Kode Booking Anti-Tabrakan: GBH-YYMM-XXXX
 * Contoh: GBH-2609-K7P9
 */
export function generateUniqueBookingCode(existingCodes: string[] = []): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Tanpa karakter membingungkan (0, O, 1, I)

  let uniqueCode = '';
  let attempts = 0;

  do {
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    uniqueCode = `GBH-${yy}${mm}-${suffix}`;
    attempts++;
  } while (existingCodes.includes(uniqueCode) && attempts < 100);

  return uniqueCode;
}
