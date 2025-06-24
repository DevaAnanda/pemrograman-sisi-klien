import axios from "@/Utils/Helpers/AxiosInstance";
 
//ambil semua dosen
export const getAllDosen = () => axios.get("/dosen");

// Ambil 1 dosen
export const getDosen = (id_dosen) => axios.get(`/dosen/${id_dosen}`);

// Tambah dosen
export const storeDosen = (data) => axios.post("/dosen", data);

// Update dosen
export const updateDosen = (id_dosen, data) => axios.put(`/dosen/${id_dosen}`, data);

// Hapus dosen
export const deleteDosen = (id_dosen) => axios.delete(`/dosen/${id_dosen}`);