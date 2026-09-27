import React from 'react';
import { BookingProvider, useBooking } from './context/BookingContext';
import { HeaderRoleBar } from './components/common/HeaderRoleBar';
import { LandingPage } from './components/LandingPage';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AccommodationsView } from './components/AccommodationsView';
import { PropertyDetailPage } from './components/PropertyDetailPage';
import { BookingFlow } from './components/BookingFlow';
import { MyBookingsView } from './components/MyBookingsView';
import { ProfileView } from './components/ProfileView';
import { FavoritesView } from './components/FavoritesView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { ReceptionistDashboard } from './components/ReceptionistDashboard';
import { ReceptionistLoginPage } from './components/receptionist/ReceptionistLoginPage';

const MainAppContent: React.FC = () => {
  const {
    currentRoute,
    role,
    currentView,
    isAdminAuthenticated,
    isReceptionistAuthenticated,
    mobileFrameMode,
  } = useBooking();

  // Tentukan apakah sedang berada di portal staf
  const isStaffRoute =
    currentRoute.startsWith('/admin') ||
    currentRoute.startsWith('/receptionist') ||
    currentView === 'admin_login' ||
    currentView === 'receptionist_login' ||
    role === 'admin' ||
    role === 'receptionist';

  const renderActiveView = () => {
    // 1. Rute Khusus Admin (/admin)
    if (currentRoute.startsWith('/admin') || role === 'admin' || currentView === 'admin_login') {
      if (isAdminAuthenticated) {
        return <AdminDashboard />;
      }
      return <AdminLoginPage />;
    }

    // 2. Rute Khusus Resepsionis (/receptionist)
    if (
      currentRoute.startsWith('/receptionist') ||
      role === 'receptionist' ||
      currentView === 'receptionist_login'
    ) {
      if (isReceptionistAuthenticated) {
        return <ReceptionistDashboard />;
      }
      return <ReceptionistLoginPage />;
    }

    // 3. Alur Publik / Tamu (Customer App)
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'accommodations':
        return <AccommodationsView />;
      case 'detail':
        return <PropertyDetailPage />;
      case 'booking_flow':
        return <BookingFlow />;
      case 'my_bookings':
        return <MyBookingsView />;
      case 'profile':
        return <ProfileView />;
      case 'saved':
        return <FavoritesView />;
      case 'home':
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] flex flex-col items-center">
      {/* Top Bar Bersih untuk Tamu (Hanya Brand & Ganti Bahasa ID/EN, Tanpa Switcher Role) */}
      {!isStaffRoute && (
        <div className="w-full">
          <HeaderRoleBar />
        </div>
      )}

      {/* Container Mobile Viewport Responsive */}
      <main className="w-full flex-grow flex items-center justify-center py-0 sm:py-4 lg:py-6 px-0 sm:px-4">
        {mobileFrameMode ? (
          /* Bingkai Fisik Smartphone untuk Uji Coba Desktop */
          <div className="relative w-full max-w-[412px] h-[870px] bg-neutral-900 rounded-[50px] p-3 shadow-2xl border-[6px] border-neutral-700/80 flex flex-col overflow-hidden">
            {/* Dynamic Island Cutout */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-end px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
            </div>

            {/* Viewport Layar Ponsel */}
            <div className="relative w-full h-full bg-[#F6F7F9] rounded-[40px] overflow-y-auto overflow-x-hidden no-scrollbar">
              {renderActiveView()}
            </div>
          </div>
        ) : (
          /* Viewport Mobile-First Standar (Maksimal 430px di Desktop, 100% di HP) */
          <div className="w-full max-w-[430px] min-h-[100dvh] sm:min-h-[850px] bg-[#F6F7F9] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-neutral-300/80 overflow-hidden flex flex-col">
            {renderActiveView()}
          </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BookingProvider>
      <MainAppContent />
    </BookingProvider>
  );
}
