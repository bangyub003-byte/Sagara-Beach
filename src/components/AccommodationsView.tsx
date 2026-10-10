import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Property, RoomType } from '../types';
import { SafeImage } from './common/SafeImage';
import { PhotoSlider } from './common/PhotoSlider';
import { CustomerBottomNav } from './common/CustomerBottomNav';
import {
  MapPin,
  Star,
  Users,
  Bed,
  Bath,
  ArrowRight,
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
    cmsHomestays,
    cmsRooms,
    getWebsiteSetting,
    isLocationPreselected,
    setIsLocationPreselected,
    language,
    t,
  } = useBooking();

  const [selectedAccId, setSelectedAccId] = useState<string>(() => {
    if (isLocationPreselected && selectedProperty?.id) {
      return selectedProperty.id;
    }
    return 'all';
  });

  const displayedAccommodations =
    selectedAccId === 'all'
      ? accommodations
      : accommodations.filter((a) => a.id === selectedAccId);

  const handleSelectPropertyDetail = (prop: Property) => {
    setSelectedProperty(prop);
    setIsLocationPreselected(true);
    if (prop.roomTypes.length > 0) {
      setSelectedRoomType(prop.roomTypes[0]);
    }
    setCurrentView('detail');
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-28">
      {/* ==============================================================
          TOP HEADER (Bersih & Fokus: Judul Halaman & Filter Lokasi)
         ============================================================== */}
      <header className="sticky top-0 z-30 bg-[#F6F7F9]/95 backdrop-blur-md px-4 sm:px-5 pt-3.5 pb-2.5 border-b border-neutral-200/80">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight leading-tight">
              {t.accommodationsTitle}
            </h1>
            <p className="text-[11px] text-neutral-500 font-medium">
              {t.accommodationsSub}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-white text-xs font-bold text-neutral-800 shadow-2xs border border-neutral-200/90 shrink-0">
            {accommodations.length} {t.locationsCount}
          </span>
        </div>

        {/* Filter Chips (Semua Lokasi, Pantai Sundak, Pantai Trenggole) */}
        <div className="flex gap-1.5 mt-2.5 p-1 bg-neutral-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setSelectedAccId('all')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center truncate cursor-pointer ${
              selectedAccId === 'all'
                ? 'bg-white text-neutral-900 shadow-2xs ring-1 ring-black/5'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {t.allLocationsFilter}
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
                {language === 'en'
                  ? (acc.id === 'homestay-sundak' ? t.filterSundak : t.filterTrenggole)
                  : acc.name.replace('Griya Barokah ', '')}
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
          const badgeText = language === 'en'
            ? (isSundak ? t.sundakBadgeFullHouse : t.trenggoleBadgeRooms)
            : (cmsData?.badge || currentAcc.badge || (isSundak ? 'Satu Rumah Penuh (Full House)' : 'Penginapan Kamar & Full House'));
          const conceptText = language === 'en'
            ? (isSundak ? t.sundakConceptDesc : t.trenggoleConceptDesc)
            : (cmsData?.konsep || currentAcc.concept || (isSundak ? t.sundakConceptDesc : t.trenggoleConceptDesc));
          const descText = language === 'en'
            ? (currentAcc.descriptionEn || t.landingDesc)
            : (cmsData?.deskripsi || currentAcc.description);
          const facilitiesList = (cmsData?.fasilitas && cmsData.fasilitas.length > 0)
            ? cmsData.fasilitas.slice(0, 4)
            : (currentAcc.highlights && currentAcc.highlights.length > 0 ? currentAcc.highlights.slice(0, 4) : []);

          return (
            <div
              key={currentAcc.id}
              className="bg-white rounded-[24px] sm:rounded-[26px] overflow-hidden border border-neutral-200/90 shadow-sm transition-all hover:shadow-md flex flex-col"
            >
              {/* ================= 1. FOTO FULL-WIDTH LANDSCAPE DENGAN SLIDER OTOMATIS & SWIPE ================= */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-neutral-900">
                <PhotoSlider
                  images={cmsData?.galeri || currentAcc.gallery || [cmsData?.foto_utama || currentAcc.image]}
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
                      ({cmsData?.reviews_count || currentAcc.reviewsCount} {t.reviewsCount})
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
                        ? t.sundakConceptTitle
                        : t.trenggoleConceptTitle}
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
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-[11px] font-semibold"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Tombol Aksi Tunggal: Lihat Detail & Pesan */}
                <div className="pt-2.5 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => handleSelectPropertyDetail(currentAcc)}
                    className="w-full h-11 px-5 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-emerald-300" />
                    <span>{language === 'en' ? 'View Details & Book' : 'Lihat Detail & Pesan'}</span>
                    <ArrowRight className="w-4 h-4 text-white ml-auto" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Layanan Tambahan Banner */}
        <div className="p-4 rounded-[24px] bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/90 text-xs space-y-2">
          <div className="text-emerald-950 font-bold">
            <span>{t.additionalServicesTitle}:</span>
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
                <li>{t.extraFoodInfo}</li>
                <li>{t.extraJeepInfo}</li>
                <li>{t.extraPropertyInfo}</li>
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
