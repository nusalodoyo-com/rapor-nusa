"use client";

import React from "react";
import { SchoolConfig } from "@/types";

interface Props {
  config: SchoolConfig;
}

export default function KopMadrasah({ config }: Props) {
  return (
    <div className="w-full text-center pb-2 mb-4 border-b-2 border-slate-900 border-double">
      <h3 className="text-sm font-bold tracking-wider text-slate-800 uppercase">
        {config.nama_yayasan}
      </h3>
      <p className="text-[10px] text-slate-600 font-medium">
        {config.nomor_sk}
      </p>
      <h2 className="text-lg md:text-xl font-extrabold text-emerald-800 tracking-wide uppercase mt-0.5">
        {config.nama_madrasah}
      </h2>
      <p className="text-[10px] text-slate-600">
        Alamat: {config.alamat}
      </p>
    </div>
  );
}
