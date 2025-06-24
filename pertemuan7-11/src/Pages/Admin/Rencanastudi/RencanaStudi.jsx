import { useState, useEffect } from "react";

import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import Button from "@/Components/Button";

import ModalRencanaStudi from "@/Pages/Admin/Rencanastudi/ModalRencanaStudi";
import TableRencanaStudi from "@/Pages/Admin/Rencanastudi/TableRencanaStudi";

import { confirmDelete } from "@/Utils/Helpers/SwalHelpers";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";

import { getAllDosen } from "@/Utils/Helpers/Apis/DosenApi";
import { getAllKelas, storeKelas, updateKelas, deleteKelas } from "@/Utils/Helpers/Apis/KelasApi";
import { getAllMahasiswa } from "@/Utils/Helpers/Apis/MahasiswaApi";
import { getAllMatakuliah } from "@/Utils/Helpers/Apis/MatakuliahApi";

import { useAuthStateContext } from "@/Context/AuthContext";

const RencanaStudi = () => {
  const { user } = useAuthStateContext();

  const [kelas, setKelas] = useState([]);
  const [dosen, setDosen] = useState([]);
  const [mahasiswa, setMahasiswa] = useState([]);
  const [mataKuliah, setMataKuliah] = useState([]);

  const [selectedMhs, setSelectedMhs] = useState({});
  const [selectedDsn, setSelectedDsn] = useState({});

  const [form, setForm] = useState({ mata_kuliah_id: "", dosen_id: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resKelas, resDosen, resMahasiswa, resMataKuliah] = await Promise.all([
        getAllKelas(),
        getAllDosen(),
        getAllMahasiswa(),
        getAllMatakuliah(),
      ]);
      setKelas(resKelas.data);
      setDosen(resDosen.data);
      setMahasiswa(resMahasiswa.data);
      setMataKuliah(resMataKuliah.data);
    } catch (error) {
      console.error("Gagal memuat data rencana studi:", error);
      toastError("Gagal memuat data rencana studi.");
    }
  };

  const mataKuliahSudahDipakai = kelas.map(k => k.mata_kuliah_id);
  const mataKuliahBelumAdaKelas = mataKuliah.filter(m => !mataKuliahSudahDipakai.includes(m.id));

  const getMaxSks = (id) => mahasiswa.find(m => m.id === id)?.max_sks || 0;
  const getDosenMaxSks = (id) => dosen.find(d => d.id === id)?.max_sks || 0;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handler untuk submit form "Tambah Kelas Baru"
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mata_kuliah_id || !form.dosen_id) {
      toastError("Mata Kuliah dan Dosen Pengampu wajib diisi.");
      return;
    }

    try {
      // Tambah kelas baru dengan mahasiswa_ids kosong
      await storeKelas({ ...form, mahasiswa_ids: [] });
      setIsModalOpen(false); // Tutup modal
      toastSuccess("Kelas berhasil ditambahkan.");
      fetchData(); // Muat ulang data
    } catch (error) {
      console.error("Gagal menambahkan kelas:", error);
      toastError("Gagal menambahkan kelas.");
    }
  };

  // Handler untuk menambahkan mahasiswa ke kelas
  const handleAddMahasiswa = async (kelasItem, mhsId) => {
    // Validasi: pastikan mahasiswa dan kelasItem ada, dan mhsId terpilih
    if (!mhsId || !kelasItem) {
      toastError("Pilih mahasiswa untuk ditambahkan.");
      return;
    }

    // Cari mata kuliah kelas ini untuk mendapatkan SKS
    const matkul = mataKuliah.find(m => m.id === kelasItem.mata_kuliah_id);
    const sksKelasIni = matkul?.sks || 0;

    // Hitung total SKS yang sudah diambil mahasiswa dari kelas lain
    const totalSksMahasiswaSaatIni = kelas
      .filter(k => k.mahasiswa_ids.includes(mhsId) && k.id !== kelasItem.id) // Filter kelas yang sudah diambil, kecuali kelas saat ini
      .map(k => mataKuliah.find(m => m.id === k.mata_kuliah_id)?.sks || 0)
      .reduce((acc, curr) => acc + curr, 0);

    const maxSksMahasiswa = getMaxSks(mhsId);

    // Validasi batas SKS mahasiswa
    if (totalSksMahasiswaSaatIni + sksKelasIni > maxSksMahasiswa) {
      toastError(`Total SKS (${totalSksMahasiswaSaatIni + sksKelasIni}) melebihi batas maksimal mahasiswa (${maxSksMahasiswa}).`);
      return;
    }

    // Validasi: mahasiswa sudah terdaftar di kelas ini
    if (kelasItem.mahasiswa_ids.includes(mhsId)) {
      toastError("Mahasiswa sudah terdaftar di kelas ini.");
      return;
    }

    // Buat objek kelas yang diperbarui
    const updatedKelas = {
      ...kelasItem,
      mahasiswa_ids: [...kelasItem.mahasiswa_ids, mhsId]
    };

    try {
      await updateKelas(kelasItem.id, updatedKelas); // Update kelas di backend
      toastSuccess("Mahasiswa berhasil ditambahkan.");
      setSelectedMhs(prev => ({ ...prev, [kelasItem.id]: "" })); // Reset dropdown
      fetchData(); // Muat ulang data
    } catch (error) {
      console.error("Gagal menambahkan mahasiswa:", error);
      toastError("Gagal menambahkan mahasiswa.");
    }
  };

  // Handler untuk menghapus mahasiswa dari kelas
  const handleDeleteMahasiswa = async (kelasItem, mhsId) => {
    const updatedKelas = {
      ...kelasItem,
      mahasiswa_ids: kelasItem.mahasiswa_ids.filter(id => id !== mhsId)
    };

    try {
      await updateKelas(kelasItem.id, updatedKelas); // Update kelas di backend
      toastSuccess("Mahasiswa berhasil dihapus.");
      fetchData(); // Muat ulang data
    } catch (error) {
      console.error("Gagal menghapus mahasiswa:", error);
      toastError("Gagal menghapus mahasiswa.");
    }
  };

  // Handler untuk mengganti dosen pengampu kelas
  const handleChangeDosen = async (kelasItem) => {
    const dsnId = selectedDsn[kelasItem.id];
    if (!dsnId) {
      toastError("Pilih dosen untuk diganti.");
      return;
    }

    // Cek apakah dosen baru sama dengan dosen lama
    if (kelasItem.dosen_id === dsnId) {
        toastError("Dosen yang dipilih sudah menjadi pengampu kelas ini.");
        return;
    }

    // Hitung total SKS yang sudah diampu dosen baru (termasuk kelas ini)
    const totalSksDosenBaru = kelas
      .filter(k => k.dosen_id === dsnId && k.id !== kelasItem.id) // Kelas lain yang diampu dosen baru
      .map(k => mataKuliah.find(m => m.id === k.mata_kuliah_id)?.sks || 0)
      .reduce((acc, curr) => acc + curr, 0);

    const sksKelasIni = mataKuliah.find(m => m.id === kelasItem.mata_kuliah_id)?.sks || 0;
    const maxSksDosen = getDosenMaxSks(dsnId);

    // Validasi batas SKS dosen
    if (totalSksDosenBaru + sksKelasIni > maxSksDosen) {
      toastError(`Dosen ini sudah mengampu SKS melebihi batas maksimal (${maxSksDosen}).`);
      return;
    }

    // Buat objek kelas yang diperbarui
    const updatedKelas = { ...kelasItem, dosen_id: dsnId };

    try {
      await updateKelas(kelasItem.id, updatedKelas); // Update kelas di backend
      toastSuccess("Dosen pengampu berhasil diperbarui.");
      setSelectedDsn(prev => ({ ...prev, [kelasItem.id]: "" })); // Reset dropdown
      fetchData(); // Muat ulang data
    } catch (error) {
      console.error("Gagal memperbarui dosen pengampu:", error);
      toastError("Gagal memperbarui dosen pengampu.");
    }
  };

  // Handler untuk menghapus kelas
  const handleDeleteKelas = async (kelasId) => {
    // Cari kelas yang akan dihapus
    const kelasToDelete = kelas.find(k => k.id === kelasId);
    if (!kelasToDelete) return;

    // Validasi: kelas tidak boleh dihapus jika masih ada mahasiswa
    if (kelasToDelete.mahasiswa_ids && kelasToDelete.mahasiswa_ids.length > 0) {
      toastError("Tidak dapat menghapus kelas yang masih memiliki mahasiswa.");
      return;
    }

    confirmDelete(async () => {
      try {
        await deleteKelas(kelasId); // Hapus kelas di backend
        toastSuccess("Kelas berhasil dihapus.");
        fetchData(); // Muat ulang data
      } catch (error) {
        console.error("Gagal menghapus kelas:", error);
        toastError("Gagal menghapus kelas.");
      }
    });
  };

  // Fungsi untuk membuka modal tambah kelas baru
  const openAddModal = () => {
    setForm({ mata_kuliah_id: "", dosen_id: "" }); // Reset form
    setIsModalOpen(true); // Buka modal
  };

  // Fungsi untuk menutup modal dan mereset form
  const resetFormAndCloseModal = () => {
    setForm({ mata_kuliah_id: "", dosen_id: "" });
    setIsModalOpen(false);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Heading as="h2" className="mb-0 text-left">
          Rencana Studi
        </Heading>
        {/* Tombol Tambah Kelas, tampil jika user memiliki permission 'rencana-studi.create' */}
        {user?.permission.includes("rencana-studi.create") && (
          <Button onClick={openAddModal}>
            + Tambah Kelas
          </Button>
        )}
      </div>

      {/* Tabel daftar Rencana Studi, tampil jika user memiliki permission 'rencana-studi.read' */}
      {user?.permission.includes("rencana-studi.read") ? (
        <TableRencanaStudi
          kelas={kelas}
          mahasiswa={mahasiswa}
          dosen={dosen}
          mataKuliah={mataKuliah}
          selectedMhs={selectedMhs}
          setSelectedMhs={setSelectedMhs}
          selectedDsn={selectedDsn}
          setSelectedDsn={setSelectedDsn}
          handleAddMahasiswa={handleAddMahasiswa}
          handleDeleteMahasiswa={handleDeleteMahasiswa}
          handleChangeDosen={handleChangeDosen}
          handleDeleteKelas={handleDeleteKelas}
        />
      ) : (
        <p className="text-center text-gray-500 italic">Anda tidak memiliki izin untuk melihat data rencana studi.</p>
      )}


      {/* Modal untuk input/edit data kelas */}
      {isModalOpen && (
        <ModalRencanaStudi
          isOpen={isModalOpen}
          onClose={resetFormAndCloseModal} // Panggil fungsi reset saat modal ditutup
          onChange={handleChange}
          onSubmit={handleSubmit}
          form={form}
          dosen={dosen}
          mataKuliah={mataKuliahBelumAdaKelas} // Hanya tampilkan mata kuliah yang belum memiliki kelas
        />
      )}
    </Card>
  );
};

export default RencanaStudi;
