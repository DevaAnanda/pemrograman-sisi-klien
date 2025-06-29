// Utils/Hooks/useMataKuliah.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllMataKuliah, storeMataKuliah, updateMataKuliah, deleteMataKuliah } from "@/Utils/Helpers/Apis/MataKuliahApi";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";

export const useMataKuliah = (query = {}) =>
  useQuery({
    queryKey: ["matakuliah", query],
    queryFn: () => getAllMataKuliah(query),
    // PENTING: Perbaiki struktur data yang dikembalikan di sini!
    select: (res) => ({
      data: res?.data ?? [],
      total: parseInt(res.headers?.["x-total-count"] ?? "0", 10),
    }),
    keepPreviousData: true,
  });

// ... (useStoreMataKuliah, useUpdateMataKuliah, useDeleteMataKuliah) ...
// Sisa mutasi hooks tidak perlu diubah.
export const useStoreMataKuliah = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeMataKuliah,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matakuliah"] });
      toastSuccess("Mata kuliah berhasil ditambahkan!");
    },
    onError: (error) => {
      console.error("Gagal menambahkan mata kuliah:", error);
      const errorMessage = error.response?.data?.message || "Gagal menambahkan mata kuliah.";
      toastError(errorMessage);
    },
  });
};

export const useUpdateMataKuliah = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateMataKuliah(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matakuliah"] });
      toastSuccess("Mata kuliah berhasil diperbarui!");
    },
    onError: (error) => {
      console.error("Gagal memperbarui mata kuliah:", error);
      const errorMessage = error.response?.data?.message || "Gagal memperbarui mata kuliah.";
      toastError(errorMessage);
    },
  });
};

export const useDeleteMataKuliah = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMataKuliah,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matakuliah"] });
      toastSuccess("Mata kuliah berhasil dihapus!");
    },
    onError: (error) => {
      console.error("Gagal menghapus mata kuliah:", error);
      const errorMessage = error.response?.data?.message || "Gagal menghapus mata kuliah.";
      toastError(errorMessage);
    },
  });
};
