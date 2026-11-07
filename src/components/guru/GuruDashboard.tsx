"use client";

import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  MadrasahId,
  User,
  SchoolConfig,
  BobotNilai,
  StatusKirimNilai,
  NilaiMapelItem,
  NilaiEkskulItem,
} from "@/types";
import {
  getBobotNilai,
  saveBobotNilai,
  getStatusKirimNilai,
  kirimNilaiKeWali,
  batalKirimNilai,
  getNilaiByKelasMapel,
  simpanNilaiBatch,
  getNilaiEkskulByKelas,
  simpanNilaiEkskulBatch,
  sortRombelList,
} from "@/lib/storage";
import {
  SEED_MAPEL_MTS,
  SEED_MAPEL_MA,
  SEED_EKSKUL_MTS,
  SEED_EKSKUL_MA,
} from "@/lib/constants/seedData";
import {
  downloadExcelMapel,
  parseExcelUpload,
} from "@/lib/excel/excelHandler";
import NilaiMapelTable from "@/components/NilaiMapelTable";
import NilaiEkskulTable from "@/components/NilaiEkskulTable";
import {
  BookOpen,
  Send,
  Unlock,
  Sliders,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Calendar,
  School,
  Sparkles,
  UserCheck,
  Trophy,
  Layers,
} from "lucide-react";

interface Props {
  madrasahId: MadrasahId;
  currentUser: User;
  config: SchoolConfig;
  allKelas?: string[];
  allMapel?: { kode: string; nama: string; kelompok?: string; kkm?: number }[];
  allEkskul?: string[];
  tahun?: string;
  semester?: string;
  activePeriodLabel?: string;
  onSwitchToWali?: () => void;
  onLogout: () => void;
}

