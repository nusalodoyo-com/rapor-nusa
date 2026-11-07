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
      message: `Bobot penilaian diperbarui: Formatif ${bobot.bobot_formatif}%, STS ${bobot.bobot_sts}%, SAS ${bobot.bobot_sas}%!`,
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
      `KIRIM nilai ${activeAssignment.nama_mapel} (${activeAssignment.kelas}) ke Wali Kelas?\n\nNilai akan terintegrasi langsung ke Legger & Rapor siswa dan data terkunci sementara.`
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
      `Buka kunci pengeditan nilai ${activeAssignment.nama_mapel} (${activeAssignment.kelas})?`
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
        alert("Berhasil mengimpor nilai dari file Excel!");
      }
    } catch (err: any) {
      alert("Gagal membaca Excel: " + err.message);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner Info Guru Retro */}
      <div className="card-retro-lg bg-retro-cream p-5 sm:p-6 border-3 border-retro-border flex flex-wrap items-center justify-between gap-4 shadow-retro-lg">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1 border-2 border-retro-border shadow-retro-sm flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-retro bg-brand-500 text-white">
                GURU MAPEL • {config.jenjang}
              </span>
              <span className="badge-retro bg-retro-yellow text-retro-black">
                NIP: {currentUser.nip || "-"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-retro-black mt-1">
              {currentUser.nama_user}
            </h2>
            <p className="text-xs text-slate-600 font-bold">
              {config.nama_madrasah} • Mengampu {assignments.length} Rombel
            </p>
          </div>
        </div>

        {/* Action: Switch to Wali if dual role */}
        <div className="flex items-center gap-2">
          {currentUser.kelas_diampu && currentUser.kelas_diampu !== "-" && onSwitchToWali && (
            <button
              onClick={onSwitchToWali}
              className="btn-retro bg-retro-yellow hover:bg-amber-400 text-retro-black px-3.5 py-2 text-xs flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Beralih ke Tugas Wali ({currentUser.kelas_diampu})</span>
            </button>
          )}
        </div>
      </div>

      {/* No Assignments Warning */}
      {assignments.length === 0 ? (
        <div className="card-retro p-8 text-center space-y-3 bg-white">
          <div className="w-14 h-14 rounded-xl bg-amber-100 border-2 border-retro-border shadow-retro-sm text-retro-black flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-base font-black text-retro-black uppercase">
            Belum Ada Tugas Mengajar
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
            Operator madrasah belum menetapkan mapel & kelas yang Anda ampu di sistem RDM. Silakan hubungi operator madrasah untuk melakukan penugasan mengajar.
          </p>
        </div>
      ) : (
        <>
          {/* Controls: Rombel Selector + Bobot + Kirim Status */}
          <div className="card-retro p-4 sm:p-5 space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Selector Rombel & Mapel */}
              <div className="md:col-span-2">
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  Pilih Mata Pelajaran & Kelas:
                </label>
                <select
                  value={selectedAssignId}
                  onChange={e => setSelectedAssignId(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border-2 border-retro-border bg-retro-cream font-black text-retro-black shadow-retro-sm focus:border-brand-500"
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
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  Semester & Tahun:
                </label>
                <div className="flex items-center text-xs py-2 px-3 rounded-lg border-2 border-retro-border bg-slate-50 font-bold text-retro-black shadow-retro-sm">
                  <Calendar className="w-4 h-4 mr-1.5 text-brand-600" />
                  <span>{tahun} (Gasal)</span>
                </div>
              </div>

              {/* Button Atur Bobot */}
              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  Bobot Penilaian (RDM):
                </label>
                <button
                  onClick={() => setIsBobotOpen(!isBobotOpen)}
                  className="w-full py-2 px-3 rounded-lg bg-retro-cream hover:bg-slate-100 border-2 border-retro-border text-xs font-black flex items-center justify-between shadow-retro-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand-700" />
                    <span>F:{bobot.bobot_formatif}% STS:{bobot.bobot_sts}% SAS:{bobot.bobot_sas}%</span>
                  </div>
                  <span className="badge-retro bg-retro-yellow text-retro-black text-[9px]">Ubah</span>
                </button>
              </div>
            </div>

            {/* Panel Form Edit Bobot (Expandable) */}
            {isBobotOpen && (
              <form onSubmit={handleSaveBobot} className="p-4 rounded-xl border-2 border-retro-border bg-retro-cream space-y-3 shadow-retro-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-retro-border pb-2">
                  <h4 className="text-xs font-black text-retro-black uppercase flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-brand-600" />
                    <span>Pengaturan Bobot Penilaian — {activeAssignment?.nama_mapel} ({activeAssignment?.kelas})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-bold">
                    Sesuai RDM, total bobot harus tepat 100%.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                      Formatif / Rata Harian (LM 1-4) %:
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={80}
                      value={bobot.bobot_formatif}
                      onChange={e => setBobot({ ...bobot, bobot_formatif: Number(e.target.value) })}
                      className="w-full text-xs py-1.5 px-3 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                      Sumatif Tengah Semester (STS) %:
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={50}
                      value={bobot.bobot_sts}
                      onChange={e => setBobot({ ...bobot, bobot_sts: Number(e.target.value) })}
                      className="w-full text-xs py-1.5 px-3 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                      Sumatif Akhir Semester (SAS) %:
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={50}
                      value={bobot.bobot_sas}
                      onChange={e => setBobot({ ...bobot, bobot_sas: Number(e.target.value) })}
                      className="w-full text-xs py-1.5 px-3 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-black text-retro-black">
                    Total: <strong className={bobot.bobot_formatif + bobot.bobot_sts + bobot.bobot_sas === 100 ? "text-brand-600" : "text-red-600"}>
                      {bobot.bobot_formatif + bobot.bobot_sts + bobot.bobot_sas}%
                    </strong> (Wajib 100%)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBobotOpen(false)}
                      className="btn-retro-white px-3 py-1.5 text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn-retro-primary px-4 py-1.5 text-xs"
                    >
                      Simpan Bobot
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Toolbar Status Kirim & Excel */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-retro-border">
              {/* Left: Status Badge & Kirim Button */}
              <div className="flex flex-wrap items-center gap-2.5">
                {statusKirim.is_sent ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-retro bg-brand-500 text-white text-xs py-1 px-3">
                      ✓ Nilai Terkirim ke Wali ({statusKirim.tanggal_kirim || "Terkonfirmasi"})
                    </span>
                    <button
                      onClick={handleBatalKirim}
                      className="btn-retro bg-retro-orange text-white hover:bg-red-600 px-3 py-1.5 text-xs flex items-center gap-1"
                      title="Batalkan kirim untuk membuka edit nilai"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Buka Kunci Nilai</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleKirimNilai}
                    className="btn-retro-primary px-4 py-2 text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>KIRIM NILAI KE WALI KELAS</span>
                  </button>
                )}
              </div>

              {/* Right: Excel actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="btn-retro-white px-3 py-1.5 text-xs flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-4 h-4 text-brand-600" />
                  <span>Unduh Excel</span>
                </button>

                {!statusKirim.is_sent && (
                  <label className="btn-retro bg-retro-yellow text-retro-black hover:bg-amber-300 px-3 py-1.5 text-xs flex items-center gap-1 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Unggah Excel</span>
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
