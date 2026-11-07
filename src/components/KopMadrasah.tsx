"use client";

import React from "react";
import { SchoolConfig } from "@/types";

interface Props {
  config: SchoolConfig;
}

export default function KopMadrasah({ config }: Props) {
  const isMts = config.id === "mts";

  const nsm = isMts ? "121235050045" : (config.nsm || "131235050062");
  const npsn = isMts ? "20584989" : (config.npsn || "75727401");
  const akreditasi = isMts ? "A" : (config.akreditasi || "Terdaftar Kemenag");
  const email = isMts ? "matsamnu2_stj@yahoo.co.id" : "nusalodoyo@gmail.com";
  const telp = isMts ? "0342-443278" : "0856-5112-6412";
  const alamat = `Jl. Diponegoro No. 105 Telp. ${telp} Kedungbunder Sutojayan Blitar`;
  const logoJenjang = isMts ? "/logo-mts.png" : "/logo-ma.png";

  return (
    <div className="w-full text-center pb-1 mb-2">
      {/* Header Baris Utama Logo & Teks Kop */}
      <div className="flex items-center justify-between px-2 mb-1 gap-2">
        {/* Logo Ma'arif NU Pusat (Kiri) */}
        <div className="w-14 h-14 flex items-center justify-center p-0.5 flex-shrink-0">
          <img
            src="/logo.png"
            alt="Logo LP Ma'arif NU"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Teks Lembaga & Identitas Madrasah */}
        <div className="flex-1 text-center px-1">
          <h4 className="text-[10px] font-bold tracking-wider text-slate-900 uppercase leading-tight font-serif">
            LEMBAGA PENDIDIKAN MA&apos;ARIF NU
          </h4>
          <h3 className="text-[11px] font-black tracking-wide text-slate-900 uppercase leading-tight font-serif">
            BADAN HUKUM PERKUMPULAN NAHDLATUL ULAMA&apos;
          </h3>
          <p className="text-[7.5px] text-slate-600 font-medium leading-none mb-0.5">
            (SK Menteri Hukum dan Hak Asasi Manusia No. AHU-119.AH.01.08.Tahun 2013)
          </p>
          <h2 className="text-sm sm:text-base font-black text-[#006e14] tracking-wide uppercase leading-tight mt-0.5 font-serif">
            {config.nama_madrasah}
          </h2>
          <p className="text-[8.5px] text-slate-700 font-sans leading-tight mt-0.5">
            {alamat}
          </p>
        </div>

        {/* Logo Resmi Madrasah Sesuai Jenjang (Kanan: MTs atau MA) */}
        <div className="w-14 h-14 flex items-center justify-center p-0.5 flex-shrink-0">
          <img
            src={logoJenjang}
            alt={isMts ? "Logo MTs Ma'arif NU 2 Sutojayan" : "Logo MA Ma'arif Nurus Salam"}
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>
      </div>

      {/* Bar Pita Hijau (NSM / NPSN / AKREDITASI / Email) */}
      <div className="w-full bg-[#006e14] text-white py-0.5 px-2 flex flex-wrap items-center justify-between text-[8px] font-bold font-mono tracking-tight leading-none">
        <span>NSM : {nsm}</span>
        <span>/</span>
        <span>NPSN : {npsn}</span>
        <span>/</span>
        <span>{isMts ? `AKREDITASI : ${akreditasi}` : `STATUS : ${akreditasi}`}</span>
        <span>/</span>
        <span>Email : {email}</span>
      </div>

      {/* Garis Ganda Pemisah Bawah */}
      <div className="w-full border-b-2 border-slate-900 mt-1"></div>
    </div>
  );
}
