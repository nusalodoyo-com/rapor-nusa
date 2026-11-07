import {
  MadrasahId,
  User,
  Siswa,
  Mapel,
  Ekskul,
  NilaiMapelItem,
  NilaiEkskulItem,
  RaporWaliItem,
  NilaiP5RAItem,
  TeacherAssignment,
  HomeroomAssignment,
  BobotNilai,
  StatusKirimNilai,
  LeggerResponse,
  SchoolConfig,
  SiswaLegger,
} from "@/types";
import {
  SCHOOL_CONFIGS,
  SEED_USERS_MTS,
  SEED_USERS_MA,
  SEED_SISWA_MTS,
  SEED_SISWA_MA,
  SEED_MAPEL_MTS,
  SEED_MAPEL_MA,
  SEED_EKSKUL_MTS,
  SEED_EKSKUL_MA,
  SEED_CLASSES_MTS,
  SEED_CLASSES_MA,
} from "./constants/seedData";
import { supabase, isSupabaseConfigured } from "./supabase/client";

function getStorageKeys(madrasahId: MadrasahId) {
  return {
    USERS: `rapor_nusa_${madrasahId}_users_v3`,
    TEACHERS: `rapor_nusa_${madrasahId}_teachers_v2`,
    ASSIGNMENTS: `rapor_nusa_${madrasahId}_assignments_v2`,
    HOMEROOMS: `rapor_nusa_${madrasahId}_homerooms_v2`,
    BOBOT: `rapor_nusa_${madrasahId}_bobot_v2`,
    STATUS_KIRIM: `rapor_nusa_${madrasahId}_status_kirim_v2`,
    SISWA: `rapor_nusa_${madrasahId}_siswa_v2`,
    MAPEL: `rapor_nusa_${madrasahId}_mapel_v2`,
    EKSKUL: `rapor_nusa_${madrasahId}_ekskul_v2`,
    NILAI: `rapor_nusa_${madrasahId}_nilai_v2`,
    NILAI_EKSKUL: `rapor_nusa_${madrasahId}_nilai_ekskul_v2`,
    RAPOR_WALI: `rapor_nusa_${madrasahId}_rapor_wali_v2`,
    P5RA: `rapor_nusa_${madrasahId}_p5ra_v2`,
    CONFIG: `rapor_nusa_${madrasahId}_config_v2`,
  };
}

function getLocalData<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalData<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

// Inisialisasi awal untuk kedua madrasah
export function initializeLocalStorage(): void {
  if (typeof window === "undefined") return;

  (["mts", "ma"] as MadrasahId[]).forEach(mid => {
    const keys = getStorageKeys(mid);
    const seedUsers = mid === "mts" ? SEED_USERS_MTS : SEED_USERS_MA;
    const seedSiswa = mid === "mts" ? SEED_SISWA_MTS : SEED_SISWA_MA;
    const seedMapel = mid === "mts" ? SEED_MAPEL_MTS : SEED_MAPEL_MA;
    const seedEkskul = mid === "mts" ? SEED_EKSKUL_MTS : SEED_EKSKUL_MA;
    const seedConfig = SCHOOL_CONFIGS[mid];

    // Config Madrasah
    setLocalData(keys.CONFIG, seedConfig);

    // Users: 87 Guru Nyata + Administrator + Kamad
    const curUsers = getLocalData<User[]>(keys.USERS, []);
    if (!localStorage.getItem(keys.USERS) || curUsers.length < seedUsers.length) {
      setLocalData(keys.USERS, seedUsers);
    }

    // Siswa
    if (!localStorage.getItem(keys.SISWA)) {
      setLocalData(keys.SISWA, seedSiswa);
    } else {
      const cur = getLocalData<Siswa[]>(keys.SISWA, []);
      if (cur.length < seedSiswa.length) {
        setLocalData(keys.SISWA, seedSiswa);
      }
    }

    // Mapel (Sesuai KMA 1503 Tahun 2025)
    setLocalData(keys.MAPEL, seedMapel);

    // Ekskul
    if (!localStorage.getItem(keys.EKSKUL)) {
      setLocalData(keys.EKSKUL, seedEkskul);
    }
  });
}

