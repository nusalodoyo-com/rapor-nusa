import { Siswa, Mapel, Ekskul, User, SchoolConfig, MadrasahId } from "@/types";
import { SEED_CLASSES_MTS, SEED_SISWA_MTS } from "./mtsStudents";
import { REAL_TEACHERS_MTS, REAL_TEACHERS_MA } from "./teachersData";

export { SEED_CLASSES_MTS, SEED_SISWA_MTS, REAL_TEACHERS_MTS, REAL_TEACHERS_MA };

// =====================================================================
// KONFIGURASI PROFIL DUA MADRASAH (KMA 1503 TAHUN 2025)
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
    tanggal_rapor: "20 Desember 2025",
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
    tanggal_rapor: "20 Desember 2025",
  },
};

// =====================================================================
// USER ACCOUNTS: 87 GURU NYATA DENGAN PASSWORD 'Matsamuda22'
// BESERTA OPERATOR ADMIN & KEPALA MADRASAH
// =====================================================================

export const SEED_USERS_MTS: User[] = [
  {
    id: "admin-mts-root",
    madrasah_id: "mts",
    username: "admin_mts",
    password: "123",
    nama_user: "Operator MTs Ma'arif NU 2",
    role: "admin",
    kelas_diampu: "Semua",
  },
  {
    id: "kamad-mts-root",
    madrasah_id: "mts",
    username: "kamad_mts",
    password: "123",
    nama_user: "Ahmad Ulil Amin, Lc., M.S.I.",
    role: "kamad",
    kelas_diampu: "-",
  },
  ...REAL_TEACHERS_MTS,
];

