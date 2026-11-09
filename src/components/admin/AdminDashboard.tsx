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
  ApiIntegrationConfig,
  SyncLogItem,
  SiNusaStudentPayload,
  SyncBatchResult,
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
  getIntegrationConfig,
  saveIntegrationConfig,
  getSyncLogs,
  clearSyncLogs,
  buildSiNusaPayloads,
  DEFAULT_SINUSA_CONFIG,
  saveKamadTtd,
  resetTeacherPassword,
  resetAllTeachersPassword,
} from "@/lib/storage";
import dynamic from "next/dynamic";
const CetakDataGuruModal = dynamic(() => import("./CetakDataGuruModal"), {
  ssr: false,
});
import { downloadBulkLeggerExcel } from "@/lib/excel/excelHandler";
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
  Globe,
  Radio,
  Send,
  Key,
  ExternalLink,
  Code,
  Lock,
  Unlock,
  CloudLightning,
  Upload,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Copy,
  ArrowLeftRight,
  KeyRound,
  RotateCcw,
  Printer,
} from "lucide-react";

interface Props {
  madrasahId: MadrasahId;
  config: SchoolConfig;
  allKelas: string[];
  allMapel: { kode: string; nama: string; kelompok?: string; kkm?: number }[];
  onConfigUpdated: (cfg: SchoolConfig) => void;
  onSwitchMadrasah?: (mid?: MadrasahId) => void;
}