// =====================================================================
// 1. OTENTIKASI PENGGUNA BERDASARKAN KREDENSIAL ASLI
// =====================================================================
export async function loginUser(
  madrasahId: MadrasahId,
  username: string,
  pass: string
): Promise<{
  success: boolean;
  message?: string;
  user?: User;
  isGuru?: boolean;
  isWali?: boolean;
  isAdmin?: boolean;
  isKamad?: boolean;
}> {
  const uInput = username.trim().toLowerCase();
  const pInput = pass.trim();

  const keys = getStorageKeys(madrasahId);
  const defUsers = madrasahId === "mts" ? SEED_USERS_MTS : SEED_USERS_MA;
  const users = getLocalData<User[]>(keys.USERS, defUsers);

  const found = users.find(u => u.username.toLowerCase() === uInput);

  if (!found) {
    const schoolName = madrasahId === "mts" ? "MTs Ma'arif NU 2" : "MA Ma'arif Nurus Salam";
    return {
      success: false,
      message: `Username "${username}" tidak terdaftar di ${schoolName}! Pastikan memilih madrasah yang sesuai atau minta akun ke Operator.`,
    };
  }

  // Verifikasi Password (Default '123' atau '123456' atau custom password)
  if (found.password && found.password !== pInput && pInput !== "123" && pInput !== "123456") {
    return { success: false, message: "Kata sandi salah!" };
  }

  // Cek apakah guru ini ditugaskan sebagai Wali Kelas
  const homerooms = getHomeroomAssignments(madrasahId);
  const myHomeroom = homerooms.find(h => h.wali_guru_id === found.id);

  let effectiveRole = found.role;
  let effectiveKelas = found.kelas_diampu;

  if (myHomeroom) {
    effectiveRole = "guru_walikelas";
    effectiveKelas = myHomeroom.kelas;
  }

  const enrichedUser: User = {
    ...found,
    role: effectiveRole,
    kelas_diampu: effectiveKelas,
  };

  const isAdmin = effectiveRole === "admin";
  const isKamad = effectiveRole === "kamad";
  const isWali = effectiveRole === "wali_kelas" || effectiveRole === "guru_walikelas" || isAdmin;
  const isGuru = effectiveRole === "guru" || effectiveRole === "guru_walikelas" || isAdmin;

  return {
    success: true,
    user: enrichedUser,
    isGuru,
    isWali,
    isAdmin,
    isKamad,
  };
}

// =====================================================================
// 2. MANAJEMEN GURU OLEH OPERATOR (DATA GURU DIKOSONGKAN AWALNYA)
// =====================================================================
export function getTeachers(madrasahId: MadrasahId): User[] {
  const keys = getStorageKeys(madrasahId);
  const defUsers = madrasahId === "mts" ? SEED_USERS_MTS : SEED_USERS_MA;
  const users = getLocalData<User[]>(keys.USERS, defUsers);
  // Filter hanya pengguna dengan role guru / wali (bukan admin root)
  return users.filter(u => u.role !== "admin" && u.role !== "kamad");
}

export function getAllUsers(madrasahId: MadrasahId): User[] {
  const keys = getStorageKeys(madrasahId);
  const defUsers = madrasahId === "mts" ? SEED_USERS_MTS : SEED_USERS_MA;
  return getLocalData<User[]>(keys.USERS, defUsers);
}

export function addTeacher(
  madrasahId: MadrasahId,
  teacher: {
    nama_user: string;
    nip?: string;
    jenis_kelamin?: 'L' | 'P';
    username: string;
    password?: string;
  }
): { success: boolean; message: string; user?: User } {
  const keys = getStorageKeys(madrasahId);
  const all = getAllUsers(madrasahId);

  const cleanUser = teacher.username.trim().toLowerCase();
  if (all.some(u => u.username.toLowerCase() === cleanUser)) {
    return { success: false, message: `Username "${cleanUser}" sudah digunakan!` };
  }

  const newUser: User = {
    id: `guru-${madrasahId}-${Date.now()}`,
    madrasah_id: madrasahId,
    username: cleanUser,
    password: teacher.password || "123456",
    nama_user: teacher.nama_user.trim(),
    nip: teacher.nip?.trim() || "-",
    jenis_kelamin: teacher.jenis_kelamin || "L",
    role: "guru",
    kelas_diampu: "-",
  };

  all.push(newUser);
  setLocalData(keys.USERS, all);
  return { success: true, message: `Guru ${newUser.nama_user} berhasil ditambahkan!`, user: newUser };
}

export function updateTeacher(
  madrasahId: MadrasahId,
  teacher: User
): { success: boolean; message: string } {
  const keys = getStorageKeys(madrasahId);
  const all = getAllUsers(madrasahId);
  const idx = all.findIndex(u => u.id === teacher.id);
  if (idx < 0) return { success: false, message: "Guru tidak ditemukan!" };

  all[idx] = { ...all[idx], ...teacher };
  setLocalData(keys.USERS, all);
  return { success: true, message: `Data guru ${teacher.nama_user} berhasil diperbarui!` };
}

export function deleteTeacher(
  madrasahId: MadrasahId,
  teacherId: string
): { success: boolean; message: string } {
  const keys = getStorageKeys(madrasahId);
  let all = getAllUsers(madrasahId);
  all = all.filter(u => u.id !== teacherId);
  setLocalData(keys.USERS, all);

  // Hapus juga dari penugasan mengajar & wali
  let assignments = getTeacherAssignments(madrasahId).filter(a => a.guru_id !== teacherId);
  saveTeacherAssignments(madrasahId, assignments);

  let homerooms = getHomeroomAssignments(madrasahId).filter(h => h.wali_guru_id !== teacherId);
  saveHomeroomAssignments(madrasahId, homerooms);

  return { success: true, message: "Guru berhasil dihapus dari sistem." };
}

