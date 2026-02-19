import path from 'path';
import oracledb from 'oracledb';

// TNS_ADMIN: sqlnet.ora 위치 (ORA-12547 시도)
const networkAdmin = path.join(__dirname, '..', '..', 'network', 'admin');
process.env.TNS_ADMIN = networkAdmin;

// Thick mode: 64-bit Oracle Client required (DPI-1047, ORA-01031, NJS-116)
// Skip if ORACLE_USE_THIN=1 (Thin only - may fail with ORA-01031 if DB policy blocks)
const useThin = process.env.ORACLE_USE_THIN === '1';
if (!useThin) {
  try {
    const libDir = process.env.ORACLE_CLIENT_LIB_DIR;
    if (libDir) {
      oracledb.initOracleClient({ libDir });
    } else {
      oracledb.initOracleClient();
    }
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    const msg = String((err as Error)?.message ?? '');
    if (code === 'NJS-072') {
      /* already initialized */
    } else if (msg.includes('DPI-1047') || msg.includes('64-bit')) {
      console.error('');
      console.error('[Oracle] 64-bit Oracle Client required.');
      console.error('  Download: https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html');
      console.error('  Extract zip -> set ORACLE_CLIENT_LIB_DIR in .env to folder with oci.dll');
      console.error('  See api/ORACLE-SETUP.md for details.');
      console.error('');
    } else {
      console.error('Oracle Thick mode init failed:', err);
    }
  }
}

const dbConfig: oracledb.ConnectionAttributes = {
  user: process.env.DB_USER ?? '',
  password: process.env.DB_PASSWORD ?? '',
  connectString: process.env.DB_CONNECT_STRING ?? 'localhost:1521/ORCL',
};

let pool: oracledb.Pool | null = null;

const isConnectionError = (err: unknown): boolean => {
  const code = (err as { code?: string })?.code;
  const msg = String((err as Error)?.message ?? '');
  return code === 'NJS-500' || msg.includes('ORA-03135') || msg.includes('DPI-1080');
};

export async function query<T = unknown>(
  sql: string,
  binds: oracledb.BindParameters = {},
  retryCount = 0
): Promise<T[]> {
  const maxRetry = 2;
  let conn: oracledb.Connection | null = null;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute<T>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    return (result.rows ?? []) as T[];
  } catch (err) {
    if (isConnectionError(err) && retryCount < maxRetry) {
      return query<T>(sql, binds, retryCount + 1);
    }
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch {
        /* ignore close error */
      }
    }
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close(10);
    pool = null;
  }
}
