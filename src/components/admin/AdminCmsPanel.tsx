import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { SafeImage } from '../common/SafeImage';
import { TB_Homestay, TB_Room, TB_Media } from '../../db/cmsDatabase';
import {
  Layout,
  Home,
  Bed,
  Image as ImageIcon,
  Globe,
  Upload,
  Check,
  Trash2,
  Plus,
  RefreshCw,
  Sparkles,
  MapPin,
  Star,
  Users,
  Eye,
  Sliders,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const AdminCmsPanel: React.FC = () => {
  const {
    homepageContent,
    updateHomepageContent,
    cmsHomestays,
    updateCmsHomestay,
    cmsRooms,
    updateCmsRoom,
    addCmsRoom,
    deleteCmsRoom,
    cmsMedia,
    uploadMedia,
    deleteMedia,
    websiteSettings,
    getWebsiteSetting,
    updateWebsiteSetting,
    updateMultipleSettings,
    resetCmsDatabase,
  } = useBooking();

  // Active sub-menu tab: 'hero' | 'homestay' | 'rooms' | 'media' | 'settings'
  const [activeCmsTab, setActiveCmsTab] = useState<'hero' | 'homestay' | 'rooms' | 'media' | 'settings'>('hero');
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // ==============================================================
  // A. HERO LANDING PAGE STATE
  // ==============================================================
  const [heroForm, setHeroForm] = useState({
    hero_title: homepageContent.hero_title,
    hero_subtitle: homepageContent.hero_subtitle,
    hero_description: homepageContent.hero_description,
    cta_text: homepageContent.cta_text,
    cta_link: homepageContent.cta_link,
    hero_image: homepageContent.hero_image,
    location_badge: homepageContent.location_badge || 'Pantai Sundak & Trenggole, Gunungkidul',
  });

  const handleSaveHero = () => {
    updateHomepageContent(heroForm);
    showToast('✓ Konten Hero Landing Page berhasil diperbarui!');
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const media = await uploadMedia(file, 'hero');
      setHeroForm((prev) => ({ ...prev, hero_image: media.url }));
      updateHomepageContent({ hero_image: media.url });
      showToast('✓ Foto Hero berhasil diupload & disimpan!');
    }
  };

  // ==============================================================
  // B. DATA PENGINAPAN STATE
  // ==============================================================
  const [selectedHomestayId, setSelectedHomestayId] = useState<string>('homestay-sundak');
  const activeHomestay = cmsHomestays.find((h) => h.id === selectedHomestayId) || cmsHomestays[0];

  const [homestayForm, setHomestayForm] = useState<TB_Homestay>({ ...activeHomestay });

  // Update homestayForm when switching homestays
  const handleSwitchHomestay = (id: string) => {
    setSelectedHomestayId(id);
    const target = cmsHomestays.find((h) => h.id === id);
    if (target) {
      setHomestayForm({ ...target });
    }
  };

  const handleSaveHomestay = () => {
    updateCmsHomestay(homestayForm.id, homestayForm);
    showToast(`✓ Data ${homestayForm.nama} berhasil disimpan ke database!`);
  };

  const handleHomestayPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const media = await uploadMedia(file, 'penginapan');
      const updated = {
        ...homestayForm,
        foto_utama: media.url,
        galeri: homestayForm.galeri.includes(media.url) ? homestayForm.galeri : [media.url, ...homestayForm.galeri],
      };
      setHomestayForm(updated);
      updateCmsHomestay(homestayForm.id, updated);
      showToast('✓ Foto penginapan berhasil diupload & diperbarui!');
    }
  };

  // ==============================================================
  // C. DATA KAMAR STATE
  // ==============================================================
  const [selectedRoomId, setSelectedRoomId] = useState<string>('trenggole-kamar-1');
  const activeRoom = cmsRooms.find((r) => r.id === selectedRoomId) || cmsRooms[0];
  const [roomForm, setRoomForm] = useState<TB_Room>({ ...activeRoom });

  const handleSwitchRoom = (id: string) => {
    setSelectedRoomId(id);
    const target = cmsRooms.find((r) => r.id === id);
    if (target) {
      setRoomForm({ ...target });
    }
  };

  const handleSaveRoom = () => {
    updateCmsRoom(roomForm.id, roomForm);
    showToast(`✓ Data ${roomForm.nama_kamar} berhasil disimpan!`);
  };

  const handleRoomPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const media = await uploadMedia(file, 'kamar');
      const updated = { ...roomForm, foto: media.url };
      setRoomForm(updated);
      updateCmsRoom(roomForm.id, updated);
      showToast('✓ Foto kamar berhasil diupload & diperbarui!');
    }
  };

  // ==============================================================
  // D. KELOLA MEDIA STATE
  // ==============================================================
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>('all');
  const displayedMedia =
    mediaCategoryFilter === 'all'
      ? cmsMedia
      : cmsMedia.filter((m) => m.kategori === mediaCategoryFilter);

  const handleGeneralMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, kategori: TB_Media['kategori']) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadMedia(file, kategori);
      showToast(`✓ Foto berhasil diupload ke kategori ${kategori}!`);
    }
  };

  // ==============================================================
  // E. TEKS GLOBAL WEBSITE STATE
  // ==============================================================
  const [settingsForm, setSettingsForm] = useState({
    navbar_brand_name: getWebsiteSetting('navbar_brand_name', 'Griya Barokah Homestay'),
    navbar_tagline: getWebsiteSetting('navbar_tagline', 'Homestay Keluarga Pantai Gunungkidul'),
    homepage_section_title: getWebsiteSetting('homepage_section_title', 'Pilihan Penginapan Homestay'),
    homepage_section_desc: getWebsiteSetting('homepage_section_desc', 'Penginapan keluarga nyaman, ber-AC, dan dekat pantai'),
    booking_instruction: getWebsiteSetting('booking_instruction', 'Pilih lokasi & tanggal menginap, isi data tamu mahrom, dan upload bukti transfer DP 50% atau Lunas 100%.'),
    booking_terms: getWebsiteSetting('booking_terms', 'Khusus keluarga sah / mahrom atau rombongan sesama gender. Dilarang membawa miras atau zat berbahaya.'),
    footer_address: getWebsiteSetting('footer_address', 'Pantai Sundak & Trenggole, Sidoharjo, Tepus, Gunungkidul'),
    footer_whatsapp: getWebsiteSetting('footer_whatsapp', '082138613888'),
    footer_phone: getWebsiteSetting('footer_phone', '+62 821-3861-3888'),
    footer_service_hours: getWebsiteSetting('footer_service_hours', 'Setiap Hari (24 Jam Pelayanan Resepsionis)'),
    footer_extra_info: getWebsiteSetting('footer_extra_info', 'Sewa Jeep Wisata Pantai, Pesanan Seafood, & Info Investasi'),
  });

  const handleSaveAllSettings = () => {
    const records: Record<string, { value: string; kategori?: any }> = {};
    Object.entries(settingsForm).forEach(([key, val]) => {
      let kat = 'homepage';
      if (key.startsWith('navbar_')) kat = 'navbar';
      else if (key.startsWith('booking_')) kat = 'booking';
      else if (key.startsWith('footer_')) kat = 'footer';
      records[key] = { value: val, kategori: kat };
    });
    updateMultipleSettings(records);
    showToast('✓ Semua Teks Global Website berhasil disimpan!');
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-900 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header CMS Banner */}
      <div className="p-4 rounded-[24px] bg-gradient-to-br from-[#13281E] to-[#1E3A2B] text-white shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-black tracking-tight">
              PENGATURAN WEBSITE &amp; CMS ADMIN
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-emerald-300">
            Database Aktif
          </span>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed">
          Admin dapat mengubah seluruh teks, foto, harga, dan fasilitas aplikasi tanpa menyentuh kode.
        </p>

        {/* 5 Sub-menu Tabs */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          <button
            type="button"
            onClick={() => setActiveCmsTab('hero')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeCmsTab === 'hero'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="truncate w-full">Hero</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCmsTab('homestay')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeCmsTab === 'homestay'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="truncate w-full">Penginapan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCmsTab('rooms')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeCmsTab === 'rooms'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span className="truncate w-full">Kamar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCmsTab('media')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeCmsTab === 'media'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="truncate w-full">Media</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCmsTab('settings')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeCmsTab === 'settings'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="truncate w-full">Teks Global</span>
          </button>
        </div>
      </div>

      {/* ==============================================================
          A. HERO LANDING PAGE TAB
         ============================================================== */}
      {activeCmsTab === 'hero' && (
        <div className="bg-white rounded-[24px] p-4 border border-neutral-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                A. Pengaturan Hero Landing Page
              </h3>
              <span className="text-[11px] text-neutral-500">
                Ubah foto hero utama, teks judul, subtitle, dan tombol CTA
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              TB_Homepage_Content
            </span>
          </div>

          {/* Preview Foto Hero Utama */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-neutral-800 block">
              Foto Hero Utama:
            </span>
            <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200">
              <SafeImage
                src={heroForm.hero_image}
                alt="Preview Hero Utama"
                fallbackText="Hero Griya Barokah"
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
              <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold z-20">
                Preview Aktif
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-2 pt-1">
              <label className="flex-1 h-10 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-neutral-200 transition-all">
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Upload Foto Hero Baru</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeroFileUpload}
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setHeroForm((prev) => ({
                    ...prev,
                    hero_image: '/images/sundak_fullhouse_1790552054893.jpg',
                  }))
                }
                className="px-3 h-10 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-semibold hover:bg-neutral-200"
              >
                Reset Foto
              </button>
            </div>
          </div>

          {/* Form Input Teks */}
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Judul Utama Hero:
              </label>
              <input
                type="text"
                value={heroForm.hero_title}
                onChange={(e) => setHeroForm({ ...heroForm, hero_title: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Subtitle Hero:
              </label>
              <input
                type="text"
                value={heroForm.hero_subtitle}
                onChange={(e) => setHeroForm({ ...heroForm, hero_subtitle: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Deskripsi Hero:
              </label>
              <textarea
                rows={3}
                value={heroForm.hero_description}
                onChange={(e) => setHeroForm({ ...heroForm, hero_description: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-normal focus:outline-none focus:ring-1 focus:ring-emerald-700 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Teks Tombol CTA:
                </label>
                <input
                  type="text"
                  value={heroForm.cta_text}
                  onChange={(e) => setHeroForm({ ...heroForm, cta_text: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Target Tampilan CTA:
                </label>
                <select
                  value={heroForm.cta_link}
                  onChange={(e) => setHeroForm({ ...heroForm, cta_link: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-semibold"
                >
                  <option value="accommodations">Halaman Akomodasi</option>
                  <option value="booking_flow">Alur Pemesanan (Booking)</option>
                  <option value="detail">Detail Penginapan</option>
                </select>
              </div>
            </div>

            {/* Simpan Button */}
            <button
              type="button"
              onClick={handleSaveHero}
              className="w-full h-11 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer mt-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan Hero Landing Page</span>
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          B. DATA PENGINAPAN TAB
         ============================================================== */}
      {activeCmsTab === 'homestay' && (
        <div className="bg-white rounded-[24px] p-4 border border-neutral-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                B. Data Penginapan (TB_Homestay)
              </h3>
              <span className="text-[11px] text-neutral-500">
                Pilih penginapan untuk mengedit foto, teks, tarif, dan fasilitas
              </span>
            </div>
          </div>

          {/* Toggle Pilihan Penginapan */}
          <div className="flex p-1 bg-neutral-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleSwitchHomestay('homestay-sundak')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                selectedHomestayId === 'homestay-sundak'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Pantai Sundak (Full House)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchHomestay('homestay-trenggole')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                selectedHomestayId === 'homestay-trenggole'
                  ? 'bg-white text-sky-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Pantai Trenggole (Kamar)
            </button>
          </div>

          {/* Preview Foto Utama Penginapan */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-neutral-800 block">
              Foto Utama Penginapan:
            </span>
            <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200">
              <SafeImage
                src={homestayForm.foto_utama}
                alt={homestayForm.nama}
                fallbackText={homestayForm.nama}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
              <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold z-20">
                Foto Utama
              </div>
            </div>

            <label className="w-full h-10 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-neutral-200 transition-all">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Ganti / Upload Foto Utama Baru</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHomestayPhotoUpload}
              />
            </label>
          </div>

          {/* Form Fields Penginapan */}
          <div className="space-y-3 pt-1 text-xs">
            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Nama Penginapan:
              </label>
              <input
                type="text"
                value={homestayForm.nama}
                onChange={(e) => setHomestayForm({ ...homestayForm, nama: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Lokasi Singkat:
              </label>
              <input
                type="text"
                value={homestayForm.lokasi}
                onChange={(e) => setHomestayForm({ ...homestayForm, lokasi: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Alamat Lengkap:
              </label>
              <input
                type="text"
                value={homestayForm.full_address}
                onChange={(e) => setHomestayForm({ ...homestayForm, full_address: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Teks Konsep Penginapan:
              </label>
              <textarea
                rows={2}
                value={homestayForm.konsep}
                onChange={(e) => setHomestayForm({ ...homestayForm, konsep: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Deskripsi Penginapan:
              </label>
              <textarea
                rows={3}
                value={homestayForm.deskripsi}
                onChange={(e) => setHomestayForm({ ...homestayForm, deskripsi: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 leading-relaxed"
              />
            </div>

            {/* Harga, Kapasitas & Rating */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Tarif Pokok (Rp):
                </label>
                <input
                  type="number"
                  value={homestayForm.harga}
                  onChange={(e) => setHomestayForm({ ...homestayForm, harga: Number(e.target.value) })}
                  className="w-full h-10 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Kapasitas (Orang):
                </label>
                <input
                  type="number"
                  value={homestayForm.kapasitas}
                  onChange={(e) => setHomestayForm({ ...homestayForm, kapasitas: Number(e.target.value) })}
                  className="w-full h-10 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Min. Booking:
                </label>
                <input
                  type="number"
                  value={homestayForm.min_booking}
                  onChange={(e) => setHomestayForm({ ...homestayForm, min_booking: Number(e.target.value) })}
                  className="w-full h-10 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900"
                />
              </div>
            </div>

            {/* Fasilitas (Format Pisah Koma) */}
            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Daftar Fasilitas (Pisahkan dengan tanda koma):
              </label>
              <textarea
                rows={2}
                value={homestayForm.fasilitas.join(', ')}
                onChange={(e) =>
                  setHomestayForm({
                    ...homestayForm,
                    fasilitas: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900"
              />
            </div>

            {/* Simpan Button */}
            <button
              type="button"
              onClick={handleSaveHomestay}
              className="w-full h-11 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer mt-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan Penginapan Ini</span>
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          C. DATA KAMAR TAB
         ============================================================== */}
      {activeCmsTab === 'rooms' && (
        <div className="bg-white rounded-[24px] p-4 border border-neutral-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                C. Data Kamar (TB_Room)
              </h3>
              <span className="text-[11px] text-neutral-500">
                Ubah nama kamar, foto, harga per malam, kapasitas, dan fasilitas
              </span>
            </div>
          </div>

          {/* List Pemilih Kamar */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {cmsRooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleSwitchRoom(room.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#13281E] text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <span>{room.nama_kamar}</span>
                </button>
              );
            })}
          </div>

          {/* Preview Foto Kamar */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-neutral-800 block">
              Foto Kamar:
            </span>
            <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200">
              <SafeImage
                src={roomForm.foto_utama || roomForm.foto || '/images/trenggole_room_1790552085510.jpg'}
                alt={roomForm.nama_kamar}
                fallbackText={roomForm.nama_kamar}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
            </div>

            <label className="w-full h-10 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-neutral-200 transition-all">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Upload Foto Kamar Baru</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleRoomPhotoUpload}
              />
            </label>
          </div>

          {/* Form Input Kamar */}
          <div className="space-y-3 pt-1 text-xs">
            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Nama Kamar:
              </label>
              <input
                type="text"
                value={roomForm.nama_kamar}
                onChange={(e) => setRoomForm({ ...roomForm, nama_kamar: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Harga / Malam (Rp):
                </label>
                <input
                  type="number"
                  value={roomForm.harga}
                  onChange={(e) => setRoomForm({ ...roomForm, harga: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Kapasitas Tamu:
                </label>
                <input
                  type="number"
                  value={roomForm.kapasitas}
                  onChange={(e) => setRoomForm({ ...roomForm, kapasitas: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Info Tempat Tidur:
                </label>
                <input
                  type="text"
                  value={roomForm.bed_info}
                  onChange={(e) => setRoomForm({ ...roomForm, bed_info: e.target.value })}
                  placeholder="Contoh: 1 Queen + 1 Single"
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">
                  Status Kamar:
                </label>
                <select
                  value={roomForm.status}
                  onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as 'aktif' | 'nonaktif' })}
                  className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-semibold"
                >
                  <option value="aktif">Aktif (Tersedia)</option>
                  <option value="nonaktif">Nonaktif (Dalam Perawatan)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Deskripsi Kamar:
              </label>
              <textarea
                rows={2}
                value={roomForm.deskripsi}
                onChange={(e) => setRoomForm({ ...roomForm, deskripsi: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 block mb-1">
                Fasilitas Kamar (Pisahkan dengan koma):
              </label>
              <input
                type="text"
                value={roomForm.fasilitas.join(', ')}
                onChange={(e) =>
                  setRoomForm({
                    ...roomForm,
                    fasilitas: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full h-10 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900"
              />
            </div>

            {/* Simpan Button */}
            <button
              type="button"
              onClick={handleSaveRoom}
              className="w-full h-11 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer mt-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan Kamar Ini</span>
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          D. KELOLA MEDIA (FOTO MANAGEMENT) TAB
         ============================================================== */}
      {activeCmsTab === 'media' && (
        <div className="bg-white rounded-[24px] p-4 border border-neutral-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                D. Kelola Media (TB_Media)
              </h3>
              <span className="text-[11px] text-neutral-500">
                Upload foto langsung dari perangkat, kelola galeri, dan hapus foto
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[10px] font-bold border border-sky-200">
              {cmsMedia.length} Foto
            </span>
          </div>

          {/* Upload Area Baru */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-300 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-neutral-200 flex items-center justify-center mx-auto text-emerald-800">
              <Upload className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-900 block">
                Upload Foto Baru ke Database
              </span>
              <span className="text-[10px] text-neutral-500 block">
                Sistem upload: Admin upload → tersimpan → database menyimpan URL
              </span>
            </div>

            <div className="flex justify-center gap-2 pt-1 flex-wrap">
              <label className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-[11px] font-bold cursor-pointer hover:bg-emerald-900 shadow-2xs active:scale-95 transition-all">
                <span>+ Upload Foto Penginapan</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleGeneralMediaUpload(e, 'penginapan')}
                />
              </label>

              <label className="px-3 py-1.5 rounded-xl bg-sky-800 text-white text-[11px] font-bold cursor-pointer hover:bg-sky-900 shadow-2xs active:scale-95 transition-all">
                <span>+ Upload Foto Kamar</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleGeneralMediaUpload(e, 'kamar')}
                />
              </label>
            </div>
          </div>

          {/* Filter Kategori Media */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
            {['all', 'hero', 'penginapan', 'kamar', 'fasilitas', 'galeri'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setMediaCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all cursor-pointer ${
                  mediaCategoryFilter === cat
                    ? 'bg-[#13281E] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat === 'all' ? 'Semua Foto' : cat}
              </button>
            ))}
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {displayedMedia.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-neutral-200/90 overflow-hidden bg-white shadow-2xs space-y-1.5 p-2"
              >
                <div className="relative h-24 w-full rounded-xl overflow-hidden bg-neutral-900">
                  <SafeImage
                    src={m.url}
                    alt={m.nama_file}
                    fallbackText={m.nama_file}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold capitalize">
                    {m.kategori}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-neutral-800 truncate block">
                    {m.nama_file}
                  </span>
                  <span className="text-[9px] text-neutral-400 block">
                    {m.tanggal_upload} • {m.ukuran || 'JPG'}
                  </span>
                </div>

                {/* Aksi Cepat Media */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      updateHomepageContent({ hero_image: m.url });
                      showToast('✓ Foto dijadikan Hero Utama!');
                    }}
                    className="text-emerald-800 font-bold hover:underline"
                  >
                    Set Hero
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      deleteMedia(m.id);
                      showToast('Foto dihapus dari media manager.');
                    }}
                    className="text-rose-600 font-bold hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          E. TEKS GLOBAL WEBSITE TAB
         ============================================================== */}
      {activeCmsTab === 'settings' && (
        <div className="bg-white rounded-[24px] p-4 border border-neutral-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                E. Teks Global Website (TB_Website_Settings)
              </h3>
              <span className="text-[11px] text-neutral-500">
                Kelola teks navbar, homepage, syarat booking, dan footer
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Navbar & Brand */}
            <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-neutral-200/80 space-y-2">
              <span className="font-black text-xs text-neutral-900 block">
                1. Navbar &amp; Brand
              </span>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Nama Brand:
                </label>
                <input
                  type="text"
                  value={settingsForm.navbar_brand_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, navbar_brand_name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Tagline Brand:
                </label>
                <input
                  type="text"
                  value={settingsForm.navbar_tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, navbar_tagline: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900"
                />
              </div>
            </div>

            {/* Homepage Section */}
            <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-neutral-200/80 space-y-2">
              <span className="font-black text-xs text-neutral-900 block">
                2. Judul Section Beranda
              </span>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Judul Section:
                </label>
                <input
                  type="text"
                  value={settingsForm.homepage_section_title}
                  onChange={(e) => setSettingsForm({ ...settingsForm, homepage_section_title: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Deskripsi Section:
                </label>
                <input
                  type="text"
                  value={settingsForm.homepage_section_desc}
                  onChange={(e) => setSettingsForm({ ...settingsForm, homepage_section_desc: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900"
                />
              </div>
            </div>

            {/* Booking & Syarat */}
            <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-neutral-200/80 space-y-2">
              <span className="font-black text-xs text-neutral-900 block">
                3. Instruksi &amp; Syarat Booking
              </span>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Instruksi Booking:
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.booking_instruction}
                  onChange={(e) => setSettingsForm({ ...settingsForm, booking_instruction: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900"
                />
              </div>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Syarat Mahrom &amp; Ketentuan:
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.booking_terms}
                  onChange={(e) => setSettingsForm({ ...settingsForm, booking_terms: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900"
                />
              </div>
            </div>

            {/* Footer & Kontak */}
            <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-neutral-200/80 space-y-2">
              <span className="font-black text-xs text-neutral-900 block">
                4. Footer &amp; Kontak WhatsApp
              </span>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Alamat Lengkap:
                </label>
                <input
                  type="text"
                  value={settingsForm.footer_address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, footer_address: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    No. WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={settingsForm.footer_whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, footer_whatsapp: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    No. Telepon:
                  </label>
                  <input
                    type="text"
                    value={settingsForm.footer_phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, footer_phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Layanan Tambahan / Info:
                </label>
                <input
                  type="text"
                  value={settingsForm.footer_extra_info}
                  onChange={(e) => setSettingsForm({ ...settingsForm, footer_extra_info: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900"
                />
              </div>
            </div>

            {/* Simpan Button */}
            <button
              type="button"
              onClick={handleSaveAllSettings}
              className="w-full h-11 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer mt-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Seluruh Pengaturan Website</span>
            </button>

            {/* Reset ke Default */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Kembalikan seluruh teks database ke pengaturan bawaan awal?')) {
                  resetCmsDatabase();
                  showToast('Database dikembalikan ke nilai default.');
                }
              }}
              className="w-full py-2 text-center text-[11px] text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              Reset ke Konfigurasi Default Bawaan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
