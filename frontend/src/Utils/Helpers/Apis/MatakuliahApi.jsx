import axios from "@/Utils/Helpers/AxiosInstance"; 

// Ambil semua matkulah
export const getAllMataKuliah = (params = {}) => axios.get("/matakuliah",{ params });

// Ambil 1 matakuliah
export const getMataKuliah = (id) => axios.get(`/matakuliah/${id}`);

// Tambah matakuliah
export const storeMataKuliah = (data) => axios.post("/matakuliah", data);

// Update matakuliah
export const updateMataKuliah = (id, data) => axios.put(`/matakuliah/${id}`, data);

// Hapus matakuliah
export const deleteMataKuliah = (id) => axios.delete(`/matakuliah/${id}`);