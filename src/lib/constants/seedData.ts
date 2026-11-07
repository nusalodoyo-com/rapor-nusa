import { Siswa, Mapel, Ekskul, User, SchoolConfig, MadrasahId } from "@/types";
import { SEED_CLASSES_MTS, SEED_SISWA_MTS } from "./mtsStudents";

export { SEED_CLASSES_MTS, SEED_SISWA_MTS };

// =====================================================================
// KONFIGURASI PROFIL DUA MADRASAH
// =====================================================================

export const SCHOOL_CONFIGS: Record<MadrasahId, SchoolConfig> = {
  mts: {
    id: "mts",
    nama_yayasan: "LP MA'ARIF NU KABUPATEN BLITAR",
    nomor_sk: "Kemenkumham RI No. AHU-119.AH.01.08. Tahun 2013",
    nama_madrasah: "MTs MA'ARIF NU 2 SUTOJAYAN",
    jenjang: "MTs",
    nsm: "121235050045",
    npsn: "20582201",
    akreditasi: "A (Unggul)",
    alamat: "Jl. Raya Barat No. 24 Kedungbunder, Sutojayan",
    desa: "Kedungbunder",
    kecamatan: "Sutojayan",
    kabupaten: "Blitar",
    provinsi: "Jawa Timur",
    kepala_madrasah: "Ahmad Ulil Amin, Lc., M.S.I.",
    nip_kepala: "-",
    kota_tanggal: "Blitar",
  },
  ma: {
    id: "ma",
    nama_yayasan: "YAYASAN NURUL ULUM BLITAR",
    nomor_sk: "SK. Kemenkum Ham. Nomor AHU-0002160.AH.01.04. Tahun 2017",
    nama_madrasah: "MA MA'ARIF NURUS SALAM",
    jenjang: "MA",
    nsm: "131235050062",
    npsn: "69978521",
    akreditasi: "B (Baik)",
    alamat: "Jalan Diponegoro no. 105 Kedungbunder, Sutojayan",
    desa: "Kedungbunder",
    kecamatan: "Sutojayan",
    kabupaten: "Blitar",
    provinsi: "Jawa Timur",
    kepala_madrasah: "M. Zen Pamuji, S.Pd.",
    nip_kepala: "-",
    kota_tanggal: "Blitar",
  },
};

// =====================================================================
// USER ACCOUNTS PER MADRASAH
// =====================================================================

export const SEED_USERS_MTS: User[] = [
  {
    id: "usr-mts-1",
    madrasah_id: "mts",
    username: "admin_mts",
    nama_user: "Admin MTs Ma'arif NU 2",
    role: "admin",
    kelas_diampu: "Semua",
  },
  {
    id: "usr-mts-2",
    madrasah_id: "mts",
    username: "wali7a",
    nama_user: "Umi Kulsum, S.Pd.I.",
    role: "guru_walikelas",
    kelas_diampu: "VII-A",
  },
  {
    id: "usr-mts-3",
    madrasah_id: "mts",
    username: "wali8a",
    nama_user: "Muh. Khoirul Anam, M.Pd.",
    role: "guru_walikelas",
    kelas_diampu: "VIII-A",
  },
  {
    id: "usr-mts-4",
    madrasah_id: "mts",
    username: "wali9a",
    nama_user: "M. Syaifullah, S.Pd.",
    role: "guru_walikelas",
    kelas_diampu: "IX-A",
  },
  {
    id: "usr-mts-5",
    madrasah_id: "mts",
    username: "guru_mts1",
    nama_user: "Hj. Siti Rohmah, S.Ag.",
    role: "guru",
    kelas_diampu: "VII-A, VII-B, VIII-A, IX-A",
  },
  {
    id: "usr-mts-6",
    madrasah_id: "mts",
    username: "ekstra_mts",
    nama_user: "Anang Ma'ruf, S.Or.",
    role: "guru_ekstra",
    kelas_diampu: "-",
  },
  {
    id: "usr-mts-7",
    madrasah_id: "mts",
    username: "kamad_mts",
    nama_user: "Ahmad Ulil Amin, Lc., M.S.I.",
    role: "kamad",
    kelas_diampu: "-",
  },
];

