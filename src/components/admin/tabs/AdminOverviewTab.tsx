import React, { useMemo } from 'react';
import { useBooking } from '../../../context/BookingContext';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  DollarSign,
  Compass,
  ArrowUpRight,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverviewTab: React.FC<Props> = ({ onNavigateTab }) => {
  const { bookings, cmsHomestays, cmsRooms } = useBooking();

  // 1. Ringkasan Booking
  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'pending_verification'),
    [bookings]
  );
  const verifiedBookings = useMemo(
    () => bookings.filter((b) => b.status === 'verified' || (b.status as string) === 'ready_checkin'),
    [bookings]
  );
  const checkedInBookings = useMemo(
    () => bookings.filter((b) => b.status === 'checked_in'),
    [bookings]
  );
  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status === 'completed'),
    [bookings]
  );
  const cancelledBookings = useMemo(
    () => bookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected'),
    [bookings]
  );

  // 2. Pendapatan
  const totalGrossRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status !== 'rejected' && b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  }, [bookings]);

  const totalPaidRevenue = useMemo(() => {
    return bookings
      .filter((b) => ['verified', 'checked_in', 'completed', 'approved'].includes(b.status))
      .reduce((sum, b) => {
        if (b.paymentType === 'full_100') return sum + (b.totalAmount || 0);
        const dp =
          b.dpAmount !== undefined
            ? b.dpAmount
            : Math.round(b.totalAmount * (b.dpPercentage ? b.dpPercentage / 100 : 0.3));
        return sum + dp;
      }, 0);
  }, [bookings]);

  const remainingReceivable = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'verified')
      .reduce((sum, b) => {
        if (b.paymentType === 'full_100') return sum;
        const remaining =
          b.remainingBalance !== undefined
            ? b.remainingBalance
            : Math.max(0, b.totalAmount - (b.dpAmount || Math.round(b.totalAmount * 0.3)));
        return sum + remaining;
      }, 0);
  }, [bookings]);

  // 3. Statistik Tamu
  const totalGuests = useMemo(() => {
    return bookings.reduce((sum, b) => sum + (b.guestsCount || 0), 0);
  }, [bookings]);

  const avgNights = useMemo(() => {
    if (bookings.length === 0) return 0;
    const totalNights = bookings.reduce((sum, b) => sum + (b.totalNights || 1), 0);
    return (totalNights / bookings.length).toFixed(1);
  }, [bookings]);

  // Statistik Penginapan Terpopuler
  const propertyStats = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    bookings.forEach((b) => {
      const pid = b.propertyId || 'homestay-sundak';
      if (!map[pid]) {
        map[pid] = { name: b.propertyName || pid, count: 0, revenue: 0 };
      }
      map[pid].count += 1;
      map[pid].revenue += b.totalAmount || 0;
    });
    const arr = Object.values(map).sort((a, b) => b.count - a.count);
    const total = bookings.length || 1;
    return arr.map((item) => ({
      ...item,
      percentage: Math.round((item.count / total) * 100),
    }));
  }, [bookings]);

  // 4. Grafik Sumber Informasi Tamu (Requirement 1)
  const referralSources = useMemo(() => {
    const counts: Record<string, number> = {
      Instagram: 0,
      'Google Maps': 0,
      'Rekomendasi Teman': 0,
      TikTok: 0,
      'WhatsApp / Langsung': 0,
    };

    bookings.forEach((b) => {
      const src = b.referralSource || 'Instagram';
      if (counts[src] !== undefined) {
        counts[src] += 1;
      } else {
        counts['WhatsApp / Langsung'] += 1;
      }
    });

    const total = bookings.length || 1;
    const colors: Record<string, { bar: string; badge: string; text: string }> = {
      Instagram: { bar: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-600' },
      'Google Maps': { bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-600' },
      'Rekomendasi Teman': { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-600' },
      TikTok: { bar: 'bg-neutral-900', badge: 'bg-neutral-100 text-neutral-800 border-neutral-300', text: 'text-neutral-900' },
      'WhatsApp / Langsung': { bar: 'bg-teal-500', badge: 'bg-teal-50 text-teal-700 border-teal-200', text: 'text-teal-600' },
    };

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
        color: colors[name] || { bar: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
      }))
      .sort((a, b) => b.count - a.count);
  }, [bookings]);

  return (
    <div className="space-y-4">
      {/* Banner Perhatian Booking Baru */}
      {pendingBookings.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {pendingBookings.length}
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">Ada {pendingBookings.length} Booking Perlu Diverifikasi</div>
              <div className="text-[10px] text-amber-700">Periksa bukti transfer dan konfirmasi booking tamu.</div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('booking')}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
          >
            Review
          </button>
        </div>
      )}

      {/* 1. Ringkasan Kartu Booking */}
      <div className="grid grid-cols-3 gap-2">
        <div
          onClick={() => onNavigateTab('booking')}
          className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500">
            <span>Menunggu</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-xl font-black text-neutral-900 mt-1">{pendingBookings.length}</div>
          <div className="text-[10px] text-amber-700 font-medium">Perlu review</div>
        </div>

        <div
          onClick={() => onNavigateTab('booking')}
          className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500">
            <span>Siap Masuk</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-black text-neutral-900 mt-1">{verifiedBookings.length}</div>
          <div className="text-[10px] text-emerald-700 font-medium">Siap check-in</div>
        </div>

        <div
          onClick={() => onNavigateTab('booking')}
          className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500">
            <span>Menginap</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-xl font-black text-neutral-900 mt-1">{checkedInBookings.length}</div>
          <div className="text-[10px] text-blue-700 font-medium">Di homestay</div>
        </div>
      </div>

      {/* 2. Pendapatan Homestay */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900">Ringkasan Pendapatan</h3>
              <p className="text-[10px] text-neutral-400">Arus kas & pelunasan booking</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            Data Riil
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="text-[10px] font-semibold text-emerald-800">Pendapatan Masuk (DP/Lunas)</div>
            <div className="text-base font-extrabold text-emerald-950 mt-0.5">
              Rp {totalPaidRevenue.toLocaleString('id-ID')}
            </div>
            <div className="text-[9px] text-emerald-700 mt-0.5">Sudah terverifikasi rekening</div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="text-[10px] font-semibold text-neutral-600">Sisa Pelunasan Tamu</div>
            <div className="text-base font-extrabold text-neutral-900 mt-0.5">
              Rp {remainingReceivable.toLocaleString('id-ID')}
            </div>
            <div className="text-[9px] text-neutral-500 mt-0.5">Dibayar saat check-in</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-neutral-600 px-1">
          <span className="text-[11px]">Total Nilai Booking Aktif:</span>
          <strong className="font-extrabold text-neutral-900 text-xs">
            Rp {totalGrossRevenue.toLocaleString('id-ID')}
          </strong>
        </div>
      </div>

      {/* 3. Statistik Tamu & Penginapan */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-semibold">
            <Users className="w-3.5 h-3.5 text-neutral-600" />
            <span>Total Tamu</span>
          </div>
          <div className="text-xl font-black text-neutral-900">{totalGuests} <span className="text-xs font-normal text-neutral-500">orang</span></div>
          <div className="text-[10px] text-neutral-400">Rata-rata {avgNights} malam/stay</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-semibold">
            <Building className="w-3.5 h-3.5 text-neutral-600" />
            <span>Unit Aktif</span>
          </div>
          <div className="text-xl font-black text-neutral-900">
            {cmsHomestays.length} <span className="text-xs font-normal text-neutral-500">lokasi</span>
          </div>
          <div className="text-[10px] text-neutral-400">{cmsRooms.length} kamar terdaftar</div>
        </div>
      </div>

      {/* Statistik Penginapan Terfavorit */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
          <h3 className="text-xs font-bold text-neutral-900">Popularitas Penginapan</h3>
          <span className="text-[10px] text-neutral-400">Berdasarkan jumlah booking</span>
        </div>

        <div className="space-y-2.5">
          {propertyStats.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800">{item.name}</span>
                <span className="font-bold text-neutral-900">{item.count} booking ({item.percentage}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${idx === 0 ? 'bg-emerald-600' : 'bg-teal-500'}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Grafik Sumber Informasi Tamu (Requirement 1) */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900">Grafik Sumber Informasi Tamu</h3>
              <p className="text-[10px] text-neutral-400">Dari mana tamu mengetahui Griya Barokah</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            Top: {referralSources[0]?.name}
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {referralSources.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color.bar}`} />
                  <span className="font-semibold text-neutral-800">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-500 font-medium">{item.count} tamu</span>
                  <span className="font-black text-neutral-900 text-xs">{item.percentage}%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color.bar}`}
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Total Responden Terdata:</span>
          <span className="font-bold text-neutral-800">{bookings.length} Pemesan</span>
        </div>
      </div>
    </div>
  );
};
