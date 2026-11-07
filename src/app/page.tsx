"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  MadrasahId,
  User,
  LeggerResponse,
  SchoolConfig,
} from "@/types";
import {
  initializeLocalStorage,
  loginUser,
  getDropdownOptions,
  getLeggerDataByKelas,
  getSchoolConfig,
  getRekapKirimNilaiKelas,
} from "@/lib/storage";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import GuruDashboard from "@/components/guru/GuruDashboard";
import WaliDashboard from "@/components/wali/WaliDashboard";
import LeggerModal from "@/components/LeggerModal";
import CetakRaporModal from "@/components/CetakRaporModal";
import {
  GraduationCap,
  School,
  Building2,
  ArrowRight,
  ChevronLeft,
  UserCheck,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
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

  // 3. Dual-role toggle for guru_walikelas
  const [dualRoleMode, setDualRoleMode] = useState<"guru" | "wali">("guru");

  // 4. Dropdowns & filters (scoped to selectedMadrasah)
  const [dropdowns, setDropdowns] = useState<{
    kelas: string[];
    mapel: { kode: string; nama: string; kelompok?: string; kkm?: number }[];
    ekskul: string[];
  }>({ kelas: [], mapel: [], ekskul: [] });

  const [filterKelas, setFilterKelas] = useState("");
  const [filterTahun, setFilterTahun] = useState("2025/2026");
  const [filterSemester, setFilterSemester] = useState("1");

  // 5. Modals state
  const [isLeggerOpen, setIsLeggerOpen] = useState(false);
  const [isCetakRaporOpen, setIsCetakRaporOpen] = useState(false);
  const [leggerData, setLeggerData] = useState<LeggerResponse | null>(null);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);

  // Inisialisasi awal
  useEffect(() => {
    initializeLocalStorage();
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
    setLoginError("");
  };

  const handleSwitchMadrasah = () => {
    setCurrentUser(null);
    setSelectedMadrasah(null);
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

        // Jika guru adalah wali kelas, default ke kelas ampunya
        if (res.user.kelas_diampu && res.user.kelas_diampu !== "-") {
          const firstClass = res.user.kelas_diampu.split(",")[0].trim();
          setFilterKelas(firstClass);
          setDualRoleMode("wali");
        } else {
          setDualRoleMode("guru");
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
    setUsernameInput("");
    setPasswordInput("");
  };

  const quickLoginAs = (userKey: string) => {
    setUsernameInput(userKey);
    setPasswordInput("123456");
  };

  // Buka Modal Legger
  const handleOpenLegger = (targetKelas?: string) => {
    if (!selectedMadrasah) return;
    const k = targetKelas || filterKelas || dropdowns.kelas[0];
    const data = getLeggerDataByKelas(selectedMadrasah, filterTahun, filterSemester, k);
    setLeggerData(data);
    setFilterKelas(k);
    setIsLeggerOpen(true);
  };

  // Buka Modal Cetak Rapor
  const handleOpenCetakRapor = (targetKelas?: string) => {
    if (!selectedMadrasah) return;
    const k = targetKelas || filterKelas || dropdowns.kelas[0];
    const data = getLeggerDataByKelas(selectedMadrasah, filterTahun, filterSemester, k);
    setLeggerData(data);
    setFilterKelas(k);
    setIsCetakRaporOpen(true);
  };

  // ================= VIEW 1: PILIHAN MADRASAH (PRE-LOGIN) =================
  if (!selectedMadrasah) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex flex-col justify-between p-4 sm:p-8 text-white">
        <div className="max-w-4xl w-full mx-auto my-auto py-8">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Penilaian Rapor Madrasah KMA 1503 / 2025</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase">
              PORTAL RAPOR DIGITAL MADRASAH
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Silakan pilih lembaga madrasah Anda sebelum masuk ke sistem penilaian agar seluruh data, kurikulum, dan kredensial terisolasi sempurna.
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
                  <p>• <strong>Tingkat:</strong> Kelas VII, VIII, IX (35 Rombel)</p>
                  <p>• <strong>Siswa Aktif:</strong> 1.280 Peserta Didik</p>
                  <p>• <strong>Kepala Madrasah:</strong> Ahmad Ulil Amin, Lc., M.S.I.</p>
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
                  <p>• <strong>Kepala Madrasah:</strong> M. Zen Pamuji, S.Pd.</p>
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
          © {new Date().getFullYear()} Rapor Digital Madrasah • Sesuai KMA Nomor 1503 Tahun 2025
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
          <div
            className={`p-6 text-center text-white relative ${
              isMts
                ? "bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900"
                : "bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800"
            }`}
          >
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
              Portal RDM {activeCfg.jenjang} • KMA 1503/2025
            </span>
          </div>

          {/* Form Box */}
          <div className="p-6 space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Username Akun:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password:
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className={`w-full py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-50 ${
                  isMts
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
                    : "bg-teal-600 hover:bg-teal-700 shadow-teal-600/30"
                }`}
              >
                {isLoggingIn ? "Memverifikasi..." : "Masuk ke Sistem"}
              </button>
            </form>

            {/* Quick Demo Access Badges */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                Akses Awal Administrator & Kamad:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {isMts ? (
                  <>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("admin_mts")}
                      className="p-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 text-left text-[11px] font-semibold transition"
                    >
                      ⚡ <strong>admin_mts</strong>
                      <span className="block text-[9px] text-purple-600 font-normal">Operator / Admin MTs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("kamad_mts")}
                      className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 text-left text-[11px] font-semibold transition"
                    >
                      👑 <strong>kamad_mts</strong>
                      <span className="block text-[9px] text-blue-600 font-normal">Kepala MTs (Ulil Amin)</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("admin_ma")}
                      className="p-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 text-left text-[11px] font-semibold transition"
                    >
                      ⚡ <strong>admin_ma</strong>
                      <span className="block text-[9px] text-purple-600 font-normal">Operator / Admin MA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLoginAs("kamad_ma")}
                      className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 text-left text-[11px] font-semibold transition"
                    >
                      👑 <strong>kamad_ma</strong>
                      <span className="block text-[9px] text-blue-600 font-normal">Kepala MA (M. Zen Pamuji)</span>
                    </button>
                  </>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 italic text-center">
                * Catatan RDM: Data guru dikosongkan secara default. Admin membuat akun guru dan menugaskan mapel & kelas secara dinamis di dashboard admin.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ================= VIEW 3: MAIN DASHBOARD POST-LOGIN =================
  const activeCfg = schoolConfig || getSchoolConfig(selectedMadrasah);
  const isDualRole = currentUser.role === "guru_walikelas" || Boolean(currentUser.kelas_diampu && currentUser.kelas_diampu !== "-");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentUser={currentUser}
        currentConfig={activeCfg}
        onLogout={handleLogout}
        onSwitchMadrasah={handleSwitchMadrasah}
        onOpenLegger={() => handleOpenLegger()}
        onOpenCetakRapor={() => handleOpenCetakRapor()}
        isWali={currentUser.role === "wali_kelas" || currentUser.role === "guru_walikelas" || isDualRole}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* DUAL ROLE SWITCHER PILL (Guru Mapel vs Wali Kelas) */}
        {isDualRole && currentUser.role !== "admin" && currentUser.role !== "kamad" && (
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between no-print">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 pl-2">
                Mode Penugasan Anda:
              </span>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDualRoleMode("guru")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                  dualRoleMode === "guru"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                👨‍🏫 Guru Mata Pelajaran
              </button>
              <button
                type="button"
                onClick={() => setDualRoleMode("wali")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                  dualRoleMode === "wali"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📋 Wali Kelas ({currentUser.kelas_diampu})
              </button>
            </div>
          </div>
        )}

        {/* 1. VIEW ADMIN / OPERATOR */}
        {currentUser.role === "admin" && (
          <AdminDashboard
            madrasahId={selectedMadrasah}
            config={activeCfg}
            allKelas={dropdowns.kelas}
            allMapel={dropdowns.mapel}
            onConfigUpdated={cfg => setSchoolConfig(cfg)}
          />
        )}

        {/* 2. VIEW GURU MAPEL */}
        {(currentUser.role === "guru" || (isDualRole && dualRoleMode === "guru")) && currentUser.role !== "admin" && (
          <GuruDashboard
            madrasahId={selectedMadrasah}
            currentUser={currentUser}
            config={activeCfg}
            onSwitchToWali={isDualRole ? () => setDualRoleMode("wali") : undefined}
            onLogout={handleLogout}
          />
        )}

        {/* 3. VIEW WALI KELAS */}
        {(currentUser.role === "wali_kelas" || (isDualRole && dualRoleMode === "wali")) && currentUser.role !== "admin" && (
          <WaliDashboard
            madrasahId={selectedMadrasah}
            currentUser={currentUser}
            config={activeCfg}
            allKelas={dropdowns.kelas}
            allMapel={dropdowns.mapel}
            allEkskul={dropdowns.ekskul}
            onOpenLegger={k => handleOpenLegger(k)}
            onOpenCetakRapor={k => handleOpenCetakRapor(k)}
            onSwitchToGuru={isDualRole ? () => setDualRoleMode("guru") : undefined}
          />
        )}

        {/* 4. VIEW KEPALA MADRASAH (KAMAD) */}
        {currentUser.role === "kamad" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider">
                  Dashboard Kepala Madrasah
                </span>
                <h2 className="text-xl font-black uppercase mt-2">
                  {currentUser.nama_user}
                </h2>
                <p className="text-xs text-blue-100 font-medium mt-1">
                  {activeCfg.nama_madrasah} • NSM: {activeCfg.nsm}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenLegger()}
                  className="px-4 py-2 rounded-xl bg-white text-blue-950 hover:bg-blue-50 font-bold text-xs shadow transition"
                >
                  📊 Tinjau Legger Kelas
                </button>
                <button
                  onClick={() => handleOpenCetakRapor()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
                >
                  🖨️ Cetak Lembar Rapor
                </button>
              </div>
            </div>

            {/* Monitoring per Rombel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                Monitoring Progres Nilai Seluruh Rombel ({dropdowns.kelas.length} Kelas)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {dropdowns.kelas.map(k => (
                  <div
                    key={k}
                    onClick={() => handleOpenLegger(k)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition text-center space-y-1 shadow-sm"
                  >
                    <span className="text-xs font-black text-slate-800 block">
                      Kelas {k}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      Lihat Legger →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
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
