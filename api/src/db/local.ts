import path from 'path';
import fs from 'fs';
import initSqlJs, { Database as SqlJsDb } from 'sql.js';

const dbPath = path.join(__dirname, '..', '..', 'data', 'local.db');

let db: SqlJsDb | null = null;

async function getDb(): Promise<SqlJsDb> {
  if (!db) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
      const buf = fs.readFileSync(dbPath);
      db = new SQL.Database(buf);
    } else {
      db = new SQL.Database();
    }
    initTable(db);
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
  }
  return db;
}

function initTable(dbInstance: SqlJsDb): void {
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS USERS (
      USER_ID TEXT PRIMARY KEY,
      PASSWORD TEXT NOT NULL,
      NAME TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_users_id ON USERS(USER_ID);
  `);

  const result = dbInstance.exec('SELECT COUNT(*) as c FROM USERS');
  const count = result[0]?.values[0]?.[0] ?? 0;

  if (count === 0) {
    dbInstance.run(
      'INSERT INTO USERS (USER_ID, PASSWORD, NAME) VALUES (?, ?, ?)',
      ['admin', 'admin123', '관리자']
    );
    dbInstance.run(
      'INSERT INTO USERS (USER_ID, PASSWORD, NAME) VALUES (?, ?, ?)',
      ['test', 'test1234', '테스트']
    );
    console.log('[Local DB] Test users: admin/admin123, test/test1234');
  }

  dbInstance.run(
    'INSERT OR REPLACE INTO USERS (USER_ID, PASSWORD, NAME) VALUES (?, ?, ?)',
    ['rlaqudduq997', 'kup89673', '사용자']
  );
}

export async function query<T = unknown>(
  sql: string,
  binds: Record<string, unknown> = {}
): Promise<T[]> {
  const paramNames = sql.match(/:(\w+)/g) || [];
  const values = paramNames.map((n) => binds[n.slice(1)]);

  const sqliteSql = sql.replace(/:(\w+)/g, '?');
  const dbInstance = await getDb();
  const stmt = dbInstance.prepare(sqliteSql);
  stmt.bind(values as (string | number)[]);

  const rows: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as T;
    rows.push(row);
  }
  stmt.free();

  return rows;
}
