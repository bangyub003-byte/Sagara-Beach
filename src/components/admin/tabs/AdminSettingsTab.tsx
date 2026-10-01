import React, { useState } from 'react';
import { useBooking } from '../../../context/BookingContext';
import {
  Settings,
  Clock,
  Phone,
  Building,
  FileText,
  Check,
  RotateCcw,
  Sparkles,
  History,
  Image as ImageIcon,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
}

export const AdminSettingsTab: React.FC<Props> = ({ onShowToast }) => {
  const {
    getWebsiteSetting,
    updateMultipleSettings,
    cmsActivityLogs,
    resetCmsDatabase,
  } = useBooking();

  const [brandName, setBrandName] = useState(
    getWebsiteSetting('brand_name', 'Griya Barokah Homestay')
  );
  const [brandLogo, setBrandLogo] = useState(
    getWebsiteSetting('brand_logo', '/images/sundak_fullhouse_1790552054893.jpg')
  );
  const [whatsapp, setWhatsapp] = useState(
    getWebsiteSetting('footer_whatsapp', '082138613888')
  );
  const [alamat, setAlamat] = useState(
    getWebsiteSetting('footer_address', 'Pantai Sundak & Trenggole, Sidoharjo, Tepus, Gunungkidul, D.I. Yogyakarta')
  );
  const [checkInTime, setCheckInTime] = useState(
    getWebsiteSetting('checkin_time', '14:00 WIB')
  );
  const [checkOutTime, setCheckOutTime] = useState(
    getWebsiteSetting('checkout_time', '12:00 WIB')
  );
  const [bookingRules, setBookingRules] = useState(
    getWebsiteSetting(
      'booking_rules',
      '1. Khusus keluarga sah / mahrom atau rombongan sesama jenis.\n2. Wajib membawa identitas KTP/SIM asli saat check-in.\n3. Uang muka (DP) minimal 30% untuk mengunci jadwal.\n4. DP akan hangus apabila pesanan dibatalkan oleh tamu.'
    )
  );
  const [extraInfo, setExtraInfo] = useState(
    getWebsiteSetting(
      'extra_services_info',
      'Layanan Tambahan: Tersedia paket catering masakan laut segar, kelapa muda pantai, persewaan tikar & payung pantai, serta alat panggang BBQ.'
    )
  );

  // Pengaturan Rekening Bank, QRIS, & Syariah (P0.B & P2.G)
  const [bankBcaNo, setBankBcaNo] = useState(
    getWebsiteSetting('bank_bca_number', '8801 2940 1827 0049')
  );
  const [bankBcaHolder, setBankBcaHolder] = useState(
    getWebsiteSetting('bank_bca_holder', 'Griya Barokah Homestay')
  );
  const [bankMandiriNo, setBankMandiriNo] = useState(
    getWebsiteSetting('bank_mandiri_number', '8920 1829 4819 0021')
  );
  const [bankMandiriHolder, setBankMandiriHolder] = useState(
    getWebsiteSetting('bank_mandiri_holder', 'Griya Barokah Homestay')
  );
  const [qrisPayload, setQrisPayload] = useState(
    getWebsiteSetting('payment_qris_payload', 'SAGARA_QRIS_GRIYA_BAROKAH')
  );
  const [mahromClause, setMahromClause] = useState(
    getWebsiteSetting(
      'booking_mahrom_clause',
      '* Sesuai ketentuan homestay syariah barokah, tamu wajib bersama mahrom / keluarga sah atau sesama gender. Dilarang membawa minuman keras, narkoba, atau aktivitas non-halal.'
    )
  );
  const [guestRelations, setGuestRelations] = useState(
    getWebsiteSetting(
      'guest_relation_options',
      'Keluarga Inti (Suami/Istri & Anak) - Mahrom, Rombongan Keluarga Besar (Mahrom), Pasangan Suami & Istri Sah (Pasutri), Rombongan Teman Sesama Pria (Ikhwan), Rombongan Teman Sesama Wanita (Akhwat), Komunitas / Lembaga / Majelis'
    )
  );

  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'logs'>('settings');

  const handleSave = () => {
    updateMultipleSettings({
      brand_name: { value: brandName, kategori: 'homepage' },
      brand_logo: { value: brandLogo, kategori: 'homepage' },
      footer_whatsapp: { value: whatsapp, kategori: 'kontak' },
      admin_whatsapp: { value: whatsapp, kategori: 'kontak' },
      footer_address: { value: alamat, kategori: 'footer' },
      checkin_time: { value: checkInTime, kategori: 'booking' },
      checkout_time: { value: checkOutTime, kategori: 'booking' },
      booking_rules: { value: bookingRules, kategori: 'aturan' },
      extra_services_info: { value: extraInfo, kategori: 'booking' },
      bank_bca_number: { value: bankBcaNo, kategori: 'booking' },
      bank_bca_holder: { value: bankBcaHolder, kategori: 'booking' },
      bank_mandiri_number: { value: bankMandiriNo, kategori: 'booking' },
      bank_mandiri_holder: { value: bankMandiriHolder, kategori: 'booking' },
      payment_qris_payload: { value: qrisPayload, kategori: 'booking' },
      booking_mahrom_clause: { value: mahromClause, kategori: 'aturan' },
      guest_relation_options: { value: guestRelations, kategori: 'booking' },
    });
    onShowToast('✓ Pengaturan website & rekening berhasil disimpan!');
  };

  const handleResetData = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database ke default? Semua perubahan akan dikembalikan ke data awal.')) {
      resetCmsDatabase();
      onShowToast('✓ Database CMS telah direset ke default sistem.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs: Pengaturan Website & Activity Log */}
      <div className="flex rounded-xl bg-neutral-200/80 p-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSubTab('settings')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'settings' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Pengaturan Website</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('logs')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'logs' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Activity Log ({cmsActivityLogs.length})</span>
        </button>
      </div>

      {activeSubTab === 'settings' ? (
        <div className="space-y-4">
          {/* Card 1: Identitas & Kontak */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Building className="w-4 h-4 text-emerald-800" />
              <h3 className="text-xs font-bold text-neutral-900">Identitas Brand & Kontak</h3>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Nama Brand Website</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Logo URL</label>
                <input
                  type="text"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">WhatsApp Pengelola (CS)</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 082138613888"
                  className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Alamat Kantor / Pengelola</label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 resize-none leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Jam Operasional & Aturan */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Clock className="w-4 h-4 text-emerald-800" />
              <h3 className="text-xs font-bold text-neutral-900">Waktu & Syarat Booking</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Jam Check-in</label>
                <input
                  type="text"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Jam Check-out</label>
                <input
                  type="text"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Syarat Booking */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Syarat & Aturan Booking</label>
              <textarea
                rows={4}
                value={bookingRules}
                onChange={(e) => setBookingRules(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Informasi Tambahan */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Informasi Tambahan / Ekstra</label>
              <textarea
                rows={3}
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs leading-relaxed resize-none focus:outline-none"
              />
            </div>
          </div>

          {/* Card 3: Rekening Pembayaran & Syariah Mahrom (P0.B & P2.G) */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <CreditCard className="w-4 h-4 text-emerald-800" />
              <h3 className="text-xs font-bold text-neutral-900">Rekening Pembayaran & Ketentuan Syariah</h3>
            </div>

            <div className="space-y-2.5">
              {/* Rekening BCA */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">No. Rekening / VA BCA</label>
                  <input
                    type="text"
                    value={bankBcaNo}
                    onChange={(e) => setBankBcaNo(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">Atas Nama (BCA)</label>
                  <input
                    type="text"
                    value={bankBcaHolder}
                    onChange={(e) => setBankBcaHolder(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Rekening Mandiri */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">No. Rekening / VA Mandiri</label>
                  <input
                    type="text"
                    value={bankMandiriNo}
                    onChange={(e) => setBankMandiriNo(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">Atas Nama (Mandiri)</label>
                  <input
                    type="text"
                    value={bankMandiriHolder}
                    onChange={(e) => setBankMandiriHolder(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* QRIS Payload */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Payload / Data QRIS</label>
                <input
                  type="text"
                  value={qrisPayload}
                  onChange={(e) => setQrisPayload(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none"
                />
              </div>

              {/* Aturan Mahrom Syariah (P2.G) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Klausul Aturan Mahrom Syariah (Form Booking)</label>
                <textarea
                  rows={2}
                  value={mahromClause}
                  onChange={(e) => setMahromClause(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs leading-relaxed resize-none focus:outline-none"
                />
              </div>

              {/* Pilihan Hubungan Tamu (P2.G) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Daftar Pilihan Hubungan Tamu (Pisahkan dengan koma)</label>
                <textarea
                  rows={3}
                  value={guestRelations}
                  onChange={(e) => setGuestRelations(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs leading-relaxed resize-none focus:outline-none"
                />
                <span className="text-[10px] text-neutral-400 block">Pilihan yang tampil di dropdown formulir pemesanan tamu.</span>
              </div>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full h-10 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan Website</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="w-full h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database ke Default</span>
            </button>
          </div>
        </div>
      ) : (
        /* Activity Log List */
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-bold text-neutral-900">Activity Log (Audit Trail)</h3>
              <p className="text-[10px] text-neutral-400">Catatan setiap perubahan data admin</p>
            </div>
            <span className="text-[10px] font-bold bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-700">
              {cmsActivityLogs.length} Entri
            </span>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
            {cmsActivityLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">{log.aksi}</span>
                  <span className="text-[9px] text-neutral-400 font-mono">
                    {new Date(log.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                  <span>Oleh: <strong className="text-neutral-700">{log.user_nama}</strong> ({log.role})</span>
                  <span>•</span>
                  <span className="capitalize">{log.kategori}</span>
                </div>
                {log.detail && (
                  <div className="text-[10px] text-neutral-600 font-mono bg-white p-1 rounded border border-neutral-100 truncate">
                    {log.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
