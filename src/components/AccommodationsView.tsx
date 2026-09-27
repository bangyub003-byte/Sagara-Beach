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
  Maximize2,
  CheckCircle2,
  Palmtree,
  Sparkles,
  Wind,
  Flame,
  Tv,
  Refrigerator,
  UtensilsCrossed,
  Wifi,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';

export const AccommodationsView: React.FC = () => {
  const {
    accommodations,
    selectedProperty,
    setSelectedProperty,
    setSelectedRoomType,
    setCurrentView,
    language,
    t,
  } = useBooking();

  const [selectedAccId, setSelectedAccId] = useState<string>(
    selectedProperty?.id || 'all'
  );

  const displayedAccommodations =
    selectedAccId === 'all'
      ? accommodations
      : accommodations.filter((a) => a.id === selectedAccId);

  const handleSelectRoom = (prop: Property, room: RoomType) => {
    setSelectedProperty(prop);
    setSelectedRoomType(room);
    setCurrentView('detail');
  };

  const handleDirectReserve = (prop: Property, room: RoomType) => {
    setSelectedProperty(prop);
    setSelectedRoomType(room);
    setCurrentView('booking_flow');
  };

  // Facility icon helper
  const getFacilityIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('ac') || lower.includes('kamar tidur')) return <Wind className="w-3.5 h-3.5 text-sky-600" />;
    if (lower.includes('mandi') || lower.includes('bath') || lower.includes('closed')) return <Bath className="w-3.5 h-3.5 text-blue-600" />;
    if (lower.includes('kulkas') || lower.includes('fridge')) return <Refrigerator className="w-3.5 h-3.5 text-emerald-600" />;
    if (lower.includes('tv')) return <Tv className="w-3.5 h-3.5 text-amber-600" />;
    if (lower.includes('dapur') || lower.includes('kitchen') || lower.includes('gas') || lower.includes('masak')) return <Flame className="w-3.5 h-3.5 text-orange-600" />;
    if (lower.includes('makan') || lower.includes('dining')) return <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />;
    if (lower.includes('extra bed') || lower.includes('bed') || lower.includes('tidur')) return <Bed className="w-3.5 h-3.5 text-indigo-600" />;
    if (lower.includes('wifi')) return <Wifi className="w-3.5 h-3.5 text-emerald-600" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
  };

  return (
    <div className="min-h-[100dvh] bg-[#ECEEF2] text-[#12151B] flex flex-col justify-between select-none pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#ECEEF2]/95 backdrop-blur-md px-5 py-3.5 border-b border-neutral-300/70">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              <Palmtree className="w-3.5 h-3.5 text-emerald-600" />
              <span>Griya Barokah Homestay</span>
            </div>
            <h1 className="text-lg font-black text-neutral-900 tracking-tight mt-0.5">
              Pilihan Penginapan Homestay
            </h1>
          </div>

          <span className="px-3 py-1 rounded-full bg-white text-xs font-bold text-neutral-800 shadow-xs border border-neutral-200">
            {accommodations.length} Lokasi
          </span>
        </div>

        {/* Accommodation Switcher Tabs (Semua Lokasi, Sundak, Trenggole) */}
        <div className="flex gap-1.5 mt-3 p-1 bg-neutral-200/80 rounded-2xl">
          <button
            onClick={() => setSelectedAccId('all')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center truncate cursor-pointer ${
              selectedAccId === 'all'
                ? 'bg-white text-neutral-900 shadow-xs ring-1 ring-black/5'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Semua Lokasi</span>
          </button>
          {accommodations.map((acc) => {
            const isSelected = acc.id === selectedAccId;
            return (
              <button
                key={acc.id}
                onClick={() => {
                  setSelectedAccId(acc.id);
                  setSelectedProperty(acc);
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center truncate cursor-pointer ${
                  isSelected
                    ? 'bg-white text-neutral-900 shadow-xs ring-1 ring-black/5'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>{acc.name.replace('Griya Barokah ', '')}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-4 space-y-6 flex-grow">
        {displayedAccommodations.map((currentAcc) => (
          <div key={currentAcc.id} className="space-y-4">
            {/* Featured Homestay Banner Card */}
            <div className="relative rounded-[28px] overflow-hidden bg-white shadow-xs border border-neutral-200/90">
              <div className="relative h-52 sm:h-60 w-full">
                <SafeImage
                  src={currentAcc.image}
                  alt={currentAcc.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                {/* Badges */}
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                    {currentAcc.badge || 'Keluarga'}
                  </span>
                </div>

                <div className="absolute top-3.5 right-3.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-amber-300">
                  <span>★</span>
                  <span>{currentAcc.rating}</span>
                  <span className="text-[10px] text-white/80">({currentAcc.reviewsCount} Ulasan)</span>
                </div>

                {/* Homestay Title & Location */}
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <div className="flex items-center gap-1 text-xs text-emerald-300 font-semibold mb-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{currentAcc.location}</span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-white leading-tight">
                    {currentAcc.name}
                  </h2>
                </div>
              </div>

              {/* Deskripsi & Fasilitas Lengkap */}
              <div className="p-4 space-y-3.5">
                {currentAcc.id === 'homestay-sundak' && (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-medium">
                    🏡 <strong>PENTING:</strong> Pantai Sundak adalah <strong>SATU RUMAH HOMESTAY</strong> (bukan sistem kamar hotel terpisah). Pengunjung menyewa rumah keluarga dengan pilihan Sewa 2 Kamar atau Sewa 4 Kamar (Rumah Penuh).
                  </div>
                )}
                {currentAcc.id === 'homestay-trenggole' && (
                  <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-950 font-medium">
                    🌊 <strong>TIPE INDIVIDUAL ROOM:</strong> Pilihan 4 kamar tidur AC langsung dekat pantai. Semua kamar view pantai, memiliki 2 bed ±130x200 cm (kapasitas 4 orang), dan bisa tambah extra bed.
                  </div>
                )}

                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  {language === 'id' ? currentAcc.description : currentAcc.descriptionEn}
                </p>

                {/* Grid Fasilitas Asli */}
                <div>
                  <span className="text-[11px] uppercase font-bold text-neutral-500 tracking-wider block mb-2">
                    Fasilitas Lengkap Penginapan:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#F6F7F9] p-3 rounded-2xl border border-neutral-200/70">
                    {currentAcc.highlights.map((facility, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-[11px] text-neutral-700 font-medium">
                        {getFacilityIcon(facility)}
                        <span className="truncate">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Room Types / Pilihan Kamar Section */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-600">
                    {currentAcc.id === 'homestay-sundak' ? 'Pilihan Paket Rumah Sundak' : 'Pilihan Kamar Trenggole'} ({currentAcc.roomTypes.length})
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    {currentAcc.id === 'homestay-sundak' ? 'Pilih paket sewa 2 kamar atau sewa 4 kamar penuh' : 'Pilih kamar ber-AC sesuai kapasitas keluarga'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {currentAcc.roomTypes.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-[24px] p-4 shadow-xs border border-neutral-200/90 space-y-3 transition-all hover:border-neutral-300"
                  >
                    <div className="flex gap-3.5">
                      <SafeImage
                        src={room.image}
                        alt={room.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0"
                        containerClassName="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shrink-0 overflow-hidden"
                      />

                      <div className="min-w-0 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-extrabold text-sm text-neutral-900 leading-snug">
                              {language === 'id' ? room.name : room.nameEn || room.name}
                            </h4>
                          </div>

                          <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-snug">
                            {language === 'id' ? room.description : room.descriptionEn || room.description}
                          </p>

                          {/* Info Bed Spesifik */}
                          {room.bedInfo && (
                            <div className="mt-1.5 text-[10px] text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70 inline-block">
                              🛏️ {room.bedInfo}
                            </div>
                          )}
                        </div>

                        {/* Room Amenities specs */}
                        <div className="flex items-center gap-3 text-[11px] text-neutral-600 mt-2">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{room.capacityGuests} Tamu</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{room.bedsCount} Bed</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{room.bathsCount} KM</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1">
                      {room.features.map((feat, fidx) => (
                        <span
                          key={fidx}
                          className="px-2 py-0.5 rounded-md bg-[#F4F5F7] border border-neutral-200/60 text-[10px] font-medium text-neutral-700"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>

                    {/* Price, Availability and CTA row */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {room.isAvailable ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              ✓ {t.detailAvailable}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                              {t.detailUnavailable}
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-sm font-black text-emerald-800">
                            Rp {room.pricePerNight.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {room.id === 'sundak-2-kamar' ? '/malam (total 2 kamar)' : `/${t.perNight}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectRoom(currentAcc, room)}
                          className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleDirectReserve(currentAcc, room)}
                          disabled={!room.isAvailable}
                          className="px-3.5 py-1.5 rounded-full bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all disabled:opacity-40 shadow-xs cursor-pointer"
                        >
                          <span>Pilih &amp; Pesan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Banner Layanan Tambahan */}
        <div className="p-4 rounded-[26px] bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/90 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Layanan tambahan tersedia:</span>
          </div>
          <ul className="text-neutral-700 text-xs space-y-0.5 list-disc list-inside font-medium pl-1">
            <li>Pesanan makanan & hidangan pantai</li>
            <li>Sewa Jeep wisata jelajah pantai & tebing</li>
            <li>Informasi jual beli tanah / rumah kawasan pantai</li>
          </ul>
          <div className="pt-1 flex items-center justify-between text-xs border-t border-emerald-200/60">
            <span className="text-neutral-600 font-medium">
              Hubungi WhatsApp: <strong className="text-neutral-900">082138613xxx</strong>
            </span>
            <a
              href="https://wa.me/6282138613888"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-full bg-emerald-800 text-white font-bold text-[11px] hover:bg-emerald-900 transition-colors shadow-2xs"
            >
              Chat WhatsApp
            </a>
          </div>
        </div>
      </main>

      {/* Floating Bottom Navigation Bar: Beranda, Homestay, Pesanan, Profil */}
      <CustomerBottomNav />
    </div>
  );
};
