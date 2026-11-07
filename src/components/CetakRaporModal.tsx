"use client";

import React, { useState, useEffect } from "react";
import { LeggerResponse, SchoolConfig, User } from "@/types";
import { Printer, X, Upload, BookOpen, FileText, Heart, Shield } from "lucide-react";
import KopMadrasah from "./KopMadrasah";
import RaporMtsTemplate from "./rapor/RaporMtsTemplate";
import RaporMaTemplate from "./rapor/RaporMaTemplate";
import { getNilaiP5RA, saveUserTtd } from "@/lib/storage";

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

  // Auto select siswa pertama jika belum ada yang terpilih
  useEffect(() => {
    if (leggerData && leggerData.siswa.length > 0 && !selectedNis) {
      setSelectedNis(leggerData.siswa[0].nis);
    }
  }, [leggerData, selectedNis]);

  if (!isOpen || !leggerData || !leggerData.success) return null;

  const currentSiswa = leggerData.siswa.find(s => s.nis === selectedNis) || leggerData.siswa[0];
  const totalSiswa = leggerData.siswa.length;

  // Nama file otomatis untuk download PDF / Save as PDF
  const semLabel = semester === "1" ? "Gasal" : "Genap";
  const cleanTahun = tahun.replace("/", "-");
  const autoFileName = currentSiswa
    ? `${currentSiswa.nama}_Kelas ${kelas}_${semLabel}_${cleanTahun}`
    : `Rapor Tengah Semester_Kelas ${kelas}_${semLabel}_${cleanTahun}`;

  // Ambil data P5RA jika ada
  const p5List = getNilaiP5RA(config.id, kelas);
  const currentP5 = currentSiswa ? p5List.find(p => p.nis === currentSiswa.nis) : null;

  const handleTtdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        const base64 = String(ev.target.result);
        setTtdBase64(base64);
        if (currentUser) {
          saveUserTtd(config.id, currentUser.id, base64);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Cetak & Unduh PDF Otomatis (ReLaXed Single Page A4 Standard)
  const handlePrint = () => {
    if (!currentSiswa) {
      alert("Pilih siswa terlebih dahulu!");
      return;
    }

    const originalTitle = document.title;
    // Set document.title agar dialog cetak / Save as PDF browser otomatis menamai file dengan nama siswa
    document.title = autoFileName;

    window.print();

    // Kembalikan document.title setelah selesai mencetak
    setTimeout(() => {
      document.title = originalTitle;
    }, 1200);
  };

  const isMts = config.id === "mts";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="card-retro-lg bg-white border-3 border-retro-border shadow-retro-xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="p-3 sm:p-4 border-b-2 border-retro-border bg-retro-cream no-print flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Student Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                Pilih Siswa ({config.jenjang}):
              </label>
              <select
                value={selectedNis}
                onChange={e => setSelectedNis(e.target.value)}
                className="w-full text-xs py-1.5 px-3 rounded-lg border-2 border-retro-border bg-white font-black text-retro-black shadow-retro-sm"
              >
                {leggerData.siswa.map((s, idx) => (
                  <option key={s.nis} value={s.nis}>
                    {idx + 1}. {s.nama} (NIS: {s.nis}) — Ranking {s.ranking}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab Nav: Lembar Rapor Tengah Semester vs Cover vs P5RA */}
            <div className="flex items-center gap-1.5 mt-2 sm:mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("rapor")}
                className={activeTab === "rapor" ? "btn-retro-primary px-3 py-1.5 text-xs flex items-center gap-1" : "btn-retro-white px-3 py-1.5 text-xs flex items-center gap-1"}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Rapor {config.jenjang} (1 Lembar A4)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("cover")}
                className={activeTab === "cover" ? "btn-retro-yellow px-3 py-1.5 text-xs flex items-center gap-1" : "btn-retro-white px-3 py-1.5 text-xs flex items-center gap-1"}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Cover</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("p5ra")}
                className={activeTab === "p5ra" ? "btn-retro bg-red-600 text-white px-3 py-1.5 text-xs flex items-center gap-1" : "btn-retro-white px-3 py-1.5 text-xs flex items-center gap-1"}
              >
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>P5RA</span>
              </button>
            </div>

            {/* Upload TTD Wali Kelas */}
            <div className="w-36 sm:w-44 mt-2 sm:mt-4">
              <label className="flex items-center justify-center px-3 py-1.5 text-xs font-black rounded-lg border-2 border-dashed border-retro-border bg-white hover:bg-brand-50 cursor-pointer shadow-retro-sm transition text-retro-black">
                <Upload className="w-3.5 h-3.5 mr-1 text-brand-600" />
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

          {/* Action Buttons: Cetak / Simpan PDF Otomatis */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col text-right mr-1">
              <span className="text-[10px] font-black text-slate-500 uppercase">File Otomatis:</span>
              <span className="text-[11px] font-mono font-bold text-brand-800 truncate max-w-[220px]">
                {autoFileName}.pdf
              </span>
            </div>

            <button
              onClick={handlePrint}
              disabled={!currentSiswa}
              title={`Simpan PDF 1 Halaman: ${autoFileName}.pdf`}
              className="btn-retro-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-retro-sm active:translate-x-0.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak 1 Halaman A4</span>
            </button>

            <button
              onClick={onClose}
              className="btn-retro bg-retro-orange text-white p-2"
              title="Tutup Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Printable Sheet (A4 Portrait Container Berbasis ReLaXed) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/90 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          {activeTab === "cover" ? (
            /* ================= COVER RAPOR MADRASAH ================= */
            <div className="rapor-print-container bg-white shadow-xl border border-slate-300 p-12 w-full max-w-[210mm] min-h-[297mm] flex flex-col justify-between text-center text-slate-900 leading-normal">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-800">
                  RAPOR TENGAH SEMESTER
                </h2>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mt-1">
                  MADRASAH {config.jenjang.toUpperCase()}
                </h3>
                <div className="w-24 h-1 bg-brand-600 mx-auto my-4"></div>
              </div>

              <div className="my-8 flex justify-center">
                <div className="w-36 h-36 border-4 border-[#006e14] p-3 rounded-2xl bg-white shadow-md flex items-center justify-center">
                  <img
                    src={isMts ? "/logo-mts.png" : "/logo-ma.png"}
                    alt={isMts ? "Logo MTs Ma'arif NU 2 Sutojayan" : "Logo MA Ma'arif Nurus Salam"}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-4 max-w-md mx-auto my-6 text-left border-2 border-slate-800 p-6 rounded-lg bg-slate-50/50">
                <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-600 mb-2 border-b border-slate-300 pb-2">
                  Identitas Peserta Didik
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block font-semibold">Nama Siswa:</label>
                  <p className="text-sm font-black uppercase text-slate-900 border-b border-dotted border-slate-400 pb-1">
                    {currentSiswa.nama}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase block font-semibold">NIS:</label>
                    <p className="text-xs font-mono font-bold text-slate-900 border-b border-dotted border-slate-400 pb-1">
                      {currentSiswa.nis}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase block font-semibold">NISN:</label>
                    <p className="text-xs font-mono font-bold text-slate-900 border-b border-dotted border-slate-400 pb-1">
                      {currentSiswa.nisn || "-"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block font-semibold">Rombongan Belajar (Kelas):</label>
                  <p className="text-xs font-bold text-slate-900 border-b border-dotted border-slate-400 pb-1">
                    Kelas {kelas}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-center pt-8">
                <h3 className="text-base font-black uppercase text-slate-900 tracking-wide">
                  {config.nama_madrasah}
                </h3>
                <p className="text-xs font-semibold text-slate-700">
                  NSM: {config.nsm} | NPSN: {config.npsn}
                </p>
                <p className="text-[11px] text-slate-600">
                  {config.alamat}, Kab. {config.kabupaten}, Jawa Timur
                </p>
                <p className="text-xs font-bold text-slate-800 pt-4 uppercase tracking-widest">
                  LEMBAGA PENDIDIKAN MA&apos;ARIF NU
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
                    <p>NIS / NISN : <strong>{currentSiswa.nis} / {currentSiswa.nisn || "-"}</strong></p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p>Kelas / Fase : <strong>{kelas} / {isMts ? "Fase D" : "Fase E/F"}</strong></p>
                    <p>Semester / Tahun : <strong>{semLabel} / {cleanTahun}</strong></p>
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
                  <p className="font-bold underline uppercase">
                    {currentSiswa.nama_ortu || "(....................................)"}
                  </p>
                </div>
                <div className="relative">
                  <p className="mb-1">Mengetahui,<br /><strong>Kepala Madrasah</strong></p>
                  <div className="relative h-14 flex items-center justify-center my-0.5">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 rotate-[-12deg] z-0">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-800 flex flex-col items-center justify-center text-[6px] font-black text-emerald-900 leading-none p-1 text-center bg-emerald-100/30">
                        <span>MADRASAH</span>
                        <span className="my-0.5 text-[7px] text-amber-700">★ RESMI ★</span>
                        <span>{isMts ? "MTs MA'ARIF NU 2" : "MA NURUS SALAM"}</span>
                      </div>
                    </div>
                    <div className="relative z-10 font-serif text-slate-800 italic text-lg font-bold tracking-widest select-none rotate-[-4deg]">
                      {isMts ? "Ulil Amin" : "M. Zen Pamuji"}
                    </div>
                  </div>
                  <p className="font-bold underline uppercase relative z-10">
                    {isMts ? "Ahmad Ulil Amin, Lc., M.S.I." : "M. Zen Pamuji, S.Pd."}
                  </p>
                  <p className="text-[9px] text-slate-600 relative z-10">NIP: {config.nip_kepala || "-"}</p>
                </div>
                <div>
                  <p className="mb-1">
                    {config.kota_tanggal || "Blitar"}, {config.tanggal_rapor || "24 Oktober 2026"}<br />
                    <strong>Wali Kelas {kelas}</strong>
                  </p>
                  <div className="h-14 flex items-center justify-center">
                    {ttdBase64 ? (
                      <img src={ttdBase64} alt="Tanda Tangan" className="max-h-12 max-w-[120px] object-contain" />
                    ) : (
                      <div className="h-12"></div>
                    )}
                  </div>
                  <p className="font-bold underline uppercase">
                    {currentUser?.nama_user || "Wali Kelas"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ================= TEMPLATE TERPISAH: RAPOR MTS ATAU RAPOR MA (1 LEMBAR A4) ================= */
            <div className="flex justify-center w-full">
              {isMts ? (
                <RaporMtsTemplate
                  siswa={currentSiswa}
                  kelas={kelas}
                  semester={semester}
                  tahun={tahun}
                  config={config}
                  allMapel={leggerData.mapel}
                  totalSiswa={totalSiswa}
                  waliNama={currentUser?.nama_user}
                  waliNip={currentUser?.nip}
                  ttdBase64={ttdBase64}
                />
              ) : (
                <RaporMaTemplate
                  siswa={currentSiswa}
                  kelas={kelas}
                  semester={semester}
                  tahun={tahun}
                  config={config}
                  allMapel={leggerData.mapel}
                  totalSiswa={totalSiswa}
                  waliNama={currentUser?.nama_user}
                  waliNip={currentUser?.nip}
                  ttdBase64={ttdBase64}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
