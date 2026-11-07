"use client";

import React, { useRef } from "react";
import { LeggerResponse, SchoolConfig } from "@/types";
import { Printer, X, Download } from "lucide-react";
import KopMadrasah from "./KopMadrasah";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leggerData: LeggerResponse | null;
  tahun: string;
  semester: string;
  kelas: string;
  config: SchoolConfig;
}

export default function LeggerModal({
  isOpen,
  onClose,
  leggerData,
  tahun,
  semester,
  kelas,
  config,
}: Props) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !leggerData || !leggerData.success) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl no-print">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>📊 Legger Nilai Kelas:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                {kelas}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Tahun Ajaran: {tahun} | Semester: {semester === "1" ? "1 (Gasal)" : "2 (Genap)"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Cetak / Simpan PDF Legger (Landscape)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Legger Printable Area */}
        <div className="p-6 overflow-auto flex-1 custom-scrollbar" ref={printAreaRef}>
          <div className="legger-print-container">
            {/* Header Cetak */}
            <div className="text-center mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {config.nama_yayasan}
              </h4>
              <h2 className="text-base font-black text-emerald-900 tracking-wide uppercase">
                LEGER NILAI HASIL BELAJAR PESERTA DIDIK - {config.nama_madrasah}
              </h2>
              <div className="flex justify-center items-center gap-6 text-xs text-slate-600 mt-1 font-medium">
                <span><strong>Kelas:</strong> {kelas}</span>
                <span>•</span>
                <span><strong>Semester:</strong> {semester === "1" ? "Gasal" : "Genap"}</span>
                <span>•</span>
                <span><strong>Tahun Ajaran:</strong> {tahun}</span>
              </div>
            </div>

            {/* Tabel Matriks Nilai */}
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] border border-slate-900 border-collapse text-center">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900">
                    <th rowSpan={2} className="border border-slate-900 py-2 px-1 w-8">No</th>
                    <th rowSpan={2} className="border border-slate-900 py-2 px-1 w-16">NIS</th>
                    <th rowSpan={2} className="border border-slate-900 py-2 px-2 min-w-[140px] text-left">Nama Siswa</th>
                    <th colSpan={leggerData.mapel.length} className="border border-slate-900 py-1 px-1 bg-emerald-50 text-emerald-950 font-bold">
                      Mata Pelajaran (Nilai Akhir)
                    </th>
                    <th colSpan={3} className="border border-slate-900 py-1 px-1 bg-amber-50 text-amber-950 font-bold">
                      Ketidakhadiran
                    </th>
                    <th rowSpan={2} className="border border-slate-900 py-2 px-2 min-w-[120px] text-left">
                      Catatan Wali / Keputusan
                    </th>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-900">
                    {leggerData.mapel.map(m => (
                      <th
                        key={m.kode_mapel}
                        className="border border-slate-900 py-1 px-1 w-10 text-[9px] font-bold"
                        title={m.nama_mapel}
                      >
                        {m.kode_mapel}
                      </th>
                    ))}
                    <th className="border border-slate-900 py-1 px-1 w-6 bg-amber-100/50">S</th>
                    <th className="border border-slate-900 py-1 px-1 w-6 bg-blue-100/50">I</th>
                    <th className="border border-slate-900 py-1 px-1 w-6 bg-rose-100/50">A</th>
                  </tr>
                </thead>
                <tbody>
                  {leggerData.siswa.map((s, idx) => (
                    <tr key={s.nis} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="border border-slate-900 py-1 px-1 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-900 py-1 px-1 text-center font-mono font-medium">{s.nis}</td>
                      <td className="border border-slate-900 py-1 px-2 text-left font-semibold text-slate-800">{s.nama}</td>
                      {leggerData.mapel.map(m => {
                        const score = s.scores[m.kode_mapel] || 0;
                        return (
                          <td
                            key={m.kode_mapel}
                            className={`border border-slate-900 py-1 px-1 font-mono font-semibold ${
                              score < 70 ? "text-rose-600 bg-rose-50/30" : "text-slate-800"
                            }`}
                          >
                            {score || "-"}
                          </td>
                        );
                      })}
                      <td className="border border-slate-900 py-1 px-1 font-mono">{s.sakit || 0}</td>
                      <td className="border border-slate-900 py-1 px-1 font-mono">{s.izin || 0}</td>
                      <td className="border border-slate-900 py-1 px-1 font-mono text-rose-600">{s.alpha || 0}</td>
                      <td className="border border-slate-900 py-1 px-2 text-left text-[9px]">
                        {s.catatan || s.keputusan || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kolom Tanda Tangan */}
            <div className="grid grid-cols-2 mt-8 text-xs text-center signature-block">
              <div>
                <p className="mb-14">Mengetahui,<br /><strong>Kepala Madrasah</strong></p>
                <p className="font-bold underline uppercase">{config.kepala_madrasah}</p>
                <p className="text-[10px] text-slate-500">NIP: {config.nip_kepala}</p>
              </div>
              <div>
                <p className="mb-14">{config.kota_tanggal}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br /><strong>Wali Kelas {kelas}</strong></p>
                <p className="font-bold underline uppercase">(..................................................)</p>
                <p className="text-[10px] text-slate-500">NIP: -</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
