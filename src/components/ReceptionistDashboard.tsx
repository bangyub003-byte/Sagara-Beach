import React, { useState, useEffect, useRef } from 'react';
import { useBooking } from '../context/BookingContext';
import { verifyBookingSignature } from '../utils/securityHelper';
import {
  QrCode,
  Check,
  Search,
  CheckCircle2,
  Signal,
  Wifi,
  Battery,
  LogOut,
  Home,
  Phone,
  Calendar,
  CreditCard,
  User,
  Users,
  AlertCircle,
  Camera,
  CameraOff,
  RefreshCw,
  Send,
  Building,
  ShieldAlert,
} from 'lucide-react';

export const ReceptionistDashboard: React.FC = () => {
  const {
    bookings,
    checkInBooking,
    findBookingById,
    refreshBookings,
    setCurrentView,
    setRole,
    logoutStaff,
    navigateTo,
    adminWhatsappNumber,
  } = useBooking();

  const [bookingIdQuery, setBookingIdQuery] = useState<string>('GBH-2025-9812');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('GBH-2025-9812');
  const [isCheckedInSuccess, setIsCheckedInSuccess] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isStartingScanner, setIsStartingScanner] = useState<boolean>(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string>('');
  const [searchError, setSearchError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Ambil data booking terbaru dari database saat halaman resepsionis dibuka (mount)
  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  // Handler tombol manual refresh data
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBookings();
      setToastMessage('✓ Data booking terbaru berhasil dimuat dari database.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch {
      setToastMessage('⚠️ Gagal memperbarui data booking.');
      setTimeout(() => setToastMessage(''), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const scannerRef = useRef<any>(null);
  const isStartingRef = useRef<boolean>(false);

  // Ambil booking aktif dari database
  const currentBooking =
    bookings.find(
      (b) =>
        b.id.toLowerCase() === selectedBookingId.toLowerCase().trim() ||
        b.id.toLowerCase() === bookingIdQuery.toLowerCase().trim()
    ) || bookings[0];

  // Hentikan pemindai kamera
  const handleStopScanner = async () => {
    setIsCameraActive(false);
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
  };

  // Bersihkan pemindai saat unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, []);

  // Mulai pemindai kamera belakang HP real-time
  const handleStartScanner = async () => {
    if (isStartingRef.current) return;
    setCameraPermissionError('');
    setSearchError('');
    setIsStartingScanner(true);
    isStartingRef.current = true;

    try {
      // Import library scanner hanya saat resepsionis mengaktifkan scanner
      const { Html5Qrcode } = await import('html5-qrcode');

      // Pastikan scanner instance sebelumnya dibersihkan jika ada
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } else {
        scannerRef.current = new Html5Qrcode('qr-scanner-box');
      }

      const qrConfig = {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxEdge = Math.max(160, Math.floor(minEdge * 0.75));
          return { width: qrboxEdge, height: qrboxEdge };
        },
        aspectRatio: 1.0,
      };

      // Minta izin kamera & aktifkan kamera belakang HP (facingMode: environment)
      try {
        await scannerRef.current.start(
          { facingMode: 'environment' },
          qrConfig,
          (decodedText: string) => {
            handleQrScanned(decodedText);
          },
          () => {
            // parsing frame ignore
          }
        );
        setIsCameraActive(true);
      } catch (firstErr: any) {
        const errStr = String(firstErr?.name || firstErr?.message || firstErr).toLowerCase();
        // Jika izin kamera ditolak oleh pengguna
        if (
          errStr.includes('notallowed') ||
          errStr.includes('permission') ||
          errStr.includes('denied') ||
          errStr.includes('dismissed')
        ) {
          throw firstErr;
        }

        // Fallback jika device tidak mendukung facingMode environment (misal webcam laptop)
        await scannerRef.current.start(
          { facingMode: 'user' },
          qrConfig,
          (decodedText: string) => {
            handleQrScanned(decodedText);
          },
          () => {}
        );
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera activation error:', err);
      setIsCameraActive(false);
      // WAJIB: Tampilkan pesan "Izin kamera diperlukan untuk melakukan scan QR." jika kamera ditolak
      setCameraPermissionError('Izin kamera diperlukan untuk melakukan scan QR.');
      if (scannerRef.current && scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch {}
      }
    } finally {
      isStartingRef.current = false;
      setIsStartingScanner(false);
    }
  };

  // Alur saat QR code berhasil dipindai
  const handleQrScanned = async (decodedText: string) => {
    if (!decodedText) return;

    // Baca kode booking dan signature keamanan dari QR (P1.E)
    // Format standar: "GBH:BOOKING:GBH-2609-K7P9|SIG:A7D3E9"
    let extractedId = '';
    const colonMatch = decodedText.match(/GBH:BOOKING:([A-Za-z0-9_-]+)/i);
    if (colonMatch && colonMatch[1]) {
      extractedId = colonMatch[1].trim();
    } else {
      const gbhMatch = decodedText.match(/(GBH-[A-Za-z0-9-]+)/i);
      if (gbhMatch && gbhMatch[1]) {
        extractedId = gbhMatch[1].trim();
      } else {
        extractedId = decodedText.trim();
      }
    }

    // Ekstraksi tanda tangan hash digital
    const sigMatch = decodedText.match(/SIG:([A-Za-z0-9_-]+)/i);
    const scannedSig = sigMatch ? sigMatch[1].trim() : '';

    const cleanId = extractedId.toUpperCase();
    const found =
      bookings.find((b) => b.id.toUpperCase() === cleanId) ||
      bookings.find((b) => b.id.toUpperCase().includes(cleanId) || cleanId.includes(b.id.toUpperCase()));

    if (found) {
      // Verifikasi Tanda Tangan Keamanan Digital (P1.E)
      if (scannedSig) {
        console.log('[DEBUG-B] verifyBookingSignature saat tiket di-scan di resepsionis:', {
          decodedText,
          extractedId,
          cleanId,
          scannedSig,
          foundId: found.id,
          foundGuestPhone: found.guestPhone,
          foundSignature: found.signature,
        });
        const isValidSignature = await verifyBookingSignature(
          found.id,
          found.guestPhone,
          scannedSig,
          found.signature
        );
        console.log('[DEBUG-B] Hasil verifyBookingSignature:', {
          isValidSignature,
          scannedSig,
          foundSignature: found.signature,
        });
        if (!isValidSignature) {
          setSearchError(`PERINGATAN: Tanda tangan digital QR Code tidak valid untuk booking ${found.id}. Tiket terdeteksi palsu/rekayasa.`);
          setToastMessage(`⚠️ QR Ditolak: Tanda tangan digital tidak cocok.`);
          setTimeout(() => setToastMessage(''), 4500);
          handleStopScanner();
          return;
        }
      }

      setSelectedBookingId(found.id);
      setBookingIdQuery(found.id);
      // Status SELALU diambil langsung secara real-time dari database (JANGAN dari QR)
      setIsCheckedInSuccess(found.status === 'checked_in');
      setSearchError('');
      setToastMessage(`✓ QR Sah & Terverifikasi! Tamu: ${found.guestName} (${found.id})`);
      setTimeout(() => setToastMessage(''), 3500);

      // Getar HP haptic feedback jika didukung
      try {
        navigator.vibrate?.([80, 40, 80]);
      } catch {}

      // Tutup kamera setelah berhasil membaca tiket
      handleStopScanner();
    } else {
      setSearchError(`QR terbaca "${decodedText}", namun booking tidak ditemukan.`);
      setToastMessage(`QR terbaca: ${extractedId}, tidak ada di database.`);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!currentBooking) return;
    const res = await checkInBooking(currentBooking.id, currentBooking.signature);
    if (res.success || currentBooking.status === 'checked_in') {
      setIsCheckedInSuccess(true);
      setToastMessage(`✓ Tamu ${currentBooking.guestName} berhasil Check-in!`);
      setTimeout(() => setToastMessage(''), 3500);
    } else {
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(''), 4500);
    }
  };

  // Kirim WhatsApp otomatis ke nomor Admin setelah verifikasi check-in
  const handleSendAdminReport = () => {
    if (!currentBooking) return;
    const adminPhone = (adminWhatsappNumber || '081234567890').replace(/\D/g, '');
    const message = `Verifikasi Check-in Berhasil

Nama Tamu:
${currentBooking.guestName}

Kode Booking:
${currentBooking.id}

Penginapan:
${currentBooking.propertyName}

Tanggal:
${currentBooking.checkInDate} s/d ${currentBooking.checkOutDate}

Status:
Sudah diverifikasi resepsionis.`;

    const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleSearch = () => {
    setSearchError('');
    if (!bookingIdQuery.trim()) {
      setSearchError('Masukkan kode booking terlebih dahulu.');
      return;
    }
    const cleanId = bookingIdQuery.trim().toUpperCase();
    const found = findBookingById(cleanId) || bookings.find((b) => b.id.toUpperCase().includes(cleanId));
    if (found) {
      setSelectedBookingId(found.id);
      setIsCheckedInSuccess(found.status === 'checked_in');
      setToastMessage(`✓ Booking ${found.id} berhasil dimuat.`);
      setTimeout(() => setToastMessage(''), 2500);
    } else {
      setSearchError(`Booking "${bookingIdQuery}" tidak ditemukan.`);
    }
  };

  const handleScanSimulation = (id: string) => {
    setSelectedBookingId(id);
    setBookingIdQuery(id);
    const target = bookings.find((b) => b.id === id);
    setIsCheckedInSuccess(target?.status === 'checked_in');
    handleStopScanner();
    setSearchError('');
    setToastMessage(`✓ Berhasil memindai QR Code tiket ${id}`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-[#11141A] flex flex-col justify-between select-none pb-8 max-w-md mx-auto">
      {/* Styling untuk injeksi video html5-qrcode */}
      <style>{`
        #qr-scanner-box video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 0.75rem;
        }
        #qr-scanner-box {
          border: none !important;
        }
        #qr-scanner-box img {
          display: none !important;
        }
      `}</style>

      {/* Top Status Bar HP */}
      <div className="sticky top-0 z-30 bg-[#F6F7F9]/95 backdrop-blur-md px-4 pt-2 pb-1 flex items-center justify-between text-neutral-700 text-[11px] font-semibold">
        <span>09:41</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Header Resepsionis Compact */}
      <header className="px-4 py-2 flex items-center justify-between border-b border-neutral-200/60 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRole('customer');
              setCurrentView('home');
            }}
            className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 active:scale-95 transition-transform cursor-pointer"
            title="Kembali ke Beranda Tamu"
          >
            <Home className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                Resepsionis Front Desk
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-neutral-400">
              Griya Barokah Homestay
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tombol Kecil Refresh Data Booking */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data Booking Terbaru dari Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="text-[10px]">Refresh</span>
          </button>

          <button
            onClick={() => {
              logoutStaff();
              if (navigateTo) navigateTo('/');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
            title="Keluar Sesi Resepsionis"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[10px]">Logout</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`mx-4 my-2 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in ${
            toastMessage.includes('⚠️') || toastMessage.includes('Ditolak') || toastMessage.includes('PERINGATAN')
              ? 'bg-rose-50 border border-rose-300 text-rose-900'
              : 'bg-emerald-50 border border-emerald-300 text-emerald-900'
          }`}
        >
          {toastMessage.includes('⚠️') || toastMessage.includes('Ditolak') ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Konten Utama Resepsionis: SCAN QR CODE + DETAIL HASIL SCAN */}
      <main className="px-4 pt-2 pb-6 space-y-3 flex-grow">
        {/* ================= 1. SCAN QR CODE ================= */}
        <div className="rounded-2xl bg-[#161B22] p-4 text-center text-white space-y-2.5 shadow-md">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>SCAN QR CODE</span>
            </span>
            <span className="text-[10px] text-neutral-400">
              {isCameraActive ? 'Kamera Aktif' : isStartingScanner ? 'Memuat Kamera...' : 'Siaga'}
            </span>
          </div>

          {/* Scanner Viewfinder Area Real-Time Camera */}
          <div className="relative w-full max-w-[260px] h-56 mx-auto overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center">
            {/* DOM Container untuk Stream Kamera html5-qrcode */}
            <div
              id="qr-scanner-box"
              className="w-full h-full overflow-hidden rounded-xl flex items-center justify-center bg-black"
            />

            {/* Overlay Ketika Kamera Belum Aktif (Standby) */}
            {!isCameraActive && (
              <div
                onClick={handleStartScanner}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-900/95 transition-all p-3 text-center bg-neutral-900/95"
                title="Ketuk untuk Buka Pemindai"
              >
                {/* 4 Corner Markers */}
                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#22C55E] rounded-tl-md" />
                <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#22C55E] rounded-tr-md" />
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#22C55E] rounded-bl-md" />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#22C55E] rounded-br-md" />

                {/* Glowing Scan Reticle */}
                <div className="relative mb-2">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.25)]">
                    <Camera className="w-6 h-6" />
                  </div>
                </div>

                <span className="text-xs font-bold text-neutral-100 block">
                  {isStartingScanner ? 'Meminta Izin Kamera...' : 'Ketuk untuk Buka Pemindai'}
                </span>
                <span className="text-[10px] text-emerald-400 mt-0.5 font-medium">
                  Kamera Belakang HP (Chrome / Safari)
                </span>
                <span className="text-[9px] text-neutral-400 mt-1">
                  atau pilih tiket tamu di bawah untuk simulasi
                </span>
              </div>
            )}

            {/* Overlay Ketika Kamera Aktif Memindai Real-Time */}
            {isCameraActive && (
              <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-2.5">
                {/* 4 Corner Markers in Green */}
                <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-[#22C55E] rounded-tl-md" />
                <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-[#22C55E] rounded-tr-md" />
                <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-[#22C55E] rounded-bl-md" />
                <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-[#22C55E] rounded-br-md" />

                {/* Garis Laser Animasi Scan */}
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_12px_#22C55E] animate-pulse" />

                {/* Badge Status Atas */}
                <div className="flex justify-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-emerald-400 text-[9px] font-bold border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Arahkan ke QR Code Tamu...
                  </span>
                </div>

                {/* Tombol Tutup Kamera */}
                <div className="flex justify-center pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleStopScanner}
                    className="px-3 py-1 rounded-full bg-black/85 hover:bg-black text-rose-300 text-[10px] font-bold border border-rose-500/60 flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <CameraOff className="w-3 h-3 text-rose-400" />
                    <span>Tutup Kamera</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pesan Error Jika Izin Kamera Ditolak */}
          {cameraPermissionError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/70 text-left text-white space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Izin Kamera Diperlukan</span>
              </div>
              <p className="text-[11px] text-rose-200 leading-tight">
                {cameraPermissionError}
              </p>
              <p className="text-[10px] text-neutral-300">
                Pastikan izin akses kamera telah diaktifkan pada browser Android Chrome atau iPhone Safari Anda.
              </p>
              <button
                type="button"
                onClick={handleStartScanner}
                className="mt-1 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Coba Buka Kamera Lagi</span>
              </button>
            </div>
          )}

          {/* Opsi Cepat Pindai Tiket Booking Tamu (Simulasi) */}
          <div className="text-left space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Pilih Tiket Tamu (Simulasi Scan QR):
            </span>
            <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto no-scrollbar">
              {bookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleScanSimulation(b.id)}
                  className={`p-1.5 px-2.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                    b.id === selectedBookingId
                      ? 'bg-emerald-900/80 text-white border border-emerald-500'
                      : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60'
                  }`}
                >
                  <div className="truncate mr-2">
                    <strong className="block font-bold text-white text-[11px] truncate">
                      {b.guestName}
                    </strong>
                    <span className="text-neutral-400 text-[9px] block">
                      {b.id} • {b.propertyName.replace('Griya Barokah ', '')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neutral-900 text-emerald-400 border border-emerald-800 shrink-0">
                    Scan
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Manual Kode Booking */}
          <div className="pt-1">
            <div className="h-9 px-2 rounded-xl bg-white flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-1 pl-1">
                <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={bookingIdQuery}
                  onChange={(e) => setBookingIdQuery(e.target.value)}
                  placeholder="Ketik Kode Booking (e.g. GBH-9812)"
                  className="w-full text-[11px] font-mono font-bold text-neutral-900 focus:outline-none uppercase"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="px-3 h-7 rounded-lg bg-[#13281E] hover:bg-[#1A3428] text-white text-[10px] font-bold transition-colors cursor-pointer"
              >
                Cari
              </button>
            </div>
            {searchError && (
              <span className="text-[10px] text-rose-400 block text-left mt-1">
                {searchError}
              </span>
            )}
          </div>

          {/* Tombol Khusus Mode Pengembangan (Development): Simulasi QR Palsu */}
          {import.meta.env.DEV && (
            <div className="pt-2 border-t border-neutral-800 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const targetBooking = bookings[0] || { id: 'GBH-2609-K8R2' };
                  handleQrScanned(`GBH:BOOKING:${targetBooking.id}|SIG:PALSU_REKAYASA_INVALID_HASH_999`);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Hanya tampil di mode pengembangan (development) untuk menguji penolakan tanda tangan QR palsu"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Simulasikan QR Palsu (Uji Coba)</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= 2. SETELAH SCAN: TAMPILKAN DATA TAMU & TOMBOL CHECK-IN ================= */}
        {currentBooking ? (
          <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
            {/* Header Kode Booking & Status */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <span className="text-[9px] text-neutral-400 uppercase font-bold block">
                  Kode Booking
                </span>
                <span className="text-xs font-mono font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {currentBooking.id}
                </span>
              </div>

              <div>
                {currentBooking.status === 'checked_in' || isCheckedInSuccess ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-[10px] font-bold border border-cyan-300">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Sudah Check-in</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Siap Check-in</span>
                  </span>
                )}
              </div>
            </div>

            {/* INFORMASI WAJIB TAMPIL:
                1. Kode Booking (di header card)
                2. Nama Tamu
                3. Penginapan
                4. Kamar
                5. Tanggal Menginap
                6. Jumlah Tamu
                7. Status Pembayaran */}
            <div className="space-y-2 text-xs">
              {/* 1. Nama Tamu */}
              <div className="flex items-start justify-between">
                <span className="text-neutral-500 font-medium text-[11px] flex items-center gap-1">
                  <User className="w-3 h-3 text-neutral-400" />
                  <span>Nama Tamu:</span>
                </span>
                <strong className="text-neutral-900 font-extrabold text-right text-xs truncate max-w-[200px]">
                  {currentBooking.guestName}
                </strong>
              </div>

              {/* Nomor HP Tamu */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-neutral-400" />
                  <span>Nomor HP:</span>
                </span>
                <a
                  href={`https://wa.me/${currentBooking.guestPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>{currentBooking.guestPhone}</span>
                </a>
              </div>

              {/* 2. Penginapan */}
              <div className="flex items-start justify-between">
                <span className="text-neutral-500 font-medium text-[11px] flex items-center gap-1">
                  <Building className="w-3 h-3 text-neutral-400" />
                  <span>Penginapan:</span>
                </span>
                <strong className="text-neutral-900 font-bold text-right text-[11px] truncate max-w-[210px]">
                  {currentBooking.propertyName}
                </strong>
              </div>

              {/* 3. Kamar */}
              <div className="flex items-start justify-between">
                <span className="text-neutral-500 font-medium text-[11px]">Kamar:</span>
                <strong className="text-emerald-800 font-bold text-right text-[11px] truncate max-w-[210px]">
                  {currentBooking.roomTypeName}
                </strong>
              </div>

              {/* 4. Tanggal Menginap */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  <span>Tanggal Menginap:</span>
                </span>
                <strong className="text-neutral-900 font-bold text-right text-[11px]">
                  {currentBooking.checkInDate} s/d {currentBooking.checkOutDate} ({currentBooking.totalNights} Malam)
                </strong>
              </div>

              {/* 5. Jumlah Tamu */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium text-[11px] flex items-center gap-1">
                  <Users className="w-3 h-3 text-neutral-400" />
                  <span>Jumlah Tamu:</span>
                </span>
                <strong className="text-neutral-900 font-bold text-right text-[11px]">
                  {currentBooking.guestsCount} Tamu / Orang
                </strong>
              </div>

              {/* 6. Status Pembayaran */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                <span className="text-neutral-500 font-medium text-[11px] flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-neutral-400" />
                  <span>Status Pembayaran:</span>
                </span>
                <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                  {currentBooking.paymentType === 'full_100' || currentBooking.dpPercentage === 100
                    ? `Lunas 100% (Rp ${currentBooking.totalAmount.toLocaleString('id-ID')})`
                    : `DP ${currentBooking.dpPercentage || 30}% (Rp ${(currentBooking.dpAmount || Math.round(currentBooking.totalAmount * 0.3)).toLocaleString('id-ID')})`}
                </span>
              </div>
            </div>

            {/* TOMBOL: "Konfirmasi Check-in" */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleConfirmCheckIn}
                className={`w-full h-11 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer ${
                  currentBooking.status === 'checked_in' || isCheckedInSuccess
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-[#13281E] hover:bg-[#1A3428]'
                }`}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {currentBooking.status === 'checked_in' || isCheckedInSuccess
                    ? 'Check-in Telah Dikonfirmasi ✓'
                    : 'Konfirmasi Check-in'}
                </span>
              </button>

              {/* TOMBOL: "Kirim Laporan Verifikasi ke Admin" (WhatsApp) */}
              <button
                type="button"
                onClick={handleSendAdminReport}
                className="w-full h-10 rounded-xl bg-white border border-emerald-600/40 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
              >
                <Send className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kirim Laporan Verifikasi ke Admin</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-2xl text-center text-neutral-500 text-xs border border-neutral-200">
            Arahkan kamera ke QR Code tamu atau ketik kode booking di atas untuk memulai check-in.
          </div>
        )}
      </main>
    </div>
  );
};

