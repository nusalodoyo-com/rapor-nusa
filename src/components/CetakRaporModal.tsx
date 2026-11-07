"use client";

import React, { useState } from "react";
import { LeggerResponse, SchoolConfig, User } from "@/types";
import { Printer, X, Upload, Check } from "lucide-react";
import KopMadrasah from "./KopMadrasah";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leggerData: LeggerResponse | null;
  tahun: string;
  semester: string;
  kelas: string;
  config: SchoolConfig;
  currentUser: User | null;
}

export default function CetakRaporModal({
  isOpen,
  onClose,
  leggerData,
  tahun,
  semester,
  kelas,
  config,
  currentUser,
}: Props) {
  const [selectedNis, setSelectedNis] = useState<string>("");
  const [ttdBase64, setTtdBase64] = useState<string>(currentUser?.ttd_url || "");

  if (!isOpen || !leggerData || !leggerData.success) return null;

  const currentSiswa = leggerData.siswa.find(s => s.nis === selectedNis);

  const handleTtdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setTtdBase64(String(ev.target.result));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    if (!selectedNis) {
      alert("Pilih siswa terlebih dahulu!");
      return;
    }
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl no-print flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Pilih Siswa untuk Dicetak:
              </label>
              <select
                value={selectedNis}
                onChange={e => setSelectedNis(e.target.value)}
                className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Siswa Kelas {kelas} --</option>
                {leggerData.siswa.map(s => (
                  <option key={s.nis} value={s.nis}>
                    {s.nis} - {s.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-56">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Upload TTD Wali Kelas:
              </label>
              <label className="flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition text-slate-600 bg-white">
                <Upload className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                <span>{ttdBase64 ? "Ganti Tanda Tangan" : "Unggah Gambar TTD"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTtdUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!selectedNis}
              className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm disabled:opacity-40"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Cetak Rapor / PDF (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Sheet (A4 Portrait Container) */}
        <div className="p-6 overflow-auto flex-1 custom-scrollbar bg-slate-100 flex justify-center">
          {!currentSiswa ? (
            <div className="m-auto text-center py-16 text-slate-500 bg-white p-8 rounded-xl border border-slate-200 max-w-md">
              <p className="font-semibold text-sm text-slate-700 mb-1">Lembar Rapor Belum Dipilih</p>
              <p className="text-xs">Silakan pilih salah satu siswa dari daftar di atas untuk memuat lembar rapor resmi.</p>
            </div>
          ) : (
            <div className="rapor-print-container bg-white shadow-xl border border-slate-300 p-8 w-full max-w-[210mm] text-slate-900 leading-normal">
              {/* Kop Madrasah Resmi */}
              <KopMadrasah config={config} />

              <div className="text-center mb-4">
                <h4 className="text-sm font-black tracking-wider uppercase border-b-2 border-slate-900 inline-block pb-0.5">
                  LAPORAN HASIL BELAJAR PESERTA DIDIK
                </h4>
                <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  Semester {semester === "1" ? "Gasal" : "Genap"} Tahun Ajaran {tahun}
                </p>
              </div>

              {/* Data Identitas Siswa */}
              <div className="grid grid-cols-2 gap-x-6 text-[11px] mb-4 pb-2 border-b border-slate-300">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-28 font-semibold text-slate-700">Nama Siswa</span>
                    <span className="font-bold text-slate-900">: {currentSiswa.nama}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-semibold text-slate-700">NIS / NISN</span>
                    <span className="font-mono text-slate-900">: {currentSiswa.nis}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-28 font-semibold text-slate-700">Kelas</span>
                    <span className="font-bold text-slate-900">: {kelas}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-semibold text-slate-700">Fase / Tingkat</span>
                    <span className="text-slate-900">: MA (Madrasah Aliyah)</span>
                  </div>
                </div>
              </div>

              {/* A. Capaian Intrakurikuler */}
              <div className="mb-4">
                <h5 className="text-[11px] font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                  A. Capaian Intrakurikuler (Mata Pelajaran)
                </h5>
                <table className="w-full text-[10px] border border-slate-800 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-800 text-center font-bold">
                      <th rowSpan={2} className="border border-slate-800 py-1.5 px-2 w-8">No</th>
                      <th rowSpan={2} className="border border-slate-800 py-1.5 px-3 text-left">Mata Pelajaran</th>
                      <th colSpan={3} className="border border-slate-800 py-1 px-1">Nilai Capaian</th>
                      <th rowSpan={2} className="border border-slate-800 py-1.5 px-2 min-w-[200px] text-left">Lingkup Materi</th>
                    </tr>
                    <tr className="bg-slate-50 text-slate-800 border-b border-slate-800 text-center font-bold">
                      <th className="border border-slate-800 py-1 px-1 w-10">LM</th>
                      <th className="border border-slate-800 py-1 px-1 w-10">STS</th>
                      <th className="border border-slate-800 py-1 px-1 w-10">SAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leggerData.mapel.map((m, idx) => {
                      const detail = currentSiswa.mapelDetails[m.kode_mapel] || {
                        lm: 0,
                        sts: 0,
                        sas: 0,
                        lingkup_materi: "-",
                      };
                      return (
                        <tr key={m.kode_mapel} className="border-b border-slate-700">
                          <td className="border border-slate-800 py-1 px-1 text-center font-mono">{idx + 1}</td>
                          <td className="border border-slate-800 py-1 px-2 font-medium">{m.nama_mapel}</td>
                          <td className="border border-slate-800 py-1 px-1 text-center font-mono">{detail.lm || "-"}</td>
                          <td className="border border-slate-800 py-1 px-1 text-center font-mono">{detail.sts || "-"}</td>
                          <td className="border border-slate-800 py-1 px-1 text-center font-mono">{detail.sas || "-"}</td>
                          <td className="border border-slate-800 py-1 px-2 text-left text-[9px] text-slate-700">{detail.lingkup_materi}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* B. Capaian Ekstrakurikuler */}
              {currentSiswa.ekskul && currentSiswa.ekskul.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-[11px] font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                    B. Capaian Ekstrakurikuler
                  </h5>
                  <table className="w-full text-[10px] border border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-800 text-center font-bold">
                        <th className="border border-slate-800 py-1 px-2 w-8">No</th>
                        <th className="border border-slate-800 py-1 px-3 text-left w-48">Kegiatan Ekstrakurikuler</th>
                        <th className="border border-slate-800 py-1 px-2 w-24">Predikat</th>
                        <th className="border border-slate-800 py-1 px-3 text-left">Keterangan / Capaian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSiswa.ekskul.map((e, idx) => (
                        <tr key={idx} className="border-b border-slate-700">
                          <td className="border border-slate-800 py-1 px-2 text-center font-mono">{idx + 1}</td>
                          <td className="border border-slate-800 py-1 px-3 font-medium">{e.nama}</td>
                          <td className="border border-slate-800 py-1 px-2 text-center font-semibold">{e.nilai}</td>
                          <td className="border border-slate-800 py-1 px-3 text-[9px]">{e.materi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* C. Presensi Kehadiran */}
              <div className="mb-4">
                <h5 className="text-[11px] font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                  C. Ketidakhadiran
                </h5>
                <table className="w-56 text-[10px] border border-slate-800 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-800 font-bold">
                      <th className="border border-slate-800 py-1 px-2 text-left">Keterangan</th>
                      <th className="border border-slate-800 py-1 px-2 text-center w-14">Jumlah</th>
                      <th className="border border-slate-800 py-1 px-2 text-center w-14">Satuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-800 py-1 px-2">Sakit (S)</td>
                      <td className="border border-slate-800 py-1 px-2 text-center font-mono">{currentSiswa.sakit || 0}</td>
                      <td className="border border-slate-800 py-1 px-2 text-center">Hari</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 py-1 px-2">Izin (I)</td>
                      <td className="border border-slate-800 py-1 px-2 text-center font-mono">{currentSiswa.izin || 0}</td>
                      <td className="border border-slate-800 py-1 px-2 text-center">Hari</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 py-1 px-2">Tanpa Keterangan (A)</td>
                      <td className="border border-slate-800 py-1 px-2 text-center font-mono">{currentSiswa.alpha || 0}</td>
                      <td className="border border-slate-800 py-1 px-2 text-center">Hari</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* D. Catatan Wali Kelas & Keputusan */}
              <div className="mb-6">
                <h5 className="text-[11px] font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                  D. Catatan Perkembangan & Evaluasi Belajar
                </h5>
                <div className="border border-slate-800 p-2.5 min-h-[48px] text-[10px] text-slate-800 rounded-none bg-white">
                  {currentSiswa.catatan || "Ananda telah menunjukkan usaha belajar yang baik. Terus tingkatkan kedisiplinan dan pertahankan motivasi belajar."}
                </div>
              </div>

              {/* Tanda Tangan Tiga Pihak */}
              <div className="grid grid-cols-3 text-center text-[10px] text-slate-900 signature-block mt-6">
                <div>
                  <p className="mb-14">Mengetahui,<br /><strong>Orang Tua / Wali</strong></p>
                  <p className="font-bold underline uppercase">(....................................)</p>
                </div>
                <div>
                  <p className="mb-14">Mengetahui,<br /><strong>Kepala Madrasah</strong></p>
                  <p className="font-bold underline uppercase">{config.kepala_madrasah}</p>
                  <p className="text-[9px] text-slate-600">NIP: {config.nip_kepala}</p>
                </div>
                <div>
                  <p className="mb-2">
                    {config.kota_tanggal}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />
                    <strong>Wali Kelas {kelas}</strong>
                  </p>
                  <div className="h-12 flex items-center justify-center">
                    {ttdBase64 ? (
                      <img src={ttdBase64} alt="Tanda Tangan" className="max-h-12 max-w-[120px] object-contain" />
                    ) : (
                      <div className="h-12"></div>
                    )}
                  </div>
                  <p className="font-bold underline uppercase mt-1">
                    {currentUser?.nama_user || "Wali Kelas"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
