import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Property, RoomType, Booking } from '../types';
import { SafeImage } from './common/SafeImage';
import { SAMPLE_KTP_SVG, SAMPLE_PAYMENT_SVG } from '../data/mockAssets';
import {
  Home,
  Bell,
  CheckCircle2,
  FileText,
  CreditCard,
  Edit3,
  Search,
  LayoutGrid,
  CheckSquare,
  Building,
  BarChart3,
  Settings,
  X,
  Plus,
  Trash2,
  Upload,
  Check,
  Signal,
  Wifi,
  Battery,
  Layers,
  Sparkles,
  LogOut,
  Bed,
  Bath,
  Users,
  AlertCircle,
  Eye,
  Calendar,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    accommodations,
    addAccommodation,
    updateAccommodation,
    deleteAccommodation,
    addRoomType,
    updateRoomType,
    deleteRoomType,
    toggleRoomAvailability,
    toggleDateBlock,
    resetToDefaultData,
    bookings,
    verifyBooking,
    rejectBooking,
    setCurrentView,
    setRole,
    logoutStaff,
    navigateTo,
    language,
    t,
  } = useBooking();

  const [adminNavTab, setAdminNavTab] = useState<'dashboard' | 'verifikasi' | 'units' | 'kalender' | 'laporan' | 'pengaturan'>('dashboard');
  const [previewDoc, setPreviewDoc] = useState<{ type: 'ktp' | 'transfer'; url: string; title: string } | null>(null);
  const [approvedToast, setApprovedToast] = useState<string>('');

  // Kalender Booking State
  const [calMonth, setCalMonth] = useState<number>(9); // 9 = Oktober (0-indexed)
  const [calYear, setCalYear] = useState<number>(2025);
  const [calPropId, setCalPropId] = useState<string>('all');
  const [calRoomId, setCalRoomId] = useState<string>('all');

  // Booking Filter
  const [bookingFilterStatus, setBookingFilterStatus] = useState<'all' | 'pending_verification' | 'verified' | 'checked_in' | 'rejected'>('all');
  const [selectedAccFilter, setSelectedAccFilter] = useState<string>('all');

  // Modal State untuk Edit / Tambah Akomodasi
  const [editingAccommodation, setEditingAccommodation] = useState<Property | null>(null);
  const [isAddingNewAcc, setIsAddingNewAcc] = useState<boolean>(false);
  const [accName, setAccName] = useState<string>('');
  const [accTagline, setAccTagline] = useState<string>('');
  const [accLocation, setAccLocation] = useState<string>('');
  const [accImage, setAccImage] = useState<string>('');
  const [accDesc, setAccDesc] = useState<string>('');
  const [accHighlights, setAccHighlights] = useState<string>('');

  // Modal State untuk Tambah / Edit Room Type
  const [managingRoomsForAccId, setManagingRoomsForAccId] = useState<string | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [roomNameInput, setRoomNameInput] = useState<string>('');
  const [roomPriceInput, setRoomPriceInput] = useState<number>(350000);
  const [roomCapacityInput, setRoomCapacityInput] = useState<number>(4);
  const [roomBedsInput, setRoomBedsInput] = useState<number>(2);
  const [roomBathsInput, setRoomBathsInput] = useState<number>(1);
  const [roomImageInput, setRoomImageInput] = useState<string>('');
  const [roomDescInput, setRoomDescInput] = useState<string>('');
  const [roomFeaturesInput, setRoomFeaturesInput] = useState<string>('Kamar AC, Free WiFi');

  // Reject Modal
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  // Hitung Statistik Dinamis
  const pendingBookings = bookings.filter((b) => b.status === 'pending_verification');
  const verifiedBookings = bookings.filter((b) => b.status === 'verified');
  const checkedInBookings = bookings.filter((b) => b.status === 'checked_in');
  const totalRevenue = bookings
    .filter((b) => b.status === 'verified' || b.status === 'checked_in')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilterStatus !== 'all' && b.status !== bookingFilterStatus) return false;
    if (selectedAccFilter !== 'all' && b.propertyId !== selectedAccFilter) return false;
    return true;
  });

  const handleVerifikasiId = async (id: string, nama: string) => {
    await verifyBooking(id, 'Verifikasi identitas dan pembayaran disetujui Pengelola.');
    setApprovedToast(`Booking ${nama} berhasil diverifikasi & Fast Pass ID Terbit!`);
    setTimeout(() => setApprovedToast(''), 3500);
  };

  const handleConfirmReject = async () => {
    if (!rejectingBookingId) return;
    await rejectBooking(rejectingBookingId, rejectionReasonInput || 'Foto KTP atau bukti transfer tidak valid.');
    setApprovedToast(`Booking telah ditolak dengan catatan.`);
    setRejectingBookingId(null);
    setRejectionReasonInput('');
    setTimeout(() => setApprovedToast(''), 3500);
  };

  // Open Edit Accommodation Modal
  const openEditAccModal = (prop: Property) => {
    setEditingAccommodation(prop);
    setIsAddingNewAcc(false);
    setAccName(prop.name);
    setAccTagline(language === 'id' ? prop.tagline : prop.taglineEn);
    setAccLocation(prop.location);
    setAccImage(prop.image);
    setAccDesc(language === 'id' ? prop.description : prop.descriptionEn);
    setAccHighlights(prop.highlights.join('\n'));
  };

  // Open Add Accommodation Modal
  const openAddAccModal = () => {
    setEditingAccommodation(null);
    setIsAddingNewAcc(true);
    setAccName('');
    setAccTagline('Homestay Keluarga Nyaman Dekat Pantai');
    setAccLocation('Pantai Sundak, Gunungkidul, Yogyakarta');
    setAccImage('https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80');
    setAccDesc('Penginapan keluarga yang luas, bersih dan nyaman berjarak jalan kaki ke pantai.');
    setAccHighlights('4 Kamar Ber-AC\n3 Kamar Mandi Bersih\nRuang Keluarga Luas\nKulkas & TV\nKipas Angin\nDapur Lengkap\nMesin Cuci\nFree WiFi');
  };

  // Save Accommodation (Add or Update)
  const handleSaveAccommodation = () => {
    if (!accName.trim()) return;

    const parsedHighlights = accHighlights
      .split('\n')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    if (isAddingNewAcc) {
      addAccommodation({
        name: accName,
        tagline: accTagline,
        taglineEn: accTagline,
        category: 'Homestay',
        location: accLocation,
        fullAddress: `${accLocation}, Gunungkidul, DI Yogyakarta`,
        rating: 4.9,
        reviewsCount: 1,
        badge: 'Baru',
        badgeEn: 'New',
        image: accImage || 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80',
        gallery: [accImage || 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80'],
        description: accDesc,
        descriptionEn: accDesc,
        highlights: parsedHighlights.length > 0 ? parsedHighlights : ['Kamar Ber-AC', 'Kamar Mandi Bersih', 'Free WiFi'],
        highlightsEn: parsedHighlights.length > 0 ? parsedHighlights : ['AC Rooms', 'Clean Bathrooms', 'Free WiFi'],
        roomTypes: [
          {
            id: `room-${Date.now()}`,
            name: 'Kamar Tidur Utama AC',
            nameEn: 'Master AC Bedroom',
            description: 'Kamar tidur sejuk berpendingin AC dengan fasilitas lengkap.',
            descriptionEn: 'Comfortable air-conditioned bedroom with full amenities.',
            pricePerNight: 300000,
            usdPricePerNight: 20,
            capacityGuests: 4,
            bedsCount: 2,
            bathsCount: 1,
            areaSqft: 350,
            isAvailable: true,
            image: accImage || 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80',
            features: ['AC', 'Free WiFi', 'Kamar Mandi Bersih'],
            featuresEn: ['AC', 'Free WiFi', 'Clean Bathroom'],
          },
        ],
      });
      setApprovedToast('Homestay baru berhasil ditambahkan!');
    } else if (editingAccommodation) {
      updateAccommodation(editingAccommodation.id, {
        name: accName,
        tagline: accTagline,
        location: accLocation,
        image: accImage,
        description: accDesc,
        highlights: parsedHighlights.length > 0 ? parsedHighlights : editingAccommodation.highlights,
      });
      setApprovedToast('Data homestay berhasil diperbarui!');
    }

    setEditingAccommodation(null);
    setIsAddingNewAcc(false);
    setTimeout(() => setApprovedToast(''), 3000);
  };

  // Save Room (Add or Update)
  const handleSaveRoom = () => {
    if (!managingRoomsForAccId || !roomNameInput.trim()) return;

    const parsedFeatures = roomFeaturesInput
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (editingRoom) {
      updateRoomType(managingRoomsForAccId, editingRoom.id, {
        name: roomNameInput,
        nameEn: roomNameInput,
        pricePerNight: Number(roomPriceInput),
        usdPricePerNight: Math.round(Number(roomPriceInput) / 15300),
        capacityGuests: Number(roomCapacityInput),
        bedsCount: Number(roomBedsInput),
        bathsCount: Number(roomBathsInput),
        image: roomImageInput || editingRoom.image,
        description: roomDescInput,
        descriptionEn: roomDescInput,
        features: parsedFeatures.length > 0 ? parsedFeatures : editingRoom.features,
      });
      setApprovedToast('Tipe kamar berhasil diperbarui!');
    } else if (isAddingRoom) {
      addRoomType(managingRoomsForAccId, {
        name: roomNameInput,
        nameEn: roomNameInput,
        description: roomDescInput || 'Kamar sejuk ber-AC dengan fasilitas lengkap homestay.',
        descriptionEn: roomDescInput || 'Air-conditioned room with homestay amenities.',
        pricePerNight: Number(roomPriceInput),
        usdPricePerNight: Math.round(Number(roomPriceInput) / 15300),
        capacityGuests: Number(roomCapacityInput),
        bedsCount: Number(roomBedsInput),
        bathsCount: Number(roomBathsInput),
        areaSqft: 400,
        isAvailable: true,
        image: roomImageInput || 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
        features: parsedFeatures.length > 0 ? parsedFeatures : ['Kamar AC', 'Free WiFi'],
        featuresEn: parsedFeatures.length > 0 ? parsedFeatures : ['AC Room', 'Free WiFi'],
      });
      setApprovedToast('Tipe kamar baru berhasil ditambahkan!');
    }

    setIsAddingRoom(false);
    setEditingRoom(null);
    setTimeout(() => setApprovedToast(''), 3000);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-24">
      {/* Status Bar HP */}
      <div className="sticky top-0 z-30 bg-[#F6F7F9]/90 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-neutral-800 text-xs font-semibold">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Header Admin Management */}
      <header className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRole('customer');
              setCurrentView('home');
            }}
            className="w-11 h-11 rounded-2xl bg-white shadow-xs border border-neutral-200/80 flex items-center justify-center text-neutral-800 active:scale-95 transition-transform cursor-pointer"
            aria-label="Kembali ke Tamu"
          >
            <Home className="w-5 h-5 text-neutral-800" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-[17px] font-extrabold text-neutral-900 tracking-tight">
                {t.adminTitle}
              </h1>
              <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
            </div>
            <p className="text-[11px] text-neutral-500 font-normal">
              {t.adminSub}
            </p>
          </div>
        </div>

        {/* Right Action: Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              logoutStaff();
              if (navigateTo) navigateTo('/');
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
            title="Kunci Sesi Admin & Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.logoutButton}</span>
          </button>
        </div>
      </header>

      {/* Toast Notifikasi Sukses */}
      {approvedToast && (
        <div className="mx-5 mb-2 p-3 rounded-2xl bg-[#EBF8F2] border border-[#C6ECD8] text-[#1DB954] text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{approvedToast}</span>
          <button onClick={() => setApprovedToast('')}>
            <X className="w-4 h-4 text-[#1DB954]" />
          </button>
        </div>
      )}

      {/* Konten Utama */}
      <div className="px-5 pt-1 pb-4 space-y-5 flex-grow">
        {/* Horizontal Statistics Cards */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          <div
            onClick={() => {
              setAdminNavTab('verifikasi');
              setBookingFilterStatus('pending_verification');
            }}
            className="min-w-[130px] p-4 rounded-[22px] bg-white border border-neutral-200/80 shadow-xs flex-1 cursor-pointer hover:border-amber-400 transition-all"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              <span>{t.statReservations}</span>
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            </div>
            <span className="text-[26px] font-black text-neutral-900 block mt-1 leading-none font-sans">
              {pendingBookings.length}
            </span>
            <span className="text-[11px] text-neutral-400 mt-1 block">{t.statWaiting}</span>
          </div>

          <div
            onClick={() => {
              setAdminNavTab('verifikasi');
              setBookingFilterStatus('verified');
            }}
            className="min-w-[130px] p-4 rounded-[22px] bg-white border border-neutral-200/80 shadow-xs flex-1 cursor-pointer hover:border-blue-400 transition-all"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              <span>{t.statKtp}</span>
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            </div>
            <span className="text-[26px] font-black text-neutral-900 block mt-1 leading-none font-sans">
              {verifiedBookings.length + checkedInBookings.length}
            </span>
            <span className="text-[11px] text-neutral-400 mt-1 block">Telah Lunas / Masuk</span>
          </div>

          <div className="min-w-[140px] p-4 rounded-[22px] bg-white border border-neutral-200/80 shadow-xs flex-1">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              {t.statFunds}
            </div>
            <span className="text-[20px] font-black text-neutral-900 block mt-1 leading-none font-sans truncate">
              Rp {(totalRevenue / 1000000).toFixed(1)}M
            </span>
            <span className="text-[11px] text-[#1DB954] mt-1 font-semibold flex items-center gap-0.5">
              <span>{t.statFundsIn}</span>
            </span>
          </div>
        </div>

        {/* =========================================================================
            1. BOOKING MANAGEMENT (ANTREAN & DAFTAR BOOKING DENGAN VERIFIKASI/TOLAK)
           ========================================================================= */}
        {(adminNavTab === 'dashboard' || adminNavTab === 'verifikasi') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-black tracking-tight text-neutral-900 uppercase">
                  {t.queueTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                  {pendingBookings.length} Menunggu
                </span>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setBookingFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                    bookingFilterStatus === 'all' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600'
                  }`}
                >
                  Semua ({bookings.length})
                </button>
                <button
                  onClick={() => setBookingFilterStatus('pending_verification')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                    bookingFilterStatus === 'pending_verification' ? 'bg-amber-500 text-white' : 'bg-white text-neutral-600'
                  }`}
                >
                  Review ({pendingBookings.length})
                </button>
              </div>
            </div>

            {/* List Booking Cards */}
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center text-neutral-500 text-xs border border-neutral-200">
                Tidak ada pesanan booking dengan filter ini.
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-[28px] bg-white border border-neutral-200/90 shadow-xs space-y-3"
                >
                  {/* Status & Total Amount Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      {b.status === 'pending_verification' && (
                        <span className="px-3 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] text-[11px] font-bold border border-[#FDE68A]">
                          {t.waitingReviewBadge}
                        </span>
                      )}
                      {b.status === 'verified' && (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                          ✓ Terverifikasi & Siap Check-in
                        </span>
                      )}
                      {b.status === 'checked_in' && (
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                          ✓ Sudah Check-in di Homestay
                        </span>
                      )}
                      {b.status === 'rejected' && (
                        <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                          ✕ Ditolak
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-400 block mt-1 font-mono">
                        ID: {b.id} • NIK: {b.guestNik}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block">{t.totalPay}</span>
                      <span className="text-[16px] font-extrabold text-emerald-800 block">
                        Rp {b.totalAmount.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {b.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Guest and Accommodation Info */}
                  <div>
                    <h3 className="text-[16px] font-extrabold text-neutral-900">{b.guestName} {b.asalKota ? `(Asal: ${b.asalKota})` : ''}</h3>
                    <p className="text-[12px] text-neutral-500 mt-0.5">
                      <strong>{b.propertyName}</strong> • {b.roomTypeName} • {b.totalNights} {t.nights} ({b.guestsCount} tamu)
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Check-in: {b.checkInDate} s/d {b.checkOutDate} • Telp: {b.guestPhone}
                    </p>
                    {b.guestRelationship && (
                      <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                        Hubungan: {b.guestRelationship} {b.vehicleDetail ? `• Kendaraan: ${b.vehicleDetail}` : ''}
                      </p>
                    )}
                    {b.dpAmount ? (
                      <div className="mt-1 flex items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          DP: Rp {b.dpAmount.toLocaleString('id-ID')}
                        </span>
                        <span className="text-neutral-500">
                          Sisa Pelunasan: Rp {(b.remainingBalance || (b.totalAmount - b.dpAmount)).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Preview Documents (KTP & Bukti Transfer) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() =>
                        setPreviewDoc({
                          type: 'ktp',
                          url: b.ktpImageUrl || SAMPLE_KTP_SVG,
                          title: `KTP Tamu: ${b.guestName} (${b.guestNik})`,
                        })
                      }
                      className="p-2.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 flex items-center gap-2.5 text-left active:scale-98 transition-transform cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-xs shrink-0">
                        <FileText className="w-4 h-4 text-neutral-700" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[12px] font-bold text-neutral-900 block truncate">
                          {t.ktpPhoto}
                        </span>
                        <span className="text-[10px] text-[#1DB954] font-semibold block">
                          Lihat KTP
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        setPreviewDoc({
                          type: 'transfer',
                          url: b.paymentProofUrl || SAMPLE_PAYMENT_SVG,
                          title: `Bukti Pembayaran: ${b.guestName} (Rp ${b.totalAmount.toLocaleString('id-ID')})`,
                        })
                      }
                      className="p-2.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200/80 flex items-center gap-2.5 text-left active:scale-98 transition-transform cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-xs shrink-0">
                        <CreditCard className="w-4 h-4 text-neutral-700" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[12px] font-bold text-neutral-900 block truncate">
                          {t.bankTransfer}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium block">
                          Lihat Resi
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Action Buttons for Booking */}
                  {b.status === 'pending_verification' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleVerifikasiId(b.id, b.guestName)}
                        className="flex-1 h-11 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-[13px] font-bold flex items-center justify-center shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {t.verifyIssueId}
                      </button>

                      <button
                        onClick={() => setRejectingBookingId(b.id)}
                        className="h-11 px-4 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[13px] font-bold border border-rose-200 transition-all cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  )}

                  {b.adminNotes && (
                    <div className="p-2.5 rounded-xl bg-neutral-100 text-[11px] text-neutral-600">
                      <strong>Catatan:</strong> {b.adminNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* =========================================================================
            2. ACCOMMODATION & ROOM & AVAILABILITY MANAGEMENT
           ========================================================================= */}
        {(adminNavTab === 'dashboard' || adminNavTab === 'units') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-black tracking-tight text-neutral-900 uppercase">
                {t.manageAccommodations}
              </h2>
              <button
                onClick={openAddAccModal}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#13281E] text-white text-xs font-bold hover:bg-[#1A3428] transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addAccommodation}</span>
              </button>
            </div>

            <div className="space-y-4">
              {accommodations.map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 rounded-[28px] bg-white border border-neutral-200/90 shadow-xs space-y-3"
                >
                  {/* Header Homestay Card */}
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <SafeImage
                        src={prop.image}
                        alt={prop.name}
                        className="w-13 h-13 rounded-2xl object-cover"
                        containerClassName="w-13 h-13 rounded-2xl shrink-0"
                      />
                      <div>
                        <h3 className="text-[15px] font-extrabold text-neutral-900 leading-tight">
                          {prop.name}
                        </h3>
                        <span className="text-[11px] text-neutral-500">
                          {prop.location} • {prop.roomTypes.length} {t.roomTypesAvailable}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Accommodation Info */}
                      <button
                        onClick={() => openEditAccModal(prop)}
                        className="w-8 h-8 rounded-full bg-[#F6F7F9] border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 cursor-pointer"
                        title={t.editAccommodation}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Accommodation */}
                      {accommodations.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Hapus akomodasi "${prop.name}"?`)) {
                              deleteAccommodation(prop.id);
                              setApprovedToast(`Akomodasi "${prop.name}" berhasil dihapus.`);
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 hover:bg-rose-100 cursor-pointer"
                          title={t.deleteAccommodation}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Highlights Pill Preview */}
                  <div className="flex flex-wrap gap-1">
                    {prop.highlights.map((h, hi) => (
                      <span
                        key={hi}
                        className="px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] text-neutral-700 font-medium"
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Daftar Room Types / Paket Kamar Homestay Ini */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-neutral-400">
                        {t.roomTypesList} ({prop.roomTypes.length}):
                      </span>
                      <button
                        onClick={() => {
                          setManagingRoomsForAccId(prop.id);
                          setIsAddingRoom(true);
                          setEditingRoom(null);
                          setRoomNameInput('');
                          setRoomPriceInput(350000);
                          setRoomCapacityInput(4);
                          setRoomBedsInput(2);
                          setRoomBathsInput(1);
                          setRoomImageInput('');
                          setRoomDescInput('');
                          setRoomFeaturesInput('Kamar AC, Free WiFi');
                        }}
                        className="text-[11px] font-bold text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t.addRoomType}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {prop.roomTypes.map((room) => (
                        <div
                          key={room.id}
                          className="p-3 rounded-2xl bg-[#F8F9FA] border border-neutral-200/80 flex items-center justify-between text-xs gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <SafeImage
                              src={room.image}
                              alt={room.name}
                              className="w-11 h-11 rounded-xl object-cover"
                              containerClassName="w-11 h-11 rounded-xl shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-extrabold text-neutral-900 block truncate">
                                {language === 'id' ? room.name : room.nameEn}
                              </span>
                              <span className="text-[11px] text-emerald-800 font-bold block">
                                Rp {room.pricePerNight.toLocaleString('id-ID')} /{t.perNight}
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                Kapasitas: {room.capacityGuests} tamu • {room.bedsCount} bed • {room.bathsCount} bath
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons: Availability Toggle, Edit, Delete */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Availability Toggle */}
                            <button
                              onClick={() => toggleRoomAvailability(prop.id, room.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                                room.isAvailable
                                  ? 'bg-[#EBF8F2] text-[#1DB954] border border-[#C6ECD8]'
                                  : 'bg-rose-50 text-rose-600 border border-rose-200'
                              }`}
                              title="Klik untuk ubah ketersediaan kamar"
                            >
                              {room.isAvailable ? t.detailAvailable : t.detailUnavailable}
                            </button>

                            {/* Edit Room */}
                            <button
                              onClick={() => {
                                setManagingRoomsForAccId(prop.id);
                                setEditingRoom(room);
                                setIsAddingRoom(false);
                                setRoomNameInput(room.name);
                                setRoomPriceInput(room.pricePerNight);
                                setRoomCapacityInput(room.capacityGuests);
                                setRoomBedsInput(room.bedsCount);
                                setRoomBathsInput(room.bathsCount);
                                setRoomImageInput(room.image);
                                setRoomDescInput(room.description);
                                setRoomFeaturesInput(room.features.join(', '));
                              }}
                              className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 cursor-pointer"
                              title="Edit Tipe Kamar"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            {/* Delete Room */}
                            {prop.roomTypes.length > 1 && (
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus tipe kamar "${room.name}"?`)) {
                                    deleteRoomType(prop.id, room.id);
                                    setApprovedToast(`Tipe kamar "${room.name}" berhasil dihapus.`);
                                  }
                                }}
                                className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 hover:bg-rose-100 cursor-pointer"
                                title="Hapus Tipe Kamar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            3. KALENDER BOOKING MANAGEMENT (MENGATUR KALENDER BOOKING)
           ========================================================================= */}
        {(adminNavTab === 'dashboard' || adminNavTab === 'kalender') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-black tracking-tight text-neutral-900 uppercase">
                  Pengaturan Kalender Booking
                </h2>
                <span className="text-[11px] text-neutral-500">
                  Pantau ketersediaan dan klik tanggal untuk memblokir / membuka kamar
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Reset seluruh data penginapan dan kamar ke data default harga asli Sundak & Trenggole?')) {
                    resetToDefaultData();
                    setApprovedToast('Data berhasil direset ke standar harga asli!');
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold cursor-pointer"
                title="Reset Database ke Data Asli"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Asli</span>
              </button>
            </div>

            {/* Filter Penginapan & Kamar untuk Kalender */}
            <div className="p-4 rounded-[26px] bg-white border border-neutral-200/90 shadow-xs space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Pilih Penginapan
                  </label>
                  <select
                    value={calPropId}
                    onChange={(e) => {
                      setCalPropId(e.target.value);
                      setCalRoomId('all');
                    }}
                    className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                  >
                    <option value="all">Semua Penginapan</option>
                    {accommodations.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name.replace('Griya Barokah ', '')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Pilih Tipe Kamar
                  </label>
                  <select
                    value={calRoomId}
                    onChange={(e) => setCalRoomId(e.target.value)}
                    disabled={calPropId === 'all'}
                    className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none disabled:opacity-50"
                  >
                    <option value="all">Semua Kamar / Homestay</option>
                    {calPropId !== 'all' &&
                      accommodations
                        .find((p) => p.id === calPropId)
                        ?.roomTypes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {/* Month Selector */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                <button
                  onClick={() => {
                    if (calMonth === 0) {
                      setCalMonth(11);
                      setCalYear(calYear - 1);
                    } else {
                      setCalMonth(calMonth - 1);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center font-black text-sm text-neutral-900">
                  {new Date(calYear, calMonth, 1).toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>

                <button
                  onClick={() => {
                    if (calMonth === 11) {
                      setCalMonth(0);
                      setCalYear(calYear + 1);
                    } else {
                      setCalMonth(calMonth + 1);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] text-neutral-600 font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-400" />
                  <span>Tersedia</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-400" />
                  <span>Terisi Tamu</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-100 border border-rose-400" />
                  <span>Diblokir</span>
                </span>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 pt-1 text-center">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                  <span key={d} className="text-[10px] font-bold text-neutral-400 py-1">
                    {d}
                  </span>
                ))}

                {Array.from({ length: new Date(calYear, calMonth, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10" />
                ))}

                {Array.from({ length: new Date(calYear, calMonth + 1, 0).getDate() }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

                  // Cek apakah ada booking aktif pada tanggal ini
                  const matchedBooking = bookings.find((b) => {
                    if (b.status === 'rejected') return false;
                    if (calPropId !== 'all' && b.propertyId !== calPropId) return false;
                    return b.checkInDate <= dateStr && dateStr < b.checkOutDate;
                  });

                  // Cek apakah tanggal diblokir
                  const isBlocked = accommodations.some((p) => {
                    if (calPropId !== 'all' && p.id !== calPropId) return false;
                    const pBlocked = p.blockedDates?.includes(dateStr);
                    if (pBlocked) return true;
                    if (calRoomId !== 'all') {
                      const r = p.roomTypes.find((r) => r.id === calRoomId);
                      return r?.blockedDates?.includes(dateStr);
                    }
                    return false;
                  });

                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        const targetPropId = calPropId !== 'all' ? calPropId : accommodations[0]?.id;
                        if (!targetPropId) return;
                        const targetRoomId = calRoomId !== 'all' ? calRoomId : undefined;
                        toggleDateBlock(targetPropId, dateStr, targetRoomId);
                        setApprovedToast(`Status tanggal ${dateStr} berhasil diubah!`);
                        setTimeout(() => setApprovedToast(''), 2500);
                      }}
                      className={`h-11 rounded-xl p-1 text-xs font-bold transition-all flex flex-col items-center justify-between border cursor-pointer active:scale-95 ${
                        isBlocked
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : matchedBooking
                          ? 'bg-blue-50 border-blue-300 text-blue-900'
                          : 'bg-emerald-50/50 border-emerald-200/70 text-emerald-950 hover:bg-emerald-100/50'
                      }`}
                      title={
                        isBlocked
                          ? 'Tanggal diblokir oleh admin. Klik untuk buka.'
                          : matchedBooking
                          ? `Terisi tamu: ${matchedBooking.guestName} (${matchedBooking.id})`
                          : 'Tersedia. Klik untuk blokir.'
                      }
                    >
                      <span className="text-[11px] leading-none">{dayNum}</span>
                      <span className="text-[9px] font-extrabold truncate w-full px-0.5">
                        {isBlocked ? '🔒 Blok' : matchedBooking ? '👤 Tamu' : '✓ Buka'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 text-[11px] text-neutral-600 flex items-center justify-between">
                <span>💡 Klik pada tanggal kalender di atas untuk memblokir atau membuka booking.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL EDIT / TAMBAH AKOMODASI ================= */}
      {(editingAccommodation || isAddingNewAcc) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[28px] overflow-hidden shadow-2xl p-5 space-y-3.5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <h3 className="font-extrabold text-[15px] text-neutral-900">
                {isAddingNewAcc ? t.addAccommodation : t.editAccommodation}
              </h3>
              <button
                onClick={() => {
                  setEditingAccommodation(null);
                  setIsAddingNewAcc(false);
                }}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nama Homestay</label>
                <input
                  type="text"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="e.g. Griya Barokah Pantai Sundak"
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Tagline Singkat</label>
                <input
                  type="text"
                  value={accTagline}
                  onChange={(e) => setAccTagline(e.target.value)}
                  placeholder="e.g. Homestay Nyaman Keluarga Dekat Pasir Putih"
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Lokasi Pantai</label>
                <input
                  type="text"
                  value={accLocation}
                  onChange={(e) => setAccLocation(e.target.value)}
                  placeholder="e.g. Pantai Sundak, Gunungkidul, Yogyakarta"
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">URL Foto Homestay</label>
                <input
                  type="url"
                  value={accImage}
                  onChange={(e) => setAccImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Daftar Fasilitas Utama (1 baris per fasilitas)
                </label>
                <textarea
                  value={accHighlights}
                  onChange={(e) => setAccHighlights(e.target.value)}
                  rows={4}
                  placeholder="4 AC rooms&#10;3 bathrooms&#10;Family room&#10;Refrigerator&#10;Free WiFi"
                  className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Deskripsi Lengkap</label>
                <textarea
                  value={accDesc}
                  onChange={(e) => setAccDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setEditingAccommodation(null);
                  setIsAddingNewAcc(false);
                }}
                className="flex-1 h-11 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveAccommodation}
                className="flex-1 h-11 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH / EDIT ROOM TYPE ================= */}
      {(isAddingRoom || editingRoom) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[28px] overflow-hidden shadow-2xl p-5 space-y-3.5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <h3 className="font-extrabold text-[15px] text-neutral-900">
                {isAddingRoom ? t.addRoomType : 'Edit Tipe Kamar'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingRoom(false);
                  setEditingRoom(null);
                }}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nama Tipe Kamar / Paket Sewa</label>
                <input
                  type="text"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  placeholder="e.g. Kamar AC Kamar Mandi Dalam"
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Harga / Malam (IDR)</label>
                  <input
                    type="number"
                    step="50000"
                    value={roomPriceInput}
                    onChange={(e) => setRoomPriceInput(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-mono font-bold text-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Kapasitas Tamu</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={roomCapacityInput}
                    onChange={(e) => setRoomCapacityInput(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Jumlah Tempat Tidur</label>
                  <input
                    type="number"
                    min="1"
                    value={roomBedsInput}
                    onChange={(e) => setRoomBedsInput(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Jumlah Kamar Mandi</label>
                  <input
                    type="number"
                    min="1"
                    value={roomBathsInput}
                    onChange={(e) => setRoomBathsInput(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Fitur Kamar (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={roomFeaturesInput}
                  onChange={(e) => setRoomFeaturesInput(e.target.value)}
                  placeholder="Kamar AC, Kamar Mandi Dalam, Free WiFi"
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">URL Foto Kamar</label>
                <input
                  type="url"
                  value={roomImageInput}
                  onChange={(e) => setRoomImageInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Deskripsi Kamar</label>
                <textarea
                  value={roomDescInput}
                  onChange={(e) => setRoomDescInput(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setIsAddingRoom(false);
                  setEditingRoom(null);
                }}
                className="flex-1 h-11 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveRoom}
                className="flex-1 h-11 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak Booking */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-2xl p-5 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-bold text-sm text-neutral-900">Tolak Permohonan Booking</span>
              <button
                onClick={() => setRejectingBookingId(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-neutral-700 block">Alasan Penolakan</label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Contoh: Bukti transfer tidak terbaca / KTP buram..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRejectingBookingId(null)}
                className="flex-1 h-10 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview KTP / Bukti Transfer */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-bold text-xs text-neutral-900 truncate pr-2">
                {previewDoc.title}
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center p-1">
              <img
                src={previewDoc.url}
                alt="Preview Dokumen"
                className="w-full object-contain max-h-72 rounded-xl"
              />
            </div>

            <button
              onClick={() => setPreviewDoc(null)}
              className="w-full h-11 rounded-full bg-[#13281E] text-white font-bold text-xs cursor-pointer"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Admin */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-6 py-2.5 max-w-md mx-auto">
        <div className="flex items-center justify-between text-neutral-500">
          <button
            onClick={() => setAdminNavTab('dashboard')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              adminNavTab === 'dashboard' ? 'text-neutral-900 font-bold' : ''
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                adminNavTab === 'dashboard' ? 'bg-[#13281E] text-white' : 'text-neutral-500'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-[10px]">{t.adminNavDashboard}</span>
          </button>

          <button
            onClick={() => setAdminNavTab('verifikasi')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              adminNavTab === 'verifikasi' ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                adminNavTab === 'verifikasi' ? 'bg-[#13281E] text-white' : 'text-neutral-500'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px]">{t.adminNavVerify}</span>
          </button>

          <button
            onClick={() => setAdminNavTab('units')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              adminNavTab === 'units' ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                adminNavTab === 'units' ? 'bg-[#13281E] text-white' : 'text-neutral-500'
              }`}
            >
              <Building className="w-5 h-5" />
            </div>
            <span className="text-[10px]">{t.adminNavUnits}</span>
          </button>

          <button
            onClick={() => setAdminNavTab('kalender')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              adminNavTab === 'kalender' ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                adminNavTab === 'kalender' ? 'bg-[#13281E] text-white' : 'text-neutral-500'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px]">Kalender</span>
          </button>

          <button
            onClick={() => {
              setAdminNavTab('verifikasi');
              setApprovedToast('Laporan transaksi terintegrasi dengan data reservasi aktif.');
            }}
            className="flex flex-col items-center gap-1 hover:text-neutral-900 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-neutral-500" />
            </div>
            <span className="text-[10px] font-medium text-neutral-500">{t.adminNavReports}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
