import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { RoomType } from '../types';
import { SafeImage } from './common/SafeImage';
import { PhotoSlider } from './common/PhotoSlider';
import {
  ChevronLeft,
  Share2,
  Heart,
  Star,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ArrowRight,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const PropertyDetailPage: React.FC = () => {
  const {
    selectedProperty,
    selectedRoomType,
    setSelectedRoomType,
    setCurrentView,
    toggleFavorite,
    isFavorite,
    language,
    t,
    cmsHomestays,
    cmsRooms,
    setIsLocationPreselected,
  } = useBooking();

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showFullDesc, setShowFullDesc] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);
  const [roomErrorNotice, setRoomErrorNotice] = useState<string>('');

  const prop = selectedProperty;
  const cmsProp = cmsHomestays?.find((h) => h.id === prop.id) || cmsHomestays?.[0];

  const galleryImages =
    cmsProp?.galeri && cmsProp.galeri.length > 0
      ? cmsProp.galeri
      : prop.gallery && prop.gallery.length > 0
      ? prop.gallery
      : [cmsProp?.foto_utama || prop.image];

  const currentMainImage = galleryImages[activeImageIndex] || cmsProp?.foto_utama || prop.image;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: prop.name,
        text: `Nikmati liburan mewah di ${prop.name} - Sagara Beach Stay`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const handleProceedToBooking = () => {
    if (!selectedRoomType) {
      setRoomErrorNotice(t.selectRoomFirstNotice);
      return;
    }
    if (!selectedRoomType.isAvailable) {
      setRoomErrorNotice('Tipe kamar ini sedang tidak tersedia / penuh.');
      return;
    }
    setRoomErrorNotice('');
    setIsLocationPreselected(true);
    setCurrentView('booking_flow');
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-28">
      {/* Konten Detail */}
      <div>
        {/* Container Galeri Foto dengan Slider Otomatis & Swipe */}
        <div className="relative w-full h-[48vh] sm:h-[52vh] overflow-hidden bg-neutral-200">
          <PhotoSlider
            images={galleryImages}
            alt={cmsProp?.nama || prop.name}
            fallbackText={cmsProp?.nama || prop.name}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />

          {/* Vignette Gradasi */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

          {/* Tombol Aksi Atas (Back, Share, Heart) */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('home')}
              className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-xs flex items-center justify-center text-neutral-900 active:scale-95 transition-transform"
              aria-label="Kembali"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-xs flex items-center justify-center text-neutral-900 active:scale-95 transition-transform"
                aria-label="Bagikan"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleFavorite(prop.id)}
                className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-xs flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Favorit"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFavorite(prop.id) ? 'fill-[#EF4444] text-[#EF4444]' : 'text-neutral-900'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Badge Rating & Kategori di Kiri Bawah Foto */}
          <div className="absolute bottom-4 left-5 z-20 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white">
              <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
              <span>{cmsProp?.rating || prop.rating}</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-white">
              {cmsProp?.badge || prop.category}
            </div>
          </div>

          {/* Indikator Galeri */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 right-5 z-20 flex items-center gap-1.5">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImageIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'
                  }`}
                  aria-label={`Foto ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Share Toast */}
        {shareToast && (
          <div className="mx-5 my-2 p-2.5 bg-neutral-900 text-white rounded-2xl text-xs text-center">
            Tautan berhasil disalin ke papan klip!
          </div>
        )}

        {/* Seksi Detail Utama */}
        <div className="px-5 pt-4 space-y-4">
          {/* Judul & Lokasi */}
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight text-neutral-900 leading-tight">
              {prop.name}
            </h1>
            <div className="flex items-center gap-1.5 text-neutral-500 text-[13px] mt-1">
              <MapPin className="w-4 h-4 text-neutral-500" />
              <span>{prop.location}</span>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2">
            <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              {t.detailAbout}
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              {showFullDesc
                ? language === 'id' ? prop.description : prop.descriptionEn
                : `${(language === 'id' ? prop.description : prop.descriptionEn).slice(0, 160)}...`}
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-[#13281E] font-bold ml-1.5 hover:underline"
              >
                {showFullDesc ? t.readLess : t.readMore}
              </button>
            </p>
          </div>

          {/* Keistimewaan Resor */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2.5">
            <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              {t.detailPrivileges}
            </h2>
            <div className="space-y-2">
              {(language === 'id' ? prop.highlights : prop.highlightsEn).map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-neutral-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1DB954] shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================================================
              SEKSI PILIHAN TIPE KAMAR (ROOM TYPES) SESUAI POIN 3:
              Akomodasi → Tipe Kamar → Booking
             ========================================================================= */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-extrabold text-neutral-900 tracking-tight">
                  {t.detailChooseRoom}
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Pilih tipe kamar yang sesuai dengan rencana liburan Anda
                </p>
              </div>
              <span className="text-xs font-bold text-neutral-400">
                {prop.roomTypes.length} Pilihan
              </span>
            </div>

            {roomErrorNotice && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{roomErrorNotice}</span>
              </div>
            )}

            {/* List Tipe Kamar Cards (Modern Mobile-First Hotel Cards) */}
            <div className="space-y-3.5">
              {prop.roomTypes.map((room: RoomType) => {
                const isSelected = selectedRoomType?.id === room.id;
                const cmsRoom = cmsRooms?.find((cr) => cr.id === room.id);
                const roomImage = cmsRoom?.foto_utama || cmsRoom?.foto || room.image;

                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      setSelectedRoomType(room);
                      setRoomErrorNotice('');
                    }}
                    className={`bg-white rounded-[24px] border overflow-hidden transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-800 shadow-md ring-2 ring-emerald-800/15'
                        : 'border-neutral-200/90 shadow-2xs hover:border-neutral-300'
                    }`}
                  >
                    {/* Foto Kamar Landscape dengan Slider Otomatis & Swipe */}
                    <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-neutral-900">
                      <PhotoSlider
                        images={
                          cmsRoom?.galeri && cmsRoom.galeri.length > 0
                            ? cmsRoom.galeri
                            : Array.isArray(room.gallery) && room.gallery.length > 0
                            ? room.gallery
                            : [roomImage]
                        }
                        alt={cmsRoom?.nama_kamar || room.name}
                        fallbackText={cmsRoom?.nama_kamar || room.name}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                      {/* Badges Atas Foto */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                          <Bed className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{room.name}</span>
                        </span>

                        {isSelected && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-sm">
                            ✓ Terpilih
                          </span>
                        )}
                      </div>

                      {/* Harga di Kanan Bawah Foto */}
                      <div className="absolute bottom-3 right-3 z-10 text-right">
                        <span className="text-base sm:text-lg font-black text-white drop-shadow-sm block leading-tight">
                          {prop.id === 'homestay-sundak'
                            ? 'Rp 75.000'
                            : `Rp ${room.pricePerNight.toLocaleString('id-ID')}`}
                        </span>
                        <span className="text-[10px] text-white/80 font-medium">
                          {prop.id === 'homestay-sundak' ? '/orang/malam' : `/${t.perNight}`}
                        </span>
                      </div>

                      {/* Kapasitas di Kiri Bawah Foto */}
                      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-white/90 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{room.capacityGuests} Tamu</span>
                      </div>
                    </div>

                    {/* Informasi Kamar Bawah Foto */}
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black text-neutral-900 leading-snug">
                          {language === 'id' ? room.name : room.nameEn}
                        </h3>
                        {room.bedInfo && (
                          <span className="text-[10px] text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                            {room.bedInfo}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed font-normal line-clamp-2">
                        {language === 'id' ? room.description : room.descriptionEn}
                      </p>

                      {/* Specs Row */}
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-600 pt-1 border-t border-neutral-100">
                        <div className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{room.bedsCount} Bed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-blue-600" />
                          <span>{room.bathsCount} KM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{room.areaSqft} sqft</span>
                        </div>
                        <div className="ml-auto">
                          {room.isAvailable ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ {t.detailAvailable}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              {t.detailUnavailable}
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

          {/* Banner Layanan Tambahan */}
          <div className="p-4 rounded-[26px] bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/90 text-xs space-y-2">
            <div className="text-emerald-950 font-bold">
              <span>Layanan tambahan tersedia:</span>
            </div>
            <ul className="text-neutral-700 text-xs space-y-0.5 list-disc list-inside font-medium pl-1">
              <li>Pesanan makanan</li>
              <li>Sewa Jeep wisata</li>
              <li>Informasi jual beli tanah/rumah</li>
            </ul>
            <div className="pt-1 flex items-center justify-between text-xs border-t border-emerald-200/60">
              <span className="text-neutral-600 font-medium">
                Hubungi WhatsApp: <strong className="text-neutral-900">082138613xxx</strong>
              </span>
              <a
                href="https://wa.me/6282138613888"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full bg-emerald-800 text-white font-bold text-[11px] hover:bg-emerald-900 transition-colors shadow-2xs"
              >
                Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action: Lanjut Reservasi Kamar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 max-w-md mx-auto shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
            {selectedRoomType ? (language === 'id' ? selectedRoomType.name : selectedRoomType.nameEn) : 'Pilih Kamar'}
          </span>
          <span className="text-[17px] font-black text-neutral-900">
            {selectedRoomType
              ? `Rp ${selectedRoomType.pricePerNight.toLocaleString('id-ID')}`
              : '-'}
            <span className="text-xs text-neutral-400 font-normal"> /{t.perNight}</span>
          </span>
        </div>

        <button
          onClick={handleProceedToBooking}
          className="h-12 px-6 rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-bold text-[14px] flex items-center gap-2 shadow-md shadow-[#13281E]/20 transition-all cursor-pointer"
        >
          <span>{t.detailReserveBtn}</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
