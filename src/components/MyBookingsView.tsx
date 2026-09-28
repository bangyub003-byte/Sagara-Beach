import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { Booking } from '../types';
import { SafeImage } from './common/SafeImage';
import { CustomerBottomNav } from './common/CustomerBottomNav';
import {
  ChevronLeft,
  QrCode,
  CheckCircle2,
  Check,
  Clock,
  XCircle,
  UserCheck,
  Search,
  Lock,
  Calendar,
  Users,
  Building,
  CreditCard,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export const MyBookingsView: React.FC = () => {
  const { bookings, setCurrentView, setActiveBookingId, activeBooking, activeBookingId, language } = useBooking();

  // Form pencarian wajib diisi terlebih dahulu untuk privasi data (Customer A tidak boleh melihat Customer B)
  const [bookingCodeInput, setBookingCodeInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [matchedBooking, setMatchedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (activeBooking && !hasSearched) {
      setBookingCodeInput(activeBooking.id);
      setPhoneInput(activeBooking.guestPhone);
      setMatchedBooking(activeBooking);
      setHasSearched(true);
    }
  }, [activeBooking]);

  const normalizePhone = (phoneStr: string): string => {
    const digitsOnly = phoneStr.replace(/\D/g, '');
    if (digitsOnly.startsWith('62')) {
      return '0' + digitsOnly.slice(2);
    }
    return digitsOnly;
  };

  const normalizeCode = (codeStr: string): string => {
    return codeStr.trim().toUpperCase().replace(/\s+/g, '');
  };

  const handleSearchBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanCode = normalizeCode(bookingCodeInput);
    const cleanPhone = normalizePhone(phoneInput);

    if (!cleanCode || !cleanPhone) {
      setErrorMessage(
        language === 'id'
          ? 'Silakan masukkan Kode Booking dan Nomor WhatsApp.'
          : 'Please enter Booking Code and WhatsApp Number.'
      );
      setMatchedBooking(null);
      setHasSearched(true);
      return;
    }

    // Cari booking yang cocok dengan kode booking DAN nomor whatsapp pemesan
    const found = bookings.find((b) => {
      const bCodeNorm = normalizeCode(b.id);
      const bPhoneNorm = normalizePhone(b.guestPhone);

      const codeMatches =
        bCodeNorm === cleanCode ||
        bCodeNorm.endsWith(cleanCode) ||
        cleanCode.endsWith(bCodeNorm);

      const phoneMatches =
        bPhoneNorm === cleanPhone ||
        (cleanPhone.length >= 8 && bPhoneNorm.endsWith(cleanPhone.slice(-8))) ||
        (bPhoneNorm.length >= 8 && cleanPhone.endsWith(bPhoneNorm.slice(-8)));

      return codeMatches && phoneMatches;
    });

    setHasSearched(true);
    if (found) {
      setMatchedBooking(found);
      setErrorMessage('');
    } else {
      setMatchedBooking(null);
      setErrorMessage('Tidak ditemukan data booking.');
    }
  };

  const handleResetSearch = () => {
    setBookingCodeInput('');
    setPhoneInput('');
    setMatchedBooking(null);
    setHasSearched(false);
    setErrorMessage('');
  };

  const handleOpenPass = (bookingId: string) => {
    setActiveBookingId(bookingId);
    setCurrentView('booking_flow');
  };

  return (
    <div className="min-h-[100dvh] bg-[#ECEEF2] text-[#12151B] flex flex-col justify-between select-none pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#ECEEF2]/95 backdrop-blur-md px-5 py-3.5 border-b border-neutral-300/70 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('home')}
          className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-800 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="text-center">
          <h1 className="text-base font-black text-neutral-900 tracking-tight">
            {language === 'id' ? 'Pesanan Saya' : 'My Bookings'}
          </h1>
          <span className="text-[10px] text-neutral-500 font-semibold block">
            {language === 'id' ? 'Verifikasi Data & Tiket Reservasi' : 'Reservation Verification & Pass'}
          </span>
        </div>

        <div className="w-10 h-10" />
      </header>

      {/* Main Content Area */}
      <main className="px-5 py-4 space-y-4 flex-grow">
        {/* Form Pengecekan Booking (Privasi Ketat) */}
        <div className="bg-white rounded-[26px] p-5 shadow-xs border border-neutral-200/90 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Pencarian Reservasi
              </h2>
              <p className="text-[11px] text-neutral-500">
                Masukkan Kode Booking dan Nomor WhatsApp untuk melihat reservasi Anda.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearchBooking} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Kode Booking <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bookingCodeInput}
                onChange={(e) => setBookingCodeInput(e.target.value)}
                placeholder="Contoh: GBH-9812"
                className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-mono font-bold text-neutral-900 placeholder:text-neutral-400 placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-emerald-700 uppercase"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Nomor WhatsApp Pemesan <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="pt-1 flex gap-2">
              <button
                type="submit"
                className="flex-1 h-11 rounded-2xl bg-[#13281E] hover:bg-[#1A3428] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 text-emerald-200" />
                <span>Cek Pesanan</span>
              </button>

              {hasSearched && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="h-11 px-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  title="Reset Pencarian"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Pesan Error Jika Data Tidak Ditemukan */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">{errorMessage}</strong>
                <span className="text-[11px] text-rose-700">
                  Pastikan Kode Booking dan Nomor WhatsApp sesuai dengan data saat pemesanan.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* HASIL PENCARIAN RESERVASI: HANYA TAMPILKAN TRANSAKSI MILIK CUSTOMER */}
        {matchedBooking && (
          <div className="bg-white rounded-[26px] p-5 shadow-xs border border-neutral-200/90 space-y-4">
            {/* Header Tiket */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {matchedBooking.id}
              </span>

              {/* Status Booking */}
              <div>
                {matchedBooking.status === 'pending_verification' && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Menunggu Verifikasi</span>
                  </span>
                )}
                {matchedBooking.status === 'approved' && (
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-300 flex items-center gap-1">
                    <Check className="w-3 h-3 text-blue-600" />
                    <span>Disetujui Admin</span>
                  </span>
                )}
                {(matchedBooking.status === 'verified' || matchedBooking.status === 'ready_checkin') && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Siap Check-in</span>
                  </span>
                )}
                {matchedBooking.status === 'checked_in' && (
                  <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 text-[10px] font-bold border border-cyan-300 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-cyan-600" />
                    <span>Sudah Check-In</span>
                  </span>
                )}
                {matchedBooking.status === 'completed' && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-300 flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-600" />
                    <span>Selesai</span>
                  </span>
                )}
                {(matchedBooking.status === 'rejected' || matchedBooking.status === 'cancelled') && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-300 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Dibatalkan</span>
                  </span>
                )}
              </div>
            </div>

            {/* Foto & Nama Penginapan */}
            <div className="flex items-center gap-3">
              <SafeImage
                src={matchedBooking.propertyImage}
                alt={matchedBooking.propertyName}
                className="w-16 h-16 rounded-2xl object-cover"
                containerClassName="w-16 h-16 rounded-2xl shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Penginapan
                </span>
                <h3 className="font-black text-sm text-neutral-900 truncate">
                  {matchedBooking.propertyName}
                </h3>
                <span className="text-xs font-semibold text-emerald-800 block truncate mt-0.5">
                  {matchedBooking.roomTypeName}
                </span>
              </div>
            </div>

            {/* Detail Informasi Yang Wajib Tampil Sesuai Permintaan */}
            <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-neutral-700">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">
                    Nama Pemesan
                  </span>
                  <strong className="text-neutral-900 block truncate">
                    {matchedBooking.guestName}
                  </strong>
                  {matchedBooking.asalKota && (
                    <span className="text-[10px] text-neutral-500 block">
                      Kota: {matchedBooking.asalKota}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">
                    Jumlah Tamu
                  </span>
                  <strong className="text-neutral-900 block">
                    {matchedBooking.guestsCount} Orang
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">
                    Tanggal Menginap
                  </span>
                  <strong className="text-neutral-900 block text-[11px]">
                    {matchedBooking.checkInDate} s/d {matchedBooking.checkOutDate}
                  </strong>
                  <span className="text-[10px] text-neutral-500">
                    ({matchedBooking.totalNights} Malam)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">
                    Status Pembayaran
                  </span>
                  <div className="mt-0.5">
                    {matchedBooking.paymentType === 'full_100' || matchedBooking.dpPercentage === 100 ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Lunas 100% (Rp {matchedBooking.totalAmount.toLocaleString('id-ID')})
                      </span>
                    ) : (
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                          DP 50% (Rp {(matchedBooking.dpAmount || Math.round(matchedBooking.totalAmount * 0.5)).toLocaleString('id-ID')})
                        </span>
                        <span className="text-[10px] text-neutral-500 block mt-0.5">
                          Sisa: Rp {(matchedBooking.remainingBalance || (matchedBooking.totalAmount - (matchedBooking.dpAmount || 0))).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tiket QR */}
            <div className="p-4 bg-white rounded-2xl border border-dashed border-neutral-300 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[11px] font-bold text-neutral-700">
                Tiket QR Check-In
              </span>
              <div className="p-2.5 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    `GBH:BOOKING:${matchedBooking.id}|GUEST:${matchedBooking.guestName}|STATUS:${matchedBooking.status}`
                  )}`}
                  alt="Tiket QR"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <p className="text-[10px] text-neutral-500 max-w-xs">
                Tunjukkan QR Code ini kepada resepsionis saat tiba di homestay untuk verifikasi langsung.
              </p>

              <button
                onClick={() => handleOpenPass(matchedBooking.id)}
                className="mt-1 h-9 px-4 rounded-xl bg-neutral-900 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                <span>Buka Detail Tiket Digital</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Customer Bottom Navigation */}
      <CustomerBottomNav />
    </div>
  );
};

