import {
  Pool,
  neon,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from "@neondatabase/serverless";


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
): Promise<QueryResult<T>> {
  const sql = neon(getConnectionString());
  const result = await sql.query(text, values, {
    fullResults: true,
  });

  return result as unknown as QueryResult<T>;
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
