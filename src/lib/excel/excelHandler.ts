import ExcelJS from "exceljs";
import { NilaiMapelItem, NilaiEkskulItem, RaporWaliItem, MadrasahId, SchoolConfig, LeggerResponse } from "@/types";
import { getLeggerDataByKelas } from "@/lib/storage";

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

// Styling Spesifik Mengacu Standar Template RDM Kemenag
const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FF595959" } },
  left: { style: "thin", color: { argb: "FF595959" } },
  bottom: { style: "thin", color: { argb: "FF595959" } },
  right: { style: "thin", color: { argb: "FF595959" } },
};

const FILL_RDM_GREY_HEADER: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF7F7F7F" },
};

const FILL_RDM_GREY_CELL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD9D9D9" },
};

const FILL_RDM_YELLOW: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFFF00" },
};

export interface RdmTemplateOptions {
  kelas: string;
  kodeMapel: string;
  namaMapel: string;
  semester: string;
  tahun: string;
  kkm?: number;
  dataNilai: NilaiMapelItem[];
  allSiswaMap?: Record<string, string>; // nis -> nisn
}

function cleanFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9_\-]/g, "_");
}

// =====================================================================
// 1. TEMPLATE RDM RESMI: NILAI HARIAN / PH (15 SHEETS: PH 1 - PH 15)
// =====================================================================
export async function downloadTemplateRdmHarian(options: RdmTemplateOptions): Promise<void> {
  const { kelas, kodeMapel, namaMapel, dataNilai, allSiswaMap = {} } = options;
  const wb = new ExcelJS.Workbook();
  wb.creator = "RDM Kemenag RI";

  const first = dataNilai.length > 0 ? dataNilai[0] : null;
  const materiMap: Record<number, string> = {
    1: first?.materi_1 || "",
    2: first?.materi_2 || "",
    3: first?.materi_3 || "",
    4: first?.materi_4 || "",
  };

  // Buat 15 sheet standar RDM Kemenag (PH 1 s.d. PH 15)
  for (let ph = 1; ph <= 15; ph++) {
    const sheetName = `PH ${ph}`;
    const ws = wb.addWorksheet(sheetName);

    // Setup kolom sesuai standar RDM (Kolom B disembunyikan/width 0)
    ws.getColumn(1).width = 7; // A: No / Label
    ws.getColumn(2).width = 0; // B: Hidden
    ws.getColumn(2).hidden = true;
    ws.getColumn(3).width = 14; // C: NIS
    ws.getColumn(4).width = 18; // D: Nisn
    ws.getColumn(5).width = 38; // E: Nama
    ws.getColumn(6).width = 14; // F: Nilai

    // Baris 1: Judul Template
    ws.mergeCells("A1:F1");
    const cA1 = ws.getCell("A1");
    cA1.value = "Template Nilai Harian";
    cA1.font = { name: "Calibri", size: 14, bold: true };
    cA1.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 26;

    // Baris 2: Nama PH & Kelas/Mapel
    const cA2 = ws.getCell("A2");
    cA2.value = "Nama";
    cA2.fill = FILL_RDM_GREY_HEADER;
    cA2.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cA2.alignment = { horizontal: "center", vertical: "middle" };
    cA2.border = BORDER_THIN;

    const cC2 = ws.getCell("C2");
    cC2.value = `PH ${ph}`;
    cC2.fill = FILL_RDM_YELLOW;
    cC2.font = { name: "Calibri", size: 11, bold: true };
    cC2.alignment = { horizontal: "center", vertical: "middle" };
    cC2.border = BORDER_THIN;

    ws.mergeCells("D2:E2");
    const cD2 = ws.getCell("D2");
    cD2.value = `Kelas/Mapel: ${kelas}/${namaMapel}`;
    cD2.fill = FILL_RDM_YELLOW;
    cD2.font = { name: "Calibri", size: 11, bold: true };
    cD2.alignment = { horizontal: "left", vertical: "middle" };
    cD2.border = BORDER_THIN;

    const cF2 = ws.getCell("F2");
    cF2.fill = FILL_RDM_YELLOW;
    cF2.border = BORDER_THIN;
    ws.getRow(2).height = 22;

    // Baris 3: Pemisah tipis
    ws.getRow(3).height = 4;

    // Baris 4: Materi
    const cA4 = ws.getCell("A4");
    cA4.value = "Materi";
    cA4.fill = FILL_RDM_GREY_HEADER;
    cA4.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cA4.alignment = { horizontal: "center", vertical: "middle" };
    cA4.border = BORDER_THIN;

    ws.mergeCells("C4:F4");
    const cC4 = ws.getCell("C4");
    cC4.value = materiMap[ph] || "";
    cC4.fill = FILL_RDM_YELLOW;
    cC4.font = { name: "Calibri", size: 11 };
    cC4.alignment = { horizontal: "left", vertical: "middle" };
    cC4.border = BORDER_THIN;
    ws.getRow(4).height = 24;

    // Baris 5: Pemisah kosong
    ws.getRow(5).height = 8;

    // Baris 6: Header Tabel
    const headers = [
      { col: "A", val: "No" },
      { col: "C", val: "NIS" },
      { col: "D", val: "Nisn" },
      { col: "E", val: "Nama" },
      { col: "F", val: "Nilai" },
    ];
    headers.forEach(h => {
      const cell = ws.getCell(`${h.col}6`);
      cell.value = h.val;
      cell.fill = FILL_RDM_GREY_HEADER;
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = BORDER_THIN;
    });
    ws.getRow(6).height = 24;

    // Baris 7+: Data Peserta Didik
    dataNilai.forEach((siswa, idx) => {
      const r = 7 + idx;
      let valNilai: number | string = "";

      if (ph === 1 && Number(siswa.nilai_harian_1) > 0) valNilai = Number(siswa.nilai_harian_1);
      else if (ph === 2 && Number(siswa.nilai_harian_2) > 0) valNilai = Number(siswa.nilai_harian_2);
      else if (ph === 3 && Number(siswa.nilai_harian_3) > 0) valNilai = Number(siswa.nilai_harian_3);
      else if (ph === 4 && Number(siswa.nilai_harian_4) > 0) valNilai = Number(siswa.nilai_harian_4);

      const nisnVal = allSiswaMap[siswa.nis] || siswa.nisn || "";

      // Col A: No
      const cA = ws.getCell(`A${r}`);
      cA.value = idx + 1;
      cA.fill = FILL_RDM_GREY_CELL;
      cA.font = { name: "Calibri", size: 11 };
      cA.alignment = { horizontal: "center", vertical: "middle" };
      cA.border = BORDER_THIN;

      // Col C: NIS
      const cC = ws.getCell(`C${r}`);
      cC.value = siswa.nis;
      cC.fill = FILL_RDM_GREY_CELL;
      cC.font = { name: "Calibri", size: 11 };
      cC.alignment = { horizontal: "center", vertical: "middle" };
      cC.border = BORDER_THIN;

      // Col D: Nisn
      const cD = ws.getCell(`D${r}`);
      cD.value = String(nisnVal);
      cD.fill = FILL_RDM_GREY_CELL;
      cD.font = { name: "Calibri", size: 11 };
      cD.alignment = { horizontal: "center", vertical: "middle" };
      cD.border = BORDER_THIN;

      // Col E: Nama
      const cE = ws.getCell(`E${r}`);
      cE.value = siswa.nama_siswa.toUpperCase();
      cE.fill = FILL_RDM_GREY_CELL;
      cE.font = { name: "Calibri", size: 11 };
      cE.alignment = { horizontal: "left", vertical: "middle" };
      cE.border = BORDER_THIN;

      // Col F: Nilai (Kuning)
      const cF = ws.getCell(`F${r}`);
      cF.value = valNilai;
      cF.fill = FILL_RDM_YELLOW;
      cF.font = { name: "Calibri", size: 11, bold: true };
      cF.alignment = { horizontal: "center", vertical: "middle" };
      cF.border = BORDER_THIN;

      ws.getRow(r).height = 20;
    });
  }

  await triggerDownload(
    wb,
    `Template_Nilai_Harian_${cleanFilename(namaMapel)}_Kelas_${cleanFilename(kelas)}.xlsx`
  );
}

