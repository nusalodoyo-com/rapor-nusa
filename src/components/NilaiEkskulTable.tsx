"use client";

import React, { useState, useEffect } from "react";
import { NilaiEkskulItem } from "@/types";

interface Props {
  initialData: NilaiEkskulItem[];
  onSave: (data: NilaiEkskulItem[]) => void;
  isSaving: boolean;
}

export default function NilaiEkskulTable({ initialData, onSave, isSaving }: Props) {
  const [data, setData] = useState<NilaiEkskulItem[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const toggleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setData(prev => prev.map(item => ({ ...item, checked })));
  };

  const handleRowChange = (
    nis: string,
    field: keyof NilaiEkskulItem,
    val: any
  ) => {
    setData(prev =>
      prev.map(row => (row.nis === nis ? { ...row, [field]: val } : row))
    );
  };

  const handleSave = () => {
    // Hanya simpan siswa yang dicentang
    const selected = data.filter(d => d.checked);
    if (selected.length === 0) {
      alert("Centang minimal 1 siswa yang mengikuti kegiatan ekskul ini!");
      return;
    }
    onSave(selected);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white custom-scrollbar">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <th className="py-2.5 px-3 text-center w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={e => toggleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="py-2.5 px-3 font-bold text-center w-28">NIS</th>
              <th className="py-2.5 px-3 font-bold min-w-[200px]">Nama Siswa</th>
              <th className="py-2.5 px-3 font-bold w-40 text-center">Predikat</th>
              <th className="py-2.5 px-3 font-bold min-w-[260px]">Keterangan / Capaian Kegiatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, index) => (
              <tr key={item.nis} className={index % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-50"}>
                <td className="py-2 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    onChange={e => handleRowChange(item.nis, "checked", e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </td>
                <td className="py-2 px-3 text-center font-mono font-semibold text-slate-600 bg-slate-50/80">
                  {item.nis}
                </td>
                <td className="py-2 px-3 font-medium text-slate-800">
                  {item.nama_siswa}
                </td>
                <td className="p-1 text-center">
                  <select
                    value={item.predikat || "Baik"}
                    onChange={e => handleRowChange(item.nis, "predikat", e.target.value)}
                    className="w-full text-xs py-1 px-2 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Cukup">Cukup</option>
                    <option value="Kurang">Kurang</option>
                  </select>
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    value={item.keterangan || ""}
                    onChange={e => handleRowChange(item.nis, "keterangan", e.target.value)}
                    placeholder="Contoh: Menguasai teknik dasar dengan disiplin..."
                    className="w-full text-xs px-2 py-1 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
        <span className="text-xs text-slate-500">
          Peserta Terpilih: <strong>{data.filter(d => d.checked).length}</strong> dari {data.length} siswa
        </span>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "💾 Simpan Nilai Ekstrakurikuler"}
        </button>
      </div>
    </div>
  );
}
