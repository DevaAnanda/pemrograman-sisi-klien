import { useQuery } from "@tanstack/react-query";
import { getAllChartData } from "@/Utils/Helpers/Apis/ChartApi";
export const useChartData = () =>
  useQuery({
    queryKey: ["chart", "all"],
    queryFn: getAllChartData,
    select: (res) => res.data,
  });