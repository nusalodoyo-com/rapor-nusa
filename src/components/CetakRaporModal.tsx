"use client";

import React, { useState, useEffect } from "react";
import { LeggerResponse, SchoolConfig, User, Mapel } from "@/types";
import { Printer, X, Upload, BookOpen, FileText, Heart, CheckCircle2, Download } from "lucide-react";
import KopMadrasah from "./KopMadrasah";
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

  // Cetak & Unduh PDF Otomatis dengan nama file sesuai Nama Siswa, Kelas & Semester
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

  // Pengelompokan Mapel Sesuai Template Rapor Tengah Semester Resmi
  // Kelompok PAI
  const isPai = (m: Mapel) => {
    const k = (m.kode_mapel || "").toUpperCase();
    return k === "QH" || k === "AA" || k === "FIK" || k === "SKI" ||
      m.nama_mapel.toLowerCase().includes("qur'an") ||
      m.nama_mapel.toLowerCase().includes("akidah") ||
      m.nama_mapel.toLowerCase().includes("fikih") ||
      m.nama_mapel.toLowerCase().includes("sejarah kebudayaan");
  };

  const paiMapel = leggerData.mapel.filter(isPai);
  
  // Kelompok A (Non PAI)
  const mapelANonPai = leggerData.mapel.filter(m => {
    if (isPai(m)) return false;
    const k = (m.kode_mapel || "").toUpperCase();
    const n = m.nama_mapel.toLowerCase();
    return (
      m.kelompok === "A" ||
      k === "PPKN" || k === "PKN" || n.includes("pancasila") || n.includes("kewarganegaraan") ||
      k === "BINDO" || n.includes("indonesia") ||
      k === "BARAB" || n.includes("arab") ||
      k === "MTK" || n.includes("matematika") ||
      k === "IPA" || n.includes("alam") ||
      k === "IPS" || n.includes("sosial") ||
      k === "BING" || n.includes("inggris")
    );
  });

  // Kelompok B (Keterampilan, Seni, Olahraga, Mulok)
  const mapelB = leggerData.mapel.filter(m => {
    if (isPai(m)) return false;
    if (mapelANonPai.some(a => a.kode_mapel === m.kode_mapel)) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="card-retro-lg bg-white border-3 border-retro-border shadow-retro-xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="p-3.5 sm:p-4 border-b-2 border-retro-border bg-retro-cream no-print flex flex-wrap items-center justify-between gap-3">
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
                <span>Rapor Tengah Semester</span>
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
              <span className="text-[10px] font-black text-slate-500 uppercase">Nama File Otomatis:</span>
              <span className="text-[11px] font-mono font-bold text-brand-800 truncate max-w-[240px]">
                {autoFileName}.pdf
              </span>
            </div>

            <button
              onClick={handlePrint}
              disabled={!currentSiswa}
              title={`Simpan PDF dengan nama: ${autoFileName}.pdf`}
              className="btn-retro-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-retro-sm active:translate-x-0.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
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

        {/* Modal Printable Sheet (A4 Portrait Container) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80 flex justify-center print:p-0 print:bg-white print:overflow-visible">
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
                    src={config.id === "mts" ? "/logo-mts.png" : "/logo-ma.png"}
                    alt={config.id === "mts" ? "Logo MTs Ma'arif NU 2 Sutojayan" : "Logo MA Ma'arif Nurus Salam"}
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
                    <p>Kelas / Fase : <strong>{kelas} / {config.jenjang === "MTs" ? "Fase D" : "Fase E/F"}</strong></p>
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
                        <span>{config.id === "ma" ? "MA NURUS SALAM" : "MTs MA'ARIF NU 2"}</span>
                      </div>
                    </div>
                    <div className="relative z-10 font-serif text-slate-800 italic text-lg font-bold tracking-widest select-none rotate-[-4deg]">
                      {config.id === "ma" ? "M. Zen Pamuji" : "Ulil Amin"}
                    </div>
                  </div>
                  <p className="font-bold underline uppercase relative z-10">
                    {config.id === "ma" ? "M. Zen Pamuji, S.Pd." : (config.kepala_madrasah || "Ahmad Ulil Amin, Lc., M.S.I.")}
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
            /* ================= FORMAT RESMI: RAPOR TENGAH SEMESTER (PERSIS TEMPLATE PDF) ================= */
            <div className="rapor-print-container bg-white shadow-xl border border-slate-300 p-6 sm:p-8 w-full max-w-[210mm] min-h-[297mm] text-slate-900 leading-normal flex flex-col justify-between">
              <div>
                {/* 1. KOP MADRASAH RESMI */}
                <KopMadrasah config={config} />

                {/* 2. JUDUL DOKUMEN: RAPOR TENGAH SEMESTER */}
                <div className="text-center my-2">
                  <div className="border-t-2 border-b-2 border-slate-900 py-0.5 inline-block w-full">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      RAPOR TENGAH SEMESTER
                    </h3>
                  </div>
                </div>

                {/* 3. SUB HEADER IDENTITAS SISWA (2 KOLOM RAPI) */}
                <div className="grid grid-cols-2 text-[10px] text-slate-900 my-2 pb-1.5 border-b border-slate-900 leading-relaxed font-sans">
                  {/* Kolom Kiri */}
                  <div className="space-y-0.5">
                    <div className="grid grid-cols-12">
                      <span className="col-span-4">No. Absen</span>
                      <span className="col-span-1 text-center">:</span>
                      <span className="col-span-7 font-bold font-mono">
                        {currentSiswa.no_absen || leggerData.siswa.findIndex(s => s.nis === currentSiswa.nis) + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-4">No. Induk/NISN</span>
                      <span className="col-span-1 text-center">:</span>
                      <span className="col-span-7 font-bold font-mono">
                        {currentSiswa.nis} / {currentSiswa.nisn || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-4">Nama Siswa</span>
                      <span className="col-span-1 text-center">:</span>
                      <span className="col-span-7 font-black uppercase text-slate-950">
                        {currentSiswa.nama}
                      </span>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="space-y-0.5 pl-4">
                    <div className="grid grid-cols-12">
                      <span className="col-span-5">Kelas</span>
                      <span className="col-span-1 text-center">:</span>
                      <span className="col-span-6 font-bold">{kelas}</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-5">Semester</span>
                      <span className="col-span-1 text-center">:</span>
                      <span className="col-span-6 font-bold">{semLabel}</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-5">Tahun Pelajaran</span>
                      <span className="col-span-1 text-center">:</span>
                      <span className="col-span-6 font-bold font-mono">{cleanTahun}</span>
                    </div>
                  </div>
                </div>

                {/* 4. A. CAPAIAN PEMBELAJARAN (TABEL NILAI TENGAH SEMESTER) */}
                <div className="mb-2">
                  <h4 className="text-[10.5px] font-black text-slate-900 mb-1 uppercase tracking-wide">
                    A. CAPAIAN PEMBELAJARAN
                  </h4>

                  <table className="w-full text-[9px] border border-slate-900 border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold text-center">
                        <th className="border border-slate-900 py-1 px-1 w-7" rowSpan={2}>No</th>
                        <th className="border border-slate-900 py-1 px-2 text-left w-52" rowSpan={2}>Mata Pelajaran</th>
                        <th className="border border-slate-900 py-0.5 px-1 w-28 text-center" colSpan={3}>Capaian Nilai</th>
                        <th className="border border-slate-900 py-1 px-2 text-left" rowSpan={2}>Lingkup Materi</th>
                      </tr>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold text-center text-[8.5px]">
                        <th className="border border-slate-900 py-0.5 px-1 w-9">LM</th>
                        <th className="border border-slate-900 py-0.5 px-1 w-9">STS</th>
                        <th className="border border-slate-900 py-0.5 px-1 w-10">SAS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* ================= - Kelompok A ================= */}
                      <tr className="bg-slate-100/90 font-bold text-slate-900">
                        <td colSpan={6} className="border border-slate-900 py-0.5 px-2 text-[9px]">
                          - Kelompok A
                        </td>
                      </tr>

                      {/* 1. Pendidikan Agama Islam (PAI Group Header) */}
                      {paiMapel.length > 0 && (
                        <>
                          <tr>
                            <td className="border border-slate-900 py-0.5 text-center font-mono font-bold align-top" rowSpan={paiMapel.length + 1}>
                              1
                            </td>
                            <td colSpan={5} className="border border-slate-900 py-0.5 px-2 font-bold text-slate-900 bg-slate-50">
                              Pendidikan Agama Islam
                            </td>
                          </tr>
                          {paiMapel.map((m) => {
                            const det = currentSiswa.mapelDetails[m.kode_mapel];
                            const lmVal = det?.lm ? det.lm : (currentSiswa.scores[m.kode_mapel] || "-");
                            const stsVal = det?.sts ? det.sts : (currentSiswa.scores[m.kode_mapel] || "-");
                            const sasVal = det?.sas ? det.sas : "-"; // Tengah semester sas kosong/strip
                            return (
                              <tr key={m.kode_mapel} className="border-b border-slate-800">
                                <td className="border border-slate-900 py-0.5 px-2 pl-4 text-slate-800">
                                  {m.nama_mapel}
                                </td>
                                <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{lmVal}</td>
                                <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{stsVal}</td>
                                <td className="border border-slate-900 py-0.5 text-center font-mono text-slate-400">{sasVal}</td>
                                <td className="border border-slate-900 py-0.5 px-2 text-[8px] leading-tight text-slate-700">
                                  {det?.lingkup_materi && det.lingkup_materi !== "-"
                                    ? det.lingkup_materi
                                    : `Capaian materi standar kompetensi ${m.nama_mapel}`}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}

                      {/* Mapel Kelompok A Lainnya (PKn, B.Indo, B.Arab, MTK, IPA, IPS, B.Inggris) */}
                      {mapelANonPai.map((m, idx) => {
                        const det = currentSiswa.mapelDetails[m.kode_mapel];
                        const lmVal = det?.lm ? det.lm : (currentSiswa.scores[m.kode_mapel] || "-");
                        const stsVal = det?.sts ? det.sts : (currentSiswa.scores[m.kode_mapel] || "-");
                        const sasVal = det?.sas ? det.sas : "-";
                        const rowNum = (paiMapel.length > 0 ? 2 : 1) + idx;
                        return (
                          <tr key={m.kode_mapel} className="border-b border-slate-800">
                            <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{rowNum}</td>
                            <td className="border border-slate-900 py-0.5 px-2 text-slate-900 font-medium">{m.nama_mapel}</td>
                            <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{lmVal}</td>
                            <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{stsVal}</td>
                            <td className="border border-slate-900 py-0.5 text-center font-mono text-slate-400">{sasVal}</td>
                            <td className="border border-slate-900 py-0.5 px-2 text-[8px] leading-tight text-slate-700">
                              {det?.lingkup_materi && det.lingkup_materi !== "-"
                                ? det.lingkup_materi
                                : `Capaian materi pembelajaran kurikulum ${m.nama_mapel}`}
                            </td>
                          </tr>
                        );
                      })}

                      {/* ================= - Kelompok B ================= */}
                      <tr className="bg-slate-100/90 font-bold text-slate-900">
                        <td colSpan={6} className="border border-slate-900 py-0.5 px-2 text-[9px]">
                          - Kelompok B
                        </td>
                      </tr>

                      {mapelB.map((m, idx) => {
                        const det = currentSiswa.mapelDetails[m.kode_mapel];
                        const lmVal = det?.lm ? det.lm : (currentSiswa.scores[m.kode_mapel] || "-");
                        const stsVal = det?.sts ? det.sts : (currentSiswa.scores[m.kode_mapel] || "-");
                        const sasVal = det?.sas ? det.sas : "-";
                        return (
                          <tr key={m.kode_mapel} className="border-b border-slate-800">
                            <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{idx + 1}</td>
                            <td className="border border-slate-900 py-0.5 px-2 text-slate-900 font-medium">{m.nama_mapel}</td>
                            <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{lmVal}</td>
                            <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{stsVal}</td>
                            <td className="border border-slate-900 py-0.5 text-center font-mono text-slate-400">{sasVal}</td>
                            <td className="border border-slate-900 py-0.5 px-2 text-[8px] leading-tight text-slate-700">
                              {det?.lingkup_materi && det.lingkup_materi !== "-"
                                ? det.lingkup_materi
                                : `Materi kompetensi pembelajaran ${m.nama_mapel}`}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Baris RANGKING SISWA */}
                      <tr className="bg-slate-100 font-black border-t-2 border-slate-900">
                        <td colSpan={2} className="border border-slate-900 py-1 px-3 text-left uppercase text-[9.5px]">
                          RANGKING SISWA
                        </td>
                        <td colSpan={4} className="border border-slate-900 py-1 px-3 text-left font-mono text-[9.5px]">
                          <span className="font-bold">{currentSiswa.ranking}</span> &nbsp;&nbsp;Dari :&nbsp; <span className="font-bold">{totalSiswa}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Keterangan Footnote Sesuai Template */}
                  <div className="text-[7.5px] text-slate-600 mt-1 space-y-0.2 font-sans italic">
                    <p className="font-bold not-italic">Keterangan;</p>
                    <p>* Nilai Capaian yang tertera adalah nilai murni hasil tes/ujian</p>
                    <p>* LM = Lingkup Materi, (rerata nilai tiap lingkup materi), STS = Sumatif Tengah semester, SAS = Sumatif Akhir Semester</p>
                  </div>
                </div>

                {/* 5. B. KETIDAKHADIRAN */}
                <div className="mb-2">
                  <h4 className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-wide">
                    B. KETIDAKHADIRAN
                  </h4>
                  <table className="w-full max-w-sm text-[8.5px] border border-slate-900 border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold text-center">
                        <th className="border border-slate-900 py-0.5 px-1 w-8">No</th>
                        <th className="border border-slate-900 py-0.5 px-2 text-left">Keterangan</th>
                        <th className="border border-slate-900 py-0.5 px-2 w-14 text-center">JML</th>
                        <th className="border border-slate-900 py-0.5 px-2 w-16 text-center">Satuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-900 py-0.5 text-center font-mono">1</td>
                        <td className="border border-slate-900 py-0.5 px-2">Sakit</td>
                        <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{currentSiswa.sakit > 0 ? currentSiswa.sakit : "-"}</td>
                        <td className="border border-slate-900 py-0.5 text-center">Hari</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 py-0.5 text-center font-mono">2</td>
                        <td className="border border-slate-900 py-0.5 px-2">Izin</td>
                        <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{currentSiswa.izin > 0 ? currentSiswa.izin : "-"}</td>
                        <td className="border border-slate-900 py-0.5 text-center">Hari</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 py-0.5 text-center font-mono">3</td>
                        <td className="border border-slate-900 py-0.5 px-2">Tanpa Keterangan</td>
                        <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{currentSiswa.alpha > 0 ? currentSiswa.alpha : "-"}</td>
                        <td className="border border-slate-900 py-0.5 text-center">Hari</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 6. C. CAPAIAN PEMBELAJARAN EKSTRA KURIKULER */}
                <div className="mb-2">
                  <h4 className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-wide">
                    C. CAPAIAN PEMBELAJARAN EKSTRA KURIKULER
                  </h4>
                  <table className="w-full text-[8.5px] border border-slate-900 border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold text-center">
                        <th className="border border-slate-900 py-0.5 px-1 w-8">No</th>
                        <th className="border border-slate-900 py-0.5 px-2 text-left w-52">Ekstra yang diikuti</th>
                        <th className="border border-slate-900 py-0.5 px-2 w-16 text-center">Nilai</th>
                        <th className="border border-slate-900 py-0.5 px-2 text-left">Materi Ekstra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSiswa.ekskul && currentSiswa.ekskul.length > 0 ? (
                        currentSiswa.ekskul.map((e, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-900 py-0.5 text-center font-mono">{idx + 1}</td>
                            <td className="border border-slate-900 py-0.5 px-2 font-medium">{e.nama}</td>
                            <td className="border border-slate-900 py-0.5 text-center font-bold font-mono">{e.nilai}</td>
                            <td className="border border-slate-900 py-0.5 px-2 text-[8px]">{e.materi}</td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr>
                            <td className="border border-slate-900 py-0.5 text-center font-mono">1</td>
                            <td className="border border-slate-900 py-0.5 px-2 text-slate-400 italic">-</td>
                            <td className="border border-slate-900 py-0.5 text-center text-slate-400">-</td>
                            <td className="border border-slate-900 py-0.5 px-2 text-slate-400">-</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-900 py-0.5 text-center font-mono">2</td>
                            <td className="border border-slate-900 py-0.5 px-2 text-slate-400 italic">-</td>
                            <td className="border border-slate-900 py-0.5 text-center text-slate-400">-</td>
                            <td className="border border-slate-900 py-0.5 px-2 text-slate-400">-</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 7. D. CATATAN WALI KELAS */}
                <div className="mb-2">
                  <h4 className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-wide">
                    D. CATATAN WALI KELAS
                  </h4>
                  <div className="border border-slate-900 p-2 min-h-[36px] text-[8.5px] text-slate-800 bg-white leading-relaxed">
                    {currentSiswa.catatan || "Ananda menunjukkan kesungguhan belajar dan akhlaq yang baik di pertengahan semester ini. Terus pertahankan kedisiplinan dan tingkatkan capaian prestasinya."}
                  </div>
                </div>
              </div>

              {/* 8. TANDA TANGAN RESMI TIGA PIHAK SESUAI TEMPLATE PDF */}
              <div className="pt-2 signature-block">
                {/* Baris Pertama: Orangtua & Wali Kelas */}
                <div className="flex justify-between items-start text-[9.5px] text-slate-900 px-4">
                  {/* Kiri: Orangtua / Wali */}
                  <div className="text-left">
                    <p className="mb-12">
                      Mengetahui:<br />
                      <strong>Orangtua / Wali</strong>
                    </p>
                    <p className="font-bold underline uppercase">
                      {currentSiswa.nama_ortu || "IMAM KOMARI"}
                    </p>
                  </div>

                  {/* Kanan: Wali Kelas */}
                  <div className="text-left min-w-[200px]">
                    <p className="mb-1">
                      {config.kota_tanggal || "Blitar"}, {config.tanggal_rapor || "24 Oktober 2026"}<br />
                      <strong>Wali Kelas</strong>
                    </p>
                    <div className="h-12 flex items-center justify-start my-0.5">
                      {ttdBase64 ? (
                        <img src={ttdBase64} alt="TTD Wali Kelas" className="max-h-12 max-w-[120px] object-contain" />
                      ) : (
                        <div className="h-10"></div>
                      )}
                    </div>
                    <p className="font-bold underline uppercase text-slate-950">
                      {currentUser?.nama_user || "Wildan Su'aidi Kohardiansya, S.Pd."}
                    </p>
                    <p className="text-[8.5px] text-slate-600">
                      NIP {currentUser?.nip || "-"}
                    </p>
                  </div>
                </div>

                {/* Baris Kedua: Kepala Madrasah (Tengah Bawah) */}
                <div className="mt-4 text-center max-w-xs mx-auto relative">
                  <p className="mb-1 text-[9.5px]">
                    Mengetahui;<br />
                    <strong>Kepala Madrasah</strong>
                  </p>

                  {/* Layering Stempel Transparan di Belakang TTD Kepsek */}
                  <div className="relative h-14 flex items-center justify-center my-0.5">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-35 rotate-[-10deg] z-0">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#006e14] flex flex-col items-center justify-center text-[5.5px] font-black text-[#006e14] leading-none p-1 text-center bg-emerald-50/40">
                        <span>MADRASAH</span>
                        <span className="my-0.5 text-[6.5px] text-amber-700">★ RESMI ★</span>
                        <span>{config.id === "ma" ? "MA NURUS SALAM" : "MTs MA'ARIF NU 2"}</span>
                      </div>
                    </div>
                    <div className="relative z-10 font-serif text-slate-900 italic text-lg font-bold tracking-widest select-none rotate-[-4deg]">
                      {config.id === "ma" ? "M. Zen Pamuji" : "Ulil Amin"}
                    </div>
                  </div>

                  <p className="font-bold underline uppercase relative z-10 text-[9.5px]">
                    {config.id === "ma" ? "M. Zen Pamuji, S.Pd." : (config.kepala_madrasah || "Ahmad Ulil Amin, Lc., M.S.I.")}
                  </p>
                  <p className="text-[8.5px] text-slate-600 relative z-10">
                    NIP {config.nip_kepala || "-"}
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
