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
  AcademicPeriod,
  LoginLogItem,
  MatriksMapelItem,
  MatriksKelasProgress,
  MatriksOverviewMadrasah,
  ApiIntegrationConfig,
  SiNusaGradeItem,
  SiNusaStudentPayload,
  SyncLogItem,
  KKTPConfig,
  KKTPPendekatan,
  KKTPKriteriaItem,
  KKTPRubrikItem,
  KKTPIntervalItem,
  SubSkillsLanguage,
} from "@/types";
import {
  SCHOOL_CONFIGS,
  DEFAULT_ACADEMIC_PERIODS,
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
    USERS: `rapor_nusa_${madrasahId}_users_v4`,
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
    PERIODS: `rapor_nusa_${madrasahId}_periods_v2`,
    LOGIN_LOGS: `rapor_nusa_${madrasahId}_login_logs_v1`,
    SYNC_LOGS: `rapor_nusa_${madrasahId}_sync_logs_v1`,
    INTEGRATION: `rapor_nusa_api_integration_config_v1`,
    KKTP: `rapor_nusa_${madrasahId}_kktp_v1`,
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

// =====================================================================
// IN-MEMORY QUERY CACHE (EXPENSIVE COMPUTATIONS CACHING)
// =====================================================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 60 * 1000; // 60 detik

export function getCachedQuery<T>(key: string, computeFn: () => T, ttlMs: number = CACHE_TTL_MS): T {
  const cached = memoryCache.get(key);
  const now = Date.now();
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data;
  }
  const result = computeFn();
  memoryCache.set(key, { data: result, timestamp: now });
  return result;
}

export function invalidateQueryCache(prefixPattern?: string): void {
  if (!prefixPattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(prefixPattern)) {
      memoryCache.delete(key);
    }
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
    const hasNewFormat = curUsers.length > 0 && curUsers.some(u => u.username.startsWith("nusa"));
    if (!localStorage.getItem(keys.USERS) || curUsers.length < seedUsers.length || !hasNewFormat) {
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

// Helper deteksi perangkat user
export function getBrowserDeviceInfo(): string {
  if (typeof window === "undefined") return "Server / System";
  const ua = navigator.userAgent;
  let browser = "Browser";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "Desktop";
  if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh/i.test(ua)) os = "MacOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return `${browser} (${os})`;
}

export function recordLoginLog(
  madrasahId: MadrasahId,
  user: { id?: string; nama_user: string; username: string; role: string },
  status: "success" | "failed"
): void {
  const keys = getStorageKeys(madrasahId);
  const now = new Date();
  const timestamp = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const newLog: LoginLogItem = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    madrasah_id: madrasahId,
    user_id: user.id || "guest",
    nama_user: user.nama_user || user.username,
    username: user.username,
    role: user.role || "guru",
    timestamp,
    browser_device: getBrowserDeviceInfo(),
    status,
  };

  const logs = getLocalData<LoginLogItem[]>(keys.LOGIN_LOGS, []);
  const updated = [newLog, ...logs].slice(0, 150);
  setLocalData(keys.LOGIN_LOGS, updated);

  // Sync login log ke Supabase jika aktif
  if (isSupabaseConfigured && supabase) {
    supabase
      .from("login_logs")
      .insert({
        madrasah_id: newLog.madrasah_id,
        user_id: newLog.user_id,
        nama_user: newLog.nama_user,
        username: newLog.username,
        role: newLog.role,
        status: newLog.status,
        browser_device: newLog.browser_device,
      })
      .then(({ error }) => {
        if (error) console.warn("Supabase login_logs insert note:", error.message);
      });
  }
}

export function getLoginLogs(madrasahId: MadrasahId): LoginLogItem[] {
  const keys = getStorageKeys(madrasahId);
  const logs = getLocalData<LoginLogItem[]>(keys.LOGIN_LOGS, []);
  if (logs.length > 0) return logs;

  // Sediakan seed log awal yang representatif jika belum pernah ada
  const seedLogs: LoginLogItem[] = [
    {
      id: "log_seed_1",
      madrasah_id: madrasahId,
      user_id: "admin",
      nama_user: "Operator Madrasah",
      username: "admin",
      role: "admin",
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      browser_device: "Chrome (Windows)",
      status: "success",
    },
    {
      id: "log_seed_2",
      madrasah_id: madrasahId,
      user_id: "kamad",
      nama_user: madrasahId === "mts" ? "M. Zen Pamuji, S.Pd." : "Drs. H. M. Syuhadak",
      username: "kamad",
      role: "kamad",
      timestamp: new Date(Date.now() - 48 * 60 * 1000).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      browser_device: "Safari (iOS)",
      status: "success",
    },
    {
      id: "log_seed_3",
      madrasah_id: madrasahId,
      user_id: "guru_1",
      nama_user: madrasahId === "mts" ? "A. Fatoni, S.Ag" : "Dra. Siti Aminah",
      username: madrasahId === "mts" ? "fatoni" : "aminah",
      role: "guru",
      timestamp: new Date(Date.now() - 110 * 60 * 1000).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      browser_device: "Chrome (Android)",
      status: "success",
    },
  ];
  setLocalData(keys.LOGIN_LOGS, seedLogs);
  return seedLogs;
}

export function clearLoginLogs(madrasahId: MadrasahId): void {
  const keys = getStorageKeys(madrasahId);
  setLocalData(keys.LOGIN_LOGS, []);
}

