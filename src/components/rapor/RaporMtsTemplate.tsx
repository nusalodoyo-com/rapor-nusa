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

export default function RaporMtsTemplate({
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
      k === "BING" || n.includes("inggris")
    );
  });

  // Mapel Kelompok B (Keterampilan, Seni, Olahraga, Mulok)
  const mapelB = allMapel.filter(m => {
    if (isPai(m)) return false;
    if (mapelANonPai.some(a => a.kode_mapel === m.kode_mapel)) return false;
    return true;
  });

  return (
    <div className="rapor-single-page bg-white text-slate-900 mx-auto select-text font-sans p-0 leading-tight">
      {/* ================= 1. KOP RESMI MTS MA'ARIF NU 2 SUTOJAYAN ================= */}
      <div className="w-full text-center pb-1">
        <div className="flex items-center justify-between px-1 mb-1 gap-3">
          {/* Logo LP Ma'arif NU Transparan (Kiri) */}
          <div className="w-[18mm] h-[18mm] flex items-center justify-center flex-shrink-0">
            <img
              src="/logo.png"
              alt="Logo LP Ma'arif NU"
              width={68}
              height={68}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Teks Lembaga & Identitas Madrasah MTs */}
          <div className="flex-1 text-center px-1">
            <h4 className="text-[9pt] font-bold tracking-wider text-slate-900 uppercase leading-none font-serif">
              LEMBAGA PENDIDIKAN MA&apos;ARIF NU
            </h4>
            <h3 className="text-[10.5pt] font-black tracking-wide text-slate-900 uppercase leading-tight font-serif mt-0.5">
              BADAN HUKUM PERKUMPULAN NAHDLATUL ULAMA&apos;
            </h3>
            <p className="text-[7.5pt] text-slate-600 font-medium leading-none mt-0.5">
              (SK Menteri Hukum dan Hak Asasi Manusia No. AHU-119.AH.01.08.Tahun 2013)
            </p>
            <h2 className="text-[13pt] sm:text-[14pt] font-black text-[#006e14] tracking-wide uppercase leading-tight mt-0.5 font-serif">
              MADRASAH TSANAWIYAH MA&apos;ARIF NU 2 SUTOJAYAN
            </h2>
            <p className="text-[8pt] text-slate-700 leading-tight mt-0.5">
              Jl. Diponegoro No. 105 Telp. 0342-443278 Kedungbunder Sutojayan Blitar
            </p>
          </div>

          {/* Logo MTs Ma'arif NU 2 Sutojayan Transparan (Kanan) */}
          <div className="w-[18mm] h-[18mm] flex items-center justify-center flex-shrink-0">
            <img
              src="/logo-mts.png"
              alt="Logo MTs Ma'arif NU 2 Sutojayan"
              width={68}
              height={68}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Pita Hijau Akreditasi MTs */}
        <div className="w-full bg-[#006e14] text-white py-1 px-3 flex items-center justify-between text-[8pt] font-sans font-medium tracking-normal leading-none rounded-xs">
          <span><strong>NSM :</strong> 121235050045</span>
          <span>/</span>
          <span><strong>NPSN :</strong> 20584989</span>
          <span>/</span>
          <span><strong>AKREDITASI :</strong> A (Unggul)</span>
          <span>/</span>
          <span><strong>Email :</strong> matsamnu2_stj@yahoo.co.id</span>
        </div>

        {/* Garis Ganda Pemisah Kop (Tebal + Tipis) */}
        <div className="w-full border-b-2 border-emerald-950 mt-1"></div>
        <div className="w-full border-b border-emerald-950 mt-[1.5px]"></div>
      </div>

      {/* ================= 2. JUDUL DOKUMEN ================= */}
      <div className="text-center my-1">
        <div className="border-t border-b border-slate-900 py-1 w-full bg-slate-50/50">
          <h3 className="text-[12pt] sm:text-[13pt] font-black uppercase tracking-widest text-slate-900 leading-none">
            RAPOR TENGAH SEMESTER
          </h3>
        </div>
      </div>

      {/* ================= 3. IDENTITAS SISWA (2 KOLOM RAPI & SEJAJAR) ================= */}
      <div className="grid grid-cols-2 text-[8.5pt] text-slate-900 my-1 pb-1.5 border-b border-slate-900 leading-normal gap-6">
        <div className="space-y-0.5">
          <div className="flex items-center">
            <span className="w-24 flex-shrink-0 text-slate-700">No. Absen</span>
            <span className="w-3 text-center">:</span>
            <span className="font-bold font-mono text-slate-950">{siswa.no_absen || 1}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 flex-shrink-0 text-slate-700">No. Induk / NISN</span>
            <span className="w-3 text-center">:</span>
            <span className="font-bold font-mono text-slate-950">{siswa.nis} / {siswa.nisn || "-"}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 flex-shrink-0 text-slate-700">Nama Siswa</span>
            <span className="w-3 text-center">:</span>
            <span className="font-black uppercase text-slate-950 truncate text-[9pt]">{siswa.nama}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center">
            <span className="w-28 flex-shrink-0 text-slate-700">Kelas / Fase</span>
            <span className="w-3 text-center">:</span>
            <span className="font-bold text-slate-950">{kelas} (Fase D)</span>
          </div>
          <div className="flex items-center">
            <span className="w-28 flex-shrink-0 text-slate-700">Semester</span>
            <span className="w-3 text-center">:</span>
            <span className="font-bold text-slate-950">{semLabel}</span>
          </div>
          <div className="flex items-center">
            <span className="w-28 flex-shrink-0 text-slate-700">Tahun Pelajaran</span>
            <span className="w-3 text-center">:</span>
            <span className="font-bold font-mono text-slate-950">{cleanTahun}</span>
          </div>
        </div>
      </div>

      {/* ================= 4. A. CAPAIAN PEMBELAJARAN (TABEL NILAI) ================= */}
      <div className="mb-1">
        <h4 className="text-[9pt] font-black text-slate-900 mb-1 uppercase tracking-wide">
          A. CAPAIAN PEMBELAJARAN
        </h4>

        <table className="w-full text-[8.5pt] border border-slate-900 border-collapse table-fixed leading-tight">
          <colgroup>
            <col style={{ width: "7mm" }} />
            <col style={{ width: "50mm" }} />
            <col style={{ width: "11mm" }} />
            <col style={{ width: "11mm" }} />
            <col style={{ width: "11mm" }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-emerald-50/80 text-slate-900 border-b border-slate-900 font-bold text-center">
              <th className="border border-slate-900 py-1 px-1" rowSpan={2}>No</th>
              <th className="border border-slate-900 py-1 px-2 text-left" rowSpan={2}>Mata Pelajaran</th>
              <th className="border border-slate-900 py-0.5 px-1 text-center" colSpan={3}>Capaian Nilai</th>
              <th className="border border-slate-900 py-1 px-2 text-left" rowSpan={2}>Lingkup Materi</th>
            </tr>
            <tr className="bg-emerald-50/80 text-slate-900 border-b border-slate-900 font-bold text-center text-[8pt]">
              <th className="border border-slate-900 py-0.5 px-1">LM</th>
              <th className="border border-slate-900 py-0.5 px-1">STS</th>
              <th className="border border-slate-900 py-0.5 px-1">SAS</th>
            </tr>
          </thead>
          <tbody>
            {/* - Kelompok A */}
            <tr className="bg-slate-100 font-bold text-slate-900">
              <td colSpan={6} className="border border-slate-900 py-0.5 px-2 text-[8pt]">
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
                  <td colSpan={5} className="border border-slate-900 py-0.5 px-2 font-bold text-slate-900 bg-slate-50 text-[8pt]">
                    Pendidikan Agama Islam
                  </td>
                </tr>
                {paiMapel.map((m) => {
                  const det = siswa.mapelDetails[m.kode_mapel];
                  const lmVal = det?.lm ? det.lm : (siswa.scores[m.kode_mapel] || "-");
                  const stsVal = det?.sts ? det.sts : (siswa.scores[m.kode_mapel] || "-");
                  const sasVal = det?.sas ? det.sas : "-";
                  return (
                    <tr key={m.kode_mapel} className="border-b border-slate-900">
                      <td className="border border-slate-900 py-0.5 px-2 pl-4 text-slate-800 truncate">{m.nama_mapel}</td>
                      <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{lmVal}</td>
                      <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{stsVal}</td>
                      <td className="border border-slate-900 py-0.5 text-center font-mono text-slate-400">{sasVal}</td>
                      <td className="border border-slate-900 py-0.5 px-2 text-[8pt] leading-tight text-slate-700">
                        <span className="line-clamp-2">
                          {det?.lingkup_materi && det.lingkup_materi !== "-" ? det.lingkup_materi : `Kompetensi materi pembelajaran ${m.nama_mapel}`}
                        </span>
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
                <tr key={m.kode_mapel} className="border-b border-slate-900">
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{rowNum}</td>
                  <td className="border border-slate-900 py-0.5 px-2 text-slate-900 font-medium truncate">{m.nama_mapel}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{lmVal}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{stsVal}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono text-slate-400">{sasVal}</td>
                  <td className="border border-slate-900 py-0.5 px-2 text-[8pt] leading-tight text-slate-700">
                    <span className="line-clamp-2">
                      {det?.lingkup_materi && det.lingkup_materi !== "-" ? det.lingkup_materi : `Kompetensi materi pembelajaran ${m.nama_mapel}`}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* - Kelompok B */}
            <tr className="bg-slate-100 font-bold text-slate-900">
              <td colSpan={6} className="border border-slate-900 py-0.5 px-2 text-[8pt]">
                - Kelompok B
              </td>
            </tr>

            {mapelB.map((m, idx) => {
              const det = siswa.mapelDetails[m.kode_mapel];
              const lmVal = det?.lm ? det.lm : (siswa.scores[m.kode_mapel] || "-");
              const stsVal = det?.sts ? det.sts : (siswa.scores[m.kode_mapel] || "-");
              const sasVal = det?.sas ? det.sas : "-";
              return (
                <tr key={m.kode_mapel} className="border-b border-slate-900">
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{idx + 1}</td>
                  <td className="border border-slate-900 py-0.5 px-2 text-slate-900 font-medium truncate">{m.nama_mapel}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{lmVal}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{stsVal}</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono text-slate-400">{sasVal}</td>
                  <td className="border border-slate-900 py-0.5 px-2 text-[8pt] leading-tight text-slate-700">
                    <span className="line-clamp-2">
                      {det?.lingkup_materi && det.lingkup_materi !== "-" ? det.lingkup_materi : `Kompetensi materi pembelajaran ${m.nama_mapel}`}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Baris RANGKING SISWA */}
            <tr className="bg-emerald-50/60 font-black border-t-2 border-slate-900">
              <td colSpan={2} className="border border-slate-900 py-1 px-2 text-left uppercase text-[8.5pt]">
                RANGKING SISWA
              </td>
              <td colSpan={4} className="border border-slate-900 py-1 px-2 text-left font-mono text-[8.5pt]">
                Peringkat: <span className="font-black text-emerald-950 text-[9pt]">{siswa.ranking}</span> &nbsp;dari&nbsp; <span className="font-bold">{totalSiswa}</span> Siswa
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footnote Rapor Tengah Semester */}
        <div className="text-[7.5pt] text-slate-600 mt-1 space-y-0.5 italic leading-none">
          <p className="font-bold not-italic">Keterangan:</p>
          <p>* Nilai Capaian yang tertera adalah nilai murni hasil tes/ujian.</p>
          <p>* LM = Lingkup Materi (rerata nilai harian), STS = Sumatif Tengah Semester, SAS = Sumatif Akhir Semester.</p>
        </div>
      </div>

      {/* ================= 5. B, C, D (KETIDAKHADIRAN, EKSKUL & CATATAN WALI KELAS SEJAJAR) ================= */}
      <div className="grid grid-cols-12 gap-3 my-1 items-stretch">
        {/* Kolom Kiri (7 cols): Presensi & Ekstrakurikuler */}
        <div className="col-span-7 flex flex-col justify-between space-y-1.5">
          {/* B. Ketidakhadiran */}
          <div>
            <h5 className="text-[8.5pt] font-black text-slate-900 uppercase tracking-wide leading-none mb-1">
              B. KETIDAKHADIRAN
            </h5>
            <table className="w-full text-[8pt] border border-slate-900 border-collapse table-fixed leading-snug">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                  <th className="border border-slate-900 py-0.5 w-7">No</th>
                  <th className="border border-slate-900 py-0.5 px-1.5 text-left">Keterangan</th>
                  <th className="border border-slate-900 py-0.5 w-12 text-center">JML</th>
                  <th className="border border-slate-900 py-0.5 w-14 text-center">Satuan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-900 py-0.5 text-center font-mono">1</td>
                  <td className="border border-slate-900 py-0.5 px-1.5">Sakit</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{siswa.sakit > 0 ? siswa.sakit : "-"}</td>
                  <td className="border border-slate-900 py-0.5 text-center">Hari</td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-0.5 text-center font-mono">2</td>
                  <td className="border border-slate-900 py-0.5 px-1.5">Izin</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{siswa.izin > 0 ? siswa.izin : "-"}</td>
                  <td className="border border-slate-900 py-0.5 text-center">Hari</td>
                </tr>
                <tr>
                  <td className="border border-slate-900 py-0.5 text-center font-mono">3</td>
                  <td className="border border-slate-900 py-0.5 px-1.5">Tanpa Keterangan</td>
                  <td className="border border-slate-900 py-0.5 text-center font-mono font-bold">{siswa.alpha > 0 ? siswa.alpha : "-"}</td>
                  <td className="border border-slate-900 py-0.5 text-center">Hari</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* C. Ekstrakurikuler */}
          <div>
            <h5 className="text-[8.5pt] font-black text-slate-900 uppercase tracking-wide leading-none mb-1">
              C. CAPAIAN PEMBELAJARAN EKSTRA KURIKULER
            </h5>
            <table className="w-full text-[8pt] border border-slate-900 border-collapse table-fixed leading-snug">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                  <th className="border border-slate-900 py-0.5 w-7">No</th>
                  <th className="border border-slate-900 py-0.5 px-1.5 text-left w-28">Ekstra yang diikuti</th>
                  <th className="border border-slate-900 py-0.5 w-12 text-center">Nilai</th>
                  <th className="border border-slate-900 py-0.5 px-1.5 text-left">Materi Ekstra</th>
                </tr>
              </thead>
              <tbody>
                {siswa.ekskul && siswa.ekskul.length > 0 ? (
                  siswa.ekskul.map((e, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-900 py-0.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-900 py-0.5 px-1.5 font-medium truncate">{e.nama}</td>
                      <td className="border border-slate-900 py-0.5 text-center font-bold font-mono">{e.nilai}</td>
                      <td className="border border-slate-900 py-0.5 px-1.5 text-[7.5pt] truncate">{e.materi}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="h-5">
                      <td className="border border-slate-900 py-0.5 text-center font-mono">1</td>
                      <td className="border border-slate-900 py-0.5 px-1.5 text-slate-400 italic">-</td>
                      <td className="border border-slate-900 py-0.5 text-center text-slate-400">-</td>
                      <td className="border border-slate-900 py-0.5 px-1.5 text-slate-400">-</td>
                    </tr>
                    <tr className="h-5">
                      <td className="border border-slate-900 py-0.5 text-center font-mono">2</td>
                      <td className="border border-slate-900 py-0.5 px-1.5 text-slate-400 italic">-</td>
                      <td className="border border-slate-900 py-0.5 text-center text-slate-400">-</td>
                      <td className="border border-slate-900 py-0.5 px-1.5 text-slate-400">-</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan (5 cols): Catatan Wali Kelas */}
        <div className="col-span-5 flex flex-col justify-between">
          <div className="h-full flex flex-col">
            <h5 className="text-[8.5pt] font-black text-slate-900 uppercase tracking-wide leading-none mb-1">
              D. CATATAN WALI KELAS
            </h5>
            <div className="border border-slate-900 p-2.5 text-[8.5pt] text-slate-800 bg-white leading-relaxed flex-1 flex items-start rounded-xs">
              {siswa.catatan || "Ananda menunjukkan kesungguhan belajar, akhlaqul karimah, dan ketekunan yang baik. Terus tingkatkan prestasi akademik dan spiritualitas."}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 6. TANDA TANGAN RESMI TIGA PIHAK (SEJAJAR HORIZONTAL) ================= */}
      <div className="border-t border-slate-900 pt-1.5 mt-1 signature-block">
        <div className="grid grid-cols-3 text-center text-[8.5pt] text-slate-900 leading-normal">
          {/* 1. Orang Tua */}
          <div className="flex flex-col justify-between h-32">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Orang Tua / Wali</p>
            </div>
            <div className="h-14"></div>
            <div>
              <p className="font-bold underline uppercase text-slate-950">
                {siswa.nama_ortu || "Orang Tua / Wali"}
              </p>
              <p className="text-[7.5pt] text-transparent select-none">-</p>
            </div>
          </div>

          {/* 2. Kepala MTs (Dengan Stempel Resmi & TTD Kamad Upload) */}
          <div className="flex flex-col justify-between h-32 relative">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala MTs Ma&apos;arif NU 2 Sutojayan</p>
            </div>

            <div className="relative h-14 flex items-center justify-center my-0.5">
              {/* Stempel Layer Transparan */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 rotate-[-8deg] z-0">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#006e14] flex flex-col items-center justify-center text-[5.5px] font-black text-[#006e14] leading-none p-0.5 text-center bg-emerald-50/40">
                  <span>MADRASAH</span>
                  <span className="my-0.5 text-[6px] text-amber-700">★ RESMI ★</span>
                  <span>MTSM NU 2</span>
                </div>
              </div>

              {/* Tanda Tangan Digital Kepala Madrasah: Utamakan File Gambar Upload */}
              {config.ttd_kamad_url ? (
                <img
                  src={config.ttd_kamad_url}
                  alt="Tanda Tangan Kepala Madrasah"
                  className="max-h-13 max-w-[140px] object-contain relative z-10"
                />
              ) : (
                <div className="relative z-10 font-serif text-slate-900 italic text-lg font-bold tracking-widest select-none rotate-[-3deg]">
                  Ulil Amin
                </div>
              )}
            </div>

            <div>
              <p className="font-bold underline uppercase text-slate-950 text-[9pt]">
                {config.kepala_madrasah || "Ahmad Ulil Amin, Lc., M.S.I."}
              </p>
              <p className="text-[7.5pt] text-slate-600 font-mono">
                NIP: {config.nip_kepala && config.nip_kepala !== "-" ? config.nip_kepala : "-"}
              </p>
            </div>
          </div>

          {/* 3. Wali Kelas */}
          <div className="flex flex-col justify-between h-32">
            <div>
              <p>{config.kota_tanggal || "Blitar"}, {config.tanggal_rapor || "24 Oktober 2026"}</p>
              <p className="font-bold">Wali Kelas {kelas}</p>
            </div>

            <div className="h-14 flex items-center justify-center my-0.5">
              {ttdBase64 ? (
                <img src={ttdBase64} alt="TTD Wali" className="max-h-13 max-w-[120px] object-contain" />
              ) : (
                <div className="h-12"></div>
              )}
            </div>

            <div>
              <p className="font-bold underline uppercase text-slate-950 text-[9pt]">
                {waliNama || "Wali Kelas"}
              </p>
              <p className="text-[7.5pt] text-slate-600 font-mono">
                NIP: {waliNip && waliNip !== "-" ? waliNip : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
