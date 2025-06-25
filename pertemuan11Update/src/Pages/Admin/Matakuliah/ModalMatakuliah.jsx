import Form from "@/Components/Form";
import Input from "@/Components/Input";
import Label from "@/Components/Label";
import Button from "@/Components/Button";

// Ganti name komponen menjadi ModalMatakuliah
const ModalMatakuliah = ({
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
            {isEdit ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
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
            <Label htmlFor="Kode">Kode Mata Kuliah</Label>
            <Input
              type="text"
              name="Kode" // Sesuaikan dengan name properti di form state
              value={form.kode || ""}
              onChange={onChange}
              readOnly={isEdit} // Kode MK biasanya tidak bisa diubah setelah dibuat
              placeholder="Masukkan Kode Mata Kuliah (contoh: A11.54101)"
              required
            />
          </div>
          <div>
            <Label htmlFor="name">name Mata Kuliah</Label>
            <Input
              type="text"
              name="name" // Sesuaikan dengan name properti di form state
              value={form.name || ""}
              onChange={onChange}
              placeholder="Masukkan name Mata Kuliah"
              required
            />
          </div>
          <div>
            <Label htmlFor="semester">semester</Label>
            <Input
              type="number" // Tipe number untuk semester
              name="semester"
              value={form.semester || ""}
              onChange={onChange}
              placeholder="Masukkan semester (contoh: 1)"
              required
              min="1" // Minimal semester 1
            />
          </div>
          <div>
            <Label htmlFor="jenis">jenis</Label>
            <select
              name="jenis"
              value={form.jenis || ""}
              onChange={onChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Pilih jenis</option>
              <option value="T">Teori (T)</option>
              <option value="P">Praktikum (P)</option>
              <option value="TP">Teori dan Praktikum (TP)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="sks">sks</Label>
            <Input
              type="number" // Tipe number untuk sks
              name="sks"
              value={form.sks || ""}
              onChange={onChange}
              placeholder="Masukkan Jumlah sks (contoh: 3)"
              required
              min="1" // Minimal sks 1
            />
          </div>
          <div>
            <Label htmlFor="jenisnilai">jenis nilai</Label>
            <select
              name="jenisnilai"
              value={form.jenisnilai || ""}
              onChange={onChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Pilih jenis nilai</option>
              <option value="wajib">Wajib</option>
              <option value="pilihan">Pilihan</option>
            </select>
          </div>
          <div>
            <Label htmlFor="status">status</Label>
            <select
              name="status"
              value={form.status || ""}
              onChange={onChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Pilih status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
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

export default ModalMatakuliah;