import Form from "@/Components/Form"; // Path disesuaikan
import Label from "@/Components/Label"; // Path disesuaikan
import Button from "@/Components/Button"; // Path disesuaikan
import Input from "@/Components/Input"; // Pastikan Anda punya komponen Input

// Komponen ModalRencanaStudi
const ModalKelas = ({
    isOpen,
    onClose,
    onChange,
    onSubmit,
    form,
    isEdit = false, // Tambahkan prop isEdit dengan default false
    dosen = [], // Data dosen untuk dropdown
    mataKuliah = [] // Data mata kuliah (yang belum ada kelasnya) untuk dropdown
}) => {
  // Jika modal tidak terbuka, jangan render apa pun
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.3)] z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Kelas" : "Tambah Kelas Baru"}</h2>
          {/* Tombol Tutup Modal */}
          <button onClick={onClose} className="text-gray-600 hover:text-red-500 text-xl">
            &times;
          </button>
        </div>

        {/* Form untuk menambah kelas baru */}
        <Form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="nama_kelas">Nama Kelas</Label>
            <Input
              id="nama_kelas"
              type="text"
              name="nama_kelas"
              value={form.nama_kelas || ""}
              onChange={onChange}
              placeholder="Contoh: Kelas A Pagi"
              required
            />
          </div>
          <div>
            <Label htmlFor="mata_kuliah_id">Mata Kuliah</Label>
            {/* Dropdown untuk memilih Mata Kuliah */}
            <select
              id="mata_kuliah_id"
              name="mata_kuliah_id"
              value={form.mata_kuliah_id || ""} // Pastikan value terikat dengan state form (ini akan jadi string)
              onChange={onChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {/* Mapping data mata kuliah ke dalam opsi dropdown */}
              {/* Penting: Pastikan value adalah string */}
              {Array.isArray(mataKuliah) && mataKuliah.map((m) => (
                <option key={m.id} value={String(m.id)}>{m.name} ({m.sks} SKS)</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="dosen_id">Dosen Pengampu</Label>
            {/* Dropdown untuk memilih Dosen Pengampu */}
            <select
              id="dosen_id"
              name="dosen_id"
              value={form.dosen_id || ""} // Pastikan value terikat dengan state form (ini akan jadi string)
              onChange={onChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">-- Pilih Dosen --</option>
              {/* Mapping data dosen ke dalam opsi dropdown */}
              {/* Penting: Pastikan value adalah string */}
              {Array.isArray(dosen) && dosen.map((d) => (
                <option key={d.id} value={String(d.id)}>{d.name} (Max SKS: {d.max_sks})</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="jumlah_mahasiswa">Jumlah Maks Mahasiswa</Label>
            <Input
              id="jumlah_mahasiswa"
              type="number"
              name="jumlah_mahasiswa"
              value={form.jumlah_mahasiswa || ""}
              onChange={onChange}
              placeholder="Contoh: 30"
              required
            />
          </div>
          <div>
            <Label htmlFor="jadwal">Jadwal</Label>
            <Input
              id="jadwal"
              type="text"
              name="jadwal"
              value={form.jadwal || ""}
              onChange={onChange}
              placeholder="Contoh: Senin 08:00 - 10:00"
              required
            />
          </div>
          <div>
            <Label htmlFor="ruang">Ruang</Label>
            <Input
              id="ruang"
              type="text"
              name="ruang"
              value={form.ruang || ""}
              onChange={onChange}
              placeholder="Contoh: R-301"
              required
            />
          </div>
          {/* Bagian Tombol Aksi */}
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">{isEdit ? "Perbarui" : "Simpan"}</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ModalKelas;
