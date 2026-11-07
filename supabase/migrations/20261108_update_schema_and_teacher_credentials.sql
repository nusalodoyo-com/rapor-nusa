-- ====================================================================
-- MIGRASI BASIS DATA SUPABASE: PEMBARUAN PROFIL GURU, TTD KAMAD,
-- LOG LOGIN, DAN INTEGRASI REST API SI-NUSA
-- Dibuat: 8 November 2026
-- ====================================================================

-- 1. PEMBARUAN TABEL SCHOOL_CONFIG
-- Menambahkan kolom untuk tanda tangan digital Kepala Madrasah (Kamad), telepon, dan email
ALTER TABLE public.school_config 
ADD COLUMN IF NOT EXISTS ttd_kamad_url TEXT,
ADD COLUMN IF NOT EXISTS telepon VARCHAR(50) DEFAULT '0856-5112-6412',
ADD COLUMN IF NOT EXISTS email VARCHAR(100) DEFAULT 'nusalodoyo@gmail.com';

-- 2. PEMBARUAN TABEL PROFILES (AKUN & BIODATA LENGKAP GURU)
-- Menambahkan field password, identitas/gelar, TTL, kontak, dan super admin
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'Lodoyo2026',
ADD COLUMN IF NOT EXISTS gelar_depan VARCHAR(50),
ADD COLUMN IF NOT EXISTS gelar_belakang VARCHAR(50),
ADD COLUMN IF NOT EXISTS tempat_lahir VARCHAR(100) DEFAULT 'Blitar',
ADD COLUMN IF NOT EXISTS tanggal_lahir DATE,
ADD COLUMN IF NOT EXISTS jenis_kelamin VARCHAR(10) DEFAULT 'L',
ADD COLUMN IF NOT EXISTS alamat TEXT,
ADD COLUMN IF NOT EXISTS no_wa VARCHAR(30),
ADD COLUMN IF NOT EXISTS email VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- 3. PEMBUATAN TABEL LOG RIWAYAT LOGIN PENGGUNA (LOGIN_LOGS)
-- Untuk mencatat riwayat login seluruh user (Guru, Wali Kelas, Kamad, dan Admin)
CREATE TABLE IF NOT EXISTS public.login_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100),
    nama_user VARCHAR(150) NOT NULL,
    username VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
    browser_device TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks pencarian cepat untuk log login
