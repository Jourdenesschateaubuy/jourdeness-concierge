import { Pool, type PoolClient, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __jourdenessPgPool: Pool | undefined;
}

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
  if (!global.__jourdenessPgPool) {
    global.__jourdenessPgPool = new Pool({
      connectionString: getConnectionString(),
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  return global.__jourdenessPgPool;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = []
) {
  return getDbPool().query<T>(text, values);
}

export async function withDbClient<T>(
  callback: (client: PoolClient) => Promise<T>
) {
  const client = await getDbPool().connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}
