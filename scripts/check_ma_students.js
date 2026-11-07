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

console.log('Header length:', header.length, header.slice(0, 10));

const students = [];
const classCounts = {};

for (let i = 1; i < lines.length; i++) {
  const parts = parseCSVLine(lines[i]).map(p => p.replace(/^"|"$/g, '').trim());
  const row = {};
  header.forEach((h, idx) => {
    if (h) row[h] = parts[idx] || '';
  });

  const nis = row['nis'] || '';
  const nisn = row['nisn'] || '';
  const nama_siswa = row['nama_siswa'] || '';
  let kelas = row['kelas'] || '';
  const jenis_kelamin = (row['jenis_kelamin'] || 'L').toUpperCase();
  const tempat_lahir = row['tempat_lahir'] || '';
  const tanggal_lahir = row['tanggal_lahir'] || '';
  const nama_ortu = row['nama_ortu'] || '';
  const alamat = row['alamat'] || '';

  if (nis && nama_siswa) {
    // Normalisasi nama kelas: misal "10A" -> "X-A" atau "10A", "11 IPA" -> "XI-IPA", dsb jika perlu atau pertahankan kelas asli
    students.push({
      nis,
      nisn,
      nama_siswa,
      kelas,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      nama_ortu,
      alamat
    });
    classCounts[kelas] = (classCounts[kelas] || 0) + 1;
  }
}

console.log('Total valid students:', students.length);
console.log('Class counts:', classCounts);
console.log('Sample student:', students[0]);
