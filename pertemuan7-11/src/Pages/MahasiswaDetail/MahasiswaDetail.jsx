import React, { useEffect, useState } from "react";
import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import { useParams } from "react-router-dom";
import { getAllMahasiswa } from "@/Utils/Helpers/Apis/MahasiswaApi";

const MahasiswaDetail = () => {
  const { nim } = useParams();
  const [mahasiswa, setMahasiswa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMahasiswa = async () => {
      try {
        const response = await getAllMahasiswa();
        const data = response.data.find((m) => m.nim === nim);
        setMahasiswa(data);
      } catch (error) {
        console.error("Gagal memuat data mahasiswa:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMahasiswa();
  }, [nim]);

  if (loading) return <p>Memuat data mahasiswa...</p>;
  if (!mahasiswa) return <p className="text-red-600">Data mahasiswa tidak ditemukan.</p>;

  return (
    <Card>
      <Heading as="h2" className="mb-4 text-left">
        Nama: {mahasiswa.nama}
        <br />
        Program Studi: {mahasiswa.prodi || "Belum tersedia"}
      </Heading>

      <table className="table-auto text-sm w-full">
        <tbody>
          <tr>
            <td className="py-2 px-4 font-medium">NIM</td>
            <td className="py-2 px-4">{mahasiswa.nim}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Nama</td>
            <td className="py-2 px-4">{mahasiswa.nama}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-medium">Program Studi</td>
            <td className="py-2 px-4">{mahasiswa.prodi || "-"}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
};

export default MahasiswaDetail;
