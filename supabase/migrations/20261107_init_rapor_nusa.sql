-- ====================================================================
-- SKEMA BASIS DATA MULTI-TENANT RAPOR NUSA
-- Lembaga:
-- 1. MTs Ma'arif NU 2 Sutojayan ('mts')
-- 2. MA Ma'arif Nurus Salam ('ma')
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPE ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'guru', 'wali_kelas', 'guru_walikelas', 'guru_ekstra', 'kamad');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE semester_enum AS ENUM ('1', '2');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE predikat_enum AS ENUM ('A', 'B', 'C', 'D');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ekskul_predikat_enum AS ENUM ('Sangat Baik', 'Baik', 'Cukup', 'Kurang');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE keputusan_enum AS ENUM ('-', 'Naik Kelas', 'Tinggal Kelas', 'Lulus', 'Tidak Lulus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFIL LEMBAGA (CONFIG)
CREATE TABLE IF NOT EXISTS public.school_config (
    id VARCHAR(50) PRIMARY KEY, -- 'mts' atau 'ma'
    nama_yayasan VARCHAR(200) NOT NULL,
    nomor_sk_kemenkumham VARCHAR(200) NOT NULL,
    nama_madrasah VARCHAR(200) NOT NULL,
    jenjang VARCHAR(20) NOT NULL, -- 'MTs' atau 'MA'
    nsm VARCHAR(50) NOT NULL,
    npsn VARCHAR(50) NOT NULL,
    akreditasi VARCHAR(50) DEFAULT 'A',
    alamat VARCHAR(255) NOT NULL,
    desa VARCHAR(100) DEFAULT 'Kedungbunder',
    kecamatan VARCHAR(100) DEFAULT 'Sutojayan',
    kabupaten VARCHAR(100) DEFAULT 'Blitar',
    provinsi VARCHAR(100) DEFAULT 'Jawa Timur',
    kepala_madrasah VARCHAR(150) NOT NULL,
    nip_kepala VARCHAR(50) DEFAULT '-',
    kota_tanggal VARCHAR(50) DEFAULT 'Blitar',
    logo_kemenag_url TEXT,
    logo_madrasah_url TEXT,
    stempel_url TEXT
);

-- 4. PROFIL PENGGUNA (GURU & WALI TERISOLASI PER MADRASAH)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL REFERENCES public.school_config(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    nip VARCHAR(50) DEFAULT '-',
    role user_role DEFAULT 'guru',
    kelas_diampu VARCHAR(50) DEFAULT '-',
    ttd_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(madrasah_id, username)
);

-- 5. TAHUN AJARAN & SEMESTER
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL REFERENCES public.school_config(id) ON DELETE CASCADE,
    tahun VARCHAR(20) NOT NULL,
    semester semester_enum NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    tanggal_rapor DATE,
    tempat_penerbitan VARCHAR(100) DEFAULT 'Blitar',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(madrasah_id, tahun, semester)
);

-- 6. KELAS
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL REFERENCES public.school_config(id) ON DELETE CASCADE,
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat INT NOT NULL, -- 7, 8, 9 (MTs) atau 10, 11, 12 (MA)
    wali_kelas_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(madrasah_id, nama_kelas)
);

-- 7. DATA SISWA
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL REFERENCES public.school_config(id) ON DELETE CASCADE,
    nis VARCHAR(50) NOT NULL,
    nisn VARCHAR(50),
    nama_lengkap VARCHAR(150) NOT NULL,
    jenis_kelamin VARCHAR(10) CHECK (jenis_kelamin IN ('L', 'P')),
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'aktif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(madrasah_id, nis)
);

-- 8. MATA PELAJARAN (STANDAR KEMENAG KELOMPOK A, B, C)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL REFERENCES public.school_config(id) ON DELETE CASCADE,
    kode_mapel VARCHAR(50) NOT NULL,
    nama_mapel VARCHAR(150) NOT NULL,
    kelompok VARCHAR(10) DEFAULT 'B', -- 'A' (PAI/B.Arab), 'B' (Umum), 'C' (Mulok/Peminatan)
    kkm INT DEFAULT 75,
    urutan INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(madrasah_id, kode_mapel)
);

