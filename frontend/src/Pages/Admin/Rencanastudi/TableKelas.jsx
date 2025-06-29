import Button from "@/Components/Button"; // Path disesuaikan menggunakan alias @/
import Select from "@/Components/Dropdown"; // Path disesuaikan menggunakan alias @/
import { useAuthStateContext } from "@/Context/AuthContext"; // Path disesuaikan menggunakan alias @/

// Komponen TableRencanaStudi
export default function TableRencanaStudi({
  data = [],          // Daftar kelas yang tersedia (diganti dari 'kelas')
  mahasiswaList = [], // Daftar semua mahasiswa (diganti dari 'mahasiswa')
  dosenList = [],     // Daftar semua dosen (diganti dari 'dosen')
  mataKuliahList = [], // Daftar semua mata kuliah (diganti dari 'mataKuliah')
  selectedMhs,        // State pilihan mahasiswa per kelas (untuk dropdown)
  setSelectedMhs,     // Setter untuk state selectedMhs
  selectedDsn,        // State pilihan dosen per kelas (untuk dropdown)
  setSelectedDsn,     // Setter untuk state selectedDsn
  handleAddMahasiswa, // Fungsi untuk menambah mahasiswa ke kelas
  handleDeleteMahasiswa, // Fungsi untuk menghapus mahasiswa dari kelas
  handleChangeDosen,  // Fungsi untuk mengganti dosen pengampu kelas
  handleDeleteKelas,   // Fungsi untuk menghapus kelas
  isLoading // Prop isLoading
}) {
  const { user } = useAuthStateContext(); // Ambil data user dari context
  const permission = user?.permission || []; // Ambil permissions user

  return (
    <div className="space-y-6">
      {/* Jika loading, tampilkan pesan loading */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500 italic">
          Memuat data...
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 italic">
          Belum ada kelas yang dibuat.
        </div>
      ) : (
        // Mapping setiap item kelas untuk ditampilkan
        Array.isArray(data) && data.map((kls) => {
          // Cari data detail mata kuliah dan dosen berdasarkan ID
          // Pastikan mataKuliahList dan dosenList adalah array sebelum find
          const matkul = Array.isArray(mataKuliahList) ? mataKuliahList.find(m => String(m.id) === String(kls.mata_kuliah_id)) : null;
          const dosenPengampu = Array.isArray(dosenList) ? dosenList.find(d => String(d.id) === String(kls.dosen_id)) : null;
          
          // Filter mahasiswa yang terdaftar di kelas ini
          // Pastikan kls.mahasiswa_ids dan mahasiswaList adalah array sebelum map/find
          const mhsInClass = Array.isArray(kls.mahasiswa_ids)
            ? kls.mahasiswa_ids
                .map(id => Array.isArray(mahasiswaList) ? mahasiswaList.find(m => String(m.id) === String(id)) : null)
                .filter(Boolean) // Filter undefined jika ID tidak ditemukan
            : [];

          return (
            <div key={kls.id} className="border rounded-lg shadow-md bg-white overflow-hidden">
              {/* Header Kelas */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-3 border-b bg-gray-50">
                <div className="mb-2 md:mb-0">
                  <h3 className="text-lg font-semibold text-blue-800">{matkul?.name || "-"} ({matkul?.sks || 0} SKS)</h3>
                  <p className="text-sm text-gray-600">Dosen: <strong className="text-blue-700">{dosenPengampu?.name || "-"}</strong></p>
                </div>
                {/* Bagian Aksi Dosen dan Hapus Kelas */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {permission.includes("kelas.update") && (
                    <Select
                      value={selectedDsn[kls.id] || ""}
                      onChange={(e) => setSelectedDsn({ ...selectedDsn, [kls.id]: e.target.value })}
                      size="sm"
                      className="w-48"
                    >
                      <option value="">-- Ganti Dosen --</option>
                      {/* Penting: Pastikan value adalah string */}
                      {Array.isArray(dosenList) && dosenList.map(d => (
                        <option key={d.id} value={String(d.id)}>{d.name}</option>
                      ))}
                    </Select>
                  )}
                  {permission.includes("kelas.update") && (
                    <Button size="sm" onClick={() => handleChangeDosen(kls)}>Simpan Dosen</Button>
                  )}
                  {/* Tombol Hapus Kelas hanya muncul jika tidak ada mahasiswa di kelas dan user punya permission delete */}
                  {mhsInClass.length === 0 && permission.includes("kelas.delete") && (
                    <Button size="sm" variant="danger" onClick={() => handleDeleteKelas(kls.id)}>
                      Hapus Kelas
                    </Button>
                  )}
                </div>
              </div>

              {/* Tabel Mahasiswa dalam Kelas */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="py-2 px-4 text-left">No</th>
                      <th className="py-2 px-4 text-left">Nama</th>
                      <th className="py-2 px-4 text-left">NIM</th>
                      <th className="py-2 px-4 text-center">Total SKS Terpakai</th>
                      {permission.includes("kelas.update") && (
                        <th className="py-2 px-4 text-center">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {mhsInClass.length > 0 ? (
                      Array.isArray(mhsInClass) && mhsInClass.map((m, i) => {
                        // Hitung total SKS yang diambil mahasiswa dari semua kelas
                        const totalSksMahasiswa = Array.isArray(data) ? data
                          .filter(k => Array.isArray(k.mahasiswa_ids) && k.mahasiswa_ids.includes(String(m.id)))
                          .map(k => (Array.isArray(mataKuliahList) ? mataKuliahList.find(mk => String(mk.id) === String(k.mata_kuliah_id))?.sks || 0 : 0))
                          .reduce((a, b) => a + b, 0) : 0;

                        return (
                          <tr key={m.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                            <td className="py-2 px-4">{i + 1}</td>
                            <td className="py-2 px-4">{m.name}</td>
                            <td className="py-2 px-4">{m.nim}</td>
                            <td className="py-2 px-4 text-center">{m.max_sks ? `${totalSksMahasiswa} / ${m.max_sks}` : "-"}</td>
                            {permission.includes("kelas.update") && (
                              <td className="py-2 px-4 text-center">
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleDeleteMahasiswa(kls, m.id)}
                                >
                                  Hapus
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={permission.includes("kelas.update") ? "5" : "4"} className="py-3 px-4 text-center italic text-gray-500">
                          Belum ada mahasiswa di kelas ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bagian Tambah Mahasiswa */}
              {permission.includes("kelas.create") && (
                <div className="flex items-center gap-2 px-4 py-3 border-t bg-gray-50 flex-wrap">
                  <Select
                    value={selectedMhs[kls.id] || ""}
                    onChange={(e) => setSelectedMhs({ ...selectedMhs, [kls.id]: e.target.value })}
                    size="sm"
                    className="w-full sm:w-56"
                  >
                    <option value="">-- Pilih Mahasiswa --</option>
                    {/* Penting: Pastikan value adalah string */}
                    {Array.isArray(mahasiswaList) && mahasiswaList.map((m) => (
                      <option key={m.id} value={String(m.id)}>{m.name} ({m.nim})</option>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => handleAddMahasiswa(kls, selectedMhs[kls.id])}
                  >
                    Tambah Mahasiswa
                  </Button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
