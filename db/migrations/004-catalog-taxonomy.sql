CREATE TABLE IF NOT EXISTS catalog_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_series (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES catalog_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, name)
);

-- 從目前 products 自動建立既有分類
INSERT INTO catalog_categories (name, sort_order)
SELECT DISTINCT
  TRIM(category),
  0
FROM products
WHERE NULLIF(TRIM(category), '') IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- 從目前 products 自動建立既有系列
INSERT INTO catalog_series (category_id, name, sort_order)
SELECT DISTINCT
  category.id,
  TRIM(product.series),
  0
FROM products AS product
JOIN catalog_categories AS category
  ON category.name = TRIM(product.category)
WHERE NULLIF(TRIM(product.series), '') IS NOT NULL
ON CONFLICT (category_id, name) DO NOTHING;

CREATE INDEX IF NOT EXISTS catalog_series_category_id_idx
  ON catalog_series(category_id);

CREATE INDEX IF NOT EXISTS catalog_series_active_idx
  ON catalog_series(is_active);
