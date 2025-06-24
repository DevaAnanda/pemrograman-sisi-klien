import React, { useEffect, useState } from "react";
import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import { useParams } from "react-router-dom";
// Assuming you have an API helper for dosen
import { getAllDosen } from "@/Utils/Helpers/Apis/DosenApi"; // Change to DosenApi

const DosenDetail = () => {
  // Change 'kode_mk' to 'id_dosen' to match the lecturer ID parameter
  const { id_dosen } = useParams();
  const [dosen, setDosen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDosen = async () => {
      try {
        // Fetch all dosen (assuming your API returns a list of lecturers)
        const response = await getAllDosen();
        // Find the specific dosen by id_dosen
        const data = response.data.find((d) => d.id_dosen === id_dosen); // Use d.id_dosen
        setDosen(data);
      } catch (error) {
        console.error("Gagal memuat data dosen:", error);
        // Optionally, show a toast error here
      } finally {
        setLoading(false);
      }
    };

    fetchDosen();
  }, [id_dosen]); // Depend on id_dosen to refetch if it changes

  if (loading) return <p>Memuat data dosen...</p>;
  if (!dosen) return <p className="text-red-600">Data dosen tidak ditemukan.</p>;

  return (
    <Card>
      <Heading as="h2" className="mb-4 text-left">
        Detail Dosen: {dosen.nama_dosen}
      </Heading>

      <table className="table-auto text-sm w-full">
        <tbody>
          <tr>
            <td className="py-2 px-4 font-medium">ID Dosen</td>
            <td className="py-2 px-4">{dosen.id_dosen}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Nama Dosen</td>
            <td className="py-2 px-4">{dosen.nama_dosen}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Departemen</td>
            <td className="py-2 px-4">{dosen.departemen}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Email</td>
            <td className="py-2 px-4">{dosen.email}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Mata Kuliah Diampu</td>
            <td className="py-2 px-4">
              {Array.isArray(dosen.mata_kuliah_ampu)
                ? dosen.mata_kuliah_ampu.join(", ") // Join array items with comma
                : dosen.mata_kuliah_ampu}
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
};

export default DosenDetail;