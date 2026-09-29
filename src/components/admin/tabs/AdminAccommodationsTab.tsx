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
  Sliders,
  DollarSign,
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
    cmsMedia,
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
  const [deskripsi, setDeskripsi] = useState('');
  const [konsep, setKonsep] = useState('');
  const [harga, setHarga] = useState<number>(75000);
  const [hargaLabel, setHargaLabel] = useState('/orang/malam');
  const [kapasitas, setKapasitas] = useState<number>(20);
  const [minBooking, setMinBooking] = useState<number>(4);
  const [fasilitasStr, setFasilitasStr] = useState('');
  const [peraturanStr, setPeraturanStr] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [badge, setBadge] = useState('');
  const [whatsappContact, setWhatsappContact] = useState('082138613888');
  const [propertyType, setPropertyType] = useState<'full_homestay' | 'individual_rooms'>('full_homestay');

  // Media Picker state
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'primary' | 'gallery'>('primary');

  const openAddModal = () => {
    setEditingHomestay(null);
    setIsAddingNew(true);
    setNama('');
    setLokasi('Pantai Sundak, Gunungkidul');
    setFullAddress('Kawasan Wisata Pantai Sundak, Sidoharjo, Tepus, Gunungkidul');
    setFotoUtama('/images/sundak_fullhouse_1790552054893.jpg');
    setGaleri(['/images/sundak_fullhouse_1790552054893.jpg']);
    setDeskripsi('');
    setKonsep('');
    setHarga(75000);
    setHargaLabel('/orang/malam');
    setKapasitas(20);
    setMinBooking(4);
    setFasilitasStr('AC, WiFi Cepat, Kamar Mandi Dalam, Dapur Lengkap, Parkir Mobil');
    setPeraturanStr('Khusus keluarga sah / mahrom, Dilarang minuman keras/narkoba, Jaga kebersihan');
    setStatus('aktif');
    setBadge('PENGINAPAN KELUARGA');
    setWhatsappContact('082138613888');
    setPropertyType('full_homestay');
  };

  const openEditModal = (h: TB_Homestay) => {
    setEditingHomestay(h);
    setIsAddingNew(false);
    setNama(h.nama);
    setLokasi(h.lokasi);
    setFullAddress(h.full_address || '');
    setFotoUtama(h.foto_utama);
    setGaleri(h.galeri || [h.foto_utama]);
    setDeskripsi(h.deskripsi);
    setKonsep(h.konsep || '');
    setHarga(h.harga);
    setHargaLabel(h.harga_label);
    setKapasitas(h.kapasitas);
    setMinBooking(h.min_booking);
    setFasilitasStr((h.fasilitas || []).join(', '));
    setPeraturanStr((h.peraturan || []).join(', '));
    setStatus(h.status);
    setBadge(h.badge || '');
    setWhatsappContact(h.whatsapp_contact || '082138613888');
    setPropertyType(h.property_type);
  };

  const handleSave = () => {
    if (!nama.trim()) {
      alert('Nama penginapan tidak boleh kosong!');
      return;
    }

    const fasilitasArr = fasilitasStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const peraturanArr = peraturanStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: TB_Homestay = {
      id: editingHomestay ? editingHomestay.id : `homestay-${Date.now()}`,
      nama,
      lokasi,
      full_address: fullAddress,
      foto_utama: fotoUtama || '/images/sundak_fullhouse_1790552054893.jpg',
      galeri: galeri.length > 0 ? galeri : [fotoUtama || '/images/sundak_fullhouse_1790552054893.jpg'],
      deskripsi,
      konsep,
      harga: Number(harga),
      harga_label: hargaLabel,
      kapasitas: Number(kapasitas),
      min_booking: Number(minBooking),
      fasilitas: fasilitasArr,
      peraturan: peraturanArr,
      status,
      rating: editingHomestay?.rating || 4.9,
      reviews_count: editingHomestay?.reviews_count || 120,
      badge,
      property_type: propertyType,
      whatsapp_contact: whatsappContact,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const media = await uploadMedia(file, 'penginapan');
      if (isPrimary) {
        setFotoUtama(media.url);
        if (!galeri.includes(media.url)) {
          setGaleri((prev) => [media.url, ...prev]);
        }
      } else {
        setGaleri((prev) => [...prev, media.url]);
      }
      onShowToast('✓ Foto berhasil diupload & ditambahkan!');
    }
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

      {/* Daftar Penginapan (Cards Sederhana dan Rapi) */}
      <div className="space-y-3">
        {cmsHomestays.map((h) => (
          <div
            key={h.id}
            className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3"
          >
            <div className="flex gap-3">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                <SafeImage
                  src={h.foto_utama}
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
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-xs font-black text-neutral-900 truncate">{h.nama}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{h.rating || 4.9}</span>
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

                <div className="flex items-center gap-2 text-[10px] text-neutral-500 pt-0.5">
                  <span className="bg-neutral-100 px-1.5 py-0.5 rounded font-medium">
                    Kapasitas {h.kapasitas} orang
                  </span>
                  <span className="bg-neutral-100 px-1.5 py-0.5 rounded font-medium">
                    {h.galeri?.length || 1} foto
                  </span>
                </div>
              </div>
            </div>

            {/* Aksi Edit & Hapus */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => openEditModal(h)}
                className="flex-1 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
                <span>Edit Data & Foto</span>
              </button>

              <button
                onClick={() => setDeletingId(h.id)}
                className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-rose-200"
                title="Hapus Penginapan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
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
                className="flex-1 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const target = cmsHomestays.find((h) => h.id === deletingId);
                  if (target) handleDelete(target.id, target.nama);
                }}
                className="flex-1 h-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Penginapan */}
      {(isAddingNew || editingHomestay) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl p-4 space-y-3.5 shadow-2xl my-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs font-black text-neutral-900">
                  {isAddingNew ? 'Tambah Penginapan Baru' : `Edit: ${editingHomestay?.nama}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingHomestay(null);
                }}
                className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Nama & Tipe */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Nama Penginapan</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Griya Barokah Pantai Sundak"
                className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Lokasi & Alamat */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Lokasi Ringkas</label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Pantai Sundak, Gunungkidul"
                  className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Tipe Sewa</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                >
                  <option value="full_homestay">Satu Rumah Penuh (Full House)</option>
                  <option value="individual_rooms">Per Kamar / Kamar Terpisah</option>
                </select>
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
                className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
              />
            </div>

            {/* Foto Utama & Galeri */}
            <div className="space-y-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-800">Foto Utama & Galeri</span>
                <span className="text-[10px] text-neutral-400">{galeri.length} foto terpilih</span>
              </div>

              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-neutral-200">
                <SafeImage
                  src={fotoUtama}
                  alt="Preview Utama"
                  fallbackText={nama || 'Homestay'}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                  Foto Utama
                </span>
              </div>

              {/* Upload Foto Utama */}
              <div className="flex gap-2">
                <label className="flex-1 h-8 px-2.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Foto Utama</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, true)}
                  />
                </label>

                <label className="flex-1 h-8 px-2.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Galeri</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, false)}
                  />
                </label>
              </div>

              <input
                type="url"
                value={fotoUtama}
                onChange={(e) => setFotoUtama(e.target.value)}
                placeholder="Atau tempel URL foto utama..."
                className="w-full h-7 px-2.5 rounded-lg bg-white border border-neutral-200 text-[11px] text-neutral-800"
              />

              {/* Thumbnail Galeri List */}
              {galeri.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto py-1">
                  {galeri.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-neutral-300">
                      <img src={imgUrl} alt={`Galeri ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGaleri((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[8px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Harga, Kapasitas & Minimal Booking */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Harga (Rp)</label>
                <input
                  type="number"
                  value={harga}
                  onChange={(e) => setHarga(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Kapasitas (Pax)</label>
                <input
                  type="number"
                  value={kapasitas}
                  onChange={(e) => setKapasitas(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Min. Booking</label>
                <input
                  type="number"
                  value={minBooking}
                  onChange={(e) => setMinBooking(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold"
                />
              </div>
            </div>

            {/* Konsep & Deskripsi */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Konsep Sewa</label>
              <textarea
                rows={2}
                value={konsep}
                onChange={(e) => setKonsep(e.target.value)}
                placeholder="Penjelasan konsep sewa (misal: Sewa Full House per orang atau Sewa per kamar)"
                className="w-full p-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Deskripsi Lengkap</label>
              <textarea
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Deskripsi fasilitas, keunggulan dekat pantai..."
                className="w-full p-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs leading-relaxed resize-none"
              />
            </div>

            {/* Fasilitas & Peraturan */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Fasilitas (Pisahkan koma)</label>
              <input
                type="text"
                value={fasilitasStr}
                onChange={(e) => setFasilitasStr(e.target.value)}
                placeholder="4 Kamar AC, 3 KM Dalam, Dapur Komplit, WiFi"
                className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Aturan Homestay (Pisahkan koma)</label>
              <input
                type="text"
                value={peraturanStr}
                onChange={(e) => setPeraturanStr(e.target.value)}
                placeholder="Khusus keluarga sah / mahrom, Dilarang miras, Menjaga ketertiban"
                className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs"
              />
            </div>

            {/* Status Aktif / Nonaktif */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-xs font-bold text-neutral-800">Status Penginapan</span>
              <button
                type="button"
                onClick={() => setStatus((prev) => (prev === 'aktif' ? 'nonaktif' : 'aktif'))}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  status === 'aktif'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-300 text-neutral-700'
                }`}
              >
                {status === 'aktif' ? 'Aktif (Dapat Dipesan)' : 'Nonaktif (Tutup)'}
              </button>
            </div>

            {/* Tombol Simpan Modal */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingHomestay(null);
                }}
                className="flex-1 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 h-9 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
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
