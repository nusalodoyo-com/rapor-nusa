"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  MadrasahId,
  User,
  SchoolConfig,
  RaporWaliItem,
  NilaiP5RAItem,
  NilaiEkskulItem,
  StatusKirimNilai,
  TeacherAssignment,
} from "@/types";
import {
  getRaporWaliByKelas,
  simpanRaporWaliBatch,
  getNilaiP5RA,
  saveNilaiP5RABatch,
  getNilaiEkskulByKelas,
  simpanNilaiEkskulBatch,
  getStatusKirimNilai,
  getTeacherAssignments,
  getHomeroomAssignments,
  getSiswaByKelas,
} from "@/lib/storage";
import {
  ClipboardCheck,
  Award,
  Heart,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  BarChart3,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface Props {
  madrasahId: MadrasahId;
  currentUser: User;
  config: SchoolConfig;
  allKelas: string[];
  allMapel: { kode: string; nama: string; kelompok?: string; kkm?: number }[];
  allEkskul: string[];
  onOpenLegger: (kelas: string) => void;
  onOpenCetakRapor: (kelas: string) => void;
  onSwitchToGuru?: () => void;
}

export default function WaliDashboard({
  madrasahId,
  currentUser,
  config,
  allKelas,
  allMapel,
  allEkskul,
  onOpenLegger,
  onOpenCetakRapor,
  onSwitchToGuru,
}: Props) {
  // Tentukan kelas yang diampu wali
  const defaultKelas =
    currentUser.kelas_diampu && currentUser.kelas_diampu !== "-"
      ? currentUser.kelas_diampu.split(",")[0].trim()
      : allKelas[0] || "VII.A";

  const [activeKelas, setActiveKelas] = useState(defaultKelas);
  const [activeTab, setActiveTab] = useState<"monitoring" | "presensi" | "catatan" | "p5ra" | "ekskul">("monitoring");

  const [tahun, setTahun] = useState("2025/2026");
  const [semester, setSemester] = useState("1");

  // Tab 1: Monitoring Status Kirim
  const [rekapKirim, setRekapKirim] = useState<
    { kode: string; nama: string; kelompok: string; guru: string; status: StatusKirimNilai }[]
  >([]);

  // Tab 2 & 3: Presensi & Catatan Wali
  const [dataWali, setDataWali] = useState<RaporWaliItem[]>([]);

  // Tab 4: P5RA (KBC)
  const [dataP5RA, setDataP5RA] = useState<NilaiP5RAItem[]>([]);

  // Tab 5: Ekstrakurikuler
  const [selectedEkskul, setSelectedEkskul] = useState(allEkskul[0] || "Pramuka");
  const [dataEkskul, setDataEkskul] = useState<NilaiEkskulItem[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load data saat activeKelas berubah
  useEffect(() => {
    // 1. Rekap status kirim
    const assignments = getTeacherAssignments(madrasahId);
    const rekap = allMapel.map(m => {
      const assign = assignments.find(
        a => a.kode_mapel.toLowerCase() === m.kode.toLowerCase() && a.kelas === activeKelas
      );
      const st = getStatusKirimNilai(madrasahId, m.kode, activeKelas);
      return {
        kode: m.kode,
        nama: m.nama,
        kelompok: m.kelompok || "Umum",
        guru: assign ? assign.guru_nama : "Belum Ditugaskan",
        status: st,
      };
    });
    setRekapKirim(rekap);

    // 2. Data Presensi & Catatan Wali
    const rw = getRaporWaliByKelas(madrasahId, tahun, semester, activeKelas);
    setDataWali(rw);

    // 3. Data P5RA
    const p5 = getNilaiP5RA(madrasahId, activeKelas);
    setDataP5RA(p5);

    // 4. Data Ekskul
    if (selectedEkskul) {
      const eks = getNilaiEkskulByKelas(madrasahId, tahun, semester, activeKelas, selectedEkskul);
      setDataEkskul(eks);
    }
  }, [madrasahId, activeKelas, tahun, semester, allMapel, selectedEkskul]);

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch {}
  };

  // Simpan Presensi & Catatan Wali
  const handleSaveWali = () => {
    setIsSaving(true);
    const res = simpanRaporWaliBatch(madrasahId, tahun, semester, dataWali);
    setIsSaving(false);
    if (res.success) {
      triggerConfetti();
      setNotification({ type: "success", message: res.message });
    } else {
      setNotification({ type: "error", message: res.message });
    }
  };

  // Simpan P5RA (KBC)
  const handleSaveP5RA = () => {
    setIsSaving(true);
    const res = saveNilaiP5RABatch(madrasahId, dataP5RA);
    setIsSaving(false);
    if (res.success) {
      triggerConfetti();
      setNotification({ type: "success", message: res.message });
    } else {
      setNotification({ type: "error", message: res.message });
    }
  };

  // Simpan Ekskul
  const handleSaveEkskul = () => {
    setIsSaving(true);
    const res = simpanNilaiEkskulBatch(madrasahId, tahun, semester, selectedEkskul, dataEkskul);
    setIsSaving(false);
    if (res.success) {
      triggerConfetti();
      setNotification({ type: "success", message: res.message });
    } else {
      setNotification({ type: "error", message: res.message });
    }
  };

  // Hitung persentase nilai mapel masuk
  const totalMapel = rekapKirim.length;
  const mapelTerkirim = rekapKirim.filter(r => r.status.is_sent).length;
  const persenTerkirim = totalMapel > 0 ? Math.round((mapelTerkirim / totalMapel) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Wali Kelas */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-2xl p-5 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-bold text-xl shadow-inner">
            <UserCheck className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                Portal Wali Kelas • {config.jenjang}
              </span>
              <span className="text-xs text-emerald-200 font-mono">
                Kelas {activeKelas}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight uppercase">
              {currentUser.nama_user}
            </h2>
            <p className="text-xs text-emerald-100/90 font-medium">
              {config.nama_madrasah} • Membina {dataWali.length} Siswa
            </p>
          </div>
        </div>

        {/* Action Buttons: Legger, Cetak Rapor, Switch to Guru */}
        <div className="flex flex-wrap items-center gap-2">
          {onSwitchToGuru && (
            <button
              onClick={onSwitchToGuru}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur transition"
            >
              👨‍🏫 Beralih ke Guru Mapel
            </button>
          )}

          <button
            onClick={() => onOpenLegger(activeKelas)}
            className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Legger & Ranking</span>
          </button>

          <button
            onClick={() => onOpenCetakRapor(activeKelas)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-emerald-950 font-black text-xs flex items-center gap-1.5 shadow transition"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Cetak Lembar Rapor</span>
          </button>
        </div>
      </div>

      {/* Selector Rombel (jika wali memegang lebih dari 1 kelas atau admin membuka) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Pilih Rombel:</label>
          <select
            value={activeKelas}
            onChange={e => setActiveKelas(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {allKelas.map(k => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </select>
        </div>

        {/* Progress bar nilai masuk */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-700 block">
              Nilai Mapel Masuk: {mapelTerkirim} / {totalMapel} ({persenTerkirim}%)
            </span>
            <span className="text-[10px] text-slate-400">
              {mapelTerkirim === totalMapel ? "Semua nilai mapel lengkap!" : "Menunggu pengiriman guru mapel"}
            </span>
          </div>
          <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                persenTerkirim === 100 ? "bg-emerald-500" : "bg-teal-500"
              }`}
              style={{ width: `${persenTerkirim}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("monitoring")}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === "monitoring"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Status Masuknya Nilai Mapel</span>
        </button>

        <button
          onClick={() => setActiveTab("presensi")}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === "presensi"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Presensi Ketidakhadiran (S/I/A)</span>
        </button>

        <button
          onClick={() => setActiveTab("catatan")}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === "catatan"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Catatan Karakter & Kenaikan</span>
        </button>

        <button
          onClick={() => setActiveTab("p5ra")}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === "p5ra"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Kokurikuler P5RA (KBC - Panca Cinta)</span>
        </button>

        <button
          onClick={() => setActiveTab("ekskul")}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === "ekskul"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Ekstrakurikuler</span>
        </button>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between ${
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

      {/* TAB 1: STATUS MASUKNYA NILAI MAPEL */}
      {activeTab === "monitoring" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Status Pengiriman Nilai Mata Pelajaran (KMA 1503 Tahun 2025)
              </h3>
              <p className="text-xs text-slate-500">
                Nilai yang sudah dikirimkan oleh Guru Mapel secara otomatis muncul di Legger dan Lembar Rapor Kelas {activeKelas}.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {mapelTerkirim} / {totalMapel} Terkirim
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-bold w-12 text-center">No</th>
                  <th className="py-2.5 px-3 font-bold w-24">Kelompok</th>
                  <th className="py-2.5 px-3 font-bold">Mata Pelajaran</th>
                  <th className="py-2.5 px-3 font-bold">Guru Pengampu</th>
                  <th className="py-2.5 px-3 font-bold text-center w-36">Status RDM</th>
                  <th className="py-2.5 px-4 font-bold text-center w-48">Waktu Pengiriman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekapKirim.map((row, idx) => (
                  <tr key={row.kode} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 text-center font-mono text-slate-500 font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        Kel. {row.kelompok}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {row.nama} ({row.kode})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {row.guru}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.status.is_sent ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Terkirim
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                          <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Menunggu Guru
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center text-[11px] text-slate-500 font-mono">
                      {row.status.tanggal_kirim || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRESENSI SISWA (S/I/A) */}
      {activeTab === "presensi" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Rekap Kehadiran Siswa Semester Ini
              </h3>
              <p className="text-xs text-slate-500">
                Masukkan akumulasi hari Sakit (S), Izin (I), dan Tanpa Keterangan / Alpha (A).
              </p>
            </div>
            <button
              onClick={handleSaveWali}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "💾 Simpan Presensi"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-bold text-center w-24">NIS</th>
                  <th className="py-2.5 px-3 font-bold">Nama Siswa</th>
                  <th className="py-2.5 px-2 font-bold text-center w-28 bg-emerald-50 text-emerald-900">Sakit (Hari)</th>
                  <th className="py-2.5 px-2 font-bold text-center w-28 bg-teal-50 text-teal-900">Izin (Hari)</th>
                  <th className="py-2.5 px-2 font-bold text-center w-28 bg-rose-50 text-rose-900">Alpha (Hari)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataWali.map((row, idx) => (
                  <tr key={row.nis} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-600">
                      {row.nis}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {row.nama_siswa}
                    </td>
                    <td className="p-1 text-center bg-emerald-50/20">
                      <input
                        type="number"
                        min={0}
                        value={row.sakit || ""}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setDataWali(prev =>
                            prev.map(r => (r.nis === row.nis ? { ...r, sakit: val } : r))
                          );
                        }}
                        className="w-16 text-center font-semibold py-1 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-1 text-center bg-teal-50/20">
                      <input
                        type="number"
                        min={0}
                        value={row.izin || ""}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setDataWali(prev =>
                            prev.map(r => (r.nis === row.nis ? { ...r, izin: val } : r))
                          );
                        }}
                        className="w-16 text-center font-semibold py-1 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-1 text-center bg-rose-50/20">
                      <input
                        type="number"
                        min={0}
                        value={row.tanpa_keterangan || ""}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setDataWali(prev =>
                            prev.map(r => (r.nis === row.nis ? { ...r, tanpa_keterangan: val } : r))
                          );
                        }}
                        className="w-16 text-center font-semibold py-1 rounded border border-rose-300 focus:ring-1 focus:ring-rose-500 text-rose-700 bg-rose-50/30"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATATAN WALI KELAS & KEPUTUSAN */}
      {activeTab === "catatan" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Catatan Karakter, Motivasi & Keputusan Kenaikan
              </h3>
              <p className="text-xs text-slate-500">
                Catatan ini akan dicetak di bagian Lembar Evaluasi Belajar Rapor Siswa.
              </p>
            </div>
            <button
              onClick={handleSaveWali}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "💾 Simpan Catatan"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-bold text-center w-24">NIS</th>
                  <th className="py-2.5 px-3 font-bold w-44">Nama Siswa</th>
                  <th className="py-2.5 px-3 font-bold">Catatan Perkembangan Karakter</th>
                  <th className="py-2.5 px-3 font-bold text-center w-40">Keputusan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataWali.map((row, idx) => (
                  <tr key={row.nis} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-600">
                      {row.nis}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {row.nama_siswa}
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.catatan_wali || ""}
                        onChange={e => {
                          const val = e.target.value;
                          setDataWali(prev =>
                            prev.map(r => (r.nis === row.nis ? { ...r, catatan_wali: val } : r))
                          );
                        }}
                        placeholder="Ananda menunjukkan ketekunan dan kesopanan yang baik..."
                        className="w-full text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <select
                        value={row.keputusan || "-"}
                        onChange={e => {
                          const val = e.target.value as any;
                          setDataWali(prev =>
                            prev.map(r => (r.nis === row.nis ? { ...r, keputusan: val } : r))
                          );
                        }}
                        className="w-full text-xs py-1.5 px-2 rounded border border-slate-300 font-semibold bg-white"
                      >
                        <option value="-">-</option>
                        <option value="Naik Kelas">Naik Kelas</option>
                        <option value="Tinggal Kelas">Tinggal Kelas</option>
                        <option value="Lulus">Lulus</option>
                        <option value="Tidak Lulus">Tidak Lulus</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KOKURIKULER P5RA (KBC - KURIKULUM BERBASIS CINTA KMA 1503/2025) */}
      {activeTab === "p5ra" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-800">
                  Kokurikuler P5RA Terintegrasi KBC (Kurikulum Berbasis Cinta)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Sesuai KMA Nomor 1503 Tahun 2025, dimensi projek berlandaskan <strong>Panca Cinta</strong>: Cinta Allah & Rasul, Cinta Ilmu, Cinta Lingkungan, Cinta Sesama, dan Cinta Tanah Air.
              </p>
            </div>
            <button
              onClick={handleSaveP5RA}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "💾 Simpan Nilai P5RA / KBC"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-rose-50/40 border-b border-rose-100 text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-bold text-center w-24">NIS</th>
                  <th className="py-2.5 px-3 font-bold w-44">Nama Siswa</th>
                  <th className="py-2.5 px-3 font-bold w-48">Tema Projek</th>
                  <th className="py-2.5 px-3 font-bold w-48">Dimensi Panca Cinta</th>
                  <th className="py-2.5 px-3 font-bold text-center w-36">Predikat</th>
                  <th className="py-2.5 px-3 font-bold">Catatan Deskripsi Projek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataP5RA.map(row => (
                  <tr key={row.nis} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-600">
                      {row.nis}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {row.nama_siswa}
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.tema}
                        onChange={e => {
                          const val = e.target.value;
                          setDataP5RA(prev =>
                            prev.map(p => (p.nis === row.nis ? { ...p, tema: val } : p))
                          );
                        }}
                        className="w-full text-xs py-1 px-2 rounded border border-slate-300"
                      />
                    </td>
                    <td className="p-1">
                      <select
                        value={row.dimensi}
                        onChange={e => {
                          const val = e.target.value as any;
                          setDataP5RA(prev =>
                            prev.map(p => (p.nis === row.nis ? { ...p, dimensi: val } : p))
                          );
                        }}
                        className="w-full text-xs py-1 px-2 rounded border border-slate-300 font-semibold"
                      >
                        <option value="Cinta Allah & Rasul">Cinta Allah & Rasul</option>
                        <option value="Cinta Ilmu">Cinta Ilmu</option>
                        <option value="Cinta Lingkungan">Cinta Lingkungan</option>
                        <option value="Cinta Sesama">Cinta Sesama</option>
                        <option value="Cinta Tanah Air">Cinta Tanah Air</option>
                      </select>
                    </td>
                    <td className="p-1 text-center">
                      <select
                        value={row.predikat}
                        onChange={e => {
                          const val = e.target.value as any;
                          setDataP5RA(prev =>
                            prev.map(p => (p.nis === row.nis ? { ...p, predikat: val } : p))
                          );
                        }}
                        className="w-full text-xs py-1 px-2 rounded border border-slate-300 font-bold text-center"
                      >
                        <option value="MB">MB (Mulai Berkembang)</option>
                        <option value="BSh">BSh (Berkembang Sesuai Harapan)</option>
                        <option value="BSB">BSB (Berkembang Sangat Baik)</option>
                        <option value="SAB">SAB (Sangat Amat Berkembang)</option>
                      </select>
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.deskripsi}
                        onChange={e => {
                          const val = e.target.value;
                          setDataP5RA(prev =>
                            prev.map(p => (p.nis === row.nis ? { ...p, deskripsi: val } : p))
                          );
                        }}
                        className="w-full text-xs py-1 px-2 rounded border border-slate-300"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EKSTRAKURIKULER */}
      {activeTab === "ekskul" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Pilih Ekstrakurikuler:</label>
              <select
                value={selectedEkskul}
                onChange={e => setSelectedEkskul(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
              >
                {allEkskul.map(e => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSaveEkskul}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "💾 Simpan Nilai Ekskul"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-bold text-center w-24">NIS</th>
                  <th className="py-2.5 px-3 font-bold w-44">Nama Siswa</th>
                  <th className="py-2.5 px-3 font-bold text-center w-40">Predikat</th>
                  <th className="py-2.5 px-3 font-bold">Keterangan / Capaian Ekskul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataEkskul.map(row => (
                  <tr key={row.nis} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-600">
                      {row.nis}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {row.nama_siswa}
                    </td>
                    <td className="p-1 text-center">
                      <select
                        value={row.predikat}
                        onChange={e => {
                          const val = e.target.value as any;
                          setDataEkskul(prev =>
                            prev.map(x => (x.nis === row.nis ? { ...x, predikat: val } : x))
                          );
                        }}
                        className="w-full text-xs py-1 px-2 rounded border border-slate-300 font-bold text-center"
                      >
                        <option value="Sangat Baik">Sangat Baik</option>
                        <option value="Baik">Baik</option>
                        <option value="Cukup">Cukup</option>
                        <option value="Kurang">Kurang</option>
                      </select>
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={row.keterangan || ""}
                        onChange={e => {
                          const val = e.target.value;
                          setDataEkskul(prev =>
                            prev.map(x => (x.nis === row.nis ? { ...x, keterangan: val } : x))
                          );
                        }}
                        placeholder="Aktif dan menunjukkan kedisiplinan serta dedikasi tinggi..."
                        className="w-full text-xs py-1 px-2 rounded border border-slate-300"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
