import { createContext, useContext, useState } from "react";

const AuthStateContext = createContext({
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, _setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [mahasiswa, _setMahasiswa, dosen, _setDosen, matakuliah, _setMatakuliah, kelas, _setKelas] = useState(JSON.parse(localStorage.getItem("mahasiswa","dosen","matakuliah")));

  const setUser = (user) => {
    _setUser(user);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  };
  
  const setMahasiswa = (mahasiswa) => {
    _setMahasiswa(mahasiswa);
    if (mahasiswa) {
      localStorage.setItem("mahasiswa", JSON.stringify(mahasiswa));
    } else {
      localStorage.removeItem("mahasiswa");
    }
  };
  const setDosen = (dosen) => {
    _setDosen(dosen);
    if (dosen) {
      localStorage.setItem("dosen", JSON.stringify(dosen));
    } else {
      localStorage.removeItem("dosen");
    }
  };
  const setMatakuliah = (matakuliah) => {
    _setMatakuliah(matakuliah);
    if (matakuliah) {
      localStorage.setItem("matakuliah", JSON.stringify(matakuliah));
    } else {
      localStorage.removeItem("matakuliah");
    }
  };
  const setKelas = (kelas) => {
    _setKelas(kelas);
    if (kelas) {
      localStorage.setItem("kelas", JSON.stringify(kelas));
    } else {
      localStorage.removeItem("kelas");
    }
  };

  return (
    <AuthStateContext.Provider value={{ user, setUser, mahasiswa, setMahasiswa, dosen, setDosen, matakuliah, setMatakuliah, kelas, setKelas }}>
      {children}
    </AuthStateContext.Provider>
  );
};

export const useAuthStateContext = () => useContext(AuthStateContext);
