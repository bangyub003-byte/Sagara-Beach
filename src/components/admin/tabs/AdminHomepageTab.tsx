import React, { useState } from 'react';
import { useBooking } from '../../../context/BookingContext';
import { SafeImage } from '../../common/SafeImage';
import {
  Sparkles,
  Upload,
  Check,
  Image as ImageIcon,
  ExternalLink,
  RotateCcw,
  Sliders,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
}

export const AdminHomepageTab: React.FC<Props> = ({ onShowToast }) => {
  const {
    homepageContent,
    updateHomepageContent,
    cmsMedia,
    uploadMedia,
    getWebsiteSetting,
    updateWebsiteSetting,
    updateMultipleSettings,
  } = useBooking();

  const [form, setForm] = useState({
    hero_title: homepageContent.hero_title || 'Penginapan Nyaman Dekat Pantai Sundak & Trenggole',
    hero_subtitle: homepageContent.hero_subtitle || 'Nikmati suasana pantai Gunungkidul bersama keluarga tercinta',
    hero_description:
      homepageContent.hero_description ||
      'Pilihan penginapan syariah terbaik berfasilitas lengkap AC, dapur masak komplit, ruang keluarga luas, dan berjarak jalan kaki langsung ke bibir pantai berpasir putih.',
    cta_text: homepageContent.cta_text || 'Pilih & Pesan Homestay Sekarang',
    cta_link: homepageContent.cta_link || 'accommodations',
    hero_image: homepageContent.hero_image || '/images/sundak_fullhouse_1790552054893.jpg',
    location_badge: homepageContent.location_badge || 'Pantai Sundak & Trenggole, Gunungkidul',
  });

  const [facilityBannerImage, setFacilityBannerImage] = useState(
    getWebsiteSetting('facility_banner_image') ||
      getWebsiteSetting('facility_image', '/images/living_room_1790552074900.jpg')
  );
  const [facilityBannerTitle, setFacilityBannerTitle] = useState(
    getWebsiteSetting('facility_banner_title', 'Ruang Keluarga & Fasilitas Bersama')
  );
  const [facilityBannerSubtitle, setFacilityBannerSubtitle] = useState(
    getWebsiteSetting('facility_banner_subtitle', 'Suasana hangat untuk berkumpul bersama keluarga santai')
  );
  const [generalFacilities, setGeneralFacilities] = useState(
    getWebsiteSetting(
      'general_facilities',
      'Semua Kamar Ber-AC, KM Duduk & Jongkok, Dapur Lengkap & Gas, Kulkas & TV Keluarga, Tersedia 13 Extra Bed, Free WiFi Cepat'
    )
  );

  const [newFacilityInput, setNewFacilityInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingFacility, setIsUploadingFacility] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showFacilityMediaPicker, setShowFacilityMediaPicker] = useState(false);

  // Helper daftar fasilitas array
  const facilityItems = generalFacilities
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const handleAddFacilityItem = () => {
    const trimmed = newFacilityInput.trim();
    if (!trimmed) return;
    const updatedList = [...facilityItems, trimmed];
    setGeneralFacilities(updatedList.join(', '));
    setNewFacilityInput('');
  };

  const handleRemoveFacilityItem = (indexToRemove: number) => {
    const updatedList = facilityItems.filter((_, idx) => idx !== indexToRemove);
    setGeneralFacilities(updatedList.join(', '));
  };

  const handleUpdateFacilityItem = (indexToUpdate: number, newVal: string) => {
    const updatedList = [...facilityItems];
    updatedList[indexToUpdate] = newVal;
    setGeneralFacilities(updatedList.join(', '));
  };

  const handleSave = () => {
    updateHomepageContent(form);
    updateMultipleSettings({
      facility_banner_image: { value: facilityBannerImage, kategori: 'homepage' },
      facility_image: { value: facilityBannerImage, kategori: 'homepage' },
      facility_banner_title: { value: facilityBannerTitle, kategori: 'homepage' },
      facility_banner_subtitle: { value: facilityBannerSubtitle, kategori: 'homepage' },
      general_facilities: { value: generalFacilities, kategori: 'homepage' },
    });
    onShowToast('✓ Pengaturan Homepage & Fasilitas Lengkap berhasil disimpan!');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const uploaded = await uploadMedia(file, 'hero');
        setForm((prev) => ({ ...prev, hero_image: uploaded.url }));
        updateHomepageContent({ hero_image: uploaded.url });
        onShowToast('✓ Foto hero berhasil diunggah & langsung diterapkan ke Beranda!');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Kartu Preview Foto Hero */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900">Foto Hero Landing Page</h3>
              <p className="text-[10px] text-neutral-400">Gambar utama yang tampil di beranda depan</p>
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-2xs">
          <SafeImage
            src={form.hero_image}
            alt="Hero Preview"
            fallbackText="Griya Barokah Homestay"
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-neutral-900 text-[10px] font-bold shadow-2xs">
            {form.location_badge}
          </div>
          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
            <h4 className="text-xs font-bold truncate drop-shadow-sm">{form.hero_title}</h4>
            <p className="text-[10px] opacity-90 truncate drop-shadow-sm">{form.hero_subtitle}</p>
          </div>
        </div>

        {/* Kontrol Upload / Ganti Foto */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <label className="flex-1 h-9 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-200 active:scale-95 transition-all">
              <Upload className="w-3.5 h-3.5 text-neutral-600" />
              <span>{isUploading ? 'Mengunggah...' : 'Upload Foto Hero Baru'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileChange}
              />
            </label>

            <button
              type="button"
              onClick={() => setShowMediaPicker(!showMediaPicker)}
              className="px-3 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 cursor-pointer"
            >
              Pilih Media
            </button>
          </div>

          <input
            type="url"
            value={form.hero_image}
            onChange={(e) => setForm((prev) => ({ ...prev, hero_image: e.target.value }))}
            placeholder="Atau tempel URL gambar permanen..."
            className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-[11px] text-neutral-800 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Pilihan Foto Dari Galeri Media */}
        {showMediaPicker && (
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
            <span className="text-[10px] font-bold text-neutral-600">Pilih dari Media Tersimpan:</span>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto no-scrollbar">
              {cmsMedia.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, hero_image: m.url }));
                    updateHomepageContent({ hero_image: m.url });
                    setShowMediaPicker(false);
                    onShowToast('✓ Foto hero beranda berhasil diterapkan!');
                  }}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    form.hero_image === m.url ? 'border-emerald-600 ring-2 ring-emerald-500' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <img src={m.url} alt={m.nama_file} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Teks Hero & CTA */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-neutral-900">Teks & Konten Beranda</h3>
          </div>
          <span className="text-[10px] text-neutral-400">Live Editor</span>
        </div>

        {/* Judul Hero */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-neutral-700">Judul Utama (Hero Title)</label>
          <input
            type="text"
            value={form.hero_title}
            onChange={(e) => setForm((prev) => ({ ...prev, hero_title: e.target.value }))}
            className="w-full h-9 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
            placeholder="Contoh: Penginapan Nyaman Dekat Pantai Sundak & Trenggole"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-neutral-700">Subjudul (Hero Subtitle)</label>
          <input
            type="text"
            value={form.hero_subtitle}
            onChange={(e) => setForm((prev) => ({ ...prev, hero_subtitle: e.target.value }))}
            className="w-full h-9 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
            placeholder="Contoh: Nikmati suasana pantai Gunungkidul bersama keluarga tercinta"
          />
        </div>

        {/* Deskripsi */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-neutral-700">Deskripsi Ringkas</label>
          <textarea
            rows={3}
            value={form.hero_description}
            onChange={(e) => setForm((prev) => ({ ...prev, hero_description: e.target.value }))}
            className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600 resize-none leading-relaxed"
            placeholder="Deskripsi keunggulan homestay yang menarik tamu..."
          />
        </div>

        {/* Tombol CTA & Lokasi */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-700">Teks Tombol CTA</label>
            <input
              type="text"
              value={form.cta_text}
              onChange={(e) => setForm((prev) => ({ ...prev, cta_text: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
              placeholder="Pilih & Pesan Homestay"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-700">Badge Lokasi</label>
            <input
              type="text"
              value={form.location_badge}
              onChange={(e) => setForm((prev) => ({ ...prev, location_badge: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
              placeholder="Pantai Sundak & Trenggole"
            />
          </div>
        </div>

        {/* ==============================================================
            BAGIAN FASILITAS LENGKAP PENGINAPAN (BERANDA)
           ============================================================== */}
        <div className="pt-4 border-t border-neutral-200/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                  Fasilitas Lengkap Penginapan (Beranda)
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Kelola banner, judul, subjudul, dan daftar fasilitas yang tampil di beranda
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {facilityItems.length} Item
            </span>
          </div>

          {/* 1. Preview Banner Fasilitas */}
          <div className="relative w-full h-36 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-2xs">
            <SafeImage
              src={facilityBannerImage}
              alt="Fasilitas Preview"
              fallbackText="Fasilitas Griya Barokah"
              className="w-full h-full object-cover"
              containerClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 text-white">
              <span className="text-[10px] font-bold text-emerald-300 block">
                {facilityBannerTitle || 'Ruang Keluarga & Fasilitas Bersama'}
              </span>
              <p className="text-[11px] text-neutral-200 line-clamp-1">
                {facilityBannerSubtitle || 'Suasana hangat untuk berkumpul bersama keluarga santai'}
              </p>
            </div>
          </div>

          {/* 2. Upload / Ganti Foto Banner Fasilitas */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-700">Foto Banner Bagian Fasilitas</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={facilityBannerImage}
                onChange={(e) => setFacilityBannerImage(e.target.value)}
                placeholder="URL gambar fasilitas..."
                className="flex-1 h-9 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
              />
              <label className="h-9 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                <Upload className="w-3.5 h-3.5 text-neutral-600" />
                <span>{isUploadingFacility ? 'Unggah...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingFacility}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setIsUploadingFacility(true);
                      try {
                        const res = await uploadMedia(f, 'fasilitas');
                        setFacilityBannerImage(res.url);
                        onShowToast('✓ Foto fasilitas berhasil diunggah!');
                      } finally {
                        setIsUploadingFacility(false);
                      }
                    }
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => setShowFacilityMediaPicker(!showFacilityMediaPicker)}
                className="px-3 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 cursor-pointer"
              >
                Pilih Media
              </button>
            </div>

            {/* Pilihan Galeri Media untuk Fasilitas */}
            {showFacilityMediaPicker && (
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 mt-2">
                <span className="text-[10px] font-bold text-neutral-600">Pilih dari Media Tersimpan:</span>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                  {cmsMedia.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setFacilityBannerImage(m.url);
                        setShowFacilityMediaPicker(false);
                        onShowToast('✓ Foto banner fasilitas berhasil diterapkan!');
                      }}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        facilityBannerImage === m.url
                          ? 'border-emerald-600 ring-2 ring-emerald-500'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <img src={m.url} alt={m.nama_file} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Edit Judul & Subjudul Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Judul Banner Fasilitas</label>
              <input
                type="text"
                value={facilityBannerTitle}
                onChange={(e) => setFacilityBannerTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                placeholder="Ruang Keluarga & Fasilitas Bersama"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Subjudul Banner Fasilitas</label>
              <input
                type="text"
                value={facilityBannerSubtitle}
                onChange={(e) => setFacilityBannerSubtitle(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                placeholder="Suasana hangat untuk berkumpul bersama keluarga santai"
              />
            </div>
          </div>

          {/* 4. Kelola Daftar Fasilitas (Tambah, Hapus, Ubah Teks Tiap Item) */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
              <span>Daftar Fasilitas (Item Interaktif)</span>
              <span className="text-[10px] text-neutral-400 font-normal">Disimpan sebagai teks dipisah koma</span>
            </label>

            {/* Input Tambah Fasilitas Baru */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFacilityInput}
                onChange={(e) => setNewFacilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFacilityItem();
                  }
                }}
                placeholder="Tambah item baru, misal: Kolam Renang Anak..."
                className="flex-1 h-9 px-3 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={handleAddFacilityItem}
                className="h-9 px-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {/* Daftar Fasilitas Editable Per-Baris */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar p-1 bg-neutral-50/80 rounded-xl border border-neutral-200/70">
              {facilityItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-neutral-200/90 shadow-2xs group"
                >
                  <span className="w-5 text-center text-[10px] font-bold text-neutral-400">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateFacilityItem(index, e.target.value)}
                    className="flex-1 h-7 px-2 rounded-md bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-transparent focus:border-emerald-600 text-xs text-neutral-800 font-medium focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFacilityItem(index)}
                    className="w-7 h-7 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                    title="Hapus fasilitas ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {facilityItems.length === 0 && (
                <div className="p-3 text-center text-xs text-neutral-400">
                  Belum ada fasilitas. Masukkan teks dan klik "Tambah".
                </div>
              )}
            </div>

            {/* Raw Textarea Fallback/Direct Edit (Sama Seperti Guest Relations) */}
            <details className="text-[11px] text-neutral-500 pt-1">
              <summary className="cursor-pointer hover:text-neutral-700 font-medium">
                Tampilkan editor teks mentah (dipisah koma)
              </summary>
              <textarea
                rows={2}
                value={generalFacilities}
                onChange={(e) => setGeneralFacilities(e.target.value)}
                placeholder="Semua Kamar Ber-AC, KM Duduk & Jongkok, Dapur Lengkap & Gas..."
                className="w-full mt-1.5 p-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 resize-none leading-relaxed focus:outline-none focus:border-emerald-600 font-mono"
              />
            </details>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full h-10 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan Homepage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