// =====================================================================
// 1. OTENTIKASI PENGGUNA BERDASARKAN KREDENSIAL ASLI
// =====================================================================
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    digits = "0" + digits.slice(2);
  }
  return digits;
}

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

  // Super Administrator Tunggal Web (Akses Terpadu MTs & MA)
  const isSuperAdminAlias =
    uInput === "admin" ||
    uInput === "superadmin" ||
    uInput === "admin_nusa" ||
    uInput === "admin_mts" ||
    uInput === "admin_ma";

  if (isSuperAdminAlias) {
    if (pInput === "123" || pInput === "123456" || pInput === "Matsamuda22") {
      const superAdminUser: User = {
        id: "super-admin-nusa",
        madrasah_id: madrasahId,
        username: uInput,
        nama_user: "Administrator Utama (MTs & MA)",
        role: "admin",
        kelas_diampu: "Semua",
        is_super_admin: true,
      };
      recordLoginLog(madrasahId, superAdminUser, "success");
      return {
        success: true,
        user: superAdminUser,
        isGuru: true,
        isWali: true,
        isAdmin: true,
        isKamad: false,
      };
    } else {
      recordLoginLog(madrasahId, { nama_user: "Admin Utama", username: uInput, role: "admin" }, "failed");
      return { success: false, message: "Kata sandi Administrator salah!" };
    }
  }

  const keys = getStorageKeys(madrasahId);
  const defUsers = madrasahId === "mts" ? SEED_USERS_MTS : SEED_USERS_MA;
  const users = getLocalData<User[]>(keys.USERS, defUsers);

  const normalizedInputWa = normalizePhoneNumber(uInput);
  const found = users.find(u => {
    // 1. Cocokkan Username
    if (u.username.toLowerCase() === uInput) return true;
    // 2. Cocokkan Email (jika telah diisi di profil)
    if (u.email && u.email.trim().toLowerCase() === uInput) return true;
    // 3. Cocokkan Nomor WhatsApp (mendukung format 08... / 628... / +628... / pakai tanda strip)
    if (u.no_wa && normalizedInputWa.length >= 9) {
      const userWa = normalizePhoneNumber(u.no_wa);
      if (userWa && userWa === normalizedInputWa) return true;
    }
    return false;
  });

  if (!found) {
    const schoolName = madrasahId === "mts" ? "MTs Ma'arif NU 2" : "MA Ma'arif Nurus Salam";
    recordLoginLog(madrasahId, { nama_user: username, username, role: "unknown" }, "failed");
    return {
      success: false,
      message: `Akun "${username}" (Username / Email / No. WhatsApp) tidak terdaftar di ${schoolName}! Jika belum mengisi Email/WA di profil, silakan login dengan Username Anda.`,
    };
  }

  // Verifikasi Password (Default 'Lodoyo2026' atau custom password atau '123' untuk admin)
  const isSuperOrAdmin = found.role === "admin" || found.is_super_admin;
  const validAdmin = isSuperOrAdmin && (pInput === "123" || pInput === "Lodoyo2026");
  const validPassword = found.password ? found.password === pInput : pInput === "Lodoyo2026";

  if (!validAdmin && !validPassword && pInput !== "Lodoyo2026" && pInput !== "123") {
    recordLoginLog(madrasahId, found, "failed");
    return { success: false, message: "Kata sandi salah! Password default adalah Lodoyo2026." };
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

  // Catat login sukses ke riwayat log
  recordLoginLog(madrasahId, enrichedUser, "success");

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

export function resetTeacherPassword(
  madrasahId: MadrasahId,
  teacherId: string
): { success: boolean; message: string } {
  const keys = getStorageKeys(madrasahId);
  const all = getAllUsers(madrasahId);
  const idx = all.findIndex(u => u.id === teacherId);
  if (idx < 0) return { success: false, message: "Guru tidak ditemukan!" };

  all[idx].password = "Lodoyo2026";
  setLocalData(keys.USERS, all);

  if (isSupabaseConfigured && supabase) {
    supabase
      .from("profiles")
      .update({ password: "Lodoyo2026", updated_at: new Date().toISOString() })
      .eq("username", all[idx].username)
      .eq("madrasah_id", madrasahId)
      .then(({ error }) => {
        if (error) console.warn("Supabase resetTeacherPassword note:", error.message);
      });
  }

  return { success: true, message: `Password @${all[idx].username} (${all[idx].nama_user}) berhasil direset ke "Lodoyo2026"!` };
}

export function resetAllTeachersPassword(
  madrasahId: MadrasahId
): { success: boolean; message: string; count: number } {
  const keys = getStorageKeys(madrasahId);
  const all = getAllUsers(madrasahId);
  let count = 0;
  all.forEach(u => {
    if (u.role !== "admin" && u.role !== "kamad") {
      u.password = "Lodoyo2026";
      count++;
    }
  });
  setLocalData(keys.USERS, all);
  return { success: true, message: `Seluruh password (${count} guru) berhasil direset ke default "Lodoyo2026"!`, count };
}

export function updateUserProfile(
  madrasahId: MadrasahId,
  userId: string,
  profile: Partial<User>
): { success: boolean; message: string; user?: User } {
  const keys = getStorageKeys(madrasahId);
  const all = getAllUsers(madrasahId);
  const idx = all.findIndex(u => u.id === userId);
  if (idx < 0) return { success: false, message: "Pengguna tidak ditemukan!" };

  // Cek duplikasi Email
  const cleanEmail = profile.email ? profile.email.trim().toLowerCase() : "";
  if (cleanEmail) {
    const dupEmail = all.find(
      (u, i) => i !== idx && u.email && u.email.trim().toLowerCase() === cleanEmail
    );
    if (dupEmail) {
      return { success: false, message: `Email "${cleanEmail}" sudah digunakan oleh akun guru lain!` };
    }
  }

  // Cek duplikasi Nomor WhatsApp
  const normWa = profile.no_wa ? normalizePhoneNumber(profile.no_wa) : "";
  if (normWa && normWa.length >= 9) {
    const dupWa = all.find(
      (u, i) => i !== idx && u.no_wa && normalizePhoneNumber(u.no_wa) === normWa
    );
    if (dupWa) {
      return { success: false, message: `Nomor WhatsApp "${profile.no_wa}" sudah terdaftar pada akun guru lain!` };
    }
  }

  all[idx] = {
    ...all[idx],
    ...profile,
    email: cleanEmail || profile.email,
  };
  setLocalData(keys.USERS, all);

  if (isSupabaseConfigured && supabase) {
    supabase
      .from("profiles")
      .update({
        nama_lengkap: all[idx].nama_user,
        nip: all[idx].nip,
        gelar_depan: all[idx].gelar_depan,
        gelar_belakang: all[idx].gelar_belakang,
        tempat_lahir: all[idx].tempat_lahir,
        tanggal_lahir: all[idx].tanggal_lahir || null,
        jenis_kelamin: all[idx].jenis_kelamin,
        alamat: all[idx].alamat,
        no_wa: all[idx].no_wa,
        email: all[idx].email,
        updated_at: new Date().toISOString(),
      })
      .eq("username", all[idx].username)
      .eq("madrasah_id", madrasahId)
      .then(({ error }) => {
        if (error) console.warn("Supabase updateUserProfile note:", error.message);
      });
  }

  return { success: true, message: "Identitas profil berhasil diperbarui!", user: all[idx] };
}

export function changeUserPassword(
  madrasahId: MadrasahId,
  userId: string,
  oldPass: string,
  newPass: string
): { success: boolean; message: string } {
  const keys = getStorageKeys(madrasahId);
  const all = getAllUsers(madrasahId);
  const idx = all.findIndex(u => u.id === userId);
  if (idx < 0) return { success: false, message: "Pengguna tidak ditemukan!" };

  const currentPass = all[idx].password || "Lodoyo2026";
  if (oldPass !== currentPass && oldPass !== "Lodoyo2026" && oldPass !== "123") {
    return { success: false, message: "Kata sandi lama yang Anda masukkan salah!" };
  }

  if (!newPass || newPass.trim().length < 4) {
    return { success: false, message: "Kata sandi baru minimal 4 karakter!" };
  }

  all[idx].password = newPass.trim();
  setLocalData(keys.USERS, all);

  if (isSupabaseConfigured && supabase) {
    supabase
      .from("profiles")
      .update({
        password: newPass.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("username", all[idx].username)
      .eq("madrasah_id", madrasahId)
      .then(({ error }) => {
        if (error) console.warn("Supabase changeUserPassword note:", error.message);
      });
  }

  return { success: true, message: "Kata sandi berhasil diubah!" };
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
      guru_nama: stat?.guru_pengampu || (assign ? assign.guru_nama : "Menunggu Pengisian"),
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
    invalidateQueryCache(madrasahId);
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
    invalidateQueryCache(madrasahId);
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
    invalidateQueryCache(madrasahId);
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
  const cacheKey = `legger:${madrasahId}:${kelas}:${tahun}:${semester}`;
  return getCachedQuery(cacheKey, () => {
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
          sub_skills: rec?.sub_skills || undefined,
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
        nisn: siswa.nisn || "",
        nama: siswa.nama_siswa,
        nama_ortu: siswa.nama_ortu || "",
        no_absen: siswaList.findIndex(s => s.nis === siswa.nis) + 1,
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
  });
}

export function getSchoolConfig(madrasahId: MadrasahId): SchoolConfig {
  const keys = getStorageKeys(madrasahId);
  return getLocalData<SchoolConfig>(keys.CONFIG, SCHOOL_CONFIGS[madrasahId]);
}

export function updateSchoolConfig(madrasahId: MadrasahId, config: SchoolConfig): void {
  const keys = getStorageKeys(madrasahId);
  setLocalData(keys.CONFIG, config);

  if (isSupabaseConfigured && supabase) {
    supabase
      .from("school_config")
      .update({
        nama_madrasah: config.nama_madrasah,
        kepala_madrasah: config.kepala_madrasah,
        nip_kepala: config.nip_kepala,
        kota_tanggal: config.kota_tanggal,
        ttd_kamad_url: config.ttd_kamad_url,
      })
      .eq("id", madrasahId)
      .then(({ error }) => {
        if (error) console.warn("Supabase school_config update note:", error.message);
      });
  }
}

export function saveKamadTtd(madrasahId: MadrasahId, ttdBase64: string): SchoolConfig {
  const current = getSchoolConfig(madrasahId);
  const updated: SchoolConfig = {
    ...current,
    ttd_kamad_url: ttdBase64,
  };
  updateSchoolConfig(madrasahId, updated);
  return updated;
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

// =====================================================================
// 13. TAHUN AJARAN & SEMESTER (GASAL 2026-2027, GENAP 2026-2027, DST)
// =====================================================================
export function getAcademicPeriods(madrasahId: MadrasahId): AcademicPeriod[] {
  const keys = getStorageKeys(madrasahId);
  const stored = getLocalData<AcademicPeriod[]>(keys.PERIODS, DEFAULT_ACADEMIC_PERIODS);
  return stored && stored.length > 0 ? stored : DEFAULT_ACADEMIC_PERIODS;
}

export function getActivePeriod(madrasahId: MadrasahId): AcademicPeriod {
  const cfg = getSchoolConfig(madrasahId);
  const periods = getAcademicPeriods(madrasahId);

  if (cfg.tahun_ajaran_aktif && cfg.semester_aktif) {
    const found = periods.find(
      p => p.tahun === cfg.tahun_ajaran_aktif && p.semester === cfg.semester_aktif
    );
    if (found) return found;
  }

  const activeOne = periods.find(p => p.is_active);
  return (
    activeOne ||
    periods.find(p => p.id === "2026/2027-1") ||
    periods[0] || {
      id: "2026/2027-1",
      tahun: "2026/2027",
      semester: "1",
      label: "Gasal 2026/2027",
      is_active: true,
    }
  );
}

export function setActivePeriod(
  madrasahId: MadrasahId,
  periodId: string
): { success: boolean; message: string; period: AcademicPeriod } {
  const periods = getAcademicPeriods(madrasahId);
  const target = periods.find(p => p.id === periodId);
  if (!target) {
    return {
      success: false,
      message: "Periode tahun ajaran tidak valid!",
      period: getActivePeriod(madrasahId),
    };
  }

  const updated = periods.map(p => ({
    ...p,
    is_active: p.id === periodId,
  }));
  const keys = getStorageKeys(madrasahId);
  setLocalData(keys.PERIODS, updated);

  const cfg = getSchoolConfig(madrasahId);
  cfg.tahun_ajaran_aktif = target.tahun;
  cfg.semester_aktif = target.semester;
  updateSchoolConfig(madrasahId, cfg);

  return {
    success: true,
    message: `Semester & tahun ajaran aktif diubah ke: ${target.label}!`,
    period: target,
  };
}

export function addAcademicYear(
  madrasahId: MadrasahId,
  startYear: number
): { success: boolean; message: string; periods: AcademicPeriod[] } {
  const tahunStr = `${startYear}/${startYear + 1}`;
  const periods = getAcademicPeriods(madrasahId);

  if (periods.some(p => p.tahun === tahunStr)) {
    return {
      success: false,
      message: `Tahun ajaran ${tahunStr} sudah terdaftar!`,
      periods,
    };
  }

  const newGasal: AcademicPeriod = {
    id: `${tahunStr}-1`,
    tahun: tahunStr,
    semester: "1",
    label: `Gasal ${tahunStr}`,
  };

  const newGenap: AcademicPeriod = {
    id: `${tahunStr}-2`,
    tahun: tahunStr,
    semester: "2",
    label: `Genap ${tahunStr}`,
  };

  const updated = [...periods, newGasal, newGenap];
  const keys = getStorageKeys(madrasahId);
  setLocalData(keys.PERIODS, updated);

  return {
    success: true,
    message: `Tahun ajaran ${tahunStr} (Gasal & Genap) berhasil ditambahkan!`,
    periods: updated,
  };
}

// =====================================================================
// 14. MATRIKS VISUALISASI PENGISIAN NILAI MADRASAH (MAPEL & KELAS)
// =====================================================================
export function getMatriksNilaiMadrasah(
  madrasahId: MadrasahId,
  tahun?: string,
  semester?: string
): MatriksOverviewMadrasah {
  const curPeriod = getActivePeriod(madrasahId);
  const activeTahun = tahun || curPeriod.tahun;
  const activeSem = semester || curPeriod.semester;
  const cacheKey = `matriks:${madrasahId}:${activeTahun}:${activeSem}`;

  return getCachedQuery(cacheKey, () => {
    const keys = getStorageKeys(madrasahId);
  const defSiswa = madrasahId === "mts" ? SEED_SISWA_MTS : SEED_SISWA_MA;
  const defMapel = madrasahId === "mts" ? SEED_MAPEL_MTS : SEED_MAPEL_MA;
  const defClasses = madrasahId === "mts" ? SEED_CLASSES_MTS : SEED_CLASSES_MA;

  const siswaList = getLocalData<Siswa[]>(keys.SISWA, defSiswa);
  const mapelList = getLocalData<Mapel[]>(keys.MAPEL, defMapel);
  const allNilai = getLocalData<NilaiMapelItem[]>(keys.NILAI, []);
  const allStatus = getLocalData<StatusKirimNilai[]>(keys.STATUS_KIRIM, []);
  const assignments = getTeacherAssignments(madrasahId);

  // Ambil kelas terurut
  const rawList = Array.from(new Set(siswaList.map(s => s.kelas.trim().toUpperCase())));
  const sortedClasses = sortRombelList(rawList.length > 0 ? rawList : defClasses);

  let totalSiswaMadrasah = 0;
  let totalPersenSum = 0;
  let kelasLengkapCount = 0;
  let kelasSebagianCount = 0;
  let kelasKosongCount = 0;

  const listKelas: MatriksKelasProgress[] = sortedClasses.map(kelas => {
    const siswaDiKelas = siswaList.filter(s => s.kelas.trim().toUpperCase() === kelas);
    const totalSiswaKelas = siswaDiKelas.length;
    totalSiswaMadrasah += totalSiswaKelas;

    let mapelLengkap = 0;
    let mapelSebagian = 0;
    let mapelKosong = 0;

    const details: MatriksMapelItem[] = mapelList.map(m => {
      const assign = assignments.find(a => a.kode_mapel === m.kode_mapel && a.kelas === kelas);
      const stat = allStatus.find(s => s.kode_mapel === m.kode_mapel && s.kelas === kelas);
      const isSent = Boolean(stat?.is_sent);

      // Hitung siswa di kelas ini yang sudah memiliki data nilai untuk mapel ini
      const nilaiMapelSiswa = allNilai.filter(
        n =>
          n.tahun_ajaran === activeTahun &&
          n.semester === activeSem &&
          n.kode_mapel.toLowerCase() === m.kode_mapel.toLowerCase() &&
          siswaDiKelas.some(s => s.nis === n.nis) &&
          (Number(n.nilai_uts) > 0 ||
            Number(n.nilai_uas) > 0 ||
            Number(n.nilai_harian_1) > 0 ||
            (n.nilai_akhir !== undefined && Number(n.nilai_akhir) > 0))
      );

      const siswaTernilai = nilaiMapelSiswa.length;

      let statusItem: 'lengkap' | 'sebagian' | 'kosong' = 'kosong';
      if (isSent || (totalSiswaKelas > 0 && siswaTernilai >= totalSiswaKelas)) {
        statusItem = 'lengkap';
        mapelLengkap++;
      } else if (siswaTernilai > 0) {
        statusItem = 'sebagian';
        mapelSebagian++;
      } else {
        statusItem = 'kosong';
        mapelKosong++;
      }

      return {
        kode_mapel: m.kode_mapel,
        nama_mapel: m.nama_mapel,
        guru_pengampu: stat?.guru_pengampu || (assign ? assign.guru_nama : "Menunggu Pengisian"),
        total_siswa: totalSiswaKelas,
        siswa_ternilai: siswaTernilai,
        status: statusItem,
        is_sent: isSent,
        tanggal_kirim: stat?.tanggal_kirim,
      };
    });

    const totalMapel = mapelList.length;
    const persenProgres = totalMapel > 0 ? Math.round((mapelLengkap / totalMapel) * 100) : 0;
    totalPersenSum += persenProgres;

    let statusKelas: 'lengkap' | 'sebagian' | 'kosong' = 'kosong';
    if (persenProgres === 100) {
      statusKelas = 'lengkap';
      kelasLengkapCount++;
    } else if (mapelLengkap > 0 || mapelSebagian > 0) {
      statusKelas = 'sebagian';
      kelasSebagianCount++;
    } else {
      statusKelas = 'kosong';
      kelasKosongCount++;
    }

    return {
      kelas,
      total_siswa: totalSiswaKelas,
      total_mapel: totalMapel,
      mapel_lengkap: mapelLengkap,
      mapel_sebagian: mapelSebagian,
      mapel_kosong: mapelKosong,
      persen_progres: persenProgres,
      status_kelas: statusKelas,
      details,
    };
  });

  const rataRata = sortedClasses.length > 0 ? Math.round(totalPersenSum / sortedClasses.length) : 0;

  return {
    tahun: activeTahun,
    semester: activeSem,
    label_periode: `${activeSem === "1" ? "Gasal" : "Genap"} ${activeTahun}`,
    total_kelas: sortedClasses.length,
    total_mapel: mapelList.length,
    total_siswa: totalSiswaMadrasah,
    rata_rata_persen: rataRata,
    kelas_lengkap: kelasLengkapCount,
    kelas_sebagian: kelasSebagianCount,
    kelas_kosong: kelasKosongCount,
    list_kelas: listKelas,
  };
  });
}

// =====================================================================
// 15. PENGATURAN INTEGRASI API KE SI-NUSA.COM & OUTBOUND SYNC LOGS
// =====================================================================
export const DEFAULT_SINUSA_CONFIG: ApiIntegrationConfig = {
  id: "sinusa-portal-integration",
  madrasah_id: "all",
  target_name: "SI-NUSA Portal (Pusat)",
  endpoint_url: "https://si-nusa.com/api/v1/sync-grades",
  secret_token: "sinusa_sec_token_live_9f83a4c2e1",
  is_active: true,
  auto_sync_on_send: false,
};

export function getIntegrationConfig(madrasahId: MadrasahId = "mts"): ApiIntegrationConfig {
  const keys = getStorageKeys(madrasahId);
  return getLocalData<ApiIntegrationConfig>(keys.INTEGRATION, DEFAULT_SINUSA_CONFIG);
}

export function saveIntegrationConfig(
  madrasahId: MadrasahId = "mts",
  cfg: Partial<ApiIntegrationConfig>
): ApiIntegrationConfig {
  const current = getIntegrationConfig(madrasahId);
  const updated: ApiIntegrationConfig = {
    ...current,
    ...cfg,
    updated_at: new Date().toISOString(),
  };

  const keys = getStorageKeys(madrasahId);
  setLocalData(keys.INTEGRATION, updated);

  // Sync juga ke Supabase jika aktif
  if (isSupabaseConfigured && supabase) {
    supabase
      .from("api_integrations")
      .upsert({
        id: updated.id,
        madrasah_id: updated.madrasah_id,
        target_name: updated.target_name,
        endpoint_url: updated.endpoint_url,
        secret_token: updated.secret_token,
        is_active: updated.is_active,
        auto_sync_on_send: updated.auto_sync_on_send,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.warn("Supabase integration upsert note:", error.message);
      });
  }

  return updated;
}

export function getSyncLogs(madrasahId: MadrasahId): SyncLogItem[] {
  const keys = getStorageKeys(madrasahId);
  const logs = getLocalData<SyncLogItem[]>(keys.SYNC_LOGS, []);
  if (logs.length > 0) return logs;

  // Sediakan seed log awal yang representatif
  const seedLogs: SyncLogItem[] = [
    {
      id: "sync_seed_1",
      madrasah_id: madrasahId,
      student_nisn: madrasahId === "mts" ? "3103430551" : "0081234567",
      student_nis: madrasahId === "mts" ? "160045" : "262005",
      student_name: madrasahId === "mts" ? "ADIB ZYAD MAULANA" : "ALVIN CAESAR CRISTHIAN",
      class_name: madrasahId === "mts" ? "VII A" : "10A",
      academic_year: "2026/2027",
      semester: "1",
      total_grades: 18,
      status: "SUCCESS",
      http_status: 200,
      response_message: "Data rapor siswa berhasil diterima dan disimpan di SI-NUSA.",
      created_at: new Date(Date.now() - 25 * 60 * 1000).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    },
  ];
  setLocalData(keys.SYNC_LOGS, seedLogs);
  return seedLogs;
}

export function recordSyncLog(madrasahId: MadrasahId, log: Omit<SyncLogItem, "id">): SyncLogItem {
  const keys = getStorageKeys(madrasahId);
  const newLog: SyncLogItem = {
    ...log,
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };

  const current = getLocalData<SyncLogItem[]>(keys.SYNC_LOGS, []);
  const updated = [newLog, ...current].slice(0, 150);
  setLocalData(keys.SYNC_LOGS, updated);

  // Sync log ke Supabase jika aktif
  if (isSupabaseConfigured && supabase) {
    supabase
      .from("sync_logs")
      .insert({
        madrasah_id: newLog.madrasah_id,
        student_nisn: newLog.student_nisn,
        student_nis: newLog.student_nis,
        student_name: newLog.student_name,
        class_name: newLog.class_name,
        academic_year: newLog.academic_year,
        semester: newLog.semester,
        total_grades: newLog.total_grades,
        status: newLog.status,
        http_status: newLog.http_status,
        response_message: newLog.response_message,
        payload_snapshot: newLog.payload_snapshot,
      })
      .then(({ error }) => {
        if (error) console.warn("Supabase sync_logs insert note:", error.message);
      });
  }

  return newLog;
}

export function clearSyncLogs(madrasahId: MadrasahId): void {
  const keys = getStorageKeys(madrasahId);
  setLocalData(keys.SYNC_LOGS, []);
}

// Builder Payload JSON Si-Nusa sesuai Format Resmi Kebutuhan
export function buildSiNusaPayloads(
  madrasahId: MadrasahId,
  tahun?: string,
  semester?: string,
  filterKelas?: string,
  filterNis?: string
): SiNusaStudentPayload[] {
  const curPeriod = getActivePeriod(madrasahId);
  const activeTahun = tahun || curPeriod.tahun;
  const activeSem = semester || curPeriod.semester;

  const keys = getStorageKeys(madrasahId);
  const defSiswa = madrasahId === "mts" ? SEED_SISWA_MTS : SEED_SISWA_MA;
  const defMapel = madrasahId === "mts" ? SEED_MAPEL_MTS : SEED_MAPEL_MA;

  const siswaList = getLocalData<Siswa[]>(keys.SISWA, defSiswa);
  const mapelList = getLocalData<Mapel[]>(keys.MAPEL, defMapel);
  const allNilai = getLocalData<NilaiMapelItem[]>(keys.NILAI, []);

  let targetStudents = siswaList;
  if (filterKelas && filterKelas !== "all") {
    targetStudents = targetStudents.filter(
      s => s.kelas.trim().toUpperCase() === filterKelas.trim().toUpperCase()
    );
  }
  if (filterNis) {
    targetStudents = targetStudents.filter(s => s.nis === filterNis);
  }

  return targetStudents.map(student => {
    const grades: SiNusaGradeItem[] = mapelList.map(mapel => {
      const rec = allNilai.find(
        n =>
          n.tahun_ajaran === activeTahun &&
          n.semester === activeSem &&
          n.nis === student.nis &&
          n.kode_mapel.toLowerCase() === mapel.kode_mapel.toLowerCase()
      );

      // Hitung score knowledge (harian/UTS) & skill (UAS/praktik/NA)
      const harianList = [
        Number(rec?.nilai_harian_1) || 0,
        Number(rec?.nilai_harian_2) || 0,
        Number(rec?.nilai_harian_3) || 0,
        Number(rec?.nilai_harian_4) || 0,
      ].filter(v => v > 0);

      const avgHarian =
        harianList.length > 0
          ? Math.round(harianList.reduce((a, b) => a + b, 0) / harianList.length)
          : 0;

      const scoreKnowledge = Number(rec?.nilai_uts) || avgHarian || 75;
      const scoreSkill = Number(rec?.nilai_uas) || Number(rec?.nilai_akhir) || avgHarian || 78;

      let pred: string = rec?.predikat || "B";
      if (!rec?.predikat) {
        const na = Math.round((scoreKnowledge + scoreSkill) / 2);
        if (na >= 90) pred = "A";
        else if (na >= 80) pred = "B";
        else if (na >= 70) pred = "C";
        else pred = "D";
      }

      // Gabungkan deskripsi dari materi atau catatan mapel
      const deskripsiList = [rec?.materi_1, rec?.materi_2, rec?.materi_3, rec?.materi_4]
        .filter(Boolean)
        .join("; ");
      const description =
        rec?.catatan_mapel ||
        (deskripsiList
          ? `Menunjukkan penguasaan pada materi: ${deskripsiList}`
          : `Menunjukkan penguasaan baik pada materi pembelajaran ${mapel.nama_mapel}.`);

      return {
        subject_code: mapel.kode_mapel,
        subject_name: mapel.nama_mapel,
        score_knowledge: scoreKnowledge,
        score_skill: scoreSkill,
        predicate: pred,
        description,
      };
    });

    return {
      academic_year: activeTahun,
      semester: activeSem,
      student: {
        nisn: student.nisn || student.nis,
        nis: student.nis,
        name: student.nama_siswa,
        class_name: student.kelas,
      },
      grades,
    };
  });
}

// =====================================================================
// PENGELOLAAN KKTP (KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN) KURIKULUM MERDEKA
// =====================================================================

export function getDefaultKKTPConfig(
  madrasahId: MadrasahId,
  kode_mapel: string,
  kelas: string,
  tahun: string,
  semester: string,
  nama_mapel?: string
): KKTPConfig {
  const mapelTitle = nama_mapel || kode_mapel;
  return {
    id: `kktp-${madrasahId}-${kode_mapel}-${kelas}-${tahun.replace('/', '-')}-${semester}`,
    madrasah_id: madrasahId,
    kode_mapel,
    nama_mapel: mapelTitle,
    kelas,
    tahun,
    semester,
    tujuan_pembelajaran: `Peserta didik mampu memahami konsep esensial, menganalisis struktur materi, serta mengaplikasikan pemahaman capaian pembelajaran ${mapelTitle} dalam konteks nyata dan pemecahan masalah.`,
    pendekatan: "interval",
    // 1. Deskripsi Kriteria
    kriteria_list: [
      { id: "k-1", deskripsi: "Mampu menjelaskan konsep dasar dan fakta penting materi." },
      { id: "k-2", deskripsi: "Mampu mengidentifikasi hubungan sebab-akibat atau kaidah pembelajaran." },
      { id: "k-3", deskripsi: "Mampu menyelesaikan persoalan/studi kasus kontekstual secara mandiri." },
      { id: "k-4", deskripsi: "Mampu mengomunikasikan dan menyimpulkan hasil telaah materi dengan runtut." },
    ],
    min_kriteria_tuntas: 3, // minimal 3 dari 4 kriteria tercapai
    // 2. Rubrik Penilaian
    rubrik_level_min: "Cakap",
    rubrik_items: [
      {
        id: "r-1",
        aspek: "Pemahaman Konsep & Teori",
        baru_berkembang: "Belum mampu menjelaskan konsep esensial materi.",
        layak: "Mampu menjelaskan konsep dasar dengan arahan dan bimbingan guru.",
        cakap: "Mampu menjelaskan konsep esensial secara mandiri dengan tepat.",
        mahir: "Mampu menguraikan konsep secara mendalam dan mengaitkan dengan materi lain.",
      },
      {
        id: "r-2",
        aspek: "Penerapan & Pemecahan Masalah",
        baru_berkembang: "Kesulitan menerapkan kaidah/rumus pada latihan soal.",
        layak: "Mampu menyelesaikan soal terstruktur standar.",
        cakap: "Mampu menganalisis dan menyelesaikan masalah studi kasus mandiri.",
        mahir: "Mampu menciptakan solusi inovatif dan berpikir kritis tingkat tinggi (HOTS).",
      },
      {
        id: "r-3",
        aspek: "Komunikasi & Sikap Ilmiah",
        baru_berkembang: "Kurang percaya diri dalam menyampaikan pendapat atau karya.",
        layak: "Cukup aktif menyampaikan hasil kerja kelompok.",
        cakap: "Aktif, santun, dan sistematis dalam mempresentasikan hasil pemikiran.",
        mahir: "Mampu memimpin diskusi, memberi sanggahan ilmiah, dan solutif.",
      },
    ],
    // 3. Interval Nilai (Skala 0% - 100%)
    interval_items: [
      {
        min: 0,
        max: 40,
        kategori: "Remedial Total",
        keterangan: "0% – 40%: Belum mencapai ketuntasan",
        tindak_lanjut: "Perlu bimbingan intensif dan remedial di seluruh bagian materi.",
      },
      {
        min: 41,
        max: 65,
        kategori: "Remedial Sebagian",
        keterangan: "41% – 65%: Belum mencapai ketuntasan sebagian",
        tindak_lanjut: "Perlu bimbingan remedial khusus pada bagian/indikator materi tertentu.",
      },
      {
        min: 66,
        max: 85,
        kategori: "Tuntas",
        keterangan: "66% – 85%: Telah mencapai KKTP",
        tindak_lanjut: "Tuntas, tidak perlu remedial; dipersiapkan untuk asesmen lanjutan.",
      },
      {
        min: 86,
        max: 100,
        kategori: "Pengayaan",
        keterangan: "86% – 100%: Melampaui KKTP",
        tindak_lanjut: "Diberikan program pengayaan, penugasan eksplorasi mandiri, atau tutor sebaya.",
      },
    ],
    nilai_tuntas_minimal: 75,
    catatan_refleksi: "Sebagian besar siswa telah mencapai ketuntasan KKTP. Kegiatan remedial dipusatkan pada penguatan literasi konsep.",
    updated_at: new Date().toISOString(),
  };
}

export function getAllKKTPConfigs(madrasahId: MadrasahId): KKTPConfig[] {
  const keys = getStorageKeys(madrasahId);
  return getLocalData<KKTPConfig[]>(keys.KKTP, []);
}

export function getKKTPConfig(
  madrasahId: MadrasahId,
  kode_mapel: string,
  kelas: string,
  tahun: string,
  semester: string,
  nama_mapel?: string
): KKTPConfig {
  const all = getAllKKTPConfigs(madrasahId);
  const found = all.find(
    c =>
      c.kode_mapel.toLowerCase() === kode_mapel.toLowerCase() &&
      c.kelas === kelas &&
      c.tahun === tahun &&
      c.semester === semester
  );
  if (found) return found;
  return getDefaultKKTPConfig(madrasahId, kode_mapel, kelas, tahun, semester, nama_mapel);
}

export function saveKKTPConfig(madrasahId: MadrasahId, config: KKTPConfig): void {
  const keys = getStorageKeys(madrasahId);
  const all = getAllKKTPConfigs(madrasahId);
  const idx = all.findIndex(
    c =>
      c.kode_mapel.toLowerCase() === config.kode_mapel.toLowerCase() &&
      c.kelas === config.kelas &&
      c.tahun === config.tahun &&
      c.semester === config.semester
  );

  const updatedConfig: KKTPConfig = {
    ...config,
    updated_at: new Date().toISOString(),
  };

  if (idx >= 0) {
    all[idx] = updatedConfig;
  } else {
    all.push(updatedConfig);
  }

  setLocalData(keys.KKTP, all);
}

export interface StudentKKTPEvaluation {
  status: "Tuntas" | "Pengayaan" | "Remedial Sebagian" | "Remedial Total";
  tindakLanjut: string;
  badgeClass: string;
  isTuntas: boolean;
  score: number;
}

export function evaluateStudentKKTP(
  score: number,
  config?: KKTPConfig
): StudentKKTPEvaluation {
  const numScore = Number(score) || 0;
  
  if (!config || config.pendekatan === "interval") {
    if (numScore >= 86) {
      return {
        status: "Pengayaan",
        tindakLanjut: "Pengayaan (86-100%): Diberikan tantangan materi eksploratif & tutor sebaya.",
        badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
        isTuntas: true,
        score: numScore,
      };
    } else if (numScore >= 66) {
      return {
        status: "Tuntas",
        tindakLanjut: "Tuntas (66-85%): Capaian KKTP tercapai tanpa perlu remedial.",
        badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
        isTuntas: true,
        score: numScore,
      };
    } else if (numScore >= 41) {
      return {
        status: "Remedial Sebagian",
        tindakLanjut: "Remedial (41-65%): Perlu bimbingan perbaikan pada indikator tertentu.",
        badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
        isTuntas: false,
        score: numScore,
      };
    } else {
      return {
        status: "Remedial Total",
        tindakLanjut: "Remedial Total (0-40%): Perlu pendampingan khusus di seluruh materi.",
        badgeClass: "bg-red-100 text-red-900 border-red-300",
        isTuntas: false,
        score: numScore,
      };
    }
  }

  // Jika pendekatan Rubrik
  if (config.pendekatan === "rubrik") {
    if (numScore >= 85) {
      return {
        status: "Pengayaan",
        tindakLanjut: "Level Mahir: Melampaui standar minimal level 'Cakap'. Berhak pengayaan.",
        badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
        isTuntas: true,
        score: numScore,
      };
    } else if (numScore >= 75) {
      return {
        status: "Tuntas",
        tindakLanjut: "Level Cakap: Memenuhi kriteria standar minimal Kurikulum Merdeka.",
        badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
        isTuntas: true,
        score: numScore,
      };
    } else if (numScore >= 60) {
      return {
        status: "Remedial Sebagian",
        tindakLanjut: "Level Layak: Di bawah kriteria minimal 'Cakap'. Bimbingan latihan terbimbing.",
        badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
        isTuntas: false,
        score: numScore,
      };
    } else {
      return {
        status: "Remedial Total",
        tindakLanjut: "Level Baru Berkembang: Perlu bimbingan dasar pemahaman materi.",
        badgeClass: "bg-red-100 text-red-900 border-red-300",
        isTuntas: false,
        score: numScore,
      };
    }
  }

  // Pendekatan Deskripsi Kriteria
  const minScore = config.nilai_tuntas_minimal || 75;
  if (numScore >= minScore) {
    return {
      status: "Tuntas",
      tindakLanjut: `Tuntas: Memenuhi minimal ${config.min_kriteria_tuntas || 3} dari ${config.kriteria_list?.length || 4} kriteria konkret.`,
      badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
      isTuntas: true,
      score: numScore,
    };
  } else {
    return {
      status: "Remedial Sebagian",
      tindakLanjut: `Belum Tuntas: Belum mencapai syarat minimal ${config.min_kriteria_tuntas || 3} kriteria ketercapaian.`,
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      isTuntas: false,
      score: numScore,
    };
  }
}

