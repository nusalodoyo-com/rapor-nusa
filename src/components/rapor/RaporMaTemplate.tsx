"use client";

import React from "react";
import { SiswaLegger, SchoolConfig, Mapel } from "@/types";

interface Props {
  siswa: SiswaLegger;
  kelas: string;
  semester: string;
  tahun: string;
  config: SchoolConfig;
  allMapel: Mapel[];
  totalSiswa: number;
  waliNama?: string;
  waliNip?: string;
  ttdBase64?: string;
}

export default function RaporMaTemplate({
  siswa,
  kelas,
  semester,
  tahun,
  config,
  allMapel,
  totalSiswa,
  waliNama,
  waliNip,
  ttdBase64,
}: Props) {
  const semLabel = semester === "1" ? "Gasal" : "Genap";
  const cleanTahun = tahun.replace("/", "-");

  // Filter mapel PAI (QH, AA, FIK, SKI)
  const isPai = (m: Mapel) => {
    const k = (m.kode_mapel || "").toUpperCase();
    return (
      k === "QH" || k === "AA" || k === "FIK" || k === "SKI" ||
      m.nama_mapel.toLowerCase().includes("qur'an") ||
      m.nama_mapel.toLowerCase().includes("akidah") ||
      m.nama_mapel.toLowerCase().includes("fikih") ||
      m.nama_mapel.toLowerCase().includes("sejarah kebudayaan")
    );
  };

  const paiMapel = allMapel.filter(isPai);

  // Mapel Kelompok A (Non-PAI)
  const mapelANonPai = allMapel.filter(m => {
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
      k === "BING" || n.includes("inggris") ||
      n.includes("biologi") || n.includes("fisika") || n.includes("kimia") ||
      n.includes("ekonomi") || n.includes("geografi") || n.includes("sosiologi")
    );
  });

  // Mapel Kelompok B (Keterampilan, Seni, Olahraga, Mulok)
  const mapelB = allMapel.filter(m => {
    if (isPai(m)) return false;
    if (mapelANonPai.some(a => a.kode_mapel === m.kode_mapel)) return false;
    return true;
  });

  return (
    <div className="rapor-single-page bg-white text-slate-900 mx-auto select-text font-sans p-2 sm:p-4">
      {/* ================= 1. KOP RESMI MA MA'ARIF NURUS SALAM ================= */}
      <div className="w-full text-center pb-1 mb-2">
        <div className="flex items-center justify-between px-2 mb-1.5 gap-3">
          {/* Logo LP Ma'arif NU Transparan (Kiri) */}
          <div className="w-16 h-16 flex items-center justify-center p-0.5 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Logo LP Ma'arif NU"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>

          {/* Teks Lembaga & Identitas Madrasah MA */}
          <div className="flex-1 text-center px-2">
            <h4 className="text-[10px] font-bold tracking-wider text-slate-900 uppercase leading-none font-serif">
              LEMBAGA PENDIDIKAN MA&apos;ARIF NU
            </h4>
            <h3 className="text-[11.5px] font-black tracking-wide text-slate-900 uppercase leading-tight font-serif mt-0.5">
              BADAN HUKUM PERKUMPULAN NAHDLATUL ULAMA&apos;
            </h3>
            <p className="text-[7.5px] text-slate-600 font-medium leading-none mt-0.5">
              (SK Menteri Hukum dan Hak Asasi Manusia No. AHU-119.AH.01.08.Tahun 2013)
            </p>
            <h2 className="text-sm sm:text-base font-black text-[#006e14] tracking-wide uppercase leading-tight mt-1 font-serif">
              MADRASAH ALIYAH MA&apos;ARIF NURUS SALAM
            </h2>
            <p className="text-[8.5px] text-slate-700 leading-tight mt-0.5">
              Jl. Diponegoro No. 105 Telp. 0856-5112-6412 Kedungbunder Sutojayan Blitar
            </p>
          </div>

          {/* Logo MA Ma'arif Nurus Salam Transparan (Kanan) */}
          <div className="w-16 h-16 flex items-center justify-center p-0.5 flex-shrink-0">
            <img
              src="/logo-ma.png"
              alt="Logo MA Ma'arif Nurus Salam"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
        </div>

        {/* Pita Hijau Status MA */}
        <div className="w-full bg-[#006e14] text-white py-1 px-3 flex items-center justify-between text-[8px] font-bold font-mono tracking-tight leading-none rounded-xs">
          <span>NSM : 131235050062</span>
          <span>/</span>
          <span>NPSN : 75727401</span>
          <span>/</span>
          <span>STATUS : Terdaftar Kemenag</span>
          <span>/</span>
          <span>Email : nusalodoyo@gmail.com</span>
        </div>
        <div className="w-full border-b-2 border-slate-900 mt-1"></div>
      </div>

      {/* ================= 2. JUDUL DOKUMEN BERJARAK ELEGAN ================= */}
      <div className="text-center my-1.5">
        <div className="border-t-2 border-b-2 border-slate-900 py-1 w-full">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 leading-none">
            RAPOR TENGAH SEMESTER
          </h3>
        </div>
      </div>

      {/* ================= 3. IDENTITAS SISWA (BERJARAK LEGA 2 KOLOM) ================= */}
      <div className="grid grid-cols-2 text-[9.5px] text-slate-900 my-1.5 pb-1.5 border-b border-slate-900 leading-relaxed">
        <div className="space-y-1">
          <div className="grid grid-cols-12">
            <span className="col-span-4">No. Absen</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-7 font-bold font-mono">{siswa.no_absen || 1}</span>
          </div>
          <div className="grid grid-cols-12">
            <span className="col-span-4">No. Induk/NISN</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-7 font-bold font-mono">{siswa.nis} / {siswa.nisn || "-"}</span>
          </div>
          <div className="grid grid-cols-12">
            <span className="col-span-4">Nama Siswa</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-7 font-black uppercase text-slate-950 truncate">{siswa.nama}</span>
          </div>
        </div>

        <div className="space-y-1 pl-6">
          <div className="grid grid-cols-12">
            <span className="col-span-5">Kelas / Fase</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-6 font-bold">{kelas} (Fase E/F)</span>
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

      {/* ================= 4. A. CAPAIAN PEMBELAJARAN (TABEL NILAI BERJARAK) ================= */}
      <div className="mb-2">
        <h4 className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-wide">
          A. CAPAIAN PEMBELAJARAN
        </h4>

        <table className="w-full text-[8.5px] border border-slate-900 border-collapse table-fixed leading-tight">
          <thead>
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold text-center">
              <th className="border border-slate-900 py-1 px-1 w-7" rowSpan={2}>No</th>
              <th className="border border-slate-900 py-1 px-2 text-left w-48" rowSpan={2}>Mata Pelajaran</th>
              <th className="border border-slate-900 py-0.5 px-1 w-28 text-center" colSpan={3}>Capaian Nilai</th>
              <th className="border border-slate-900 py-1 px-2 text-left" rowSpan={2}>Lingkup Materi</th>
            </tr>
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold text-center text-[8px]">
              <th className="border border-slate-900 py-0.5 px-1 w-9">LM</th>
              <th className="border border-slate-900 py-0.5 px-1 w-9">STS</th>
              <th className="border border-slate-900 py-0.5 px-1 w-10">SAS</th>
            </tr>
          </thead>
          <tbody>
            {/* - Kelompok A */}
            <tr className="bg-slate-100/90 font-bold text-slate-900">
              <td colSpan={6} className="border border-slate-900 py-0.5 px-2 text-[8.5px]">
                - Kelompok A
              </td>
            </tr>

            {/* 1. PAI */}
            {paiMapel.length > 0 && (
              <>
                <tr>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold align-top" rowSpan={paiMapel.length + 1}>
                    1
                  </td>
                  <td colSpan={5} className="border border-slate-900 py-0.5 px-2 font-bold text-slate-900 bg-slate-50 text-[8.5px]">
                    Pendidikan Agama Islam
                  </td>
                </tr>
                {paiMapel.map((m) => {
                  const det = siswa.mapelDetails[m.kode_mapel];
                  const lmVal = det?.lm ? det.lm : (siswa.scores[m.kode_mapel] || "-");
                  const stsVal = det?.sts ? det.sts : (siswa.scores[m.kode_mapel] || "-");
                  const sasVal = det?.sas ? det.sas : "-";
                  return (
                    <tr key={m.kode_mapel} className="border-b border-slate-800">
                      <td className="border border-slate-900 py-0.5 px-2 pl-4 text-slate-800 truncate">{m.nama_mapel}</td>
                      <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{lmVal}</td>
                      <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{stsVal}</td>
                      <td className="border border-slate-900 py-0.5 text-center font-mono text-slate-400">{sasVal}</td>
                      <td className="border border-slate-900 py-0.5 px-2 text-[7.5px] leading-tight text-slate-700 truncate">
                        {det?.lingkup_materi && det.lingkup_materi !== "-" ? det.lingkup_materi : `Kompetensi materi pembelajaran ${m.nama_mapel}`}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}

            {/* Non-PAI Kelompok A */}
            {mapelANonPai.map((m, idx) => {
              const det = siswa.mapelDetails[m.kode_mapel];
              const lmVal = det?.lm ? det.lm : (siswa.scores[m.kode_mapel] || "-");
              const stsVal = det?.sts ? det.sts : (siswa.scores[m.kode_mapel] || "-");
              const sasVal = det?.sas ? det.sas : "-";
              const rowNum = (paiMapel.length > 0 ? 2 : 1) + idx;
              return (
                <tr key={m.kode_mapel} className="border-b border-slate-800">
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{rowNum}</td>
                  <td className="border border-slate-900 py-0.5 px-2 text-slate-900 font-medium truncate">{m.nama_mapel}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{lmVal}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{stsVal}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono text-slate-400">{sasVal}</td>
                  <td className="border border-slate-900 py-0.5 px-2 text-[7.5px] leading-tight text-slate-700 truncate">
                    {det?.lingkup_materi && det.lingkup_materi !== "-" ? det.lingkup_materi : `Kompetensi materi pembelajaran ${m.nama_mapel}`}
                  </td>
                </tr>
              );
            })}

            {/* - Kelompok B */}
            <tr className="bg-slate-100/90 font-bold text-slate-900">
              <td colSpan={6} className="border border-slate-900 py-0.5 px-2 text-[8.5px]">
                - Kelompok B
              </td>
            </tr>

            {mapelB.map((m, idx) => {
              const det = siswa.mapelDetails[m.kode_mapel];
              const lmVal = det?.lm ? det.lm : (siswa.scores[m.kode_mapel] || "-");
              const stsVal = det?.sts ? det.sts : (siswa.scores[m.kode_mapel] || "-");
              const sasVal = det?.sas ? det.sas : "-";
              return (
                <tr key={m.kode_mapel} className="border-b border-slate-800">
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{idx + 1}</td>
                  <td className="border border-slate-900 py-0.5 px-2 text-slate-900 font-medium truncate">{m.nama_mapel}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{lmVal}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{stsVal}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono text-slate-400">{sasVal}</td>
                  <td className="border border-slate-900 py-0.5 px-2 text-[7.5px] leading-tight text-slate-700 truncate">
                    {det?.lingkup_materi && det.lingkup_materi !== "-" ? det.lingkup_materi : `Kompetensi materi pembelajaran ${m.nama_mapel}`}
                  </td>
                </tr>
              );
            })}

            {/* Baris RANGKING SISWA */}
            <tr className="bg-slate-100 font-black border-t-2 border-slate-900">
              <td colSpan={2} className="border border-slate-900 py-1 px-3 text-left uppercase text-[9px]">
                RANGKING SISWA
              </td>
              <td colSpan={4} className="border border-slate-900 py-1 px-3 text-left font-mono text-[9px]">
                <span className="font-bold">{siswa.ranking}</span> &nbsp;&nbsp;Dari :&nbsp; <span className="font-bold">{totalSiswa}</span> Siswa
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footnote Rapor Tengah Semester */}
        <div className="text-[7.5px] text-slate-600 mt-1 space-y-0.5 italic leading-tight">
          <p className="font-bold not-italic">Keterangan;</p>
          <p>* Nilai Capaian yang tertera adalah nilai murni hasil tes/ujian</p>
          <p>* LM = Lingkup Materi (rerata nilai harian), STS = Sumatif Tengah Semester, SAS = Sumatif Akhir Semester</p>
        </div>
      </div>

      {/* ================= 5. B, C, D (KETIDAKHADIRAN, EKSKUL & CATATAN WALI KELAS DENGAN GAP NYAMAN) ================= */}
      <div className="grid grid-cols-12 gap-3 my-1.5">
        {/* Kolom Kiri (7 cols): Presensi & Ekstrakurikuler */}
        <div className="col-span-7 space-y-1.5">
          {/* B. Ketidakhadiran */}
          <div>
            <h5 className="text-[9px] font-black text-slate-900 uppercase tracking-wide leading-none mb-0.5">
              B. KETIDAKHADIRAN
            </h5>
            <table className="w-full text-[8px] border border-slate-900 border-collapse table-fixed leading-none">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                  <th className="border border-slate-900 py-0.5 w-7">No</th>
                  <th className="border border-slate-900 py-0.5 px-2 text-left">Keterangan</th>
                  <th className="border border-slate-900 py-0.5 w-12 text-center">JML</th>
                  <th className="border border-slate-900 py-0.5 w-14 text-center">Satuan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-900 py-0.5 text-center font-mono">1</td>
                  <td className="border border-slate-900 py-0.5 px-2">Sakit</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{siswa.sakit > 0 ? siswa.sakit : "-"}</td>
                  <td className="border border-slate-900 py-0.5 text-center">Hari</td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-0.5 text-center font-mono">2</td>
                  <td className="border border-slate-900 py-0.5 px-2">Izin</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{siswa.izin > 0 ? siswa.izin : "-"}</td>
                  <td className="border border-slate-900 py-0.5 text-center">Hari</td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-0.5 text-center font-mono">3</td>
                  <td className="border border-slate-900 py-0.5 px-2">Tanpa Keterangan</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{siswa.alpha > 0 ? siswa.alpha : "-"}</td>
                  <td className="border border-slate-900 py-0.5 text-center">Hari</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* C. Ekstrakurikuler */}
          <div>
            <h5 className="text-[9px] font-black text-slate-900 uppercase tracking-wide leading-none mb-0.5">
              C. CAPAIAN PEMBELAJARAN EKSTRA KURIKULER
            </h5>
            <table className="w-full text-[8px] border border-slate-900 border-collapse table-fixed leading-none">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                  <th className="border border-slate-900 py-0.5 w-7">No</th>
                  <th className="border border-slate-900 py-0.5 px-2 text-left w-28">Ekstra yang diikuti</th>
                  <th className="border border-slate-900 py-0.5 w-12 text-center">Nilai</th>
                  <th className="border border-slate-900 py-0.5 px-2 text-left">Materi Ekstra</th>
                </tr>
              </thead>
              <tbody>
                {siswa.ekskul && siswa.ekskul.length > 0 ? (
                  siswa.ekskul.map((e, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-900 py-0.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-900 py-0.5 px-2 font-medium truncate">{e.nama}</td>
                      <td className="border border-slate-900 py-0.5 text-center font-bold font-mono">{e.nilai}</td>
                      <td className="border border-slate-900 py-0.5 px-2 text-[7.5px] truncate">{e.materi}</td>
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
        </div>

        {/* Kolom Kanan (5 cols): Catatan Wali Kelas Lebih Lega */}
        <div className="col-span-5 flex flex-col justify-between">
          <div>
            <h5 className="text-[9px] font-black text-slate-900 uppercase tracking-wide leading-none mb-0.5">
              D. CATATAN WALI KELAS
            </h5>
            <div className="border border-slate-900 p-2 text-[8px] text-slate-800 bg-white leading-relaxed h-[84px] overflow-hidden">
              {siswa.catatan || "Ananda menunjukkan kesungguhan belajar, akhlaqul karimah, dan ketekunan yang baik. Terus tingkatkan prestasi akademik dan spiritualitas."}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 6. TANDA TANGAN RESMI TIGA PIHAK (BERJARAK LEGA) ================= */}
      <div className="border-t border-slate-800 pt-2 mt-1 signature-block">
        <div className="grid grid-cols-3 text-center text-[9px] text-slate-900 leading-tight">
          {/* 1. Orang Tua */}
          <div>
            <p className="mb-9">
              Mengetahui:<br />
              <strong>Orangtua / Wali</strong>
            </p>
            <p className="font-bold underline uppercase text-slate-950">
              {siswa.nama_ortu || "Orang Tua / Wali"}
            </p>
          </div>

          {/* 2. Kepala MA (Dengan Stempel Transparan MA) */}
          <div className="relative">
            <p className="mb-0.5">
              Mengetahui;<br />
              <strong>Kepala MA Ma&apos;arif Nurus Salam</strong>
            </p>
            <div className="relative h-11 flex items-center justify-center my-0.5">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-35 rotate-[-8deg] z-0">
                <div className="w-13 h-13 rounded-full border-2 border-dashed border-[#006e14] flex flex-col items-center justify-center text-[5px] font-black text-[#006e14] leading-none p-0.5 text-center bg-emerald-50/40">
                  <span>MADRASAH</span>
                  <span className="my-0.2 text-[5.5px] text-amber-700">★ RESMI ★</span>
                  <span>MA NURUS SALAM</span>
                </div>
              </div>
              <div className="relative z-10 font-serif text-slate-900 italic text-base font-bold tracking-widest select-none rotate-[-3deg]">
                M. Zen Pamuji
              </div>
            </div>
            <p className="font-bold underline uppercase relative z-10 text-[9px]">
              M. Zen Pamuji, S.Pd.
            </p>
            <p className="text-[8px] text-slate-600 relative z-10">
              NIP: -
            </p>
          </div>

          {/* 3. Wali Kelas */}
          <div>
            <p className="mb-0.5">
              Blitar, {config.tanggal_rapor || "24 Oktober 2026"}<br />
              <strong>Wali Kelas {kelas}</strong>
            </p>
            <div className="h-11 flex items-center justify-center my-0.5">
              {ttdBase64 ? (
                <img src={ttdBase64} alt="TTD Wali" className="max-h-10 max-w-[100px] object-contain" />
              ) : (
                <div className="h-10"></div>
              )}
            </div>
            <p className="font-bold underline uppercase text-slate-950 text-[9px]">
              {waliNama || "Wali Kelas"}
            </p>
            <p className="text-[8px] text-slate-600">
              NIP: {waliNip || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