// =====================================================================
// 2. TEMPLATE RDM RESMI: NILAI SUMATIF (9 SHEETS: SUM 1 - SUM 9)
// =====================================================================
export async function downloadTemplateRdmSumatif(options: RdmTemplateOptions): Promise<void> {
  const { kelas, kodeMapel, namaMapel, dataNilai, kkm = 70, allSiswaMap = {} } = options;
  const wb = new ExcelJS.Workbook();
  wb.creator = "RDM Kemenag RI";

  const first = dataNilai.length > 0 ? dataNilai[0] : null;
  const materiMap: Record<number, string> = {
    1: first?.materi_1 || "",
    2: first?.materi_2 || "",
    3: first?.materi_3 || "",
    4: first?.materi_4 || "",
  };

  for (let s = 1; s <= 9; s++) {
    const sheetName = `SUM ${s}`;
    const ws = wb.addWorksheet(sheetName);

    ws.getColumn(1).width = 7;
    ws.getColumn(2).width = 0;
    ws.getColumn(2).hidden = true;
    ws.getColumn(3).width = 14;
    ws.getColumn(4).width = 18;
    ws.getColumn(5).width = 38;
    ws.getColumn(6).width = 14;

    // Baris 1: Template Nilai Sumatif
    ws.mergeCells("A1:F1");
    const cA1 = ws.getCell("A1");
    cA1.value = "Template Nilai Sumatif";
    cA1.font = { name: "Calibri", size: 14, bold: true };
    cA1.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 26;

    // Baris 2: Nama & Kelas/Mapel
    const cA2 = ws.getCell("A2");
    cA2.value = "Nama";
    cA2.fill = FILL_RDM_GREY_HEADER;
    cA2.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cA2.alignment = { horizontal: "center", vertical: "middle" };
    cA2.border = BORDER_THIN;

    const cC2 = ws.getCell("C2");
    cC2.value = `SUM ${s}`;
    cC2.fill = FILL_RDM_YELLOW;
    cC2.font = { name: "Calibri", size: 11, bold: true };
    cC2.alignment = { horizontal: "center", vertical: "middle" };
    cC2.border = BORDER_THIN;

    const cD2 = ws.getCell("D2");
    cD2.value = "Kelas/Mapel:";
    cD2.fill = FILL_RDM_YELLOW;
    cD2.font = { name: "Calibri", size: 11, bold: true };
    cD2.alignment = { horizontal: "right", vertical: "middle" };
    cD2.border = BORDER_THIN;

    ws.mergeCells("E2:F2");
    const cE2 = ws.getCell("E2");
    cE2.value = `${kelas}/${namaMapel}`;
    cE2.fill = FILL_RDM_YELLOW;
    cE2.font = { name: "Calibri", size: 11, bold: true };
    cE2.alignment = { horizontal: "left", vertical: "middle" };
    cE2.border = BORDER_THIN;
    ws.getRow(2).height = 22;

    // Baris 3: Pemisah tipis
    ws.getRow(3).height = 4;

    // Baris 4: Materi
    const cA4 = ws.getCell("A4");
    cA4.value = "Materi";
    cA4.fill = FILL_RDM_GREY_HEADER;
    cA4.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cA4.alignment = { horizontal: "center", vertical: "middle" };
    cA4.border = BORDER_THIN;

    ws.mergeCells("C4:F4");
    const cC4 = ws.getCell("C4");
    cC4.value = materiMap[s] || "";
    cC4.fill = FILL_RDM_YELLOW;
    cC4.font = { name: "Calibri", size: 11 };
    cC4.alignment = { horizontal: "left", vertical: "middle" };
    cC4.border = BORDER_THIN;
    ws.getRow(4).height = 24;

    // Baris 5: KKTP
    const cA5 = ws.getCell("A5");
    cA5.value = "KKTP";
    cA5.fill = FILL_RDM_GREY_HEADER;
    cA5.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cA5.alignment = { horizontal: "center", vertical: "middle" };
    cA5.border = BORDER_THIN;

    const cC5 = ws.getCell("C5");
    cC5.value = kkm;
    cC5.fill = FILL_RDM_YELLOW;
    cC5.font = { name: "Calibri", size: 11, bold: true };
    cC5.alignment = { horizontal: "center", vertical: "middle" };
    cC5.border = BORDER_THIN;

    ws.mergeCells("D5:F5");
    const cD5 = ws.getCell("D5");
    cD5.fill = FILL_RDM_YELLOW;
    cD5.border = BORDER_THIN;
    ws.getRow(5).height = 22;

    // Baris 6: Header Tabel
    const headers = [
      { col: "A", val: "No" },
      { col: "C", val: "NIS" },
      { col: "D", val: "Nisn" },
      { col: "E", val: "Nama" },
      { col: "F", val: "Nilai" },
    ];
    headers.forEach(h => {
      const cell = ws.getCell(`${h.col}6`);
      cell.value = h.val;
      cell.fill = FILL_RDM_GREY_HEADER;
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = BORDER_THIN;
    });
    ws.getRow(6).height = 24;

    // Baris 7+: Data Siswa
    dataNilai.forEach((siswa, idx) => {
      const r = 7 + idx;
      let valNilai: number | string = "";

      if (s === 1 && Number(siswa.nilai_harian_1) > 0) valNilai = Number(siswa.nilai_harian_1);
      else if (s === 2 && Number(siswa.nilai_harian_2) > 0) valNilai = Number(siswa.nilai_harian_2);
      else if (s === 3 && Number(siswa.nilai_harian_3) > 0) valNilai = Number(siswa.nilai_harian_3);
      else if (s === 4 && Number(siswa.nilai_harian_4) > 0) valNilai = Number(siswa.nilai_harian_4);

      const nisnVal = allSiswaMap[siswa.nis] || siswa.nisn || "";

      const cA = ws.getCell(`A${r}`);
      cA.value = idx + 1;
      cA.fill = FILL_RDM_GREY_CELL;
      cA.alignment = { horizontal: "center", vertical: "middle" };
      cA.border = BORDER_THIN;

      const cC = ws.getCell(`C${r}`);
      cC.value = siswa.nis;
      cC.fill = FILL_RDM_GREY_CELL;
      cC.alignment = { horizontal: "center", vertical: "middle" };
      cC.border = BORDER_THIN;

      const cD = ws.getCell(`D${r}`);
      cD.value = String(nisnVal);
      cD.fill = FILL_RDM_GREY_CELL;
      cD.alignment = { horizontal: "center", vertical: "middle" };
      cD.border = BORDER_THIN;

      const cE = ws.getCell(`E${r}`);
      cE.value = siswa.nama_siswa.toUpperCase();
      cE.fill = FILL_RDM_GREY_CELL;
      cE.alignment = { horizontal: "left", vertical: "middle" };
      cE.border = BORDER_THIN;

      const cF = ws.getCell(`F${r}`);
      cF.value = valNilai;
      cF.fill = FILL_RDM_YELLOW;
      cF.font = { name: "Calibri", size: 11, bold: true };
      cF.alignment = { horizontal: "center", vertical: "middle" };
      cF.border = BORDER_THIN;

      ws.getRow(r).height = 20;
    });
  }

  await triggerDownload(
    wb,
    `Template_Nilai_Sumatif_${cleanFilename(namaMapel)}_Kelas_${cleanFilename(kelas)}.xlsx`
  );
}

