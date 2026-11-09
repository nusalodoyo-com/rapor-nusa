-- ====================================================================
-- MIGRASI INDEKS OPTIMASI PERFORMA TINGGI (DATABASE PERFORMANCE INDEXES)
-- Basis Data: PostgreSQL / Supabase
-- Target: Mempercepat lookup nilai, leger, profil guru, dan data siswa
-- ====================================================================

-- 1. INDEKS TABEL PROFIL PENGGUNA (GURU & ADMIN)
CREATE INDEX IF NOT EXISTS idx_profiles_madrasah_role 
ON public.profiles(madrasah_id, role);

CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON public.profiles(username);

CREATE INDEX IF NOT EXISTS idx_profiles_kelas_diampu 
ON public.profiles(madrasah_id, kelas_diampu) 
WHERE kelas_diampu IS NOT NULL AND kelas_diampu != '-';

-- 2. INDEKS TABEL KELAS
CREATE INDEX IF NOT EXISTS idx_classes_madrasah_tingkat 
ON public.classes(madrasah_id, tingkat);

-- 3. INDEKS TABEL DATA SISWA (1.280 SISWA MTS & 111 SISWA MA)
CREATE INDEX IF NOT EXISTS idx_students_madrasah_class 
ON public.students(madrasah_id, class_id);

CREATE INDEX IF NOT EXISTS idx_students_nis 
ON public.students(nis);

CREATE INDEX IF NOT EXISTS idx_students_nisn 
ON public.students(nisn) 
WHERE nisn IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_students_status 
ON public.students(madrasah_id, status);

-- 4. INDEKS TABEL NILAI MATA PELAJARAN (INTRAKURIKULER)
CREATE INDEX IF NOT EXISTS idx_subject_grades_composite 
ON public.subject_grades(madrasah_id, academic_year_id, subject_id);

CREATE INDEX IF NOT EXISTS idx_subject_grades_student 
ON public.subject_grades(student_id);

CREATE INDEX IF NOT EXISTS idx_subject_grades_updated_at 
ON public.subject_grades(updated_at DESC);

-- 5. INDEKS TABEL NILAI EKSTRAKURIKULER
CREATE INDEX IF NOT EXISTS idx_extracurricular_grades_lookup 
ON public.extracurricular_grades(madrasah_id, academic_year_id, student_id);

-- 6. INDEKS TABEL RAPOR WALI KELAS (PRESENSI & KEPUTUSAN)
CREATE INDEX IF NOT EXISTS idx_homeroom_reports_lookup 
ON public.homeroom_reports(madrasah_id, academic_year_id, student_id);

-- 7. INDEKS TABEL LOG RIWAYAT LOGIN GURU & ADMIN
CREATE TABLE IF NOT EXISTS public.login_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(100),
    nama_user VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    browser_device TEXT,
    status VARCHAR(20) DEFAULT 'success',
    ip_address VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_login_logs_madrasah_time 
ON public.login_logs(madrasah_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_login_logs_user 
ON public.login_logs(username);

-- 8. ANALYZE TABEL UNTUK MEMPERBARUI STATISTIK QUERY PLANNER POSTGRESQL
ANALYZE public.school_config;
ANALYZE public.profiles;
ANALYZE public.classes;
ANALYZE public.students;
ANALYZE public.subjects;
ANALYZE public.subject_grades;
ANALYZE public.homeroom_reports;
ANALYZE public.extracurricular_grades;
