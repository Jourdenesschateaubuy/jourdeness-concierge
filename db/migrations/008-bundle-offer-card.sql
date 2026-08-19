ALTER TABLE bundle_offers
ADD COLUMN IF NOT EXISTS card_subtitle TEXT;

ALTER TABLE bundle_offers
ADD COLUMN IF NOT EXISTS storefront_category TEXT;

ALTER TABLE bundle_offers
ADD COLUMN IF NOT EXISTS series TEXT;

CREATE INDEX IF NOT EXISTS bundle_offers_storefront_category_idx
ON bundle_offers(storefront_category);