export const SEED_USERS_MA: User[] = [
  {
    id: "usr-ma-1",
    madrasah_id: "ma",
    username: "admin_ma",
    nama_user: "Admin MA Ma'arif Nurus Salam",
    role: "admin",
    kelas_diampu: "Semua",
  },
  {
    id: "usr-ma-2",
    madrasah_id: "ma",
    username: "wali10a",
    nama_user: "Siti Nurhaliza, M.Pd.",
    role: "guru_walikelas",
    kelas_diampu: "X-A",
  },
  {
    id: "usr-ma-3",
    madrasah_id: "ma",
    username: "wali11ipa",
    nama_user: "H. Budi Santoso, S.Ag.",
    role: "guru_walikelas",
    kelas_diampu: "XI-IPA",
  },
  {
    id: "usr-ma-4",
    madrasah_id: "ma",
    username: "guru_ma1",
    nama_user: "Ahmad Fauzi, S.Pd.I.",
    role: "guru",
    kelas_diampu: "X-A, X-B",
  },
  {
    id: "usr-ma-5",
    madrasah_id: "ma",
    username: "ekstra_ma",
    nama_user: "Rizky Pratama, S.Pd.",
    role: "guru_ekstra",
    kelas_diampu: "-",
  },
  {
    id: "usr-ma-6",
    madrasah_id: "ma",
    username: "kamad_ma",
    nama_user: "M. Zen Pamuji, S.Pd.",
    role: "kamad",
    kelas_diampu: "-",
  },
];

// =====================================================================
// KELAS PER MADRASAH
// =====================================================================

export const SEED_CLASSES_MA = ["X-A", "X-B", "XI-IPA", "XI-IPS", "XII-IPA", "XII-IPS"];

// =====================================================================
// DATA SISWA MA
// =====================================================================

export const SEED_SISWA_MA: Siswa[] = [
  { id: "ma-s-101", madrasah_id: "ma", nis: "240101", nisn: "0071234561", nama_siswa: "Achmad Dhani Saputra", kelas: "X-A", jenis_kelamin: "L", alamat: "Kedungbunder" },
  { id: "ma-s-102", madrasah_id: "ma", nis: "240102", nisn: "0071234562", nama_siswa: "Aisyah Putri Rahmadani", kelas: "X-A", jenis_kelamin: "P", alamat: "Sutojayan" },
  { id: "ma-s-103", madrasah_id: "ma", nis: "240103", nisn: "0071234563", nama_siswa: "Bayu Fajar Wicaksono", kelas: "X-A", jenis_kelamin: "L", alamat: "Lodoyo" },
  { id: "ma-s-104", madrasah_id: "ma", nis: "240104", nisn: "0071234564", nama_siswa: "Citra Lestari Dewi", kelas: "X-A", jenis_kelamin: "P", alamat: "Sutojayan" },
  { id: "ma-s-105", madrasah_id: "ma", nis: "240105", nisn: "0071234565", nama_siswa: "Dafa Alfarizi", kelas: "X-A", jenis_kelamin: "L", alamat: "Kedungbunder" },
  { id: "ma-s-106", madrasah_id: "ma", nis: "240106", nisn: "0071234566", nama_siswa: "Fatimah Az-Zahra", kelas: "X-A", jenis_kelamin: "P", alamat: "Kademangan" },
  { id: "ma-s-107", madrasah_id: "ma", nis: "240107", nisn: "0071234567", nama_siswa: "Gilang Ramadhan", kelas: "X-A", jenis_kelamin: "L", alamat: "Lodoyo" },
  { id: "ma-s-108", madrasah_id: "ma", nis: "240108", nisn: "0071234568", nama_siswa: "Hafiz Ridwan Hakim", kelas: "X-A", jenis_kelamin: "L", alamat: "Sutojayan" },
  { id: "ma-s-109", madrasah_id: "ma", nis: "240109", nisn: "0071234569", nama_siswa: "Intan Permatasari", kelas: "X-A", jenis_kelamin: "P", alamat: "Kedungbunder" },
  { id: "ma-s-110", madrasah_id: "ma", nis: "240110", nisn: "0071234570", nama_siswa: "Muhammad Rizki Maulana", kelas: "X-A", jenis_kelamin: "L", alamat: "Sutojayan" },
];

// =====================================================================
// MATA PELAJARAN STANDAR KEMENAG (KELOMPOK A, B, C)
// =====================================================================

