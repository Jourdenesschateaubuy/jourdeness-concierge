
CREATE TABLE IF NOT EXISTS promotions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('mix_match', 'buy_x_get_y')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),

  description TEXT,

  -- 任搭組合
  required_quantity INTEGER,
  bundle_price INTEGER,
  allow_same_product BOOLEAN NOT NULL DEFAULT TRUE,

  -- 買幾送幾
  buy_quantity INTEGER,
  gift_quantity INTEGER,
  gift_mode TEXT
    CHECK (
      gift_mode IS NULL OR
      gift_mode IN ('same_product', 'fixed_product', 'gift_pool')
    ),
  repeatable BOOLEAN NOT NULL DEFAULT TRUE,

  -- 共用規則
  priority INTEGER NOT NULL DEFAULT 50,
  stackable BOOLEAN NOT NULL DEFAULT FALSE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotion_products (
  promotion_id BIGINT NOT NULL
    REFERENCES promotions(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL
    REFERENCES products(id) ON DELETE CASCADE,
  role TEXT NOT NULL
    CHECK (role IN ('eligible', 'buy', 'gift')),
  sort_order INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY (promotion_id, product_id, role)
);

CREATE INDEX IF NOT EXISTS idx_promotions_type
  ON promotions(type);

CREATE INDEX IF NOT EXISTS idx_promotions_status
  ON promotions(status);

CREATE INDEX IF NOT EXISTS idx_promotions_priority
  ON promotions(priority DESC, id ASC);

CREATE INDEX IF NOT EXISTS idx_promotion_products_product
  ON promotion_products(product_id);
