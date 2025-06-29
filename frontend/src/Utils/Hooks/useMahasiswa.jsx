// Utils/Hooks/useMahasiswa.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllMahasiswa, storeMahasiswa, updateMahasiswa, deleteMahasiswa } from "@/Utils/Helpers/Apis/MahasiswaApi";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";

export const useMahasiswa = (query = {}) =>
  useQuery({
    queryKey: ["mahasiswa", query],
    queryFn: () => getAllMahasiswa(query),
    // PENTING: Perbaiki struktur data yang dikembalikan di sini!
    select: (res) => ({
      data: res?.data ?? [],
      total: parseInt(res.headers?.["x-total-count"] ?? "0", 10),
    }),
    keepPreviousData: true,
  });

// ... (useStoreMahasiswa, useUpdateMahasiswa, useDeleteMahasiswa) ...
// Sisa mutasi hooks tidak perlu diubah.
export const useStoreMahasiswa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeMahasiswa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mahasiswa"] });
      toastSuccess("Mahasiswa berhasil ditambahkan!");
    },
    onError: (error) => {
      console.error("Gagal menambahkan mahasiswa:", error);
      const errorMessage = error.response?.data?.message || "Gagal menambahkan mahasiswa.";
      toastError(errorMessage);
    },
  });
};

export const useUpdateMahasiswa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateMahasiswa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mahasiswa"] });
      toastSuccess("Mahasiswa berhasil diperbarui!");
    },
    onError: (error) => {
      console.error("Gagal memperbarui mahasiswa:", error);
      const errorMessage = error.response?.data?.message || "Gagal memperbarui mahasiswa.";
      toastError(errorMessage);
    },
  });
};

export const useDeleteMahasiswa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMahasiswa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mahasiswa"] });
      toastSuccess("Mahasiswa berhasil dihapus!");
    },
    onError: (error) => {
      console.error("Gagal menghapus mahasiswa:", error);
      const errorMessage = error.response?.data?.message || "Gagal menghapus mahasiswa.";
      toastError(errorMessage);
    },
  });
};
