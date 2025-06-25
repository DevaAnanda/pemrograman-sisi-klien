import React, { useEffect, useState } from "react";
import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import { useParams } from "react-router-dom";
// Assuming you have an API helper for matakuliah
import { getAllMatakuliah } from "@/Utils/Helpers/Apis/MatakuliahApi"; 

const MatakuliahDetail = () => {
  // Change 'nim' to 'kode_mk' to match the course code parameter
  const { kode_mk } = useParams(); 
  const [matakuliah, setMatakuliah] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatakuliah = async () => {
      try {
        // Fetch all matakuliah (assuming your API returns a list of courses)
        const response = await getAllMatakuliah(); 
        // Find the specific matakuliah by kode_mk
        const data = response.data.find((mk) => mk.kode === kode_mk); 
        setMatakuliah(data);
      } catch (error) {
        console.error("Gagal memuat data mata kuliah:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatakuliah();
  }, [kode_mk]); // Depend on kode_mk to refetch if it changes

  if (loading) return <p>Memuat data mata kuliah...</p>;
  if (!matakuliah) return <p className="text-red-600">Data mata kuliah tidak ditemukan.</p>;

  return (
    <Card>
      <Heading as="h2" className="mb-4 text-left">
        Detail Mata Kuliah: {matakuliah.name}
      </Heading>

      <table className="table-auto text-sm w-full">
        <tbody>
          <tr>
            <td className="py-2 px-4 font-medium">Kode Mata Kuliah</td>
            <td className="py-2 px-4">{matakuliah.kode}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Nama Mata Kuliah</td>
            <td className="py-2 px-4">{matakuliah.name}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Semester</td>
            <td className="py-2 px-4">{matakuliah.semester}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Jenis</td>
            <td className="py-2 px-4">{matakuliah.jenis}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">SKS</td>
            <td className="py-2 px-4">{matakuliah.sks}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Jenis Nilai</td>
            <td className="py-2 px-4">{matakuliah.jenisnilai}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Status</td>
            <td className="py-2 px-4">{matakuliah.status}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
};

export default MatakuliahDetail;