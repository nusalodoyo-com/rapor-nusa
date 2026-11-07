const fs = require('fs');

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

const raw = fs.readFileSync('scripts/siswa_ma.csv', 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
const header = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());

const students = [];

for (let i = 1; i < lines.length; i++) {
  const parts = parseCSVLine(lines[i]).map(p => p.replace(/^"|"$/g, '').trim());
  const row = {};
  header.forEach((h, idx) => {
    if (h) row[h] = parts[idx] || '';
  });

  const nis = row['nis'] || '';
  const nisn = row['nisn'] || '';
  const nama_siswa = row['nama_siswa'] || '';
  const kelas = row['kelas'] || '';
  const jenis_kelamin = (row['jenis_kelamin'] || 'L').toUpperCase();
  const tempat_lahir = row['tempat_lahir'] || '';
  const tanggal_lahir = row['tanggal_lahir'] || '';
  const nama_ortu = row['nama_ortu'] || '';
  const alamat = row['alamat'] || '';

  if (nis && nama_siswa) {
    students.push({
      id: `ma-s-${nis}`,
      madrasah_id: 'ma',
      nis,
      nisn: nisn || '-',
      nama_siswa,
      kelas,
      jenis_kelamin: jenis_kelamin === 'P' ? 'P' : 'L',
      tempat_lahir,
      tanggal_lahir,
      nama_ortu,
      alamat: alamat || 'Sutojayan'
    });
  }
}

const fileContent = `import { Siswa } from "@/types";

export const SEED_CLASSES_MA = ["10A", "10B", "10C", "10D"];

export const SEED_SISWA_MA: Siswa[] = ${JSON.stringify(students, null, 2)};
`;

fs.writeFileSync('src/lib/constants/maStudents.ts', fileContent, 'utf8');
console.log('Successfully generated src/lib/constants/maStudents.ts with', students.length, 'students.');
