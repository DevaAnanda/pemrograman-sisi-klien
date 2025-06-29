import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import komponen UI umum
import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import Button from "@/Components/Button";

// Import komponen spesifik untuk Mata Kuliah
import ModalMatakuliah from "@/Pages/Admin/Matakuliah/ModalMatakuliah";
import TableMatakuliah from "@/Pages/Admin/Matakuliah/TableMatakuliah";

// Import helper untuk notifikasi dan konfirmasi
import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastError } from "@/Utils/Helpers/ToastHelpers"; // Menambahkan toastSuccess

// Import custom hooks dari React Query untuk Mata Kuliah
import {
  useMataKuliah,
  useStoreMataKuliah,
  useUpdateMataKuliah,
  useDeleteMataKuliah,
} from "@/Utils/Hooks/useMatakuliah";

// Import Auth Context
import { useAuthStateContext } from "@/Context/AuthContext";

const Matakuliah = () => {
  const navigate = useNavigate();
  const { user } = useAuthStateContext();

  // --- State untuk Pagination, Sorting, dan Searching ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5); // Jumlah data per halaman
  const [sortBy, setSortBy] = useState("nama"); // Default sort by nama
  const [sortOrder, setSortOrder] = useState("asc"); // Default asc
  const [search, setSearch] = useState(""); // Keyword pencarian

  // Menggunakan hooks React Query untuk data mata kuliah dengan parameter query
  const {
    data: resultMatakuliah = { data: [], total: 0 },
    isLoading: isLoadingMatakuliah,
  } = useMataKuliah({
    _page: page,
    _limit: perPage,
    _sort: sortBy,
    _order: sortOrder,
    q: search,
  });

  const matakuliahList = resultMatakuliah.data; // Data mata kuliah untuk halaman saat ini
  const totalMatakuliahCount = resultMatakuliah.total; // Total semua data
  const totalMatakuliahPages = Math.ceil(totalMatakuliahCount / perPage); // Total halaman

  // Menggunakan hooks useMutation untuk operasi CRUD mata kuliah
  const { mutate: storeMatakuliahMutate } = useStoreMataKuliah();
  const { mutate: updateMatakuliahMutate } = useUpdateMataKuliah();
  const { mutate: deleteMatakuliahMutate } = useDeleteMataKuliah();

  // State untuk form input/edit mata kuliah
  const [form, setForm] = useState({
    id: null,
    kode: "",
    name: "", // Menggunakan 'name' untuk konsistensi
    semester: "",
    jenis: "",
    sks: "",
    jenisnilai: "",
    status: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Handler untuk perubahan input pada form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi untuk mereset form dan menutup modal
  const resetFormAndCloseModal = () => {
    setForm({
      id: null,
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

  // Handler untuk submit form (tambah atau edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi dasar
    if (!form.kode || !form.name || !form.semester || !form.sks || !form.jenis || !form.jenisnilai || !form.status) {
      toastError("Semua field wajib diisi.");
      return;
    }

    const dataToSubmit = {
      ...form,
      sks: Number(form.sks) // Pastikan SKS bertipe number
    };

    if (isEdit) {
      confirmUpdate(() => {
        updateMatakuliahMutate({ id: form.id, data: dataToSubmit }, {
            onSuccess: () => resetFormAndCloseModal(),
        });
      });
    } else {
      // Cek apakah Kode Mata Kuliah sudah ada di semua data
      const allData = resultMatakuliah.data; // Periksa dari data yang dimuat
      const exists = allData.find((mk) => mk.kode === form.kode);
      if (exists) {
        toastError("Kode Mata Kuliah sudah terdaftar!");
        return;
      }
      storeMatakuliahMutate(dataToSubmit, {
        onSuccess: () => resetFormAndCloseModal(),
      });
    }
  };

  // Handler untuk membuka modal edit dan mengisi form
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
  const handleDelete = (id) => {
    confirmDelete(() => {
      deleteMatakuliahMutate(id);
    });
  };

  // Handler untuk navigasi halaman pagination
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => Math.min(prev + 1, totalMatakuliahPages));
  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1); // Reset ke halaman 1 setiap kali perPage berubah
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Heading as="h2" className="mb-0 text-left">
          Daftar Mata Kuliah
        </Heading>
        {user?.permission.includes("matakuliah.create") && (
          <Button
            onClick={() => {
              resetFormAndCloseModal();
              setIsModalOpen(true);
            }}
          >
            + Tambah Mata Kuliah
          </Button>
        )}
      </div>

      {/* Bagian Search, Sort, dan Per Page */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Cari kode/nama..."
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
          <option value="kode">Sort by Kode</option>
          <option value="semester">Sort by Semester</option>
          <option value="sks">Sort by SKS</option>
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

      {isLoadingMatakuliah ? (
        <p className="text-center text-gray-500">Memuat data mata kuliah...</p>
      ) : (
        <>
          {user?.permission.includes("matakuliah.read") ? (
            <TableMatakuliah
              data={matakuliahList}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDetail={(id) => navigate(`/admin/matakuliah/${id}`)}
              isLoading={isLoadingMatakuliah}
            />
          ) : (
            <p className="text-red-600 text-center">Anda tidak memiliki izin untuk melihat daftar mata kuliah.</p>
          )}
        </>
      )}

      {/* Bagian Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Halaman {page} dari {totalMatakuliahPages} (Total {totalMatakuliahCount} mata kuliah)
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={page === 1 || isLoadingMatakuliah}
            variant="secondary"
          >
            Sebelumnya
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={page === totalMatakuliahPages || isLoadingMatakuliah}
            variant="secondary"
          >
            Berikutnya
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <ModalMatakuliah
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

export default Matakuliah;
