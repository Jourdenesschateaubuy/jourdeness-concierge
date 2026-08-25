CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,

  order_number TEXT NOT NULL UNIQUE,
  order_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  customer_name TEXT NOT NULL DEFAULT '',
  line_id TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',

  delivery_method TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',

  status TEXT NOT NULL DEFAULT '待確認'
    CHECK (
      status IN (
        '待確認',
        '處理中',
        '已完成',
        '已取消'
      )
    ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,

  order_id BIGINT NOT NULL
    REFERENCES orders(id)
    ON DELETE CASCADE,

  item_type TEXT NOT NULL DEFAULT 'product'
    CHECK (
      item_type IN (
        'product',
        'bundle'
      )
    ),

  product_id INTEGER,
  bundle_offer_id INTEGER,

  name TEXT NOT NULL DEFAULT '',

  quantity INTEGER NOT NULL DEFAULT 1,

  unit_price INTEGER NOT NULL DEFAULT 0,

  detail JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_orders_order_number
  ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items(order_id);
