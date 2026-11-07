"use client";

import React, { useState, useEffect } from "react";
import { NilaiEkskulItem } from "@/types";
import { downloadExcelEkskul, parseExcelUpload } from "@/lib/excel/excelHandler";
import { FileSpreadsheet, Upload, CheckSquare, Square, Save } from "lucide-react";

interface Props {
  initialData: NilaiEkskulItem[];
  onSave: (data: NilaiEkskulItem[]) => void;
  isSaving: boolean;
  kelas?: string;
  namaEkskul?: string;
}

export default function NilaiEkskulTable({
  initialData,
  onSave,
  isSaving,
  kelas = "Kelas",
  namaEkskul = "Ekstrakurikuler",
}: Props) {
  const [data, setData] = useState<NilaiEkskulItem[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setData(initialData);
    setSelectAll(initialData.length > 0 && initialData.every(d => d.checked));
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

  const handleDownloadTemplate = async () => {
    const selected = data.filter(d => d.checked);
    if (selected.length === 0) {
      alert("Centang terlebih dahulu siswa yang mengikuti ekstrakurikuler ini sebelum mengunduh template Excel!");
      return;
    }
    await downloadExcelEkskul(kelas, namaEkskul, selected);
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseExcelUpload(file, "ekskul");
      if (parsed.dataEkskul && parsed.dataEkskul.length > 0) {
        const updated = data.map(row => {
          const found = parsed.dataEkskul?.find(p => p.nis === row.nis);
          if (found) {
            return {
              ...row,
              predikat: found.predikat || row.predikat,
              keterangan: found.keterangan || row.keterangan,
              checked: true,
            };
          }
          return row;
        });

        setData(updated);
        alert(`Berhasil mengunggah nilai ekskul untuk ${parsed.dataEkskul.length} siswa! Tekan tombol 'Simpan Semua Data' untuk menyimpan ke database.`);
      }
    } catch (err: any) {
      alert("Gagal membaca Excel: " + err.message);
    }
  };

  const handleSave = () => {
    const selected = data.filter(d => d.checked);
    if (selected.length === 0) {
      alert("Centang minimal 1 siswa peserta ekstrakurikuler!");
      return;
    }
    onSave(selected);
  };

  const selectedCount = data.filter(d => d.checked).length;

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="card-retro p-3.5 flex flex-wrap items-center justify-between gap-3 bg-retro-cream">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => toggleSelectAll(true)}
            className="btn-retro bg-white text-retro-black hover:bg-slate-100 text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5 text-brand-600" />
            <span>Pilih Semua ({data.length})</span>
          </button>
          <button
            type="button"
            onClick={() => toggleSelectAll(false)}
            className="btn-retro bg-white text-retro-black hover:bg-slate-100 text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5 text-slate-500" />
            <span>Hapus Pilihan</span>
          </button>
          <span className="badge-retro bg-brand-500 text-white text-xs">
            {selectedCount} Siswa Tercentang
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="btn-retro bg-white hover:bg-slate-50 text-retro-black text-xs px-3 py-1.5 flex items-center gap-1.5"
            title="Unduh Template Excel untuk siswa tercentang"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Unduh Excel</span>
          </button>

          <label className="btn-retro bg-white hover:bg-slate-50 text-retro-black text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-brand-600" />
            <span>Unggah Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUploadExcel}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn-retro-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Menyimpan..." : "Simpan Semua Data"}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-retro-border shadow-retro bg-white custom-scrollbar">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-retro-yellow text-retro-black font-black uppercase border-b-2 border-retro-border">
              <th className="py-2.5 px-3 text-center w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={e => toggleSelectAll(e.target.checked)}
                  className="rounded border-2 border-retro-border text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                  title="Pilih / Batalkan Semua"
                />
              </th>
              <th className="py-2.5 px-3 text-center w-28">NIS</th>
              <th className="py-2.5 px-3 min-w-[200px]">Nama Lengkap Siswa</th>
              <th className="py-2.5 px-3 w-40 text-center">Predikat Ekskul</th>
              <th className="py-2.5 px-3 min-w-[260px]">Keterangan / Capaian Kegiatan</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100 font-bold">
            {data.map((item) => (
              <tr
                key={item.nis}
                className={item.checked ? "bg-brand-50/30 hover:bg-brand-50/50" : "opacity-60 hover:opacity-100 hover:bg-slate-50"}
              >
                <td className="py-2 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    onChange={e => handleRowChange(item.nis, "checked", e.target.checked)}
                    className="rounded border-2 border-retro-border text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
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
                    disabled={!item.checked}
                    value={item.predikat || "Baik"}
                    onChange={e => handleRowChange(item.nis, "predikat", e.target.value)}
                    className="w-full text-xs py-1.5 px-2 rounded-lg border-2 border-retro-border font-black shadow-retro-sm bg-white disabled:bg-slate-100 disabled:text-slate-400"
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
                    disabled={!item.checked}
                    value={item.keterangan || ""}
                    onChange={e => handleRowChange(item.nis, "keterangan", e.target.value)}
                    placeholder={item.checked ? "Aktif, disiplin, dan menunjukkan dedikasi..." : "Centang siswa untuk mengisi capaian..."}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border-2 border-retro-border bg-white shadow-retro-sm font-semibold disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-retro p-3.5 flex flex-wrap justify-between items-center gap-3 bg-white">
        <span className="text-xs font-bold text-slate-600">
          Siswa yang <strong>tidak dicentang</strong> otomatis tidak akan memiliki nilai ekskul dan <strong>tidak akan muncul</strong> pada lembar rapor cetak.
        </span>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-retro-primary px-5 py-2.5 text-xs uppercase disabled:opacity-50 flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Menyimpan..." : "Simpan Semua Data"}</span>
        </button>
      </div>
    </div>
  );
}
