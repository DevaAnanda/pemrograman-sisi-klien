import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";
import axios from "@/Utils/Helpers/AxiosInstance"; // Pastikan path ke AxiosInstance Anda benar

// Fungsi API untuk registrasi user
const registerUserApi = async (userData) => {
  // Untuk JSON Server, jangan sertakan 'id' karena akan di-generate otomatis.
  // Destructuring '_id' untuk mengatasi peringatan 'id' tidak digunakan.
  const { id: _id, ...dataToSend } = userData; // '_id' diambil namun tidak digunakan untuk dikirim
  const response = await axios.post("/users", dataToSend); // Endpoint /users
  return response.data;
};

// Hook untuk proses registrasi user
export const useRegister = () => {
  const queryClient = useQueryClient(); // queryClient sekarang akan digunakan

  return useMutation({
    mutationFn: registerUserApi,
    onSuccess: (data) => {
      // Invalidasi cache daftar user setelah registrasi, agar daftar user di halaman admin terupdate
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toastSuccess(`Registrasi user ${data.name} berhasil!`);
    },
    onError: (error) => {
      console.error("Gagal registrasi user:", error);
      const errorMessage = error.response?.data?.message || "Gagal registrasi user.";
      toastError(errorMessage);
    },
  });
};
