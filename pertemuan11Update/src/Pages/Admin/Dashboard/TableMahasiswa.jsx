import Button from "@/Components/Button";

const TableMahasiswa = ({ data = [], onDetail }) => {
  return (
    <table className="w-full text-sm text-gray-700">
      <thead className="bg-blue-600 text-white">
        <tr>
          <th className="py-2 px-4 text-left">NIM</th>
          <th className="py-2 px-4 text-left">Nama</th>
          <th className="py-2 px-4 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {data.map((mhs, index) => (
          <tr key={mhs.nim} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
            <td className="py-2 px-4">{mhs.nim}</td>
            <td className="py-2 px-4">{mhs.nama}</td>
            <td className="py-2 px-4 text-center space-x-2">
              <Button variant="secondary" onClick={() => onDetail(mhs.nim)}>Detail</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableMahasiswa;