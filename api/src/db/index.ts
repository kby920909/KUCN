let localQuery: typeof import('./local').query;
let oracleQuery: typeof import('./oracle').query;

// Oracle 연결 정보가 없거나 USE_LOCAL_DB=1 이면 로컬 SQLite 사용
// Vercel 배포처럼 Oracle 환경변수가 없는 경우 자동으로 로컬 DB 폴백
function shouldUseLocalDb(): boolean {
  if (process.env.USE_LOCAL_DB === '1') return true;
  // Oracle 접속 정보가 하나라도 없으면 로컬로 폴백
  if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_CONNECT_STRING) {
    return true;
  }
  return false;
}

export async function query<T = unknown>(
  sql: string,
  binds: Record<string, unknown> = {}
): Promise<T[]> {
  if (shouldUseLocalDb()) {
    if (!localQuery) {
      console.log('[DB] Using local SQLite');
      localQuery = (await import('./local')).query;
    }
    return localQuery<T>(sql, binds);
  } else {
    if (!oracleQuery) oracleQuery = (await import('./oracle')).query;
    return oracleQuery<T>(sql, binds);
  }
}
