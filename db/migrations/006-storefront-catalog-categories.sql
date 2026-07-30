-- Admin V2 前台可操作的主分類。
-- 只補缺少的資料，不修改既有商品與舊分類。

INSERT INTO catalog_categories (name, sort_order, is_active)
VALUES
  ('臉部保養', 10, TRUE),
  ('身體洗護', 20, TRUE),
  ('健康補給', 30, TRUE),
  ('精油香氛', 40, TRUE),
  ('新品預告', 50, TRUE)
ON CONFLICT (name) DO UPDATE
SET
  sort_order = EXCLUDED.sort_order,
  is_active = TRUE,
  updated_at = NOW();
