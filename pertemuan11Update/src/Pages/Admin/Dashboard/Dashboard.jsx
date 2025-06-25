import React, { useEffect, useState } from 'react';
import  Card  from '@/Components/Card';
import { useAuthStateContext } from '@/Context/AuthContext';
import TableMahasiswa from "@/Pages/Admin/Dashboard/TableMahasiswa";
import { getAllMahasiswa } from "@/Utils/Helpers/Apis/MahasiswaApi";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuthStateContext();
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [nonActiveStudents, setNonActiveStudents] = useState(0);
  const [mahasiswa, setMahasiswa] = useState();
  const navigate = useNavigate();
  const fetchMahasiswa = async () => {
    getAllMahasiswa().then((res) => setMahasiswa(res.data));
  };

  useEffect(() => {
    // Fetch mahasiswa data from backend
    fetchMahasiswa();
    fetch('http://localhost:3001/mahasiswa')
      .then((response) => response.json())
      .then((data) => {
        setTotalStudents(data.length);
        setActiveStudents(data.filter((m) => m.status === 'aktif').length);
        setNonActiveStudents(data.filter((m) => m.status === 'tidak aktif').length);
      })
      .catch((error) => {
        console.error('Failed to fetch mahasiswa data:', error);
        // fallback to zeros or previous values
        setTotalStudents(0);
        setActiveStudents(0);
        setNonActiveStudents(0);
      });
  }, []);
  return (
    <>
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Selamat datang, {user?.name || 'Admin'}</h2>
        {user?.permission.includes("mahasiswa.page") && (
          <p className="text-gray-600">Ini adalah halaman dashboard admin. Gunakan menu di sebelah kiri untuk navigasi.</p>
        )}
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Total Mahasiswa</h3>
            <span className="text-2xl font-bold text-blue-600">{totalStudents}</span>
          </div>
          <p className="text-gray-500">Total mahasiswa yang terdaftar dalam sistem</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Mahasiswa Aktif</h3>
            <span className="text-2xl font-bold text-green-600">{activeStudents}</span>
          </div>
          <p className="text-gray-500">Mahasiswa dengan status aktif</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Mahasiswa Tidak Aktif</h3>
            <span className="text-2xl font-bold text-red-600">{nonActiveStudents}</span>
          </div>
          <p className="text-gray-500">Mahasiswa dengan status tidak aktif</p>
        </Card>
      </div>
      <Card className="p-6 mb-6">
        <TableMahasiswa
          data={mahasiswa}
          onDetail={(nim) => navigate(`/admin/mahasiswa/${nim}`)}
        />
      </Card>
    </>
  );
};


export default Dashboard;