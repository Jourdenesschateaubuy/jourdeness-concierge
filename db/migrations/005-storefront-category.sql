-- Admin V2：新增真正給前台使用的分類欄位。
-- 舊商品保持 NULL，前台繼續沿用既有分類白名單，不改變目前網站行為。

ALTER TABLE products
ADD COLUMN IF NOT EXISTS storefront_category TEXT;

CREATE INDEX IF NOT EXISTS products_storefront_category_idx
ON products(storefront_category);
