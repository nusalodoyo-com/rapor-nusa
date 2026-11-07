"use client";

import React from "react";
import { SchoolConfig } from "@/types";

interface Props {
  config: SchoolConfig;
}

export default function KopMadrasah({ config }: Props) {
  const isMts = config.id === "mts";

  return (
    <div className="w-full text-center pb-2 mb-4 border-b-2 border-slate-900 border-double">
      <div className="flex items-center justify-between px-2 mb-1 gap-3">
        {/* Logo Lembaga / Kemenag / Yayasan (Left) */}
        <div className="w-16 h-16 flex items-center justify-center p-1 border-2 border-[#00ab00] rounded-xl bg-white shadow-sm flex-shrink-0">
          <img src="/logo.png" alt="Logo Utama" className="w-full h-full object-contain" />
        </div>

        <div className="flex-1 text-center px-1">
          <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
            {config.nama_yayasan}
          </h3>
          <p className="text-[9px] text-slate-600 font-medium">
            {config.nomor_sk} | Status Akreditasi: <strong>{config.akreditasi}</strong>
          </p>
          <h2 className="text-base md:text-lg font-black text-[#045e07] tracking-wide uppercase mt-0.5">
            {config.nama_madrasah}
          </h2>
          <p className="text-[10px] text-slate-700 font-mono">
            NSM: {config.nsm} | NPSN: {config.npsn}
          </p>
          <p className="text-[9px] text-slate-600">
            {config.alamat}, Kec. {config.kecamatan}, Kab. {config.kabupaten}, Prov. {config.provinsi}
          </p>
        </div>

        {/* Logo Sekunder / Lembaga Badge (Right) */}
        <div className="w-16 h-16 flex items-center justify-center p-1 border border-slate-300 rounded-xl bg-emerald-50/50 flex-shrink-0 text-center">
          <span className="text-[11px] font-black text-[#007800] leading-tight uppercase">
            {isMts ? "MTs NU 2" : "MA NUSA"}
          </span>
        </div>
      </div>
    </div>
  );
}
