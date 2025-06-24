import Button from "@/Components/Button";
import { useAuthStateContext } from "@/Context/AuthContext";

const TableMahasiswa = ({ data = [], onEdit, onDelete, onDetail }) => {
  const { user } = useAuthStateContext();
  const permission = user?.permission || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-700 whitespace-nowrap">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 text-left">NIM</th>
            <th className="py-2 px-4 text-left">Nama</th>
            <th className="py-2 px-4 text-left">Program Studi</th>
            <th className="py-2 px-4 text-left">Status Aktif</th> {/* Kolom tetap sama */}
            <th className="py-2 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                Tidak ada data mahasiswa.
              </td>
            </tr>
          ) : (
            data.map((mhs, index) => (
              <tr key={mhs.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}> {/* Gunakan mhs.id sebagai key */}
                <td className="py-2 px-4">{mhs.nim}</td>
                <td className="py-2 px-4">{mhs.nama}</td>
                <td className="py-2 px-4">{mhs.prodi}</td>
                <td className="py-2 px-4">{mhs.status}</td> {/* Ganti 'aktif' menjadi 'status' */}
                <td className="py-2 px-4 text-center space-x-2">
                  <Button variant="secondary" onClick={() => onDetail(mhs.nim)}>Detail</Button>
                  {permission.includes("mahasiswa.update") && (
                    <Button onClick={() => onEdit(mhs)}>Edit</Button>
                  )}
                  {permission.includes("mahasiswa.delete") && (
                    <Button variant="danger" onClick={() => onDelete(mhs.id)}> {/* Gunakan mhs.id untuk delete sesuai API */}
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

export default TableMahasiswa;