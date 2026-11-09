"use client";

import React, { useState } from "react";
import { KKTPConfig, KKTPPendekatan, MadrasahId } from "@/types";
import {
  X,
  Target,
  CheckCircle2,
  ListFilter,
  SlidersHorizontal,
  Percent,
  BookOpen,
  Sparkles,
  HelpCircle,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  AlertCircle,
  GraduationCap
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: KKTPConfig;
  onSave: (config: KKTPConfig) => void;
  onResetDefault: () => void;
  madrasahId: MadrasahId;
  namaMapel: string;
  kelas: string;
  tahun: string;
  semester: string;
}

export default function KelolaKKTPModal({
  isOpen,
  onClose,
  config: initialConfig,
  onSave,
  onResetDefault,
  madrasahId,
  namaMapel,
  kelas,
  tahun,
  semester,
}: Props) {
  const [config, setConfig] = useState<KKTPConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<KKTPPendekatan>(initialConfig.pendekatan || "interval");

  // Sinkronisasi jika initialConfig berubah
  React.useEffect(() => {
    setConfig(initialConfig);
    setActiveTab(initialConfig.pendekatan || "interval");
  }, [initialConfig]);

  if (!isOpen) return null;

  const handleApproachChange = (approach: KKTPPendekatan) => {
    setActiveTab(approach);
    setConfig(prev => ({
      ...prev,
      pendekatan: approach,
    }));
  };

  const handleAddKriteria = () => {
    const newId = `k-${Date.now()}`;
    setConfig(prev => ({
      ...prev,
      kriteria_list: [
        ...prev.kriteria_list,
        { id: newId, deskripsi: "Kriteria ketercapaian baru..." },
      ],
    }));
  };

  const handleRemoveKriteria = (id: string) => {
    setConfig(prev => {
      const updated = prev.kriteria_list.filter(k => k.id !== id);
      return {
        ...prev,
        kriteria_list: updated,
        min_kriteria_tuntas: Math.min(prev.min_kriteria_tuntas, Math.max(1, updated.length)),
      };
    });
  };

  const handleKriteriaChange = (id: string, text: string) => {
    setConfig(prev => ({
      ...prev,
      kriteria_list: prev.kriteria_list.map(k => (k.id === id ? { ...k, deskripsi: text } : k)),
    }));
  };

  const handleSave = () => {
    onSave({
      ...config,
      pendekatan: activeTab,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-retro-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border-3 border-retro-border rounded-2xl shadow-retro-xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* ================= HEADER RETRO ================= */}
        <div className="bg-brand-500 text-white p-4 sm:p-5 border-b-3 border-retro-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-retro-yellow text-retro-black border-2 border-retro-border flex items-center justify-center shadow-retro-sm">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wide uppercase">
                  PENGATURAN KKTP KURIKULUM MERDEKA
                </h3>
                <span className="badge-retro bg-white text-brand-900 text-[10px] uppercase font-black">
                  {madrasahId.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium">
                Kriteria Ketercapaian Tujuan Pembelajaran &bull; <strong className="text-retro-yellow">{namaMapel}</strong> (Kelas {kelas} - Sem {semester} {tahun})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-retro-black border border-white/40 transition-colors shadow-retro-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= CONTENT CONTAINER ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar bg-slate-50">
          
          {/* Section: Tujuan Pembelajaran (TP) */}
          <div className="bg-white p-4 rounded-xl border-2 border-retro-border shadow-retro-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-retro-black flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-brand-600" />
                Tujuan Pembelajaran (TP) yang Diukur
              </label>
              <span className="text-[10px] text-slate-500 font-bold">Acuan asesmen formatif & sumatif</span>
            </div>
            <textarea
              rows={2}
              value={config.tujuan_pembelajaran}
              onChange={e => setConfig({ ...config, tujuan_pembelajaran: e.target.value })}
              placeholder="Tuliskan tujuan pembelajaran yang hendak dicapai peserta didik..."
              className="w-full text-xs p-3 rounded-lg border-2 border-retro-border bg-amber-50/40 font-medium text-slate-800 shadow-retro-sm focus:outline-hidden focus:border-brand-500"
            />
          </div>

          {/* Section: 3 Pendekatan Utama Tab Switcher */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black uppercase text-retro-black flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                Pilih 1 dari 3 Pendekatan Utama KKTP
              </span>
              <span className="text-[10px] text-slate-600 font-medium bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                Panduan Resmi BSKAP Kemendikbudristek / Kemenag
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Tab 1: Deskripsi Kriteria */}
              <button
                type="button"
                onClick={() => handleApproachChange("deskripsi_kriteria")}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  activeTab === "deskripsi_kriteria"
                    ? "bg-brand-50 border-brand-500 shadow-retro ring-2 ring-brand-400"
                    : "bg-white border-retro-border hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-black text-retro-black">1. Deskripsi Kriteria</span>
                  </div>
                  {activeTab === "deskripsi_kriteria" && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Daftar kriteria konkret yang harus ditunjukkan siswa beserta syarat minimal kriteria tercapai.
                </p>
              </button>

              {/* Tab 2: Rubrik Penilaian */}
              <button
                type="button"
                onClick={() => handleApproachChange("rubrik")}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  activeTab === "rubrik"
                    ? "bg-blue-50 border-blue-500 shadow-retro ring-2 ring-blue-400"
                    : "bg-white border-retro-border hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black text-retro-black">2. Rubrik Penilaian</span>
                  </div>
                  {activeTab === "rubrik" && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Menilai tingkatan kinerja: <em>Baru Berkembang</em>, <em>Layak</em>, <em>Cakap</em>, <em>Mahir</em> dengan batas level tuntas.
                </p>
              </button>

              {/* Tab 3: Interval Nilai */}
              <button
                type="button"
                onClick={() => handleApproachChange("interval")}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  activeTab === "interval"
                    ? "bg-purple-50 border-purple-500 shadow-retro ring-2 ring-purple-400"
                    : "bg-white border-retro-border hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-black text-retro-black">3. Interval Nilai (Skala)</span>
                  </div>
                  {activeTab === "interval" && (
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Rentang skor (0%–100%) dengan deskripsi tindak lanjut: Remedial Total, Remedial Sebagian, Tuntas, Pengayaan.
                </p>
              </button>
            </div>
          </div>

          {/* ================= DETAIL SESUAI PENDEKATAN AKTIF ================= */}
          
          {/* 1. DETAIL PENDEKATAN: DESKRIPSI KRITERIA */}
          {activeTab === "deskripsi_kriteria" && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-retro-border shadow-retro-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-200">
                <div>
                  <h4 className="text-xs font-black text-retro-black uppercase">
                    Daftar Kriteria Konkret Ketercapaian
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Siswa dianggap tuntas jika memenuhi syarat minimal jumlah kriteria yang ditentukan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddKriteria}
                  className="btn-retro bg-brand-100 hover:bg-brand-200 text-brand-900 border border-brand-300 text-[11px] px-3 py-1 flex items-center gap-1 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kriteria</span>
                </button>
              </div>

              {/* Syarat Minimal Kriteria */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">
                    Syarat Minimal Kriteria Terpenuhi untuk Dinyatakan Tuntas:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={config.kriteria_list.length || 4}
                    value={config.min_kriteria_tuntas}
                    onChange={e => setConfig({ ...config, min_kriteria_tuntas: Number(e.target.value) || 1 })}
                    className="w-16 text-center font-black py-1 px-2 border-2 border-retro-border rounded bg-white shadow-retro-sm text-xs"
                  />
                  <span className="text-xs font-black text-slate-700">
                    dari {config.kriteria_list.length} kriteria
                  </span>
                </div>
              </div>

              {/* List Input Kriteria */}
              <div className="space-y-2">
                {config.kriteria_list.map((kriteria, idx) => (
                  <div key={kriteria.id} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-black text-slate-600">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={kriteria.deskripsi}
                      onChange={e => handleKriteriaChange(kriteria.id, e.target.value)}
                      placeholder={`Kriteria ${idx + 1}...`}
                      className="flex-1 text-xs px-3 py-2 border-2 border-slate-200 rounded-lg font-medium focus:border-brand-500 focus:bg-white bg-slate-50/50"
                    />
                    {config.kriteria_list.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKriteria(kriteria.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        title="Hapus kriteria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-500 italic bg-slate-100 p-2.5 rounded">
                💡 <strong>Contoh:</strong> Jika ada 4 kriteria dan syarat minimal adalah 3, maka peserta didik yang mencapai minimal 3 kriteria dinyatakan telah tuntas tujuan pembelajaran.
              </div>
            </div>
          )}

          {/* 2. DETAIL PENDEKATAN: RUBRIK PENILAIAN */}
          {activeTab === "rubrik" && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-retro-border shadow-retro-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-200">
                <div>
                  <h4 className="text-xs font-black text-retro-black uppercase">
                    Tingkatan Level Kinerja Peserta Didik
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Menilai capaian berdasarkan 4 tahapan perkembangan belajar.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Level Minimum Tuntas:</span>
                  <select
                    value={config.rubrik_level_min}
                    onChange={e => setConfig({ ...config, rubrik_level_min: e.target.value as any })}
                    className="text-xs font-black py-1 px-3 border-2 border-retro-border rounded-lg bg-blue-50 text-blue-950 shadow-retro-sm"
                  >
                    <option value="Baru Berkembang">Baru Berkembang</option>
                    <option value="Layak">Layak</option>
                    <option value="Cakap">Cakap (Rekomendasi)</option>
                    <option value="Mahir">Mahir</option>
                  </select>
                </div>
              </div>

              {/* Tabel Deskripsi Rubrik 4 Level */}
              <div className="overflow-x-auto rounded-lg border border-slate-300">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300 text-slate-900">
                      <th className="p-2.5 w-32">Aspek / Kriteria</th>
                      <th className="p-2.5 bg-rose-50/70 text-rose-900">Baru Berkembang</th>
                      <th className="p-2.5 bg-amber-50/70 text-amber-900">Layak</th>
                      <th className="p-2.5 bg-emerald-50/70 text-emerald-900">Cakap (Tuntas)</th>
                      <th className="p-2.5 bg-purple-50/70 text-purple-900">Mahir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {config.rubrik_items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900 bg-slate-50 align-top">
                          <input
                            type="text"
                            value={item.aspek}
                            onChange={e => {
                              const updated = [...config.rubrik_items];
                              updated[idx].aspek = e.target.value;
                              setConfig({ ...config, rubrik_items: updated });
                            }}
                            className="w-full font-bold bg-transparent border-b border-dashed border-slate-400 focus:border-brand-500 focus:outline-hidden"
                          />
                        </td>
                        <td className="p-2 align-top bg-rose-50/30">
                          <textarea
                            rows={2}
                            value={item.baru_berkembang}
                            onChange={e => {
                              const updated = [...config.rubrik_items];
                              updated[idx].baru_berkembang = e.target.value;
                              setConfig({ ...config, rubrik_items: updated });
                            }}
                            className="w-full text-[11px] p-1.5 rounded border border-rose-200 bg-white"
                          />
                        </td>
                        <td className="p-2 align-top bg-amber-50/30">
                          <textarea
                            rows={2}
                            value={item.layak}
                            onChange={e => {
                              const updated = [...config.rubrik_items];
                              updated[idx].layak = e.target.value;
                              setConfig({ ...config, rubrik_items: updated });
                            }}
                            className="w-full text-[11px] p-1.5 rounded border border-amber-200 bg-white"
                          />
                        </td>
                        <td className="p-2 align-top bg-emerald-50/30">
                          <textarea
                            rows={2}
                            value={item.cakap}
                            onChange={e => {
                              const updated = [...config.rubrik_items];
                              updated[idx].cakap = e.target.value;
                              setConfig({ ...config, rubrik_items: updated });
                            }}
                            className="w-full text-[11px] p-1.5 rounded border border-emerald-200 bg-white"
                          />
                        </td>
                        <td className="p-2 align-top bg-purple-50/30">
                          <textarea
                            rows={2}
                            value={item.mahir}
                            onChange={e => {
                              const updated = [...config.rubrik_items];
                              updated[idx].mahir = e.target.value;
                              setConfig({ ...config, rubrik_items: updated });
                            }}
                            className="w-full text-[11px] p-1.5 rounded border border-purple-200 bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-slate-500 italic bg-blue-50/70 p-2.5 rounded border border-blue-200">
                🎯 <strong>Ketentuan:</strong> Peserta didik dianggap tuntas tujuan pembelajaran jika seluruh atau mayoritas kriteria minimal mencapai level <strong>&quot;{config.rubrik_level_min}&quot;</strong>.
              </div>
            </div>
          )}

          {/* 3. DETAIL PENDEKATAN: INTERVAL NILAI */}
          {activeTab === "interval" && (
            <div className="bg-white p-4 sm:p-5 rounded-xl border-2 border-retro-border shadow-retro-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-200">
                <div>
                  <h4 className="text-xs font-black text-retro-black uppercase">
                    Rentang Interval Nilai (Skala 0% – 100%)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Standar konversi persentase capaian asesmen harian ke dalam tindak lanjut pembelajaran.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Batas Nilai Tuntas:</span>
                  <span className="badge-retro bg-emerald-100 text-emerald-950 font-mono text-xs font-black">
                    ≥ 66 (Standar Merdeka)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 0 - 40 */}
                <div className="p-3.5 rounded-xl border-2 border-rose-300 bg-rose-50/70 space-y-1.5 shadow-retro-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-rose-950 bg-rose-200 px-2 py-0.5 rounded">
                      0% – 40%
                    </span>
                    <span className="text-[11px] font-black uppercase text-rose-700">
                      Remedial Total
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    Belum mencapai ketuntasan
                  </p>
                  <p className="text-[11px] text-rose-900 leading-snug">
                    Tindak Lanjut: <strong>Perlu remedial di seluruh bagian</strong> materi bersama guru pembimbing.
                  </p>
                </div>

                {/* 41 - 65 */}
                <div className="p-3.5 rounded-xl border-2 border-amber-300 bg-amber-50/70 space-y-1.5 shadow-retro-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-amber-950 bg-amber-200 px-2 py-0.5 rounded">
                      41% – 65%
                    </span>
                    <span className="text-[11px] font-black uppercase text-amber-700">
                      Remedial Sebagian
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    Belum tuntas pada indikator tertentu
                  </p>
                  <p className="text-[11px] text-amber-900 leading-snug">
                    Tindak Lanjut: <strong>Perlu remedial bagian tertentu</strong> (fokus pada materi yang belum dikuasai).
                  </p>
                </div>

                {/* 66 - 85 */}
                <div className="p-3.5 rounded-xl border-2 border-emerald-300 bg-emerald-50/70 space-y-1.5 shadow-retro-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-emerald-950 bg-emerald-200 px-2 py-0.5 rounded">
                      66% – 85%
                    </span>
                    <span className="text-[11px] font-black uppercase text-emerald-700">
                      Tuntas
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    Mencapai ketuntasan tujuan pembelajaran
                  </p>
                  <p className="text-[11px] text-emerald-900 leading-snug">
                    Tindak Lanjut: <strong>Tuntas (tidak perlu remedial)</strong>; dapat melanjutkan ke materi berikutnya.
                  </p>
                </div>

                {/* 86 - 100 */}
                <div className="p-3.5 rounded-xl border-2 border-purple-300 bg-purple-50/70 space-y-1.5 shadow-retro-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-purple-950 bg-purple-200 px-2 py-0.5 rounded">
                      86% – 100%
                    </span>
                    <span className="text-[11px] font-black uppercase text-purple-700">
                      Pengayaan
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    Melampaui kriteria ketuntasan
                  </p>
                  <p className="text-[11px] text-purple-900 leading-snug">
                    Tindak Lanjut: <strong>Diberikan pengayaan</strong> berupa tantangan materi lanjutan atau tutor sebaya.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3 FUNGSI KKTP BAGI GURU MAPEL ================= */}
          <div className="p-4 rounded-xl border-2 border-retro-border bg-amber-50/80 space-y-2.5">
            <h4 className="text-xs font-black uppercase text-retro-black flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              3 Fungsi Pokok KKTP bagi Guru Mata Pelajaran
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="font-black text-brand-900 block mb-0.5">1. Alat Ukur Asesmen</span>
                <p className="text-[11px] text-slate-600">
                  Menjadi acuan dasar dalam menyusun butir soal, kuis, atau rubrik penilaian harian agar relevan dengan TP.
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="font-black text-blue-900 block mb-0.5">2. Refleksi Pembelajaran</span>
                <p className="text-[11px] text-slate-600">
                  Membantu guru menganalisis indikator materi mana yang belum dipahami secara tuntas oleh seluruh siswa kelas.
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="font-black text-purple-900 block mb-0.5">3. Dasar Tindak Lanjut</span>
                <p className="text-[11px] text-slate-600">
                  Menentukan siswa mana yang membutuhkan perlakuan remedial terarah atau apresiasi pengayaan materi.
                </p>
              </div>
            </div>
          </div>

          {/* Catatan Refleksi Guru */}
          <div className="bg-white p-4 rounded-xl border-2 border-retro-border shadow-retro-sm space-y-1.5">
            <label className="text-xs font-black uppercase text-retro-black flex items-center gap-1.5">
              Catatan Refleksi & Evaluasi Guru Mapel:
            </label>
            <input
              type="text"
              value={config.catatan_refleksi || ""}
              onChange={e => setConfig({ ...config, catatan_refleksi: e.target.value })}
              placeholder="Catatan analisis capaian pembelajaran kelas ini..."
              className="w-full text-xs p-2.5 rounded-lg border-2 border-retro-border bg-slate-50 font-medium text-slate-800 focus:bg-white"
            />
          </div>

        </div>

        {/* ================= FOOTER ACTIONS ================= */}
        <div className="p-4 bg-white border-t-3 border-retro-border flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetDefault}
            className="btn-retro bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2 flex items-center gap-1.5 font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pulihkan Template Bawaan</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-retro bg-white text-slate-700 hover:bg-slate-100 text-xs px-4 py-2"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-retro-primary px-5 py-2 text-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>SIMPAN PENGATURAN KKTP</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
