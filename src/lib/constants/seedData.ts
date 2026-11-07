import { Siswa, Mapel, Ekskul, User, SchoolConfig } from "@/types";

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  nama_yayasan: "YAYASAN NURUL ULUM BLITAR",
  nomor_sk: "SK. Kemenkum Ham. Nomor AHU-0002160.AH.01.04. Tahun 2017",
  nama_madrasah: "MA MA'ARIF NURUS SALAM",
  alamat: "Jalan Diponegoro no. 105 Kedungbunder, Sutojayan, Blitar, Jawa Timur",
  kepala_madrasah: "M. Zen Pamuji, S.Pd.",
  nip_kepala: "-",
  kota_tanggal: "Blitar",
};

export const SEED_USERS: User[] = [
  {
    id: "usr-1",
    username: "admin",
    nama_user: "Administrator Rapor",
    role: "admin",
    kelas_diampu: "Semua",
  },
  {
    id: "usr-2",
    username: "guru1",
    nama_user: "Ahmad Fauzi, S.Pd.I.",
    role: "guru",
    kelas_diampu: "X-A, X-B",
  },
  {
    id: "usr-3",
    username: "wali10a",
    nama_user: "Siti Nurhaliza, M.Pd.",
    role: "guru_walikelas",
    kelas_diampu: "X-A",
  },
  {
    id: "usr-4",
    username: "wali11a",
    nama_user: "H. Budi Santoso, S.Ag.",
    role: "guru_walikelas",
    kelas_diampu: "XI-A",
  },
  {
    id: "usr-5",
    username: "ekstra1",
    nama_user: "Rizky Pratama, S.Pd.",
    role: "guru_ekstra",
    kelas_diampu: "-",
  },
  {
    id: "usr-6",
    username: "kamad",
    nama_user: "M. Zen Pamuji, S.Pd.",
    role: "kamad",
    kelas_diampu: "-",
  },
];

export const SEED_CLASSES = ["X-A", "X-B", "XI-A", "XI-B", "XII-A", "XII-B"];

export const SEED_SISWA: Siswa[] = [
  { id: "s-101", nis: "240101", nisn: "0071234561", nama_siswa: "Achmad Dhani Saputra", kelas: "X-A", jenis_kelamin: "L" },
  { id: "s-102", nis: "240102", nisn: "0071234562", nama_siswa: "Aisyah Putri Rahmadani", kelas: "X-A", jenis_kelamin: "P" },
  { id: "s-103", nis: "240103", nisn: "0071234563", nama_siswa: "Bayu Fajar Wicaksono", kelas: "X-A", jenis_kelamin: "L" },
  { id: "s-104", nis: "240104", nisn: "0071234564", nama_siswa: "Citra Lestari Dewi", kelas: "X-A", jenis_kelamin: "P" },
  { id: "s-105", nis: "240105", nisn: "0071234565", nama_siswa: "Dafa Alfarizi", kelas: "X-A", jenis_kelamin: "L" },
  { id: "s-106", nis: "240106", nisn: "0071234566", nama_siswa: "Fatimah Az-Zahra", kelas: "X-A", jenis_kelamin: "P" },
  { id: "s-107", nis: "240107", nisn: "0071234567", nama_siswa: "Gilang Ramadhan", kelas: "X-A", jenis_kelamin: "L" },
  { id: "s-108", nis: "240108", nisn: "0071234568", nama_siswa: "Hafiz Ridwan Hakim", kelas: "X-A", jenis_kelamin: "L" },
  { id: "s-109", nis: "240109", nisn: "0071234569", nama_siswa: "Intan Permatasari", kelas: "X-A", jenis_kelamin: "P" },
  { id: "s-110", nis: "240110", nisn: "0071234570", nama_siswa: "Muhammad Rizki Maulana", kelas: "X-A", jenis_kelamin: "L" },

  { id: "s-201", nis: "240201", nisn: "0071234581", nama_siswa: "Aditya Wahyu Nugroho", kelas: "XI-A", jenis_kelamin: "L" },
  { id: "s-202", nis: "240202", nisn: "0071234582", nama_siswa: "Bella Safitri", kelas: "XI-A", jenis_kelamin: "P" },
  { id: "s-203", nis: "240203", nisn: "0071234583", nama_siswa: "Dimas Anggara", kelas: "XI-A", jenis_kelamin: "L" },
  { id: "s-204", nis: "240204", nisn: "0071234584", nama_siswa: "Nur Laila Maulidia", kelas: "XI-A", jenis_kelamin: "P" },
  { id: "s-205", nis: "240205", nisn: "0071234585", nama_siswa: "Zaidan Ali Robbani", kelas: "XI-A", jenis_kelamin: "L" },
];

export const SEED_MAPEL: Mapel[] = [
  { id: "m-1", kode_mapel: "QH", nama_mapel: "Al-Qur'an Hadis", kelompok: "Pendidikan Agama Islam" },
  { id: "m-2", kode_mapel: "AA", nama_mapel: "Akidah Akhlak", kelompok: "Pendidikan Agama Islam" },
  { id: "m-3", kode_mapel: "FIK", nama_mapel: "Fikih", kelompok: "Pendidikan Agama Islam" },
  { id: "m-4", kode_mapel: "SKI", nama_mapel: "Sejarah Kebudayaan Islam", kelompok: "Pendidikan Agama Islam" },
  { id: "m-5", kode_mapel: "PPKN", nama_mapel: "Pendidikan Pancasila & Kewarganegaraan", kelompok: "Umum" },
  { id: "m-6", kode_mapel: "BINDO", nama_mapel: "Bahasa Indonesia", kelompok: "Umum" },
  { id: "m-7", kode_mapel: "BARAB", nama_mapel: "Bahasa Arab", kelompok: "Umum" },
  { id: "m-8", kode_mapel: "MTK", nama_mapel: "Matematika", kelompok: "Umum" },
  { id: "m-9", kode_mapel: "SEJ", nama_mapel: "Sejarah Indonesia", kelompok: "Umum" },
  { id: "m-10", kode_mapel: "BING", nama_mapel: "Bahasa Inggris", kelompok: "Umum" },
  { id: "m-11", kode_mapel: "SBK", nama_mapel: "Seni Budaya", kelompok: "Umum" },
  { id: "m-12", kode_mapel: "PJOK", nama_mapel: "Pendidikan Jasmani & Olahraga", kelompok: "Umum" },
  { id: "m-13", kode_mapel: "INF", nama_mapel: "Informatika / Prakarya", kelompok: "Umum" },
];

export const SEED_EKSKUL: Ekskul[] = [
  { id: "e-1", nama_ekskul: "Pramuka", pembina: "Rizky Pratama, S.Pd." },
  { id: "e-2", nama_ekskul: "Hadrah & Shalawat", pembina: "Ust. M. Hidayat" },
  { id: "e-3", nama_ekskul: "Qiro'ah & Tahfidz", pembina: "Ustzh. Nur Hasanah" },
  { id: "e-4", nama_ekskul: "PMR / KKR", pembina: "Dewi Susilowati, S.Kep." },
  { id: "e-5", nama_ekskul: "Futsal & Olahraga", pembina: "Agus Setiawan, S.Pd." },
  { id: "e-6", nama_ekskul: "KIR (Karya Ilmiah Remaja)", pembina: "Dr. Farida, M.Si." },
];
