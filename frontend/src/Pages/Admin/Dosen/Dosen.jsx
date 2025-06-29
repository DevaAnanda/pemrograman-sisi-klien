import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import komponen UI umum
import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import Button from "@/Components/Button";

// Import komponen spesifik untuk Dosen
import ModalDosen from "@/Pages/Admin/Dosen/ModalDosen";
import TableDosen from "@/Pages/Admin/Dosen/TableDosen";

// Import helper untuk notifikasi dan konfirmasi
import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastError } from "@/Utils/Helpers/ToastHelpers"; // Menambahkan toastSuccess

// Import custom hooks dari React Query untuk Dosen
import {
  useDosen,
  useStoreDosen,
  useUpdateDosen,
  useDeleteDosen,
} from "@/Utils/Hooks/useDosen";

// Import hooks untuk data terkait SKS dosen (dari Rencana Studi, jika perlu)
import { useKelas } from "@/Utils/Hooks/useKelas";
import { useMataKuliah } from "@/Utils/Hooks/useMataKuliah";

// Import Auth Context
import { useAuthStateContext } from "@/Context/AuthContext";

const Dosen = () => {
  const navigate = useNavigate();
  const { user } = useAuthStateContext();

  // --- State untuk Pagination, Sorting, dan Searching ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5); // Jumlah data per halaman
  const [sortBy, setSortBy] = useState("name"); // Default sort by nama
  const [sortOrder, setSortOrder] = useState("asc"); // Default asc
  const [search, setSearch] = useState(""); // Keyword pencarian

  // Menggunakan hooks React Query untuk data dosen dengan parameter query
  const {
    data: resultDosen = { data: [], total: 0 },
    isLoading: isLoadingDosen,
  } = useDosen({
    _page: page,
    _limit: perPage,
    _sort: sortBy,
    _order: sortOrder,
    q: search,
  });

  const dosenList = resultDosen.data; // Data dosen untuk halaman saat ini
  const totalDosenCount = resultDosen.total; // Total semua data dosen
  const totalDosenPages = Math.ceil(totalDosenCount / perPage); // Total halaman

  // Mengambil data kelas dan mata kuliah untuk perhitungan SKS terampu
  // Data ini penting untuk getTotalSksDosen, jadi pastikan di-destructure dengan default array
  const { data: kelas = [], isLoading: isLoadingKelas } = useKelas();
  const { data: mataKuliah = [], isLoading: isLoadingMataKuliah } = useMataKuliah();

  // Menggunakan hooks useMutation untuk operasi CRUD dosen
  const { mutate: storeDosenMutate } = useStoreDosen();
  const { mutate: updateDosenMutate } = useUpdateDosen();
  const { mutate: deleteDosenMutate } = useDeleteDosen();

  // State untuk form input/edit dosen
  const [form, setForm] = useState({
    id: null, // Properti 'id' dari JSON Server (angka)
    id_dosen: "", // ID unik yang Anda definisikan (D001, D002, dll.)
    name: "", // Menggunakan 'name' untuk konsistensi dengan form React (nama_dosen di JSON)
    departemen: "",
    email: "",
    max_sks: "",
    mata_kuliah_ampu: [], // Array string
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Gabungan status loading dari semua query yang relevan
  const isLoading = isLoadingDosen || isLoadingKelas || isLoadingMataKuliah;

  // Fungsi untuk menghitung total SKS yang diampu oleh seorang dosen
  const getTotalSksDosen = (dosenId) => {
    // Menambahkan pemeriksaan yang lebih defensif untuk memastikan kelas dan mataKuliah adalah array
    if (!Array.isArray(kelas) || !Array.isArray(mataKuliah) || isLoadingKelas || isLoadingMataKuliah) {
      return 0; // Kembalikan 0 jika data belum siap atau bukan array
    }

    return kelas
      .filter(k => String(k.dosen_id) === String(dosenId))
      .map(k => mataKuliah.find(mk => String(mk.id) === String(k.mata_kuliah_id))?.SKS || 0) // Gunakan .SKS dari matakuliah.json
      .reduce((a, b) => a + b, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "mata_kuliah_ampu") {
      setForm((prev) => ({ ...prev, [name]: value.split(",").map(item => item.trim()) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_dosen || !form.name || !form.departemen || !form.email || !form.max_sks) {
      toastError("ID Dosen, Nama Dosen, Departemen, Email, dan Max SKS wajib diisi.");
      return;
    }

    const dataToSubmit = {
        ...form,
        max_sks: Number(form.max_sks)
    };

    if (isEdit) {
      confirmUpdate(() => {
        updateDosenMutate({ id: form.id, data: dataToSubmit }, {
            onSuccess: () => {
                resetFormAndCloseModal();
            },
        });
      });
    } else {
      const exists = dosenList.find((dosen) => dosen.id_dosen === form.id_dosen);
      if (exists) {
        toastError("ID Dosen sudah terdaftar!");
        return;
      }
      storeDosenMutate(dataToSubmit, {
          onSuccess: () => {
              resetFormAndCloseModal();
          },
      });
    }
  };

  const handleEdit = (dosenItem) => {
    setForm({
      id: dosenItem.id,
      id_dosen: dosenItem.id_dosen,
      name: dosenItem.name,
      departemen: dosenItem.departemen,
      email: dosenItem.email,
      max_sks: dosenItem.max_sks,
      mata_kuliah_ampu: Array.isArray(dosenItem.mata_kuliah_ampu)
        ? dosenItem.mata_kuliah_ampu.join(', ')
        : dosenItem.mata_kuliah_ampu,
    });
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    confirmDelete(() => {
      deleteDosenMutate(id);
    });
  };

  const resetFormAndCloseModal = () => {
    setForm({
      id: null,
      id_dosen: "",
      name: "",
      departemen: "",
      email: "",
      max_sks: "",
      mata_kuliah_ampu: [],
    });
    setIsEdit(false);
    setIsModalOpen(false);
  };

  // Handler untuk navigasi halaman pagination
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => Math.min(prev + 1, totalDosenPages));
  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1); // Reset ke halaman 1 setiap kali perPage berubah
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Heading as="h2" className="mb-0 text-left">
          Daftar Dosen
        </Heading>
        {user?.permission.includes("dosen.create") && (
          <Button
            onClick={() => {
              resetFormAndCloseModal();
              setIsModalOpen(true);
            }}
          >
            + Tambah Dosen
          </Button>
        )}
      </div>

      {/* Bagian Search, Sort, dan Per Page */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Cari nama/ID dosen..."
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
          <option value="id_dosen">Sort by ID Dosen</option>
          <option value="max_sks">Sort by Max SKS</option>
          <option value="departemen">Sort by Departemen</option>
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

      {isLoading ? (
        <p className="text-center text-gray-500">Memuat data dosen...</p>
      ) : (
        <>
          {user?.permission.includes("dosen.read") ? (
            <TableDosen
              data={dosenList}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDetail={(id_dosen) => navigate(`/admin/dosen/${id_dosen}`)}
              getTotalSksDosen={getTotalSksDosen}
            />
          ) : (
            <p className="text-red-600 text-center">Anda tidak memiliki izin untuk melihat daftar dosen.</p>
          )}
        </>
      )}

      {/* Bagian Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Halaman {page} dari {totalDosenPages} (Total {totalDosenCount} dosen)
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={page === 1 || isLoadingDosen}
            variant="secondary"
          >
            Sebelumnya
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={page === totalDosenPages || isLoadingDosen}
            variant="secondary"
          >
            Berikutnya
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <ModalDosen
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

export default Dosen;
