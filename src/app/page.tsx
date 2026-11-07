"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  MadrasahId,
  User,
  NilaiMapelItem,
  NilaiEkskulItem,
  RaporWaliItem,
  LeggerResponse,
  SchoolConfig,
} from "@/types";
import {
  initializeLocalStorage,
  loginUser,
  getDropdownOptions,
  getNilaiByKelasMapel,
  simpanNilaiBatch,
  getNilaiEkskulByKelas,
  simpanNilaiEkskulBatch,
  getRaporWaliByKelas,
  simpanRaporWaliBatch,
  getLeggerDataByKelas,
  getSchoolConfig,
} from "@/lib/storage";
import {
  downloadExcelMapel,
  downloadExcelEkskul,
  downloadExcelWali,
  parseExcelUpload,
} from "@/lib/excel/excelHandler";
import Navbar from "@/components/Navbar";
import NilaiMapelTable from "@/components/NilaiMapelTable";
import NilaiEkskulTable from "@/components/NilaiEkskulTable";
import RaporWaliTable from "@/components/RaporWaliTable";
import LeggerModal from "@/components/LeggerModal";
import CetakRaporModal from "@/components/CetakRaporModal";
import {
  FileSpreadsheet,
  Upload,
  Filter,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  School,
  ArrowRight,
  ChevronLeft,
  Building2,
} from "lucide-react";

