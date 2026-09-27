import React from 'react';
import { useBooking } from '../context/BookingContext';
import { ArrowRight, Home, Wifi, Battery, Signal } from 'lucide-react';
import { SafeImage } from './common/SafeImage';

export const LandingPage: React.FC = () => {
  const { setCurrentView, t } = useBooking();

  return (
    <div className="relative w-full h-full min-h-[100dvh] sm:min-h-[850px] bg-[#FBFBFC] text-[#0F141A] flex flex-col justify-between overflow-hidden select-none">
      {/* Top Mobile Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-3 pb-1 text-neutral-900 font-semibold text-xs tracking-tight pointer-events-none">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Top Brand Logo Lockup */}
      <div className="absolute top-9 sm:top-10 left-6 z-20 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#0F2E23]/90 backdrop-blur-md border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-sm">
          <Home className="w-5 h-5 text-emerald-300" />
        </div>
        <span className="font-bold text-lg tracking-tight text-neutral-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
          {t.appName}
        </span>
      </div>

      {/* Hero Image Section - Mobile Aspect Ratio with Complete Building View & Smooth Fade */}
      <div className="relative w-full h-[46dvh] sm:h-[420px] shrink-0 overflow-hidden">
        <SafeImage
          src="https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=85"
          alt="Griya Barokah Pantai Sundak & Trenggole"
          fallbackText="Griya Barokah Homestay"
          className="w-full h-full object-cover object-[center_30%]"
          containerClassName="w-full h-full"
        />

        {/* Soft Vignette at Top and Smooth Gradient Fade at Bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#FBFBFC] via-[#FBFBFC]/80 to-transparent pointer-events-none" />
      </div>

      {/* Content Section - Balanced Proportions & Tight Minimalist Spacing */}
      <div className="relative z-10 px-6 sm:px-7 pt-0 pb-4 sm:pb-6 flex flex-col justify-between flex-grow">
        {/* Headline & Description tightly integrated near the hero image */}
        <div className="space-y-2 sm:space-y-2.5">
          <h1 className="text-[28px] sm:text-[34px] font-extrabold leading-[1.14] tracking-tight text-[#0F1C15]">
            {t.landingTitle1}
            <br />
            {t.landingTitle2}
          </h1>

          <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#596560] max-w-[340px] font-normal">
            {t.landingDesc}
          </p>
        </div>

        {/* Main CTA Button: Visible without scrolling on all standard mobile screens */}
        <div className="pt-3 sm:pt-4">
          <button
            onClick={() => setCurrentView('home')}
            className="w-full h-[52px] sm:h-[56px] rounded-full bg-[#13281E] hover:bg-[#1A3428] active:scale-[0.98] text-white font-semibold text-[15px] sm:text-[16px] flex items-center justify-center gap-2.5 shadow-lg shadow-[#13281E]/25 transition-all duration-200 cursor-pointer"
          >
            <span>{t.getStarted}</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>

          {/* Bottom Home Indicator Bar */}
          <div className="w-32 h-1 bg-neutral-300/80 rounded-full mx-auto mt-3 sm:mt-4" />
        </div>
      </div>
    </div>
  );
};
