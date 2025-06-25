import Form from "@/Components/Form";
import Input from "@/Components/Input";
import Label from "@/Components/Label";
import Button from "@/Components/Button";

const ModalMahasiswa = ({
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
            {isEdit ? "Edit Mahasiswa" : "Tambah Mahasiswa"}
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
            <Label htmlFor="nim">NIM</Label>
            <Input
              type="text"
              name="nim"
              value={form.nim || ""}
              onChange={onChange}
              readOnly={isEdit}
              placeholder="Masukkan NIM"
              required
            />
          </div>
          <div>
            <Label htmlFor="nama">Nama</Label>
            <Input
              type="text"
              name="nama"
              value={form.nama || ""}
              onChange={onChange}
              placeholder="Masukkan Nama Mahasiswa"
              required
            />
          </div>
          <div>
            <Label htmlFor="prodi">Program Studi</Label>
            <Input
              type="text"
              name="prodi"
              value={form.prodi || ""}
              onChange={onChange}
              placeholder="Masukkan Program Studi (contoh: Teknik Informatika)"
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Status Aktif</Label> {/* Ganti 'aktif' menjadi 'status' */}
            <select
              name="status" // Ganti 'aktif' menjadi 'status'
              value={form.status || ""} // Ganti 'aktif' menjadi 'status'
              onChange={onChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Pilih Status</option>
              <option value="aktif">Aktif</option> {/* Sesuaikan value dengan JSON Anda */}
              <option value="tidak aktif">Tidak Aktif</option> {/* Sesuaikan value dengan JSON Anda */}
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

export default ModalMahasiswa;