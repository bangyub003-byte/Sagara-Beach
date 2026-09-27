import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { Smartphone, Monitor, Palmtree } from 'lucide-react';

export const HeaderRoleBar: React.FC = () => {
  const {
    setCurrentView,
    mobileFrameMode,
    setMobileFrameMode,
    language,
    setLanguage,
    t,
  } = useBooking();

  return (
    <header className="bg-white/95 border-b border-neutral-200/80 text-neutral-800 text-xs px-4 py-2 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md shadow-xs">
      {/* Brand & Home Quick Link */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 font-bold text-neutral-900 hover:text-emerald-700 transition-colors"
          title="Sagara Beach Stay"
        >
          <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-xs">
            <Palmtree className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <span className="font-bold tracking-tight text-[13px] text-neutral-900">
            {t.appName}
          </span>
        </button>
      </div>

      {/* Right Controls: Language Switcher (ID / EN) & Simulator Toggle (Desktop) */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher (Indonesia default / English) */}
        <div className="flex items-center bg-[#F0F2F5] p-0.5 rounded-lg border border-neutral-200/80">
          <button
            onClick={() => setLanguage('id')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              language === 'id'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Bahasa Indonesia (Default)"
          >
            ID
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              language === 'en'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="English"
          >
            EN
          </button>
        </div>

        {/* Mobile Frame Simulator Toggle (Desktop Only) */}
        <div className="hidden lg:flex items-center text-[11px] text-neutral-500">
          <button
            onClick={() => setMobileFrameMode(!mobileFrameMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border border-neutral-200 transition-colors ${
              mobileFrameMode ? 'bg-neutral-100 text-neutral-900 font-semibold' : 'hover:bg-neutral-50 text-neutral-500'
            }`}
            title="Toggle Bingkai Simulator Mobile"
          >
            {mobileFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>{t.toggleFullView}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.togglePhoneFrame}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
