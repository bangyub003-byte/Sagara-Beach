import React from 'react';
import { useBooking } from '../context/BookingContext';
import { ArrowRight } from 'lucide-react';
import { SafeImage } from './common/SafeImage';

export const LandingPage: React.FC = () => {
  const { setCurrentView, t, heroImage, homepageContent } = useBooking();

  return (
    <div className="relative w-full h-full min-h-[100dvh] sm:min-h-[850px] bg-[#FBFBFC] text-[#0F141A] flex flex-col justify-between overflow-hidden select-none">
      {/* Hero Image Section - Mobile Aspect Ratio with Complete Building View & Smooth Fade */}
      <div className="relative w-full h-[46dvh] sm:h-[420px] shrink-0 overflow-hidden">
        <SafeImage
          src={homepageContent?.hero_image || heroImage || '/images/sundak_fullhouse_1790552054893.jpg'}
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
          <h1 className="text-[26px] sm:text-[32px] font-extrabold leading-[1.14] tracking-tight text-[#0F1C15]">
            {homepageContent?.hero_title || (
              <>
                {t.landingTitle1}
                <br />
                {t.landingTitle2}
              </>
            )}
          </h1>

          <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#596560] max-w-[340px] font-normal">
            {homepageContent?.hero_description || t.landingDesc}
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
