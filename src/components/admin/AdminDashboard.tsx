"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MadrasahId,
  User,
  HomeroomAssignment,
  SchoolConfig,
  Siswa,
  AcademicPeriod,
  LoginLogItem,
  MatriksOverviewMadrasah,
  MatriksKelasProgress,
} from "@/types";
import {
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  getHomeroomAssignments,
  setHomeroomAssignment,
  getRekapKirimNilaiKelas,
  updateSchoolConfig,
  getAllSiswa,
  sortRombelList,
  getAcademicPeriods,
  getActivePeriod,
  setActivePeriod,
  addAcademicYear,
  getLoginLogs,
  clearLoginLogs,
  getMatriksNilaiMadrasah,
} from "@/lib/storage";
import {
  Users,
  BookOpen,
  UserCheck,
  Activity,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Search,
  Edit3,
  X,
  GraduationCap,
  BarChart3,
  Check,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  Laptop,
  Calendar,
  Grid,
  List,
  Sparkles,
} from "lucide-react";

interface Props {
  madrasahId: MadrasahId;
  config: SchoolConfig;
  allKelas: string[];
  allMapel: { kode: string; nama: string; kelompok?: string; kkm?: number }[];
  onConfigUpdated: (cfg: SchoolConfig) => void;
}

export default function AdminDashboard({
  madrasahId,
  config,
  allKelas,
  allMapel,
  onConfigUpdated,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "visualisasi" | "guru" | "wali" | "siswa" | "monitoring" | "logs" | "pengaturan"
  >("visualisasi");

  const [teachers, setTeachers] = useState<User[]>([]);
  const [homerooms, setHomerooms] = useState<HomeroomAssignment[]>([]);
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Urutan rombel yang rapi VII -> VIII -> IX atau X -> XI -> XII
  const sortedKelas = useMemo(() => sortRombelList(allKelas), [allKelas]);

  // Visualisasi Data Penilaian State
  const [matriksOverview, setMatriksOverview] = useState<MatriksOverviewMadrasah | null>(null);
  const [visViewMode, setVisViewMode] = useState<"grid" | "matrix">("grid");
  const [visFilterStatus, setVisFilterStatus] = useState<"all" | "lengkap" | "sebagian" | "kosong">("all");
  const [visFilterTingkat, setVisFilterTingkat] = useState<string>("all");
  const [visSearchKelas, setVisSearchKelas] = useState<string>("");
  const [selectedDetailKelas, setSelectedDetailKelas] = useState<MatriksKelasProgress | null>(null);

  // Riwayat Log Login State
  const [loginLogs, setLoginLogs] = useState<LoginLogItem[]>([]);
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logFilterRole, setLogFilterRole] = useState("all");
  const [logFilterStatus, setLogFilterStatus] = useState("all");

  // Search filter for teacher table
  const [searchTeacher, setSearchTeacher] = useState("");

  // Search filter for siswa table
  const [searchSiswaQuery, setSearchSiswaQuery] = useState("");
  const [filterSiswaKelas, setFilterSiswaKelas] = useState("all");

  // Form states: Tambah Guru
  const [newNama, setNewNama] = useState("");
  const [newNip, setNewNip] = useState("-");
  const [newJk, setNewJk] = useState<"L" | "P">("L");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("Matsamuda22");

  // Edit Teacher Modal State
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editNip, setEditNip] = useState("-");
  const [editJk, setEditJk] = useState<"L" | "P">("L");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");

  // Form states: Penugasan Wali Kelas
  const [waliKelasTarget, setWaliKelasTarget] = useState("");
  const [waliGuruTarget, setWaliGuruTarget] = useState("");

  // Monitoring selected class
  const [monitorKelas, setMonitorKelas] = useState("");

  // Form config
  const [cfgNamaKamad, setCfgNamaKamad] = useState(config.kepala_madrasah);
  const [cfgNipKamad, setCfgNipKamad] = useState(config.nip_kepala);
  const [cfgTglRapor, setCfgTglRapor] = useState(config.tanggal_rapor || "19 Desember 2026");
  const [cfgKotaTgl, setCfgKotaTgl] = useState(config.kota_tanggal || "Blitar");

  // Academic Periods State
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [activePeriodId, setActivePeriodId] = useState("");
  const [newYearInput, setNewYearInput] = useState(2028);

  const refreshData = () => {
    const t = getTeachers(madrasahId);
    setTeachers(t);
    const h = getHomeroomAssignments(madrasahId);
    setHomerooms(h);
    const s = getAllSiswa(madrasahId);
    setAllSiswa(s);

    const pers = getAcademicPeriods(madrasahId);
    setPeriods(pers);
    const curActive = getActivePeriod(madrasahId);
    setActivePeriodId(curActive.id);

    // Refresh Matriks Visualisasi Pengisian Nilai
    const overview = getMatriksNilaiMadrasah(madrasahId, curActive.tahun, curActive.semester);
    setMatriksOverview(overview);

    // Refresh Log Riwayat Login
    const logs = getLoginLogs(madrasahId);
    setLoginLogs(logs);

    if (sortedKelas.length > 0 && !waliKelasTarget) setWaliKelasTarget(sortedKelas[0]);
    if (sortedKelas.length > 0 && !monitorKelas) setMonitorKelas(sortedKelas[0]);
  };

  useEffect(() => {
    refreshData();
  }, [madrasahId]);

  // Guru Handlers
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newUsername.trim()) {
      setMessage({ type: "error", text: "Nama dan username wajib diisi!" });
      return;
    }
    const res = addTeacher(madrasahId, {
      nama_user: newNama,
      nip: newNip,
      jenis_kelamin: newJk,
      username: newUsername,
      password: newPassword,
    });
    if (res.success) {
      setMessage({ type: "success", text: res.message });
      setNewNama("");
      setNewNip("-");
      setNewUsername("");
      setNewPassword("Matsamuda22");
      refreshData();
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  const openEditTeacher = (t: User) => {
    setEditingTeacher(t);
    setEditNama(t.nama_user);
    setEditNip(t.nip || "-");
    setEditJk(t.jenis_kelamin || "L");
    setEditUsername(t.username);
    setEditPassword(t.password || "Matsamuda22");
  };

  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (!editNama.trim() || !editUsername.trim()) {
      setMessage({ type: "error", text: "Nama dan username wajib diisi!" });
      return;
    }

    const res = updateTeacher(madrasahId, {
      ...editingTeacher,
      nama_user: editNama.trim(),
      nip: editNip.trim(),
      jenis_kelamin: editJk,
      username: editUsername.trim().toLowerCase(),
      password: editPassword.trim(),
    });

    if (res.success) {
      setMessage({ type: "success", text: res.message });
      setEditingTeacher(null);
      refreshData();
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  const handleDeleteTeacher = (id: string, nama: string) => {
    if (confirm(`Hapus guru ${nama} dari sistem? Penugasan wali kelas terkait juga akan dibersihkan.`)) {
      deleteTeacher(madrasahId, id);
      setMessage({ type: "success", text: `Guru ${nama} telah dihapus.` });
      refreshData();
    }
  };

  const handleSetWali = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waliKelasTarget) return;

    const g = teachers.find(t => t.id === waliGuruTarget);
    const res = setHomeroomAssignment(
      madrasahId,
      waliKelasTarget,
      waliGuruTarget ? (g ? g.id : "") : "",
      waliGuruTarget ? (g ? g.nama_user : "") : ""
    );

    setMessage({ type: "success", text: res.message });
    refreshData();
  };

  // Periode & Konfigurasi Handlers
  const handleSelectActivePeriod = (periodId: string) => {
    const res = setActivePeriod(madrasahId, periodId);
    if (res.success) {
      setActivePeriodId(periodId);
      setMessage({ type: "success", text: res.message });
      const curPer = periods.find(p => p.id === periodId);
      if (curPer) {
        const updatedCfg: SchoolConfig = {
          ...config,
          tahun_ajaran_aktif: curPer.tahun,
          semester_aktif: curPer.semester,
        };
        onConfigUpdated(updatedCfg);
      }
      refreshData();
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (activePeriodId) {
      setActivePeriod(madrasahId, activePeriodId);
    }

    const curPer = periods.find(p => p.id === activePeriodId);
    const updated: SchoolConfig = {
      ...config,
      kepala_madrasah: cfgNamaKamad,
      nip_kepala: cfgNipKamad,
      tanggal_rapor: cfgTglRapor,
      kota_tanggal: cfgKotaTgl,
      tahun_ajaran_aktif: curPer ? curPer.tahun : config.tahun_ajaran_aktif,
      semester_aktif: curPer ? curPer.semester : config.semester_aktif,
    };
    updateSchoolConfig(madrasahId, updated);
    onConfigUpdated(updated);
    setMessage({ type: "success", text: "Pengaturan madrasah & tahun ajaran aktif berhasil disimpan!" });
    refreshData();
  };

  const handleAddAcademicYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput || newYearInput < 2024 || newYearInput > 2050) {
      setMessage({ type: "error", text: "Masukkan tahun awal yang valid (misal 2028)!" });
      return;
    }
    const res = addAcademicYear(madrasahId, newYearInput);
    if (res.success) {
      setMessage({ type: "success", text: res.message });
      setPeriods(res.periods);
      setNewYearInput(newYearInput + 1);
      refreshData();
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  const handleClearLogs = () => {
    if (confirm("Apakah Anda yakin ingin membersihkan seluruh riwayat log login?")) {
      clearLoginLogs(madrasahId);
      setLoginLogs([]);
      setMessage({ type: "success", text: "Riwayat log login berhasil dibersihkan." });
    }
  };

  // Data Filtering: Guru
  const filteredTeachers = useMemo(() => {
    const q = searchTeacher.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      t =>
        t.nama_user.toLowerCase().includes(q) ||
        t.username.toLowerCase().includes(q) ||
        (t.nip && t.nip.includes(q))
    );
  }, [teachers, searchTeacher]);

  // Data Filtering: Siswa
  const filteredSiswaList = useMemo(() => {
    let list = allSiswa;
    if (filterSiswaKelas !== "all") {
      list = list.filter(s => s.kelas.trim().toUpperCase() === filterSiswaKelas.trim().toUpperCase());
    }
    const q = searchSiswaQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        s =>
          s.nama_siswa.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          (s.nisn && s.nisn.toLowerCase().includes(q)) ||
          s.kelas.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allSiswa, filterSiswaKelas, searchSiswaQuery]);

  // Data Filtering: Visualisasi Nilai Per Kelas
  const filteredVisKelas = useMemo(() => {
    if (!matriksOverview) return [];
    let list = matriksOverview.list_kelas;

    // Filter Status
    if (visFilterStatus !== "all") {
      list = list.filter(k => k.status_kelas === visFilterStatus);
    }

    // Filter Tingkat Kelas
    if (visFilterTingkat !== "all") {
      list = list.filter(k => {
        const u = k.kelas.toUpperCase();
        if (visFilterTingkat === "7") return u.startsWith("VII") || u.startsWith("7");
        if (visFilterTingkat === "8") return u.startsWith("VIII") || u.startsWith("8");
        if (visFilterTingkat === "9") return u.startsWith("IX") || u.startsWith("9");
        if (visFilterTingkat === "10") return u.startsWith("X") || u.startsWith("10");
        if (visFilterTingkat === "11") return u.startsWith("XI") || u.startsWith("11");
        if (visFilterTingkat === "12") return u.startsWith("XII") || u.startsWith("12");
        return true;
      });
    }

    // Filter Search Kelas
    const q = visSearchKelas.trim().toLowerCase();
    if (q) {
      list = list.filter(k => k.kelas.toLowerCase().includes(q));
    }

    return list;
  }, [matriksOverview, visFilterStatus, visFilterTingkat, visSearchKelas]);

  // Data Filtering: Log Riwayat Login
  const filteredLogs = useMemo(() => {
    let list = loginLogs;
    if (logFilterRole !== "all") {
      list = list.filter(l => l.role === logFilterRole);
    }
    if (logFilterStatus !== "all") {
      list = list.filter(l => l.status === logFilterStatus);
    }
    const q = logSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        l =>
          l.nama_user.toLowerCase().includes(q) ||
          l.username.toLowerCase().includes(q) ||
          l.browser_device.toLowerCase().includes(q) ||
          l.timestamp.toLowerCase().includes(q)
      );
    }
    return list;
  }, [loginLogs, logFilterRole, logFilterStatus, logSearchQuery]);

  // Monitoring Kirim (Tab Monitoring)
  const rekapKirim = useMemo(() => {
    if (!monitorKelas) return [];
    return getRekapKirimNilaiKelas(madrasahId, monitorKelas);
  }, [madrasahId, monitorKelas]);

  const mapelSudahKirim = useMemo(() => {
    return rekapKirim.filter(r => r.is_sent).length;
  }, [rekapKirim]);

  const activePeriodObj = periods.find(p => p.id === activePeriodId);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Alert Notifikasi */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border-2 border-retro-border text-xs font-black shadow-retro-sm flex items-center justify-between ${
            message.type === "success"
              ? "bg-brand-100 text-brand-900"
              : "bg-red-100 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-brand-700" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-700" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-retro-black hover:text-red-700 font-black">
            ✕
          </button>
        </div>
      )}

      {/* Header Operator Retro */}
      <div className="card-retro-lg bg-retro-cream p-5 sm:p-6 border-3 border-retro-border flex flex-wrap items-center justify-between gap-4 shadow-retro-lg">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1 border-2 border-retro-border shadow-retro-sm flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={config.id === "mts" ? "/logo-mts.png" : "/logo-ma.png"}
              alt={config.id === "mts" ? "Logo MTs" : "Logo MA"}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-retro bg-brand-500 text-white">
                OPERATOR • {config.jenjang}
              </span>
              <span className="badge-retro bg-retro-yellow text-retro-black font-black">
                {activePeriodObj?.label || "Gasal 2026/2027"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-retro-black mt-1">
              PANEL ADMINISTRATOR MADRASAH
            </h2>
            <p className="text-xs text-slate-600 font-bold">{config.nama_madrasah}</p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="bg-white border-2 border-retro-border px-3.5 py-1.5 rounded-lg shadow-retro-sm">
            <span className="text-slate-500 block text-[9px] font-black uppercase">Guru Terdaftar</span>
            <span className="font-black text-retro-black text-sm">{teachers.length} Personel</span>
          </div>
          <div className="bg-retro-yellow border-2 border-retro-border px-3.5 py-1.5 rounded-lg shadow-retro-sm">
            <span className="text-retro-black block text-[9px] font-black uppercase">Total Rombel</span>
            <span className="font-black text-retro-black text-sm">{allKelas.length} Kelas</span>
          </div>
          <div className="bg-brand-500 text-white border-2 border-retro-border px-3.5 py-1.5 rounded-lg shadow-retro-sm">
            <span className="text-brand-100 block text-[9px] font-black uppercase">Progres Nilai</span>
            <span className="font-black text-sm">{matriksOverview?.rata_rata_persen || 0}%</span>
          </div>
        </div>
      </div>

      {/* Nav Tabs Bold Retro (6 Tab Lengkap Sesuai Permintaan) */}
      <div className="flex flex-wrap items-center gap-2 bg-retro-cream p-2 rounded-xl border-2 border-retro-border shadow-retro-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("visualisasi")}
          className={
            activeTab === "visualisasi"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"
          }
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>1. Dashboard Nilai ({matriksOverview?.rata_rata_persen || 0}%)</span>
        </button>

        <button
          onClick={() => setActiveTab("guru")}
          className={
            activeTab === "guru"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"
          }
        >
          <Users className="w-3.5 h-3.5" />
          <span>2. Guru & Akun ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wali")}
          className={
            activeTab === "wali"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"
          }
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>3. Wali Kelas ({homerooms.length}/{sortedKelas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("siswa")}
          className={
            activeTab === "siswa"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"
          }
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>4. Database Siswa ({allSiswa.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={
            activeTab === "logs"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"
          }
        >
          <Shield className="w-3.5 h-3.5" />
          <span>5. Riwayat Login ({loginLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pengaturan")}
          className={
            activeTab === "pengaturan"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"
          }
        >
          <Settings className="w-3.5 h-3.5" />
          <span>6. Semester & Pengaturan</span>
        </button>
      </div>

      {/* ================= TAB 1: VISUALISASI DATA PENILAIAN ================= */}
      {activeTab === "visualisasi" && (
        <div className="space-y-5">
          {/* 4 Card KPI Statistik Visual */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="card-retro p-4 bg-white space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Total Rombongan Belajar</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-retro-black">{matriksOverview?.total_kelas || 0}</span>
                <span className="text-xs font-bold text-slate-500">Kelas</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold">Terdaftar aktif di jenjang {config.jenjang}</p>
            </div>

            <div className="card-retro p-4 bg-retro-yellow space-y-1">
              <span className="text-[10px] font-black uppercase text-retro-black block">Progres Pengisian Madrasah</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-retro-black">{matriksOverview?.rata_rata_persen || 0}%</span>
                <span className="text-xs font-black text-retro-black">Selesai</span>
              </div>
              <div className="w-full bg-white/70 h-2 rounded-full border border-retro-border overflow-hidden mt-1">
                <div
                  className="bg-brand-600 h-full transition-all duration-500"
                  style={{ width: `${matriksOverview?.rata_rata_persen || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="card-retro p-4 bg-white space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Status Kelengkapan Kelas</span>
              <div className="flex items-center gap-2 pt-1 text-xs font-black">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {matriksOverview?.kelas_lengkap || 0} Lengkap
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  {matriksOverview?.kelas_sebagian || 0} Proses
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                {matriksOverview?.kelas_kosong || 0} kelas belum ada nilai
              </p>
            </div>

            <div className="card-retro p-4 bg-white space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Total Peserta Didik</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-retro-black">{matriksOverview?.total_siswa || 0}</span>
                <span className="text-xs font-bold text-slate-500">Siswa</span>
              </div>
              <p className="text-[10px] text-brand-700 font-bold">
                {allMapel.length} Mapel Wajib (KMA 1503)
              </p>
            </div>
          </div>

          {/* Toolbar Filter & View Switcher */}
          <div className="card-retro p-4 bg-retro-cream flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase text-retro-black">Status:</span>
                <select
                  value={visFilterStatus}
                  onChange={e => setVisFilterStatus(e.target.value as any)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border-2 border-retro-border bg-white font-black shadow-retro-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="lengkap">✓ Lengkap (100%)</option>
                  <option value="sebagian">⏳ Sedang Diisi</option>
                  <option value="kosong">✕ Belum Ada Nilai</option>
                </select>
              </div>

              {/* Filter Tingkat */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase text-retro-black">Tingkat:</span>
                <select
                  value={visFilterTingkat}
                  onChange={e => setVisFilterTingkat(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border-2 border-retro-border bg-white font-black shadow-retro-sm"
                >
                  <option value="all">Semua Tingkat</option>
                  {config.jenjang === "MTs" ? (
                    <>
                      <option value="7">Kelas VII (7)</option>
                      <option value="8">Kelas VIII (8)</option>
                      <option value="9">Kelas IX (9)</option>
                    </>
                  ) : (
                    <>
                      <option value="10">Kelas X (10)</option>
                      <option value="11">Kelas XI (11)</option>
                      <option value="12">Kelas XII (12)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Input Cari Kelas */}
              <div className="relative w-40 sm:w-48">
                <input
                  type="text"
                  value={visSearchKelas}
                  onChange={e => setVisSearchKelas(e.target.value)}
                  placeholder="Cari kelas..."
                  className="w-full text-xs py-1.5 pl-7 pr-2 rounded-lg border-2 border-retro-border bg-white font-black shadow-retro-sm"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>
            </div>

            {/* View Mode Switcher (Grid vs Matrix Heatmap) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase text-retro-black hidden sm:inline">Tampilan:</span>
              <div className="flex items-center bg-white rounded-lg border-2 border-retro-border p-0.5 shadow-retro-sm">
                <button
                  type="button"
                  onClick={() => setVisViewMode("grid")}
                  className={`px-2.5 py-1 rounded text-xs font-black flex items-center gap-1 transition ${
                    visViewMode === "grid"
                      ? "bg-brand-500 text-white"
                      : "text-slate-600 hover:text-retro-black"
                  }`}
                  title="Tampilan Kartu Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisViewMode("matrix")}
                  className={`px-2.5 py-1 rounded text-xs font-black flex items-center gap-1 transition ${
                    visViewMode === "matrix"
                      ? "bg-brand-500 text-white"
                      : "text-slate-600 hover:text-retro-black"
                  }`}
                  title="Tampilan Matriks Panas Kelas vs Mapel"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Matriks</span>
                </button>
              </div>

              <button
                type="button"
                onClick={refreshData}
                className="btn-retro-white p-1.5 text-xs font-black"
                title="Segarkan Data"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-700" />
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: GRID KARTU KELAS */}
          {visViewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVisKelas.map(k => {
                let badgeClass = "bg-slate-100 text-slate-700 border-slate-300";
                let badgeText = "Belum Ada Nilai";
                let borderHighlight = "border-retro-border";

                if (k.persen_progres === 100) {
                  badgeClass = "bg-emerald-500 text-white border-emerald-700";
                  badgeText = "✓ Lengkap 100%";
                  borderHighlight = "border-emerald-600 shadow-retro-sm";
                } else if (k.persen_progres > 0) {
                  badgeClass = "bg-amber-400 text-retro-black border-amber-600";
                  badgeText = `⏳ ${k.persen_progres}% Selesai`;
                  borderHighlight = "border-amber-500 shadow-retro-sm";
                }

                return (
                  <div
                    key={k.kelas}
                    className={`card-retro p-4 bg-white border-2 ${borderHighlight} space-y-3 hover:translate-y-[-2px] transition duration-150 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b-2 border-slate-100 pb-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400">Rombel</span>
                          <h4 className="text-base font-black text-retro-black">Kelas {k.kelas}</h4>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </div>

                      {/* Progress bar visual */}
                      <div className="space-y-1 mt-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-600">Mapel Terisi:</span>
                          <span className="font-mono font-black text-retro-black">
                            {k.mapel_lengkap} / {k.total_mapel} Mapel
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full border border-retro-border overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              k.persen_progres === 100
                                ? "bg-emerald-500"
                                : k.persen_progres > 0
                                ? "bg-amber-400"
                                : "bg-slate-300"
                            }`}
                            style={{ width: `${k.persen_progres}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Detail mini info */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 text-[11px] font-bold">
                        <div>
                          <span className="text-slate-400 text-[9px] uppercase block">Jumlah Siswa:</span>
                          <span className="text-retro-black">{k.total_siswa} Peserta</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] uppercase block">Belum Terisi:</span>
                          <span className="text-red-700 font-mono font-black">{k.mapel_kosong} Mapel</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedDetailKelas(k)}
                      className="w-full py-1.5 px-3 btn-retro-white text-xs font-black flex items-center justify-center gap-1.5 shadow-retro-sm mt-3"
                    >
                      <Eye className="w-3.5 h-3.5 text-brand-600" />
                      <span>Cek Status Seluruh Mapel</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: MATRIKS LENGKAP KELAS VS MAPEL */}
          {visViewMode === "matrix" && (
            <div className="card-retro p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-retro-black uppercase">
                    Matriks Pengisian Nilai (Kelas × Mata Pelajaran KMA 1503)
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold">
                    Hijau (✓) = Nilai Terisi Penuh / Terkirim • Kuning (⏳) = Terisi Sebagian • Abu/Silang (✕) = Belum Terisi
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm max-h-[600px] overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-retro-yellow text-retro-black font-black uppercase sticky top-0 z-20 border-b-2 border-retro-border">
                    <tr>
                      <th className="py-2.5 px-3 w-28 bg-retro-yellow sticky left-0 z-30 border-r-2 border-retro-border">
                        Kelas
                      </th>
                      <th className="py-2.5 px-3 w-24 text-center border-r-2 border-retro-border">
                        Progres
                      </th>
                      {allMapel.map(m => (
                        <th
                          key={m.kode}
                          title={`${m.kode} - ${m.nama}`}
                          className="py-2.5 px-2 text-center border-r border-slate-300 min-w-[70px]"
                        >
                          <span className="block text-[10px] font-mono">{m.kode}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100 font-bold">
                    {filteredVisKelas.map(k => (
                      <tr key={k.kelas} className="hover:bg-brand-50/30">
                        <td className="py-2 px-3 font-black text-retro-black sticky left-0 z-10 bg-white border-r-2 border-retro-border">
                          Kelas {k.kelas}
                        </td>
                        <td className="py-2 px-2 text-center border-r-2 border-retro-border font-mono font-black">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              k.persen_progres === 100
                                ? "bg-emerald-100 text-emerald-800"
                                : k.persen_progres > 0
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {k.persen_progres}%
                          </span>
                        </td>
                        {allMapel.map(m => {
                          const item = k.details.find(d => d.kode_mapel.toLowerCase() === m.kode.toLowerCase());
                          const isFull = item?.status === "lengkap";
                          const isHalf = item?.status === "sebagian";

                          return (
                            <td
                              key={m.kode}
                              className="py-1.5 px-1 text-center border-r border-slate-200"
                              title={`${m.nama} di Kelas ${k.kelas}: ${
                                isFull
                                  ? `Terisi Lengkap (${item?.siswa_ternilai}/${item?.total_siswa} siswa) - Guru: ${item?.guru_pengampu}`
                                  : isHalf
                                  ? `Terisi Sebagian (${item?.siswa_ternilai}/${item?.total_siswa} siswa) - Guru: ${item?.guru_pengampu}`
                                  : `Belum Terisi - Guru: ${item?.guru_pengampu}`
                              }`}
                            >
                              {isFull ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-500 text-white font-black text-xs shadow-retro-sm">
                                  ✓
                                </span>
                              ) : isHalf ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-400 text-retro-black font-black text-xs shadow-retro-sm">
                                  ⏳
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-slate-400 font-black text-xs">
                                  ✕
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODAL DRILL-DOWN DETAIL MAPEL PER KELAS */}
          {selectedDetailKelas && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="card-retro bg-white max-w-3xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b-2 border-retro-border pb-3">
                  <div>
                    <span className="badge-retro bg-brand-500 text-white text-[10px]">
                      DETAIL STATUS NILAI
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-retro-black uppercase mt-1">
                      Kelas {selectedDetailKelas.kelas} ({selectedDetailKelas.total_siswa} Siswa)
                    </h3>
                    <p className="text-xs text-slate-600 font-bold">
                      Kelengkapan: {selectedDetailKelas.mapel_lengkap} dari {selectedDetailKelas.total_mapel} Mapel Terisi ({selectedDetailKelas.persen_progres}%)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailKelas(null)}
                    className="p-1.5 rounded-lg border-2 border-retro-border bg-slate-100 hover:bg-red-100 font-black text-retro-black"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-retro-yellow text-retro-black font-black uppercase border-b-2 border-retro-border">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-3 w-20">Kode</th>
                        <th className="py-2.5 px-3">Mata Pelajaran (KMA 1503)</th>
                        <th className="py-2.5 px-3">Guru Pengampu</th>
                        <th className="py-2.5 px-3 w-28 text-center">Siswa Ternilai</th>
                        <th className="py-2.5 px-3 w-28 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100 font-bold">
                      {selectedDetailKelas.details.map((m, idx) => (
                        <tr key={m.kode_mapel} className="hover:bg-brand-50/40">
                          <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono text-brand-800">{m.kode_mapel}</td>
                          <td className="py-2 px-3 text-retro-black">{m.nama_mapel}</td>
                          <td className="py-2 px-3 text-slate-700">{m.guru_pengampu}</td>
                          <td className="py-2 px-3 text-center font-mono">
                            {m.siswa_ternilai} / {m.total_siswa}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {m.status === "lengkap" ? (
                              <span className="badge-retro bg-emerald-500 text-white text-[10px]">
                                ✓ Terisi
                              </span>
                            ) : m.status === "sebagian" ? (
                              <span className="badge-retro bg-amber-400 text-retro-black text-[10px]">
                                ⏳ Sebagian
                              </span>
                            ) : (
                              <span className="badge-retro bg-slate-200 text-slate-600 text-[10px]">
                                ✕ Kosong
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailKelas(null)}
                    className="btn-retro-primary py-2 px-4 text-xs font-black uppercase"
                  >
                    Tutup Detail
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MANAJEMEN GURU & AKUN ================= */}
      {activeTab === "guru" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Form Tambah Guru */}
          <div className="card-retro p-5 space-y-4 bg-retro-cream">
            <h4 className="text-xs font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-retro-border pb-2">
              <Plus className="w-4 h-4 text-brand-600" />
              Tambah Guru / Pendidik
            </h4>
            <form onSubmit={handleAddTeacher} className="space-y-3">
              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={e => setNewNama(e.target.value)}
                  placeholder="Contoh: Siti Fatimah, S.Pd.I."
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">NIK / NUPTK:</label>
                <input
                  type="text"
                  value={newNip}
                  onChange={e => setNewNip(e.target.value)}
                  placeholder="35051..."
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-mono font-bold shadow-retro-sm focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Jenis Kelamin:</label>
                <select
                  value={newJk}
                  onChange={e => setNewJk(e.target.value as any)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm focus:border-brand-500"
                >
                  <option value="L">Laki-Laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Username Login:</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="Contoh: sitifatimah"
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-mono font-bold shadow-retro-sm focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Kata Sandi Awal:</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-mono font-bold shadow-retro-sm focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 btn-retro-primary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-retro-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Akun Guru</span>
              </button>
            </form>
          </div>

          {/* Tabel Daftar Guru */}
          <div className="lg:col-span-2 card-retro p-5 space-y-4 bg-white">
            <div className="flex flex-wrap items-center justify-between border-b-2 border-retro-border pb-3 gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                  Daftar Pendidik ({teachers.length} Guru Terdaftar)
                </h4>
                <p className="text-[11px] text-slate-500 font-bold">
                  Seluruh guru aktif di {config.nama_madrasah}
                </p>
              </div>

              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  value={searchTeacher}
                  onChange={e => setSearchTeacher(e.target.value)}
                  placeholder="Cari nama atau username..."
                  className="w-full text-xs py-1.5 pl-7 pr-2.5 rounded-lg border-2 border-retro-border bg-retro-cream font-bold"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Nama Lengkap & NIK</th>
                    <th className="py-2.5 px-3 w-28">Username</th>
                    <th className="py-2.5 px-3 w-28">Password</th>
                    <th className="py-2.5 px-3 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 font-bold">
                  {filteredTeachers.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-brand-50/40">
                      <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 text-retro-black">
                        <div>{t.nama_user}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NIK: {t.nip || "-"} • ({t.jenis_kelamin || "-"})</div>
                      </td>
                      <td className="py-2 px-3 font-mono text-brand-800">@{t.username}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{t.password || "Matsamuda22"}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditTeacher(t)}
                            className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black"
                            title="Edit Data Guru"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeacher(t.id, t.nama_user)}
                            className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 font-black"
                            title="Hapus Akun Guru"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT GURU MODAL */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="card-retro bg-white max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-retro-border pb-2">
              <h4 className="text-xs font-black text-retro-black uppercase">Edit Akun Guru</h4>
              <button onClick={() => setEditingTeacher(null)} className="font-black text-slate-500 hover:text-retro-black">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditTeacher} className="space-y-3 font-bold">
              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={e => setEditNama(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-retro-cream"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">NIK / NUPTK:</label>
                <input
                  type="text"
                  value={editNip}
                  onChange={e => setEditNip(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-retro-cream font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Jenis Kelamin:</label>
                <select
                  value={editJk}
                  onChange={e => setEditJk(e.target.value as any)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-retro-cream"
                >
                  <option value="L">Laki-Laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Username:</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-retro-cream font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Kata Sandi:</label>
                <input
                  type="text"
                  required
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-retro-cream font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="w-1/2 py-2 btn-retro-white text-xs font-black uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 btn-retro-primary text-xs font-black uppercase"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PENUGASAN WALI KELAS ================= */}
      {activeTab === "wali" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="card-retro p-5 space-y-4 bg-retro-cream">
            <h4 className="text-xs font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-retro-border pb-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Atur Wali Kelas
            </h4>
            <form onSubmit={handleSetWali} className="space-y-3 font-bold">
              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Pilih Kelas / Rombel:</label>
                <select
                  value={waliKelasTarget}
                  onChange={e => setWaliKelasTarget(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm font-black"
                >
                  {sortedKelas.map(k => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Pilih Guru Sebagai Wali Kelas:</label>
                <select
                  value={waliGuruTarget}
                  onChange={e => setWaliGuruTarget(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm font-bold"
                >
                  <option value="">-- Kosongkan Wali Kelas --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nama_user} ({t.username})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 btn-retro-primary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-retro-sm"
              >
                <Check className="w-4 h-4" />
                <span>Tetapkan Wali Kelas</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 card-retro p-5 space-y-4 bg-white">
            <div className="border-b-2 border-retro-border pb-3">
              <h4 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                Daftar Wali Kelas Terdaftar ({homerooms.length} / {sortedKelas.length} Rombel)
              </h4>
              <p className="text-[11px] text-slate-500 font-bold">
                Wali kelas berwenang mengelola legger nilai, presensi, catatan, dan mencetak rapor.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-28">Kelas</th>
                    <th className="py-2.5 px-3">Nama Wali Kelas</th>
                    <th className="py-2.5 px-3 w-32 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 font-bold">
                  {sortedKelas.map((kelas, idx) => {
                    const h = homerooms.find(item => item.kelas === kelas);
                    return (
                      <tr key={kelas} className="hover:bg-brand-50/40">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-black text-retro-black">Kelas {kelas}</td>
                        <td className="py-2.5 px-3">
                          {h?.wali_guru_nama ? (
                            <span className="text-brand-900">{h.wali_guru_nama}</span>
                          ) : (
                            <span className="text-slate-400 italic">Belum ditentukan</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {h?.wali_guru_nama ? (
                            <span className="badge-retro bg-brand-500 text-white text-[10px]">
                              ✓ Aktif
                            </span>
                          ) : (
                            <span className="badge-retro bg-slate-200 text-slate-700 text-[10px]">
                              Kosong
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: DATABASE SISWA ================= */}
      {activeTab === "siswa" && (
        <div className="card-retro p-5 space-y-4 bg-white">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-retro-border pb-3 gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-brand-600" />
                Database Peserta Didik Madrasah ({allSiswa.length} Siswa)
              </h4>
              <p className="text-[11px] text-slate-500 font-bold">
                Cari dan pantau data siswa aktif per rombongan belajar.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-black text-retro-black uppercase">Rombel:</label>
                <select
                  value={filterSiswaKelas}
                  onChange={e => setFilterSiswaKelas(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border-2 border-retro-border bg-retro-cream font-bold shadow-retro-sm"
                >
                  <option value="all">Semua Rombel ({sortedKelas.length})</option>
                  {sortedKelas.map(k => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  value={searchSiswaQuery}
                  onChange={e => setSearchSiswaQuery(e.target.value)}
                  placeholder="Cari nama, NIS, NISN..."
                  className="w-full text-xs py-1.5 pl-7 pr-2.5 rounded-lg border-2 border-retro-border bg-retro-cream font-bold"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm max-h-[550px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-28">NIS</th>
                  <th className="py-2.5 px-3 w-28">NISN</th>
                  <th className="py-2.5 px-3">Nama Lengkap Siswa</th>
                  <th className="py-2.5 px-3 w-20 text-center">L/P</th>
                  <th className="py-2.5 px-3 w-24 text-center">Rombel</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 font-bold">
                {filteredSiswaList.slice(0, 100).map((s, idx) => (
                  <tr key={s.nis} className="hover:bg-brand-50/40">
                    <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono text-slate-700">{s.nis}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{s.nisn || "-"}</td>
                    <td className="py-2 px-3 text-retro-black">{s.nama_siswa}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${s.jenis_kelamin === "L" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}`}>
                        {s.jenis_kelamin || "-"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="badge-retro bg-brand-500 text-white text-[10px]">
                        {s.kelas}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSiswaList.length > 100 && (
            <p className="text-[11px] text-slate-500 italic text-center font-bold">
              Menampilkan 100 siswa pertama dari total {filteredSiswaList.length} siswa. Gunakan filter kelas atau kata kunci untuk mempersempit pencarian.
            </p>
          )}
        </div>
      )}

      {/* ================= TAB 5: RIWAYAT / LOG LOGIN SELURUH USER ================= */}
      {activeTab === "logs" && (
        <div className="card-retro p-5 space-y-4 bg-white">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-retro-border pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge-retro bg-brand-500 text-white text-[10px]">
                  AUDIT LOG KEAMANAN
                </span>
                <span className="badge-retro bg-retro-yellow text-retro-black text-[10px]">
                  {loginLogs.length} Riwayat Sesi
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider mt-1">
                Log & Riwayat Login Pengguna ({config.jenjang})
              </h4>
              <p className="text-[11px] text-slate-500 font-bold">
                Memantau seluruh aktivitas login guru, wali kelas, kepala madrasah, dan operator.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Role */}
              <select
                value={logFilterRole}
                onChange={e => setLogFilterRole(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border-2 border-retro-border bg-retro-cream font-bold shadow-retro-sm"
              >
                <option value="all">Semua Peran</option>
                <option value="admin">Operator (Admin)</option>
                <option value="kamad">Kepala Madrasah</option>
                <option value="guru_walikelas">Wali Kelas</option>
                <option value="guru">Guru Mapel</option>
              </select>

              {/* Filter Status */}
              <select
                value={logFilterStatus}
                onChange={e => setLogFilterStatus(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border-2 border-retro-border bg-retro-cream font-bold shadow-retro-sm"
              >
                <option value="all">Semua Status</option>
                <option value="success">Berhasil</option>
                <option value="failed">Gagal</option>
              </select>

              {/* Input Pencarian Log */}
              <div className="relative w-40 sm:w-52">
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={e => setLogSearchQuery(e.target.value)}
                  placeholder="Cari user / perangkat..."
                  className="w-full text-xs py-1.5 pl-7 pr-2.5 rounded-lg border-2 border-retro-border bg-retro-cream font-bold"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
              </div>

              <button
                type="button"
                onClick={handleClearLogs}
                className="btn-retro bg-red-100 hover:bg-red-200 text-red-900 border-2 border-retro-border py-1.5 px-3 text-xs font-black uppercase flex items-center gap-1 shadow-retro-sm"
                title="Hapus Seluruh Riwayat"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bersihkan Log</span>
              </button>
            </div>
          </div>

          {/* Tabel Log */}
          <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm max-h-[550px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 w-36">Waktu Login (WIB)</th>
                  <th className="py-2.5 px-3">Nama Pengguna</th>
                  <th className="py-2.5 px-3 w-28">Username</th>
                  <th className="py-2.5 px-3 w-32">Hak Akses</th>
                  <th className="py-2.5 px-3">Perangkat / Browser</th>
                  <th className="py-2.5 px-3 w-24 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 font-bold">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                      Belum ada rekaman riwayat login yang cocok dengan kriteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr key={log.id} className="hover:bg-brand-50/40">
                      <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{log.timestamp}</td>
                      <td className="py-2 px-3 text-retro-black">{log.nama_user}</td>
                      <td className="py-2 px-3 font-mono text-brand-800">@{log.username}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            log.role === "admin"
                              ? "bg-purple-100 text-purple-900 border border-purple-300"
                              : log.role === "kamad"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : log.role === "guru_walikelas"
                              ? "bg-blue-100 text-blue-900 border border-blue-300"
                              : "bg-slate-100 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {log.role === "admin"
                            ? "OPERATOR"
                            : log.role === "kamad"
                            ? "KEPALA MADRASAH"
                            : log.role === "guru_walikelas"
                            ? "WALI KELAS"
                            : "GURU MAPEL"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-mono text-[11px] flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{log.browser_device}</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {log.status === "success" ? (
                          <span className="badge-retro bg-emerald-500 text-white text-[10px]">
                            ✓ Berhasil
                          </span>
                        ) : (
                          <span className="badge-retro bg-red-500 text-white text-[10px]">
                            ✕ Gagal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 6: PENGATURAN SEMESTER & TAHUN PELAJARAN AKTIF ================= */}
      {activeTab === "pengaturan" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Box 1: Penetapan Tahun Ajaran & Semester Aktif */}
          <div className="card-retro p-5 sm:p-6 space-y-5 bg-retro-cream">
            <div className="border-b-2 border-retro-border pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge-retro bg-brand-500 text-white text-[10px]">
                    SINKRONISASI SISTEM
                  </span>
                  <span className="badge-retro bg-retro-yellow text-retro-black text-[10px]">
                    KMA 1503 TAHUN 2025
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-brand-600" />
                  Pengaturan Semester & Tahun Pelajaran Aktif
                </h4>
                <p className="text-[11px] text-slate-600 font-bold">
                  Menetapkan tahun pelajaran dan semester yang menjadi rujukan pengisian nilai guru, legger, dan rapor.
                </p>
              </div>

              {/* Status Periode Aktif Banner */}
              <div className="bg-white border-2 border-retro-border p-2.5 rounded-xl shadow-retro-sm text-right">
                <span className="text-[9px] font-black uppercase text-slate-500 block">Sedang Aktif Saat Ini</span>
                <span className="text-sm font-black text-brand-700">
                  {activePeriodObj?.label || "Gasal 2026/2027"}
                </span>
              </div>
            </div>

            {/* List Pilihan Periode Tersedia dengan Kartu Interaktif */}
            <div className="space-y-2">
              <label className="text-xs font-black text-retro-black uppercase block">
                Pilih Periode Semester Aktif:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {periods.map(p => {
                  const isActive = p.id === activePeriodId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectActivePeriod(p.id)}
                      className={`card-retro p-3.5 cursor-pointer transition flex items-center justify-between border-2 ${
                        isActive
                          ? "bg-brand-500 text-white border-retro-black shadow-retro-sm"
                          : "bg-white hover:bg-slate-50 border-retro-border"
                      }`}
                    >
                      <div>
                        <span className={`text-[10px] font-black uppercase block ${isActive ? "text-brand-100" : "text-slate-400"}`}>
                          Semester {p.semester === "1" ? "Gasal (1)" : "Genap (2)"}
                        </span>
                        <h5 className={`text-sm font-black ${isActive ? "text-white" : "text-retro-black"}`}>
                          {p.tahun}
                        </h5>
                      </div>
                      <div>
                        {isActive ? (
                          <span className="bg-retro-yellow text-retro-black text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                            ★ AKTIF
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-slate-500 border border-slate-300 px-2 py-0.5 rounded bg-slate-50">
                            Pilih
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub-Panel: Tambah Tahun Ajaran Baru Dinamis ("dan seterusnya") */}
            <div className="pt-4 border-t-2 border-dashed border-slate-300">
              <label className="text-xs font-black text-retro-black uppercase block mb-1.5">
                + Daftarkan Tahun Pelajaran Baru Berikutnya:
              </label>
              <form onSubmit={handleAddAcademicYear} className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-white border-2 border-retro-border rounded-lg px-3 py-2 shadow-retro-sm">
                  <span className="text-xs font-mono font-black text-slate-500 mr-2">Tahun Awal:</span>
                  <input
                    type="number"
                    min={2026}
                    max={2050}
                    value={newYearInput}
                    onChange={e => setNewYearInput(Number(e.target.value))}
                    className="w-20 text-xs font-mono font-black text-retro-black outline-none"
                  />
                  <span className="text-xs font-mono font-black text-slate-500">/{newYearInput + 1}</span>
                </div>
                <button
                  type="submit"
                  className="btn-retro bg-retro-yellow text-retro-black hover:bg-amber-300 py-2.5 px-4 text-xs font-black uppercase flex items-center gap-1.5 shadow-retro-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Daftarkan Tahun Ajaran Baru</span>
                </button>
              </form>
              <p className="text-[10px] text-slate-500 mt-1.5 font-bold">
                Otomatis menghasilkan 2 periode semester: <strong>Gasal {newYearInput}/{newYearInput + 1}</strong> & <strong>Genap {newYearInput}/{newYearInput + 1}</strong>.
              </p>
            </div>
          </div>

          {/* Box 2: Pengaturan Profil Lembaga & Titimangsa Rapor */}
          <div className="card-retro p-5 sm:p-6 space-y-4 bg-white">
            <div className="border-b-2 border-retro-border pb-3">
              <h4 className="text-sm font-black text-retro-black uppercase tracking-wider">
                Profil Pimpinan & Titimangsa Rapor
              </h4>
              <p className="text-[11px] text-slate-600 font-bold">
                Data ini dicetak resmi pada halaman cover, biodata, legger, dan rapor siswa.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 font-bold">
              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">Nama Kepala Madrasah:</label>
                <input
                  type="text"
                  required
                  value={cfgNamaKamad}
                  onChange={e => setCfgNamaKamad(e.target.value)}
                  className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-retro-cream shadow-retro-sm"
                />
              </div>

              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">NIP Kepala Madrasah (Jika Ada):</label>
                <input
                  type="text"
                  value={cfgNipKamad}
                  onChange={e => setCfgNipKamad(e.target.value)}
                  className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-retro-cream font-mono shadow-retro-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-retro-black uppercase block mb-1">Kota / Tempat Rapor:</label>
                  <input
                    type="text"
                    required
                    value={cfgKotaTgl}
                    onChange={e => setCfgKotaTgl(e.target.value)}
                    className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-retro-cream shadow-retro-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-retro-black uppercase block mb-1">Tanggal Titimangsa Rapor:</label>
                  <input
                    type="text"
                    required
                    value={cfgTglRapor}
                    onChange={e => setCfgTglRapor(e.target.value)}
                    className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-retro-cream shadow-retro-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 btn-retro-primary text-xs font-black uppercase tracking-wider shadow-retro-sm"
                >
                  💾 Simpan Seluruh Pengaturan Madrasah & Periode Aktif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
