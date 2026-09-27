import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import {
  Bell,
  Search,
  Check,
  Key,
  Printer,
  ArrowRight,
  QrCode,
  Users,
  MessageSquare,
  Signal,
  Wifi,
  Battery,
  LogOut,
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
    t,
  } = useBooking();

  const [bookingIdQuery, setBookingIdQuery] = useState<string>('GBR-2025-8821');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('GBR-2025-8821');
  const [isCheckedInSuccess, setIsCheckedInSuccess] = useState<boolean>(false);
  const [receptionTab, setReceptionTab] = useState<'scanner' | 'in_house' | 'kunci' | 'concierge'>('scanner');
  const [printedBill, setPrintedBill] = useState<boolean>(false);

  // Ambil booking aktif dari database bookings
  const currentBooking =
    bookings.find(
      (b) =>
        b.id.toLowerCase() === selectedBookingId.toLowerCase().replace('#', '') ||
        b.id.toLowerCase() === bookingIdQuery.toLowerCase().replace('#', '')
    ) || bookings[0];

  const activeGuest = {
    id: currentBooking?.id || '#GBR-2025-8821',
    nama: currentBooking?.guestName || 'Tamu Homestay',
    inisial: currentBooking?.guestName
      ? currentBooking.guestName
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'GB',
    ktpStatus: `NIK: ${currentBooking?.guestNik || '340301...'} (E-KTP Valid)`,
    vipStatus: 'Keluarga Terverifikasi',
    tamuCount: `${currentBooking?.guestsCount || 4} ${t.detailGuests}`,
    tipeProperti: currentBooking?.propertyName || 'Griya Barokah Pantai Sundak',
    periode: `${currentBooking?.checkInDate || '2025-09-26'} s/d ${currentBooking?.checkOutDate || '2025-09-28'} (${currentBooking?.totalNights || 2} Malam)`,
    unitAlokasi: currentBooking?.roomTypeName || 'Sewa 1 Rumah Penuh',
  };

  const handleConfirmCheckIn = async () => {
    if (currentBooking) {
      await checkInBooking(currentBooking.id);
    }
    setIsCheckedInSuccess(true);
  };

  const handleSearch = () => {
    if (!bookingIdQuery.trim()) return;
    const found = findBookingById(bookingIdQuery.trim().replace('#', ''));
    if (found) {
      setSelectedBookingId(found.id);
      setIsCheckedInSuccess(found.status === 'checked_in');
    } else {
      alert(`Booking dengan ID / NIK / No HP "${bookingIdQuery}" tidak ditemukan.`);
    }
  };

  const handlePrint = () => {
    setPrintedBill(true);
    setTimeout(() => setPrintedBill(false), 2500);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-24">
      {/* Status Bar HP */}
      <div className="sticky top-0 z-30 bg-[#F6F7F9]/90 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-neutral-800 text-xs font-semibold">
        <span>09:41</span>
        {/* Dynamic Island di tengah sesuai resepsionis.png */}
        <div className="w-24 h-4 bg-black rounded-full" />
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">100%</span>
        </div>
      </div>

      {/* Header Receptionist Desk sesuai resepsionis.png */}
      <header className="px-5 py-3 flex items-center justify-between">
        <div>
          {/* Badge Hijau LOBI SIAGA */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF8F2] border border-[#C6ECD8] text-[11px] font-bold text-[#1DB954] mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
            <span>{t.lobbyActive}</span>
          </div>

          <h1 className="text-[20px] font-black text-neutral-900 tracking-tight leading-none">
            {t.receptionTitle}
          </h1>
          <p className="text-[12px] text-neutral-500 mt-0.5">
            {t.receptionSub}
          </p>
        </div>

        {/* Right Action: Notifikasi & Logout */}
        <div className="flex items-center gap-2">
          <button
            className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200/80 flex items-center justify-center text-neutral-800 active:scale-95 transition-transform"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4 text-neutral-800" />
          </button>

          <button
            onClick={() => {
              logoutStaff();
              if (navigateTo) navigateTo('/');
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 active:scale-95 transition-all"
            title="Kunci Sesi Front Desk & Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.logoutButton}</span>
          </button>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="px-5 pt-1 pb-4 space-y-4 flex-grow">
        {/* ================= SCANNER BOX HITAM RETICLE HIJAU (resepsionis.png) ================= */}
        <div className="rounded-[28px] bg-[#161B22] p-5 text-center text-white space-y-3 relative overflow-hidden shadow-md">
          {/* Reticle Area */}
          <div className="relative w-56 h-36 mx-auto flex flex-col items-center justify-center">
            {/* 4 Sudut Hijau Reticle */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-[#22C55E] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-[#22C55E] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-[#22C55E] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-[#22C55E] rounded-br-lg" />

            {/* QR Icon Hijau Neon di Tengah */}
            <div className="relative">
              <QrCode className="w-11 h-11 text-[#22C55E]" />
              {/* Garis Sinar Hijau Laser Bercahaya */}
              <div className="absolute -left-14 -right-14 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_12px_#22C55E]" />
            </div>

            <span className="text-[12px] font-bold text-neutral-200 mt-2 block">
              {t.pointCamera}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>{t.cameraReady}</span>
            </div>
          </div>

          {/* Input Search Box di bawah Reticle */}
          <div className="pt-1">
            <div className="h-12 px-3 rounded-full bg-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 flex-1 pl-1">
                <Search className="w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={bookingIdQuery}
                  onChange={(e) => setBookingIdQuery(e.target.value)}
                  placeholder="#SGR-2025-8891"
                  className="w-full text-xs font-mono font-bold text-neutral-900 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-5 h-9 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {t.searchButton}
              </button>
            </div>
          </div>
        </div>

        {/* ================= KARTU VERIFIKASI TAMU PUTIH (resepsionis.png) ================= */}
        <div className="p-4 rounded-[28px] bg-white border border-neutral-200/90 shadow-xs space-y-3.5">
          {/* Header Status & ID */}
          <div className="flex items-center justify-between pb-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EBF8F2] text-[#1DB954] text-[11px] font-bold border border-[#C6ECD8]">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t.verifiedPaid}</span>
            </span>

            <span className="text-[11px] font-mono text-neutral-400">
              ID: <strong className="text-neutral-800">{activeGuest.id}</strong>
            </span>
          </div>

          {/* Row Profil Tamu */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#181C24] text-white font-extrabold text-sm flex items-center justify-center">
                  {activeGuest.inisial}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1DB954] text-white flex items-center justify-center ring-2 ring-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-extrabold text-neutral-900">
                  {activeGuest.nama}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#F4F5F7] text-[10px] font-bold text-neutral-600">
                    {activeGuest.ktpStatus}
                  </span>
                  <span className="text-[11px] font-bold text-[#1DB954]">
                    • {activeGuest.vipStatus}
                  </span>
                </div>
              </div>
            </div>

            <span className="px-3 py-1.5 rounded-full bg-[#F6F7F9] border border-neutral-200 text-xs font-bold text-neutral-800">
              {activeGuest.tamuCount}
            </span>
          </div>

          {/* Box Detail Alokasi Unit */}
          <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-neutral-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">{t.propertyType}:</span>
              <span className="font-bold text-neutral-900">{activeGuest.tipeProperti}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">{t.stayPeriod}:</span>
              <span className="font-bold text-neutral-900">{activeGuest.periode}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60">
              <span className="text-neutral-500 font-medium">{t.allocatedUnit}:</span>
              <span className="font-extrabold text-[#15803D] bg-[#EBF8F2] px-2 py-0.5 rounded-md">
                {activeGuest.unitAlokasi}
              </span>
            </div>
          </div>

          {/* Baris Keycard / RFID Sync */}
          <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-xs">
                <Key className="w-4 h-4 text-neutral-700" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-neutral-900 block">
                  {t.keycardSync}
                </span>
                <span className="text-[10px] text-[#1DB954] font-medium block">
                  {t.keycardReady}
                </span>
              </div>
            </div>

            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
          </div>

          {/* Tombol Utama Aksi */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleConfirmCheckIn}
              className={`w-full h-13 rounded-full text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer ${
                isCheckedInSuccess ? 'bg-[#15803D]' : 'bg-[#181C24] hover:bg-black'
              }`}
            >
              <span>
                {isCheckedInSuccess
                  ? t.checkedInDone
                  : t.confirmCheckinKey}
              </span>
              {!isCheckedInSuccess && <ArrowRight className="w-4 h-4 text-white" />}
            </button>

            <button
              onClick={handlePrint}
              className="w-full h-11 rounded-full bg-[#F4F5F7] hover:bg-neutral-200 text-neutral-800 text-[12px] font-bold flex items-center justify-center gap-2 border border-neutral-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-neutral-700" />
              <span>{printedBill ? t.billPrinted : t.printBill}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Resepsionis */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-6 py-2.5 max-w-md mx-auto">
        <div className="flex items-center justify-between text-neutral-500">
          <button
            onClick={() => setReceptionTab('scanner')}
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-[#181C24] text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-extrabold text-neutral-900">{t.receptionNavScanner}</span>
          </button>

          <button
            onClick={() => setReceptionTab('in_house')}
            className="flex flex-col items-center gap-1 hover:text-neutral-900 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <Users className="w-5 h-5 text-neutral-500" />
            </div>
            <span className="text-[10px] font-medium text-neutral-500">{t.receptionNavInHouse}</span>
          </button>

          <button
            onClick={() => setReceptionTab('kunci')}
            className="flex flex-col items-center gap-1 hover:text-neutral-900 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <Key className="w-5 h-5 text-neutral-500" />
            </div>
            <span className="text-[10px] font-medium text-neutral-500">{t.receptionNavKeys}</span>
          </button>

          <button
            onClick={() => setReceptionTab('concierge')}
            className="flex flex-col items-center gap-1 hover:text-neutral-900 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-neutral-500" />
            </div>
            <span className="text-[10px] font-medium text-neutral-500">{t.receptionNavConcierge}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
