// Utils/Hooks/useDosen.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllDosen, storeDosen, updateDosen, deleteDosen } from "@/Utils/Helpers/Apis/DosenApi";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";

export const useDosen = (query = {}) =>
  useQuery({
    queryKey: ["dosen", query],
    queryFn: () => getAllDosen(query),
    // PENTING: Perbaiki struktur data yang dikembalikan di sini!
    select: (res) => ({
      data: res?.data ?? [],
      total: parseInt(res.headers?.["x-total-count"] ?? "0", 10),
    }),
    keepPreviousData: true,
  });

// ... (useStoreDosen, useUpdateDosen, useDeleteDosen) ...
// Sisa mutasi hooks tidak perlu diubah.
export const useStoreDosen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeDosen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dosen"] });
      toastSuccess("Dosen berhasil ditambahkan!");
    },
    onError: (error) => {
      console.error("Gagal menambahkan dosen:", error);
      const errorMessage = error.response?.data?.message || "Gagal menambahkan dosen.";
      toastError(errorMessage);
    },
  });
};

export const useUpdateDosen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateDosen(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dosen"] });
      toastSuccess("Dosen berhasil diperbarui!");
    },
    onError: (error) => {
      console.error("Gagal memperbarui dosen:", error);
      const errorMessage = error.response?.data?.message || "Gagal memperbarui dosen.";
      toastError(errorMessage);
    },
  });
};

export const useDeleteDosen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDosen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dosen"] });
      toastSuccess("Dosen berhasil dihapus!");
    },
    onError: (error) => {
      console.error("Gagal menghapus dosen:", error);
      const errorMessage = error.response?.data?.message || "Gagal menghapus dosen.";
      toastError(errorMessage);
    },
  });
};