// =====================================================================
// 3. TEMPLATE RDM RESMI: PENILAIAN AKHIR SEMESTER (PAS / SAS)
// =====================================================================
export async function downloadTemplateRdmPAS(options: RdmTemplateOptions): Promise<void> {
  const { kelas, kodeMapel, namaMapel, semester, tahun, kkm = 70, dataNilai, allSiswaMap = {} } = options;
  const wb = new ExcelJS.Workbook();
  wb.creator = "RDM Kemenag RI";

  const ws = wb.addWorksheet("PAS");

  ws.getColumn(1).width = 7;
  ws.getColumn(2).width = 0;
  ws.getColumn(2).hidden = true;
  ws.getColumn(3).width = 14;
  ws.getColumn(4).width = 18;
  ws.getColumn(5).width = 38;
  ws.getColumn(6).width = 14;

  // Baris 1: Judul
  ws.mergeCells("A1:F1");
  const cA1 = ws.getCell("A1");
  cA1.value = "Template Nilai Akhir Semester";
  cA1.font = { name: "Calibri", size: 14, bold: true };
  cA1.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 26;

  // Baris 2: Nama & Kelas/Mapel
  const cA2 = ws.getCell("A2");
  cA2.value = "Nama";
  cA2.fill = FILL_RDM_GREY_HEADER;
  cA2.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  cA2.alignment = { horizontal: "center", vertical: "middle" };
  cA2.border = BORDER_THIN;

  const cC2 = ws.getCell("C2");
  cC2.value = "PAS";
  cC2.fill = FILL_RDM_YELLOW;
  cC2.font = { name: "Calibri", size: 11, bold: true };
  cC2.alignment = { horizontal: "center", vertical: "middle" };
  cC2.border = BORDER_THIN;

  const cD2 = ws.getCell("D2");
  cD2.value = "Kelas/Mapel:";
  cD2.fill = FILL_RDM_YELLOW;
  cD2.font = { name: "Calibri", size: 11, bold: true };
  cD2.alignment = { horizontal: "right", vertical: "middle" };
  cD2.border = BORDER_THIN;

  ws.mergeCells("E2:F2");
  const cE2 = ws.getCell("E2");
  cE2.value = `${kelas}/${namaMapel}`;
  cE2.fill = FILL_RDM_YELLOW;
  cE2.font = { name: "Calibri", size: 11, bold: true };
  cE2.alignment = { horizontal: "left", vertical: "middle" };
  cE2.border = BORDER_THIN;
  ws.getRow(2).height = 22;

  // Baris 3: Pemisah tipis
  ws.getRow(3).height = 4;

  // Baris 4: Semester
  const cA4 = ws.getCell("A4");
  cA4.value = "Semester";
  cA4.fill = FILL_RDM_GREY_HEADER;
  cA4.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  cA4.alignment = { horizontal: "center", vertical: "middle" };
  cA4.border = BORDER_THIN;

  ws.mergeCells("C4:F4");
  const cC4 = ws.getCell("C4");
  cC4.value = `${semester === "1" ? "Gasal" : "Genap"} ${tahun}`;
  cC4.fill = FILL_RDM_YELLOW;
  cC4.font = { name: "Calibri", size: 11 };
  cC4.alignment = { horizontal: "left", vertical: "middle" };
  cC4.border = BORDER_THIN;
  ws.getRow(4).height = 22;

  // Baris 5: KKM / KKTP
  const cA5 = ws.getCell("A5");
  cA5.value = "KKM";
  cA5.fill = FILL_RDM_GREY_HEADER;
  cA5.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  cA5.alignment = { horizontal: "center", vertical: "middle" };
  cA5.border = BORDER_THIN;

  const cC5 = ws.getCell("C5");
  cC5.value = kkm;
  cC5.fill = FILL_RDM_YELLOW;
  cC5.font = { name: "Calibri", size: 11, bold: true };
  cC5.alignment = { horizontal: "center", vertical: "middle" };
  cC5.border = BORDER_THIN;

  ws.mergeCells("D5:F5");
  const cD5 = ws.getCell("D5");
  cD5.fill = FILL_RDM_YELLOW;
  cD5.border = BORDER_THIN;
  ws.getRow(5).height = 22;

  // Baris 6: Header Tabel
  const headers = [
    { col: "A", val: "No" },
    { col: "C", val: "NIS" },
    { col: "D", val: "Nisn" },
    { col: "E", val: "Nama" },
    { col: "F", val: "Nilai" },
  ];
  headers.forEach(h => {
    const cell = ws.getCell(`${h.col}6`);
    cell.value = h.val;
    cell.fill = FILL_RDM_GREY_HEADER;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = BORDER_THIN;
  });
  ws.getRow(6).height = 24;

  // Baris 7+: Data Siswa dengan Nilai PAS Otomatis
  dataNilai.forEach((siswa, idx) => {
    const r = 7 + idx;
    const valNilai = Number(siswa.nilai_uas) > 0 ? Number(siswa.nilai_uas) : "";
    const nisnVal = allSiswaMap[siswa.nis] || siswa.nisn || "";

    const cA = ws.getCell(`A${r}`);
    cA.value = idx + 1;
    cA.fill = FILL_RDM_GREY_CELL;
    cA.alignment = { horizontal: "center", vertical: "middle" };
    cA.border = BORDER_THIN;

    const cC = ws.getCell(`C${r}`);
    cC.value = siswa.nis;
    cC.fill = FILL_RDM_GREY_CELL;
    cC.alignment = { horizontal: "center", vertical: "middle" };
    cC.border = BORDER_THIN;

    const cD = ws.getCell(`D${r}`);
    cD.value = String(nisnVal);
    cD.fill = FILL_RDM_GREY_CELL;
    cD.alignment = { horizontal: "center", vertical: "middle" };
    cD.border = BORDER_THIN;

    const cE = ws.getCell(`E${r}`);
    cE.value = siswa.nama_siswa.toUpperCase();
    cE.fill = FILL_RDM_GREY_CELL;
    cE.alignment = { horizontal: "left", vertical: "middle" };
    cE.border = BORDER_THIN;

    const cF = ws.getCell(`F${r}`);
    cF.value = valNilai;
    cF.fill = FILL_RDM_YELLOW;
    cF.font = { name: "Calibri", size: 11, bold: true };
    cF.alignment = { horizontal: "center", vertical: "middle" };
    cF.border = BORDER_THIN;

    ws.getRow(r).height = 20;
  });

  await triggerDownload(
    wb,
    `Template_Nilai_PAS_${cleanFilename(namaMapel)}_Kelas_${cleanFilename(kelas)}.xlsx`
  );
}

