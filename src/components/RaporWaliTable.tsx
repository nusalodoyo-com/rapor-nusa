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
      <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro bg-white custom-scrollbar">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-retro-yellow text-retro-black font-black uppercase border-b-2 border-retro-border">
              <th className="py-2.5 px-3 text-center w-24">NIS</th>
              <th className="py-2.5 px-3 min-w-[180px]">Nama Siswa</th>
              <th className="py-2.5 px-2 text-center w-20 bg-emerald-100 text-emerald-950">Sakit (S)</th>
              <th className="py-2.5 px-2 text-center w-20 bg-teal-100 text-teal-950">Izin (I)</th>
              <th className="py-2.5 px-2 text-center w-20 bg-rose-100 text-rose-950">Alpha (A)</th>
              <th className="py-2.5 px-3 min-w-[260px]">Catatan Wali Kelas</th>
              <th className="py-2.5 px-3 w-36 text-center">Keputusan</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100 font-bold">
            {data.map((item) => (
              <tr key={item.nis} className="hover:bg-brand-50/40">
                <td className="py-2 px-3 text-center font-mono font-bold text-slate-600 bg-slate-50/60">
                  {item.nis}
                </td>
                <td className="py-2 px-3 text-retro-black">
                  {item.nama_siswa}
                </td>
                <td className="p-1.5 text-center bg-emerald-50/40">
                  <input
                    type="number"
                    min={0}
                    value={item.sakit || ""}
                    onChange={e => handleRowChange(item.nis, "sakit", Number(e.target.value))}
                    className="w-14 text-center font-black py-1 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm"
                  />
                </td>
                <td className="p-1.5 text-center bg-teal-50/40">
                  <input
                    type="number"
                    min={0}
                    value={item.izin || ""}
                    onChange={e => handleRowChange(item.nis, "izin", Number(e.target.value))}
                    className="w-14 text-center font-black py-1 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm"
                  />
                </td>
                <td className="p-1.5 text-center bg-rose-50/40">
                  <input
                    type="number"
                    min={0}
                    value={item.tanpa_keterangan || ""}
                    onChange={e => handleRowChange(item.nis, "tanpa_keterangan", Number(e.target.value))}
                    className="w-14 text-center font-black py-1 rounded-lg border-2 border-red-600 bg-red-50 text-red-900 shadow-retro-sm"
                  />
                </td>
                <td className="p-1.5">
                  <input
                    type="text"
                    value={item.catatan_wali || ""}
                    onChange={e => handleRowChange(item.nis, "catatan_wali", e.target.value)}
                    placeholder="Ananda menunjukkan ketekunan dan kesopanan yang baik..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm font-semibold"
                  />
                </td>
                <td className="p-1.5 text-center">
                  <select
                    value={item.keputusan || "-"}
                    onChange={e => handleRowChange(item.nis, "keputusan", e.target.value)}
                    className="w-full text-xs py-1.5 px-2 rounded-lg border-2 border-retro-border bg-retro-cream font-black shadow-retro-sm"
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

      <div className="card-retro p-3.5 flex flex-wrap justify-between items-center gap-3 bg-white">
        <span className="text-xs font-black text-retro-black">
          Total Siswa: <strong>{data.length}</strong> Anak
        </span>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-retro-primary px-5 py-2.5 text-xs uppercase disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "💾 Simpan Presensi & Catatan"}
        </button>
      </div>
    </div>
  );
}
