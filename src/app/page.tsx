"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
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
  Save,
  Filter,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // User role flags
  const [isGuru, setIsGuru] = useState(false);
  const [isWali, setIsWali] = useState(false);
  const [isEkstra, setIsEkstra] = useState(false);

  // Dropdowns & filters
  const [dropdowns, setDropdowns] = useState<{
    kelas: string[];
    mapel: { kode: string; nama: string }[];
    ekskul: string[];
  }>({ kelas: [], mapel: [], ekskul: [] });

  const [filterTipe, setFilterTipe] = useState<"mapel" | "ekskul" | "wali">("mapel");
  const [filterTahun, setFilterTahun] = useState("2024/2025");
  const [filterSemester, setFilterSemester] = useState("1");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterMapel, setFilterMapel] = useState("");
  const [filterEkskul, setFilterEkskul] = useState("");

  // Table Data State
  const [isLoaded, setIsLoaded] = useState(false);
  const [dataMapel, setDataMapel] = useState<NilaiMapelItem[]>([]);
  const [dataEkskul, setDataEkskul] = useState<NilaiEkskulItem[]>([]);
  const [dataWali, setDataWali] = useState<RaporWaliItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [isLeggerOpen, setIsLeggerOpen] = useState(false);
  const [isCetakRaporOpen, setIsCetakRaporOpen] = useState(false);
  const [leggerData, setLeggerData] = useState<LeggerResponse | null>(null);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(getSchoolConfig());

  // Inisialisasi awal
  useEffect(() => {
    initializeLocalStorage();
    const opts = getDropdownOptions();
    setDropdowns(opts);
    if (opts.kelas.length > 0) setFilterKelas(opts.kelas[0]);
    if (opts.mapel.length > 0) setFilterMapel(opts.mapel[0].kode);
    if (opts.ekskul.length > 0) setFilterEkskul(opts.ekskul[0]);
    setSchoolConfig(getSchoolConfig());
  }, []);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await loginUser(usernameInput, passwordInput);
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
    if (!filterKelas) {
      alert("Pilih Kelas terlebih dahulu!");
      return;
    }

    if (filterTipe === "mapel") {
      if (!filterMapel) {
        alert("Pilih Mata Pelajaran!");
        return;
      }
      const data = getNilaiByKelasMapel(filterTahun, filterSemester, filterKelas, filterMapel);
      setDataMapel(data);
    } else if (filterTipe === "ekskul") {
      if (!filterEkskul) {
        alert("Pilih Ekstrakurikuler!");
        return;
      }
      const data = getNilaiEkskulByKelas(filterTahun, filterSemester, filterKelas, filterEkskul);
      setDataEkskul(data);
    } else {
      const data = getRaporWaliByKelas(filterTahun, filterSemester, filterKelas);
      setDataWali(data);
    }

    setIsLoaded(true);
    setNotification(null);
  };

  // Save handler
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
      });
    } catch {}
  };

  const handleSaveMapel = (items: NilaiMapelItem[]) => {
    setIsSaving(true);
    const res = simpanNilaiBatch(filterTahun, filterSemester, filterMapel, items);
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
    setIsSaving(true);
    const res = simpanNilaiEkskulBatch(filterTahun, filterSemester, filterEkskul, items);
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
    setIsSaving(true);
    const res = simpanRaporWaliBatch(filterTahun, filterSemester, items);
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
    if (!filterKelas) {
      alert("Pilih kelas!");
      return;
    }

    if (filterTipe === "mapel") {
      const current = getNilaiByKelasMapel(filterTahun, filterSemester, filterKelas, filterMapel);
      const mObj = dropdowns.mapel.find(m => m.kode === filterMapel);
      await downloadExcelMapel(filterKelas, filterMapel, mObj?.nama || filterMapel, current);
    } else if (filterTipe === "ekskul") {
      const current = getNilaiEkskulByKelas(filterTahun, filterSemester, filterKelas, filterEkskul);
      await downloadExcelEkskul(filterKelas, filterEkskul, current);
    } else {
      const current = getRaporWaliByKelas(filterTahun, filterSemester, filterKelas);
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
        // Merge dengan data siswa yang sedang tampil
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
        alert("Berhasil membaca file Excel! Silakan klik 'Simpan Semua Nilai' untuk menyimpan ke database.");
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
    if (!filterKelas) {
      alert("Pilih kelas terlebih dahulu!");
      return;
    }
    const res = getLeggerDataByKelas(filterTahun, filterSemester, filterKelas);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setLeggerData(res);
    setIsLeggerOpen(true);
  };

  const handleOpenCetakRapor = () => {
    if (!filterKelas) {
      alert("Pilih kelas terlebih dahulu!");
      return;
    }
    const res = getLeggerDataByKelas(filterTahun, filterSemester, filterKelas);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setLeggerData(res);
    setIsCetakRaporOpen(true);
  };

  // ================= VIEW: LOGIN SCREEN =================
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/20">
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-8 text-center text-white relative">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
              <GraduationCap className="w-9 h-9 text-emerald-200" />
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase">RAPOR NUSA</h1>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              MA Ma&apos;arif Nurus Salam Kedungbunder Blitar
            </p>
          </div>

          <div className="p-8">
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
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

            {/* Quick Demo Login Chips */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Akses Uji Coba Cepat (Klik untuk isi):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => quickLoginAs("wali10a")}
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-left font-medium text-[11px] transition"
                >
                  👩‍🏫 <strong>wali10a</strong> (Wali Kelas X-A)
                </button>
                <button
                  type="button"
                  onClick={() => quickLoginAs("guru1")}
                  className="p-2 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 text-left font-medium text-[11px] transition"
                >
                  👨‍🏫 <strong>guru1</strong> (Guru Mapel)
                </button>
                <button
                  type="button"
                  onClick={() => quickLoginAs("ekstra1")}
                  className="p-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-left font-medium text-[11px] transition"
                >
                  🏅 <strong>ekstra1</strong> (Pembina Ekskul)
                </button>
                <button
                  type="button"
                  onClick={() => quickLoginAs("admin")}
                  className="p-2 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-left font-medium text-[11px] transition"
                >
                  ⚡ <strong>admin</strong> (Administrator)
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ================= VIEW: MAIN DASHBOARD =================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLegger={handleOpenLegger}
        onOpenCetakRapor={handleOpenCetakRapor}
        isWali={isWali}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Wali Kelas */}
        {isWali && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-md flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Menu Khusus Wali Kelas</h4>
                <p className="text-xs text-emerald-100">
                  Kelola legger kelas, rekap nilai, dan lembar rapor cetak resmi per siswa.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenLegger}
                className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur transition"
              >
                📊 Buka Legger Kelas
              </button>
              <button
                onClick={handleOpenCetakRapor}
                className="px-3.5 py-1.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow transition"
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
              <span>Filter Data Penilaian</span>
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
                      {m.nama} ({m.kode})
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
                Mode Input: <strong className="uppercase text-emerald-700">{filterTipe}</strong> | Kelas {filterKelas}
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
        config={schoolConfig}
      />

      <CetakRaporModal
        isOpen={isCetakRaporOpen}
        onClose={() => setIsCetakRaporOpen(false)}
        leggerData={leggerData}
        tahun={filterTahun}
        semester={filterSemester}
        kelas={filterKelas}
        config={schoolConfig}
        currentUser={currentUser}
      />
    </div>
  );
}
