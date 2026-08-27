-- Catalog V3
-- 一個一般商品可以同時出現在多個前台分類。
--
-- 現有 products.storefront_category 暫時保留，
-- 作為主要分類 / 舊版相容欄位。
--
-- product_catalog_categories 儲存商品可出現的所有前台分類。

CREATE TABLE IF NOT EXISTS product_catalog_categories (
  product_id INTEGER NOT NULL
    REFERENCES products(id)
    ON DELETE CASCADE,

  category_id BIGINT NOT NULL
    REFERENCES catalog_categories(id)
    ON DELETE RESTRICT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS
  product_catalog_categories_category_id_idx
ON product_catalog_categories(category_id);


-- ---------------------------------------------------------
-- 確保目前商品實際使用中的前台分類存在於 catalog_categories。
--
-- 優先：
--   products.storefront_category
--
-- 若舊商品尚未設定：
--   products.category
-- ---------------------------------------------------------

INSERT INTO catalog_categories (
  name,
  sort_order,
  is_active
)
SELECT DISTINCT
  COALESCE(
    NULLIF(TRIM(product.storefront_category), ''),
    NULLIF(TRIM(product.category), '')
  ) AS category_name,
  0,
  TRUE
FROM products AS product
WHERE COALESCE(
  NULLIF(TRIM(product.storefront_category), ''),
  NULLIF(TRIM(product.category), '')
) IS NOT NULL
ON CONFLICT (name) DO NOTHING;


-- ---------------------------------------------------------
-- 將目前每件商品的既有分類自動帶進新的多分類關聯表。
--
-- 這一步只複製既有分類關係，
-- 不會修改 products 原本的 category /
-- storefront_category。
-- ---------------------------------------------------------

INSERT INTO product_catalog_categories (
  product_id,
  category_id
)
SELECT
  product.id,
  category.id
FROM products AS product
JOIN catalog_categories AS category
  ON category.name = COALESCE(
    NULLIF(TRIM(product.storefront_category), ''),
    NULLIF(TRIM(product.category), '')
  )
WHERE COALESCE(
  NULLIF(TRIM(product.storefront_category), ''),
  NULLIF(TRIM(product.category), '')
) IS NOT NULL
ON CONFLICT (product_id, category_id)
DO NOTHING;
