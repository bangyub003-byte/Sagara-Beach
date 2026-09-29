import React, { useState, useMemo } from 'react';
import { useBooking } from '../../../context/BookingContext';
import { Booking, BookingStatus } from '../../../types';
import { SafeImage } from '../../common/SafeImage';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
  Phone,
  MessageCircle,
  Eye,
  CreditCard,
  User,
  Calendar,
  Building,
  QrCode,
  DollarSign,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
}

export const AdminBookingsTab: React.FC<Props> = ({ onShowToast }) => {
  const {
    bookings,
    updateBookingStatus,
    adminWhatsappNumber,
  } = useBooking();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<{ url: string; title: string } | null>(null);
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter & Search
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filterStatus !== 'all') {
        if (filterStatus === 'cancelled') {
          if (b.status !== 'cancelled' && b.status !== 'rejected') return false;
        } else if (filterStatus === 'verified') {
          if (b.status !== 'verified' && (b.status as string) !== 'ready_checkin') return false;
        } else if (b.status !== filterStatus) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = b.guestName.toLowerCase().includes(q);
        const matchId = b.id.toLowerCase().includes(q);
        const matchPhone = (b.guestPhone || '').includes(q);
        if (!matchName && !matchId && !matchPhone) return false;
      }
      return true;
    });
  }, [bookings, filterStatus, searchQuery]);

  const handleVerify = async (booking: Booking) => {
    await updateBookingStatus(
      booking.id,
      'verified',
      'Pembayaran telah diverifikasi oleh admin. Siap Check-in.'
    );
    onShowToast(`✓ Booking ${booking.guestName} (${booking.id}) BERHASIL DIVERIFIKASI!`);

    // Auto open WhatsApp notification prompt
    const waText = `Halo kak ${booking.guestName}, pembayaran booking Griya Barokah Anda (${booking.id}) telah kami verifikasi.\nStatus: Siap Check-in.\nPenginapan: ${booking.propertyName}\nTanggal: ${booking.checkInDate} s/d ${booking.checkOutDate}\nTerima kasih.`;
    const cleanPhone = (booking.guestPhone || adminWhatsappNumber || '').replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    if (confirm(`Booking diverifikasi! Buka WhatsApp untuk mengirim konfirmasi ke tamu (${booking.guestPhone})?`)) {
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(waText)}`, '_blank');
    }
  };

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    await updateBookingStatus(id, newStatus);
    onShowToast(`✓ Status booking diubah menjadi "${newStatus}"`);
  };

  const handleConfirmReject = async () => {
    if (!rejectingBooking) return;
    await updateBookingStatus(
      rejectingBooking.id,
      'cancelled',
      rejectionReason || 'Dibatalkan oleh admin'
    );
    onShowToast(`✓ Booking ${rejectingBooking.id} telah dibatalkan.`);
    setRejectingBooking(null);
    setRejectionReason('');
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending_verification':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Menunggu Verifikasi</span>
          </span>
        );
      case 'verified':
      case 'ready_checkin':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Siap Check-in</span>
          </span>
        );
      case 'checked_in':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Building className="w-3 h-3 text-blue-600" />
            <span>Sudah Check-in</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-300 flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Selesai</span>
          </span>
        );
      case 'cancelled':
      case 'rejected':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
            <X className="w-3 h-3 text-rose-600" />
            <span>Dibatalkan</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-neutral-900">Booking Management</h2>
            <p className="text-[10px] text-neutral-400">Total {bookings.length} pesanan tercatat</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode booking, nama tamu, no hp..."
            className="w-full h-8 pl-8 pr-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Filter Status Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: `Semua (${bookings.length})` },
          { id: 'pending_verification', label: 'Menunggu' },
          { id: 'verified', label: 'Siap Masuk' },
          { id: 'checked_in', label: 'Check-in' },
          { id: 'completed', label: 'Selesai' },
          { id: 'cancelled', label: 'Batal' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilterStatus(item.id)}
            className={`h-7 px-3 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
              filterStatus === item.id
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Daftar Booking Cards */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 space-y-1">
            <p className="text-xs font-bold text-neutral-600">Tidak ada booking yang cocok</p>
            <p className="text-[10px] text-neutral-400">Coba ubah kata kunci atau filter status</p>
          </div>
        ) : (
          filteredBookings.map((b) => {
            const isPending = b.status === 'pending_verification';

            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-2xl bg-white border transition-all shadow-2xs space-y-3 ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-400/50 bg-amber-50/20'
                    : 'border-neutral-200/90'
                }`}
              >
                {/* Header Card: ID & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-neutral-900 font-mono">{b.id}</span>
                    <span className="text-[10px] text-neutral-400">• {b.checkInDate}</span>
                  </div>
                  {getStatusBadge(b.status)}
                </div>

                {/* Detail Tamu & Penginapan */}
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                    <SafeImage
                      src={b.propertyImage}
                      alt={b.propertyName}
                      fallbackText={b.propertyName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-xs font-black text-neutral-900 truncate">{b.guestName}</h4>
                    <p className="text-[10px] text-neutral-500 truncate">{b.propertyName}</p>
                    <p className="text-[10px] text-neutral-500 truncate">
                      {b.roomTypeName || 'Unit Sewa'} • {b.guestsCount} Tamu ({b.totalNights} Malam)
                    </p>
                    <div className="text-xs font-extrabold text-emerald-950 pt-0.5">
                      Rp {b.totalAmount.toLocaleString('id-ID')}{' '}
                      <span className="text-[9px] font-bold text-neutral-500 uppercase">
                        ({b.paymentType === 'full_100'
                          ? 'Lunas 100%'
                          : `DP ${b.dpPercentage || 30}%: Rp ${(b.dpAmount || Math.round(b.totalAmount * 0.3)).toLocaleString('id-ID')}`})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Aksi Cepat Admin */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-100">
                  {/* Tombol Verifikasi Utama jika Pending */}
                  {isPending ? (
                    <button
                      onClick={() => handleVerify(b)}
                      className="flex-1 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verifikasi Pembayaran</span>
                    </button>
                  ) : (
                    /* Dropdown Ganti Status jika Sudah Terverifikasi */
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                      className="flex-1 h-8 px-2 rounded-xl bg-neutral-100 text-neutral-800 text-[11px] font-bold border border-neutral-200 focus:outline-none cursor-pointer"
                    >
                      <option value="pending_verification">Menunggu</option>
                      <option value="verified">Siap Check-in</option>
                      <option value="checked_in">Sudah Check-in</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  )}

                  {/* Tombol Lihat Bukti Transfer */}
                  {b.paymentProofUrl && (
                    <button
                      onClick={() =>
                        setPreviewReceipt({
                          url: b.paymentProofUrl,
                          title: `Bukti Transfer: ${b.guestName} (${b.id})`,
                        })
                      }
                      className="h-8 px-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold flex items-center gap-1 border border-neutral-200 cursor-pointer"
                      title="Lihat Bukti Transfer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Bukti</span>
                    </button>
                  )}

                  {/* Tombol Detail Lengkap Tamu */}
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="h-8 px-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold flex items-center gap-1 border border-neutral-200 cursor-pointer"
                    title="Detail Lengkap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </button>

                  {/* Tombol Batalkan / Tolak */}
                  {b.status !== 'cancelled' && b.status !== 'completed' && (
                    <button
                      onClick={() => setRejectingBooking(b)}
                      className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 cursor-pointer"
                      title="Batalkan Booking"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Detail Tamu Lengkap */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 space-y-3.5 shadow-2xl my-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <h3 className="text-xs font-black text-neutral-900">Detail Pemesan Homestay</h3>
                <p className="text-[10px] text-neutral-400 font-mono">{selectedBooking.id}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profil Pemesan */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Nama Lengkap:</span>
                <strong className="text-neutral-900">{selectedBooking.guestName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">No. WhatsApp:</span>
                <a
                  href={`https://wa.me/${(selectedBooking.guestPhone || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-bold flex items-center gap-1 underline"
                >
                  <Phone className="w-3 h-3" />
                  <span>{selectedBooking.guestPhone}</span>
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Kota Asal:</span>
                <span className="font-semibold text-neutral-800">{selectedBooking.asalKota || 'Yogyakarta'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Hubungan Tamu:</span>
                <span className="font-semibold text-neutral-800">{selectedBooking.withWhom || 'Keluarga'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Sumber Info:</span>
                <span className="font-bold text-indigo-700">{selectedBooking.referralSource || 'Instagram'}</span>
              </div>
            </div>

            {/* Detail Pemesanan */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Penginapan:</span>
                <strong className="text-neutral-900">{selectedBooking.propertyName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Kamar / Unit:</span>
                <span className="font-semibold text-neutral-800">{selectedBooking.roomTypeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Check-in:</span>
                <span className="font-bold text-neutral-900">{selectedBooking.checkInDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Check-out:</span>
                <span className="font-bold text-neutral-900">{selectedBooking.checkOutDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Jumlah Tamu:</span>
                <span className="font-semibold text-neutral-800">{selectedBooking.guestsCount} Orang</span>
              </div>
            </div>

            {/* Keuangan & Pembayaran */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-emerald-800">Total Biaya:</span>
                <strong className="text-emerald-950 font-black">
                  Rp {selectedBooking.totalAmount.toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800">Tipe Pembayaran:</span>
                <span className="font-bold text-emerald-900 uppercase">
                  {selectedBooking.paymentType === 'full_100'
                    ? 'Lunas 100%'
                    : `DP ${selectedBooking.dpPercentage || 30}%: Rp ${(selectedBooking.dpAmount || Math.round(selectedBooking.totalAmount * 0.3)).toLocaleString('id-ID')}`}
                </span>
              </div>
              {selectedBooking.remainingBalance ? (
                <div className="flex justify-between border-t border-emerald-200/80 pt-1 text-emerald-900">
                  <span>Sisa Pelunasan di Lokasi:</span>
                  <strong className="font-extrabold">
                    Rp {selectedBooking.remainingBalance.toLocaleString('id-ID')}
                  </strong>
                </div>
              ) : null}
            </div>

            {/* Catatan Admin */}
            {selectedBooking.adminNotes && (
              <div className="p-2.5 rounded-xl bg-neutral-100 text-[11px] text-neutral-600">
                <strong>Catatan:</strong> {selectedBooking.adminNotes}
              </div>
            )}

            {/* Bukti Transfer */}
            {selectedBooking.paymentProofUrl && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-neutral-700">Bukti Transfer Tamu:</span>
                <div
                  onClick={() =>
                    setPreviewReceipt({
                      url: selectedBooking.paymentProofUrl,
                      title: `Bukti Transfer: ${selectedBooking.guestName}`,
                    })
                  }
                  className="w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 cursor-pointer"
                >
                  <img
                    src={selectedBooking.paymentProofUrl}
                    alt="Bukti Transfer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full h-9 rounded-xl bg-neutral-900 text-white text-xs font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Preview Bukti Transfer Zoom */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="relative w-full max-w-sm bg-neutral-900 rounded-2xl overflow-hidden p-2 text-white space-y-2">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-bold truncate">{previewReceipt.title}</span>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] w-full rounded-xl overflow-hidden flex items-center justify-center bg-black">
              <img
                src={previewReceipt.url}
                alt="Receipt"
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Pembatalan Booking */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-4 space-y-3 shadow-xl border border-neutral-200">
            <h4 className="text-xs font-black text-rose-700">Batalkan Booking</h4>
            <p className="text-[11px] text-neutral-600">
              Batalkan pesanan untuk {rejectingBooking.guestName} ({rejectingBooking.id})?
            </p>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Alasan pembatalan (misal: Bukti tidak valid)..."
              className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setRejectingBooking(null)}
                className="flex-1 h-8 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 h-8 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Konfirmasi Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
