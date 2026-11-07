"use client";

import React from "react";
import { SchoolConfig } from "@/types";

interface Props {
  config: SchoolConfig;
}

export default function KopMadrasah({ config }: Props) {
  const isMts = config.id === "mts";

  const nsm = config.nsm || (isMts ? "121235050045" : "131235050046");
  const npsn = config.npsn || (isMts ? "20584989" : "69984990");
  const akreditasi = config.akreditasi || "A";
  const email = isMts ? "matsamnu2_stj@yahoo.co.id" : "manurussalam_stj@yahoo.co.id";
  const telp = isMts ? "0342-443278" : "0342-441234";
  const alamat = isMts
    ? "Jl. Diponegoro No. 105 Telp. 0342-443278 Kedungbunder Sutojayan Blitar"
    : "Jl. PB Sudirman Lodoyo Sutojayan Blitar";

  return (
    <div className="w-full text-center pb-1 mb-2">
      {/* Header Baris Utama Logo & Teks */}
      <div className="flex items-center justify-between px-2 mb-1 gap-2">
        {/* Logo Ma'arif NU (Kiri) */}
        <div className="w-14 h-14 flex items-center justify-center p-0.5 flex-shrink-0">
          <img
            src="/logo.png"
            alt="Logo LP Ma'arif NU"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Teks Lembaga & Madrasah */}
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

        {/* Logo Madrasah / Lambang Bulat (Kanan) */}
        <div className="w-14 h-14 flex items-center justify-center p-0.5 flex-shrink-0">
          <div className="w-13 h-13 rounded-full border-2 border-[#006e14] flex flex-col items-center justify-center p-0.5 text-center bg-white shadow-xs">
            <span className="text-[6.5px] font-black text-[#006e14] leading-tight uppercase font-serif">
              {isMts ? "MTs MA'ARIF NU 2" : "MA MA'ARIF"}
            </span>
            <span className="text-[5.5px] font-bold text-amber-700 leading-none">
              SUTOJAYAN
            </span>
          </div>
        </div>
      </div>

      {/* Bar Pita Hijau (NSM / NPSN / AKREDITASI / Email) */}
      <div className="w-full bg-[#006e14] text-white py-0.5 px-2 flex flex-wrap items-center justify-between text-[8px] font-bold font-mono tracking-tight leading-none">
        <span>NSM : {nsm}</span>
        <span>/</span>
        <span>NPSN : {npsn}</span>
        <span>/</span>
        <span>AKREDITASI : {akreditasi}</span>
        <span>/</span>
        <span>Email : {email}</span>
      </div>

      {/* Garis Ganda Pemisah Bawah */}
      <div className="w-full border-b-2 border-slate-900 mt-1"></div>
    </div>
  );
}
