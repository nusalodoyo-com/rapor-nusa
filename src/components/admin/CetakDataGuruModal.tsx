"use client";

import React from "react";
import { User, SchoolConfig } from "@/types";
import { Printer, X, ShieldAlert, KeyRound, CheckCircle, Download } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teachers: User[];
  config: SchoolConfig;
  tahun: string;
  semester: string;
}

export default function CetakDataGuruModal({
  isOpen,
  onClose,
  teachers,
  config,
  tahun,
  semester,
}: Props) {
  if (!isOpen) return null;

  const isMts = config.id === "mts";
  const semLabel = semester === "1" ? "Gasal" : "Genap";
  const docTitle = `DATA_AKUN_GURU_${config.jenjang.toUpperCase()}_${tahun.replace("/", "-")}_SEM_${semLabel.toUpperCase()}`;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = docTitle;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border-3 border-retro-border shadow-retro-xl max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden my-auto">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-3 sm:p-4 border-b-2 border-retro-border bg-retro-cream no-print flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center border-2 border-retro-border shadow-retro-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-retro-black uppercase">
                Cetak Data Akun & Kredensial Guru (A4 Portrait)
              </h3>
              <p className="text-[11px] text-slate-600 font-bold">
                {config.nama_madrasah} • Total {teachers.length} Akun Guru Terdaftar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-retro bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-xs flex items-center gap-1.5 shadow-retro-sm font-black"
              title="Cetak atau Simpan sebagai PDF A4"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="btn-retro bg-white text-retro-black hover:bg-slate-100 p-2 border-2 border-retro-border"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area for Web */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          
          {/* Printable Container */}
          <div
            id="print-data-guru-area"
            className="guru-print-page bg-white p-6 sm:p-8 shadow-md border border-slate-300 w-full max-w-[210mm] text-slate-800"
            style={{ fontFamily: "'Inter', Arial, sans-serif" }}
          >
            {/* KOP MADRASAH RESMI */}
            <div className="border-b-[3px] border-emerald-950 pb-2 mb-4">
              <div className="grid grid-cols-[65px_1fr_65px] items-center gap-3">
                {/* Logo Kiri: Logo LP Ma'arif NU */}
                <div className="flex justify-center items-center">
                  <img
                    src="/logo-lp-maarif-nu.png"
                    alt="Logo LP Ma'arif NU"
                    className="w-14 h-14 object-contain"
                  />
                </div>

                {/* Teks Kop Tengah */}
                <div className="text-center">
                  <div className="text-[10pt] font-black text-[#064e3b] tracking-wider uppercase leading-tight font-serif">
                    LEMBAGA PENDIDIKAN MA&apos;ARIF NU
                  </div>
                  <div className="text-[8.5pt] font-bold text-slate-800 tracking-normal uppercase leading-tight">
                    BADAN HUKUM PERKUMPULAN NAHDLATUL ULAMA&apos;
                  </div>
                  <div className="text-[6.5pt] text-slate-600 leading-tight">
                    (SK Menteri Hukum dan Hak Asasi Manusia No. AHU-119.AH.01.08.Tahun 2013)
                  </div>
                  <div className="text-[11.5pt] font-black text-[#064e3b] tracking-wide uppercase leading-tight mt-1 font-serif">
                    {config.nama_madrasah}
                  </div>
                  <div className="text-[7pt] text-slate-700 leading-tight mt-0.5">
                    {config.alamat || "Jl. Diponegoro No. 105 Kedungbunder Sutojayan Blitar"} • Telp: 0856-5112-6412 • Website: nusalodoyo.com
                  </div>
                </div>

                {/* Logo Kanan: Logo Madrasah */}
                <div className="flex justify-center items-center">
                  <img
                    src={isMts ? "/logo-mts.png" : "/logo-ma.png"}
                    alt={isMts ? "Logo MTs" : "Logo MA"}
                    className="w-14 h-14 object-contain"
                  />
                </div>
              </div>

              {/* Status Bar Pita Hijau */}
              <div className="mt-2 bg-[#064e3b] text-white py-0.5 px-3 rounded text-[7pt] font-semibold flex justify-between items-center tracking-wider uppercase">
                <span>NSM: <strong>{config.nsm || "131235050062"}</strong></span>
                <span>NPSN: <strong>{config.npsn || "75727401"}</strong></span>
                <span>STATUS: <strong>{config.akreditasi || "Terdaftar Kemenag"}</strong></span>
                <span>EMAIL: <strong>nusalodoyo@gmail.com</strong></span>
              </div>
            </div>

            {/* JUDUL DOKUMEN */}
            <div className="text-center my-4">
              <h1 className="text-[12pt] font-black uppercase text-emerald-950 tracking-wider">
                DAFTAR AKUN & KREDENSIAL PENDIDIK (GURU)
              </h1>
              <p className="text-[8pt] font-bold text-slate-600 uppercase mt-0.5">
                TAHUN PELAJARAN {tahun} • SEMESTER {semLabel.toUpperCase()}
              </p>
            </div>

            {/* TABEL DATA AKUN GURU */}
            <table className="w-full text-[8pt] border-collapse guru-print-table my-3">
              <thead>
                <tr className="bg-emerald-900 text-white font-black uppercase text-center border border-emerald-950">
                  <th className="py-1.5 px-1.5 w-8 border border-emerald-800">No</th>
                  <th className="py-1.5 px-2 w-24 border border-emerald-800">ID User (Username)</th>
                  <th className="py-1.5 px-2 w-28 border border-emerald-800">Password</th>
                  <th className="py-1.5 px-2 text-left border border-emerald-800">Nama Lengkap & Gelar</th>
                  <th className="py-1.5 px-2 w-28 border border-emerald-800">NIP / NIK</th>
                  <th className="py-1.5 px-1.5 w-10 border border-emerald-800">L/P</th>
                  <th className="py-1.5 px-2 text-left border border-emerald-800">Penugasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {teachers.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={`border border-slate-300 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="py-1.5 px-1 text-center font-mono text-[7.5pt] border border-slate-300">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-black text-emerald-900 border border-slate-300 bg-emerald-50/40">
                      {t.username}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-800 border border-slate-300">
                      {t.password || "Lodoyo2026"}
                    </td>
                    <td className="py-1.5 px-2 font-bold text-slate-900 border border-slate-300">
                      {t.nama_user}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono text-[7pt] text-slate-600 border border-slate-300">
                      {t.nip || "-"}
                    </td>
                    <td className="py-1.5 px-1.5 text-center font-bold text-slate-700 border border-slate-300">
                      {t.jenis_kelamin || "L"}
                    </td>
                    <td className="py-1.5 px-2 text-[7.5pt] text-slate-700 border border-slate-300">
                      {t.kelas_diampu && t.kelas_diampu !== "-" ? (
                        <span className="font-bold text-emerald-800">Wali Kelas {t.kelas_diampu}</span>
                      ) : (
                        "Guru Mata Pelajaran"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* CATATAN KEAMANAN & INFORMASI */}
            <div className="mt-4 p-2.5 rounded border border-dashed border-emerald-700 bg-emerald-50/60 text-[7.5pt] text-emerald-950 space-y-1">
              <div className="font-bold uppercase tracking-wide flex items-center gap-1 text-[#064e3b]">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Pemberitahuan & Ketentuan Kerahasiaan Akun:</span>
              </div>
              <p>
                1. Username berupa ID tetap 7 karakter (contoh: <code>nusa101</code>) dan kata sandi awal standar madrasah adalah <code>Lodoyo2026</code>.
              </p>
              <p>
                2. Pendidik dapat memperbarui kata sandi dan melengkapi biodata pribadi secara mandiri melalui menu <strong>Profil Guru</strong> di dalam aplikasi.
              </p>
              <p>
                3. Harap menjaga kerahasiaan kredensial ini dan tidak membagikannya kepada pihak yang tidak berkepentingan.
              </p>
            </div>

            {/* BLOK TANDA TANGAN */}
            <div className="mt-6 grid grid-cols-2 gap-8 text-[8pt] text-slate-900 break-inside-avoid">
              <div className="text-center">
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala {config.nama_madrasah}</p>
                
                {/* Area TTD Kamad & Stempel */}
                <div className="h-20 flex items-center justify-center relative my-1">
                  {config.ttd_kamad_url ? (
                    <img
                      src={config.ttd_kamad_url}
                      alt="TTD Kamad"
                      className="max-h-16 max-w-[140px] object-contain relative z-10"
                    />
                  ) : null}
                  <img
                    src="/stempel-madrasah.png"
                    alt="Stempel"
                    className="absolute max-h-16 opacity-75 pointer-events-none"
                  />
                </div>

                <p className="font-black underline uppercase text-emerald-950">
                  {config.kepala_madrasah || (isMts ? "Ahmad Ulil Amin, Lc., M.S.I." : "M. Zen Pamuji, S.Pd.")}
                </p>
                <p className="text-[7pt] text-slate-600 font-mono">
                  NIP: {config.nip_kepala || "-"}
                </p>
              </div>

              <div className="text-center">
                <p>{config.kota_tanggal || "Blitar"}, {config.tanggal_rapor || "24 Oktober 2026"}</p>
                <p className="font-bold">Administrator / Operator Madrasah</p>
                
                <div className="h-20 flex items-center justify-center my-1">
                  <div className="w-24 border-b border-dashed border-slate-300"></div>
                </div>

                <p className="font-black underline uppercase text-emerald-950">
                  OPERATOR IT MADRASAH
                </p>
                <p className="text-[7pt] text-slate-600 font-mono">
                  Sistem Rapor Digital Madrasah
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 border-t-2 border-retro-border bg-white no-print flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">
            Kertas: <strong>A4 Portrait</strong> • Margin Otomatis Browser
          </span>
          <button
            onClick={handlePrint}
            className="btn-retro bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 text-xs flex items-center gap-1.5 shadow-retro-sm font-black"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Sekarang</span>
          </button>
        </div>

      </div>
    </div>
  );
}
