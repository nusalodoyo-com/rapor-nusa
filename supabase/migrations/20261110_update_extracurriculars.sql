-- ====================================================================
-- PEMBARUAN DAFTAR EKSTRAKURIKULER RESMI MTs & MA (12 PROGRAM)
-- ====================================================================

-- Hapus data ekskul lama jika masih belum terhubung ke nilai (atau sesuaikan nama)
-- Catatan: Gunakan ON CONFLICT DO NOTHING untuk menjaga integritas data nilai yang sudah ada

INSERT INTO public.extracurriculars (madrasah_id, nama_ekskul, deskripsi)
VALUES
  -- MTs Ma'arif NU 2 Sutojayan
  ('mts', 'Sholawat & Banjari', 'Seni vokal islami dan rebana Al-Banjari'),
  ('mts', 'Kaligrafi Seni Al-Qur''an', 'Seni tulis indah huruf Arab dan kaligrafi mushaf'),
  ('mts', 'Futsal', 'Olahraga bola futsal prestasi dan kebugaran'),
  ('mts', 'Voli', 'Olahraga bola voli putra dan putri'),
  ('mts', 'Tenis Meja', 'Olahraga ketangkasan tenis meja'),
  ('mts', 'Olimpiade Sains (OSN) & PAI', 'Pembinaan olimpiade sains madrasah, IPA, Matematika, IPS, dan PAI'),
  ('mts', 'Pramuka Penggalang', 'Kepanduan Praja Muda Karana Ma''arif NU'),
  ('mts', 'Tata Boga', 'Keterampilan kuliner dan pengolahan pangan'),
  ('mts', 'Komputer', 'Keterampilan teknologi informasi, desain, dan perkantoran'),
  ('mts', 'Catur', 'Olahraga strategi berpikir dan kecerdasan catur'),
  ('mts', 'Qiro''ah', 'Seni baca Al-Qur''an (Tilawah / Mujawwad)'),
  ('mts', 'Tata Busana', 'Keterampilan menjahit, pola pakaian, dan desain busana'),

  -- MA Ma'arif Nurus Salam
  ('ma', 'Sholawat & Banjari', 'Seni vokal islami dan rebana Al-Banjari'),
  ('ma', 'Kaligrafi Seni Al-Qur''an', 'Seni tulis indah huruf Arab dan kaligrafi mushaf'),
  ('ma', 'Futsal', 'Olahraga bola futsal prestasi dan kebugaran'),
  ('ma', 'Voli', 'Olahraga bola voli putra dan putri'),
  ('ma', 'Tenis Meja', 'Olahraga ketangkasan tenis meja'),
  ('ma', 'Olimpiade Sains (OSN) & PAI', 'Pembinaan olimpiade sains madrasah, Sains, dan PAI'),
  ('ma', 'Pramuka Penggalang', 'Kepanduan Praja Muda Karana Ma''arif NU'),
  ('ma', 'Tata Boga', 'Keterampilan kuliner dan pengolahan pangan'),
  ('ma', 'Komputer', 'Keterampilan teknologi informasi, desain, dan perkantoran'),
  ('ma', 'Catur', 'Olahraga strategi berpikir dan kecerdasan catur'),
  ('ma', 'Qiro''ah', 'Seni baca Al-Qur''an (Tilawah / Mujawwad)'),
  ('ma', 'Tata Busana', 'Keterampilan menjahit, pola pakaian, dan desain busana')
ON CONFLICT (madrasah_id, nama_ekskul) DO UPDATE SET
  deskripsi = EXCLUDED.deskripsi;
