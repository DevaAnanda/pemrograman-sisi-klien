// src/Pages/Admin/Dosen/TableDosen.jsx
import React from "react";
import Button from "@/Components/Button";
import { useAuthStateContext } from "@/Context/AuthContext";

const TableDosen = ({ data = [], onEdit, onDelete, onDetail }) => {
  const { user } = useAuthStateContext();
  const permission = user?.permission || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-700 whitespace-nowrap">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 text-left">ID Dosen</th>
            <th className="py-2 px-4 text-left">Nama Dosen</th>
            <th className="py-2 px-4 text-left">Departemen</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Max SKS</th>
            <th className="py-2 px-4 text-left">Mata Kuliah Diampu</th>
            <th className="py-2 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                Tidak ada data dosen.
              </td>
            </tr>
          ) : (
            data.map((dosen, index) => (
              // Menggunakan 'dosen.id' sebagai key karena itu ID unik yang diberikan json-server
              <tr key={dosen.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                <td className="py-2 px-4">{dosen.id_dosen}</td>
                <td className="py-2 px-4">{dosen.name}</td>
                <td className="py-2 px-4">{dosen.departemen}</td>
                <td className="py-2 px-4">{dosen.email}</td>
                <td className="py-2 px-4">{dosen.max_sks}</td>
                <td className="py-2 px-4">
                  {/* Tampilkan mata kuliah yang diampu, join array dengan koma */}
                  {Array.isArray(dosen.mata_kuliah_ampu)
                    ? dosen.mata_kuliah_ampu.join(', ')
                    : dosen.mata_kuliah_ampu}
                </td>
                <td className="py-2 px-4 text-center space-x-2">
                  <Button variant="secondary" onClick={() => onDetail(dosen.id_dosen)}>
                    Detail
                  </Button>
                  {permission.includes("dosen.update") && (
                    <Button onClick={() => onEdit(dosen)}>Edit</Button>
                  )}
                  {permission.includes("dosen.delete") && (
                    // Mengirim 'dosen.id' (ID json-server) untuk operasi hapus
                    <Button variant="danger" onClick={() => onDelete(dosen.id)}>
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

export default TableDosen;