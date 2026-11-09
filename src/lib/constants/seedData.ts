import { Siswa, Mapel, Ekskul, User, SchoolConfig, MadrasahId, AcademicPeriod } from "@/types";
import { SEED_CLASSES_MTS, SEED_SISWA_MTS } from "./mtsStudents";
import { SEED_CLASSES_MA, SEED_SISWA_MA } from "./maStudents";
import { REAL_TEACHERS_MTS, REAL_TEACHERS_MA } from "./teachersData";

export { SEED_CLASSES_MTS, SEED_SISWA_MTS, SEED_CLASSES_MA, SEED_SISWA_MA, REAL_TEACHERS_MTS, REAL_TEACHERS_MA };

// =====================================================================
// DAFTAR TAHUN AJARAN & SEMESTER (KMA 1503 TAHUN 2025)
// Mendukung Gasal 2026-2027, Genap 2026-2027, Gasal 2027-2028 dst.
// =====================================================================
export const DEFAULT_ACADEMIC_PERIODS: AcademicPeriod[] = [
  { id: "2025/2026-1", tahun: "2025/2026", semester: "1", label: "Gasal 2025/2026" },
  { id: "2025/2026-2", tahun: "2025/2026", semester: "2", label: "Genap 2025/2026" },
  { id: "2026/2027-1", tahun: "2026/2027", semester: "1", label: "Gasal 2026/2027", is_active: true },
  { id: "2026/2027-2", tahun: "2026/2027", semester: "2", label: "Genap 2026/2027" },
  { id: "2027/2028-1", tahun: "2027/2028", semester: "1", label: "Gasal 2027/2028" },
  { id: "2027/2028-2", tahun: "2027/2028", semester: "2", label: "Genap 2027/2028" },
  { id: "2028/2029-1", tahun: "2028/2029", semester: "1", label: "Gasal 2028/2029" },
  { id: "2028/2029-2", tahun: "2028/2029", semester: "2", label: "Genap 2028/2029" },
  { id: "2029/2030-1", tahun: "2029/2030", semester: "1", label: "Gasal 2029/2030" },
  { id: "2029/2030-2", tahun: "2029/2030", semester: "2", label: "Genap 2029/2030" },
  { id: "2030/2031-1", tahun: "2030/2031", semester: "1", label: "Gasal 2030/2031" },
  { id: "2030/2031-2", tahun: "2030/2031", semester: "2", label: "Genap 2030/2031" },
];

// =====================================================================
// KONFIGURASI PROFIL DUA MADRASAH (KMA 1503 TAHUN 2025)
// =====================================================================

export const SCHOOL_CONFIGS: Record<MadrasahId, SchoolConfig> = {
  mts: {
    id: "mts",
    nama_yayasan: "LEMBAGA PENDIDIKAN MA'ARIF NU",
    nomor_sk: "Kemenkumham RI No. AHU-119.AH.01.08. Tahun 2013",
    nama_madrasah: "MTs MA'ARIF NU 2 SUTOJAYAN",
    jenjang: "MTs",
    nsm: "121235050045",
    npsn: "20584989",
    akreditasi: "A",
    alamat: "Jl. Diponegoro No. 105 Kedungbunder, Sutojayan",
    desa: "Kedungbunder",
    kecamatan: "Sutojayan",
    kabupaten: "Blitar",
    provinsi: "Jawa Timur",
    telp: "0342-443278",
    email: "matsamnu2_stj@yahoo.co.id",
    website: "www.nusalodoyo.com",
    logo_url: "/logo-mts.png",
    kepala_madrasah: "Ahmad Ulil Amin, Lc., M.S.I.",
    nip_kepala: "-",
    kota_tanggal: "Blitar",
    tanggal_rapor: "24 Oktober 2026",
    tahun_ajaran_aktif: "2026/2027",
    semester_aktif: "1",
  },
  ma: {
    id: "ma",
    nama_yayasan: "YAYASAN NURUL ULUM BLITAR / LP MA'ARIF NU",
    nomor_sk: "Kemenkumham RI No. AHU-119.AH.01.08. Tahun 2013",
    nama_madrasah: "MA MA'ARIF NURUS SALAM",
    jenjang: "MA",
    nsm: "131235050062",
    npsn: "75727401",
    akreditasi: "Terdaftar Kemenag",
    alamat: "Jl. Diponegoro No. 105 Kedungbunder, Sutojayan",
    desa: "Kedungbunder",
    kecamatan: "Sutojayan",
    kabupaten: "Blitar",
    provinsi: "Jawa Timur",
    telp: "0856-5112-6412",
    email: "nusalodoyo@gmail.com",
    website: "www.nusalodoyo.com",
    logo_url: "/logo-ma.png",
    kepala_madrasah: "M. Zen Pamuji, S.Pd.",
    nip_kepala: "-",
    kota_tanggal: "Blitar",
    tanggal_rapor: "24 Oktober 2026",
    tahun_ajaran_aktif: "2026/2027",
    semester_aktif: "1",
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
// KELAS & SISWA PER MADRASAH (1.280 SISWA MTS & 111 SISWA MA)
// =====================================================================

// Data siswa MTs & MA diexport dari ./mtsStudents dan ./maStudents

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
  { id: "ma-m-23", madrasah_id: "ma", kode_mapel: "EDP", nama_mapel: "English Development Program", kelompok: "C", kkm: 75, fase: "E", urutan: 23 },
  { id: "ma-m-24", madrasah_id: "ma", kode_mapel: "ADP", nama_mapel: "Arabic Development Program", kelompok: "C", kkm: 75, fase: "E", urutan: 24 },
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
