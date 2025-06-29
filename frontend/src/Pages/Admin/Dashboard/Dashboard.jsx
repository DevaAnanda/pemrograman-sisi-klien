import React, { useEffect, useState } from 'react';
// Jalur relatif disesuaikan berdasarkan asumsi Dashboard.jsx ada di src/Pages/Admin/
import Card from '@/Components/Card'; 
import { useAuthStateContext } from '@/Context/AuthContext'; 
import TableMahasiswa from "@/Pages/Admin/Dashboard/TableMahasiswa"; // Asumsi TableMahasiswa berada di subfolder Dashboard
import { getAllMahasiswa } from '@/Utils/Helpers/Apis/MahasiswaApi'; 
import { useNavigate } from 'react-router-dom';

// Import komponen Recharts yang diperlukan
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// Import custom hook untuk data chart (sesuai yang Anda berikan)
import { useChartData } from '@/Utils/Hooks/useChart'; 

// Definisi warna untuk chart Pie (sesuai materi)
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

const Dashboard = () => {
  const { user } = useAuthStateContext();
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [nonActiveStudents, setNonActiveStudents] = useState(0);
  const [mahasiswa, setMahasiswa] = useState(); // Ini tampaknya tidak digunakan langsung di JSX tabel, tapi ada getAllMahasiswa
  const navigate = useNavigate();

  // Fetch data mahasiswa untuk statistik dashboard
  // Fungsi ini dipanggil dua kali (fetchMahasiswa dan fetch('http://localhost:3001/mahasiswa'))
  // Ini bisa dioptimalkan menggunakan React Query, tetapi saya akan mengikuti instruksi untuk tidak mengubah yang sudah ada.
  const fetchMahasiswa = async () => {
    getAllMahasiswa().then((res) => {
      // Data mahasiswa dari getAllMahasiswa() ini tidak digunakan untuk total/aktif/non-aktif
      // Hanya untuk TableMahasiswa di bawah
      setMahasiswa(res.data);
    });
  };

  useEffect(() => {
    fetchMahasiswa(); // Panggil fungsi API Anda

    // Fetch data mahasiswa untuk statistik menggunakan fetch API langsung (sesuai kode Anda)
    fetch('http://localhost:3001/mahasiswa')
      .then((response) => response.json())
      .then((data) => {
        setTotalStudents(data.length);
        setActiveStudents(data.filter((m) => m.status === 'aktif').length);
        setNonActiveStudents(data.filter((m) => m.status === 'tidak aktif').length);
      })
      .catch((error) => {
        console.error('Failed to fetch mahasiswa data for statistics:', error);
        setTotalStudents(0);
        setActiveStudents(0);
        setNonActiveStudents(0);
      });
  }, []);

  // Mengambil data untuk chart menggunakan useChartData hook
  const { data: chartData = {}, isLoading: isLoadingChart } = useChartData();

  // Destrukturisasi data chart
  const {
    students = [],
    genderRatio = [],
    registrations = [],
    gradeDistribution = [],
    lecturerRanks = [],
  } = chartData;

  return (
    <>
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Selamat datang, {user?.name || 'Admin'}</h2>
        {user?.permission.includes("mahasiswa.page") && (
          <p className="text-gray-600">Ini adalah halaman dashboard admin. Gunakan menu di sebelah kiri untuk navigasi.</p>
        )}
      </Card>

      {/* Bagian Statistik Mahasiswa */}
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

      {/* Bagian Visualisasi Charts */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Statistik Universitas</h2>
        {isLoadingChart ? (
          <div className="p-6 text-center text-gray-500">Memuat data chart...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* A. BarChart – Mahasiswa per Fakultas */}
            <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Mahasiswa per Fakultas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={students}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faculty" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* B. PieChart – Rasio Gender Mahasiswa */}
            <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Rasio Gender Mahasiswa</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={genderRatio} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={80} label>
                    {genderRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend /> {/* Tambahkan Legend agar label warna terlihat */}
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* C. LineChart – Tren Pendaftaran Mahasiswa */}
            <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Tren Pendaftaran Mahasiswa</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={registrations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* D. RadarChart – Nilai Mahasiswa per Jurusan */}
            <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Distribusi Nilai Mahasiswa per Jurusan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={gradeDistribution}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name="A" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="B" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
                  <Radar name="C" dataKey="C" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* E. AreaChart – Pangkat Dosen */}
            <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Jumlah Dosen per Pangkat</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={lecturerRanks}>
                  <defs>
                    <linearGradient id="colorLecturer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="rank" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorLecturer)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Card>

      {/* Bagian Tabel Mahasiswa */}
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
