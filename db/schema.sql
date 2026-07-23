CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  series TEXT NOT NULL DEFAULT '',
  original_price TEXT,
  price TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',

  card_name TEXT,
  card_subtitle TEXT,
  spec TEXT,
  intro TEXT,
  price_note TEXT,
  expiry_note TEXT,
  internal_expiry_date TEXT,

  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  suitable_for JSONB NOT NULL DEFAULT '[]'::jsonb,
  usage TEXT,
  notice TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  expanded_info JSONB NOT NULL DEFAULT '[]'::jsonb,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'coming_soon', 'sold_out')),

  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category
  ON products(category);

CREATE INDEX IF NOT EXISTS idx_products_series
  ON products(series);

CREATE INDEX IF NOT EXISTS idx_products_status
  ON products(status);

CREATE INDEX IF NOT EXISTS idx_products_sort_order
  ON products(sort_order, id);