// =====================================================================
// 4. TEMPLATE RDM RESMI: PENILAIAN TENGAH SEMESTER (PTS / STS)
// =====================================================================
export async function downloadTemplateRdmPTS(options: RdmTemplateOptions): Promise<void> {
  const { kelas, kodeMapel, namaMapel, semester, tahun, kkm = 70, dataNilai, allSiswaMap = {} } = options;
  const wb = new ExcelJS.Workbook();
  wb.creator = "RDM Kemenag RI";

  const ws = wb.addWorksheet("PTS");

  ws.getColumn(1).width = 7;
  ws.getColumn(2).width = 0;
  ws.getColumn(2).hidden = true;
  ws.getColumn(3).width = 14;
  ws.getColumn(4).width = 18;
  ws.getColumn(5).width = 38;
  ws.getColumn(6).width = 14;

  // Baris 1: Judul
  ws.mergeCells("A1:F1");
  const cA1 = ws.getCell("A1");
  cA1.value = "Template Nilai Tengah Semester";
  cA1.font = { name: "Calibri", size: 14, bold: true };
  cA1.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 26;

  // Baris 2: Nama & Kelas/Mapel
  const cA2 = ws.getCell("A2");
  cA2.value = "Nama";
  cA2.fill = FILL_RDM_GREY_HEADER;
  cA2.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  cA2.alignment = { horizontal: "center", vertical: "middle" };
  cA2.border = BORDER_THIN;

  const cC2 = ws.getCell("C2");
  cC2.value = "PTS";
  cC2.fill = FILL_RDM_YELLOW;
  cC2.font = { name: "Calibri", size: 11, bold: true };
  cC2.alignment = { horizontal: "center", vertical: "middle" };
  cC2.border = BORDER_THIN;

  const cD2 = ws.getCell("D2");
  cD2.value = "Kelas/Mapel:";
  cD2.fill = FILL_RDM_YELLOW;
  cD2.font = { name: "Calibri", size: 11, bold: true };
  cD2.alignment = { horizontal: "right", vertical: "middle" };
  cD2.border = BORDER_THIN;

  ws.mergeCells("E2:F2");
  const cE2 = ws.getCell("E2");
  cE2.value = `${kelas}/${namaMapel}`;
  cE2.fill = FILL_RDM_YELLOW;
  cE2.font = { name: "Calibri", size: 11, bold: true };
  cE2.alignment = { horizontal: "left", vertical: "middle" };
  cE2.border = BORDER_THIN;
  ws.getRow(2).height = 22;

  // Baris 3: Pemisah tipis
  ws.getRow(3).height = 4;

  // Baris 4: Semester
  const cA4 = ws.getCell("A4");
  cA4.value = "Semester";
  cA4.fill = FILL_RDM_GREY_HEADER;
  cA4.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  cA4.alignment = { horizontal: "center", vertical: "middle" };
  cA4.border = BORDER_THIN;

  ws.mergeCells("C4:F4");
  const cC4 = ws.getCell("C4");
  cC4.value = `${semester === "1" ? "Gasal" : "Genap"} ${tahun}`;
  cC4.fill = FILL_RDM_YELLOW;
  cC4.font = { name: "Calibri", size: 11 };
  cC4.alignment = { horizontal: "left", vertical: "middle" };
  cC4.border = BORDER_THIN;
  ws.getRow(4).height = 22;

  // Baris 5: KKM
  const cA5 = ws.getCell("A5");
  cA5.value = "KKM";
  cA5.fill = FILL_RDM_GREY_HEADER;
  cA5.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  cA5.alignment = { horizontal: "center", vertical: "middle" };
  cA5.border = BORDER_THIN;

  const cC5 = ws.getCell("C5");
  cC5.value = kkm;
  cC5.fill = FILL_RDM_YELLOW;
  cC5.font = { name: "Calibri", size: 11, bold: true };
  cC5.alignment = { horizontal: "center", vertical: "middle" };
  cC5.border = BORDER_THIN;

  ws.mergeCells("D5:F5");
  const cD5 = ws.getCell("D5");
  cD5.fill = FILL_RDM_YELLOW;
  cD5.border = BORDER_THIN;
  ws.getRow(5).height = 22;

  // Baris 6: Header Tabel
  const headers = [
    { col: "A", val: "No" },
    { col: "C", val: "NIS" },
    { col: "D", val: "Nisn" },
    { col: "E", val: "Nama" },
    { col: "F", val: "Nilai" },
  ];
  headers.forEach(h => {
    const cell = ws.getCell(`${h.col}6`);
    cell.value = h.val;
    cell.fill = FILL_RDM_GREY_HEADER;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = BORDER_THIN;
  });
  ws.getRow(6).height = 24;

  // Baris 7+: Data Siswa dengan Nilai STS/PTS Otomatis
  dataNilai.forEach((siswa, idx) => {
    const r = 7 + idx;
    const valNilai = Number(siswa.nilai_uts) > 0 ? Number(siswa.nilai_uts) : "";
    const nisnVal = allSiswaMap[siswa.nis] || siswa.nisn || "";

    const cA = ws.getCell(`A${r}`);
    cA.value = idx + 1;
    cA.fill = FILL_RDM_GREY_CELL;
    cA.alignment = { horizontal: "center", vertical: "middle" };
    cA.border = BORDER_THIN;

    const cC = ws.getCell(`C${r}`);
    cC.value = siswa.nis;
    cC.fill = FILL_RDM_GREY_CELL;
    cC.alignment = { horizontal: "center", vertical: "middle" };
    cC.border = BORDER_THIN;

    const cD = ws.getCell(`D${r}`);
    cD.value = String(nisnVal);
    cD.fill = FILL_RDM_GREY_CELL;
    cD.alignment = { horizontal: "center", vertical: "middle" };
    cD.border = BORDER_THIN;

    const cE = ws.getCell(`E${r}`);
    cE.value = siswa.nama_siswa.toUpperCase();
    cE.fill = FILL_RDM_GREY_CELL;
    cE.alignment = { horizontal: "left", vertical: "middle" };
    cE.border = BORDER_THIN;

    const cF = ws.getCell(`F${r}`);
    cF.value = valNilai;
    cF.fill = FILL_RDM_YELLOW;
    cF.font = { name: "Calibri", size: 11, bold: true };
    cF.alignment = { horizontal: "center", vertical: "middle" };
    cF.border = BORDER_THIN;

    ws.getRow(r).height = 20;
  });

  await triggerDownload(
    wb,
    `Template_Nilai_PTS_${cleanFilename(namaMapel)}_Kelas_${cleanFilename(kelas)}.xlsx`
  );
}

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