export default function HomePage() {
  // 1. Multi-Madrasah Tenant State
  const [selectedMadrasah, setSelectedMadrasah] = useState<MadrasahId | null>(null);

  // 2. Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 3. User role flags
  const [isGuru, setIsGuru] = useState(false);
  const [isWali, setIsWali] = useState(false);
  const [isEkstra, setIsEkstra] = useState(false);

  // 4. Dropdowns & filters (scoped to selectedMadrasah)
  const [dropdowns, setDropdowns] = useState<{
    kelas: string[];
    mapel: { kode: string; nama: string; kelompok?: string; kkm?: number }[];
    ekskul: string[];
  }>({ kelas: [], mapel: [], ekskul: [] });

  const [filterTipe, setFilterTipe] = useState<"mapel" | "ekskul" | "wali">("mapel");
  const [filterTahun, setFilterTahun] = useState("2024/2025");
  const [filterSemester, setFilterSemester] = useState("1");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterMapel, setFilterMapel] = useState("");
  const [filterEkskul, setFilterEkskul] = useState("");

  // 5. Table Data State
  const [isLoaded, setIsLoaded] = useState(false);
  const [dataMapel, setDataMapel] = useState<NilaiMapelItem[]>([]);
  const [dataEkskul, setDataEkskul] = useState<NilaiEkskulItem[]>([]);
  const [dataWali, setDataWali] = useState<RaporWaliItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 6. Modals state
  const [isLeggerOpen, setIsLeggerOpen] = useState(false);
  const [isCetakRaporOpen, setIsCetakRaporOpen] = useState(false);
  const [leggerData, setLeggerData] = useState<LeggerResponse | null>(null);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);

  // Inisialisasi awal
  useEffect(() => {
    initializeLocalStorage();
    // Cek jika tersimpan preferensi madrasah di localStorage
    const savedMid = localStorage.getItem("rapor_nusa_active_mid") as MadrasahId | null;
    if (savedMid === "mts" || savedMid === "ma") {
      handleSelectMadrasah(savedMid);
    }
  }, []);

  const handleSelectMadrasah = (mid: MadrasahId) => {
    setSelectedMadrasah(mid);
    localStorage.setItem("rapor_nusa_active_mid", mid);
    const cfg = getSchoolConfig(mid);
    setSchoolConfig(cfg);
    const opts = getDropdownOptions(mid);
    setDropdowns(opts);
    if (opts.kelas.length > 0) setFilterKelas(opts.kelas[0]);
    if (opts.mapel.length > 0) setFilterMapel(opts.mapel[0].kode);
    if (opts.ekskul.length > 0) setFilterEkskul(opts.ekskul[0]);
    setIsLoaded(false);
    setLoginError("");
  };

  const handleSwitchMadrasah = () => {
    setCurrentUser(null);
    setSelectedMadrasah(null);
    setIsLoaded(false);
    localStorage.removeItem("rapor_nusa_active_mid");
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMadrasah) return;
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await loginUser(selectedMadrasah, usernameInput, passwordInput);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setIsGuru(!!res.isGuru);
        setIsWali(!!res.isWali);
        setIsEkstra(!!res.isEkstra);

        // Auto select kelas jika guru adalah wali kelas
        if (res.user.kelas_diampu && res.user.kelas_diampu !== "-") {
          const firstClass = res.user.kelas_diampu.split(",")[0].trim();
          if (dropdowns.kelas.includes(firstClass)) {
            setFilterKelas(firstClass);
          }
        }
      } else {
        setLoginError(res.message || "Gagal login. Periksa username dan password.");
      }
    } catch (err: any) {
      setLoginError("Terjadi kesalahan: " + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoaded(false);
    setUsernameInput("");
    setPasswordInput("");
  };

  const quickLoginAs = (userKey: string) => {
    setUsernameInput(userKey);
    setPasswordInput("123456");
  };

  // Muat data tabel
  const handleLoadData = () => {
    if (!selectedMadrasah || !filterKelas) {
      alert("Pilih Kelas terlebih dahulu!");
      return;
    }

    if (filterTipe === "mapel") {
      if (!filterMapel) {
        alert("Pilih Mata Pelajaran!");
        return;
      }
      const data = getNilaiByKelasMapel(selectedMadrasah, filterTahun, filterSemester, filterKelas, filterMapel);
      setDataMapel(data);
    } else if (filterTipe === "ekskul") {
      if (!filterEkskul) {
        alert("Pilih Ekstrakurikuler!");
        return;
      }
      const data = getNilaiEkskulByKelas(selectedMadrasah, filterTahun, filterSemester, filterKelas, filterEkskul);
      setDataEkskul(data);
    } else {
      const data = getRaporWaliByKelas(selectedMadrasah, filterTahun, filterSemester, filterKelas);
      setDataWali(data);
    }

    setIsLoaded(true);
    setNotification(null);
  };

  // Save handler
  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    } catch {}
  };

  const handleSaveMapel = (items: NilaiMapelItem[]) => {
    if (!selectedMadrasah) return;
    setIsSaving(true);
    const res = simpanNilaiBatch(selectedMadrasah, filterTahun, filterSemester, filterMapel, items);
    setIsSaving(false);
    if (res.success) {
      setDataMapel(items);
      triggerConfetti();
      setNotification({ type: "success", message: res.message });
    } else {
      setNotification({ type: "error", message: res.message });
    }
  };

  const handleSaveEkskul = (items: NilaiEkskulItem[]) => {
    if (!selectedMadrasah) return;
    setIsSaving(true);
    const res = simpanNilaiEkskulBatch(selectedMadrasah, filterTahun, filterSemester, filterEkskul, items);
    setIsSaving(false);
    if (res.success) {
      setDataEkskul(items);
      triggerConfetti();
      setNotification({ type: "success", message: res.message });
    } else {
      setNotification({ type: "error", message: res.message });
    }
  };

  const handleSaveWali = (items: RaporWaliItem[]) => {
    if (!selectedMadrasah) return;
    setIsSaving(true);
    const res = simpanRaporWaliBatch(selectedMadrasah, filterTahun, filterSemester, items);
    setIsSaving(false);
    if (res.success) {
      setDataWali(items);
      triggerConfetti();
      setNotification({ type: "success", message: res.message });
    } else {
      setNotification({ type: "error", message: res.message });
    }
  };

  // Unduh Excel
  const handleDownloadExcel = async () => {
    if (!selectedMadrasah || !filterKelas) {
      alert("Pilih kelas!");
      return;
    }

    if (filterTipe === "mapel") {
      const current = getNilaiByKelasMapel(selectedMadrasah, filterTahun, filterSemester, filterKelas, filterMapel);
      const mObj = dropdowns.mapel.find(m => m.kode === filterMapel);
      await downloadExcelMapel(filterKelas, filterMapel, mObj?.nama || filterMapel, current);
    } else if (filterTipe === "ekskul") {
      const current = getNilaiEkskulByKelas(selectedMadrasah, filterTahun, filterSemester, filterKelas, filterEkskul);
      await downloadExcelEkskul(filterKelas, filterEkskul, current);
    } else {
      const current = getRaporWaliByKelas(selectedMadrasah, filterTahun, filterSemester, filterKelas);
      await downloadExcelWali(filterKelas, current);
    }
  };

  // Unggah Excel
  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await parseExcelUpload(file, filterTipe);
      if (filterTipe === "mapel" && res.dataMapel) {
        setDataMapel(prev =>
          prev.map(row => {
            const found = res.dataMapel?.find(d => d.nis === row.nis);
            if (!found) return row;
            return {
              ...row,
              materi_1: res.materis?.[0] || row.materi_1,
              materi_2: res.materis?.[1] || row.materi_2,
              materi_3: res.materis?.[2] || row.materi_3,
              materi_4: res.materis?.[3] || row.materi_4,
              nilai_harian_1: found.nilai_harian_1 ?? row.nilai_harian_1,
              nilai_harian_2: found.nilai_harian_2 ?? row.nilai_harian_2,
              nilai_harian_3: found.nilai_harian_3 ?? row.nilai_harian_3,
              nilai_harian_4: found.nilai_harian_4 ?? row.nilai_harian_4,
              nilai_uts: found.nilai_uts ?? row.nilai_uts,
              nilai_uas: found.nilai_uas ?? row.nilai_uas,
              catatan_mapel: found.catatan_mapel ?? row.catatan_mapel,
            };
          })
        );
        setIsLoaded(true);
        alert("Berhasil membaca file Excel! Silakan klik 'Simpan Semua Nilai' untuk menyimpan.");
      } else if (filterTipe === "ekskul" && res.dataEkskul) {
        setDataEkskul(prev =>
          prev.map(row => {
            const found = res.dataEkskul?.find(d => d.nis === row.nis);
            if (!found) return row;
            return {
              ...row,
              predikat: found.predikat ?? row.predikat,
              keterangan: found.keterangan ?? row.keterangan,
              checked: true,
            };
          })
        );
        setIsLoaded(true);
        alert("Berhasil membaca file Excel Ekstrakurikuler!");
      } else if (filterTipe === "wali" && res.dataWali) {
        setDataWali(prev =>
          prev.map(row => {
            const found = res.dataWali?.find(d => d.nis === row.nis);
            if (!found) return row;
            return {
              ...row,
              sakit: found.sakit ?? row.sakit,
              izin: found.izin ?? row.izin,
              tanpa_keterangan: found.tanpa_keterangan ?? row.tanpa_keterangan,
              catatan_wali: found.catatan_wali ?? row.catatan_wali,
              keputusan: found.keputusan ?? row.keputusan,
            };
          })
        );
        setIsLoaded(true);
        alert("Berhasil membaca file Excel Rapor Wali!");
      }
    } catch (err: any) {
      alert("Gagal membaca file Excel: " + err.message);
    } finally {
      e.target.value = "";
    }
  };

  // Open modals
  const handleOpenLegger = () => {
    if (!selectedMadrasah || !filterKelas) {
      alert("Pilih kelas terlebih dahulu!");
      return;
    }
    const res = getLeggerDataByKelas(selectedMadrasah, filterTahun, filterSemester, filterKelas);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setLeggerData(res);
    setIsLeggerOpen(true);
  };

  const handleOpenCetakRapor = () => {
    if (!selectedMadrasah || !filterKelas) {
      alert("Pilih kelas terlebih dahulu!");
      return;
    }
    const res = getLeggerDataByKelas(selectedMadrasah, filterTahun, filterSemester, filterKelas);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setLeggerData(res);
    setIsCetakRaporOpen(true);
  };

  // ================= VIEW 1: PORTAL PEMILIHAN MADRASAH (SEBELUM LOGIN) =================
  if (!selectedMadrasah) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex flex-col justify-between p-4 sm:p-8 text-white">
        <div className="max-w-4xl mx-auto w-full my-auto py-8">
          {/* Header Portal */}
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Sistem Informasi Rapor Digital Madrasah
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase">
              PORTAL RAPOR NUSA
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Silakan pilih lembaga madrasah Anda sebelum masuk ke sistem penilaian agar data kredensial tidak saling tercampur.
            </p>
          </div>

          {/* Kartu Pilihan Dua Madrasah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* KARTU 1: MTs Ma'arif NU 2 Sutojayan */}
            <div
              onClick={() => handleSelectMadrasah("mts")}
              className="group bg-slate-900/80 hover:bg-emerald-950/40 border-2 border-emerald-800/40 hover:border-emerald-500 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                    <School className="w-8 h-8" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs tracking-wider uppercase">
                    Jenjang MTs
                  </span>
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition uppercase leading-tight">
                  MTs MA&apos;ARIF NU 2 SUTOJAYAN
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  LP Ma&apos;arif NU Kabupaten Blitar
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-xs text-slate-300">
                  <p>• <strong>Tingkat:</strong> Kelas VII, VIII, IX</p>
                  <p>• <strong>NSM / NPSN:</strong> 121235050045 / 20582201</p>
                  <p>• <strong>Kepala:</strong> Ahmad Ulil Amin, Lc., M.S.I.</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                <span>Masuk ke Rapor MTs</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition" />
              </div>
            </div>

            {/* KARTU 2: MA Ma'arif Nurus Salam */}
            <div
              onClick={() => handleSelectMadrasah("ma")}
              className="group bg-slate-900/80 hover:bg-teal-950/40 border-2 border-teal-800/40 hover:border-teal-500 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold text-lg border border-teal-500/30">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-xs tracking-wider uppercase">
                    Jenjang MA
                  </span>
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-teal-300 transition uppercase leading-tight">
                  MA MA&apos;ARIF NURUS SALAM
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Yayasan Nurul Ulum Blitar
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-xs text-slate-300">
                  <p>• <strong>Tingkat:</strong> Kelas X, XI, XII</p>
                  <p>• <strong>NSM / NPSN:</strong> 131235050062 / 69978521</p>
                  <p>• <strong>Kepala:</strong> M. Zen Pamuji, S.Pd.</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
                <span>Masuk ke Rapor MA</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-500 pb-4">
          © {new Date().getFullYear()} Rapor Nusa • Terstandarisasi Kemenag RI & LP Ma&apos;arif NU
        </footer>
      </main>
    );
  }

  // ================= VIEW 2: LOGIN SCREEN PER MADRASAH =================
  if (!currentUser) {
    const isMts = selectedMadrasah === "mts";
    const activeCfg = schoolConfig || getSchoolConfig(selectedMadrasah);

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/20">
          {/* Header Box */}
          <div className={`p-6 text-center text-white relative ${
            isMts ? "bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900" : "bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800"
          }`}>
            <button
              onClick={handleSwitchMadrasah}
              className="absolute top-4 left-4 p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white text-xs flex items-center gap-1 transition"
              title="Ganti Madrasah"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Ganti</span>
            </button>

            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-2 shadow-inner">
              <GraduationCap className="w-8 h-8 text-emerald-200" />
            </div>
            <h2 className="text-base font-black tracking-tight uppercase">
              {activeCfg.nama_madrasah}
            </h2>
            <p className="text-[11px] text-emerald-100 font-medium">
              {activeCfg.nama_yayasan}
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
              Portal Login {activeCfg.jenjang}
            </span>
          </div>

          <div className="p-6">
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username Guru / Wali</label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="Masukkan username Anda"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                {isLoggingIn ? "Memeriksa Akun..." : "Masuk ke Sistem"}
              </button>
            </form>

            {/* Quick Demo Login Chips (Khusus Madrasah yang Dipilih) */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Uji Coba Cepat {activeCfg.jenjang} (Klik untuk isi):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {isMts ? (
                  <>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("wali7a")}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-left text-[10px] font-semibold transition"
                    >
                      👩‍🏫 <strong>wali7a</strong> (Wali VII-A)
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("guru_mts1")}
                      className="p-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 text-left text-[10px] font-semibold transition"
                    >
                      👨‍🏫 <strong>guru_mts1</strong> (Guru Mapel)
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("ekstra_mts")}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-left text-[10px] font-semibold transition"
                    >
                      🏅 <strong>ekstra_mts</strong> (Ekskul)
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("admin_mts")}
                      className="p-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-left text-[10px] font-semibold transition"
                    >
                      ⚡ <strong>admin_mts</strong> (Admin)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("wali10a")}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-left text-[10px] font-semibold transition"
                    >
                      👩‍🏫 <strong>wali10a</strong> (Wali X-A)
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("guru_ma1")}
                      className="p-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 text-left text-[10px] font-semibold transition"
                    >
                      👨‍🏫 <strong>guru_ma1</strong> (Guru Mapel)
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("ekstra_ma")}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-left text-[10px] font-semibold transition"
                    >
                      🏅 <strong>ekstra_ma</strong> (Ekskul)
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("admin_ma")}
                      className="p-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-left text-[10px] font-semibold transition"
                    >
                      ⚡ <strong>admin_ma</strong> (Admin)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ================= VIEW 3: MAIN DASHBOARD PER MADRASAH =================
  const activeCfg = schoolConfig || getSchoolConfig(selectedMadrasah);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentUser={currentUser}
        currentConfig={activeCfg}
        onLogout={handleLogout}
        onSwitchMadrasah={handleSwitchMadrasah}
        onOpenLegger={handleOpenLegger}
        onOpenCetakRapor={handleOpenCetakRapor}
        isWali={isWali}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Wali Kelas */}
        {isWali && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-md flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Menu Wali Kelas • {activeCfg.nama_madrasah}</h4>
                <p className="text-xs text-emerald-100">
                  Kelola legger kelas, rekap nilai, ranking kelas, dan cetak lembar rapor per siswa.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenLegger}
                className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur transition"
              >
                📊 Buka Legger & Ranking
              </button>
              <button
                onClick={handleOpenCetakRapor}
                className="px-3.5 py-1.5 rounded-lg bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold shadow transition"
              >
                📄 Cetak Lembar Rapor
              </button>
            </div>
          </div>
        )}

        {/* Filter Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 no-print">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filter Data Penilaian ({activeCfg.jenjang})</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Pilih rombel dan mata pelajaran untuk memuat tabel
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Tipe Penilaian */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Tipe Penilaian
              </label>
              <select
                value={filterTipe}
                onChange={e => {
                  setFilterTipe(e.target.value as any);
                  setIsLoaded(false);
                }}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="mapel">Mata Pelajaran (Intrakurikuler)</option>
                <option value="ekskul">Ekstrakurikuler</option>
                <option value="wali">Rapor Wali (Presensi & Catatan)</option>
              </select>
            </div>

            {/* Tahun Ajaran */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                value={filterTahun}
                onChange={e => setFilterTahun(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Semester
              </label>
              <select
                value={filterSemester}
                onChange={e => setFilterSemester(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="1">1 (Gasal)</option>
                <option value="2">2 (Genap)</option>
              </select>
            </div>

            {/* Kelas */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Kelas
              </label>
              <select
                value={filterKelas}
                onChange={e => {
                  setFilterKelas(e.target.value);
                  setIsLoaded(false);
                }}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {dropdowns.kelas.map(k => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Mapel / Ekskul */}
            {filterTipe === "mapel" && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={filterMapel}
                  onChange={e => {
                    setFilterMapel(e.target.value);
                    setIsLoaded(false);
                  }}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {dropdowns.mapel.map(m => (
                    <option key={m.kode} value={m.kode}>
                      {m.nama} ({m.kode}) - KKM: {m.kkm || 75}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterTipe === "ekskul" && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Ekstrakurikuler
                </label>
                <select
                  value={filterEkskul}
                  onChange={e => {
                    setFilterEkskul(e.target.value);
                    setIsLoaded(false);
                  }}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {dropdowns.ekskul.map(e => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleLoadData}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
            >
              Tampilkan Data Siswa
            </button>
          </div>
        </div>

        {/* Notifikasi Status Simpan */}
        {notification && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center justify-between no-print ${
              notification.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Card Tabel & Action Toolbar */}
        {isLoaded && (
          <div className="space-y-4">
            {/* Toolbar Excel */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm no-print">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Unduh Template Excel (.xlsx)
                </button>

                <label className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 cursor-pointer transition shadow-sm">
                  <Upload className="w-4 h-4 mr-1.5 text-teal-600" />
                  <span>Unggah Nilai Excel (.xlsx)</span>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleUploadExcel}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-xs text-slate-500">
                Lembaga: <strong className="text-emerald-800 font-bold">{activeCfg.nama_madrasah}</strong> | Kelas {filterKelas}
              </div>
            </div>

            {/* Tabel Konten Sesuai Tipe */}
            {filterTipe === "mapel" && (
              <NilaiMapelTable
                initialData={dataMapel}
                onSave={handleSaveMapel}
                isSaving={isSaving}
              />
            )}

            {filterTipe === "ekskul" && (
              <NilaiEkskulTable
                initialData={dataEkskul}
                onSave={handleSaveEkskul}
                isSaving={isSaving}
              />
            )}

            {filterTipe === "wali" && (
              <RaporWaliTable
                initialData={dataWali}
                onSave={handleSaveWali}
                isSaving={isSaving}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <LeggerModal
        isOpen={isLeggerOpen}
        onClose={() => setIsLeggerOpen(false)}
        leggerData={leggerData}
        tahun={filterTahun}
        semester={filterSemester}
        kelas={filterKelas}
        config={activeCfg}
      />

      <CetakRaporModal
        isOpen={isCetakRaporOpen}
        onClose={() => setIsCetakRaporOpen(false)}
        leggerData={leggerData}
        tahun={filterTahun}
        semester={filterSemester}
        kelas={filterKelas}
        config={activeCfg}
        currentUser={currentUser}
      />
    </div>
  );
}
