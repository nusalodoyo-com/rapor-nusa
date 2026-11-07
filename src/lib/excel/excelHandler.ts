import ExcelJS from "exceljs";
import { NilaiMapelItem, NilaiEkskulItem, RaporWaliItem } from "@/types";

const LOCKED_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF3F4F6" }, // light grey
};

const LOCKED_FONT: Partial<ExcelJS.Font> = {
  color: { argb: "FF4B5563" },
  bold: true,
};

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF166534" }, // Madrasah green
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  color: { argb: "FFFFFFFF" },
  bold: true,
};

export async function downloadExcelMapel(
  kelas: string,
  kodeMapel: string,
  namaMapel: string,
  data: NilaiMapelItem[]
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`Nilai_${kodeMapel}`);

  ws.getColumn(1).width = 16;
  ws.getColumn(2).width = 32;
  ws.getColumn(3).width = 12;
  ws.getColumn(4).width = 12;
  ws.getColumn(5).width = 12;
  ws.getColumn(6).width = 12;
  ws.getColumn(7).width = 12;
  ws.getColumn(8).width = 12;
  ws.getColumn(9).width = 30;

  const first = data.length > 0 ? data[0] : null;

  // Baris 1: Header Judul Materi
  const row1 = ws.addRow(["JANGAN UBAH NIS & NAMA", "", "Materi 1", "Materi 2", "Materi 3", "Materi 4", "", "", ""]);
  row1.getCell(1).font = { bold: true, color: { argb: "FFDC2626" } };
  row1.getCell(3).font = { bold: true };
  row1.getCell(4).font = { bold: true };
  row1.getCell(5).font = { bold: true };
  row1.getCell(6).font = { bold: true };

  // Baris 2: Input Judul Materi
  const row2 = ws.addRow([
    "",
    "",
    first?.materi_1 || "",
    first?.materi_2 || "",
    first?.materi_3 || "",
    first?.materi_4 || "",
    "",
    "",
    ""
  ]);
  for (let c = 3; c <= 6; c++) {
    row2.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF08A" } }; // yellow highlight
    row2.getCell(c).font = { bold: true, color: { argb: "FF854D0E" } };
  }

  // Baris 3: Header Kolom Nilai
  const row3 = ws.addRow(["NIS", "Nama Siswa", "Harian 1", "Harian 2", "Harian 3", "Harian 4", "STS (UTS)", "SAS (UAS)", "Catatan Mapel"]);
  row3.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Baris 4+: Data Siswa
  data.forEach((s) => {
    const r = ws.addRow([
      s.nis,
      s.nama_siswa,
      s.nilai_harian_1 || 0,
      s.nilai_harian_2 || 0,
      s.nilai_harian_3 || 0,
      s.nilai_harian_4 || 0,
      s.nilai_uts || 0,
      s.nilai_uas || 0,
      s.catatan_mapel || "",
    ]);

    // Beri proteksi visual pada NIS dan Nama
    r.getCell(1).fill = LOCKED_FILL;
    r.getCell(1).font = LOCKED_FONT;
    r.getCell(1).alignment = { horizontal: "center" };

    r.getCell(2).fill = LOCKED_FILL;
    r.getCell(2).font = LOCKED_FONT;

    for (let i = 3; i <= 8; i++) {
      r.getCell(i).alignment = { horizontal: "center" };
    }
  });

  await triggerDownload(wb, `Template_Nilai_${kodeMapel}_Kelas_${kelas}.xlsx`);
}

export async function downloadExcelEkskul(
  kelas: string,
  namaEkskul: string,
  data: NilaiEkskulItem[]
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`Ekskul_${namaEkskul}`);

  ws.getColumn(1).width = 16;
  ws.getColumn(2).width = 32;
  ws.getColumn(3).width = 20;
  ws.getColumn(4).width = 40;

  const header = ws.addRow(["NIS", "Nama Siswa", "Predikat (Sangat Baik/Baik/Cukup/Kurang)", "Keterangan Capaian"]);
  header.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  data.forEach((s) => {
    const r = ws.addRow([s.nis, s.nama_siswa, s.predikat || "Baik", s.keterangan || ""]);
    r.getCell(1).fill = LOCKED_FILL;
    r.getCell(1).font = LOCKED_FONT;
    r.getCell(1).alignment = { horizontal: "center" };
    r.getCell(2).fill = LOCKED_FILL;
    r.getCell(2).font = LOCKED_FONT;
    r.getCell(3).alignment = { horizontal: "center" };
  });

  await triggerDownload(wb, `Template_Ekskul_${namaEkskul}_Kelas_${kelas}.xlsx`);
}

