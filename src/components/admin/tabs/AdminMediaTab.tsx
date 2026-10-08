import React, { useState } from 'react';
import { useBooking } from '../../../context/BookingContext';
import { TB_Media } from '../../../db/cmsDatabase';
import { SafeImage } from '../../common/SafeImage';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  X,
  ExternalLink,
  Plus,
  Filter,
  Star,
  Sparkles,
} from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
}

export const AdminMediaTab: React.FC<Props> = ({ onShowToast }) => {
  const {
    cmsMedia,
    uploadMedia,
    deleteMedia,
    updateHomepageContent,
    cmsHomestays,
    updateCmsHomestay,
    cmsRooms,
    updateCmsRoom,
    updateFacilityImage,
  } = useBooking();

  const [filterCat, setFilterCat] = useState<string>('all');
  const [previewMedia, setPreviewMedia] = useState<TB_Media | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<TB_Media['kategori']>('penginapan');
  const [externalUrlInput, setExternalUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSetPrimaryModal, setShowSetPrimaryModal] = useState<TB_Media | null>(null);

  const filtered = filterCat === 'all' ? cmsMedia : cmsMedia.filter((m) => m.kategori === filterCat);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const res = await uploadMedia(file, selectedKategori);
        if (!res || !res.url || res.url.startsWith('data:')) {
          throw new Error('Upload gagal, periksa koneksi internet dan coba lagi');
        }
        onShowToast(`✓ Foto "${res.nama_file}" berhasil disimpan ke database CMS!`);
      } catch (err: any) {
        alert(err.message || 'Upload gagal, periksa koneksi internet dan coba lagi');
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  const handleAddExternalUrl = () => {
    if (!externalUrlInput.trim()) return;
    try {
      import('../../../db/cmsDatabase').then(({ CMSDatabase }) => {
        CMSDatabase.addMediaItem({
          kategori: selectedKategori,
          url: externalUrlInput.trim(),
          nama_file: `Link Eksternal (${selectedKategori})`,
          tanggal_upload: new Date().toISOString().split('T')[0],
          ukuran: 'URL Web',
        });
        setExternalUrlInput('');
        setShowUrlInput(false);
        onShowToast('✓ Link gambar eksternal berhasil disimpan ke database CMS!');
      });
    } catch {
      // ignore
    }
  };

  const handleApplyAsPrimary = (targetType: string, targetId?: string) => {
    if (!showSetPrimaryModal) return;
    const mediaUrl = showSetPrimaryModal.url;

    if (targetType === 'hero') {
      updateHomepageContent({ hero_image: mediaUrl });
      onShowToast('✓ Foto berhasil diatur sebagai Foto Hero Beranda!');
    } else if (targetType === 'homestay' && targetId) {
      const homestay = cmsHomestays.find((h) => h.id === targetId);
      if (homestay) {
        updateCmsHomestay(targetId, {
          foto_utama: mediaUrl,
          galeri: [mediaUrl, ...(homestay.galeri || []).filter((u) => u !== mediaUrl)],
        });
        onShowToast(`✓ Foto berhasil diatur sebagai Foto Utama ${homestay.nama}!`);
      }
    } else if (targetType === 'room' && targetId) {
      const room = cmsRooms.find((r) => r.id === targetId);
      if (room) {
        updateCmsRoom(targetId, {
          foto_utama: mediaUrl,
          foto: mediaUrl,
          galeri: [mediaUrl, ...(room.galeri || []).filter((u) => u !== mediaUrl)],
        });
        onShowToast(`✓ Foto berhasil diatur sebagai Foto Utama ${room.nama_kamar}!`);
      }
    } else if (targetType === 'fasilitas') {
      updateFacilityImage(mediaUrl);
      onShowToast('✓ Foto berhasil diatur sebagai Foto Fasilitas Penginapan!');
    }
    setShowSetPrimaryModal(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar & Upload Panel */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900">Kelola Media Foto</h3>
              <p className="text-[10px] text-neutral-400">Total {cmsMedia.length} aset gambar tersimpan</p>
            </div>
          </div>
        </div>

        {/* Upload Controls */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-600">Kategori Media</label>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value as any)}
              className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold"
            >
              <option value="penginapan">Penginapan (Bangunan)</option>
              <option value="kamar">Kamar Tidur</option>
              <option value="hero">Hero Landing Page</option>
              <option value="fasilitas">Fasilitas / Ruang Tamu</option>
              <option value="galeri">Galeri Lainnya</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-600">Unggah File Gambar</label>
            <label className="w-full h-8 px-2 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Memproses...' : 'Pilih Foto'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Filter Kategori Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {['all', 'penginapan', 'kamar', 'hero', 'fasilitas', 'galeri'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`h-7 px-3 rounded-lg font-bold capitalize transition-all cursor-pointer shrink-0 ${
              filterCat === cat
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            {cat === 'all' ? `Semua (${cmsMedia.length})` : cat}
          </button>
        ))}
      </div>

      {/* Grid Galeri Media (Preview & Aksi) */}
      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="group rounded-2xl bg-white border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col justify-between"
          >
            {/* Foto Thumbnail dengan Preview Modal Trigger */}
            <div
              onClick={() => setPreviewMedia(m)}
              className="relative aspect-video w-full bg-neutral-100 overflow-hidden cursor-pointer"
            >
              <SafeImage
                src={m.url}
                alt={m.nama_file}
                fallbackText={m.nama_file}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold uppercase">
                {m.kategori}
              </span>
            </div>

            {/* Info & Aksi Card */}
            <div className="p-2.5 space-y-2">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-neutral-900 truncate" title={m.nama_file}>
                  {m.nama_file}
                </div>
                <div className="text-[9px] text-neutral-400">
                  {m.tanggal_upload || 'Tersimpan'} {m.ukuran ? `• ${m.ukuran}` : ''}
                </div>
              </div>

              {/* Tombol Atur Foto Utama & Hapus */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowSetPrimaryModal(m)}
                  className="flex-1 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center gap-1 border border-emerald-200 cursor-pointer active:scale-95 transition-all"
                  title="Jadikan Foto Utama"
                >
                  <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  <span>Jadikan Utama</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingId(m.id)}
                  className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 cursor-pointer active:scale-95 transition-all"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Preview Foto Resolusi Penuh */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="relative w-full max-w-sm bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl p-2 space-y-2 text-white">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-bold truncate max-w-[200px]">{previewMedia.nama_file}</span>
              <button
                onClick={() => setPreviewMedia(null)}
                className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative max-h-[60vh] w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={previewMedia.url}
                alt={previewMedia.nama_file}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            <div className="p-2 space-y-1.5 text-xs">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Kategori: {previewMedia.kategori.toUpperCase()}</span>
                <span>{previewMedia.ukuran || ''}</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-800 text-[10px] text-neutral-300 break-all select-all font-mono">
                {previewMedia.url}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atur Foto Utama */}
      {showSetPrimaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-4 space-y-3 shadow-xl border border-neutral-200">
            <h4 className="text-xs font-black text-neutral-900">Atur Sebagai Foto Utama</h4>
            <p className="text-[11px] text-neutral-500">
              Pilih di mana foto ini ingin dipasang sebagai foto utama:
            </p>

            <div className="space-y-1.5 pt-1 max-h-64 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => handleApplyAsPrimary('hero')}
                className="w-full h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold flex items-center justify-between px-3 cursor-pointer"
              >
                <span>Foto Hero Beranda</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              </button>

              <button
                type="button"
                onClick={() => handleApplyAsPrimary('fasilitas')}
                className="w-full h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold flex items-center justify-between px-3 cursor-pointer"
              >
                <span>Foto Fasilitas Penginapan</span>
                <Check className="w-3.5 h-3.5 text-blue-600" />
              </button>

              {cmsHomestays.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => handleApplyAsPrimary('homestay', h.id)}
                  className="w-full h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold flex items-center justify-between px-3 cursor-pointer"
                >
                  <span className="truncate">{h.nama.replace('Griya Barokah ', '')} (Utama)</span>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                </button>
              ))}

              {cmsRooms.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleApplyAsPrimary('room', r.id)}
                  className="w-full h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold flex items-center justify-between px-3 cursor-pointer"
                >
                  <span className="truncate">Foto {r.nama_kamar}</span>
                  <Check className="w-3.5 h-3.5 text-indigo-700" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowSetPrimaryModal(null)}
              className="w-full h-8 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-bold mt-2"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-4 space-y-3 shadow-xl border border-neutral-200">
            <h4 className="text-xs font-black text-rose-700">Hapus Foto</h4>
            <p className="text-[11px] text-neutral-600">
              Apakah Anda yakin ingin menghapus foto ini dari galeri media?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 h-8 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteMedia(deletingId);
                  setDeletingId(null);
                  onShowToast('✓ Foto berhasil dihapus dari media library.');
                }}
                className="flex-1 h-8 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
