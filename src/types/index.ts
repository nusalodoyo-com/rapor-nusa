export type UserRole = 'admin' | 'guru' | 'wali_kelas' | 'guru_walikelas' | 'ekstra' | 'kamad';

export interface User {
  id: string;
  username: string;
  nama_user: string;
  nip?: string;
  role: string; // e.g. "guru", "wali_kelas", "guru_walikelas", "admin"
  kelas_diampu?: string;
  ttd_url?: string;
}

export interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nama_siswa: string;
  kelas: string;
  jenis_kelamin: 'L' | 'P';
}

export interface Mapel {
  id: string;
  kode_mapel: string;
  nama_mapel: string;
  kelompok?: string;
}

export interface Ekskul {
  id: string;
  nama_ekskul: string;
  pembina?: string;
}

export interface NilaiMapelItem {
  id?: string;
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

export interface MapelDetail {
  lm: number; // rata-rata lingkup materi (formatif)
  sts: number;
  sas: number;
  lingkup_materi: string;
}

export interface SiswaLegger {
  nis: string;
  nama: string;
  scores: Record<string, number>; // kode_mapel -> nilai_akhir
  mapelDetails: Record<string, MapelDetail>;
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
}

export interface SchoolConfig {
  nama_yayasan: string;
  nomor_sk: string;
  nama_madrasah: string;
  alamat: string;
  kepala_madrasah: string;
  nip_kepala: string;
  kota_tanggal: string;
  logo_url?: string;
}
