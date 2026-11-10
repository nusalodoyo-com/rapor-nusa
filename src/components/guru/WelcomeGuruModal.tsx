"use client";

import React, { useState } from "react";
import { User, SchoolConfig } from "@/types";
import {
  X,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UserCog,
  BookOpen,
  Target,
  Sliders,
  FileSpreadsheet,
  Send,
  Printer,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Layers,
  Award,
  AlertTriangle,
  Mail,
  Phone,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  config: SchoolConfig;
  onOpenProfile?: () => void;
}

export default function WelcomeGuruModal({
  isOpen,
  onClose,
  currentUser,
  config,
  onOpenProfile,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const isMissingContact = !currentUser.email?.trim() || !currentUser.no_wa?.trim();

  const handleClose = () => {
    if (dontShowAgain && typeof window !== "undefined") {
      localStorage.setItem(`rapor_nusa_welcome_dismissed_${currentUser.id}`, "true");
    }
    onClose();
  };

  const steps = [
    {
      id: "intro",
      title: "Selamat Datang!",
      subtitle: "Pengenalan Portal Rapor Internal Nusalodoyo",
      icon: Sparkles,
      color: "bg-retro-yellow text-retro-black",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50 border-2 border-brand-500 shadow-retro-sm">
            <h4 className="text-sm font-black text-brand-950 uppercase mb-1">
              Ahlan Wa Sahlan, Bapak/Ibu {currentUser.nama_user}!
            </h4>
            <p className="text-xs text-brand-900 leading-relaxed font-medium">
              Selamat datang di <strong>Portal Rapor Internal Nusalodoyo</strong> untuk lingkungan <strong>{config.nama_madrasah}</strong>. Sistem ini dirancang untuk mempermudah Bapak/Ibu Guru dalam mengelola penilaian Kurikulum Merdeka (KMA 1503 Tahun 2025), perumusan KKTP, sinkronisasi template RDM Kemenag, hingga pencetakan rapor tengah semester secara cepat, transparan, dan terintegrasi.
            </p>
          </div>

          {/* Pemberitahuan Penting: Isi Email & Nomor WhatsApp saat pertama kali login */}
          {isMissingContact && (
            <div className="p-4 rounded-xl bg-amber-100 border-2 border-amber-600 shadow-retro-sm space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-black text-amber-950 uppercase">
                    PENTING: Lengkapi Data Email & Nomor WhatsApp Anda!
                  </h5>
                  <p className="text-[11px] text-amber-900 font-medium mt-0.5 leading-snug">
                    Anda belum mengisi {!currentUser.email?.trim() ? <strong>Alamat Email</strong> : ""}{!currentUser.email?.trim() && !currentUser.no_wa?.trim() ? " dan " : ""}{!currentUser.no_wa?.trim() ? <strong>Nomor WhatsApp</strong> : ""} di profil. Silakan lengkapi keduanya sekarang agar Bapak/Ibu dapat melakukan <strong>Login menggunakan Email atau Nomor WhatsApp</strong> selain Username!
                  </p>
                </div>
              </div>
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProfile();
                  }}
                  className="btn-retro bg-retro-yellow hover:bg-amber-400 text-retro-black px-3.5 py-2 text-xs font-black flex items-center gap-1.5 shadow-retro-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Lengkapi Email & No. WhatsApp Sekarang →</span>
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs">
              <span className="font-black text-brand-900 block mb-1">⚡ Efisien & Fleksibel</span>
              <p className="text-[11px] text-slate-600">
                Bebas memilih kelas dan mata pelajaran yang diampu tanpa pembatasan yang kaku.
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs">
              <span className="font-black text-purple-900 block mb-1">🎯 KKTP Merdeka Terpadu</span>
              <p className="text-[11px] text-slate-600">
                Fasilitasi 3 pendekatan resmi: Deskripsi Kriteria, Rubrik 4 Level, & Interval Skala.
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs">
              <span className="font-black text-amber-900 block mb-1">📥 Ekspor RDM 100% Persis</span>
              <p className="text-[11px] text-slate-600">
                Download file Excel standar template RDM harian dan PAS yang siap upload ke sistem Kemenag.
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 font-bold flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Ikuti panduan 7 langkah praktis berikut untuk memulai pengisian nilai dengan benar dan nyaman.
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "step-1",
      title: "Langkah 1: Perbarui Profil & Sandi",
      subtitle: "Keamanan Akun & Kelengkapan Identitas",
      icon: UserCog,
      color: "bg-blue-100 text-blue-950",
      content: (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Sebagai langkah awal, pastikan identitas dan kredensial akun Bapak/Ibu sudah terkonfigurasi dengan benar:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs flex gap-3 items-start">
              <span className="w-6 h-6 rounded-lg bg-brand-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h5 className="text-xs font-black text-retro-black uppercase">
                  Klik Tombol &quot;Ubah Profil & Password&quot;
                </h5>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Tombol ini terletak di bilah informasi guru paling atas dashboard Bapak/Ibu.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs flex gap-3 items-start">
              <span className="w-6 h-6 rounded-lg bg-brand-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h5 className="text-xs font-black text-retro-black uppercase">
                  Lengkapi Data Diri Guru
                </h5>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Isikan <strong>Gelar Depan</strong>, <strong>Gelar Belakang</strong>, <strong>Tempat & Tanggal Lahir</strong>, <strong>Nomor WhatsApp</strong>, serta <strong>Email</strong> aktif.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border-2 border-rose-300 shadow-retro-xs flex gap-3 items-start">
              <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h5 className="text-xs font-black text-rose-950 uppercase">
                  Ganti Kata Sandi Default
                </h5>
                <p className="text-[11px] text-rose-900 mt-0.5 font-medium">
                  Demi keamanan privasi data penilaian siswa, segera ganti kata sandi bawaan sistem (<strong>Lodoyo2026</strong>) dengan kata sandi pribadi Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "step-2",
      title: "Langkah 2: Pilih Kelas & Mata Pelajaran",
      subtitle: "Navigasi Fleksibel Pengisian Nilai",
      icon: BookOpen,
      color: "bg-emerald-100 text-emerald-950",
      content: (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Portal ini memberikan kebebasan penuh bagi Bapak/Ibu Guru untuk memilih kelas dan mata pelajaran mana yang hendak dinilai:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs space-y-1">
              <span className="badge-retro bg-brand-500 text-white text-[10px]">Pilihan 1</span>
              <h5 className="text-xs font-black text-retro-black uppercase">Pilih Rombongan Belajar (Kelas)</h5>
              <p className="text-[11px] text-slate-600">
                Gunakan dropdown pemilih rombel untuk memilih kelas yang dituju (misal: VII-A s/d VII-K di MTs, atau 10A s/d 10D di MA).
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs space-y-1">
              <span className="badge-retro bg-retro-yellow text-retro-black text-[10px]">Pilihan 2</span>
              <h5 className="text-xs font-black text-retro-black uppercase">Pilih Mata Pelajaran</h5>
              <p className="text-[11px] text-slate-600">
                Pilih mata pelajaran yang Anda ampu dari daftar KMA 1503 Tahun 2025. Data nama siswa kelas terpilih akan langsung tampil secara instan.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-[11px] text-slate-600">
            💡 <strong>Info:</strong> Jika Bapak/Ibu juga bertugas membina kegiatan ekstrakurikuler, klik tab <em>&quot;2. Nilai Ekstrakurikuler (Bakat & Minat)&quot;</em> di bilah atas untuk menginput predikat dan deskripsi ekskul siswa.
          </div>
        </div>
      ),
    },
    {
      id: "step-3",
      title: "Langkah 3: Atur KKTP Kurikulum Merdeka",
      subtitle: "Kriteria Ketercapaian Tujuan Pembelajaran",
      icon: Target,
      color: "bg-purple-100 text-purple-950",
      content: (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Klik tombol ungu <strong>&quot;KKTP: [Nama Pendekatan]&quot;</strong> di atas tabel nilai untuk membuka panel KKTP. Anda dapat memilih 1 dari 3 pendekatan resmi:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-white rounded-xl border-2 border-brand-400 shadow-retro-xs">
              <span className="font-black text-brand-900 block mb-0.5">1. Deskripsi Kriteria</span>
              <p className="text-[11px] text-slate-600">
                Menyusun daftar kriteria konkret yang harus ditunjukkan siswa, serta menentukan syarat minimal jumlah kriteria yang harus dicapai agar tuntas (misal: minimal 3 dari 4 kriteria).
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border-2 border-blue-400 shadow-retro-xs">
              <span className="font-black text-blue-900 block mb-0.5">2. Rubrik Penilaian (4 Level)</span>
              <p className="text-[11px] text-slate-600">
                Menilai tahapan perkembangan: <em>Baru Berkembang</em>, <em>Layak</em>, <em>Cakap</em>, dan <em>Mahir</em> dengan menetapkan ambang batas level ketuntasan (rekomendasi: level Cakap).
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-xl border-2 border-purple-400 shadow-retro-xs">
              <span className="font-black text-purple-900 block mb-0.5">3. Interval Nilai (Skala 0% – 100%)</span>
              <p className="text-[11px] text-slate-600">
                Menetapkan rentang: <strong>0–40%</strong> (Remedial Total), <strong>41–65%</strong> (Remedial Sebagian), <strong>66–85%</strong> (Tuntas), dan <strong>86–100%</strong> (Pengayaan).
              </p>
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-300 text-[11px] text-purple-950 font-semibold">
            🎯 <strong>Fungsi KKTP:</strong> Hasil pengisian KKTP ini otomatis memunculkan label <em>Tuntas / Remedial / Pengayaan</em> pada setiap baris siswa di tabel nilai sebagai pedoman tindak lanjut pembelajaran Bapak/Ibu.
          </div>
        </div>
      ),
    },
    {
      id: "step-4",
      title: "Langkah 4: Input Nilai Formatif & Sumatif",
      subtitle: "Lingkup Materi, Sub-Skill Bahasa, & Deskripsi Otomatis",
      icon: Award,
      color: "bg-amber-100 text-amber-950",
      content: (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Inputkan capaian hasil belajar peserta didik pada kolom yang disediakan:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs">
              <span className="font-black text-retro-black block mb-0.5">Lingkup Materi (Harian 1 s/d H4)</span>
              <p className="text-[11px] text-slate-600">
                Tuliskan topik pokok bahasan pada form Materi 1–4, lalu isikan nilai formatif harian siswa (skala 0–100).
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border-2 border-brand-500 shadow-retro-xs">
              <span className="font-black text-brand-950 block mb-0.5">
                🌟 Khusus MA: English & Arabic Development Program (EDP & ADP)
              </span>
              <p className="text-[11px] text-brand-900 leading-snug">
                Pada mata pelajaran EDP & ADP, kolom penilaian otomatis disesuaikan menjadi 4 sub-aspek keahlian berbahasa: <strong>Reading</strong>, <strong>Speaking</strong>, <strong>Listening</strong>, dan <strong>Writing</strong>. Nilai ini otomatis disematkan ke dalam rapor cetak siswa!
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs">
              <span className="font-black text-retro-black block mb-0.5">Sumatif Tengah (STS) & Akhir (SAS)</span>
              <p className="text-[11px] text-slate-600">
                Isikan nilai STS (PTS) dan SAS (PAS). Nilai Akhir (NA) dan Predikat (A/B/C/D) akan dihitung otomatis secara real-time.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-retro-yellow/40 rounded-xl border border-amber-400 text-[11px] text-retro-black flex items-center justify-between">
            <span>✨ Ingin membuat catatan rapor dengan cepat?</span>
            <span className="font-black bg-retro-yellow px-2 py-0.5 rounded border border-retro-border text-[10px]">
              Klik tombol &quot;Otomatiskan Deskripsi&quot;
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "step-5",
      title: "Langkah 5: Atur Bobot & Backup RDM (Excel)",
      subtitle: "Persentase Bobot & Download Format Standar RDM Kemenag",
      icon: FileSpreadsheet,
      color: "bg-emerald-100 text-emerald-950",
      content: (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-retro-black uppercase">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span>Atur Bobot Penilaian</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Bapak/Ibu dapat menyesuaikan persentase bobot Formatif, STS, dan SAS (default sistem: <strong>50% : 25% : 25%</strong>). Pastikan total bobot bernilai pas 100%.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-retro-black uppercase">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Download Template RDM</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Perlu backup atau upload ke RDM Kemenag? Klik menu <strong>Download Template RDM</strong> untuk mengunduh Excel PH / PAS yang sudah terisi otomatis!
              </p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs">
            <h5 className="text-xs font-black text-retro-black uppercase mb-1">
              📥 Unggah Nilai dari File Excel
            </h5>
            <p className="text-[11px] text-slate-600">
              Jika Bapak/Ibu lebih nyaman mengisi data secara offline di Excel, Anda cukup mengunggah kembali file Excel tersebut melalui tombol <strong>&quot;Upload Nilai Excel&quot;</strong>.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs font-black text-amber-950 flex items-center justify-between">
            <span>💾 Jangan Lupa Simpan Perubahan:</span>
            <span className="badge-retro bg-brand-500 text-white text-[10px]">
              Klik tombol hijau &quot;SIMPAN SEMUA NILAI&quot;
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "step-6",
      title: "Langkah 6: Kirim Nilai ke Wali Kelas",
      subtitle: "Finalisasi Data Penilaian & Mekanisme Penguncian",
      icon: Send,
      color: "bg-blue-100 text-blue-950",
      content: (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Setelah pengisian nilai selesai dan dipastikan akurat, lakukan langkah finalisasi:
          </p>

          <div className="p-4 bg-emerald-50 rounded-xl border-2 border-brand-500 shadow-retro-sm space-y-2">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-brand-600" />
              <h5 className="text-xs font-black text-brand-950 uppercase">
                Klik &quot;Kirim Nilai ke Wali Kelas&quot;
              </h5>
            </div>
            <p className="text-xs text-brand-900 leading-relaxed">
              Tindakan ini akan menyinkronkan seluruh nilai Anda langsung ke <strong>Buku Legger Kelas</strong> dan lembar <strong>Rapor Siswa</strong> yang dikelola oleh Wali Kelas.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs space-y-1">
            <h5 className="text-xs font-black text-retro-black uppercase">
              🔒 Penguncian Nilai Otomatis
            </h5>
            <p className="text-[11px] text-slate-600">
              Setelah dikirim, tabel nilai akan terkunci agar data tidak terubah secara tidak sengaja saat proses cetak rapor berlangsung.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 font-medium">
            🔓 <strong>Ada Nilai yang Perlu Direvisi?</strong> Jangan khawatir! Bapak/Ibu cukup menekan tombol <strong>&quot;Buka Kunci Nilai&quot;</strong> di bilah atas untuk kembali mengedit nilai dan mengirimkannya ulang.
          </div>
        </div>
      ),
    },
    {
      id: "step-7",
      title: "Langkah 7: Fitur Khusus Wali Kelas",
      subtitle: "Cetak Rapor Tengah Semester & Kelengkapan Ekstrakurikuler",
      icon: Printer,
      color: "bg-purple-100 text-purple-950",
      content: (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Jika Bapak/Ibu tercatat sebagai <strong>Wali Kelas</strong>, terdapat tombol kuning khusus di header: <strong>&quot;Beralih ke Tugas Wali ([Kelas])&quot;</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs space-y-1">
              <span className="font-black text-brand-900 block">🖨️ Cetak Rapor Single Page</span>
              <p className="text-[11px] text-slate-600">
                Mencetak Rapor Tengah Semester dalam format standar A4 Portrait 1 Halaman Rapi lengkap dengan logo resmi dan tanda tangan Kepala Madrasah.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs space-y-1">
              <span className="font-black text-blue-900 block">📋 Buku Legger Nilai</span>
              <p className="text-[11px] text-slate-600">
                Melihat matriks nilai seluruh mata pelajaran, peringkat kelas otomatis, dan unduh backup data nilai per kelas.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs space-y-1">
              <span className="font-black text-purple-900 block">🩺 Presensi & Kehadiran</span>
              <p className="text-[11px] text-slate-600">
                Mengisi jumlah ketidakhadiran siswa: Sakit (S), Izin (I), dan Tanpa Keterangan (A).
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border-2 border-retro-border shadow-retro-xs space-y-1">
              <span className="font-black text-amber-900 block">💬 Catatan Wali Kelas</span>
              <p className="text-[11px] text-slate-600">
                Memberikan catatan motivasi dan pembinaan akhlak siswa pada lembar rapor.
              </p>
            </div>
          </div>

          <div className="p-3 bg-brand-50 rounded-xl border border-brand-300 text-xs text-brand-950 font-bold flex items-center justify-between">
            <span>🎉 Selamat bertugas & mendidik generasi bangsa!</span>
            <span className="badge-retro bg-brand-500 text-white text-[10px]">
              LP Ma&apos;arif NU
            </span>
          </div>
        </div>
      ),
    },
  ];

  const active = steps[currentStep];
  const IconComp = active.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-retro-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border-3 border-retro-border rounded-2xl shadow-retro-xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* ================= HEADER RETRO ================= */}
        <div className="bg-brand-500 text-white p-4 sm:p-5 border-b-3 border-retro-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${active.color} border-2 border-retro-border flex items-center justify-center shadow-retro-sm`}>
              <IconComp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wide uppercase">
                  PANDUAN & PETUNJUK APLIKASI
                </h3>
                <span className="badge-retro bg-retro-yellow text-retro-black text-[10px] font-black uppercase">
                  LANGKAH {currentStep === 0 ? "AWAL" : `${currentStep} / ${steps.length - 1}`}
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium">
                {active.subtitle} &bull; {config.nama_madrasah}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-retro-black border border-white/40 transition-colors shadow-retro-sm"
            title="Tutup Panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= STEP INDICATOR BAR ================= */}
        <div className="bg-slate-100 border-b-2 border-retro-border p-2 px-4 flex items-center justify-between gap-1 overflow-x-auto scrollbar-thin">
          {steps.map((st, idx) => {
            const isCurrent = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all shrink-0 ${
                  isCurrent
                    ? "bg-brand-500 text-white shadow-retro-xs border border-retro-border"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center">
                    {idx}
                  </span>
                )}
                <span className="hidden sm:inline">{idx === 0 ? "Awal" : `Step ${idx}`}</span>
              </button>
            );
          })}
        </div>

        {/* ================= STEP CONTENT BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-black text-retro-black uppercase">
              {active.title}
            </h4>
            <span className="text-[11px] font-bold text-slate-500">
              {currentStep + 1} dari {steps.length} bagian
            </span>
          </div>

          {active.content}
        </div>

        {/* ================= FOOTER CONTROLS ================= */}
        <div className="p-3 sm:p-4 bg-white border-t-3 border-retro-border flex flex-wrap items-center justify-between gap-3">
          {/* Checkbox: Jangan tampilkan lagi */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-retro-border text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-slate-600 font-bold">
              Sudah paham, jangan tampilkan otomatis saat login
            </span>
          </label>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                className="btn-retro bg-white text-slate-700 hover:bg-slate-100 text-xs px-3.5 py-2 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="btn-retro bg-brand-500 hover:bg-brand-600 text-white text-xs px-4 py-2 flex items-center gap-1.5 font-black shadow-retro-sm"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="btn-retro-primary text-xs px-5 py-2 flex items-center gap-1.5 shadow-retro-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>MULAI MENGGUNAKAN APLIKASI</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
