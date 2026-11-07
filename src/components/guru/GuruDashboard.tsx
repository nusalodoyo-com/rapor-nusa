"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  MadrasahId,
  User,
  SchoolConfig,
  TeacherAssignment,
  BobotNilai,
  StatusKirimNilai,
  NilaiMapelItem,
} from "@/types";
import {
  getTeacherAssignments,
  getBobotNilai,
  saveBobotNilai,
  getStatusKirimNilai,
  kirimNilaiKeWali,
  batalKirimNilai,
  getNilaiByKelasMapel,
  simpanNilaiBatch,
} from "@/lib/storage";
import {
  downloadExcelMapel,
  parseExcelUpload,
} from "@/lib/excel/excelHandler";
import NilaiMapelTable from "@/components/NilaiMapelTable";
import {
  BookOpen,
  Send,
  Unlock,
  Sliders,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Calendar,
  School,
  Sparkles,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface Props {
  madrasahId: MadrasahId;
  currentUser: User;
  config: SchoolConfig;
  onSwitchToWali?: () => void;
  onLogout: () => void;
}

export default function GuruDashboard({
  madrasahId,
  currentUser,
  config,
  onSwitchToWali,
  onLogout,
}: Props) {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [selectedAssignId, setSelectedAssignId] = useState<string>("");

  const [tahun, setTahun] = useState("2025/2026");
  const [semester, setSemester] = useState("1");

  // Bobot State
  const [isBobotOpen, setIsBobotOpen] = useState(false);
  const [bobot, setBobot] = useState<BobotNilai>({
    id: "",
    madrasah_id: madrasahId,
    guru_id: currentUser.id,
    kode_mapel: "",
    kelas: "",
    bobot_formatif: 50,
    bobot_sts: 25,
    bobot_sas: 25,
  });

  // Status Kirim State
  const [statusKirim, setStatusKirim] = useState<StatusKirimNilai>({
    id: "",
    madrasah_id: madrasahId,
    kode_mapel: "",
    kelas: "",
    is_sent: false,
  });

  // Table Data State
  const [dataNilai, setDataNilai] = useState<NilaiMapelItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load Guru Assignments
  useEffect(() => {
    const all = getTeacherAssignments(madrasahId);
    const mine = all.filter(
      a =>
        a.guru_id === currentUser.id ||
        a.guru_nama.trim().toLowerCase() === currentUser.nama_user.trim().toLowerCase()
    );
    setAssignments(mine);
    if (mine.length > 0) {
      setSelectedAssignId(mine[0].id);
    }
  }, [madrasahId, currentUser]);

  const activeAssignment = assignments.find(a => a.id === selectedAssignId);

  // Load Data Nilai, Bobot, and Status Kirim when Assignment changes
  useEffect(() => {
    if (!activeAssignment) {
      setDataNilai([]);
      return;
    }

    // 1. Get Bobot
    const b = getBobotNilai(
      madrasahId,
      currentUser.id,
      activeAssignment.kode_mapel,
      activeAssignment.kelas
    );
    setBobot(b);

    // 2. Get Status Kirim
    const sk = getStatusKirimNilai(
      madrasahId,
      activeAssignment.kode_mapel,
      activeAssignment.kelas
    );
    setStatusKirim(sk);

    // 3. Get Student Grades
    const list = getNilaiByKelasMapel(
      madrasahId,
      tahun,
      semester,
      activeAssignment.kelas,
      activeAssignment.kode_mapel
    );
    setDataNilai(list);
  }, [madrasahId, currentUser.id, activeAssignment, tahun, semester]);

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch {}
  };

  // Simpan Bobot
  const handleSaveBobot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;

    const total =
      Number(bobot.bobot_formatif) +
      Number(bobot.bobot_sts) +
      Number(bobot.bobot_sas);

    if (total !== 100) {
      alert(`Total bobot harus tepat 100%! Saat ini total: ${total}%`);
      return;
    }

    const updated: BobotNilai = {
      ...bobot,
      madrasah_id: madrasahId,
      guru_id: currentUser.id,
      kode_mapel: activeAssignment.kode_mapel,
      kelas: activeAssignment.kelas,
    };

    saveBobotNilai(madrasahId, updated);
    setBobot(updated);
    setIsBobotOpen(false);

    // Re-simpan nilai dengan bobot baru untuk mengupdate NA
    if (dataNilai.length > 0) {
      simpanNilaiBatch(
        madrasahId,
        tahun,
        semester,
        activeAssignment.kode_mapel,
        dataNilai,
        updated
      );
      // Reload
      const reloaded = getNilaiByKelasMapel(
        madrasahId,
        tahun,
        semester,
        activeAssignment.kelas,
        activeAssignment.kode_mapel
      );
      setDataNilai(reloaded);
    }

    setNotification({
      type: "success",
      message: `Bobot penilaian berhasil diperbarui (Formatif: ${bobot.bobot_formatif}%, STS: ${bobot.bobot_sts}%, SAS: ${bobot.bobot_sas}%)!`,
    });
  };

  // Simpan Nilai
  const handleSaveNilai = (items: NilaiMapelItem[]) => {
    if (!activeAssignment) return;
    setIsSaving(true);
    const res = simpanNilaiBatch(
      madrasahId,
      tahun,
      semester,
      activeAssignment.kode_mapel,
      items,
      bobot
    );
    setIsSaving(false);

    if (res.success) {
      setDataNilai(items);
      triggerConfetti();
      setNotification({ type: "success", message: res.message });
    } else {
      setNotification({ type: "error", message: res.message });
    }
  };

  // Kirim Nilai ke Wali Kelas
  const handleKirimNilai = () => {
    if (!activeAssignment) return;

    const confirmSend = window.confirm(
      `Apakah Anda yakin ingin MENGIRIM nilai ${activeAssignment.nama_mapel} (${activeAssignment.kelas}) ke Wali Kelas?\n\nSetelah dikirim, nilai akan terintegrasi ke Legger & Rapor siswa dan data akan terkunci sementara.`
    );
    if (!confirmSend) return;

    // Pastikan nilai terbaru tersimpan terlebih dahulu
    simpanNilaiBatch(
      madrasahId,
      tahun,
      semester,
      activeAssignment.kode_mapel,
      dataNilai,
      bobot
    );

    const res = kirimNilaiKeWali(
      madrasahId,
      activeAssignment.kode_mapel,
      activeAssignment.kelas,
      currentUser.nama_user
    );

    if (res.success) {
      setStatusKirim({
        id: `status-${activeAssignment.kode_mapel}-${activeAssignment.kelas}`,
        madrasah_id: madrasahId,
        kode_mapel: activeAssignment.kode_mapel,
        kelas: activeAssignment.kelas,
        is_sent: true,
        tanggal_kirim: new Date().toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        guru_pengampu: currentUser.nama_user,
      });
      triggerConfetti();
      setNotification({ type: "success", message: res.message });
    }
  };

  // Batalkan Kirim Nilai (Unlock)
  const handleBatalKirim = () => {
    if (!activeAssignment) return;

    const confirmCancel = window.confirm(
      `Buka kembali kunci pengeditan nilai ${activeAssignment.nama_mapel} (${activeAssignment.kelas})?`
    );
    if (!confirmCancel) return;

    const res = batalKirimNilai(
      madrasahId,
      activeAssignment.kode_mapel,
      activeAssignment.kelas
    );

    if (res.success) {
      setStatusKirim({
        id: `status-${activeAssignment.kode_mapel}-${activeAssignment.kelas}`,
        madrasah_id: madrasahId,
        kode_mapel: activeAssignment.kode_mapel,
        kelas: activeAssignment.kelas,
        is_sent: false,
      });
      setNotification({ type: "success", message: res.message });
    }
  };

  // Unduh Template Excel
  const handleDownloadExcel = async () => {
    if (!activeAssignment) return;
    await downloadExcelMapel(
      activeAssignment.kelas,
      activeAssignment.kode_mapel,
      activeAssignment.nama_mapel,
      dataNilai
    );
  };

  // Unggah Nilai Excel
  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeAssignment) return;

    try {
      const res = await parseExcelUpload(file, "mapel");
      if (res.dataMapel) {
        const merged = dataNilai.map(row => {
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
        });

        setDataNilai(merged);
        handleSaveNilai(merged);
        alert("Berhasil mengimpor dan menyimpan nilai dari Excel!");
      }
    } catch (err: any) {
      alert("Gagal membaca Excel: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Info Guru */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-2xl p-5 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-bold text-xl shadow-inner">
            <GraduationCap className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                Portal Guru Mapel • {config.jenjang}
              </span>
              <span className="text-xs text-emerald-200 font-mono">
                NIP: {currentUser.nip || "-"}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight uppercase">
              {currentUser.nama_user}
            </h2>
            <p className="text-xs text-emerald-100/90 font-medium">
              {config.nama_madrasah} • Memegang {assignments.length} Rombel / Penugasan
            </p>
          </div>
        </div>

        {/* Action: Switch to Wali if dual role */}
        <div className="flex items-center gap-2">
          {currentUser.kelas_diampu && currentUser.kelas_diampu !== "-" && onSwitchToWali && (
            <button
              onClick={onSwitchToWali}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Beralih ke Tugas Wali Kelas ({currentUser.kelas_diampu})</span>
            </button>
          )}
        </div>
      </div>

      {/* No Assignments Warning */}
      {assignments.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-amber-200 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Belum Ada Pembagian Tugas Mengajar
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Admin/Operator Madrasah belum menetapkan mata pelajaran dan kelas yang Anda ampu di aplikasi RDM. Silakan hubungi operator madrasah untuk melakukan penugasan mengajar.
          </p>
        </div>
      ) : (
        <>
          {/* Controls: Rombel & Mapel Selector + Bobot + Kirim Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Selector Rombel & Mapel */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pilih Mata Pelajaran & Kelas yang Diampu:
                </label>
                <select
                  value={selectedAssignId}
                  onChange={e => setSelectedAssignId(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {assignments.map(a => (
                    <option key={a.id} value={a.id}>
                      Kelas {a.kelas} — {a.nama_mapel} ({a.kode_mapel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Ajaran */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tahun Ajaran:
                </label>
                <div className="flex items-center text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700">
                  <Calendar className="w-4 h-4 mr-1.5 text-emerald-600" />
                  <span>{tahun} (Gasal)</span>
                </div>
              </div>

              {/* Button Atur Bobot */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Bobot Penilaian (RDM):
                </label>
                <button
                  onClick={() => setIsBobotOpen(!isBobotOpen)}
                  className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-teal-600" />
                    <span>F:{bobot.bobot_formatif}% STS:{bobot.bobot_sts}% SAS:{bobot.bobot_sas}%</span>
                  </div>
                  <span className="text-[10px] text-teal-600 underline">Ubah</span>
                </button>
              </div>
            </div>

            {/* Panel Form Edit Bobot (Expandable) */}
            {isBobotOpen && (
              <form onSubmit={handleSaveBobot} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Pengaturan Bobot Penilaian — {activeAssignment?.nama_mapel} ({activeAssignment?.kelas})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Sesuai Video 2 RDM, total bobot harus tepat 100%.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Formatif / Rata-rata Harian (LM 1-4) %:
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={80}
                      value={bobot.bobot_formatif}
                      onChange={e => setBobot({ ...bobot, bobot_formatif: Number(e.target.value) })}
                      className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Sumatif Tengah Semester (STS) %:
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={50}
                      value={bobot.bobot_sts}
                      onChange={e => setBobot({ ...bobot, bobot_sts: Number(e.target.value) })}
                      className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Sumatif Akhir Semester (SAS) %:
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={50}
                      value={bobot.bobot_sas}
                      onChange={e => setBobot({ ...bobot, bobot_sas: Number(e.target.value) })}
                      className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-slate-700">
                    Total: <strong className={bobot.bobot_formatif + bobot.bobot_sts + bobot.bobot_sas === 100 ? "text-emerald-600" : "text-rose-600"}>
                      {bobot.bobot_formatif + bobot.bobot_sts + bobot.bobot_sas}%
                    </strong> (Harus 100%)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBobotOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                    >
                      Simpan Bobot
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Toolbar Status Kirim & Excel */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              {/* Left: Status Badge & Kirim Button */}
              <div className="flex items-center gap-3">
                {statusKirim.is_sent ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                      Nilai Terkirim ke Wali Kelas ({statusKirim.tanggal_kirim || "Terkonfirmasi"})
                    </span>
                    <button
                      onClick={handleBatalKirim}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition"
                      title="Batal kirim untuk membuka kunci edit nilai"
                    >
                      <Unlock className="w-3.5 h-3.5 mr-1 text-rose-600" />
                      <span>Batalkan Kirim (Edit Nilai)</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleKirimNilai}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    <span>KIRIM NILAI KE WALI KELAS</span>
                  </button>
                )}
              </div>

              {/* Right: Excel actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-600" />
                  <span>Unduh Template (.xlsx)</span>
                </button>

                {!statusKirim.is_sent && (
                  <label className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 cursor-pointer transition">
                    <Upload className="w-4 h-4 mr-1 text-teal-600" />
                    <span>Impor Excel (.xlsx)</span>
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={handleUploadExcel}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
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

          {/* Tabel Nilai Mapel */}
          {activeAssignment && (
            <NilaiMapelTable
              initialData={dataNilai}
              onSave={handleSaveNilai}
              isSaving={isSaving}
              bobot={bobot}
              readOnly={statusKirim.is_sent}
            />
          )}
        </>
      )}
    </div>
  );
}
