"use client";

import React, { useState, useEffect } from "react";
import { NilaiMapelItem } from "@/types";

interface Props {
  initialData: NilaiMapelItem[];
  onSave: (data: NilaiMapelItem[]) => void;
  isSaving: boolean;
}

export default function NilaiMapelTable({ initialData, onSave, isSaving }: Props) {
  const [data, setData] = useState<NilaiMapelItem[]>([]);
  const [materi1, setMateri1] = useState("");
  const [materi2, setMateri2] = useState("");
  const [materi3, setMateri3] = useState("");
  const [materi4, setMateri4] = useState("");

  useEffect(() => {
    setData(initialData);
    if (initialData.length > 0) {
      setMateri1(initialData[0].materi_1 || "");
      setMateri2(initialData[0].materi_2 || "");
      setMateri3(initialData[0].materi_3 || "");
      setMateri4(initialData[0].materi_4 || "");
    }
  }, [initialData]);

  const handleMateriChange = (idx: 1 | 2 | 3 | 4, value: string) => {
    if (idx === 1) setMateri1(value);
    if (idx === 2) setMateri2(value);
    if (idx === 3) setMateri3(value);
    if (idx === 4) setMateri4(value);

    // Update to all rows
    setData(prev =>
      prev.map(row => ({
        ...row,
        [`materi_${idx}`]: value,
      }))
    );
  };

  const handleRowChange = (
    nis: string,
    field: keyof NilaiMapelItem,
    val: string | number
  ) => {
    setData(prev =>
      prev.map(row => {
        if (row.nis !== nis) return row;
        const updated = { ...row, [field]: val };

        // Kalkulasi instan NA dan Predikat
        const h1 = Number(field === "nilai_harian_1" ? val : updated.nilai_harian_1) || 0;
        const h2 = Number(field === "nilai_harian_2" ? val : updated.nilai_harian_2) || 0;
        const h3 = Number(field === "nilai_harian_3" ? val : updated.nilai_harian_3) || 0;
        const h4 = Number(field === "nilai_harian_4" ? val : updated.nilai_harian_4) || 0;

        const avg = (h1 + h2 + h3 + h4) / 4;
        const uts = Number(field === "nilai_uts" ? val : updated.nilai_uts) || 0;
        const uas = Number(field === "nilai_uas" ? val : updated.nilai_uas) || 0;

        const na = Math.round((avg * 0.4) + (uts * 0.3) + (uas * 0.3));
        const predikat: "A" | "B" | "C" | "D" =
          na >= 90 ? "A" : na >= 80 ? "B" : na >= 70 ? "C" : "D";

        return {
          ...updated,
          nilai_akhir: na,
          predikat: predikat,
        };
      })
    );
  };

  const handleSaveAll = () => {
    // Sinkronkan materi header ke setiap baris
    const payload = data.map(item => ({
      ...item,
      materi_1: materi1,
      materi_2: materi2,
      materi_3: materi3,
      materi_4: materi4,
    }));
    onSave(payload);
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
        Belum ada data siswa untuk kelas dan mapel ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Box Header Judul Materi Massal */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 rounded-xl border border-emerald-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Judul Lingkup Materi Pembelajaran (Otomatis Seragam 1 Kelas)
          </span>
          <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-medium">
            Bobot: Formatif 40% | STS 30% | SAS 30%
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Materi 1 (Harian 1):</label>
            <input
              type="text"
              value={materi1}
              onChange={e => handleMateriChange(1, e.target.value)}
              placeholder="Contoh: Menelusuri Tradisi..."
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Materi 2 (Harian 2):</label>
            <input
              type="text"
              value={materi2}
              onChange={e => handleMateriChange(2, e.target.value)}
              placeholder="Contoh: Memahami Kaidah..."
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Materi 3 (Harian 3):</label>
            <input
              type="text"
              value={materi3}
              onChange={e => handleMateriChange(3, e.target.value)}
              placeholder="Contoh: Menelaah Sumber..."
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Materi 4 (Harian 4):</label>
            <input
              type="text"
              value={materi4}
              onChange={e => handleMateriChange(4, e.target.value)}
              placeholder="Contoh: Evaluasi Proyek..."
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Grid Tabel Siswa & Nilai */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white custom-scrollbar">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <th className="py-2.5 px-3 font-bold text-center w-24">NIS</th>
              <th className="py-2.5 px-3 font-bold min-w-[180px]">Nama Siswa</th>
              <th className="py-2.5 px-2 font-bold text-center w-16 bg-emerald-50 text-emerald-900">H1</th>
              <th className="py-2.5 px-2 font-bold text-center w-16 bg-emerald-50 text-emerald-900">H2</th>
              <th className="py-2.5 px-2 font-bold text-center w-16 bg-emerald-50 text-emerald-900">H3</th>
              <th className="py-2.5 px-2 font-bold text-center w-16 bg-emerald-50 text-emerald-900">H4</th>
              <th className="py-2.5 px-2 font-bold text-center w-16 bg-amber-50 text-amber-900">STS</th>
              <th className="py-2.5 px-2 font-bold text-center w-16 bg-blue-50 text-blue-900">SAS</th>
              <th className="py-2.5 px-2 font-bold text-center w-16 bg-purple-50 text-purple-900">NA</th>
              <th className="py-2.5 px-2 font-bold text-center w-12 bg-purple-50 text-purple-900">Pred</th>
              <th className="py-2.5 px-3 font-bold min-w-[200px]">Catatan Capaian Kompetensi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, index) => {
              const na = item.nilai_akhir || 0;
              const pred = item.predikat || "C";
              return (
                <tr key={item.nis} className={index % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-50"}>
                  <td className="py-2 px-3 text-center font-mono font-semibold text-slate-600 bg-slate-50/80">
                    {item.nis}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-800">
                    {item.nama_siswa}
                  </td>
                  <td className="p-1 text-center bg-emerald-50/30">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilai_harian_1 || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_harian_1", Number(e.target.value))}
                      className="w-14 text-center font-semibold py-1 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="p-1 text-center bg-emerald-50/30">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilai_harian_2 || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_harian_2", Number(e.target.value))}
                      className="w-14 text-center font-semibold py-1 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="p-1 text-center bg-emerald-50/30">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilai_harian_3 || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_harian_3", Number(e.target.value))}
                      className="w-14 text-center font-semibold py-1 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="p-1 text-center bg-emerald-50/30">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilai_harian_4 || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_harian_4", Number(e.target.value))}
                      className="w-14 text-center font-semibold py-1 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="p-1 text-center bg-amber-50/30">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilai_uts || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_uts", Number(e.target.value))}
                      className="w-14 text-center font-semibold text-amber-900 py-1 rounded border border-amber-300 focus:ring-1 focus:ring-amber-500 bg-amber-50/20"
                    />
                  </td>
                  <td className="p-1 text-center bg-blue-50/30">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.nilai_uas || ""}
                      onChange={e => handleRowChange(item.nis, "nilai_uas", Number(e.target.value))}
                      className="w-14 text-center font-semibold text-blue-900 py-1 rounded border border-blue-300 focus:ring-1 focus:ring-blue-500 bg-blue-50/20"
                    />
                  </td>
                  <td className="py-2 px-1 text-center font-bold text-slate-800 bg-purple-50/30">
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono text-xs">
                      {na}
                    </span>
                  </td>
                  <td className="py-2 px-1 text-center font-bold bg-purple-50/30">
                    <span className={`inline-block w-6 py-0.5 rounded text-[11px] font-bold ${
                      pred === 'A' ? 'bg-emerald-100 text-emerald-800' :
                      pred === 'B' ? 'bg-blue-100 text-blue-800' :
                      pred === 'C' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {pred}
                    </span>
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={item.catatan_mapel || ""}
                      onChange={e => handleRowChange(item.nis, "catatan_mapel", e.target.value)}
                      placeholder="Catatan perkembangan siswa..."
                      className="w-full text-xs px-2 py-1 rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
        <span className="text-xs text-slate-500">
          Jumlah: <strong>{data.length}</strong> siswa
        </span>
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "💾 Simpan Semua Nilai"}
        </button>
      </div>
    </div>
  );
}
