import React, { useState, useMemo } from 'react';
import { useBooking } from '../../../context/BookingContext';
import { TB_Room } from '../../../db/cmsDatabase';
import { SafeImage } from '../../common/SafeImage';
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
  Filter,
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
  const [harga, setHarga] = useState<number>(285000);
  const [kapasitas, setKapasitas] = useState<number>(4);
  const [jumlahStok, setJumlahStok] = useState<number>(1);
  const [bedsCount, setBedsCount] = useState<number>(2);
  const [bathsCount, setBathsCount] = useState<number>(1);
  const [floor, setFloor] = useState<number>(1);
  const [bedInfo, setBedInfo] = useState('2 Bed (Kayu & Lantai)');
  const [fasilitasStr, setFasilitasStr] = useState('AC, KM Dalam, View Pantai, WiFi');
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
    setFotoUtama('/images/trenggole_room_1790552085510.jpg');
    setGaleri(['/images/trenggole_room_1790552085510.jpg']);
    setHarga(285000);
    setKapasitas(4);
    setJumlahStok(1);
    setBedsCount(2);
    setBathsCount(1);
    setFloor(1);
    setBedInfo('2 Bed (130x200 cm)');
    setFasilitasStr('AC, Kamar Mandi Dalam, View Pantai, WiFi');
    setDeskripsi('Kamar nyaman dekat pantai dengan fasilitas lengkap.');
    setStatus('aktif');
  };

  const openEditModal = (r: TB_Room) => {
    setEditingRoom(r);
    setIsAddingNew(false);
    setHomestayId(r.homestay_id);
    setNamaKamar(r.nama_kamar);
    setFotoUtama(r.foto_utama || r.foto || '/images/trenggole_room_1790552085510.jpg');
    setGaleri(r.galeri || [r.foto_utama || r.foto || '/images/trenggole_room_1790552085510.jpg']);
    setHarga(r.harga);
    setKapasitas(r.kapasitas);
    setJumlahStok(r.jumlah_stok !== undefined ? r.jumlah_stok : 1);
    setBedsCount(r.beds_count || 2);
    setBathsCount(r.baths_count || 1);
    setFloor(r.floor || 1);
    setBedInfo(r.bed_info || '2 Bed');
    setFasilitasStr((r.fasilitas || []).join(', '));
    setDeskripsi(r.deskripsi || '');
    setStatus(r.status || 'aktif');
  };

  const handleToggleStatus = (room: TB_Room) => {
    const nextStatus = room.status === 'aktif' ? 'nonaktif' : 'aktif';
    updateCmsRoom(room.id, { status: nextStatus });
    onShowToast(`✓ Status "${room.nama_kamar}" diubah menjadi ${nextStatus.toUpperCase()}`);
  };

  const handleSave = () => {
    if (!namaKamar.trim()) {
      alert('Nama kamar tidak boleh kosong!');
      return;
    }

    const fasilitasArr = fasilitasStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: TB_Room = {
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      homestay_id: homestayId,
      nama_kamar: namaKamar,
      foto_utama: fotoUtama || '/images/trenggole_room_1790552085510.jpg',
      foto: fotoUtama || '/images/trenggole_room_1790552085510.jpg',
      galeri: galeri.length > 0 ? galeri : [fotoUtama || '/images/trenggole_room_1790552085510.jpg'],
      harga: Number(harga),
      kapasitas: Number(kapasitas),
      jumlah_stok: Number(jumlahStok),
      beds_count: Number(bedsCount),
      baths_count: Number(bathsCount),
      floor: (Number(floor) === 2 ? 2 : 1) as 1 | 2,
      bed_info: bedInfo,
      fasilitas: fasilitasArr,
      deskripsi,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const media = await uploadMedia(file, 'kamar');
      setFotoUtama(media.url);
      if (!galeri.includes(media.url)) {
        setGaleri((prev) => [media.url, ...prev]);
      }
      onShowToast('✓ Foto kamar berhasil diunggah!');
    }
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

          return (
            <div
              key={r.id}
              className={`p-3.5 rounded-2xl bg-white border transition-all shadow-2xs space-y-2.5 ${
                isAktif ? 'border-neutral-200/90' : 'border-neutral-300 opacity-75 bg-neutral-50/70'
              }`}
            >
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                  <SafeImage
                    src={r.foto_utama || r.foto || '/images/trenggole_room_1790552085510.jpg'}
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
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xs font-black text-neutral-900 truncate">{r.nama_kamar}</h3>
                    {/* Toggle Status Aktif / Nonaktif Cepat */}
                    <button
                      onClick={() => handleToggleStatus(r)}
                      title={`Klik untuk ${isAktif ? 'Nonaktifkan' : 'Aktifkan'} kamar`}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
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
                    {parentHomestay?.nama || r.homestay_id} • Lt. {r.floor || 1}
                  </div>

                  <div className="text-xs font-extrabold text-emerald-950">
                    Rp {r.harga.toLocaleString('id-ID')}{' '}
                    <span className="text-[10px] font-normal text-neutral-500">/malam</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-neutral-600">
                    <span>Kapasitas: {r.kapasitas} orang</span>
                    <span>•</span>
                    <span>Stok: {r.jumlah_stok !== undefined ? r.jumlah_stok : 1} unit</span>
                  </div>
                </div>
              </div>

              {/* Fasilitas Chip List */}
              <div className="flex flex-wrap gap-1 pt-1">
                {(r.fasilitas || []).slice(0, 4).map((f, i) => (
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
                  className="flex-1 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Edit Kamar & Foto</span>
                </button>

                <button
                  onClick={() => setDeletingId(r.id)}
                  className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-rose-200"
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
                className="flex-1 h-8 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const target = cmsRooms.find((r) => r.id === deletingId);
                  if (target) handleDelete(target.id, target.nama_kamar);
                }}
                className="flex-1 h-8 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Kamar */}
      {(isAddingNew || editingRoom) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl p-4 space-y-3.5 shadow-2xl my-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs font-black text-neutral-900">
                  {isAddingNew ? 'Tambah Kamar Baru' : `Edit: ${editingRoom?.nama_kamar}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingRoom(null);
                }}
                className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pilih Penginapan Induk */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Penginapan Induk</label>
              <select
                value={homestayId}
                onChange={(e) => setHomestayId(e.target.value)}
                className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs text-neutral-900 font-bold focus:outline-none"
              >
                {cmsHomestays.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Nama Kamar */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Nama Kamar</label>
              <input
                type="text"
                value={namaKamar}
                onChange={(e) => setNamaKamar(e.target.value)}
                placeholder="Contoh: Kamar 1 – Pantai Trenggole"
                className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs"
              />
            </div>

            {/* Foto Kamar */}
            <div className="space-y-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-800">Foto Kamar</span>
                <span className="text-[10px] text-neutral-400">Preview</span>
              </div>

              <div className="relative w-full h-28 rounded-lg overflow-hidden bg-neutral-200">
                <SafeImage
                  src={fotoUtama}
                  alt="Preview Kamar"
                  fallbackText={namaKamar || 'Kamar'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-2">
                <label className="flex-1 h-8 px-2.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Foto Kamar</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <input
                type="url"
                value={fotoUtama}
                onChange={(e) => setFotoUtama(e.target.value)}
                placeholder="Atau tempel URL foto kamar..."
                className="w-full h-7 px-2.5 rounded-lg bg-white border border-neutral-200 text-[11px] text-neutral-800"
              />
            </div>

            {/* Harga, Kapasitas & Jumlah Kamar (Stok) */}
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
                <label className="text-[11px] font-bold text-neutral-700">Jumlah Stok</label>
                <input
                  type="number"
                  value={jumlahStok}
                  onChange={(e) => setJumlahStok(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold"
                />
              </div>
            </div>

            {/* Ranjang, Lantai & Kamar Mandi */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Jml Ranjang</label>
                <input
                  type="number"
                  value={bedsCount}
                  onChange={(e) => setBedsCount(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">KM Dalam</label>
                <input
                  type="number"
                  value={bathsCount}
                  onChange={(e) => setBathsCount(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700">Lantai</label>
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs font-bold"
                />
              </div>
            </div>

            {/* Fasilitas Kamar */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Fasilitas Kamar (Koma)</label>
              <input
                type="text"
                value={fasilitasStr}
                onChange={(e) => setFasilitasStr(e.target.value)}
                placeholder="AC, KM Dalam, View Pantai, WiFi"
                className="w-full h-8 px-2.5 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700">Deskripsi Singkat</label>
              <textarea
                rows={2}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Detail spesifikasi kamar..."
                className="w-full p-2 rounded-xl bg-[#F6F7F9] border border-neutral-200 text-xs resize-none"
              />
            </div>

            {/* Status Aktif / Nonaktif */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-xs font-bold text-neutral-800">Status Ketersediaan Kamar</span>
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

            {/* Tombol Simpan */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingRoom(null);
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
                <span>Simpan Kamar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
