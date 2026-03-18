import path from 'path';
import fs from 'fs';
import initSqlJs, { Database as SqlJsDb } from 'sql.js';

// Vercel 서버리스 환경은 파일시스템이 읽기 전용 → /tmp 사용
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel
  ? '/tmp/kucn-local.db'
  : path.join(__dirname, '..', '..', 'data', 'local.db');

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
    saveDb(db);
  }
  return db;
}

function saveDb(dbInstance: SqlJsDb): void {
  try {
    fs.writeFileSync(dbPath, Buffer.from(dbInstance.export()));
  } catch {
    // Vercel /tmp 외부 경로에서 쓰기 실패 시 무시 (in-memory로만 동작)
  }
}

function initTable(dbInstance: SqlJsDb): void {
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS USERS (
      USER_ID TEXT PRIMARY KEY,
      PASSWORD TEXT NOT NULL,
      NAME TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_users_id ON USERS(USER_ID);

    CREATE TABLE IF NOT EXISTS MAILS (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      FROM_USER_ID TEXT NOT NULL,
      TO_USER_ID TEXT NOT NULL,
      SUBJECT TEXT NOT NULL,
      BODY TEXT NOT NULL,
      CREATED_AT TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      IS_READ INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_mails_to_user ON MAILS(TO_USER_ID, CREATED_AT);
    CREATE INDEX IF NOT EXISTS idx_mails_from_user ON MAILS(FROM_USER_ID, CREATED_AT);
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

const MUTATION_RE = /^\s*(INSERT|UPDATE|DELETE|REPLACE)\s/i;

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

  // INSERT / UPDATE / DELETE 후 파일에 저장 (영속성 보장)
  if (MUTATION_RE.test(sql)) {
    saveDb(dbInstance);
  }

  return rows;
}
