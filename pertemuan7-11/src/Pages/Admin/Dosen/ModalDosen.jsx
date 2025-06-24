// src/Pages/Admin/Dosen/ModalDosen.jsx
import React from "react";
import Form from "@/Components/Form";
import Input from "@/Components/Input";
import Label from "@/Components/Label";
import Button from "@/Components/Button";

const ModalDosen = ({
  isOpen,
  isEdit,
  form,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.3)] z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Dosen" : "Tambah Dosen"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 text-xl"
          >
            &times;
          </button>
        </div>

        <Form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="id_dosen">ID Dosen</Label>
            <Input
              type="text"
              name="id_dosen"
              value={form.id_dosen || ""}
              onChange={onChange}
              readOnly={isEdit} // ID Dosen tidak bisa diedit saat mode edit
              placeholder="Masukkan ID Dosen (contoh: D001)"
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Nama Dosen</Label>
            <Input
              type="text"
              name="name"
              value={form.name || ""}
              onChange={onChange}
              placeholder="Masukkan Nama Dosen (contoh: Dr. Siti Aminah)"
              required
            />
          </div>
          <div>
            <Label htmlFor="departemen">Departemen</Label>
            <Input
              type="text"
              name="departemen"
              value={form.departemen || ""}
              onChange={onChange}
              placeholder="Masukkan Departemen (contoh: Teknik Informatika)"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={onChange}
              placeholder="Masukkan Email (contoh: dosen@universitas.ac.id)"
              required
            />
          </div>
          <div>
            <Label htmlFor="max_sks">Email</Label>
            <Input
              type="max_sks"
              name="max_sks"
              value={form.max_sks || ""}
              onChange={onChange}
              placeholder="Masukkan Maksimal SKS"
              required
            />
          </div>
          <div>
            <Label htmlFor="mata_kuliah_ampu">Mata Kuliah Diampu (pisahkan dengan koma)</Label>
            <Input
              type="text"
              name="mata_kuliah_ampu"
              value={Array.isArray(form.mata_kuliah_ampu) ? form.mata_kuliah_ampu.join(', ') : form.mata_kuliah_ampu || ""}
              onChange={onChange}
              placeholder="Cth: Pemrograman Berorientasi Objek, Basis Data"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ModalDosen;