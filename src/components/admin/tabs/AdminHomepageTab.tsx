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
} from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
}

export const AdminHomepageTab: React.FC<Props> = ({ onShowToast }) => {
  const { homepageContent, updateHomepageContent, cmsMedia, uploadMedia } = useBooking();

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

  const [isUploading, setIsUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleSave = () => {
    updateHomepageContent(form);
    onShowToast('✓ Pengaturan Homepage berhasil disimpan!');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const uploaded = await uploadMedia(file, 'hero');
        setForm((prev) => ({ ...prev, hero_image: uploaded.url }));
        onShowToast('✓ Foto hero berhasil diunggah!');
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
                    setShowMediaPicker(false);
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
