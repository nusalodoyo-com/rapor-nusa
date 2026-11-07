"use client";

import React from "react";
import { User } from "@/types";
import { GraduationCap, LogOut, User as UserIcon, ShieldCheck } from "lucide-react";

interface Props {
  currentUser: User | null;
  onLogout: () => void;
  onOpenLegger?: () => void;
  onOpenCetakRapor?: () => void;
  isWali?: boolean;
}

export default function Navbar({
  currentUser,
  onLogout,
  onOpenLegger,
  onOpenCetakRapor,
  isWali,
}: Props) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">RAPOR NUSA</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                MA Maarif
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">MA Ma&apos;arif Nurus Salam Blitar</p>
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
