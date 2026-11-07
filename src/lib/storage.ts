import {
  User,
  Siswa,
  Mapel,
  Ekskul,
  NilaiMapelItem,
  NilaiEkskulItem,
  RaporWaliItem,
  LeggerResponse,
  SchoolConfig
} from "@/types";
import {
  SEED_USERS,
  SEED_SISWA,
  SEED_MAPEL,
  SEED_EKSKUL,
  SEED_CLASSES,
  DEFAULT_SCHOOL_CONFIG
} from "./constants/seedData";
import { supabase, isSupabaseConfigured } from "./supabase/client";

const STORAGE_KEYS = {
  USERS: "rapor_nusa_users",
  SISWA: "rapor_nusa_siswa",
  MAPEL: "rapor_nusa_mapel",
  EKSKUL: "rapor_nusa_ekskul",
  NILAI: "rapor_nusa_nilai",
  NILAI_EKSKUL: "rapor_nusa_nilai_ekskul",
  RAPOR_WALI: "rapor_nusa_rapor_wali",
  CONFIG: "rapor_nusa_config",
};

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

// Inisialisasi data awal jika belum ada
export function initializeLocalStorage(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setLocalData(STORAGE_KEYS.USERS, SEED_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SISWA)) {
    setLocalData(STORAGE_KEYS.SISWA, SEED_SISWA);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MAPEL)) {
    setLocalData(STORAGE_KEYS.MAPEL, SEED_MAPEL);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EKSKUL)) {
    setLocalData(STORAGE_KEYS.EKSKUL, SEED_EKSKUL);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    setLocalData(STORAGE_KEYS.CONFIG, DEFAULT_SCHOOL_CONFIG);
  }
}

