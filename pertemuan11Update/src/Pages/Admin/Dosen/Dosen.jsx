// src/Pages/Admin/Dosen/Dosen.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/Components/Card";
import Heading from "@/Components/Heading";
import Button from "@/Components/Button";
import ModalDosen from "@/Pages/Admin/Dosen/ModalDosen";
import TableDosen from "@/Pages/Admin/Dosen/TableDosen";

import { confirmDelete, confirmUpdate } from "@/Utils/Helpers/SwalHelpers";
import { toastSuccess, toastError } from "@/Utils/Helpers/ToastHelpers";
import {
  getAllDosen,
  storeDosen,
  updateDosen,
  deleteDosen,
} from "@/Utils/Helpers/Apis/DosenApi";

import { useAuthStateContext } from "@/Context/AuthContext";

const Dosen = () => {
  const [dosenList, setDosenList] = useState([]);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id: null, // Properti 'id' untuk json-server
    id_dosen: "", // Properti ID unik yang Anda definisikan (D001, D002, dll.)
    name: "",
    departemen: "",
    email: "",
    max_sks: "",
    mata_kuliah_ampu: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const { user } = useAuthStateContext();

  useEffect(() => {
    fetchDosenList();
  }, []);

  const fetchDosenList = async () => {
    try {
      const response = await getAllDosen();
      setDosenList(response.data);
    } catch (error) {
      console.error("Gagal memuat data dosen:", error);
      toastError("Gagal memuat data dosen.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "mata_kuliah_ampu") {
      setForm((prev) => ({ ...prev, [name]: value.split(",").map(item => item.trim()) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_dosen || !form.name || !form.departemen || !form.email || !form.max_sks) {
      toastError("ID Dosen, Nama Dosen, Departemen, dan Email wajib diisi.");
      return;
    }

    if (isEdit) {
      confirmUpdate(async () => {
        try {
          // Mengirim 'id' json-server untuk update, dan data yang diupdate
          await updateDosen(form.id, {
            id_dosen: form.id_dosen,
            name: form.name,
            departemen: form.departemen,
            email: form.email,
            max_sks: form.max_sks,
            mata_kuliah_ampu: form.mata_kuliah_ampu,
          });
          toastSuccess("Data dosen berhasil diperbarui.");
          fetchDosenList();
          resetFormAndCloseModal();
        } catch (error) {
          console.error("Gagal memperbarui data dosen:", error);
          toastError("Gagal memperbarui data dosen.");
        }
      });
    } else {
      const exists = dosenList.find((dosen) => dosen.id_dosen === form.id_dosen);
      if (exists) {
        toastError("ID Dosen sudah terdaftar!");
        return;
      }

      try {
        // Saat menambah, tidak perlu mengirim 'id' json-server
        const { id: _id, ...dataToStore } = form;
        await storeDosen(dataToStore);
        toastSuccess("Data dosen berhasil ditambahkan.");
        fetchDosenList();
        resetFormAndCloseModal();
      } catch (error) {
        console.error("Gagal menambahkan data dosen:", error);
        toastError("Gagal menambahkan data dosen.");
      }
    }
  };

  const handleEdit = (dosen) => {
    setForm({
      id: dosen.id, // Menyimpan ID json-server
      id_dosen: dosen.id_dosen,
      name: dosen.name,
      departemen: dosen.departemen,
      email: dosen.email,
      max_sks: dosen.max_sks,
      mata_kuliah_ampu: Array.isArray(dosen.mata_kuliah_ampu)
        ? dosen.mata_kuliah_ampu.join(', ')
        : dosen.mata_kuliah_ampu,
    });
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => { // Parameter adalah ID json-server
    confirmDelete(async () => {
      try {
        await deleteDosen(id); // Menggunakan ID json-server untuk hapus
        toastSuccess("Data dosen berhasil dihapus.");
        fetchDosenList();
      } catch (error) {
        console.error("Gagal menghapus data dosen:", error);
        toastError("Gagal menghapus data dosen.");
      }
    });
  };

  const resetFormAndCloseModal = () => {
    setForm({
      id: null,
      id_dosen: "",
      name: "",
      departemen: "",
      email: "",
      max_sks: "",
      mata_kuliah_ampu: [],
    });
    setIsEdit(false);
    setIsModalOpen(false);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Heading as="h2" className="mb-0 text-left">
          Daftar Dosen
        </Heading>
        {user?.permission.includes("dosen.create") && (
          <Button
            onClick={() => {
              resetFormAndCloseModal();
              setIsModalOpen(true);
            }}
          >
            + Tambah Dosen
          </Button>
        )}
      </div>
      {user?.permission.includes("dosen.read") && (
        <TableDosen
          data={dosenList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDetail={(id_dosen) => navigate(`/admin/dosen/${id_dosen}`)}
        />
      )}

      {isModalOpen && (
        <ModalDosen
          isOpen={isModalOpen}
          isEdit={isEdit}
          form={form}
          onChange={handleInputChange}
          onClose={resetFormAndCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </Card>
  );
};

export default Dosen;