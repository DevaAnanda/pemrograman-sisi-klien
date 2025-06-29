import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: "https://start-production-de3d.up.railway.app", // alamat json-server
  headers: {
    "Content-Type": "application/json",
  },
});

export default AxiosInstance;