export const SEED_MAPEL_MTS: Mapel[] = [
  // Kelompok A: PAI & Bahasa Arab
  { id: "m-mts-1", madrasah_id: "mts", kode_mapel: "QH", nama_mapel: "Al-Qur'an Hadis", kelompok: "A", kkm: 75, urutan: 1 },
  { id: "m-mts-2", madrasah_id: "mts", kode_mapel: "AA", nama_mapel: "Akidah Akhlak", kelompok: "A", kkm: 75, urutan: 2 },
  { id: "m-mts-3", madrasah_id: "mts", kode_mapel: "FIK", nama_mapel: "Fikih", kelompok: "A", kkm: 75, urutan: 3 },
  { id: "m-mts-4", madrasah_id: "mts", kode_mapel: "SKI", nama_mapel: "Sejarah Kebudayaan Islam", kelompok: "A", kkm: 75, urutan: 4 },
  { id: "m-mts-5", madrasah_id: "mts", kode_mapel: "BARAB", nama_mapel: "Bahasa Arab", kelompok: "A", kkm: 75, urutan: 5 },
  // Kelompok B: Umum
  { id: "m-mts-6", madrasah_id: "mts", kode_mapel: "PPKN", nama_mapel: "Pendidikan Pancasila", kelompok: "B", kkm: 75, urutan: 6 },
  { id: "m-mts-7", madrasah_id: "mts", kode_mapel: "BINDO", nama_mapel: "Bahasa Indonesia", kelompok: "B", kkm: 75, urutan: 7 },
  { id: "m-mts-8", madrasah_id: "mts", kode_mapel: "MTK", nama_mapel: "Matematika", kelompok: "B", kkm: 72, urutan: 8 },
  { id: "m-mts-9", madrasah_id: "mts", kode_mapel: "IPA", nama_mapel: "Ilmu Pengetahuan Alam (IPA)", kelompok: "B", kkm: 72, urutan: 9 },
  { id: "m-mts-10", madrasah_id: "mts", kode_mapel: "IPS", nama_mapel: "Ilmu Pengetahuan Sosial (IPS)", kelompok: "B", kkm: 75, urutan: 10 },
  { id: "m-mts-11", madrasah_id: "mts", kode_mapel: "BING", nama_mapel: "Bahasa Inggris", kelompok: "B", kkm: 72, urutan: 11 },
  { id: "m-mts-12", madrasah_id: "mts", kode_mapel: "PJOK", nama_mapel: "PJOK", kelompok: "B", kkm: 75, urutan: 12 },
  { id: "m-mts-13", madrasah_id: "mts", kode_mapel: "SBK", nama_mapel: "Seni Budaya", kelompok: "B", kkm: 75, urutan: 13 },
  { id: "m-mts-14", madrasah_id: "mts", kode_mapel: "INF", nama_mapel: "Informatika", kelompok: "B", kkm: 75, urutan: 14 },
  // Kelompok C: Muatan Lokal
  { id: "m-mts-15", madrasah_id: "mts", kode_mapel: "ASWAJA", nama_mapel: "Aswaja / Ke-NU-an", kelompok: "C", kkm: 75, urutan: 15 },
  { id: "m-mts-16", madrasah_id: "mts", kode_mapel: "BJAWA", nama_mapel: "Bahasa Jawa", kelompok: "C", kkm: 75, urutan: 16 },
];

