import React from 'react';
import { useBooking } from '../context/BookingContext';
import { SafeImage } from './common/SafeImage';
import { CustomerBottomNav } from './common/CustomerBottomNav';
import {
  ChevronLeft,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
} from 'lucide-react';

export const MyBookingsView: React.FC = () => {
  const { bookings, setCurrentView, setActiveBookingId, language, t } = useBooking();

  const handleOpenPass = (bookingId: string) => {
    setActiveBookingId(bookingId);
    setCurrentView('booking_flow');
  };

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
          {language === 'id' ? 'Daftar Reservasi Saya' : 'My Reservations'}
        </h1>

        <div className="w-10 h-10" />
      </header>

      {/* Bookings List */}
      <div className="px-5 py-4 space-y-4 flex-grow">
        {bookings.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white shadow-xs text-neutral-500 text-xs">
            {language === 'id'
              ? 'Belum ada reservasi aktif. Jelajahi suaka pantai kami untuk memesan penginapan!'
              : 'No reservations yet. Explore our coastal sanctuaries to book your stay!'}
          </div>
        ) : (
          bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-[26px] p-4 shadow-xs border border-neutral-200/80 space-y-3"
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-neutral-900">{b.id}</span>

                <div>
                  {b.status === 'verified' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{language === 'id' ? 'Tiket Dikonfirmasi' : 'Confirmed Pass'}</span>
                    </span>
                  )}
                  {b.status === 'pending_verification' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{t.statWaiting}</span>
                    </span>
                  )}
                  {b.status === 'checked_in' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-bold border border-cyan-200 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-cyan-600" />
                      <span>Checked In</span>
                    </span>
                  )}
                  {b.status === 'rejected' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>Rejected</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Villa & Room Thumbnail & Details */}
              <div className="flex items-center gap-3">
                <SafeImage
                  src={b.propertyImage}
                  alt={b.propertyName}
                  className="w-16 h-16 rounded-2xl object-cover"
                  containerClassName="w-16 h-16 rounded-2xl shrink-0"
                />

                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-neutral-900 truncate">
                    {b.propertyName}
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium truncate">
                    {b.roomTypeName || 'Ocean Suite'}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {b.checkInDate} to {b.checkOutDate} ({b.totalNights} {t.nights})
                  </p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    Rp {b.totalAmount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">
                  {t.guestNameLabel}: {b.guestName}
                </span>

                <button
                  onClick={() => handleOpenPass(b.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{language === 'id' ? 'Lihat Tiket QR' : 'View QR Pass'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Bottom Navigation */}
      <CustomerBottomNav />
    </div>
  );
};
