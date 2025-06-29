import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link dari react-router-dom

// Import komponen UI umum
import Button from "@/Components/Button"; // Path disesuaikan
import Input from "@/Components/Input"; // Path disesuaikan
import Label from "@/Components/Label"; // Path disesuaikan
import Form from "@/Components/Form"; // Path disesuaikan
import Card from "@/Components/Card"; // Path disesuaikan
import Heading from "@/Components/Heading";


// Import hook useRegister
import { useRegister } from "@/Utils/Hooks/useRegister"; // Path disesuaikan
import { toastError } from "@/Utils/Helpers/ToastHelpers"; // Path disesuaikan

const Register = () => {
  const navigate = useNavigate();
  const { mutate: registerMutate, isLoading } = useRegister();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "", // Default role
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi frontend
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toastError("Semua kolom wajib diisi.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toastError("Konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 6) {
      toastError("Password minimal 6 karakter.");
      return;
    }

    // Buat objek user baru, ID akan di-generate oleh backend (JSON Server)
    const newUser = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      permission:
        form.role === "admin"
          ? [
              "dashboard.page",
              "dashboard.table",
              "mahasiswa.page",
              "matakuliah.page",
              "dosen.page",
              "mahasiswa.read",
              "mahasiswa.create",
              "mahasiswa.update",
              "mahasiswa.delete",
              "dosen.read",
              "dosen.create",
              "dosen.update",
              "dosen.delete",
              "matakuliah.read",
              "matakuliah.create",
              "matakuliah.update",
              "matakuliah.delete",
              "rencana-studi.page",
              "rencana-studi.read",
              "rencana-studi.create",
              "rencana-studi.update",
              "rencana-studi.delete",
            ]
          : [
              "krs.page",
              "krs.read", // Permission default untuk role 'mahasiswa'
            ],
    };

    // Panggil mutate function
    registerMutate(newUser, {
      onSuccess: () => {
        // Setelah registrasi berhasil, arahkan ke halaman login
        navigate("/login"); // Sesuaikan path login Anda jika berbeda
      },
      // onError akan ditangani di useRegister hook
    });
  };

  return (
    <Card className="max-w-md">
      <Heading as="h2">
        Daftar
      </Heading>
      <Form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Masukkan nama lengkap Anda"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Masukkan alamat email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Masukkan password"
            required
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleInputChange}
            placeholder="Konfirmasi password Anda"
            required
          />
        </div>
        {/* Contoh jika ingin ada pilihan role di form */}

        <div>
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="mahasiswa">Mahasiswa</option>
            <option value="dosen">Dosen</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>  
          {isLoading ? "Mendaftar..." : "Daftar"}
        </Button>
      </Form>
      <p className="text-sm text-center text-gray-600 mt-4">
        Sudah punya akun? <Link to="/" className="text-blue-500 hover:underline">Login</Link>
      </p>
    </Card>
  );
};

export default Register;
