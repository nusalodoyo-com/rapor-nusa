"use client";

import React, { useState } from "react";
import { LeggerResponse, SchoolConfig, User } from "@/types";
import { Printer, X, Upload, BookOpen, FileText, Heart } from "lucide-react";
import KopMadrasah from "./KopMadrasah";
import { getNilaiP5RA } from "@/lib/storage";

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
  const [activeTab, setActiveTab] = useState<"rapor" | "cover" | "p5ra">("rapor");
  const [ttdBase64, setTtdBase64] = useState<string>(currentUser?.ttd_url || "");

  if (!isOpen || !leggerData || !leggerData.success) return null;

  const currentSiswa = leggerData.siswa.find(s => s.nis === selectedNis);

  // Ambil data P5RA jika ada
  const p5List = getNilaiP5RA(config.id, kelas);
  const currentP5 = currentSiswa ? p5List.find(p => p.nis === currentSiswa.nis) : null;

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

            {/* Tab: Lembar Rapor vs Cover vs P5RA */}
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
                onClick={() => setActiveTab("p5ra")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === "p5ra" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Heart className="w-3.5 h-3.5 inline mr-1 text-rose-500" />
                Rapor P5RA (KBC)
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
              Cetak {activeTab === "rapor" ? "Rapor Nilai" : activeTab === "p5ra" ? "Rapor P5RA" : "Cover"} (A4)
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
                <div className="w-28 h-28 mx-auto mb-6 p-2 rounded-2xl border-4 border-[#00ab00] bg-white shadow-lg flex items-center justify-center">
                  <img src="/logo.png" alt="Logo Madrasah" className="w-full h-full object-contain" />
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
          ) : activeTab === "p5ra" ? (
            /* ================= RAPOR KOKURIKULER P5RA (KBC - KMA 1503/2025) ================= */
            <div className="rapor-print-container bg-white shadow-xl border border-slate-300 p-8 w-full max-w-[210mm] min-h-[297mm] text-slate-900 leading-normal flex flex-col justify-between">
              <div>
                <KopMadrasah config={config} />

                <div className="text-center my-3 border-b-2 border-slate-900 pb-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">
                    LAPORAN HASIL KOKURIKULER P5RA & KURIKULUM BERBASIS CINTA (KBC)
                  </h4>
                  <p className="text-[10px] text-slate-600 font-medium">
                    Standar Keputusan Menteri Agama (KMA) Nomor 1503 Tahun 2025
                  </p>
                </div>

                {/* Identitas Siswa */}
                <div className="grid grid-cols-2 text-[10px] text-slate-800 mb-3 bg-slate-50 p-2 border border-slate-200 rounded">
                  <div className="space-y-0.5">
                    <p>Nama Peserta Didik : <strong>{currentSiswa.nama}</strong></p>
                    <p>NIS / NISN : <strong>{currentSiswa.nis}</strong></p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p>Kelas / Fase : <strong>{kelas} / {config.jenjang === "MTs" ? "Fase D" : "Fase E/F"}</strong></p>
                    <p>Semester / Tahun : <strong>{semester === "1" ? "Gasal" : "Genap"} / {tahun}</strong></p>
                  </div>
                </div>

                {/* Tema & Dimensi Panca Cinta */}
                <div className="mb-4 space-y-3">
                  <div className="border border-slate-800 p-2.5 rounded bg-white">
                    <span className="text-[10px] font-bold uppercase text-slate-700 block mb-0.5">Tema Projek Penguatan Profil:</span>
                    <p className="text-xs font-black text-emerald-950">
                      {currentP5?.tema || "Kearifan Lokal, Lingkungan Hidup & Moderasi Beragama"}
                    </p>
                  </div>

                  <h5 className="text-[10px] font-bold uppercase tracking-wide text-slate-900">
                    Capaian Dimensi Panca Cinta (Kurikulum Berbasis Cinta):
                  </h5>

                  <table className="w-full text-[9px] border border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-800 font-bold text-center">
                        <th className="border border-slate-800 py-1 px-2 w-8">No</th>
                        <th className="border border-slate-800 py-1 px-3 text-left">Dimensi Panca Cinta</th>
                        <th className="border border-slate-800 py-1 px-2 w-16">Predikat</th>
                        <th className="border border-slate-800 py-1 px-3 text-left">Deskripsi Perkembangan Karakter Siswa</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-800 py-1 text-center font-mono">1</td>
                        <td className="border border-slate-800 py-1 px-3 font-bold">Cinta Allah dan Rasul-Nya</td>
                        <td className="border border-slate-800 py-1 text-center font-bold text-emerald-800">
                          {currentP5?.dimensi === "Cinta Allah & Rasul" ? currentP5.predikat : "BSB"}
                        </td>
                        <td className="border border-slate-800 py-1 px-3">
                          Selalu istiqomah menjalankan ibadah shalat berjamaah, bershalawat, dan mempraktikkan akhlaqul karimah.
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 py-1 text-center font-mono">2</td>
                        <td className="border border-slate-800 py-1 px-3 font-bold">Cinta Ilmu</td>
                        <td className="border border-slate-800 py-1 text-center font-bold text-emerald-800">
                          {currentP5?.dimensi === "Cinta Ilmu" ? currentP5.predikat : "BSH"}
                        </td>
                        <td className="border border-slate-800 py-1 px-3">
                          Memiliki rasa ingin tahu tinggi, gemar membaca literatur keilmuan, dan tekun dalam menyelesaikan tugas riset.
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 py-1 text-center font-mono">3</td>
                        <td className="border border-slate-800 py-1 px-3 font-bold">Cinta Lingkungan</td>
                        <td className="border border-slate-800 py-1 text-center font-bold text-emerald-800">
                          {currentP5?.dimensi === "Cinta Lingkungan" ? currentP5.predikat : "BSB"}
                        </td>
                        <td className="border border-slate-800 py-1 px-3">
                          {currentP5?.deskripsi || "Aktif menjaga kebersihan madrasah, memilah sampah, dan merawat tanaman lingkungan sekitar."}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 py-1 text-center font-mono">4</td>
                        <td className="border border-slate-800 py-1 px-3 font-bold">Cinta Sesama (Tasamuh & Ukhuwah)</td>
                        <td className="border border-slate-800 py-1 text-center font-bold text-emerald-800">
                          {currentP5?.dimensi === "Cinta Sesama" ? currentP5.predikat : "BSB"}
                        </td>
                        <td className="border border-slate-800 py-1 px-3">
                          Menghargai perbedaan pendapat, ramah, suka menolong sesama teman, serta menjauhi perilaku perundungan.
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-800 py-1 text-center font-mono">5</td>
                        <td className="border border-slate-800 py-1 px-3 font-bold">Cinta Tanah Air (Hubbul Wathan)</td>
                        <td className="border border-slate-800 py-1 text-center font-bold text-emerald-800">
                          {currentP5?.dimensi === "Cinta Tanah Air" ? currentP5.predikat : "BSB"}
                        </td>
                        <td className="border border-slate-800 py-1 px-3">
                          Bangga terhadap budaya bangsa, menaati aturan madrasah, serta mengamalkan nilai-nilai Ahlussunnah wal Jama&apos;ah.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[8px] text-slate-500 mb-6 italic">
                  * Keterangan Predikat: <strong>MB</strong> = Mulai Berkembang | <strong>BSh</strong> = Berkembang Sesuai Harapan | <strong>BSB</strong> = Berkembang Sangat Baik | <strong>SAB</strong> = Sangat Amat Berkembang
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-3 text-center text-[10px] text-slate-900 signature-block">
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
                    {config.kota_tanggal}, {config.tanggal_rapor || "20 Desember 2025"}<br />
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
          ) : (
            /* ================= LEMBAR NILAI RAPOR RESMI (INTRAKURIKULER) ================= */
            <div className="rapor-print-container bg-white shadow-xl border border-slate-300 p-8 w-full max-w-[210mm] min-h-[297mm] text-slate-900 leading-normal flex flex-col justify-between">
              <div>
                <KopMadrasah config={config} />

                {/* Sub Header Identitas Siswa */}
                <div className="grid grid-cols-2 text-[10px] text-slate-800 my-2 pb-2 border-b-2 border-slate-900">
                  <div className="space-y-0.5">
                    <p>Nama Peserta Didik : <strong>{currentSiswa.nama}</strong></p>
                    <p>NIS / NISN : <strong>{currentSiswa.nis}</strong></p>
                    <p>Madrasah : <strong>{config.nama_madrasah}</strong></p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p>Kelas / Fase : <strong>{kelas} / {config.jenjang === "MTs" ? "Fase D" : "Fase E/F"}</strong></p>
                    <p>Semester / Tahun : <strong>{semester === "1" ? "Gasal" : "Genap"} / {tahun}</strong></p>
                    <p>Peringkat Kelas : <strong>{currentSiswa.ranking} dari {leggerData.siswa.length} Siswa</strong></p>
                  </div>
                </div>

                {/* Judul Bagian Nilai */}
                <div className="text-center my-1.5">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">
                    LAPORAN HASIL PENCAPAIAN KOMPETENSI PESERTA DIDIK
                  </h4>
                  <p className="text-[9px] text-slate-500">
                    Kurikulum KMA Nomor 1503 Tahun 2025
                  </p>
                </div>

                {/* Tabel A: Mata Pelajaran Intrakurikuler */}
                <div className="mb-2">
                  <h5 className="text-[10px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
                    A. Mata Pelajaran
                  </h5>
                  <table className="w-full text-[9px] border border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-800 font-bold text-center">
                        <th className="border border-slate-800 py-1 px-1 w-6">No</th>
                        <th className="border border-slate-800 py-1 px-2 text-left">Mata Pelajaran</th>
                        <th className="border border-slate-800 py-1 px-1 w-8">KKM</th>
                        <th className="border border-slate-800 py-1 px-1 w-10">Nilai Akhir</th>
                        <th className="border border-slate-800 py-1 px-1 w-8">Pred</th>
                        <th className="border border-slate-800 py-1 px-2 text-left">Capaian Kompetensi / Catatan Guru</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Kelompok A */}
                      {mapelA.length > 0 && (
                        <>
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td colSpan={6} className="border border-slate-800 py-0.5 px-2 text-[9px]">
                              Kelompok A (Pendidikan Agama Islam & Bahasa Arab)
                            </td>
                          </tr>
                          {mapelA.map((m, idx) => {
                            const score = currentSiswa.scores[m.kode_mapel] || 0;
                            const pred = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
                            const det = currentSiswa.mapelDetails[m.kode_mapel];
                            return (
                              <tr key={m.kode_mapel} className="border-b border-slate-700">
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-mono">{idx + 1}</td>
                                <td className="border border-slate-800 py-0.5 px-2 font-medium">{m.nama_mapel}</td>
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-mono">{m.kkm || 75}</td>
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-bold font-mono">{score || "-"}</td>
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-semibold">{score ? pred : "-"}</td>
                                <td className="border border-slate-800 py-0.5 px-2 text-[8px] leading-tight">
                                  {score >= 80
                                    ? `Menunjukkan penguasaan sangat baik dalam capaian materi ${det?.lingkup_materi !== "-" ? det?.lingkup_materi : m.nama_mapel}.`
                                    : score >= 70
                                    ? `Mencapai ketuntasan kompetensi dalam ${m.nama_mapel}.`
                                    : `Perlu bimbingan dan peningkatan belajar dalam materi ${m.nama_mapel}.`}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}

                      {/* Kelompok B */}
                      {mapelB.length > 0 && (
                        <>
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td colSpan={6} className="border border-slate-800 py-0.5 px-2 text-[9px]">
                              Kelompok B (Mata Pelajaran Umum)
                            </td>
                          </tr>
                          {mapelB.map((m, idx) => {
                            const score = currentSiswa.scores[m.kode_mapel] || 0;
                            const pred = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
                            const det = currentSiswa.mapelDetails[m.kode_mapel];
                            return (
                              <tr key={m.kode_mapel} className="border-b border-slate-700">
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-mono">{idx + 1}</td>
                                <td className="border border-slate-800 py-0.5 px-2 font-medium">{m.nama_mapel}</td>
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-mono">{m.kkm || 75}</td>
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-bold font-mono">{score || "-"}</td>
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-semibold">{score ? pred : "-"}</td>
                                <td className="border border-slate-800 py-0.5 px-2 text-[8px] leading-tight">
                                  {score >= 80
                                    ? `Menunjukkan penguasaan sangat baik dalam capaian materi ${det?.lingkup_materi !== "-" ? det?.lingkup_materi : m.nama_mapel}.`
                                    : score >= 70
                                    ? `Mencapai ketuntasan kompetensi dalam ${m.nama_mapel}.`
                                    : `Perlu bimbingan dan peningkatan belajar dalam materi ${m.nama_mapel}.`}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}

                      {/* Kelompok C */}
                      {mapelC.length > 0 && (
                        <>
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td colSpan={6} className="border border-slate-800 py-0.5 px-2 text-[9px]">
                              Kelompok C (Muatan Lokal / Pilihan / Koding & AI KMA 1503)
                            </td>
                          </tr>
                          {mapelC.map((m, idx) => {
                            const score = currentSiswa.scores[m.kode_mapel] || 0;
                            const pred = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
                            const det = currentSiswa.mapelDetails[m.kode_mapel];
                            return (
                              <tr key={m.kode_mapel} className="border-b border-slate-700">
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-mono">{idx + 1}</td>
                                <td className="border border-slate-800 py-0.5 px-2 font-medium">{m.nama_mapel}</td>
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-mono">{m.kkm || 75}</td>
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-bold font-mono">{score || "-"}</td>
                                <td className="border border-slate-800 py-0.5 px-1 text-center font-semibold">{score ? pred : "-"}</td>
                                <td className="border border-slate-800 py-0.5 px-2 text-[8px] leading-tight">
                                  {score >= 80
                                    ? `Menunjukkan penguasaan sangat baik dalam capaian materi ${det?.lingkup_materi !== "-" ? det?.lingkup_materi : m.nama_mapel}.`
                                    : score >= 70
                                    ? `Mencapai ketuntasan kompetensi dalam ${m.nama_mapel}.`
                                    : `Perlu bimbingan dan peningkatan belajar dalam materi ${m.nama_mapel}.`}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* B. Ekstrakurikuler & C. Presensi (2 Kolom Sejajar) */}
                <div className="grid grid-cols-2 gap-3 mb-2">
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
                <div className="mb-3">
                  <h5 className="text-[10px] font-bold text-slate-900 mb-1 uppercase tracking-wide">
                    D. Catatan Perkembangan Karakter & Evaluasi Belajar
                  </h5>
                  <div className="border border-slate-800 p-2 min-h-[32px] text-[9px] text-slate-800 bg-white">
                    {currentSiswa.catatan || "Ananda menunjukkan ketekunan dan kesopanan yang baik. Pertahankan prestasi dan tingkatkan semangat belajar."}
                  </div>
                </div>
              </div>

              {/* Tanda Tangan Tiga Pihak */}
              <div className="grid grid-cols-3 text-center text-[10px] text-slate-900 signature-block">
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
                    {config.kota_tanggal}, {config.tanggal_rapor || "20 Desember 2025"}<br />
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
