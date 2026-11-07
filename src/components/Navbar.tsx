"use client";

import React from "react";
import { User, SchoolConfig, AcademicPeriod } from "@/types";
import { LogOut, User as UserIcon, ShieldCheck, ArrowLeftRight, BarChart3, Printer, Search, Calendar } from "lucide-react";

interface Props {
  currentUser: User | null;
  currentConfig: SchoolConfig;
  activePeriod?: AcademicPeriod;
  academicPeriods?: AcademicPeriod[];
  onSelectPeriod?: (periodId: string) => void;
  onLogout: () => void;
  onSwitchMadrasah: () => void;
  onOpenLegger?: () => void;
  onOpenCetakRapor?: () => void;
  onOpenSearch?: () => void;
  isWali?: boolean;
}

export default function Navbar({
  currentUser,
  currentConfig,
  activePeriod,
  academicPeriods,
  onSelectPeriod,
  onLogout,
  onSwitchMadrasah,
  onOpenLegger,
  onOpenCetakRapor,
  onOpenSearch,
  isWali,
}: Props) {
  const isMts = currentConfig.id === "mts";

  return (
    <header className="bg-retro-cream border-b-2 border-retro-border sticky top-0 z-30 no-print shadow-[0_4px_0_0_#121814]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Brand & Madrasah Badge */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white p-1 border-2 border-retro-border shadow-retro-sm flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="Logo Rapor Digital" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-black text-base sm:text-xl text-retro-black tracking-tight uppercase">
                RAPOR NUSA
              </span>
              <span className="badge-retro bg-brand-500 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5">
                {currentConfig.jenjang}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-retro-black font-extrabold truncate">
              {currentConfig.nama_madrasah}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        {currentUser && (
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* Selector Tahun Ajaran & Semester Aktif */}
            {academicPeriods && activePeriod && onSelectPeriod && (
              <div className="flex items-center gap-1 bg-white border-2 border-retro-border rounded-lg px-2 py-1 shadow-retro-sm">
                <Calendar className="w-3.5 h-3.5 text-brand-600 hidden xs:inline" />
                <select
                  value={activePeriod.id}
                  onChange={e => onSelectPeriod(e.target.value)}
                  className="text-[11px] sm:text-xs font-black text-retro-black bg-transparent outline-none cursor-pointer"
                  title="Pilih Tahun Ajaran & Semester Aktif"
                >
                  {academicPeriods.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tombol Pencarian Siswa & Guru */}
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="btn-retro bg-retro-yellow text-retro-black hover:bg-amber-300 px-2.5 sm:px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-retro-sm"
                title="Pencarian Siswa & Guru (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-retro-black stroke-[2.5]" />
                <span className="hidden sm:inline font-black">Cari</span>
              </button>
            )}

            {/* Tombol menu Wali Kelas (Mobile & Desktop) */}
            {isWali && (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onOpenLegger}
                  className="btn-retro bg-white text-retro-black hover:bg-slate-50 px-3 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Legger</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenCetakRapor}
                  className="btn-retro bg-white text-retro-black hover:bg-slate-50 px-3 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Rapor</span>
                </button>
              </div>
            )}

            {/* Profile badge */}
            <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l-2 border-retro-border">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white flex items-center justify-center text-retro-black border-2 border-retro-border shadow-retro-sm flex-shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-black text-retro-black leading-tight truncate max-w-[150px]">
                  {currentUser.nama_user}
                </p>
                <div className="flex items-center space-x-1">
                  <span className="badge-retro bg-brand-100 text-brand-900 border-none text-[9px] py-0 px-1 font-bold">
                    {currentUser.role.replace(/_/g, " ")} {currentUser.kelas_diampu ? `(${currentUser.kelas_diampu})` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Switch Madrasah Button */}
            <button
              onClick={onSwitchMadrasah}
              className="btn-retro bg-white hover:bg-slate-50 text-retro-black p-2 sm:px-3 sm:py-1.5 text-xs flex items-center gap-1"
              title="Ganti Lembaga Madrasah"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ganti</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="btn-retro bg-retro-orange text-white hover:bg-red-600 p-2 sm:px-3 sm:py-1.5 text-xs flex items-center gap-1"
              title="Keluar / Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
