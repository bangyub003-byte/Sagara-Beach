import React from 'react';
import { useBooking } from '../context/BookingContext';
import { SafeImage } from './common/SafeImage';
import { ChevronLeft, Heart, ArrowRight } from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const { accommodations, favorites, toggleFavorite, setCurrentView, setSelectedProperty, setSelectedRoomType, language, t } = useBooking();

  const savedProps = accommodations.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-[100dvh] bg-[#ECEEF2] text-[#12151B] flex flex-col justify-between select-none pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#ECEEF2]/95 backdrop-blur-md px-5 py-3 border-b border-neutral-300/70 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('home')}
          className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-800 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <h1 className="text-base font-bold text-neutral-900 tracking-tight">
          {language === 'id' ? 'Homestay Favorit' : 'Favorite Homestays'}
        </h1>

        <div className="w-10 h-10" />
      </header>

      {/* Content */}
      <div className="px-5 py-4 space-y-4 flex-grow">
        {savedProps.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white shadow-xs text-neutral-500 text-xs">
            {language === 'id'
              ? 'Belum ada homestay favorit tersimpan. Tekan ikon hati pada homestay untuk menyimpan!'
              : 'No saved homestays yet. Tap the heart icon on any accommodation to save for later!'}
          </div>
        ) : (
          savedProps.map((prop) => (
            <div
              key={prop.id}
              onClick={() => {
                setSelectedProperty(prop);
                setSelectedRoomType(prop.roomTypes[0] || null);
                setCurrentView('detail');
              }}
              className="bg-[#1C2028] text-white rounded-[28px] p-3.5 shadow-xl border border-neutral-800/80 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="relative w-full h-48 rounded-[20px] overflow-hidden">
                <SafeImage
                  src={prop.image}
                  alt={prop.name}
                  fallbackText={prop.name}
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(prop.id);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-rose-500"
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </button>
              </div>

              <div className="px-2 pt-3 pb-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-base text-white">{prop.name}</h3>
                  <span className="font-bold text-sm text-neutral-200">
                    {prop.roomTypes.length} {t.roomTypesAvailable}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">{prop.location}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
