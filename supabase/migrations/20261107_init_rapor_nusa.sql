-- ====================================================================
-- SKEMA BASIS DATA RAPOR NUSA (MA MA'ARIF NURUS SALAM)
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

-- 3. PROFIL PENGGUNA
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    nip VARCHAR(50) DEFAULT '-',
    role user_role DEFAULT 'guru',
    kelas_diampu VARCHAR(50) DEFAULT '-',
    ttd_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TAHUN AJARAN & SEMESTER
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tahun VARCHAR(20) NOT NULL,
    semester semester_enum NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    tanggal_rapor DATE,
    tempat_penerbitan VARCHAR(100) DEFAULT 'Blitar',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tahun, semester)
);

-- 5. KELAS
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kelas VARCHAR(50) NOT NULL UNIQUE,
    tingkat INT NOT NULL CHECK (tingkat IN (10, 11, 12)),
    wali_kelas_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DATA SISWA
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nis VARCHAR(50) NOT NULL UNIQUE,
    nisn VARCHAR(50) UNIQUE,
    nama_lengkap VARCHAR(150) NOT NULL,
    jenis_kelamin VARCHAR(10) CHECK (jenis_kelamin IN ('L', 'P')),
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'aktif',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MATA PELAJARAN
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_mapel VARCHAR(50) NOT NULL UNIQUE,
    nama_mapel VARCHAR(150) NOT NULL,
    kelompok VARCHAR(50) DEFAULT 'Umum',
    urutan INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PENUGASAN GURU KE MAPEL & KELAS
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    UNIQUE(guru_id, subject_id, class_id, academic_year_id)
);

-- 9. DAFTAR EKSTRAKURIKULER
CREATE TABLE IF NOT EXISTS public.extracurriculars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_ekskul VARCHAR(100) NOT NULL UNIQUE,
    pembina_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    deskripsi TEXT
);

-- 10. NILAI MATA PELAJARAN (INTRAKURIKULER)
CREATE TABLE IF NOT EXISTS public.subject_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    UNIQUE(academic_year_id, student_id, subject_id)
);

-- 11. NILAI EKSTRAKURIKULER
CREATE TABLE IF NOT EXISTS public.extracurricular_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    extracurricular_id UUID NOT NULL REFERENCES public.extracurriculars(id) ON DELETE CASCADE,
    predikat ekskul_predikat_enum DEFAULT 'Baik',
    keterangan TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(academic_year_id, student_id, extracurricular_id)
);

-- 12. RAPOR WALI KELAS (ABSENSI & KEPUTUSAN)
CREATE TABLE IF NOT EXISTS public.homeroom_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    sakit INT DEFAULT 0,
    izin INT DEFAULT 0,
    tanpa_keterangan INT DEFAULT 0,
    catatan_wali TEXT,
    keputusan keputusan_enum DEFAULT '-',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(academic_year_id, student_id)
);

-- 13. KONFIGURASI PROFIL LEMBAGA
CREATE TABLE IF NOT EXISTS public.school_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_yayasan VARCHAR(200) DEFAULT 'YAYASAN NURUL ULUM BLITAR',
    nomor_sk_kemenkumham VARCHAR(200) DEFAULT 'AHU-0002160.AH.01.04. Tahun 2017',
    nama_madrasah VARCHAR(200) DEFAULT 'MA MA''ARIF NURUS SALAM',
    alamat VARCHAR(255) DEFAULT 'Jalan Diponegoro no. 105 Kedungbunder, Sutojayan, Blitar, Jawa Timur',
    kepala_madrasah VARCHAR(150) DEFAULT 'M. Zen Pamuji, S.Pd.',
    nip_kepala VARCHAR(50) DEFAULT '-',
    logo_kemenag_url TEXT,
    logo_madrasah_url TEXT,
    stempel_url TEXT
);

-- 14. DATA AWAL (SEED)
INSERT INTO public.school_config (nama_yayasan, nomor_sk_kemenkumham, nama_madrasah, alamat, kepala_madrasah)
VALUES (
    'YAYASAN NURUL ULUM BLITAR',
    'SK. Kemenkum Ham. Nomor AHU-0002160.AH.01.04. Tahun 2017',
    'MA MA''ARIF NURUS SALAM',
    'Jalan Diponegoro no. 105 Kedungbunder, Sutojayan, Blitar, Jawa Timur',
    'M. Zen Pamuji, S.Pd.'
) ON CONFLICT DO NOTHING;
