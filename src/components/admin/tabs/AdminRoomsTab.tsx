import React, { useState, useMemo } from 'react';
import { useBooking } from '../../../context/BookingContext';
import { TB_Room } from '../../../db/cmsDatabase';
import { SafeImage } from '../../common/SafeImage';
import { PhotoSlider } from '../../common/PhotoSlider';
import {
  Bed,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Users,
  Power,
  Layers,
  Star,
  Link as LinkIcon,
} from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
}

export const AdminRoomsTab: React.FC<Props> = ({ onShowToast }) => {
  const { cmsRooms, cmsHomestays, addCmsRoom, updateCmsRoom, deleteCmsRoom, uploadMedia } =
    useBooking();

  const [selectedPropFilter, setSelectedPropFilter] = useState<string>('all');
  const [editingRoom, setEditingRoom] = useState<TB_Room | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form Fields
  const [homestayId, setHomestayId] = useState('homestay-trenggole');
  const [namaKamar, setNamaKamar] = useState('');
  const [fotoUtama, setFotoUtama] = useState('');
  const [galeri, setGaleri] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [harga, setHarga] = useState<number>(285000);
  const [kapasitas, setKapasitas] = useState<number>(4);
  const [jumlahStok, setJumlahStok] = useState<number>(1);
  const [bedsCount, setBedsCount] = useState<number>(2);
  const [bathsCount, setBathsCount] = useState<number>(1);
  const [floor, setFloor] = useState<number>(1);
  const [bedInfo, setBedInfo] = useState('2 Bed (130x200 cm)');
  const [fasilitasArr, setFasilitasArr] = useState<string[]>([
    'AC',
    'KM Dalam',
    'View Pantai',
    'WiFi',
  ]);
  const [newFasilitasText, setNewFasilitasText] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (selectedPropFilter === 'all') return cmsRooms;
    return cmsRooms.filter((r) => r.homestay_id === selectedPropFilter);
  }, [cmsRooms, selectedPropFilter]);

  const openAddModal = () => {
    setEditingRoom(null);
    setIsAddingNew(true);
    setHomestayId(cmsHomestays[0]?.id || 'homestay-trenggole');
    setNamaKamar('Kamar Baru');
    const defaultImg = '/images/trenggole_room_1790552085510.jpg';
    setFotoUtama(defaultImg);
    setGaleri([defaultImg]);
    setUrlInput('');
    setHarga(285000);
    setKapasitas(4);
    setJumlahStok(1);
    setBedsCount(2);
    setBathsCount(1);
    setFloor(1);
    setBedInfo('2 Bed (130x200 cm)');
    setFasilitasArr(['AC', 'Kamar Mandi Dalam', 'View Pantai', 'WiFi']);
    setNewFasilitasText('');
    setDeskripsi('Kamar nyaman dekat pantai dengan fasilitas lengkap.');
    setStatus('aktif');
  };

  const openEditModal = (r: TB_Room) => {
    setEditingRoom(r);
    setIsAddingNew(false);
    setHomestayId(r.homestay_id);
    setNamaKamar(r.nama_kamar);
    const primary = r.foto_utama || r.foto || '/images/trenggole_room_1790552085510.jpg';
    setFotoUtama(primary);
    const existingGaleri =
      Array.isArray(r.galeri) && r.galeri.length > 0
        ? r.galeri
        : [primary];
    setGaleri(existingGaleri);
    setUrlInput('');
    setHarga(r.harga);
    setKapasitas(r.kapasitas);
    setJumlahStok(r.jumlah_stok !== undefined ? r.jumlah_stok : 1);
    setBedsCount(r.beds_count || 2);
    setBathsCount(r.baths_count || 1);
    setFloor(r.floor || 1);
    setBedInfo(r.bed_info || '2 Bed (130x200 cm)');
    setFasilitasArr(Array.isArray(r.fasilitas) ? [...r.fasilitas] : ['AC', 'WiFi']);
    setNewFasilitasText('');
    setDeskripsi(r.deskripsi || '');
    setStatus(r.status || 'aktif');
  };

  const handleToggleStatus = (room: TB_Room) => {
    const nextStatus = room.status === 'aktif' ? 'nonaktif' : 'aktif';
    updateCmsRoom(room.id, { status: nextStatus });
    onShowToast(`✓ Status "${room.nama_kamar}" diubah menjadi ${nextStatus.toUpperCase()}`);
  };

  // Fasilitas Handlers
  const handleAddFasilitas = () => {
    const trimmed = newFasilitasText.trim();
    if (!trimmed) return;
    if (!fasilitasArr.includes(trimmed)) {
      setFasilitasArr([...fasilitasArr, trimmed]);
    }
    setNewFasilitasText('');
  };

  const handleRemoveFasilitas = (indexToRemove: number) => {
    setFasilitasArr(fasilitasArr.filter((_, i) => i !== indexToRemove));
  };

  // Galeri Handlers
  const handleAddUrlToGaleri = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setGaleri((prev) => (!prev.includes(trimmed) ? [...prev, trimmed] : prev));
    setFotoUtama((prev) => prev || trimmed);
    onShowToast('✓ Foto berhasil ditambahkan ke galeri!');
    setUrlInput('');
  };

  const handleSetFotoUtama = (url: string) => {
    setFotoUtama(url);
    onShowToast('✓ Foto utama kamar berhasil diperbarui!');
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
    onShowToast('✓ Foto dihapus dari galeri kamar.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const media = await uploadMedia(file, 'kamar');
        if (!media || !media.url || media.url.startsWith('data:')) {
          throw new Error('Upload gagal, periksa koneksi internet dan coba lagi');
        }
        setGaleri((prev) => [...prev, media.url]);
        setFotoUtama((prev) => prev || media.url);
        onShowToast('✓ Foto baru berhasil diunggah & masuk ke galeri kamar!');
      } catch (err: any) {
        alert(err.message || 'Upload gagal, periksa koneksi internet dan coba lagi');
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleSave = () => {
    if (!namaKamar.trim()) {
      alert('Nama kamar tidak boleh kosong!');
      return;
    }

    const finalFotoUtama = fotoUtama || galeri[0] || '/images/trenggole_room_1790552085510.jpg';
    const finalGaleri = galeri.length > 0 ? galeri : [finalFotoUtama];

    const payload: TB_Room = {
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      homestay_id: homestayId,
      nama_kamar: namaKamar.trim(),
      foto_utama: finalFotoUtama,
      foto: finalFotoUtama,
      galeri: finalGaleri,
      harga: Number(harga),
      kapasitas: Number(kapasitas),
      jumlah_stok: Number(jumlahStok),
      beds_count: Number(bedsCount),
      baths_count: Number(bathsCount),
      floor: (Number(floor) === 2 ? 2 : 1) as 1 | 2,
      bed_info: bedInfo.trim() || '2 Bed',
      fasilitas: fasilitasArr,
      deskripsi: deskripsi.trim(),
      status,
    };

    if (editingRoom) {
      updateCmsRoom(editingRoom.id, payload);
      onShowToast(`✓ Kamar "${namaKamar}" berhasil diperbarui!`);
    } else {
      addCmsRoom(payload);
      onShowToast(`✓ Kamar baru "${namaKamar}" berhasil ditambahkan!`);
    }

    setIsAddingNew(false);
    setEditingRoom(null);
  };

  const handleDelete = (id: string, name: string) => {
    deleteCmsRoom(id);
    setDeletingId(null);
    onShowToast(`✓ Kamar "${name}" berhasil dihapus.`);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-neutral-900">Kelola Kamar & Tipe Unit</h2>
          <p className="text-[10px] text-neutral-400">Total {cmsRooms.length} kamar terdaftar</p>
        </div>
        <button
          onClick={openAddModal}
          className="h-8 px-3 rounded-xl bg-[#13281E] hover:bg-[#1A3428] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Kamar</span>
        </button>
      </div>

      {/* Filter Berdasarkan Penginapan */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedPropFilter('all')}
          className={`h-7 px-3 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
            selectedPropFilter === 'all'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-600 border border-neutral-200'
          }`}
        >
          Semua ({cmsRooms.length})
        </button>
        {cmsHomestays.map((h) => {
          const count = cmsRooms.filter((r) => r.homestay_id === h.id).length;
          return (
            <button
              key={h.id}
              onClick={() => setSelectedPropFilter(h.id)}
              className={`h-7 px-3 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                selectedPropFilter === h.id
                  ? 'bg-emerald-900 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200'
              }`}
            >
              {h.nama.replace('Griya Barokah ', '')} ({count})
            </button>
          );
        })}
      </div>

      {/* Daftar Kamar Cards */}
      <div className="space-y-3">
        {filteredRooms.map((r) => {
          const parentHomestay = cmsHomestays.find((h) => h.id === r.homestay_id);
          const isAktif = r.status === 'aktif';
          const roomImages =
            Array.isArray(r.galeri) && r.galeri.length > 0
              ? r.galeri
              : [r.foto_utama || r.foto || '/images/trenggole_room_1790552085510.jpg'];

          return (
            <div
              key={r.id}
              className={`p-3.5 rounded-2xl bg-white border transition-all shadow-2xs space-y-2.5 ${
                isAktif ? 'border-neutral-200/90' : 'border-neutral-300 opacity-75 bg-neutral-50/70'
              }`}
            >
              <div className="flex gap-2.5 sm:gap-3">
                <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                  <SafeImage
                    src={r.foto_utama || r.foto || roomImages[0]}
                    alt={r.nama_kamar}
                    fallbackText={r.nama_kamar}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <div
                    className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                      isAktif ? 'bg-emerald-600 text-white' : 'bg-neutral-600 text-white'
                    }`}
                  >
                    {r.status || 'aktif'}
                  </div>
                  <div className="absolute top-1 right-1 px-1 rounded bg-black/60 text-white text-[8px] font-bold">
                    {roomImages.length} foto
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs font-black text-neutral-900 truncate">{r.nama_kamar}</h3>
                    {/* Toggle Status Aktif / Nonaktif Cepat */}
                    <button
                      onClick={() => handleToggleStatus(r)}
                      title={`Klik untuk ${isAktif ? 'Nonaktifkan' : 'Aktifkan'} kamar`}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0 ${
                        isAktif
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                      }`}
                    >
                      <Power className="w-2.5 h-2.5" />
                      <span>{isAktif ? 'Aktif' : 'Nonaktif'}</span>
                    </button>
                  </div>

                  <div className="text-[10px] text-neutral-500 truncate">
                    {parentHomestay?.nama || r.homestay_id} • Lt. {r.floor || 1} • {r.bed_info || '2 Bed'}
                  </div>

                  <div className="text-xs font-extrabold text-emerald-950">
                    Rp {r.harga.toLocaleString('id-ID')}{' '}
                    <span className="text-[10px] font-normal text-neutral-500">/malam</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[9px] sm:text-[10px] text-neutral-600">
                    <span>{r.kapasitas} orang</span>
                    <span>•</span>
                    <span>{r.beds_count} Bed</span>
                    <span>•</span>
                    <span>{r.baths_count} KM</span>
                    <span>•</span>
                    <span>Stok: {r.jumlah_stok !== undefined ? r.jumlah_stok : 1}</span>
                  </div>
                </div>
              </div>

              {/* Fasilitas Chip List */}
              <div className="flex flex-wrap gap-1 pt-1">
                {(r.fasilitas || []).map((f, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                <button
                  onClick={() => openEditModal(r)}
                  className="flex-1 min-w-0 h-8 px-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all truncate"
                >
                  <Edit3 className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  <span className="truncate">Edit Kamar & Galeri ({roomImages.length})</span>
                </button>

                <button
                  onClick={() => setDeletingId(r.id)}
                  className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-rose-200 shrink-0"
                  title="Hapus Kamar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Hapus Kamar */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-4 space-y-3 shadow-xl border border-neutral-200">
            <h4 className="text-xs font-black text-rose-700">Hapus Kamar</h4>
            <p className="text-[11px] text-neutral-600">
              Yakin ingin menghapus kamar ini? Perubahan ini langsung mempengaruhi ketersediaan di frontend.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 h-8 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const target = cmsRooms.find((r) => r.id === deletingId);
                  if (target) handleDelete(target.id, target.nama_kamar);
                }}
                className="flex-1 h-8 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Kamar Lengkap */}
      {(isAddingNew || editingRoom) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl my-4 max-h-[92vh] overflow-y-auto no-scrollbar border border-neutral-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs sm:text-sm font-black text-neutral-900">
                  {isAddingNew ? 'Tambah Kamar Baru' : `Edit: ${editingRoom?.nama_kamar}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingRoom(null);
                }}
                className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Penginapan Induk & Nama Kamar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Penginapan Induk</label>
                <select
                  value={homestayId}
                  onChange={(e) => setHomestayId(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-bold focus:outline-none focus:border-emerald-600"
                >
                  {cmsHomestays.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Nama Kamar</label>
                <input
                  type="text"
                  value={namaKamar}
                  onChange={(e) => setNamaKamar(e.target.value)}
                  placeholder="Contoh: Kamar 1 – Pantai Trenggole"
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 2. KELOLA LENGKAP GALERI FOTO KAMAR (UPLOAD, TAMBAH URL, PILIH UTAMA, HAPUS) */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    Galeri Foto Kamar
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Total {galeri.length} foto • Klik foto untuk dijadikan Foto Utama
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

              {/* Input Tambah Foto via URL */}
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

              {/* Grid Thumbnail Galeri dengan Tombol 'Jadikan Utama' & 'Hapus' */}
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
                          alt={`Kamar ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Badge Foto Utama */}
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

                      {/* Tombol Hapus Foto */}
                      <button
                        type="button"
                        onClick={() => handleDeleteFotoGaleri(imgUrl)}
                        title="Hapus foto ini dari galeri"
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

            {/* 3. Harga, Kapasitas & Stok Kamar */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Harga (Rp/malam)</label>
                <input
                  type="number"
                  value={harga}
                  onChange={(e) => setHarga(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Kapasitas (Orang)</label>
                <input
                  type="number"
                  value={kapasitas}
                  onChange={(e) => setKapasitas(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Jumlah Stok Unit</label>
                <input
                  type="number"
                  value={jumlahStok}
                  onChange={(e) => setJumlahStok(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 4. Ranjang, KM Dalam, Lantai & Info Bed */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Jml Ranjang</label>
                <input
                  type="number"
                  value={bedsCount}
                  onChange={(e) => setBedsCount(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">KM Dalam</label>
                <input
                  type="number"
                  value={bathsCount}
                  onChange={(e) => setBathsCount(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Posisi Lantai</label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full h-9 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                >
                  <option value={1}>Lantai 1</option>
                  <option value={2}>Lantai 2</option>
                </select>
              </div>
            </div>

            {/* Info Bed (Spesifikasi Ranjang) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">
                Spesifikasi Ranjang (Info Bed)
              </label>
              <input
                type="text"
                value={bedInfo}
                onChange={(e) => setBedInfo(e.target.value)}
                placeholder="Contoh: 2 Bed (1 Ranjang Kayu + 1 Bed Lantai 130x200)"
                className="w-full h-9 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* 5. Daftar Fasilitas (Tambah / Hapus Interaktif) */}
            <div className="space-y-2 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
              <label className="text-[11px] font-bold text-neutral-800 block">
                Daftar Fasilitas Kamar
              </label>

              {/* Tag Fasilitas Saat Ini */}
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

              {/* Input Tambah Fasilitas */}
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
                  placeholder="Ketik fasilitas baru (contoh: Balkon, View Pantai)..."
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

            {/* 6. Deskripsi Kamar */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Deskripsi Kamar</label>
              <textarea
                rows={2}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Penjelasan kenyamanan kamar, akses ke pantai, dll..."
                className="w-full p-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs resize-none focus:outline-none focus:border-emerald-600 leading-relaxed"
              />
            </div>

            {/* 7. Status Ketersediaan */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">Status Ketersediaan Kamar</span>
                <span className="text-[10px] text-neutral-400">Nonaktifkan jika kamar sedang renovasi</span>
              </div>
              <button
                type="button"
                onClick={() => setStatus((prev) => (prev === 'aktif' ? 'nonaktif' : 'aktif'))}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  status === 'aktif' ? 'bg-emerald-600 text-white' : 'bg-neutral-300 text-neutral-700'
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
                  setEditingRoom(null);
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
                <span>Simpan Kamar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
