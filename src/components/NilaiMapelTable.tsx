"use client";

import React, { useState, useEffect, useMemo } from "react";
import { NilaiMapelItem, BobotNilai, MadrasahId, KKTPConfig } from "@/types";
import {
  Sparkles,
  Lock,
  Save,
  Target,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  BookOpen
} from "lucide-react";
import { getKKTPConfig, saveKKTPConfig, evaluateStudentKKTP, getDefaultKKTPConfig } from "@/lib/storage";
import KelolaKKTPModal from "./guru/KelolaKKTPModal";

interface Props {
  initialData: NilaiMapelItem[];
  onSave: (data: NilaiMapelItem[]) => void;
  isSaving: boolean;
  bobot?: BobotNilai;
  readOnly?: boolean;
  madrasahId?: MadrasahId;
  kodeMapel?: string;
  namaMapel?: string;
  kelas?: string;
  tahun?: string;
  semester?: string;
}

export default function NilaiMapelTable({
  initialData,
  onSave,
  isSaving,
  bobot,
  readOnly = false,
  madrasahId = "ma",
  kodeMapel = "",
  namaMapel = "",
  kelas = "",
  tahun = "2026/2027",
  semester = "1",
}: Props) {
  const [data, setData] = useState<NilaiMapelItem[]>([]);
  const [materi1, setMateri1] = useState("");
  const [materi2, setMateri2] = useState("");
  const [materi3, setMateri3] = useState("");
  const [materi4, setMateri4] = useState("");

  // Modal KKTP State
  const [isKKTPModalOpen, setIsKKTPModalOpen] = useState(false);
  const [kktpConfig, setKktpConfig] = useState<KKTPConfig>(() =>
    getKKTPConfig(madrasahId, kodeMapel, kelas, tahun, semester, namaMapel)
  );

  // Deteksi Language Development Program (MA)
  const isLanguageDevProgram = useMemo(() => {
    const km = (kodeMapel || "").toUpperCase();
    const nm = (namaMapel || "").toLowerCase();
    return (
      km === "EDP" ||
      km === "ADP" ||
      nm.includes("english development") ||
      nm.includes("arabic development")
    );
  }, [kodeMapel, namaMapel]);

  const isEDP = (kodeMapel || "").toUpperCase() === "EDP" || (namaMapel || "").toLowerCase().includes("english");
  const isADP = (kodeMapel || "").toUpperCase() === "ADP" || (namaMapel || "").toLowerCase().includes("arabic");

  // Re-fetch KKTP config whenever context changes
  useEffect(() => {
    if (kodeMapel && kelas) {
      setKktpConfig(getKKTPConfig(madrasahId, kodeMapel, kelas, tahun, semester, namaMapel));
    }
  }, [madrasahId, kodeMapel, kelas, tahun, semester, namaMapel]);

  const wFormatif = (bobot?.bobot_formatif ?? 50) / 100;
  const wSts = (bobot?.bobot_sts ?? 25) / 100;
  const wSas = (bobot?.bobot_sas ?? 25) / 100;

  useEffect(() => {
    setData(initialData);
    if (initialData.length > 0) {
      const defaultM1 = isLanguageDevProgram
        ? (isEDP ? "Reading Comprehension" : "Qira'ah (Membaca Teks Arab)")
        : initialData[0].materi_1 || "";
      const defaultM2 = isLanguageDevProgram
        ? (isEDP ? "Speaking & Dialogue" : "Kalam (Muhadatsah / Berbicara)")
        : initialData[0].materi_2 || "";
      const defaultM3 = isLanguageDevProgram
        ? (isEDP ? "Listening Comprehension" : "Istima' (Menyimak Audio Arab)")
        : initialData[0].materi_3 || "";
      const defaultM4 = isLanguageDevProgram
        ? (isEDP ? "Writing & Grammar" : "Kitabah & Insya' (Menulis Kalimat)")
        : initialData[0].materi_4 || "";

      setMateri1(initialData[0].materi_1 || defaultM1);
      setMateri2(initialData[0].materi_2 || defaultM2);
      setMateri3(initialData[0].materi_3 || defaultM3);
      setMateri4(initialData[0].materi_4 || defaultM4);
    }
  }, [initialData, isLanguageDevProgram, isEDP, isADP]);

  const handleMateriChange = (idx: 1 | 2 | 3 | 4, value: string) => {
    if (readOnly) return;
    if (idx === 1) setMateri1(value);
    if (idx === 2) setMateri2(value);
    if (idx === 3) setMateri3(value);
    if (idx === 4) setMateri4(value);

    setData(prev =>
      prev.map(row => ({
        ...row,
        [`materi_${idx}`]: value,
      }))
    );
  };

  const handleRowChange = (
    nis: string,
    field: keyof NilaiMapelItem,
    val: string | number
  ) => {
    if (readOnly) return;
    setData(prev =>
      prev.map(row => {
        if (row.nis !== nis) return row;
        const updated = { ...row, [field]: val };

        const h1 = Number(field === "nilai_harian_1" ? val : updated.nilai_harian_1) || 0;
        const h2 = Number(field === "nilai_harian_2" ? val : updated.nilai_harian_2) || 0;
        const h3 = Number(field === "nilai_harian_3" ? val : updated.nilai_harian_3) || 0;
        const h4 = Number(field === "nilai_harian_4" ? val : updated.nilai_harian_4) || 0;

        let count = 0;
        let tot = 0;
        if (updated.materi_1 || h1 > 0) { tot += h1; count++; }
        if (updated.materi_2 || h2 > 0) { tot += h2; count++; }
        if (updated.materi_3 || h3 > 0) { tot += h3; count++; }
        if (updated.materi_4 || h4 > 0) { tot += h4; count++; }

        const avg = count > 0 ? tot / count : (h1 + h2 + h3 + h4) / 4;
        const uts = Number(field === "nilai_uts" ? val : updated.nilai_uts) || 0;
        const uas = Number(field === "nilai_uas" ? val : updated.nilai_uas) || 0;

        const na = Math.round((avg * wFormatif) + (uts * wSts) + (uas * wSas));
        const predikat: "A" | "B" | "C" | "D" =
          na >= 90 ? "A" : na >= 80 ? "B" : na >= 70 ? "C" : "D";

        // Simpan juga sub_skills jika Language Development Program atau ada nilai h1-h4
        const sub_skills = {
          reading: h1,
          speaking: h2,
          listening: h3,
          writing: h4,
        };

        return {
          ...updated,
          nilai_akhir: na,
          predikat: predikat,
          sub_skills,
        };
      })
    );
  };

  const handleAutoGenerateDeskripsi = () => {
    if (readOnly) return;
    setData(prev =>
      prev.map(row => {
        const scores = [
          { name: materi1 || (isLanguageDevProgram ? "Reading" : "Materi 1"), score: Number(row.nilai_harian_1) || 0 },
          { name: materi2 || (isLanguageDevProgram ? "Speaking" : "Materi 2"), score: Number(row.nilai_harian_2) || 0 },
          { name: materi3 || (isLanguageDevProgram ? "Listening" : "Materi 3"), score: Number(row.nilai_harian_3) || 0 },
          { name: materi4 || (isLanguageDevProgram ? "Writing" : "Materi 4"), score: Number(row.nilai_harian_4) || 0 },
        ].filter(s => s.name.trim() !== "");

        if (scores.length === 0) return row;

        scores.sort((a, b) => b.score - a.score);
        const best = scores[0];
        const lowest = scores[scores.length - 1];

        let desc = "";
        if (best.score >= 85) {
          desc = `Menunjukkan penguasaan sangat baik dalam ${best.name}`;
        } else if (best.score >= 75) {
          desc = `Menunjukkan pemahaman yang baik dalam ${best.name}`;
        } else {
          desc = `Cukup menguasai capaian materi ${best.name}`;
        }

        if (lowest.score < 75 && lowest.name !== best.name) {
          desc += `, serta perlu peningkatan dalam ${lowest.name}.`;
        } else {
          desc += `. Pertahankan motivasi belajar.`;
        }

        return {
          ...row,
          catatan_mapel: desc,
        };
      })
    );
  };

  const handleSaveAll = () => {
    const payload = data.map(item => ({
      ...item,
      materi_1: materi1,
      materi_2: materi2,
      materi_3: materi3,
      materi_4: materi4,
      sub_skills: {
        reading: Number(item.nilai_harian_1) || 0,
        speaking: Number(item.nilai_harian_2) || 0,
        listening: Number(item.nilai_harian_3) || 0,
        writing: Number(item.nilai_harian_4) || 0,
      },
    }));
    onSave(payload);
  };

  const handleSaveKKTP = (newConfig: KKTPConfig) => {
    saveKKTPConfig(madrasahId, newConfig);
    setKktpConfig(newConfig);
  };

  const handleResetDefaultKKTP = () => {
    const def = getDefaultKKTPConfig(madrasahId, kodeMapel, kelas, tahun, semester, namaMapel);
    saveKKTPConfig(madrasahId, def);
    setKktpConfig(def);
  };

  if (!data || data.length === 0) {
    return (
      <div className="card-retro p-8 text-center bg-white text-slate-500 font-bold">
        Belum ada data peserta didik untuk kelas dan mata pelajaran ini.
      </div>
    );
  }

  // Label Pendekatan KKTP untuk Header
  const getPendekatanLabel = (p: string) => {
    if (p === "deskripsi_kriteria") return "Deskripsi Kriteria";
    if (p === "rubrik") return "Rubrik Penilaian (4 Level)";
    return "Interval Nilai (0%–100%)";
  };

  return (
    <div className="space-y-4">
      {/* Banner Lock jika ReadOnly */}
      {readOnly && (
        <div className="p-3.5 bg-amber-100 border-2 border-retro-border rounded-xl flex items-center justify-between text-xs font-black shadow-retro-sm text-retro-black">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>
              Nilai Telah Dikirim & Terkunci. Untuk mengedit nilai, klik tombol <em>&quot;Buka Kunci Nilai&quot;</em> pada bilah di atas.
            </span>
          </div>
        </div>
      )}

      {/* Banner Khusus EDP / ADP Language Development Program MA */}
      {isLanguageDevProgram && (
        <div className="p-3.5 bg-emerald-50 border-2 border-brand-500 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-retro-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black text-xs shadow-retro-xs">
              {isEDP ? "EDP" : "ADP"}
            </div>
            <div>
              <h4 className="text-xs font-black text-brand-950 uppercase tracking-wide">
                {isEDP ? "English Development Program (EDP)" : "Arabic Development Program (ADP)"} &bull; MA Nurus Salam
              </h4>
              <p className="text-[11px] text-brand-800 font-medium">
                Dilengkapi 4 Poin Sub-Penilaian Keterampilan Berbahasa: <strong>Reading</strong>, <strong>Speaking</strong>, <strong>Listening</strong>, dan <strong>Writing</strong>.
              </p>
            </div>
          </div>
          <span className="badge-retro bg-white text-brand-900 border border-brand-400 font-mono text-[10px] font-bold">
            Sub-Nilai Otomatis Disematkan ke Rapor MA
          </span>
        </div>
      )}

      {/* Header Lingkup Materi Pembelajaran & Pengaturan KKTP Retro */}
      <div className="card-retro p-4 sm:p-5 bg-retro-cream border-2 border-retro-border space-y-3 shadow-retro-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-retro-border pb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-retro-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
              {isLanguageDevProgram
                ? "4 Sub-Penilaian Aspek Bahasa (Reading, Speaking, Listening, Writing)"
                : "Lingkup Materi Pembelajaran (Formatif Seragam 1 Kelas)"}
            </span>
            <span className="badge-retro bg-white text-retro-black text-[10px]">
              Bobot: Formatif {bobot?.bobot_formatif ?? 50}% | STS {bobot?.bobot_sts ?? 25}% | SAS {bobot?.bobot_sas ?? 25}%
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol Buka KKTP Kurikulum Merdeka */}
            <button
              type="button"
              onClick={() => setIsKKTPModalOpen(true)}
              className="btn-retro bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-400 px-3 py-1 text-[11px] flex items-center gap-1.5 font-black shadow-retro-xs"
              title="Atur KKTP (Kriteria Ketercapaian Tujuan Pembelajaran) Kurikulum Merdeka"
            >
              <Target className="w-3.5 h-3.5 text-purple-700" />
              <span>KKTP: {getPendekatanLabel(kktpConfig.pendekatan)}</span>
            </button>

            {!readOnly && (
              <button
                type="button"
                onClick={handleAutoGenerateDeskripsi}
                className="btn-retro bg-retro-yellow text-retro-black hover:bg-amber-300 px-3 py-1 text-[11px] flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Otomatiskan Deskripsi</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Input 4 Materi / Sub-Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div>
            <label className="text-[10px] font-black text-retro-black uppercase block mb-1">
              {isLanguageDevProgram ? (isEDP ? "Sub 1: Reading" : "Sub 1: Reading (Qira'ah)") : "Materi 1 (Harian 1):"}
            </label>
            <input
              type="text"
              disabled={readOnly}
              value={materi1}
              onChange={e => handleMateriChange(1, e.target.value)}
              placeholder={isLanguageDevProgram ? "Reading Comprehension..." : "Contoh: Menelusuri Tradisi..."}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-retro-black uppercase block mb-1">
              {isLanguageDevProgram ? (isEDP ? "Sub 2: Speaking" : "Sub 2: Speaking (Kalam)") : "Materi 2 (Harian 2):"}
            </label>
            <input
              type="text"
              disabled={readOnly}
              value={materi2}
              onChange={e => handleMateriChange(2, e.target.value)}
              placeholder={isLanguageDevProgram ? "Speaking & Dialogue..." : "Contoh: Memahami Kaidah..."}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-retro-black uppercase block mb-1">
              {isLanguageDevProgram ? (isEDP ? "Sub 3: Listening" : "Sub 3: Listening (Istima')") : "Materi 3 (Harian 3):"}
            </label>
            <input
              type="text"
              disabled={readOnly}
              value={materi3}
              onChange={e => handleMateriChange(3, e.target.value)}
              placeholder={isLanguageDevProgram ? "Listening & Audio Comprehension..." : "Contoh: Menelaah Sumber..."}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-retro-black uppercase block mb-1">
              {isLanguageDevProgram ? (isEDP ? "Sub 4: Writing" : "Sub 4: Writing (Kitabah)") : "Materi 4 (Harian 4):"}
            </label>
            <input
              type="text"
              disabled={readOnly}
              value={materi4}
              onChange={e => handleMateriChange(4, e.target.value)}
              placeholder={isLanguageDevProgram ? "Writing & Grammar..." : "Contoh: Evaluasi Proyek..."}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border-2 border-retro-border bg-white font-bold shadow-retro-sm disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
        </div>

        {/* Ringkasan Tindak Lanjut KKTP yang aktif */}
        <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 text-slate-600 gap-2 border-t border-retro-border/40">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>
              <strong>Tujuan Pembelajaran:</strong> &quot;{kktpConfig.tujuan_pembelajaran.slice(0, 110)}...&quot;
            </span>
          </div>
          <span className="text-[10px] font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Pendekatan: {getPendekatanLabel(kktpConfig.pendekatan)}
          </span>
        </div>
      </div>

      {/* Grid Tabel Siswa & Nilai Retro */}
      <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro bg-white custom-scrollbar">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-retro-yellow text-retro-black font-black uppercase border-b-2 border-retro-border">
              <th className="py-2.5 px-3 text-center w-16">NIS</th>
              <th className="py-2.5 px-3 min-w-[170px]">Nama Siswa</th>
              
              {/* Kolom Sub-Penilaian Bahasa atau Formatif Biasa */}
              <th className="py-2.5 px-2 text-center w-16 bg-brand-100 text-brand-950" title={isLanguageDevProgram ? "Sub Nilai: Reading" : "Harian 1"}>
                {isLanguageDevProgram ? "Reading" : "H1"}
              </th>
              <th className="py-2.5 px-2 text-center w-16 bg-brand-100 text-brand-950" title={isLanguageDevProgram ? "Sub Nilai: Speaking" : "Harian 2"}>
                {isLanguageDevProgram ? "Speaking" : "H2"}
              </th>
              <th className="py-2.5 px-2 text-center w-16 bg-brand-100 text-brand-950" title={isLanguageDevProgram ? "Sub Nilai: Listening" : "Harian 3"}>
                {isLanguageDevProgram ? "Listening" : "H3"}
              </th>
              <th className="py-2.5 px-2 text-center w-16 bg-brand-100 text-brand-950" title={isLanguageDevProgram ? "Sub Nilai: Writing" : "Harian 4"}>
                {isLanguageDevProgram ? "Writing" : "H4"}
              </th>

              <th className="py-2.5 px-2 text-center w-16 bg-amber-100 text-amber-950">STS</th>
              <th className="py-2.5 px-2 text-center w-16 bg-blue-100 text-blue-950">SAS</th>
              <th className="py-2.5 px-2 text-center w-16 bg-purple-100 text-purple-950">NA</th>
              <th className="py-2.5 px-2 text-center w-14 bg-purple-100 text-purple-950">Pred</th>
              <th className="py-2.5 px-3 min-w-[180px] bg-slate-100 text-slate-900">Status KKTP & Tindak Lanjut</th>
              <th className="py-2.5 px-3 min-w-[200px]">Capaian Kompetensi (RDM)</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100 font-bold">
            {data.map((item) => {
              const na = item.nilai_akhir || 0;
              const pred = item.predikat || "C";
              const kktpEval = evaluateStudentKKTP(na, kktpConfig);

              return (
                <tr key={item.nis} className="hover:bg-brand-50/40">
                  <td className="py-2 px-3 text-center font-mono font-bold text-slate-600 bg-slate-50/60">
                    {item.nis}
                  </td>
                  <td className="py-2 px-3 text-retro-black">
                    {item.nama_siswa}
                  </td>
                  
                  {/* Reading / H1 */}
                  <td className="p-1 text-center bg-brand-50/30">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={readOnly}
                      value={item.nilai_harian_1 || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_harian_1", Number(e.target.value))}
                      className="w-14 text-center font-black py-1 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </td>

                  {/* Speaking / H2 */}
                  <td className="p-1 text-center bg-brand-50/30">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={readOnly}
                      value={item.nilai_harian_2 || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_harian_2", Number(e.target.value))}
                      className="w-14 text-center font-black py-1 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </td>

                  {/* Listening / H3 */}
                  <td className="p-1 text-center bg-brand-50/30">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={readOnly}
                      value={item.nilai_harian_3 || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_harian_3", Number(e.target.value))}
                      className="w-14 text-center font-black py-1 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </td>

                  {/* Writing / H4 */}
                  <td className="p-1 text-center bg-brand-50/30">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={readOnly}
                      value={item.nilai_harian_4 || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_harian_4", Number(e.target.value))}
                      className="w-14 text-center font-black py-1 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </td>

                  {/* STS */}
                  <td className="p-1 text-center bg-amber-50/40">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={readOnly}
                      value={item.nilai_uts || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_uts", Number(e.target.value))}
                      className="w-14 text-center font-black py-1 rounded-lg border-2 border-retro-border bg-white text-amber-900 shadow-retro-sm disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </td>

                  {/* SAS */}
                  <td className="p-1 text-center bg-blue-50/40">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={readOnly}
                      value={item.nilai_uas || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_uas", Number(e.target.value))}
                      className="w-14 text-center font-black py-1 rounded-lg border-2 border-retro-border bg-white text-blue-900 shadow-retro-sm disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </td>

                  {/* Nilai Akhir NA */}
                  <td className="py-2 px-1 text-center font-black text-retro-black bg-purple-50/40">
                    <span className="px-2 py-0.5 rounded border border-retro-border bg-white text-purple-900 font-mono text-xs shadow-retro-sm">
                      {na}
                    </span>
                  </td>

                  {/* Predikat */}
                  <td className="py-2 px-1 text-center font-black bg-purple-50/40">
                    <span className={`badge-retro text-[10px] ${
                      pred === 'A' ? 'bg-brand-500 text-white' :
                      pred === 'B' ? 'bg-blue-200 text-blue-950' :
                      pred === 'C' ? 'bg-amber-200 text-amber-950' :
                      'bg-red-200 text-red-950'
                    }`}>
                      {pred}
                    </span>
                  </td>

                  {/* Status KKTP & Tindak Lanjut Pembelajaran */}
                  <td className="py-2 px-2.5 bg-slate-50/60">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded border ${kktpEval.badgeClass}`}>
                          {kktpEval.status}
                        </span>
                        {kktpEval.isTuntas ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 inline" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600 font-medium line-clamp-1 leading-tight" title={kktpEval.tindakLanjut}>
                        {kktpEval.tindakLanjut}
                      </span>
                    </div>
                  </td>

                  {/* Catatan / Lingkup Kompetensi RDM */}
                  <td className="p-1">
                    <input
                      type="text"
                      disabled={readOnly}
                      value={item.catatan_mapel || ""}
                      onChange={e => handleRowChange(item.nis, "catatan_mapel", e.target.value)}
                      placeholder="Catatan capaian kompetensi..."
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm font-semibold disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="card-retro p-3.5 flex flex-wrap justify-between items-center gap-3 bg-white">
        <div className="flex items-center gap-3 text-xs font-black text-retro-black">
          <span>Total Peserta Didik: <strong>{data.length}</strong> Siswa</span>
          <span>&bull;</span>
          <span className="text-emerald-700">
            Tuntas KKTP: {data.filter(s => evaluateStudentKKTP(s.nilai_akhir || 0, kktpConfig).isTuntas).length}
          </span>
          <span>&bull;</span>
          <span className="text-amber-700">
            Perlu Remedial: {data.filter(s => !evaluateStudentKKTP(s.nilai_akhir || 0, kktpConfig).isTuntas).length}
          </span>
        </div>

        {!readOnly && (
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="btn-retro-primary px-5 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Menyimpan..." : "SIMPAN SEMUA NILAI"}</span>
          </button>
        )}
      </div>

      {/* Modal Kelola KKTP */}
      <KelolaKKTPModal
        isOpen={isKKTPModalOpen}
        onClose={() => setIsKKTPModalOpen(false)}
        config={kktpConfig}
        onSave={handleSaveKKTP}
        onResetDefault={handleResetDefaultKKTP}
        madrasahId={madrasahId}
        namaMapel={namaMapel || kodeMapel}
        kelas={kelas}
        tahun={tahun}
        semester={semester}
      />
    </div>
  );
}
