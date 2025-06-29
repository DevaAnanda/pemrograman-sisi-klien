// Utils/Hooks/useKelas.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllKelas,
  storeKelas,
  updateKelas,
  deleteKelas,
} from "@/Utils/Helpers/Apis/KelasApi"; // Pastikan path API Anda benar
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";

// Hook untuk mengambil semua data kelas dengan dukungan pagination, sorting, dan searching
export const useKelas = (query = {}) =>
  useQuery({
    queryKey: ["kelas", query], // queryKey harus menyertakan parameter query
    queryFn: () => getAllKelas(query), // Meneruskan parameter query ke fungsi API
    select: (res) => ({
      data: res?.data ?? [], // Data kelas untuk halaman saat ini
      // Mengambil total count dari header "x-total-count" yang disediakan json-server
      total: parseInt(res.headers["x-total-count"] ?? "0", 10),
    }),
    keepPreviousData: true, // Menjaga data sebelumnya tetap terlihat saat fetching data baru
  });

// ... (useStoreKelas, useUpdateKelas, useDeleteKelas tetap sama seperti sebelumnya)
export const useStoreKelas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeKelas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kelas"] });
      toastSuccess("Kelas berhasil ditambahkan!");
    },
    onError: (error) => {
      console.error("Gagal menambahkan kelas:", error);
      const errorMessage = error.response?.data?.message || "Gagal menambahkan kelas.";
      toastError(errorMessage);
    },
  });
};

export const useUpdateKelas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateKelas(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kelas"] });
      toastSuccess("Kelas berhasil diperbarui!");
    },
    onError: (error) => {
      console.error("Gagal memperbarui kelas:", error);
      const errorMessage = error.response?.data?.message || "Gagal memperbarui kelas.";
      toastError(errorMessage);
    },
  });
};

export const useDeleteKelas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteKelas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kelas"] });
      toastSuccess("Kelas berhasil dihapus!");
    },
    onError: (error) => {
      console.error("Gagal menghapus kelas:", error);
      const errorMessage = error.response?.data?.message || "Gagal menghapus kelas.";
      toastError(errorMessage);
    },
  });
};
