import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import {
  QrCode,
  Check,
  Search,
  CheckCircle2,
  Signal,
  Wifi,
  Battery,
  LogOut,
  Home,
  Phone,
  Building,
  Calendar,
  CreditCard,
  User,
  AlertCircle,
} from 'lucide-react';

export const ReceptionistDashboard: React.FC = () => {
  const {
    bookings,
    checkInBooking,
    findBookingById,
    setCurrentView,
    setRole,
    logoutStaff,
    navigateTo,
    language,
  } = useBooking();

  const [bookingIdQuery, setBookingIdQuery] = useState<string>('GBH-2025-9812');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('GBH-2025-9812');
  const [isCheckedInSuccess, setIsCheckedInSuccess] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Ambil booking aktif dari database
  const currentBooking =
    bookings.find(
      (b) =>
        b.id.toLowerCase() === selectedBookingId.toLowerCase().trim() ||
        b.id.toLowerCase() === bookingIdQuery.toLowerCase().trim()
    ) || bookings[0];

  const handleConfirmCheckIn = async () => {
    if (!currentBooking) return;
    const res = await checkInBooking(currentBooking.id);
    if (res.success || currentBooking.status === 'checked_in') {
      setIsCheckedInSuccess(true);
      setToastMessage(`✓ Tamu ${currentBooking.guestName} berhasil Check-in!`);
      setTimeout(() => setToastMessage(''), 3500);
    } else {
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const handleSearch = () => {
    setSearchError('');
    if (!bookingIdQuery.trim()) {
      setSearchError('Masukkan kode booking terlebih dahulu.');
      return;
    }
    const cleanId = bookingIdQuery.trim().toUpperCase();
    const found = findBookingById(cleanId) || bookings.find((b) => b.id.toUpperCase().includes(cleanId));
    if (found) {
      setSelectedBookingId(found.id);
      setIsCheckedInSuccess(found.status === 'checked_in');
      setToastMessage(`✓ Booking ${found.id} berhasil dimuat.`);
      setTimeout(() => setToastMessage(''), 2500);
    } else {
      setSearchError(`Booking "${bookingIdQuery}" tidak ditemukan.`);
    }
  };

  const handleScanSimulation = (id: string) => {
    setSelectedBookingId(id);
    setBookingIdQuery(id);
    const target = bookings.find((b) => b.id === id);
    setIsCheckedInSuccess(target?.status === 'checked_in');
    setIsCameraActive(false);
    setSearchError('');
    setToastMessage(`✓ Berhasil memindai QR Code tiket ${id}`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-8 max-w-md mx-auto">
      {/* Top Status Bar HP */}
      <div className="sticky top-0 z-30 bg-[#F6F7F9]/95 backdrop-blur-md px-4 pt-2 pb-1 flex items-center justify-between text-neutral-700 text-[11px] font-semibold">
        <span>09:41</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Header Resepsionis Compact */}
      <header className="px-4 py-2 flex items-center justify-between border-b border-neutral-200/60 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRole('customer');
              setCurrentView('home');
            }}
            className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 active:scale-95 transition-transform cursor-pointer"
            title="Kembali ke Beranda Tamu"
          >
            <Home className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                Resepsionis Front Desk
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-neutral-400">
              Griya Barokah Homestay
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logoutStaff();
            if (navigateTo) navigateTo('/');
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
          title="Keluar Sesi Resepsionis"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-[10px]">Logout</span>
        </button>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-4 my-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Konten Utama Resepsionis: SCAN QR CODE + DETAIL HASIL SCAN */}
      <main className="px-4 pt-2 pb-6 space-y-3 flex-grow">
        {/* ================= 1. SCAN QR CODE ================= */}
        <div className="rounded-2xl bg-[#161B22] p-4 text-center text-white space-y-2.5 shadow-md">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>SCAN QR CODE</span>
            </span>
            <span className="text-[10px] text-neutral-400">
              {isCameraActive ? 'Kamera Aktif' : 'Siaga'}
            </span>
          </div>

          {/* Scanner Viewfinder Area */}
          <div
            onClick={() => setIsCameraActive(!isCameraActive)}
            className="relative w-full max-w-[240px] h-32 mx-auto flex flex-col items-center justify-center cursor-pointer hover:opacity-95 transition-opacity bg-neutral-900/60 rounded-xl border border-neutral-800"
            title="Klik untuk membuka kamera / simulasi scan QR"
          >
            {/* 4 Corner Markers */}
            <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#22C55E] rounded-tl-md" />
            <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#22C55E] rounded-tr-md" />
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#22C55E] rounded-bl-md" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#22C55E] rounded-br-md" />

            {/* Glowing Scan Reticle */}
            <div className="relative">
              <QrCode className="w-9 h-9 text-[#22C55E]" />
              <div className="absolute -left-12 -right-12 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_10px_#22C55E] animate-pulse" />
            </div>

            <span className="text-[11px] font-bold text-neutral-200 mt-2 block">
              {isCameraActive ? 'Arahkan QR ke Kamera...' : 'Ketuk untuk Buka Pemindai'}
            </span>
            <span className="text-[9px] text-neutral-400">
              atau pilih tiket tamu di bawah
            </span>
          </div>

          {/* Opsi Cepat Pindai Tiket Booking Tamu */}
          <div className="text-left space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Pilih Tiket Tamu (Simulasi Scan QR):
            </span>
            <div className="grid grid-cols-1 gap-1 max-h-28 overflow-y-auto no-scrollbar">
              {bookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleScanSimulation(b.id)}
                  className={`p-1.5 px-2.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                    b.id === selectedBookingId
                      ? 'bg-emerald-900/80 text-white border border-emerald-500'
                      : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60'
                  }`}
                >
                  <div className="truncate mr-2">
                    <strong className="block font-bold text-white text-[11px] truncate">
                      {b.guestName}
                    </strong>
                    <span className="text-neutral-400 text-[9px] block">
                      {b.id} • {b.propertyName.replace('Griya Barokah ', '')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neutral-900 text-emerald-400 border border-emerald-800 shrink-0">
                    Scan
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Manual Kode Booking */}
          <div className="pt-1">
            <div className="h-9 px-2 rounded-xl bg-white flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-1 pl-1">
                <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={bookingIdQuery}
                  onChange={(e) => setBookingIdQuery(e.target.value)}
                  placeholder="Ketik Kode Booking (e.g. GBH-9812)"
                  className="w-full text-[11px] font-mono font-bold text-neutral-900 focus:outline-none uppercase"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="px-3 h-7 rounded-lg bg-[#13281E] hover:bg-[#1A3428] text-white text-[10px] font-bold transition-colors cursor-pointer"
              >
                Cari
              </button>
            </div>
            {searchError && (
              <span className="text-[10px] text-rose-400 block text-left mt-1">
                {searchError}
              </span>
            )}
          </div>
        </div>

        {/* ================= 2. SETELAH SCAN: TAMPILKAN DATA TAMU & TOMBOL CHECK-IN ================= */}
        {currentBooking ? (
          <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
            {/* Header Kode Booking & Status */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <span className="text-[9px] text-neutral-400 uppercase font-bold block">
                  Kode Booking
                </span>
                <span className="text-xs font-mono font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {currentBooking.id}
                </span>
              </div>

              <div>
                {currentBooking.status === 'checked_in' || isCheckedInSuccess ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-[10px] font-bold border border-cyan-300">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Sudah Check-in</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Siap Check-in</span>
                  </span>
                )}
              </div>
            </div>

            {/* INFORMASI WAJIB TAMPIL:
                1. Nama tamu
                2. Nomor HP
                3. Penginapan
                4. Kamar
                5. Tanggal check-in
                6. Status pembayaran */}
            <div className="space-y-2 text-xs">
              {/* 1. Nama Tamu */}
              <div className="flex items-start justify-between">
                <span className="text-neutral-500 font-medium text-[11px]">Nama Tamu:</span>
                <strong className="text-neutral-900 font-extrabold text-right text-xs truncate max-w-[200px]">
                  {currentBooking.guestName}
                </strong>
              </div>

              {/* 2. Nomor HP */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium text-[11px]">Nomor HP:</span>
                <a
                  href={`https://wa.me/${currentBooking.guestPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Phone className="w-3 h-3" />
                  <span>{currentBooking.guestPhone}</span>
                </a>
              </div>

              {/* 3. Penginapan */}
              <div className="flex items-start justify-between">
                <span className="text-neutral-500 font-medium text-[11px]">Penginapan:</span>
                <strong className="text-neutral-900 font-bold text-right text-[11px] truncate max-w-[210px]">
                  {currentBooking.propertyName}
                </strong>
              </div>

              {/* 4. Kamar */}
              <div className="flex items-start justify-between">
                <span className="text-neutral-500 font-medium text-[11px]">Kamar:</span>
                <strong className="text-emerald-800 font-bold text-right text-[11px] truncate max-w-[210px]">
                  {currentBooking.roomTypeName}
                </strong>
              </div>

              {/* 5. Tanggal Check-in */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium text-[11px]">Tanggal Check-in:</span>
                <strong className="text-neutral-900 font-bold text-right text-[11px]">
                  {currentBooking.checkInDate} (s/d {currentBooking.checkOutDate})
                </strong>
              </div>

              {/* 6. Status Pembayaran */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                <span className="text-neutral-500 font-medium text-[11px]">Status Pembayaran:</span>
                <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                  {currentBooking.paymentType === 'full_100' || currentBooking.dpPercentage === 100
                    ? `Lunas 100% (Rp ${currentBooking.totalAmount.toLocaleString('id-ID')})`
                    : `DP 50% (Rp ${(currentBooking.dpAmount || Math.round(currentBooking.totalAmount * 0.5)).toLocaleString('id-ID')})`}
                </span>
              </div>
            </div>

            {/* TOMBOL: "Konfirmasi Check-in" */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmCheckIn}
                className={`w-full h-11 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer ${
                  currentBooking.status === 'checked_in' || isCheckedInSuccess
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-[#13281E] hover:bg-[#1A3428]'
                }`}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {currentBooking.status === 'checked_in' || isCheckedInSuccess
                    ? 'Check-in Telah Dikonfirmasi ✓'
                    : 'Konfirmasi Check-in'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-2xl text-center text-neutral-500 text-xs border border-neutral-200">
            Arahkan kamera ke QR Code tamu atau ketik kode booking di atas untuk memulai check-in.
          </div>
        )}
      </main>
    </div>
  );
};
