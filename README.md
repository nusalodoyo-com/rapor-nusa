# 🎓 Rapor Nusa (Aplikasi Rapor Madrasah)

Aplikasi Rapor Madrasah modern berbasis Web untuk **MA Ma'arif Nurus Salam** (Yayasan Nurul Ulum Blitar).  
Dibangun dengan stack modern: **Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Vercel, dan GitHub**.

---

## 🌟 Fitur Utama

1. **Multi-Role Authentication**:
   - **Guru Mata Pelajaran**: Input nilai formatif/lingkup materi (Materi 1–4), STS (UTS), SAS (UAS), catatan kompetensi, serta ekspor & impor Excel (.xlsx).
   - **Wali Kelas**: Rekap Legger Nilai satu kelas, pencatatan presensi (S/I/A), catatan perkembangan siswa, keputusan kenaikan kelas/kelulusan, dan cetak rapor resmi.
   - **Pembina Ekstrakurikuler**: Penilaian predikat dan capaian kegiatan ekstrakurikuler peserta didik.
   - **Kepala Madrasah & Administrator**: Monitoring kelengkapan nilai madrasah, kustomisasi profil lembaga & kop madrasah.

2. **Kalkulasi Nilai Otomatis (Realtime)**:
   - Rata-rata Formatif (Lingkup Materi 1-4).
   - Nilai Akhir (NA): $\text{round}((\text{Avg Formatif} \times 0.40) + (\text{STS} \times 0.30) + (\text{SAS} \times 0.30))$.
   - Predikat Otomatis: **A** ($\ge 90$), **B** ($80-89$), **C** ($70-79$), **D** ($< 70$).

3. **Format Dokumen Resmi Standar Madrasah**:
   - **Kop Lembaga**: *Yayasan Nurul Ulum Blitar - MA Ma'arif Nurus Salam*.
   - **Legger Nilai**: Layout A4 Landscape dengan matriks nilai seluruh mata pelajaran, rekap presensi, dan kolom tanda tangan Kamad & Wali Kelas.
   - **Cetak Rapor Individual**: Layout A4 Portrait siap cetak / simpan PDF dengan dukungan tanda tangan digital Wali Kelas dan Kepala Madrasah (**M. Zen Pamuji, S.Pd.**).

4. **Integrasi Excel (.xlsx) Offline**:
   - Unduh template Excel dengan warna proteksi visual pada kolom NIS & Nama Siswa.
   - Unggah kembali file Excel untuk pemutakhiran massal dalam hitungan detik.

5. **Arsitektur Dual-Mode (Offline Local & Supabase Cloud)**:
   - Berjalan langsung di peramban lokal (localStorage / indexedDB) tanpa perlu setup rumit untuk testing cepat.
   - Terintegrasi penuh dengan Supabase PostgreSQL + Auth + Storage saat kredensial `.env.local` diisi.

---

## 🚀 Panduan Memulai Cepat (Local Development)

### 1. Prasyarat
- Node.js versi 18+ atau 20+
- Git

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Server Lokal
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

### 4. Akun Uji Coba Cepat
Pada halaman login, Anda dapat mengklik tombol jalan pintas atau mengetik:
- **Wali Kelas X-A**: username `wali10a` | password `123456`
- **Guru Mapel**: username `guru1` | password `123456`
- **Pembina Ekskul**: username `ekstra1` | password `123456`
- **Administrator**: username `admin` | password `123456`

---

## 🗄️ Setup Basis Data Supabase

1. Buat proyek baru di [https://supabase.com](https://supabase.com).
2. Buka menu **SQL Editor**, buka file `supabase/migrations/20261107_init_rapor_nusa.sql`, lalu klik **Run**.
3. Buka menu **Storage**, buat bucket baru bernama `assets-rapor` dengan opsi **Public**.
4. Di file `.env.local`, masukkan kredensial dari **Project Settings > API**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

---

## 🌐 Deployment ke GitHub & Vercel

### Hubungkan ke GitHub:
```bash
git init
git add .
git commit -m "feat: complete Rapor Nusa application"
git branch -M main
git remote add origin https://github.com/<username>/rapor-nusa.git
git push -u origin main
```

### Deploy ke Vercel:
1. Kunjungi [https://vercel.com/new](https://vercel.com/new).
2. Hubungkan akun GitHub Anda dan pilih repositori `rapor-nusa`.
3. Masukkan Environment Variables (`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Klik **Deploy**!
