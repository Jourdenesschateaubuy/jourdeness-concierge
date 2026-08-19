ALTER TABLE bundle_offers
ADD COLUMN IF NOT EXISTS card_original_price_text TEXT;

ALTER TABLE bundle_offers
ADD COLUMN IF NOT EXISTS card_price_text TEXT;