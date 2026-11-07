"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  MadrasahId,
  User,
  LeggerResponse,
  SchoolConfig,
  AcademicPeriod,
} from "@/types";
import {
  initializeLocalStorage,
  loginUser,
  getDropdownOptions,
  getLeggerDataByKelas,
  getSchoolConfig,
  getAcademicPeriods,
  getActivePeriod,
  setActivePeriod,
} from "@/lib/storage";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import GuruDashboard from "@/components/guru/GuruDashboard";
import WaliDashboard from "@/components/wali/WaliDashboard";
import LeggerModal from "@/components/LeggerModal";
import CetakRaporModal from "@/components/CetakRaporModal";
import SearchModal from "@/components/SearchModal";
import {
  GraduationCap,
  School,
  Building2,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Shield,
  Layers,
  KeyRound,
  UserCheck,
  CheckCircle2,
  Crown,
  Lock,
  X,
  Loader2,
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

  // Loading Screen & Super Admin Quick Login Modal State
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);
  const [superAdminUsername, setSuperAdminUsername] = useState("admin");
  const [superAdminPassword, setSuperAdminPassword] = useState("");
  const [superAdminError, setSuperAdminError] = useState("");
  const [isSuperAdminLoggingIn, setIsSuperAdminLoggingIn] = useState(false);

  // 3. Dual-role toggle for guru_walikelas
  const [dualRoleMode, setDualRoleMode] = useState<"guru" | "wali">("guru");

  // 4. Dropdowns & filters (scoped to selectedMadrasah)
  const [dropdowns, setDropdowns] = useState<{
    kelas: string[];
    mapel: { kode: string; nama: string; kelompok?: string; kkm?: number }[];
    ekskul: string[];
  }>({ kelas: [], mapel: [], ekskul: [] });

  const [filterKelas, setFilterKelas] = useState("");
  const [filterTahun, setFilterTahun] = useState("2026/2027");
  const [filterSemester, setFilterSemester] = useState("1");
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [activePeriod, setActivePeriodState] = useState<AcademicPeriod | null>(null);

  // 5. Modals state
  const [isLeggerOpen, setIsLeggerOpen] = useState(false);
  const [isCetakRaporOpen, setIsCetakRaporOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [leggerData, setLeggerData] = useState<LeggerResponse | null>(null);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);

  // Inisialisasi awal
  useEffect(() => {
    initializeLocalStorage();
    const savedMid = localStorage.getItem("rapor_nusa_active_mid") as MadrasahId | null;
    if (savedMid === "mts" || savedMid === "ma") {
      handleSelectMadrasah(savedMid);
    }

    const timer = setTimeout(() => {
      setIsLoadingApp(false);
    }, 350);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectMadrasah = (mid: MadrasahId) => {
    setSelectedMadrasah(mid);
    localStorage.setItem("rapor_nusa_active_mid", mid);
    const cfg = getSchoolConfig(mid);
    setSchoolConfig(cfg);
    const opts = getDropdownOptions(mid);
    setDropdowns(opts);
    if (opts.kelas.length > 0) setFilterKelas(opts.kelas[0]);

    // Muat tahun ajaran & semester aktif
    const periods = getAcademicPeriods(mid);
    setAcademicPeriods(periods);
    const currentActivePeriod = getActivePeriod(mid);
    setActivePeriodState(currentActivePeriod);
    setFilterTahun(currentActivePeriod.tahun);
    setFilterSemester(currentActivePeriod.semester);

    setLoginError("");
  };

  const handleSelectPeriod = (periodId: string) => {
    if (!selectedMadrasah) return;
    const res = setActivePeriod(selectedMadrasah, periodId);
    if (res.success && res.period) {
      setActivePeriodState(res.period);
      setFilterTahun(res.period.tahun);
      setFilterSemester(res.period.semester);
      const cfg = getSchoolConfig(selectedMadrasah);
      setSchoolConfig(cfg);
    }
  };

  const handleSwitchMadrasah = (targetMid?: MadrasahId) => {
    if (currentUser && currentUser.role === "admin") {
      const nextMid: MadrasahId = targetMid || (selectedMadrasah === "mts" ? "ma" : "mts");
      setSelectedMadrasah(nextMid);
      setCurrentUser({
        ...currentUser,
        madrasah_id: nextMid,
      });
      localStorage.setItem("rapor_nusa_active_mid", nextMid);
      return;
    }
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
        setLoginError(res.message || "Gagal login. Periksa username dan kata sandi.");
      }
    } catch (err: any) {
      setLoginError("Terjadi kesalahan: " + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Super Admin direct login handler from front page
  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuperAdminError("");
    setIsSuperAdminLoggingIn(true);

    try {
      const res = await loginUser("mts", superAdminUsername, superAdminPassword);
      if (res.success && res.user && (res.user.role === "admin" || res.user.is_super_admin)) {
        handleSelectMadrasah("mts");
        setCurrentUser({
          ...res.user,
          is_super_admin: true,
          role: "admin",
        });
        setIsSuperAdminModalOpen(false);
      } else {
        setSuperAdminError(res.message || "Gagal masuk. Username atau kata sandi admin utama salah!");
      }
    } catch (err: any) {
      setSuperAdminError("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSuperAdminLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
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

  // ================= VIEW 0: RETRO LOADING SCREEN =================
  if (isLoadingApp) {
    return (
      <main className="min-h-screen bg-[#07130a] retro-dark-grid flex flex-col items-center justify-center p-4">
        <div className="card-retro bg-white p-6 sm:p-8 max-w-sm w-full text-center space-y-4 border-3 border-retro-border shadow-[8px_8px_0px_0px_#00ab00] animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#06330b] p-2.5 border-2 border-retro-border shadow-retro-sm flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo Nusa Lodoyo"
              className="w-full h-full object-contain animate-spin"
              style={{ animationDuration: "5s" }}
            />
          </div>
          <div>
            <span className="badge-retro bg-retro-yellow text-retro-black text-[10px] mb-2 font-black uppercase">
              MEMUAT SISTEM...
            </span>
            <h2 className="text-sm sm:text-base font-black text-retro-black uppercase tracking-tight">
              PORTAL RAPOR INTERNAL NUSALODOYO
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-1">
              Menyiapkan basis data MTs &amp; MA...
            </p>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full border-2 border-retro-border overflow-hidden">
            <div className="bg-brand-500 h-full w-2/3 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  // ================= VIEW 1: PILIHAN MADRASAH (BOLD RETRO-MODERNISM) =================
  if (!selectedMadrasah) {
    return (
      <main className="min-h-screen bg-[#07130a] retro-dark-grid flex flex-col justify-between p-4 sm:p-8 text-white relative">
        <div className="max-w-4xl w-full mx-auto my-auto py-6 sm:py-10 relative z-10">
          {/* Hero Header with Logo Utama */}
          <div className="text-center space-y-4 mb-8 sm:mb-12">
            {/* Logo Utama Tersemat */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-4 group cursor-pointer">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl p-2.5 sm:p-3 border-3 border-retro-black shadow-[6px_6px_0px_0px_#00ab00] group-hover:shadow-[8px_8px_0px_0px_#ffc83b] group-hover:-translate-y-1 transition-all duration-200 flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Logo Utama Rapor Digital Madrasah"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border-2 border-retro-border bg-retro-yellow text-retro-black font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-retro-sm">
                <Sparkles className="w-4 h-4 text-retro-black" />
                <span>STANDAR KMA NOMOR 1503 TAHUN 2025</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-white drop-shadow-[2px_2px_0px_#00ab00]">
              PORTAL RAPOR INTERNAL NUSALODOYO
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed px-2 font-medium">
              Sistem Penilaian &amp; Rapor Internal Terpadu KMA 1503 Tahun 2025 • MTs Ma&apos;arif NU 2 Sutojayan &amp; MA Ma&apos;arif Nurus Salam.
            </p>

            {/* Tombol Khusus Login Admin Utama (Super Admin) */}
            <div className="pt-2 sm:pt-4 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setSuperAdminError("");
                  setSuperAdminPassword("");
                  setIsSuperAdminModalOpen(true);
                }}
                className="btn-retro bg-gradient-to-r from-retro-yellow via-amber-300 to-retro-yellow hover:from-amber-400 hover:to-amber-300 text-retro-black font-black text-xs sm:text-sm px-6 sm:px-8 py-3.5 rounded-2xl border-3 border-retro-border shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[6px_6px_0px_0px_#00ab00] hover:-translate-y-0.5 active:translate-x-0.5 transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider group"
              >
                <Crown className="w-5 h-5 text-retro-black group-hover:scale-110 transition-transform flex-shrink-0" />
                <span>LOGIN ADMIN UTAMA (SUPER ADMIN)</span>
                <ArrowRight className="w-4 h-4 text-retro-black group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
              <p className="text-[11px] text-emerald-200/90 font-bold mt-2 text-center">
                Akses Terpadu Seluruh Data MTs Ma&apos;arif NU 2 &amp; MA Ma&apos;arif Nurus Salam
              </p>
            </div>
          </div>

          {/* Kartu Pilihan Dua Madrasah (Chunky Retro Brutalist Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {/* KARTU 1: MTs Ma'arif NU 2 Sutojayan */}
            <div
              onClick={() => handleSelectMadrasah("mts")}
              className="bg-retro-cream text-retro-black border-3 border-retro-border rounded-2xl p-6 sm:p-7 cursor-pointer transition-all duration-200 shadow-retro-lg hover:shadow-retro-xl hover:-translate-x-1 hover:-translate-y-1 flex flex-col justify-between group relative"
            >
              <div className="absolute top-3 right-3">
                <span className="badge-retro bg-brand-500 text-white">
                  35 Rombel
                </span>
              </div>

              <div>
                <div className="w-14 h-14 rounded-xl bg-white p-1.5 border-2 border-retro-border shadow-retro-sm mb-4 group-hover:rotate-3 transition duration-200">
                  <img src="/logo-mts.png" alt="Logo MTs Ma'arif NU 2 Sutojayan" className="w-full h-full object-contain" />
                </div>
                
                <span className="badge-retro bg-retro-yellow text-retro-black mb-2">
                  Jenjang MTs
                </span>
                
                <h3 className="text-lg sm:text-xl font-black text-retro-black uppercase leading-tight mt-1">
                  MTs MA&apos;ARIF NU 2 SUTOJAYAN
                </h3>
                <p className="text-xs text-slate-600 font-bold mt-1">
                  LP Ma&apos;arif NU Kabupaten Blitar • nusalodoyo.com
                </p>

                <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-300 space-y-1.5 text-xs text-slate-700 font-semibold">
                  <p>• <strong>Peserta Didik:</strong> 1.280 Siswa Aktif (35 Rombel)</p>
                  <p>• <strong>NSM / NPSN:</strong> 121235050045 / 20584989</p>
                  <p>• <strong>Akreditasi:</strong> A (Unggul)</p>
                  <p>• <strong>Kepala Madrasah:</strong> Ahmad Ulil Amin, Lc., M.S.I.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-retro-border flex items-center justify-between text-xs font-black uppercase text-brand-700 group-hover:text-retro-black">
                <span>Buka Rapor MTs</span>
                <span className="w-8 h-8 rounded-lg bg-brand-500 text-white border-2 border-retro-border shadow-retro-sm flex items-center justify-center group-hover:translate-x-1 transition">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* KARTU 2: MA Ma'arif Nurus Salam */}
            <div
              onClick={() => handleSelectMadrasah("ma")}
              className="bg-retro-cream text-retro-black border-3 border-retro-border rounded-2xl p-6 sm:p-7 cursor-pointer transition-all duration-200 shadow-retro-lg hover:shadow-retro-xl hover:-translate-x-1 hover:-translate-y-1 flex flex-col justify-between group relative"
            >
              <div className="absolute top-3 right-3">
                <span className="badge-retro bg-retro-blue text-white">
                  Kelas X, XI, XII
                </span>
              </div>

              <div>
                <div className="w-14 h-14 rounded-xl bg-white p-1.5 border-2 border-retro-border shadow-retro-sm mb-4 group-hover:rotate-3 transition duration-200">
                  <img src="/logo-ma.png" alt="Logo MA Ma'arif Nurus Salam" className="w-full h-full object-contain" />
                </div>
                
                <span className="badge-retro bg-retro-yellow text-retro-black mb-2">
                  Jenjang MA
                </span>
                
                <h3 className="text-lg sm:text-xl font-black text-retro-black uppercase leading-tight mt-1">
                  MA MA&apos;ARIF NURUS SALAM
                </h3>
                <p className="text-xs text-slate-600 font-bold mt-1">
                  Pondok Pesantren Nurus Salam Lodoyo • nusalodoyo.com
                </p>

                <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-300 space-y-1.5 text-xs text-slate-700 font-semibold">
                  <p>• <strong>Peminatan:</strong> IPA, IPS, Keagamaan</p>
                  <p>• <strong>NSM / NPSN:</strong> 131235050062 / 75727401</p>
                  <p>• <strong>Status:</strong> Terdaftar Kemenag</p>
                  <p>• <strong>Kepala Madrasah:</strong> M. Zen Pamuji, S.Pd.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-retro-border flex items-center justify-between text-xs font-black uppercase text-brand-700 group-hover:text-retro-black">
                <span>Buka Rapor MA</span>
                <span className="w-8 h-8 rounded-lg bg-brand-500 text-white border-2 border-retro-border shadow-retro-sm flex items-center justify-center group-hover:translate-x-1 transition">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Khusus Login Admin Utama (Super Admin) */}
        {isSuperAdminModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border-3 border-retro-border shadow-retro-xl max-w-md w-full overflow-hidden my-auto text-retro-black">
              {/* Header Box */}
              <div className="p-5 text-center text-white relative bg-[#06330b] border-b-3 border-retro-border">
                <button
                  type="button"
                  onClick={() => setIsSuperAdminModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
                  title="Tutup Modal"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-14 h-14 rounded-2xl bg-retro-yellow text-retro-black p-2 mx-auto mb-3 border-2 border-retro-border shadow-retro-sm flex items-center justify-center">
                  <Crown className="w-8 h-8 fill-retro-black" />
                </div>

                <span className="badge-retro bg-retro-yellow text-retro-black text-[10px] font-black uppercase mb-1">
                  Kredensial Super Admin
                </span>

                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white mt-1">
                  LOGIN ADMIN UTAMA
                </h3>
                <p className="text-[11px] text-emerald-200 font-bold">
                  Akses Terpadu MTs Ma&apos;arif NU 2 &amp; MA Ma&apos;arif Nurus Salam
                </p>
              </div>

              {/* Form Box */}
              <div className="p-5 sm:p-6 space-y-4 bg-retro-cream">
                {superAdminError && (
                  <div className="p-3 rounded-xl bg-red-100 border-2 border-red-600 text-red-900 text-xs font-black shadow-retro-sm flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{superAdminError}</span>
                  </div>
                )}

                <form onSubmit={handleSuperAdminLogin} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-black text-retro-black uppercase block mb-1">
                      Username Admin Utama:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Username admin"
                      value={superAdminUsername}
                      onChange={e => setSuperAdminUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border-2 border-retro-border bg-white text-xs font-mono font-bold text-retro-black shadow-retro-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-retro-black uppercase block mb-1">
                      Kata Sandi:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Masukkan kata sandi admin"
                      value={superAdminPassword}
                      onChange={e => setSuperAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border-2 border-retro-border bg-white text-xs font-bold text-retro-black shadow-retro-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSuperAdminLoggingIn}
                    className="w-full py-3 btn-retro-primary text-xs font-black uppercase tracking-wider disabled:opacity-50 mt-3 flex items-center justify-center gap-2 shadow-retro-sm"
                  >
                    {isSuperAdminLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>MEMVERIFIKASI...</span>
                      </>
                    ) : (
                      <>
                        <span>MASUK KE DASHBOARD ADMIN UTAMA →</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-3 border-t-2 border-dashed border-slate-300 text-center">
                  <button
                    type="button"
                    onClick={() => setIsSuperAdminModalOpen(false)}
                    className="text-xs font-bold text-slate-500 hover:text-retro-black underline"
                  >
                    Batal dan kembali ke pilihan lembaga
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-slate-400 pb-4 relative z-10 font-bold">
          © {new Date().getFullYear()} Portal Rapor Internal Nusa Lodoyo • Bold Retro-Modernism Edition
        </footer>
      </main>
    );
  }

  // ================= VIEW 2: LOGIN SCREEN PER MADRASAH =================
  if (!currentUser) {
    const isMts = selectedMadrasah === "mts";
    const activeCfg = schoolConfig || getSchoolConfig(selectedMadrasah);

    return (
      <main className="min-h-screen bg-[#07130a] retro-dark-grid flex items-center justify-center p-3 sm:p-6 relative">
        <div className="w-full max-w-md bg-white rounded-2xl border-3 border-retro-border shadow-[8px_8px_0px_0px_#121814] overflow-hidden my-auto">
          {/* Header Box Retro */}
          <div className="p-5 sm:p-6 text-center text-white relative bg-[#06330b] border-b-3 border-retro-border">
            <button
              onClick={() => handleSwitchMadrasah()}
              className="absolute top-4 left-4 btn-retro bg-white text-retro-black px-2.5 py-1 text-[11px] flex items-center gap-1 shadow-retro-sm"
              title="Ganti Lembaga"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Ganti</span>
            </button>

            <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center mx-auto mb-3 border-2 border-retro-border shadow-retro-sm">
              <img
                src={isMts ? "/logo-mts.png" : "/logo-ma.png"}
                alt={isMts ? "Logo MTs" : "Logo MA"}
                className="w-full h-full object-contain"
              />
            </div>
            
            <span className="badge-retro bg-retro-yellow text-retro-black mb-1.5">
              {activeCfg.jenjang} • KMA 1503/2025
            </span>
            
            <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-white leading-tight">
              {activeCfg.nama_madrasah}
            </h2>
            <p className="text-[11px] text-brand-200 font-bold mt-0.5">
              {activeCfg.nama_yayasan}
            </p>
          </div>

          {/* Form Box */}
          <div className="p-5 sm:p-6 space-y-4 bg-retro-cream">
            {loginError && (
              <div className="p-3 rounded-lg bg-red-100 border-2 border-red-600 text-red-900 text-xs font-black shadow-retro-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  Username Akun:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: a_munawir, admin_mts"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-retro-border bg-white text-xs font-bold text-retro-black shadow-retro-sm focus:outline-none focus:border-brand-500 focus:shadow-retro transition"
                />
              </div>

              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  Kata Sandi:
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border-2 border-retro-border bg-white text-xs font-bold text-retro-black shadow-retro-sm focus:outline-none focus:border-brand-500 focus:shadow-retro transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 btn-retro-primary text-xs font-black uppercase tracking-wider disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-retro-sm"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>MEMVERIFIKASI...</span>
                  </>
                ) : (
                  <span>MASUK KE SISTEM →</span>
                )}
              </button>
            </form>

            {/* Security & Assistance Note */}
            <div className="pt-3 border-t-2 border-dashed border-slate-300 text-center space-y-1.5">
              <p className="text-[11px] text-slate-500 font-bold">
                Akses khusus Pendidik &amp; Tenaga Kependidikan {activeCfg.nama_madrasah}.
              </p>
              <button
                type="button"
                onClick={() => handleSwitchMadrasah()}
                className="text-[11px] font-black text-brand-700 hover:text-brand-900 underline inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Pilih Lembaga Lain</span>
              </button>
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
    <div className={`min-h-screen bg-retro-bg retro-grid-pattern flex flex-col ${isCetakRaporOpen ? "print:bg-white print:p-0 print:m-0" : ""}`}>
      <div className="no-print">
        <Navbar
          currentUser={currentUser}
          currentConfig={activeCfg}
          activePeriod={activePeriod || undefined}
          academicPeriods={academicPeriods}
          onSelectPeriod={handleSelectPeriod}
          onLogout={handleLogout}
          onSwitchMadrasah={handleSwitchMadrasah}
          onOpenLegger={() => handleOpenLegger()}
          onOpenCetakRapor={() => handleOpenCetakRapor()}
          onOpenSearch={() => setIsSearchOpen(true)}
          isWali={currentUser.role === "wali_kelas" || currentUser.role === "guru_walikelas" || isDualRole}
        />
      </div>

      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* DUAL ROLE SWITCHER PILL (Guru Mapel vs Wali Kelas) */}
        {isDualRole && currentUser.role !== "admin" && currentUser.role !== "kamad" && (
          <div className="card-retro p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 no-print bg-retro-cream">
            <div className="flex items-center space-x-2">
              <span className="badge-retro bg-brand-500 text-white">PENUGASAN GANDA</span>
              <span className="text-xs font-black text-retro-black hidden sm:inline">
                Pilih mode pengerjaan:
              </span>
            </div>
            <div className="flex items-center bg-white p-1 rounded-xl border-2 border-retro-border shadow-retro-sm">
              <button
                type="button"
                onClick={() => setDualRoleMode("guru")}
                className={`px-3 sm:px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
                  dualRoleMode === "guru"
                    ? "bg-brand-500 text-white shadow-retro-sm"
                    : "text-retro-black hover:bg-slate-100"
                }`}
              >
                👨‍🏫 Guru Mapel
              </button>
              <button
                type="button"
                onClick={() => setDualRoleMode("wali")}
                className={`px-3 sm:px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
                  dualRoleMode === "wali"
                    ? "bg-retro-yellow text-retro-black shadow-retro-sm"
                    : "text-retro-black hover:bg-slate-100"
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
            onSwitchMadrasah={handleSwitchMadrasah}
          />
        )}

        {/* 2. VIEW GURU MAPEL */}
        {(currentUser.role === "guru" || (isDualRole && dualRoleMode === "guru")) && currentUser.role !== "admin" && (
          <GuruDashboard
            madrasahId={selectedMadrasah}
            currentUser={currentUser}
            config={activeCfg}
            allKelas={dropdowns.kelas}
            allMapel={dropdowns.mapel}
            allEkskul={dropdowns.ekskul}
            tahun={filterTahun}
            semester={filterSemester}
            activePeriodLabel={activePeriod?.label}
            onSwitchToWali={isDualRole ? () => setDualRoleMode("wali") : undefined}
            onUserUpdated={u => setCurrentUser(u)}
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
            tahun={filterTahun}
            semester={filterSemester}
            activePeriodLabel={activePeriod?.label}
            onOpenLegger={k => handleOpenLegger(k)}
            onOpenCetakRapor={k => handleOpenCetakRapor(k)}
            onSwitchToGuru={isDualRole ? () => setDualRoleMode("guru") : undefined}
          />
        )}

        {/* 4. VIEW KEPALA MADRASAH (KAMAD) */}
        {currentUser.role === "kamad" && (
          <div className="space-y-5">
            <div className="card-retro-lg bg-retro-cream p-6 border-3 border-retro-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="badge-retro bg-brand-500 text-white mb-2">
                  DASHBOARD KEPALA MADRASAH
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-retro-black">
                  {currentUser.nama_user}
                </h2>
                <p className="text-xs text-slate-600 font-bold mt-1">
                  {activeCfg.nama_madrasah} • NSM: {activeCfg.nsm}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenLegger()}
                  className="btn-retro-white px-4 py-2 text-xs"
                >
                  📊 Tinjau Legger Kelas
                </button>
                <button
                  onClick={() => handleOpenCetakRapor()}
                  className="btn-retro-yellow px-4 py-2 text-xs"
                >
                  🖨️ Cetak Lembar Rapor
                </button>
              </div>
            </div>

            {/* Monitoring per Rombel */}
            <div className="card-retro p-5 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-retro-border pb-3">
                <h3 className="text-sm font-black uppercase text-retro-black">
                  Monitoring Progres Nilai Seluruh Rombel ({dropdowns.kelas.length} Kelas)
                </h3>
                <span className="badge-retro bg-retro-yellow text-retro-black">
                  KMA 1503/2025
                </span>
              </div>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {dropdowns.kelas.map(k => (
                  <div
                    key={k}
                    onClick={() => handleOpenLegger(k)}
                    className="p-3 rounded-xl border-2 border-retro-border bg-white hover:bg-brand-50 hover:-translate-y-0.5 shadow-retro-sm cursor-pointer transition text-center space-y-1"
                  >
                    <span className="text-xs font-black text-retro-black block">
                      Kelas {k}
                    </span>
                    <span className="text-[10px] text-brand-700 font-black block">
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

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        madrasahId={selectedMadrasah}
        schoolName={activeCfg.nama_madrasah}
      />
    </div>
  );
}
