import { NextRequest, NextResponse } from "next/server";
import {
  MadrasahId,
  SiNusaStudentPayload,
  SyncLogItem,
  SyncBatchResult,
} from "@/types";
import {
  buildSiNusaPayloads,
  getIntegrationConfig,
  recordSyncLog,
  getActivePeriod,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const madrasahId: MadrasahId = searchParams.get("madrasah_id") === "ma" ? "ma" : "mts";
    const config = getIntegrationConfig(madrasahId);

    // Ambil log sync
    const keys = {
      SYNC_LOGS: `rapor_nusa_${madrasahId}_sync_logs_v1`,
    };

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        // Sensor token di response GET publik jika diperlukan
        secret_token_preview: config.secret_token ? `${config.secret_token.slice(0, 6)}••••••••` : "",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat status integrasi: " + err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const madrasahId: MadrasahId = body.madrasah_id === "ma" ? "ma" : "mts";
    const targetClass: string = body.target_class || "all";
    const studentNis: string | undefined = body.student_nis;
    const isTestConnection: boolean = Boolean(body.is_test);

    // Ambil konfigurasi integrasi
    const config = getIntegrationConfig(madrasahId);
    const endpointUrl = body.endpoint_url || config.endpoint_url;
    const secretToken = body.secret_token || config.secret_token;

    if (!endpointUrl) {
      return NextResponse.json(
        { success: false, message: "URL endpoint target SI-NUSA belum dikonfigurasi!" },
        { status: 400 }
      );
    }

    // 1. JIKA HANYA TES KONEKSI KE SI-NUSA.COM
    if (isTestConnection) {
      try {
        const pingPayload = {
          ping: true,
          source: "rapor-nusa.vercel.app",
          madrasah_id: madrasahId,
          timestamp: new Date().toISOString(),
        };

        const res = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${secretToken}`,
            "User-Agent": "RaporNusa-SyncBot/1.0",
          },
          body: JSON.stringify(pingPayload),
          signal: AbortSignal.timeout(8000),
        });

        const statusText = res.ok ? "Koneksi Berhasil!" : `HTTP ${res.status}: ${res.statusText}`;
        return NextResponse.json({
          success: res.ok,
          message: res.ok
            ? `Koneksi ke endpoint ${endpointUrl} BERHASIL terhubung!`
            : `Endpoint merespon dengan status ${statusText}.`,
          status_code: res.status,
        });
      } catch (err: any) {
        // Tangani jika endpoint belum siap menerima ping (misal DNS/mock)
        const isNetworkErr = err.name === "TimeoutError" || err.message?.includes("fetch failed");
        return NextResponse.json({
          success: false,
          message: `Gagal menjangkau endpoint SI-NUSA: ${err.message}`,
          is_network_error: isNetworkErr,
        });
      }
    }

    // 2. BUILD DATA SISWA & NILAI RAPOR SESUAI FORMAT RESMI SI-NUSA
    const activePeriod = getActivePeriod(madrasahId);
    const payloads: SiNusaStudentPayload[] = buildSiNusaPayloads(
      madrasahId,
      activePeriod.tahun,
      activePeriod.semester,
      targetClass !== "all" ? targetClass : undefined,
      studentNis
    );

    if (payloads.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Tidak ditemukan data siswa atau nilai pada filter yang dipilih.",
        total_processed: 0,
        synced_count: 0,
        failed_count: 0,
        logs: [],
      });
    }

    const logs: SyncLogItem[] = [];
    let syncedCount = 0;
    let failedCount = 0;

    // Batasi concurrent dispatches atau kirim per-siswa/batch
    for (const item of payloads) {
      const nowStr = new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      try {
        // Kirim request ke endpoint si-nusa.com dengan Authorization Bearer Token
        const res = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${secretToken}`,
            "User-Agent": "RaporNusa-SyncBot/1.0",
          },
          body: JSON.stringify(item),
          signal: AbortSignal.timeout(10000),
        });

        const resJson = await res.json().catch(() => null);
        const isSuccess = res.ok || res.status === 200 || res.status === 201;

        const responseMsg = isSuccess
          ? resJson?.message || "Data rapor siswa berhasil diterima dan diproses oleh SI-NUSA."
          : `Gagal: HTTP ${res.status} ${res.statusText} - ${resJson?.message || "Unknown error"}`;

        if (isSuccess) syncedCount++;
        else failedCount++;

        const logItem = recordSyncLog(madrasahId, {
          integration_id: config.id,
          madrasah_id: madrasahId,
          student_nisn: item.student.nisn,
          student_nis: item.student.nis,
          student_name: item.student.name,
          class_name: item.student.class_name,
          academic_year: item.academic_year,
          semester: item.semester,
          total_grades: item.grades.length,
          status: isSuccess ? "SUCCESS" : "FAILED",
          http_status: res.status,
          response_message: responseMsg,
          payload_snapshot: item,
          created_at: nowStr,
        });

        logs.push(logItem);
      } catch (err: any) {
        failedCount++;
        const errorMsg =
          err.name === "TimeoutError"
            ? "Koneksi timeout setelah 10 detik."
            : `Gagal mengirim payload: ${err.message}`;

        const logItem = recordSyncLog(madrasahId, {
          integration_id: config.id,
          madrasah_id: madrasahId,
          student_nisn: item.student.nisn,
          student_nis: item.student.nis,
          student_name: item.student.name,
          class_name: item.student.class_name,
          academic_year: item.academic_year,
          semester: item.semester,
          total_grades: item.grades.length,
          status: "FAILED",
          http_status: 504,
          response_message: errorMsg,
          payload_snapshot: item,
          created_at: nowStr,
        });

        logs.push(logItem);
      }
    }

    const result: SyncBatchResult = {
      success: syncedCount > 0,
      message: `Proses sinkronisasi selesai: ${syncedCount} siswa berhasil disinkronkan, ${failedCount} gagal.`,
      total_processed: payloads.length,
      synced_count: syncedCount,
      failed_count: failedCount,
      logs: logs.slice(0, 20),
    };

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error saat memproses sinkronisasi: " + err.message,
      },
      { status: 500 }
    );
  }
}