export default function AdminDashboard({
  madrasahId,
  config,
  allKelas,
  allMapel,
  onConfigUpdated,
  onSwitchMadrasah,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "visualisasi" | "guru" | "wali" | "siswa" | "monitoring" | "logs" | "pengaturan" | "integrasi"
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
  const [logsPage, setLogsPage] = useState(1);
  const LOGS_PER_PAGE = 15;

  // Search filter for teacher table
  const [searchTeacher, setSearchTeacher] = useState("");
  const [teacherPage, setTeacherPage] = useState(1);
  const TEACHERS_PER_PAGE = 15;

  // Search filter for siswa table
  const [searchSiswaQuery, setSearchSiswaQuery] = useState("");
  const [filterSiswaKelas, setFilterSiswaKelas] = useState("all");

  // Form states: Tambah Guru
  const [newNama, setNewNama] = useState("");
  const [newNip, setNewNip] = useState("-");
  const [newJk, setNewJk] = useState<"L" | "P">("L");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("Lodoyo2026");

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

  // Integrasi SI-NUSA State
  const [integrationConfig, setIntegrationConfig] = useState<ApiIntegrationConfig>(DEFAULT_SINUSA_CONFIG);
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([]);
  const [inputTargetName, setInputTargetName] = useState("SI-NUSA Portal (Pusat)");
  const [inputEndpointUrl, setInputEndpointUrl] = useState("https://si-nusa.com/api/v1/sync-grades");
  const [inputSecretToken, setInputSecretToken] = useState("sinusa_sec_token_live_9f83a4c2e1");
  const [inputIsActive, setInputIsActive] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [syncScope, setSyncScope] = useState<"all" | "class">("all");
  const [selectedSyncClass, setSelectedSyncClass] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [selectedPayloadDetail, setSelectedPayloadDetail] = useState<SiNusaStudentPayload | null>(null);
  const [syncLogSearch, setSyncLogSearch] = useState("");
  const [syncLogFilterStatus, setSyncLogFilterStatus] = useState<"all" | "SUCCESS" | "FAILED">("all");
  const [previewSamplePayload, setPreviewSamplePayload] = useState<SiNusaStudentPayload | null>(null);

  // TTD Kepala Madrasah & Bulk Download State
  const [kamadTtdBase64, setKamadTtdBase64] = useState<string>(config.ttd_kamad_url || "");
  const [isDownloadingBulk, setIsDownloadingBulk] = useState(false);
  const [isCetakGuruModalOpen, setIsCetakGuruModalOpen] = useState(false);
  const [activeApiDocTab, setActiveApiDocTab] = useState<"laravel" | "express" | "curl" | "json">("laravel");
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    setKamadTtdBase64(config.ttd_kamad_url || "");
  }, [config, madrasahId]);

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

    // Refresh Konfigurasi Integrasi SI-NUSA & Sync Logs
    const intCfg = getIntegrationConfig(madrasahId);
    setIntegrationConfig(intCfg);
    setInputTargetName(intCfg.target_name);
    setInputEndpointUrl(intCfg.endpoint_url);
    setInputSecretToken(intCfg.secret_token);
    setInputIsActive(intCfg.is_active);

    const sLogs = getSyncLogs(madrasahId);
    setSyncLogs(sLogs);

    if (sortedKelas.length > 0 && !waliKelasTarget) setWaliKelasTarget(sortedKelas[0]);
    if (sortedKelas.length > 0 && !monitorKelas) setMonitorKelas(sortedKelas[0]);
    if (sortedKelas.length > 0 && !selectedSyncClass) setSelectedSyncClass(sortedKelas[0]);
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
      setNewPassword("Lodoyo2026");
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

  const handleResetSinglePassword = (t: User) => {
    if (confirm(`Reset kata sandi guru "${t.nama_user}" (@${t.username}) ke default "Lodoyo2026"?`)) {
      const res = resetTeacherPassword(madrasahId, t.id);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        refreshData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    }
  };

  const handleResetAllPasswords = () => {
    if (confirm(`Apakah Anda yakin ingin me-reset seluruh kata sandi (${teachers.length} guru) ke default "Lodoyo2026"? Tindakan ini akan mengembalikan semua password guru menjadi Lodoyo2026.`)) {
      const res = resetAllTeachersPassword(madrasahId);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        refreshData();
      } else {
        setMessage({ type: "error", text: res.message });
      }
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

  // Handlers Integrasi SI-NUSA
  const handleSaveIntegration = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveIntegrationConfig(madrasahId, {
      target_name: inputTargetName.trim(),
      endpoint_url: inputEndpointUrl.trim(),
      secret_token: inputSecretToken.trim(),
      is_active: inputIsActive,
    });
    setIntegrationConfig(updated);
    setMessage({ type: "success", text: "Konfigurasi target API SI-NUSA berhasil disimpan!" });
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    try {
      const res = await fetch("/api/admin/sync-to-si-nusa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          madrasah_id: madrasahId,
          endpoint_url: inputEndpointUrl.trim(),
          secret_token: inputSecretToken.trim(),
          is_test: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message || "Endpoint terhubung dengan sukses!" });
      } else {
        setMessage({ type: "error", text: data.message || "Gagal menghubungi endpoint SI-NUSA." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Error tes koneksi: " + err.message });
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleTriggerSync = async () => {
    if (!inputIsActive) {
      setMessage({ type: "error", text: "Integrasi sedang Nonaktif! Aktifkan terlebih dahulu untuk mengirim sinkronisasi data." });
      return;
    }
    const targetLabel = syncScope === "all" ? "SELURUH SISWA satu madrasah" : `seluruh siswa KELAS ${selectedSyncClass || sortedKelas[0]}`;
    if (!confirm(`Apakah Anda yakin ingin menyinkronkan data nilai rapor ${targetLabel} langsung ke SI-NUSA?`)) {
      return;
    }

    setIsSyncing(true);
    try {
      const targetClassParam = syncScope === "all" ? "all" : (selectedSyncClass || sortedKelas[0]);
      const res = await fetch("/api/admin/sync-to-si-nusa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          madrasah_id: madrasahId,
          endpoint_url: inputEndpointUrl.trim(),
          secret_token: inputSecretToken.trim(),
          target_class: targetClassParam,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Proses sinkronisasi selesai! Berhasil: ${data.synced_count}, Gagal: ${data.failed_count} dari total ${data.total_processed} siswa.`,
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Terjadi kesalahan saat memproses sinkronisasi data.",
        });
      }
      // Reload logs
      const updatedLogs = getSyncLogs(madrasahId);
      setSyncLogs(updatedLogs);
    } catch (err: any) {
      setMessage({ type: "error", text: "Gagal memproses sinkronisasi: " + err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearSyncLogs = () => {
    if (confirm("Bersihkan seluruh riwayat log sinkronisasi SI-NUSA?")) {
      clearSyncLogs(madrasahId);
      setSyncLogs([]);
      setMessage({ type: "success", text: "Riwayat log sinkronisasi SI-NUSA berhasil dikosongkan." });
    }
  };

  const handleInspectSamplePayload = () => {
    const curPer = getActivePeriod(madrasahId);
    const payloads = buildSiNusaPayloads(
      madrasahId,
      curPer.tahun,
      curPer.semester,
      syncScope === "class" && selectedSyncClass ? selectedSyncClass : undefined
    );
    if (payloads.length > 0) {
      setPreviewSamplePayload(payloads[0]);
    } else {
      setMessage({ type: "error", text: "Belum ada data siswa / nilai untuk di-generate sebagai payload contoh." });
    }
  };

  // Upload Tanda Tangan Kepala Madrasah
  const handleUploadKamadTtd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ukuran file tanda tangan maksimal 3MB!" });
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        const base64 = String(ev.target.result);
        setKamadTtdBase64(base64);
        const updatedCfg = saveKamadTtd(madrasahId, base64);
        onConfigUpdated(updatedCfg);
        setMessage({
          type: "success",
          text: `Tanda tangan digital Kepala ${config.jenjang} (${config.kepala_madrasah}) berhasil disimpan dan otomatis disematkan pada seluruh cetak rapor!`,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveKamadTtd = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus tanda tangan digital Kepala ${config.jenjang}?`)) {
      setKamadTtdBase64("");
      const updatedCfg = saveKamadTtd(madrasahId, "");
      onConfigUpdated(updatedCfg);
      setMessage({ type: "success", text: `Tanda tangan Kepala ${config.jenjang} berhasil direset.` });
    }
  };

  // Unduh Massal Seluruh Legger Nilai (Multi-Sheet Excel)
  const handleDownloadBulkLegger = async () => {
    setIsDownloadingBulk(true);
    try {
      const curActive = getActivePeriod(madrasahId);
      await downloadBulkLeggerExcel(
        madrasahId,
        curActive.tahun,
        curActive.semester,
        sortedKelas,
        config
      );
      setMessage({
        type: "success",
        text: `Berhasil mengunduh seluruh leger nilai ${config.jenjang} (${sortedKelas.length} kelas) dalam file Excel multi-sheet (.xlsx)!`,
      });
    } catch (err: any) {
      setMessage({ type: "error", text: "Gagal mendownload backup seluruh leger: " + err.message });
    } finally {
      setIsDownloadingBulk(false);
    }
  };

  const handleCopySnippet = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
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

  const totalTeacherPages = Math.ceil(filteredTeachers.length / TEACHERS_PER_PAGE) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (teacherPage - 1) * TEACHERS_PER_PAGE;
    return filteredTeachers.slice(start, start + TEACHERS_PER_PAGE);
  }, [filteredTeachers, teacherPage]);

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

  const totalLogPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (logsPage - 1) * LOGS_PER_PAGE;
    return filteredLogs.slice(start, start + LOGS_PER_PAGE);
  }, [filteredLogs, logsPage]);

  // Monitoring Kirim (Tab Monitoring)
  const rekapKirim = useMemo(() => {
    if (!monitorKelas) return [];
    return getRekapKirimNilaiKelas(madrasahId, monitorKelas);
  }, [madrasahId, monitorKelas]);

  const mapelSudahKirim = useMemo(() => {
    return rekapKirim.filter(r => r.is_sent).length;
  }, [rekapKirim]);

  // Data Filtering: Log Sinkronisasi SI-NUSA
  const filteredSyncLogs = useMemo(() => {
    let list = syncLogs;
    if (syncLogFilterStatus !== "all") {
      list = list.filter(l => l.status === syncLogFilterStatus);
    }
    const q = syncLogSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        l =>
          l.student_name.toLowerCase().includes(q) ||
          l.student_nis.toLowerCase().includes(q) ||
          (l.student_nisn && l.student_nisn.toLowerCase().includes(q)) ||
          l.class_name.toLowerCase().includes(q) ||
          (l.response_message && l.response_message.toLowerCase().includes(q))
      );
    }
    return list;
  }, [syncLogs, syncLogFilterStatus, syncLogSearch]);

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

        {/* Quick Actions & Super Admin Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Switcher Lembaga untuk Super Admin */}
          {onSwitchMadrasah && (
            <div className="flex items-center bg-white border-2 border-retro-border rounded-lg p-1 shadow-retro-sm gap-1">
              <span className="text-[9px] font-black uppercase text-slate-500 px-1 hidden sm:inline">Pindah:</span>
              <button
                type="button"
                onClick={() => onSwitchMadrasah("mts")}
                className={`px-2.5 py-1 rounded text-xs font-black uppercase transition ${
                  madrasahId === "mts"
                    ? "bg-brand-500 text-white shadow-retro-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                title="Beralih ke Data MTs Ma'arif NU 2"
              >
                MTs
              </button>
              <button
                type="button"
                onClick={() => onSwitchMadrasah("ma")}
                className={`px-2.5 py-1 rounded text-xs font-black uppercase transition ${
                  madrasahId === "ma"
                    ? "bg-brand-500 text-white shadow-retro-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                title="Beralih ke Data MA Ma'arif Nurus Salam"
              >
                MA
              </button>
            </div>
          )}

          {/* Tombol Unduh Seluruh Legger Nilai (Backup Massal Excel) */}
          <button
            type="button"
            onClick={handleDownloadBulkLegger}
            disabled={isDownloadingBulk}
            className="btn-retro bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 text-xs flex items-center gap-1.5 shadow-retro-sm disabled:opacity-50"
            title="Unduh seluruh legger nilai semua kelas dalam format Excel (.xlsx)"
          >
            {isDownloadingBulk ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isDownloadingBulk ? "Membuat Excel..." : "Unduh Seluruh Leger"}</span>
          </button>

          <div className="bg-white border-2 border-retro-border px-3 py-1.5 rounded-lg shadow-retro-sm hidden md:block">
            <span className="text-slate-500 block text-[9px] font-black uppercase">Guru</span>
            <span className="font-black text-retro-black text-sm">{teachers.length}</span>
          </div>
          <div className="bg-retro-yellow border-2 border-retro-border px-3 py-1.5 rounded-lg shadow-retro-sm hidden md:block">
            <span className="text-retro-black block text-[9px] font-black uppercase">Rombel</span>
            <span className="font-black text-retro-black text-sm">{allKelas.length}</span>
          </div>
          <div className="bg-brand-500 text-white border-2 border-retro-border px-3 py-1.5 rounded-lg shadow-retro-sm">
            <span className="text-brand-100 block text-[9px] font-black uppercase">Progres</span>
            <span className="font-black text-sm">{matriksOverview?.rata_rata_persen || 0}%</span>
          </div>
        </div>
      </div>

      {/* Nav Tabs Bold Retro (Responsive Horizontal Scroll on Mobile/Tablet) */}
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 bg-retro-cream p-2 rounded-xl border-2 border-retro-border shadow-retro-sm overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab("visualisasi")}
          className={
            activeTab === "visualisasi"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
          }
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>1. Dashboard Nilai ({matriksOverview?.rata_rata_persen || 0}%)</span>
        </button>

        <button
          onClick={() => setActiveTab("guru")}
          className={
            activeTab === "guru"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
          }
        >
          <Users className="w-3.5 h-3.5" />
          <span>2. Guru & Akun ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wali")}
          className={
            activeTab === "wali"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
          }
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>3. Wali Kelas ({homerooms.length}/{sortedKelas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("siswa")}
          className={
            activeTab === "siswa"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
          }
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>4. Database Siswa ({allSiswa.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={
            activeTab === "logs"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
          }
        >
          <Shield className="w-3.5 h-3.5" />
          <span>5. Riwayat Login ({loginLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pengaturan")}
          className={
            activeTab === "pengaturan"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
          }
        >
          <Settings className="w-3.5 h-3.5" />
          <span>6. Semester & Pengaturan</span>
        </button>

        <button
          onClick={() => setActiveTab("integrasi")}
          className={
            activeTab === "integrasi"
              ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
              : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
          }
        >
          <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
          <span>7. Integrasi SI-NUSA</span>
          {syncLogs.length > 0 && (
            <span className="badge-retro bg-retro-yellow text-retro-black text-[9px] px-1.5 py-0 font-black">
              {syncLogs.length}
            </span>
          )}
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
                  placeholder="Isikan username"
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
                  Seluruh guru aktif di {config.nama_madrasah} • Username 7 Karakter & Password Default: Lodoyo2026
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCetakGuruModalOpen(true)}
                  className="btn-retro bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-retro-sm font-black"
                  title="Cetak & Unduh Seluruh Kredensial Guru Format PDF A4"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Unduh Akun Guru (PDF A4)</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAllPasswords}
                  className="btn-retro bg-retro-orange hover:bg-orange-600 text-white px-2.5 py-1.5 text-xs flex items-center gap-1 shadow-retro-sm font-black"
                  title="Reset seluruh password guru ke default Lodoyo2026"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Semua Password</span>
                </button>

                <div className="relative w-full sm:w-52">
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
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Nama Lengkap & NIK</th>
                    <th className="py-2.5 px-3 w-28">Username (ID)</th>
                    <th className="py-2.5 px-3 w-28">Password</th>
                    <th className="py-2.5 px-3 w-28 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 font-bold">
                  {paginatedTeachers.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-brand-50/40">
                      <td className="py-2 px-3 text-center text-slate-500 font-mono">
                        {((teacherPage - 1) * TEACHERS_PER_PAGE) + idx + 1}
                      </td>
                      <td className="py-2 px-3 text-retro-black">
                        <div>{t.nama_user}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NIK: {t.nip || "-"} • ({t.jenis_kelamin || "-"})</div>
                      </td>
                      <td className="py-2 px-3 font-mono font-black text-brand-800">@{t.username}</td>
                      <td className="py-2 px-3 font-mono text-slate-700 bg-slate-50">{t.password || "Lodoyo2026"}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleResetSinglePassword(t)}
                            className="p-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-400 font-black"
                            title="Reset Password ke default (Lodoyo2026)"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditTeacher(t)}
                            className="p-1.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black"
                            title="Edit Data Guru"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeacher(t.id, t.nama_user)}
                            className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 font-black"
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

            {/* Pagination Controls Tabel Guru */}
            {totalTeacherPages > 1 && (
              <div className="flex flex-wrap items-center justify-between p-3 bg-slate-50 rounded-xl border-2 border-retro-border text-xs font-bold gap-2">
                <span className="text-slate-600">
                  Menampilkan {((teacherPage - 1) * TEACHERS_PER_PAGE) + 1} - {Math.min(teacherPage * TEACHERS_PER_PAGE, filteredTeachers.length)} dari {filteredTeachers.length} Guru
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={teacherPage === 1}
                    onClick={() => setTeacherPage(prev => Math.max(1, prev - 1))}
                    className="btn-retro bg-white px-2.5 py-1 text-xs disabled:opacity-40"
                  >
                    « Prev
                  </button>
                  <span className="px-2 font-mono font-black text-slate-800">
                    {teacherPage} / {totalTeacherPages}
                  </span>
                  <button
                    type="button"
                    disabled={teacherPage >= totalTeacherPages}
                    onClick={() => setTeacherPage(prev => Math.min(totalTeacherPages, prev + 1))}
                    className="btn-retro bg-white px-2.5 py-1 text-xs disabled:opacity-40"
                  >
                    Next »
                  </button>
                </div>
              </div>
            )}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-retro-black uppercase">Kata Sandi:</label>
                  <button
                    type="button"
                    onClick={() => setEditPassword("Lodoyo2026")}
                    className="text-[10px] text-brand-700 hover:text-brand-900 underline font-black"
                  >
                    Set ke Lodoyo2026
                  </button>
                </div>
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
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                      Belum ada rekaman riwayat login yang cocok dengan kriteria.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, idx) => (
                    <tr key={log.id} className="hover:bg-brand-50/40">
                      <td className="py-2 px-3 text-center text-slate-500 font-mono">
                        {((logsPage - 1) * LOGS_PER_PAGE) + idx + 1}
                      </td>
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

          {/* Pagination Controls Tabel Riwayat Login */}
          {totalLogPages > 1 && (
            <div className="flex flex-wrap items-center justify-between p-3 bg-slate-50 rounded-xl border-2 border-retro-border text-xs font-bold gap-2">
              <span className="text-slate-600">
                Menampilkan {((logsPage - 1) * LOGS_PER_PAGE) + 1} - {Math.min(logsPage * LOGS_PER_PAGE, filteredLogs.length)} dari {filteredLogs.length} Riwayat Sesi
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={logsPage === 1}
                  onClick={() => setLogsPage(prev => Math.max(1, prev - 1))}
                  className="btn-retro bg-white px-2.5 py-1 text-xs disabled:opacity-40"
                >
                  « Prev
                </button>
                <span className="px-2 font-mono font-black text-slate-800">
                  {logsPage} / {totalLogPages}
                </span>
                <button
                  type="button"
                  disabled={logsPage >= totalLogPages}
                  onClick={() => setLogsPage(prev => Math.min(totalLogPages, prev + 1))}
                  className="btn-retro bg-white px-2.5 py-1 text-xs disabled:opacity-40"
                >
                  Next »
                </button>
              </div>
            </div>
          )}
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

          {/* Box 3: Upload Tanda Tangan Resmi Kepala Madrasah (MTs & MA) */}
          <div className="card-retro p-5 sm:p-6 space-y-4 bg-white">
            <div className="border-b-2 border-retro-border pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-brand-600" />
                  <span>Tanda Tangan Digital Kepala Madrasah ({config.jenjang})</span>
                </h4>
                <p className="text-[11px] text-slate-600 font-bold">
                  Unggah file gambar tanda tangan transparan (PNG/JPG) untuk <strong>{config.kepala_madrasah}</strong>. Tanda tangan ini otomatis disematkan pada seluruh lembar cetak Rapor Tengah Semester.
                </p>
              </div>
              <span className="badge-retro bg-retro-yellow text-retro-black text-[10px]">
                Jenjang {config.jenjang}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Pratinjau TTD & Stempel */}
              <div className="bg-retro-cream p-4 rounded-xl border-2 border-retro-border text-center space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 block">
                  Pratinjau Tampilan Cetak Rapor:
                </span>

                <div className="relative h-20 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden max-w-xs mx-auto">
                  {/* Stempel Layer */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 rotate-[-8deg] z-0">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#006e14] flex flex-col items-center justify-center text-[5.5px] font-black text-[#006e14] leading-none p-0.5 text-center bg-emerald-50/40">
                      <span>MADRASAH</span>
                      <span className="my-0.5 text-[6px] text-amber-700">★ RESMI ★</span>
                      <span>{config.id === "mts" ? "MTSM NU 2" : "MA NURUS SALAM"}</span>
                    </div>
                  </div>

                  {/* Signature Layer */}
                  {kamadTtdBase64 ? (
                    <img
                      src={kamadTtdBase64}
                      alt="Tanda Tangan Kepala Madrasah"
                      className="max-h-16 max-w-[150px] object-contain relative z-10"
                    />
                  ) : (
                    <div className="relative z-10 font-serif text-slate-400 italic text-base font-bold tracking-widest select-none">
                      (Belum ada tanda tangan)
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-retro-black">
                  <p className="font-black underline uppercase">{config.kepala_madrasah}</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP: {config.nip_kepala || "-"}</p>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="space-y-3 font-bold">
                <div>
                  <label className="text-xs font-black text-retro-black uppercase block mb-1.5">
                    Unggah File Tanda Tangan:
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-retro-border bg-retro-cream hover:bg-brand-50 cursor-pointer shadow-retro-sm transition text-center">
                    <Upload className="w-6 h-6 text-brand-600 mb-1" />
                    <span className="text-xs font-black text-retro-black uppercase">
                      {kamadTtdBase64 ? "Ganti File Tanda Tangan" : "Pilih File Tanda Tangan (PNG / JPG)"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Gunakan latar belakang transparan / putih bersih (Maks. 3MB)
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleUploadKamadTtd}
                      className="hidden"
                    />
                  </label>
                </div>

                {kamadTtdBase64 && (
                  <button
                    type="button"
                    onClick={handleRemoveKamadTtd}
                    className="w-full py-2 btn-retro bg-red-100 text-red-800 hover:bg-red-200 border-red-300 text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-retro-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-700" />
                    <span>Hapus Tanda Tangan Kepala Madrasah</span>
                  </button>
                )}

                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-[10px] text-emerald-900 font-bold space-y-0.5">
                  <div>✓ Tanda tangan tersimpan khusus untuk jenjang <strong>{config.jenjang}</strong>.</div>
                  <div>✓ Otomatis terpasang di kolom TTD Kepala Madrasah saat mencetak rapor siswa.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: INTEGRASI REST API SI-NUSA.COM ================= */}
      {activeTab === "integrasi" && (
        <div className="space-y-6">
          {/* Header Banner Integrasi */}
          <div className="card-retro-lg bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-5 sm:p-6 border-3 border-retro-border shadow-retro-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-retro-black text-amber-300 p-2 border-2 border-retro-border shadow-retro-sm flex items-center justify-center flex-shrink-0">
                <CloudLightning className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge-retro bg-brand-500 text-white font-black">
                    REST API PUSH
                  </span>
                  <span
                    className={`badge-retro font-black ${
                      inputIsActive
                        ? "bg-emerald-400 text-emerald-950"
                        : "bg-red-400 text-red-950"
                    }`}
                  >
                    {inputIsActive ? "● AKTIF & TERHUBUNG" : "○ NONAKTIF"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black uppercase text-retro-black mt-1 flex items-center gap-1.5">
                  <span>Sinkronisasi Data Rapor & Nilai ke SI-NUSA</span>
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  Kirim langsung data identitas siswa, kelas, periode aktif, dan nilai per-mapel dari basis data Rapor ke portal eksternal <code className="bg-white px-1.5 py-0.5 rounded border border-retro-border text-[11px] font-mono text-emerald-700">https://si-nusa.com</code>.
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
              <button
                type="button"
                onClick={handleInspectSamplePayload}
                className="btn-retro-white text-xs font-black uppercase py-2.5 px-3.5 flex items-center gap-1.5 shadow-retro-sm"
              >
                <Code className="w-4 h-4 text-slate-600" />
                <span>Lihat Format JSON</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid Integrasi */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="card-retro p-4 bg-white space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Total Pengiriman</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-retro-black">{syncLogs.length}</span>
                <span className="text-xs font-bold text-slate-500">Record</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold">Riwayat dispatch payload</p>
            </div>

            <div className="card-retro p-4 bg-emerald-100 space-y-1 border-emerald-400">
              <span className="text-[10px] font-black uppercase text-emerald-800 block">Sukses Diterima</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-900">
                  {syncLogs.filter(l => l.status === "SUCCESS").length}
                </span>
                <span className="text-xs font-bold text-emerald-700">Siswa</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-bold">Status 200 OK / 201 Created</p>
            </div>

            <div className="card-retro p-4 bg-red-100 space-y-1 border-red-400">
              <span className="text-[10px] font-black uppercase text-red-800 block">Gagal / Timeout</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-red-900">
                  {syncLogs.filter(l => l.status === "FAILED").length}
                </span>
                <span className="text-xs font-bold text-red-700">Percobaan</span>
              </div>
              <p className="text-[10px] text-red-700 font-bold">Respon non-200 / Timeout 10s</p>
            </div>

            <div className="card-retro p-4 bg-retro-yellow space-y-1">
              <span className="text-[10px] font-black uppercase text-retro-black block">Tingkat Keberhasilan</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-retro-black">
                  {syncLogs.length > 0
                    ? Math.round((syncLogs.filter(l => l.status === "SUCCESS").length / syncLogs.length) * 100)
                    : 100}
                  %
                </span>
                <span className="text-xs font-bold text-retro-black">Reliabilitas</span>
              </div>
              <p className="text-[10px] text-slate-600 font-bold">Berdasarkan log tersimpan</p>
            </div>
          </div>

          {/* 2 Kolom Utama: Form Konfigurasi Target & Tombol Push Sync */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Box 1: Form Target Configuration */}
            <div className="card-retro p-5 sm:p-6 bg-white space-y-4">
              <div className="border-b-2 border-retro-border pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-brand-600" />
                    <span>Konfigurasi Endpoint & Token Target</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 font-bold">
                    Tentukan alamat API Receiver website penerima (https://si-nusa.com) & secret token.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveIntegration} className="space-y-4 font-bold">
                <div>
                  <label className="text-xs font-black text-retro-black uppercase block mb-1">
                    Nama Target Integrasi:
                  </label>
                  <input
                    type="text"
                    required
                    value={inputTargetName}
                    onChange={e => setInputTargetName(e.target.value)}
                    placeholder="Contoh: SI-NUSA Portal (Pusat)"
                    className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-retro-cream shadow-retro-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-retro-black uppercase block mb-1">
                    Endpoint URL Target SI-NUSA (REST POST):
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={inputEndpointUrl}
                      onChange={e => setInputEndpointUrl(e.target.value)}
                      placeholder="https://si-nusa.com/api/v1/sync-grades"
                      className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-retro-cream font-mono shadow-retro-sm"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">
                    Sistem akan mengirimkan request HTTP POST dengan body JSON per-siswa ke alamat ini.
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-retro-black uppercase block">
                      Secret Bearer Token (Authorization):
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="text-[10px] text-brand-700 hover:text-brand-900 font-black flex items-center gap-1"
                    >
                      {showToken ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span>{showToken ? "Sembunyikan" : "Tampilkan Token"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      required
                      value={inputSecretToken}
                      onChange={e => setInputSecretToken(e.target.value)}
                      placeholder="Bearer token rahasia..."
                      className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-retro-cream font-mono shadow-retro-sm"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">
                    Dikirim pada header: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">Authorization: Bearer &lt;SECRET_TOKEN&gt;</code>.
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between p-3 rounded-lg border-2 border-retro-border bg-retro-cream">
                  <div>
                    <span className="text-xs font-black text-retro-black block">Status Integrasi</span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Aktifkan untuk mengizinkan transmisi sinkronisasi data rapor.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputIsActive}
                      onChange={e => setInputIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-2.5 btn-retro-primary text-xs font-black uppercase tracking-wider shadow-retro-sm flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Konfigurasi</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConn}
                    className="w-full sm:w-auto py-2.5 px-4 btn-retro bg-amber-400 text-retro-black hover:bg-amber-300 text-xs font-black uppercase tracking-wider shadow-retro-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isTestingConn ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Radio className="w-4 h-4" />
                    )}
                    <span>{isTestingConn ? "Menguji..." : "Uji Koneksi"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Box 2: Manual Push Action & Dispatch Center */}
            <div className="card-retro p-5 sm:p-6 bg-retro-cream space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b-2 border-retro-border pb-3">
                  <h4 className="text-sm font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-emerald-700" />
                    <span>Pusat Eksekusi Sinkronisasi Data (Push)</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 font-bold">
                    Pilih cakupan data yang ingin dikirimkan langsung ke basis data server SI-NUSA.
                  </p>
                </div>

                {/* Scope Selection */}
                <div className="space-y-2.5 font-bold">
                  <label className="text-xs font-black text-retro-black uppercase block">
                    Cakupan Pengiriman Data Rapor:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSyncScope("all")}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        syncScope === "all"
                          ? "bg-brand-500 text-white border-retro-border shadow-retro-sm"
                          : "bg-white text-retro-black border-retro-border hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-black uppercase block">Semua Siswa</span>
                      <span className="text-[10px] opacity-90 block">
                        Seluruh {allSiswa.length} Siswa ({allKelas.length} Rombel)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSyncScope("class")}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        syncScope === "class"
                          ? "bg-brand-500 text-white border-retro-border shadow-retro-sm"
                          : "bg-white text-retro-black border-retro-border hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-black uppercase block">Per Rombel / Kelas</span>
                      <span className="text-[10px] opacity-90 block">
                        Pilih 1 kelas tertentu
                      </span>
                    </button>
                  </div>
                </div>

                {/* Class selector if scope === 'class' */}
                {syncScope === "class" && (
                  <div className="bg-white p-3.5 rounded-lg border-2 border-retro-border space-y-1.5 shadow-retro-sm">
                    <label className="text-xs font-black text-retro-black uppercase block">
                      Pilih Rombongan Belajar:
                    </label>
                    <select
                      value={selectedSyncClass}
                      onChange={e => setSelectedSyncClass(e.target.value)}
                      className="w-full text-xs font-black py-2 px-3 rounded-md border-2 border-retro-border bg-retro-cream"
                    >
                      {sortedKelas.map(k => {
                        const count = allSiswa.filter(s => s.kelas.toUpperCase() === k.toUpperCase()).length;
                        return (
                          <option key={k} value={k}>
                            Kelas {k} ({count} Siswa)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Struktur Payload Info Box */}
                <div className="bg-white p-3.5 rounded-lg border-2 border-retro-border text-xs space-y-1.5 shadow-retro-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500">
                      Spesifikasi JSON Payload:
                    </span>
                    <button
                      type="button"
                      onClick={handleInspectSamplePayload}
                      className="text-[10px] text-brand-700 hover:underline font-black flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Lihat Contoh Riil</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-700 font-bold space-y-0.5">
                    <div>• <strong>Identitas Siswa:</strong> NISN, NIS, Nama, Kelas</div>
                    <div>• <strong>Periode:</strong> Tahun Ajaran {activePeriodObj?.tahun || "2026/2027"}, Semester {activePeriodObj?.semester || "1"}</div>
                    <div>• <strong>Grades Array:</strong> Kode Mapel, Nama, Nilai Pengetahuan (LM), Nilai Keterampilan (STS/SAS), Predikat, Capaian Deskripsi.</div>
                  </div>
                </div>
              </div>

              {/* Big Trigger Push Button */}
              <div className="pt-4 border-t-2 border-retro-border">
                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={isSyncing || !inputIsActive}
                  className="w-full py-3.5 btn-retro bg-emerald-600 text-white hover:bg-emerald-500 text-xs sm:text-sm font-black uppercase tracking-wider shadow-retro-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Mengirimkan & Menyinkronkan Data...</span>
                    </>
                  ) : (
                    <>
                      <CloudLightning className="w-5 h-5 text-amber-300" />
                      <span>
                        {syncScope === "all"
                          ? `Sinkronkan Semua Data Siswa (${allSiswa.length} Siswa)`
                          : `Sinkronkan Siswa Kelas ${selectedSyncClass || sortedKelas[0]}`}
                      </span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center font-bold mt-2">
                  Menggunakan timeout pengaman 10 detik per request dan pencatatan riwayat audit otomatis.
                </p>
              </div>
            </div>
          </div>

          {/* Bagian 3: Tabel Riwayat & Status Sinkronisasi (Sync Logs) */}
          <div className="card-retro p-5 sm:p-6 bg-white space-y-4">
            <div className="border-b-2 border-retro-border pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-brand-600" />
                  <span>Riwayat Pengiriman & Log Status Sinkronisasi ({syncLogs.length})</span>
                </h4>
                <p className="text-[11px] text-slate-600 font-bold">
                  Pantau riwayat push data nilai ke https://si-nusa.com beserta status respon HTTP dan snapshot data.
                </p>
              </div>

              {syncLogs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSyncLogs}
                  className="btn-retro-white text-[11px] text-red-600 hover:text-red-800 font-black px-3 py-1.5 flex items-center gap-1 shadow-retro-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan Riwayat Log</span>
                </button>
              )}
            </div>

            {/* Filter Log Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-retro-cream p-3 rounded-lg border-2 border-retro-border">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari NISN, nama siswa, kelas, respon..."
                  value={syncLogSearch}
                  onChange={e => setSyncLogSearch(e.target.value)}
                  className="w-full bg-white text-xs py-1.5 px-3 rounded-md border-2 border-retro-border font-bold outline-none shadow-retro-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-retro-black">Status:</span>
                <select
                  value={syncLogFilterStatus}
                  onChange={e => setSyncLogFilterStatus(e.target.value as any)}
                  className="bg-white text-xs font-black py-1.5 px-2.5 rounded-md border-2 border-retro-border shadow-retro-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="SUCCESS">Hanya Sukses (SUCCESS)</option>
                  <option value="FAILED">Hanya Gagal (FAILED)</option>
                </select>
              </div>
            </div>

            {/* Tabel Log Retro */}
            <div className="overflow-x-auto border-2 border-retro-border rounded-xl shadow-retro-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-retro-black text-white font-black uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Waktu Dispatch</th>
                    <th className="py-2.5 px-3">NISN / NIS</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3 text-center">Jml Mapel</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Respon Server Target</th>
                    <th className="py-2.5 px-3 text-center">Snapshot</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-retro-border font-bold bg-white">
                  {filteredSyncLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                        {syncLogs.length === 0
                          ? "Belum ada riwayat pengiriman data ke SI-NUSA. Klik tombol sinkronisasi di atas untuk memulai pengiriman pertama."
                          : "Tidak ada log yang cocok dengan filter pencarian."}
                      </td>
                    </tr>
                  ) : (
                    filteredSyncLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {log.created_at}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-retro-black whitespace-nowrap">
                          <div>{log.student_nisn || "-"}</div>
                          <div className="text-[10px] text-slate-500">NIS: {log.student_nis}</div>
                        </td>
                        <td className="py-2.5 px-3 text-retro-black uppercase whitespace-nowrap">
                          {log.student_name}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="badge-retro bg-slate-100 text-retro-black text-[10px]">
                            {log.class_name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {log.total_grades} Mapel
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`badge-retro text-[10px] font-black ${
                              log.status === "SUCCESS"
                                ? "bg-emerald-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {log.status === "SUCCESS" ? "✓ SUCCESS" : "✕ FAILED"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-700 max-w-xs truncate">
                          {log.response_message}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedPayloadDetail(log.payload_snapshot || null)}
                            className="btn-retro-white text-[10px] font-black py-1 px-2.5 shadow-retro-sm flex items-center gap-1 mx-auto"
                          >
                            <Code className="w-3 h-3 text-brand-700" />
                            <span>JSON</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bagian 4: Panduan Integrasi REST API untuk Tim Developer SI-NUSA */}
          <div className="card-retro p-5 sm:p-6 bg-white space-y-4">
            <div className="border-b-2 border-retro-border pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Panduan & Spesifikasi REST API untuk Tim Developer SI-NUSA</span>
                </h4>
                <p className="text-[11px] text-slate-600 font-bold">
                  Dokumentasi teknis resmi implementasi receiver endpoint pada web target <code>https://si-nusa.com</code>.
                </p>
              </div>
              <span className="badge-retro bg-brand-500 text-white text-[10px]">
                API v1 Spec
              </span>
            </div>

            {/* Protocol Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-retro-cream border-2 border-retro-border rounded-lg space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 block">HTTP Method</span>
                <span className="font-mono font-black text-retro-black text-sm text-emerald-700">POST</span>
                <p className="text-[10px] text-slate-600 font-bold">Dikirim otomatis per-siswa / batch</p>
              </div>

              <div className="p-3 bg-retro-cream border-2 border-retro-border rounded-lg space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 block">Header Keamanan</span>
                <span className="font-mono font-black text-retro-black text-xs truncate block">Authorization: Bearer</span>
                <p className="text-[10px] text-slate-600 font-bold">Secret token rahasia</p>
              </div>

              <div className="p-3 bg-retro-cream border-2 border-retro-border rounded-lg space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 block">Format Payload</span>
                <span className="font-mono font-black text-retro-black text-xs">application/json</span>
                <p className="text-[10px] text-slate-600 font-bold">Standard UTF-8 JSON</p>
              </div>
            </div>

            {/* Code Snippet Tabs */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 border-b-2 border-retro-border pb-2">
                <button
                  type="button"
                  onClick={() => setActiveApiDocTab("laravel")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                    activeApiDocTab === "laravel"
                      ? "bg-brand-500 text-white shadow-retro-sm"
                      : "bg-slate-100 text-retro-black hover:bg-slate-200"
                  }`}
                >
                  Laravel (PHP)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveApiDocTab("express")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                    activeApiDocTab === "express"
                      ? "bg-brand-500 text-white shadow-retro-sm"
                      : "bg-slate-100 text-retro-black hover:bg-slate-200"
                  }`}
                >
                  Express.js (Node)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveApiDocTab("curl")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                    activeApiDocTab === "curl"
                      ? "bg-brand-500 text-white shadow-retro-sm"
                      : "bg-slate-100 text-retro-black hover:bg-slate-200"
                  }`}
                >
                  cURL Tester
                </button>
                <button
                  type="button"
                  onClick={() => setActiveApiDocTab("json")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                    activeApiDocTab === "json"
                      ? "bg-brand-500 text-white shadow-retro-sm"
                      : "bg-slate-100 text-retro-black hover:bg-slate-200"
                  }`}
                >
                  Skema JSON
                </button>
              </div>

              {/* Snippet Code Container */}
              <div className="relative rounded-xl overflow-hidden border-2 border-retro-border bg-slate-900 shadow-retro-sm text-xs font-mono">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 text-slate-300">
                  <span className="text-[11px] font-bold">
                    {activeApiDocTab === "laravel" && "app/Http/Controllers/Api/SyncGradesController.php"}
                    {activeApiDocTab === "express" && "server.js (Node.js / Express)"}
                    {activeApiDocTab === "curl" && "Terminal / Command Prompt (Testing)"}
                    {activeApiDocTab === "json" && "Payload Specification (RFC 8259)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const snippet =
                        activeApiDocTab === "laravel"
                          ? `<?php\n\nnamespace App\\Http\\Controllers\\Api;\n\nuse App\\Http\\Controllers\\Controller;\nuse Illuminate\\Http\\Request;\nuse Illuminate\\Support\\Facades\\Log;\n\nclass SyncGradesController extends Controller\n{\n    public function syncGrades(Request $request)\n    {\n        // 1. Validasi Bearer Token\n        $token = $request->bearerToken();\n        $expectedToken = config('services.sinusa.api_secret', '${inputSecretToken}');\n\n        if (!$token || $token !== $expectedToken) {\n            return response()->json([\n                'success' => false,\n                'message' => 'Unauthorized: Token Bearer tidak valid.'\n            ], 401);\n        }\n\n        // 2. Baca Payload Siswa & Nilai\n        $academicYear = $request->input('academic_year');\n        $semester     = $request->input('semester');\n        $student      = $request->input('student');\n        $grades       = $request->input('grades', []);\n\n        if (!$student || empty($student['nisn'])) {\n            return response()->json([\n                'success' => false,\n                'message' => 'NISN siswa wajib disertakan.'\n            ], 422);\n        }\n\n        // TODO: Simpan ke tabel database SI-NUSA\n        Log::info("Sinkronisasi rapor berhasil untuk {$student['name']}");\n\n        return response()->json([\n            'success' => true,\n            'message' => "Data nilai siswa {$student['name']} berhasil diterima SI-NUSA.",\n            'synced_at' => now()->toIso8601String(),\n        ], 200);\n    }\n}`
                          : activeApiDocTab === "express"
                          ? `const express = require('express');\nconst app = express();\napp.use(express.json());\n\nconst SECRET_TOKEN = process.env.SINUSA_SECRET_TOKEN || '${inputSecretToken}';\n\napp.post('/api/v1/sync-grades', async (req, res) => {\n  const authHeader = req.headers['authorization'];\n  const token = authHeader && authHeader.split(' ')[1];\n\n  if (!token || token !== SECRET_TOKEN) {\n    return res.status(401).json({ success: false, message: 'Unauthorized: Token Bearer tidak cocok!' });\n  }\n\n  const { academic_year, semester, student, grades } = req.body;\n  if (!student || !student.nisn) {\n    return res.status(400).json({ success: false, message: 'Payload tidak lengkap.' });\n  }\n\n  console.log(\`Sinkronisasi nilai \${student.name} (\${student.class_name}) - \${grades.length} mapel diterima.\`);\n  return res.status(200).json({\n    success: true,\n    message: \`Data rapor siswa \${student.name} berhasil disimpan di SI-NUSA.\`\n  });\n});\n\napp.listen(3000, () => console.log('SI-NUSA receiver running on port 3000'));`
                          : activeApiDocTab === "curl"
                          ? `curl -X POST ${inputEndpointUrl} \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${inputSecretToken}" \\\n  -d '{\n    "academic_year": "2026/2027",\n    "semester": "1",\n    "student": {\n      "nisn": "0081234567",\n      "nis": "1234",\n      "name": "Ahmad Siswa",\n      "class_name": "XI RPL 1"\n    },\n    "grades": [\n      {\n        "subject_code": "MTK",\n        "subject_name": "Matematika",\n        "score_knowledge": 85,\n        "score_skill": 88,\n        "predicate": "B",\n        "description": "Menunjukkan penguasaan baik pada materi fungsi kuadrat."\n      }\n    ]\n  }'`
                          : `{\n  "academic_year": "2026/2027",\n  "semester": "1",\n  "student": {\n    "nisn": "0081234567",\n    "nis": "1234",\n    "name": "Ahmad Siswa",\n    "class_name": "XI RPL 1"\n  },\n  "grades": [\n    {\n      "subject_code": "MTK",\n      "subject_name": "Matematika",\n      "score_knowledge": 85,\n      "score_skill": 88,\n      "predicate": "B",\n      "description": "Menunjukkan penguasaan baik pada materi fungsi kuadrat."\n    }\n  ]\n}`;
                      handleCopySnippet(snippet);
                    }}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSnippet ? "Tersalin!" : "Salin Kode"}</span>
                  </button>
                </div>

                <div className="p-4 overflow-x-auto text-emerald-400 max-h-72">
                  <pre className="leading-relaxed">
                    {activeApiDocTab === "laravel" &&
`<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Log;

class SyncGradesController extends Controller
{
    /**
     * Receiver Webhook dari Rapor Madrasah (rapor-nusa.vercel.app)
     * Endpoint: POST /api/v1/sync-grades
     */
    public function syncGrades(Request $request)
    {
        // 1. Validasi Bearer Token
        $token = $request->bearerToken();
        $expectedToken = config('services.sinusa.api_secret', '${inputSecretToken}');

        if (!$token || $token !== $expectedToken) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Token Bearer tidak valid.'
            ], 401);
        }

        // 2. Ambil data payload rapor siswa
        $academicYear = $request->input('academic_year'); // "2026/2027"
        $semester     = $request->input('semester');      // "1"
        $student      = $request->input('student');       // nisn, nis, name, class_name
        $grades       = $request->input('grades', []);    // array nilai per-mapel

        if (!$student || empty($student['nisn'])) {
            return response()->json([
                'success' => false,
                'message' => 'NISN siswa wajib disertakan.'
            ], 422);
        }

        // 3. Simpan / Perbarui data ke Database SI-NUSA
        // Siswa::updateOrCreate(['nisn' => $student['nisn']], [...]);
        // foreach ($grades as $g) { ... }

        Log::info("Sinkronisasi rapor berhasil untuk {$student['name']}");

        return response()->json([
            'success' => true,
            'message' => "Data nilai siswa {$student['name']} berhasil diterima SI-NUSA.",
            'synced_at' => now()->toIso8601String(),
        ], 200);
    }
}`}
                    {activeApiDocTab === "express" &&
`const express = require('express');
const app = express();
app.use(express.json());

const SECRET_TOKEN = process.env.SINUSA_SECRET_TOKEN || '${inputSecretToken}';

app.post('/api/v1/sync-grades', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token !== SECRET_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Token Bearer tidak cocok!' });
  }

  const { academic_year, semester, student, grades } = req.body;
  if (!student || !student.nisn) {
    return res.status(400).json({ success: false, message: 'Payload tidak lengkap.' });
  }

  // TODO: Simpan ke database SI-NUSA
  console.log(\`Sinkronisasi nilai \${student.name} (\${student.class_name}) - \${grades.length} mapel diterima.\`);

  return res.status(200).json({
    success: true,
    message: \`Data rapor siswa \${student.name} berhasil disimpan di SI-NUSA.\`
  });
});

app.listen(3000, () => console.log('SI-NUSA receiver running on port 3000'));`}
                    {activeApiDocTab === "curl" &&
`curl -X POST ${inputEndpointUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${inputSecretToken}" \\
  -d '{
    "academic_year": "2026/2027",
    "semester": "1",
    "student": {
      "nisn": "0081234567",
      "nis": "1234",
      "name": "Ahmad Siswa",
      "class_name": "XI RPL 1"
    },
    "grades": [
      {
        "subject_code": "MTK",
        "subject_name": "Matematika",
        "score_knowledge": 85,
        "score_skill": 88,
        "predicate": "B",
        "description": "Menunjukkan penguasaan baik pada materi fungsi kuadrat."
      }
    ]
  }'`}
                    {activeApiDocTab === "json" &&
`{
  "academic_year": "2026/2027",
  "semester": "1",
  "student": {
    "nisn": "0081234567",
    "nis": "1234",
    "name": "Ahmad Siswa",
    "class_name": "XI RPL 1"
  },
  "grades": [
    {
      "subject_code": "MTK",
      "subject_name": "Matematika",
      "score_knowledge": 85,
      "score_skill": 88,
      "predicate": "B",
      "description": "Menunjukkan penguasaan baik pada materi fungsi kuadrat."
    }
  ]
}`}
                  </pre>
                </div>
              </div>

              {/* Status Code Reference Table */}
              <div className="pt-2">
                <span className="text-[11px] font-black uppercase text-slate-700 block mb-1">
                  Referensi Kode Status Respon HTTP yang Diharapkan:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-300">
                    <span className="font-bold text-emerald-900 block font-mono">200 OK</span>
                    <span className="text-emerald-700">Data berhasil diproses & disimpan.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-300">
                    <span className="font-bold text-emerald-900 block font-mono">201 Created</span>
                    <span className="text-emerald-700">Record nilai baru berhasil dibuat.</span>
                  </div>
                  <div className="p-2 rounded bg-amber-50 border border-amber-300">
                    <span className="font-bold text-amber-900 block font-mono">401 Unauthorized</span>
                    <span className="text-amber-800">Token Bearer salah / tidak dikirim.</span>
                  </div>
                  <div className="p-2 rounded bg-red-50 border border-red-300">
                    <span className="font-bold text-red-900 block font-mono">422 Unprocessable</span>
                    <span className="text-red-800">Format JSON payload salah / NISN kosong.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL INSPECTOR JSON PAYLOAD ================= */}
      {(selectedPayloadDetail || previewSamplePayload) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-retro bg-white max-w-3xl w-full max-h-[85vh] flex flex-col border-3 border-retro-border shadow-retro-xl animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b-2 border-retro-border bg-retro-cream flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-700" />
                <h3 className="font-black text-retro-black uppercase text-sm">
                  {selectedPayloadDetail
                    ? `Snapshot JSON Payload: ${selectedPayloadDetail.student.name} (${selectedPayloadDetail.student.class_name})`
                    : "Pratinjau Format Payload REST API SI-NUSA"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPayloadDetail(null);
                  setPreviewSamplePayload(null);
                }}
                className="w-8 h-8 rounded-lg border-2 border-retro-border bg-white text-retro-black font-black hover:bg-red-500 hover:text-white flex items-center justify-center shadow-retro-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto font-mono text-xs flex-1 bg-slate-900 text-emerald-400 rounded-b-lg">
              <pre className="whitespace-pre-wrap break-words leading-relaxed">
                {JSON.stringify(selectedPayloadDetail || previewSamplePayload, null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t-2 border-retro-border bg-retro-cream flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600">
                Format standar integrasi sinkronisasi grades rapor madrasah ke SI-NUSA.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = JSON.stringify(selectedPayloadDetail || previewSamplePayload, null, 2);
                    navigator.clipboard.writeText(text);
                    setMessage({ type: "success", text: "JSON Payload berhasil disalin ke clipboard!" });
                  }}
                  className="btn-retro-primary text-xs font-black py-1.5 px-3 shadow-retro-sm"
                >
                  Salin JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPayloadDetail(null);
                    setPreviewSamplePayload(null);
                  }}
                  className="btn-retro-white text-xs font-black py-1.5 px-3 shadow-retro-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL CETAK DATA AKUN GURU (PDF A4) */}
      <CetakDataGuruModal
        isOpen={isCetakGuruModalOpen}
        onClose={() => setIsCetakGuruModalOpen(false)}
        teachers={teachers}
        config={config}
        tahun={activePeriodObj?.tahun || "2026/2027"}
        semester={activePeriodObj?.semester || "1"}
      />
    </div>
  );
}
