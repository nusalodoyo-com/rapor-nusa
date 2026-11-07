const fs = require('fs');
const path = require('path');

function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    let inQuotes = false;
    let field = '';
    const row = [];
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push(field.trim());
        field = '';
      } else {
        field += c;
      }
    }
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

const csvFile = path.join(__dirname, 'teachers_data.csv');
const raw = fs.readFileSync(csvFile, 'utf8');
const rows = parseCSV(raw);

console.log('Total parsed rows:', rows.length);

const usedUsernames = new Set();
const teachersMts = [];
const teachersMa = [];

rows.forEach((r, idx) => {
  const no = r[0] || String(idx + 1);
  const nik = r[1] || '-';
  const nama = r[2] || 'Guru ' + no;
  const jk = (r[3] && r[3].toUpperCase() === 'P') ? 'P' : 'L';
  const ttl = r[4] || '';
  const password = r[5] || 'Matsamuda22';

  // Generate unique clean username
  let clean = nama.toLowerCase()
    .replace(/^(drs\.|dr\.|hj\.|h\.)\s*/gi, '')
    .replace(/,\s*(s\.pd|s\.si|m\.e|m\.pd|s\.th\.i|m\.a|s\.kom|sh|mm|lc|s\.t|m\.pd\.i|s\.pd\.i|s\.sos\.l|s\.pd\.l|ma).*/gi, '')
    .replace(/[`'’\.\,]/g, '')
    .trim();

  let parts = clean.split(/\s+/).filter(Boolean);
  let baseUname = parts.slice(0, 2).join('_').replace(/[^a-z0-9_]/g, '');
  if (!baseUname || baseUname.length < 3) baseUname = 'guru_' + no;

  let uname = baseUname;
  let counter = 2;
  while (usedUsernames.has(uname)) {
    uname = `${baseUname}_${counter}`;
    counter++;
  }
  usedUsernames.add(uname);

  // Role
  let role = 'guru';
  if (nama.toLowerCase().includes('ulil amin')) {
    role = 'kamad';
  } else if (nama.toLowerCase().includes('zen pamuji')) {
    role = 'kamad';
  }

  // MTs Teacher User object
  teachersMts.push({
    id: `guru-mts-${no.padStart(3, '0')}`,
    madrasah_id: 'mts',
    username: uname,
    password: password,
    nama_user: nama,
    nip: nik,
    jenis_kelamin: jk,
    role: role,
    kelas_diampu: '-',
  });

  // MA Teacher User object (teachers can also be available for MA)
  teachersMa.push({
    id: `guru-ma-${no.padStart(3, '0')}`,
    madrasah_id: 'ma',
    username: uname,
    password: password,
    nama_user: nama,
    nip: nik,
    jenis_kelamin: jk,
    role: role,
    kelas_diampu: '-',
  });
});

console.log(`Generated ${teachersMts.length} teachers.`);

const fileContent = `import { User } from "@/types";

export const REAL_TEACHERS_MTS: User[] = ${JSON.stringify(teachersMts, null, 2)};

export const REAL_TEACHERS_MA: User[] = ${JSON.stringify(teachersMa, null, 2)};
`;

const outPath = path.join(__dirname, '../src/lib/constants/teachersData.ts');
fs.writeFileSync(outPath, fileContent, 'utf8');
console.log('Saved to:', outPath);
