import Form from "@/Components/Form";
import Label from "@/Components/Label";
import Button from "@/Components/Button";
import React from "react";

const ModalRencanaStudi = ({
    isOpen,
    onClose,
    onChange,
    onSubmit,
    form,
    dosen,
    mataKuliah
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.3)] z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Tambah Kelas Baru</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500 text-xl">
            &times;
          </button>
        </div>

        <Form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="mata_kuliah_id">Mata Kuliah</Label>
            <select
              name="mata_kuliah_id"
              value={form.mata_kuliah_id || ""}
              onChange={onChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {mataKuliah.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.sks} SKS)</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="dosen_id">Dosen Pengampu</Label>
            <select
              name="dosen_id"
              value={form.dosen_id || ""}
              onChange={onChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">-- Pilih Dosen --</option>
              {dosen.map((d) => (
                <option key={d.id} value={d.id}>{d.name} (Max SKS: {d.max_sks})</option>
              ))}
            </select>
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

export default ModalRencanaStudi;
