import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import './App.css';

import AuthLayout from "@/Layouts/AuthLayout";
import AdminLayout from "@/Layouts/AdminLayout";
import ProtectedRoute from "@/Components/ProctectedRoute";

import Login from "@/Pages/Auth/Login";
import Dashboard from "@/Pages/Admin/Dashboard/Dashboard";
import Mahasiswa from "@/Pages/Admin/Mahasiswa/Mahasiswa";
import MahasiswaDetail from "@/Pages/MahasiswaDetail/MahasiswaDetail";
import PageNotFound from "@/Pages/PageNotFound";

import { AuthProvider } from "./Context/AuthContext";
import Matakuliah from "@/Pages/Admin/Matakuliah/Matakuliah";
import MatakuliahDetail from "@/Pages/Admin/Matakuliah/DetailMatakuliah";

import Dosen from "@/Pages/Admin/Dosen/Dosen";
import DosenDetail from "@/Pages/Admin/Dosen/DetailDosen";
import RencanaStudi from "@/Pages/Admin/Rencanastudi/RencanaStudi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient
// Rute untuk halaman otentikasi
const authRoutes = [
  {
    index: true,
    element: <Login />,
  },
];

// Rute untuk halaman admin
const adminRoutes = [
  {
    index: true,
    element: <Navigate to="dashboard" />,
  },
  {
    path: "dashboard",
    element: <Dashboard />,
  },
  {
    path: "mahasiswa",
    children: [
      {
        index: true,
        element: <Mahasiswa />,
      },
      {
        path: ":nim",
        element: <MahasiswaDetail />,
      },
    ],
  },
  {
    path: "matakuliah",
    children: [
      {
        index: true,
        element: <Matakuliah />,
      },
      {
        path: ":kode_mk", 
        element: <MatakuliahDetail />,
      },
    ],
  },
  {
    path: "dosen",
    children: [
      {
        index: true,
        element: <Dosen />,
      },
      {
        path: ":id_dosen", 
        element: <DosenDetail />,
      },
    ],
  },
  {
    path: "kelas",
    children: [
      {
        index: true,
        element: <RencanaStudi />,
      },
    ],
  },
];

// Definisikan router
const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: authRoutes,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: adminRoutes,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);

// Render aplikasi
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
