"use client";

import React, { useState, useMemo, useEffect } from "react";
import { MadrasahId, User, Siswa } from "@/types";
import {
  getAllSiswa,
  getTeachers,
  getHomeroomAssignments,
  getTeacherAssignments,
} from "@/lib/storage";
import {
  Search,
  X,
  User as UserIcon,
  GraduationCap,
  BookOpen,
  UserCheck,
  Building,
  Hash,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  madrasahId: MadrasahId;
  schoolName: string;
}

export default function SearchModal({
  isOpen,
  onClose,
  madrasahId,
  schoolName,
}: Props) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "siswa" | "guru">("all");

  const [allSiswa, setAllSiswa] = useState<Siswa[]>([]);
  const [allTeachers, setAllTeachers] = useState<User[]>([]);
  const [homerooms, setHomerooms] = useState<{ kelas: string; wali_guru_nama: string }[]>([]);
  const [assignments, setAssignments] = useState<{ guru_id: string; nama_mapel: string; kelas: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAllSiswa(getAllSiswa(madrasahId));
      setAllTeachers(getTeachers(madrasahId));
      setHomerooms(getHomeroomAssignments(madrasahId));
      setAssignments(getTeacherAssignments(madrasahId));
    }
  }, [isOpen, madrasahId]);

  // Shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Wali kelas map by kelas
  const waliMap = useMemo(() => {
    const map = new Map<string, string>();
    homerooms.forEach(h => {
      map.set(h.kelas.trim().toUpperCase(), h.wali_guru_nama);
    });
    return map;
  }, [homerooms]);

  // Guru teaching map by guru_id
  const teachingMap = useMemo(() => {
    const map = new Map<string, { mapel: string; kelas: string }[]>();
    assignments.forEach(a => {
      const list = map.get(a.guru_id) || [];
      list.push({ mapel: a.nama_mapel, kelas: a.kelas });
      map.set(a.guru_id, list);
    });
    return map;
  }, [assignments]);

  // Filtered Siswa
  const filteredSiswa = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSiswa.slice(0, 15); // Show first 15 by default
    return allSiswa.filter(
      s =>
        s.nama_siswa.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        (s.nisn && s.nisn.toLowerCase().includes(q)) ||
        s.kelas.toLowerCase().includes(q)
    );
  }, [allSiswa, query]);

  // Filtered Guru
  const filteredGuru = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTeachers.slice(0, 15);
    return allTeachers.filter(
      t =>
        t.nama_user.toLowerCase().includes(q) ||
        (t.nip && t.nip.toLowerCase().includes(q)) ||
        t.username.toLowerCase().includes(q)
    );
  }, [allTeachers, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white border-3 border-retro-border rounded-2xl shadow-retro-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-retro-cream border-b-2 border-retro-border flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-retro-yellow border-2 border-retro-border shadow-retro-sm flex items-center justify-center text-retro-black">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-retro-black uppercase tracking-tight">
                Pencarian Cepat Siswa & Guru
              </h3>
              <p className="text-[11px] font-bold text-slate-600">
                {schoolName} • Database Terintegrasi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl border-2 border-retro-border bg-white hover:bg-red-50 text-retro-black shadow-retro-sm active:translate-x-0.5 active:translate-y-0.5"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 bg-white border-b-2 border-retro-border space-y-3">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ketik nama siswa, NIS, kelas, atau nama guru/NIP..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border-2 border-retro-border bg-retro-cream font-bold placeholder:text-slate-400 focus:outline-none focus:border-brand-500 shadow-retro-sm"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-retro-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-lg border-2 border-retro-border font-black text-[11px] uppercase transition ${
                  activeTab === "all"
                    ? "bg-brand-500 text-white shadow-retro-sm"
                    : "bg-white text-retro-black hover:bg-slate-100"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveTab("siswa")}
                className={`px-3 py-1 rounded-lg border-2 border-retro-border font-black text-[11px] uppercase transition flex items-center gap-1 ${
                  activeTab === "siswa"
                    ? "bg-brand-500 text-white shadow-retro-sm"
                    : "bg-white text-retro-black hover:bg-slate-100"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Siswa ({allSiswa.length})
              </button>
              <button
                onClick={() => setActiveTab("guru")}
                className={`px-3 py-1 rounded-lg border-2 border-retro-border font-black text-[11px] uppercase transition flex items-center gap-1 ${
                  activeTab === "guru"
                    ? "bg-brand-500 text-white shadow-retro-sm"
                    : "bg-white text-retro-black hover:bg-slate-100"
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                Guru ({allTeachers.length})
              </button>
            </div>

            <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">
              Tekan <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[9px]">ESC</kbd> untuk keluar
            </span>
          </div>
        </div>

        {/* Search Results Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh] bg-slate-50/50">
          {/* SEKSI GURU */}
          {(activeTab === "all" || activeTab === "guru") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-retro-black uppercase tracking-wider pb-1 border-b border-slate-200">
                <span className="flex items-center gap-1 text-brand-800">
                  <UserIcon className="w-3.5 h-3.5" />
                  Tenaga Pendidik / Guru ({filteredGuru.length})
                </span>
                {filteredGuru.length > 0 && query && (
                  <span className="text-[10px] text-slate-500 lowercase font-normal">
                    ditemukan {filteredGuru.length} guru
                  </span>
                )}
              </div>

              {filteredGuru.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  Tidak ada data guru yang cocok dengan &quot;{query}&quot;
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredGuru.map(guru => {
                    const tList = teachingMap.get(guru.id) || [];
                    const isWali = homerooms.some(h => h.wali_guru_nama === guru.nama_user);
                    const waliKelas = homerooms.find(h => h.wali_guru_nama === guru.nama_user)?.kelas;

                    return (
                      <div
                        key={guru.id}
                        className="bg-white border-2 border-retro-border rounded-xl p-3 shadow-retro-sm hover:shadow-retro hover:-translate-y-0.5 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h5 className="font-black text-xs text-retro-black uppercase truncate">
                              {guru.nama_user}
                            </h5>
                            <p className="text-[10px] text-slate-500 font-mono">
                              NIP/NIK: {guru.nip || "-"}
                            </p>
                          </div>
                          <span className="badge-retro bg-retro-yellow text-retro-black text-[9px] px-1.5 py-0.5 flex-shrink-0">
                            {guru.jenis_kelamin === "P" ? "Ibu Guru" : "Bapak Guru"}
                          </span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex flex-wrap items-center gap-1 text-[10px]">
                          <span className="bg-brand-50 text-brand-800 border border-brand-200 rounded px-1.5 py-0.5 font-bold font-mono">
                            user: {guru.username}
                          </span>
                          {isWali && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 rounded px-1.5 py-0.5 font-black flex items-center gap-0.5">
                              <UserCheck className="w-2.5 h-2.5" />
                              Wali: {waliKelas}
                            </span>
                          )}
                          {tList.length > 0 ? (
                            <span className="text-slate-600 font-semibold truncate max-w-[200px]" title={tList.map(t => `${t.mapel} (${t.kelas})`).join(", ")}>
                              • {tList.length} Mapel diampu
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Belum ada tugas mapel</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SEKSI SISWA */}
          {(activeTab === "all" || activeTab === "siswa") && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-black text-retro-black uppercase tracking-wider pb-1 border-b border-slate-200">
                <span className="flex items-center gap-1 text-brand-800">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Peserta Didik / Siswa ({filteredSiswa.length})
                </span>
                {filteredSiswa.length > 0 && query && (
                  <span className="text-[10px] text-slate-500 lowercase font-normal">
                    ditemukan {filteredSiswa.length} siswa
                  </span>
                )}
              </div>

              {filteredSiswa.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  Tidak ada data siswa yang cocok dengan &quot;{query}&quot;
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredSiswa.map(siswa => {
                    const wali = waliMap.get(siswa.kelas.trim().toUpperCase());

                    return (
                      <div
                        key={siswa.nis}
                        className="bg-white border-2 border-retro-border rounded-xl p-3 shadow-retro-sm hover:shadow-retro hover:-translate-y-0.5 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h5 className="font-black text-xs text-retro-black uppercase truncate">
                              {siswa.nama_siswa}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                              <span>NIS: {siswa.nis}</span>
                              {siswa.nisn && <span>• NISN: {siswa.nisn}</span>}
                            </div>
                          </div>
                          <span className="badge-retro bg-brand-500 text-white text-[10px] font-black px-2 py-0.5 flex-shrink-0">
                            {siswa.kelas}
                          </span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px]">
                          <span className="text-slate-600 font-bold">
                            JK: {siswa.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki"}
                          </span>
                          {wali && (
                            <span className="text-slate-700 font-semibold truncate max-w-[180px]">
                              Wali: <strong className="text-retro-black">{wali}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-retro-cream border-t-2 border-retro-border flex items-center justify-between text-[11px] font-bold text-slate-600">
          <span>
            Total Terdaftar: <strong>{allSiswa.length} Siswa</strong> • <strong>{allTeachers.length} Guru</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 btn-retro bg-white text-retro-black hover:bg-slate-100 text-xs font-black uppercase"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