// =====================================================================
// 5. PARSE EXCEL UPLOAD (CERDAS: MENDUKUNG TEMPLATE RDM MAUPUN STANDAR)
// =====================================================================
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

  if (tipe === "mapel") {
    const sheetNames = wb.worksheets.map(w => w.name.toUpperCase().trim());

    // Cek apakah ini template RDM Multi-Sheet (PH 1, SUM 1, PAS, PTS)
    const isRdmPH = sheetNames.some(s => s === "PH 1" || s.startsWith("PH "));
    const isRdmSUM = sheetNames.some(s => s === "SUM 1" || s.startsWith("SUM "));
    const isRdmPAS = sheetNames.some(s => s === "PAS" || s === "SAS");
    const isRdmPTS = sheetNames.some(s => s === "PTS" || s === "STS");

    if (isRdmPH || isRdmSUM) {
      // Membaca template RDM PH / SUM
      const prefix = isRdmPH ? "PH" : "SUM";
      const materis: [string, string, string, string] = ["", "", "", ""];
      const studentMap = new Map<string, Partial<NilaiMapelItem>>();

      for (let i = 1; i <= 4; i++) {
        const ws = wb.getWorksheet(`${prefix} ${i}`) || wb.getWorksheet(`${prefix}${i}`);
        if (!ws) continue;

        // Ambil materi dari cell C4
        const mVal = String(ws.getCell("C4").value || ws.getCell("D4").value || "").trim();
        if (mVal) materis[i - 1] = mVal;

        ws.eachRow((row, rowNum) => {
          if (rowNum >= 7) {
            const nis = String(row.getCell(3).value || "").trim(); // Col C
            const nama = String(row.getCell(5).value || "").trim(); // Col E
            const nilai = Number(row.getCell(6).value) || 0; // Col F

            if (!nis) return;

            if (!studentMap.has(nis)) {
              studentMap.set(nis, {
                nis,
                nama_siswa: nama,
                nilai_harian_1: 0,
                nilai_harian_2: 0,
                nilai_harian_3: 0,
                nilai_harian_4: 0,
                nilai_uts: 0,
                nilai_uas: 0,
              });
            }

            const item = studentMap.get(nis)!;
            if (nama && !item.nama_siswa) item.nama_siswa = nama;

            if (i === 1) item.nilai_harian_1 = nilai;
            else if (i === 2) item.nilai_harian_2 = nilai;
            else if (i === 3) item.nilai_harian_3 = nilai;
            else if (i === 4) item.nilai_harian_4 = nilai;
          }
        });
      }

      return {
        materis,
        dataMapel: Array.from(studentMap.values()),
      };
    } else if (isRdmPAS) {
      // Membaca template RDM PAS / SAS
      const ws = wb.getWorksheet("PAS") || wb.getWorksheet("SAS") || wb.worksheets[0];
      const dataMapel: Partial<NilaiMapelItem>[] = [];

      ws.eachRow((row, rowNum) => {
        if (rowNum >= 7) {
          const nis = String(row.getCell(3).value || "").trim();
          const nama = String(row.getCell(5).value || "").trim();
          const nilai = Number(row.getCell(6).value) || 0;
          if (!nis) return;

          dataMapel.push({
            nis,
            nama_siswa: nama,
            nilai_uas: nilai,
          });
        }
      });

      return { dataMapel };
    } else if (isRdmPTS) {
      // Membaca template RDM PTS / STS
      const ws = wb.getWorksheet("PTS") || wb.getWorksheet("STS") || wb.worksheets[0];
      const dataMapel: Partial<NilaiMapelItem>[] = [];

      ws.eachRow((row, rowNum) => {
        if (rowNum >= 7) {
          const nis = String(row.getCell(3).value || "").trim();
          const nama = String(row.getCell(5).value || "").trim();
          const nilai = Number(row.getCell(6).value) || 0;
          if (!nis) return;

          dataMapel.push({
            nis,
            nama_siswa: nama,
            nilai_uts: nilai,
          });
        }
      });

      return { dataMapel };
    }

    // Format Default / Standar Single Worksheet
    const ws = wb.worksheets[0];
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
    const ws = wb.worksheets[0];
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
    const ws = wb.worksheets[0];
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

// =====================================================================
// 7. UNDUH MASSAL SELURUH LEGER NILAI (MULTI-SHEET PER KELAS .XLSX)
// =====================================================================
export async function downloadBulkLeggerExcel(
  madrasahId: MadrasahId,
  tahun: string,
  semester: string,
  classes: string[],
  config: SchoolConfig
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Rapor Madrasah Digital";
  wb.created = new Date();

  const semLabel = semester === "1" ? "Gasal" : "Genap";
  const cleanTahun = tahun.replace("/", "-");

  for (const kelas of classes) {
    const leggerData = getLeggerDataByKelas(madrasahId, tahun, semester, kelas);
    if (!leggerData.siswa || leggerData.siswa.length === 0) continue;

    // Excel worksheet name max 31 chars
    const sheetName = `Kelas ${kelas}`.slice(0, 31).replace(/[\/\\?*[\]]/g, "_");
    const ws = wb.addWorksheet(sheetName, {
      views: [{ showGridLines: true }],
    });

    // 1. Title Block
    ws.addRow([`LEGER HASIL BELAJAR PESERTA DIDIK - ${config.nama_madrasah}`]);
    ws.addRow([`Jenjang: ${config.jenjang} | Semester: ${semLabel} | Tahun Pelajaran: ${tahun}`]);
    ws.addRow([`Kelas: ${kelas} | Total Siswa: ${leggerData.siswa.length} | Titimangsa: ${config.kota_tanggal || "Blitar"}, ${config.tanggal_rapor || "24 Oktober 2026"}`]);
    ws.addRow([]); // Blank line

    ws.getRow(1).font = { bold: true, size: 13, color: { argb: "FF064E3B" } };
    ws.getRow(2).font = { bold: true, size: 10, color: { argb: "FF374151" } };
    ws.getRow(3).font = { size: 9, italic: true, color: { argb: "FF4B5563" } };

    // 2. Table Header
    const row5Values = ["No", "NIS", "NISN", "Nama Siswa", "L/P"];
    const row6Values = ["", "", "", "", ""];

    leggerData.mapel.forEach(m => {
      row5Values.push(m.nama_mapel, "", "", "");
      row6Values.push("LM", "STS", "SAS", "NA");
    });

    row5Values.push("Total", "Rata-Rata", "Ranking", "Sakit", "Izin", "Alpa", "Catatan Wali Kelas");
    row6Values.push("", "", "", "S", "I", "A", "");

    const headerRow1 = ws.addRow(row5Values);
    const headerRow2 = ws.addRow(row6Values);

    headerRow1.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
    headerRow2.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };

    headerRow1.eachCell(cell => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF15803D" },
      };
      cell.border = BORDER_THIN;
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });

    headerRow2.eachCell(cell => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF166534" },
      };
      cell.border = BORDER_THIN;
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Merge multi-column cells in header
    ws.mergeCells(5, 1, 6, 1);
    ws.mergeCells(5, 2, 6, 2);
    ws.mergeCells(5, 3, 6, 3);
    ws.mergeCells(5, 4, 6, 4);
    ws.mergeCells(5, 5, 6, 5);

    let colIdx = 6;
    leggerData.mapel.forEach(() => {
      ws.mergeCells(5, colIdx, 5, colIdx + 3);
      colIdx += 4;
    });

    ws.mergeCells(5, colIdx, 6, colIdx);     // Total
    ws.mergeCells(5, colIdx + 1, 6, colIdx + 1); // Rata-Rata
    ws.mergeCells(5, colIdx + 2, 6, colIdx + 2); // Ranking
    ws.mergeCells(5, colIdx + 3, 5, colIdx + 5); // Ketidakhadiran (S, I, A)
    ws.mergeCells(5, colIdx + 6, 6, colIdx + 6); // Catatan Wali

    // 3. Data Rows
    leggerData.siswa.forEach((s, idx) => {
      const dataRowValues: any[] = [
        idx + 1,
        s.nis,
        s.nisn || "-",
        s.nama,
        s.jenis_kelamin || "L",
      ];

      leggerData.mapel.forEach(m => {
        const det = s.mapelDetails[m.kode_mapel];
        const score = s.scores[m.kode_mapel] ?? "-";
        const lm = det?.lm ?? "-";
        const sts = det?.sts ?? "-";
        const sas = det?.sas ?? "-";
        dataRowValues.push(lm, sts, sas, score);
      });

      dataRowValues.push(
        s.totalScore ?? 0,
        s.averageScore ?? 0,
        s.ranking ?? "-",
        s.sakit || 0,
        s.izin || 0,
        s.alpha || 0,
        s.catatan || "-"
      );

      const dRow = ws.addRow(dataRowValues);
      dRow.font = { size: 9 };

      const isEven = idx % 2 === 0;
      dRow.eachCell((cell, colNumber) => {
        cell.border = BORDER_THIN;
        cell.alignment = {
          vertical: "middle",
          horizontal: colNumber === 4 || colNumber === dRow.cellCount ? "left" : "center",
        };
        if (!isEven) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }
      });
    });

    // Set column widths
    ws.columns.forEach((col, i) => {
      if (i === 3) col.width = 28; // Nama siswa
      else if (i === 1 || i === 2) col.width = 15; // NIS / NISN
      else if (i === 0 || i === 4) col.width = 6;
      else if (i >= ws.columns.length - 1) col.width = 35; // Catatan
      else col.width = 7.5;
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `BACKUP_LEGER_${config.jenjang.toUpperCase()}_${cleanTahun}_Sem${semester}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =====================================================================
// 8. UNDUH LEGER NILAI PER KELAS (.XLSX) DARI MODAL CETAK LEGGER
// =====================================================================
export async function downloadLeggerExcel(
  leggerData: LeggerResponse,
  tahun: string,
  semester: string,
  kelas: string,
  config: SchoolConfig
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Portal Rapor Internal Nusalodoyo";
  wb.created = new Date();

  const semLabel = semester === "1" ? "Gasal (1)" : "Genap (2)";
  const cleanTahun = tahun.replace("/", "-");

  // ---------------------------------------------------------------------
  // SHEET 1: LEGER NILAI AKHIR & PERINGKAT KELAS
  // ---------------------------------------------------------------------
  const ws = wb.addWorksheet("Legger Nilai Akhir", {
    views: [{ state: "frozen", xSplit: 4, ySplit: 7, showGridLines: true }],
  });

  // Kop / Judul Formal
  ws.addRow([config.nama_yayasan || "LEMBAGA PENDIDIKAN MA'ARIF NU"]);
  ws.addRow([`LEGER NILAI HASIL BELAJAR PESERTA DIDIK - ${config.nama_madrasah}`]);
  ws.addRow([`NSM: ${config.nsm} | NPSN: ${config.npsn} | Akreditasi: ${config.akreditasi}`]);
  ws.addRow([`Kelas: ${kelas} | Semester: ${semLabel} | Tahun Pelajaran: ${tahun}`]);
  ws.addRow([]); // Baris kosong pemisah

  ws.getRow(1).font = { bold: true, size: 11, color: { argb: "FF374151" } };
  ws.getRow(2).font = { bold: true, size: 14, color: { argb: "FF064E3B" } };
  ws.getRow(3).font = { size: 9, color: { argb: "FF4B5563" } };
  ws.getRow(4).font = { bold: true, size: 10, color: { argb: "FF1F2937" } };

  const mapels = leggerData.mapel || [];
  const totalMapel = mapels.length;

  // Header Tabel (Baris 6 & 7)
  const h1Values: any[] = ["No", "NIS", "NISN", "Nama Siswa", "Nilai Capaian Hasil Belajar (Nilai Akhir)"];
  for (let i = 1; i < totalMapel; i++) h1Values.push("");
  h1Values.push("Jml", "Rata", "Pkr", "Presensi", "", "", "Keputusan / Catatan Wali Kelas");

  const h2Values: any[] = ["", "", "", ""];
  mapels.forEach(m => h2Values.push(m.kode_mapel));
  h2Values.push("", "", "", "S", "I", "A", "");

  const headerRow1 = ws.addRow(h1Values);
  const headerRow2 = ws.addRow(h2Values);

  headerRow1.height = 24;
  headerRow2.height = 22;

  headerRow1.eachCell(cell => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF006E14" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.border = BORDER_THIN;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  headerRow2.eachCell(cell => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF15803D" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
    cell.border = BORDER_THIN;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  // Merge header cells
  ws.mergeCells(6, 1, 7, 1); // No
  ws.mergeCells(6, 2, 7, 2); // NIS
  ws.mergeCells(6, 3, 7, 3); // NISN
  ws.mergeCells(6, 4, 7, 4); // Nama
  if (totalMapel > 0) {
    ws.mergeCells(6, 5, 6, 4 + totalMapel); // Nilai Mapel
  }
  const jmlCol = 5 + totalMapel;
  ws.mergeCells(6, jmlCol, 7, jmlCol);         // Jml
  ws.mergeCells(6, jmlCol + 1, 7, jmlCol + 1); // Rata
  ws.mergeCells(6, jmlCol + 2, 7, jmlCol + 2); // Pkr (Ranking)
  ws.mergeCells(6, jmlCol + 3, 6, jmlCol + 5); // Presensi (S, I, A)
  ws.mergeCells(6, jmlCol + 6, 7, jmlCol + 6); // Keputusan / Catatan

  // Data Siswa
  leggerData.siswa.forEach((s, idx) => {
    const rowVals: any[] = [
      idx + 1,
      s.nis,
      s.nisn || "-",
      s.nama,
    ];

    mapels.forEach(m => {
      const score = s.scores[m.kode_mapel] || 0;
      rowVals.push(score > 0 ? score : "-");
    });

    rowVals.push(
      s.totalScore || 0,
      s.averageScore || 0,
      s.ranking || "-",
      s.sakit || 0,
      s.izin || 0,
      s.alpha || 0,
      s.keputusan !== "-" ? s.keputusan : (s.catatan || "-")
    );

    const row = ws.addRow(rowVals);
    row.height = 20;
    const isEven = idx % 2 === 0;

    row.eachCell((cell, colNum) => {
      cell.border = BORDER_THIN;
      cell.font = { size: 9.5 };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNum === 4 || colNum === jmlCol + 6 ? "left" : "center",
      };

      if (!isEven) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }

      // Highlight nilai di bawah KKM
      if (colNum >= 5 && colNum < 5 + totalMapel) {
        const m = mapels[colNum - 5];
        const val = Number(cell.value);
        if (!isNaN(val) && val > 0 && val < (m.kkm || 75)) {
          cell.font = { size: 9.5, bold: true, color: { argb: "FFDC2626" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF2F2" } };
        }
      }

      // Highlight Ranking & Total
      if (colNum === jmlCol || colNum === jmlCol + 1) {
        cell.font = { size: 9.5, bold: true, color: { argb: "FF581C87" } };
      } else if (colNum === jmlCol + 2) {
        cell.font = { size: 10, bold: true, color: { argb: "FF065F46" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
      }
    });
  });

  // Baris Rata-Rata Kelas
  const avgRowVals: any[] = ["", "", "", "RATA-RATA KELAS"];
  mapels.forEach(m => {
    const avg = leggerData.classAverageMapel?.[m.kode_mapel];
    avgRowVals.push(avg || "-");
  });
  avgRowVals.push(
    "-",
    leggerData.totalClassAverage || "-",
    "-",
    "-",
    "-",
    "-",
    ""
  );
  const avgRow = ws.addRow(avgRowVals);
  avgRow.height = 22;
  avgRow.eachCell((cell, colNum) => {
    cell.border = BORDER_THIN;
    cell.font = { bold: true, size: 9.5, color: { argb: "FF064E3B" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
    cell.alignment = {
      vertical: "middle",
      horizontal: colNum === 4 ? "right" : "center",
    };
  });
  ws.mergeCells(avgRow.number, 1, avgRow.number, 4);

  // Keterangan & Tanda Tangan di bawah tabel
  ws.addRow([]);
  const sigRow1 = ws.addRow(["", "", "", "Mengetahui,", "", "", "", "", "", `${config.kota_tanggal || "Blitar"}, ${config.tanggal_rapor || "24 Oktober 2026"}`]);
  const sigRow2 = ws.addRow(["", "", "", `Kepala ${config.nama_madrasah}`, "", "", "", "", "", `Wali Kelas ${kelas}`]);
  ws.addRow([]);
  ws.addRow([]);
  ws.addRow([]);
  const sigRow3 = ws.addRow(["", "", "", config.kepala_madrasah || "Kepala Madrasah", "", "", "", "", "", "____________________________"]);
  const sigRow4 = ws.addRow(["", "", "", `NIP. ${config.nip_kepala || "-"}`, "", "", "", "", "", "NIP. -"]);

  [sigRow1, sigRow2, sigRow3, sigRow4].forEach((r, i) => {
    r.font = { size: 9.5, bold: i >= 1 && i <= 2 };
  });

  // Pengaturan Lebar Kolom Proporsional
  ws.columns.forEach((col, i) => {
    if (i === 0) col.width = 5;
    else if (i === 1) col.width = 12;
    else if (i === 2) col.width = 14;
    else if (i === 3) col.width = 30;
    else if (i >= 4 && i < 4 + totalMapel) col.width = 7.5;
    else if (i === jmlCol - 1 || i === jmlCol || i === jmlCol + 1) col.width = 8;
    else if (i >= jmlCol + 2 && i <= jmlCol + 4) col.width = 5.5;
    else if (i === jmlCol + 5) col.width = 32;
    else col.width = 10;
  });

  // ---------------------------------------------------------------------
  // SHEET 2: RINCIAN KOMPONEN NILAI (LM, STS, SAS, NA)
  // ---------------------------------------------------------------------
  const ws2 = wb.addWorksheet("Rincian LM-STS-SAS", {
    views: [{ state: "frozen", xSplit: 3, ySplit: 6, showGridLines: true }],
  });

  ws2.addRow([`RINCIAN KOMPONEN NILAI (LM, STS, SAS, NA) - KELAS ${kelas}`]);
  ws2.addRow([`${config.nama_madrasah} | Semester ${semLabel} | Tahun Pelajaran ${tahun}`]);
  ws2.addRow([]);
  ws2.getRow(1).font = { bold: true, size: 12, color: { argb: "FF064E3B" } };
  ws2.getRow(2).font = { size: 9.5, color: { argb: "FF4B5563" } };

  const r5Vals: any[] = ["No", "NIS", "Nama Siswa"];
  const r6Vals: any[] = ["", "", ""];
  mapels.forEach(m => {
    r5Vals.push(m.nama_mapel, "", "", "");
    r6Vals.push("LM", "STS", "SAS", "NA");
  });

  const h2Row1 = ws2.addRow(r5Vals);
  const h2Row2 = ws2.addRow(r6Vals);

  h2Row1.eachCell(cell => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF006E14" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
    cell.border = BORDER_THIN;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });
  h2Row2.eachCell(cell => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF15803D" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 8.5 };
    cell.border = BORDER_THIN;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  ws2.mergeCells(4, 1, 5, 1);
  ws2.mergeCells(4, 2, 5, 2);
  ws2.mergeCells(4, 3, 5, 3);
  let cIdx = 4;
  mapels.forEach(() => {
    ws2.mergeCells(4, cIdx, 4, cIdx + 3);
    cIdx += 4;
  });

  leggerData.siswa.forEach((s, idx) => {
    const vals: any[] = [idx + 1, s.nis, s.nama];
    mapels.forEach(m => {
      const det = s.mapelDetails[m.kode_mapel];
      const na = s.scores[m.kode_mapel] || 0;
      vals.push(det?.lm || "-", det?.sts || "-", det?.sas || "-", na || "-");
    });
    const r = ws2.addRow(vals);
    r.eachCell((cell, colNum) => {
      cell.border = BORDER_THIN;
      cell.font = { size: 9 };
      cell.alignment = { vertical: "middle", horizontal: colNum === 3 ? "left" : "center" };
    });
  });

  ws2.columns.forEach((col, i) => {
    if (i === 0) col.width = 5;
    else if (i === 1) col.width = 12;
    else if (i === 2) col.width = 28;
    else col.width = 6;
  });

  // Generate & Trigger Download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Legger_${config.jenjang}_Kelas_${kelas}_${cleanTahun}_Sem${semester}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

