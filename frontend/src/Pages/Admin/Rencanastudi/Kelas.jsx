import React, { useState } from "react";

// Import komponen UI umum dengan jalur relatif
import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import Button from "@/Components/Button";

// Import komponen spesifik untuk Rencana Studi dengan jalur relatif
import ModalKelas from "./ModalKelas"; // Berada di folder yang sama
import TableRencanaStudi from "./TableKelas"; // Berada di folder yang sama, sesuaikan dengan nama file Anda

// Import helper dengan jalur relatif
import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";

// Import custom hooks dari React Query dengan jalur relatif
import { useKelas, useStoreKelas, useUpdateKelas, useDeleteKelas } from "@/Utils/Hooks/useKelas";
import { useDosen } from "@/Utils/Hooks/useDosen";
import { useMahasiswa } from "@/Utils/Hooks/useMahasiswa";
import { useMataKuliah } from "@/Utils/Hooks/useMatakuliah";

// Import Auth Context dengan jalur relatif
import { useAuthStateContext } from "@/Context/AuthContext";

const Kelas = () => {
  const { user } = useAuthStateContext();

  // --- State untuk Pagination, Sorting, dan Searching ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [sortBy, setSortBy] = useState("nama_kelas");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  // Menggunakan hooks React Query untuk data kelas dengan parameter query
  const {
    data: resultKelas = { data: [], total: 0 },
    isLoading: isLoadingKelas,
  } = useKelas({
    _page: page,
    _limit: perPage,
    _sort: sortBy,
    _order: sortOrder,
    q: search,
  });

  // Data utama untuk tabel dan perhitungan
  const kelasList = resultKelas.data;
  const totalKelasCount = resultKelas.total;
  const totalKelasPages = Math.ceil(totalKelasCount / perPage);

  // Mengambil data pendukung (dosen, mahasiswa, mata kuliah) menggunakan hooks React Query
  const { data: dosenData = [], isLoading: isLoadingDosen } = useDosen();
  const { data: mahasiswaData = [], isLoading: isLoadingMahasiswa } = useMahasiswa();
  const { data: mataKuliahData = [], isLoading: isLoadingMataKuliah } = useMataKuliah();

  // Menggunakan hooks useMutation untuk operasi CRUD kelas
  const { mutate: storeKelasMutate } = useStoreKelas();
  const { mutate: updateKelasMutate } = useUpdateKelas();
  const { mutate: deleteKelasMutate } = useDeleteKelas();

  // State untuk mengelola pilihan dropdown mahasiswa dan dosen per kelas
  const [selectedMhs, setSelectedMhs] = useState({});
  const [selectedDsn, setSelectedDsn] = useState({});

  // State untuk form tambah/edit kelas
  const [form, setForm] = useState({
    id: null,
    nama_kelas: "",
    dosen_id: "",
    mata_kuliah_id: "",
    jumlah_mahasiswa: "",
    jadwal: "",
    ruang: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Status loading keseluruhan (untuk indikator loading utama)
  const isLoading = isLoadingKelas || isLoadingDosen || isLoadingMataKuliah || isLoadingMahasiswa;

  // --- Logika Bisnis & Utilitas ---

  // Filter mata kuliah yang belum ada kelasnya untuk dropdown "Tambah Kelas Baru"
  const mataKuliahSudahDipakai = Array.isArray(kelasList) ? kelasList.map(k => String(k.mata_kuliah_id)) : [];
  const mataKuliahBelumAdaKelas = Array.isArray(mataKuliahData)
    ? mataKuliahData.filter(m => !mataKuliahSudahDipakai.includes(String(m.id)))
    : [];
    
  // Fungsi untuk mendapatkan batas maksimal SKS mahasiswa
  const getMaxSks = (id) => mahasiswaData.find(m => String(m.id) === String(id))?.max_sks || 0;

  // Fungsi untuk mendapatkan batas maksimal SKS dosen
  const getDosenMaxSks = (id) => dosenData.find(d => String(d.id) === String(id))?.max_sks || 0;

  // --- Handler Aksi ---

  // Handler perubahan input pada form modal "Tambah/Edit Kelas"
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk submit form "Tambah/Edit Kelas"
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_kelas || !form.dosen_id || !form.mata_kuliah_id || !form.jumlah_mahasiswa || !form.jadwal || !form.ruang) {
      toastError("Semua field wajib diisi.");
      return;
    }

    const dataToSubmit = {
      ...form,
      dosen_id: Number(form.dosen_id), // Pastikan ini dikirim sebagai angka
      mata_kuliah_id: Number(form.mata_kuliah_id), // Pastikan ini dikirim sebagai angka
      jumlah_mahasiswa: Number(form.jumlah_mahasiswa),
    };

    if (isEdit) {
      confirmUpdate(() => {
        updateKelasMutate(
          { id: form.id, data: dataToSubmit },
          {
            onSuccess: () => {
              resetFormAndCloseModal();
              toastSuccess("Kelas berhasil diperbarui!");
            },
          }
        );
      });
    } else {
      storeKelasMutate(
        { ...dataToSubmit, mahasiswa_ids: [] }, // Inisialisasi mahasiswa_ids untuk kelas baru
        {
          onSuccess: () => {
            resetFormAndCloseModal();
            toastSuccess("Kelas berhasil ditambahkan!");
          },
        }
      );
    }
  };

  // Handler untuk menambahkan mahasiswa ke kelas
  const handleAddMahasiswa = async (kelasItem, mhsId) => {
    if (!mhsId || !kelasItem) {
      toastError("Pilih mahasiswa untuk ditambahkan.");
      return;
    }

    const matkul = Array.isArray(mataKuliahData) ? mataKuliahData.find(m => String(m.id) === String(kelasItem.mata_kuliah_id)) : null;
    const sksKelasIni = matkul?.sks || 0;

    const totalSksMahasiswaSaatIni = Array.isArray(kelasList) ? kelasList
      .filter(k => Array.isArray(k.mahasiswa_ids) && k.mahasiswa_ids.includes(String(mhsId)))
      .map(k => (Array.isArray(mataKuliahData) ? mataKuliahData.find(m => String(m.id) === String(k.mata_kuliah_id))?.sks || 0 : 0))
      .reduce((acc, curr) => acc + curr, 0) : 0;

    const maxSksMahasiswa = getMaxSks(mhsId);

    if (totalSksMahasiswaSaatIni + sksKelasIni > maxSksMahasiswa) {
      toastError(`Total SKS (${totalSksMahasiswaSaatIni + sksKelasIni}) melebihi batas maksimal mahasiswa (${maxSksMahasiswa}).`);
      return;
    }

    if (Array.isArray(kelasItem.mahasiswa_ids) && kelasItem.mahasiswa_ids.includes(String(mhsId))) {
      toastError("Mahasiswa sudah terdaftar di kelas ini.");
      return;
    }

    const updatedKelas = {
      ...kelasItem,
      mahasiswa_ids: Array.isArray(kelasItem.mahasiswa_ids) ? [...kelasItem.mahasiswa_ids, String(mhsId)] : [String(mhsId)]
    };

    updateKelasMutate({ id: kelasItem.id, data: updatedKelas }, {
      onSuccess: () => {
        setSelectedMhs(prev => ({ ...prev, [kelasItem.id]: "" }));
        toastSuccess("Mahasiswa berhasil ditambahkan ke kelas.");
      },
    });
  };

  const handleDeleteMahasiswa = async (kelasItem, mhsId) => {
    const updatedKelas = {
      ...kelasItem,
      mahasiswa_ids: Array.isArray(kelasItem.mahasiswa_ids) ? kelasItem.mahasiswa_ids.filter(id => String(id) !== String(mhsId)) : []
    };

    updateKelasMutate({ id: kelasItem.id, data: updatedKelas }, {
      onSuccess: () => {
        toastSuccess("Mahasiswa berhasil dihapus dari kelas.");
      },
    });
  };

  const handleChangeDosen = async (kelasItem) => {
    const dsnId = selectedDsn[kelasItem.id];
    if (!dsnId) {
      toastError("Pilih dosen untuk diganti.");
      return;
    }

    if (String(kelasItem.dosen_id) === String(dsnId)) {
      toastError("Dosen yang dipilih sudah menjadi pengampu kelas ini.");
      return;
    }

    const sksKelasIni = Array.isArray(mataKuliahData) ? mataKuliahData.find(m => String(m.id) === String(kelasItem.mata_kuliah_id))?.sks || 0 : 0;
    const currentSksDosenBaru = Array.isArray(kelasList) ? kelasList
        .filter(k => String(k.dosen_id) === String(dsnId))
        .map(k => (Array.isArray(mataKuliahData) ? mataKuliahData.find(m => String(m.id) === String(k.mata_kuliah_id))?.sks || 0 : 0))
        .reduce((acc, curr) => acc + curr, 0) : 0;

    const maxSksDosen = getDosenMaxSks(dsnId);

    if (currentSksDosenBaru + sksKelasIni > maxSksDosen) {
      toastError(`Dosen ini akan mengampu SKS melebihi batas maksimal (${maxSksDosen} SKS).`);
      return;
    }

    const updatedKelas = { ...kelasItem, dosen_id: Number(dsnId) }; // Pastikan dosen_id dikirim sebagai angka

    updateKelasMutate({ id: kelasItem.id, data: updatedKelas }, {
      onSuccess: () => {
        setSelectedDsn(prev => ({ ...prev, [kelasItem.id]: "" }));
        toastSuccess("Dosen pengampu berhasil diperbarui.");
      },
    });
  };

  const handleDeleteKelas = async (kelasId) => {
    const kelasToDelete = Array.isArray(kelasList) ? kelasList.find(k => String(k.id) === String(kelasId)) : null;
    if (!kelasToDelete) return;

    if (Array.isArray(kelasToDelete.mahasiswa_ids) && kelasToDelete.mahasiswa_ids.length > 0) {
      toastError("Tidak dapat menghapus kelas yang masih memiliki mahasiswa.");
      return;
    }

    confirmDelete(() => {
      deleteKelasMutate(kelasId, {
        onSuccess: () => {
          toastSuccess("Kelas berhasil dihapus.");
        },
      });
    });
  };

  const openAddModal = () => {
    setForm({
      id: null, nama_kelas: "", dosen_id: "", mata_kuliah_id: "",
      jumlah_mahasiswa: "", jadwal: "", ruang: "",
    });
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const resetFormAndCloseModal = () => {
    setForm({
      id: null, nama_kelas: "", dosen_id: "", mata_kuliah_id: "",
      jumlah_mahasiswa: "", jadwal: "", ruang: "",
    });
    setIsEdit(false);
    setIsModalOpen(false);
  };

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => Math.min(prev + 1, totalKelasPages));
  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Heading as="h2" className="mb-0 text-left">
          Rencana Studi (Kelas)
        </Heading>
        {user?.permission.includes("kelas.create") && (
          <Button onClick={openAddModal}>
            + Tambah Kelas
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama kelas/jadwal..."
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 flex-grow"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="nama_kelas">Sort by Nama Kelas</option>
          <option value="jadwal">Sort by Jadwal</option>
          <option value="ruang">Sort by Ruang</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
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
        <p className="text-center text-gray-500">Memuat data...</p>
      ) : (
        <>
          {user?.permission.includes("kelas.read") ? (
            <TableRencanaStudi
              data={kelasList}
              dosenList={dosenData}
              mahasiswaList={mahasiswaData}
              mataKuliahList={mataKuliahData}
              selectedMhs={selectedMhs}
              setSelectedMhs={setSelectedMhs}
              selectedDsn={selectedDsn}
              setSelectedDsn={setSelectedDsn}
              handleAddMahasiswa={handleAddMahasiswa}
              handleDeleteMahasiswa={handleDeleteMahasiswa}
              handleChangeDosen={handleChangeDosen}
              handleDeleteKelas={handleDeleteKelas}
              isLoading={isLoadingKelas}
            />
          ) : (
            <p className="text-red-600 text-center">Anda tidak memiliki izin untuk melihat daftar kelas.</p>
          )}
        </>
      )}

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Halaman {page} dari {totalKelasPages} (Total {totalKelasCount} kelas)
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={page === 1 || isLoadingKelas}
            variant="secondary"
          >
            Sebelumnya
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={page === totalKelasPages || isLoadingKelas}
            variant="secondary"
          >
            Berikutnya
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <ModalKelas
          isOpen={isModalOpen}
          isEdit={isEdit}
          form={form}
          onChange={handleInputChange}
          onClose={resetFormAndCloseModal}
          onSubmit={handleSubmit}
          dosen={dosenData}
          mataKuliah={mataKuliahBelumAdaKelas}
        />
      )}
    </Card>
  );
};

export default Kelas;
