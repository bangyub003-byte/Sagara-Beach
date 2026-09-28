import React from 'react';
import { useBooking } from '../context/BookingContext';
import { CustomerBottomNav } from './common/CustomerBottomNav';
import {
  User,
  CalendarCheck,
  Globe,
  PhoneCall,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  HelpCircle,
  Palmtree,
  Lock,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    language,
    setLanguage,
    setCurrentView,
    navigateTo,
    bookings,
    t,
  } = useBooking();

  const userBookingsCount = bookings.length;

  const handleOpenStaffPortal = (path: '/admin' | '/receptionist') => {
    if (navigateTo) {
      navigateTo(path);
    } else if (path === '/admin') {
      setCurrentView('admin_login');
    } else {
      setCurrentView('receptionist_login');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#ECEEF2] text-[#12151B] flex flex-col justify-between select-none pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#ECEEF2]/95 backdrop-blur-md px-5 py-3.5 border-b border-neutral-300/70">
        <h1 className="text-lg font-bold text-neutral-900 tracking-tight">
          {t.navProfile}
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          {language === 'id' ? 'Preferensi & Layanan Tamu Griya Barokah' : 'Preferences & Griya Barokah Guest Services'}
        </p>
      </header>

      {/* Main Profile Content */}
      <main className="px-4 py-4 space-y-4 flex-grow">
        {/* Guest Identity Card */}
        <div className="bg-white rounded-[26px] p-5 shadow-xs border border-neutral-200/80 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            GB
          </div>

          <div className="min-w-0 flex-grow">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tamu Homestay
              </span>
            </div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight mt-1 truncate">
              {language === 'id' ? 'Keluarga Tamu Homestay' : 'Homestay Guest Family'}
            </h2>
            <p className="text-xs text-neutral-500 truncate">
              +62 812-3456-7890 • Gunungkidul, DIY
            </p>
          </div>
        </div>

        {/* Quick Menu Card */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-xs border border-neutral-200/80 divide-y divide-neutral-100">
          {/* My Bookings */}
          <button
            onClick={() => setCurrentView('my_bookings')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  {t.navBookings}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {userBookingsCount} {language === 'id' ? 'reservasi tersimpan' : 'saved reservations'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          {/* Language Preference */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  {language === 'id' ? 'Bahasa Aplikasi' : 'App Language'}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {language === 'id' ? 'Bahasa Indonesia' : 'English'}
                </span>
              </div>
            </div>

            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  language === 'id'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  language === 'en'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Homestay Services & Contact */}
        <div className="bg-white rounded-[24px] p-4 shadow-xs border border-neutral-200/80 space-y-3">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
            <Palmtree className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'id' ? 'Kontak & Bantuan Pengelola' : 'Homestay Management Contact'}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 text-neutral-700">
              <span className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Pengelola</span>
              </span>
              <span className="font-mono font-bold text-neutral-900">+62 812-3456-7890</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 text-neutral-700">
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>Check-in / Check-out</span>
              </span>
              <span className="font-semibold text-neutral-900">14:00 / 12:00 WIB</span>
            </div>
          </div>
        </div>

        {/* Akses Staf Pengelola & Resepsionis */}
        <div className="pt-4 border-t border-neutral-200/70 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block text-center">
            Akses Pengelola & Staf
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleOpenStaffPortal('/admin')}
              className="h-10 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Login Admin</span>
            </button>

            <button
              onClick={() => handleOpenStaffPortal('/receptionist')}
              className="h-10 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-sky-700" />
              <span>Login Resepsionis</span>
            </button>
          </div>
        </div>

        {/* Informasi Homestay Footer */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-neutral-400">
            Griya Barokah Homestay • Pantai Sundak & Trenggole
          </p>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            Versi 2.4.0 • Gunungkidul, DI Yogyakarta
          </p>
        </div>
      </main>

      {/* Standard Customer Bottom Navigation */}
      <CustomerBottomNav />
    </div>
  );
};
