import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { SafeImage } from './common/SafeImage';
import { PhotoSlider } from './common/PhotoSlider';
import { CustomerBottomNav } from './common/CustomerBottomNav';
import {
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  Compass,
  MessageCircle,
  Home,
  CheckCircle2,
  Signal,
  Wifi,
  Battery,
  Wind,
  Flame,
  Refrigerator,
  Tv,
  Bed,
  Bath,
  Building,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const {
    accommodations,
    setSelectedProperty,
    setSelectedRoomType,
    setCurrentView,
    language,
    heroImage,
    homepageContent,
    adminWhatsappNumber,
    getWebsiteSetting,
    cmsHomestays,
    cmsRooms,
    cmsMedia,
    facilityImage,
  } = useBooking();

  // State Pilihan Singkat di Beranda (Lokasi & Jumlah Tamu saja - TANPA TANGGAL)
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'homestay-sundak' | 'homestay-trenggole'>('all');
  const [guestCountEstimate, setGuestCountEstimate] = useState<number>(4);

  // Ambil data langsung dari CMS Database sebagai sumber utama
  const sundakCms = cmsHomestays?.find((h) => h.id === 'homestay-sundak') || cmsHomestays?.[0];
  const trenggoleCms = cmsHomestays?.find((h) => h.id === 'homestay-trenggole') || cmsHomestays?.[1];

  const sundakProp = accommodations.find((a) => a.id === 'homestay-sundak') || accommodations[0];
  const trenggoleProp = accommodations.find((a) => a.id === 'homestay-trenggole') || accommodations[1];

  // Sumber gambar pasti dari CMS database
  const heroImageSrc = homepageContent?.hero_image || heroImage || sundakCms?.foto_utama || '/images/sundak_fullhouse_1790552054893.jpg';
  const sundakImageSrc = sundakCms?.foto_utama || sundakProp?.image || '/images/sundak_fullhouse_1790552054893.jpg';
  const trenggoleImageSrc = trenggoleCms?.foto_utama || trenggoleProp?.image || '/images/trenggole_house_1790552065368.jpg';
  const facilityImageSrc =
    facilityImage ||
    cmsMedia?.find((m) => m.kategori === 'fasilitas')?.url ||
    sundakCms?.galeri?.[1] ||
    '/images/living_room_1790552074900.jpg';

  // 4 Kamar Trenggole dari CMS
  const room1 = cmsRooms?.find((r) => r.id === 'trenggole-kamar-1');
  const room2 = cmsRooms?.find((r) => r.id === 'trenggole-kamar-2');
  const room3 = cmsRooms?.find((r) => r.id === 'trenggole-kamar-3');
  const room4 = cmsRooms?.find((r) => r.id === 'trenggole-kamar-4');

  const handleCariHomestay = () => {
    if (selectedLocation === 'homestay-sundak') {
      setSelectedProperty(sundakProp);
    } else if (selectedLocation === 'homestay-trenggole') {
      setSelectedProperty(trenggoleProp);
    }
    setCurrentView('accommodations');
  };

  const handlePesanSekarang = (propertyId?: string) => {
    const targetPropId =
      propertyId || (selectedLocation === 'all' ? 'homestay-sundak' : selectedLocation);
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

  return (
    <div className="min-h-[100dvh] bg-[#ECEEF2] text-[#12151B] flex flex-col justify-between select-none pb-28">
      {/* Mobile Top Status Bar */}
      <div className="sticky top-0 z-30 bg-[#ECEEF2]/95 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-neutral-800 text-xs font-semibold">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Main Top Header */}
      <header className="px-5 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#13281E] text-white flex items-center justify-center shadow-xs">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-black tracking-wider text-emerald-800">
              Griya Barokah Homestay
            </span>
            <div className="flex items-center gap-1 text-[13px] font-bold text-neutral-900 leading-tight">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pantai Sundak & Trenggole, Gunungkidul</span>
            </div>
          </div>
        </div>

        <a
          href={`https://wa.me/${(adminWhatsappNumber || getWebsiteSetting?.('footer_whatsapp') || '6282138613888').replace(/\D/g, '')}?text=Halo%20Pengelola%20Griya%20Barokah,%20saya%20ingin%20tanya%20informasi%20penginapan`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200/90 text-xs font-bold text-neutral-800 shadow-xs hover:bg-neutral-50 active:scale-95 transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp</span>
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
              alt={homepageContent?.hero_title || 'Griya Barokah Homestay Pantai Sundak & Trenggole'}
              className="w-full h-full object-cover opacity-90"
              containerClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

            <div className="absolute inset-0 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-wider border border-white/20">
                  {homepageContent?.hero_subtitle || 'HOMESTAY KELUARGA ASLI'}
                </span>
                <span className="text-[11px] font-bold text-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Keluarga & Mahrom</span>
                </span>
              </div>

              <div>
                <h1 className="text-[21px] font-black leading-tight text-white tracking-tight">
                  {homepageContent?.hero_title || 'Griya Barokah Homestay Pantai Sundak & Trenggole'}
                </h1>
                <p className="text-xs text-neutral-200 mt-1.5 leading-relaxed font-normal">
                  {homepageContent?.hero_description || 'Penginapan keluarga nyaman dekat pantai Gunungkidul dengan fasilitas lengkap.'}
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
              <span>Rencana Kunjungan Anda</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Booking Mudah
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Pilihan Lokasi Homestay */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>Pilih Lokasi Homestay</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedLocation('homestay-sundak')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedLocation === 'homestay-sundak'
                      ? 'border-emerald-800 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-800/15'
                      : 'border-neutral-200 bg-[#F9FAFB] hover:border-neutral-300'
                  }`}
                >
                  <span className="text-[9px] font-bold text-emerald-800 uppercase block">Lokasi 1</span>
                  <span className="text-[12px] font-black text-neutral-900 block leading-tight mt-0.5">
                    Pantai Sundak
                  </span>
                  <span className="text-[9px] text-neutral-500 block mt-0.5 truncate">
                    Full Homestay
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLocation('homestay-trenggole')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedLocation === 'homestay-trenggole'
                      ? 'border-emerald-800 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-800/15'
                      : 'border-neutral-200 bg-[#F9FAFB] hover:border-neutral-300'
                  }`}
                >
                  <span className="text-[9px] font-bold text-sky-800 uppercase block">Lokasi 2</span>
                  <span className="text-[12px] font-black text-neutral-900 block leading-tight mt-0.5">
                    Pantai Trenggole
                  </span>
                  <span className="text-[9px] text-neutral-500 block mt-0.5 truncate">
                    Individual Rooms
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLocation('all')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedLocation === 'all'
                      ? 'border-emerald-800 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-800/15'
                      : 'border-neutral-200 bg-[#F9FAFB] hover:border-neutral-300'
                  }`}
                >
                  <span className="text-[9px] font-bold text-indigo-800 uppercase block">Semua</span>
                  <span className="text-[12px] font-black text-neutral-900 block leading-tight mt-0.5">
                    Semua Lokasi
                  </span>
                  <span className="text-[9px] text-neutral-500 block mt-0.5 truncate">
                    Lihat Kedua Pantai
                  </span>
                </button>
              </div>
            </div>

            {/* Pilihan Jumlah Tamu */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span>Jumlah Tamu (Orang)</span>
              </label>
              <select
                value={guestCountEstimate}
                onChange={(e) => setGuestCountEstimate(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-2xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value={2}>2 Orang (Keluarga Kecil / Pasangan)</option>
                <option value={4}>4 Orang (Keluarga Standar - Pas 1 Kamar Trenggole)</option>
                <option value={6}>6 Orang (Keluarga Sedang - Pas Sewa 2 Kamar Sundak)</option>
                <option value={12}>12 Orang (Keluarga Besar - Pas Rumah Penuh Sundak)</option>
                <option value={16}>16 Orang (Rombongan 4 Kamar Trenggole / Sundak + Extra Bed)</option>
                <option value={21}>21 Orang (Kapasitas Maksimal Rumah Penuh Sundak)</option>
              </select>
            </div>

            {/* Tombol Utama: Cari Homestay -> Menuju ke Halaman Pilihan Penginapan */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCariHomestay}
                className="h-12 rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#13281E]/20 transition-all cursor-pointer"
              >
                <span>Cari Homestay</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>

              <button
                type="button"
                onClick={() => handlePesanSekarang()}
                className="h-12 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <span>Pesan Sekarang</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              </button>
            </div>
          </div>
        </section>

        {/* ==============================================================
            3. INFORMASI DETAIL: PANTAI SUNDAK & PANTAI TRENGGOLE
           ============================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-neutral-700">
              Pilihan Penginapan Kami
            </h2>
            <button
              onClick={() => setCurrentView('accommodations')}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Detail Kamar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Informasi 1: Griya Barokah Pantai Sundak */}
          <div className="bg-white rounded-[28px] overflow-hidden shadow-xs border border-neutral-200/90 space-y-3.5 pb-4">
            <div className="relative h-44 w-full">
              <PhotoSlider
                images={sundakCms?.galeri || sundakProp?.gallery || [sundakImageSrc]}
                alt="Griya Barokah Pantai Sundak"
                fallbackText="Pantai Sundak"
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                  Keluarga Besar & Rombongan
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 text-white z-10 pointer-events-none">
                <span className="text-[11px] text-emerald-300 font-semibold block">
                  Kawasan Wisata Pantai Sundak
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  Griya Barokah Pantai Sundak
                </h3>
              </div>
            </div>

            <div className="px-4 space-y-2.5">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Konsep Satu Rumah Penuh (Full House), bukan sewa per kamar. Berjarak jalan kaki ke pantai pasir putih Sundak, cocok untuk keluarga & rombongan. Memiliki 4 kamar tidur AC, 3 kamar mandi, ruang keluarga luas, kulkas, TV, mesin cuci, dapur lengkap alat masak/makan, WiFi gratis, dan parkir luas.
              </p>

              {/* Rincian Tarif Full House Sundak */}
              <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-neutral-200/70 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Satu Rumah Penuh (Full House)</span>
                  <span className="font-black text-emerald-800">Rp75.000 <span className="font-normal text-[10px] text-neutral-400">/orang/malam</span></span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Minimal pemesanan 6 orang (maksimal 21 orang). Total biaya: <strong>Jumlah orang × Jumlah malam × Rp75.000</strong>.
                </p>
                <div className="p-2 rounded-xl bg-emerald-50 text-[10px] text-emerald-900 font-semibold border border-emerald-200">
                  Contoh: 6 orang 1 malam = Rp450.000 • 7 orang 1 malam = Rp525.000 • 7 orang 2 malam = Rp1.050.000.
                </div>
              </div>

              <button
                onClick={() => handlePesanSekarang('homestay-sundak')}
                className="w-full py-2.5 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Pesan di Pantai Sundak</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card Informasi 2: Griya Barokah Pantai Trenggole */}
          <div className="bg-white rounded-[28px] overflow-hidden shadow-xs border border-neutral-200/90 space-y-3.5 pb-4">
            <div className="relative h-44 w-full">
              <PhotoSlider
                images={trenggoleCms?.galeri || trenggoleProp?.gallery || [trenggoleImageSrc]}
                alt="Griya Barokah Pantai Trenggole"
                fallbackText="Pantai Trenggole"
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-sky-600 text-white text-[10px] font-extrabold shadow-xs">
                  Tepi Pantai & Suasana Tenang
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 text-white z-10 pointer-events-none">
                <span className="text-[11px] text-sky-300 font-semibold block">
                  Jalur Wisata Pantai Trenggole
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  Griya Barokah Pantai Trenggole
                </h3>
              </div>
            </div>

            <div className="px-4 space-y-2.5">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Suasana asri tepi pantai dengan 4 pilihan kamar. Semua kamar Trenggole: view pantai, 2 bed ukuran ±130x200, dan bisa tambah extra bed.
              </p>

              {/* 4 Pilihan Kamar Trenggole dengan Foto CMS & Slider */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-neutral-200/70 space-y-1.5">
                  <div className="h-20 w-full rounded-lg overflow-hidden bg-neutral-900 relative">
                    <PhotoSlider
                      images={room1?.galeri || (room1?.foto_utama ? [room1.foto_utama] : [room1?.foto || '/images/trenggole_room_1790552085510.jpg'])}
                      alt={room1?.nama_kamar || 'Kamar 1'}
                      fallbackText={room1?.nama_kamar || 'Kamar 1'}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                      showControls={false}
                    />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 block">{room1?.nama_kamar || 'Kamar 1'}</span>
                    <span className="font-black text-emerald-800 text-[11px]">Rp{(room1?.harga || 285000).toLocaleString('id-ID')}</span>
                    <span className="text-[9px] text-neutral-500 block leading-tight mt-0.5">AC, KM jongkok, perlengkapan mandi, wifi.</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-neutral-200/70 space-y-1.5">
                  <div className="h-20 w-full rounded-lg overflow-hidden bg-neutral-900 relative">
                    <PhotoSlider
                      images={room2?.galeri || (room2?.foto_utama ? [room2.foto_utama] : [room2?.foto || '/images/trenggole_room_1790552085510.jpg'])}
                      alt={room2?.nama_kamar || 'Kamar 2'}
                      fallbackText={room2?.nama_kamar || 'Kamar 2'}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                      showControls={false}
                    />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 block">{room2?.nama_kamar || 'Kamar 2'}</span>
                    <span className="font-black text-emerald-800 text-[11px]">Rp{(room2?.harga || 335000).toLocaleString('id-ID')}</span>
                    <span className="text-[9px] text-neutral-500 block leading-tight mt-0.5">AC, KM jongkok, dapur mini, gas gratis.</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-neutral-200/70 space-y-1.5">
                  <div className="h-20 w-full rounded-lg overflow-hidden bg-neutral-900 relative">
                    <PhotoSlider
                      images={room3?.galeri || (room3?.foto_utama ? [room3.foto_utama] : [room3?.foto || '/images/trenggole_room_1790552085510.jpg'])}
                      alt={room3?.nama_kamar || 'Kamar 3'}
                      fallbackText={room3?.nama_kamar || 'Kamar 3'}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                      showControls={false}
                    />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 block">{room3?.nama_kamar || 'Kamar 3'}</span>
                    <span className="font-black text-emerald-800 text-[11px]">Rp{(room3?.harga || 315000).toLocaleString('id-ID')}</span>
                    <span className="text-[9px] text-neutral-500 block leading-tight mt-0.5">AC, KM duduk, wifi, lantai 2 nyaman.</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#F8F9FA] border border-neutral-200/70 space-y-1.5">
                  <div className="h-20 w-full rounded-lg overflow-hidden bg-neutral-900 relative">
                    <PhotoSlider
                      images={room4?.galeri || (room4?.foto_utama ? [room4.foto_utama] : [room4?.foto || '/images/trenggole_room_1790552085510.jpg'])}
                      alt={room4?.nama_kamar || 'Kamar 4'}
                      fallbackText={room4?.nama_kamar || 'Kamar 4'}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                      showControls={false}
                    />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 block">{room4?.nama_kamar || 'Kamar 4'}</span>
                    <span className="font-black text-emerald-800 text-[11px]">Rp{(room4?.harga || 365000).toLocaleString('id-ID')}</span>
                    <span className="text-[9px] text-neutral-500 block leading-tight mt-0.5">AC, KM duduk, dapur mini, lantai 2.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePesanSekarang('homestay-trenggole')}
                className="w-full py-2.5 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span>Pesan di Pantai Trenggole</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ==============================================================
            4. FASILITAS LENGKAP PENGINAPAN
           ============================================================== */}
        <section className="bg-white rounded-[28px] p-5 shadow-xs border border-neutral-200/90 space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                Fasilitas Lengkap Penginapan
              </h2>
              <span className="text-[10px] text-neutral-400">Tersedia di Griya Barokah Pantai Sundak & Trenggole</span>
            </div>
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

          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700">
            <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-neutral-200/70 flex items-center gap-2">
              <Wind className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Semua Kamar Ber-AC</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-neutral-200/70 flex items-center gap-2">
              <Bath className="w-4 h-4 text-blue-600 shrink-0" />
              <span>KM Duduk & Jongkok</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-neutral-200/70 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Dapur Lengkap & Gas</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-neutral-200/70 flex items-center gap-2">
              <Refrigerator className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kulkas & TV Keluarga</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-neutral-200/70 flex items-center gap-2">
              <Bed className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Tersedia 13 Extra Bed</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-neutral-200/70 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free WiFi Cepat</span>
            </div>
          </div>
        </section>

        {/* ==============================================================
            5. LAYANAN TAMBAHAN (MAKANAN, JEEP WISATA, INFO PROPERTI, WHATSAPP)
           ============================================================== */}
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-[28px] p-5 border border-emerald-200 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[13px] font-black text-emerald-950">
                Layanan Tambahan Tersedia
              </h2>
              <span className="text-[11px] text-emerald-700">
                Siap memfasilitasi kebutuhan rombongan Anda
              </span>
            </div>
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
                href="https://wa.me/6282138613888?text=Halo%20Pengelola%20Griya%20Barokah,%20saya%20ingin%20pesan%20makanan"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-full bg-emerald-800 text-white text-[10px] font-bold"
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
                href="https://wa.me/6282138613888?text=Halo%20Pengelola%20Griya%20Barokah,%20saya%20ingin%20sewa%20Jeep%20wisata"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-full bg-emerald-800 text-white text-[10px] font-bold"
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
                href="https://wa.me/6282138613888?text=Halo%20Pengelola%20Griya%20Barokah,%20saya%20ingin%20info%20properti%20tanah%20rumah"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-full bg-emerald-800 text-white text-[10px] font-bold"
              >
                Tanya
              </a>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-emerald-200/70 text-[11px]">
            <span className="text-emerald-950 font-medium">
              Hubungi WhatsApp: <strong>082138613xxx</strong>
            </span>
            <a
              href="https://wa.me/6282138613888"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>Chat CS Langsung</span>
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
