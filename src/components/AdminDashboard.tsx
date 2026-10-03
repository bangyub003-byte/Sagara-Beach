import React, { useState, useMemo, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  Home,
  LogOut,
  CheckCircle2,
  X,
  LayoutDashboard,
  CheckSquare,
  Building,
  Bed,
  Sparkles,
  Image as ImageIcon,
  Settings,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { AdminOverviewTab } from './admin/tabs/AdminOverviewTab';
import { AdminHomepageTab } from './admin/tabs/AdminHomepageTab';
import { AdminAccommodationsTab } from './admin/tabs/AdminAccommodationsTab';
import { AdminRoomsTab } from './admin/tabs/AdminRoomsTab';
import { AdminMediaTab } from './admin/tabs/AdminMediaTab';
import { AdminSettingsTab } from './admin/tabs/AdminSettingsTab';
import { AdminBookingsTab } from './admin/tabs/AdminBookingsTab';

type AdminTab =
  | 'dashboard'
  | 'homepage'
  | 'penginapan'
  | 'kamar'
  | 'media'
  | 'pengaturan'
  | 'booking';

export const AdminDashboard: React.FC = () => {
  const {
    bookings,
    logoutStaff,
    setRole,
    setCurrentView,
    navigateTo,
    getWebsiteSetting,
  } = useBooking();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(false);

  // Pengecekan real-time status koneksi Supabase untuk keperluan diagnosis
  useEffect(() => {
    let isMounted = true;

    const checkSupabaseHealth = async () => {
      if (!isSupabaseConfigured) {
        if (isMounted) setIsSupabaseOnline(false);
        return;
      }

      try {
        const { error } = await supabase.from('website_settings').select('id').limit(1);
        if (isMounted) {
          setIsSupabaseOnline(!error);
        }
      } catch {
        if (isMounted) setIsSupabaseOnline(false);
      }
    };

    checkSupabaseHealth();
    // Poll berkala setiap 20 detik
    const interval = setInterval(checkSupabaseHealth, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Jumlah booking yang butuh verifikasi
  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === 'pending_verification').length,
    [bookings]
  );

  const brandName = getWebsiteSetting('brand_name', 'Griya Barokah Homestay');

  // Definisi Menu Admin Sederhana & Rapi (Sesuai Permintaan)
  const navItems: { id: AdminTab; label: string; icon: React.FC<any>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'booking', label: 'Booking', icon: CheckSquare, badge: pendingCount },
    { id: 'penginapan', label: 'Penginapan', icon: Building },
    { id: 'kamar', label: 'Kamar', icon: Bed },
    { id: 'homepage', label: 'Homepage', icon: Sparkles },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-20 max-w-md mx-auto">
      {/* Header Admin Mobile-Friendly */}
      <header className="px-3.5 sm:px-4 py-2.5 flex items-center justify-between border-b border-neutral-200/60 bg-white sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              setRole('customer');
              setCurrentView('home');
            }}
            className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 flex items-center justify-center text-neutral-700 active:scale-95 transition-transform cursor-pointer shrink-0"
            title="Lihat Beranda Tamu"
          >
            <Eye className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-black text-neutral-900 leading-tight truncate">
                Admin CMS
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
            <p className="text-[10px] text-neutral-400 truncate">
              {brandName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Badge Diagnosis Koneksi Supabase Real-Time */}
          {isSupabaseOnline ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] sm:text-[10px] font-semibold tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              Database: Supabase (Online)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-600 text-[9px] sm:text-[10px] font-semibold tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              Database: Mode Lokal (Supabase Tidak Terhubung)
            </span>
          )}

          <button
            onClick={() => {
              logoutStaff();
              if (navigateTo) navigateTo('/');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold hover:bg-rose-100 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Keluar Sesi Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[10px]">Logout</span>
          </button>
        </div>
      </header>

      {/* Menu Navigasi Horizontal Scrollable (Mobile Friendly, Card Sederhana & Rapi) */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-[#13281E] text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-neutral-200/90 hover:bg-neutral-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      isActive ? 'bg-amber-400 text-neutral-900' : 'bg-amber-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Notifikasi Sukses */}
      {toastMessage && (
        <div className="mx-3.5 my-1.5 p-2.5 rounded-xl bg-[#EBF8F2] border border-[#C6ECD8] text-[#13281E] text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="cursor-pointer">
            <X className="w-3.5 h-3.5 text-neutral-600" />
          </button>
        </div>
      )}

      {/* Konten Tab Aktif */}
      <main className="px-3 sm:px-4 pt-1 pb-4 flex-grow">
        {/* 1. Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <AdminOverviewTab onNavigateTab={(tab) => setActiveTab(tab as AdminTab)} />
        )}

        {/* 2. Homepage Tab */}
        {activeTab === 'homepage' && <AdminHomepageTab onShowToast={showToast} />}

        {/* 3. Penginapan Tab */}
        {activeTab === 'penginapan' && <AdminAccommodationsTab onShowToast={showToast} />}

        {/* 4. Kamar Tab */}
        {activeTab === 'kamar' && <AdminRoomsTab onShowToast={showToast} />}

        {/* 5. Media Tab */}
        {activeTab === 'media' && <AdminMediaTab onShowToast={showToast} />}

        {/* 6. Pengaturan Website Tab */}
        {activeTab === 'pengaturan' && <AdminSettingsTab onShowToast={showToast} />}

        {/* 7. Booking Management Tab */}
        {activeTab === 'booking' && <AdminBookingsTab onShowToast={showToast} />}
      </main>

      {/* Bottom Quick Bar (4 Pintasan Inti Terpenting untuk Pengoperasian Cepat di Ponsel) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-4 py-2 max-w-md mx-auto shadow-lg">
        <div className="grid grid-cols-4 gap-1 text-neutral-500">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              activeTab === 'dashboard' ? 'text-emerald-950 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === 'dashboard' ? 'bg-[#13281E] text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('booking')}
            className={`relative flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              activeTab === 'booking' ? 'text-emerald-950 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === 'booking' ? 'bg-[#13281E] text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </div>
            <span className="text-[10px] leading-tight">Booking</span>
          </button>

          <button
            onClick={() => setActiveTab('penginapan')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              activeTab === 'penginapan' ? 'text-emerald-950 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === 'penginapan' ? 'bg-[#13281E] text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <Building className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight">Penginapan</span>
          </button>

          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer ${
              activeTab === 'pengaturan' ? 'text-emerald-950 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === 'pengaturan' ? 'bg-[#13281E] text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight">Pengaturan</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
