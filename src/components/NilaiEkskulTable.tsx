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
    const selected = data.filter(d => d.checked);
    if (selected.length === 0) {
      alert("Centang minimal 1 siswa yang mengikuti kegiatan ekskul ini!");
      return;
    }
    onSave(selected);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro bg-white custom-scrollbar">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-retro-yellow text-retro-black font-black uppercase border-b-2 border-retro-border">
              <th className="py-2.5 px-3 text-center w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={e => toggleSelectAll(e.target.checked)}
                  className="rounded border-2 border-retro-border text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
              </th>
              <th className="py-2.5 px-3 text-center w-28">NIS</th>
              <th className="py-2.5 px-3 min-w-[200px]">Nama Siswa</th>
              <th className="py-2.5 px-3 w-40 text-center">Predikat</th>
              <th className="py-2.5 px-3 min-w-[260px]">Keterangan / Capaian Kegiatan</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100 font-bold">
            {data.map((item) => (
              <tr key={item.nis} className="hover:bg-brand-50/40">
                <td className="py-2 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    onChange={e => handleRowChange(item.nis, "checked", e.target.checked)}
                    className="rounded border-2 border-retro-border text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-slate-600 bg-slate-50/60">
                  {item.nis}
                </td>
                <td className="py-2 px-3 text-retro-black">
                  {item.nama_siswa}
                </td>
                <td className="p-1.5 text-center">
                  <select
                    value={item.predikat || "Baik"}
                    onChange={e => handleRowChange(item.nis, "predikat", e.target.value)}
                    className="w-full text-xs py-1.5 px-2 rounded-lg border-2 border-retro-border font-black shadow-retro-sm bg-white"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Cukup">Cukup</option>
                    <option value="Kurang">Kurang</option>
                  </select>
                </td>
                <td className="p-1.5">
                  <input
                    type="text"
                    value={item.keterangan || ""}
                    onChange={e => handleRowChange(item.nis, "keterangan", e.target.value)}
                    placeholder="Contoh: Menguasai teknik dasar dengan disiplin..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm font-semibold"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-retro p-3.5 flex flex-wrap justify-between items-center gap-3 bg-white">
        <span className="text-xs font-black text-retro-black">
          Peserta Terpilih: <strong>{data.filter(d => d.checked).length}</strong> dari {data.length} siswa
        </span>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-retro-primary px-5 py-2.5 text-xs uppercase disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "💾 Simpan Nilai Ekstrakurikuler"}
        </button>
      </div>
    </div>
  );
}
