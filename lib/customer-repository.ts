import { dbQuery } from "./db";

export type CustomerRow = {
  id: number;
  customerName: string;
  lineUserId: string;
  lineDisplayName: string;
  lineId: string;
  phone: string;
  note: string;
  lineJoinedAt: string | null;
  firstChatAt: string | null;
  lastChatAt: string | null;
  customerMessageCount: number;
  staffReplyCount: number;
  totalMessageCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
};

type CustomerDbRow = {
  id: string | number;
  customer_name: string;
  line_user_id: string;
  line_display_name: string;
  line_id: string;
  phone: string;
  note: string;
  line_joined_at: string | Date | null;
  first_chat_at: string | Date | null;
  last_chat_at: string | Date | null;
  customer_message_count: string | number;
  staff_reply_count: string | number;
  total_message_count: string | number;
  first_seen_at: string | Date;
  last_seen_at: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
};

function toIsoString(value: string | Date) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function toNullableIsoString(
  value: string | Date | null | undefined
) {
  if (!value) {
    return null;
  }

  return toIsoString(value);
}

function mapCustomer(row: CustomerDbRow): CustomerRow {
  return {
    id: Number(row.id),
    customerName: row.customer_name ?? "",
    lineUserId: row.line_user_id ?? "",
    lineDisplayName: row.line_display_name ?? "",
    lineId: row.line_id ?? "",
    phone: row.phone ?? "",
    note: row.note ?? "",
    lineJoinedAt:
      toNullableIsoString(row.line_joined_at),
    firstChatAt:
      toNullableIsoString(row.first_chat_at),
    lastChatAt:
      toNullableIsoString(row.last_chat_at),
    customerMessageCount:
      Number(row.customer_message_count ?? 0),
    staffReplyCount:
      Number(row.staff_reply_count ?? 0),
    totalMessageCount:
      Number(row.total_message_count ?? 0),
    firstSeenAt: toIsoString(row.first_seen_at),
    lastSeenAt: toIsoString(row.last_seen_at),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export type CreateCustomerInput = {
  customerName: string;
  phone?: string;
  lineDisplayName?: string;
  lineId?: string;
  note?: string;
};

export async function createCustomer(
  input: CreateCustomerInput
): Promise<CustomerRow> {
  const customerName = input.customerName.trim();
  const phone = input.phone?.trim() ?? "";
  const lineDisplayName =
    input.lineDisplayName?.trim() ?? "";
  const lineId = input.lineId?.trim() ?? "";
  const note = input.note?.trim() ?? "";

  if (!customerName) {
    throw new Error("客戶姓名不可空白");
  }

  const result = await dbQuery<CustomerDbRow>(
    `
      INSERT INTO customers (
        customer_name,
        phone,
        line_display_name,
        line_id,
        note,
        line_joined_at,
        first_chat_at,
        last_chat_at,
        customer_message_count,
        staff_reply_count,
        total_message_count,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        NOW(),
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING
        id,
        customer_name,
        line_user_id,
        line_display_name,
        line_id,
        phone,
        note,
        line_joined_at,
        first_chat_at,
        last_chat_at,
        customer_message_count,
        staff_reply_count,
        total_message_count,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at
    `,
    [
      customerName,
      phone,
      lineDisplayName,
      lineId,
      note,
    ]
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("建立客戶失敗");
  }

  return mapCustomer(row);
}

export async function listCustomers(): Promise<CustomerRow[]> {
  const result = await dbQuery<CustomerDbRow>(
    `
      SELECT
        id,
        customer_name,
        line_user_id,
        line_display_name,
        line_id,
        phone,
        note,
        line_joined_at,
        first_chat_at,
        last_chat_at,
        customer_message_count,
        staff_reply_count,
        total_message_count,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at
      FROM customers
      ORDER BY last_seen_at DESC, id DESC
    `
  );

  return result.rows.map(mapCustomer);
}

export async function getCustomerById(
  customerId: number
): Promise<CustomerRow | null> {
  const result = await dbQuery<CustomerDbRow>(
    `
      SELECT
        id,
        customer_name,
        line_user_id,
        line_display_name,
        line_id,
        phone,
        note,
        line_joined_at,
        first_chat_at,
        last_chat_at,
        customer_message_count,
        staff_reply_count,
        total_message_count,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at
      FROM customers
      WHERE id = $1
      LIMIT 1
    `,
    [customerId]
  );

  const row = result.rows[0];

  return row ? mapCustomer(row) : null;
}


type CustomerTagDbRow = {
  tag_name: string;
};

export async function listCustomerTags(
  customerId: number
): Promise<string[]> {
  const result =
    await dbQuery<CustomerTagDbRow>(
      `
        SELECT
          tag_name
        FROM customer_tags
        WHERE customer_id = $1
        ORDER BY created_at ASC, id ASC
      `,
      [customerId]
    );

  return result.rows
    .map((row) => row.tag_name?.trim() ?? "")
    .filter(Boolean);
}
