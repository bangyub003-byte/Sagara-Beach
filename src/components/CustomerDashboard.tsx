import React, { useState, useMemo } from 'react';
import { useBooking } from '../context/BookingContext';
import { SafeImage } from './common/SafeImage';
import { PhotoSlider } from './common/PhotoSlider';
import { CustomerBottomNav } from './common/CustomerBottomNav';
import {
  MapPin,
  Users,
  ArrowRight,
  UtensilsCrossed,
  Compass,
  MessageCircle,
  Home,
  CheckCircle2,
  Wind,
  Wifi,
  Flame,
  Refrigerator,
  Tv,
  Bed,
  Bath,
  Building,
  ShieldCheck,
  Calendar,
  ChevronDown,
  Car,
  Star,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const {
    accommodations,
    setSelectedProperty,
    setSelectedRoomType,
    setCurrentView,
    language,
    t,
    homepageContent,
    adminWhatsappNumber,
    getWebsiteSetting,
    cmsHomestays,
    cmsRooms,
    cmsMedia,
    facilityImage,
    setPreselectedGuestCount,
    setIsLocationPreselected,
  } = useBooking();

  // State Pilihan Singkat di Beranda (Lokasi & Jumlah Tamu saja - TANPA TANGGAL)
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'homestay-sundak' | 'homestay-trenggole'>('all');
  const [guestCountEstimate, setGuestCountEstimate] = useState<number>(4);
  const [showAllFacilities, setShowAllFacilities] = useState<boolean>(false);

  // Ambil nomor WhatsApp Admin secara terpadu dari pengaturan website (konsisten dengan BookingFlow & Admin -> Pengaturan)
  const rawAdminPhone =
    getWebsiteSetting?.('admin_whatsapp', adminWhatsappNumber || '082138613888') ||
    adminWhatsappNumber ||
    '082138613888';
  let formattedAdminWa = rawAdminPhone.replace(/\D/g, '');
  if (formattedAdminWa.startsWith('0')) {
    formattedAdminWa = '62' + formattedAdminWa.substring(1);
  } else if (!formattedAdminWa.startsWith('62')) {
    formattedAdminWa = '62' + formattedAdminWa;
  }

  // Nomor WhatsApp Khusus untuk Bagian Layanan Tambahan (Pesanan Makanan, Sewa Jeep, Info Jual Beli Tanah)
  const rawLayananWa =
    getWebsiteSetting?.('layanan_tambahan_whatsapp') ||
    rawAdminPhone;
  let formattedLayananWa = rawLayananWa.replace(/\D/g, '');
  if (formattedLayananWa.startsWith('0')) {
    formattedLayananWa = '62' + formattedLayananWa.substring(1);
  } else if (!formattedLayananWa.startsWith('62')) {
    formattedLayananWa = '62' + formattedLayananWa;
  }

  // Ambil data langsung dari CMS Database sebagai sumber utama
  const sundakCms = cmsHomestays?.find((h) => h.id === 'homestay-sundak') || cmsHomestays?.[0];
  const trenggoleCms = cmsHomestays?.find((h) => h.id === 'homestay-trenggole') || cmsHomestays?.[1];

  const sundakProp = accommodations.find((a) => a.id === 'homestay-sundak') || accommodations[0];
  const trenggoleProp = accommodations.find((a) => a.id === 'homestay-trenggole') || accommodations[1];

  // Sumber gambar pasti dari CMS database (Tersinkronisasi Terpadu melalui website_settings)
  const heroImageSrc =
    getWebsiteSetting?.('homepage_hero_image') ||
    homepageContent?.hero_image ||
    '/images/sundak_fullhouse_1790552054893.jpg';
  const sundakImageSrc = sundakCms?.foto_utama || sundakProp?.image || '/images/sundak_fullhouse_1790552054893.jpg';
  const trenggoleImageSrc = trenggoleCms?.foto_utama || trenggoleProp?.image || '/images/trenggole_house_1790552065368.jpg';
  const facilityImageSrc =
    getWebsiteSetting?.('facility_image') ||
    facilityImage ||
    cmsMedia?.find((m) => m.kategori === 'fasilitas')?.url ||
    sundakCms?.galeri?.[1] ||
    '/images/living_room_1790552074900.jpg';

  // Daftar fasilitas dinamis dari CMS (Admin -> Pengaturan / Homepage)
  const facilitiesRaw = getWebsiteSetting?.(
    'general_facilities',
    'Semua Kamar Ber-AC, KM Duduk & Jongkok, Dapur Lengkap & Gas, Kulkas & TV Keluarga, Tersedia 13 Extra Bed, Free WiFi Cepat'
  );

  const facilitiesList = useMemo(() => {
    if (!facilitiesRaw) return [];
    return facilitiesRaw
      .split(/,|\n/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
  }, [facilitiesRaw]);

  // Helper pencocokan ikon fasilitas secara cerdas
  const getFacilityIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('ac') || lower.includes('dingin') || lower.includes('angin')) {
      return <Wind className="w-3.5 h-3.5 text-sky-600 shrink-0" />;
    }
    if (lower.includes('km') || lower.includes('mandi') || lower.includes('toilet') || lower.includes('bath')) {
      return <Bath className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    }
    if (lower.includes('dapur') || lower.includes('gas') || lower.includes('masak') || lower.includes('bbq')) {
      return <Flame className="w-3.5 h-3.5 text-orange-600 shrink-0" />;
    }
    if (lower.includes('kulkas') || lower.includes('lemari es') || lower.includes('dispenser')) {
      return <Refrigerator className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    }
    if (lower.includes('tv') || lower.includes('televisi')) {
      return <Tv className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
    }
    if (lower.includes('bed') || lower.includes('kasur') || lower.includes('tidur')) {
      return <Bed className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
    }
    if (lower.includes('wifi') || lower.includes('internet') || lower.includes('hotspot')) {
      return <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    }
    if (lower.includes('parkir') || lower.includes('mobil') || lower.includes('motor')) {
      return <Car className="w-3.5 h-3.5 text-neutral-600 shrink-0" />;
    }
    return null;
  };

  const displayedFacilities = showAllFacilities ? facilitiesList : facilitiesList.slice(0, 4);

  // 4 Kamar Trenggole dari CMS
  const room1 = cmsRooms?.find((r) => r.id === 'trenggole-kamar-1');
  const room2 = cmsRooms?.find((r) => r.id === 'trenggole-kamar-2');
  const room3 = cmsRooms?.find((r) => r.id === 'trenggole-kamar-3');
  const room4 = cmsRooms?.find((r) => r.id === 'trenggole-kamar-4');

  const handleCariHomestay = () => {
    // Simpan jumlah tamu yang dipilih untuk dibawa ke alur booking
    setPreselectedGuestCount(guestCountEstimate);

    // Jika jumlah tamu < 6 orang, otomatis mengarah ke Pantai Trenggole (karena Sundak min. 6 orang)
    if (guestCountEstimate < 6) {
      setSelectedLocation('homestay-trenggole');
      setSelectedProperty(trenggoleProp);
      setIsLocationPreselected(true);
    } else {
      if (selectedLocation === 'homestay-sundak') {
        setSelectedProperty(sundakProp);
        setIsLocationPreselected(true);
      } else if (selectedLocation === 'homestay-trenggole') {
        setSelectedProperty(trenggoleProp);
        setIsLocationPreselected(true);
      } else {
        setIsLocationPreselected(false);
      }
    }

    // Scroll mulus ke daftar pilihan penginapan di beranda
    const el = document.getElementById('pilihan-penginapan');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePesanSekarang = (propertyId?: string) => {
    // Simpan jumlah tamu yang dipilih untuk dibawa ke alur booking
    setPreselectedGuestCount(guestCountEstimate);

    let targetPropId = propertyId;

    if (!targetPropId) {
      // Dipicu dari tombol umum "Pesan Sekarang" di form rencana kunjungan:
      if (guestCountEstimate < 6) {
        // Otomatis ke Pantai Trenggole (Sundak minimal 6 orang)
        targetPropId = 'homestay-trenggole';
        setIsLocationPreselected(true);
      } else if (selectedLocation === 'homestay-sundak') {
        targetPropId = 'homestay-sundak';
        setIsLocationPreselected(true);
      } else if (selectedLocation === 'homestay-trenggole') {
        targetPropId = 'homestay-trenggole';
        setIsLocationPreselected(true);
      } else {
        targetPropId = 'homestay-sundak';
        setIsLocationPreselected(false);
      }
    } else {
      // Dipicu dari tombol spesifik di kartu penginapan ("Pesan di Pantai Sundak / Trenggole")
      setIsLocationPreselected(true);
    }

    const target =
      accommodations.find(
        (a) =>
          a.id === targetPropId ||
          (targetPropId === 'homestay-trenggole' &&
            (a.id.includes('trenggole') || a.name.toLowerCase().includes('trenggole'))) ||
          (targetPropId === 'homestay-sundak' &&
            (a.id.includes('sundak') || a.name.toLowerCase().includes('sundak')))
      ) ||
      (targetPropId === 'homestay-trenggole' ? trenggoleProp : sundakProp) ||
      accommodations[0];

    if (target) {
      setSelectedProperty(target);
      if (target.roomTypes && target.roomTypes.length > 0) {
        setSelectedRoomType(target.roomTypes[0]);
      }
    }
    setCurrentView('booking_flow');
  };

  const handleViewAccommodation = (propertyId: string) => {
    const target =
      accommodations.find(
        (a) =>
          a.id === propertyId ||
          (propertyId === 'homestay-trenggole' &&
            (a.id.includes('trenggole') || a.name.toLowerCase().includes('trenggole'))) ||
          (propertyId === 'homestay-sundak' &&
            (a.id.includes('sundak') || a.name.toLowerCase().includes('sundak')))
      ) || (propertyId === 'homestay-trenggole' ? trenggoleProp : sundakProp);

    if (target) {
      setSelectedProperty(target);
      setIsLocationPreselected(true);
      if (target.roomTypes && target.roomTypes.length > 0) {
        setSelectedRoomType(target.roomTypes[0]);
      }
    }
    setCurrentView('accommodations');
  };

  return (
    <div className="min-h-[100dvh] bg-[#ECEEF2] text-[#12151B] flex flex-col justify-between select-none pb-28">
      {/* Top Header Lokasi & Kontak WhatsApp (Judul Brand ada di App Bar Utama) */}
      <header className="px-5 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-xs">
            <MapPin className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-sm font-black text-neutral-900 leading-tight">
              {t.locationSundakTrenggole}
            </h1>
            <span className="text-[11px] text-neutral-500 font-medium block">
              {t.gunungkidulYogyakarta}
            </span>
          </div>
        </div>

        <a
          href={`https://wa.me/${formattedAdminWa}?text=Halo%20Pengelola%20Griya%20Barokah,%20saya%20ingin%20tanya%20informasi%20penginapan`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200/90 text-xs font-bold text-neutral-800 shadow-xs hover:bg-neutral-50 active:scale-95 transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.chatWhatsapp}</span>
        </a>
      </header>

      {/* Main Content: Landing Page Aplikasi Homestay */}
      <main className="px-5 pt-2 pb-6 space-y-5 flex-grow">
        {/* ==============================================================
            1. HERO BANNER UTAMA HOMESTAY / PANTAI
           ============================================================== */}
        <section className="relative rounded-[30px] overflow-hidden bg-neutral-900 shadow-md">
          <div className="relative h-60 w-full">
            <SafeImage
              src={heroImageSrc}
              alt={language === 'en' ? t.heroDefaultTitle : (homepageContent?.hero_title || t.heroDefaultTitle)}
              className="w-full h-full object-cover opacity-90"
              containerClassName="w-full h-full"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

            <div className="absolute inset-0 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-wider border border-white/20">
                  {language === 'en' ? t.heroDefaultSubtitle : (homepageContent?.hero_subtitle || t.heroDefaultSubtitle)}
                </span>
                <span className="text-[11px] font-bold text-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.familyAndMahrom}</span>
                </span>
              </div>

              <div>
                <h1 className="text-[21px] font-black leading-tight text-white tracking-tight">
                  {language === 'en' ? t.heroDefaultTitle : (homepageContent?.hero_title || t.heroDefaultTitle)}
                </h1>
                <p className="text-xs text-neutral-200 mt-1.5 leading-relaxed font-normal">
                  {language === 'en' ? t.heroDefaultDesc : (homepageContent?.hero_description || t.heroDefaultDesc)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==============================================================
            2. CARD PILIHAN RINGKAS: PILIH LOKASI & JUMLAH TAMU + PESAN SEKARANG
               (Catatan: Tanggal menginap TIDAK ditanyakan di sini!)
           ============================================================== */}
        <section className="bg-white rounded-[28px] p-5 shadow-sm border border-neutral-200/90 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-700" />
              <span>{t.yourVisitPlan}</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {t.easyBookingBadge}
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Pilihan Jumlah Tamu & Rekomendasi Lokasi Otomatis */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span>{t.guestCountLabel}</span>
              </label>
              <select
                value={guestCountEstimate}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGuestCountEstimate(val);
                  setPreselectedGuestCount(val);
                  if (val < 6) {
                    setSelectedLocation('homestay-trenggole');
                  } else {
                    setSelectedLocation('all');
                  }
                }}
                className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value={2}>{t.guestOption2}</option>
                <option value={4}>{t.guestOption4}</option>
                <option value={6}>{t.guestOption6}</option>
                <option value={12}>{t.guestOption12}</option>
                <option value={16}>{t.guestOption16}</option>
                <option value={21}>{t.guestOption21}</option>
              </select>

              {/* Rekomendasi Otomatis Berdasarkan Jumlah Tamu */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-950">
                {guestCountEstimate < 6 ? (
                  <span>
                    {t.recTrenggoleDesc}
                  </span>
                ) : (
                  <span>
                    {t.recBothDesc}
                  </span>
                )}
              </div>
            </div>

            {/* Tombol Utama: Cari Homestay -> Menuju ke Halaman Pilihan Penginapan */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCariHomestay}
                className="h-12 rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#13281E]/20 transition-all cursor-pointer"
              >
                <span>{t.searchHomestayBtn}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>

              <button
                type="button"
                onClick={() => handlePesanSekarang()}
                className="h-12 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <span>{t.bookNowBtn}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ==============================================================
            3. INFORMASI DETAIL: PANTAI SUNDAK & PANTAI TRENGGOLE
           ============================================================== */}
        <section id="pilihan-penginapan" className="space-y-4 scroll-mt-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-neutral-700">
              {t.ourLodgingOptions}
            </h2>
            <button
              onClick={() => setCurrentView('accommodations')}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t.viewRoomDetails}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notifikasi info kapasitas jika tamu < 6 orang */}
          {guestCountEstimate < 6 && (
            <div className="p-3 bg-sky-50 border border-sky-200/80 text-sky-950 rounded-2xl text-xs">
              <span>
                {t.guestCountNotificationPrefix} <strong>{guestCountEstimate} {t.peopleCount}</strong> {t.guestCountNotificationSuffix}
              </span>
            </div>
          )}

          {/* 1. Kartu Ringkas: Griya Barokah Pantai Sundak */}
          <div className="bg-white rounded-[26px] overflow-hidden shadow-xs border border-neutral-200/90 flex flex-col">
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-neutral-900">
              <PhotoSlider
                images={sundakCms?.galeri || sundakProp?.gallery || [sundakImageSrc]}
                alt={sundakCms?.nama || 'Griya Barokah Pantai Sundak'}
                fallbackText="Pantai Sundak"
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                  {sundakCms?.badge || 'Satu Rumah Penuh (Full House)'}
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 text-white z-10 pointer-events-none">
                <span className="text-[11px] text-emerald-300 font-semibold block">
                  Kawasan Wisata Pantai Sundak
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {sundakCms?.nama || 'Griya Barokah Pantai Sundak'}
                </h3>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Rating & Lokasi */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{sundakCms?.rating || '4.9'}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    ({sundakCms?.reviews_count || 42} Ulasan)
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-500">
                  ±50m ke Pasir Pantai Sundak
                </span>
              </div>

              {/* Harga Mulai Dari */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Mulai dari
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Satu Rumah Penuh (Min. 6 org)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-800">
                    Rp 75.000
                  </span>
                  <span className="text-[10px] text-neutral-400 block -mt-0.5">
                    /orang/malam
                  </span>
                </div>
              </div>

              {/* SATU Tombol: Lihat Detail & Pesan */}
              <button
                type="button"
                onClick={() => handleViewAccommodation('homestay-sundak')}
                className="w-full py-2.5 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Lihat Detail &amp; Pesan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Kartu Ringkas: Griya Barokah Pantai Trenggole */}
          <div className="bg-white rounded-[26px] overflow-hidden shadow-xs border border-neutral-200/90 flex flex-col">
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-neutral-900">
              <PhotoSlider
                images={trenggoleCms?.galeri || trenggoleProp?.gallery || [trenggoleImageSrc]}
                alt={trenggoleCms?.nama || 'Griya Barokah Pantai Trenggole'}
                fallbackText="Pantai Trenggole"
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-sky-600 text-white text-[10px] font-extrabold shadow-xs">
                  {trenggoleCms?.badge || 'Kamar Individual • Tepi Pantai'}
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 text-white z-10 pointer-events-none">
                <span className="text-[11px] text-sky-300 font-semibold block">
                  Jalur Wisata Pantai Trenggole
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {trenggoleCms?.nama || 'Griya Barokah Pantai Trenggole'}
                </h3>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Rating & Lokasi */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{trenggoleCms?.rating || '4.8'}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    ({trenggoleCms?.reviews_count || 38} Ulasan)
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-500">
                  4 Pilihan Kamar AC View Pantai
                </span>
              </div>

              {/* Harga Mulai Dari */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Mulai dari
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Sewa Kamar Individual
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-800">
                    Rp 285.000
                  </span>
                  <span className="text-[10px] text-neutral-400 block -mt-0.5">
                    /kamar/malam
                  </span>
                </div>
              </div>

              {/* SATU Tombol: Lihat Detail & Pesan */}
              <button
                type="button"
                onClick={() => handleViewAccommodation('homestay-trenggole')}
                className="w-full py-2.5 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Lihat Detail &amp; Pesan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ==============================================================
            4. FASILITAS LENGKAP PENGINAPAN
           ============================================================== */}
        <section className="bg-white rounded-[28px] p-5 shadow-xs border border-neutral-200/90 space-y-3.5">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-neutral-800">
              Fasilitas Lengkap Penginapan
            </h2>
            <span className="text-[10px] text-neutral-400">Tersedia di Griya Barokah Pantai Sundak & Trenggole</span>
          </div>

          {/* Foto Fasilitas dari CMS */}
          <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-neutral-900">
            <SafeImage
              src={facilityImageSrc}
              alt="Fasilitas Griya Barokah Homestay"
              className="w-full h-full object-cover"
              containerClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute bottom-2.5 left-3 right-3 text-white">
              <span className="text-[10px] font-bold text-emerald-300 block">Ruang Keluarga & Fasilitas Bersama</span>
              <p className="text-[11px] text-neutral-200 line-clamp-1">Suasana hangat untuk berkumpul bersama keluarga santai</p>
            </div>
          </div>

          {/* Grid Fasilitas Dinamis & Kompak dari Pengaturan CMS */}
          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-800">
            {displayedFacilities.map((f, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[#F9FAFB] border border-neutral-200/70 flex items-center gap-2 transition-all hover:bg-neutral-100/80"
              >
                {getFacilityIcon(f)}
                <span className="text-[11px] font-bold text-neutral-800 truncate" title={f}>
                  {f}
                </span>
              </div>
            ))}
          </div>

          {/* Tombol Expand / Collapse jika fasilitas lebih dari 4 */}
          {facilitiesList.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAllFacilities((prev) => !prev)}
              className="w-full py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showAllFacilities ? 'Tampilkan Lebih Sedikit' : `Lihat Semua Fasilitas (${facilitiesList.length})`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllFacilities ? 'rotate-180' : ''}`} />
            </button>
          )}
        </section>

        {/* ==============================================================
            5. LAYANAN TAMBAHAN (MAKANAN, JEEP WISATA, INFO PROPERTI, WHATSAPP)
           ============================================================== */}
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-[28px] p-5 border border-emerald-200 shadow-xs space-y-3.5">
          <div>
            <h2 className="text-[13px] font-black text-emerald-950">
              Layanan Tambahan Tersedia
            </h2>
            <span className="text-[11px] text-emerald-700">
              Siap memfasilitasi kebutuhan rombongan Anda
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-white/90 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UtensilsCrossed className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-neutral-900 block">Pesanan Makanan</span>
                  <span className="text-[10px] text-neutral-500">Santapan lezat nasi box & hidangan pantai</span>
                </div>
              </div>
              <a
                href={`https://wa.me/${formattedLayananWa}?text=Halo%20Pengelola%20Griya%20Barokah,%20saya%20ingin%20pesan%20makanan`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-bold active:scale-95 transition-transform"
              >
                Pesan
              </a>
            </div>

            <div className="p-3 rounded-2xl bg-white/90 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-neutral-900 block">Sewa Jeep Wisata</span>
                  <span className="text-[10px] text-neutral-500">Jelajah pantai & tebing karang Gunungkidul</span>
                </div>
              </div>
              <a
                href={`https://wa.me/${formattedLayananWa}?text=Halo%20Pengelola%20Griya%20Barokah,%20saya%20ingin%20sewa%20Jeep%20wisata`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-bold active:scale-95 transition-transform"
              >
                Booking
              </a>
            </div>

            <div className="p-3 rounded-2xl bg-white/90 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-neutral-900 block">Info Jual Beli Tanah / Rumah</span>
                  <span className="text-[10px] text-neutral-500">Peluang investasi properti pesisir pantai</span>
                </div>
              </div>
              <a
                href={`https://wa.me/${formattedLayananWa}?text=Halo%20Pengelola%20Griya%20Barokah,%20saya%20ingin%20info%20properti%20tanah%20rumah`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-bold active:scale-95 transition-transform"
              >
                Tanya
              </a>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-emerald-200/70 text-[11px]">
            <span className="text-emerald-950 font-medium">
              Hubungi WhatsApp: <strong>{rawLayananWa}</strong>
            </span>
            <a
              href={`https://wa.me/${formattedLayananWa}`}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-800 hover:underline flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>Chat Layanan Langsung</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </section>
      </main>

      {/* Floating Bottom Navigation Bar */}
      <CustomerBottomNav />
    </div>
  );
};
