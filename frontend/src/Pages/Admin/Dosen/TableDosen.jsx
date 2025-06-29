// src/Pages/Admin/Dosen/TableDosen.jsx
import React from "react";
import Button from "@/Components/Button";
import { useAuthStateContext } from "@/Context/AuthContext";

const TableDosen = ({ data = [], onEdit, onDelete, onDetail, getTotalSksDosen, isLoading }) => { // Tambah isLoading prop
  const { user } = useAuthStateContext();
  const permission = user?.permission || [];

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 text-left">No.</th>
            <th className="py-2 px-4 text-left">ID Dosen</th>
            <th className="py-2 px-4 text-left">Nama Dosen</th>
            <th className="py-2 px-4 text-left">Departemen</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-center">Max SKS</th>
            <th className="py-2 px-4 text-center">SKS Terampu</th>
            <th className="py-2 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? ( // Tampilkan loading state di dalam tabel
            <tr>
              <td colSpan="8" className="py-4 px-4 text-center text-gray-500 italic">
                Memuat data...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan="8" className="py-4 px-4 text-center text-gray-500 italic">
                Tidak ada data dosen.
              </td>
            </tr>
          ) : (
            data.map((dsn, index) => {
              const totalSksTerampu = getTotalSksDosen(dsn.id); // Menggunakan dsn.id (ID angka dari JSON)

              return (
                <tr
                  key={dsn.id} // Gunakan ID asli sebagai key unik
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="py-2 px-4">{index + 1}.</td>
                  <td className="py-2 px-4">{dsn.id_dosen}</td>
                  <td className="py-2 px-4">{dsn.name}</td> {/* Gunakan dsn.name sesuai form state */}
                  <td className="py-2 px-4">{dsn.departemen}</td>
                  <td className="py-2 px-4">{dsn.email}</td>
                  <td className="py-2 px-4 text-center">{dsn.max_sks}</td>
                  <td className="py-2 px-4 text-center">{totalSksTerampu}</td>
                  <td className="py-2 px-4 text-center space-x-2">
                    {permission.includes("dosen.read") && (
                      <Button variant="secondary" onClick={() => onDetail(dsn.id_dosen)}>
                        Detail
                      </Button>
                    )}
                    {permission.includes("dosen.update") && (
                      <Button size="sm" variant="warning" onClick={() => onEdit(dsn)}>
                        Edit
                      </Button>
                    )}
                    {permission.includes("dosen.delete") && (
                      <Button size="sm" variant="danger" onClick={() => onDelete(dsn.id)}>
                        Hapus
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableDosen;