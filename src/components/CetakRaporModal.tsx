"use client";

import React, { useState } from "react";
import { LeggerResponse, SchoolConfig, User } from "@/types";
import { Printer, X, Upload, BookOpen, FileText } from "lucide-react";
import KopMadrasah from "./KopMadrasah";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leggerData: LeggerResponse | null;
  tahun: string;
  semester: string;
  kelas: string;
  config: SchoolConfig;
  currentUser: User | null;
}

export default function CetakRaporModal({
  isOpen,
  onClose,
  leggerData,
  tahun,
  semester,
  kelas,
  config,
  currentUser,
}: Props) {
  const [selectedNis, setSelectedNis] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"rapor" | "cover">("rapor");
  const [ttdBase64, setTtdBase64] = useState<string>(currentUser?.ttd_url || "");

  if (!isOpen || !leggerData || !leggerData.success) return null;

  const currentSiswa = leggerData.siswa.find(s => s.nis === selectedNis);

  const handleTtdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setTtdBase64(String(ev.target.result));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    if (!selectedNis) {
      alert("Pilih siswa terlebih dahulu!");
      return;
    }
    window.print();
  };

  // Filter mapel per kelompok (A, B, C)
  const mapelA = leggerData.mapel.filter(m => m.kelompok === "A");
  const mapelB = leggerData.mapel.filter(m => m.kelompok === "B");
  const mapelC = leggerData.mapel.filter(m => m.kelompok === "C");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl no-print flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            {/* Student Selector */}
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Pilih Siswa ({config.nama_madrasah}):
              </label>
              <select
                value={selectedNis}
                onChange={e => setSelectedNis(e.target.value)}
                className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Siswa Kelas {kelas} --</option>
                {leggerData.siswa.map(s => (
                  <option key={s.nis} value={s.nis}>
                    {s.nis} - {s.nama} (Ranking {s.ranking})
                  </option>
                ))}
              </select>
            </div>

            {/* Tab: Lembar Rapor vs Cover */}
            <div className="flex items-center bg-slate-200 p-0.5 rounded-lg mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("rapor")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === "rapor" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1" />
                Lembar Nilai
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cover")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === "cover" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                Cover Rapor
              </button>
            </div>

            {/* Upload TTD Wali Kelas */}
            <div className="w-48">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                TTD Wali Kelas:
              </label>
              <label className="flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition text-slate-600 bg-white">
                <Upload className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>{ttdBase64 ? "Ganti TTD" : "Upload TTD"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTtdUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!selectedNis}
              className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm disabled:opacity-40"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Cetak {activeTab === "rapor" ? "Rapor" : "Cover"} (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Sheet (A4 Portrait Container) */}
        <div className="p-6 overflow-auto flex-1 custom-scrollbar bg-slate-100 flex justify-center">
          {!currentSiswa ? (
            <div className="m-auto text-center py-16 text-slate-500 bg-white p-8 rounded-xl border border-slate-200 max-w-md">
              <p className="font-semibold text-sm text-slate-700 mb-1">Pilih Siswa Terlebih Dahulu</p>
              <p className="text-xs">Silakan pilih nama siswa dari dropdown di atas untuk melihat preview lembar cetak.</p>
            </div>
          ) : activeTab === "cover" ? (
            /* ================= COVER RAPOR RESMI MADRASAH ================= */
            <div className="rapor-print-container bg-white shadow-xl border border-slate-300 p-12 w-full max-w-[210mm] min-h-[297mm] flex flex-col justify-between text-center text-slate-900 leading-normal">
              <div className="pt-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-emerald-800 flex items-center justify-center font-black text-xl text-emerald-900 bg-emerald-50">
                  {config.jenjang}
                </div>
                <h2 className="text-lg font-bold tracking-widest text-slate-700 uppercase">
                  REPUBLIK INDONESIA
                </h2>
                <h1 className="text-2xl font-black tracking-wider text-emerald-950 uppercase mt-2">
                  RAPOR HASIL BELAJAR
                </h1>
                <p className="text-sm font-bold tracking-widest text-slate-600 uppercase mt-1">
                  {config.jenjang === "MTs" ? "MADRASAH TSANAWIYAH (MTs)" : "MADRASAH ALIYAH (MA)"}
                </p>
              </div>

              <div className="py-8 my-auto border-y-2 border-emerald-800/40 max-w-md mx-auto w-full space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Nama Peserta Didik:</p>
                  <p className="text-base font-extrabold text-slate-900 uppercase tracking-wide mt-0.5">
                    {currentSiswa.nama}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">NIS / NISN:</p>
                  <p className="text-sm font-mono font-bold text-slate-800">
                    {currentSiswa.nis}
                  </p>
                </div>
              </div>

              <div className="pb-8 space-y-1">
                <h3 className="text-base font-extrabold uppercase text-emerald-900">
                  {config.nama_madrasah}
                </h3>
                <p className="text-xs font-semibold text-slate-700">
                  NSM: {config.nsm} | NPSN: {config.npsn}
                </p>
                <p className="text-[11px] text-slate-600">
                  {config.alamat}, Kab. {config.kabupaten}, Jawa Timur
                </p>
                <p className="text-xs font-bold text-slate-800 pt-4 uppercase tracking-widest">
                  KEMENTERIAN AGAMA REPUBLIK INDONESIA
                </p>
              </div>
            </div>
          ) : (
            /* ================= LEMBAR NILAI RAPOR ================= */
            <div className="rapor-print-container bg-white shadow-xl border border-slate-300 p-8 w-full max-w-[210mm] text-slate-900 leading-normal">
              {/* Kop Madrasah Resmi */}
              <KopMadrasah config={config} />

              <div className="text-center mb-3">
                <h4 className="text-xs font-black tracking-wider uppercase border-b-2 border-slate-900 inline-block pb-0.5">
                  LAPORAN CAPAIAN HASIL BELAJAR PESERTA DIDIK
                </h4>
                <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                  Semester {semester === "1" ? "Gasal (1)" : "Genap (2)"} Tahun Ajaran {tahun}
                </p>
              </div>

              {/* Data Identitas Siswa */}
              <div className="grid grid-cols-2 gap-x-6 text-[10px] mb-3 pb-2 border-b border-slate-300">
                <div className="space-y-0.5">
                  <div className="flex">
                    <span className="w-24 font-semibold text-slate-600">Nama Siswa</span>
                    <span className="font-bold text-slate-900">: {currentSiswa.nama}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-semibold text-slate-600">NIS / NISN</span>
                    <span className="font-mono text-slate-900">: {currentSiswa.nis}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-semibold text-slate-600">Madrasah</span>
                    <span className="text-slate-900">: {config.nama_madrasah}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex">
                    <span className="w-24 font-semibold text-slate-600">Kelas</span>
                    <span className="font-bold text-slate-900">: {kelas}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-semibold text-slate-600">Fase / Jenjang</span>
                    <span className="text-slate-900">: {config.jenjang}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-semibold text-slate-600">Peringkat Kelas</span>
                    <span className="font-bold text-emerald-800">: Ke-{currentSiswa.ranking} dari {leggerData.siswa.length} Siswa</span>
                  </div>
                </div>
              </div>

              {/* A. Capaian Intrakurikuler Berkelompok */}
              <div className="mb-3">
                <h5 className="text-[10px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
                  A. Capaian Hasil Belajar (Intrakurikuler)
                </h5>
                <table className="w-full text-[9px] border border-slate-800 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-800 text-center font-bold">
                      <th rowSpan={2} className="border border-slate-800 py-1 px-1 w-6">No</th>
                      <th rowSpan={2} className="border border-slate-800 py-1 px-2 text-left">Mata Pelajaran</th>
                      <th rowSpan={2} className="border border-slate-800 py-1 px-1 w-8">KKM</th>
                      <th colSpan={3} className="border border-slate-800 py-0.5 px-1">Nilai Capaian</th>
                      <th rowSpan={2} className="border border-slate-800 py-1 px-1 w-8 bg-purple-50 text-purple-900">NA</th>
                      <th rowSpan={2} className="border border-slate-800 py-1 px-1 w-8 bg-purple-50 text-purple-900">Pred</th>
                      <th rowSpan={2} className="border border-slate-800 py-1 px-2 min-w-[180px] text-left">Capaian Kompetensi / Materi</th>
                    </tr>
                    <tr className="bg-slate-50 text-slate-800 border-b border-slate-800 text-center font-bold">
                      <th className="border border-slate-800 py-0.5 px-0.5 w-7">LM</th>
                      <th className="border border-slate-800 py-0.5 px-0.5 w-7">STS</th>
                      <th className="border border-slate-800 py-0.5 px-0.5 w-7">SAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Kelompok A: PAI & B. Arab */}
                    {mapelA.length > 0 && (
                      <tr className="bg-emerald-50/60 font-bold text-emerald-950">
                        <td colSpan={9} className="border border-slate-800 py-0.5 px-2 text-left">
                          Kelompok A (Pendidikan Agama Islam & Bahasa Arab)
                        </td>
                      </tr>
                    )}
                    {mapelA.map((m, idx) => {
                      const detail = currentSiswa.mapelDetails[m.kode_mapel] || { lm: 0, sts: 0, sas: 0, lingkup_materi: "-", nilai_akhir: 0, predikat: "C" };
                      return (
                        <tr key={m.kode_mapel} className="border-b border-slate-700">
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-mono">{idx + 1}</td>
                          <td className="border border-slate-800 py-0.5 px-2 font-medium">{m.nama_mapel}</td>
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-mono text-slate-600">{m.kkm}</td>
                          <td className="border border-slate-800 py-0.5 px-0.5 text-center font-mono">{detail.lm || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-0.5 text-center font-mono">{detail.sts || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-0.5 text-center font-mono">{detail.sas || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-mono font-bold bg-purple-50/20">{detail.nilai_akhir || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-bold bg-purple-50/20">{detail.predikat}</td>
                          <td className="border border-slate-800 py-0.5 px-2 text-left text-[8px] text-slate-700">{detail.lingkup_materi}</td>
                        </tr>
                      );
                    })}

                    {/* Kelompok B: Umum */}
                    {mapelB.length > 0 && (
                      <tr className="bg-emerald-50/60 font-bold text-emerald-950">
                        <td colSpan={9} className="border border-slate-800 py-0.5 px-2 text-left">
                          Kelompok B (Umum)
                        </td>
                      </tr>
                    )}
                    {mapelB.map((m, idx) => {
                      const detail = currentSiswa.mapelDetails[m.kode_mapel] || { lm: 0, sts: 0, sas: 0, lingkup_materi: "-", nilai_akhir: 0, predikat: "C" };
                      return (
                        <tr key={m.kode_mapel} className="border-b border-slate-700">
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-mono">{idx + 1}</td>
                          <td className="border border-slate-800 py-0.5 px-2 font-medium">{m.nama_mapel}</td>
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-mono text-slate-600">{m.kkm}</td>
                          <td className="border border-slate-800 py-0.5 px-0.5 text-center font-mono">{detail.lm || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-0.5 text-center font-mono">{detail.sts || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-0.5 text-center font-mono">{detail.sas || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-mono font-bold bg-purple-50/20">{detail.nilai_akhir || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-bold bg-purple-50/20">{detail.predikat}</td>
                          <td className="border border-slate-800 py-0.5 px-2 text-left text-[8px] text-slate-700">{detail.lingkup_materi}</td>
                        </tr>
                      );
                    })}

                    {/* Kelompok C: Mulok / Peminatan */}
                    {mapelC.length > 0 && (
                      <tr className="bg-emerald-50/60 font-bold text-emerald-950">
                        <td colSpan={9} className="border border-slate-800 py-0.5 px-2 text-left">
                          Kelompok C ({config.jenjang === "MTs" ? "Muatan Lokal" : "Peminatan & Muatan Lokal"})
                        </td>
                      </tr>
                    )}
                    {mapelC.map((m, idx) => {
                      const detail = currentSiswa.mapelDetails[m.kode_mapel] || { lm: 0, sts: 0, sas: 0, lingkup_materi: "-", nilai_akhir: 0, predikat: "C" };
                      return (
                        <tr key={m.kode_mapel} className="border-b border-slate-700">
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-mono">{idx + 1}</td>
                          <td className="border border-slate-800 py-0.5 px-2 font-medium">{m.nama_mapel}</td>
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-mono text-slate-600">{m.kkm}</td>
                          <td className="border border-slate-800 py-0.5 px-0.5 text-center font-mono">{detail.lm || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-0.5 text-center font-mono">{detail.sts || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-0.5 text-center font-mono">{detail.sas || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-mono font-bold bg-purple-50/20">{detail.nilai_akhir || "-"}</td>
                          <td className="border border-slate-800 py-0.5 px-1 text-center font-bold bg-purple-50/20">{detail.predikat}</td>
                          <td className="border border-slate-800 py-0.5 px-2 text-left text-[8px] text-slate-700">{detail.lingkup_materi}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* B. Ekstrakurikuler & C. Presensi (2 Kolom Sejajar) */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Ekstrakurikuler */}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
                    B. Kegiatan Ekstrakurikuler
                  </h5>
                  <table className="w-full text-[9px] border border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-800 text-center font-bold">
                        <th className="border border-slate-800 py-0.5 px-1 w-6">No</th>
                        <th className="border border-slate-800 py-0.5 px-2 text-left">Ekstrakurikuler</th>
                        <th className="border border-slate-800 py-0.5 px-1 w-14">Predikat</th>
                        <th className="border border-slate-800 py-0.5 px-2 text-left">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSiswa.ekskul && currentSiswa.ekskul.length > 0 ? (
                        currentSiswa.ekskul.map((e, idx) => (
                          <tr key={idx} className="border-b border-slate-700">
                            <td className="border border-slate-800 py-0.5 px-1 text-center font-mono">{idx + 1}</td>
                            <td className="border border-slate-800 py-0.5 px-2 font-medium">{e.nama}</td>
                            <td className="border border-slate-800 py-0.5 px-1 text-center font-semibold">{e.nilai}</td>
                            <td className="border border-slate-800 py-0.5 px-2 text-[8px]">{e.materi}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="border border-slate-800 py-1 text-center text-slate-400 italic">
                            Belum ada catatan ekstrakurikuler
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Presensi */}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
                    C. Ketidakhadiran
                  </h5>
                  <table className="w-full text-[9px] border border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-800 font-bold">
                        <th className="border border-slate-800 py-0.5 px-2 text-left">Keterangan</th>
                        <th className="border border-slate-800 py-0.5 px-2 text-center w-12">Jumlah</th>
                        <th className="border border-slate-800 py-0.5 px-2 text-center w-12">Satuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-800 py-0.5 px-2">Sakit (S)</td>
                        <td className="border border-slate-800 py-0.5 px-2 text-center font-mono">{currentSiswa.sakit || 0}</td>
                        <td className="border border-slate-800 py-0.5 px-2 text-center">Hari</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 py-0.5 px-2">Izin (I)</td>
                        <td className="border border-slate-800 py-0.5 px-2 text-center font-mono">{currentSiswa.izin || 0}</td>
                        <td className="border border-slate-800 py-0.5 px-2 text-center">Hari</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 py-0.5 px-2">Tanpa Keterangan (A)</td>
                        <td className="border border-slate-800 py-0.5 px-2 text-center font-mono text-rose-600 font-bold">{currentSiswa.alpha || 0}</td>
                        <td className="border border-slate-800 py-0.5 px-2 text-center">Hari</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* D. Catatan Wali Kelas & Keputusan */}
              <div className="mb-4">
                <h5 className="text-[10px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
                  D. Catatan Perkembangan Karakter & Evaluasi Belajar
                </h5>
                <div className="border border-slate-800 p-2 min-h-[36px] text-[9px] text-slate-800 bg-white">
                  {currentSiswa.catatan || "Ananda menunjukkan ketekunan dan kesopanan yang baik. Pertahankan prestasi dan tingkatkan semangat belajar."}
                </div>
              </div>

              {/* Tanda Tangan Tiga Pihak */}
              <div className="grid grid-cols-3 text-center text-[10px] text-slate-900 signature-block mt-4">
                <div>
                  <p className="mb-12">Mengetahui,<br /><strong>Orang Tua / Wali</strong></p>
                  <p className="font-bold underline uppercase">(....................................)</p>
                </div>
                <div>
                  <p className="mb-12">Mengetahui,<br /><strong>Kepala Madrasah</strong></p>
                  <p className="font-bold underline uppercase">{config.kepala_madrasah}</p>
                  <p className="text-[9px] text-slate-600">NIP: {config.nip_kepala}</p>
                </div>
                <div>
                  <p className="mb-1">
                    {config.kota_tanggal}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />
                    <strong>Wali Kelas {kelas}</strong>
                  </p>
                  <div className="h-10 flex items-center justify-center">
                    {ttdBase64 ? (
                      <img src={ttdBase64} alt="Tanda Tangan" className="max-h-10 max-w-[100px] object-contain" />
                    ) : (
                      <div className="h-10"></div>
                    )}
                  </div>
                  <p className="font-bold underline uppercase">
                    {currentUser?.nama_user || "Wali Kelas"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
