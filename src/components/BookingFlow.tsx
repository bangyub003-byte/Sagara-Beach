import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { Property, RoomType } from '../types';
import { SAMPLE_KTP_SVG, SAMPLE_PAYMENT_SVG } from '../data/mockAssets';
import { SafeImage } from './common/SafeImage';
import {
  ChevronLeft,
  X,
  Share2,
  Calendar,
  Check,
  Copy,
  Plus,
  Minus,
  ArrowRight,
  User,
  CreditCard,
  Signal,
  Wifi,
  Battery,
  MapPin,
  Bed,
  Bath,
  Users,
  AlertCircle,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Building,
  Car,
  Home,
  Upload,
  CheckCircle2,
} from 'lucide-react';

export const BookingFlow: React.FC = () => {
  const {
    accommodations,
    selectedProperty,
    setSelectedProperty,
    selectedRoomType,
    setSelectedRoomType,
    setCurrentView,
    activeBooking,
    activeBookingId,
    setActiveBookingId,
    createBooking,
    checkSundakAvailability,
    checkTrenggoleRoomAvailability,
    language,
  } = useBooking();

  // Wizard Step: 1 | 2 | 3 | 4 | 5
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSuccessView, setIsSuccessView] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string>('');

  // ==============================================================
  // STEP 1: PILIH PENGINAPAN (Sundak vs Trenggole)
  // ==============================================================
  const [selectedPropId, setSelectedPropId] = useState<string>(
    selectedProperty?.id || accommodations[0]?.id || 'homestay-sundak'
  );

  const fallbackProp: Property = accommodations[0] || selectedProperty || {
    id: 'homestay-sundak',
    name: 'Griya Barokah Pantai Sundak',
    tagline: 'Satu Rumah Penuh (Full House)',
    taglineEn: 'Full House',
    category: 'Full House',
    propertyType: 'full_homestay',
    location: 'Pantai Sundak, Gunungkidul',
    fullAddress: 'Pantai Sundak, Sidoharjo, Tepus, Gunungkidul',
    rating: 4.95,
    reviewsCount: 168,
    badge: 'Full House',
    badgeEn: 'Full House',
    image: '/images/sundak_fullhouse_1790552054893.jpg',
    gallery: ['/images/sundak_fullhouse_1790552054893.jpg'],
    description: 'Satu rumah penuh untuk keluarga/rombongan dekat pantai Sundak.',
    descriptionEn: 'Entire house for family near Sundak beach.',
    highlights: ['Full House', '4 Kamar AC', 'WiFi'],
    highlightsEn: ['Full House', '4 AC Bedrooms', 'WiFi'],
    whatsappContact: '082138613888',
    extraServices: [],
    roomTypes: [],
  };

  const activeProp: Property =
    accommodations.find((p) => p.id === selectedPropId) || selectedProperty || fallbackProp;

  const isSundak = activeProp
    ? activeProp.id === 'homestay-sundak' || activeProp.propertyType === 'full_homestay'
    : true;

  // ==============================================================
  // STEP 2: TANGGAL CHECK-IN / CHECK-OUT & CEK KETERSEDIAAN OTOMATIS
  // ==============================================================
  const [checkInDate, setCheckInDate] = useState<string>('2025-10-18');
  const [checkOutDate, setCheckOutDate] = useState<string>('2025-10-20');

  // Trenggole: pilihan kamar (multi-select atau single)
  const [trenggoleSelectedRooms, setTrenggoleSelectedRooms] = useState<string[]>(() => {
    if (selectedRoomType && selectedRoomType.id.startsWith('trenggole-')) {
      return [selectedRoomType.id];
    }
    return ['trenggole-kamar-1'];
  });

  // Hitung jumlah malam menginap
  const calculateNights = (cin: string, cout: string): number => {
    try {
      const d1 = new Date(cin);
      const d2 = new Date(cout);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const totalNights = calculateNights(checkInDate, checkOutDate);

  // Ketersediaan real-time berdasarkan tanggal terpilih
  const isSundakAvailable = checkSundakAvailability(checkInDate, checkOutDate);

  const toggleTrenggoleRoom = (roomId: string) => {
    const isAvail = checkTrenggoleRoomAvailability(roomId, checkInDate, checkOutDate);
    if (!isAvail) return; // Tidak bisa memilih kamar yang full

    setTrenggoleSelectedRooms((prev) => {
      if (prev.includes(roomId)) {
        if (prev.length <= 1) return prev; // Minimal 1 kamar
        return prev.filter((id) => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });
    setErrorNotice('');
  };

  // ==============================================================
  // STEP 3: DATA PEMESAN (Nama, Asal Kota, No WA, Jumlah Tamu)
  // (Tanpa pemilihan tanggal berulang!)
  // ==============================================================
  const [namaLengkap, setNamaLengkap] = useState<string>('Arya Yudhistira');
  const [asalKota, setAsalKota] = useState<string>('Yogyakarta');
  const [noHp, setNoHp] = useState<string>('081234567890');
  const [withWhom, setWithWhom] = useState<string>('Keluarga Inti (Suami/Istri & Anak)');
  const [totalGuests, setTotalGuests] = useState<number>(4); // Default 4 tamu

  // Validasi Step 3 Wajib Lengkap
  const isStep3Valid = Boolean(
    namaLengkap.trim() &&
    asalKota.trim() &&
    noHp.trim() &&
    withWhom.trim() &&
    checkInDate &&
    checkOutDate &&
    (isSundak ? totalGuests >= 4 : (trenggoleSelectedRooms.length > 0 && totalGuests >= 1))
  );

  // ==============================================================
  // STEP 4: PERHITUNGAN BIAYA & PILIHAN PEMBAYARAN (DP 50% ATAU LUNAS 100%)
  // ==============================================================
  // Aturan Harga:
  // 1. Sundak: Rp75.000 / orang / malam. Minimal 4 orang.
  //    Harga = Jumlah orang × jumlah malam × Rp75.000
  // 2. Trenggole: Harga kamar × jumlah malam.
  let grandTotal = 0;
  let bookingChoiceDisplayName = '';

  if (isSundak) {
    const effectivePax = Math.max(4, totalGuests);
    grandTotal = effectivePax * totalNights * 75000;
    bookingChoiceDisplayName = `Satu Rumah Penuh (Full House) • ${totalGuests} Tamu`;
  } else {
    const selectedRoomsList = (activeProp?.roomTypes || []).filter((r) =>
      trenggoleSelectedRooms.includes(r.id)
    );
    const roomCostPerNight = selectedRoomsList.reduce((acc, curr) => acc + (curr.pricePerNight || 0), 0);
    grandTotal = roomCostPerNight * totalNights;
    bookingChoiceDisplayName = selectedRoomsList.map((r) => `${r.name} (Lt.${r.floor || 1})`).join(', ') || 'Kamar Trenggole';
  }

  // Pilihan Pembayaran: DP 50% atau Lunas 100%
  const [paymentType, setPaymentType] = useState<'dp_50' | 'full_100'>('dp_50');
  const dpAmount = paymentType === 'dp_50' ? Math.round(grandTotal * 0.5) : grandTotal;
  const remainingBalance = Math.max(0, grandTotal - dpAmount);
  const [dpTermsAccepted, setDpTermsAccepted] = useState<boolean>(true);

  // ==============================================================
  // STEP 5: PEMBAYARAN & UPLOAD BUKTI TRANSFER (WAJIB!)
  // ==============================================================
  const [metodePembayaran, setMetodePembayaran] = useState<'bca' | 'mandiri' | 'qris'>('bca');
  const [salinStatus, setSalinStatus] = useState<boolean>(false);
  const [paymentProofImage, setPaymentProofImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCopyVa = () => {
    const vaNum = metodePembayaran === 'bca' ? '8801 2940 1827 0049' : '8920 1829 4819 0021';
    navigator.clipboard?.writeText(vaNum.replace(/\s+/g, ''));
    setSalinStatus(true);
    setTimeout(() => setSalinStatus(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPaymentProofImage(event.target.result as string);
          setErrorNotice('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Validasi Step 2 (Tanggal & Ketersediaan)
  const handleValidateAndProceedStep2 = () => {
    if (!checkInDate || !checkOutDate) {
      setErrorNotice('Tanggal check-in dan check-out wajib diisi.');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setErrorNotice('Tanggal check-out harus setelah tanggal check-in.');
      return;
    }

    if (isSundak) {
      if (!isSundakAvailable) {
        setErrorNotice('Griya Barokah Pantai Sundak (Full House) sudah penuh pada tanggal tersebut. Silakan pilih tanggal lain atau Pantai Trenggole.');
        return;
      }
    } else {
      // Pastikan ada kamar yang tersedia terpilih
      const availCount = trenggoleSelectedRooms.filter((id) =>
        checkTrenggoleRoomAvailability(id, checkInDate, checkOutDate)
      ).length;

      if (availCount === 0) {
        setErrorNotice('Kamar yang dipilih tidak tersedia pada tanggal ini. Silakan pilih kamar yang bertanda AVAILABLE.');
        return;
      }
    }

    setErrorNotice('');
    setActiveStep(3);
  };

  // Validasi Step 3 (Data Pemesan Wajib Lengkap & Mahrom)
  const handleValidateAndProceedStep3 = () => {
    if (!namaLengkap.trim() || !asalKota.trim() || !noHp.trim() || !withWhom.trim()) {
      setErrorNotice('Lengkapi data terlebih dahulu sebelum melanjutkan pemesanan.');
      return;
    }

    if (isSundak) {
      if (totalGuests < 4) {
        setErrorNotice('Minimal pemesanan untuk Griya Barokah Pantai Sundak adalah 4 orang.');
        return;
      }
    } else {
      if (trenggoleSelectedRooms.length === 0) {
        setErrorNotice('Pilih minimal 1 kamar di Pantai Trenggole terlebih dahulu.');
        return;
      }
      const maxCap = trenggoleSelectedRooms.length * 4;
      if (totalGuests > maxCap) {
        setErrorNotice(`Jumlah tamu (${totalGuests} orang) melebihi kapasitas kamar yang dipilih (${maxCap} orang). Silakan pilih kamar tambahan di Pantai Trenggole.`);
        return;
      }
      if (totalGuests < 1) {
        setErrorNotice('Jumlah tamu minimal 1 orang.');
        return;
      }
    }

    setErrorNotice('');
    setActiveStep(4);
  };

  // Validasi Step 4 (Pilihan Pembayaran)
  const handleProceedStep4 = () => {
    if (!dpTermsAccepted) {
      setErrorNotice('Anda wajib menyetujui ketentuan: "DP akan hangus apabila pesanan dibatalkan."');
      return;
    }
    setErrorNotice('');
    setActiveStep(5);
  };

  // Validasi & Kirim Booking (Step 5)
  // WAJIB: Upload bukti transfer sebelum booking dikirim!
  const handleSubmitBooking = async () => {
    if (!paymentProofImage) {
      setErrorNotice('Wajib upload bukti transfer sebelum booking dikirim. Booking tidak boleh diproses jika bukti pembayaran kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      const roomTypeFinalId = isSundak ? 'sundak-full-house' : trenggoleSelectedRooms[0];
      const roomNameFinal = isSundak
        ? 'Full House Griya Barokah Sundak'
        : bookingChoiceDisplayName;

      const newId = await createBooking({
        propertyId: activeProp.id,
        propertyName: activeProp.name,
        roomTypeId: roomTypeFinalId,
        roomTypeName: roomNameFinal,
        propertyImage: activeProp.image,
        location: activeProp.location,
        guestName: namaLengkap,
        guestPhone: noHp,
        guestNik: '340301xxxxxxxxxx',
        asalKota,
        withWhom,
        mahromConfirmed: true,
        ktpImageUrl: SAMPLE_KTP_SVG,
        checkInDate,
        checkOutDate,
        totalNights,
        guestsCount: totalGuests,
        roomsCount: isSundak ? 1 : trenggoleSelectedRooms.length,
        baseRoomCost: grandTotal,
        totalAmount: grandTotal,
        paymentType,
        dpPercentage: paymentType === 'full_100' ? 100 : 50,
        dpAmount,
        remainingBalance,
        paymentProofUrl: paymentProofImage || SAMPLE_PAYMENT_SVG,
        paymentMethod: metodePembayaran === 'qris' ? 'qris' : metodePembayaran === 'mandiri' ? 'mandiri_va' : 'bca_va',
        adminNotes: isSundak
          ? `Full House Sundak: ${totalGuests} orang x ${totalNights} malam x Rp75.000 = Rp${grandTotal.toLocaleString('id-ID')}. Mahrom: ${withWhom}. Pembayaran: ${paymentType === 'full_100' ? 'Lunas 100%' : 'DP 50%'}.`
          : `Trenggole: ${bookingChoiceDisplayName} x ${totalNights} malam = Rp${grandTotal.toLocaleString('id-ID')}. Mahrom: ${withWhom}. Pembayaran: ${paymentType === 'full_100' ? 'Lunas 100%' : 'DP 50%'}.`,
      });

      setActiveBookingId(newId);
      setIsSubmitting(false);
      setIsSuccessView(true);
    } catch {
      setIsSubmitting(false);
      setIsSuccessView(true);
    }
  };

  // ==============================================================
  // TAMPILAN SUKSES: 1 HALAMAN MOBILE RAPI & RINGKAS TANPA SCROLL
  // ==============================================================
  if (isSuccessView) {
    const bookingIdDisplay = activeBooking?.id || activeBookingId || 'GBH-9812';

    return (
      <div className="max-w-md mx-auto w-full h-[100dvh] max-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none p-3 sm:p-4 overflow-hidden">
        {/* Status Bar HP */}
        <div className="flex items-center justify-between text-neutral-800 text-[11px] font-semibold px-1 pt-0.5">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 opacity-90">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* HEADER: Reservasi Berhasil */}
        <div className="text-center py-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8F2] text-[#1DB954] text-xs font-bold border border-[#C6ECD8] shadow-2xs">
            <Check className="w-3.5 h-3.5 text-[#1DB954] stroke-[3]" />
            <span>Reservasi Berhasil</span>
          </div>
        </div>

        {/* CARD BOOKING */}
        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-neutral-200/90 shadow-xs space-y-2.5 my-auto">
          {/* Foto Penginapan Kecil + Nama & Unit */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <SafeImage
              src={activeProp.image}
              alt={activeProp.name}
              className="w-12 h-12 rounded-xl object-cover"
              containerClassName="w-12 h-12 rounded-xl shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-[13px] font-black text-neutral-900 leading-tight truncate">
                {activeProp.name}
              </h2>
              <p className="text-[11px] text-emerald-800 font-bold truncate mt-0.5">
                {isSundak ? 'Satu Rumah Penuh (Full House)' : bookingChoiceDisplayName}
              </p>
              <span className="text-[10px] text-neutral-400 block truncate">
                {activeProp.location}
              </span>
            </div>
          </div>

          {/* Rincian Pemesan & Menginap */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Nama Pemesan:</span>
              <strong className="text-neutral-900 font-bold truncate max-w-[190px] text-right">
                {namaLengkap}
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Jumlah Tamu:</span>
              <strong className="text-neutral-900 font-bold text-right">
                {totalGuests} Tamu
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Tanggal Menginap:</span>
              <strong className="text-neutral-900 font-bold text-right">
                {checkInDate} s/d {checkOutDate} ({totalNights} Malam)
              </strong>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
              <span className="text-neutral-500 font-medium">Status Pembayaran:</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] sm:text-[11px] font-bold border border-emerald-200">
                {paymentType === 'full_100'
                  ? `Lunas 100% (Rp ${grandTotal.toLocaleString('id-ID')})`
                  : `DP 50% (Rp ${dpAmount.toLocaleString('id-ID')})`}
              </span>
            </div>

            {/* Kode Booking */}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
              <span className="text-neutral-500 font-medium">Kode Booking:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black font-mono tracking-wider text-emerald-900">
                  {bookingIdDisplay}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(bookingIdDisplay);
                    setSalinStatus(true);
                    setTimeout(() => setSalinStatus(false), 2000);
                  }}
                  className="p-1 rounded bg-neutral-100 border border-neutral-200 text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                  title="Salin Kode Booking"
                >
                  {salinStatus ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* QR CODE Tampil Jelas & Proporsional */}
          <div className="flex flex-col items-center justify-center pt-1 border-t border-neutral-100">
            <div className="p-1.5 bg-white rounded-xl border border-neutral-300 shadow-2xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                  `GBH:BOOKING:${bookingIdDisplay}|HOMESTAY:${activeProp.name}|GUEST:${namaLengkap}`
                )}`}
                alt="QR Code Tiket"
                className="w-20 h-20 sm:w-22 sm:h-22 object-contain"
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1 font-medium text-center">
              Tunjukkan QR Code kepada resepsionis saat check-in
            </p>
          </div>
        </div>

        {/* TOMBOL: Kembali ke Beranda & Lihat Pesanan Saya */}
        <div className="space-y-1.5 pt-1 pb-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="w-full h-10 rounded-xl bg-white border border-neutral-300 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('my_bookings')}
              className="w-full h-10 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <span>Lihat Pesanan Saya</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // WIZARD STEP-BY-STEP
  // ==============================================================
  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-28">
      {/* Mobile Top Status Bar */}
      <div className="sticky top-0 z-30 bg-[#F6F7F9]/95 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-neutral-800 text-xs font-semibold">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Header Wizard */}
      <header className="px-5 py-3 flex items-center justify-between border-b border-neutral-200/80 bg-white/70 backdrop-blur-md">
        <button
          onClick={() => {
            if (activeStep > 1) {
              setActiveStep((prev) => (prev - 1) as any);
              setErrorNotice('');
            } else {
              setCurrentView('home');
            }
          }}
          className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200/80 flex items-center justify-center text-neutral-700 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-800 stroke-[2.2]" />
        </button>

        <div className="text-center">
          <h1 className="text-[14px] font-black text-neutral-900 tracking-tight">
            {activeStep === 1 && 'Langkah 1: Pilih Penginapan'}
            {activeStep === 2 && 'Langkah 2: Pilih Tanggal & Ketersediaan'}
            {activeStep === 3 && 'Langkah 3: Data Pemesan'}
            {activeStep === 4 && 'Langkah 4: Pilihan Pembayaran'}
            {activeStep === 5 && 'Langkah 5: Upload Bukti Transfer'}
          </h1>
          <span className="text-[10px] text-emerald-800 font-bold block">
            Tahap {activeStep} dari 5
          </span>
        </div>

        <div className="w-10 h-10 flex items-center justify-center">
          <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
            {activeStep}
          </span>
        </div>
      </header>

      {/* Progress Bar HP */}
      <div className="w-full bg-neutral-200 h-1">
        <div
          className="bg-emerald-700 h-1 transition-all duration-300"
          style={{ width: `${(activeStep / 5) * 100}%` }}
        />
      </div>

      {/* Error Alert Box */}
      {errorNotice && (
        <div className="mx-5 mt-3 p-3.5 bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-2xl text-xs flex items-start gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{errorNotice}</span>
        </div>
      )}

      {/* Konten Wizard Langkah demi Langkah */}
      <div className="px-5 pt-3 pb-6 flex-grow">
        {/* ==============================================================
            STEP 1: PILIH PENGINAPAN (Setiap Penginapan Memiliki Halaman Pilihan Sendiri)
           ============================================================== */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500 block">
                Langkah 1 dari 5
              </span>
              <h2 className="text-lg font-black text-neutral-900">
                Pilih Penginapan
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Pilih salah satu penginapan untuk melanjutkan ke pemilihan tanggal:
              </p>
            </div>

            {/* Tab Pemilih Penginapan Bersih */}
            <div className="flex p-1 bg-neutral-200/90 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedPropId('homestay-sundak');
                  setSelectedProperty(accommodations.find((a) => a.id === 'homestay-sundak') || accommodations[0]);
                  setErrorNotice('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                  selectedPropId === 'homestay-sundak'
                    ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-black/5'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Pantai Sundak
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPropId('homestay-trenggole');
                  setSelectedProperty(accommodations.find((a) => a.id === 'homestay-trenggole') || accommodations[1]);
                  setErrorNotice('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                  selectedPropId === 'homestay-trenggole'
                    ? 'bg-white text-sky-900 shadow-xs ring-1 ring-black/5'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Pantai Trenggole
              </button>
            </div>

            {/* HALAMAN PENGINAPAN 1: GRIYA BAROKAH PANTAI SUNDAK (HANYA FOTO & INFO SUNDAK) */}
            {selectedPropId === 'homestay-sundak' && (
              <div className="p-4 rounded-[26px] border border-emerald-800 bg-white shadow-md ring-2 ring-emerald-800/20 space-y-3.5">
                <div className="relative h-48 w-full rounded-2xl overflow-hidden">
                  <SafeImage
                    src="/images/sundak_fullhouse_1790552054893.jpg"
                    alt="Griya Barokah Pantai Sundak"
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                      Satu Rumah Penuh (Full House)
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shadow-md">
                      ✓
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                    <Home className="w-3.5 h-3.5" />
                    <span>Konsep: Satu Rumah Penuh (Bukan Per Kamar)</span>
                  </div>
                  <h3 className="font-black text-base text-neutral-900">
                    Griya Barokah Pantai Sundak
                  </h3>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Satu rumah utuh untuk keluarga/rombongan dekat pantai pasir putih. 4 kamar tidur AC, 3 KM, ruang keluarga luas, dapur lengkap, alat masak/makan, mesin cuci, dan WiFi.
                  </p>
                </div>

                {/* Informasi Wajib Sesuai Aturan */}
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">Konsep Penginapan:</span>
                    <strong className="text-emerald-900 font-extrabold">Satu Rumah Penuh (Full House)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">Tarif Penginapan:</span>
                    <strong className="text-emerald-800 font-black">Rp75.000 /orang/malam</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200/80">
                    <span className="font-bold text-emerald-950">Ketentuan Pemesanan:</span>
                    <strong className="text-emerald-900 font-black">Minimal 4 orang</strong>
                  </div>
                  <span className="text-[10px] text-neutral-600 block pt-0.5">
                    Perhitungan otomatis: Jumlah orang × Jumlah malam × Rp75.000
                  </span>
                </div>
              </div>
            )}

            {/* HALAMAN PENGINAPAN 2: GRIYA BAROKAH PANTAI TRENGGOLE (HANYA FOTO & INFO TRENGGOLE) */}
            {selectedPropId === 'homestay-trenggole' && (
              <div className="p-4 rounded-[26px] border border-sky-800 bg-white shadow-md ring-2 ring-sky-800/20 space-y-3.5">
                <div className="relative h-48 w-full rounded-2xl overflow-hidden">
                  <SafeImage
                    src="/images/trenggole_house_1790552065368.jpg"
                    alt="Griya Barokah Pantai Trenggole"
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-3 py-1 rounded-full bg-sky-700 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                      Pemesanan Berdasarkan Kamar
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center text-xs font-bold shadow-md">
                      ✓
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-sky-800 font-bold">
                    <Building className="w-3.5 h-3.5" />
                    <span>Pilihan 4 Kamar Tidur AC Tepi Pantai</span>
                  </div>
                  <h3 className="font-black text-base text-neutral-900">
                    Griya Barokah Pantai Trenggole
                  </h3>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Setiap kamar view pantai, memiliki 2 bed ukuran ±130x200 cm (kapasitas 4 orang). Pilihan lantai 1 & 2 serta opsi dapur mini.
                  </p>
                </div>

                {/* Informasi Wajib Trenggole */}
                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-950">Konsep Pemesanan:</span>
                    <strong className="text-sky-900 font-extrabold">Pemesanan Berdasarkan Kamar</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-950">Tersedia Kamar:</span>
                    <strong className="text-sky-900 font-bold">Kamar 1, 2, 3, 4</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-sky-200/80">
                    <span className="font-bold text-sky-950">Tarif per Kamar:</span>
                    <strong className="text-sky-900 font-black">Rp285.000 s/d Rp365.000 /malam</strong>
                  </div>
                  <span className="text-[10px] text-neutral-600 block pt-0.5">
                    Status kamar dicek otomatis berdasarkan tanggal check-in & check-out aktif.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            STEP 2: PILIH TANGGAL & SISTEM OTOMATIS MENGECEK KETERSEDIAAN
           ============================================================== */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500 block">
                Langkah 2 dari 5
              </span>
              <h2 className="text-lg font-black text-neutral-900">
                Pilih Tanggal & Cek Ketersediaan
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Pilih tanggal check-in dan check-out untuk mengecek status ketersediaan unit secara otomatis.
              </p>
            </div>

            {/* Input Tanggal Menginap */}
            <div className="bg-white rounded-[26px] p-4.5 shadow-xs border border-neutral-200/90 space-y-3">
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">
                    Tanggal Check-in <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      setErrorNotice('');
                    }}
                    className="w-full h-11 px-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">
                    Tanggal Check-out <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => {
                      setCheckOutDate(e.target.value);
                      setErrorNotice('');
                    }}
                    className="w-full h-11 px-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-100 flex items-center justify-between text-xs text-neutral-700">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Durasi Menginap:</span>
                </span>
                <strong className="text-neutral-900 font-bold">{totalNights} Malam</strong>
              </div>
            </div>

            {/* HASIL PENGECEKAN KETERSEDIAAN OTOMATIS */}
            {isSundak ? (
              /* Ketersediaan Full House Sundak */
              <div className="space-y-3">
                <span className="text-xs font-bold text-neutral-700 block uppercase tracking-wider">
                  Status Ketersediaan Pantai Sundak:
                </span>

                <div className={`p-4 rounded-[26px] border bg-white space-y-3 ${
                  isSundakAvailable
                    ? 'border-emerald-700 shadow-sm'
                    : 'border-rose-300 bg-rose-50/40'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-emerald-800" />
                        <h3 className="font-black text-base text-neutral-900">
                          Full House Griya Barokah Sundak
                        </h3>
                      </div>
                      <span className="text-xs text-neutral-500 block mt-0.5">
                        Satu rumah penuh (4 Kamar AC, 3 KM, Dapur Lengkap, Mesin Cuci)
                      </span>
                    </div>

                    <div>
                      {isSundakAvailable ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AVAILABLE</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black border border-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>FULL / TIDAK TERSEDIA</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-neutral-200/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-800">Tarif per Orang:</span>
                      <strong className="text-emerald-800 font-bold">Rp75.000 /orang/malam</strong>
                    </div>
                    <span className="text-[11px] text-neutral-500 block">
                      Minimal pemesanan 4 orang. Total dihitung otomatis berdasarkan jumlah tamu yang Anda masukkan.
                    </span>
                  </div>

                  {!isSundakAvailable && (
                    <div className="p-3 bg-rose-100 text-rose-900 rounded-xl text-xs flex items-center gap-2 font-semibold">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Pada tanggal ini sudah ada booking Full House Pantai Sundak. Status: FULL. Silakan pilih tanggal lain.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Ketersediaan 4 Kamar Pantai Trenggole */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 block uppercase tracking-wider">
                    Pilih Kamar yang AVAILABLE:
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Pilih 1 atau lebih kamar
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(activeProp?.roomTypes || []).map((room) => {
                    const isAvail = checkTrenggoleRoomAvailability(room.id, checkInDate, checkOutDate);
                    const isSelected = trenggoleSelectedRooms.includes(room.id);

                    return (
                      <div
                        key={room.id}
                        onClick={() => isAvail && toggleTrenggoleRoom(room.id)}
                        className={`p-4 rounded-[26px] border transition-all bg-white ${
                          !isAvail
                            ? 'opacity-60 bg-neutral-100 border-neutral-200 cursor-not-allowed'
                            : isSelected
                            ? 'border-emerald-800 shadow-md ring-2 ring-emerald-800/20 cursor-pointer'
                            : 'border-neutral-200 hover:border-neutral-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-neutral-900">
                                {room.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] font-bold text-neutral-600">
                                Lantai {room.floor || 1}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-500 block mt-0.5">
                              {room.description}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-emerald-800 block">
                              Rp {room.pricePerNight.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-neutral-400 block">/malam</span>

                            <div className="mt-1">
                              {isAvail ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 justify-end ${
                                  isSelected
                                    ? 'bg-emerald-800 text-white'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {isSelected ? '✓ Terpilih' : 'AVAILABLE'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                                  FULL
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            STEP 3: ISI DATA PEMESAN (TANPA PEMILIHAN TANGGAL BERULANG!)
           ============================================================== */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500 block">
                Langkah 3 dari 5
              </span>
              <h2 className="text-lg font-black text-neutral-900">
                Isi Data Pemesan
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Lengkapi identitas pemesan dan jumlah tamu rombongan.
              </p>
            </div>

            {/* Ringkasan Tanggal Tetap dari Step 2 (Tidak Ditanyakan Ulang!) */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                  Tanggal Menginap Terpilih:
                </span>
                <span className="font-bold text-neutral-900 text-xs">
                  {checkInDate} s/d {checkOutDate} ({totalNights} Malam)
                </span>
                <span className="text-[11px] text-neutral-600 block mt-0.5">
                  Unit: {activeProp.name} • {bookingChoiceDisplayName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold shadow-2xs hover:bg-emerald-50"
              >
                Ubah Tanggal
              </button>
            </div>

            <div className="bg-white rounded-[28px] p-5 shadow-xs border border-neutral-200/90 space-y-4 text-xs">
              {/* Nama Pemesan */}
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  1. Nama Lengkap Pemesan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => {
                    setNamaLengkap(e.target.value);
                    setErrorNotice('');
                  }}
                  placeholder="Nama pemesan sesuai KTP"
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Kota Asal */}
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  2. Kota Asal Pemesan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={asalKota}
                  onChange={(e) => {
                    setAsalKota(e.target.value);
                    setErrorNotice('');
                  }}
                  placeholder="Contoh: Yogyakarta, Solo, Jakarta, Semarang"
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  3. Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => {
                    setNoHp(e.target.value);
                    setErrorNotice('');
                  }}
                  placeholder="Contoh: 081234567890"
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Dengan Siapa Berkunjung (Wajib Mahrom) */}
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  4. Dengan Siapa Berkunjung (Wajib Mahrom) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={withWhom}
                  onChange={(e) => {
                    setWithWhom(e.target.value);
                    setErrorNotice('');
                  }}
                  className="w-full h-11 px-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="">-- Pilih Hubungan Tamu (Wajib Mahrom / Sah) --</option>
                  <option value="Keluarga Inti (Suami/Istri & Anak)">Keluarga Inti (Suami/Istri & Anak) - Mahrom</option>
                  <option value="Rombongan Keluarga Besar (Mahrom)">Rombongan Keluarga Besar (Mahrom)</option>
                  <option value="Pasangan Suami & Istri Sah">Pasangan Suami & Istri Sah (Pasutri)</option>
                  <option value="Rombongan Teman Sesama Pria (Ikhwan)">Rombongan Teman Sesama Pria (Ikhwan)</option>
                  <option value="Rombongan Teman Sesama Wanita (Akhwat)">Rombongan Teman Sesama Wanita (Akhwat)</option>
                  <option value="Komunitas / Lembaga / Majelis">Komunitas / Lembaga / Majelis</option>
                </select>
                <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                  * Sesuai ketentuan homestay syariah barokah, tamu wajib bersama mahrom / keluarga sah atau sesama gender.
                </span>
              </div>

              {/* Jumlah Tamu */}
              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-neutral-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-neutral-900 block text-xs">
                      5. Jumlah Tamu <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-neutral-500 block">
                      {isSundak
                        ? 'Pantai Sundak: Minimal 4 orang (Rp75.000/orang/malam)'
                        : `Pantai Trenggole: Maksimal ${trenggoleSelectedRooms.length * 4} orang (${trenggoleSelectedRooms.length} kamar)`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => totalGuests > 1 && setTotalGuests(totalGuests - 1)}
                      className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 font-bold flex items-center justify-center text-neutral-800 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-black text-sm w-6 text-center text-neutral-900">
                      {totalGuests}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTotalGuests(totalGuests + 1)}
                      className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 font-bold flex items-center justify-center text-neutral-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isSundak && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                    Kalkulasi Sundak: <strong>{totalGuests} orang × {totalNights} malam × Rp75.000 = Rp {(totalGuests * totalNights * 75000).toLocaleString('id-ID')}</strong>
                  </div>
                )}
              </div>

              {/* Peringatan Kelengkapan Data */}
              {!isStep3Valid && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">
                    Lengkapi data terlebih dahulu sebelum melanjutkan pemesanan.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==============================================================
            STEP 4: RINGKASAN HARGA & PILIHAN PEMBAYARAN (DP 50% ATAU LUNAS 100%)
           ============================================================== */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500 block">
                Langkah 4 dari 5
              </span>
              <h2 className="text-lg font-black text-neutral-900">
                Pilihan Pembayaran
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Pilih opsi pembayaran: Uang Muka (DP 50%) atau Lunas 100%. Nominal otomatis dihitung.
              </p>
            </div>

            {/* Rincian Tagihan */}
            <div className="bg-white rounded-[28px] p-5 shadow-xs border border-neutral-200/90 space-y-3.5 text-xs">
              <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-neutral-900">
                    {activeProp.name}
                  </h3>
                  <span className="text-emerald-800 font-bold block text-xs">
                    {bookingChoiceDisplayName}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600">
                  {totalNights} Malam
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-neutral-600">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Nama Pemesan</span>
                  <strong className="text-neutral-900">{namaLengkap} ({asalKota})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Nomor WhatsApp</span>
                  <strong className="text-neutral-900">{noHp}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Tanggal Menginap</span>
                  <strong className="text-neutral-900">{checkInDate} s/d {checkOutDate}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Jumlah Tamu</span>
                  <strong className="text-neutral-900">{totalGuests} Orang</strong>
                </div>
              </div>

              {/* Formula & Total */}
              <div className="pt-3 border-t border-neutral-100 space-y-1">
                {isSundak ? (
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>{totalGuests} orang × {totalNights} malam × Rp75.000</span>
                    <span className="font-bold text-neutral-900">Rp {grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Tarif {trenggoleSelectedRooms.length} kamar × {totalNights} malam</span>
                    <span className="font-bold text-neutral-900">Rp {grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-200/80 flex items-baseline justify-between text-sm">
                  <strong className="text-neutral-900">Total Biaya Menginap:</strong>
                  <strong className="text-emerald-800 font-black text-lg">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>
            </div>

            {/* DUA PILIHAN PEMBAYARAN: DP 50% vs LUNAS 100% */}
            <div className="bg-white rounded-[28px] p-5 shadow-xs border border-emerald-300 space-y-3.5 text-xs">
              <span className="font-black uppercase tracking-wider text-neutral-900 block">
                Pilih Tipe Pembayaran:
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Opsi 1: DP 50% */}
                <button
                  type="button"
                  onClick={() => setPaymentType('dp_50')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentType === 'dp_50'
                      ? 'border-emerald-800 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-800/20'
                      : 'border-neutral-200 bg-[#F9FAFB] hover:border-neutral-300'
                  }`}
                >
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Opsi 1</span>
                  <span className="text-sm font-black text-neutral-900 block mt-0.5">
                    DP 50%
                  </span>
                  <span className="text-xs font-black text-emerald-900 block mt-1">
                    Rp {Math.round(grandTotal * 0.5).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Sisa Rp {Math.round(grandTotal * 0.5).toLocaleString('id-ID')} saat check-in
                  </span>
                </button>

                {/* Opsi 2: Lunas 100% */}
                <button
                  type="button"
                  onClick={() => setPaymentType('full_100')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentType === 'full_100'
                      ? 'border-emerald-800 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-800/20'
                      : 'border-neutral-200 bg-[#F9FAFB] hover:border-neutral-300'
                  }`}
                >
                  <span className="text-[10px] font-bold text-sky-800 uppercase block">Opsi 2</span>
                  <span className="text-sm font-black text-neutral-900 block mt-0.5">
                    Lunas 100%
                  </span>
                  <span className="text-xs font-black text-emerald-900 block mt-1">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    Tidak ada sisa pelunasan saat tiba
                  </span>
                </button>
              </div>

              {/* Rincian Bayar Sekarang */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-700">Nominal yang Harus Ditransfer:</span>
                  <span className="text-base font-black text-emerald-900">
                    Rp {dpAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                {paymentType === 'dp_50' && (
                  <div className="flex items-center justify-between text-[11px] text-neutral-600">
                    <span>Sisa Pelunasan Saat Check-in:</span>
                    <span className="font-bold text-neutral-900">
                      Rp {remainingBalance.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>

              {/* Ketentuan Pembatalan */}
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Ketentuan: &quot;DP akan hangus apabila pesanan dibatalkan.&quot;</span>
                </div>
                <label className="flex items-start gap-2 pt-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dpTermsAccepted}
                    onChange={(e) => setDpTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-rose-300 text-rose-600"
                  />
                  <span className="text-[11px] text-rose-900">
                    Saya menyetujui ketentuan pemesanan dan pembatalan Griya Barokah Homestay.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            STEP 5: PEMBAYARAN & UPLOAD BUKTI TRANSFER (WAJIB!)
           ============================================================== */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500 block">
                Langkah 5 dari 5
              </span>
              <h2 className="text-lg font-black text-neutral-900">
                Pembayaran & Bukti Transfer
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Lakukan transfer sejumlah nominal di bawah dan wajib upload bukti transfer.
              </p>
            </div>

            {/* Total Tagihan Transfer */}
            <div className="p-4 rounded-[26px] bg-white border border-emerald-300 shadow-xs space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                Nominal Transfer {paymentType === 'full_100' ? '(Lunas 100%)' : '(DP 50%)'}
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="font-black text-sm text-neutral-900">
                    {activeProp.name}
                  </h3>
                  <span className="text-[11px] text-neutral-500">
                    {namaLengkap} • {totalNights} Malam
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-800 block">
                    Rp {dpAmount.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {paymentType === 'full_100' ? 'Lunas' : 'DP 50%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rekening Tujuan */}
            <div className="p-4.5 rounded-[26px] bg-white border border-neutral-200/90 shadow-xs space-y-3.5 text-xs">
              <span className="font-extrabold text-neutral-900 block">
                Pilih Rekening Tujuan Transfer:
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMetodePembayaran('bca')}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    metodePembayaran === 'bca'
                      ? 'bg-[#181C24] text-white shadow-xs'
                      : 'bg-[#F4F5F7] text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  BCA VA
                </button>

                <button
                  type="button"
                  onClick={() => setMetodePembayaran('mandiri')}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    metodePembayaran === 'mandiri'
                      ? 'bg-[#181C24] text-white shadow-xs'
                      : 'bg-[#F4F5F7] text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Mandiri VA
                </button>

                <button
                  type="button"
                  onClick={() => setMetodePembayaran('qris')}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    metodePembayaran === 'qris'
                      ? 'bg-[#181C24] text-white shadow-xs'
                      : 'bg-[#F4F5F7] text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  QRIS Barokah
                </button>
              </div>

              {metodePembayaran !== 'qris' ? (
                <div className="p-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Nomor Rekening / Virtual Account
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white text-[10px] font-bold text-neutral-700 border border-neutral-200 uppercase">
                      {metodePembayaran}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[16px] font-black font-mono text-neutral-900 tracking-wider">
                      {metodePembayaran === 'bca' ? '8801 2940 1827 0049' : '8920 1829 4819 0021'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVa}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      {salinStatus ? <Check className="w-3.5 h-3.5 text-[#1DB954]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{salinStatus ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500 block">
                    Atas Nama: <strong>Griya Barokah Homestay</strong>
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-neutral-200 flex flex-col items-center text-center space-y-2">
                  <div className="p-2 bg-white rounded-xl border border-neutral-200">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SAGARA_QRIS_GRIYA_BAROKAH"
                      alt="QRIS Barokah"
                      className="w-32 h-32"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-600 font-medium">
                    Scan QRIS via BCA Mobile, Mandiri Livin, GoPay, OVO, atau ShopeePay.
                  </span>
                </div>
              )}

              {/* UPLOAD BUKTI TRANSFER (WAJIB SESUAI INSTRUKSI) */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <label className="font-black text-neutral-900 text-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Upload Bukti Transfer</span>
                    <span className="text-rose-500">* (Wajib)</span>
                  </label>
                  {paymentProofImage && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Foto Terpilih
                    </span>
                  )}
                </div>

                <div className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                  paymentProofImage
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : 'border-neutral-300 bg-[#FAFBFD] hover:border-neutral-400'
                }`}>
                  {paymentProofImage ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={paymentProofImage}
                        alt="Bukti Transfer"
                        className="w-16 h-16 rounded-xl object-cover border border-emerald-300"
                      />
                      <div className="min-w-0 flex-grow">
                        <span className="text-xs font-bold text-emerald-950 block">
                          Bukti transfer berhasil diunggah
                        </span>
                        <span className="text-[11px] text-neutral-500 block truncate">
                          Siap dikirim untuk verifikasi pengelola.
                        </span>
                        <label className="text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer block mt-1">
                          <span>Ganti foto bukti transfer</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center text-center cursor-pointer py-2">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-xs mb-2">
                        <Upload className="w-6 h-6 text-emerald-700" />
                      </div>
                      <span className="text-xs font-bold text-neutral-900 block">
                        Pilih Foto Struk / Screenshot Bukti Transfer
                      </span>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        Format JPG atau PNG (Maks. 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Peringatan Wajib Bukti Pembayaran */}
                {!paymentProofImage && (
                  <p className="text-[11px] text-rose-700 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    ⚠️ <strong>Perhatian:</strong> Upload bukti transfer sebelum booking dikirim. Booking tidak boleh diproses jika bukti pembayaran kosong.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Wizard Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-6 py-3.5 max-w-md mx-auto flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
            {activeStep === 5 ? `Total Bayar (${paymentType === 'full_100' ? 'Lunas' : 'DP 50%'})` : 'Total Biaya'}
          </span>
          <span className="text-[16px] font-black text-neutral-900">
            {activeStep === 5
              ? `Rp ${dpAmount.toLocaleString('id-ID')}`
              : `Rp ${grandTotal.toLocaleString('id-ID')}`}
          </span>
        </div>

        {activeStep === 1 && (
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className="h-12 px-5 rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>Pilih Tanggal</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}

        {activeStep === 2 && (
          <button
            type="button"
            onClick={handleValidateAndProceedStep2}
            className="h-12 px-5 rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>Isi Data Tamu</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}

        {activeStep === 3 && (
          <button
            type="button"
            onClick={handleValidateAndProceedStep3}
            disabled={!isStep3Valid}
            className="h-12 px-5 rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Pilih Pembayaran</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}

        {activeStep === 4 && (
          <button
            type="button"
            onClick={handleProceedStep4}
            className="h-12 px-5 rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>Lanjut ke Transfer</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}

        {activeStep === 5 && (
          <button
            type="button"
            onClick={handleSubmitBooking}
            disabled={isSubmitting || !paymentProofImage}
            className="h-12 px-5 rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? 'Mengirim...' : 'Kirim Booking'}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};
