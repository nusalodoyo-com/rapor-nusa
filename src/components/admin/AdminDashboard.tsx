"use client";

import React, { useState, useEffect } from "react";
import {
  MadrasahId,
  User,
  TeacherAssignment,
  HomeroomAssignment,
  SchoolConfig,
} from "@/types";
import {
  getTeachers,
  addTeacher,
  deleteTeacher,
  getTeacherAssignments,
  addTeacherAssignment,
  deleteTeacherAssignment,
  getHomeroomAssignments,
  setHomeroomAssignment,
  getRekapKirimNilaiKelas,
  updateSchoolConfig,
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
  const [activeTab, setActiveTab] = useState<"guru" | "mengajar" | "wali" | "monitoring" | "pengaturan">("guru");
  const [teachers, setTeachers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [homerooms, setHomerooms] = useState<HomeroomAssignment[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search filter for teacher table
  const [searchTeacher, setSearchTeacher] = useState("");

  // Form states: Tambah Guru
  const [newNama, setNewNama] = useState("");
  const [newNip, setNewNip] = useState("-");
  const [newJk, setNewJk] = useState<"L" | "P">("L");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("Matsamuda22");

  // Form states: Penugasan Mengajar
  const [assignGuruId, setAssignGuruId] = useState("");
  const [assignKodeMapel, setAssignKodeMapel] = useState("");
  const [assignKelas, setAssignKelas] = useState("");

  // Form states: Penugasan Wali Kelas
  const [waliKelasTarget, setWaliKelasTarget] = useState("");
  const [waliGuruTarget, setWaliGuruTarget] = useState("");

  // Monitoring selected class
  const [monitorKelas, setMonitorKelas] = useState("");

  // Form config
  const [cfgNamaKamad, setCfgNamaKamad] = useState(config.kepala_madrasah);
  const [cfgNipKamad, setCfgNipKamad] = useState(config.nip_kepala);
  const [cfgTglRapor, setCfgTglRapor] = useState(config.tanggal_rapor || "20 Desember 2025");
  const [cfgKotaTgl, setCfgKotaTgl] = useState(config.kota_tanggal || "Blitar");

  const refreshData = () => {
    const t = getTeachers(madrasahId);
    setTeachers(t);
    const a = getTeacherAssignments(madrasahId);
    setAssignments(a);
    const h = getHomeroomAssignments(madrasahId);
    setHomerooms(h);

    if (t.length > 0 && !assignGuruId) setAssignGuruId(t[0].id);
    if (allMapel.length > 0 && !assignKodeMapel) setAssignKodeMapel(allMapel[0].kode);
    if (allKelas.length > 0 && !assignKelas) setAssignKelas(allKelas[0]);
    if (allKelas.length > 0 && !waliKelasTarget) setWaliKelasTarget(allKelas[0]);
    if (allKelas.length > 0 && !monitorKelas) setMonitorKelas(allKelas[0]);
  };

  useEffect(() => {
    refreshData();
  }, [madrasahId]);

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

  const handleDeleteTeacher = (id: string, nama: string) => {
    if (confirm(`Hapus guru ${nama} dari sistem?`)) {
      deleteTeacher(madrasahId, id);
      setMessage({ type: "success", text: `Guru ${nama} telah dihapus.` });
      refreshData();
    }
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const g = teachers.find(t => t.id === assignGuruId);
    const m = allMapel.find(mp => mp.kode === assignKodeMapel);
    if (!g || !m || !assignKelas) {
      setMessage({ type: "error", text: "Lengkapi data guru, mapel, dan kelas!" });
      return;
    }

    const res = addTeacherAssignment(madrasahId, {
      guru_id: g.id,
      guru_nama: g.nama_user,
      kode_mapel: m.kode,
      nama_mapel: m.nama,
      kelas: assignKelas,
    });

    if (res.success) {
      setMessage({ type: "success", text: res.message });
      refreshData();
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  const handleDeleteAssignment = (id: string) => {
    deleteTeacherAssignment(madrasahId, id);
    setMessage({ type: "success", text: "Penugasan mengajar dihapus." });
    refreshData();
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

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SchoolConfig = {
      ...config,
      kepala_madrasah: cfgNamaKamad,
      nip_kepala: cfgNipKamad,
      tanggal_rapor: cfgTglRapor,
      kota_tanggal: cfgKotaTgl,
    };
    updateSchoolConfig(madrasahId, updated);
    onConfigUpdated(updated);
    setMessage({ type: "success", text: "Pengaturan madrasah berhasil disimpan!" });
  };

  const rekapKirim = monitorKelas ? getRekapKirimNilaiKelas(madrasahId, monitorKelas) : [];
  const mapelSudahKirim = rekapKirim.filter(r => r.is_sent).length;

  const filteredTeachers = teachers.filter(t => 
    t.nama_user.toLowerCase().includes(searchTeacher.toLowerCase()) ||
    t.username.toLowerCase().includes(searchTeacher.toLowerCase()) ||
    (t.nip && t.nip.includes(searchTeacher))
  );

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
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-retro bg-brand-500 text-white">
                OPERATOR • {config.jenjang}
              </span>
              <span className="badge-retro bg-retro-yellow text-retro-black">
                KMA 1503/2025
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-retro-black mt-1">
              DASHBOARD OPERATOR MADRASAH
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
        </div>
      </div>

      {/* Nav Tabs Alur Pengerjaan (Bold Retro Tabs) */}
      <div className="flex flex-wrap items-center gap-2 bg-retro-cream p-2 rounded-xl border-2 border-retro-border shadow-retro-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("guru")}
          className={activeTab === "guru" ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5" : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"}
        >
          <Users className="w-3.5 h-3.5" />
          <span>1. Guru & Akun ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("mengajar")}
          className={activeTab === "mengajar" ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5" : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>2. Tugas Mengajar ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wali")}
          className={activeTab === "wali" ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5" : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>3. Wali Kelas ({homerooms.length}/{allKelas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("monitoring")}
          className={activeTab === "monitoring" ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5" : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>4. Monitoring Kirim</span>
        </button>

        <button
          onClick={() => setActiveTab("pengaturan")}
          className={activeTab === "pengaturan" ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5" : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5"}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>5. Pengaturan Rapor</span>
        </button>
      </div>

      {/* ================= TAB 1: MANAJEMEN GURU ================= */}
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

              <div className="pt-2 border-t-2 border-dashed border-slate-300">
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Username Login:</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="Contoh: siti_fatimah"
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-mono font-bold shadow-retro-sm focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Password:</label>
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
                className="w-full py-2.5 btn-retro-primary text-xs font-black uppercase tracking-wider mt-2"
              >
                + Simpan Guru Baru
              </button>
            </form>
          </div>

          {/* Tabel Daftar Guru */}
          <div className="lg:col-span-2 card-retro p-5 space-y-3 bg-white">
            <div className="flex flex-wrap justify-between items-center border-b-2 border-retro-border pb-3 gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                  Daftar Tenaga Pendidik Terdaftar ({teachers.length})
                </h4>
                <p className="text-[11px] text-slate-500 font-bold">
                  87 data guru resmi telah dimasukkan dan siap ditugaskan.
                </p>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  value={searchTeacher}
                  onChange={e => setSearchTeacher(e.target.value)}
                  placeholder="Cari nama / username..."
                  className="w-full text-xs py-1.5 pl-7 pr-2.5 rounded-lg border-2 border-retro-border bg-retro-cream font-bold"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Nama Lengkap</th>
                    <th className="py-2.5 px-3 w-28">NIP / NIK</th>
                    <th className="py-2.5 px-3 w-28">Username</th>
                    <th className="py-2.5 px-3 w-24 text-center">Password</th>
                    <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 font-bold">
                  {filteredTeachers.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-brand-50/40">
                      <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 text-retro-black">{t.nama_user}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{t.nip || "-"}</td>
                      <td className="py-2 px-3 font-mono text-brand-800 bg-brand-50/50">{t.username}</td>
                      <td className="py-2 px-3 text-center font-mono text-xs">{t.password || "Matsamuda22"}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleDeleteTeacher(t.id, t.nama_user)}
                          className="p-1.5 rounded-lg border-2 border-red-600 bg-red-100 hover:bg-red-200 text-red-800 transition"
                          title="Hapus Guru"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PEMBAGIAN TUGAS MENGAJAR ================= */}
      {activeTab === "mengajar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Form Plotting Guru -> Mapel -> Kelas */}
          <div className="card-retro p-5 space-y-4 bg-retro-cream">
            <h4 className="text-xs font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-retro-border pb-2">
              <Plus className="w-4 h-4 text-brand-600" />
              Plotting Tugas Mengajar
            </h4>
            <form onSubmit={handleAddAssignment} className="space-y-3">
              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Pilih Guru Pengampu:</label>
                <select
                  value={assignGuruId}
                  onChange={e => setAssignGuruId(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nama_user} ({t.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Mata Pelajaran (KMA 1503):</label>
                <select
                  value={assignKodeMapel}
                  onChange={e => setAssignKodeMapel(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm"
                >
                  {allMapel.map(m => (
                    <option key={m.kode} value={m.kode}>
                      {m.nama} ({m.kode}) - Kel. {m.kelompok}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Rombongan Belajar (Kelas):</label>
                <select
                  value={assignKelas}
                  onChange={e => setAssignKelas(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm"
                >
                  {allKelas.map(k => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 btn-retro-primary text-xs font-black uppercase tracking-wider mt-2"
              >
                + Simpan Tugas Mengajar
              </button>
            </form>
          </div>

          {/* Tabel Penugasan Mengajar */}
          <div className="lg:col-span-2 card-retro p-5 space-y-3 bg-white">
            <div className="flex justify-between items-center border-b-2 border-retro-border pb-3">
              <h4 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                Daftar Tugas Mengajar Aktif ({assignments.length})
              </h4>
              <span className="badge-retro bg-brand-100 text-brand-900">
                Terkoneksi Guru Mapel
              </span>
            </div>

            {assignments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-300 rounded-xl">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                <p className="font-bold text-xs text-slate-700">Belum Ada Tugas Mengajar</p>
                <p className="text-[11px] text-slate-500">Tugaskan guru ke kelas dan mapel pada form di sebelah kiri.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3">Nama Guru</th>
                      <th className="py-2.5 px-3">Mata Pelajaran</th>
                      <th className="py-2.5 px-3 w-24 text-center">Kelas</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100 font-bold">
                    {assignments.map((a, idx) => (
                      <tr key={a.id} className="hover:bg-brand-50/40">
                        <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 text-retro-black">{a.guru_nama}</td>
                        <td className="py-2 px-3 text-brand-900">{a.nama_mapel} ({a.kode_mapel})</td>
                        <td className="py-2 px-3 text-center">
                          <span className="badge-retro bg-retro-cream text-retro-black">
                            Kelas {a.kelas}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleDeleteAssignment(a.id)}
                            className="p-1.5 rounded-lg border-2 border-red-600 bg-red-100 hover:bg-red-200 text-red-800 transition"
                            title="Hapus Penugasan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PENETAPAN WALI KELAS ================= */}
      {activeTab === "wali" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Form Assign Wali */}
          <div className="card-retro p-5 space-y-4 bg-retro-cream">
            <h4 className="text-xs font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-retro-border pb-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Tetapkan Wali Kelas
            </h4>
            <form onSubmit={handleSetWali} className="space-y-3">
              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Rombongan Belajar (Kelas):</label>
                <select
                  value={waliKelasTarget}
                  onChange={e => setWaliKelasTarget(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm"
                >
                  {allKelas.map(k => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">Guru sebagai Wali Kelas:</label>
                <select
                  value={waliGuruTarget}
                  onChange={e => setWaliGuruTarget(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm"
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
                className="w-full py-2.5 btn-retro-primary text-xs font-black uppercase tracking-wider mt-2"
              >
                Simpan Wali Kelas
              </button>
            </form>
          </div>

          {/* Tabel Status Wali Seluruh Kelas */}
          <div className="lg:col-span-2 card-retro p-5 space-y-3 bg-white">
            <div className="flex justify-between items-center border-b-2 border-retro-border pb-3">
              <h4 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                Daftar Wali Kelas ({homerooms.length} dari {allKelas.length} Terisi)
              </h4>
              <span className="badge-retro bg-retro-yellow text-retro-black">
                {Math.round((homerooms.length / allKelas.length) * 100)}% Terplot
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-28">Rombel Kelas</th>
                    <th className="py-2.5 px-3">Nama Wali Kelas</th>
                    <th className="py-2.5 px-3 w-28 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 font-bold">
                  {allKelas.map((k, idx) => {
                    const match = homerooms.find(h => h.kelas === k);
                    return (
                      <tr key={k} className="hover:bg-brand-50/40">
                        <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-black text-retro-black">Kelas {k}</td>
                        <td className="py-2 px-3">
                          {match ? (
                            <span className="text-brand-900 font-black">{match.wali_guru_nama}</span>
                          ) : (
                            <span className="text-slate-400 italic">Belum ditentukan</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {match ? (
                            <span className="badge-retro bg-brand-500 text-white">Terisi</span>
                          ) : (
                            <span className="badge-retro bg-red-100 text-red-900">Kosong</span>
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

      {/* ================= TAB 4: MONITORING KIRIM NILAI ================= */}
      {activeTab === "monitoring" && (
        <div className="card-retro p-5 space-y-4 bg-white">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-retro-border pb-3 gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                Monitoring Pengiriman Nilai RDM ({config.jenjang})
              </h4>
              <p className="text-[11px] text-slate-500 font-bold">
                Pantau mata pelajaran yang sudah dikirim oleh guru ke wali kelas untuk masuk ke rapor.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-retro-black uppercase">Pilih Kelas:</label>
              <select
                value={monitorKelas}
                onChange={e => setMonitorKelas(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-lg border-2 border-retro-border bg-retro-cream font-black shadow-retro-sm"
              >
                {allKelas.map(k => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress Box */}
          <div className="p-4 rounded-xl border-2 border-retro-border bg-retro-cream flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-retro-black uppercase block">
                Progres Pengiriman Kelas {monitorKelas}
              </span>
              <span className="text-xs text-slate-600 font-bold">
                {mapelSudahKirim} dari {allMapel.length} Mata Pelajaran Selesai Dikirim
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-36 h-3 bg-white rounded-full border-2 border-retro-border overflow-hidden">
                <div
                  className="h-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${allMapel.length > 0 ? (mapelSudahKirim / allMapel.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="badge-retro bg-brand-500 text-white">
                {allMapel.length > 0 ? Math.round((mapelSudahKirim / allMapel.length) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 w-20">Kode</th>
                  <th className="py-2.5 px-3">Mata Pelajaran (KMA 1503)</th>
                  <th className="py-2.5 px-3">Guru Pengampu</th>
                  <th className="py-2.5 px-3 w-32 text-center">Status Nilai</th>
                  <th className="py-2.5 px-3 w-40 text-center">Waktu Kirim</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 font-bold">
                {rekapKirim.map((row, idx) => (
                  <tr key={row.mapel.kode_mapel} className="hover:bg-brand-50/40">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-brand-800">{row.mapel.kode_mapel}</td>
                    <td className="py-2.5 px-3 text-retro-black">{row.mapel.nama_mapel}</td>
                    <td className="py-2.5 px-3 text-slate-700">{row.guru_nama}</td>
                    <td className="py-2.5 px-3 text-center">
                      {row.is_sent ? (
                        <span className="badge-retro bg-brand-500 text-white">
                          ✓ Terkirim
                        </span>
                      ) : (
                        <span className="badge-retro bg-amber-200 text-retro-black">
                          ⏳ Belum Kirim
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">
                      {row.tanggal_kirim || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: PENGATURAN MADRASAH & RAPOR ================= */}
      {activeTab === "pengaturan" && (
        <div className="card-retro p-5 sm:p-6 space-y-4 bg-retro-cream max-w-2xl mx-auto">
          <div className="border-b-2 border-retro-border pb-3">
            <h4 className="text-sm font-black text-retro-black uppercase tracking-wider">
              Pengaturan Profil Lembaga & Titimangsa Rapor
            </h4>
            <p className="text-[11px] text-slate-600 font-bold">
              Data ini akan dicetak pada seluruh dokumen Rapor dan Legger resmi.
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
                className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm"
              />
            </div>

            <div>
              <label className="text-xs font-black text-retro-black uppercase block mb-1">NIP Kepala Madrasah (Jika Ada):</label>
              <input
                type="text"
                value={cfgNipKamad}
                onChange={e => setCfgNipKamad(e.target.value)}
                className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-white font-mono shadow-retro-sm"
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
                  className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm"
                />
              </div>

              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">Tanggal Titimangsa Rapor:</label>
                <input
                  type="text"
                  required
                  value={cfgTglRapor}
                  onChange={e => setCfgTglRapor(e.target.value)}
                  className="w-full text-xs py-2.5 px-3.5 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 btn-retro-primary text-xs font-black uppercase tracking-wider"
              >
                💾 Simpan Pengaturan Rapor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