export async function downloadExcelWali(
  kelas: string,
  data: RaporWaliItem[]
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`Rapor_Wali_${kelas}`);

  ws.getColumn(1).width = 16;
  ws.getColumn(2).width = 32;
  ws.getColumn(3).width = 12;
  ws.getColumn(4).width = 12;
  ws.getColumn(5).width = 12;
  ws.getColumn(6).width = 40;
  ws.getColumn(7).width = 20;

  const header = ws.addRow(["NIS", "Nama Siswa", "Sakit", "Izin", "Alpha", "Catatan Wali Kelas", "Keputusan (Naik Kelas / Lulus / -)"]);
  header.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  data.forEach((s) => {
    const r = ws.addRow([
      s.nis,
      s.nama_siswa,
      s.sakit || 0,
      s.izin || 0,
      s.tanpa_keterangan || 0,
      s.catatan_wali || "",
      s.keputusan || "-",
    ]);
    r.getCell(1).fill = LOCKED_FILL;
    r.getCell(1).font = LOCKED_FONT;
    r.getCell(1).alignment = { horizontal: "center" };
    r.getCell(2).fill = LOCKED_FILL;
    r.getCell(2).font = LOCKED_FONT;
    r.getCell(3).alignment = { horizontal: "center" };
    r.getCell(4).alignment = { horizontal: "center" };
    r.getCell(5).alignment = { horizontal: "center" };
    r.getCell(7).alignment = { horizontal: "center" };
  });

  await triggerDownload(wb, `Template_RaporWali_Kelas_${kelas}.xlsx`);
}

async function triggerDownload(wb: ExcelJS.Workbook, filename: string): Promise<void> {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export async function parseExcelUpload(
  file: File,
  tipe: "mapel" | "ekskul" | "wali"
): Promise<{
  materis?: [string, string, string, string];
  dataMapel?: Partial<NilaiMapelItem>[];
  dataEkskul?: Partial<NilaiEkskulItem>[];
  dataWali?: Partial<RaporWaliItem>[];
}> {
  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];

  if (tipe === "mapel") {
    const row2 = ws.getRow(2);
    const m1 = String(row2.getCell(3).value || "").trim();
    const m2 = String(row2.getCell(4).value || "").trim();
    const m3 = String(row2.getCell(5).value || "").trim();
    const m4 = String(row2.getCell(6).value || "").trim();

    const dataMapel: Partial<NilaiMapelItem>[] = [];

    ws.eachRow((row, rowNum) => {
      if (rowNum >= 4) {
        const nis = String(row.getCell(1).value || "").trim();
        const nama = String(row.getCell(2).value || "").trim();
        if (!nis) return;

        dataMapel.push({
          nis: nis,
          nama_siswa: nama,
          materi_1: m1,
          materi_2: m2,
          materi_3: m3,
          materi_4: m4,
          nilai_harian_1: Number(row.getCell(3).value) || 0,
          nilai_harian_2: Number(row.getCell(4).value) || 0,
          nilai_harian_3: Number(row.getCell(5).value) || 0,
          nilai_harian_4: Number(row.getCell(6).value) || 0,
          nilai_uts: Number(row.getCell(7).value) || 0,
          nilai_uas: Number(row.getCell(8).value) || 0,
          catatan_mapel: String(row.getCell(9).value || "").trim(),
        });
      }
    });

    return { materis: [m1, m2, m3, m4], dataMapel };
  } else if (tipe === "ekskul") {
    const dataEkskul: Partial<NilaiEkskulItem>[] = [];

    ws.eachRow((row, rowNum) => {
      if (rowNum >= 2) {
        const nis = String(row.getCell(1).value || "").trim();
        const nama = String(row.getCell(2).value || "").trim();
        const pred = String(row.getCell(3).value || "Baik").trim() as any;
        const ket = String(row.getCell(4).value || "").trim();
        if (!nis) return;

        dataEkskul.push({
          nis,
          nama_siswa: nama,
          predikat: pred,
          keterangan: ket,
          checked: true,
        });
      }
    });

    return { dataEkskul };
  } else {
    const dataWali: Partial<RaporWaliItem>[] = [];

    ws.eachRow((row, rowNum) => {
      if (rowNum >= 2) {
        const nis = String(row.getCell(1).value || "").trim();
        const nama = String(row.getCell(2).value || "").trim();
        if (!nis) return;

        dataWali.push({
          nis,
          nama_siswa: nama,
          sakit: Number(row.getCell(3).value) || 0,
          izin: Number(row.getCell(4).value) || 0,
          tanpa_keterangan: Number(row.getCell(5).value) || 0,
          catatan_wali: String(row.getCell(6).value || "").trim(),
          keputusan: String(row.getCell(7).value || "-").trim() as any,
        });
      }
    });

    return { dataWali };
  }
}
