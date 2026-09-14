-- Customer CRM V1
--
-- CRM 不是會員系統，不建立會員帳號或登入機制。
--
-- customers：
--   儲存穩定的客戶識別資料。
--
-- orders.customer_id：
--   將網站正式訂單連結到 CRM 客戶。
--   orders 原有 customer_name / phone / LINE 欄位繼續保留，
--   作為下單當時的歷史快照。
--
-- customer_purchases：
--   只記錄「非網站訂單」的購買事件，
--   例如城堡現場、LINE 客人自述、客服人工補登。
--
-- 不自動匯入目前既有 orders，
-- 避免測試訂單污染 CRM。


-- =========================================================
-- Customers
-- =========================================================

CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,

  customer_name TEXT NOT NULL DEFAULT '',

  line_user_id TEXT NOT NULL DEFAULT '',
  line_display_name TEXT NOT NULL DEFAULT '',
  line_id TEXT NOT NULL DEFAULT '',

  phone TEXT NOT NULL DEFAULT '',

  note TEXT NOT NULL DEFAULT '',

  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 同一個有效 LINE User ID 原則上只能對應一位 CRM 客戶。
-- 空字串不參與唯一限制。

CREATE UNIQUE INDEX IF NOT EXISTS
  customers_line_user_id_unique_idx
ON customers(line_user_id)
WHERE line_user_id <> '';


CREATE INDEX IF NOT EXISTS
  customers_phone_idx
ON customers(phone)
WHERE phone <> '';


CREATE INDEX IF NOT EXISTS
  customers_last_seen_at_idx
ON customers(last_seen_at DESC);


-- =========================================================
-- Link Website Orders To Customers
-- =========================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id BIGINT
    REFERENCES customers(id)
    ON DELETE SET NULL;


CREATE INDEX IF NOT EXISTS
  orders_customer_id_idx
ON orders(customer_id);


-- =========================================================
-- Non-Website Purchase Records
-- =========================================================

CREATE TABLE IF NOT EXISTS customer_purchases (
  id BIGSERIAL PRIMARY KEY,

  customer_id BIGINT NOT NULL
    REFERENCES customers(id)
    ON DELETE RESTRICT,

  purchase_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  purchase_channel TEXT NOT NULL DEFAULT 'other'
    CHECK (
      purchase_channel IN (
        'castle',
        'line',
        'other'
      )
    ),

  record_source TEXT NOT NULL DEFAULT 'staff_manual'
    CHECK (
      record_source IN (
        'staff_manual',
        'customer_self_reported',
        'other'
      )
    ),

  visit_type TEXT NOT NULL DEFAULT 'unknown'
    CHECK (
      visit_type IN (
        'individual',
        'family',
        'parent_child',
        'tour_group',
        'company',
        'school_agency',
        'unknown',
        'other'
      )
    ),

  total_amount INTEGER,

  note TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS
  customer_purchases_customer_id_idx
ON customer_purchases(customer_id);


CREATE INDEX IF NOT EXISTS
  customer_purchases_purchase_time_idx
ON customer_purchases(purchase_time DESC);


-- =========================================================
-- Non-Website Purchase Items
-- =========================================================

CREATE TABLE IF NOT EXISTS customer_purchase_items (
  id BIGSERIAL PRIMARY KEY,

  purchase_id BIGINT NOT NULL
    REFERENCES customer_purchases(id)
    ON DELETE CASCADE,

  item_type TEXT NOT NULL DEFAULT 'product'
    CHECK (
      item_type IN (
        'product',
        'bundle',
        'other'
      )
    ),

  product_id INTEGER
    REFERENCES products(id)
    ON DELETE SET NULL,

  bundle_offer_id BIGINT
    REFERENCES bundle_offers(id)
    ON DELETE SET NULL,

  name TEXT NOT NULL DEFAULT '',

  quantity INTEGER NOT NULL DEFAULT 1
    CHECK (quantity > 0),

  unit_price INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS
  customer_purchase_items_purchase_id_idx
ON customer_purchase_items(purchase_id);


CREATE INDEX IF NOT EXISTS
  customer_purchase_items_product_id_idx
ON customer_purchase_items(product_id)
WHERE product_id IS NOT NULL;


CREATE INDEX IF NOT EXISTS
  customer_purchase_items_bundle_offer_id_idx
ON customer_purchase_items(bundle_offer_id)
WHERE bundle_offer_id IS NOT NULL;


-- =========================================================
-- Customer Tags
-- =========================================================

CREATE TABLE IF NOT EXISTS customer_tags (
  id BIGSERIAL PRIMARY KEY,

  customer_id BIGINT NOT NULL
    REFERENCES customers(id)
    ON DELETE CASCADE,

  tag_name TEXT NOT NULL,

  tag_type TEXT NOT NULL DEFAULT 'manual'
    CHECK (
      tag_type IN (
        'manual',
        'product',
        'visit',
        'behavior',
        'system'
      )
    ),

  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (
      source IN (
        'manual',
        'system',
        'line'
      )
    ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE UNIQUE INDEX IF NOT EXISTS
  customer_tags_customer_tag_unique_idx
ON customer_tags(
  customer_id,
  tag_name,
  tag_type
);


CREATE INDEX IF NOT EXISTS
  customer_tags_tag_name_idx
ON customer_tags(tag_name);
