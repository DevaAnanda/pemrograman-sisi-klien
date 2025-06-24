import Button from "@/Components/Button";
import Select from "@/Components/Dropdown";
import { useAuthStateContext } from "@/Context/AuthContext";

export default function TableRencanaStudi({
  kelas,
  mahasiswa,
  dosen,
  mataKuliah,
  selectedMhs,
  setSelectedMhs,
  selectedDsn,
  setSelectedDsn,
  handleAddMahasiswa,
  handleDeleteMahasiswa,
  handleChangeDosen,
  handleDeleteKelas
}) {
  const { user } = useAuthStateContext();
  const permission = user?.permission || [];

  return (
    <div className="space-y-6">
      {kelas.length === 0 ? (
        <div className="text-center py-8 text-gray-500 italic">
          Belum ada kelas yang dibuat.
        </div>
      ) : (
        kelas.map((kls) => {
          const matkul = mataKuliah.find(m => m.id === kls.mata_kuliah_id);
          const dosenPengampu = dosen.find(d => d.id === kls.dosen_id);
          const mhsInClass = kls.mahasiswa_ids
            .map(id => mahasiswa.find(m => m.id === id))
            .filter(Boolean);

          return (
            <div key={kls.id} className="border rounded-lg shadow-md bg-white overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-3 border-b bg-gray-50">
                <div className="mb-2 md:mb-0">
                  <h3 className="text-lg font-semibold text-blue-800">{matkul?.name || "-"} ({matkul?.sks || 0} SKS)</h3>
                  <p className="text-sm text-gray-600">Dosen: <strong className="text-blue-700">{dosenPengampu?.name || "-"}</strong></p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {permission.includes("rencana-studi.update") && (
                    <Select
                      value={selectedDsn[kls.id] || ""}
                      onChange={(e) => setSelectedDsn({ ...selectedDsn, [kls.id]: e.target.value })}
                      size="sm"
                      className="w-48"
                    >
                      <option value="">-- Ganti Dosen --</option>
                      {dosen.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </Select>
                  )}
                  {permission.includes("rencana-studi.update") && (
                    <Button size="sm" onClick={() => handleChangeDosen(kls)}>Simpan Dosen</Button>
                  )}
                  {mhsInClass.length === 0 && permission.includes("rencana-studi.delete") && (
                    <Button size="sm" variant="danger" onClick={() => handleDeleteKelas(kls.id)}>
                      Hapus Kelas
                    </Button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="py-2 px-4 text-left">No</th>
                      <th className="py-2 px-4 text-left">Nama</th>
                      <th className="py-2 px-4 text-left">NIM</th>
                      <th className="py-2 px-4 text-center">Total SKS Terpakai</th>
                      {permission.includes("rencana-studi.update") && (
                        <th className="py-2 px-4 text-center">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {mhsInClass.length > 0 ? (
                      mhsInClass.map((m, i) => {
                        const totalSksMahasiswa = kelas
                          .filter(k => k.mahasiswa_ids.includes(m.id))
                          .map(k => mataKuliah.find(mk => mk.id === k.mata_kuliah_id)?.sks || 0)
                          .reduce((a, b) => a + b, 0);

                        return (
                          <tr key={m.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                            <td className="py-2 px-4">{i + 1}</td>
                            <td className="py-2 px-4">{m.name}</td>
                            <td className="py-2 px-4">{m.nim}</td>
                            <td className="py-2 px-4 text-center">{totalSksMahasiswa} / {m.max_sks}</td>
                            {permission.includes("rencana-studi.update") && (
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
                        <td colSpan={permission.includes("rencana-studi.update") ? "5" : "4"} className="py-3 px-4 text-center italic text-gray-500">
                          Belum ada mahasiswa di kelas ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {permission.includes("rencana-studi.create") && (
                <div className="flex items-center gap-2 px-4 py-3 border-t bg-gray-50 flex-wrap">
                  <Select
                    value={selectedMhs[kls.id] || ""}
                    onChange={(e) => setSelectedMhs({ ...selectedMhs, [kls.id]: e.target.value })}
                    size="sm"
                    className="w-full sm:w-56"
                  >
                    <option value="">-- Pilih Mahasiswa --</option>
                    {mahasiswa.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.nim})</option>
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
