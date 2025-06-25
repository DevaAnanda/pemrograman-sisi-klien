// Utils/Hooks/useKelas.jsx
import { useQuery } from "@tanstack/react-query";
import { getAllKelas } from "@/Utils/Apis/KelasApi";

export const useKelas = () =>
  useQuery({
    queryKey: ["kelas"],
    queryFn: getAllKelas,
    select: (res) => res?.data ?? [],
  });