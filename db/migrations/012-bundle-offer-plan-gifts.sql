CREATE TABLE IF NOT EXISTS bundle_offer_plan_gifts (
  id BIGSERIAL PRIMARY KEY,

  bundle_offer_plan_id BIGINT NOT NULL
    REFERENCES bundle_offer_plans(id)
    ON DELETE CASCADE,

  product_id INTEGER
    REFERENCES products(id)
    ON DELETE SET NULL,

  name TEXT NOT NULL,

  quantity INTEGER NOT NULL DEFAULT 1
    CHECK (quantity > 0),

  unit_label TEXT NOT NULL DEFAULT '件',

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bundle_offer_plan_gifts_plan_id_idx
  ON bundle_offer_plan_gifts(bundle_offer_plan_id);

CREATE INDEX IF NOT EXISTS bundle_offer_plan_gifts_product_id_idx
  ON bundle_offer_plan_gifts(product_id);