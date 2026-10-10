import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { RoomType } from '../types';
import { SafeImage } from './common/SafeImage';
import { PhotoSlider } from './common/PhotoSlider';
import { GalleryLightboxModal } from './common/GalleryLightboxModal';
import {
  ChevronLeft,
  ChevronRight,
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
  Images,
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
    setBookingStartStep,
    getWebsiteSetting,
    adminWhatsappNumber,
  } = useBooking();

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showFullDesc, setShowFullDesc] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);
  const [roomErrorNotice, setRoomErrorNotice] = useState<string>('');
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    images: [],
    initialIndex: 0,
    title: '',
    subtitle: '',
  });

  const openLightbox = (
    images: string[],
    initialIndex = 0,
    title = 'Galeri Foto',
    subtitle?: string
  ) => {
    setLightboxState({
      isOpen: true,
      images,
      initialIndex,
      title,
      subtitle,
    });
  };

  const closeLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  const prop = selectedProperty;
  const cmsProp = cmsHomestays?.find((h) => h.id === prop.id) || cmsHomestays?.[0];

  const galleryImages =
    cmsProp?.galeri && cmsProp.galeri.length > 0
      ? cmsProp.galeri
      : prop.gallery && prop.gallery.length > 0
      ? prop.gallery
      : [cmsProp?.foto_utama || prop.image];

  const currentMainImage = galleryImages[activeImageIndex] || cmsProp?.foto_utama || prop.image;

  const rawAdminWhatsapp = getWebsiteSetting
    ? getWebsiteSetting('admin_whatsapp', adminWhatsappNumber || '082138613888')
    : adminWhatsappNumber || '082138613888';
  const cleanWaDigits = rawAdminWhatsapp.replace(/\D/g, '');
  const waLinkDigits = cleanWaDigits.startsWith('0') ? `62${cleanWaDigits.slice(1)}` : cleanWaDigits;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: prop.name,
        text: language === 'en'
          ? `Enjoy your stay at ${prop.name} - Griya Barokah Homestay`
          : `Nikmati liburan menyenangkan di ${prop.name} - Griya Barokah Homestay`,
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
      setRoomErrorNotice(language === 'en' ? 'This room type is currently full or unavailable.' : 'Tipe kamar ini sedang tidak tersedia / penuh.');
      return;
    }
    setRoomErrorNotice('');
    setIsLocationPreselected(true);
    setBookingStartStep(2);
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

        {/* Tombol Akses Galeri Lengkap Penginapan Tepat di Bawah Header/Slider */}
        <div className="px-5 pt-3">
          <button
            type="button"
            onClick={() =>
              openLightbox(
                galleryImages,
                activeImageIndex,
                cmsProp?.nama || prop.name,
                language === 'en' ? 'Accommodation Full Gallery' : 'Galeri Lengkap Penginapan'
              )
            }
            className="w-full py-2.5 px-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:bg-neutral-50 active:scale-[0.99] text-xs font-bold text-neutral-800 flex items-center justify-between transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Images className="w-3.5 h-3.5" />
              </div>
              <span>
                {language === 'en'
                  ? `View All Photos (${galleryImages.length})`
                  : `Lihat Semua Foto (${galleryImages.length})`}
              </span>
            </span>
            <span className="text-[11px] text-neutral-500 font-semibold flex items-center gap-1 group-hover:text-emerald-700 transition-colors">
              <span>{language === 'en' ? 'Open Gallery' : 'Buka Galeri'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        {/* Share Toast */}
        {shareToast && (
          <div className="mx-5 my-2 p-2.5 bg-neutral-900 text-white rounded-2xl text-xs text-center">
            {t.copyLinkSuccess}
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
                  {t.chooseRoomSub}
                </p>
              </div>
              <span className="text-xs font-bold text-neutral-400">
                {prop.roomTypes.length} {t.optionsCount}
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
                const roomDisplayName = language === 'id' ? room.name : room.nameEn;
                const roomGallery =
                  cmsRoom?.galeri && cmsRoom.galeri.length > 0
                    ? cmsRoom.galeri
                    : Array.isArray(room.gallery) && room.gallery.length > 0
                    ? room.gallery
                    : [roomImage];

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
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoomType(room);
                        setRoomErrorNotice('');
                        openLightbox(
                          roomGallery,
                          0,
                          cmsRoom?.nama_kamar || roomDisplayName,
                          language === 'en' ? 'Room Photo Gallery' : 'Galeri Foto Kamar'
                        );
                      }}
                      className="relative h-44 sm:h-48 w-full overflow-hidden bg-neutral-900 group cursor-pointer"
                      title={language === 'en' ? 'Click photo to open room gallery' : 'Klik foto untuk melihat semua foto kamar ini'}
                    >
                      <PhotoSlider
                        images={roomGallery}
                        alt={cmsRoom?.nama_kamar || roomDisplayName}
                        fallbackText={cmsRoom?.nama_kamar || roomDisplayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                      {/* Badges Atas Foto */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                          <Bed className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{roomDisplayName}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Indikator Jumlah Foto Kamar jika > 1 */}
                          {roomGallery.length > 1 && (
                            <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/20 shadow-sm pointer-events-auto">
                              <Images className="w-3 h-3 text-emerald-400" />
                              <span>1/{roomGallery.length}</span>
                            </span>
                          )}

                          {isSelected && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-sm">
                              {t.roomSelectedBadge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Harga di Kanan Bawah Foto */}
                      <div className="absolute bottom-3 right-3 z-10 text-right">
                        <span className="text-base sm:text-lg font-black text-white drop-shadow-sm block leading-tight">
                          {prop.id === 'homestay-sundak'
                            ? 'Rp 75.000'
                            : `Rp ${room.pricePerNight.toLocaleString('id-ID')}`}
                        </span>
                        <span className="text-[10px] text-white/80 font-medium">
                          {prop.id === 'homestay-sundak' ? t.perPersonNight : `/${t.perNight}`}
                        </span>
                      </div>

                      {/* Kapasitas di Kiri Bawah Foto */}
                      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-white/90 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{room.capacityGuests} {t.detailGuests}</span>
                      </div>
                    </div>

                    {/* Informasi Kamar Bawah Foto */}
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black text-neutral-900 leading-snug">
                          {roomDisplayName}
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
                          <span>{room.bedsCount} {t.bedsUnit}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-blue-600" />
                          <span>{room.bathsCount} {t.bathsUnit}</span>
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
              <span>{t.additionalServicesTitle}:</span>
            </div>
            <ul className="text-neutral-700 text-xs space-y-0.5 list-disc list-inside font-medium pl-1">
              <li>{t.serviceFoodTitle}</li>
              <li>{t.serviceJeepTitle}</li>
              <li>{t.servicePropertyTitle}</li>
            </ul>
            <div className="pt-1 flex items-center justify-between text-xs border-t border-emerald-200/60">
              <span className="text-neutral-600 font-medium">
                {t.contactWaLabel} <strong className="text-neutral-900">{rawAdminWhatsapp}</strong>
              </span>
              <a
                href={`https://wa.me/${waLinkDigits}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full bg-emerald-800 text-white font-bold text-[11px] hover:bg-emerald-900 transition-colors shadow-2xs"
              >
                {t.chatWhatsapp}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action: Lanjut Reservasi Kamar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 max-w-md mx-auto shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
            {selectedRoomType ? (language === 'id' ? selectedRoomType.name : selectedRoomType.nameEn) : t.selectRoomBtn}
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

      {/* Modal Lightbox & Galeri Lengkap (Penginapan & Kamar) */}
      <GalleryLightboxModal
        isOpen={lightboxState.isOpen}
        onClose={closeLightbox}
        images={lightboxState.images}
        initialIndex={lightboxState.initialIndex}
        title={lightboxState.title}
        subtitle={lightboxState.subtitle}
      />
    </div>
  );
};
