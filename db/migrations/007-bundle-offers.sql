CREATE TABLE IF NOT EXISTS bundle_offers (
  id BIGSERIAL PRIMARY KEY,

  name TEXT NOT NULL,
  bundle_type TEXT NOT NULL
    CHECK (bundle_type IN ('fixed_bundle', 'mix_match', 'buy_get')),

  unit_label TEXT NOT NULL DEFAULT U&'\4EF6',
  allow_same_product BOOLEAN NOT NULL DEFAULT FALSE,

  cover_image TEXT,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'coming_soon', 'sold_out')),

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bundle_offer_items (
  id BIGSERIAL PRIMARY KEY,

  bundle_offer_id BIGINT NOT NULL
    REFERENCES bundle_offers(id)
    ON DELETE CASCADE,

  product_id INTEGER NOT NULL
    REFERENCES products(id)
    ON DELETE RESTRICT,

  role TEXT NOT NULL
    CHECK (role IN ('fixed', 'option', 'buy', 'free')),

  quantity INTEGER NOT NULL DEFAULT 1
    CHECK (quantity > 0),

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (bundle_offer_id, product_id, role)
);

CREATE TABLE IF NOT EXISTS bundle_offer_plans (
  id BIGSERIAL PRIMARY KEY,

  bundle_offer_id BIGINT NOT NULL
    REFERENCES bundle_offers(id)
    ON DELETE CASCADE,

  code TEXT NOT NULL,
  label TEXT NOT NULL,

  required_quantity INTEGER
    CHECK (required_quantity IS NULL OR required_quantity > 0),

  buy_quantity INTEGER
    CHECK (buy_quantity IS NULL OR buy_quantity > 0),

  free_quantity INTEGER
    CHECK (free_quantity IS NULL OR free_quantity > 0),

  price_amount INTEGER NOT NULL
    CHECK (price_amount > 0),

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (bundle_offer_id, code)
);

CREATE INDEX IF NOT EXISTS bundle_offers_status_idx
  ON bundle_offers(status);

CREATE INDEX IF NOT EXISTS bundle_offers_sort_order_idx
  ON bundle_offers(sort_order, id);

CREATE INDEX IF NOT EXISTS bundle_offer_items_bundle_id_idx
  ON bundle_offer_items(bundle_offer_id);

CREATE INDEX IF NOT EXISTS bundle_offer_items_product_id_idx
  ON bundle_offer_items(product_id);

CREATE INDEX IF NOT EXISTS bundle_offer_plans_bundle_id_idx
  ON bundle_offer_plans(bundle_offer_id);
