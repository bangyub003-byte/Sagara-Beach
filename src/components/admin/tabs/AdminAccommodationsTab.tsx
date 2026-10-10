import React, { useState } from 'react';
import { useBooking } from '../../../context/BookingContext';
import { TB_Homestay } from '../../../db/cmsDatabase';
import { SafeImage } from '../../common/SafeImage';
import {
  Building,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  MapPin,
  Star,
  Users,
  ShieldCheck,
  DollarSign,
  Link as LinkIcon,
  Phone,
} from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
}

export const AdminAccommodationsTab: React.FC<Props> = ({ onShowToast }) => {
  const {
    cmsHomestays,
    addCmsHomestay,
    updateCmsHomestay,
    deleteCmsHomestay,
    uploadMedia,
  } = useBooking();

  const [editingHomestay, setEditingHomestay] = useState<TB_Homestay | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [fotoUtama, setFotoUtama] = useState('');
  const [galeri, setGaleri] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [konsep, setKonsep] = useState('');
  const [harga, setHarga] = useState<number>(75000);
  const [hargaLabel, setHargaLabel] = useState('/orang/malam');
  const [kapasitas, setKapasitas] = useState<number>(20);
  const [minBooking, setMinBooking] = useState<number>(4);
  const [fasilitasArr, setFasilitasArr] = useState<string[]>([]);
  const [newFasilitasText, setNewFasilitasText] = useState('');
  const [peraturanArr, setPeraturanArr] = useState<string[]>([]);
  const [newPeraturanText, setNewPeraturanText] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [badge, setBadge] = useState('');
  const [whatsappContact, setWhatsappContact] = useState('082138613888');
  const [propertyType, setPropertyType] = useState<'full_homestay' | 'individual_rooms'>('full_homestay');
  const [rating, setRating] = useState<number>(4.9);
  const [reviewsCount, setReviewsCount] = useState<number>(120);

  const openAddModal = () => {
    setEditingHomestay(null);
    setIsAddingNew(true);
    setNama('Griya Barokah Baru');
    setLokasi('Pantai Sundak, Gunungkidul');
    setFullAddress('Kawasan Wisata Pantai Sundak, Sidoharjo, Tepus, Gunungkidul');
    const defaultImg = '/images/sundak_fullhouse_1790552054893.jpg';
    setFotoUtama(defaultImg);
    setGaleri([defaultImg]);
    setUrlInput('');
    setDeskripsi('Penginapan keluarga yang asri dan nyaman dekat pantai.');
    setKonsep('Satu Rumah Penuh (Full House) untuk rombongan keluarga besar.');
    setHarga(75000);
    setHargaLabel('/orang/malam');
    setKapasitas(20);
    setMinBooking(4);
    setFasilitasArr(['AC', 'WiFi Cepat', 'Kamar Mandi Dalam', 'Dapur Lengkap', 'Parkir Mobil']);
    setNewFasilitasText('');
    setPeraturanArr(['Khusus keluarga sah / mahrom', 'Dilarang minuman keras / narkoba', 'Jaga kebersihan & ketertiban']);
    setNewPeraturanText('');
    setStatus('aktif');
    setBadge('PENGINAPAN KELUARGA');
    setWhatsappContact('082138613888');
    setPropertyType('full_homestay');
    setRating(4.9);
    setReviewsCount(120);
  };

  const openEditModal = (h: TB_Homestay) => {
    setEditingHomestay(h);
    setIsAddingNew(false);
    setNama(h.nama);
    setLokasi(h.lokasi);
    setFullAddress(h.full_address || '');
    setFotoUtama(h.foto_utama || '/images/sundak_fullhouse_1790552054893.jpg');
    const existingGaleri =
      Array.isArray(h.galeri) && h.galeri.length > 0
        ? h.galeri
        : [h.foto_utama || '/images/sundak_fullhouse_1790552054893.jpg'];
    setGaleri(existingGaleri);
    setUrlInput('');
    setDeskripsi(h.deskripsi || '');
    setKonsep(h.konsep || '');
    setHarga(h.harga);
    setHargaLabel(h.harga_label || '/orang/malam');
    setKapasitas(h.kapasitas);
    setMinBooking(h.min_booking);
    setFasilitasArr(Array.isArray(h.fasilitas) ? [...h.fasilitas] : []);
    setNewFasilitasText('');
    setPeraturanArr(Array.isArray(h.peraturan) ? [...h.peraturan] : []);
    setNewPeraturanText('');
    setStatus(h.status || 'aktif');
    setBadge(h.badge || '');
    setWhatsappContact(h.whatsapp_contact || '082138613888');
    setPropertyType(h.property_type);
    setRating(typeof h.rating === 'number' ? h.rating : 4.9);
    setReviewsCount(typeof h.reviews_count === 'number' ? h.reviews_count : 120);
  };

  // Fasilitas handlers
  const handleAddFasilitas = () => {
    const trimmed = newFasilitasText.trim();
    if (!trimmed) return;
    if (!fasilitasArr.includes(trimmed)) {
      setFasilitasArr([...fasilitasArr, trimmed]);
    }
    setNewFasilitasText('');
  };

  const handleRemoveFasilitas = (idx: number) => {
    setFasilitasArr(fasilitasArr.filter((_, i) => i !== idx));
  };

  // Peraturan handlers
  const handleAddPeraturan = () => {
    const trimmed = newPeraturanText.trim();
    if (!trimmed) return;
    if (!peraturanArr.includes(trimmed)) {
      setPeraturanArr([...peraturanArr, trimmed]);
    }
    setNewPeraturanText('');
  };

  const handleRemovePeraturan = (idx: number) => {
    setPeraturanArr(peraturanArr.filter((_, i) => i !== idx));
  };

  // Galeri handlers
  const handleAddUrlToGaleri = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setGaleri((prev) => (!prev.includes(trimmed) ? [...prev, trimmed] : prev));
    setFotoUtama((prev) => prev || trimmed);
    onShowToast('✓ Foto berhasil ditambahkan ke galeri penginapan!');
    setUrlInput('');
  };

  const handleSetFotoUtama = (url: string) => {
    setFotoUtama(url);
    onShowToast('✓ Foto utama penginapan berhasil diubah!');
  };

  const handleDeleteFotoGaleri = (urlToDelete: string) => {
    if (galeri.length <= 1) {
      alert('Minimal harus ada 1 foto di dalam galeri!');
      return;
    }
    setGaleri((prev) => {
      const updated = prev.filter((u) => u !== urlToDelete);
      if (fotoUtama === urlToDelete && updated.length > 0) {
        setFotoUtama(updated[0]);
      }
      return updated;
    });
    onShowToast('✓ Foto dihapus dari galeri penginapan.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const media = await uploadMedia(file, 'penginapan');
        if (!media || !media.url || media.url.startsWith('data:')) {
          throw new Error('Upload gagal, periksa koneksi internet dan coba lagi');
        }
        setGaleri((prev) => [...prev, media.url]);
        setFotoUtama((prev) => prev || media.url);
        onShowToast('✓ Foto berhasil diunggah & masuk ke galeri!');
      } catch (err: any) {
        alert(err.message || 'Upload gagal, periksa koneksi internet dan coba lagi');
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleSave = () => {
    if (!nama.trim()) {
      alert('Nama penginapan tidak boleh kosong!');
      return;
    }

    const finalFotoUtama = fotoUtama || galeri[0] || '/images/sundak_fullhouse_1790552054893.jpg';
    const finalGaleri = galeri.length > 0 ? galeri : [finalFotoUtama];

    const payload: TB_Homestay = {
      id: editingHomestay ? editingHomestay.id : `homestay-${Date.now()}`,
      nama: nama.trim(),
      lokasi: lokasi.trim(),
      full_address: fullAddress.trim(),
      foto_utama: finalFotoUtama,
      galeri: finalGaleri,
      deskripsi: deskripsi.trim(),
      konsep: konsep.trim(),
      harga: Number(harga),
      harga_label: hargaLabel.trim() || '/orang/malam',
      kapasitas: Number(kapasitas),
      min_booking: Number(minBooking),
      fasilitas: fasilitasArr,
      peraturan: peraturanArr,
      status,
      rating: Number(rating) || 4.9,
      reviews_count: Number(reviewsCount) || 0,
      badge: badge.trim() || 'HOMESTAY',
      property_type: propertyType,
      whatsapp_contact: whatsappContact.trim() || '082138613888',
    };

    if (editingHomestay) {
      updateCmsHomestay(editingHomestay.id, payload);
      onShowToast(`✓ Penginapan "${nama}" berhasil diperbarui!`);
    } else {
      addCmsHomestay(payload);
      onShowToast(`✓ Penginapan baru "${nama}" berhasil ditambahkan!`);
    }

    setIsAddingNew(false);
    setEditingHomestay(null);
  };

  const handleDelete = (id: string, name: string) => {
    deleteCmsHomestay(id);
    setDeletingId(null);
    onShowToast(`✓ Penginapan "${name}" berhasil dihapus.`);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar + Tombol Tambah */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-neutral-900">Kelola Penginapan</h2>
          <p className="text-[10px] text-neutral-400">Total {cmsHomestays.length} unit homestay terdaftar</p>
        </div>
        <button
          onClick={openAddModal}
          className="h-8 px-3 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Penginapan</span>
        </button>
      </div>

      {/* Daftar Penginapan Cards */}
      <div className="space-y-3">
        {cmsHomestays.map((h) => {
          const homestayGaleri =
            Array.isArray(h.galeri) && h.galeri.length > 0
              ? h.galeri
              : [h.foto_utama || '/images/sundak_fullhouse_1790552054893.jpg'];

          return (
            <div
              key={h.id}
              className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3"
            >
              <div className="flex gap-2.5 sm:gap-3">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                  <SafeImage
                    src={h.foto_utama || homestayGaleri[0]}
                    alt={h.nama}
                    fallbackText={h.nama}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <span
                    className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                      h.status === 'aktif' ? 'bg-emerald-600 text-white' : 'bg-neutral-600 text-white'
                    }`}
                  >
                    {h.status}
                  </span>
                  <div className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-white text-[8px] font-bold">
                    {homestayGaleri.length} foto
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs font-black text-neutral-900 truncate">{h.nama}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{h.rating || 4.9}</span>
                      <span className="text-[9px] text-neutral-400 font-normal">({h.reviews_count ?? 120} ulasan)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-neutral-500 truncate">
                    <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate">{h.lokasi}</span>
                  </div>

                  <div className="text-xs font-extrabold text-emerald-950">
                    Rp {h.harga.toLocaleString('id-ID')}{' '}
                    <span className="text-[10px] font-normal text-neutral-500">{h.harga_label}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[9px] sm:text-[10px] text-neutral-500 pt-0.5">
                    <span className="bg-neutral-100 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                      Kapasitas {h.kapasitas} org
                    </span>
                    <span className="bg-neutral-100 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                      Min. {h.min_booking} org
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                      {h.property_type === 'full_homestay' ? 'Full House' : 'Per Kamar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Aksi Edit & Hapus */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => openEditModal(h)}
                  className="flex-1 min-w-0 h-8 px-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all truncate"
                >
                  <Edit3 className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  <span className="truncate">Edit Data & Galeri ({homestayGaleri.length})</span>
                </button>

                <button
                  onClick={() => setDeletingId(h.id)}
                  className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-rose-200 shrink-0"
                  title="Hapus Penginapan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-4 space-y-3 shadow-xl border border-neutral-200">
            <h4 className="text-xs font-black text-rose-700">Konfirmasi Hapus Penginapan</h4>
            <p className="text-[11px] text-neutral-600">
              Apakah Anda yakin ingin menghapus penginapan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const target = cmsHomestays.find((h) => h.id === deletingId);
                  if (target) handleDelete(target.id, target.nama);
                }}
                className="flex-1 h-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Penginapan Lengkap */}
      {(isAddingNew || editingHomestay) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl my-4 max-h-[92vh] overflow-y-auto no-scrollbar border border-neutral-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs sm:text-sm font-black text-neutral-900">
                  {isAddingNew ? 'Tambah Penginapan Baru' : `Edit: ${editingHomestay?.nama}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingHomestay(null);
                }}
                className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nama & Tipe Sewa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Nama Penginapan</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Griya Barokah Pantai Sundak"
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Tipe Sewa</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full h-9 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="full_homestay">Satu Rumah Penuh (Full House)</option>
                  <option value="individual_rooms">Per Kamar / Kamar Terpisah</option>
                </select>
              </div>
            </div>

            {/* Lokasi Ringkas & Kontak WA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Lokasi Ringkas</label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Pantai Sundak, Gunungkidul"
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-neutral-400" />
                  <span>Kontak WhatsApp</span>
                </label>
                <input
                  type="text"
                  value={whatsappContact}
                  onChange={(e) => setWhatsappContact(e.target.value)}
                  placeholder="082138613888"
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Alamat Lengkap (Peta)</label>
              <input
                type="text"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Sidoharjo, Tepus, Gunungkidul, D.I. Yogyakarta"
                className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* KELOLA LENGKAP GALERI FOTO PENGINAPAN */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    Galeri Foto Penginapan
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Total {galeri.length} foto • Foto pertama otomatis menjadi foto sampul
                  </span>
                </div>
                <label className="h-8 px-3 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Tambah Foto via URL */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Tempel tautan URL foto baru..."
                    className="w-full h-8 pl-8 pr-2 rounded-xl bg-white border border-neutral-200 text-[11px] text-neutral-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddUrlToGaleri}
                  className="h-8 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah URL</span>
                </button>
              </div>

              {/* Grid Thumbnail Galeri */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                {galeri.map((imgUrl, idx) => {
                  const isPrimary = imgUrl === fotoUtama;
                  return (
                    <div
                      key={idx}
                      className={`relative group rounded-xl overflow-hidden border bg-white shadow-2xs transition-all ${
                        isPrimary
                          ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div className="h-20 w-full overflow-hidden bg-neutral-200">
                        <img
                          src={imgUrl}
                          alt={`Galeri ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Badge Utama */}
                      {isPrimary ? (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[8px] font-black uppercase shadow-xs flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>Utama</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetFotoUtama(imgUrl)}
                          className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 hover:bg-black/80 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          Set Utama
                        </button>
                      )}

                      {/* Tombol Hapus */}
                      <button
                        type="button"
                        onClick={() => handleDeleteFotoGaleri(imgUrl)}
                        title="Hapus foto dari galeri"
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] shadow-xs cursor-pointer active:scale-90"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>

                      {/* Tombol Jadikan Utama di bawah thumbnail jika belum utama */}
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetFotoUtama(imgUrl)}
                          className="w-full py-1 text-center bg-neutral-100 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-800 text-[9px] font-bold cursor-pointer border-t border-neutral-100"
                        >
                          Pilih Utama
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tarif, Label, Kapasitas & Minimal Booking */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Harga (Rp)</label>
                <input
                  type="number"
                  value={harga}
                  onChange={(e) => setHarga(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Label Harga</label>
                <input
                  type="text"
                  value={hargaLabel}
                  onChange={(e) => setHargaLabel(e.target.value)}
                  placeholder="/orang/malam"
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Kapasitas (Pax)</label>
                <input
                  type="number"
                  value={kapasitas}
                  onChange={(e) => setKapasitas(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Min. Booking</label>
                <input
                  type="number"
                  value={minBooking}
                  onChange={(e) => setMinBooking(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Konsep Sewa */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Konsep Sewa</label>
              <textarea
                rows={2}
                value={konsep}
                onChange={(e) => setKonsep(e.target.value)}
                placeholder="Penjelasan konsep sewa (misal: Sewa Full House per orang atau Sewa per kamar)"
                className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs leading-relaxed resize-none focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Deskripsi Lengkap */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Deskripsi Lengkap</label>
              <textarea
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Deskripsi fasilitas, keunggulan dekat pantai..."
                className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs leading-relaxed resize-none focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Kelola Fasilitas Interaktif */}
            <div className="space-y-2 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
              <label className="text-[11px] font-bold text-neutral-800 block">
                Daftar Fasilitas Penginapan
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                {fasilitasArr.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-300 text-neutral-800 text-[11px] font-semibold shadow-2xs"
                  >
                    <span>{f}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFasilitas(i)}
                      className="w-3.5 h-3.5 rounded-full hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center cursor-pointer text-neutral-400"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newFasilitasText}
                  onChange={(e) => setNewFasilitasText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFasilitas();
                    }
                  }}
                  placeholder="Ketik fasilitas baru (contoh: Dapur Komplit, Kolam Renang)..."
                  className="flex-1 h-8 px-2.5 rounded-xl bg-white border border-neutral-200 text-xs focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddFasilitas}
                  className="h-8 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            {/* Kelola Peraturan Homestay Interaktif */}
            <div className="space-y-2 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
              <label className="text-[11px] font-bold text-neutral-800 block">
                Peraturan & Syarat Menginap
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                {peraturanArr.map((p, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-300 text-neutral-800 text-[11px] font-semibold shadow-2xs"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePeraturan(i)}
                      className="w-3.5 h-3.5 rounded-full hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center cursor-pointer text-neutral-400"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newPeraturanText}
                  onChange={(e) => setNewPeraturanText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPeraturan();
                    }
                  }}
                  placeholder="Ketik aturan baru (contoh: Menjaga ketertiban jam 22.00)..."
                  className="flex-1 h-8 px-2.5 rounded-xl bg-white border border-neutral-200 text-xs focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddPeraturan}
                  className="h-8 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            {/* Badge & Status Aktif / Nonaktif */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Badge Label</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="PENGINAPAN KELUARGA"
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex flex-col justify-end">
                <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200 h-9">
                  <span className="text-xs font-bold text-neutral-800">Status</span>
                  <button
                    type="button"
                    onClick={() => setStatus((prev) => (prev === 'aktif' ? 'nonaktif' : 'aktif'))}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                      status === 'aktif' ? 'bg-emerald-600 text-white' : 'bg-neutral-300 text-neutral-700'
                    }`}
                  >
                    {status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
              </div>
            </div>

            {/* Rating (1-5) & Jumlah Ulasan */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Rating (1-5)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  placeholder="4.9"
                  className="w-full h-9 px-2.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[9px] text-amber-800 block">Contoh: 4.8 atau 4.95</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-950">Jumlah Ulasan</label>
                <input
                  type="number"
                  min="0"
                  value={reviewsCount}
                  onChange={(e) => setReviewsCount(Number(e.target.value))}
                  placeholder="96"
                  className="w-full h-9 px-2.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[9px] text-amber-800 block">Contoh: 96 atau 120 ulasan</span>
              </div>
            </div>

            {/* Tombol Simpan Modal */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingHomestay(null);
                }}
                className="flex-1 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 h-9 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Penginapan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
