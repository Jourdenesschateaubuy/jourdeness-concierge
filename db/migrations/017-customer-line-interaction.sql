-- Customer LINE Interaction
--
-- 補充 LINE 客戶實際互動時間與聊天統計。
--
-- line_joined_at：
--   LINE 後台可確認的「加入好友」時間。
--
-- first_chat_at：
--   客戶第一次主動傳送訊息的時間。
--   不把歡迎訊息或自動回覆算成第一次聊天。
--
-- last_chat_at：
--   客戶與官方帳號最後一次聊天互動時間。
--
-- 歷史資料若無法確認，時間欄位保持 NULL，
-- 不使用 created_at 或 NOW() 猜測。


ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS line_joined_at TIMESTAMPTZ;


ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS first_chat_at TIMESTAMPTZ;


ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS last_chat_at TIMESTAMPTZ;


ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS customer_message_count INTEGER
    NOT NULL DEFAULT 0
    CHECK (customer_message_count >= 0);


ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS staff_reply_count INTEGER
    NOT NULL DEFAULT 0
    CHECK (staff_reply_count >= 0);


ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS total_message_count INTEGER
    NOT NULL DEFAULT 0
    CHECK (total_message_count >= 0);


CREATE INDEX IF NOT EXISTS
  customers_line_joined_at_idx
ON customers(line_joined_at DESC)
WHERE line_joined_at IS NOT NULL;


CREATE INDEX IF NOT EXISTS
  customers_first_chat_at_idx
ON customers(first_chat_at DESC)
WHERE first_chat_at IS NOT NULL;


CREATE INDEX IF NOT EXISTS
  customers_last_chat_at_idx
ON customers(last_chat_at DESC)
WHERE last_chat_at IS NOT NULL;