export async function loginUser(username: string, pass: string): Promise<{
  success: boolean;
  message?: string;
  user?: User;
  isGuru?: boolean;
  isWali?: boolean;
  isEkstra?: boolean;
  isAdmin?: boolean;
}> {
  const uInput = username.trim().toLowerCase();
  
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", uInput)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const role = String(data.role || "").toLowerCase();
        const userObj: User = {
          id: data.id,
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

  // Fallback Local
  const users = getLocalData<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
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

  return { success: false, message: "Username tidak terdaftar! (Coba: admin, guru1, wali10a, ekstra1)" };
}

export function getDropdownOptions() {
  const siswa = getLocalData<Siswa[]>(STORAGE_KEYS.SISWA, SEED_SISWA);
  const mapel = getLocalData<Mapel[]>(STORAGE_KEYS.MAPEL, SEED_MAPEL);
  const ekskul = getLocalData<Ekskul[]>(STORAGE_KEYS.EKSKUL, SEED_EKSKUL);

  const kelasList = Array.from(new Set(siswa.map(s => s.kelas.trim().toUpperCase()))).sort();
  return {
    kelas: kelasList.length > 0 ? kelasList : SEED_CLASSES,
    mapel: mapel.map(m => ({ kode: m.kode_mapel, nama: m.nama_mapel })),
    ekskul: ekskul.map(e => e.nama_ekskul),
  };
}

export function getSiswaByKelas(kelas: string): Siswa[] {
  const target = kelas.trim().toUpperCase();
  const siswa = getLocalData<Siswa[]>(STORAGE_KEYS.SISWA, SEED_SISWA);
  return siswa.filter(s => s.kelas.trim().toUpperCase() === target);
}

export function getNilaiByKelasMapel(
  tahun: string,
  semester: string,
  kelas: string,
  kodeMapel: string
): NilaiMapelItem[] {
  const siswaList = getSiswaByKelas(kelas);
  const allNilai = getLocalData<NilaiMapelItem[]>(STORAGE_KEYS.NILAI, []);

  // Ambil template materi yang mungkin sudah diinput sebelumnya untuk kelas & mapel ini
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
  tahun: string,
  semester: string,
  kodeMapel: string,
  dataNilai: NilaiMapelItem[]
): { success: boolean; message: string } {
  try {
    let allNilai = getLocalData<NilaiMapelItem[]>(STORAGE_KEYS.NILAI, []);

    dataNilai.forEach(item => {
      const h1 = Number(item.nilai_harian_1) || 0;
      const h2 = Number(item.nilai_harian_2) || 0;
      const h3 = Number(item.nilai_harian_3) || 0;
      const h4 = Number(item.nilai_harian_4) || 0;
      
      const avg = (h1 + h2 + h3 + h4) / 4;
      const uts = Number(item.nilai_uts) || 0;
      const uas = Number(item.nilai_uas) || 0;
      const na = Math.round((avg * 0.4) + (uts * 0.3) + (uas * 0.3));
      const predikat: 'A' | 'B' | 'C' | 'D' = na >= 90 ? 'A' : na >= 80 ? 'B' : na >= 70 ? 'C' : 'D';

      const enriched: NilaiMapelItem = {
        ...item,
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

      if (idx >= 0) {
        allNilai[idx] = enriched;
      } else {
        allNilai.push(enriched);
      }
    });

    setLocalData(STORAGE_KEYS.NILAI, allNilai);
    return { success: true, message: `Berhasil menyimpan nilai ${dataNilai.length} siswa!` };
  } catch (err: any) {
    return { success: false, message: "Gagal menyimpan: " + err.toString() };
  }
}

export function getNilaiEkskulByKelas(
  tahun: string,
  semester: string,
  kelas: string,
  namaEkskul: string
): NilaiEkskulItem[] {
  const siswaList = getSiswaByKelas(kelas);
  const allEkskul = getLocalData<NilaiEkskulItem[]>(STORAGE_KEYS.NILAI_EKSKUL, []);

  return siswaList.map(siswa => {
    const rec = allEkskul.find(
      e =>
        e.tahun_ajaran === tahun &&
        e.semester === semester &&
        e.nis === siswa.nis &&
        e.nama_ekskul.toLowerCase() === namaEkskul.toLowerCase()
    );

    return {
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
  tahun: string,
  semester: string,
  namaEkskul: string,
  dataNilai: NilaiEkskulItem[]
): { success: boolean; message: string } {
  try {
    let allEkskul = getLocalData<NilaiEkskulItem[]>(STORAGE_KEYS.NILAI_EKSKUL, []);

    dataNilai.forEach(item => {
      const idx = allEkskul.findIndex(
        e =>
          e.tahun_ajaran === tahun &&
          e.semester === semester &&
          e.nis === item.nis &&
          e.nama_ekskul.toLowerCase() === namaEkskul.toLowerCase()
      );

      const payload: NilaiEkskulItem = {
        tahun_ajaran: tahun,
        semester: semester,
        nis: item.nis,
        nama_siswa: item.nama_siswa,
        nama_ekskul: namaEkskul,
        predikat: item.predikat || "Baik",
        keterangan: item.keterangan || "",
      };

      if (idx >= 0) {
        allEkskul[idx] = payload;
      } else {
        allEkskul.push(payload);
      }
    });

    setLocalData(STORAGE_KEYS.NILAI_EKSKUL, allEkskul);
    return { success: true, message: `Berhasil menyimpan nilai ekskul untuk ${dataNilai.length} siswa!` };
  } catch (err: any) {
    return { success: false, message: "Gagal: " + err.toString() };
  }
}

export function getRaporWaliByKelas(
  tahun: string,
  semester: string,
  kelas: string
): RaporWaliItem[] {
  const siswaList = getSiswaByKelas(kelas);
  const allWali = getLocalData<RaporWaliItem[]>(STORAGE_KEYS.RAPOR_WALI, []);

  return siswaList.map(siswa => {
    const rec = allWali.find(
      w => w.tahun_ajaran === tahun && w.semester === semester && w.nis === siswa.nis
    );
    return {
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
  tahun: string,
  semester: string,
  dataWali: RaporWaliItem[]
): { success: boolean; message: string } {
  try {
    let allWali = getLocalData<RaporWaliItem[]>(STORAGE_KEYS.RAPOR_WALI, []);

    dataWali.forEach(item => {
      const idx = allWali.findIndex(
        w => w.tahun_ajaran === tahun && w.semester === semester && w.nis === item.nis
      );

      const payload: RaporWaliItem = {
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

      if (idx >= 0) {
        allWali[idx] = payload;
      } else {
        allWali.push(payload);
      }
    });

    setLocalData(STORAGE_KEYS.RAPOR_WALI, allWali);
    return { success: true, message: `Data Rapor Wali Kelas disimpan untuk ${dataWali.length} siswa!` };
  } catch (err: any) {
    return { success: false, message: "Gagal: " + err.toString() };
  }
}

export function getLeggerDataByKelas(
  tahun: string,
  semester: string,
  kelas: string
): LeggerResponse {
  const siswaList = getSiswaByKelas(kelas);
  if (!siswaList.length) {
    return { success: false, message: "Data siswa di kelas ini tidak ditemukan.", mapel: [], siswa: [] };
  }

  const mapelList = getLocalData<Mapel[]>(STORAGE_KEYS.MAPEL, SEED_MAPEL);
  const allNilai = getLocalData<NilaiMapelItem[]>(STORAGE_KEYS.NILAI, []);
  const allWali = getLocalData<RaporWaliItem[]>(STORAGE_KEYS.RAPOR_WALI, []);
  const allEkskul = getLocalData<NilaiEkskulItem[]>(STORAGE_KEYS.NILAI_EKSKUL, []);

  const dataSiswa = siswaList.map(siswa => {
    const mapelDetails: Record<string, any> = {};
    const scores: Record<string, number> = {};

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

      mapelDetails[m.kode_mapel] = {
        lm: count > 0 ? Math.round(tot / count) : 0,
        sts: Number(rec?.nilai_uts) || 0,
        sas: Number(rec?.nilai_uas) || 0,
        lingkup_materi: mat.join("; ") || "-",
      };

      scores[m.kode_mapel] = Number(rec?.nilai_akhir) || 0;
    });

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
      scores: scores,
      mapelDetails: mapelDetails,
      ekskul: eks,
      sakit: rw?.sakit || 0,
      izin: rw?.izin || 0,
      alpha: rw?.tanpa_keterangan || 0,
      catatan: rw?.catatan_wali || "",
      keputusan: rw?.keputusan || "-",
    };
  });

  return { success: true, mapel: mapelList, siswa: dataSiswa };
}

export function getSchoolConfig(): SchoolConfig {
  return getLocalData<SchoolConfig>(STORAGE_KEYS.CONFIG, DEFAULT_SCHOOL_CONFIG);
}

export function updateSchoolConfig(config: SchoolConfig): void {
  setLocalData(STORAGE_KEYS.CONFIG, config);
}

export function saveUserTtd(userId: string, ttdBase64: string): void {
  const users = getLocalData<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx].ttd_url = ttdBase64;
    setLocalData(STORAGE_KEYS.USERS, users);
  }
}
