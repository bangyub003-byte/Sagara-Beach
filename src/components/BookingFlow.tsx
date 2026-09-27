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
  Wallet,
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
  AlertTriangle,
  Receipt,
  Home,
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
    language,
  } = useBooking();

  // Wizard Step: 1 | 2 | 3 | 4 | 5
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSuccessView, setIsSuccessView] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string>('');

  // ==============================================================
  // STEP 1: PILIH HOMESTAY (Sundak: Full Homestay vs Trenggole: Individual Room)
  // ==============================================================
  const [selectedPropId, setSelectedPropId] = useState<string>(
    selectedProperty?.id || accommodations[0]?.id || 'homestay-sundak'
  );

  const activeProp: Property =
    accommodations.find((p) => p.id === selectedPropId) || accommodations[0] || selectedProperty;

  const isSundak = activeProp.id === 'homestay-sundak' || activeProp.propertyType === 'full_homestay';

  // ==============================================================
  // STEP 2: PILIH KAMAR / PAKET
  // ==============================================================
  // Untuk Sundak (Full Homestay / Rumah):
  // Opsi A: 'sundak-2-kamar' (Sewa 2 Kamar, Rp500.000/malam, maks 6 orang)
  // Opsi B: 'sundak-4-kamar' (Sewa 4 Kamar Rumah Penuh, Rp800.000/malam, maks 12 orang)
  const [sundakPackageId, setSundakPackageId] = useState<'sundak-2-kamar' | 'sundak-4-kamar'>('sundak-2-kamar');

  // Untuk Trenggole (Individual Room):
  // Bisa memilih 1 atau lebih kamar (Kamar 1, 2, 3, 4)
  const [trenggoleSelectedRooms, setTrenggoleSelectedRooms] = useState<string[]>(() => {
    if (selectedRoomType && selectedRoomType.id.startsWith('trenggole-')) {
      return [selectedRoomType.id];
    }
    return ['trenggole-kamar-1'];
  });

  // Tambahan Extra Bed (Rp25.000/orang/malam)
  const [extraBedsCount, setExtraBedsCount] = useState<number>(0);

  // ==============================================================
  // STEP 3: DATA PEMESAN WAJIB
  // ==============================================================
  const [namaLengkap, setNamaLengkap] = useState<string>('Arya Yudhistira');
  const [asalKota, setAsalKota] = useState<string>('Yogyakarta');
  const [noHp, setNoHp] = useState<string>('081234567890');
  const [nikKtp, setNikKtp] = useState<string>('3403011408920002');
  const [checkInDate, setCheckInDate] = useState<string>('2025-10-18');
  const [checkOutDate, setCheckOutDate] = useState<string>('2025-10-20');
  const [budgetPlan, setBudgetPlan] = useState<string>('Sesuai total tarif penginapan');

  // Rincian Tamu Keluarga
  const [adultMalesCount, setAdultMalesCount] = useState<number>(2);
  const [adultFemalesCount, setAdultFemalesCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [toddlerCount, setToddlerCount] = useState<number>(0);

  // Hubungan antar tamu (untuk memastikan aturan mahrom)
  const [guestRelationship, setGuestRelationship] = useState<string>(
    'Keluarga Inti (Suami, Istri & Anak-anak)'
  );

  // Kendaraan
  const [vehicleDetail, setVehicleDetail] = useState<string>(
    'Mobil Pribadi (Toyota Avanza / 1 Unit)'
  );

  // Sumber informasi
  const [referralSource, setReferralSource] = useState<string>(
    'Google Search / Rekomendasi Teman'
  );

  // Durasi menginap
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
  const totalGuests = adultMalesCount + adultFemalesCount + childrenCount + toddlerCount;

  // ==============================================================
  // KALKULASI KAPASITAS & HARGA OTOMATIS
  // ==============================================================
  // 1. Kapasitas Maksimal
  let baseCapacity = 0;
  let maxAllowedGuestsBeforeExtraBed = 0;
  let baseRoomCostPerNight = 0;
  let bookingChoiceDisplayName = '';

  if (isSundak) {
    if (sundakPackageId === 'sundak-2-kamar') {
      baseCapacity = 6;
      maxAllowedGuestsBeforeExtraBed = 6; // Sewa 2 kamar maksimal 6 orang
      baseRoomCostPerNight = 500000; // Rp250.000/kamar x 2 kamar = Rp500.000
      bookingChoiceDisplayName = 'Sewa 2 Kamar (Maksimal 6 Orang)';
    } else {
      baseCapacity = 12;
      maxAllowedGuestsBeforeExtraBed = 12; // Sewa 4 kamar maksimal 12 orang
      baseRoomCostPerNight = 800000;
      bookingChoiceDisplayName = 'Sewa 4 Kamar / Rumah Penuh (Maksimal 12 Orang)';
    }
  } else {
    // Trenggole: Setiap kamar kapasitas 4 orang
    const selectedRoomsList = activeProp.roomTypes.filter((r) =>
      trenggoleSelectedRooms.includes(r.id)
    );
    baseCapacity = selectedRoomsList.length * 4;
    maxAllowedGuestsBeforeExtraBed = baseCapacity;
    baseRoomCostPerNight = selectedRoomsList.reduce((acc, curr) => acc + curr.pricePerNight, 0);
    bookingChoiceDisplayName = selectedRoomsList.map((r) => r.name).join(', ') || 'Kamar Trenggole';
  }

  // Kapasitas Total dengan Extra Bed
  const totalMaxCapacityWithExtraBeds = maxAllowedGuestsBeforeExtraBed + extraBedsCount;

  // Kalkulasi Total Biaya
  const baseCostTotal = baseRoomCostPerNight * totalNights;
  const extraBedTotal = extraBedsCount * 25000 * totalNights;
  const grandTotal = baseCostTotal + extraBedTotal;

  // ==============================================================
  // STEP 4: RINGKASAN & ATURAN DP (> 50%)
  // ==============================================================
  const minDpRequired = Math.floor(grandTotal * 0.5) + 1000; // Minimal lebih dari 50%
  const [dpPercentage, setDpPercentage] = useState<number>(60);
  const [dpAmount, setDpAmount] = useState<number>(() => Math.round(grandTotal * 0.6));
  const [dpTermsAccepted, setDpTermsAccepted] = useState<boolean>(false);

  useEffect(() => {
    const calc = Math.round((grandTotal * dpPercentage) / 100);
    setDpAmount(Math.max(calc, minDpRequired));
  }, [grandTotal, dpPercentage]);

  const remainingBalance = Math.max(0, grandTotal - dpAmount);

  // ==============================================================
  // STEP 5: PEMBAYARAN DP
  // ==============================================================
  const [metodePembayaran, setMetodePembayaran] = useState<'bca' | 'mandiri' | 'qris'>('bca');
  const [salinStatus, setSalinStatus] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [walletAdded, setWalletAdded] = useState<boolean>(false);

  const handleCopyVa = () => {
    const vaNum = metodePembayaran === 'bca' ? '8801 2940 1827 0049' : '8920 1829 4819 0021';
    navigator.clipboard?.writeText(vaNum.replace(/\s+/g, ''));
    setSalinStatus(true);
    setTimeout(() => setSalinStatus(false), 2000);
  };

  // Toggle pilihan kamar Trenggole (multi-select)
  const toggleTrenggoleRoom = (roomId: string) => {
    setTrenggoleSelectedRooms((prev) => {
      if (prev.includes(roomId)) {
        if (prev.length <= 1) return prev; // Minimal harus ada 1 kamar terpilih
        return prev.filter((id) => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });
    setErrorNotice('');
  };

  // VALIDASI KAPASITAS TAMU SECARA KETAT SESUAI INSTRUKSI USER:
  // 1. Sundak Sewa 2 kamar: maksimal 6 orang.
  // 2. Sundak Sewa 4 kamar: maksimal 12 orang sebelum extra bed (hingga kapasitas standar 21 orang).
  // 3. Trenggole: "Jumlah tamu melebihi kapasitas kamar. Silakan pilih kamar tambahan."
  const checkCapacityValidation = (): {
    isValid: boolean;
    message: string;
    type?: 'sundak_2_exceed' | 'sundak_4_need_extrabed' | 'sundak_4_exceed_max' | 'trenggole_exceed';
    neededExtraBeds?: number;
  } => {
    if (isSundak) {
      if (sundakPackageId === 'sundak-2-kamar') {
        if (totalGuests > 6) {
          return {
            isValid: false,
            type: 'sundak_2_exceed',
            message: `Jumlah tamu (${totalGuests} orang) melebihi kapasitas Sewa 2 kamar (maksimal 6 orang). Silakan pilih Sewa 4 kamar (Rumah Penuh) atau kurangi jumlah tamu.`,
          };
        }
      } else {
        // Sewa 4 kamar (Rumah Penuh)
        if (totalGuests > 21) {
          return {
            isValid: false,
            type: 'sundak_4_exceed_max',
            message: `Jumlah tamu (${totalGuests} orang) melebihi kapasitas standar homestay (maksimal 21 orang).`,
          };
        }
        if (totalGuests > 12 + extraBedsCount) {
          const needed = totalGuests - 12;
          return {
            isValid: false,
            type: 'sundak_4_need_extrabed',
            neededExtraBeds: needed,
            message: `Jumlah tamu (${totalGuests} orang) melebihi kapasitas Sewa 4 kamar sebelum extra bed (maksimal 12 orang). Silakan tambahkan minimal ${needed} extra bed (tersedia hingga 21 orang).`,
          };
        }
      }
    } else {
      // Trenggole:
      const maxCap = (trenggoleSelectedRooms.length * 4) + extraBedsCount;
      if (totalGuests > maxCap) {
        return {
          isValid: false,
          type: 'trenggole_exceed',
          message: 'Jumlah tamu melebihi kapasitas kamar. Silakan pilih kamar tambahan.',
        };
      }
    }

    return { isValid: true, message: '' };
  };

  // Validasi Step 3
  const handleValidateAndProceedStep3 = () => {
    if (!namaLengkap.trim()) {
      setErrorNotice('Nama lengkap pemesan wajib diisi.');
      return;
    }
    if (!asalKota.trim()) {
      setErrorNotice('Asal daerah/kota pemesan wajib diisi.');
      return;
    }
    if (!noHp.trim()) {
      setErrorNotice('Nomor WhatsApp/HP aktif wajib diisi.');
      return;
    }
    if (!checkInDate || !checkOutDate) {
      setErrorNotice('Tanggal check-in dan check-out wajib diisi.');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setErrorNotice('Tanggal check-out harus setelah tanggal check-in.');
      return;
    }
    if (!budgetPlan.trim()) {
      setErrorNotice('Rencana anggaran wajib diisi.');
      return;
    }
    if (totalGuests < 1) {
      setErrorNotice('Jumlah tamu minimal 1 orang.');
      return;
    }

    // VALIDASI KAPASITAS
    const capCheck = checkCapacityValidation();
    if (!capCheck.isValid) {
      setErrorNotice(capCheck.message);
      return;
    }

    if (!guestRelationship.trim()) {
      setErrorNotice('Hubungan antar tamu wajib dipilih untuk memastikan aturan mahrom homestay.');
      return;
    }
    if (!vehicleDetail.trim()) {
      setErrorNotice('Informasi kendaraan (mobil/motor dan jenisnya) wajib diisi.');
      return;
    }
    if (!referralSource.trim()) {
      setErrorNotice('Sumber informasi penginapan wajib dipilih.');
      return;
    }

    setErrorNotice('');
    setActiveStep(4);
  };

  const handleNextFromStep4 = () => {
    if (dpAmount < minDpRequired) {
      setErrorNotice(`DP minimal harus lebih dari 50% (minimal Rp ${minDpRequired.toLocaleString('id-ID')}).`);
      return;
    }
    if (!dpTermsAccepted) {
      setErrorNotice('Anda wajib menyetujui ketentuan: "DP akan hangus apabila pesanan dibatalkan."');
      return;
    }
    setErrorNotice('');
    setActiveStep(5);
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    try {
      const roomTypeFinalId = isSundak ? sundakPackageId : trenggoleSelectedRooms[0];
      const roomNameFinal = isSundak
        ? sundakPackageId === 'sundak-2-kamar'
          ? 'Sewa 2 Kamar (Homestay Sundak)'
          : 'Sewa 4 Kamar / Rumah Penuh (Homestay Sundak)'
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
        guestNik: nikKtp || '340301xxxxxxxxxx',
        ktpImageUrl: SAMPLE_KTP_SVG,
        checkInDate,
        checkOutDate,
        totalNights,
        guestsCount: totalGuests,
        roomsCount: isSundak ? (sundakPackageId === 'sundak-2-kamar' ? 2 : 4) : trenggoleSelectedRooms.length,
        extraBedsCount,
        extraBedsCost: extraBedTotal,
        baseRoomCost: baseCostTotal,
        totalAmount: grandTotal,
        asalKota,
        budgetPlan,
        adultMalesCount,
        adultFemalesCount,
        childrenCount,
        toddlerCount,
        guestRelationship,
        vehicleDetail,
        referralSource,
        dpAmount,
        dpPercentage,
        remainingBalance,
        paymentProofUrl: SAMPLE_PAYMENT_SVG,
        paymentMethod: metodePembayaran === 'qris' ? 'qris' : metodePembayaran === 'mandiri' ? 'mandiri_va' : 'bca_va',
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
  // TAMPILAN SUKSES: FAST PASS TIKET DIGITAL DP HOMESTAY
  // ==============================================================
  if (isSuccessView) {
    const bookingIdDisplay = activeBooking?.id || activeBookingId || 'GBR-2025-9812';

    return (
      <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-8">
        {/* Status Bar */}
        <div className="sticky top-0 z-30 bg-[#F6F7F9]/90 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-neutral-800 text-xs font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 opacity-90">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Header */}
        <header className="px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('home')}
            className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200/80 flex items-center justify-center text-neutral-700 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 text-neutral-800 stroke-[2.2]" />
          </button>
          <h1 className="text-[15px] font-bold text-neutral-900 tracking-tight">
            Konfirmasi Booking DP
          </h1>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Konfirmasi Griya Barokah',
                  text: `Reservasi di ${activeProp.name} berhasil! ID: ${bookingIdDisplay}`,
                }).catch(() => {});
              }
            }}
            className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200/80 flex items-center justify-center text-neutral-700 active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4 text-neutral-800 stroke-[2]" />
          </button>
        </header>

        {/* Content */}
        <div className="px-5 pt-2 pb-4 space-y-4 flex-grow">
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-[#EBF8F2] flex items-center justify-center mb-3">
              <Check className="w-8 h-8 text-[#1DB954] stroke-[3.5]" />
            </div>
            <h2 className="text-[21px] font-black text-[#111827] tracking-tight">
              Bukti DP Berhasil Dikirim
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-1 max-w-[320px] leading-relaxed">
              Pengelola <strong className="text-neutral-900">{activeProp.name}</strong> sedang memverifikasi pembayaran DP Anda.
            </p>
          </div>

          {/* Kartu Tiket Digital */}
          <div className="rounded-[30px] bg-white border border-neutral-200/90 shadow-sm overflow-hidden text-left relative">
            <div className="p-4 flex items-center gap-3.5 border-b border-neutral-100">
              <SafeImage
                src={activeProp.image}
                alt={activeProp.name}
                className="w-14 h-14 rounded-2xl object-cover"
                containerClassName="w-14 h-14 rounded-2xl shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {bookingIdDisplay}
                </span>
                <h3 className="text-[15px] font-black text-[#111827] truncate mt-1">
                  {activeProp.name}
                </h3>
                <span className="text-[12px] text-neutral-500 block truncate">
                  {bookingChoiceDisplayName}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3 bg-[#FAFBFD] text-xs">
              <div className="grid grid-cols-2 gap-2 text-neutral-600">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Nama Pemesan</span>
                  <strong className="text-neutral-900">{namaLengkap} ({asalKota})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Tanggal Menginap</span>
                  <strong className="text-neutral-900">{checkInDate} s/d {checkOutDate} ({totalNights} Malam)</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Total Tamu</span>
                  <strong className="text-neutral-900">{totalGuests} Orang ({guestRelationship})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">Kendaraan</span>
                  <strong className="text-neutral-900 truncate block">{vehicleDetail}</strong>
                </div>
              </div>

              {/* Rincian DP */}
              <div className="pt-2 border-t border-neutral-200/80 space-y-1">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Total Tagihan Sewa</span>
                  <span className="font-bold text-neutral-900">Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-800 font-bold">
                  <span>DP Dibayar ({dpPercentage}%)</span>
                  <span>Rp {dpAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Sisa Pelunasan Saat Check-in</span>
                  <span>Rp {remainingBalance.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="p-5 bg-white flex flex-col items-center justify-center border-t border-dashed border-neutral-200">
              <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `GBR:BOOKING:${bookingIdDisplay}|HOMESTAY:${activeProp.name}|GUEST:${namaLengkap}|DP:Rp${dpAmount}`
                  )}`}
                  alt="QR Fast Pass"
                  className="w-36 h-36 object-contain"
                />
              </div>
              <span className="text-[11px] font-bold text-neutral-500 mt-2 text-center">
                Tunjukkan QR Code ini kepada pengelola saat tiba di homestay
              </span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 space-y-2.5">
            <a
              href={`https://wa.me/6282138613888?text=Halo%20Pengelola%20Griya%20Barokah,%20saya%20sudah%20membayar%20DP%20untuk%20Booking%20ID%20${bookingIdDisplay}%20atas%20nama%20${encodeURIComponent(namaLengkap)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full h-[50px] rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Konfirmasi via WhatsApp Pengelola</span>
            </a>

            <button
              onClick={() => setCurrentView('home')}
              className="w-full h-[52px] rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <span>Kembali ke Beranda</span>
              <ArrowRight className="w-4 h-4 text-white" />
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
            {activeStep === 1 && 'Step 1: Pilih Penginapan'}
            {activeStep === 2 && (isSundak ? 'Step 2: Paket Homestay Sundak' : 'Step 2: Pilih Kamar Trenggole')}
            {activeStep === 3 && 'Step 3: Data Pemesan & Tamu'}
            {activeStep === 4 && 'Step 4: Ringkasan Booking & DP'}
            {activeStep === 5 && 'Step 5: Pembayaran DP'}
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

      {/* Konten Langkah demi Langkah */}
      <div className="px-5 pt-3 pb-6 flex-grow">
        {/* ==============================================================
            STEP 1: PILIH PROPERTI (SUNDAK VS TRENGGOLE)
           ============================================================== */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500 block">
                Langkah 1 dari 5
              </span>
              <h2 className="text-lg font-black text-neutral-900">
                Pilih Tipe & Lokasi Penginapan
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Kedua penginapan memiliki tipe dan struktur pemesanan yang berbeda:
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Properti 1: Griya Barokah Pantai Sundak (Full Homestay / Rumah) */}
              <div
                onClick={() => {
                  setSelectedPropId('homestay-sundak');
                  setSelectedProperty(accommodations[0]);
                  setErrorNotice('');
                }}
                className={`p-4 rounded-[26px] border transition-all cursor-pointer bg-white ${
                  selectedPropId === 'homestay-sundak'
                    ? 'border-emerald-800 shadow-md ring-2 ring-emerald-800/20'
                    : 'border-neutral-200/90 shadow-xs hover:border-neutral-300'
                }`}
              >
                <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3">
                  <SafeImage
                    src={accommodations[0]?.image || 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80'}
                    alt="Griya Barokah Pantai Sundak"
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                      TIPE: FULL HOMESTAY / RUMAH
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    {selectedPropId === 'homestay-sundak' && (
                      <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shadow-md">
                        ✓
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                    <Home className="w-3.5 h-3.5" />
                    <span>Bukan Kamar Terpisah (Sewa Rumah Keluarga)</span>
                  </div>
                  <h3 className="font-black text-base text-neutral-900">
                    Griya Barokah Pantai Sundak
                  </h3>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Sewa rumah inap untuk keluarga besar & rombongan. Memiliki 4 kamar AC, 3 KM, ruang keluarga luas, dapur lengkap, dan mesin cuci.
                  </p>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800">• Sewa 2 Kamar (Maks. 6 Orang)</span>
                    <strong className="text-emerald-800">Rp500.000/malam</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800">• Sewa 4 Kamar Rumah Penuh (Maks. 12 Orang)</span>
                    <strong className="text-emerald-800">Rp800.000/malam</strong>
                  </div>
                </div>
              </div>

              {/* Properti 2: Griya Barokah Pantai Trenggole (Individual Room) */}
              <div
                onClick={() => {
                  setSelectedPropId('homestay-trenggole');
                  setSelectedProperty(accommodations[1] || accommodations[0]);
                  setErrorNotice('');
                }}
                className={`p-4 rounded-[26px] border transition-all cursor-pointer bg-white ${
                  selectedPropId === 'homestay-trenggole'
                    ? 'border-emerald-800 shadow-md ring-2 ring-emerald-800/20'
                    : 'border-neutral-200/90 shadow-xs hover:border-neutral-300'
                }`}
              >
                <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3">
                  <SafeImage
                    src={accommodations[1]?.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'}
                    alt="Griya Barokah Pantai Trenggole"
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-3 py-1 rounded-full bg-sky-700 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                      TIPE: INDIVIDUAL ROOM
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    {selectedPropId === 'homestay-trenggole' && (
                      <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shadow-md">
                        ✓
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-sky-800 font-bold">
                    <Building className="w-3.5 h-3.5" />
                    <span>Kamar Terpisah (Pilihan 4 Kamar Tepi Pantai)</span>
                  </div>
                  <h3 className="font-black text-base text-neutral-900">
                    Griya Barokah Pantai Trenggole
                  </h3>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Setiap kamar memiliki view pantai dan 2 bed ukuran ±130x200 cm (kapasitas 4 orang). Pilihan kloset jongkok & duduk serta dapur mini.
                  </p>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] space-y-0.5">
                  <span className="text-neutral-500 block font-semibold">Tersedia Kamar 1, 2, 3, dan 4:</span>
                  <span className="font-bold text-emerald-800 block">
                    Mulai Rp285.000 s/d Rp365.000 /kamar/malam
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            STEP 2: PILIH KAMAR SESUAI TIPE PROPERTI
           ============================================================== */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500 block">
                Langkah 2 dari 5
              </span>
              <h2 className="text-lg font-black text-neutral-900">
                {isSundak ? 'Pilihan Paket Sewa Rumah Sundak' : 'Pilih Kamar Pantai Trenggole'}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isSundak
                  ? 'Griya Barokah Pantai Sundak adalah satu rumah utuh. Pilih sewa 2 kamar atau 4 kamar penuh.'
                  : 'Pilih kamar tidur ber-AC sesuai jumlah anggota keluarga (kapasitas 4 orang per kamar).'}
              </p>
            </div>

            {/* JIKA SUNDAK: PILIHAN SEWA 2 KAMAR ATAU SEWA 4 KAMAR (RUMAH PENUH) */}
            {isSundak ? (
              <div className="space-y-3.5">
                {/* Opsi 1: Sewa 2 Kamar */}
                <div
                  onClick={() => {
                    setSundakPackageId('sundak-2-kamar');
                    setErrorNotice('');
                  }}
                  className={`p-4.5 rounded-[26px] border transition-all cursor-pointer bg-white ${
                    sundakPackageId === 'sundak-2-kamar'
                      ? 'border-emerald-800 shadow-md ring-2 ring-emerald-800/20'
                      : 'border-neutral-200/90 shadow-xs hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                          PAKET A
                        </span>
                        <h3 className="font-black text-base text-neutral-900">
                          Sewa 2 Kamar
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-neutral-700 block mt-1">
                        Rp250.000 /kamar/malam
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-800 block">
                        Rp500.000
                      </span>
                      <span className="text-[10px] text-neutral-400">/malam (2 kamar)</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-2xl bg-[#F8F9FA] border border-neutral-200/70 space-y-1.5 text-xs text-neutral-700">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Kapasitas Standar: 3 orang per kamar</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Validasi: Maksimal 6 orang tamu (sebelum extra bed)</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 pt-0.5">
                      Fasilitas: 2 Kamar AC di dalam rumah, akses ruang keluarga luas, kulkas, TV, dapur lengkap, alat masak/makan, mesin cuci, dan teras santai.
                    </p>
                  </div>
                </div>

                {/* Opsi 2: Sewa 4 Kamar (Rumah Penuh) */}
                <div
                  onClick={() => {
                    setSundakPackageId('sundak-4-kamar');
                    setErrorNotice('');
                  }}
                  className={`p-4.5 rounded-[26px] border transition-all cursor-pointer bg-white ${
                    sundakPackageId === 'sundak-4-kamar'
                      ? 'border-emerald-800 shadow-md ring-2 ring-emerald-800/20'
                      : 'border-neutral-200/90 shadow-xs hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                          PAKET B (FAVORIT)
                        </span>
                        <h3 className="font-black text-base text-neutral-900">
                          Sewa 4 kamar (Rumah Penuh)
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-neutral-700 block mt-1">
                        Sewa seluruh rumah inap keluarga
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-800 block">
                        Rp800.000
                      </span>
                      <span className="text-[10px] text-neutral-400">/malam (Rumah Penuh)</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-2xl bg-[#F8F9FA] border border-neutral-200/70 space-y-1.5 text-xs text-neutral-700">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Kapasitas Standar: 21 orang</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Validasi: Maksimal 12 orang sebelum extra bed</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 pt-0.5">
                      Tambahan: Extra bed Rp25.000/orang (hingga total 21 orang). Fasilitas: 4 kamar AC, 3 KM, ruang keluarga luas, kulkas, TV, dapur lengkap, mesin cuci, dan WiFi gratis.
                    </p>
                  </div>
                </div>

                {/* Extra Bed Sundak */}
                {sundakPackageId === 'sundak-4-kamar' ? (
                  <div className="p-4 rounded-[26px] bg-white border border-neutral-200/90 shadow-xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-neutral-900 block">Tambah Extra Bed Ruang Keluarga</span>
                        <span className="text-[11px] text-neutral-500">
                          Tarif: <strong>Rp25.000 /orang /malam</strong> (tersedia hingga 21 orang)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => extraBedsCount > 0 && setExtraBedsCount(extraBedsCount - 1)}
                          disabled={extraBedsCount <= 0}
                          className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold disabled:opacity-40"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black text-sm w-5 text-center">{extraBedsCount}</span>
                        <button
                          type="button"
                          onClick={() => extraBedsCount < 9 && setExtraBedsCount(extraBedsCount + 1)}
                          disabled={extraBedsCount >= 9}
                          className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium">
                    ℹ️ <strong>Ketentuan Sewa 2 kamar:</strong> Maksimal 6 orang tamu. Jika rombongan Anda melebihi 6 orang, silakan pilih <strong>Sewa 4 kamar (Rumah Penuh)</strong>.
                  </div>
                )}
              </div>
            ) : (
              /* JIKA TRENGGOLE: INDIVIDUAL ROOM (4 PILIHAN KAMAR) */
              <div className="space-y-3.5">
                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-950 font-medium space-y-1">
                  <div>
                    💡 <strong>Semua kamar Trenggole:</strong> View pantai, 2 bed ukuran ±130x200 cm (kapasitas standar 4 orang per kamar), dan bisa tambah extra bed.
                  </div>
                  <div className="text-[11px] text-sky-800">
                    Jumlah tamu harus mengikuti kapasitas kamar yang dipilih. Anda dapat memilih lebih dari 1 kamar jika rombongan lebih besar.
                  </div>
                </div>

                {/* 4 Pilihan Kamar Trenggole */}
                <div className="space-y-2.5">
                  {activeProp.roomTypes.map((room) => {
                    const isChecked = trenggoleSelectedRooms.includes(room.id);

                    return (
                      <div
                        key={room.id}
                        onClick={() => toggleTrenggoleRoom(room.id)}
                        className={`p-4 rounded-[26px] border transition-all cursor-pointer bg-white ${
                          isChecked
                            ? 'border-emerald-800 shadow-md ring-2 ring-emerald-800/20'
                            : 'border-neutral-200/90 shadow-xs hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // dikontrol parent div onClick
                              className="w-4 h-4 rounded text-emerald-800 pointer-events-none"
                            />
                            <div>
                              <h3 className="font-black text-sm text-neutral-900">
                                {room.name}
                              </h3>
                              <span className="text-[11px] text-neutral-500 block">
                                View pantai • 2 bed ukuran ±130x200 • Kapasitas standar 4 orang
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-emerald-800 block">
                              Rp {room.pricePerNight.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-neutral-400">/malam</span>
                          </div>
                        </div>

                        {/* Fitur Kamar */}
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {room.features.map((feat, fi) => (
                            <span
                              key={fi}
                              className="px-2 py-0.5 rounded-md bg-[#F4F5F7] text-[10px] font-medium text-neutral-700"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ringkasan Kamar Terpilih Trenggole */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-950 block">
                      Total Kamar Dipilih: {trenggoleSelectedRooms.length} Kamar
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Kapasitas Standar: {trenggoleSelectedRooms.length * 4} orang ({trenggoleSelectedRooms.length * 2} bed)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-900 block text-xs">
                      Rp {baseRoomCostPerNight.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-emerald-700">/malam</span>
                  </div>
                </div>

                {/* Tambahan Extra Bed Trenggole */}
                <div className="p-4 rounded-[26px] bg-white border border-neutral-200/90 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-900 block">Tambah Extra Bed</span>
                      <span className="text-[11px] text-neutral-500">
                        Tarif: <strong>Rp25.000 /orang /malam</strong> (menambah kapasitas)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => extraBedsCount > 0 && setExtraBedsCount(extraBedsCount - 1)}
                        disabled={extraBedsCount <= 0}
                        className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-sm w-5 text-center">{extraBedsCount}</span>
                      <button
                        type="button"
                        onClick={() => setExtraBedsCount(extraBedsCount + 1)}
                        className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            STEP 3: ISI DATA PEMESAN WAJIB (DENGAN VALIDASI KAPASITAS KETAT)
           ============================================================== */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500 block">
                Langkah 3 dari 5
              </span>
              <h2 className="text-lg font-black text-neutral-900">
                Data Pemesan & Jumlah Tamu
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Kapasitas pilihan Anda saat ini: <strong>Maksimal {totalMaxCapacityWithExtraBeds} Orang</strong>
              </p>
            </div>

            <div className="bg-white rounded-[28px] p-5 shadow-xs border border-neutral-200/90 space-y-4 text-xs">
              {/* Nama & Asal */}
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  1. Nama Lengkap Pemesan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Nama sesuai KTP"
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  2. Asal Daerah / Kota Pemesan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={asalKota}
                  onChange={(e) => setAsalKota(e.target.value)}
                  placeholder="Contoh: Solo, Jawa Tengah / Sleman, DIY"
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="081234567890"
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                />
              </div>

              {/* Tanggal Menginap */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">
                    3. Tanggal Check-in <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">
                    4. Tanggal Check-out <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>
              <span className="text-[11px] text-emerald-800 font-bold block">
                Total Menginap: {totalNights} Malam
              </span>

              {/* Rencana Anggaran */}
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  5. Rencana Anggaran Tamu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={budgetPlan}
                  onChange={(e) => setBudgetPlan(e.target.value)}
                  placeholder="Contoh: Rp 1.500.000 atau Rp 2.500.000"
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                />
              </div>

              {/* JUMLAH TAMU DENGAN INDIKATOR VALIDASI KAPASITAS */}
              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-neutral-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-neutral-900 block text-xs">
                    6. Rincian Jumlah Tamu Keluarga <span className="text-rose-500">*</span>
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    !checkCapacityValidation().isValid
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {isSundak
                      ? sundakPackageId === 'sundak-2-kamar'
                        ? `Total: ${totalGuests} / Maks. 6 Orang`
                        : `Total: ${totalGuests} / Maks. ${12 + extraBedsCount} Orang (Kapasitas s/d 21)`
                      : `Total: ${totalGuests} / Kapasitas: ${(trenggoleSelectedRooms.length * 4) + extraBedsCount} Orang`}
                  </span>
                </div>

                {/* Peringatan jika melebihi kapasitas */}
                {!checkCapacityValidation().isValid && (
                  <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-bold leading-relaxed">
                        {checkCapacityValidation().message}
                      </span>
                    </div>

                    {/* Tombol Penyelesaian Cepat */}
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {checkCapacityValidation().type === 'trenggole_exceed' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveStep(2)}
                            className="px-3 py-1.5 rounded-full bg-rose-800 text-white text-[11px] font-bold active:scale-95 shadow-xs cursor-pointer"
                          >
                            + Pilih Kamar Tambahan
                          </button>
                          {activeProp.roomTypes
                            .filter((r) => !trenggoleSelectedRooms.includes(r.id))
                            .map((unselectedRoom) => (
                              <button
                                key={unselectedRoom.id}
                                type="button"
                                onClick={() => toggleTrenggoleRoom(unselectedRoom.id)}
                                className="px-2.5 py-1 rounded-full bg-white border border-rose-300 text-rose-900 text-[10px] font-bold hover:bg-rose-100 active:scale-95 cursor-pointer shadow-2xs"
                              >
                                + {unselectedRoom.name}
                              </button>
                            ))}
                          <button
                            type="button"
                            onClick={() => {
                              setExtraBedsCount(extraBedsCount + 1);
                              setErrorNotice('');
                            }}
                            className="px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-bold hover:bg-emerald-800 active:scale-95 cursor-pointer shadow-2xs"
                          >
                            + Tambah Extra Bed
                          </button>
                        </>
                      )}

                      {checkCapacityValidation().type === 'sundak_2_exceed' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSundakPackageId('sundak-4-kamar');
                            setErrorNotice('');
                          }}
                          className="px-3 py-1.5 rounded-full bg-emerald-800 text-white text-[11px] font-bold active:scale-95 shadow-xs cursor-pointer"
                        >
                          Pindah ke Sewa 4 kamar (Rumah Penuh)
                        </button>
                      )}

                      {checkCapacityValidation().type === 'sundak_4_need_extrabed' && (
                        <button
                          type="button"
                          onClick={() => {
                            const needed = checkCapacityValidation().neededExtraBeds || Math.max(1, totalGuests - 12);
                            setExtraBedsCount(Math.min(9, needed));
                            setErrorNotice('');
                          }}
                          className="px-3 py-1.5 rounded-full bg-emerald-800 text-white text-[11px] font-bold active:scale-95 shadow-xs cursor-pointer"
                        >
                          + Tambah {checkCapacityValidation().neededExtraBeds || (totalGuests - 12)} Extra Bed Otomatis
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {/* Pria Dewasa */}
                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-800 block">Pria Dewasa</span>
                      <span className="text-[10px] text-neutral-400">&gt; 11 tahun</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adultMalesCount > 0 && setAdultMalesCount(adultMalesCount - 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">{adultMalesCount}</span>
                      <button
                        type="button"
                        onClick={() => setAdultMalesCount(adultMalesCount + 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Wanita Dewasa */}
                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-800 block">Wanita Dewasa</span>
                      <span className="text-[10px] text-neutral-400">&gt; 11 tahun</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adultFemalesCount > 0 && setAdultFemalesCount(adultFemalesCount - 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">{adultFemalesCount}</span>
                      <button
                        type="button"
                        onClick={() => setAdultFemalesCount(adultFemalesCount + 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Anak 3-11 Tahun */}
                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-800 block">Anak-anak</span>
                      <span className="text-[10px] text-neutral-400">Usia 3 - 11 tahun</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => childrenCount > 0 && setChildrenCount(childrenCount - 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">{childrenCount}</span>
                      <button
                        type="button"
                        onClick={() => setChildrenCount(childrenCount + 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Balita < 3 Tahun */}
                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-800 block">Balita</span>
                      <span className="text-[10px] text-neutral-400">Usia &lt; 3 tahun</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toddlerCount > 0 && setToddlerCount(toddlerCount - 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">{toddlerCount}</span>
                      <button
                        type="button"
                        onClick={() => setToddlerCount(toddlerCount + 1)}
                        className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hubungan Mahrom */}
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  7. Hubungan Antar Tamu (Memastikan Aturan Mahrom) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={guestRelationship}
                  onChange={(e) => setGuestRelationship(e.target.value)}
                  className="w-full h-11 px-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                >
                  <option value="Keluarga Inti (Suami, Istri & Anak-anak)">
                    Keluarga Inti (Suami, Istri &amp; Anak-anak)
                  </option>
                  <option value="Keluarga Besar (Orang Tua, Anak & Saudara Kandung / Mahrom)">
                    Keluarga Besar (Orang Tua, Anak &amp; Saudara Kandung / Mahrom)
                  </option>
                  <option value="Rombongan Pasutri Resmi & Keluarga">
                    Rombongan Pasutri Resmi &amp; Keluarga
                  </option>
                  <option value="Rombongan Komunitas / Teman (Kamar Terpisah Ikhwan & Akhwat)">
                    Rombongan Komunitas / Teman (Kamar Terpisah Ikhwan &amp; Akhwat)
                  </option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Pilihan Kamar Konfirmasi */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-950 block">8. Pilihan Kamar / Homestay:</span>
                <span className="text-neutral-800 font-semibold block mt-0.5">
                  {activeProp.name} • {bookingChoiceDisplayName}
                </span>
              </div>

              {/* Kendaraan */}
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  9. Kendaraan (Mobil/Motor dan Jenis Kendaraan) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleDetail}
                  onChange={(e) => setVehicleDetail(e.target.value)}
                  placeholder="Contoh: Mobil Toyota Avanza (1 Unit) atau 2 Motor Beat"
                  className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                />
              </div>

              {/* Sumber Info */}
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  10. Dapat Info Griya Barokah Pantai Sundak/Trenggole dari... <span className="text-rose-500">*</span>
                </label>
                <select
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="w-full h-11 px-3 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none"
                >
                  <option value="Google Search / Google Maps">Google Search / Google Maps</option>
                  <option value="Rekomendasi Teman / Keluarga">Rekomendasi Teman / Keluarga</option>
                  <option value="Media Sosial (Instagram / TikTok / Facebook)">
                    Media Sosial (Instagram / TikTok / Facebook)
                  </option>
                  <option value="WhatsApp Group Komunitas">WhatsApp Group Komunitas</option>
                  <option value="Spanduk / Brosur di Lokasi">Spanduk / Brosur di Lokasi</option>
                  <option value="Pernah Menginap Sebelumnya">Pernah Menginap Sebelumnya</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            STEP 4: RINGKASAN BOOKING & PERINGATAN DP HANGUS
           ============================================================== */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500 block">
                Langkah 4 dari 5
              </span>
              <h2 className="text-lg font-black text-neutral-900">
                Ringkasan Booking & Down Payment (DP)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Periksa detail biaya dan tentukan nominal DP (minimal &gt; 50%)
              </p>
            </div>

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
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Tanggal Menginap</span>
                  <strong className="text-neutral-900">{checkInDate} s/d {checkOutDate}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Total Tamu</span>
                  <strong className="text-neutral-900">{totalGuests} Orang</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Kendaraan</span>
                  <strong className="text-neutral-900 truncate block">{vehicleDetail}</strong>
                </div>
              </div>

              {/* Rincian Tarif Otomatis */}
              <div className="pt-3 border-t border-neutral-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">
                    Sewa ({bookingChoiceDisplayName} × {totalNights} Malam)
                  </span>
                  <span className="font-bold text-neutral-900">Rp {baseCostTotal.toLocaleString('id-ID')}</span>
                </div>

                {extraBedsCount > 0 && (
                  <div className="flex items-center justify-between text-emerald-800">
                    <span>Extra Bed ({extraBedsCount} Bed × {totalNights} Malam)</span>
                    <span className="font-bold">+Rp {extraBedTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-200/80 flex items-baseline justify-between text-sm">
                  <strong className="text-neutral-900">Total Biaya Menginap</strong>
                  <strong className="text-emerald-800 font-black text-base">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>
            </div>

            {/* PENGATURAN DP MINIMAL LEBIH DARI 50% */}
            <div className="bg-white rounded-[28px] p-5 shadow-xs border border-emerald-300 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>Kalkulasi Down Payment (DP)</span>
                </span>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Minimal &gt; 50%
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[55, 60, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDpPercentage(pct)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      dpPercentage === pct
                        ? 'border-emerald-800 bg-emerald-800 text-white shadow-xs'
                        : 'border-neutral-200 bg-[#F9FAFB] text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{pct === 100 ? 'Lunas 100%' : `${pct}%`}</span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-700">Nominal DP Dibayar Sekarang:</span>
                  <span className="text-base font-black text-emerald-900">
                    Rp {dpAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-600">
                  <span>Sisa Pelunasan Saat Tiba:</span>
                  <span className="font-bold text-neutral-900">
                    Rp {remainingBalance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* PERINGATAN WAJIB DP AKAN HANGUS */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2">
                <div className="flex items-start gap-2 text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-xs font-black">
                      Peringatan Penting Pembatalan:
                    </strong>
                    <span className="text-xs font-extrabold text-rose-700 block mt-0.5">
                      &quot;DP akan hangus apabila pesanan dibatalkan.&quot;
                    </span>
                  </div>
                </div>

                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dpTermsAccepted}
                    onChange={(e) => setDpTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-[11px] font-semibold text-rose-900 leading-snug">
                    Saya telah membaca, memahami, dan menyetujui bahwa uang muka (DP) yang telah dibayarkan akan hangus jika pesanan dibatalkan.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            STEP 5: PEMBAYARAN DP (TRANSFER & BUKTI BAYAR)
           ============================================================== */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-500 block">
                Langkah 5 dari 5
              </span>
              <h2 className="text-lg font-black text-neutral-900">
                Pembayaran DP ({dpPercentage}%)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Transfer nominal DP untuk mengonfirmasi pesanan keluarga Anda
              </p>
            </div>

            <div className="p-4 rounded-[26px] bg-white border border-emerald-200 shadow-xs space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                Total Tagihan DP Homestay
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
                  <span className="text-[10px] text-neutral-400">DP {dpPercentage}%</span>
                </div>
              </div>
            </div>

            <div className="p-4.5 rounded-[26px] bg-white border border-neutral-200/90 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-1">
                <span className="font-extrabold text-neutral-900">
                  Pilih Saluran Transfer DP
                </span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Batas: 2 Jam
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMetodePembayaran('bca')}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
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
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
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
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
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
                      Nomor Virtual Account
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

              {/* Upload Bukti Pembayaran DP */}
              <div>
                <label className="block text-[12px] font-bold text-neutral-800 mb-1.5">
                  Upload Bukti Transfer DP <span className="text-rose-500">*</span>
                </label>
                <div className="p-3 rounded-2xl border border-dashed border-neutral-300 bg-[#FAFBFD] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 shadow-xs">
                      <CreditCard className="w-5 h-5 text-neutral-700" />
                    </div>
                    <div>
                      <span className="text-[12px] font-bold text-neutral-900 block">
                        Struk / Resi Transfer DP
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        JPG / PNG bukti transfer DP
                      </span>
                    </div>
                  </div>

                  <label className="w-9 h-9 rounded-full bg-[#EBF8F2] flex items-center justify-center text-[#1DB954] cursor-pointer hover:bg-[#d8f3e5] transition-colors">
                    <input type="file" accept="image/*" className="hidden" />
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Wizard Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-6 py-3.5 max-w-md mx-auto flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
            {activeStep === 5 ? `DP Dibayar (${dpPercentage}%)` : 'Estimasi Tarif'}
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
            <span>Pilih Kamar</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}

        {activeStep === 2 && (
          <button
            type="button"
            onClick={() => setActiveStep(3)}
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
            className={`h-12 px-5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
              !checkCapacityValidation().isValid
                ? 'bg-rose-700 hover:bg-rose-800 text-white cursor-pointer active:scale-95'
                : 'bg-[#13281E] hover:bg-[#1A3428] text-white active:scale-[0.98] cursor-pointer'
            }`}
          >
            <span>
              {!checkCapacityValidation().isValid ? 'Kapasitas Melebihi' : 'Ringkasan Booking'}
            </span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}

        {activeStep === 4 && (
          <button
            type="button"
            onClick={handleNextFromStep4}
            className="h-12 px-5 rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>Lanjut Bayar DP</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}

        {activeStep === 5 && (
          <button
            type="button"
            onClick={handleSubmitBooking}
            disabled={isSubmitting}
            className="h-12 px-5 rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Mengirim...' : 'Konfirmasi DP'}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};
