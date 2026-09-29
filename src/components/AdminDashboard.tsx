import React, { useState, useMemo } from 'react';
import { useBooking } from '../context/BookingContext';
import { Property, RoomType, Booking, BookingStatus } from '../types';
import { SafeImage } from './common/SafeImage';
import { SAMPLE_PAYMENT_SVG } from '../data/mockAssets';
import {
  Home,
  FileText,
  CreditCard,
  Edit3,
  Search,
  Building,
  BarChart3,
  Settings,
  X,
  Plus,
  Trash2,
  Check,
  Signal,
  Wifi,
  Battery,
  LogOut,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  MapPin,
  Users,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckSquare,
  Clock,
  Filter,
  Upload,
  Image as ImageIcon,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    accommodations,
    updateAccommodation,
    deleteAccommodation,
    addAccommodation,
    addRoomType,
    updateRoomType,
    deleteRoomType,
    toggleRoomAvailability,
    toggleDateBlock,
    resetToDefaultData,
    bookings,
    updateBookingStatus,
    rejectBooking,
    setCurrentView,
    setRole,
    logoutStaff,
    navigateTo,
    language,
    t,
    heroImage,
    updateHeroImage,
    facilityImage,
    updateFacilityImage,
    adminWhatsappNumber,
    updateAdminWhatsappNumber,
  } = useBooking();

  // 4 Menu Utama Bawah: 1. Booking, 2. Kalender, 3. Laporan, 4. Pengaturan
  const [adminNavTab, setAdminNavTab] = useState<'booking' | 'kalender' | 'laporan' | 'pengaturan'>('booking');
  const [approvedToast, setApprovedToast] = useState<string>('');
  const [previewReceipt, setPreviewReceipt] = useState<{ url: string; title: string } | null>(null);

  // Filter Booking
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [selectedAccFilter, setSelectedAccFilter] = useState<string>('all');

  // Kalender Booking State
  const [calMonth, setCalMonth] = useState<number>(9); // 9 = Oktober (0-indexed)
  const [calYear, setCalYear] = useState<number>(2025);
  const [calPropId, setCalPropId] = useState<string>('all');
  const [calRoomId, setCalRoomId] = useState<string>('all');

  // WhatsApp Notification Modal State
  const [waModal, setWaModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
    targetPhone: string;
    copied: boolean;
  }>({
    isOpen: false,
    booking: null,
    targetPhone: '',
    copied: false,
  });

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

  // State Edit Foto di Pengaturan (Requirement 5)
  const [editHeroUrl, setEditHeroUrl] = useState<string>(heroImage);
  const [heroPreview, setHeroPreview] = useState<string>(heroImage);

  const sundakProp = accommodations.find((p) => p.id === 'homestay-sundak') || accommodations[0];
  const [editSundakUrl, setEditSundakUrl] = useState<string>(sundakProp?.image || '');
  const [sundakPreview, setSundakPreview] = useState<string>(sundakProp?.image || '');

  const trenggoleProp = accommodations.find((p) => p.id === 'homestay-trenggole') || accommodations[1];
  const [editTrenggoleUrl, setEditTrenggoleUrl] = useState<string>(trenggoleProp?.image || '');
  const [trenggolePreview, setTrenggolePreview] = useState<string>(trenggoleProp?.image || '');

  // Foto Fasilitas Homestay
  const [editFacilityUrl, setEditFacilityUrl] = useState<string>(facilityImage);
  const [facilityPreview, setFacilityPreview] = useState<string>(facilityImage);

  // Room Image edit states map: { [roomId]: { url: string, preview: string } }
  const [roomImageStates, setRoomImageStates] = useState<Record<string, { url: string; preview: string }>>({});

  // Tolak / Pembatalan Booking State
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  // Hitung Data Statistik Nyata dari Database Booking
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === 'pending_verification'), [bookings]);
  const approvedBookings = useMemo(() => bookings.filter((b) => b.status === 'approved'), [bookings]);
  const verifiedBookings = useMemo(() => bookings.filter((b) => b.status === 'verified' || (b.status as string) === 'ready_checkin'), [bookings]);
  const checkedInBookings = useMemo(() => bookings.filter((b) => b.status === 'checked_in'), [bookings]);
  const completedBookings = useMemo(() => bookings.filter((b) => b.status === 'completed'), [bookings]);
  const cancelledBookings = useMemo(() => bookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected'), [bookings]);

  // Total Pendapatan Bulanan (Data Riil)
  const totalMonthlyRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status !== 'rejected' && b.status !== 'cancelled')
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  }, [bookings]);

  const totalPaidRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'verified' || b.status === 'checked_in' || b.status === 'completed' || b.status === 'approved')
      .reduce((acc, curr) => {
        if (curr.paymentType === 'full_100') {
          return acc + (curr.totalAmount || 0);
        }
        return acc + (curr.dpAmount || curr.totalAmount * 0.5 || 0);
      }, 0);
  }, [bookings]);

  const totalGuestsCount = useMemo(() => {
    return bookings.reduce((acc, curr) => acc + (curr.guestsCount || 0), 0);
  }, [bookings]);

  // Penginapan paling sering dipilih (data riil)
  const propertyPopularity = useMemo(() => {
    const counts: Record<string, { name: string; count: number; revenue: number }> = {
      'homestay-sundak': { name: 'Pantai Sundak', count: 0, revenue: 0 },
      'homestay-trenggole': { name: 'Pantai Trenggole', count: 0, revenue: 0 },
    };

    bookings.forEach((b) => {
      const pid = b.propertyId || 'homestay-sundak';
      if (!counts[pid]) {
        counts[pid] = { name: b.propertyName || pid, count: 0, revenue: 0 };
      }
      counts[pid].count += 1;
      counts[pid].revenue += b.totalAmount || 0;
    });

    const list = Object.values(counts);
    const sorted = [...list].sort((a, b) => b.count - a.count);
    const mostPopular = sorted[0]?.name || 'Pantai Sundak';
    const totalBookings = bookings.length || 1;

    return {
      list: sorted.map((item) => ({
        ...item,
        percentage: Math.round((item.count / totalBookings) * 100),
      })),
      mostPopularName: mostPopular,
    };
  }, [bookings]);

  // A. Data Grafik Jumlah Tamu Selama 1 Bulan (Minggu 1, Minggu 2, Minggu 3, Minggu 4)
  const weeklyDistribution = useMemo(() => {
    const weeks = [
      { name: 'Minggu 1', label: 'Tgl 1-7', count: 0, guests: 0 },
      { name: 'Minggu 2', label: 'Tgl 8-14', count: 0, guests: 0 },
      { name: 'Minggu 3', label: 'Tgl 15-21', count: 0, guests: 0 },
      { name: 'Minggu 4', label: 'Tgl 22-31', count: 0, guests: 0 },
    ];

    bookings.forEach((b) => {
      const dayMatch = b.checkInDate ? parseInt(b.checkInDate.split('-')[2], 10) : 1;
      const day = isNaN(dayMatch) ? 1 : dayMatch;
      const guests = b.guestsCount || 1;

      if (day <= 7) {
        weeks[0].count += 1;
        weeks[0].guests += guests;
      } else if (day <= 14) {
        weeks[1].count += 1;
        weeks[1].guests += guests;
      } else if (day <= 21) {
        weeks[2].count += 1;
        weeks[2].guests += guests;
      } else {
        weeks[3].count += 1;
        weeks[3].guests += guests;
      }
    });

    const maxGuests = Math.max(...weeks.map((w) => w.guests), 1);
    return { weeks, maxGuests };
  }, [bookings]);

  // B. Data Grafik Asal Penyewa (dari Form booking -> Kota Asal Pemesan)
  const cityDistribution = useMemo(() => {
    const cityCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      const city = b.asalKota ? b.asalKota.trim() : 'Yogyakarta';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const sorted = Object.entries(cityCounts)
      .map(([city, count]) => ({
        city,
        count,
        percentage: Math.round((count / (bookings.length || 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return sorted;
  }, [bookings]);

  // Filter Bookings di Halaman Booking
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingFilterStatus !== 'all') {
        if (bookingFilterStatus === 'cancelled') {
          if (b.status !== 'cancelled' && b.status !== 'rejected') return false;
        } else if (bookingFilterStatus === 'verified') {
          if (b.status !== 'verified' && (b.status as string) !== 'ready_checkin') return false;
        } else if (b.status !== bookingFilterStatus) {
          return false;
        }
      }
      if (selectedAccFilter !== 'all' && b.propertyId !== selectedAccFilter) {
        return false;
      }
      return true;
    });
  }, [bookings, bookingFilterStatus, selectedAccFilter]);

  // Helper WhatsApp text formatting (Requirement 7)
  const getWhatsappMessage = (b: Booking): string => {
    return `Booking Griya Barokah telah diverifikasi.\n\nKode Booking:\n${b.id}\n\nNama:\n${b.guestName}\n\nPenginapan:\n${b.propertyName}\n\nTanggal:\n${b.checkInDate} s/d ${b.checkOutDate}\n\nStatus:\nSiap Check-in`;
  };

  const handleOpenWhatsappModal = (b: Booking) => {
    const rawPhone = b.guestPhone || adminWhatsappNumber || '082138613888';
    setWaModal({
      isOpen: true,
      booking: b,
      targetPhone: rawPhone,
      copied: false,
    });
  };

  const handleSendWhatsappDirect = (phoneNum: string, text: string) => {
    const digits = phoneNum.replace(/\D/g, '');
    let cleanPhone = digits;
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62' + cleanPhone;
    }
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  // SISTEM VERIFIKASI ADMIN: Mengubah status menjadi "Siap Check-in" (verified)
  const handleVerifikasiPembayaran = async (booking: Booking) => {
    await updateBookingStatus(booking.id, 'verified', 'Pembayaran diverifikasi oleh admin. Siap Check-in.');
    setApprovedToast(`✓ Pembayaran ${booking.guestName} berhasil diverifikasi! Status: Siap Check-in.`);

    // Otomatis buka popup notifikasi WhatsApp (Requirement 7)
    setTimeout(() => {
      handleOpenWhatsappModal(booking);
    }, 400);

    setTimeout(() => setApprovedToast(''), 3500);
  };

  // Mengubah status booking dari dropdown card
  const handleChangeStatus = async (id: string, newStatus: BookingStatus) => {
    await updateBookingStatus(id, newStatus);
    const statusLabels: Record<string, string> = {
      pending_verification: 'Menunggu Verifikasi',
      approved: 'Disetujui Admin',
      verified: 'Siap Check-in',
      ready_checkin: 'Siap Check-in',
      checked_in: 'Sudah Check-in',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      rejected: 'Dibatalkan',
    };
    setApprovedToast(`Status booking ${id} diubah ke: ${statusLabels[newStatus] || newStatus}`);
    setTimeout(() => setApprovedToast(''), 3000);
  };

  const handleConfirmReject = async () => {
    if (!rejectingBookingId) return;
    await rejectBooking(rejectingBookingId, rejectionReasonInput || 'Dibatalkan oleh Pengelola Homestay.');
    setApprovedToast(`Booking ${rejectingBookingId} berhasil dibatalkan.`);
    setRejectingBookingId(null);
    setRejectionReasonInput('');
    setTimeout(() => setApprovedToast(''), 3500);
  };

  // Helper File Upload to Base64
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onResult: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onResult(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Simpan Foto Hero (Requirement 5)
  const handleSaveHeroImage = () => {
    const finalUrl = heroPreview || editHeroUrl;
    if (finalUrl) {
      updateHeroImage(finalUrl);
      setApprovedToast('✓ Foto hero halaman depan berhasil diperbarui!');
      setTimeout(() => setApprovedToast(''), 3000);
    }
  };

  // Simpan Foto Sundak (Requirement 5)
  const handleSaveSundakImage = () => {
    const finalUrl = sundakPreview || editSundakUrl;
    if (finalUrl && sundakProp) {
      updateAccommodation(sundakProp.id, {
        image: finalUrl,
        gallery: [finalUrl, ...(sundakProp.gallery?.slice(1) || [])],
      });
      setApprovedToast('✓ Foto Griya Barokah Pantai Sundak berhasil diperbarui!');
      setTimeout(() => setApprovedToast(''), 3000);
    }
  };

  // Simpan Foto Trenggole (Requirement 5)
  const handleSaveTrenggoleImage = () => {
    const finalUrl = trenggolePreview || editTrenggoleUrl;
    if (finalUrl && trenggoleProp) {
      updateAccommodation(trenggoleProp.id, {
        image: finalUrl,
        gallery: [finalUrl, ...(trenggoleProp.gallery?.slice(1) || [])],
      });
      setApprovedToast('✓ Foto Griya Barokah Pantai Trenggole berhasil diperbarui!');
      setTimeout(() => setApprovedToast(''), 3000);
    }
  };

  // Simpan Foto Kamar (Requirement 5)
  const handleSaveRoomImage = (propId: string, roomId: string) => {
    const state = roomImageStates[roomId];
    const finalUrl = state?.preview || state?.url;
    if (finalUrl) {
      updateRoomType(propId, roomId, { image: finalUrl });
      setApprovedToast('✓ Foto tipe kamar berhasil diperbarui!');
      setTimeout(() => setApprovedToast(''), 3000);
    }
  };

  // Simpan Foto Fasilitas (Requirement 5)
  const handleSaveFacilityImage = () => {
    const finalUrl = facilityPreview || editFacilityUrl;
    if (finalUrl) {
      updateFacilityImage(finalUrl);
      setApprovedToast('✓ Foto fasilitas homestay berhasil diperbarui!');
      setTimeout(() => setApprovedToast(''), 3000);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-20 max-w-md mx-auto">
      {/* Top Status Bar Ringkas */}
      <div className="sticky top-0 z-30 bg-[#F6F7F9]/95 backdrop-blur-md px-4 pt-2 pb-1 flex items-center justify-between text-neutral-700 text-[11px] font-semibold">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Header Admin Compact */}
      <header className="px-3.5 sm:px-4 py-2 flex items-center justify-between border-b border-neutral-200/60 bg-white">
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
                Admin Griya Barokah
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-neutral-400">
              Pantai Sundak & Trenggole
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logoutStaff();
            if (navigateTo) navigateTo('/');
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
          title="Keluar Sesi Admin"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-[10px]">Logout</span>
        </button>
      </header>

      {/* Toast Notifikasi Sukses */}
      {approvedToast && (
        <div className="mx-3.5 my-1.5 p-2.5 rounded-xl bg-[#EBF8F2] border border-[#C6ECD8] text-[#1DB954] text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in">
          <span>{approvedToast}</span>
          <button onClick={() => setApprovedToast('')}>
            <X className="w-3.5 h-3.5 text-[#1DB954]" />
          </button>
        </div>
      )}

      {/* Konten Utama Berdasarkan 4 Menu Bawah */}
      <div className="px-3 sm:px-4 pt-2 pb-4 flex-grow space-y-3">
        {/* =========================================================================
            MENU 1: BOOKING (GABUNGAN RINGKASAN & VERIFIKASI)
           ========================================================================= */}
        {adminNavTab === 'booking' && (
          <div className="space-y-2.5">
            {/* Kartu Ringkasan Compact */}
            <div className="grid grid-cols-3 gap-1.5">
              <div
                onClick={() => setBookingFilterStatus('pending_verification')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  bookingFilterStatus === 'pending_verification'
                    ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400'
                    : 'bg-white border-neutral-200/90'
                }`}
              >
                <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Menunggu</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <div className="text-base font-black text-neutral-900 mt-0.5">
                  {pendingBookings.length}
                </div>
                <span className="text-[9px] text-amber-700 font-medium">Perlu Review</span>
              </div>

              <div
                onClick={() => setBookingFilterStatus('verified')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  bookingFilterStatus === 'verified'
                    ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                    : 'bg-white border-neutral-200/90'
                }`}
              >
                <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Siap Masuk</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-base font-black text-neutral-900 mt-0.5">
                  {verifiedBookings.length + checkedInBookings.length}
                </div>
                <span className="text-[9px] text-emerald-700 font-medium">Siap Check-in</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-neutral-200/90">
                <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                  <span>Pemasukan</span>
                </div>
                <div className="text-base font-black text-neutral-900 mt-0.5 truncate">
                  Rp {(totalPaidRevenue / 1000).toLocaleString('id-ID')}k
                </div>
                <span className="text-[9px] text-emerald-700 font-medium">{bookings.length} Total</span>
              </div>
            </div>

            {/* Filter Dropdown Status & Penginapan */}
            <div className="p-2.5 bg-white rounded-xl border border-neutral-200/90 flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div className="w-full sm:w-auto flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="text-[11px] font-bold text-neutral-600 shrink-0">Status:</span>
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="w-full sm:w-44 h-8 px-2 rounded-lg bg-[#F6F7F9] border border-neutral-200 text-[11px] font-bold text-neutral-900 focus:outline-none"
                >
                  <option value="all">Semua Booking ({bookings.length})</option>
                  <option value="pending_verification">Menunggu Verifikasi ({pendingBookings.length})</option>
                  <option value="approved">Disetujui Admin ({approvedBookings.length})</option>
                  <option value="verified">Siap Check-in ({verifiedBookings.length})</option>
                  <option value="checked_in">Sudah Check-in ({checkedInBookings.length})</option>
                  <option value="completed">Selesai ({completedBookings.length})</option>
                  <option value="cancelled">Dibatalkan ({cancelledBookings.length})</option>
                </select>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-neutral-600 shrink-0">Unit:</span>
                <select
                  value={selectedAccFilter}
                  onChange={(e) => setSelectedAccFilter(e.target.value)}
                  className="w-full sm:w-36 h-8 px-2 rounded-lg bg-[#F6F7F9] border border-neutral-200 text-[11px] font-semibold text-neutral-900 focus:outline-none"
                >
                  <option value="all">Semua Homestay</option>
                  <option value="homestay-sundak">Pantai Sundak</option>
                  <option value="homestay-trenggole">Pantai Trenggole</option>
                </select>
              </div>
            </div>

            {/* List Booking Cards Compact */}
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-neutral-500 text-xs border border-neutral-200">
                Tidak ada data booking dengan filter status ini.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBookings.map((b) => {
                  const isPending = b.status === 'pending_verification';
                  const isApproved = b.status === 'approved';
                  const isVerified = b.status === 'verified' || (b.status as string) === 'ready_checkin';
                  const isCheckedIn = b.status === 'checked_in';
                  const isCompleted = b.status === 'completed';
                  const isCancelled = b.status === 'cancelled' || b.status === 'rejected';

                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2"
                    >
                      {/* Baris Atas: Status Booking & Total Pembayaran */}
                      <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-2">
                        <div>
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Menunggu Verifikasi</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                              <Check className="w-3 h-3 text-blue-600" />
                              <span>Disetujui Admin</span>
                            </span>
                          )}
                          {isVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Siap Check-in</span>
                            </span>
                          )}
                          {isCheckedIn && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-[10px] font-bold border border-cyan-200">
                              <Users className="w-3 h-3 text-cyan-600" />
                              <span>Sudah Check-in</span>
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-200">
                              <Check className="w-3 h-3 text-purple-600" />
                              <span>Selesai</span>
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                              <X className="w-3 h-3 text-rose-600" />
                              <span>Dibatalkan</span>
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">
                            Kode: <strong>{b.id}</strong>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400 block leading-tight">Total Bayar</span>
                          <span className="text-xs sm:text-sm font-extrabold text-emerald-800 block">
                            Rp {b.totalAmount.toLocaleString('id-ID')}
                          </span>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[9px] font-bold">
                            {b.paymentType === 'full_100' ? 'Lunas 100%' : 'DP 50%'}
                          </span>
                        </div>
                      </div>

                      {/* DATA PEMESAN LENGKAP (Requirement 4: Nama, Kota asal, Nomor WhatsApp, Jumlah tamu, Tanggal menginap, Penginapan, Kamar, Total pembayaran, Status. Hapus KTP!) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Nama Pemesan:</span>
                          <strong className="text-neutral-900 font-bold block">{b.guestName}</strong>
                        </div>

                        <div>
                          <span className="text-neutral-400 block text-[10px]">Kota Asal:</span>
                          <strong className="text-neutral-800 font-semibold block">{b.asalKota || 'Yogyakarta'}</strong>
                        </div>

                        <div>
                          <span className="text-neutral-400 block text-[10px]">Nomor WhatsApp:</span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/${b.guestPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{b.guestPhone}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleOpenWhatsappModal(b)}
                              className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              title="Kirim Notifikasi WA"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-neutral-400 block text-[10px]">Jumlah Tamu:</span>
                          <strong className="text-neutral-800 font-semibold block">
                            {b.guestsCount} Tamu {b.withWhom ? `(${b.withWhom})` : ''}
                          </strong>
                        </div>

                        <div>
                          <span className="text-neutral-400 block text-[10px]">Tanggal Menginap:</span>
                          <strong className="text-neutral-900 font-semibold block">
                            {b.checkInDate} s/d {b.checkOutDate} ({b.totalNights} Malam)
                          </strong>
                        </div>

                        <div>
                          <span className="text-neutral-400 block text-[10px]">Penginapan:</span>
                          <strong className="text-neutral-900 font-bold block">{b.propertyName}</strong>
                        </div>

                        <div className="sm:col-span-2">
                          <span className="text-neutral-400 block text-[10px]">Kamar / Full House:</span>
                          <strong className="text-emerald-800 font-bold block">{b.roomTypeName}</strong>
                        </div>
                      </div>

                      {/* Detail Pembayaran DP / Lunas */}
                      {b.dpAmount ? (
                        <div className="p-2 rounded-lg bg-neutral-50 text-[10px] flex items-center justify-between border border-neutral-100">
                          <span className="text-neutral-600">
                            DP Masuk: <strong>Rp {b.dpAmount.toLocaleString('id-ID')}</strong>
                          </span>
                          <span className="text-neutral-600">
                            Sisa: <strong>Rp {(b.remainingBalance || (b.totalAmount - b.dpAmount)).toLocaleString('id-ID')}</strong>
                          </span>
                        </div>
                      ) : null}

                      {/* Bukti Transfer & Verifikasi Cepat */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-neutral-100">
                        {/* Tombol Lihat Resi Transfer */}
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewReceipt({
                              url: b.paymentProofUrl || SAMPLE_PAYMENT_SVG,
                              title: `Bukti Transfer: ${b.guestName} (Rp ${b.totalAmount.toLocaleString('id-ID')})`,
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <CreditCard className="w-3 h-3 text-neutral-600" />
                          <span>Lihat Bukti Transfer</span>
                        </button>

                        {/* Tombol WhatsApp Notifikasi (Requirement 7) */}
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsappModal(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-700" />
                          <span>Notif WhatsApp</span>
                        </button>

                        {/* Ubah Status Dropdown Langsung dari Card */}
                        <div className="flex items-center gap-1 ml-auto">
                          <select
                            value={b.status}
                            onChange={(e) => handleChangeStatus(b.id, e.target.value as BookingStatus)}
                            className="h-8 px-2 rounded-lg bg-neutral-100 border border-neutral-200 text-[10px] font-bold text-neutral-800 focus:outline-none cursor-pointer"
                          >
                            <option value="pending_verification">Menunggu Verifikasi</option>
                            <option value="approved">Disetujui Admin</option>
                            <option value="verified">Siap Check-in</option>
                            <option value="checked_in">Sudah Check-in</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                        </div>
                      </div>

                      {/* TOMBOL SISTEM VERIFIKASI ADMIN: "✓ Verifikasi Pembayaran" (Requirement 6) */}
                      {isPending && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleVerifikasiPembayaran(b)}
                            className="flex-1 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>✓ Verifikasi Pembayaran</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRejectingBookingId(b.id)}
                            className="h-9 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all cursor-pointer"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MENU 2: KALENDER BOOKING
           ========================================================================= */}
        {adminNavTab === 'kalender' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold text-neutral-900 uppercase tracking-tight">
                  Kalender Booking
                </h2>
                <p className="text-[10px] text-neutral-500">
                  Klik tanggal untuk memblokir atau membuka ketersediaan kamar
                </p>
              </div>
              <button
                onClick={() => {
                  setCalMonth(9);
                  setCalYear(2025);
                }}
                className="text-[10px] font-bold text-emerald-800 hover:underline"
              >
                Bulan Ini
              </button>
            </div>

            {/* Filter Unit di Kalender */}
            <div className="p-2.5 bg-white rounded-xl border border-neutral-200/90 flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-neutral-700">Pilih Homestay:</span>
              <select
                value={calPropId}
                onChange={(e) => {
                  setCalPropId(e.target.value);
                  setCalRoomId('all');
                }}
                className="h-8 px-2 rounded-lg bg-[#F6F7F9] border border-neutral-200 text-[11px] font-bold text-neutral-900 focus:outline-none"
              >
                <option value="all">Semua Unit</option>
                <option value="homestay-sundak">Pantai Sundak (Full House)</option>
                <option value="homestay-trenggole">Pantai Trenggole (Kamar)</option>
              </select>
            </div>

            {/* Kalender Box */}
            <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
              {/* Header Bulan & Navigasi */}
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                <button
                  onClick={() => {
                    if (calMonth === 0) {
                      setCalMonth(11);
                      setCalYear((prev) => prev - 1);
                    } else {
                      setCalMonth((prev) => prev - 1);
                    }
                  }}
                  className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <h3 className="text-xs sm:text-sm font-extrabold text-neutral-900">
                  {new Date(calYear, calMonth, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </h3>

                <button
                  onClick={() => {
                    if (calMonth === 11) {
                      setCalMonth(0);
                      setCalYear((prev) => prev + 1);
                    } else {
                      setCalMonth((prev) => prev + 1);
                    }
                  }}
                  className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2.5 text-[9px] text-neutral-600 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-emerald-100 border border-emerald-400" />
                  <span>Tersedia</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-blue-100 border border-blue-400" />
                  <span>Terisi Tamu</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-rose-100 border border-rose-400" />
                  <span>Diblokir</span>
                </span>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 pt-1 text-center">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                  <span key={d} className="text-[9px] font-bold text-neutral-400 py-0.5">
                    {d}
                  </span>
                ))}

                {Array.from({ length: new Date(calYear, calMonth, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9" />
                ))}

                {Array.from({ length: new Date(calYear, calMonth + 1, 0).getDate() }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

                  const matchedBooking = bookings.find((b) => {
                    if (b.status === 'rejected' || b.status === 'cancelled') return false;
                    if (calPropId !== 'all' && b.propertyId !== calPropId) return false;
                    return b.checkInDate <= dateStr && dateStr < b.checkOutDate;
                  });

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
                        setApprovedToast(`Status tanggal ${dateStr} diubah!`);
                        setTimeout(() => setApprovedToast(''), 2500);
                      }}
                      className={`h-9 rounded-lg p-0.5 text-[10px] font-bold transition-all flex flex-col items-center justify-between border cursor-pointer active:scale-95 ${
                        isBlocked
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : matchedBooking
                          ? 'bg-blue-50 border-blue-300 text-blue-900'
                          : 'bg-emerald-50/50 border-emerald-200/70 text-emerald-950 hover:bg-emerald-100/50'
                      }`}
                      title={
                        isBlocked
                          ? 'Tanggal diblokir admin. Klik untuk buka.'
                          : matchedBooking
                          ? `Terisi: ${matchedBooking.guestName}`
                          : 'Tersedia. Klik untuk blokir.'
                      }
                    >
                      <span className="text-[10px] leading-none">{dayNum}</span>
                      <span className="text-[8px] font-extrabold truncate w-full px-0.5">
                        {isBlocked ? '🔒' : matchedBooking ? '👤' : '✓'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-2 rounded-lg bg-neutral-50 text-[10px] text-neutral-600 flex items-center justify-between">
                <span>💡 Klik tanggal di atas untuk memblokir atau membuka ketersediaan kamar.</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 3: LAPORAN (Requirement 10: Grafik tamu, asal kota, penginapan favorit, pendapatan)
           ========================================================================= */}
        {adminNavTab === 'laporan' && (
          <div className="space-y-3">
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-neutral-900 uppercase tracking-tight">
                Laporan & Statistik Homestay
              </h2>
              <p className="text-[10px] text-neutral-500">
                Data transaksi riil dari database booking Griya Barokah
              </p>
            </div>

            {/* KARTU STATISTIK RINGKAS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                  Total Booking
                </span>
                <span className="text-lg font-black text-neutral-900 block mt-0.5">
                  {bookings.length} Pesanan
                </span>
                <span className="text-[9px] text-neutral-400">Database Riil</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                  Pendapatan Bulanan
                </span>
                <span className="text-lg font-black text-emerald-800 block mt-0.5 truncate">
                  Rp {(totalMonthlyRevenue / 1000).toLocaleString('id-ID')}k
                </span>
                <span className="text-[9px] text-emerald-600 font-medium">Omzet Pemesanan</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                  Jumlah Tamu
                </span>
                <span className="text-lg font-black text-neutral-900 block mt-0.5">
                  {totalGuestsCount} Orang
                </span>
                <span className="text-[9px] text-neutral-400">Total Tamu Menginap</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs">
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                  Paling Banyak Dipilih
                </span>
                <span className="text-xs font-black text-neutral-900 block mt-0.5 truncate" title={propertyPopularity.mostPopularName}>
                  {propertyPopularity.mostPopularName}
                </span>
                <span className="text-[9px] text-neutral-400">Favorit Tamu</span>
              </div>
            </div>

            {/* 1. GRAFIK JUMLAH TAMU PER BULAN (Minggu 1, Minggu 2, Minggu 3, Minggu 4) */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div>
                  <h3 className="text-xs sm:text-[13px] font-black text-neutral-900">
                    1. Grafik Jumlah Tamu per Bulan
                  </h3>
                  <span className="text-[10px] text-neutral-500">
                    Kedatangan tamu berdasarkan minggu menginap
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <TrendingUp className="w-3 h-3" />
                  <span>Realtime</span>
                </div>
              </div>

              {/* Bar Chart Visual Minggu 1-4 */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-4 gap-2 items-end h-32 pt-2 pb-1 border-b border-neutral-100">
                  {weeklyDistribution.weeks.map((week, idx) => {
                    const heightPercent =
                      weeklyDistribution.maxGuests > 0
                        ? Math.max(Math.round((week.guests / weeklyDistribution.maxGuests) * 100), 12)
                        : 12;

                    return (
                      <div key={idx} className="flex flex-col items-center justify-end h-full group">
                        <span className="text-[10px] font-black text-neutral-800 mb-1">
                          {week.guests} orang
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[44px] rounded-t-lg bg-emerald-700 group-hover:bg-emerald-800 transition-all flex items-center justify-center shadow-2xs"
                        >
                          <span className="text-[8px] font-bold text-white">
                            {week.count} bkg
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-800 mt-1.5">
                          {week.name}
                        </span>
                        <span className="text-[8px] text-neutral-400">
                          {week.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] text-neutral-500 text-center font-medium pt-1">
                  💡 Menampilkan jumlah orang (tamu) yang tiba dan menginap di setiap minggu.
                </div>
              </div>
            </div>

            {/* 2. GRAFIK ASAL KOTA PENYEWA (Form booking -> Kota Asal Pemesan) */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div>
                  <h3 className="text-xs sm:text-[13px] font-black text-neutral-900">
                    2. Grafik Asal Kota Penyewa
                  </h3>
                  <span className="text-[10px] text-neutral-500">
                    Diambil langsung dari kolom Kota Asal pada formulir reservasi
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  <MapPin className="w-3 h-3" />
                  <span>{cityDistribution.length} Kota</span>
                </div>
              </div>

              {/* Bar Horizontal Kota Asal */}
              <div className="space-y-2 pt-1">
                {cityDistribution.length === 0 ? (
                  <div className="text-center text-xs text-neutral-400 py-3">
                    Belum ada data kota pemesan.
                  </div>
                ) : (
                  cityDistribution.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-neutral-900 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[9px] text-neutral-600 font-mono">
                            {index + 1}
                          </span>
                          <span>{item.city}</span>
                        </span>
                        <span className="text-emerald-800">
                          <strong>{item.count} penyewa</strong> ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${Math.max(item.percentage, 8)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. GRAFIK PENGINAPAN PALING BANYAK DIPILIH */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div>
                  <h3 className="text-xs sm:text-[13px] font-black text-neutral-900">
                    3. Grafik Penginapan Paling Banyak Dipilih
                  </h3>
                  <span className="text-[10px] text-neutral-500">
                    Perbandingan pemesanan Pantai Sundak vs Trenggole
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  <Building className="w-3 h-3" />
                  <span>2 Lokasi</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {propertyPopularity.list.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-neutral-900">{item.name}</span>
                      <span className="text-emerald-800">
                        <strong>{item.count} Booking</strong> ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          idx === 0 ? 'bg-[#13281E]' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.max(item.percentage, 10)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 block">
                      Total Omzet: Rp {item.revenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 4: PENGATURAN (Requirement 5: Edit Gambar Hero, Sundak, Trenggole, Kamar)
           ========================================================================= */}
        {adminNavTab === 'pengaturan' && (
          <div className="space-y-3.5">
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-neutral-900 uppercase tracking-tight">
                Pengaturan Gambar & Homestay
              </h2>
              <p className="text-[10px] text-neutral-500">
                Ganti foto hero, foto homestay, dan foto kamar langsung dari HP
              </p>
            </div>

            {/* ================= EDIT FOTO HERO HALAMAN DEPAN ================= */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-neutral-900">
                    Foto Hero Halaman Depan
                  </h3>
                </div>
                <span className="text-[10px] text-neutral-400">Landing Page</span>
              </div>

              {/* Preview Gambar Hero */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <SafeImage
                  src={heroPreview || heroImage}
                  alt="Preview Hero"
                  fallbackText="Hero Griya Barokah"
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold z-30">
                  Preview
                </div>
              </div>

              {/* Input URL atau Upload */}
              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <label className="flex-1 h-9 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-200">
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Upload Foto Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, (url) => setHeroPreview(url))}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveHeroImage}
                    className="h-9 px-4 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </button>
                </div>

                <input
                  type="url"
                  value={editHeroUrl}
                  onChange={(e) => {
                    setEditHeroUrl(e.target.value);
                    setHeroPreview(e.target.value);
                  }}
                  placeholder="Atau tempel URL gambar baru..."
                  className="w-full h-8 px-2.5 rounded-lg bg-[#F6F7F9] border border-neutral-200 text-[11px] text-neutral-800 focus:outline-none"
                />
              </div>
            </div>

            {/* ================= EDIT FOTO PANTAI SUNDAK ================= */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-neutral-900">
                    Foto Griya Barokah Pantai Sundak
                  </h3>
                </div>
                <span className="text-[10px] text-neutral-400">Full House</span>
              </div>

              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <SafeImage
                  src={sundakPreview || sundakProp?.image}
                  alt="Preview Sundak"
                  fallbackText="Griya Barokah Pantai Sundak"
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold z-30">
                  Preview
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <label className="flex-1 h-9 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-200">
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Upload Foto Sundak</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, (url) => setSundakPreview(url))}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveSundakImage}
                    className="h-9 px-4 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </button>
                </div>

                <input
                  type="url"
                  value={editSundakUrl}
                  onChange={(e) => {
                    setEditSundakUrl(e.target.value);
                    setSundakPreview(e.target.value);
                  }}
                  placeholder="Atau tempel URL gambar baru..."
                  className="w-full h-8 px-2.5 rounded-lg bg-[#F6F7F9] border border-neutral-200 text-[11px] text-neutral-800 focus:outline-none"
                />
              </div>
            </div>

            {/* ================= EDIT FOTO PANTAI TRENGGOLE ================= */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-neutral-900">
                    Foto Griya Barokah Pantai Trenggole
                  </h3>
                </div>
                <span className="text-[10px] text-neutral-400">Homestay</span>
              </div>

              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <SafeImage
                  src={trenggolePreview || trenggoleProp?.image}
                  alt="Preview Trenggole"
                  fallbackText="Griya Barokah Pantai Trenggole"
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold z-30">
                  Preview
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <label className="flex-1 h-9 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-200">
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Upload Foto Trenggole</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, (url) => setTrenggolePreview(url))}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveTrenggoleImage}
                    className="h-9 px-4 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </button>
                </div>

                <input
                  type="url"
                  value={editTrenggoleUrl}
                  onChange={(e) => {
                    setEditTrenggoleUrl(e.target.value);
                    setTrenggolePreview(e.target.value);
                  }}
                  placeholder="Atau tempel URL gambar baru..."
                  className="w-full h-8 px-2.5 rounded-lg bg-[#F6F7F9] border border-neutral-200 text-[11px] text-neutral-800 focus:outline-none"
                />
              </div>
            </div>

            {/* ================= EDIT FOTO SETIAP KAMAR ================= */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
              <div className="pb-1.5 border-b border-neutral-100">
                <h3 className="text-xs font-bold text-neutral-900">
                  Foto Setiap Tipe Kamar
                </h3>
                <span className="text-[10px] text-neutral-400">
                  Unggah atau ganti foto spesifik tiap kamar
                </span>
              </div>

              <div className="space-y-3">
                {accommodations.flatMap((prop) =>
                  prop.roomTypes.map((room) => {
                    const currentRoomState = roomImageStates[room.id] || {
                      url: room.image,
                      preview: room.image,
                    };

                    return (
                      <div
                        key={room.id}
                        className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <SafeImage
                            src={currentRoomState.preview || room.image}
                            alt={room.name}
                            fallbackText={room.name}
                            className="w-full h-full object-cover"
                            containerClassName="w-14 h-14 rounded-lg shrink-0 border border-neutral-200"
                          />
                          <div className="min-w-0 flex-1">
                            <strong className="block text-xs font-bold text-neutral-900 truncate">
                              {room.name}
                            </strong>
                            <span className="text-[10px] text-neutral-500 block truncate">
                              {prop.name.replace('Griya Barokah ', '')} • Rp {room.pricePerNight.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <label className="flex-1 h-8 px-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-800 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer border border-neutral-200">
                            <Upload className="w-3 h-3 text-neutral-600" />
                            <span>Upload Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageFileUpload(e, (url) => {
                                  setRoomImageStates((prev) => ({
                                    ...prev,
                                    [room.id]: { url, preview: url },
                                  }));
                                })
                              }
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleSaveRoomImage(prop.id, room.id)}
                            className="h-8 px-3 rounded-lg bg-[#13281E] hover:bg-[#1A3428] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Simpan</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ================= EDIT FOTO FASILITAS HOMESTAY ================= */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-neutral-900">
                    Foto Fasilitas Homestay
                  </h3>
                </div>
                <span className="text-[10px] text-neutral-400">Fasilitas</span>
              </div>

              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <SafeImage
                  src={facilityPreview || facilityImage}
                  alt="Preview Fasilitas"
                  fallbackText="Fasilitas Griya Barokah"
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold z-30">
                  Preview
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <label className="flex-1 h-9 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-200">
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Upload Foto Fasilitas</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, (url) => setFacilityPreview(url))}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveFacilityImage}
                    className="h-9 px-4 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </button>
                </div>

                <input
                  type="url"
                  value={editFacilityUrl}
                  onChange={(e) => {
                    setEditFacilityUrl(e.target.value);
                    setFacilityPreview(e.target.value);
                  }}
                  placeholder="Atau tempel URL gambar baru..."
                  className="w-full h-8 px-2.5 rounded-lg bg-[#F6F7F9] border border-neutral-200 text-[11px] text-neutral-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Pengaturan Nomor WhatsApp Admin */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-neutral-900 block">
                Nomor WhatsApp Admin (Default)
              </span>
              <p className="text-[10px] text-neutral-500">
                Nomor ini dipakai sebagai tujuan atau kontak resmi homestay
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={adminWhatsappNumber}
                  onChange={(e) => updateAdminWhatsappNumber(e.target.value)}
                  placeholder="082138613888"
                  className="flex-1 h-9 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setApprovedToast('✓ Nomor WhatsApp Admin berhasil disimpan!');
                    setTimeout(() => setApprovedToast(''), 2500);
                  }}
                  className="h-9 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </div>

            {/* Reset Database ke Standar Asli */}
            <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-neutral-800 block">
                Pemeliharaan Data Homestay
              </span>
              <p className="text-[10px] text-neutral-500">
                Kembalikan data penginapan dan kamar ke harga standar asli Sundak & Trenggole.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset seluruh data ke standar asli Griya Barokah?')) {
                    resetToDefaultData();
                    setApprovedToast('Data berhasil direset ke standar harga asli!');
                  }
                }}
                className="w-full h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Database ke Standar Asli</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL NOTIFIKASI WHATSAPP (Requirement 7) ================= */}
      {waModal.isOpen && waModal.booking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <h3 className="font-extrabold text-xs sm:text-sm text-neutral-900">
                  Notifikasi WhatsApp
                </h3>
              </div>
              <button
                onClick={() => setWaModal({ isOpen: false, booking: null, targetPhone: '', copied: false })}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* Nomor WhatsApp Tujuan (Dapat Diedit Admin) */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1 text-[11px]">
                  Nomor WhatsApp Tujuan:
                </label>
                <input
                  type="tel"
                  value={waModal.targetPhone}
                  onChange={(e) => setWaModal((prev) => ({ ...prev, targetPhone: e.target.value }))}
                  placeholder="081234567890"
                  className="w-full h-9 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  💡 Admin dapat mengedit nomor tujuan sebelum mengirim pesan.
                </span>
              </div>

              {/* Isi Pesan Otomatis Sesuai Format Persis Requirement 7 */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1 text-[11px]">
                  Isi Pesan Otomatis:
                </label>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 font-mono text-[11px] whitespace-pre-line text-neutral-800 leading-relaxed max-h-40 overflow-y-auto">
                  {getWhatsappMessage(waModal.booking)}
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  const msg = getWhatsappMessage(waModal.booking!);
                  handleSendWhatsappDirect(waModal.targetPhone, msg);
                }}
                className="w-full h-10 rounded-xl bg-[#1DB954] hover:bg-[#1AA34A] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Buka WhatsApp & Kirim Pesan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const msg = getWhatsappMessage(waModal.booking!);
                  navigator.clipboard?.writeText(msg);
                  setWaModal((prev) => ({ ...prev, copied: true }));
                  setTimeout(() => setWaModal((prev) => ({ ...prev, copied: false })), 2000);
                }}
                className="w-full h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                {waModal.copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{waModal.copied ? 'Teks Berhasil Disalin!' : 'Salin Isi Pesan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Resi Transfer */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-bold text-xs text-neutral-900 truncate pr-2">
                {previewReceipt.title}
              </span>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center p-1">
              <img
                src={previewReceipt.url}
                alt="Preview Resi Transfer"
                className="w-full object-contain max-h-72 rounded-lg"
              />
            </div>

            <button
              onClick={() => setPreviewReceipt(null)}
              className="w-full h-9 rounded-xl bg-[#13281E] text-white font-bold text-xs cursor-pointer"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}

      {/* Modal Tolak Booking */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="font-bold text-xs sm:text-sm text-neutral-900">Batalkan Booking</span>
              <button
                onClick={() => setRejectingBookingId(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-neutral-700 block text-[11px]">Alasan Pembatalan</label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Contoh: Kamar sudah penuh / jadwal reschedule..."
                rows={3}
                className="w-full p-2 rounded-lg bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setRejectingBookingId(null)}
                className="flex-1 h-9 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Konfirmasi Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PERBAIKAN MENU BAWAH ADMIN: 4 MENU UTAMA
          1. Booking, 2. Kalender, 3. Laporan, 4. Pengaturan
         ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-4 py-2 max-w-md mx-auto">
        <div className="grid grid-cols-4 gap-1 text-neutral-500">
          {/* 1. Booking */}
          <button
            onClick={() => setAdminNavTab('booking')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              adminNavTab === 'booking' ? 'text-emerald-900 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                adminNavTab === 'booking' ? 'bg-[#13281E] text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight">Booking</span>
          </button>

          {/* 2. Kalender */}
          <button
            onClick={() => setAdminNavTab('kalender')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              adminNavTab === 'kalender' ? 'text-emerald-900 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                adminNavTab === 'kalender' ? 'bg-[#13281E] text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight">Kalender</span>
          </button>

          {/* 3. Laporan */}
          <button
            onClick={() => setAdminNavTab('laporan')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              adminNavTab === 'laporan' ? 'text-emerald-900 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                adminNavTab === 'laporan' ? 'bg-[#13281E] text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight">Laporan</span>
          </button>

          {/* 4. Pengaturan */}
          <button
            onClick={() => setAdminNavTab('pengaturan')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              adminNavTab === 'pengaturan' ? 'text-emerald-900 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                adminNavTab === 'pengaturan' ? 'bg-[#13281E] text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight">Pengaturan</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
