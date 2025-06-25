import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import Button from "@/Components/Button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ModalMahasiswa from "@/Pages/Admin/Mahasiswa/ModalMahasiswa";
import TableMahasiswa from "@/Pages/Admin/Mahasiswa/TableMahasiswa";

import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";
import {
  getAllMahasiswa,
  storeMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from "@/Utils/Helpers/Apis/MahasiswaApi";

import { useAuthStateContext } from "@/Context/AuthContext";

// ... (imports lainnya)

const Mahasiswa = () => {
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nim: "",
    nama: "",
    status: "", // Ganti 'aktif' menjadi 'status'
    prodi: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const { user } = useAuthStateContext();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMahasiswaList();
  }, []);

  const fetchMahasiswaList = async () => {
    setLoading(true);
    try {
      const response = await getAllMahasiswa();
      setMahasiswaList(response.data);
    } catch (error) {
      console.error("Gagal memuat data mahasiswa:", error);
      toastError("Gagal memuat data mahasiswa.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormAndCloseModal = () => {
    setForm({
      nim: "",
      nama: "",
      status: "", // Ganti 'aktif' menjadi 'status'
      prodi: "",
    });
    setIsEdit(false);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi dasar
    if (!form.nim || !form.nama || !form.status || !form.prodi) { // Ganti 'aktif' menjadi 'status'
      toastError("NIM, Nama, Status, dan Prodi wajib diisi."); // Update pesan error
      return;
    }

    if (isEdit) {
      confirmUpdate(async () => {
        try {
          // Menggunakan 'id' dari form untuk update, karena API Anda menerima 'id'
          // Jika 'id' tidak ada di form state, Anda perlu menambahkan mhs.id saat handleEdit
          await updateMahasiswa(form.id, form); // Perbaikan: Gunakan form.id untuk update
          toastSuccess("Data mahasiswa berhasil diperbarui.");
          await fetchMahasiswaList();
          resetFormAndCloseModal();
        } catch (error) {
          console.error("Gagal memperbarui data mahasiswa:", error);
          toastError("Gagal memperbarui data mahasiswa.");
        }
      });
    } else {
      const exists = mahasiswaList.find((mhs) => mhs.nim === form.nim);
      if (exists) {
        toastError("NIM sudah terdaftar!");
        return;
      }

      try {
        await storeMahasiswa(form);
        toastSuccess("Data mahasiswa berhasil ditambahkan.");
        await fetchMahasiswaList();
        resetFormAndCloseModal();
      } catch (error) {
        console.error("Gagal menambahkan data mahasiswa:", error);
        toastError("Gagal menambahkan data mahasiswa.");
      }
    }
  };

  const handleEdit = (mhs) => {
    setForm({
      id: mhs.id, // Pastikan Anda menyimpan 'id' dari objek mahasiswa saat mengedit
      nim: mhs.nim,
      nama: mhs.nama,
      status: mhs.status, // Ganti 'aktif' menjadi 'status'
      prodi: mhs.prodi,
    });
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => { // Parameter tetap 'id' sesuai API Anda
    confirmDelete(async () => {
      try {
        await deleteMahasiswa(id); // Gunakan 'id' untuk delete
        toastSuccess("Data mahasiswa berhasil dihapus.");
        await fetchMahasiswaList();
      } catch (error) {
        console.error("Gagal menghapus data mahasiswa:", error);
        toastError("Gagal menghapus data mahasiswa.");
      }
    });
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Heading as="h2" className="mb-0 text-left">
          Daftar Mahasiswa
        </Heading>
        {user?.permission.includes("mahasiswa.create") && (
          <Button
            onClick={() => {
              resetFormAndCloseModal();
              setIsModalOpen(true);
            }}
          >
            + Tambah Mahasiswa
          </Button>
        )}
      </div>

      {loading ? (
        <p>Memuat data mahasiswa...</p>
      ) : (
        <>
          {user?.permission.includes("mahasiswa.read") && (
            <TableMahasiswa
              data={mahasiswaList}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDetail={(nim) => navigate(`/admin/mahasiswa/${nim}`)} // Tetap nim untuk detail
            />
          )}
          {!user?.permission.includes("mahasiswa.read") && (
              <p className="text-red-600">Anda tidak memiliki izin untuk melihat daftar mahasiswa.</p>
          )}
        </>
      )}

      {isModalOpen && (
        <ModalMahasiswa
          isOpen={isModalOpen}
          isEdit={isEdit}
          form={form}
          onChange={handleInputChange}
          onClose={resetFormAndCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </Card>
  );
};

export default Mahasiswa;