export default function GuruDashboard({
  madrasahId,
  currentUser,
  config,
  allKelas = [],
  allMapel = [],
  allEkskul = [],
  tahun: propTahun,
  semester: propSemester,
  activePeriodLabel,
  onSwitchToWali,
  onLogout,
}: Props) {
  const tahun = propTahun || "2026/2027";
  const semester = propSemester || "1";

  // Mode Penilaian: Mapel (Intrakurikuler) atau Ekskul (Ekstrakurikuler)
  const [tipePenilaian, setTipePenilaian] = useState<"mapel" | "ekskul">("mapel");

  // Rombel List yang diurutkan rapi VII -> VIII -> IX atau 10A -> 10D
  const sortedKelas = useMemo(() => sortRombelList(allKelas), [allKelas]);

  // Fallback mapel jika allMapel kosong
  const mapelList = useMemo(() => {
    if (allMapel.length > 0) return allMapel;
    const def = madrasahId === "mts" ? SEED_MAPEL_MTS : SEED_MAPEL_MA;
    return def.map(m => ({ kode: m.kode_mapel, nama: m.nama_mapel, kelompok: m.kelompok, kkm: m.kkm }));
  }, [allMapel, madrasahId]);

  // Fallback ekskul jika allEkskul kosong
  const ekskulList = useMemo(() => {
    if (allEkskul.length > 0) return allEkskul;
    const def = madrasahId === "mts" ? SEED_EKSKUL_MTS : SEED_EKSKUL_MA;
    return def.map(e => e.nama_ekskul);
  }, [allEkskul, madrasahId]);

  // Pilihan Kelas, Mapel, dan Ekskul yang bebas dipilih oleh Guru
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedKodeMapel, setSelectedKodeMapel] = useState<string>("");
  const [selectedNamaEkskul, setSelectedNamaEkskul] = useState<string>("");

  // Set default pilihan saat pertama kali render
  useEffect(() => {
    if (sortedKelas.length > 0 && !selectedKelas) {
      // Prioritaskan kelas binaan jika ada
      if (currentUser.kelas_diampu && currentUser.kelas_diampu !== "-" && sortedKelas.includes(currentUser.kelas_diampu)) {
        setSelectedKelas(currentUser.kelas_diampu);
      } else {
        setSelectedKelas(sortedKelas[0]);
      }
    }
  }, [sortedKelas, selectedKelas, currentUser.kelas_diampu]);

  useEffect(() => {
    if (mapelList.length > 0 && !selectedKodeMapel) {
      setSelectedKodeMapel(mapelList[0].kode);
    }
  }, [mapelList, selectedKodeMapel]);

  useEffect(() => {
    if (ekskulList.length > 0 && !selectedNamaEkskul) {
      setSelectedNamaEkskul(ekskulList[0]);
    }
  }, [ekskulList, selectedNamaEkskul]);

  const activeMapelObj = mapelList.find(m => m.kode === selectedKodeMapel) || mapelList[0];

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
  const [dataNilaiEkskul, setDataNilaiEkskul] = useState<NilaiEkskulItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load Data Nilai Mapel, Bobot, and Status Kirim
  useEffect(() => {
    if (!selectedKelas || !selectedKodeMapel) return;

    // 1. Get Bobot
    const b = getBobotNilai(madrasahId, currentUser.id, selectedKodeMapel, selectedKelas);
    setBobot(b);

    // 2. Get Status Kirim
    const sk = getStatusKirimNilai(madrasahId, selectedKodeMapel, selectedKelas);
    setStatusKirim(sk);

    // 3. Get Student Grades
    const list = getNilaiByKelasMapel(madrasahId, tahun, semester, selectedKelas, selectedKodeMapel);
    setDataNilai(list);
  }, [madrasahId, currentUser.id, selectedKelas, selectedKodeMapel, tahun, semester]);

  // Load Data Nilai Ekskul
  useEffect(() => {
    if (!selectedKelas || !selectedNamaEkskul) return;
    const listEks = getNilaiEkskulByKelas(madrasahId, tahun, semester, selectedKelas, selectedNamaEkskul);
    setDataNilaiEkskul(listEks);
  }, [madrasahId, selectedKelas, selectedNamaEkskul, tahun, semester]);

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch {}
  };

  // Simpan Bobot
  const handleSaveBobot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKelas || !selectedKodeMapel) return;

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
      kode_mapel: selectedKodeMapel,
      kelas: selectedKelas,
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
        selectedKodeMapel,
        dataNilai,
        updated
      );
      const reloaded = getNilaiByKelasMapel(
        madrasahId,
        tahun,
        semester,
        selectedKelas,
        selectedKodeMapel
      );
      setDataNilai(reloaded);
    }

    setNotification({
      type: "success",
      message: `Bobot penilaian kelas ${selectedKelas} diperbarui: Formatif ${bobot.bobot_formatif}%, STS ${bobot.bobot_sts}%, SAS ${bobot.bobot_sas}%!`,
    });
  };

  // Simpan Nilai Mapel
  const handleSaveNilai = (items: NilaiMapelItem[]) => {
    if (!selectedKelas || !selectedKodeMapel) return;
    setIsSaving(true);
    const res = simpanNilaiBatch(
      madrasahId,
      tahun,
      semester,
      selectedKodeMapel,
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

  // Simpan Nilai Ekskul
  const handleSaveNilaiEkskul = (items: NilaiEkskulItem[]) => {
    if (!selectedKelas || !selectedNamaEkskul) return;
    setIsSaving(true);
    const res = simpanNilaiEkskulBatch(
      madrasahId,
      tahun,
      semester,
      selectedNamaEkskul,
      items
    );
    setIsSaving(false);

    if (res.success) {
      setDataNilaiEkskul(items);
      triggerConfetti();
      setNotification({ type: "success", message: res.message });
    } else {
      setNotification({ type: "error", message: res.message });
    }
  };

  // Kirim Nilai ke Wali Kelas
  const handleKirimNilai = () => {
    if (!selectedKelas || !selectedKodeMapel || !activeMapelObj) return;

    const confirmSend = window.confirm(
      `KIRIM nilai ${activeMapelObj.nama} (${selectedKelas}) ke Wali Kelas?\n\nNilai akan terintegrasi langsung ke Legger & Rapor siswa dan data terkunci sementara.`
    );
    if (!confirmSend) return;

    // Pastikan nilai terbaru tersimpan terlebih dahulu
    simpanNilaiBatch(
      madrasahId,
      tahun,
      semester,
      selectedKodeMapel,
      dataNilai,
      bobot
    );

    const res = kirimNilaiKeWali(
      madrasahId,
      selectedKodeMapel,
      selectedKelas,
      currentUser.nama_user
    );

    if (res.success) {
      setStatusKirim({
        id: `status-${selectedKodeMapel}-${selectedKelas}`,
        madrasah_id: madrasahId,
        kode_mapel: selectedKodeMapel,
        kelas: selectedKelas,
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
    if (!selectedKelas || !selectedKodeMapel || !activeMapelObj) return;

    const confirmCancel = window.confirm(
      `Buka kunci pengeditan nilai ${activeMapelObj.nama} (${selectedKelas})?`
    );
    if (!confirmCancel) return;

    const res = batalKirimNilai(
      madrasahId,
      selectedKodeMapel,
      selectedKelas
    );

    if (res.success) {
      setStatusKirim({
        id: `status-${selectedKodeMapel}-${selectedKelas}`,
        madrasah_id: madrasahId,
        kode_mapel: selectedKodeMapel,
        kelas: selectedKelas,
        is_sent: false,
      });
      setNotification({ type: "success", message: res.message });
    }
  };

  // Unduh Template Excel Mapel
  const handleDownloadExcel = async () => {
    if (!selectedKelas || !selectedKodeMapel || !activeMapelObj) return;
    await downloadExcelMapel(
      selectedKelas,
      selectedKodeMapel,
      activeMapelObj.nama,
      dataNilai
    );
  };

  // Unggah Nilai Excel Mapel
  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedKelas || !selectedKodeMapel) return;

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
                GURU PENILAIAN • {config.jenjang}
              </span>
              <span className="badge-retro bg-retro-yellow text-retro-black">
                NIP: {currentUser.nip || "-"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-retro-black mt-1">
              {currentUser.nama_user}
            </h2>
            <p className="text-xs text-slate-600 font-bold">
              {config.nama_madrasah} • Bebas Pilih Kelas & Mata Pelajaran
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

      {/* Nav Tabs Alur Pengisian Nilai (Mata Pelajaran vs Ekstrakurikuler) */}
      <div className="flex flex-wrap items-center gap-2 bg-retro-cream p-2 rounded-xl border-2 border-retro-border shadow-retro-sm">
        <button
          onClick={() => setTipePenilaian("mapel")}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-2 ${
            tipePenilaian === "mapel"
              ? "bg-brand-500 text-white shadow-retro-sm"
              : "bg-white text-retro-black hover:bg-slate-100 border-2 border-retro-border"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Nilai Mata Pelajaran (Intrakurikuler)</span>
        </button>

        <button
          onClick={() => setTipePenilaian("ekskul")}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-2 ${
            tipePenilaian === "ekskul"
              ? "bg-retro-yellow text-retro-black shadow-retro-sm"
              : "bg-white text-retro-black hover:bg-slate-100 border-2 border-retro-border"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>2. Nilai Ekstrakurikuler (Bakat & Minat)</span>
        </button>
      </div>

      {/* ================= SECTION 1: NILAI MATA PELAJARAN ================= */}
      {tipePenilaian === "mapel" && (
        <>
          {/* Controls: Rombel + Mapel Selector + Bobot + Semester */}
          <div className="card-retro p-4 sm:p-5 space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Selector Rombongan Belajar (Kelas) */}
              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  1. Rombel (Kelas):
                </label>
                <select
                  value={selectedKelas}
                  onChange={e => setSelectedKelas(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border-2 border-retro-border bg-retro-cream font-black text-retro-black shadow-retro-sm focus:border-brand-500"
                >
                  {sortedKelas.map(k => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector Mata Pelajaran (KMA 1503) */}
              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  2. Mata Pelajaran (KMA 1503):
                </label>
                <select
                  value={selectedKodeMapel}
                  onChange={e => setSelectedKodeMapel(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border-2 border-retro-border bg-white font-bold text-retro-black shadow-retro-sm focus:border-brand-500"
                >
                  {mapelList.map(m => (
                    <option key={m.kode} value={m.kode}>
                      {m.nama} ({m.kode}) {m.kelompok ? `- Kel. ${m.kelompok}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Ajaran & Semester Aktif */}
              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  Semester & Tahun:
                </label>
                <div className="flex items-center text-xs py-2.5 px-3 rounded-lg border-2 border-retro-border bg-slate-50 font-black text-retro-black shadow-retro-sm">
                  <Calendar className="w-4 h-4 mr-1.5 text-brand-600 flex-shrink-0" />
                  <span className="truncate">
                    {activePeriodLabel || `${semester === "1" ? "Gasal" : "Genap"} ${tahun}`}
                  </span>
                </div>
              </div>

              {/* Button Atur Bobot */}
              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  Bobot Penilaian:
                </label>
                <button
                  onClick={() => setIsBobotOpen(!isBobotOpen)}
                  className="w-full py-2.5 px-3 rounded-lg bg-retro-cream hover:bg-slate-100 border-2 border-retro-border text-xs font-black flex items-center justify-between shadow-retro-sm"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Sliders className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" />
                    <span className="truncate">F:{bobot.bobot_formatif}% STS:{bobot.bobot_sts}% SAS:{bobot.bobot_sas}%</span>
                  </div>
                  <span className="badge-retro bg-retro-yellow text-retro-black text-[9px] flex-shrink-0">Atur</span>
                </button>
              </div>
            </div>

            {/* Panel Form Edit Bobot (Expandable) */}
            {isBobotOpen && (
              <form onSubmit={handleSaveBobot} className="p-4 rounded-xl border-2 border-retro-border bg-retro-cream space-y-3 shadow-retro-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-retro-border pb-2">
                  <h4 className="text-xs font-black text-retro-black uppercase flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-brand-600" />
                    <span>Pengaturan Bobot Penilaian — {activeMapelObj?.nama} (Kelas {selectedKelas})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-bold">
                    Sesuai RDM, akumulasi total bobot harus tepat 100%.
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
                      ✓ Nilai Terkirim ke Wali ({statusKirim.tanggal_kirim || "Terkonfirmasi"}) • Pengampu: {statusKirim.guru_pengampu || currentUser.nama_user}
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
                  <span>Unduh Excel (.xlsx)</span>
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
          <NilaiMapelTable
            initialData={dataNilai}
            onSave={handleSaveNilai}
            isSaving={isSaving}
            bobot={bobot}
            readOnly={statusKirim.is_sent}
          />
        </>
      )}

      {/* ================= SECTION 2: NILAI EKSTRAKURIKULER ================= */}
      {tipePenilaian === "ekskul" && (
        <>
          {/* Controls: Rombel + Ekskul Selector */}
          <div className="card-retro p-4 sm:p-5 space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {/* Selector Rombongan Belajar (Kelas) */}
              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  1. Rombel (Kelas):
                </label>
                <select
                  value={selectedKelas}
                  onChange={e => setSelectedKelas(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border-2 border-retro-border bg-retro-cream font-black text-retro-black shadow-retro-sm focus:border-brand-500"
                >
                  {sortedKelas.map(k => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector Ekstrakurikuler */}
              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  2. Jenis Ekstrakurikuler:
                </label>
                <select
                  value={selectedNamaEkskul}
                  onChange={e => setSelectedNamaEkskul(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg border-2 border-retro-border bg-white font-bold text-retro-black shadow-retro-sm focus:border-brand-500"
                >
                  {ekskulList.map(e => (
                    <option key={e} value={e}>
                      🏆 {e}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Ajaran & Semester Aktif */}
              <div>
                <label className="text-xs font-black text-retro-black uppercase block mb-1">
                  Semester & Tahun:
                </label>
                <div className="flex items-center text-xs py-2.5 px-3 rounded-lg border-2 border-retro-border bg-slate-50 font-black text-retro-black shadow-retro-sm">
                  <Calendar className="w-4 h-4 mr-1.5 text-brand-600 flex-shrink-0" />
                  <span className="truncate">
                    {activePeriodLabel || `${semester === "1" ? "Gasal" : "Genap"} ${tahun}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Note Info Seleksi Ekskul */}
            <div className="p-3 bg-retro-yellow/30 border-2 border-retro-border rounded-xl text-xs font-bold text-retro-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-700 flex-shrink-0" />
              <span>
                <strong>Panduan Alur Ekskul:</strong> Centang siswa peserta ekstrakurikuler {selectedNamaEkskul} di bawah. Siswa yang tidak dicentang otomatis tidak akan dicetak tabel ekskulnya di lembar Rapor Siswa.
              </span>
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

          {/* Tabel Nilai Ekskul dengan Checkbox Seleksi */}
          <NilaiEkskulTable
            initialData={dataNilaiEkskul}
            onSave={handleSaveNilaiEkskul}
            isSaving={isSaving}
            kelas={selectedKelas}
            namaEkskul={selectedNamaEkskul}
          />
        </>
      )}
    </div>
  );
}
