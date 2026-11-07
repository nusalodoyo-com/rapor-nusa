export type MadrasahId = 'mts' | 'ma';

export type UserRole = 'admin' | 'guru' | 'wali_kelas' | 'guru_walikelas' | 'kamad';

export interface User {
  id: string;
  madrasah_id: MadrasahId;
  username: string;
  password?: string;
  nama_user: string;
  nip?: string;
  jenis_kelamin?: 'L' | 'P';
  role: UserRole;
  kelas_diampu?: string; // Jika wali kelas
  ttd_url?: string;
}

// Penugasan Guru Mengajar (Admin Setting)
export interface TeacherAssignment {
  id: string;
  madrasah_id: MadrasahId;
  guru_id: string;
  guru_nama: string;
  kode_mapel: string;
  nama_mapel: string;
  kelas: string;
}

// Penugasan Wali Kelas (Admin Setting)
export interface HomeroomAssignment {
  id: string;
  madrasah_id: MadrasahId;
  kelas: string;
  wali_guru_id: string;
  wali_guru_nama: string;
}

// Pengaturan Bobot Penilaian Guru
export interface BobotNilai {
  id: string;
  madrasah_id: MadrasahId;
  guru_id: string;
  kode_mapel: string;
  kelas: string;
  bobot_formatif: number; // default 50
  bobot_sts: number;      // default 25
  bobot_sas: number;      // default 25
}

// Status Kirim Nilai dari Guru Mapel ke Wali Kelas
export interface StatusKirimNilai {
  id: string;
  madrasah_id: MadrasahId;
  kode_mapel: string;
  kelas: string;
  is_sent: boolean;
  tanggal_kirim?: string;
  guru_pengampu?: string;
}

export interface Siswa {
  id: string;
  madrasah_id: MadrasahId;
  nis: string;
  nisn: string;
  nama_siswa: string;
  kelas: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir?: string;
  tanggal_lahir?: string;
  alamat?: string;
}

// Struktur Mata Pelajaran KMA 1503 Tahun 2025
export interface Mapel {
  id: string;
  madrasah_id: MadrasahId;
  kode_mapel: string;
  nama_mapel: string;
  kelompok: 'A' | 'B' | 'C'; // A: PAI & B. Arab, B: Umum, C: Pilihan / Mulok KMA 1503
  kkm: number;
  fase: 'D' | 'E' | 'F'; // D: MTs, E: MA Kelas X, F: MA Kelas XI-XII
  urutan?: number;
}

export interface Ekskul {
  id: string;
  madrasah_id: MadrasahId;
  nama_ekskul: string;
  pembina?: string;
}

export interface NilaiMapelItem {
  id?: string;
  madrasah_id: MadrasahId;
  tahun_ajaran: string;
  semester: string;
  nis: string;
  nama_siswa: string;
  kode_mapel: string;
  materi_1?: string;
  nilai_harian_1: number;
  materi_2?: string;
  nilai_harian_2: number;
  materi_3?: string;
  nilai_harian_3: number;
  materi_4?: string;
  nilai_harian_4: number;
  nilai_uts: number; // STS
  nilai_uas: number; // SAS
  nilai_akhir?: number; // NA
  predikat?: 'A' | 'B' | 'C' | 'D';
  catatan_mapel?: string;
}

export interface NilaiEkskulItem {
  id?: string;
  madrasah_id: MadrasahId;
  tahun_ajaran: string;
  semester: string;
  nis: string;
  nama_siswa: string;
  nama_ekskul: string;
  predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  keterangan: string;
  checked?: boolean;
}

export interface RaporWaliItem {
  id?: string;
  madrasah_id: MadrasahId;
  tahun_ajaran: string;
  semester: string;
  nis: string;
  nama_siswa: string;
  sakit: number;
  izin: number;
  tanpa_keterangan: number;
  catatan_wali: string;
  keputusan: '-' | 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Tidak Lulus';
}

// Kokurikuler P5RA & KBC (Kurikulum Berbasis Cinta - Panca Cinta) KMA 1503/2025
export interface NilaiP5RAItem {
  id?: string;
  madrasah_id: MadrasahId;
  tahun_ajaran: string;
  semester: string;
  nis: string;
  nama_siswa: string;
  tema: string;
  dimensi: 'Cinta Allah & Rasul' | 'Cinta Ilmu' | 'Cinta Lingkungan' | 'Cinta Sesama' | 'Cinta Tanah Air';
  predikat: 'MB' | 'BSh' | 'BSB' | 'SAB'; // Mulai Berkembang, Berkembang Sesuai Harapan, Berkembang Sangat Baik, Sangat Amat Berkembang
  deskripsi: string;
}

export interface MapelDetail {
  lm: number; // rata-rata formatif (harian)
  sts: number;
  sas: number;
  lingkup_materi: string;
  nilai_akhir: number;
  predikat: string;
}

export interface SiswaLegger {
  nis: string;
  nama: string;
  scores: Record<string, number>; // kode_mapel -> nilai_akhir
  mapelDetails: Record<string, MapelDetail>;
  totalScore: number;
  averageScore: number;
  ranking: number;
  ekskul: { nama: string; nilai: string; materi: string }[];
  sakit: number;
  izin: number;
  alpha: number;
  catatan: string;
  keputusan: string;
}

export interface LeggerResponse {
  success: boolean;
  message?: string;
  mapel: Mapel[];
  siswa: SiswaLegger[];
  classAverageMapel?: Record<string, number>;
  totalClassAverage?: number;
}

export interface SchoolConfig {
  id: MadrasahId;
  nama_yayasan: string;
  nomor_sk: string;
  nama_madrasah: string;
  jenjang: 'MTs' | 'MA';
  nsm: string;
  npsn: string;
  akreditasi: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kepala_madrasah: string;
  nip_kepala: string;
  kota_tanggal: string;
  tanggal_rapor: string;
  logo_url?: string;
  stempel_url?: string;
}
