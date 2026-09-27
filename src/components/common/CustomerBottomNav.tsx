import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { Home, Palmtree, CalendarCheck, User } from 'lucide-react';

export const CustomerBottomNav: React.FC = () => {
  const { currentView, setCurrentView, bookings, t } = useBooking();

  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'verified' || b.status === 'pending_verification'
  ).length;

  const navItems = [
    {
      id: 'home',
      label: t.navHome,
      icon: Home,
    },
    {
      id: 'accommodations',
      label: t.navAccommodation,
      icon: Palmtree,
    },
    {
      id: 'my_bookings',
      label: t.navBookings,
      icon: CalendarCheck,
      badge: activeBookingsCount > 0 ? activeBookingsCount : undefined,
    },
    {
      id: 'profile',
      label: t.navProfile,
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-3 left-4 right-4 z-40 max-w-md mx-auto">
      <div className="h-[64px] rounded-full bg-white/95 backdrop-blur-lg border border-neutral-200/90 shadow-2xl px-3 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`relative flex items-center justify-center gap-1.5 transition-all duration-200 select-none ${
                isActive
                  ? 'h-11 px-4 rounded-full bg-[#181C24] text-white shadow-md active:scale-95'
                  : 'h-11 px-3 rounded-full text-neutral-400 hover:text-neutral-900 active:scale-95'
              }`}
              aria-label={item.label}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              {isActive ? (
                <span className="text-[12px] font-bold tracking-tight text-white whitespace-nowrap">
                  {item.label}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
