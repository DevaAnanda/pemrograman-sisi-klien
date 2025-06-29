import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import komponen UI umum
import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import Button from "@/Components/Button";

// Import komponen spesifik untuk Mahasiswa
import ModalMahasiswa from "@/Pages/Admin/Mahasiswa/ModalMahasiswa";
import TableMahasiswa from "@/Pages/Admin/Mahasiswa/TableMahasiswa";

// Import helper untuk notifikasi dan konfirmasi
import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastError } from "@/Utils/Helpers/ToastHelpers"; // Menambahkan toastSuccess

// Import custom hooks dari React Query
import {
  useMahasiswa, // Sudah diupdate untuk pagination
  useStoreMahasiswa,
  useUpdateMahasiswa,
  useDeleteMahasiswa,
} from "@/Utils/Hooks/useMahasiswa";
import { useKelas } from "@/Utils/Hooks/useKelas";
import { useMataKuliah } from "@/Utils/Hooks/useMataKuliah";

// Import Auth Context
import { useAuthStateContext } from "@/Context/AuthContext";

const Mahasiswa = () => {
  const navigate = useNavigate();
  const { user } = useAuthStateContext();

  // --- State untuk Pagination, Sorting, dan Searching ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  // Menggunakan hooks React Query untuk data mahasiswa
  const {
    data: resultMahasiswa = { data: [], total: 0 },
    isLoading: isLoadingMahasiswa,
  } = useMahasiswa({
    _page: page,
    _limit: perPage,
    _sort: sortBy,
    _order: sortOrder,
    q: search,
  });

  const mahasiswaList = resultMahasiswa.data;
  const totalMahasiswaCount = resultMahasiswa.total;
  const totalMahasiswaPages = Math.ceil(totalMahasiswaCount / perPage);

  // Ambil data pendukung untuk perhitungan SKS
  const { data: kelas = [] } = useKelas();
  const { data: mataKuliah = [] } = useMataKuliah();

  // Menggunakan hooks useMutation untuk operasi CRUD
  const { mutate: storeMahasiswaMutate } = useStoreMahasiswa();
  const { mutate: updateMahasiswaMutate } = useUpdateMahasiswa();
  const { mutate: deleteMahasiswaMutate } = useDeleteMahasiswa();

  // State untuk form input/edit mahasiswa
  const [form, setForm] = useState({
    id: null,
    nim: "",
    name: "",
    status: "",
    prodi: "",
    max_sks: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Fungsi untuk menghitung total SKS yang diambil oleh seorang mahasiswa
  const getTotalSks = (mhsId) => {
    // Pastikan perbandingan ID dengan perbandingan longgar (==) atau di-cast ke string
    return kelas
      .filter(k => k.mahasiswa_ids.includes(String(mhsId)))
      .map(k => mataKuliah.find(mk => String(mk.id) === String(k.mata_kuliah_id))?.sks || 0)
      .reduce((a, b) => a + b, 0);
  };

  // Handler untuk perubahan input pada form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi untuk mereset form dan menutup modal
  const resetFormAndCloseModal = () => {
    setForm({
      id: null,
      nim: "",
      name: "",
      status: "",
      prodi: "",
      max_sks: 0,
    });
    setIsEdit(false);
    setIsModalOpen(false);
  };

  // Handler untuk submit form (tambah atau edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi dasar
    if (!form.nim || !form.name || !form.status || !form.prodi || !form.max_sks) {
      toastError("NIM, Nama, Status, Prodi, dan Max SKS wajib diisi.");
      return;
    }

    const dataToSubmit = { ...form, max_sks: Number(form.max_sks) };

    if (isEdit) {
      confirmUpdate(() => {
        updateMahasiswaMutate({ id: form.id, data: dataToSubmit }, {
            onSuccess: () => resetFormAndCloseModal(),
        });
      });
    } else {
      // Cek apakah NIM sudah ada di semua data
      const allData = resultMahasiswa.data; // Periksa dari data yang dimuat
      const exists = allData.find((mhs) => mhs.nim === form.nim);
      if (exists) {
        toastError("NIM sudah terdaftar!");
        return;
      }
      storeMahasiswaMutate(dataToSubmit, {
        onSuccess: () => resetFormAndCloseModal(),
      });
    }
  };

  // Handler untuk membuka modal edit
  const handleEdit = (mhs) => {
    setForm({
      id: mhs.id,
      nim: mhs.nim,
      name: mhs.name,
      status: mhs.status,
      prodi: mhs.prodi,
      max_sks: mhs.max_sks,
    });
    setIsEdit(true);
    setIsModalOpen(true);
  };

  // Handler untuk menghapus data mahasiswa
  const handleDelete = (id) => {
    confirmDelete(() => {
      deleteMahasiswaMutate(id);
    });
  };

  // Handler untuk navigasi halaman pagination
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => Math.min(prev + 1, totalMahasiswaPages));
  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1); // Reset ke halaman 1 setiap kali perPage berubah
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

      {/* Bagian Search, Sort, dan Per Page */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Cari nama/NIM..."
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 flex-grow"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset halaman ke 1 saat search berubah
          }}
        />

        {/* Sort By Field */}
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1); // Reset halaman ke 1 saat sort field berubah
          }}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="name">Sort by Nama</option>
          <option value="nim">Sort by NIM</option>
          <option value="prodi">Sort by Prodi</option>
          <option value="status">Sort by Status</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1); // Reset halaman ke 1 saat sort order berubah
          }}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {/* Per Page Dropdown */}
        <select
          value={perPage}
          onChange={handlePerPageChange}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="5">5 per halaman</option>
          <option value="10">10 per halaman</option>
          <option value="20">20 per halaman</option>
        </select>
      </div>

      {isLoadingMahasiswa ? (
        <p className="text-center text-gray-500">Memuat data mahasiswa...</p>
      ) : (
        <>
          {user?.permission.includes("mahasiswa.read") ? (
            <TableMahasiswa
              data={mahasiswaList}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDetail={(nim) => navigate(`/admin/mahasiswa/${nim}`)}
              getTotalSks={getTotalSks}
              isLoading={isLoadingMahasiswa}
            />
          ) : (
            <p className="text-red-600 text-center">Anda tidak memiliki izin untuk melihat daftar mahasiswa.</p>
          )}
        </>
      )}

      {/* Bagian Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Halaman {page} dari {totalMahasiswaPages} (Total {totalMahasiswaCount} mahasiswa)
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={page === 1 || isLoadingMahasiswa}
            variant="secondary"
          >
            Sebelumnya
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={page === totalMahasiswaPages || isLoadingMahasiswa}
            variant="secondary"
          >
            Berikutnya
          </Button>
        </div>
      </div>

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