CREATE INDEX IF NOT EXISTS idx_login_logs_madrasah ON public.login_logs(madrasah_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_username ON public.login_logs(username);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON public.login_logs(created_at DESC);

-- 4. PERBAIKAN TABEL API_INTEGRATIONS (AGAR MENDUKUNG ID STRING & MADRASAH 'all')
-- Lepas foreign key kaku ke school_config agar madrasah_id 'all' tidak ditolak PostgreSQL
ALTER TABLE IF EXISTS public.api_integrations 
DROP CONSTRAINT IF EXISTS api_integrations_madrasah_id_fkey;

-- Ubah tipe kolom id menjadi VARCHAR(100) jika sebelumnya UUID agar kompatibel dengan ID string
DO $$ 
BEGIN 
    ALTER TABLE public.api_integrations ALTER COLUMN id TYPE VARCHAR(100);
EXCEPTION 
    WHEN OTHERS THEN null;
END $$;

-- 5. UPDATE KREDENSIAL SUPER ADMIN UTAMA
-- Memastikan akun super admin terdaftar untuk akses menyeluruh
INSERT INTO public.profiles (
    id, madrasah_id, username, nama_lengkap, role, password, is_super_admin, is_active
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'mts',
    'admin',
    'Super Admin Nusa Lodoyo',
    'admin',
    '123',
    TRUE,
    TRUE
)
ON CONFLICT (madrasah_id, username) 
DO UPDATE SET 
    role = 'admin',
    password = '123',
    is_super_admin = TRUE;

-- 6. RESET PASSWORD DEFAULT GURU MENJADI 'Lodoyo2026'
-- Mengupdate seluruh akun guru agar menggunakan password standar Lodoyo2026
UPDATE public.profiles 
SET password = 'Lodoyo2026'
WHERE role NOT IN ('admin') AND (password IS NULL OR password = 'Matsamuda22' OR password = '123456');

-- 7. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES (OPSIONAL/DISARANKAN)
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow anon read login_logs" ON public.login_logs;
    DROP POLICY IF EXISTS "Allow anon insert login_logs" ON public.login_logs;
    
    CREATE POLICY "Allow anon read login_logs" ON public.login_logs FOR SELECT USING (true);
    CREATE POLICY "Allow anon insert login_logs" ON public.login_logs FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- ====================================================================
-- 8. PEMBARUAN USERNAME 7 KARAKTER & PASSWORD 87 GURU MTS DAN 87 GURU MA
-- Memetakan akun guru berdasarkan NIP / Nama Lengkap
-- ====================================================================
UPDATE public.profiles SET username = 'nusa101', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505101103950001' OR nama_lengkap = 'A. Munawir Fajri, S.Pd.');
UPDATE public.profiles SET username = 'nusa102', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505040909820002' OR nama_lengkap = 'Aan Aulia');
UPDATE public.profiles SET username = 'nusa103', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3572030603920005' OR nama_lengkap = 'Achmad Budi Susetyo, S.Si., M.E.');
UPDATE public.profiles SET username = 'nusa104', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505091003910002' OR nama_lengkap = 'Adhar Mutaqin, S.Pd.');
UPDATE public.profiles SET username = 'nusa105', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505101608010001' OR nama_lengkap = 'Ahmad Kharis Alfarizi S. Pd.');
UPDATE public.profiles SET username = 'nusa106', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505102707840004' OR nama_lengkap = 'Ahmad Musyaffa`, S.Pd.');
UPDATE public.profiles SET username = 'nusa107', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3053755656200003' OR nama_lengkap = 'Ahmad Ulil Amin, Lc., M.S.I');
UPDATE public.profiles SET username = 'nusa108', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505120811950001' OR nama_lengkap = 'Ahmad Zaka Al Abror, M.Pd.I.');
UPDATE public.profiles SET username = 'nusa109', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '20588063191003' OR nama_lengkap = 'Ahmad Zaki Mubarok, M.Pd.I');
UPDATE public.profiles SET username = 'nusa110', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505115108990001' OR nama_lengkap = 'Al Bashita Nurkharima');
UPDATE public.profiles SET username = 'nusa111', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '305041408610001' OR nama_lengkap = 'Ali Mas`ud, SH., MM');
UPDATE public.profiles SET username = 'nusa112', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3506055611970001' OR nama_lengkap = 'Amiddana Rizqi Tamim');
UPDATE public.profiles SET username = 'nusa113', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505115510850003' OR nama_lengkap = 'Amris Ulfi Nuriyah, S.Pd.');
UPDATE public.profiles SET username = 'nusa114', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3572035303900005' OR nama_lengkap = 'Anisa Seratina, S.Pd.');
UPDATE public.profiles SET username = 'nusa115', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3506112409870002' OR nama_lengkap = 'Arif Junaidi,S.Pd');
UPDATE public.profiles SET username = 'nusa116', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505156212920005' OR nama_lengkap = 'Asti Susanti, S. Pd.');
UPDATE public.profiles SET username = 'nusa117', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505115408940003' OR nama_lengkap = 'Ayudya Zianita, S.Pd.');
UPDATE public.profiles SET username = 'nusa118', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '6650747649200022' OR nama_lengkap = 'Budi Santoso, S.Pd');
UPDATE public.profiles SET username = 'nusa119', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '6037760662200053' OR nama_lengkap = 'ChusnuL Hadi, S.Th.I., M. Pd.');
UPDATE public.profiles SET username = 'nusa120', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505224911960002' OR nama_lengkap = 'Dinda Sherlyndra Hapsari, S.Si.');
UPDATE public.profiles SET username = 'nusa121', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505125702660001' OR nama_lengkap = 'Drs. Hj. Durin Nafisatin, M.A');
UPDATE public.profiles SET username = 'nusa122', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505101102190001' OR nama_lengkap = 'Eva Maulida Rahma, S.Pd.');
UPDATE public.profiles SET username = 'nusa123', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505171210960002' OR nama_lengkap = 'Ferdinan Bagaskoro S.Pd');
UPDATE public.profiles SET username = 'nusa124', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505124307850001' OR nama_lengkap = 'Fitria Umi Khasanah, S. Pd');
UPDATE public.profiles SET username = 'nusa125', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505112506890003' OR nama_lengkap = 'Ghulam Akhrori, S.Pd.I');
UPDATE public.profiles SET username = 'nusa126', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '1440745648200004' OR nama_lengkap = 'H. M. Ali Sodik Efendi, S.Pd.');
UPDATE public.profiles SET username = 'nusa127', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505120304920002' OR nama_lengkap = 'Helmi Riya Nurohim, S.Pd');
UPDATE public.profiles SET username = 'nusa128', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505076102940001' OR nama_lengkap = 'Ika Deppy Ana, S. Pd., M.Pd.');
UPDATE public.profiles SET username = 'nusa129', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505070712870001' OR nama_lengkap = 'Imam Mahbub');
UPDATE public.profiles SET username = 'nusa130', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505120705760001' OR nama_lengkap = 'Imam Muhtar, M.A.');
UPDATE public.profiles SET username = 'nusa131', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '1212350500450082' OR nama_lengkap = 'Imam Sabarudin');
UPDATE public.profiles SET username = 'nusa132', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505044905940005' OR nama_lengkap = 'Intan Chosi` Nur Amelia, S. Pd');
UPDATE public.profiles SET username = 'nusa133', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505120206930002' OR nama_lengkap = 'Irfan Mubarok, M.Pd.');
UPDATE public.profiles SET username = 'nusa134', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505096705960001' OR nama_lengkap = 'Irfatul Fu`adah, S.Pd');
UPDATE public.profiles SET username = 'nusa135', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505123112600001' OR nama_lengkap = 'Jazuli Abdulloh');
UPDATE public.profiles SET username = 'nusa136', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505101805780004' OR nama_lengkap = 'Khusnuddin, S.Sos.l, S.Pd.l, MA.');
UPDATE public.profiles SET username = 'nusa137', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505147007930001' OR nama_lengkap = 'Lailatul Hasanah, S.Pd.');
UPDATE public.profiles SET username = 'nusa138', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505146007950002' OR nama_lengkap = 'Lailin Luthfiana, S.Pd');
UPDATE public.profiles SET username = 'nusa139', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3572022008950003' OR nama_lengkap = 'Lutfi Bagus Subagio, S.Pd.');
UPDATE public.profiles SET username = 'nusa140', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505123008860001' OR nama_lengkap = 'M. Muhlis Fuadi, S.Pd.I');
UPDATE public.profiles SET username = 'nusa141', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '01033' OR nama_lengkap = 'M. Zainuri');
UPDATE public.profiles SET username = 'nusa142', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '7433761663200013' OR nama_lengkap = 'M. Zen Pamuji Eko, S.Pd.');
UPDATE public.profiles SET username = 'nusa143', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3518104312900002' OR nama_lengkap = 'Maila Azka, M.Pd.I');
UPDATE public.profiles SET username = 'nusa144', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505122704870001' OR nama_lengkap = 'Miftachul Huda Ari Sanjaya, M.Pd');
UPDATE public.profiles SET username = 'nusa145', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505072808920001' OR nama_lengkap = 'Miftachul Rizal, S.Pd.I');
UPDATE public.profiles SET username = 'nusa146', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505094304890001' OR nama_lengkap = 'Miftahiatul Choiroh, S.Pd.');
UPDATE public.profiles SET username = 'nusa147', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505110208890003' OR nama_lengkap = 'Miftakhul Huda,  S. Pd');
UPDATE public.profiles SET username = 'nusa148', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505130105910002' OR nama_lengkap = 'Mistri Riadianto, S.Pd.');
UPDATE public.profiles SET username = 'nusa149', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3506061908960002' OR nama_lengkap = 'Moch Agus Wantoro, S.Pd.');
UPDATE public.profiles SET username = 'nusa150', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505110310960001' OR nama_lengkap = 'Moch Nur Chafidz');
UPDATE public.profiles SET username = 'nusa151', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505110904960002' OR nama_lengkap = 'Moch. Miftachur Rozaq, S.Pd.');
UPDATE public.profiles SET username = 'nusa152', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505102502930002' OR nama_lengkap = 'Moh. Asmi` Fadloly, S.Pd.');
UPDATE public.profiles SET username = 'nusa153', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505042105940001' OR nama_lengkap = 'Moh. Bagus Sholikhul Adib S.Kom');
UPDATE public.profiles SET username = 'nusa154', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '20588063190003' OR nama_lengkap = 'Moh. Ngumar Nawawi, Lc');
UPDATE public.profiles SET username = 'nusa155', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505130411540001' OR nama_lengkap = 'Mohammad Mundzir');
UPDATE public.profiles SET username = 'nusa156', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505105607920001' OR nama_lengkap = 'Mufidatul Chasanah, S. Pd.');
UPDATE public.profiles SET username = 'nusa157', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505142706850004' OR nama_lengkap = 'Muhamad Mahfuddin, S.Pd.I.');
UPDATE public.profiles SET username = 'nusa158', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505131406990004' OR nama_lengkap = 'Muhamad Ridwan Nawawi, S.Kom.');
UPDATE public.profiles SET username = 'nusa159', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505092204860001' OR nama_lengkap = 'Muhammad Aziz Afrianto, S.Si');
UPDATE public.profiles SET username = 'nusa160', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505141202010002' OR nama_lengkap = 'Muhammad Taufiq Asyhari');
UPDATE public.profiles SET username = 'nusa161', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505124107880056' OR nama_lengkap = 'Muslikhatur Rodaniyah, S.Pd.I');
UPDATE public.profiles SET username = 'nusa162', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505120107810074' OR nama_lengkap = 'Nanang Syaifulloh Darojat');
UPDATE public.profiles SET username = 'nusa163', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505224901010002' OR nama_lengkap = 'Nova Auliyatul Fitriana, S.Pd.');
UPDATE public.profiles SET username = 'nusa164', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505076211910001' OR nama_lengkap = 'Nur Rohmah, S. Pd');
UPDATE public.profiles SET username = 'nusa165', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505120802890002' OR nama_lengkap = 'Nur Saifuddin, S.Pd.');
UPDATE public.profiles SET username = 'nusa166', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505222302910002' OR nama_lengkap = 'Nurcholis Ahmada, M.Pd.');
UPDATE public.profiles SET username = 'nusa167', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505152610910002' OR nama_lengkap = 'Nurfi Fuadin, S.Pd');
UPDATE public.profiles SET username = 'nusa168', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505125812970004' OR nama_lengkap = 'Nurikah Choirunnisah, S.Pd.');
UPDATE public.profiles SET username = 'nusa169', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505115208970002' OR nama_lengkap = 'Nurul Izza Afkarina');
UPDATE public.profiles SET username = 'nusa170', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505105710940003' OR nama_lengkap = 'Qurotul Hasanah, S.Pd');
UPDATE public.profiles SET username = 'nusa171', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '20588063190005' OR nama_lengkap = 'Ratna Yuliastanti, S.Pd.');
UPDATE public.profiles SET username = 'nusa172', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505106802840003' OR nama_lengkap = 'Retno Vidharti, S. Pd.');
UPDATE public.profiles SET username = 'nusa173', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '20588063188004' OR nama_lengkap = 'Rudi Asrori, S. Pd');
UPDATE public.profiles SET username = 'nusa174', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505124710970001' OR nama_lengkap = 'Saffira Noor Chotimah, S.T.');
UPDATE public.profiles SET username = 'nusa175', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505125309870001' OR nama_lengkap = 'Sefi Miftahul Aflih, S.Pd');
UPDATE public.profiles SET username = 'nusa176', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505126012980001' OR nama_lengkap = 'Siti Durotun Nasikah, M.Pd.');
UPDATE public.profiles SET username = 'nusa177', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505095803850001' OR nama_lengkap = 'Siti Hanidah, S.Pd');
UPDATE public.profiles SET username = 'nusa178', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '0122' OR nama_lengkap = 'Soim');
UPDATE public.profiles SET username = 'nusa179', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505121603710004' OR nama_lengkap = 'Sonhaji');
UPDATE public.profiles SET username = 'nusa180', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505122407710001' OR nama_lengkap = 'Suyanto');
UPDATE public.profiles SET username = 'nusa181', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3505112009710001' OR nama_lengkap = 'Toha Mahsun, M.Pd.');
UPDATE public.profiles SET username = 'nusa182', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505145201920001' OR nama_lengkap = 'Tri Lailatin Mubarokah, S.Pd.I.');
UPDATE public.profiles SET username = 'nusa183', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505117001830001' OR nama_lengkap = 'Tri Rahayu, S.Pd.I');
UPDATE public.profiles SET username = 'nusa184', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'mts' AND (nip = '3508152106960001' OR nama_lengkap = 'Wildan Su`aidi Kohardiansyah, S.Pd.');
UPDATE public.profiles SET username = 'nusa185', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3572014301930003' OR nama_lengkap = 'Yessy Kusuma Wardhani, S.Pd');
UPDATE public.profiles SET username = 'nusa186', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505117006000002' OR nama_lengkap = 'Zeni Nurdiana');
UPDATE public.profiles SET username = 'nusa187', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'mts' AND (nip = '3505106010830002' OR nama_lengkap = 'Zulfa Silmi Jaziroh');
UPDATE public.profiles SET username = 'nusa201', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505101103950001' OR nama_lengkap = 'A. Munawir Fajri, S.Pd.');
UPDATE public.profiles SET username = 'nusa202', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505040909820002' OR nama_lengkap = 'Aan Aulia');
UPDATE public.profiles SET username = 'nusa203', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3572030603920005' OR nama_lengkap = 'Achmad Budi Susetyo, S.Si., M.E.');
UPDATE public.profiles SET username = 'nusa204', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505091003910002' OR nama_lengkap = 'Adhar Mutaqin, S.Pd.');
UPDATE public.profiles SET username = 'nusa205', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505101608010001' OR nama_lengkap = 'Ahmad Kharis Alfarizi S. Pd.');
UPDATE public.profiles SET username = 'nusa206', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505102707840004' OR nama_lengkap = 'Ahmad Musyaffa`, S.Pd.');
UPDATE public.profiles SET username = 'nusa207', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3053755656200003' OR nama_lengkap = 'Ahmad Ulil Amin, Lc., M.S.I');
UPDATE public.profiles SET username = 'nusa208', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505120811950001' OR nama_lengkap = 'Ahmad Zaka Al Abror, M.Pd.I.');
UPDATE public.profiles SET username = 'nusa209', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '20588063191003' OR nama_lengkap = 'Ahmad Zaki Mubarok, M.Pd.I');
UPDATE public.profiles SET username = 'nusa210', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505115108990001' OR nama_lengkap = 'Al Bashita Nurkharima');
UPDATE public.profiles SET username = 'nusa211', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '305041408610001' OR nama_lengkap = 'Ali Mas`ud, SH., MM');
UPDATE public.profiles SET username = 'nusa212', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3506055611970001' OR nama_lengkap = 'Amiddana Rizqi Tamim');
UPDATE public.profiles SET username = 'nusa213', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505115510850003' OR nama_lengkap = 'Amris Ulfi Nuriyah, S.Pd.');
UPDATE public.profiles SET username = 'nusa214', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3572035303900005' OR nama_lengkap = 'Anisa Seratina, S.Pd.');
UPDATE public.profiles SET username = 'nusa215', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3506112409870002' OR nama_lengkap = 'Arif Junaidi,S.Pd');
UPDATE public.profiles SET username = 'nusa216', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505156212920005' OR nama_lengkap = 'Asti Susanti, S. Pd.');
UPDATE public.profiles SET username = 'nusa217', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505115408940003' OR nama_lengkap = 'Ayudya Zianita, S.Pd.');
UPDATE public.profiles SET username = 'nusa218', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '6650747649200022' OR nama_lengkap = 'Budi Santoso, S.Pd');
UPDATE public.profiles SET username = 'nusa219', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '6037760662200053' OR nama_lengkap = 'ChusnuL Hadi, S.Th.I., M. Pd.');
UPDATE public.profiles SET username = 'nusa220', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505224911960002' OR nama_lengkap = 'Dinda Sherlyndra Hapsari, S.Si.');
UPDATE public.profiles SET username = 'nusa221', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505125702660001' OR nama_lengkap = 'Drs. Hj. Durin Nafisatin, M.A');
UPDATE public.profiles SET username = 'nusa222', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505101102190001' OR nama_lengkap = 'Eva Maulida Rahma, S.Pd.');
UPDATE public.profiles SET username = 'nusa223', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505171210960002' OR nama_lengkap = 'Ferdinan Bagaskoro S.Pd');
UPDATE public.profiles SET username = 'nusa224', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505124307850001' OR nama_lengkap = 'Fitria Umi Khasanah, S. Pd');
UPDATE public.profiles SET username = 'nusa225', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505112506890003' OR nama_lengkap = 'Ghulam Akhrori, S.Pd.I');
UPDATE public.profiles SET username = 'nusa226', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '1440745648200004' OR nama_lengkap = 'H. M. Ali Sodik Efendi, S.Pd.');
UPDATE public.profiles SET username = 'nusa227', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505120304920002' OR nama_lengkap = 'Helmi Riya Nurohim, S.Pd');
UPDATE public.profiles SET username = 'nusa228', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505076102940001' OR nama_lengkap = 'Ika Deppy Ana, S. Pd., M.Pd.');
UPDATE public.profiles SET username = 'nusa229', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505070712870001' OR nama_lengkap = 'Imam Mahbub');
UPDATE public.profiles SET username = 'nusa230', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505120705760001' OR nama_lengkap = 'Imam Muhtar, M.A.');
UPDATE public.profiles SET username = 'nusa231', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '1212350500450082' OR nama_lengkap = 'Imam Sabarudin');
UPDATE public.profiles SET username = 'nusa232', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505044905940005' OR nama_lengkap = 'Intan Chosi` Nur Amelia, S. Pd');
UPDATE public.profiles SET username = 'nusa233', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505120206930002' OR nama_lengkap = 'Irfan Mubarok, M.Pd.');
UPDATE public.profiles SET username = 'nusa234', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505096705960001' OR nama_lengkap = 'Irfatul Fu`adah, S.Pd');
UPDATE public.profiles SET username = 'nusa235', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505123112600001' OR nama_lengkap = 'Jazuli Abdulloh');
UPDATE public.profiles SET username = 'nusa236', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505101805780004' OR nama_lengkap = 'Khusnuddin, S.Sos.l, S.Pd.l, MA.');
UPDATE public.profiles SET username = 'nusa237', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505147007930001' OR nama_lengkap = 'Lailatul Hasanah, S.Pd.');
UPDATE public.profiles SET username = 'nusa238', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505146007950002' OR nama_lengkap = 'Lailin Luthfiana, S.Pd');
UPDATE public.profiles SET username = 'nusa239', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3572022008950003' OR nama_lengkap = 'Lutfi Bagus Subagio, S.Pd.');
UPDATE public.profiles SET username = 'nusa240', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505123008860001' OR nama_lengkap = 'M. Muhlis Fuadi, S.Pd.I');
UPDATE public.profiles SET username = 'nusa241', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '01033' OR nama_lengkap = 'M. Zainuri');
UPDATE public.profiles SET username = 'nusa242', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '7433761663200013' OR nama_lengkap = 'M. Zen Pamuji Eko, S.Pd.');
UPDATE public.profiles SET username = 'nusa243', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3518104312900002' OR nama_lengkap = 'Maila Azka, M.Pd.I');
UPDATE public.profiles SET username = 'nusa244', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505122704870001' OR nama_lengkap = 'Miftachul Huda Ari Sanjaya, M.Pd');
UPDATE public.profiles SET username = 'nusa245', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505072808920001' OR nama_lengkap = 'Miftachul Rizal, S.Pd.I');
UPDATE public.profiles SET username = 'nusa246', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505094304890001' OR nama_lengkap = 'Miftahiatul Choiroh, S.Pd.');
UPDATE public.profiles SET username = 'nusa247', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505110208890003' OR nama_lengkap = 'Miftakhul Huda,  S. Pd');
UPDATE public.profiles SET username = 'nusa248', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505130105910002' OR nama_lengkap = 'Mistri Riadianto, S.Pd.');
UPDATE public.profiles SET username = 'nusa249', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3506061908960002' OR nama_lengkap = 'Moch Agus Wantoro, S.Pd.');
UPDATE public.profiles SET username = 'nusa250', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505110310960001' OR nama_lengkap = 'Moch Nur Chafidz');
UPDATE public.profiles SET username = 'nusa251', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505110904960002' OR nama_lengkap = 'Moch. Miftachur Rozaq, S.Pd.');
UPDATE public.profiles SET username = 'nusa252', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505102502930002' OR nama_lengkap = 'Moh. Asmi` Fadloly, S.Pd.');
UPDATE public.profiles SET username = 'nusa253', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505042105940001' OR nama_lengkap = 'Moh. Bagus Sholikhul Adib S.Kom');
UPDATE public.profiles SET username = 'nusa254', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '20588063190003' OR nama_lengkap = 'Moh. Ngumar Nawawi, Lc');
UPDATE public.profiles SET username = 'nusa255', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505130411540001' OR nama_lengkap = 'Mohammad Mundzir');
UPDATE public.profiles SET username = 'nusa256', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505105607920001' OR nama_lengkap = 'Mufidatul Chasanah, S. Pd.');
UPDATE public.profiles SET username = 'nusa257', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505142706850004' OR nama_lengkap = 'Muhamad Mahfuddin, S.Pd.I.');
UPDATE public.profiles SET username = 'nusa258', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505131406990004' OR nama_lengkap = 'Muhamad Ridwan Nawawi, S.Kom.');
UPDATE public.profiles SET username = 'nusa259', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505092204860001' OR nama_lengkap = 'Muhammad Aziz Afrianto, S.Si');
UPDATE public.profiles SET username = 'nusa260', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505141202010002' OR nama_lengkap = 'Muhammad Taufiq Asyhari');
UPDATE public.profiles SET username = 'nusa261', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505124107880056' OR nama_lengkap = 'Muslikhatur Rodaniyah, S.Pd.I');
UPDATE public.profiles SET username = 'nusa262', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505120107810074' OR nama_lengkap = 'Nanang Syaifulloh Darojat');
UPDATE public.profiles SET username = 'nusa263', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505224901010002' OR nama_lengkap = 'Nova Auliyatul Fitriana, S.Pd.');
UPDATE public.profiles SET username = 'nusa264', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505076211910001' OR nama_lengkap = 'Nur Rohmah, S. Pd');
UPDATE public.profiles SET username = 'nusa265', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505120802890002' OR nama_lengkap = 'Nur Saifuddin, S.Pd.');
UPDATE public.profiles SET username = 'nusa266', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505222302910002' OR nama_lengkap = 'Nurcholis Ahmada, M.Pd.');
UPDATE public.profiles SET username = 'nusa267', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505152610910002' OR nama_lengkap = 'Nurfi Fuadin, S.Pd');
UPDATE public.profiles SET username = 'nusa268', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505125812970004' OR nama_lengkap = 'Nurikah Choirunnisah, S.Pd.');
UPDATE public.profiles SET username = 'nusa269', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505115208970002' OR nama_lengkap = 'Nurul Izza Afkarina');
UPDATE public.profiles SET username = 'nusa270', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505105710940003' OR nama_lengkap = 'Qurotul Hasanah, S.Pd');
UPDATE public.profiles SET username = 'nusa271', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '20588063190005' OR nama_lengkap = 'Ratna Yuliastanti, S.Pd.');
UPDATE public.profiles SET username = 'nusa272', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505106802840003' OR nama_lengkap = 'Retno Vidharti, S. Pd.');
UPDATE public.profiles SET username = 'nusa273', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '20588063188004' OR nama_lengkap = 'Rudi Asrori, S. Pd');
UPDATE public.profiles SET username = 'nusa274', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505124710970001' OR nama_lengkap = 'Saffira Noor Chotimah, S.T.');
UPDATE public.profiles SET username = 'nusa275', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505125309870001' OR nama_lengkap = 'Sefi Miftahul Aflih, S.Pd');
UPDATE public.profiles SET username = 'nusa276', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505126012980001' OR nama_lengkap = 'Siti Durotun Nasikah, M.Pd.');
UPDATE public.profiles SET username = 'nusa277', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505095803850001' OR nama_lengkap = 'Siti Hanidah, S.Pd');
UPDATE public.profiles SET username = 'nusa278', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '0122' OR nama_lengkap = 'Soim');
UPDATE public.profiles SET username = 'nusa279', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505121603710004' OR nama_lengkap = 'Sonhaji');
UPDATE public.profiles SET username = 'nusa280', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505122407710001' OR nama_lengkap = 'Suyanto');
UPDATE public.profiles SET username = 'nusa281', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3505112009710001' OR nama_lengkap = 'Toha Mahsun, M.Pd.');
UPDATE public.profiles SET username = 'nusa282', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505145201920001' OR nama_lengkap = 'Tri Lailatin Mubarokah, S.Pd.I.');
UPDATE public.profiles SET username = 'nusa283', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505117001830001' OR nama_lengkap = 'Tri Rahayu, S.Pd.I');
UPDATE public.profiles SET username = 'nusa284', password = 'Lodoyo2026', jenis_kelamin = 'L' WHERE madrasah_id = 'ma' AND (nip = '3508152106960001' OR nama_lengkap = 'Wildan Su`aidi Kohardiansyah, S.Pd.');
UPDATE public.profiles SET username = 'nusa285', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3572014301930003' OR nama_lengkap = 'Yessy Kusuma Wardhani, S.Pd');
UPDATE public.profiles SET username = 'nusa286', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505117006000002' OR nama_lengkap = 'Zeni Nurdiana');
UPDATE public.profiles SET username = 'nusa287', password = 'Lodoyo2026', jenis_kelamin = 'P' WHERE madrasah_id = 'ma' AND (nip = '3505106010830002' OR nama_lengkap = 'Zulfa Silmi Jaziroh');
