// ChartApi.jsx
import axios from "@/Utils/Helpers/AxiosInstance";

export const getAllChartData = () => axios.get("/chart");