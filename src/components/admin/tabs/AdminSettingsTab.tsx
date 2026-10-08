import React, { useState } from 'react';
import { useBooking } from '../../../context/BookingContext';
import { SafeImage } from '../../common/SafeImage';
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
  Upload,
  Palmtree,
  ListFilter,
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
    homepageContent,
    updateHomepageContent,
    uploadMedia,
  } = useBooking();

  const [brandName, setBrandName] = useState(
    getWebsiteSetting('brand_name', 'Griya Barokah Homestay')
  );
  const [brandLogo, setBrandLogo] = useState(
    getWebsiteSetting('brand_logo', '/images/sundak_fullhouse_1790552054893.jpg')
  );
  const [pwaIcon, setPwaIcon] = useState(
    getWebsiteSetting('pwa_icon', '/icon-192.png')
  );
  const [whatsapp, setWhatsapp] = useState(
    getWebsiteSetting('admin_whatsapp') || getWebsiteSetting('footer_whatsapp', '082138613888')
  );
  const [layananTambahanWhatsapp, setLayananTambahanWhatsapp] = useState(
    getWebsiteSetting('layanan_tambahan_whatsapp', '082138613888')
  );
  const [alamat, setAlamat] = useState(
    getWebsiteSetting('footer_address', 'Pantai Sundak & Trenggole, Sidoharjo, Tepus, Gunungkidul, D.I. Yogyakarta')
  );

  // Hero Banner Beranda (Tersambung langsung ke website_settings / homepageContent)
  const [heroTitle, setHeroTitle] = useState(
    getWebsiteSetting('homepage_hero_title') ||
    homepageContent?.hero_title ||
    'Griya Barokah Homestay Pantai Sundak & Trenggole'
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    getWebsiteSetting('homepage_hero_subtitle') ||
    homepageContent?.hero_subtitle ||
    'HOMESTAY KELUARGA ASLI'
  );
  const [heroDescription, setHeroDescription] = useState(
    getWebsiteSetting('homepage_hero_description') ||
    homepageContent?.hero_description ||
    'Penginapan keluarga nyaman dekat pantai Gunungkidul dengan fasilitas lengkap.'
  );
  const [heroImage, setHeroImage] = useState(
    getWebsiteSetting('homepage_hero_image') ||
    homepageContent?.hero_image ||
    '/images/sundak_fullhouse_1790552054893.jpg'
  );

  // Fasilitas Lengkap Penginapan di Beranda
  const [facilityImage, setFacilityImage] = useState(
    getWebsiteSetting('facility_image', '/images/living_room_1790552074900.jpg')
  );
  const [generalFacilities, setGeneralFacilities] = useState(
    getWebsiteSetting(
      'general_facilities',
      'Semua Kamar Ber-AC, KM Duduk & Jongkok, Dapur Lengkap & Gas, Kulkas & TV Keluarga, Tersedia 13 Extra Bed, Free WiFi Cepat'
    )
  );

  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingFacility, setIsUploadingFacility] = useState(false);
  const [isUploadingPwaIcon, setIsUploadingPwaIcon] = useState(false);

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
  const [bankBcaName, setBankBcaName] = useState(
    getWebsiteSetting('bank_bca_bank_name', 'BCA')
  );
  const [bankBcaNo, setBankBcaNo] = useState(
    getWebsiteSetting('bank_bca_number', '8801 2940 1827 0049')
  );
  const [bankBcaHolder, setBankBcaHolder] = useState(
    getWebsiteSetting('bank_bca_holder', 'Griya Barokah Homestay')
  );
  const [bankMandiriName, setBankMandiriName] = useState(
    getWebsiteSetting('bank_mandiri_bank_name', 'Mandiri')
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
    // 1. Simpan pengaturan website & kontak WA tunggal
    updateMultipleSettings({
      brand_name: { value: brandName, kategori: 'homepage' },
      brand_logo: { value: brandLogo, kategori: 'homepage' },
      pwa_icon: { value: pwaIcon, kategori: 'homepage' },
      footer_whatsapp: { value: whatsapp, kategori: 'kontak' },
      admin_whatsapp: { value: whatsapp, kategori: 'kontak' },
      layanan_tambahan_whatsapp: { value: layananTambahanWhatsapp, kategori: 'kontak' },
      footer_address: { value: alamat, kategori: 'footer' },
      facility_banner_image: { value: facilityImage, kategori: 'homepage' },
      facility_image: { value: facilityImage, kategori: 'homepage' },
      general_facilities: { value: generalFacilities, kategori: 'homepage' },
      checkin_time: { value: checkInTime, kategori: 'booking' },
      checkout_time: { value: checkOutTime, kategori: 'booking' },
      booking_rules: { value: bookingRules, kategori: 'aturan' },
      extra_services_info: { value: extraInfo, kategori: 'booking' },
      bank_bca_bank_name: { value: bankBcaName, kategori: 'booking' },
      bank_bca_number: { value: bankBcaNo, kategori: 'booking' },
      bank_bca_holder: { value: bankBcaHolder, kategori: 'booking' },
      bank_mandiri_bank_name: { value: bankMandiriName, kategori: 'booking' },
      bank_mandiri_number: { value: bankMandiriNo, kategori: 'booking' },
      bank_mandiri_holder: { value: bankMandiriHolder, kategori: 'booking' },
      payment_qris_payload: { value: qrisPayload, kategori: 'booking' },
      booking_mahrom_clause: { value: mahromClause, kategori: 'aturan' },
      guest_relation_options: { value: guestRelations, kategori: 'booking' },
    });

    // 2. Simpan juga ke homepageContent agar langsung realtime di Beranda & Landing Page
    updateHomepageContent({
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_description: heroDescription,
      hero_image: heroImage,
    });

    onShowToast('✓ Seluruh pengaturan Beranda, Hero, Fasilitas & Kontak WhatsApp berhasil disimpan!');
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
      <div className="flex rounded-xl bg-neutral-200/80 p-1 text-xs font-bold gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('settings')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-w-0 ${
            activeSubTab === 'settings' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
          }`}
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Pengaturan Website</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('logs')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-w-0 ${
            activeSubTab === 'logs' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
          }`}
        >
          <History className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Activity Log ({cmsActivityLogs.length})</span>
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
                <label className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
                  <span>Ikon PWA (Install Aplikasi HP)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Home Screen &amp; App Launcher</span>
                </label>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-neutral-200">
                    <img
                      src={pwaIcon}
                      alt="PWA Icon"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icon-192.png';
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={pwaIcon}
                    onChange={(e) => setPwaIcon(e.target.value)}
                    placeholder="/icon-192.png"
                    className="flex-1 h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                  />
                  <label className="h-8 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0">
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{isUploadingPwaIcon ? 'Unggah...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setIsUploadingPwaIcon(true);
                          try {
                            const res = await uploadMedia(f, 'hero');
                            setPwaIcon(res.url);
                            onShowToast('✓ Ikon PWA berhasil diunggah!');
                          } finally {
                            setIsUploadingPwaIcon(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Ikon yang tampil di layar utama HP pengguna saat aplikasi diinstal (&quot;Tambahkan ke Layar Utama&quot;).
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
                  <span>WhatsApp Pengelola (CS Utama)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Tersambung ke Booking &amp; Header</span>
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 082138613888"
                  className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <p className="text-[10px] text-neutral-500">
                  Nomor utama untuk: Header WhatsApp Beranda, Chat CS Langsung, dan Konfirmasi Pesanan BookingFlow.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
                  <span>Nomor WhatsApp Layanan Tambahan</span>
                  <span className="text-[10px] text-teal-700 font-semibold">Khusus Bagian Layanan Tambahan</span>
                </label>
                <input
                  type="text"
                  value={layananTambahanWhatsapp}
                  onChange={(e) => setLayananTambahanWhatsapp(e.target.value)}
                  placeholder="Contoh: 082138613888"
                  className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
                <p className="text-[10px] text-neutral-500">
                  Nomor khusus untuk tombol &quot;Pesan&quot; Makanan, &quot;Booking&quot; Sewa Jeep, &quot;Tanya&quot; Info Jual Beli Tanah, serta teks &quot;Hubungi WhatsApp&quot; di bagian Layanan Tambahan Beranda.
                </p>
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

          {/* Card Baru: Banner Hero Beranda */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-800" />
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">Banner Hero Beranda (Utama)</h3>
                  <p className="text-[10px] text-neutral-400">Gambar besar, judul &amp; deskripsi pembuka di bagian paling atas Beranda</p>
                </div>
              </div>
            </div>

            {/* Preview Banner */}
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-2xs">
              <SafeImage
                src={heroImage}
                alt="Preview Hero"
                fallbackText="Hero Homestay"
                className="w-full h-full object-cover opacity-90"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
              <div className="absolute inset-0 p-3 flex flex-col justify-between text-white pointer-events-none">
                <span className="self-start px-2 py-0.5 rounded-full bg-emerald-600/90 text-[9px] font-black uppercase">
                  {heroSubtitle || 'HOMESTAY KELUARGA ASLI'}
                </span>
                <div>
                  <h4 className="text-xs font-bold truncate drop-shadow-sm">{heroTitle}</h4>
                  <p className="text-[10px] text-neutral-200 line-clamp-1">{heroDescription}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Foto Hero Banner</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="URL gambar banner..."
                    className="flex-1 h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                  />
                  <label className="h-8 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{isUploadingHero ? 'Unggah...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setIsUploadingHero(true);
                          try {
                            const res = await uploadMedia(f, 'hero');
                            setHeroImage(res.url);
                            onShowToast('✓ Foto hero berhasil diunggah!');
                          } finally {
                            setIsUploadingHero(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Judul Hero Banner</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">Badge / Subjudul Singkat</label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="HOMESTAY KELUARGA ASLI"
                    className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">Deskripsi Hero</label>
                  <input
                    type="text"
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    placeholder="Penginapan keluarga nyaman dekat pantai..."
                    className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card Baru: Fasilitas Lengkap Penginapan di Beranda */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Sparkles className="w-4 h-4 text-emerald-800" />
              <div>
                <h3 className="text-xs font-bold text-neutral-900">Fasilitas Lengkap Penginapan (Beranda)</h3>
                <p className="text-[10px] text-neutral-400">Atur foto dan butir-butir fasilitas yang tampil di section fasilitas Beranda</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Foto Banner Fasilitas</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={facilityImage}
                    onChange={(e) => setFacilityImage(e.target.value)}
                    placeholder="URL foto fasilitas penginapan..."
                    className="flex-1 h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                  />
                  <label className="h-8 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{isUploadingFacility ? 'Unggah...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setIsUploadingFacility(true);
                          try {
                            const res = await uploadMedia(f, 'fasilitas');
                            setFacilityImage(res.url);
                            onShowToast('✓ Foto fasilitas berhasil diunggah!');
                          } finally {
                            setIsUploadingFacility(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
                  <span>Daftar Fasilitas Penginapan</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Pisahkan dengan koma</span>
                </label>
                <textarea
                  rows={3}
                  value={generalFacilities}
                  onChange={(e) => setGeneralFacilities(e.target.value)}
                  placeholder="Contoh: Semua Kamar Ber-AC, KM Duduk & Jongkok, Dapur Lengkap & Gas, Kulkas & TV Keluarga, Tersedia 13 Extra Bed, Free WiFi Cepat"
                  className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 resize-none leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />

                {/* Preview Butir Fasilitas Aktif & Tombol Hapus Cepat */}
                <div className="space-y-1 pt-0.5">
                  <span className="text-[10px] font-bold text-neutral-500 block">
                    Butir Fasilitas Aktif ({generalFacilities.split(/,|\n/).map((i) => i.trim()).filter(Boolean).length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {generalFacilities
                      .split(/,|\n/)
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200"
                        >
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const items = generalFacilities
                                .split(/,|\n/)
                                .map((i) => i.trim())
                                .filter(Boolean);
                              items.splice(idx, 1);
                              setGeneralFacilities(items.join(', '));
                            }}
                            className="hover:text-rose-600 text-neutral-400 cursor-pointer ml-0.5 font-bold"
                            title={`Hapus "${item}"`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500">
                  Daftar di atas otomatis tampil dengan ikon yang sesuai di Beranda, tersusun dalam kartu ringkas yang dapat diperluas oleh tamu.
                </p>
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
              {/* Rekening 1 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">Nama Bank (1)</label>
                  <input
                    type="text"
                    value={bankBcaName}
                    onChange={(e) => setBankBcaName(e.target.value)}
                    placeholder="BCA"
                    className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">No. Rekening / VA</label>
                  <input
                    type="text"
                    value={bankBcaNo}
                    onChange={(e) => setBankBcaNo(e.target.value)}
                    className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">Atas Nama</label>
                  <input
                    type="text"
                    value={bankBcaHolder}
                    onChange={(e) => setBankBcaHolder(e.target.value)}
                    className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Rekening 2 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">Nama Bank (2)</label>
                  <input
                    type="text"
                    value={bankMandiriName}
                    onChange={(e) => setBankMandiriName(e.target.value)}
                    placeholder="Mandiri"
                    className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">No. Rekening / VA</label>
                  <input
                    type="text"
                    value={bankMandiriNo}
                    onChange={(e) => setBankMandiriNo(e.target.value)}
                    className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700">Atas Nama</label>
                  <input
                    type="text"
                    value={bankMandiriHolder}
                    onChange={(e) => setBankMandiriHolder(e.target.value)}
                    className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
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
