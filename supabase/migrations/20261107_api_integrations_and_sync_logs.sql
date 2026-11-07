-- ====================================================================
-- SKEMA TABEL INTEGRASI API & LOG SINKRONISASI RAPOR NUSA KE SI-NUSA.COM
-- Target: https://si-nusa.com
-- ====================================================================

-- 1. TABEL PENGATURAN INTEGRASI API (INTEGRATION SETTINGS)
CREATE TABLE IF NOT EXISTS public.api_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    madrasah_id VARCHAR(50) DEFAULT 'all' REFERENCES public.school_config(id) ON DELETE CASCADE,
    target_name VARCHAR(100) NOT NULL DEFAULT 'SI-NUSA Portal',
    endpoint_url TEXT NOT NULL DEFAULT 'https://si-nusa.com/api/v1/sync-grades',
    secret_token TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    auto_sync_on_send BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_api_integrations_madrasah ON public.api_integrations(madrasah_id);

-- 2. TABEL LOG RIWAYAT SINKRONISASI DATA SISWA & NILAI (SYNC LOGS)
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES public.api_integrations(id) ON DELETE SET NULL,
    madrasah_id VARCHAR(50) NOT NULL,
    student_nisn VARCHAR(50),
    student_nis VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    total_grades INT DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
    http_status INT,
    response_message TEXT,
    payload_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks untuk pencarian log berdasarkan status, siswa, dan waktu
CREATE INDEX IF NOT EXISTS idx_sync_logs_madrasah ON public.sync_logs(madrasah_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_student_nis ON public.sync_logs(student_nis);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

-- 3. SEED DEFAULT INTEGRATION CONFIG UNTUK SI-NUSA.COM
INSERT INTO public.api_integrations (id, madrasah_id, target_name, endpoint_url, secret_token, is_active)
VALUES 
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'all',
    'SI-NUSA Portal (Pusat)',
    'https://si-nusa.com/api/v1/sync-grades',
    'sinusa_sec_token_live_9f83a4c2e1',
    TRUE
)
ON CONFLICT (id) DO NOTHING;
