ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS storefront_product_id INTEGER
    REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS unit_label TEXT NOT NULL DEFAULT '件';

CREATE INDEX IF NOT EXISTS idx_promotions_storefront_product
  ON promotions(storefront_product_id);
