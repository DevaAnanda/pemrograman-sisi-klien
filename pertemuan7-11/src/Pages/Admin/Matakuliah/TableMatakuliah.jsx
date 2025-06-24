import Button from "@/Components/Button";
import { useAuthStateContext } from "@/Context/AuthContext";

// Ganti nama komponen menjadi TableMatakuliah
const TableMatakuliah = ({ data = [], onEdit, onDelete, onDetail }) => {
  const { user } = useAuthStateContext();
  const permission = user?.permission || [];

  return (
    <div className="overflow-x-auto"> {/* Tambahkan overflow-x-auto untuk tabel lebar */}
      <table className="w-full text-sm text-gray-700 whitespace-nowrap"> {/* Tambahkan whitespace-nowrap */}
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 text-left">No.</th> {/* Kolom No */}
            <th className="py-2 px-4 text-left">Kode</th>
            <th className="py-2 px-4 text-left">Nama Mata Kuliah</th>
            <th className="py-2 px-4 text-left">Semester</th>
            <th className="py-2 px-4 text-left">Jenis</th>
            <th className="py-2 px-4 text-left">SKS</th>
            <th className="py-2 px-4 text-left">Jenis Nilai</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="9" className="py-4 px-4 text-center text-gray-500">
                Tidak ada data mata kuliah.
              </td>
            </tr>
          ) : (
            data.map((mk, index) => ( // Ganti mhs menjadi mk
              <tr
                key={mk.Kode} // Gunakan Kode sebagai key unik
                className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
              >
                <td className="py-2 px-4">{mk.id}</td> {/* Tampilkan No */}
                <td className="py-2 px-4">{mk.kode}</td>
                <td className="py-2 px-4">{mk.name}</td>
                <td className="py-2 px-4">{mk.semester}</td>
                <td className="py-2 px-4">{mk.jenis}</td>
                <td className="py-2 px-4">{mk.sks}</td>
                <td className="py-2 px-4">{mk.jenisnilai}</td>
                <td className="py-2 px-4">{mk.status}</td>
                <td className="py-2 px-4 text-center space-x-2">
                  <Button variant="secondary" onClick={() => onDetail(mk.Kode)}>
                    Detail
                  </Button>
                  {permission.includes("matakuliah.update") && ( // Sesuaikan permission
                    <Button onClick={() => onEdit(mk)}>Edit</Button>
                  )}
                  {permission.includes("matakuliah.delete") && ( // Sesuaikan permission
                    <Button variant="danger" onClick={() => onDelete(mk.id)}> {/* Gunakan Kode untuk delete */}
                      Hapus
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableMatakuliah;