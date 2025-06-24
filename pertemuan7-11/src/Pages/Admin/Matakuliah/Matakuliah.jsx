import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import Button from "@/Components/Button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// Pastikan path ini sudah benar setelah Anda memindahkan atau mengganti name folder
import ModalMatakuliah from "@/Pages/Admin/Matakuliah/ModalMatakuliah";
import TableMatakuliah from "@/Pages/Admin/Matakuliah/TableMatakuliah";

import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";
import {
  getAllMatakuliah,
  storeMatakuliah,
  updateMatakuliah,
  deleteMatakuliah,
} from "@/Utils/Helpers/Apis/MatakuliahApi";

import { useAuthStateContext } from "@/Context/AuthContext";

const Matakuliah = () => {
  // State untuk menyimpan daftar mata kuliah
  const [matakuliahList, setMatakuliahList] = useState([]);
  const navigate = useNavigate();
  // State untuk form input/edit mata kuliah
  const [form, setForm] = useState({
    id: "", // Jika id di-generate backend, ini bisa diabaikan untuk input baru
    kode: "",
    name: "",
    semester: "",
    jenis: "",
    sks: "",
    jenisnilai: "",
    status: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const { user } = useAuthStateContext();

  // Efek samping untuk memuat data mata kuliah saat komponen dimuat
  useEffect(() => {
    fetchMatakuliahList();
  }, []); // Array dependensi kosong agar hanya berjalan sekali saat mount

  // Fungsi untuk mengambil semua data mata kuliah dari API
  const fetchMatakuliahList = async () => {
    try {
      const response = await getAllMatakuliah();
      // Asumsi response.data adalah array mata kuliah
      setMatakuliahList(response.data);
    } catch (error) {
      console.error("Gagal memuat data mata kuliah:", error);
      toastError("Gagal memuat data mata kuliah.");
    }
  };

  // Handler untuk perubahan input pada form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk submit form (tambah atau edit)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah refresh halaman default form

    // Validasi dasar untuk field yang wajib diisi
    if (!form.kode || !form.name || !form.semester || !form.sks) {
      toastError("kode, name, semester, dan sks wajib diisi.");
      return;
    }

    if (isEdit) {
      // Logika untuk update data
      confirmUpdate(async () => {
        try {
          // Asumsi kode digunakan sebagai identifier untuk update
          await updateMatakuliah(form.kode, form);
          toastSuccess("Data mata kuliah berhasil diperbarui.");
          fetchMatakuliahList(); // Muat ulang data setelah update
          resetFormAndCloseModal();
        } catch (error) {
          console.error("Gagal memperbarui data mata kuliah:", error);
          toastError("Gagal memperbarui data mata kuliah.");
        }
      });
    } else {
      // Logika untuk menambahkan data baru
      // Cek apakah kode Mata Kuliah sudah ada
      const exists = matakuliahList.find((mk) => mk.kode === form.kode);
      if (exists) {
        toastError("kode Mata Kuliah sudah terdaftar!");
        return;
      }

      try {
        await storeMatakuliah(form); // Simpan data mata kuliah baru
        toastSuccess("Data mata kuliah berhasil ditambahkan.");
        fetchMatakuliahList(); // Muat ulang data setelah menambah
        resetFormAndCloseModal();
      } catch (error) {
        console.error("Gagal menambahkan data mata kuliah:", error);
        toastError("Gagal menambahkan data mata kuliah.");
      }
    }
  };

  // Handler untuk membuka modal edit dan mengisi form dengan data yang akan diedit
  const handleEdit = (matakuliah) => {
    setForm({
      id: matakuliah.id,
      kode: matakuliah.kode,
      name: matakuliah.name,
      semester: matakuliah.semester,
      jenis: matakuliah.jenis,
      sks: matakuliah.sks,
      jenisnilai: matakuliah.jenisnilai,
      status: matakuliah.status,
    });
    setIsEdit(true);
    setIsModalOpen(true);
  };

  // Handler untuk menghapus data mata kuliah
  const handleDelete = async (kode) => {
    confirmDelete(async () => {
      try {
        await deleteMatakuliah(kode); // Hapus mata kuliah berdasarkan kode
        toastSuccess("Data mata kuliah berhasil dihapus.");
        fetchMatakuliahList(); // Muat ulang data setelah dihapus
      } catch (error) {
        console.error("Gagal menghapus data mata kuliah:", error);
        toastError("Gagal menghapus data mata kuliah.");
      }
    });
  };

  // Fungsi untuk mereset form dan menutup modal
  const resetFormAndCloseModal = () => {
    setForm({
      id: "",
      kode: "",
      name: "",
      semester: "",
      jenis: "",
      sks: "",
      jenisnilai: "",
      status: "",
    });
    setIsEdit(false);
    setIsModalOpen(false);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Heading as="h2" className="mb-0 text-left">
          Daftar Mata Kuliah
        </Heading>
        {/* Tombol Tambah Mata Kuliah, tampil jika user memiliki permission 'matakuliah.create' */}
        {user?.permission.includes("matakuliah.create") && (
          <Button
            onClick={() => {
              resetFormAndCloseModal(); // Pastikan form direset untuk entri baru
              setIsModalOpen(true);
            }}
          >
            + Tambah Mata Kuliah
          </Button>
        )}
      </div>
      {/* Tabel daftar Mata Kuliah, tampil jika user memiliki permission 'matakuliah.read' */}
      {user?.permission.includes("matakuliah.read") && (
        <TableMatakuliah
          data={matakuliahList} // Meneruskan daftar mata kuliah ke komponen tabel
          onEdit={handleEdit}
          onDelete={handleDelete}
          // Navigasi ke halaman detail mata kuliah berdasarkan kode
          onDetail={(kode_mk) => navigate(`/admin/matakuliah/${kode_mk}`)}
        />
      )}

      {/* Modal untuk input/edit data mata kuliah */}
      {isModalOpen && (
        <ModalMatakuliah
          isOpen={isModalOpen}
          isEdit={isEdit}
          form={form}
          onChange={handleInputChange}
          onClose={resetFormAndCloseModal} // Panggil fungsi reset saat modal ditutup
          onSubmit={handleSubmit}
        />
      )}
    </Card>
  );
};

export default Matakuliah;