import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Property, RoomType } from '../types';
import { SafeImage } from './common/SafeImage';
import { CustomerBottomNav } from './common/CustomerBottomNav';
import {
  MapPin,
  Star,
  Users,
  Bed,
  Bath,
  ArrowRight,
  Palmtree,
  Sparkles,
  Wind,
  Flame,
  Tv,
  Refrigerator,
  UtensilsCrossed,
  Wifi,
  Home,
  CheckCircle2,
  ChevronRight,
  Eye,
} from 'lucide-react';

export const AccommodationsView: React.FC = () => {
  const {
    accommodations,
    selectedProperty,
    setSelectedProperty,
    setSelectedRoomType,
    setCurrentView,
    language,
    setLanguage,
    t,
    cmsHomestays,
    cmsRooms,
    getWebsiteSetting,
  } = useBooking();

  const [selectedAccId, setSelectedAccId] = useState<string>('all');
  const [expandedRoomsPropId, setExpandedRoomsPropId] = useState<string | null>(null);

  const displayedAccommodations =
    selectedAccId === 'all'
      ? accommodations
      : accommodations.filter((a) => a.id === selectedAccId);

  const handleSelectPropertyDetail = (prop: Property) => {
    setSelectedProperty(prop);
    if (prop.roomTypes.length > 0) {
      setSelectedRoomType(prop.roomTypes[0]);
    }
    setCurrentView('detail');
  };

  const handleDirectReserve = (prop: Property, room?: RoomType) => {
    setSelectedProperty(prop);
    if (room) {
      setSelectedRoomType(room);
    } else if (prop.roomTypes.length > 0) {
      setSelectedRoomType(prop.roomTypes[0]);
    }
    setCurrentView('booking_flow');
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-28">
      {/* ==============================================================
          TOP HEADER (Sesuai Referensi Gambar #1)
          - Logo Griya Barokah Homestay
          - Language toggle pill (ID | EN)
          - Subtitle: 🌴 GRIYA BAROKAH HOMESTAY
          - Title: Pilihan Penginapan Homestay (2 Lokasi)
          - Location filter pills: Semua Lokasi, Pantai Sundak, Pantai Trenggole
         ============================================================== */}
      <header className="sticky top-0 z-30 bg-[#F6F7F9]/95 backdrop-blur-md px-4 sm:px-5 pt-3.5 pb-2.5 border-b border-neutral-200/80">
        {/* Brand & Language Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/80 shadow-2xs">
              <Palmtree className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="font-extrabold text-sm text-neutral-900 tracking-tight">
              Griya Barokah Homestay
            </span>
          </div>

          {/* Language Toggle Pill */}
          <div className="flex items-center p-0.5 rounded-full bg-neutral-200/90 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                language === 'id'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Section Heading & Location Counter */}
        <div className="flex items-end justify-between mt-3">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
              <Palmtree className="w-3.5 h-3.5 text-emerald-700" />
              <span>GRIYA BAROKAH HOMESTAY</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight mt-0.5">
              Pilihan Penginapan Homestay
            </h1>
          </div>

          <span className="px-3 py-1 rounded-full bg-white text-xs font-bold text-neutral-800 shadow-2xs border border-neutral-200/90 shrink-0">
            {accommodations.length} Lokasi
          </span>
        </div>

        {/* Filter Chips (Semua Lokasi, Pantai Sundak, Pantai Trenggole) */}
        <div className="flex gap-1.5 mt-3 p-1 bg-neutral-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setSelectedAccId('all')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center truncate cursor-pointer ${
              selectedAccId === 'all'
                ? 'bg-white text-neutral-900 shadow-2xs ring-1 ring-black/5'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Semua Lokasi
          </button>
          {accommodations.map((acc) => {
            const isSelected = acc.id === selectedAccId;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  setSelectedAccId(acc.id);
                  setSelectedProperty(acc);
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center truncate cursor-pointer ${
                  isSelected
                    ? 'bg-white text-neutral-900 shadow-2xs ring-1 ring-black/5'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {acc.name.replace('Griya Barokah ', '')}
              </button>
            );
          })}
        </div>
      </header>

      {/* ==============================================================
          MAIN CONTENT AREA (CARD PENGINAPAN MODERN MOBILE-FIRST)
         ============================================================== */}
      <main className="px-4 py-4 space-y-5 flex-grow max-w-md mx-auto w-full">
        {displayedAccommodations.map((currentAcc) => {
          const isSundak =
            currentAcc.id === 'homestay-sundak' ||
            currentAcc.propertyType === 'full_homestay';
          const cmsData = cmsHomestays?.find((h) => h.id === currentAcc.id);
          const badgeText = cmsData?.badge || currentAcc.badge || (isSundak ? 'Satu Rumah Penuh (Full House)' : 'Penginapan Kamar & Full House');
          const conceptText = cmsData?.konsep || currentAcc.concept || (isSundak
            ? 'Konsep: Satu Rumah Penuh (Bukan Per Kamar). Tarif Rp75.000/orang/malam (minimal 4 orang). Total biaya: Jumlah orang × Jumlah malam × Rp75.000.'
            : 'Konsep: Kamar Individual (Sewa Per Kamar). Tersedia 4 pilihan kamar AC view pantai. Mulai Rp285.000/malam. Kapasitas 4 orang per kamar (2 bed: ranjang + bed lantai).');
          const descText = cmsData?.deskripsi || currentAcc.description;
          const facilitiesList = (cmsData?.fasilitas && cmsData.fasilitas.length > 0)
            ? cmsData.fasilitas.slice(0, 4)
            : (currentAcc.highlights && currentAcc.highlights.length > 0 ? currentAcc.highlights.slice(0, 4) : []);

          return (
            <div
              key={currentAcc.id}
              className="bg-white rounded-[24px] sm:rounded-[26px] overflow-hidden border border-neutral-200/90 shadow-sm transition-all hover:shadow-md flex flex-col"
            >
              {/* ================= 1. FOTO FULL-WIDTH LANDSCAPE (OVERLAY GRADASI) ================= */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-neutral-900">
                <SafeImage
                  src={cmsData?.foto_utama || currentAcc.image}
                  alt={cmsData?.nama || currentAcc.name}
                  fallbackText={cmsData?.nama || currentAcc.name}
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />

                {/* Overlay Gradasi Halus Transparan */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 pointer-events-none" />

                {/* 2. Informasi di Atas Gambar (Badge Tipe & Rating) */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                  {/* Badge Tipe Penginapan */}
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm">
                    {badgeText}
                  </span>

                  {/* Rating & Ulasan */}
                  <div className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-amber-300 shadow-sm">
                    <span>★</span>
                    <span>{cmsData?.rating || currentAcc.rating}</span>
                    <span className="text-[10px] text-white/85 font-medium">
                      ({cmsData?.reviews_count || currentAcc.reviewsCount} Ulasan)
                    </span>
                  </div>
                </div>

                {/* Informasi Di Bagian Bawah Gambar (Lokasi & Nama Penginapan) */}
                <div className="absolute bottom-3.5 left-4 right-4 text-white z-10">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cmsData?.lokasi || currentAcc.location}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug drop-shadow-sm">
                    {cmsData?.nama || currentAcc.name}
                  </h2>
                </div>
              </div>

              {/* ================= 3. INFORMASI BAWAH GAMBAR ================= */}
              <div className="p-4 space-y-3.5">
                {/* Kotak Konsep Khusus (Sesuai Referensi Visual) */}
                <div className={`p-3 rounded-2xl border flex items-start gap-3 ${
                  isSundak
                    ? 'bg-[#F4F8F5] border-emerald-200/70'
                    : 'bg-[#F4F8FA] border-sky-200/70'
                }`}>
                  <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 border shadow-2xs mt-0.5 ${
                    isSundak
                      ? 'text-emerald-800 border-emerald-200/80'
                      : 'text-sky-800 border-sky-200/80'
                  }`}>
                    {isSundak ? <Home className="w-4 h-4 text-emerald-700" /> : <Bed className="w-4 h-4 text-sky-700" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-extrabold text-neutral-900 leading-snug">
                      {isSundak
                        ? 'Konsep: Satu Rumah Penuh (Bukan Per Kamar)'
                        : 'Konsep: Kamar Individual (Sewa Per Kamar)'}
                    </h4>
                    <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                      {conceptText}
                    </p>
                  </div>
                </div>

                {/* Deskripsi Singkat (Line Clamp Maksimal 3 Baris - Responsive 360px) */}
                <div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-normal line-clamp-3">
                    {descText}
                  </p>
                </div>

                {/* Fasilitas Utama Chips Dinamis */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {facilitiesList.map((f, fIdx) => (
                    <span
                      key={fIdx}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-700" /> {f}
                    </span>
                  ))}
                </div>

                {/* Tombol Aksi Bawah: Detail & Pesan */}
                <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectPropertyDetail(currentAcc)}
                    className="flex-1 h-10 px-4 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-200/60"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Lihat Detail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectReserve(currentAcc)}
                    className="flex-1 h-10 px-4 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Pilih &amp; Pesan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Toggle Pilihan Kamar untuk Trenggole */}
                {!isSundak && currentAcc.roomTypes.length > 0 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRoomsPropId(
                          expandedRoomsPropId === currentAcc.id ? null : currentAcc.id
                        )
                      }
                      className="w-full py-2 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 text-xs font-semibold text-neutral-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Lihat 4 Pilihan Kamar Trenggole</span>
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-neutral-400 transition-transform ${
                          expandedRoomsPropId === currentAcc.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {expandedRoomsPropId === currentAcc.id && (
                      <div className="mt-2.5 space-y-2 pt-1 border-t border-neutral-100">
                        {currentAcc.roomTypes.map((room) => {
                          const cmsRoom = cmsRooms?.find((cr) => cr.id === room.id);
                          const roomImgSrc = cmsRoom?.foto_utama || cmsRoom?.foto || room.image;

                          return (
                            <div
                              key={room.id}
                              className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <SafeImage
                                  src={roomImgSrc}
                                  alt={cmsRoom?.nama_kamar || room.name}
                                  fallbackText={cmsRoom?.nama_kamar || room.name}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                                  containerClassName="w-12 h-12 rounded-xl shrink-0 overflow-hidden"
                                />
                                <div className="min-w-0">
                                  <h5 className="font-extrabold text-xs text-neutral-900 truncate">
                                    {cmsRoom?.nama_kamar || room.name}
                                  </h5>
                                <span className="text-[10px] text-neutral-500 block">
                                  {room.capacityGuests} Tamu • {room.bedsCount} Bed • Lt.{room.floor || 1}
                                </span>
                                <span className="text-[11px] font-black text-emerald-800">
                                  Rp {room.pricePerNight.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDirectReserve(currentAcc, room)}
                              className="px-3 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold shrink-0 shadow-2xs cursor-pointer active:scale-95"
                            >
                              Pilih Kamar
                            </button>
                          </div>
                        );
                      })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Layanan Tambahan Banner */}
        <div className="p-4 rounded-[24px] bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/90 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Layanan Tambahan Tersedia:</span>
          </div>
          <ul className="text-neutral-700 text-xs space-y-0.5 list-disc list-inside font-medium pl-1">
            {getWebsiteSetting?.('footer_extra_info') ? (
              getWebsiteSetting('footer_extra_info')
                .split(',')
                .map((item, idx) => (
                  <li key={idx}>{item.trim()}</li>
                ))
            ) : (
              <>
                <li>Pesanan hidangan makanan & seafood pantai</li>
                <li>Sewa Jeep wisata jelajah pantai & tebing Gunungkidul</li>
                <li>Informasi jual beli tanah / aset kawasan pantai</li>
              </>
            )}
          </ul>
        </div>
      </main>

      {/* Floating Bottom Navigation Bar: Beranda, Homestay, Pesanan, Akun */}
      <CustomerBottomNav />
    </div>
  );
};