export const SEED_USERS_MA: User[] = [
  {
    id: "admin-ma-root",
    madrasah_id: "ma",
    username: "admin_ma",
    password: "123",
    nama_user: "Operator MA Ma'arif Nurus Salam",
    role: "admin",
    kelas_diampu: "Semua",
  },
  {
    id: "kamad-ma-root",
    madrasah_id: "ma",
    username: "kamad_ma",
    password: "123",
    nama_user: "M. Zen Pamuji, S.Pd.",
    role: "kamad",
    kelas_diampu: "-",
  },
  ...REAL_TEACHERS_MA,
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
// MATA PELAJARAN KMA 1503 TAHUN 2025
// =====================================================================

export const SEED_MAPEL_MTS: Mapel[] = [
  { id: "mts-m-1", madrasah_id: "mts", kode_mapel: "QH", nama_mapel: "Al-Qur'an Hadis", kelompok: "A", kkm: 75, fase: "D", urutan: 1 },
  { id: "mts-m-2", madrasah_id: "mts", kode_mapel: "AA", nama_mapel: "Akidah Akhlak", kelompok: "A", kkm: 75, fase: "D", urutan: 2 },
  { id: "mts-m-3", madrasah_id: "mts", kode_mapel: "FIK", nama_mapel: "Fikih", kelompok: "A", kkm: 75, fase: "D", urutan: 3 },
  { id: "mts-m-4", madrasah_id: "mts", kode_mapel: "SKI", nama_mapel: "Sejarah Kebudayaan Islam", kelompok: "A", kkm: 75, fase: "D", urutan: 4 },
  { id: "mts-m-5", madrasah_id: "mts", kode_mapel: "BARAB", nama_mapel: "Bahasa Arab", kelompok: "A", kkm: 75, fase: "D", urutan: 5 },
  { id: "mts-m-6", madrasah_id: "mts", kode_mapel: "PPKN", nama_mapel: "Pendidikan Pancasila", kelompok: "B", kkm: 75, fase: "D", urutan: 6 },
  { id: "mts-m-7", madrasah_id: "mts", kode_mapel: "BINDO", nama_mapel: "Bahasa Indonesia", kelompok: "B", kkm: 75, fase: "D", urutan: 7 },
  { id: "mts-m-8", madrasah_id: "mts", kode_mapel: "MTK", nama_mapel: "Matematika", kelompok: "B", kkm: 75, fase: "D", urutan: 8 },
  { id: "mts-m-9", madrasah_id: "mts", kode_mapel: "IPA", nama_mapel: "Ilmu Pengetahuan Alam", kelompok: "B", kkm: 75, fase: "D", urutan: 9 },
  { id: "mts-m-10", madrasah_id: "mts", kode_mapel: "IPS", nama_mapel: "Ilmu Pengetahuan Sosial", kelompok: "B", kkm: 75, fase: "D", urutan: 10 },
  { id: "mts-m-11", madrasah_id: "mts", kode_mapel: "BING", nama_mapel: "Bahasa Inggris", kelompok: "B", kkm: 75, fase: "D", urutan: 11 },
  { id: "mts-m-12", madrasah_id: "mts", kode_mapel: "PJOK", nama_mapel: "Pendidikan Jasmani, Olahraga & Kesehatan", kelompok: "B", kkm: 75, fase: "D", urutan: 12 },
  { id: "mts-m-13", madrasah_id: "mts", kode_mapel: "INF", nama_mapel: "Informatika", kelompok: "B", kkm: 75, fase: "D", urutan: 13 },
  { id: "mts-m-14", madrasah_id: "mts", kode_mapel: "SBK", nama_mapel: "Seni Budaya & Prakarya", kelompok: "B", kkm: 75, fase: "D", urutan: 14 },
  { id: "mts-m-15", madrasah_id: "mts", kode_mapel: "AI", nama_mapel: "Koding dan Kecerdasan Artifisial", kelompok: "C", kkm: 75, fase: "D", urutan: 15 },
  { id: "mts-m-16", madrasah_id: "mts", kode_mapel: "ASWAJA", nama_mapel: "Ke-NU-an / Aswaja", kelompok: "C", kkm: 75, fase: "D", urutan: 16 },
  { id: "mts-m-17", madrasah_id: "mts", kode_mapel: "BJAWA", nama_mapel: "Bahasa Jawa", kelompok: "C", kkm: 75, fase: "D", urutan: 17 },
];

export const SEED_MAPEL_MA: Mapel[] = [
  { id: "ma-m-1", madrasah_id: "ma", kode_mapel: "QH", nama_mapel: "Al-Qur'an Hadis", kelompok: "A", kkm: 75, fase: "E", urutan: 1 },
  { id: "ma-m-2", madrasah_id: "ma", kode_mapel: "AA", nama_mapel: "Akidah Akhlak", kelompok: "A", kkm: 75, fase: "E", urutan: 2 },
  { id: "ma-m-3", madrasah_id: "ma", kode_mapel: "FIK", nama_mapel: "Fikih", kelompok: "A", kkm: 75, fase: "E", urutan: 3 },
  { id: "ma-m-4", madrasah_id: "ma", kode_mapel: "SKI", nama_mapel: "Sejarah Kebudayaan Islam", kelompok: "A", kkm: 75, fase: "E", urutan: 4 },
  { id: "ma-m-5", madrasah_id: "ma", kode_mapel: "BARAB", nama_mapel: "Bahasa Arab", kelompok: "A", kkm: 75, fase: "E", urutan: 5 },
  { id: "ma-m-6", madrasah_id: "ma", kode_mapel: "PPKN", nama_mapel: "Pendidikan Pancasila", kelompok: "B", kkm: 75, fase: "E", urutan: 6 },
  { id: "ma-m-7", madrasah_id: "ma", kode_mapel: "BINDO", nama_mapel: "Bahasa Indonesia", kelompok: "B", kkm: 75, fase: "E", urutan: 7 },
  { id: "ma-m-8", madrasah_id: "ma", kode_mapel: "MTK", nama_mapel: "Matematika", kelompok: "B", kkm: 75, fase: "E", urutan: 8 },
  { id: "ma-m-9", madrasah_id: "ma", kode_mapel: "BING", nama_mapel: "Bahasa Inggris", kelompok: "B", kkm: 75, fase: "E", urutan: 9 },
  { id: "ma-m-10", madrasah_id: "ma", kode_mapel: "SEJ", nama_mapel: "Sejarah Indonesia", kelompok: "B", kkm: 75, fase: "E", urutan: 10 },
  { id: "ma-m-11", madrasah_id: "ma", kode_mapel: "PJOK", nama_mapel: "Pendidikan Jasmani, Olahraga & Kesehatan", kelompok: "B", kkm: 75, fase: "E", urutan: 11 },
  { id: "ma-m-12", madrasah_id: "ma", kode_mapel: "SBK", nama_mapel: "Seni Budaya", kelompok: "B", kkm: 75, fase: "E", urutan: 12 },
  { id: "ma-m-13", madrasah_id: "ma", kode_mapel: "PKWU", nama_mapel: "Prakarya & Kewirausahaan", kelompok: "B", kkm: 75, fase: "E", urutan: 13 },
  { id: "ma-m-14", madrasah_id: "ma", kode_mapel: "BIO", nama_mapel: "Biologi (Peminatan)", kelompok: "C", kkm: 75, fase: "E", urutan: 14 },
  { id: "ma-m-15", madrasah_id: "ma", kode_mapel: "FIS", nama_mapel: "Fisika (Peminatan)", kelompok: "C", kkm: 75, fase: "E", urutan: 15 },
  { id: "ma-m-16", madrasah_id: "ma", kode_mapel: "KIM", nama_mapel: "Kimia (Peminatan)", kelompok: "C", kkm: 75, fase: "E", urutan: 16 },
  { id: "ma-m-17", madrasah_id: "ma", kode_mapel: "EKO", nama_mapel: "Ekonomi (Peminatan)", kelompok: "C", kkm: 75, fase: "E", urutan: 17 },
  { id: "ma-m-18", madrasah_id: "ma", kode_mapel: "SOS", nama_mapel: "Sosiologi (Peminatan)", kelompok: "C", kkm: 75, fase: "E", urutan: 18 },
  { id: "ma-m-19", madrasah_id: "ma", kode_mapel: "GEO", nama_mapel: "Geografi (Peminatan)", kelompok: "C", kkm: 75, fase: "E", urutan: 19 },
  { id: "ma-m-20", madrasah_id: "ma", kode_mapel: "AI", nama_mapel: "Koding dan Kecerdasan Artifisial", kelompok: "C", kkm: 75, fase: "E", urutan: 20 },
  { id: "ma-m-21", madrasah_id: "ma", kode_mapel: "ASWAJA", nama_mapel: "Aswaja / Ke-NU-an", kelompok: "C", kkm: 75, fase: "E", urutan: 21 },
  { id: "ma-m-22", madrasah_id: "ma", kode_mapel: "BJAWA", nama_mapel: "Bahasa Jawa", kelompok: "C", kkm: 75, fase: "E", urutan: 22 },
];

// =====================================================================
// EKSTRAKURIKULER
// =====================================================================

export const SEED_EKSKUL_MTS: Ekskul[] = [
  { id: "mts-e-1", madrasah_id: "mts", nama_ekskul: "Pramuka Ma'arif" },
  { id: "mts-e-2", madrasah_id: "mts", nama_ekskul: "PMR (Palang Merah Remaja)" },
  { id: "mts-e-3", madrasah_id: "mts", nama_ekskul: "Hadrah / Banjari" },
  { id: "mts-e-4", madrasah_id: "mts", nama_ekskul: "Tahfidz Al-Qur'an" },
  { id: "mts-e-5", madrasah_id: "mts", nama_ekskul: "Futsal" },
  { id: "mts-e-6", madrasah_id: "mts", nama_ekskul: "Pagar Nusa (Pencak Silat)" },
  { id: "mts-e-7", madrasah_id: "mts", nama_ekskul: "English Club" },
  { id: "mts-e-8", madrasah_id: "mts", nama_ekskul: "Robotika & Koding" },
];

export const SEED_EKSKUL_MA: Ekskul[] = [
  { id: "ma-e-1", madrasah_id: "ma", nama_ekskul: "Pramuka Ambalan" },
  { id: "ma-e-2", madrasah_id: "ma", nama_ekskul: "KIR (Karya Ilmiah Remaja)" },
  { id: "ma-e-3", madrasah_id: "ma", nama_ekskul: "Hadrah & Shalawat" },
  { id: "ma-e-4", madrasah_id: "ma", nama_ekskul: "Kajian Kitab Kuning" },
  { id: "ma-e-5", madrasah_id: "ma", nama_ekskul: "Pagar Nusa" },
  { id: "ma-e-6", madrasah_id: "ma", nama_ekskul: "Jurnalistik & Multimedia" },
  { id: "ma-e-7", madrasah_id: "ma", nama_ekskul: "Bola Voli" },
  { id: "ma-e-8", madrasah_id: "ma", nama_ekskul: "Arabic Club" },
];
