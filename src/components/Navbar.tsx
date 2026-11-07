"use client";

import React from "react";
import { User, SchoolConfig } from "@/types";
import { GraduationCap, LogOut, User as UserIcon, ShieldCheck, ArrowLeftRight } from "lucide-react";

interface Props {
  currentUser: User | null;
  currentConfig: SchoolConfig;
  onLogout: () => void;
  onSwitchMadrasah: () => void;
  onOpenLegger?: () => void;
  onOpenCetakRapor?: () => void;
  isWali?: boolean;
}

export default function Navbar({
  currentUser,
  currentConfig,
  onLogout,
  onSwitchMadrasah,
  onOpenLegger,
  onOpenCetakRapor,
  isWali,
}: Props) {
  const isMts = currentConfig.id === "mts";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Madrasah Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-white p-1 border-2 border-[#00ab00] shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="Logo Rapor Digital" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">RAPOR NUSA</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-brand-100 text-brand-800 border border-brand-300">
                {currentConfig.jenjang}
              </span>
            </div>
            <p className="text-xs text-[#045e07] font-bold">{currentConfig.nama_madrasah}</p>
          </div>
        </div>

        {/* Right side controls */}
        {currentUser && (
          <div className="flex items-center space-x-3">
            {/* Tombol menu Wali Kelas */}
            {isWali && (
              <div className="hidden sm:flex items-center space-x-2 mr-2">
                <button
                  type="button"
                  onClick={onOpenLegger}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
                >
                  📊 Legger Kelas
                </button>
                <button
                  type="button"
                  onClick={onOpenCetakRapor}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition shadow-sm"
                >
                  📄 Cetak Rapor
                </button>
              </div>
            )}

            {/* Profile badge */}
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.nama_user}
                </p>
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                  <span className="text-[10px] text-slate-500 capitalize">
                    {currentUser.role.replace(/_/g, " ")} {currentUser.kelas_diampu ? `(${currentUser.kelas_diampu})` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Switch Madrasah Button */}
            <button
              onClick={onSwitchMadrasah}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-300"
              title="Ganti Lembaga Madrasah"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 mr-1 text-slate-600" />
              <span className="hidden sm:inline">Ganti Madrasah</span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition border border-rose-200"
              title="Keluar dari akun"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
