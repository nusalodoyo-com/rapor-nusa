"use client";

import React, { useState } from "react";
import { User, MadrasahId } from "@/types";
import {
  updateUserProfile,
  changeUserPassword,
} from "@/lib/storage";
import {
  UserCheck,
  KeyRound,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  madrasahId: MadrasahId;
  currentUser: User;
  onUserUpdated: (updatedUser: User) => void;
}

export default function ProfilGuruModal({
  isOpen,
  onClose,
  madrasahId,
  currentUser,
  onUserUpdated,
}: Props) {
  const [activeTab, setActiveTab] = useState<"biodata" | "password">("biodata");

  // Form Biodata
  const [namaUser, setNamaUser] = useState(currentUser.nama_user || "");
  const [gelarDepan, setGelarDepan] = useState(currentUser.gelar_depan || "");
  const [gelarBelakang, setGelarBelakang] = useState(currentUser.gelar_belakang || "");
  const [tempatLahir, setTempatLahir] = useState(currentUser.tempat_lahir || "Blitar");
  const [tanggalLahir, setTanggalLahir] = useState(currentUser.tanggal_lahir || "");
  const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">(currentUser.jenis_kelamin || "L");
  const [nip, setNip] = useState(currentUser.nip || "");
  const [alamat, setAlamat] = useState(currentUser.alamat || "");
  const [noWa, setNoWa] = useState(currentUser.no_wa || "");
  const [email, setEmail] = useState(currentUser.email || "");

  // Form Password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Nama Lengkap Gabungan Pratinjau
  const previewFullName = `${gelarDepan ? gelarDepan.trim() + " " : ""}${namaUser.trim()}${gelarBelakang ? ", " + gelarBelakang.trim() : ""}`;

  const handleSaveBiodata = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      if (!namaUser.trim()) {
        setFeedback({ type: "error", message: "Nama lengkap tidak boleh kosong!" });
        setIsSubmitting(false);
        return;
      }

      const cleanWaDigits = noWa.replace(/\D/g, "");
      if (!noWa.trim() || cleanWaDigits.length < 9) {
        setFeedback({ type: "error", message: "Nomor WhatsApp wajib diisi minimal 9 digit angka aktif!" });
        setIsSubmitting(false);
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setFeedback({ type: "error", message: "Alamat Email aktif wajib diisi dengan format yang valid!" });
        setIsSubmitting(false);
        return;
      }

      const res = updateUserProfile(madrasahId, currentUser.id, {
        nama_user: namaUser.trim(),
        gelar_depan: gelarDepan.trim(),
        gelar_belakang: gelarBelakang.trim(),
        tempat_lahir: tempatLahir.trim(),
        tanggal_lahir: tanggalLahir,
        jenis_kelamin: jenisKelamin,
        nip: nip.trim(),
        alamat: alamat.trim(),
        no_wa: noWa.trim(),
        email: cleanEmail,
      });

      if (res.success && res.user) {
        onUserUpdated(res.user);
        setFeedback({ type: "success", message: "Identitas biodata guru berhasil disimpan!" });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: "Gagal menyimpan biodata: " + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      if (!oldPassword) {
        setFeedback({ type: "error", message: "Masukkan kata sandi lama!" });
        setIsSubmitting(false);
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        setFeedback({ type: "error", message: "Kata sandi baru minimal 6 karakter demi keamanan!" });
        setIsSubmitting(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setFeedback({ type: "error", message: "Konfirmasi kata sandi baru tidak cocok!" });
        setIsSubmitting(false);
        return;
      }

      const res = changeUserPassword(madrasahId, currentUser.id, oldPassword, newPassword);

      if (res.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setFeedback({ type: "success", message: "Kata sandi berhasil diperbarui! Gunakan kata sandi baru untuk login berikutnya." });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: "Gagal mengubah kata sandi: " + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border-3 border-retro-border shadow-retro-xl max-w-2xl w-full overflow-hidden my-auto">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b-2 border-retro-border bg-[#06330b] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-retro-yellow text-retro-black flex items-center justify-center border-2 border-retro-border shadow-retro-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">
                Pengaturan Profil & Akun Guru
              </h3>
              <p className="text-[11px] text-emerald-200 font-bold">
                ID Pengguna: <span className="font-mono text-retro-yellow">@{currentUser.username}</span> • {currentUser.nama_user}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Nav Retro */}
        <div className="flex border-b-2 border-retro-border bg-retro-cream p-1.5 gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab("biodata"); setFeedback(null); }}
            className={`flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "biodata"
                ? "bg-brand-500 text-white shadow-retro-sm"
                : "text-retro-black hover:bg-slate-200/70"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>1. Identitas & Biodata Guru</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("password"); setFeedback(null); }}
            className={`flex-1 py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "password"
                ? "bg-retro-yellow text-retro-black shadow-retro-sm"
                : "text-retro-black hover:bg-slate-200/70"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>2. Keamanan & Ubah Password</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-5 mt-4 p-3 rounded-xl border-2 flex items-center gap-2.5 text-xs font-bold ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                : "bg-red-50 border-red-500 text-red-900"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab 1: Biodata Form */}
        {activeTab === "biodata" && (
          <form onSubmit={handleSaveBiodata} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {/* Live Name Preview Box */}
            <div className="p-3 bg-brand-50 border-2 border-dashed border-brand-300 rounded-xl">
              <span className="text-[10px] font-black text-brand-800 uppercase tracking-wide block">
                Format Penulisan Nama Lengkap & Gelar (Pratinjau di Rapor):
              </span>
              <p className="text-sm font-black text-emerald-950 mt-0.5">
                {previewFullName || currentUser.nama_user}
              </p>
            </div>

            {/* Grid Gelar & Nama */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-3">
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                  Gelar Depan:
                </label>
                <input
                  type="text"
                  value={gelarDepan}
                  onChange={e => setGelarDepan(e.target.value)}
                  placeholder="Dr. / Drs. / K.H."
                  className="w-full text-xs p-2 rounded-lg border-2 border-retro-border bg-white font-bold"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                  Nama Lengkap (Tanpa Gelar): <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaUser}
                  onChange={e => setNamaUser(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full text-xs p-2 rounded-lg border-2 border-retro-border bg-white font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                  Gelar Belakang:
                </label>
                <input
                  type="text"
                  value={gelarBelakang}
                  onChange={e => setGelarBelakang(e.target.value)}
                  placeholder="S.Pd. / M.Pd. / M.Ag."
                  className="w-full text-xs p-2 rounded-lg border-2 border-retro-border bg-white font-bold"
                />
              </div>
            </div>

            {/* Grid TTL & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                  Tempat Lahir:
                </label>
                <input
                  type="text"
                  value={tempatLahir}
                  onChange={e => setTempatLahir(e.target.value)}
                  placeholder="Contoh: Blitar"
                  className="w-full text-xs p-2 rounded-lg border-2 border-retro-border bg-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                  Tanggal Lahir:
                </label>
                <input
                  type="date"
                  value={tanggalLahir}
                  onChange={e => setTanggalLahir(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border-2 border-retro-border bg-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                  Jenis Kelamin:
                </label>
                <select
                  value={jenisKelamin}
                  onChange={e => setJenisKelamin(e.target.value as "L" | "P")}
                  className="w-full text-xs p-2 rounded-lg border-2 border-retro-border bg-white font-bold"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>

            {/* NIP / NIK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                  NIP / NIK / PegID:
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={e => setNip(e.target.value)}
                  placeholder="16 digit NIP / NIK"
                  className="w-full text-xs p-2 rounded-lg border-2 border-retro-border bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                  Nomor WhatsApp Aktif: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={noWa}
                    onChange={e => setNoWa(e.target.value)}
                    placeholder="Contoh: 085651126412"
                    className={`w-full text-xs p-2 pl-8 rounded-lg border-2 font-bold ${
                      !noWa.trim()
                        ? "border-amber-500 bg-amber-50/70"
                        : "border-retro-border bg-white"
                    }`}
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                  ✓ Dapat dipakai untuk login selain username
                </p>
              </div>
            </div>

            {/* Email & Alamat */}
            <div>
              <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                Alamat Email Aktif: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@nusalodoyo.com"
                  className={`w-full text-xs p-2 pl-8 rounded-lg border-2 font-bold ${
                    !email.trim()
                      ? "border-amber-500 bg-amber-50/70"
                      : "border-retro-border bg-white"
                  }`}
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                ✓ Dapat dipakai untuk login selain username & pemulihan akun
              </p>
            </div>

            <div>
              <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                Alamat Tempat Tinggal Lengkap:
              </label>
              <textarea
                rows={2}
                value={alamat}
                onChange={e => setAlamat(e.target.value)}
                placeholder="Dusun, RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten/Kota"
                className="w-full text-xs p-2 rounded-lg border-2 border-retro-border bg-white font-bold resize-none"
              />
            </div>

            <div className="pt-3 border-t-2 border-retro-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-retro bg-slate-100 hover:bg-slate-200 text-retro-black px-4 py-2 text-xs font-black"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-retro bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 text-xs flex items-center gap-1.5 shadow-retro-sm font-black"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan Identitas"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Ubah Password Form */}
        {activeTab === "password" && (
          <form onSubmit={handleChangePassword} className="p-5 space-y-4">
            <div className="p-3 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl text-xs text-amber-900 space-y-1">
              <span className="font-black uppercase flex items-center gap-1.5 text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Ketentuan Kata Sandi:
              </span>
              <p>
                Kata sandi default awal adalah <strong>Lodoyo2026</strong>. Anda sangat disarankan mengganti kata sandi pribadi untuk menjaga kerahasiaan penginputan nilai rapor.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                Kata Sandi Lama / Saat Ini: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? "text" : "password"}
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama (atau default: Lodoyo2026)"
                  className="w-full text-xs p-2.5 pr-10 rounded-lg border-2 border-retro-border bg-white font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(p => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-retro-black"
                  title={showOldPass ? "Sembunyikan" : "Intip kata sandi"}
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                  Kata Sandi Baru: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full text-xs p-2.5 pr-10 rounded-lg border-2 border-retro-border bg-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(p => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-retro-black"
                    title={showNewPass ? "Sembunyikan" : "Intip kata sandi"}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-retro-black uppercase block mb-1">
                  Konfirmasi Kata Sandi Baru: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full text-xs p-2.5 pr-10 rounded-lg border-2 border-retro-border bg-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(p => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-retro-black"
                    title={showConfirmPass ? "Sembunyikan" : "Intip kata sandi"}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-retro-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-retro bg-slate-100 hover:bg-slate-200 text-retro-black px-4 py-2 text-xs font-black"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-retro bg-retro-yellow hover:bg-amber-400 text-retro-black px-5 py-2 text-xs flex items-center gap-1.5 shadow-retro-sm font-black"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSubmitting ? "Memproses..." : "Simpan Kata Sandi Baru"}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
