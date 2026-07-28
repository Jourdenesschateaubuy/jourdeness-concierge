ALTER TABLE products
ADD COLUMN IF NOT EXISTS combo_config JSONB;

-- =========================================================
-- ID 1｜益生菌任選 3 盒 $1,600
-- =========================================================
UPDATE products
SET combo_config = $json$
{
  "type": "mix_match",
  "unitLabel": "盒",
  "allowSameProduct": true,
  "singlePriceLabel": "高鈣單盒 $800｜蔓越莓單盒 $990",
  "options": [
    {
      "id": "cranberry-probiotic",
      "name": "蔓越莓益生菌",
      "singleUnitPrice": 990,
      "singlePriceLabel": "單盒 $990"
    },
    {
      "id": "calcium-probiotic",
      "name": "高鈣益生菌",
      "singleUnitPrice": 800,
      "singlePriceLabel": "單盒 $800"
    }
  ],
  "plans": [
    {
      "id": "three-boxes",
      "label": "任選 3 盒",
      "requiredQuantity": 3,
      "price": 1600,
      "priceLabel": "$1,600"
    }
  ]
}
$json$::jsonb
WHERE id = 1;

-- =========================================================
-- ID 51｜貼布任選
-- =========================================================
UPDATE products
SET combo_config = $json$
{
  "type": "mix_match",
  "unitLabel": "盒",
  "allowSameProduct": true,
  "singleUnitPrice": 500,
  "singlePriceLabel": "單盒 $500",
  "options": [
    {
      "id": "cool-patch",
      "name": "石墨烯電氣石精油貼布（涼感）"
    },
    {
      "id": "warm-patch",
      "name": "石墨烯電氣石精油貼布（溫感）"
    }
  ],
  "plans": [
    {
      "id": "four-boxes",
      "label": "任選 4 盒",
      "requiredQuantity": 4,
      "price": 1099,
      "priceLabel": "$1,099"
    },
    {
      "id": "ten-boxes",
      "label": "任選 10 盒",
      "requiredQuantity": 10,
      "price": 2500,
      "priceLabel": "$2,500"
    }
  ]
}
$json$::jsonb
WHERE id = 51;

-- =========================================================
-- ID 54｜牙膏買二送一
-- =========================================================
UPDATE products
SET combo_config = $json$
{
  "type": "buy_get",
  "unitLabel": "條",
  "allowSameProduct": true,
  "singleUnitPrice": 250,
  "singlePriceLabel": "單條 $250",
  "options": [
    {
      "id": "lavender-toothpaste",
      "name": "薰衣草齒齦保健牙膏"
    },
    {
      "id": "dragon-blood-toothpaste",
      "name": "龍血齒齦保健牙膏"
    }
  ],
  "plans": [
    {
      "id": "three-tubes",
      "label": "買二送一・共 3 條",
      "requiredQuantity": 3,
      "buyQuantity": 2,
      "freeQuantity": 1,
      "price": 500,
      "priceLabel": "$500"
    }
  ]
}
$json$::jsonb
WHERE id = 54;

-- =========================================================
-- ID 55｜桶裝面膜
-- =========================================================
UPDATE products
SET combo_config = $json$
{
  "type": "mix_match",
  "unitLabel": "桶",
  "allowSameProduct": true,
  "singleUnitPrice": 599,
  "singlePriceLabel": "單桶 $599",
  "options": [
    {
      "id": "water-mask-35",
      "name": "水搖滾保濕面膜 35片"
    },
    {
      "id": "white-mask-35",
      "name": "極光白美白面膜 35片"
    }
  ],
  "plans": [
    {
      "id": "two-buckets",
      "label": "任選 2 桶",
      "requiredQuantity": 2,
      "price": 1100,
      "priceLabel": "$1,100"
    },
    {
      "id": "five-buckets",
      "label": "任選 5 桶",
      "requiredQuantity": 5,
      "price": 2750,
      "priceLabel": "$2,750",
      "note": "任選 5 桶加贈面膜 10 片。",
      "bonusGift": {
        "name": "面膜 10 片",
        "quantity": 1,
        "unitLabel": "組"
      }
    }
  ]
}
$json$::jsonb
WHERE id = 55;

-- =========================================================
-- ID 67｜香皂任選 4 入
-- =========================================================
UPDATE products
SET combo_config = $json$
{
  "type": "mix_match",
  "unitLabel": "入",
  "allowSameProduct": true,
  "singleUnitPrice": 290,
  "singlePriceLabel": "單入 $290",
  "options": [
    {
      "id": "lavender-soap",
      "name": "龍血薰衣草舒緩皂"
    },
    {
      "id": "rose-soap",
      "name": "龍血玫瑰美膚皂"
    },
    {
      "id": "mugwort-soap",
      "name": "龍血艾草保庇皂"
    },
    {
      "id": "lemon-soap",
      "name": "龍血檸檬馬鞭草皂"
    }
  ],
  "plans": [
    {
      "id": "four-soaps",
      "label": "任選 4 入",
      "requiredQuantity": 4,
      "price": 799,
      "priceLabel": "$799"
    }
  ]
}
$json$::jsonb
WHERE id = 67;

-- =========================================================
-- ID 108｜護手霜買二送一
-- =========================================================
UPDATE products
SET combo_config = $json$
{
  "type": "buy_get",
  "unitLabel": "條",
  "allowSameProduct": true,
  "singleUnitPrice": 290,
  "singlePriceLabel": "單條 $290",
  "options": [
    {
      "id": "lavender-hand-cream",
      "name": "薰衣草舒緩護手霜"
    },
    {
      "id": "sakura-hand-cream",
      "name": "櫻之雪亮澤護手霜"
    },
    {
      "id": "tea-tree-hand-cream",
      "name": "茶樹防禦護手霜"
    }
  ],
  "plans": [
    {
      "id": "three-hand-creams",
      "label": "買二送一・共 3 條",
      "requiredQuantity": 3,
      "buyQuantity": 2,
      "freeQuantity": 1,
      "price": 580,
      "priceLabel": "$580"
    }
  ]
}
$json$::jsonb
WHERE id = 108;

-- =========================================================
-- ID 119｜洗髮／沐浴任選 3 瓶
-- =========================================================
UPDATE products
SET combo_config = $json$
{
  "type": "mix_match",
  "unitLabel": "瓶",
  "allowSameProduct": true,
  "singleUnitPrice": 590,
  "singlePriceLabel": "單瓶 $590",
  "options": [
    {
      "id": "dragon-blood-shampoo",
      "name": "龍血求麗頭皮修護洗髮精"
    },
    {
      "id": "dragon-blood-body-wash",
      "name": "龍血求麗潤澤修護沐浴乳"
    }
  ],
  "plans": [
    {
      "id": "three-bottles",
      "label": "任選 3 瓶",
      "requiredQuantity": 3,
      "price": 1100,
      "priceLabel": "$1,100"
    }
  ]
}
$json$::jsonb
WHERE id = 119;
