"use client";

import React, { useState, useEffect } from "react";
import { RaporWaliItem } from "@/types";

interface Props {
  initialData: RaporWaliItem[];
  onSave: (data: RaporWaliItem[]) => void;
  isSaving: boolean;
}

export default function RaporWaliTable({ initialData, onSave, isSaving }: Props) {
  const [data, setData] = useState<RaporWaliItem[]>([]);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleRowChange = (
    nis: string,
    field: keyof RaporWaliItem,
    val: any
  ) => {
    setData(prev =>
      prev.map(row => (row.nis === nis ? { ...row, [field]: val } : row))
    );
  };

  const handleSave = () => {
    onSave(data);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white custom-scrollbar">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <th className="py-2.5 px-3 font-bold text-center w-24">NIS</th>
              <th className="py-2.5 px-3 font-bold min-w-[180px]">Nama Siswa</th>
              <th className="py-2.5 px-2 font-bold text-center w-16 bg-amber-50 text-amber-900">Sakit</th>
              <th className="py-2.5 px-2 font-bold text-center w-16 bg-blue-50 text-blue-900">Izin</th>
              <th className="py-2.5 px-2 font-bold text-center w-16 bg-rose-50 text-rose-900">Alpha</th>
              <th className="py-2.5 px-3 font-bold min-w-[260px]">Catatan Wali Kelas (Karakter & Evaluasi)</th>
              <th className="py-2.5 px-3 font-bold w-36 text-center">Keputusan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, index) => (
              <tr key={item.nis} className={index % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-50"}>
                <td className="py-2 px-3 text-center font-mono font-semibold text-slate-600 bg-slate-50/80">
                  {item.nis}
                </td>
                <td className="py-2 px-3 font-medium text-slate-800">
                  {item.nama_siswa}
                </td>
                <td className="p-1 text-center bg-amber-50/20">
                  <input
                    type="number"
                    min={0}
                    value={item.sakit ?? 0}
                    onChange={e => handleRowChange(item.nis, "sakit", Number(e.target.value))}
                    className="w-14 text-center font-semibold py-1 rounded border border-amber-300 focus:ring-1 focus:ring-amber-500"
                  />
                </td>
                <td className="p-1 text-center bg-blue-50/20">
                  <input
                    type="number"
                    min={0}
                    value={item.izin ?? 0}
                    onChange={e => handleRowChange(item.nis, "izin", Number(e.target.value))}
                    className="w-14 text-center font-semibold py-1 rounded border border-blue-300 focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="p-1 text-center bg-rose-50/20">
                  <input
                    type="number"
                    min={0}
                    value={item.tanpa_keterangan ?? 0}
                    onChange={e => handleRowChange(item.nis, "tanpa_keterangan", Number(e.target.value))}
                    className="w-14 text-center font-semibold py-1 rounded border border-rose-300 focus:ring-1 focus:ring-rose-500 text-rose-700"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    value={item.catatan_wali || ""}
                    onChange={e => handleRowChange(item.nis, "catatan_wali", e.target.value)}
                    placeholder="Tingkatkan kedisiplinan dan pertahankan prestasi..."
                    className="w-full text-xs px-2 py-1 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                  />
                </td>
                <td className="p-1 text-center">
                  <select
                    value={item.keputusan || "-"}
                    onChange={e => handleRowChange(item.nis, "keputusan", e.target.value)}
                    className="w-full text-xs py-1 px-2 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
                  >
                    <option value="-">-</option>
                    <option value="Naik Kelas">Naik Kelas</option>
                    <option value="Tinggal Kelas">Tinggal Kelas</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Tidak Lulus">Tidak Lulus</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
        <span className="text-xs text-slate-500">
          Jumlah: <strong>{data.length}</strong> siswa
        </span>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "💾 Simpan Rapor Wali Kelas"}
        </button>
      </div>
    </div>
  );
}
