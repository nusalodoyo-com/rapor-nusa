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
      <div className="flex items-center justify-between px-2 mb-1">
        {/* Logo Kemenag / Yayasan Placeholder */}
        <div className="w-14 h-14 flex items-center justify-center font-bold text-xs border border-slate-400 rounded-full text-emerald-800 bg-emerald-50">
          {isMts ? "LP MAARIF" : "YAYASAN"}
        </div>

        <div className="flex-1 text-center px-2">
          <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
            {config.nama_yayasan}
          </h3>
          <p className="text-[9px] text-slate-600 font-medium">
            {config.nomor_sk} | Status Akreditasi: <strong>{config.akreditasi}</strong>
          </p>
          <h2 className="text-base md:text-lg font-black text-emerald-900 tracking-wide uppercase mt-0.5">
            {config.nama_madrasah}
          </h2>
          <p className="text-[10px] text-slate-700 font-mono">
            NSM: {config.nsm} | NPSN: {config.npsn}
          </p>
          <p className="text-[9px] text-slate-600">
            {config.alamat}, Kec. {config.kecamatan}, Kab. {config.kabupaten}, Prov. {config.provinsi}
          </p>
        </div>

        {/* Logo Lembaga */}
        <div className="w-14 h-14 flex items-center justify-center font-bold text-xs border border-slate-400 rounded-full text-emerald-800 bg-emerald-50">
          {isMts ? "MTs NU" : "MA NUSA"}
        </div>
      </div>
    </div>
  );
}
