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

  // Form states: Tambah Guru
  const [newNama, setNewNama] = useState("");
  const [newNip, setNewNip] = useState("-");
  const [newJk, setNewJk] = useState<"L" | "P">("L");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("123456");

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
  const [cfgKota, setCfgKota] = useState(config.kota_tanggal || "Blitar");

  useEffect(() => {
    refreshData();
    if (allKelas.length > 0) {
      setAssignKelas(allKelas[0]);
      setWaliKelasTarget(allKelas[0]);
      setMonitorKelas(allKelas[0]);
    }
    if (allMapel.length > 0) {
      setAssignKodeMapel(allMapel[0].kode);
    }
  }, [madrasahId, allKelas, allMapel]);

  const refreshData = () => {
    const t = getTeachers(madrasahId);
    setTeachers(t);
    if (t.length > 0 && !assignGuruId) {
      setAssignGuruId(t[0].id);
      setWaliGuruTarget(t[0].id);
    }
    setAssignments(getTeacherAssignments(madrasahId));
    setHomerooms(getHomeroomAssignments(madrasahId));
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newUsername) {
      setMessage({ type: "error", text: "Nama dan Username wajib diisi!" });
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
      setNewPassword("123456");
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
    const m = allMapel.find(item => item.kode === assignKodeMapel);
    if (!g || !m || !assignKelas) {
      setMessage({ type: "error", text: "Pilih Guru, Mapel, dan Kelas secara lengkap!" });
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
    refreshData();
  };

  const handleSetHomeroom = (e: React.FormEvent) => {
    e.preventDefault();
    const g = teachers.find(t => t.id === waliGuruTarget);
    const res = setHomeroomAssignment(
      madrasahId,
      waliKelasTarget,
      g ? g.id : "",
      g ? g.nama_user : ""
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
      kota_tanggal: cfgKota,
    };
    updateSchoolConfig(madrasahId, updated);
    onConfigUpdated(updated);
    setMessage({ type: "success", text: "Pengaturan madrasah berhasil disimpan!" });
  };

  const rekapKirim = monitorKelas ? getRekapKirimNilaiKelas(madrasahId, monitorKelas) : [];
  const mapelSudahKirim = rekapKirim.filter(r => r.is_sent).length;

  return (
    <div className="space-y-6">
      {/* Alert Notifikasi */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between shadow-sm ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Header Operator */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 rounded-2xl text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base">Dashboard Operator Madrasah</span>
              <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {config.jenjang}
              </span>
            </div>
            <p className="text-xs text-slate-300">{config.nama_madrasah} • KMA Nomor 1503 Tahun 2025</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-400 block text-[10px]">Total Guru Terdaftar:</span>
            <span className="font-bold text-white text-sm">{teachers.length} Guru</span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-400 block text-[10px]">Total Rombel Kelas:</span>
            <span className="font-bold text-white text-sm">{allKelas.length} Rombel</span>
          </div>
        </div>
      </div>

      {/* Nav Tabs Alur Pengerjaan Sesuai Video */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setActiveTab("guru")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
            activeTab === "guru" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          1. Manajemen Guru & Akun ({teachers.length})
        </button>

        <button
          onClick={() => setActiveTab("mengajar")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
            activeTab === "mengajar" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          2. Pembagian Tugas Mengajar ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab("wali")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
            activeTab === "wali" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          3. Penugasan Wali Kelas ({homerooms.length}/{allKelas.length})
        </button>

        <button
          onClick={() => setActiveTab("monitoring")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
            activeTab === "monitoring" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          4. Monitoring Kirim Nilai
        </button>

        <button
          onClick={() => setActiveTab("pengaturan")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
            activeTab === "pengaturan" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          5. Pengaturan Rapor
        </button>
      </div>

      {/* ================= TAB 1: MANAJEMEN GURU ================= */}
      {activeTab === "guru" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Tambah Guru */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Tambah Guru / Tenaga Pendidik
            </h4>
            <form onSubmit={handleAddTeacher} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={e => setNewNama(e.target.value)}
                  placeholder="Contoh: Siti Fatimah, S.Pd.I."
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">NIP (Jika ada / biarkan -):</label>
                <input
                  type="text"
                  value={newNip}
                  onChange={e => setNewNip(e.target.value)}
                  placeholder="19800101..."
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Jenis Kelamin:</label>
                <select
                  value={newJk}
                  onChange={e => setNewJk(e.target.value as any)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Username Login Guru:</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="Contoh: sitifatimah"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Password Awal:</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
              >
                + Simpan Akun Guru
              </button>
            </form>
          </div>

          {/* Tabel Daftar Guru */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Tenaga Pendidik Terdaftar ({teachers.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                {teachers.length === 0 ? "Belum ada guru, silakan tambahkan di form kiri." : "Siap diberikan tugas mengajar"}
              </span>
            </div>

            {teachers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-300 rounded-xl">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-xs text-slate-600">Data Guru Saat Ini Kosong</p>
                <p className="text-[11px] text-slate-400">Sesuai permintaan, seluruh data guru dikosongkan. Silakan input akun guru resmi madrasah.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                    <tr>
                      <th className="py-2.5 px-3 w-8">No</th>
                      <th className="py-2.5 px-3">Nama Guru</th>
                      <th className="py-2.5 px-3 w-28">NIP</th>
                      <th className="py-2.5 px-3 w-28">Username</th>
                      <th className="py-2.5 px-3 w-20 text-center">Status</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{t.nama_user}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{t.nip || "-"}</td>
                        <td className="py-2 px-3 font-mono font-medium text-emerald-800 bg-emerald-50/50">{t.username}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            Aktif
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleDeleteTeacher(t.id, t.nama_user)}
                            className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ================= TAB 2: PEMBAGIAN TUGAS MENGAJAR ================= */}
      {activeTab === "mengajar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Tugaskan Guru Mengajar
            </h4>
            {teachers.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Tambahkan guru terlebih dahulu di Tab 1 sebelum mengatur tugas mengajar!
              </div>
            ) : (
              <form onSubmit={handleAddAssignment} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Guru Pengampu:</label>
                  <select
                    value={assignGuruId}
                    onChange={e => setAssignGuruId(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nama_user} ({t.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Mata Pelajaran (KMA 1503/2025):</label>
                  <select
                    value={assignKodeMapel}
                    onChange={e => setAssignKodeMapel(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    {allMapel.map(m => (
                      <option key={m.kode} value={m.kode}>
                        [{m.kelompok}] {m.nama} ({m.kode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Kelas Rombel:</label>
                  <select
                    value={assignKelas}
                    onChange={e => setAssignKelas(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
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
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
                >
                  + Tetapkan Tugas Mengajar
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
              Daftar Penugasan Mengajar Aktif ({assignments.length})
            </h4>
            {assignments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-300 rounded-xl">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-xs text-slate-600">Belum Ada Penugasan Mengajar</p>
                <p className="text-[11px] text-slate-400">Guru tidak akan bisa menginput nilai sampai Operator memberikan tugas mengajar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                    <tr>
                      <th className="py-2.5 px-3 w-8">No</th>
                      <th className="py-2.5 px-3">Nama Guru</th>
                      <th className="py-2.5 px-3">Mata Pelajaran</th>
                      <th className="py-2.5 px-3 w-24 text-center">Kelas</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.map((a, idx) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{a.guru_nama}</td>
                        <td className="py-2 px-3 text-slate-700">{a.nama_mapel} ({a.kode_mapel})</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-800">{a.kelas}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleDeleteAssignment(a.id)}
                            className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                            title="Hapus Penugasan"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ================= TAB 3: PENUGASAN WALI KELAS ================= */}
      {activeTab === "wali" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Tetapkan Wali Kelas
            </h4>
            {teachers.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Tambahkan guru terlebih dahulu di Tab 1!
              </div>
            ) : (
              <form onSubmit={handleSetHomeroom} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Kelas Rombel:</label>
                  <select
                    value={waliKelasTarget}
                    onChange={e => setWaliKelasTarget(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                  >
                    {allKelas.map(k => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Guru sebagai Wali:</label>
                  <select
                    value={waliGuruTarget}
                    onChange={e => setWaliGuruTarget(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="">-- Kosongkan Wali --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nama_user} ({t.username})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
                >
                  Simpan Wali Kelas
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
              Status Wali Kelas Seluruh Rombel ({allKelas.length} Rombel)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                  <tr>
                    <th className="py-2.5 px-3 w-8">No</th>
                    <th className="py-2.5 px-3 w-28">Kelas Rombel</th>
                    <th className="py-2.5 px-3">Nama Wali Kelas</th>
                    <th className="py-2.5 px-3 w-32 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allKelas.map((k, idx) => {
                    const found = homerooms.find(h => h.kelas === k);
                    return (
                      <tr key={k} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-emerald-800">Kelas {k}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {found ? found.wali_guru_nama : <span className="text-slate-400 italic font-normal">Belum ditentukan</span>}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {found ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Terhubung
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
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

      {/* ================= TAB 4: MONITORING STATUS KIRIM NILAI ================= */}
      {activeTab === "monitoring" && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Monitoring Progres Pengiriman Nilai Guru Mapel
              </h4>
              <p className="text-[11px] text-slate-500">
                Pantau mapel mana yang sudah mengklik &quot;Kirim Nilai&quot; ke Wali Kelas
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">Pilih Kelas:</label>
              <select
                value={monitorKelas}
                onChange={e => setMonitorKelas(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 font-bold text-emerald-800 bg-white"
              >
                {allKelas.map(k => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span>
              Progres Kelas {monitorKelas}: <strong>{mapelSudahKirim}</strong> dari {rekapKirim.length} Mapel Sudah Mengirim Nilai
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              mapelSudahKirim === rekapKirim.length ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              {Math.round((mapelSudahKirim / (rekapKirim.length || 1)) * 100)}% Lengkap
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                <tr>
                  <th className="py-2.5 px-3 w-8">No</th>
                  <th className="py-2.5 px-3">Mata Pelajaran (KMA 1503)</th>
                  <th className="py-2.5 px-3">Guru Pengampu</th>
                  <th className="py-2.5 px-3 w-36 text-center">Status Kirim</th>
                  <th className="py-2.5 px-3 w-44">Waktu Pengiriman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekapKirim.map((r, idx) => (
                  <tr key={r.mapel.kode_mapel} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      [{r.mapel.kelompok}] {r.mapel.nama_mapel} ({r.mapel.kode_mapel})
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-700">{r.guru_nama}</td>
                    <td className="py-2 px-3 text-center">
                      {r.is_sent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Terkirim
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Belum Kirim
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{r.tanggal_kirim || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: PENGATURAN MADRASAH & TANGGAL RAPOR ================= */}
      {activeTab === "pengaturan" && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-2xl space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
            Pengaturan Kepala Madrasah & Titimangsa Rapor
          </h4>
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Kepala Madrasah Resmi:</label>
              <input
                type="text"
                required
                value={cfgNamaKamad}
                onChange={e => setCfgNamaKamad(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">NIP Kepala Madrasah:</label>
              <input
                type="text"
                value={cfgNipKamad}
                onChange={e => setCfgNipKamad(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Kota Penerbitan:</label>
                <input
                  type="text"
                  value={cfgKota}
                  onChange={e => setCfgKota(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tanggal Pembagian Rapor:</label>
                <input
                  type="text"
                  value={cfgTglRapor}
                  onChange={e => setCfgTglRapor(e.target.value)}
                  placeholder="Contoh: 20 Desember 2025"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
            >
              Simpan Pengaturan Madrasah
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
