let localQuery: typeof import('./local').query;
let oracleQuery: typeof import('./oracle').query;

export async function query<T = unknown>(
  sql: string,
  binds: Record<string, unknown> = {}
): Promise<T[]> {
  if (process.env.USE_LOCAL_DB === '1') {
    if (!localQuery) {
      console.log('[DB] Using local SQLite for testing');
      localQuery = (await import('./local')).query;
    }
    return localQuery<T>(sql, binds);
  } else {
    if (!oracleQuery) oracleQuery = (await import('./oracle')).query;
    return oracleQuery<T>(sql, binds);
  }
}