// =====================================================================
// 3. PENUGASAN GURU MENGAJAR (TEACHER ASSIGNMENTS)
// =====================================================================
export function getTeacherAssignments(madrasahId: MadrasahId): TeacherAssignment[] {
  const keys = getStorageKeys(madrasahId);
  return getLocalData<TeacherAssignment[]>(keys.ASSIGNMENTS, []);
}

export function saveTeacherAssignments(
  madrasahId: MadrasahId,
  assignments: TeacherAssignment[]
): void {
  const keys = getStorageKeys(madrasahId);
  setLocalData(keys.ASSIGNMENTS, assignments);
}

export function addTeacherAssignment(
  madrasahId: MadrasahId,
  assignment: Omit<TeacherAssignment, "id" | "madrasah_id">
): { success: boolean; message: string } {
  const list = getTeacherAssignments(madrasahId);
  // Cek duplikasi
  const exist = list.find(
    a => a.kode_mapel === assignment.kode_mapel && a.kelas === assignment.kelas
  );
  if (exist) {
    return {
      success: false,
      message: `Mata pelajaran ${assignment.nama_mapel} di kelas ${assignment.kelas} sudah diampu oleh ${exist.guru_nama}!`,
    };
  }

  const newItem: TeacherAssignment = {
    ...assignment,
    id: `assign-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    madrasah_id: madrasahId,
  };
  list.push(newItem);
  saveTeacherAssignments(madrasahId, list);
  return { success: true, message: `Berhasil menugaskan ${assignment.guru_nama} untuk ${assignment.nama_mapel} di ${assignment.kelas}!` };
}

export function deleteTeacherAssignment(madrasahId: MadrasahId, id: string): void {
  const list = getTeacherAssignments(madrasahId).filter(a => a.id !== id);
  saveTeacherAssignments(madrasahId, list);
}

// =====================================================================
// 4. PENUGASAN WALI KELAS (HOMEROOM ASSIGNMENTS)
// =====================================================================
export function getHomeroomAssignments(madrasahId: MadrasahId): HomeroomAssignment[] {
  const keys = getStorageKeys(madrasahId);
  return getLocalData<HomeroomAssignment[]>(keys.HOMEROOMS, []);
}

export function saveHomeroomAssignments(
  madrasahId: MadrasahId,
  assignments: HomeroomAssignment[]
): void {
  const keys = getStorageKeys(madrasahId);
  setLocalData(keys.HOMEROOMS, assignments);
}

export function setHomeroomAssignment(
  madrasahId: MadrasahId,
  kelas: string,
  waliGuruId: string,
  waliGuruNama: string
): { success: boolean; message: string } {
  const list = getHomeroomAssignments(madrasahId);
  const idx = list.findIndex(h => h.kelas === kelas);

  if (waliGuruId === "") {
    // Kosongkan wali kelas
    if (idx >= 0) list.splice(idx, 1);
  } else {
    const newItem: HomeroomAssignment = {
      id: `wali-${kelas}`,
      madrasah_id: madrasahId,
      kelas,
      wali_guru_id: waliGuruId,
      wali_guru_nama: waliGuruNama,
    };
    if (idx >= 0) list[idx] = newItem;
    else list.push(newItem);
  }

  saveHomeroomAssignments(madrasahId, list);
  return { success: true, message: `Wali kelas ${kelas} berhasil diperbarui!` };
}

// =====================================================================
// 5. BOBOT PENILAIAN GURU (SESUAI VIDEO 2 RDM)
// =====================================================================
export function getBobotNilai(
  madrasahId: MadrasahId,
  guruId: string,
  kodeMapel: string,
  kelas: string
): BobotNilai {
  const keys = getStorageKeys(madrasahId);
  const allBobot = getLocalData<BobotNilai[]>(keys.BOBOT, []);
  const found = allBobot.find(
    b => b.kode_mapel === kodeMapel && b.kelas === kelas
  );
  return (
    found || {
      id: `bobot-${kodeMapel}-${kelas}`,
      madrasah_id: madrasahId,
      guru_id: guruId,
      kode_mapel: kodeMapel,
      kelas: kelas,
      bobot_formatif: 50,
      bobot_sts: 25,
      bobot_sas: 25,
    }
  );
}

export function saveBobotNilai(madrasahId: MadrasahId, bobot: BobotNilai): void {
  const keys = getStorageKeys(madrasahId);
  const allBobot = getLocalData<BobotNilai[]>(keys.BOBOT, []);
  const idx = allBobot.findIndex(
    b => b.kode_mapel === bobot.kode_mapel && b.kelas === bobot.kelas
  );
  if (idx >= 0) allBobot[idx] = bobot;
  else allBobot.push(bobot);
  setLocalData(keys.BOBOT, allBobot);
}

// =====================================================================
// 6. STATUS KIRIM NILAI KE WALI KELAS (SESUAI VIDEO 1 & 2 RDM)
// =====================================================================
export function getStatusKirimNilai(
  madrasahId: MadrasahId,
  kodeMapel: string,
  kelas: string
): StatusKirimNilai {
  const keys = getStorageKeys(madrasahId);
  const allStatus = getLocalData<StatusKirimNilai[]>(keys.STATUS_KIRIM, []);
  const found = allStatus.find(
    s => s.kode_mapel === kodeMapel && s.kelas === kelas
  );
  return (
    found || {
      id: `status-${kodeMapel}-${kelas}`,
      madrasah_id: madrasahId,
      kode_mapel: kodeMapel,
      kelas: kelas,
      is_sent: false,
    }
  );
}

export function kirimNilaiKeWali(
  madrasahId: MadrasahId,
  kodeMapel: string,
  kelas: string,
  guruNama: string
): { success: boolean; message: string } {
  const keys = getStorageKeys(madrasahId);
  const allStatus = getLocalData<StatusKirimNilai[]>(keys.STATUS_KIRIM, []);
  const idx = allStatus.findIndex(
    s => s.kode_mapel === kodeMapel && s.kelas === kelas
  );

  const payload: StatusKirimNilai = {
    id: `status-${kodeMapel}-${kelas}`,
    madrasah_id: madrasahId,
    kode_mapel: kodeMapel,
    kelas: kelas,
    is_sent: true,
    tanggal_kirim: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
    guru_pengampu: guruNama,
  };

  if (idx >= 0) allStatus[idx] = payload;
  else allStatus.push(payload);

  setLocalData(keys.STATUS_KIRIM, allStatus);
  return { success: true, message: `Nilai ${kodeMapel} kelas ${kelas} berhasil DIKIRIM ke Wali Kelas!` };
}

export function batalKirimNilai(
  madrasahId: MadrasahId,
  kodeMapel: string,
  kelas: string
): { success: boolean; message: string } {
  const keys = getStorageKeys(madrasahId);
  const allStatus = getLocalData<StatusKirimNilai[]>(keys.STATUS_KIRIM, []);
  const idx = allStatus.findIndex(
    s => s.kode_mapel === kodeMapel && s.kelas === kelas
  );
  if (idx >= 0) {
    allStatus[idx].is_sent = false;
    allStatus[idx].tanggal_kirim = undefined;
    setLocalData(keys.STATUS_KIRIM, allStatus);
  }
  return { success: true, message: `Pengiriman nilai ${kodeMapel} kelas ${kelas} berhasil DIBATALKAN untuk diedit kembali.` };
}

export function getRekapKirimNilaiKelas(
  madrasahId: MadrasahId,
  kelas: string
): { mapel: Mapel; guru_nama: string; is_sent: boolean; tanggal_kirim?: string }[] {
  const defMapel = madrasahId === "mts" ? SEED_MAPEL_MTS : SEED_MAPEL_MA;
  const assignments = getTeacherAssignments(madrasahId).filter(a => a.kelas === kelas);
  const keys = getStorageKeys(madrasahId);
  const allStatus = getLocalData<StatusKirimNilai[]>(keys.STATUS_KIRIM, []);

  return defMapel.map(m => {
    const assign = assignments.find(a => a.kode_mapel === m.kode_mapel);
    const stat = allStatus.find(s => s.kode_mapel === m.kode_mapel && s.kelas === kelas);
    return {
      mapel: m,
      guru_nama: assign ? assign.guru_nama : "Belum Ditugaskan",
      is_sent: Boolean(stat?.is_sent),
      tanggal_kirim: stat?.tanggal_kirim,
    };
  });
}

// =====================================================================
// 7. DROPDOWNS & SISWA (ROMBEL SORTING & PENCARIAN)
// =====================================================================
export function compareRombel(a: string, b: string): number {
  const parseRombel = (name: string) => {
    const clean = (name || "").trim().toUpperCase();
    const match = clean.match(/^(XII|XI|X|VIII|VII|IX|12|11|10|9|8|7)[.\s\-_]*(.*)$/i);
    if (!match) return { grade: 99, suffix: clean };

    const gradeMap: Record<string, number> = {
      "VII": 7, "7": 7,
      "VIII": 8, "8": 8,
      "IX": 9, "9": 9,
      "X": 10, "10": 10,
      "XI": 11, "11": 11,
      "XII": 12, "12": 12,
    };

    const grade = gradeMap[match[1]] ?? 99;
    const suffix = match[2] || "";
    return { grade, suffix };
  };

  const pa = parseRombel(a);
  const pb = parseRombel(b);

  if (pa.grade !== pb.grade) {
    return pa.grade - pb.grade;
  }
  return pa.suffix.localeCompare(pb.suffix, undefined, { numeric: true, sensitivity: 'base' });
}

export function sortRombelList(classes: string[]): string[] {
  return [...classes].sort(compareRombel);
}

export function getDropdownOptions(madrasahId: MadrasahId) {
  const keys = getStorageKeys(madrasahId);
  const defSiswa = madrasahId === "mts" ? SEED_SISWA_MTS : SEED_SISWA_MA;
  const defMapel = madrasahId === "mts" ? SEED_MAPEL_MTS : SEED_MAPEL_MA;
  const defEkskul = madrasahId === "mts" ? SEED_EKSKUL_MTS : SEED_EKSKUL_MA;
  const defClasses = madrasahId === "mts" ? SEED_CLASSES_MTS : SEED_CLASSES_MA;

  const siswa = getLocalData<Siswa[]>(keys.SISWA, defSiswa);
  const mapel = getLocalData<Mapel[]>(keys.MAPEL, defMapel);
  const ekskul = getLocalData<Ekskul[]>(keys.EKSKUL, defEkskul);

  const rawList = Array.from(new Set(siswa.map(s => s.kelas.trim().toUpperCase())));
  const kelasList = sortRombelList(rawList.length > 0 ? rawList : defClasses);

  return {
    kelas: kelasList,
    mapel: mapel.map(m => ({ kode: m.kode_mapel, nama: m.nama_mapel, kelompok: m.kelompok, kkm: m.kkm })),
    ekskul: ekskul.map(e => e.nama_ekskul),
  };
}

export function getAllSiswa(madrasahId: MadrasahId): Siswa[] {
  const keys = getStorageKeys(madrasahId);
  const defSiswa = madrasahId === "mts" ? SEED_SISWA_MTS : SEED_SISWA_MA;
  return getLocalData<Siswa[]>(keys.SISWA, defSiswa);
}

export function searchSiswa(madrasahId: MadrasahId, query: string): Siswa[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const list = getAllSiswa(madrasahId);
  return list.filter(
    s =>
      s.nama_siswa.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      (s.nisn && s.nisn.toLowerCase().includes(q)) ||
      s.kelas.toLowerCase().includes(q)
  );
}

export function getSiswaByKelas(madrasahId: MadrasahId, kelas: string): Siswa[] {
  const target = kelas.trim().toUpperCase();
  const keys = getStorageKeys(madrasahId);
  const defSiswa = madrasahId === "mts" ? SEED_SISWA_MTS : SEED_SISWA_MA;
  const siswa = getLocalData<Siswa[]>(keys.SISWA, defSiswa);
  return siswa.filter(s => s.kelas.trim().toUpperCase() === target);
}

// =====================================================================
// 8. NILAI MAPEL (FORMATIF & SUMATIF DENGAN BOBOT PENILAIAN)
// =====================================================================
export function getNilaiByKelasMapel(
  madrasahId: MadrasahId,
  tahun: string,
  semester: string,
  kelas: string,
  kodeMapel: string
): NilaiMapelItem[] {
  const siswaList = getSiswaByKelas(madrasahId, kelas);
  const keys = getStorageKeys(madrasahId);
  const allNilai = getLocalData<NilaiMapelItem[]>(keys.NILAI, []);

  const existingClassMapel = allNilai.find(
    n => n.tahun_ajaran === tahun && n.semester === semester && n.kode_mapel.toLowerCase() === kodeMapel.toLowerCase()
  );

  return siswaList.map(siswa => {
    const rec = allNilai.find(
      n =>
        n.tahun_ajaran === tahun &&
        n.semester === semester &&
        n.nis === siswa.nis &&
        n.kode_mapel.toLowerCase() === kodeMapel.toLowerCase()
    );

    return {
      madrasah_id: madrasahId,
      tahun_ajaran: tahun,
      semester: semester,
      nis: siswa.nis,
      nama_siswa: siswa.nama_siswa,
      kode_mapel: kodeMapel,
      materi_1: rec?.materi_1 ?? existingClassMapel?.materi_1 ?? "",
      nilai_harian_1: Number(rec?.nilai_harian_1) || 0,
      materi_2: rec?.materi_2 ?? existingClassMapel?.materi_2 ?? "",
      nilai_harian_2: Number(rec?.nilai_harian_2) || 0,
      materi_3: rec?.materi_3 ?? existingClassMapel?.materi_3 ?? "",
      nilai_harian_3: Number(rec?.nilai_harian_3) || 0,
      materi_4: rec?.materi_4 ?? existingClassMapel?.materi_4 ?? "",
      nilai_harian_4: Number(rec?.nilai_harian_4) || 0,
      nilai_uts: Number(rec?.nilai_uts) || 0,
      nilai_uas: Number(rec?.nilai_uas) || 0,
      nilai_akhir: Number(rec?.nilai_akhir) || 0,
      predikat: rec?.predikat ?? "C",
      catatan_mapel: rec?.catatan_mapel || "",
    };
  });
}

export function simpanNilaiBatch(
  madrasahId: MadrasahId,
  tahun: string,
  semester: string,
  kodeMapel: string,
  dataNilai: NilaiMapelItem[],
  bobot?: BobotNilai
): { success: boolean; message: string } {
  try {
    const keys = getStorageKeys(madrasahId);
    let allNilai = getLocalData<NilaiMapelItem[]>(keys.NILAI, []);

    const wFormatif = (bobot?.bobot_formatif || 50) / 100;
    const wSts = (bobot?.bobot_sts || 25) / 100;
    const wSas = (bobot?.bobot_sas || 25) / 100;

    dataNilai.forEach(item => {
      const h1 = Number(item.nilai_harian_1) || 0;
      const h2 = Number(item.nilai_harian_2) || 0;
      const h3 = Number(item.nilai_harian_3) || 0;
      const h4 = Number(item.nilai_harian_4) || 0;

      let count = 0;
      let tot = 0;
      if (item.materi_1 || h1 > 0) { tot += h1; count++; }
      if (item.materi_2 || h2 > 0) { tot += h2; count++; }
      if (item.materi_3 || h3 > 0) { tot += h3; count++; }
      if (item.materi_4 || h4 > 0) { tot += h4; count++; }

      const avg = count > 0 ? tot / count : (h1 + h2 + h3 + h4) / 4;
      const uts = Number(item.nilai_uts) || 0;
      const uas = Number(item.nilai_uas) || 0;

      const na = Math.round((avg * wFormatif) + (uts * wSts) + (uas * wSas));
      const predikat: "A" | "B" | "C" | "D" = na >= 90 ? "A" : na >= 80 ? "B" : na >= 70 ? "C" : "D";

      const enriched: NilaiMapelItem = {
        ...item,
        madrasah_id: madrasahId,
        tahun_ajaran: tahun,
        semester: semester,
        kode_mapel: kodeMapel,
        nilai_akhir: na,
        predikat: predikat,
      };

      const idx = allNilai.findIndex(
        n =>
          n.tahun_ajaran === tahun &&
          n.semester === semester &&
          n.nis === item.nis &&
          n.kode_mapel.toLowerCase() === kodeMapel.toLowerCase()
      );

      if (idx >= 0) allNilai[idx] = enriched;
      else allNilai.push(enriched);
    });

    setLocalData(keys.NILAI, allNilai);
    return { success: true, message: `Berhasil menyimpan nilai ${dataNilai.length} siswa!` };
  } catch (err: any) {
    return { success: false, message: "Gagal menyimpan: " + err.toString() };
  }
}

// =====================================================================
// 9. NILAI EKSTRAKURIKULER
// =====================================================================
export function getNilaiEkskulByKelas(
  madrasahId: MadrasahId,
  tahun: string,
  semester: string,
  kelas: string,
  namaEkskul: string
): NilaiEkskulItem[] {
  const siswaList = getSiswaByKelas(madrasahId, kelas);
  const keys = getStorageKeys(madrasahId);
  const allEkskul = getLocalData<NilaiEkskulItem[]>(keys.NILAI_EKSKUL, []);

  return siswaList.map(siswa => {
    const rec = allEkskul.find(
      e =>
        e.tahun_ajaran === tahun &&
        e.semester === semester &&
        e.nis === siswa.nis &&
        e.nama_ekskul.toLowerCase() === namaEkskul.toLowerCase()
    );

    return {
      madrasah_id: madrasahId,
      tahun_ajaran: tahun,
      semester: semester,
      nis: siswa.nis,
      nama_siswa: siswa.nama_siswa,
      nama_ekskul: namaEkskul,
      predikat: rec?.predikat || "Baik",
      keterangan: rec?.keterangan || "",
      checked: Boolean(rec && rec.predikat),
    };
  });
}

export function simpanNilaiEkskulBatch(
  madrasahId: MadrasahId,
  tahun: string,
  semester: string,
  namaEkskul: string,
  dataNilai: NilaiEkskulItem[]
): { success: boolean; message: string } {
  try {
    const keys = getStorageKeys(madrasahId);
    let allEkskul = getLocalData<NilaiEkskulItem[]>(keys.NILAI_EKSKUL, []);

    dataNilai.forEach(item => {
      const idx = allEkskul.findIndex(
        e =>
          e.tahun_ajaran === tahun &&
          e.semester === semester &&
          e.nis === item.nis &&
          e.nama_ekskul.toLowerCase() === namaEkskul.toLowerCase()
      );

      const payload: NilaiEkskulItem = {
        madrasah_id: madrasahId,
        tahun_ajaran: tahun,
        semester: semester,
        nis: item.nis,
        nama_siswa: item.nama_siswa,
        nama_ekskul: namaEkskul,
        predikat: item.predikat || "Baik",
        keterangan: item.keterangan || "",
      };

      if (idx >= 0) allEkskul[idx] = payload;
      else allEkskul.push(payload);
    });

    setLocalData(keys.NILAI_EKSKUL, allEkskul);
    return { success: true, message: `Nilai ekskul ${dataNilai.length} siswa berhasil disimpan!` };
  } catch (err: any) {
    return { success: false, message: "Gagal: " + err.toString() };
  }
}

// =====================================================================
// 10. RAPOR WALI KELAS (PRESENSI & KEPUTUSAN)
// =====================================================================
export function getRaporWaliByKelas(
  madrasahId: MadrasahId,
  tahun: string,
  semester: string,
  kelas: string
): RaporWaliItem[] {
  const siswaList = getSiswaByKelas(madrasahId, kelas);
  const keys = getStorageKeys(madrasahId);
  const allWali = getLocalData<RaporWaliItem[]>(keys.RAPOR_WALI, []);

  return siswaList.map(siswa => {
    const rec = allWali.find(
      w => w.tahun_ajaran === tahun && w.semester === semester && w.nis === siswa.nis
    );
    return {
      madrasah_id: madrasahId,
      tahun_ajaran: tahun,
      semester: semester,
      nis: siswa.nis,
      nama_siswa: siswa.nama_siswa,
      sakit: Number(rec?.sakit) || 0,
      izin: Number(rec?.izin) || 0,
      tanpa_keterangan: Number(rec?.tanpa_keterangan) || 0,
      catatan_wali: rec?.catatan_wali || "",
      keputusan: rec?.keputusan || "-",
    };
  });
}

export function simpanRaporWaliBatch(
  madrasahId: MadrasahId,
  tahun: string,
  semester: string,
  dataWali: RaporWaliItem[]
): { success: boolean; message: string } {
  try {
    const keys = getStorageKeys(madrasahId);
    let allWali = getLocalData<RaporWaliItem[]>(keys.RAPOR_WALI, []);

    dataWali.forEach(item => {
      const idx = allWali.findIndex(
        w => w.tahun_ajaran === tahun && w.semester === semester && w.nis === item.nis
      );

      const payload: RaporWaliItem = {
        madrasah_id: madrasahId,
        tahun_ajaran: tahun,
        semester: semester,
        nis: item.nis,
        nama_siswa: item.nama_siswa,
        sakit: Number(item.sakit) || 0,
        izin: Number(item.izin) || 0,
        tanpa_keterangan: Number(item.tanpa_keterangan) || 0,
        catatan_wali: item.catatan_wali || "",
        keputusan: item.keputusan || "-",
      };

      if (idx >= 0) allWali[idx] = payload;
      else allWali.push(payload);
    });

    setLocalData(keys.RAPOR_WALI, allWali);
    return { success: true, message: `Data Rapor Wali Kelas disimpan untuk ${dataWali.length} siswa!` };
  } catch (err: any) {
    return { success: false, message: "Gagal: " + err.toString() };
  }
}

// =====================================================================
// 11. KOKURIKULER P5RA & KBC (KURIKULUM BERBASIS CINTA KMA 1503/2025)
// =====================================================================
export function getNilaiP5RA(
  madrasahId: MadrasahId,
  kelas: string
): NilaiP5RAItem[] {
  const siswaList = getSiswaByKelas(madrasahId, kelas);
  const keys = getStorageKeys(madrasahId);
  const allP5 = getLocalData<NilaiP5RAItem[]>(keys.P5RA, []);

  return siswaList.map(siswa => {
    const rec = allP5.find(p => p.nis === siswa.nis);
    return {
      madrasah_id: madrasahId,
      tahun_ajaran: "2025/2026",
      semester: "1",
      nis: siswa.nis,
      nama_siswa: siswa.nama_siswa,
      tema: rec?.tema || "Kearifan Lokal & Moderasi Beragama",
      dimensi: rec?.dimensi || "Cinta Allah & Rasul",
      predikat: rec?.predikat || "BSB",
      deskripsi: rec?.deskripsi || "Menunjukkan pembiasaan akhlak terpuji dan kepedulian lingkungan yang sangat baik.",
    };
  });
}

export function saveNilaiP5RABatch(
  madrasahId: MadrasahId,
  data: NilaiP5RAItem[]
): { success: boolean; message: string } {
  const keys = getStorageKeys(madrasahId);
  let allP5 = getLocalData<NilaiP5RAItem[]>(keys.P5RA, []);

  data.forEach(item => {
    const idx = allP5.findIndex(p => p.nis === item.nis);
    if (idx >= 0) allP5[idx] = item;
    else allP5.push(item);
  });

  setLocalData(keys.P5RA, allP5);
  return { success: true, message: `Penilaian Kokurikuler P5RA (KBC) ${data.length} siswa tersimpan!` };
}

// =====================================================================
// 12. LEGGER KELAS (RANKING & RATA-RATA KELAS OTOMATIS)
// =====================================================================
export function getLeggerDataByKelas(
  madrasahId: MadrasahId,
  tahun: string,
  semester: string,
  kelas: string
): LeggerResponse {
  const siswaList = getSiswaByKelas(madrasahId, kelas);
  if (!siswaList.length) {
    return { success: false, message: "Data siswa di kelas ini tidak ditemukan.", mapel: [], siswa: [] };
  }

  const keys = getStorageKeys(madrasahId);
  const defMapel = madrasahId === "mts" ? SEED_MAPEL_MTS : SEED_MAPEL_MA;
  const mapelList = getLocalData<Mapel[]>(keys.MAPEL, defMapel);
  const allNilai = getLocalData<NilaiMapelItem[]>(keys.NILAI, []);
  const allWali = getLocalData<RaporWaliItem[]>(keys.RAPOR_WALI, []);
  const allEkskul = getLocalData<NilaiEkskulItem[]>(keys.NILAI_EKSKUL, []);

  // Ekstraksi nilai per siswa
  const rawSiswa: Omit<SiswaLegger, "ranking">[] = siswaList.map(siswa => {
    const mapelDetails: Record<string, any> = {};
    const scores: Record<string, number> = {};
    let totalScore = 0;
    let mapelCount = 0;

    mapelList.forEach(m => {
      const rec = allNilai.find(
        n =>
          n.tahun_ajaran === tahun &&
          n.semester === semester &&
          n.nis === siswa.nis &&
          n.kode_mapel.toLowerCase() === m.kode_mapel.toLowerCase()
      );

      const h1 = Number(rec?.nilai_harian_1) || 0;
      const h2 = Number(rec?.nilai_harian_2) || 0;
      const h3 = Number(rec?.nilai_harian_3) || 0;
      const h4 = Number(rec?.nilai_harian_4) || 0;

      let count = 0;
      let tot = 0;
      if (rec?.materi_1 || h1 > 0) { tot += h1; count++; }
      if (rec?.materi_2 || h2 > 0) { tot += h2; count++; }
      if (rec?.materi_3 || h3 > 0) { tot += h3; count++; }
      if (rec?.materi_4 || h4 > 0) { tot += h4; count++; }

      const mat: string[] = [];
      if (rec?.materi_1) mat.push(rec.materi_1);
      if (rec?.materi_2) mat.push(rec.materi_2);
      if (rec?.materi_3) mat.push(rec.materi_3);
      if (rec?.materi_4) mat.push(rec.materi_4);

      const na = Number(rec?.nilai_akhir) || 0;
      const predikat = rec?.predikat || (na >= 90 ? "A" : na >= 80 ? "B" : na >= 70 ? "C" : "D");

      mapelDetails[m.kode_mapel] = {
        lm: count > 0 ? Math.round(tot / count) : 0,
        sts: Number(rec?.nilai_uts) || 0,
        sas: Number(rec?.nilai_uas) || 0,
        lingkup_materi: mat.join("; ") || "-",
        nilai_akhir: na,
        predikat: predikat,
      };

      scores[m.kode_mapel] = na;
      if (na > 0) {
        totalScore += na;
        mapelCount++;
      }
    });

    const averageScore = mapelCount > 0 ? Math.round(totalScore / mapelCount) : 0;

    const rw = allWali.find(
      w => w.tahun_ajaran === tahun && w.semester === semester && w.nis === siswa.nis
    );

    const eks = allEkskul
      .filter(
        e =>
          e.tahun_ajaran === tahun &&
          e.semester === semester &&
          e.nis === siswa.nis &&
          e.nama_ekskul &&
          e.predikat
      )
      .map(e => ({
        nama: e.nama_ekskul,
        nilai: e.predikat,
        materi: e.keterangan || "-",
      }));

    return {
      nis: siswa.nis,
      nama: siswa.nama_siswa,
      scores,
      mapelDetails,
      totalScore,
      averageScore,
      ekskul: eks,
      sakit: rw?.sakit || 0,
      izin: rw?.izin || 0,
      alpha: rw?.tanpa_keterangan || 0,
      catatan: rw?.catatan_wali || "",
      keputusan: rw?.keputusan || "-",
    };
  });

  // Hitung Peringkat (Ranking) berdasarkan totalScore
  const sortedScores = [...rawSiswa].sort((a, b) => b.totalScore - a.totalScore);
  const dataSiswa: SiswaLegger[] = rawSiswa.map(s => {
    const rank = sortedScores.findIndex(item => item.nis === s.nis) + 1;
    return { ...s, ranking: rank };
  });

  // Hitung Rata-rata Kelas per Mata Pelajaran
  const classAverageMapel: Record<string, number> = {};
  mapelList.forEach(m => {
    let sum = 0;
    let count = 0;
    dataSiswa.forEach(s => {
      const val = s.scores[m.kode_mapel];
      if (val > 0) {
        sum += val;
        count++;
      }
    });
    classAverageMapel[m.kode_mapel] = count > 0 ? Math.round(sum / count) : 0;
  });

  let totalAvgSum = 0;
  let totalAvgCount = 0;
  Object.values(classAverageMapel).forEach(v => {
    if (v > 0) {
      totalAvgSum += v;
      totalAvgCount++;
    }
  });
  const totalClassAverage = totalAvgCount > 0 ? Math.round(totalAvgSum / totalAvgCount) : 0;

  return {
    success: true,
    mapel: mapelList,
    siswa: dataSiswa,
    classAverageMapel,
    totalClassAverage,
  };
}

export function getSchoolConfig(madrasahId: MadrasahId): SchoolConfig {
  const keys = getStorageKeys(madrasahId);
  return getLocalData<SchoolConfig>(keys.CONFIG, SCHOOL_CONFIGS[madrasahId]);
}

export function updateSchoolConfig(madrasahId: MadrasahId, config: SchoolConfig): void {
  const keys = getStorageKeys(madrasahId);
  setLocalData(keys.CONFIG, config);
}

export function saveUserTtd(madrasahId: MadrasahId, userId: string, ttdBase64: string): void {
  const keys = getStorageKeys(madrasahId);
  const defUsers = madrasahId === "mts" ? SEED_USERS_MTS : SEED_USERS_MA;
  const users = getLocalData<User[]>(keys.USERS, defUsers);
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx].ttd_url = ttdBase64;
    setLocalData(keys.USERS, users);
  }
}
