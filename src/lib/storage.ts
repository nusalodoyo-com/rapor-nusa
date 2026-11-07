import {
  MadrasahId,
  User,
  Siswa,
  Mapel,
  Ekskul,
  NilaiMapelItem,
  NilaiEkskulItem,
  RaporWaliItem,
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
    USERS: `rapor_nusa_${madrasahId}_users`,
    SISWA: `rapor_nusa_${madrasahId}_siswa`,
    MAPEL: `rapor_nusa_${madrasahId}_mapel`,
    EKSKUL: `rapor_nusa_${madrasahId}_ekskul`,
    NILAI: `rapor_nusa_${madrasahId}_nilai`,
    NILAI_EKSKUL: `rapor_nusa_${madrasahId}_nilai_ekskul`,
    RAPOR_WALI: `rapor_nusa_${madrasahId}_rapor_wali`,
    CONFIG: `rapor_nusa_${madrasahId}_config`,
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

    if (!localStorage.getItem(keys.USERS)) setLocalData(keys.USERS, seedUsers);
    if (!localStorage.getItem(keys.SISWA)) setLocalData(keys.SISWA, seedSiswa);
    if (!localStorage.getItem(keys.MAPEL)) setLocalData(keys.MAPEL, seedMapel);
    if (!localStorage.getItem(keys.EKSKUL)) setLocalData(keys.EKSKUL, seedEkskul);
    if (!localStorage.getItem(keys.CONFIG)) setLocalData(keys.CONFIG, seedConfig);
  });
}

// 1. OTENTIKASI PENGGUNA TERISOLASI PER MADRASAH
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
  isEkstra?: boolean;
  isAdmin?: boolean;
}> {
  const uInput = username.trim().toLowerCase();

  // Supabase Cloud check
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("madrasah_id", madrasahId)
        .eq("username", uInput)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const role = String(data.role || "").toLowerCase();
        const userObj: User = {
          id: data.id,
          madrasah_id: madrasahId,
          username: data.username,
          nama_user: data.nama_lengkap || data.username,
          nip: data.nip,
          role: role,
          kelas_diampu: data.kelas_diampu,
          ttd_url: data.ttd_url,
        };
        return {
          success: true,
          user: userObj,
          isGuru: role.includes("guru") || role.includes("guru_walikelas") || role === "admin",
          isWali: role.includes("wali") || role.includes("guru_walikelas") || role === "admin",
          isEkstra: role.includes("ekstra") || role === "admin",
          isAdmin: role === "admin" || role === "kamad",
        };
      }
    } catch (e) {
      console.warn("Supabase auth fallback to local:", e);
    }
  }

  // Local Storage Check
  const keys = getStorageKeys(madrasahId);
  const defaultUsers = madrasahId === "mts" ? SEED_USERS_MTS : SEED_USERS_MA;
  const users = getLocalData<User[]>(keys.USERS, defaultUsers);
  const found = users.find(u => u.username.toLowerCase() === uInput);

  if (found) {
    const role = String(found.role || "").toLowerCase();
    return {
      success: true,
      user: found,
      isGuru: role.includes("guru") || role.includes("guru_walikelas") || role === "admin",
      isWali: role.includes("wali") || role.includes("guru_walikelas") || role === "admin",
      isEkstra: role.includes("ekstra") || role === "admin",
      isAdmin: role === "admin" || role === "kamad",
    };
  }

  const schoolName = madrasahId === "mts" ? "MTs Ma'arif NU 2" : "MA Ma'arif Nurus Salam";
  return {
    success: false,
    message: `Username tidak terdaftar di ${schoolName}! Pastikan memilih madrasah yang sesuai.`,
  };
}

// 2. DROPDOWNS PER MADRASAH
export function getDropdownOptions(madrasahId: MadrasahId) {
  const keys = getStorageKeys(madrasahId);
  const defSiswa = madrasahId === "mts" ? SEED_SISWA_MTS : SEED_SISWA_MA;
  const defMapel = madrasahId === "mts" ? SEED_MAPEL_MTS : SEED_MAPEL_MA;
  const defEkskul = madrasahId === "mts" ? SEED_EKSKUL_MTS : SEED_EKSKUL_MA;
  const defClasses = madrasahId === "mts" ? SEED_CLASSES_MTS : SEED_CLASSES_MA;

  const siswa = getLocalData<Siswa[]>(keys.SISWA, defSiswa);
  const mapel = getLocalData<Mapel[]>(keys.MAPEL, defMapel);
  const ekskul = getLocalData<Ekskul[]>(keys.EKSKUL, defEkskul);

  const kelasList = Array.from(new Set(siswa.map(s => s.kelas.trim().toUpperCase()))).sort();
  return {
    kelas: kelasList.length > 0 ? kelasList : defClasses,
    mapel: mapel.map(m => ({ kode: m.kode_mapel, nama: m.nama_mapel, kelompok: m.kelompok, kkm: m.kkm })),
    ekskul: ekskul.map(e => e.nama_ekskul),
  };
}

export function getSiswaByKelas(madrasahId: MadrasahId, kelas: string): Siswa[] {
  const target = kelas.trim().toUpperCase();
  const keys = getStorageKeys(madrasahId);
  const defSiswa = madrasahId === "mts" ? SEED_SISWA_MTS : SEED_SISWA_MA;
  const siswa = getLocalData<Siswa[]>(keys.SISWA, defSiswa);
  return siswa.filter(s => s.kelas.trim().toUpperCase() === target);
}

// 3. NILAI MAPEL (FORMATIF & SUMATIF)
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
  dataNilai: NilaiMapelItem[]
): { success: boolean; message: string } {
  try {
    const keys = getStorageKeys(madrasahId);
    let allNilai = getLocalData<NilaiMapelItem[]>(keys.NILAI, []);

    dataNilai.forEach(item => {
      const h1 = Number(item.nilai_harian_1) || 0;
      const h2 = Number(item.nilai_harian_2) || 0;
      const h3 = Number(item.nilai_harian_3) || 0;
      const h4 = Number(item.nilai_harian_4) || 0;

      const avg = (h1 + h2 + h3 + h4) / 4;
      const uts = Number(item.nilai_uts) || 0;
      const uas = Number(item.nilai_uas) || 0;
      const na = Math.round((avg * 0.4) + (uts * 0.3) + (uas * 0.3));
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

// 4. NILAI EKSTRAKURIKULER
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

// 5. RAPOR WALI KELAS (PRESENSI & KEPUTUSAN)
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

// 6. LEGGER DATA DENGAN KALKULASI RATA-RATA & PERINGKAT KELAS (RIGID & VALID)
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

  // 1. Ekstraksi nilai per siswa
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

  // 2. Hitung Peringkat (Ranking) berdasarkan totalScore
  const sortedScores = [...rawSiswa].sort((a, b) => b.totalScore - a.totalScore);
  const dataSiswa: SiswaLegger[] = rawSiswa.map(s => {
    const rank = sortedScores.findIndex(item => item.nis === s.nis) + 1;
    return { ...s, ranking: rank };
  });

  // 3. Hitung Rata-rata Kelas per Mata Pelajaran
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