export const SEED_MAPEL_MA: Mapel[] = [
  // Kelompok A: PAI & Bahasa Arab
  { id: "m-ma-1", madrasah_id: "ma", kode_mapel: "QH", nama_mapel: "Al-Qur'an Hadis", kelompok: "A", kkm: 75, urutan: 1 },
  { id: "m-ma-2", madrasah_id: "ma", kode_mapel: "AA", nama_mapel: "Akidah Akhlak", kelompok: "A", kkm: 75, urutan: 2 },
  { id: "m-ma-3", madrasah_id: "ma", kode_mapel: "FIK", nama_mapel: "Fikih", kelompok: "A", kkm: 75, urutan: 3 },
  { id: "m-ma-4", madrasah_id: "ma", kode_mapel: "SKI", nama_mapel: "Sejarah Kebudayaan Islam", kelompok: "A", kkm: 75, urutan: 4 },
  { id: "m-ma-5", madrasah_id: "ma", kode_mapel: "BARAB", nama_mapel: "Bahasa Arab", kelompok: "A", kkm: 75, urutan: 5 },
  // Kelompok B: Umum
  { id: "m-ma-6", madrasah_id: "ma", kode_mapel: "PPKN", nama_mapel: "Pendidikan Pancasila & Kewarganegaraan", kelompok: "B", kkm: 75, urutan: 6 },
  { id: "m-ma-7", madrasah_id: "ma", kode_mapel: "BINDO", nama_mapel: "Bahasa Indonesia", kelompok: "B", kkm: 75, urutan: 7 },
  { id: "m-ma-8", madrasah_id: "ma", kode_mapel: "MTK", nama_mapel: "Matematika", kelompok: "B", kkm: 72, urutan: 8 },
  { id: "m-ma-9", madrasah_id: "ma", kode_mapel: "SEJ", nama_mapel: "Sejarah Indonesia", kelompok: "B", kkm: 75, urutan: 9 },
  { id: "m-ma-10", madrasah_id: "ma", kode_mapel: "BING", nama_mapel: "Bahasa Inggris", kelompok: "B", kkm: 72, urutan: 10 },
  { id: "m-ma-11", madrasah_id: "ma", kode_mapel: "SBK", nama_mapel: "Seni Budaya", kelompok: "B", kkm: 75, urutan: 11 },
  { id: "m-ma-12", madrasah_id: "ma", kode_mapel: "PJOK", nama_mapel: "PJOK", kelompok: "B", kkm: 75, urutan: 12 },
  { id: "m-ma-13", madrasah_id: "ma", kode_mapel: "PKWU", nama_mapel: "Prakarya & Kewirausahaan", kelompok: "B", kkm: 75, urutan: 13 },
  // Kelompok C: Peminatan / Mulok
  { id: "m-ma-14", madrasah_id: "ma", kode_mapel: "BIO", nama_mapel: "Biologi", kelompok: "C", kkm: 72, urutan: 14 },
  { id: "m-ma-15", madrasah_id: "ma", kode_mapel: "FIS", nama_mapel: "Fisika", kelompok: "C", kkm: 70, urutan: 15 },
  { id: "m-ma-16", madrasah_id: "ma", kode_mapel: "KIM", nama_mapel: "Kimia", kelompok: "C", kkm: 70, urutan: 16 },
  { id: "m-ma-17", madrasah_id: "ma", kode_mapel: "EKO", nama_mapel: "Ekonomi", kelompok: "C", kkm: 75, urutan: 17 },
  { id: "m-ma-18", madrasah_id: "ma", kode_mapel: "ASWAJA", nama_mapel: "Ke-NU-an / Riset", kelompok: "C", kkm: 75, urutan: 18 },
];

// =====================================================================
// EKSTRAKURIKULER
// =====================================================================

export const SEED_EKSKUL_MTS: Ekskul[] = [
  { id: "e-mts-1", madrasah_id: "mts", nama_ekskul: "Pramuka MTs", pembina: "Anang Ma'ruf, S.Or." },
  { id: "e-mts-2", madrasah_id: "mts", nama_ekskul: "Hadrah Al-Banjari", pembina: "Ust. Zaini" },
  { id: "e-mts-3", madrasah_id: "mts", nama_ekskul: "Tahfidzul Qur'an", pembina: "Ustzh. Siti Aminah" },
  { id: "e-mts-4", madrasah_id: "mts", nama_ekskul: "PMR Madya", pembina: "Ns. Hendra" },
  { id: "e-mts-5", madrasah_id: "mts", nama_ekskul: "Futsal / Voli", pembina: "Agus S." },
];

export const SEED_EKSKUL_MA: Ekskul[] = [
  { id: "e-ma-1", madrasah_id: "ma", nama_ekskul: "Pramuka Penegak", pembina: "Rizky Pratama, S.Pd." },
  { id: "e-ma-2", madrasah_id: "ma", nama_ekskul: "Hadrah & Shalawat", pembina: "Ust. M. Hidayat" },
  { id: "e-ma-3", madrasah_id: "ma", nama_ekskul: "Qiro'ah & Tahfidz", pembina: "Ustzh. Nur Hasanah" },
  { id: "e-ma-4", madrasah_id: "ma", nama_ekskul: "PMR Wira", pembina: "Dewi Susilowati, S.Kep." },
  { id: "e-ma-5", madrasah_id: "ma", nama_ekskul: "KIR (Karya Ilmiah Remaja)", pembina: "Dr. Farida, M.Si." },
  { id: "e-ma-6", madrasah_id: "ma", nama_ekskul: "Futsal", pembina: "Agus Setiawan, S.Pd." },
];