-- 9. PENUGASAN GURU
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL REFERENCES public.school_config(id) ON DELETE CASCADE,
    guru_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    UNIQUE(guru_id, subject_id, class_id, academic_year_id)
);

-- 10. DAFTAR EKSTRAKURIKULER
CREATE TABLE IF NOT EXISTS public.extracurriculars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL REFERENCES public.school_config(id) ON DELETE CASCADE,
    nama_ekskul VARCHAR(100) NOT NULL,
    pembina_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    deskripsi TEXT,
    UNIQUE(madrasah_id, nama_ekskul)
);

-- 11. NILAI MATA PELAJARAN (INTRAKURIKULER)
CREATE TABLE IF NOT EXISTS public.subject_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL REFERENCES public.school_config(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    
    materi_1 VARCHAR(255),
    nilai_harian_1 NUMERIC(5,2) DEFAULT 0,
    materi_2 VARCHAR(255),
    nilai_harian_2 NUMERIC(5,2) DEFAULT 0,
    materi_3 VARCHAR(255),
    nilai_harian_3 NUMERIC(5,2) DEFAULT 0,
    materi_4 VARCHAR(255),
    nilai_harian_4 NUMERIC(5,2) DEFAULT 0,
    
    nilai_uts NUMERIC(5,2) DEFAULT 0,
    nilai_uas NUMERIC(5,2) DEFAULT 0,
    nilai_akhir NUMERIC(5,2) DEFAULT 0,
    predikat predikat_enum DEFAULT 'C',
    catatan_mapel TEXT,
    
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(madrasah_id, academic_year_id, student_id, subject_id)
);

-- 12. NILAI EKSTRAKURIKULER
CREATE TABLE IF NOT EXISTS public.extracurricular_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL REFERENCES public.school_config(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    extracurricular_id UUID NOT NULL REFERENCES public.extracurriculars(id) ON DELETE CASCADE,
    predikat ekskul_predikat_enum DEFAULT 'Baik',
    keterangan TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(madrasah_id, academic_year_id, student_id, extracurricular_id)
);

-- 13. RAPOR WALI KELAS (ABSENSI & KEPUTUSAN)
CREATE TABLE IF NOT EXISTS public.homeroom_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL REFERENCES public.school_config(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    sakit INT DEFAULT 0,
    izin INT DEFAULT 0,
    tanpa_keterangan INT DEFAULT 0,
    catatan_wali TEXT,
    keputusan keputusan_enum DEFAULT '-',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(madrasah_id, academic_year_id, student_id)
);

-- 14. SEED DATA DUA LEMBAGA (CONFIG)
INSERT INTO public.school_config (id, nama_yayasan, nomor_sk_kemenkumham, nama_madrasah, jenjang, nsm, npsn, akreditasi, alamat, kepala_madrasah, nip_kepala)
VALUES 
(
    'mts',
    'LP MA''ARIF NU KABUPATEN BLITAR',
    'Kemenkumham RI No. AHU-119.AH.01.08. Tahun 2013',
    'MTs MA''ARIF NU 2 SUTOJAYAN',
    'MTs',
    '121235050045',
    '20582201',
    'A (Unggul)',
    'Jl. Raya Barat No. 24 Kedungbunder, Sutojayan',
    'Drs. H. Ahmad Masrukin, M.Pd.I.',
    '196807151994031002'
),
(
    'ma',
    'YAYASAN NURUL ULUM BLITAR',
    'SK. Kemenkum Ham. Nomor AHU-0002160.AH.01.04. Tahun 2017',
    'MA MA''ARIF NURUS SALAM',
    'MA',
    '131235050062',
    '69978521',
    'B (Baik)',
    'Jalan Diponegoro no. 105 Kedungbunder, Sutojayan',
    'M. Zen Pamuji, S.Pd.',
    '-'
) ON CONFLICT (id) DO UPDATE SET
    nama_madrasah = EXCLUDED.nama_madrasah,
    kepala_madrasah = EXCLUDED.kepala_madrasah;
