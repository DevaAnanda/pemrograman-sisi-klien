// Utils/Hooks/useMataKuliah.jsx
import { useQuery } from "@tanstack/react-query";
import { getAllMataKuliah } from "@/Utils/Apis/MataKuliahApi";

export const useMataKuliah = () =>
  useQuery({
    queryKey: ["matakuliah"],
    queryFn: getAllMataKuliah,
    select: (res) => res?.data ?? [],
  });