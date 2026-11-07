"use client";

import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  MadrasahId,
  User,
  SchoolConfig,
  RaporWaliItem,
  NilaiP5RAItem,
  NilaiEkskulItem,
  StatusKirimNilai,
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
  sortRombelList,
} from "@/lib/storage";
import NilaiEkskulTable from "@/components/NilaiEkskulTable";
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
  tahun?: string;
  semester?: string;
  activePeriodLabel?: string;
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
  tahun: propTahun,
  semester: propSemester,
  activePeriodLabel,
  onOpenLegger,
  onOpenCetakRapor,
  onSwitchToGuru,
}: Props) {
  const sortedKelas = useMemo(() => sortRombelList(allKelas), [allKelas]);

  // Tentukan kelas yang diampu wali
  const defaultKelas =
    currentUser.kelas_diampu && currentUser.kelas_diampu !== "-"
      ? currentUser.kelas_diampu.split(",")[0].trim()
      : sortedKelas[0] || "VII.A";

  const [activeKelas, setActiveKelas] = useState(defaultKelas);
  const [activeTab, setActiveTab] = useState<"monitoring" | "presensi" | "catatan" | "p5ra" | "ekskul">("monitoring");

  const tahun = propTahun || "2026/2027";
  const semester = propSemester || "1";

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
  const handleSaveEkskul = (selectedItems?: NilaiEkskulItem[]) => {
    setIsSaving(true);
    const payload = selectedItems || dataEkskul.filter(d => d.checked);
    const res = simpanNilaiEkskulBatch(madrasahId, tahun, semester, selectedEkskul, payload);
    setIsSaving(false);
    if (res.success) {
      triggerConfetti();
      setNotification({ type: "success", message: res.message });
      const updated = getNilaiEkskulByKelas(madrasahId, tahun, semester, activeKelas, selectedEkskul);
      setDataEkskul(updated);
    } else {
      setNotification({ type: "error", message: res.message });
    }
  };

  // Hitung persentase nilai mapel masuk
  const totalMapel = rekapKirim.length;
  const mapelTerkirim = rekapKirim.filter(r => r.status.is_sent).length;
  const persenTerkirim = totalMapel > 0 ? Math.round((mapelTerkirim / totalMapel) * 100) : 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner Wali Kelas Retro */}
      <div className="card-retro-lg bg-retro-cream p-5 sm:p-6 border-3 border-retro-border flex flex-wrap items-center justify-between gap-4 shadow-retro-lg">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1 border-2 border-retro-border shadow-retro-sm flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-retro bg-brand-500 text-white">
                WALI KELAS • {config.jenjang}
              </span>
              <span className="badge-retro bg-retro-yellow text-retro-black">
                Kelas {activeKelas}
              </span>
              <span className="badge-retro bg-white text-retro-black">
                📅 {activePeriodLabel || `${semester === "1" ? "Gasal" : "Genap"} ${tahun}`}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-retro-black mt-1">
              {currentUser.nama_user}
            </h2>
            <p className="text-xs text-slate-600 font-bold">
              {config.nama_madrasah} • Membina {dataWali.length} Siswa
            </p>
          </div>
        </div>

        {/* Action Buttons: Legger, Cetak Rapor, Switch to Guru */}
        <div className="flex flex-wrap items-center gap-2">
          {onSwitchToGuru && (
            <button
              onClick={onSwitchToGuru}
              className="btn-retro bg-white text-retro-black px-3 py-1.5 text-xs flex items-center gap-1"
            >
              👨‍🏫 Ke Guru Mapel
            </button>
          )}

          <button
            onClick={() => onOpenLegger(activeKelas)}
            className="btn-retro bg-white text-retro-black hover:bg-slate-50 px-3.5 py-2 text-xs flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-brand-600" />
            <span>Legger & Ranking</span>
          </button>

          <button
            onClick={() => onOpenCetakRapor(activeKelas)}
            className="btn-retro bg-retro-yellow text-retro-black hover:bg-amber-400 px-3.5 py-2 text-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rapor Digital</span>
          </button>
        </div>
      </div>

      {/* Selector Rombel & Progress Bar */}
      <div className="card-retro p-4 flex flex-wrap items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-retro-black uppercase">Pilih Rombel:</label>
          <select
            value={activeKelas}
            onChange={e => setActiveKelas(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border-2 border-retro-border bg-retro-cream font-black text-retro-black shadow-retro-sm"
          >
            {sortedKelas.map(k => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </select>
        </div>

        {/* Progress bar nilai masuk */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-black text-retro-black block">
              Nilai Mapel Masuk: {mapelTerkirim} / {totalMapel} ({persenTerkirim}%)
            </span>
            <span className="text-[10px] text-slate-500 font-bold">
              {mapelTerkirim === totalMapel ? "✓ Semua mapel telah lengkap!" : "Menunggu pengiriman guru mapel"}
            </span>
          </div>
          <div className="w-28 sm:w-36 h-3 bg-retro-cream rounded-full border-2 border-retro-border overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                persenTerkirim === 100 ? "bg-brand-500" : "bg-retro-yellow"
              }`}
              style={{ width: `${persenTerkirim}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation (Retro Badges) */}
      <div className="flex items-center gap-2 bg-retro-cream p-2 rounded-xl border-2 border-retro-border shadow-retro-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("monitoring")}
          className={activeTab === "monitoring" ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap" : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap"}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Status Nilai Mapel</span>
        </button>

        <button
          onClick={() => setActiveTab("presensi")}
          className={activeTab === "presensi" ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap" : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap"}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Presensi Siswa (S/I/A)</span>
        </button>

        <button
          onClick={() => setActiveTab("catatan")}
          className={activeTab === "catatan" ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap" : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap"}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Catatan Karakter & Kenaikan</span>
        </button>

        <button
          onClick={() => setActiveTab("p5ra")}
          className={activeTab === "p5ra" ? "btn-retro-yellow px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap" : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap"}
        >
          <Heart className="w-3.5 h-3.5 text-red-600" />
          <span>Kokurikuler P5RA (KBC)</span>
        </button>

        <button
          onClick={() => setActiveTab("ekskul")}
          className={activeTab === "ekskul" ? "btn-retro-primary px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap" : "btn-retro-white px-3.5 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap"}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Ekstrakurikuler</span>
        </button>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border-2 border-retro-border text-xs font-black shadow-retro-sm flex items-center justify-between ${
            notification.type === "success"
              ? "bg-brand-100 text-brand-900"
              : "bg-red-100 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-brand-700" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-700" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-retro-black hover:text-red-700 font-black ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: STATUS MASUKNYA NILAI MAPEL */}
      {activeTab === "monitoring" && (
        <div className="card-retro p-5 space-y-4 bg-white">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-retro-border pb-3 gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                Status Pengiriman Nilai Mata Pelajaran (KMA 1503 Tahun 2025)
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Nilai yang sudah dikirim oleh Guru Mapel secara otomatis masuk ke Legger dan Rapor Kelas {activeKelas}.
              </p>
            </div>
            <span className="badge-retro bg-retro-yellow text-retro-black">
              {mapelTerkirim} / {totalMapel} Terkirim
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase">
                <tr>
                  <th className="py-2.5 px-3 font-black w-10 text-center">No</th>
                  <th className="py-2.5 px-3 font-black w-24">Kelompok</th>
                  <th className="py-2.5 px-3 font-black">Mata Pelajaran</th>
                  <th className="py-2.5 px-3 font-black">Guru Pengampu</th>
                  <th className="py-2.5 px-3 font-black text-center w-36">Status RDM</th>
                  <th className="py-2.5 px-3 font-black text-center w-44">Waktu Kirim</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 font-bold">
                {rekapKirim.map((row, idx) => (
                  <tr key={row.kode} className="hover:bg-brand-50/40">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="badge-retro bg-retro-cream text-retro-black text-[9px]">
                        Kel. {row.kelompok}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-retro-black">
                      {row.nama} ({row.kode})
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {row.guru}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.status.is_sent ? (
                        <span className="badge-retro bg-brand-500 text-white">
                          ✓ Terkirim
                        </span>
                      ) : (
                        <span className="badge-retro bg-amber-200 text-retro-black">
                          ⏳ Menunggu Guru
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[11px] text-slate-500 font-mono">
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
        <div className="card-retro p-5 space-y-4 bg-white">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-retro-border pb-3 gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                Rekap Kehadiran Siswa Semester Ini
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Input akumulasi hari Sakit (S), Izin (I), dan Alpha (A) untuk Kelas {activeKelas}.
              </p>
            </div>
            <button
              onClick={handleSaveWali}
              disabled={isSaving}
              className="btn-retro-primary px-4 py-2 text-xs flex items-center gap-1.5"
            >
              {isSaving ? "Menyimpan..." : "💾 Simpan Presensi"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-center w-24">NIS</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-2 text-center w-28 bg-emerald-100 text-emerald-950">Sakit (S)</th>
                  <th className="py-2.5 px-2 text-center w-28 bg-teal-100 text-teal-950">Izin (I)</th>
                  <th className="py-2.5 px-2 text-center w-28 bg-rose-100 text-rose-950">Alpha (A)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 font-bold">
                {dataWali.map((row) => (
                  <tr key={row.nis} className="hover:bg-brand-50/40">
                    <td className="py-2 px-3 text-center font-mono text-slate-600">
                      {row.nis}
                    </td>
                    <td className="py-2 px-3 text-retro-black">
                      {row.nama_siswa}
                    </td>
                    <td className="p-1.5 text-center bg-emerald-50/40">
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
                        className="w-16 text-center font-black py-1 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm"
                      />
                    </td>
                    <td className="p-1.5 text-center bg-teal-50/40">
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
                        className="w-16 text-center font-black py-1 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm"
                      />
                    </td>
                    <td className="p-1.5 text-center bg-rose-50/40">
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
                        className="w-16 text-center font-black py-1 rounded-lg border-2 border-red-600 bg-red-50 text-red-900 shadow-retro-sm"
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
        <div className="card-retro p-5 space-y-4 bg-white">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-retro-border pb-3 gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                Catatan Perkembangan Karakter & Keputusan Kenaikan
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Dicetak pada lembar Evaluasi Belajar Rapor Siswa.
              </p>
            </div>
            <button
              onClick={handleSaveWali}
              disabled={isSaving}
              className="btn-retro-primary px-4 py-2 text-xs flex items-center gap-1.5"
            >
              {isSaving ? "Menyimpan..." : "💾 Simpan Catatan"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-center w-24">NIS</th>
                  <th className="py-2.5 px-3 w-48">Nama Siswa</th>
                  <th className="py-2.5 px-3">Catatan Perkembangan Karakter & Motivasi</th>
                  <th className="py-2.5 px-3 text-center w-40">Keputusan</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 font-bold">
                {dataWali.map((row) => (
                  <tr key={row.nis} className="hover:bg-brand-50/40">
                    <td className="py-2 px-3 text-center font-mono text-slate-600">
                      {row.nis}
                    </td>
                    <td className="py-2 px-3 text-retro-black">
                      {row.nama_siswa}
                    </td>
                    <td className="p-1.5">
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
                        className="w-full text-xs py-1.5 px-2.5 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm font-semibold"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <select
                        value={row.keputusan || "-"}
                        onChange={e => {
                          const val = e.target.value as any;
                          setDataWali(prev =>
                            prev.map(r => (r.nis === row.nis ? { ...r, keputusan: val } : r))
                          );
                        }}
                        className="w-full text-xs py-1.5 px-2 rounded-lg border-2 border-retro-border bg-retro-cream font-black shadow-retro-sm"
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

      {/* TAB 4: KOKURIKULER P5RA (KBC - PANCA CINTA KMA 1503/2025) */}
      {activeTab === "p5ra" && (
        <div className="card-retro p-5 space-y-4 bg-white">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-retro-border pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                <h3 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                  Kokurikuler P5RA Terintegrasi KBC (Kurikulum Berbasis Cinta)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 font-bold">
                Sesuai KMA Nomor 1503 Tahun 2025, dimensi projek berlandaskan <strong>Panca Cinta</strong>.
              </p>
            </div>
            <button
              onClick={handleSaveP5RA}
              disabled={isSaving}
              className="btn-retro bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs flex items-center gap-1.5"
            >
              {isSaving ? "Menyimpan..." : "💾 Simpan P5RA / KBC"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-retro-yellow text-retro-black font-black border-b-2 border-retro-border uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-center w-24">NIS</th>
                  <th className="py-2.5 px-3 w-44">Nama Siswa</th>
                  <th className="py-2.5 px-3 w-44">Tema Projek</th>
                  <th className="py-2.5 px-3 w-44">Dimensi Panca Cinta</th>
                  <th className="py-2.5 px-3 text-center w-36">Predikat</th>
                  <th className="py-2.5 px-3">Catatan Deskripsi Projek</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 font-bold">
                {dataP5RA.map(row => (
                  <tr key={row.nis} className="hover:bg-brand-50/40">
                    <td className="py-2 px-3 text-center font-mono text-slate-600">
                      {row.nis}
                    </td>
                    <td className="py-2 px-3 text-retro-black">
                      {row.nama_siswa}
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.tema}
                        onChange={e => {
                          const val = e.target.value;
                          setDataP5RA(prev =>
                            prev.map(p => (p.nis === row.nis ? { ...p, tema: val } : p))
                          );
                        }}
                        className="w-full text-xs py-1 px-2 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm"
                      />
                    </td>
                    <td className="p-1.5">
                      <select
                        value={row.dimensi}
                        onChange={e => {
                          const val = e.target.value as any;
                          setDataP5RA(prev =>
                            prev.map(p => (p.nis === row.nis ? { ...p, dimensi: val } : p))
                          );
                        }}
                        className="w-full text-xs py-1 px-2 rounded-lg border-2 border-retro-border bg-white font-black shadow-retro-sm"
                      >
                        <option value="Cinta Allah & Rasul">Cinta Allah & Rasul</option>
                        <option value="Cinta Ilmu">Cinta Ilmu</option>
                        <option value="Cinta Lingkungan">Cinta Lingkungan</option>
                        <option value="Cinta Sesama">Cinta Sesama</option>
                        <option value="Cinta Tanah Air">Cinta Tanah Air</option>
                      </select>
                    </td>
                    <td className="p-1.5 text-center">
                      <select
                        value={row.predikat}
                        onChange={e => {
                          const val = e.target.value as any;
                          setDataP5RA(prev =>
                            prev.map(p => (p.nis === row.nis ? { ...p, predikat: val } : p))
                          );
                        }}
                        className="w-full text-xs py-1 px-2 rounded-lg border-2 border-retro-border bg-retro-yellow font-black text-center shadow-retro-sm"
                      >
                        <option value="MB">MB (Mulai Berkembang)</option>
                        <option value="BSh">BSh (Berkembang Sesuai Harapan)</option>
                        <option value="BSB">BSB (Berkembang Sangat Baik)</option>
                        <option value="SAB">SAB (Sangat Amat Berkembang)</option>
                      </select>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.deskripsi}
                        onChange={e => {
                          const val = e.target.value;
                          setDataP5RA(prev =>
                            prev.map(p => (p.nis === row.nis ? { ...p, deskripsi: val } : p))
                          );
                        }}
                        className="w-full text-xs py-1 px-2 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EKSTRAKURIKULER (SELEKSI SISWA & EXCEL) */}
      {activeTab === "ekskul" && (
        <div className="card-retro p-5 space-y-4 bg-white">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-retro-border pb-3 gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-retro-black uppercase tracking-wider">
                Penilaian Kegiatan Ekstrakurikuler
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Centang siswa peserta ekskul. Siswa yang tidak dicentang otomatis tidak muncul di Rapor Cetak.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-retro-black uppercase">Ekstrakurikuler:</label>
              <select
                value={selectedEkskul}
                onChange={e => setSelectedEkskul(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-lg border-2 border-retro-border bg-retro-cream font-black text-retro-black shadow-retro-sm"
              >
                {allEkskul.map(e => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <NilaiEkskulTable
            initialData={dataEkskul}
            onSave={handleSaveEkskul}
            isSaving={isSaving}
            kelas={activeKelas}
            namaEkskul={selectedEkskul}
          />
        </div>
      )}
    </div>
  );
}
