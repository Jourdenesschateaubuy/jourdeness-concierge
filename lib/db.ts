import {
  Pool,
  neonConfig,
  type PoolClient,
  type QueryResultRow,
} from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

function getConnectionString() {
  const value = process.env.DATABASE_URL?.trim();

  if (!value) {
    throw new Error(
      "DATABASE_URL 尚未設定。請先在 .env.local 與 Vercel Environment Variables 設定 PostgreSQL 連線字串。"
    );
  }

  return value;
}

export function getDbPool() {
  return new Pool({
    connectionString: getConnectionString(),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export async function dbQuery<
  T extends QueryResultRow = QueryResultRow
>(
  text: string,
  values: unknown[] = []
) {
  const pool = getDbPool();

  try {
    return await pool.query<T>(text, values);
  } finally {
    await pool.end();
  }
}

export async function withDbClient<T>(
  callback: (client: PoolClient) => Promise<T>
) {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    return await callback(client);
  } finally {
    client.release();
    await pool.end();
  }
}
