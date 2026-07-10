"use client";

import { useState, type FormEvent, type ReactNode } from "react";

const categoryConfig = {
  組合價: [
    "全部",
    "本月主打",
    "保健食品組合",
    "貼布組合",
    "生福科技組合",
    "洗沐組合",
    "牙膏組合",
    "保養套組",
    "肥皂組合",
    "香氛組合",
    "面膜組合",
  ],
  全部: ["全部"],
  保養品: [
    "全部",
    "冷杉系列",
    "薰衣草系列",
    "龍血系列",
    "INSK乳酸平衡系列",
    "水光肌能系列",
    "晶淬雪系列",
    "玫瑰超微晶萃系列",
    "BA-5肌密抗皺系列",
    "肌光緊緻速妍系列",
    "冰河淨化系列",
    "櫻の雪傳明酸美白系列",
    "茶樹控油系列",
    "杏仁酸系列",
    "膠原蛋白系列",
    "鳳梨酵素系列",
    "防曬",
    "綠茶多酚保濕平衡系列",
    "白金密集煥白系列",
    "頂級養護",
    "面膜",
  ],
  保健食品: ["全部", "益生菌系列", "晶眸保健系列", "美妍飲品系列"],
  洗沐: ["全部", "洗沐系列"],
  精油: ["全部", "10mL 精油系列", "50mL 精萃油系列", "擴香設備"],
  牙膏: ["全部", "牙膏"],
  肥皂: ["全部", "肥皂"],
  護手霜: ["全部", "護手霜"],
  香水: ["全部", "香水"],
  貼布: ["全部", "貼布"],
  外部廠商: ["全部", "歐思佛", "上山採藥", "生福科技", "倍力工房", "良冠", "木匠兄妹", "F.SEASONS 富雨洋傘"],
} as const;

type MainCategory = keyof typeof categoryConfig;

type Product = {
  id: number;
  name: string;
  category: MainCategory;
  series: string;
  originalPrice?: string;
  price: string;
  image: string;
  description: string;

  // 正式商城欄位：首頁商品卡 / 商品資訊頁可分開維護
  cardName?: string;
  cardSubtitle?: string;
  spec?: string;
  intro?: string;
  priceNote?: string;
  expiryNote?: string;
  features?: string[];
  suitableFor?: string[];
  usage?: string;
  notice?: string;
  gallery?: string[];
};

type CartItem = {
  product: Product;
  quantity: number;
};

type CustomerForm = {
  customerName: string;
  lineId: string;
  phone: string;
  deliveryMethod: string;
  address: string;
  note: string;
};

const ORDER_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwr7F_SU5JNCzDaos4AP0690pCYFFTO-F-inAudZqhVwzbENYxfhlc8Lna5TXtzgl-0_A/exec";

const products: Product[] = [
  {
    id: 1,
    name: "BC-CA複合益生菌高鈣活力配方",
    category: "保健食品",
    series: "益生菌系列",
    originalPrice: "原價 $ 800",
    price: "產地價 3盒 $ 1,100",
    image: "/products/probiotic-bc-ca.jpg",
    description: "3g x 30包 / 盒。BC-198芽孢桿菌，維持消化道機能。",
  },
  {
    id: 2,
    name: "蔓越莓益生菌速酵力配方",
    category: "保健食品",
    series: "益生菌系列",
    originalPrice: "原價 $ 960",
    price: "產地價 3盒 $ 1,600",
    image: "/products/probiotic-cranberry.jpg",
    description: "3g x 30包 / 盒。蔓越莓益生菌配方。",
  },
  {
    id: 3,
    name: "BC-HA複合益生菌",
    category: "保健食品",
    series: "益生菌系列",
    originalPrice: "原價 $ ???",
    price: "產地價 2盒 $ 2,000",
    image: "/products/BC-HA.jpg",
    description: "3g x 60包 / 盒。複合益生菌保健品項。",
  },
  {
    id: 4,
    name: "EC晶眸葉黃素",
    category: "保健食品",
    series: "晶眸保健系列",
    originalPrice: "原價 $ ???",
    price: "產地價待補",
    image: "/products/Lutein.jpg",
    description: "精華凍 + 精華飲綜合組。",
  },
  {
    id: 5,
    name: "亮妍魚膠原蛋白飲",
    category: "保健食品",
    series: "美妍飲品系列",
    originalPrice: "原價 $ ???",
    price: "產地價待補",
    image: "/products/FISH-Collagen.jpg",
    description: "美妍保健飲品。",
  },

  {
    id: 6,
    name: "薰衣草肌安舒緩化妝水",
    category: "保養品",
    series: "薰衣草系列",
    originalPrice: "原價 $ ???",
    price: "產地價待補",
    image: "/products/Lavender1.jpg",
    description: "150mL。薰衣草肌安舒緩系列。",
  },
  {
    id: 7,
    name: "薰衣草肌安舒緩精華液",
    category: "保養品",
    series: "薰衣草系列",
    originalPrice: "原價 $ ???",
    price: "產地價待補",
    image: "/products/Lavender2.jpg",
    description: "30mL。薰衣草肌安舒緩系列。",
  },
  {
    id: 8,
    name: "薰衣草肌安舒緩保濕乳",
    category: "保養品",
    series: "薰衣草系列",
    originalPrice: "原價 $ ???",
    price: "產地價待補",
    image: "/products/Lavender3.jpg",
    description: "100mL。薰衣草肌安舒緩系列。",
  },

  {
    id: 9,
    name: "冷杉型男淨化潔顏乳",
    category: "保養品",
    series: "冷杉系列",
    originalPrice: "原價待補",
    price: "缺貨中",
    image: "/products/Men's Abies0.jpg",
    description: "120mL。冷杉系列保養品。",
  },
  {
    id: 10,
    name: "冷杉型男淨化保濕化妝水",
    category: "保養品",
    series: "冷杉系列",
    originalPrice: "原價待補",
    price: "即期出清 單瓶 $199",
    image: "/products/Men's Abies3.jpg",
    description: "150mL。冷杉系列保養品。",
  },
  {
    id: 11,
    name: "冷杉型男淨化保濕乳",
    category: "保養品",
    series: "冷杉系列",
    originalPrice: "原價待補",
    price: "即期出清 單瓶 $199",
    image: "/products/Men's Abies1.jpg",
    description: "100mL。冷杉系列保養品。",
  },
  {
    id: 12,
    name: "冷杉酷涼活絡精油滾珠",
    category: "保養品",
    series: "冷杉系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Siberian Fir Essential Oil Roller.jpg",
    description: "9mL。冷杉酷涼活絡精油滾珠。",
  },

  {
    id: 13,
    name: "玫瑰超微晶萃潔顏慕絲",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/rose0.jpg",
    description: "150mL。玫瑰超微晶萃系列。",
  },
  {
    id: 14,
    name: "玫瑰超微晶萃活膚液",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    originalPrice: "原價 $ 2,080",
    price: "產地價待補",
    image: "/products/rose1.jpg",
    description: "130mL。玫瑰超微晶萃系列。",
  },
  {
    id: 15,
    name: "玫瑰超微晶萃瞬效乳",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    originalPrice: "原價 $ 2,280",
    price: "產地價待補",
    image: "/products/rose3.jpg",
    description: "130mL。玫瑰超微晶萃系列。",
  },
  {
    id: 16,
    name: "玫瑰超微晶萃瞬效霜",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    originalPrice: "原價 $ 2,880",
    price: "產地價待補",
    image: "/products/rose4.jpg",
    description: "50g。玫瑰超微晶萃系列。",
  },

  {
    id: 17,
    name: "龍血求麗化妝水",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價 $890",
    image: "/products/db-1.jpg",
    description: "龍血系列保養品。",
  },
  {
    id: 18,
    name: "龍血精華液",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "缺貨中",
    image: "/products/db-2.jpg",
    description: "龍血系列保養品。",
  },
  {
    id: 19,
    name: "龍血求麗修護乳",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價 買一送一 $ 1,290",
    image: "/products/db-3.jpg",
    description: "龍血系列保養品。",
  },
  {
    id: 20,
    name: "龍血求麗修護霜",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價 $ 1,190",
    image: "/products/db-4.jpg",
    description: "龍血系列保養品。",
  },

  {
    id: 21,
    name: "肌光緊緻速妍雪膚液",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 3,280",
    price: "產地價待補",
    image: "/products/Radiance and Lifting1.jpg",
    description: "肌光緊緻速妍系列。",
  },
  {
    id: 22,
    name: "肌光緊緻速妍精華露",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 3,880",
    price: "產地價待補",
    image: "/products/Radiance and Lifting2.jpg",
    description: "肌光緊緻速妍系列。",
  },
  {
    id: 23,
    name: "肌光緊緻速妍霜",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 4,680",
    price: "產地價待補",
    image: "/products/Radiance and Lifting4.jpg",
    description: "肌光緊緻速妍系列。",
  },
  {
    id: 24,
    name: "肌光緊緻速妍面膜",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 3,680",
    price: "產地價待補",
    image: "/products/Radiance and Lifting5.jpg",
    description: "肌光緊緻速妍系列。",
  },

  {
    id: 25,
    name: "INSK乳酸平衡機能水",
    category: "保養品",
    series: "INSK乳酸平衡系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/INSK 001.jpg",
    description: "INSK乳酸平衡系列。",
  },
  {
    id: 26,
    name: "INSK乳酸平衡修護乳",
    category: "保養品",
    series: "INSK乳酸平衡系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/INSK1.jpg",
    description: "INSK乳酸平衡系列。",
  },

  {
    id: 27,
    name: "BA-5肌密抗皺精華",
    category: "保養品",
    series: "BA-5肌密抗皺系列",
    originalPrice: "原價 $ 4,880",
    price: "缺貨中",
    image: "/products/BA-5 2.jpg",
    description: "BA-5肌密抗皺系列。",
  },
  {
    id: 28,
    name: "BA-5肌密抗皺霜",
    category: "保養品",
    series: "BA-5肌密抗皺系列",
    originalPrice: "原價 $ 9,280",
    price: "缺貨中",
    image: "/products/BA-5 4.png",
    description: "BA-5肌密抗皺系列。",
  },

  {
    id: 29,
    name: "龍血求麗頭皮修護洗髮精",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 790",
    price: "產地價 任選3瓶 $ 1,100",
    image: "/products/BDwash2.jpg",
    description: "龍血洗髮沐浴系列，可搭配活動組合。",
  },
  {
    id: 30,
    name: "龍血求麗潤澤修護沐浴乳",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 790",
    price: "產地價 任選3瓶 $ 1,100",
    image: "/products/BDwash1.jpg",
    description: "龍血洗髮沐浴系列，可搭配活動組合。",
  },
  {
    id: 31,
    name: "純淨洗髮精",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 780",
    price: "產地價待補",
    image: "/products/Refined Hair Shampoo.jpg",
    description: "洗髮品項。",
  },
  {
    id: 32,
    name: "阿甘絲柔洗髮精",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 1,280",
    price: "產地價待補",
    image: "/products/Argan Oil1.jpg",
    description: "洗髮品項。",
  },
  {
    id: 33,
    name: "INSK乳酸淨痘修護膠",
    category: "保養品",
    series: "INSK乳酸平衡系列",
    originalPrice: "原價 $ 1,080",
    price: "產地價待補",
    image: "/products/INSK6.jpg",
    description: "15mL。INSK乳酸平衡系列。",
  },
  {
    id: 34,
    name: "INSK乳酸平衡水嫩膜",
    category: "保養品",
    series: "INSK乳酸平衡系列",
    originalPrice: "原價 $ 1,280",
    price: "產地價待補",
    image: "/products/INSK5.jpg",
    description: "23mL x 6片 / 盒。INSK乳酸平衡系列。",
  },
  {
    id: 35,
    name: "齒齦保健薰衣草舒緩牙膏",
    category: "牙膏",
    series: "牙膏",
    originalPrice: "原價 $ 000",
    price: "產地價 單價 $ 250 、任選3條 $ 500",
    image: "/products/Lavender-washtoothpaste.jpg",
    description: "120g。齒齦保健牙膏。",
  },
  {
    id: 36,
    name: "齒齦保健龍血修護牙膏",
    category: "牙膏",
    series: "牙膏",
    originalPrice: "原價待補",
    price: "產地價 單價 $ 250 、任選3條 $ 500",
    image: "/products/bd-washtoothpaste.jpg",
    description: "120g / 單支。齒齦保健牙膏。",
  },

  {
    id: 37,
    name: "智慧之冠",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。精油系列。",
  },
  {
    id: 38,
    name: "亮采橙真",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。精油系列。",
  },
  {
    id: 39,
    name: "呼暢護隨",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。精油系列。",
  },
  {
    id: 40,
    name: "魔力輕盈",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。精油系列。",
  },
  {
    id: 41,
    name: "順暢平衡",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。精油系列。",
  },
  {
    id: 42,
    name: "心之綻放",
    category: "精油",
    series: "10mL 精油系列",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。精油系列。",
  },
  {
    id: 43,
    name: "青春密碼維 E 精萃油",
    category: "精油",
    series: "50mL 精萃油系列",
    originalPrice: "原價 $ 2,200",
    price: "產地價 $ 1,650",
    image: "/products/Essential Oil E.jpg",
    description: "50mL。精萃油系列。",
  },
  {
    id: 44,
    name: "防護盾牌維 C 精萃油",
    category: "精油",
    series: "50mL 精萃油系列",
    originalPrice: "原價 $ 2,200",
    price: "產地價 $ 1,650",
    image: "/products/Essential Oil C.jpg",
    description: "50mL。精萃油系列。",
  },
  {
    id: 45,
    name: "晚安無瑕維 A 精萃油",
    category: "精油",
    series: "50mL 精萃油系列",
    originalPrice: "原價 $ 2,200",
    price: "產地價 $ 1,650",
    image: "/products/Essential Oil A.jpg",
    description: "50mL。精萃油系列。",
  },
  {
    id: 46,
    name: "高頻霧化香薰機",
    category: "精油",
    series: "擴香設備",
    originalPrice: "原價 $ 1,980",
    price: "產地價 $ 1,980",
    image: "/products/placeholder.jpg",
    description: "擴香設備。",
  },

  {
    id: 47,
    name: "石墨烯電氣石精油貼布(涼感)",
    category: "貼布",
    series: "貼布",
    originalPrice: "原價 $ 800",
    price: "產地價 $ 500",
    image: "/products/blue 100.jpg",
    description: "商品敘述。",
  },
  {
    id: 48,
    name: "石墨烯電氣石精油貼布(溫感)",
    category: "貼布",
    series: "貼布",
    originalPrice: "原價 $ 800",
    price: "產地價 $ 500",
    image: "/products/red 100.jpg",
    description: "商品敘述。",
  },

  {
    id: 49,
    name: "茶樹K痘精華",
    category: "保養品",
    series: "茶樹控油系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/tt6.jpg",
    description: "8mL / 盒。茶樹控油系列。",
  },
  {
    id: 50,
    name: "茶樹控油化妝水",
    category: "保養品",
    series: "茶樹控油系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/tt1.jpg",
    description: "150mL。茶樹控油系列。",
  },
  {
    id: 51,
    name: "茶樹控油保濕乳",
    category: "保養品",
    series: "茶樹控油系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/tee3.jpg",
    description: "100mL。茶樹控油系列。",
  },
  {
    id: 52,
    name: "肌可佳膠原蛋白彈潤原液",
    category: "保養品",
    series: "膠原蛋白系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/collagen 1.jpg",
    description: "30mL。膠原蛋白系列。",
  },
  {
    id: 53,
    name: "龍血玻尿酸保濕精華液",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/DBME.jpg",
    description: "龍血系列保養品。",
  },
  {
    id: 54,
    name: "龍血求麗卸妝油",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/BD001.jpg",
    description: "150mL。龍血系列保養品。",
  },
  {
    id: 55,
    name: "龍血求麗潔顏慕絲",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/BD0.jpg",
    description: "150mL。龍血系列保養品。",
  },
  {
    id: 56,
    name: "水搖滾保濕面膜",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/DBMUSK 5.jpg",
    description: "22mL x 5pcs。",
  },
  {
    id: 57,
    name: "水搖滾保濕面膜",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/water 5.jpg",
    description: "22mL x 10pcs。",
  },
  {
    id: 58,
    name: "水搖滾保濕面膜",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/water 5.jpg",
    description: "22mL x 35pcs。",
  },
  {
    id: 59,
    name: "極光白美白面膜",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/DBMUSK 5 W.jpg",
    description: "x 5pcs。",
  },
  {
    id: 60,
    name: "極光白美白面膜",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/white 5.jpg",
    description: "x 35pcs。",
  },
  {
    id: 61,
    name: "水光肌能化妝水",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/glassskin 1.jpg",
    description: "140mL。水光肌能系列。",
  },
  {
    id: 62,
    name: "水光肌能乳液",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/glassskin 3.jpg",
    description: "130mL。水光肌能系列。",
  },
  {
    id: 63,
    name: "水光肌能晚霜",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/glassskin 4.jpg",
    description: "50mL。水光肌能系列。",
  },
  {
    id: 64,
    name: "苦杏仁酸溫和煥顏露",
    category: "保養品",
    series: "杏仁酸系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/mandelic acid.jpg",
    description: "30mL。溫和煥顏保養品項。",
  },
  {
    id: 65,
    name: "冰河淨化潔顏慕絲",
    category: "保養品",
    series: "冰河淨化系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Glacial 0.jpg",
    description: "150mL。冰河淨化系列。",
  },
  {
    id: 66,
    name: "冰河淨化淨膚露",
    category: "保養品",
    series: "冰河淨化系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Glacial 1.jpg",
    description: "120mL。冰河淨化系列。",
  },
  {
    id: 67,
    name: "【新品】冰河淨化柔膚面膜",
    category: "保養品",
    series: "冰河淨化系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Glacial 5.jpg",
    description: "100mL。冰河淨化系列。",
  },
  {
    id: 68,
    name: "晶淬雪潤白乳",
    category: "保養品",
    series: "晶淬雪系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Crystal Radiance Brightening Emulsion.jpg",
    description: "100mL。晶淬雪系列。",
  },
  {
    id: 69,
    name: "鳳梨酵素代謝角質凝露",
    category: "保養品",
    series: "鳳梨酵素系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/pineapple 0.jpg",
    description: "120g。鳳梨酵素系列。",
  },
  {
    id: 70,
    name: "鳳梨酵素活膚面膜",
    category: "保養品",
    series: "鳳梨酵素系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/pineapple 5.jpg",
    description: "22mL x 5pcs。鳳梨酵素系列。",
  },
  {
    id: 71,
    name: "櫻の雪淨白潔顏慕絲",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/sukola0.jpg",
    description: "150mL。櫻の雪傳明酸美白系列。",
  },
  {
    id: 72,
    name: "櫻の雪傳明酸美白化妝水",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/sukola1.jpg",
    description: "150mL。櫻の雪傳明酸美白系列。",
  },

  {
    id: 141,
    name: "櫻の雪傳明酸美白精華液",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/su2.jpg",
    description: "30mL。櫻の雪傳明酸美白系列。",
  },
  {
    id: 142,
    name: "櫻の雪傳明酸美白乳液",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/su3.jpg",
    description: "100mL。櫻の雪傳明酸美白系列。",
  },
  {
    id: 73,
    name: "能量牛樟芝保健潔口液",
    category: "外部廠商",
    series: "生福科技",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/watertooth.jpg",
    description: "生福科技品項。",
  },
  {
    id: 74,
    name: "挪威 EPAX 高活性 rTG 魚油軟膠囊",
    category: "外部廠商",
    series: "生福科技",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/fish oil.jpg",
    description: "生福科技品項。",
  },

  {
    id: 75,
    name: "櫻の雪亮澤護手霜",
    category: "護手霜",
    series: "護手霜",
    originalPrice: "價值 $ 290",
    price: "產地價待補",
    image: "/products/sakura hand cream.jpg",
    description: "30g。JDST 護手霜品項。",
  },
  {
    id: 76,
    name: "茶樹防禦護手霜",
    category: "護手霜",
    series: "護手霜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/tea tree hand cream.jpg",
    description: "30mL。護手霜品項。",
  },
  {
    id: 77,
    name: "薰衣草舒緩護手霜",
    category: "護手霜",
    series: "護手霜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/lavender hand cream.jpg",
    description: "30mL。護手霜品項。",
  },
  {
    id: 78,
    name: "麝香棉花香氛護手霜",
    category: "護手霜",
    series: "護手霜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/musk hand cream.jpg",
    description: "30g。護手霜品項。",
  },

  {
    id: 79,
    name: "龍血玫瑰美膚皂",
    category: "肥皂",
    series: "肥皂",
    originalPrice: "原價待補",
    price: "任選4款 $ 799",
    image: "/products/soap rose.png",
    description: "200g±10g。龍血手工皂品項，可搭配任選4款活動。",
  },
  {
    id: 80,
    name: "龍血艾草保庇皂",
    category: "肥皂",
    series: "肥皂",
    originalPrice: "原價待補",
    price: "任選4款 $ 799",
    image: "/products/soap Artemisia.png",
    description: "200g±10g。龍血手工皂品項，可搭配任選4款活動。",
  },
  {
    id: 81,
    name: "龍血檸檬馬鞭草皂",
    category: "肥皂",
    series: "肥皂",
    originalPrice: "原價待補",
    price: "任選4款 $ 799",
    image: "/products/soap lemo.png",
    description: "200g±10g。龍血手工皂品項，可搭配任選4款活動。",
  },
  {
    id: 82,
    name: "龍血薰衣草舒緩皂",
    category: "肥皂",
    series: "肥皂",
    originalPrice: "原價待補",
    price: "任選4款 $ 799",
    image: "/products/soap lav.png",
    description: "200g±10g。龍血手工皂品項，可搭配任選4款活動。",
  },
  {
    id: 83,
    name: "高鈣益生菌 11盒組",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價 $ 8,800",
    price: "產地價 $ 3,600",
    image: "/products/BCCA3600.png",
    description: "BC-CA複合益生菌高鈣活力配方 11盒。",
  },
  {
    id: 84,
    name: "高鈣益生菌6盒 + 蔓越莓益生菌5盒",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價 $ 9,600",
    price: "產地價 $ 4,200",
    image: "/products/berry5+bbca6.png",
    description: "BC-CA高鈣益生菌 6盒 + 蔓越莓益生菌 5盒。",
  },
  {
    id: 85,
    name: "蔓越莓益生菌10盒 + 高鈣益生菌1盒",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價 $ 10,400",
    price: "產地價 $ 4,800",
    image: "/products/cranberry+BCCA.png",
    description: "蔓越莓益生菌 10盒 + BC-CA高鈣益生菌 1盒。",
  },
  {
    id: 86,
    name: "石墨烯電氣石精油貼布任選4盒",
    category: "組合價",
    series: "貼布組合",
    originalPrice: "原價 $ 3,200",
    price: "產地價 $ 1,099",
    image: "/products/patch 1099.png",
    description: "涼感 / 溫感可任選搭配，共4盒。",
  },
  {
    id: 87,
    name: "石墨烯電氣石精油貼布任選10盒",
    category: "組合價",
    series: "貼布組合",
    originalPrice: "原價 $ 8,000",
    price: "產地價 $ 2,500",
    image: "/products/patch 2500.png",
    description: "涼感 / 溫感可任選搭配，共10盒。",
  },
  {
    id: 88,
    name: "能量牛樟芝保健潔口液 3罐贈薰衣草牙膏1條",
    category: "組合價",
    series: "生福科技組合",
    originalPrice: "原價待補",
    price: "3罐贈1條牙膏 $ 1,500",
    image: "/products/watertooth31.png",
    description: "能量牛樟芝保健潔口液 3罐，贈齒齦保健薰衣草舒緩牙膏120g 1條。",
  },
  {
    id: 89,
    name: "龍血洗沐任選3瓶",
    category: "組合價",
    series: "洗沐組合",
    originalPrice: "原價 $ 2,370",
    price: "產地價 $ 1,100",
    image: "/products/wash31100.png",
    description: "龍血洗髮精 / 龍血沐浴乳可自由搭配，共3瓶。",
  },
  {
    id: 90,
    name: "齒齦保健牙膏任選3條",
    category: "組合價",
    series: "牙膏組合",
    originalPrice: "原價 $ 750",
    price: "產地價 $ 500",
    image: "/products/tooth500.png",
    description: "薰衣草舒緩 / 龍血修護可混搭，共3條。",
  },
  {
    id: 91,
    name: "水搖滾 / 極光白美白面膜桶裝任選組",
    category: "組合價",
    series: "面膜組合",
    originalPrice: "原價待補",
    price: "1桶 $ 599｜任選2桶 $ 1,100｜任選5桶 $ 2,750",
    image: "/products/white water 5.png",
    description: "水搖滾保濕面膜22mL x35pcs / 極光白美白面膜 x35pcs 可任選。任選5桶再送10片水搖滾保濕面膜。",
  },
  {
    id: 92,
    name: "挪威 EPAX 高活性 rTG 魚油軟膠囊買一送一",
    category: "組合價",
    series: "生福科技組合",
    originalPrice: "原價待補",
    price: "買一送一 $ 1,580",
    image: "/products/fishoil1+1.png",
    description: "挪威 EPAX 高活性 rTG 魚油軟膠囊買1送1，共2盒，規格依商品標示。",
  },

  {
    id: 93,
    name: "阿甘甦醒髮根養護液",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 1,680",
    price: "產地價待補",
    image: "/products/Argan Oil3.jpg",
    description: "80mL。髮根養護品項。",
  },
  {
    id: 94,
    name: "龍血檀香靜心皂",
    category: "肥皂",
    series: "肥皂",
    originalPrice: "原價待補",
    price: "任選4款 $ 799",
    image: "/products/soap sandalwood.png",
    description: "200g±10g。龍血手工皂品項，可搭配任選4款活動。",
  },
  {
    id: 95,
    name: "火炙帶",
    category: "外部廠商",
    series: "生福科技",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "生福科技品項。",
  },
  {
    id: 96,
    name: "好亨睡科技毯",
    category: "外部廠商",
    series: "生福科技",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "生福科技品項。",
  },
  {
    id: 97,
    name: "鴕鳥龜鹿土龍精",
    category: "外部廠商",
    series: "生福科技",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "生福科技品項。",
  },
  {
    id: 98,
    name: "EX+ Q18 魚膠原蛋白粉",
    category: "外部廠商",
    series: "生福科技",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "生福科技品項。",
  },
  {
    id: 99,
    name: "梅托洛",
    category: "外部廠商",
    series: "生福科技",
    originalPrice: "原價待補",
    price: "買一送二 $ 3,600",
    image: "/products/matolo.png",
    description: "生福科技品項。可搭配買一送二活動。",
  },
  {
    id: 100,
    name: "BC-HA 複合益生菌 2盒組",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價待補",
    price: "產地價 2盒 $ 2,000",
    image: "/products/BCHA2000.png",
    description: "BC-HA 複合益生菌 3g x 60包 / 盒，共2盒。",
  },
  {
    id: 101,
    name: "龍血求麗潔顏慕絲 + 龍血求麗卸妝油 1+1組",
    category: "組合價",
    series: "保養套組",
    originalPrice: "原價待補",
    price: "1+1 兩瓶 $ 1,080",
    image: "/products/wash11.png",
    description: "龍血求麗潔顏慕絲150mL + 龍血求麗卸妝油150mL，各1瓶，共2瓶。",
  },

  {
    id: 102,
    name: "糖肽中膠囊",
    category: "外部廠商",
    series: "生福科技",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "生福科技品項。",
  },
  {
    id: 103,
    name: "柔焦濾鏡CC霜",
    category: "保養品",
    series: "防曬",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/cc 0.jpg",
    description: "30mL。防曬 / 潤色品項。",
  },
  {
    id: 104,
    name: "綠茶多酚保濕平衡精華液",
    category: "保養品",
    series: "綠茶多酚保濕平衡系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/tee 2.jpg",
    description: "30mL。綠茶多酚保濕平衡系列。",
  },
  {
    id: 105,
    name: "綠茶多酚保濕平衡面膜",
    category: "保養品",
    series: "綠茶多酚保濕平衡系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/tee 5.jpg",
    description: "20mL x 5片 / 盒。綠茶多酚保濕平衡系列。",
  },
  {
    id: 106,
    name: "白金密集煥白淡斑筆",
    category: "保養品",
    series: "白金密集煥白系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Dark Spot Eraser.jpg",
    description: "白金密集煥白系列。",
  },
  {
    id: 107,
    name: "賽洛美潤膚美體油(C+E)",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Ceramide Body Oil (C+E).jpg",
    description: "頂級養護品項。",
  },
  {
    id: 108,
    name: "24小時賦活液",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/24H Revitalizing Essence.jpg",
    description: "頂級養護品項。",
  },
  {
    id: 109,
    name: "鉑金無痕煥白雙導精華",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Platinum.jpg",
    description: "頂級養護品項。",
  },
  {
    id: 110,
    name: "黑耀緊緻奢華眼霜",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Obsidian Firming Luxury Eye Cream.jpg",
    description: "頂級養護品項。",
  },
  {
    id: 111,
    name: "24小時黃金璀璨賦活液",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/24K Gold.jpg",
    description: "頂級養護品項。",
  },
  {
    id: 112,
    name: "大猩猩紅酒架",
    category: "外部廠商",
    series: "木匠兄妹",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "木匠兄妹品項。",
  },
  {
    id: 113,
    name: "親子DIY 小花椅",
    category: "外部廠商",
    series: "木匠兄妹",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "居家體驗品項，固碳量 6426 克。",
  },
  {
    id: 114,
    name: "CARPENTER 漢堡杯墊",
    category: "外部廠商",
    series: "木匠兄妹",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "固碳量 437 克。",
  },
  {
    id: 115,
    name: "CARPENTER 法藍獅時計",
    category: "外部廠商",
    series: "木匠兄妹",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "固碳量 280 克。",
  },

  {
    id: 116,
    name: "水光苦杏仁酸慕絲",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/glassskin 0.jpg",
    description: "水光肌能系列品項。",
  },
  {
    id: 117,
    name: "時光瑞亞淡香水",
    category: "香水",
    series: "香水",
    originalPrice: "牌價 $ 790",
    price: "產地價待補",
    image: "/products/perpul smell.jpg",
    description: "30mL。香水品項，效期至 2027/03/05。",
  },
  {
    id: 118,
    name: "超導水網瞬效面膜",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/super water.png",
    description: "頂級養護面膜品項。",
  },
  {
    id: 119,
    name: "冰河淨化柔膚面膜",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Glacial 5.jpg",
    description: "100mL。頂級養護 / 冰河淨化面膜品項。",
  },
  {
    id: 120,
    name: "Exo-雙粹秘泌凍晶組",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Plant Exosome.jpg",
    description: "頂級養護品項。",
  },
  {
    id: 121,
    name: "奧勒岡小白花美體乳",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/smell white.jpg",
    description: "500mL。頂級養護身體保養品項。",
  },
  {
    id: 122,
    name: "肌光緊緻速妍面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價 $ 3,680",
    price: "產地價待補",
    image: "/products/Radiance and Lifting5.jpg",
    description: "肌光緊緻速妍系列面膜。",
  },
  {
    id: 123,
    name: "INSK乳酸平衡水嫩膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價 $ 1,280",
    price: "產地價待補",
    image: "/products/INSK5.jpg",
    description: "23mL x 6片 / 盒。INSK乳酸平衡系列面膜。",
  },
  {
    id: 124,
    name: "水搖滾保濕面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/DBMUSK 5.jpg",
    description: "22mL x 5pcs。",
  },
  {
    id: 125,
    name: "水搖滾保濕面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/water 5.jpg",
    description: "22mL x 10pcs。",
  },
  {
    id: 126,
    name: "水搖滾保濕面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/water 35.png",
    description: "22mL x 35pcs。",
  },
  {
    id: 127,
    name: "極光白美白面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/DBMUSK 5 W.jpg",
    description: "x 5pcs。",
  },
  {
    id: 128,
    name: "極光白美白面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/white 35.png",
    description: "x 35pcs。",
  },
  {
    id: 129,
    name: "冰河淨化柔膚面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/Glacial 5.jpg",
    description: "100mL。冰河淨化系列面膜。",
  },
  {
    id: 130,
    name: "鳳梨酵素活膚面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/pineapple 5.jpg",
    description: "22mL x 5pcs。鳳梨酵素系列面膜。",
  },
  {
    id: 131,
    name: "綠茶多酚保濕平衡面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/tee 5.jpg",
    description: "20mL x 5片 / 盒。綠茶多酚保濕平衡系列面膜。",
  },
  {
    id: 132,
    name: "超導水網瞬效面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/super water.png",
    description: "頂級養護面膜品項。",
  },

  {
    id: 133,
    name: "蛋白纖維營養餐",
    category: "外部廠商",
    series: "倍力工房",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/meel2.png",
    description: "倍力工房品項。蛋白纖維營養餐。",
  },
  {
    id: 134,
    name: "固硒力-遠紅外線舒緩貼布",
    category: "外部廠商",
    series: "倍力工房",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/plus patch.jpg",
    description: "倍力工房品項。遠紅外線舒緩貼布。",
  },
  {
    id: 135,
    name: "龍血手工皂任選4款",
    category: "組合價",
    series: "肥皂組合",
    originalPrice: "原價待補",
    price: "任選4款 $ 799",
    image: "/products/bdsoap.png",
    description: "龍血檀香靜心皂 / 龍血艾草保庇皂 / 龍血玫瑰美膚皂 / 龍血檸檬馬鞭草皂 / 龍血薰衣草舒緩皂可任選，共4款。",
  },
  {
    id: 136,
    name: "櫻の雪傳明酸美白精華液 + 美白乳液贈化妝水",
    category: "組合價",
    series: "保養套組",
    originalPrice: "原價待補",
    price: "組合價 $ 1,780",
    image: "/products/su2+1.png",
    description: "購買櫻の雪傳明酸美白精華液30mL + 櫻の雪傳明酸美白乳液100mL，贈送櫻の雪傳明酸美白化妝水150mL。",
  },
  {
    id: 137,
    name: "龍血潔顏慕絲 / 櫻の雪潔顏慕絲任選2瓶",
    category: "組合價",
    series: "保養套組",
    originalPrice: "原價待補",
    price: "任選2瓶 $ 980",
    image: "/products/db+su1+1.png",
    description: "龍血求麗潔顏慕絲150mL / 櫻の雪淨白潔顏慕絲150mL 可任選搭配，共2瓶。",
  },
  {
    id: 138,
    name: "亮妍魚膠原蛋白飲兩盒贈 EC 晶眸葉黃素",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價待補",
    price: "組合價 $ 4,400",
    image: "/products/bb2+1.png",
    description: "亮妍魚膠原蛋白飲-玫瑰風味 50mL/10入 共兩盒，贈 EC 晶眸葉黃素精華凍+精華飲綜合組。",
  },
  {
    id: 139,
    name: "龍血洗髮精 + 阿甘養髮液 1+1組",
    category: "組合價",
    series: "洗沐組合",
    originalPrice: "原價待補",
    price: "1+1 $ 1,500",
    image: "/products/hair1+1.png",
    description: "龍血求麗頭皮修護洗髮精 600mL + 阿甘甦醒髮根養護液 80mL，各1瓶，共2瓶。",
  },
  {
    id: 140,
    name: "時光瑞亞淡香水贈櫻の雪亮澤護手霜",
    category: "組合價",
    series: "香氛組合",
    originalPrice: "牌價 $ 790",
    price: "組合價 $ 780",
    image: "/products/perfumehandcream.png",
    description: "時光瑞亞淡香水30mL，效期至2027/03/05，贈價值290元櫻の雪亮澤護手霜JDST 30g。",
  },
  {
    id: 143,
    name: "梅托洛買一送二",
    category: "組合價",
    series: "生福科技組合",
    originalPrice: "原價待補",
    price: "買一送二 $ 3,600",
    image: "/products/matolo1+2.png",
    description: "梅托洛買1送2，共3入組合，規格依商品標示。",
  },


];



const productContentOverrides: Record<number, Partial<Product>> = {
  // 商品資訊頁正式文案放這裡。
  // 每一個商品 ID 都有自己的可編輯區塊；要改商品介紹、特色、使用方式、注意事項、效期，直接搜尋商品名稱或商品 ID。
  // 價格仍以 products 商品資料中的 price / originalPrice 為主。
  1: {
    cardName: "BC-CA複合益生菌高鈣活力配方",
    cardSubtitle: "3g x 30包 / 盒・益生菌系列",
    spec: "3g x 30包 / 盒",
    intro: "BC-CA複合益生菌高鈣活力配方為益生菌系列品項，適合作為日常保健與營養補給參考。",
    features: [
      "適合作為日常保健與營養補給參考。",
      "可加入清單後由 LINE 客服協助確認優惠與庫存。",
      "實際食用方式請依商品標示或客服說明為準。",
    ],
    suitableFor: [
      "日常保健",
      "益生菌補給",
    ],
    usage: "每日建議依產品標示或客服說明食用。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  2: {
    cardName: "蔓越莓益生菌",
    cardSubtitle: "3g x 30包 / 盒・益生菌系列",
    spec: "3g x 30包 / 盒",
    intro: "蔓越莓益生菌速酵力配方為益生菌系列品項，適合作為日常保健與營養補給參考。",
    features: [
      "適合作為日常保健與營養補給參考。",
      "可加入清單後由 LINE 客服協助確認優惠與庫存。",
      "實際食用方式請依商品標示或客服說明為準。",
    ],
    suitableFor: [
      "日常保健",
      "益生菌補給",
    ],
    usage: "每日建議依產品標示或客服說明食用。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  3: {
    cardName: "BC-HA 複合益生菌",
    cardSubtitle: "60包大容量・日常消化道保養",
    spec: "3g x 60包 / 盒",
    intro: "BC-HA 複合益生菌為日常保健補給品項，適合作為日常營養補充。",
    features: [
      "大容量 60 包設計，適合作為日常保健補給。",
      "複合益生菌配方，協助維持消化道機能。",
      "可加入清單後由 LINE 客服協助確認優惠組合與庫存。",
    ],
    suitableFor: [
      "日常保健",
      "益生菌補給",
      "消化道機能",
    ],
    usage: "每日建議依產品標示或客服說明食用。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  4: {
    cardName: "EC晶眸葉黃素",
    cardSubtitle: "精華凍 + 精華飲綜合組・晶眸保健系列",
    spec: "精華凍 + 精華飲綜合組",
    intro: "EC晶眸葉黃素為晶眸保健系列品項，適合作為日常保健與營養補給參考。",
    features: [
      "適合作為日常保健與營養補給參考。",
      "可加入清單後由 LINE 客服協助確認優惠與庫存。",
      "實際食用方式請依商品標示或客服說明為準。",
    ],
    suitableFor: [
      "日常保健",
      "晶眸保健",
    ],
    usage: "每日建議依產品標示或客服說明食用。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  5: {
    cardName: "亮妍魚膠原蛋白飲",
    cardSubtitle: "美妍保健飲品・美妍飲品系列",
    spec: "美妍保健飲品",
    intro: "亮妍魚膠原蛋白飲為美妍飲品系列品項，適合作為日常保健與營養補給參考。",
    features: [
      "適合作為日常保健與營養補給參考。",
      "可加入清單後由 LINE 客服協助確認優惠與庫存。",
      "實際食用方式請依商品標示或客服說明為準。",
    ],
    suitableFor: [
      "日常保健",
      "美容補給",
    ],
    usage: "每日建議依產品標示或客服說明食用。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  6: {
    cardName: "薰衣草肌安舒緩化妝水",
    cardSubtitle: "150mL・薰衣草系列",
    spec: "150mL",
    intro: "薰衣草肌安舒緩化妝水為薰衣草系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合清潔後作為保養前導使用。",
      "可依膚況搭配同系列精華、乳液或乳霜。",
      "協助建立日常保養基礎步驟。",
    ],
    suitableFor: [
      "薰衣草系列",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  7: {
    cardName: "薰衣草肌安舒緩精華液",
    cardSubtitle: "30mL・薰衣草系列",
    spec: "30mL",
    intro: "薰衣草肌安舒緩精華液為薰衣草系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合作為日常保養中的加強型品項。",
      "可依需求搭配化妝水與乳霜使用。",
      "適合想加強特定保養需求的客人。",
    ],
    suitableFor: [
      "薰衣草系列",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  8: {
    cardName: "薰衣草肌安舒緩保濕乳",
    cardSubtitle: "100mL・薰衣草系列",
    spec: "100mL",
    intro: "薰衣草肌安舒緩保濕乳為薰衣草系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  9: {
    cardName: "冷杉潔顏乳",
    cardSubtitle: "120mL・冷杉系列",
    spec: "120mL",
    intro: "冷杉型男淨化潔顏乳為冷杉系列清潔保養品項，適合日常清潔與保養前使用。",
    features: [
      "適合日常清潔、卸妝或保養前的潔膚步驟。",
      "可依膚況搭配同系列保養品使用。",
      "洗卸清潔後再進行後續保養，保養流程更完整。",
    ],
    suitableFor: [
      "清潔卸妝",
      "男士保養",
    ],
    usage: "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  10: {
    cardName: "冷杉保濕化妝水",
    cardSubtitle: "150mL・即期出清・單瓶 $199",
    spec: "150mL",
    intro: "冷杉型男淨化保濕化妝水為冷杉系列清爽保濕品項，目前為單瓶 $199 即期出清。",
    features: [
      "即期出清單瓶 $199，適合想補充清爽保濕品項的客人。",
      "清爽水感質地，適合男士日常保養使用。",
      "即期優惠品項，實際效期請以 LINE 客服確認為準。",
    ],
    suitableFor: [
      "即期出清",
      "男士保養",
      "清爽保濕",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "即期商品售出前會由客服協助確認效期。使用後若有不適，請暫停使用。",
    expiryNote: "此為即期出清品項，實際效期請以 LINE 客服確認為準。",
    priceNote: "即期出清單瓶 $199，庫存與效期依 LINE 客服確認為準。",
  },

  11: {
    cardName: "冷杉保濕乳",
    cardSubtitle: "100mL・即期出清・單瓶 $199",
    spec: "100mL",
    intro: "冷杉型男淨化保濕乳為冷杉系列清爽保濕品項，目前為單瓶 $199 即期出清。",
    features: [
      "即期出清單瓶 $199，適合想補充清爽保濕品項的客人。",
      "乳液質地可作為日常保濕步驟，適合男士簡單保養。",
      "即期優惠品項，實際效期請以 LINE 客服確認為準。",
    ],
    suitableFor: [
      "即期出清",
      "男士保養",
      "清爽保濕",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部與頸部。",
    notice: "即期商品售出前會由客服協助確認效期。使用後若有不適，請暫停使用。",
    expiryNote: "此為即期出清品項，實際效期請以 LINE 客服確認為準。",
    priceNote: "即期出清單瓶 $199，庫存與效期依 LINE 客服確認為準。",
  },

  12: {
    cardName: "冷杉酷涼活絡精油滾珠",
    cardSubtitle: "9mL・冷杉系列",
    spec: "9mL",
    intro: "冷杉酷涼活絡精油滾珠為冷杉系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 客服協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "男士保養",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  13: {
    cardName: "玫瑰潔顏慕絲",
    cardSubtitle: "150mL・玫瑰超微晶萃系列",
    spec: "150mL",
    intro: "玫瑰超微晶萃潔顏慕絲為玫瑰超微晶萃系列清潔保養品項，適合日常清潔與保養前使用。",
    features: [
      "適合日常清潔、卸妝或保養前的潔膚步驟。",
      "可依膚況搭配同系列保養品使用。",
      "洗卸清潔後再進行後續保養，保養流程更完整。",
    ],
    suitableFor: [
      "清潔卸妝",
      "乾燥缺水",
    ],
    usage: "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  14: {
    cardName: "玫瑰活膚液",
    cardSubtitle: "130mL・玫瑰超微晶萃系列",
    spec: "130mL",
    intro: "玫瑰超微晶萃活膚液為玫瑰超微晶萃系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合清潔後作為保養前導使用。",
      "可依膚況搭配同系列精華、乳液或乳霜。",
      "協助建立日常保養基礎步驟。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  15: {
    cardName: "玫瑰瞬效乳",
    cardSubtitle: "130mL・玫瑰超微晶萃系列",
    spec: "130mL",
    intro: "玫瑰超微晶萃瞬效乳為玫瑰超微晶萃系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  16: {
    cardName: "玫瑰瞬效霜",
    cardSubtitle: "50g・滋潤修護・細緻保養",
    spec: "50g",
    intro: "玫瑰超微晶萃瞬效霜為滋潤型保養品項，適合作為日常保養最後一道使用。",
    features: [
      "滋潤霜狀質地，適合日常保濕與修護保養。",
      "可作為保養程序最後一道，幫助維持肌膚潤澤感。",
      "適合偏乾、想加強滋潤度的保養需求。",
    ],
    suitableFor: [
      "乾燥缺水",
      "滋潤修護",
      "日常保養",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠依 LINE 客服確認為準。",
  },
  17: {
    cardName: "龍血化妝水",
    cardSubtitle: "龍血系列保養品・龍血系列",
    spec: "龍血系列保養品",
    intro: "龍血求麗化妝水為龍血系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合清潔後作為保養前導使用。",
      "可依膚況搭配同系列精華、乳液或乳霜。",
      "協助建立日常保養基礎步驟。",
    ],
    suitableFor: [
      "龍血系列",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  18: {
    cardName: "龍血精華液",
    cardSubtitle: "龍血系列保養品・龍血系列",
    spec: "龍血系列保養品",
    intro: "龍血精華液為龍血系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合作為日常保養中的加強型品項。",
      "可依需求搭配化妝水與乳霜使用。",
      "適合想加強特定保養需求的客人。",
    ],
    suitableFor: [
      "龍血系列",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  19: {
    cardName: "龍血修護乳",
    cardSubtitle: "龍血系列保養品・龍血系列",
    spec: "龍血系列保養品",
    intro: "龍血求麗修護乳為龍血系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "龍血系列",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  20: {
    cardName: "龍血修護霜",
    cardSubtitle: "龍血系列保養品・龍血系列",
    spec: "龍血系列保養品",
    intro: "龍血求麗修護霜為龍血系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "龍血系列",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  21: {
    cardName: "肌光緊緻速妍雪膚液",
    cardSubtitle: "肌光緊緻速妍系列・肌光緊緻速妍系列",
    spec: "肌光緊緻速妍系列",
    intro: "肌光緊緻速妍雪膚液為肌光緊緻速妍系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合清潔後作為保養前導使用。",
      "可依膚況搭配同系列精華、乳液或乳霜。",
      "協助建立日常保養基礎步驟。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  22: {
    cardName: "肌光緊緻速妍精華露",
    cardSubtitle: "肌光緊緻速妍系列・肌光緊緻速妍系列",
    spec: "肌光緊緻速妍系列",
    intro: "肌光緊緻速妍精華露為肌光緊緻速妍系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合作為日常保養中的加強型品項。",
      "可依需求搭配化妝水與乳霜使用。",
      "適合想加強特定保養需求的客人。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  23: {
    cardName: "肌光緊緻速妍霜",
    cardSubtitle: "肌光緊緻速妍系列・肌光緊緻速妍系列",
    spec: "肌光緊緻速妍系列",
    intro: "肌光緊緻速妍霜為肌光緊緻速妍系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  24: {
    cardName: "肌光緊緻速妍面膜",
    cardSubtitle: "肌光緊緻速妍系列・肌光緊緻速妍系列",
    spec: "肌光緊緻速妍系列",
    intro: "肌光緊緻速妍面膜為肌光緊緻速妍系列集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "抗皺緊緻",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  25: {
    cardName: "INSK乳酸平衡機能水",
    cardSubtitle: "INSK乳酸平衡系列・INSK乳酸平衡系列",
    spec: "INSK乳酸平衡系列",
    intro: "INSK乳酸平衡機能水為INSK乳酸平衡系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合清潔後作為保養前導使用。",
      "可依膚況搭配同系列精華、乳液或乳霜。",
      "協助建立日常保養基礎步驟。",
    ],
    suitableFor: [
      "INSK乳酸平衡系列",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  26: {
    cardName: "INSK乳酸平衡修護乳",
    cardSubtitle: "INSK乳酸平衡系列・INSK乳酸平衡系列",
    spec: "INSK乳酸平衡系列",
    intro: "INSK乳酸平衡修護乳為INSK乳酸平衡系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "INSK乳酸平衡系列",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  27: {
    cardName: "BA-5肌密抗皺精華",
    cardSubtitle: "BA-5肌密抗皺系列・BA-5肌密抗皺系列",
    spec: "BA-5肌密抗皺系列",
    intro: "BA-5肌密抗皺精華為BA-5肌密抗皺系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合作為日常保養中的加強型品項。",
      "可依需求搭配化妝水與乳霜使用。",
      "適合想加強特定保養需求的客人。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  28: {
    cardName: "BA-5肌密抗皺霜",
    cardSubtitle: "BA-5肌密抗皺系列・BA-5肌密抗皺系列",
    spec: "BA-5肌密抗皺系列",
    intro: "BA-5肌密抗皺霜為BA-5肌密抗皺系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  29: {
    cardName: "龍血頭皮修護洗髮精",
    cardSubtitle: "龍血洗髮沐浴系列，可搭配活動組合・洗沐系列",
    spec: "龍血洗髮沐浴系列，可搭配活動組合",
    intro: "龍血求麗頭皮修護洗髮精為洗沐系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "洗沐",
      "洗沐系列",
    ],
    usage: "取適量於濕髮或身體肌膚，搓揉清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  30: {
    cardName: "龍血潤澤修護沐浴乳",
    cardSubtitle: "龍血洗髮沐浴系列，可搭配活動組合・洗沐系列",
    spec: "龍血洗髮沐浴系列，可搭配活動組合",
    intro: "龍血求麗潤澤修護沐浴乳為洗沐系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "洗沐",
      "洗沐系列",
    ],
    usage: "取適量於濕髮或身體肌膚，搓揉清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  31: {
    cardName: "純淨洗髮精",
    cardSubtitle: "洗髮品項・洗沐系列",
    spec: "洗髮品項",
    intro: "純淨洗髮精為洗沐系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "洗沐",
      "洗沐系列",
    ],
    usage: "取適量於濕髮或身體肌膚，搓揉清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  32: {
    cardName: "阿甘絲柔洗髮精",
    cardSubtitle: "洗髮品項・洗沐系列",
    spec: "洗髮品項",
    intro: "阿甘絲柔洗髮精為洗沐系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "洗沐",
      "洗沐系列",
    ],
    usage: "取適量於濕髮或身體肌膚，搓揉清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  33: {
    cardName: "INSK乳酸淨痘修護膠",
    cardSubtitle: "15mL・INSK乳酸平衡系列",
    spec: "15mL",
    intro: "INSK乳酸淨痘修護膠為INSK乳酸平衡系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "INSK乳酸平衡系列",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  34: {
    cardName: "INSK乳酸平衡水嫩膜",
    cardSubtitle: "23mL x 6片 / 盒・INSK乳酸平衡系列",
    spec: "23mL x 6片 / 盒",
    intro: "INSK乳酸平衡水嫩膜為INSK乳酸平衡系列集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  35: {
    cardName: "薰衣草舒緩牙膏",
    cardSubtitle: "120g・牙膏",
    spec: "120g",
    intro: "齒齦保健薰衣草舒緩牙膏為牙膏日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "牙膏",
    ],
    usage: "取適量刷牙使用，使用後請以清水漱口。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  36: {
    cardName: "龍血修護牙膏",
    cardSubtitle: "120g / 單支・牙膏",
    spec: "120g / 單支",
    intro: "齒齦保健龍血修護牙膏為牙膏日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "牙膏",
    ],
    usage: "取適量刷牙使用，使用後請以清水漱口。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  37: {
    cardName: "智慧之冠",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "智慧之冠為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  38: {
    cardName: "亮采橙真",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "亮采橙真為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  39: {
    cardName: "呼暢護隨",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "呼暢護隨為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  40: {
    cardName: "魔力輕盈",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "魔力輕盈為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  41: {
    cardName: "順暢平衡",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "順暢平衡為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  42: {
    cardName: "心之綻放",
    cardSubtitle: "10mL・10mL 精油系列",
    spec: "10mL",
    intro: "心之綻放為10mL 精油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "10mL 精油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  43: {
    cardName: "青春密碼維 E 精萃油",
    cardSubtitle: "50mL・50mL 精萃油系列",
    spec: "50mL",
    intro: "青春密碼維 E 精萃油為50mL 精萃油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "50mL 精萃油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  44: {
    cardName: "防護盾牌維 C 精萃油",
    cardSubtitle: "50mL・50mL 精萃油系列",
    spec: "50mL",
    intro: "防護盾牌維 C 精萃油為50mL 精萃油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "50mL 精萃油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  45: {
    cardName: "晚安無瑕維 A 精萃油",
    cardSubtitle: "50mL・50mL 精萃油系列",
    spec: "50mL",
    intro: "晚安無瑕維 A 精萃油為50mL 精萃油系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "50mL 精萃油系列",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  46: {
    cardName: "高頻霧化香薰機",
    cardSubtitle: "擴香設備・擴香設備",
    spec: "擴香設備",
    intro: "高頻霧化香薰機為擴香設備日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常香氛、放鬆或空間氛圍搭配使用。",
      "使用前請依產品標示與適用方式操作。",
      "精油類商品請避免直接接觸眼周與敏感部位。",
    ],
    suitableFor: [
      "精油",
      "擴香設備",
    ],
    usage: "請依商品標示方式使用，可搭配擴香設備或依客服建議使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠與庫存依 LINE 客服確認為準。",
  },
  47: {
    cardName: "石墨烯電氣石精油貼布(涼感)",
    cardSubtitle: "商品敘述・貼布",
    spec: "商品敘述",
    intro: "石墨烯電氣石精油貼布(涼感)為貼布精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "貼布",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  48: {
    cardName: "石墨烯電氣石精油貼布(溫感)",
    cardSubtitle: "商品敘述・貼布",
    spec: "商品敘述",
    intro: "石墨烯電氣石精油貼布(溫感)為貼布精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "貼布",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  49: {
    cardName: "茶樹K痘精華",
    cardSubtitle: "8mL / 盒・茶樹控油系列",
    spec: "8mL / 盒",
    intro: "茶樹K痘精華為茶樹控油系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合作為日常保養中的加強型品項。",
      "可依需求搭配化妝水與乳霜使用。",
      "適合想加強特定保養需求的客人。",
    ],
    suitableFor: [
      "油性毛孔",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  50: {
    cardName: "茶樹控油化妝水",
    cardSubtitle: "150mL・茶樹控油系列",
    spec: "150mL",
    intro: "茶樹控油化妝水為茶樹控油系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合清潔後作為保養前導使用。",
      "可依膚況搭配同系列精華、乳液或乳霜。",
      "協助建立日常保養基礎步驟。",
    ],
    suitableFor: [
      "油性毛孔",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  51: {
    cardName: "茶樹控油保濕乳",
    cardSubtitle: "100mL・茶樹控油系列",
    spec: "100mL",
    intro: "茶樹控油保濕乳為茶樹控油系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "乾燥缺水",
      "油性毛孔",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  52: {
    cardName: "肌可佳膠原蛋白彈潤原液",
    cardSubtitle: "30mL・膠原蛋白系列",
    spec: "30mL",
    intro: "肌可佳膠原蛋白彈潤原液為膠原蛋白系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 客服協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  53: {
    cardName: "龍血玻尿酸保濕精華液",
    cardSubtitle: "龍血系列保養品・龍血系列",
    spec: "龍血系列保養品",
    intro: "龍血玻尿酸保濕精華液為龍血系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合作為日常保養中的加強型品項。",
      "可依需求搭配化妝水與乳霜使用。",
      "適合想加強特定保養需求的客人。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  54: {
    cardName: "龍血卸妝油",
    cardSubtitle: "150mL・龍血系列",
    spec: "150mL",
    intro: "龍血求麗卸妝油為龍血系列清潔保養品項，適合日常清潔與保養前使用。",
    features: [
      "適合日常清潔、卸妝或保養前的潔膚步驟。",
      "可依膚況搭配同系列保養品使用。",
      "洗卸清潔後再進行後續保養，保養流程更完整。",
    ],
    suitableFor: [
      "清潔卸妝",
    ],
    usage: "取適量於乾手或依商品標示方式使用，輕柔按摩後再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  55: {
    cardName: "龍血潔顏慕絲",
    cardSubtitle: "150mL・溫和潔淨・洗後清爽",
    spec: "150mL",
    intro: "龍血求麗潔顏慕絲為龍血系列清潔品項，適合日常潔顏與保養前清潔使用。",
    features: [
      "細緻慕絲質地，溫和帶走肌膚髒污。",
      "適合日常清潔與保養前的潔顏步驟。",
      "可與龍血卸妝油搭配，作為洗卸清潔組合。",
    ],
    suitableFor: [
      "清潔卸妝",
      "日常潔顏",
      "龍血系列",
    ],
    usage: "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，若不慎入眼請以清水沖洗。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "若有組合價活動，客服會協助確認最適合的優惠方案。",
  },
  56: {
    cardName: "水搖滾保濕面膜",
    cardSubtitle: "22mL x 5pcs・龍血系列",
    spec: "22mL x 5pcs",
    intro: "水搖滾保濕面膜為龍血系列集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  57: {
    cardName: "水搖滾保濕面膜",
    cardSubtitle: "22mL x 10pcs・龍血系列",
    spec: "22mL x 10pcs",
    intro: "水搖滾保濕面膜為龍血系列集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  58: {
    cardName: "水搖滾保濕面膜",
    cardSubtitle: "22mL x 35pcs・龍血系列",
    spec: "22mL x 35pcs",
    intro: "水搖滾保濕面膜為龍血系列集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  59: {
    cardName: "極光白美白面膜",
    cardSubtitle: "x 5pcs・龍血系列",
    spec: "x 5pcs",
    intro: "極光白美白面膜為龍血系列集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "美白淡斑",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  60: {
    cardName: "極光白美白面膜",
    cardSubtitle: "x 35pcs・龍血系列",
    spec: "x 35pcs",
    intro: "極光白美白面膜為龍血系列集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "美白淡斑",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  61: {
    cardName: "水光肌能化妝水",
    cardSubtitle: "140mL・水光肌能系列",
    spec: "140mL",
    intro: "水光肌能化妝水為水光肌能系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合清潔後作為保養前導使用。",
      "可依膚況搭配同系列精華、乳液或乳霜。",
      "協助建立日常保養基礎步驟。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  62: {
    cardName: "水光肌能乳液",
    cardSubtitle: "130mL・水光肌能系列",
    spec: "130mL",
    intro: "水光肌能乳液為水光肌能系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  63: {
    cardName: "水光肌能晚霜",
    cardSubtitle: "50mL・水光肌能系列",
    spec: "50mL",
    intro: "水光肌能晚霜為水光肌能系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  64: {
    cardName: "苦杏仁酸溫和煥顏露",
    cardSubtitle: "30mL・杏仁酸系列",
    spec: "30mL",
    intro: "苦杏仁酸溫和煥顏露為杏仁酸系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 客服協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "油性毛孔",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  65: {
    cardName: "冰河淨化潔顏慕絲",
    cardSubtitle: "150mL・冰河淨化系列",
    spec: "150mL",
    intro: "冰河淨化潔顏慕絲為冰河淨化系列清潔保養品項，適合日常清潔與保養前使用。",
    features: [
      "適合日常清潔、卸妝或保養前的潔膚步驟。",
      "可依膚況搭配同系列保養品使用。",
      "洗卸清潔後再進行後續保養，保養流程更完整。",
    ],
    suitableFor: [
      "清潔卸妝",
      "油性毛孔",
    ],
    usage: "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  66: {
    cardName: "冰河淨化淨膚露",
    cardSubtitle: "120mL・冰河淨化系列",
    spec: "120mL",
    intro: "冰河淨化淨膚露為冰河淨化系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 客服協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "油性毛孔",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  67: {
    cardName: "冰河淨化柔膚面膜",
    cardSubtitle: "100mL・冰河淨化系列",
    spec: "100mL",
    intro: "【新品】冰河淨化柔膚面膜為冰河淨化系列集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "油性毛孔",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  68: {
    cardName: "晶淬雪潤白乳",
    cardSubtitle: "100mL・晶淬雪系列",
    spec: "100mL",
    intro: "晶淬雪潤白乳為晶淬雪系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "美白淡斑",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  69: {
    cardName: "鳳梨酵素代謝角質凝露",
    cardSubtitle: "120g・鳳梨酵素系列",
    spec: "120g",
    intro: "鳳梨酵素代謝角質凝露為鳳梨酵素系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 客服協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "清潔卸妝",
      "油性毛孔",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  70: {
    cardName: "鳳梨酵素活膚面膜",
    cardSubtitle: "22mL x 5pcs・鳳梨酵素系列",
    spec: "22mL x 5pcs",
    intro: "鳳梨酵素活膚面膜為鳳梨酵素系列集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "油性毛孔",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  71: {
    cardName: "櫻の雪潔顏慕絲",
    cardSubtitle: "150mL・溫和潔淨・亮白前導",
    spec: "150mL",
    intro: "櫻の雪淨白潔顏慕絲為櫻の雪傳明酸美白系列潔顏品，適合作為亮白保養前的清潔步驟。",
    features: [
      "細緻慕絲質地，溫和帶走肌膚髒污。",
      "適合日常清潔與亮白保養前使用。",
      "洗後膚觸清爽，適合搭配櫻の雪系列保養。",
    ],
    suitableFor: [
      "清潔卸妝",
      "美白淡斑",
      "日常潔顏",
    ],
    usage: "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，若不慎入眼請以清水沖洗。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "實際優惠依 LINE 客服確認為準。",
  },
  72: {
    cardName: "櫻の雪美白化妝水",
    cardSubtitle: "150mL・櫻の雪傳明酸美白系列",
    spec: "150mL",
    intro: "櫻の雪傳明酸美白化妝水為櫻の雪傳明酸美白系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合清潔後作為保養前導使用。",
      "可依膚況搭配同系列精華、乳液或乳霜。",
      "協助建立日常保養基礎步驟。",
    ],
    suitableFor: [
      "美白淡斑",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },  141: {
    cardName: "櫻の雪美白精華液",
    cardSubtitle: "30mL・櫻の雪傳明酸美白系列",
    spec: "30mL",
    intro: "櫻の雪傳明酸美白精華液為亮白保養加強型品項，可搭配同系列化妝水與乳液使用。",
    features: [
      "適合作為日常亮白保養中的精華步驟。",
      "可搭配櫻の雪傳明酸美白化妝水與乳液使用。",
      "亦可搭配精華液 + 乳液贈化妝水組合活動。",
    ],
    suitableFor: [
      "美白淡斑",
      "櫻の雪系列",
      "組合優惠",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "可搭配櫻の雪美白組合；庫存與效期依 LINE 小幫手確認為準。",
  },
  142: {
    cardName: "櫻の雪美白乳液",
    cardSubtitle: "100mL・櫻の雪傳明酸美白系列",
    spec: "100mL",
    intro: "櫻の雪傳明酸美白乳液為亮白保養中的保濕乳液步驟，可搭配同系列化妝水與精華液使用。",
    features: [
      "適合作為日常亮白保養中的乳液步驟。",
      "可搭配櫻の雪傳明酸美白化妝水與精華液使用。",
      "亦可搭配精華液 + 乳液贈化妝水組合活動。",
    ],
    suitableFor: [
      "美白淡斑",
      "櫻の雪系列",
      "組合優惠",
    ],
    usage: "精華液後取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "可搭配櫻の雪美白組合；庫存與效期依 LINE 小幫手確認為準。",
  },

  73: {
    cardName: "能量牛樟芝保健潔口液",
    cardSubtitle: "生福科技品項・生福科技",
    spec: "生福科技品項",
    intro: "能量牛樟芝保健潔口液為生福科技精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "生福科技",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  74: {
    cardName: "挪威 EPAX 高活性 rTG 魚油軟膠囊",
    cardSubtitle: "生福科技品項・生福科技",
    spec: "生福科技品項",
    intro: "挪威 EPAX 高活性 rTG 魚油軟膠囊為生福科技精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "生福科技",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  75: {
    cardName: "櫻の雪亮澤護手霜",
    cardSubtitle: "JDST 30g・價值 $290",
    spec: "JDST 30g",
    intro: "櫻の雪亮澤護手霜為日常手部保養品項，可搭配時光瑞亞淡香水組合活動。",
    features: [
      "30g 護手霜，適合日常手部保養。",
      "可作為時光瑞亞淡香水組合活動搭配品。",
      "商品效期與庫存依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "護手霜",
      "香氛組合",
      "組合優惠",
    ],
    usage: "取適量塗抹於手部肌膚，可依乾燥程度重複使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "可搭配時光瑞亞淡香水組合活動；庫存與效期依 LINE 小幫手確認為準。",
  },

  76: {
    cardName: "茶樹防禦護手霜",
    cardSubtitle: "30mL・護手霜",
    spec: "30mL",
    intro: "茶樹防禦護手霜為護手霜日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "護手霜",
    ],
    usage: "取適量塗抹於手部肌膚，可依乾燥程度重複使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  77: {
    cardName: "薰衣草舒緩護手霜",
    cardSubtitle: "30mL・護手霜",
    spec: "30mL",
    intro: "薰衣草舒緩護手霜為護手霜日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "護手霜",
    ],
    usage: "取適量塗抹於手部肌膚，可依乾燥程度重複使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  78: {
    cardName: "麝香棉花香氛護手霜",
    cardSubtitle: "30g・護手霜",
    spec: "30g",
    intro: "麝香棉花香氛護手霜為護手霜日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "護手霜",
    ],
    usage: "取適量塗抹於手部肌膚，可依乾燥程度重複使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  79: {
    cardName: "龍血玫瑰美膚皂",
    cardSubtitle: "200g±10g・任選4款 $799",
    spec: "200g±10g / 顆",
    intro: "龍血玫瑰美膚皂為龍血手工皂品項，可搭配任選4款 $799 活動。",
    features: [
      "龍血手工皂系列，適合日常清潔使用。",
      "可與其他龍血手工皂搭配任選4款活動。",
      "任選4款 $799，庫存與效期依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "日常清潔",
      "肥皂",
      "組合優惠",
    ],
    usage: "加水搓揉起泡後清潔肌膚，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "龍血手工皂可任選4款 $799；庫存與效期依 LINE 客服確認為準。",
  },

  80: {
    cardName: "龍血艾草保庇皂",
    cardSubtitle: "200g±10g・任選4款 $799",
    spec: "200g±10g / 顆",
    intro: "龍血艾草保庇皂為龍血手工皂品項，可搭配任選4款 $799 活動。",
    features: [
      "龍血手工皂系列，適合日常清潔使用。",
      "可與其他龍血手工皂搭配任選4款活動。",
      "任選4款 $799，庫存與效期依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "日常清潔",
      "肥皂",
      "組合優惠",
    ],
    usage: "加水搓揉起泡後清潔肌膚，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "龍血手工皂可任選4款 $799；庫存與效期依 LINE 客服確認為準。",
  },

  81: {
    cardName: "龍血檸檬馬鞭草皂",
    cardSubtitle: "200g±10g・任選4款 $799",
    spec: "200g±10g / 顆",
    intro: "龍血檸檬馬鞭草皂為龍血手工皂品項，可搭配任選4款 $799 活動。",
    features: [
      "龍血手工皂系列，適合日常清潔使用。",
      "可與其他龍血手工皂搭配任選4款活動。",
      "任選4款 $799，庫存與效期依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "日常清潔",
      "肥皂",
      "組合優惠",
    ],
    usage: "加水搓揉起泡後清潔肌膚，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "龍血手工皂可任選4款 $799；庫存與效期依 LINE 客服確認為準。",
  },

  82: {
    cardName: "龍血薰衣草舒緩皂",
    cardSubtitle: "200g±10g・任選4款 $799",
    spec: "200g±10g / 顆",
    intro: "龍血薰衣草舒緩皂為龍血手工皂品項，可搭配任選4款 $799 活動。",
    features: [
      "龍血手工皂系列，適合日常清潔使用。",
      "可與其他龍血手工皂搭配任選4款活動。",
      "任選4款 $799，庫存與效期依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "日常清潔",
      "肥皂",
      "組合優惠",
    ],
    usage: "加水搓揉起泡後清潔肌膚，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "龍血手工皂可任選4款 $799；庫存與效期依 LINE 客服確認為準。",
  },

  83: {
    cardName: "高鈣益生菌 11盒組",
    cardSubtitle: "BC-CA複合益生菌高鈣活力配方 11盒・保健食品組合",
    spec: "BC-CA複合益生菌高鈣活力配方 11盒",
    intro: "高鈣益生菌 11盒組為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出清單後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
      "益生菌補給",
    ],
    usage: "組合品項請加入清單，送出後由 LINE 客服協助確認組合內容、數量與優惠。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  84: {
    cardName: "高鈣益生菌6盒 + 蔓越莓益生菌5盒",
    cardSubtitle: "BC-CA高鈣益生菌 6盒 + 蔓越莓益生菌 5盒・保健食品組合",
    spec: "BC-CA高鈣益生菌 6盒 + 蔓越莓益生菌 5盒",
    intro: "高鈣益生菌6盒 + 蔓越莓益生菌5盒為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出清單後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
      "益生菌補給",
    ],
    usage: "組合品項請加入清單，送出後由 LINE 客服協助確認組合內容、數量與優惠。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  85: {
    cardName: "蔓越莓益生菌10盒 + 高鈣益生菌1盒",
    cardSubtitle: "蔓越莓益生菌 10盒 + BC-CA高鈣益生菌 1盒・保健食品組合",
    spec: "蔓越莓益生菌 10盒 + BC-CA高鈣益生菌 1盒",
    intro: "蔓越莓益生菌10盒 + 高鈣益生菌1盒為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出清單後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
      "益生菌補給",
    ],
    usage: "組合品項請加入清單，送出後由 LINE 客服協助確認組合內容、數量與優惠。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  86: {
    cardName: "石墨烯電氣石精油貼布任選4盒",
    cardSubtitle: "涼感 / 溫感可任選搭配，共4盒・貼布組合",
    spec: "涼感 / 溫感可任選搭配，共4盒",
    intro: "石墨烯電氣石精油貼布任選4盒為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出清單後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
    ],
    usage: "組合品項請加入清單，送出後由 LINE 客服協助確認組合內容、數量與優惠。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  87: {
    cardName: "石墨烯電氣石精油貼布任選10盒",
    cardSubtitle: "涼感 / 溫感可任選搭配，共10盒・貼布組合",
    spec: "涼感 / 溫感可任選搭配，共10盒",
    intro: "石墨烯電氣石精油貼布任選10盒為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出清單後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
    ],
    usage: "組合品項請加入清單，送出後由 LINE 客服協助確認組合內容、數量與優惠。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  88: {
    cardName: "牛樟芝潔口液3罐組",
    cardSubtitle: "贈薰衣草牙膏1條・$1,500",
    spec: "能量牛樟芝保健潔口液 3罐 + 齒齦保健薰衣草舒緩牙膏120g 1條",
    intro: "能量牛樟芝保健潔口液 3罐組為生福科技組合優惠，贈齒齦保健薰衣草舒緩牙膏120g 1條。",
    features: [
      "能量牛樟芝保健潔口液 3罐，搭配薰衣草舒緩牙膏1條。",
      "組合價 $1,500，適合日常口腔清潔用品補貨。",
      "組合內容、效期與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "口腔清潔",
      "生福科技",
    ],
    usage: "潔口液與牙膏請依商品標示方式使用。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "3罐潔口液贈薰衣草牙膏1條，組合價 $1,500；庫存與效期依 LINE 客服確認為準。",
  },

  89: {
    cardName: "龍血洗沐任選3瓶",
    cardSubtitle: "龍血洗髮精 / 龍血沐浴乳可自由搭配，共3瓶・洗沐組合",
    spec: "龍血洗髮精 / 龍血沐浴乳可自由搭配，共3瓶",
    intro: "龍血洗沐任選3瓶為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出清單後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
      "龍血系列",
    ],
    usage: "組合品項請加入清單，送出後由 LINE 客服協助確認組合內容、數量與優惠。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  90: {
    cardName: "牙膏任選3條",
    cardSubtitle: "薰衣草舒緩 / 龍血修護可混搭，共3條・牙膏組合",
    spec: "薰衣草舒緩 / 龍血修護可混搭，共3條",
    intro: "齒齦保健牙膏任選3條為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出清單後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
    ],
    usage: "組合品項請加入清單，送出後由 LINE 客服協助確認組合內容、數量與優惠。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  91: {
    cardName: "水搖滾 / 極光白美白面膜桶裝任選組",
    cardSubtitle: "水搖滾保濕面膜22mL x35pcs / 極光白美白面膜 x35pcs 可任選・面膜組合",
    spec: "水搖滾保濕面膜22mL x35pcs / 極光白美白面膜 x35pcs 可任選",
    intro: "水搖滾 / 極光白美白面膜桶裝任選組為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出清單後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
      "面膜保養",
    ],
    usage: "組合品項請加入清單，送出後由 LINE 客服協助確認組合內容、數量與優惠。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },  92: {
    cardName: "EPAX 魚油買一送一",
    cardSubtitle: "買1送1・$1,580",
    spec: "挪威 EPAX 高活性 rTG 魚油軟膠囊買1送1，共2盒，規格依商品標示",
    intro: "挪威 EPAX 高活性 rTG 魚油軟膠囊買一送一為生福科技組合優惠，適合作為日常營養補給參考。",
    features: [
      "買一送一，共2盒，組合價 $1,580。",
      "適合作為日常營養補給參考。",
      "組合內容、效期與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "營養補給",
      "生福科技",
    ],
    usage: "每日建議依產品標示或客服說明食用。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "買一送一 $1,580；庫存與效期依 LINE 客服確認為準。",
  },

  93: {
    cardName: "阿甘甦醒髮根養護液",
    cardSubtitle: "80mL・洗沐系列",
    spec: "80mL",
    intro: "阿甘甦醒髮根養護液為洗沐系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "洗沐",
      "洗沐系列",
    ],
    usage: "取適量於濕髮或身體肌膚，搓揉清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  94: {
    cardName: "龍血檀香靜心皂",
    cardSubtitle: "200g±10g・任選4款 $799",
    spec: "200g±10g / 顆",
    intro: "龍血檀香靜心皂為龍血手工皂品項，可搭配任選4款 $799 活動。",
    features: [
      "龍血手工皂系列，適合日常清潔使用。",
      "可與其他龍血手工皂搭配任選4款活動。",
      "任選4款 $799，庫存與效期依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "日常清潔",
      "肥皂",
      "組合優惠",
    ],
    usage: "加水搓揉起泡後清潔肌膚，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "龍血手工皂可任選4款 $799；庫存與效期依 LINE 客服確認為準。",
  },

  95: {
    cardName: "火炙帶",
    cardSubtitle: "生福科技品項・生福科技",
    spec: "生福科技品項",
    intro: "火炙帶為生福科技精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "生福科技",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  96: {
    cardName: "好亨睡科技毯",
    cardSubtitle: "生福科技品項・生福科技",
    spec: "生福科技品項",
    intro: "好亨睡科技毯為生福科技精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "生福科技",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  97: {
    cardName: "鴕鳥龜鹿土龍精",
    cardSubtitle: "生福科技品項・生福科技",
    spec: "生福科技品項",
    intro: "鴕鳥龜鹿土龍精為生福科技精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "生福科技",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  98: {
    cardName: "EX+ Q18 魚膠原蛋白粉",
    cardSubtitle: "生福科技品項・生福科技",
    spec: "生福科技品項",
    intro: "EX+ Q18 魚膠原蛋白粉為生福科技精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "生福科技",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  99: {
    cardName: "梅托洛",
    cardSubtitle: "生福科技・買一送二 $3,600",
    spec: "規格依商品標示",
    intro: "梅托洛為生福科技精選品項，目前可搭配買一送二組合優惠。",
    features: [
      "梅托洛買一送二，共3入組合。",
      "組合價 $3,600，適合一次補齊常用品項。",
      "商品規格、效期與庫存依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "生福科技",
      "組合優惠",
      "外部廠商",
    ],
    usage: "使用方式依商品標示或 LINE 小幫手說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或小幫手說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "梅托洛買一送二組合價 $3,600；庫存與效期依 LINE 小幫手確認為準。",
  },

  100: {
    cardName: "BC-HA 複合益生菌 2盒組",
    cardSubtitle: "BC-HA 複合益生菌 3g x 60包 / 盒，共2盒・保健食品組合",
    spec: "BC-HA 複合益生菌 3g x 60包 / 盒，共2盒",
    intro: "BC-HA 複合益生菌 2盒組為回購群優惠組合品項，適合想一次補齊常用商品的客人。",
    features: [
      "回購群優惠組合，適合一次補齊常用品項。",
      "組合內容與優惠依當日公告及客服確認為準。",
      "送出清單後，客服會協助確認最適合的優惠方案。",
    ],
    suitableFor: [
      "組合優惠",
      "益生菌補給",
    ],
    usage: "組合品項請加入清單，送出後由 LINE 客服協助確認組合內容、數量與優惠。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 客服確認為準。",
  },
  101: {
    cardName: "龍血洗卸1+1組",
    cardSubtitle: "潔顏慕絲 + 卸妝油・$1,080",
    spec: "龍血求麗潔顏慕絲150mL + 龍血求麗卸妝油150mL，各1瓶，共2瓶",
    intro: "龍血洗卸1+1組固定搭配龍血求麗潔顏慕絲與龍血求麗卸妝油，各1瓶，共2瓶。",
    features: [
      "固定搭配潔顏慕絲 1 瓶與卸妝油 1 瓶，不是任選。",
      "洗卸清潔一次補齊，適合日常卸妝與潔顏流程。",
      "組合價 $1,080，庫存與效期依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "龍血系列",
      "清潔卸妝",
    ],
    usage: "先以龍血求麗卸妝油清潔彩妝與髒污，再搭配龍血求麗潔顏慕絲完成日常潔顏。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，若不慎入眼請以清水沖洗。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "潔顏慕絲 1 瓶 + 卸妝油 1 瓶，1+1 兩瓶 $1,080；庫存與效期依 LINE 客服確認為準。",
  },

  102: {
    cardName: "糖肽中膠囊",
    cardSubtitle: "生福科技品項・生福科技",
    spec: "生福科技品項",
    intro: "糖肽中膠囊為生福科技精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "生福科技",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  103: {
    cardName: "柔焦濾鏡CC霜",
    cardSubtitle: "30mL・防曬",
    spec: "30mL",
    intro: "柔焦濾鏡CC霜為防曬保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "防曬",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  104: {
    cardName: "綠茶多酚保濕平衡精華液",
    cardSubtitle: "30mL・綠茶多酚保濕平衡系列",
    spec: "30mL",
    intro: "綠茶多酚保濕平衡精華液為綠茶多酚保濕平衡系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合作為日常保養中的加強型品項。",
      "可依需求搭配化妝水與乳霜使用。",
      "適合想加強特定保養需求的客人。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  105: {
    cardName: "綠茶多酚保濕平衡面膜",
    cardSubtitle: "20mL x 5片 / 盒・綠茶多酚保濕平衡系列",
    spec: "20mL x 5片 / 盒",
    intro: "綠茶多酚保濕平衡面膜為綠茶多酚保濕平衡系列集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  106: {
    cardName: "白金密集煥白淡斑筆",
    cardSubtitle: "白金密集煥白系列・白金密集煥白系列",
    spec: "白金密集煥白系列",
    intro: "白金密集煥白淡斑筆為白金密集煥白系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 客服協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "美白淡斑",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  107: {
    cardName: "賽洛美潤膚美體油(C+E)",
    cardSubtitle: "頂級養護品項・頂級養護",
    spec: "頂級養護品項",
    intro: "賽洛美潤膚美體油(C+E)為頂級養護保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 客服協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  108: {
    cardName: "24小時賦活液",
    cardSubtitle: "頂級養護品項・頂級養護",
    spec: "頂級養護品項",
    intro: "24小時賦活液為頂級養護保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 客服協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  109: {
    cardName: "鉑金無痕煥白雙導精華",
    cardSubtitle: "頂級養護品項・頂級養護",
    spec: "頂級養護品項",
    intro: "鉑金無痕煥白雙導精華為頂級養護保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合作為日常保養中的加強型品項。",
      "可依需求搭配化妝水與乳霜使用。",
      "適合想加強特定保養需求的客人。",
    ],
    suitableFor: [
      "美白淡斑",
      "抗皺緊緻",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  110: {
    cardName: "黑耀緊緻奢華眼霜",
    cardSubtitle: "頂級養護品項・頂級養護",
    spec: "頂級養護品項",
    intro: "黑耀緊緻奢華眼霜為頂級養護保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  111: {
    cardName: "24小時黃金璀璨賦活液",
    cardSubtitle: "頂級養護品項・頂級養護",
    spec: "頂級養護品項",
    intro: "24小時黃金璀璨賦活液為頂級養護保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 客服協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  112: {
    cardName: "大猩猩紅酒架",
    cardSubtitle: "木匠兄妹品項・木匠兄妹",
    spec: "木匠兄妹品項",
    intro: "大猩猩紅酒架為木匠兄妹精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "木匠兄妹",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  113: {
    cardName: "親子DIY 小花椅",
    cardSubtitle: "居家體驗品項，固碳量 6426 克・木匠兄妹",
    spec: "居家體驗品項，固碳量 6426 克",
    intro: "親子DIY 小花椅為木匠兄妹精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "木匠兄妹",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  114: {
    cardName: "CARPENTER 漢堡杯墊",
    cardSubtitle: "固碳量 437 克・木匠兄妹",
    spec: "固碳量 437 克",
    intro: "CARPENTER 漢堡杯墊為木匠兄妹精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "木匠兄妹",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  115: {
    cardName: "CARPENTER 法藍獅時計",
    cardSubtitle: "固碳量 280 克・木匠兄妹",
    spec: "固碳量 280 克",
    intro: "CARPENTER 法藍獅時計為木匠兄妹精選品項，商品細節與適合搭配可由 LINE 客服協助確認。",
    features: [
      "精選生活品項，可依需求加入清單詢問。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
      "適合搭配回購群日常選品一起確認。",
    ],
    suitableFor: [
      "外部廠商",
      "木匠兄妹",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  116: {
    cardName: "水光苦杏仁酸慕絲",
    cardSubtitle: "水光肌能系列品項・水光肌能系列",
    spec: "水光肌能系列品項",
    intro: "水光苦杏仁酸慕絲為水光肌能系列清潔保養品項，適合日常清潔與保養前使用。",
    features: [
      "適合日常清潔、卸妝或保養前的潔膚步驟。",
      "可依膚況搭配同系列保養品使用。",
      "洗卸清潔後再進行後續保養，保養流程更完整。",
    ],
    suitableFor: [
      "清潔卸妝",
      "乾燥缺水",
      "油性毛孔",
    ],
    usage: "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  117: {
    cardName: "時光瑞亞淡香水",
    cardSubtitle: "30mL・效期至2027/03/05",
    spec: "30mL",
    intro: "時光瑞亞淡香水為香氛品項，可搭配櫻の雪亮澤護手霜組合活動。",
    features: [
      "淡香水 30mL，日常香氛搭配使用。",
      "效期至 2027/03/05。",
      "可搭配櫻の雪亮澤護手霜組合優惠，庫存依 LINE 小幫手確認。",
    ],
    suitableFor: [
      "香水",
      "香氛組合",
      "組合優惠",
    ],
    usage: "噴灑於手腕、耳後或衣物適當位置，請避免接觸眼睛。",
    notice: "請避免接觸眼睛與敏感部位，並放置於陰涼處保存。",
    expiryNote: "效期至 2027/03/05。",
    priceNote: "可搭配櫻の雪亮澤護手霜組合活動；庫存與效期依 LINE 小幫手確認為準。",
  },

  118: {
    cardName: "超導水網瞬效面膜",
    cardSubtitle: "頂級養護面膜品項・頂級養護",
    spec: "頂級養護面膜品項",
    intro: "超導水網瞬效面膜為頂級養護集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "抗皺緊緻",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  119: {
    cardName: "冰河淨化柔膚面膜",
    cardSubtitle: "100mL・頂級養護",
    spec: "100mL",
    intro: "冰河淨化柔膚面膜為頂級養護集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "抗皺緊緻",
      "油性毛孔",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  120: {
    cardName: "Exo-雙粹秘泌凍晶組",
    cardSubtitle: "頂級養護品項・頂級養護",
    spec: "頂級養護品項",
    intro: "Exo-雙粹秘泌凍晶組為頂級養護保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合作為日常保養中的加強型品項。",
      "可依需求搭配化妝水與乳霜使用。",
      "適合想加強特定保養需求的客人。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  121: {
    cardName: "奧勒岡小白花美體乳",
    cardSubtitle: "500mL・頂級養護",
    spec: "500mL",
    intro: "奧勒岡小白花美體乳為頂級養護保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合保養程序後段使用，幫助維持肌膚潤澤。",
      "可依膚況搭配同系列化妝水或精華。",
      "適合日常保濕、修護或滋潤保養需求。",
    ],
    suitableFor: [
      "抗皺緊緻",
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  122: {
    cardName: "肌光緊緻速妍面膜",
    cardSubtitle: "肌光緊緻速妍系列面膜・面膜",
    spec: "肌光緊緻速妍系列面膜",
    intro: "肌光緊緻速妍面膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "抗皺緊緻",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  123: {
    cardName: "INSK乳酸平衡水嫩膜",
    cardSubtitle: "23mL x 6片 / 盒・面膜",
    spec: "23mL x 6片 / 盒",
    intro: "INSK乳酸平衡水嫩膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  124: {
    cardName: "水搖滾保濕面膜",
    cardSubtitle: "22mL x 5pcs・面膜",
    spec: "22mL x 5pcs",
    intro: "水搖滾保濕面膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  125: {
    cardName: "水搖滾保濕面膜",
    cardSubtitle: "22mL x 10pcs・面膜",
    spec: "22mL x 10pcs",
    intro: "水搖滾保濕面膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  126: {
    cardName: "水搖滾保濕面膜",
    cardSubtitle: "22mL x 35pcs・面膜",
    spec: "22mL x 35pcs",
    intro: "水搖滾保濕面膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  127: {
    cardName: "極光白美白面膜",
    cardSubtitle: "x 5pcs・面膜",
    spec: "x 5pcs",
    intro: "極光白美白面膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "美白淡斑",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  128: {
    cardName: "極光白美白面膜",
    cardSubtitle: "x 35pcs・面膜",
    spec: "x 35pcs",
    intro: "極光白美白面膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "美白淡斑",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  129: {
    cardName: "冰河淨化柔膚面膜",
    cardSubtitle: "100mL・面膜",
    spec: "100mL",
    intro: "冰河淨化柔膚面膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "油性毛孔",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  130: {
    cardName: "鳳梨酵素活膚面膜",
    cardSubtitle: "22mL x 5pcs・面膜",
    spec: "22mL x 5pcs",
    intro: "鳳梨酵素活膚面膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "油性毛孔",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  131: {
    cardName: "綠茶多酚保濕平衡面膜",
    cardSubtitle: "20mL x 5片 / 盒・面膜",
    spec: "20mL x 5片 / 盒",
    intro: "綠茶多酚保濕平衡面膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  132: {
    cardName: "超導水網瞬效面膜",
    cardSubtitle: "頂級養護面膜品項・面膜",
    spec: "頂級養護面膜品項",
    intro: "超導水網瞬效面膜為面膜集中保養品項，適合依膚況加強日常保養。",
    features: [
      "適合日常保養或需要加強保養時搭配使用。",
      "可依膚況選擇保濕、亮白、舒緩或修護需求。",
      "敷臉後再搭配日常保養程序，維持肌膚潤澤感。",
    ],
    suitableFor: [
      "乾燥缺水",
      "面膜保養",
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  133: {
    cardName: "蛋白纖維營養餐",
    cardSubtitle: "倍力工房・營養補給",
    spec: "規格依商品標示",
    intro: "蛋白纖維營養餐為倍力工房精選品項，適合作為日常營養補給參考。",
    features: [
      "倍力工房精選品項，可加入清單詢問。",
      "適合作為日常營養補給參考。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "倍力工房",
      "營養補給",
      "外部廠商",
    ],
    usage: "每日建議依產品標示或客服說明食用。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  134: {
    cardName: "固硒力遠紅外線舒緩貼布",
    cardSubtitle: "倍力工房・舒緩貼布",
    spec: "規格依商品標示",
    intro: "固硒力-遠紅外線舒緩貼布為倍力工房精選品項，可依日常需求加入清單詢問。",
    features: [
      "倍力工房精選舒緩貼布品項。",
      "適合想詢問貼布類生活選品的客人。",
      "商品規格、優惠與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "倍力工房",
      "貼布",
      "外部廠商",
    ],
    usage: "使用方式依商品標示或 LINE 客服說明為準。",
    notice: "使用後若有不適，請暫停使用。請依商品標示方式使用。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "目前售價由 LINE 客服確認，送出清單後會協助回覆。",
  },
  135: {
    cardName: "龍血手工皂任選4款",
    cardSubtitle: "5款可選・任選4款 $799",
    spec: "龍血檀香靜心皂 / 龍血艾草保庇皂 / 龍血玫瑰美膚皂 / 龍血檸檬馬鞭草皂 / 龍血薰衣草舒緩皂可任選，共4款",
    intro: "龍血手工皂任選4款為回購群肥皂組合優惠，5款香氣可依需求搭配。",
    features: [
      "龍血檀香靜心皂、龍血艾草保庇皂、龍血玫瑰美膚皂、龍血檸檬馬鞭草皂、龍血薰衣草舒緩皂可任選。",
      "任選4款 $799，適合日常清潔用品補貨。",
      "組合內容、效期與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "肥皂",
      "日常清潔",
    ],
    usage: "加水搓揉起泡後清潔肌膚，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "龍血手工皂任選4款 $799；庫存與效期依 LINE 客服確認為準。",
  },
  136: {
    cardName: "櫻の雪美白精華乳液組",
    cardSubtitle: "買精華液+乳液・贈化妝水・$1,780",
    spec: "精華液30mL + 乳液100mL，贈化妝水150mL",
    intro: "櫻の雪傳明酸美白組合為亮白保養套組，購買精華液與乳液，贈送同系列化妝水。",
    features: [
      "購買櫻の雪傳明酸美白精華液30mL + 美白乳液100mL。",
      "贈送櫻の雪傳明酸美白化妝水150mL。",
      "組合價 $1,780，庫存與效期依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "美白淡斑",
      "櫻の雪系列",
    ],
    usage: "清潔後依化妝水、精華液、乳液順序使用；實際使用方式依商品標示為準。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "購買精華液30mL + 乳液100mL，贈化妝水150mL，組合價 $1,780；庫存與效期依 LINE 客服確認為準。",
  },
  137: {
    cardName: "龍血 / 櫻の雪潔顏慕絲任選2瓶",
    cardSubtitle: "150mL 任選2瓶・$980",
    spec: "龍血求麗潔顏慕絲150mL / 櫻の雪淨白潔顏慕絲150mL 可任選，共2瓶",
    intro: "潔顏慕絲任選2瓶組合可於龍血求麗潔顏慕絲與櫻の雪淨白潔顏慕絲中自由搭配。",
    features: [
      "龍血求麗潔顏慕絲150mL與櫻の雪淨白潔顏慕絲150mL可任選。",
      "任選2瓶 $980，適合日常潔顏補貨。",
      "組合內容、效期與庫存依 LINE 客服確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "清潔卸妝",
      "日常潔顏",
    ],
    usage: "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，若不慎入眼請以清水沖洗。",
    expiryNote: "效期依商品標示或 LINE 客服確認為準。",
    priceNote: "潔顏慕絲任選2瓶 $980；庫存與效期依 LINE 客服確認為準。",
  },
  138: {
    cardName: "亮妍膠原飲兩盒贈晶眸",
    cardSubtitle: "玫瑰風味50mL/10入兩盒・贈EC晶眸・$4,400",
    spec: "亮妍魚膠原蛋白飲-玫瑰風味 50mL/10入 x 2盒，贈 EC 晶眸葉黃素精華凍+精華飲綜合組",
    intro: "亮妍魚膠原蛋白飲兩盒贈 EC 晶眸葉黃素為回購群保健食品組合優惠，適合日常美容與晶眸保健補給。",
    features: [
      "購買亮妍魚膠原蛋白飲-玫瑰風味 50mL/10入兩盒。",
      "贈送 EC 晶眸葉黃素精華凍+精華飲綜合組。",
      "組合價 $4,400，庫存與效期依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "美容補給",
      "晶眸保健",
    ],
    usage: "每日建議依產品標示或客服說明食用。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "亮妍魚膠原蛋白飲兩盒贈 EC 晶眸葉黃素綜合組，組合價 $4,400；庫存與效期依 LINE 小幫手確認為準。",
  },
  139: {
    cardName: "龍血洗髮精 + 阿甘養髮液",
    cardSubtitle: "1+1組・$1,500",
    spec: "龍血求麗頭皮修護洗髮精600mL + 阿甘甦醒髮根養護液80mL，各1瓶，共2瓶",
    intro: "龍血洗髮精 + 阿甘養髮液 1+1 組為洗沐與頭皮養護組合優惠，適合日常頭皮清潔與髮根保養搭配使用。",
    features: [
      "龍血求麗頭皮修護洗髮精 600mL + 阿甘甦醒髮根養護液 80mL。",
      "固定 1+1 搭配，各1瓶，共2瓶。",
      "組合價 $1,500，庫存與效期依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "洗沐系列",
      "頭皮養護",
    ],
    usage: "先以龍血求麗頭皮修護洗髮精清潔頭皮與髮絲，洗後可依商品標示搭配阿甘甦醒髮根養護液使用。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，若不慎入眼請以清水沖洗。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "龍血求麗頭皮修護洗髮精 + 阿甘甦醒髮根養護液 1+1 組合價 $1,500；庫存與效期依 LINE 小幫手確認為準。",
  },
  140: {
    cardName: "時光瑞亞淡香水贈護手霜",
    cardSubtitle: "30mL・贈JDST護手霜30g・$780",
    spec: "時光瑞亞淡香水30mL + 櫻の雪亮澤護手霜JDST 30g",
    intro: "時光瑞亞淡香水贈櫻の雪亮澤護手霜為香氛組合優惠，淡香水效期至 2027/03/05。",
    features: [
      "時光瑞亞淡香水30mL，牌價 $790，效期至 2027/03/05。",
      "贈送價值 $290 的櫻の雪亮澤護手霜 JDST 30g。",
      "組合價 $780，庫存與效期依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "香氛組合",
      "護手霜",
    ],
    usage: "淡香水可噴灑於手腕、耳後或衣物適當位置；護手霜取適量塗抹於手部肌膚。",
    notice: "香水與護手霜請避免接觸眼睛與敏感部位，並放置於陰涼處保存。",
    expiryNote: "淡香水效期至 2027/03/05；護手霜效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "時光瑞亞淡香水30mL + 櫻の雪亮澤護手霜JDST 30g，組合價 $780；庫存與效期依 LINE 小幫手確認為準。",
  },
  143: {
    cardName: "梅托洛買一送二",
    cardSubtitle: "生福科技組合・$3,600",
    spec: "梅托洛買1送2，共3入組合，規格依商品標示",
    intro: "梅托洛買一送二為生福科技組合優惠，適合一次補齊常用品項。",
    features: [
      "梅托洛買1送2，共3入組合。",
      "組合價 $3,600。",
      "組合內容、規格、效期與庫存依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "生福科技",
      "外部廠商",
    ],
    usage: "使用方式依商品標示或 LINE 小幫手說明為準。",
    notice: "商品規格、使用方式與注意事項請依商品標示或小幫手說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "梅托洛買一送二 $3,600；庫存與效期依 LINE 小幫手確認為準。",
  },

};

const skinFilters = [
  "全部",
  "乾燥缺水",
  "油性毛孔",
  "敏感舒緩",
  "美白淡斑",
  "抗皺緊緻",
  "清潔卸妝",
  "面膜保養",
  "男士保養",
] as const;

type SkinFilter = (typeof skinFilters)[number];

const comboProductIds = new Set<number>([
  1, 2, 3,
  75, 99, 117, 141, 142,
  29, 30,
  35, 36,
  47, 48,
  54, 55,
  56, 57, 58, 59, 60,
  71,
  79, 80, 81, 82, 93, 94,
]);

const expiringProductIds = new Set<number>([10, 11]);


export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<MainCategory>("組合價");
  const [selectedSeries, setSelectedSeries] = useState("全部");
  const [selectedSkinFilter, setSelectedSkinFilter] =
    useState<SkinFilter>("全部");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [customer, setCustomer] = useState<CustomerForm>({
    customerName: "",
    lineId: "",
    phone: "",
    deliveryMethod: "宅配",
    address: "",
    note: "",
  });

  const mainCategories = Object.keys(categoryConfig) as MainCategory[];
  const seriesList = categoryConfig[selectedCategory];

  const normalizedSearchQuery = normalizeSearchText(searchQuery);

  const filteredProducts = products
    .map((product, index) => ({
      product,
      index,
      searchScore: getProductSearchScore(product, normalizedSearchQuery),
    }))
    .filter(({ product, searchScore }) => {
      if (normalizedSearchQuery) return searchScore !== null;

      const matchCategory =
        selectedCategory === "全部" || product.category === selectedCategory;

      const matchSeries =
        selectedSeries === "全部" || product.series === selectedSeries;

      const productTags = getProductTags(product);
      const matchSkinFilter =
        selectedSkinFilter === "全部" || productTags.includes(selectedSkinFilter);

      return matchCategory && matchSeries && matchSkinFilter;
    })
    .sort((a, b) => {
      if (!normalizedSearchQuery) return a.index - b.index;
      return (a.searchScore ?? 9999) - (b.searchScore ?? 9999) || a.index - b.index;
    })
    .map(({ product }) => product);

  const searchPreviewProducts = normalizedSearchQuery ? filteredProducts.slice(0, 8) : [];
  const searchRemainingCount = normalizedSearchQuery
    ? Math.max(filteredProducts.length - searchPreviewProducts.length, 0)
    : 0;

  const featuredProductIds = [143, 140, 139, 138, 136, 137, 83, 100, 101, 89, 91, 88, 135];
  const featuredProducts = featuredProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean) as Product[];

  const homeComboProducts = getProductsByIds([143, 140, 139, 138, 136, 137, 100, 83, 84, 101, 92, 88, 135, 91, 89]);
  const homeClearanceProducts = getProductsByIds([10, 11]);
  const homeDragonBloodProducts = getProductsByIds([17, 19, 20, 18, 54, 55]);
  const homeWaterGlowProducts = getProductsByIds([61, 62, 63, 116]);
  const homeTeaControlProducts = getProductsByIds([49, 50, 51, 64, 69, 70]);
  const homeBrighteningProducts = getProductsByIds([68, 71, 72, 141, 142, 106, 127, 128]);
  const homeFirmingProducts = getProductsByIds([27, 28, 21, 22, 23, 120]);
  const homeMaskProducts = getProductsByIds([126, 128, 123, 129, 131, 132]);
  const homeHealthProducts = getProductsByIds([1, 2, 3, 4, 5, 74, 99, 138, 143]);
  const homeDailyLifeProducts = getProductsByIds([29, 30, 93, 31, 32, 140, 117, 75, 133, 134, 47, 48, 79, 80, 81, 82, 94, 35, 36, 37]);

  const skinGuideCards: { title: SkinFilter; text: string }[] = [
    { title: "乾燥缺水", text: "想加強水潤與保濕" },
    { title: "油性毛孔", text: "控油、毛孔與角質代謝" },
    { title: "敏感舒緩", text: "換季與不穩定膚況" },
    { title: "美白淡斑", text: "暗沉、膚色不均與亮澤" },
    { title: "抗皺緊緻", text: "熟齡、細紋與緊緻保養" },
    { title: "清潔卸妝", text: "潔顏、卸妝與日常清潔" },
    { title: "面膜保養", text: "集中保養與日常敷臉" },
    { title: "男士保養", text: "清爽簡單，男生也好用" },
  ];

  const skincareSeriesEntries = [
    { title: "龍血系列", text: "修護、保濕、洗卸清潔" },
    { title: "水光肌能系列", text: "乾燥缺水、保濕補水" },
    { title: "茶樹控油系列", text: "油性毛孔、控油調理" },
    { title: "櫻の雪傳明酸美白系列", text: "美白淡斑、亮澤保養" },
    { title: "BA-5肌密抗皺系列", text: "抗皺緊緻、熟齡保養" },
    { title: "頂級養護", text: "高階修護與精華保養" },
  ];

  const lifestyleBrandEntries = [
    { title: "生福科技", text: "保健、生活機能與日常選品" },
    { title: "木匠兄妹", text: "木作生活小物與親子 DIY" },
    { title: "F.SEASONS 富雨洋傘", text: "洋傘與生活配件" },
    { title: "良冠", text: "精選外部廠商品牌" },
  ];

  const cartTotalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function getProductsByIds(ids: number[]) {
    return ids
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean) as Product[];
  }

  function scrollToSection(sectionId: string) {
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function handleCategoryChange(category: MainCategory) {
    setSelectedCategory(category);
    setSelectedSeries("全部");
    setSelectedSkinFilter("全部");
    setSearchQuery("");
  }

  function jumpToCategory(category: MainCategory, series = "全部") {
    setSelectedCategory(category);
    setSelectedSeries(series);
    setSelectedSkinFilter("全部");
    setSearchQuery("");
  }

  function handleSkinFilterChange(filter: SkinFilter) {
    setSelectedSkinFilter(filter);
    setSearchQuery("");

    if (filter !== "全部" && selectedCategory !== "保養品" && selectedCategory !== "全部") {
      setSelectedCategory("保養品");
      setSelectedSeries("全部");
    }
  }

  function clearSearch() {
    setSearchQuery("");
  }

  function getHomeSectionIdByCategory(category: MainCategory, series = "全部") {
    if (category === "組合價") return "home-combo-products";
    if (category === "保健食品") return "home-health-products";

    if (
      category === "洗沐" ||
      category === "精油" ||
      category === "牙膏" ||
      category === "肥皂" ||
      category === "護手霜" ||
      category === "香水" ||
      category === "貼布" ||
      category === "外部廠商"
    ) {
      return "home-daily-life-products";
    }

    if (category === "保養品") {
      if (series.includes("龍血")) return "home-dragon-blood-products";
      if (series.includes("水光") || series.includes("玫瑰") || series.includes("膠原")) return "home-water-glow-products";
      if (series.includes("茶樹") || series.includes("杏仁酸") || series.includes("冰河")) return "home-tea-control-products";
      if (series.includes("晶淬雪") || series.includes("櫻") || series.includes("白金") || series.includes("極光")) return "home-brightening-products";
      if (series.includes("BA-5") || series.includes("肌光") || series.includes("頂級")) return "home-firming-products";
      if (series.includes("面膜")) return "home-mask-products";
      if (series.includes("冷杉")) return "home-combo-products";

      return "home-dragon-blood-products";
    }

    return "home-combo-products";
  }

  function getHomeSectionIdBySkinFilter(filter: SkinFilter) {
    if (filter === "乾燥缺水") return "home-water-glow-products";
    if (filter === "油性毛孔") return "home-tea-control-products";
    if (filter === "美白淡斑") return "home-brightening-products";
    if (filter === "抗皺緊緻") return "home-firming-products";
    if (filter === "清潔卸妝") return "home-dragon-blood-products";
    if (filter === "面膜保養") return "home-mask-products";
    if (filter === "男士保養") return "home-combo-products";
    return "home-combo-products";
  }

  function openCollectionPage() {
    setIsCollectionOpen(true);
    setIsSearchOpen(false);

    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  }

  function closeCollectionPage() {
    setIsCollectionOpen(false);
  }

  function handleDrawerCategory(category: MainCategory, series = "全部") {
    setIsMenuOpen(false);
    jumpToCategory(category, series);
    openCollectionPage();
  }

  function handleDrawerSkinFilter(filter: SkinFilter) {
    setIsMenuOpen(false);
    handleSkinFilterChange(filter);
    openCollectionPage();
  }

  function goToComboSection() {
    jumpToCategory("組合價", "全部");
    openCollectionPage();
  }

  function openRelatedDetail(product: Product) {
    setSelectedDetailProduct(product);

    window.setTimeout(() => {
      const detailScroller = document.querySelector(".detail-backdrop") as HTMLElement | null;
      detailScroller?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 0);
  }

  function hasKnownOriginalPrice(product: Product) {
    if (!product.originalPrice) return false;
    return !(
      product.originalPrice.includes("待補") ||
      product.originalPrice.includes("???") ||
      product.originalPrice.includes("000")
    );
  }

  function hasInquiryPrice(product: Product) {
    return product.price.includes("待補") || product.price.includes("???");
  }

  function displayPrice(product: Product) {
    if (hasInquiryPrice(product)) return "LINE 詢價";
    return product.price;
  }

  function isSoldOut(product: Product) {
    return product.price.includes("缺貨");
  }

  function hasRealImage(product: Product) {
    return Boolean(product.image && !product.image.includes("placeholder"));
  }

  function hasComboPrice(product: Product) {
    return comboProductIds.has(product.id) || product.category === "組合價";
  }

  function isExpiringDeal(product: Product) {
    return expiringProductIds.has(product.id);
  }

  function getProductTags(product: Product): string[] {
    const tags = new Set<string>();
    const name = product.name;
    const series = product.series;

    if (
      series.includes("水光") ||
      series.includes("綠茶") ||
      series.includes("玫瑰") ||
      series.includes("膠原") ||
      name.includes("水搖滾") ||
      name.includes("超導水網") ||
      name.includes("保濕")
    ) {
      tags.add("乾燥缺水");
    }

    if (
      series.includes("茶樹") ||
      series.includes("INSK") ||
      series.includes("冰河") ||
      series.includes("杏仁酸") ||
      series.includes("鳳梨") ||
      name.includes("毛孔") ||
      name.includes("控油") ||
      name.includes("苦杏仁酸")
    ) {
      tags.add("油性毛孔");
    }

    if (
      series.includes("薰衣草") ||
      series.includes("綠茶") ||
      series.includes("INSK") ||
      name.includes("舒緩") ||
      name.includes("柔膚")
    ) {
      tags.add("敏感舒緩");
    }

    if (
      series.includes("晶淬雪") ||
      series.includes("櫻") ||
      series.includes("白金") ||
      name.includes("美白") ||
      name.includes("煥白") ||
      name.includes("淡斑") ||
      name.includes("極光白") ||
      name.includes("鉑金")
    ) {
      tags.add("美白淡斑");
    }

    if (
      series.includes("BA-5") ||
      series.includes("肌光") ||
      series.includes("頂級") ||
      name.includes("抗皺") ||
      name.includes("緊緻") ||
      name.includes("賦活") ||
      name.includes("奢華") ||
      name.includes("凍晶")
    ) {
      tags.add("抗皺緊緻");
    }

    if (
      name.includes("潔顏") ||
      name.includes("卸妝") ||
      name.includes("慕絲") ||
      name.includes("角質") ||
      name.includes("凝露")
    ) {
      tags.add("清潔卸妝");
    }

    if (
      name.includes("面膜") ||
      name.includes("水嫩膜") ||
      name.includes("水搖滾") ||
      name.includes("極光白")
    ) {
      tags.add("面膜保養");
    }

    if (series.includes("冷杉") || name.includes("型男")) {
      tags.add("男士保養");
    }

    return Array.from(tags);
  }

  function displayTags(product: Product) {
    const tags: string[] = [];

    if (isExpiringDeal(product)) {
      tags.push("即期優惠");
    }

    for (const tag of getProductTags(product)) {
      if (!tags.includes(tag)) tags.push(tag);
    }

    return tags.slice(0, 2);
  }

  function normalizeSearchText(value: string) {
    return value
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[\s\-_/\\|.,，。:：;；!！?？()（）[\]{}【】「」『』'"’‘“”+＋*＊×]/g, "")
      .replace(/nt\$/g, "");
  }

  function getSearchableText(product: Product) {
    return [
      product.name,
      getCardName(product),
      getCardSubtitle(product),
      product.category,
      product.series,
      product.description,
      product.price,
      product.originalPrice ?? "",
      getPriceNote(product),
      getIntroText(product),
      getExpiryNote(product),
      getNoticeText(product),
      ...getSuitableItems(product),
      ...getDetailBullets(product),
      ...getProductTags(product),
      hasComboPrice(product) ? "組合價 有組合價 優惠 任選" : "",
      isExpiringDeal(product) ? "即期 即期優惠 特價" : "",
      hasInquiryPrice(product) ? "LINE詢價 詢價" : "",
    ].join(" ");
  }

  function fuzzyGapScore(needle: string, haystack: string) {
    let lastIndex = -1;
    let gapScore = 0;

    for (const char of needle) {
      const nextIndex = haystack.indexOf(char, lastIndex + 1);
      if (nextIndex === -1) return null;
      gapScore += nextIndex - lastIndex - 1;
      lastIndex = nextIndex;
    }

    return gapScore;
  }

  function getProductSearchScore(product: Product, normalizedQuery: string) {
    if (!normalizedQuery) return 0;

    const nameText = normalizeSearchText(product.name);
    const seriesText = normalizeSearchText(product.series);
    const fullText = normalizeSearchText(getSearchableText(product));

    if (nameText.includes(normalizedQuery)) return 1;
    if (seriesText.includes(normalizedQuery)) return 2;
    if (fullText.includes(normalizedQuery)) return 3;

    const fuzzyScore = fuzzyGapScore(normalizedQuery, fullText);
    return fuzzyScore === null ? null : 20 + fuzzyScore;
  }

  function currentFilterText() {
    if (searchQuery.trim()) return `模糊搜尋：${searchQuery.trim()}`;

    return [
      selectedCategory,
      selectedSeries !== "全部" ? selectedSeries : "",
      selectedSkinFilter !== "全部" ? selectedSkinFilter : "",
    ]
      .filter(Boolean)
      .join(" / ");
  }

  function MascotImage({
    src,
    alt,
    className = "",
  }: {
    src: string;
    alt: string;
    className?: string;
  }) {
    return (
      <img
        src={src}
        alt={alt}
        className={`mascot-image ${className}`}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    );
  }

  function HomeBanner({
    id,
    eyebrow,
    title,
    subtitle,
    note,
    image: _image,
    tone = "cream",
    children,
  }: {
    id?: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    note?: string;
    image: string;
    tone?: "cream" | "deal" | "green" | "pink" | "wood";
    children?: ReactNode;
  }) {
    return (
      <section
        className={`home-banner ${tone}`}
        id={id}
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(255, 250, 246, 0.98), rgba(255, 239, 226, 0.92))",
        }}
      >
        <div className="home-banner-copy">
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          <strong>{subtitle}</strong>
          {note && <span>{note}</span>}
        </div>
        {children && <div className="home-banner-mascots">{children}</div>}
      </section>
    );
  }

  function HomeProductSection({
    id,
    eyebrow,
    title,
    subtitle,
    products,
    actionLabel,
    onAction,
  }: {
    id?: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    products: Product[];
    actionLabel?: string;
    onAction?: () => void;
  }) {
    return (
      <section className="home-product-section" id={id}>
        <div className="section-heading compact">
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>

        <div className="home-product-grid">
          {products.map((product) => (
            <ProductCard product={product} key={`home-${id ?? title}-${product.id}`} />
          ))}
        </div>

        {actionLabel && onAction && (
          <button type="button" className="home-more-button" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </section>
    );
  }

  function ProductVisual({
    product,
    variant = "normal",
  }: {
    product: Product;
    variant?: "normal" | "featured";
  }) {
    return (
      <div className={`product-image ${variant === "featured" ? "featured-image" : ""}`}>
        {hasRealImage(product) ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="image-placeholder">
            <span>Jourdeness Castle</span>
            <strong>商品圖片準備中</strong>
          </div>
        )}
      </div>
    );
  }

  function productContent(product: Product) {
    return productContentOverrides[product.id] ?? {};
  }

  function getCardName(product: Product) {
    return productContent(product).cardName ?? product.cardName ?? product.name;
  }

  function getCardSubtitle(product: Product) {
    return productContent(product).cardSubtitle ?? product.cardSubtitle ?? product.description;
  }

  function getDetailName(product: Product) {
    return productContent(product).name ?? product.name;
  }

  function getSpecLine(product: Product) {
    const spec = productContent(product).spec ?? product.spec;
    if (spec) return `${spec}・${product.series}。`;
    return product.description;
  }

  function getPriceNote(product: Product) {
    if (productContent(product).priceNote || product.priceNote) {
      return productContent(product).priceNote ?? product.priceNote ?? "";
    }

    if (isExpiringDeal(product)) {
      return "即期優惠品項，效期與庫存請以 LINE 客服確認為準。";
    }

    if (hasInquiryPrice(product)) {
      return "目前售價由 LINE 客服確認，送出清單後會協助回覆。";
    }

    if (hasComboPrice(product)) {
      return "若有組合價活動，客服會協助確認最適合的優惠方案。";
    }

    return "實際優惠與庫存依 LINE 客服確認為準。";
  }

  function getIntroText(product: Product) {
    return productContent(product).intro ?? product.intro ?? "";
  }

  function getSpecText(product: Product) {
    const spec = productContent(product).spec ?? product.spec;
    if (spec) return spec;
    return product.description.split("。")[0] || "依商品標示";
  }

  function shouldShowExpiryInfo(product: Product) {
    const expirableCategories: MainCategory[] = [
      "組合價",
      "保養品",
      "保健食品",
      "洗沐",
      "精油",
      "牙膏",
      "肥皂",
      "護手霜",
      "香水",
    ];

    if (isExpiringDeal(product)) return true;
    if (expirableCategories.includes(product.category)) return true;

    const text = `${product.name} ${product.series}`;
    return (
      text.includes("魚油") ||
      text.includes("膠囊") ||
      text.includes("潔口液") ||
      text.includes("貼布") ||
      text.includes("精華飲") ||
      text.includes("精華凍") ||
      text.includes("飲") ||
      text.includes("益生菌")
    );
  }

  function getExpiryNote(product: Product) {
    if (!shouldShowExpiryInfo(product)) return "";

    const override = productContent(product);
    if ("expiryNote" in override) return override.expiryNote ?? "";
    if (product.expiryNote !== undefined) return product.expiryNote;

    if (isExpiringDeal(product)) {
      return "此為即期優惠品項，實際效期請以 LINE 客服確認為準。";
    }

    return "效期依商品標示或 LINE 客服確認為準。";
  }

  function getNoticeText(product: Product) {
    return productContent(product).notice ?? product.notice ?? "";
  }

  function getSuitableItems(product: Product) {
    const customItems = productContent(product).suitableFor ?? product.suitableFor;
    if (customItems?.length) return customItems;

    const tags = getProductTags(product);
    if (tags.length) return tags.slice(0, 5);

    return [product.series, product.category].filter(Boolean);
  }

  function getUsageText(product: Product) {
    const customUsage = productContent(product).usage ?? product.usage;
    if (customUsage) return customUsage;

    const tags = getProductTags(product);

    if (product.category === "保健食品") {
      return "每日建議依產品標示或客服說明食用。";
    }

    if (tags.includes("清潔卸妝")) {
      return "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。";
    }

    if (tags.includes("面膜保養")) {
      return "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。";
    }

    if (product.category === "保養品") {
      return "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。";
    }

    return "";
  }

  function getDetailBullets(product: Product) {
    const customFeatures = productContent(product).features ?? product.features;
    if (customFeatures?.length) return customFeatures.slice(0, 5);

    const tags = getProductTags(product);
    const bullets: string[] = [];

    if (tags.includes("乾燥缺水")) bullets.push("適合想加強水潤感與日常保濕保養。");
    if (tags.includes("油性毛孔")) bullets.push("適合想找清爽調理、油水平衡類品項。");
    if (tags.includes("敏感舒緩")) bullets.push("適合偏好溫和、穩定保養節奏的客人。");
    if (tags.includes("美白淡斑")) bullets.push("適合想找提亮、暗沉與斑點加強保養品項。");
    if (tags.includes("抗皺緊緻")) bullets.push("適合熟齡、緊緻與高階養護需求。");
    if (tags.includes("清潔卸妝")) bullets.push("適合日常清潔、卸妝或角質代謝保養流程。");
    if (tags.includes("面膜保養")) bullets.push("適合想做集中保養或加強型保養時搭配使用。");
    if (tags.includes("男士保養")) bullets.push("適合男士日常清潔、保濕與清爽保養需求。");

    if (hasComboPrice(product)) {
      bullets.push("此品項可留意組合價，送出清單後客服會協助確認最適合的優惠方案。");
    }

    if (bullets.length === 0) {
      bullets.push("可先加入清單，送出後由 LINE 客服協助確認庫存、價格與適合搭配品項。");
    }

    return bullets.slice(0, 4);
  }

  function getRelatedProducts(product: Product) {
    const sameSeries = products.filter(
      (item) => item.id !== product.id && item.category === product.category && item.series === product.series
    );

    const sameCategory = products.filter(
      (item) => item.id !== product.id && item.category === product.category && item.series !== product.series
    );

    return [...sameSeries, ...sameCategory].slice(0, 4);
  }

  function ProductCard({
    product,
    featured = false,
  }: {
    product: Product;
    featured?: boolean;
  }) {
    const soldOut = isSoldOut(product);
    const inquiry = hasInquiryPrice(product);
    const tags = displayTags(product);

    return (
      <article
        className={featured ? "featured-card" : "product-card"}
        key={featured ? `featured-${product.id}` : product.id}
      >
        <ProductVisual product={product} variant={featured ? "featured" : "normal"} />

        <div className={featured ? "featured-info" : "product-info"}>
          <div className="product-meta-row">
            <p className="series-label">{product.series}</p>
            {inquiry && !soldOut && <span>可詢價</span>}
            {soldOut && <span className="sold-out-badge">缺貨</span>}
          </div>

          <h3>{getCardName(product)}</h3>
          <p className="description">{getCardSubtitle(product)}</p>

          <div className="tag-row">
            {tags.map((tag) => (
              <span className="need-tag" key={`${product.id}-${tag}`}>
                {tag}
              </span>
            ))}

            {hasComboPrice(product) && (
              <button
                type="button"
                className="combo-badge"
                onClick={goToComboSection}
              >
                有組合價
              </button>
            )}
          </div>

          <div className="price-block">
            {hasKnownOriginalPrice(product) && (
              <p className="original-price">{product.originalPrice}</p>
            )}

            <p className={`price ${inquiry ? "inquiry" : ""}`}>
              {displayPrice(product)}
            </p>
          </div>

          <button
            className="add-cart-button"
            onClick={() => addToCart(product)}
            disabled={soldOut}
          >
            {soldOut ? "缺貨中" : inquiry ? "加入詢問清單" : "加入清單"}
          </button>

          <button
            type="button"
            className="detail-button"
            onClick={() => setSelectedDetailProduct(product)}
          >
            查看商品資訊
          </button>
        </div>
      </article>
    );
  }

  function addToCart(product: Product) {
    if (isSoldOut(product)) return;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { product, quantity: 1 }];
    });

    setIsCartOpen(true);
    setSubmitStatus("idle");
    setSubmitMessage("");
  }

  function updateCartQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }

  function removeFromCart(productId: number) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    );
  }

  function clearCart() {
    setCartItems([]);
    setSubmitStatus("idle");
    setSubmitMessage("");
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cartItems.length === 0) {
      setSubmitStatus("error");
      setSubmitMessage("請先加入商品到清單。");
      return;
    }

    if (!customer.customerName.trim()) {
      setSubmitStatus("error");
      setSubmitMessage("請填寫姓名。");
      return;
    }

    if (!customer.lineId.trim() && !customer.phone.trim()) {
      setSubmitStatus("error");
      setSubmitMessage("請至少填寫 LINE ID 或電話其中一項，方便我們聯絡你。");
      return;
    }

    if (!customer.address.trim()) {
      setSubmitStatus("error");
      setSubmitMessage("請填寫宅配地址。");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    const noteWithAddress = [
      `宅配地址：${customer.address.trim()}`,
      customer.note.trim() ? `備註：${customer.note.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const payload = {
      customerName: customer.customerName.trim(),
      lineId: customer.lineId.trim(),
      phone: customer.phone.trim(),
      deliveryMethod: "宅配",
      note: noteWithAddress,
      items: cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        category: item.product.category,
        series: item.product.series,
        originalPrice: hasKnownOriginalPrice(item.product)
          ? item.product.originalPrice
          : "",
        price: displayPrice(item.product),
        description: item.product.description,
        quantity: item.quantity,
        tags: displayTags(item.product).join("、"),
        combo: hasComboPrice(item.product) ? "有組合價" : "",
      })),
    };

    try {
      await fetch(ORDER_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      setSubmitStatus("success");
      setSubmitMessage("");
      setCartItems([]);
      setCustomer({
        customerName: "",
        lineId: "",
        phone: "",
        deliveryMethod: "宅配",
        address: "",
        note: "",
      });
      setIsCartOpen(false);
      setIsSuccessOpen(true);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage("送出時發生問題，請稍後再試，或直接加入 LINE：@chateau-buy。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-shell">
      <div className="announcement-bar">
        🚚 滿 NT$3000 免運｜📦 僅宅配｜LINE 客服確認
      </div>

      <header className="top-header">
        <button
          className="menu-button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="開啟選單"
        >
          ☰
        </button>

        <div className="brand-block">
          <p className="top-eyebrow">Jourdeness Castle</p>
          <h1>佐登商城</h1>
          <p>城堡回購群｜產地價訂購站</p>
        </div>

        <div className="header-actions">
          <button
            className={isSearchOpen ? "icon-button active" : "icon-button"}
            onClick={() => {
              setIsCollectionOpen(false);
              setIsSearchOpen((current) => !current);
            }}
            aria-label="開啟搜尋頁面"
          >
            🔍
          </button>

          <button className="header-cart-button" onClick={() => setIsCartOpen(true)}>
            清單 <span>{cartTotalQuantity}</span>
          </button>
        </div>
      </header>

      {isSearchOpen && (
        <section className="search-panel search-page-view" aria-label="商品搜尋頁面">
          <div className="search-page-head">
            <button
              type="button"
              className="search-back-button"
              onClick={() => setIsSearchOpen(false)}
            >
              ← 返回
            </button>

            <div>
              <p>Jourdeness Castle</p>
              <h2>搜尋商品</h2>
              <span>輸入部分字詞，直接在搜尋頁查看結果</span>
            </div>
          </div>

          <div className="search-input-wrap">
            <span>🔍</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="模糊搜尋：龍血、面膜、益生菌、冷杉、即期"
              autoFocus
            />
            {searchQuery.trim() && (
              <button type="button" onClick={clearSearch}>清除</button>
            )}
          </div>
          <p>可輸入部分字詞或簡寫，例如「龍血慕絲」、「bcha」、「冷杉即期」。搜尋結果會顯示在這個搜尋頁，不會顯示在首頁下方。</p>

          {normalizedSearchQuery && (
            <div className="search-results-block">
              <div className="search-results-head">
                <strong>搜尋結果</strong>
                <span>符合 {filteredProducts.length} 項</span>
              </div>

              {searchPreviewProducts.length > 0 ? (
                <div className="search-result-list">
                  {searchPreviewProducts.map((product) => (
                    <article className="search-result-card" key={`search-${product.id}`}>
                      <div className="search-result-image">
                        {hasRealImage(product) ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="search-result-placeholder">商品圖準備中</div>
                        )}
                      </div>

                      <div className="search-result-info">
                        <p>{product.series}</p>
                        <h3>{getCardName(product)}</h3>

                        <div className="search-result-tags">
                          {isExpiringDeal(product) && <span>即期優惠</span>}
                          {hasComboPrice(product) && <span>有組合價</span>}
                          {displayTags(product)
                            .filter((tag) => tag !== "有組合價")
                            .slice(0, isExpiringDeal(product) || hasComboPrice(product) ? 1 : 2)
                            .map((tag) => (
                              <span key={`search-${product.id}-${tag}`}>{tag}</span>
                            ))}
                        </div>

                        <div className="search-result-price">
                          <strong>{displayPrice(product)}</strong>
                          {hasKnownOriginalPrice(product) && <span>{product.originalPrice}</span>}
                        </div>

                        <div className="search-result-actions">
                          <button type="button" onClick={() => setSelectedDetailProduct(product)}>
                            查看
                          </button>
                          <button
                            type="button"
                            className="primary"
                            onClick={() => addToCart(product)}
                            disabled={isSoldOut(product)}
                          >
                            {isSoldOut(product) ? "缺貨" : hasInquiryPrice(product) ? "詢問" : "加入"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="search-result-empty">
                  找不到符合的商品，可以換短一點的關鍵字，例如「龍血」、「面膜」、「益生菌」。
                </div>
              )}

              {searchRemainingCount > 0 && (
                <p className="search-result-note">
                  還有 {searchRemainingCount} 項符合結果，可以輸入更精準的字詞縮小範圍。
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {isCollectionOpen && (
        <section className="search-panel search-page-view collection-page-view" aria-label="分類商品頁面">
          <div className="search-page-head collection-page-head">
            <button
              type="button"
              className="search-back-button"
              onClick={closeCollectionPage}
            >
              ← 返回
            </button>

            <div>
              <p>Catalog</p>
              <h2>{currentFilterText() || "全部商品"}</h2>
              <span>共 {filteredProducts.length} 項商品｜可加入清單或查看商品資訊</span>
            </div>
          </div>

          <div className="collection-helper-card">
            <strong>{currentFilterText() || "全部商品"}</strong>
            <span>這裡會顯示你從左上角 ☰ 選單選到的分類 / 系列商品，例如玫瑰系列、龍血系列、倍力工房等。</span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="home-product-grid collection-product-grid">
              {filteredProducts.map((product) => (
                <ProductCard product={product} key={`collection-${product.id}`} />
              ))}
            </div>
          ) : (
            <div className="collection-empty-card">
              <h3>目前這個分類暫時沒有商品</h3>
              <p>可以返回選單切換其他分類，或點右上角搜尋商品。</p>
            </div>
          )}
        </section>
      )}

      {isMenuOpen && (
        <section className="drawer-backdrop" onClick={() => setIsMenuOpen(false)}>
          <aside className="side-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <p>Jourdeness Castle</p>
                <h2>佐登妮絲城堡回購群</h2>
                <span>產地價訂購站</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} aria-label="關閉選單">×</button>
            </div>

            <div className="drawer-rule-card">
              <strong>🚚 滿 NT$3000 免運</strong>
              <span>📦 僅提供宅配，送出清單後由 LINE 客服確認。</span>
            </div>

            <nav className="drawer-nav">
              <div className="drawer-section">
                <p>商城目錄</p>
                <button onClick={() => handleDrawerCategory("組合價")}>本月主打優惠</button>
                <button onClick={() => handleDrawerCategory("組合價")}>組合價</button>
                <button onClick={() => handleDrawerCategory("全部")}>全部商品</button>
                <button onClick={() => handleDrawerCategory("保健食品")}>保健食品</button>
                <button onClick={() => handleDrawerCategory("洗沐")}>洗沐</button>
                <button onClick={() => handleDrawerCategory("外部廠商")}>外部廠商</button>
              </div>

              <div className="drawer-section drawer-section-wide">
                <p>保養品系列</p>
                {categoryConfig.保養品.filter((series) => series !== "全部").map((series) => (
                  <button key={`drawer-skincare-${series}`} onClick={() => handleDrawerCategory("保養品", series)}>
                    {series}
                  </button>
                ))}
              </div>

              <div className="drawer-section">
                <p>依膚質 / 需求找</p>
                {skinFilters.filter((filter) => filter !== "全部").map((filter) => (
                  <button key={`drawer-${filter}`} onClick={() => handleDrawerSkinFilter(filter)}>
                    {filter}
                  </button>
                ))}
              </div>

              <div className="drawer-section">
                <p>更多分類</p>
                <button onClick={() => handleDrawerCategory("精油")}>精油</button>
                <button onClick={() => handleDrawerCategory("香水")}>香水</button>
                <button onClick={() => handleDrawerCategory("牙膏")}>牙膏</button>
                <button onClick={() => handleDrawerCategory("肥皂")}>肥皂</button>
                <button onClick={() => handleDrawerCategory("護手霜")}>護手霜</button>
                <button onClick={() => handleDrawerCategory("貼布")}>貼布</button>
              </div>

              <div className="drawer-section">
                <p>外部廠商</p>
                <button onClick={() => handleDrawerCategory("外部廠商", "生福科技")}>生福科技</button>
                <button onClick={() => handleDrawerCategory("外部廠商", "倍力工房")}>倍力工房</button>
                <button onClick={() => handleDrawerCategory("外部廠商", "木匠兄妹")}>木匠兄妹</button>
                <button onClick={() => handleDrawerCategory("外部廠商", "F.SEASONS 富雨洋傘")}>F.SEASONS 富雨洋傘</button>
                <button onClick={() => handleDrawerCategory("外部廠商", "良冠")}>良冠</button>
              </div>
            </nav>

            <a
              className="drawer-line-button"
              href="https://line.me/R/ti/p/@chateau-buy"
              target="_blank"
              rel="noopener noreferrer"
            >
              加入 LINE：@chateau-buy
            </a>
          </aside>
        </section>
      )}

      <div className="store-promo-stack">
        <HomeBanner
          id="home-main-deal"
          eyebrow="Monthly Deals"
          title="本月回購優惠"
          subtitle="人氣組合價・滿額宅配免運"
          note="益生菌｜龍血洗卸｜EPAX 魚油｜牛樟芝潔口液"
          image="/banners/banner-combo-deals.png"
          tone="deal"
        />

        <HomeBanner
          id="popular-home"
          eyebrow="Best Sellers"
          title="回購人氣推薦"
          subtitle="保健食品・洗沐清潔・龍血修護"
          note="精選回購群常購品項，送出後由 LINE 小幫手確認"
          image="/banners/banner-skincare-series.png"
          tone="wood"
        />
      </div>

      <HomeProductSection
        id="home-combo-products"
        eyebrow="Hot Deals"
        title="熱銷組合價"
        subtitle="回購群人氣優惠，庫存與效期依 LINE 客服確認"
        products={homeComboProducts}
      />

      <HomeProductSection
        id="home-clearance-products"
        eyebrow="Clearance"
        title="即期良品出清"
        subtitle="冷杉型男保養單瓶 $199，數量有限，實際效期請以 LINE 小幫手確認"
        products={homeClearanceProducts}
      />

      <HomeBanner
        id="dragon-blood-home"
        eyebrow="Dragon Blood"
        title="龍血系列"
        subtitle="修護・保濕・洗卸清潔"
        note="從日常保養到卸妝潔顏，一次看完整系列"
        image="/banners/banner-dragon-blood.png"
        tone="deal"
      
      />

      <HomeProductSection
        id="home-dragon-blood-products"
        eyebrow="Repair Care"
        title="龍血系列"
        subtitle="修護、保濕、卸妝與潔顏品項"
        products={homeDragonBloodProducts}
      />

      <HomeBanner
        id="water-glow-home"
        eyebrow="Hydration"
        title="保濕亮白人氣推薦"
        subtitle="水潤、亮白、集中保養一次看"
        note="水光肌能｜面膜｜晶淬雪｜櫻の雪｜玫瑰系列"
        image="/banners/banner-water-glow.png"
        tone="cream"
      
      />

      <HomeProductSection
        id="home-water-glow-products"
        eyebrow="Hydrating Picks"
        title="水光肌能系列"
        subtitle="乾燥缺水、保濕補水與溫和清潔"
        products={homeWaterGlowProducts}
      />

      <HomeBanner
        id="tea-control-home"
        eyebrow="Balance Care"
        title="茶樹控油系列"
        subtitle="油性毛孔・清爽調理"
        note="控油、毛孔、角質代謝與清爽保養"
        image="/banners/banner-tea-control.png"
        tone="green"
      
      />

      <HomeProductSection
        id="home-tea-control-products"
        eyebrow="Oil Control"
        title="茶樹控油系列"
        subtitle="油性毛孔、角質代謝與清爽調理"
        products={homeTeaControlProducts}
      />

      <HomeBanner
        id="brightening-home"
        eyebrow="Brightening"
        title="亮白保養系列"
        subtitle="暗沉・膚色不均・美白淡斑"
        note="晶淬雪｜櫻の雪｜白金密集煥白｜極光白面膜"
        image="/banners/banner-brightening-care.png"
        tone="pink"
      
      />

      <HomeProductSection
        id="home-brightening-products"
        eyebrow="Glow Picks"
        title="亮白保養系列"
        subtitle="提亮、淡斑、亮澤與膚色不均保養"
        products={homeBrighteningProducts}
      />

      <HomeBanner
        id="firming-home"
        eyebrow="Firming Care"
        title="抗皺緊緻系列"
        subtitle="熟齡保養・細紋・緊緻"
        note="BA-5｜肌光緊緻｜頂級養護"
        image="/banners/banner-firming-care.png"
        tone="wood"
      
      />

      <HomeProductSection
        id="home-firming-products"
        eyebrow="Premium Care"
        title="抗皺緊緻系列"
        subtitle="熟齡、細紋、緊緻與高階養護商品"
        products={homeFirmingProducts}
      />

      <HomeBanner
        id="mask-care-home"
        eyebrow="Mask Care"
        title="面膜集中保養"
        subtitle="保濕・亮白・舒緩・修護"
        note="日常保養與集中保養都能找到適合選擇"
        image="/banners/banner-mask-care.png"
        tone="pink"
      
      />

      <HomeProductSection
        id="home-mask-products"
        eyebrow="Mask Picks"
        title="面膜集中保養"
        subtitle="從日常保濕到亮白修護，依需求挑選"
        products={homeMaskProducts}
      />

      <HomeBanner
        id="health-care-home"
        eyebrow="Wellness"
        title="日常保健補給"
        subtitle="益生菌・葉黃素・膠原蛋白飲・魚油"
        note="日常補給與營養保養"
        image="/banners/banner-health-care.png"
        tone="green"
      
      />

      <HomeProductSection
        id="home-health-products"
        eyebrow="Daily Care"
        title="保健食品專區"
        subtitle="從腸道、晶眸到美容補給，日常保養一起補上"
        products={homeHealthProducts}
      />

      <HomeBanner
        id="daily-life-home"
        eyebrow="Daily Life"
        title="洗沐與生活選品"
        subtitle="日常清潔・香氛・外部廠商精選"
        note="洗沐｜牙膏肥皂｜貼布｜倍力工房｜生活選品"
        image="/banners/banner-daily-life.png"
        tone="wood"
      
      />

      <HomeProductSection
        id="home-daily-life-products"
        eyebrow="Daily Picks"
        title="洗沐與生活選品"
        subtitle="日常清潔、貼布、牙膏肥皂與倍力工房選品"
        products={homeDailyLifeProducts}
      />


      {cartTotalQuantity > 0 && (
        <button className="floating-cart-button" onClick={() => setIsCartOpen(true)}>
          清單 {cartTotalQuantity}
        </button>
      )}

      {isCartOpen && (
        <section className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="cart-panel" onClick={(event) => event.stopPropagation()}>
            <div className="cart-header">
              <div>
                <p className="cart-eyebrow">Order List</p>
                <h2>訂購清單</h2>
                <span>僅提供宅配；送出後請至 LINE 確認訂單，確認後才會提供匯款資訊。</span>
              </div>
              <button className="cart-close" onClick={() => setIsCartOpen(false)}>
                ×
              </button>
            </div>

            {cartItems.length > 0 ? (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div className="cart-item" key={item.product.id}>
                      <div>
                        <p className="cart-item-series">{item.product.series}</p>
                        <h3>{item.product.name}</h3>
                        <p>{displayPrice(item.product)}</p>
                        {hasComboPrice(item.product) && (
                          <button
                            type="button"
                            className="combo-badge-mini"
                            onClick={goToComboSection}
                          >
                            有組合價
                          </button>
                        )}
                      </div>

                      <div className="cart-quantity-control">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="clear-cart-button" onClick={clearCart}>
                  清空清單
                </button>

                <form className="order-form" onSubmit={submitOrder}>
                  <div className="delivery-summary">
                    <strong>配送方式：宅配</strong>
                    <span>滿 NT$3000 免運，未滿免運門檻將由客服確認運費。</span>
                  </div>

                  <label>
                    姓名 <span>*</span>
                    <input
                      value={customer.customerName}
                      onChange={(event) =>
                        setCustomer({ ...customer, customerName: event.target.value })
                      }
                      placeholder="請輸入姓名"
                    />
                  </label>

                  <label>
                    LINE ID
                    <input
                      value={customer.lineId}
                      onChange={(event) =>
                        setCustomer({ ...customer, lineId: event.target.value })
                      }
                      placeholder="例如：@chateau-buy"
                    />
                  </label>

                  <label>
                    電話
                    <input
                      value={customer.phone}
                      onChange={(event) =>
                        setCustomer({ ...customer, phone: event.target.value })
                      }
                      placeholder="請輸入電話"
                    />
                  </label>

                  <label>
                    宅配地址 <span>*</span>
                    <input
                      value={customer.address}
                      onChange={(event) =>
                        setCustomer({ ...customer, address: event.target.value })
                      }
                      placeholder="請輸入宅配地址"
                    />
                  </label>

                  <label>
                    備註
                    <textarea
                      value={customer.note}
                      onChange={(event) =>
                        setCustomer({ ...customer, note: event.target.value })
                      }
                      placeholder="可填寫想確認庫存、品項搭配、指定需求"
                    />
                  </label>

                  {submitMessage && (
                    <p className={submitStatus === "success" ? "form-message success" : "form-message error"}>
                      {submitMessage}
                    </p>
                  )}

                  <button className="submit-order-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "送出中..." : "送出清單，等待 LINE 確認"}
                  </button>

                  <p className="order-form-note">
                    送出清單不代表付款完成。商品價格、庫存、優惠組合、滿額免運與付款方式，仍依 LINE 客服確認為準。
                  </p>
                </form>
              </>
            ) : (
              <div className="empty-cart">
                <h3>清單目前是空的</h3>
                <p>可以先回商品列表加入想詢問或訂購的品項。</p>
              </div>
            )}
          </div>
        </section>
      )}

      {selectedDetailProduct && (
        <section className="detail-backdrop" onClick={() => setSelectedDetailProduct(null)}>
          <div className="detail-panel" onClick={(event) => event.stopPropagation()}>
            <div className="detail-header">
              <button className="detail-close" onClick={() => setSelectedDetailProduct(null)}>
                ‹
              </button>
              <h2>商品詳情</h2>
              <button className="detail-cart-button" onClick={() => setIsCartOpen(true)}>
                清單 {cartTotalQuantity}
              </button>
            </div>

            <div className="detail-main-image">
              {hasRealImage(selectedDetailProduct) ? (
                <img src={selectedDetailProduct.image} alt={selectedDetailProduct.name} />
              ) : (
                <div className="image-placeholder detail-placeholder">
                  <span>Jourdeness Castle</span>
                  <strong>商品圖片準備中</strong>
                </div>
              )}
            </div>

            <div className="detail-content">
              <div className="detail-title-row">
                <div>
                  <p className="series-label">{selectedDetailProduct.series}</p>
                  <h1>{getDetailName(selectedDetailProduct)}</h1>
                  <p className="detail-description">{getSpecLine(selectedDetailProduct)}</p>
                </div>
              </div>

              <div className="detail-tags">
                {displayTags(selectedDetailProduct).map((tag) => (
                  <span className="need-tag" key={`detail-${selectedDetailProduct.id}-${tag}`}>
                    {tag}
                  </span>
                ))}

                {hasComboPrice(selectedDetailProduct) && (
                  <button
                    type="button"
                    className="combo-badge"
                    onClick={() => {
                      setSelectedDetailProduct(null);
                      goToComboSection();
                    }}
                  >
                    有組合價
                  </button>
                )}
              </div>

              <section className="detail-info-block product-summary-card">
                <h3>商品資訊</h3>

                <div className="product-info-lines">
                  <div>
                    <span>規格</span>
                    <p>{getSpecText(selectedDetailProduct)}</p>
                  </div>

                  {getExpiryNote(selectedDetailProduct) && (
                    <div>
                      <span>{isExpiringDeal(selectedDetailProduct) ? "即期 / 效期" : "效期"}</span>
                      <p>{getExpiryNote(selectedDetailProduct)}</p>
                    </div>
                  )}
                </div>

                {getIntroText(selectedDetailProduct) && (
                  <p className="product-intro-text">{getIntroText(selectedDetailProduct)}</p>
                )}
              </section>

              <div className="detail-price-card">
                {hasKnownOriginalPrice(selectedDetailProduct) && (
                  <p className="original-price">{selectedDetailProduct.originalPrice}</p>
                )}
                <p className={`price ${hasInquiryPrice(selectedDetailProduct) ? "inquiry" : ""}`}>
                  {displayPrice(selectedDetailProduct)}
                </p>
                <p className="price-note">{getPriceNote(selectedDetailProduct)}</p>
              </div>

              <button
                className="detail-add-button"
                disabled={isSoldOut(selectedDetailProduct)}
                onClick={() => addToCart(selectedDetailProduct)}
              >
                {isSoldOut(selectedDetailProduct)
                  ? "缺貨中"
                  : hasInquiryPrice(selectedDetailProduct)
                  ? "加入詢問清單"
                  : "加入清單"}
              </button>

              <section className="detail-info-block">
                <h3>商品特色</h3>
                {getDetailBullets(selectedDetailProduct).map((bullet) => (
                  <p key={bullet}>・{bullet}</p>
                ))}
              </section>

              <section className="detail-info-block">
                <h3>適合需求</h3>
                <div className="detail-suitable-tags">
                  {getSuitableItems(selectedDetailProduct).map((item) => (
                    <span key={`suitable-${selectedDetailProduct.id}-${item}`}>{item}</span>
                  ))}
                </div>
              </section>

              {getUsageText(selectedDetailProduct) && (
                <section className="detail-info-block">
                  <h3>{selectedDetailProduct.category === "保健食品" ? "食用方式" : "使用方式"}</h3>
                  <p>{getUsageText(selectedDetailProduct)}</p>
                </section>
              )}

              <section className="detail-info-block soft">
                <h3>配送提醒</h3>
                <p>滿 NT$3000 免運，僅提供宅配。</p>
                <p>送出清單後，請至 LINE 與客服確認庫存、金額、付款方式與宅配資訊。</p>
              </section>

              <section className="detail-info-block">
                <div className="related-heading">
                  <h3>相關商品</h3>
                  <span>同系列 / 同分類推薦</span>
                </div>
                <div className="related-products">
                  {getRelatedProducts(selectedDetailProduct).map((item) => (
                    <button
                      type="button"
                      className="related-card"
                      key={`related-${item.id}`}
                      onClick={() => openRelatedDetail(item)}
                    >
                      <div className="related-image">
                        {hasRealImage(item) ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <span>圖片準備中</span>
                        )}
                      </div>
                      <strong>{getCardName(item)}</strong>
                      <p>{displayPrice(item)}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      )}

      {isSuccessOpen && (
        <section className="success-backdrop" onClick={() => setIsSuccessOpen(false)}>
          <div className="success-modal" onClick={(event) => event.stopPropagation()}>
            <div className="success-icon">✓</div>
            <h2>訂購清單已送至後台！</h2>
            <p>
              我們已收到你的訂購清單。接下來請至 LINE 與小幫手確認商品、金額與宅配資訊。
            </p>

            <div className="success-checklist">
              <p>請至 LINE 與小幫手確認訂單內容。</p>
              <p>小幫手會確認：庫存、效期、金額與宅配資訊。</p>
              <p>確認無誤後，小幫手會傳送匯款資訊給您。</p>
              <p>LINE ID：@chateau-buy</p>
            </div>

            <div className="success-actions">
              <a
                className="success-line-button"
                href="https://line.me/R/ti/p/@chateau-buy"
                target="_blank"
                rel="noopener noreferrer"
              >
                加入 LINE 確認訂單
              </a>

              <button
                className="success-continue-button"
                onClick={() => setIsSuccessOpen(false)}
              >
                繼續逛商品
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="notice-section">
        <div className="section-heading compact">
          <p>Notice</p>
          <h2>購買提醒</h2>
        </div>

        <div className="notice-card">
          <p><strong>送出訂購清單後，系統會先將訂單送至後台。</strong></p>
          <p>請至 LINE 與小幫手確認商品庫存、效期、訂單金額與宅配資訊。</p>
          <p>確認無誤後，小幫手會提供匯款資訊給您。</p>
          <p>完成匯款後，訂單才會正式成立。</p>
          <p>滿 NT$3000 免運，僅提供宅配。</p>
        </div>
      </section>

      <footer className="footer">
        <h2>加入 LINE 詢問</h2>

        <p className="line-id">LINE ID：@chateau-buy</p>

        <a
          className="line-button"
          href="https://line.me/R/ti/p/@chateau-buy"
          target="_blank"
          rel="noopener noreferrer"
        >
          點我加入 LINE
        </a>

        <div className="line-qr-card">
          <img src="/line-qrcode.png" alt="LINE QR Code" />
        </div>

        <p className="footer-note">
          掃描 QR Code 或搜尋 LINE ID：@chateau-buy
        </p>

        <p className="footer-price-note">
          滿 NT$3000 免運，僅提供宅配。商品價格與優惠組合依當日公告為準。
        </p>
      </footer>

      <style jsx global>{`

        :root {
          --bg: #f8f1ea;
          --card: #fffaf6;
          --card-strong: #ffffff;
          --ink: #3d3028;
          --muted: #8f7d70;
          --soft: #efe2d7;
          --soft-2: #f5ebe2;
          --line: #eadbd0;
          --accent: #b24133;
          --accent-dark: #7b2d24;
          --gold: #b78a48;
          --shadow: 0 16px 45px rgba(77, 55, 38, 0.12);
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background:
            radial-gradient(circle at top left, rgba(183, 138, 72, 0.18), transparent 30%),
            linear-gradient(180deg, #fffaf6 0%, var(--bg) 45%, #f5eadf 100%);
          color: var(--ink);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
        }

        .site-shell {
          width: min(100%, 520px);
          margin: 0 auto;
          padding: 14px 14px 92px;
        }

        .top-header {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: -14px -14px 14px;
          padding: 14px;
          background: rgba(255, 250, 246, 0.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(234, 219, 208, 0.75);
        }

        .top-header h1 {
          margin: 2px 0 2px;
          color: var(--ink);
          font-size: 18px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .top-header p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.4;
        }

        .top-eyebrow {
          color: var(--gold) !important;
          font-size: 11px !important;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .search-panel {
          margin: -2px 0 16px;
          padding: 12px;
          border: 1px solid rgba(234, 219, 208, 0.95);
          border-radius: 22px;
          background: rgba(255, 250, 246, 0.96);
          box-shadow: 0 12px 28px rgba(77, 55, 38, 0.08);
        }

        .search-input-wrap {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 8px;
          min-height: 44px;
          padding: 0 8px 0 12px;
          border: 1px solid var(--line);
          border-radius: 999px;
          background: #fff;
        }

        .search-input-wrap input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--ink);
          font-size: 14px;
          font-weight: 800;
        }

        .search-input-wrap button {
          border: 0;
          border-radius: 999px;
          padding: 7px 10px;
          background: var(--soft);
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 950;
        }

        .search-panel p {
          margin: 8px 4px 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
          font-weight: 700;
        }

        .icon-button.active {
          background: var(--ink);
          color: #fff;
        }

        .header-cart-button {
          flex-shrink: 0;
          border: 0;
          border-radius: 999px;
          padding: 9px 12px;
          background: var(--ink);
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 10px 22px rgba(61, 48, 40, 0.18);
        }

        .header-cart-button span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          margin-left: 5px;
          border-radius: 999px;
          background: var(--accent);
          color: #fff;
        }


        .menu-button,
        .icon-button {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border: 1px solid var(--line);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          color: var(--ink);
          font-size: 22px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px rgba(77, 55, 38, 0.08);
        }

        .icon-button {
          font-size: 18px;
        }

        .brand-block {
          min-width: 0;
          flex: 1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 70;
          background: rgba(31, 24, 20, 0.42);
          display: flex;
          align-items: stretch;
          justify-content: flex-start;
        }

        .side-drawer {
          width: min(88vw, 430px);
          height: 100vh;
          overflow-y: auto;
          padding: 18px 16px 24px;
          background:
            linear-gradient(180deg, rgba(255, 250, 246, 0.98), rgba(248, 241, 234, 0.98));
          box-shadow: 24px 0 60px rgba(31, 24, 20, 0.26);
          animation: drawerIn 0.18s ease-out;
        }

        @keyframes drawerIn {
          from { transform: translateX(-18px); opacity: 0.8; }
          to { transform: translateX(0); opacity: 1; }
        }

        .drawer-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--line);
        }

        .drawer-head p {
          margin: 0 0 4px;
          color: var(--gold);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .drawer-head h2 {
          margin: 0 0 4px;
          color: var(--ink);
          font-size: 22px;
          line-height: 1.2;
          letter-spacing: -0.04em;
        }

        .drawer-head span {
          color: var(--muted);
          font-size: 13px;
          font-weight: 800;
        }

        .drawer-head button {
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 50%;
          background: #efe3d8;
          color: var(--ink);
          font-size: 28px;
          line-height: 1;
        }

        .drawer-rule-card {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin: 14px 0;
          padding: 14px;
          border-radius: 20px;
          background: #3f342c;
          color: #fff;
        }

        .drawer-rule-card strong {
          font-size: 16px;
          line-height: 1.35;
        }

        .drawer-rule-card span {
          color: rgba(255, 255, 255, 0.76);
          font-size: 13px;
          line-height: 1.55;
        }

        .drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .drawer-section {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .drawer-section p {
          grid-column: 1 / -1;
          margin: 0 0 2px;
          color: var(--gold);
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .drawer-section button {
          min-height: 43px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.8);
          color: var(--ink);
          font-size: 14px;
          font-weight: 900;
          text-align: left;
          padding: 10px 12px;
        }

        .drawer-section button:hover {
          border-color: rgba(178, 65, 51, 0.32);
          background: #fff;
        }

        .drawer-section-wide {
          grid-template-columns: 1fr;
        }

        .drawer-line-button {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 18px;
          min-height: 48px;
          border-radius: 999px;
          background: var(--accent);
          color: #fff;
          font-size: 15px;
          font-weight: 950;
          text-decoration: none;
          box-shadow: 0 12px 24px rgba(178, 65, 51, 0.20);
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          padding: 24px 18px 18px;
          border: 1px solid rgba(183, 138, 72, 0.28);
          border-radius: 30px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(255, 244, 234, 0.92)),
            radial-gradient(circle at right top, rgba(183, 138, 72, 0.20), transparent 34%);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .hero-copy h2 {
          margin: 8px 0 10px;
          color: var(--ink);
          font-size: 32px;
          line-height: 1.08;
          letter-spacing: -0.06em;
        }

        .hero-copy p {
          margin: 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.75;
        }

        .small-title {
          display: inline-flex;
          width: fit-content;
          margin: 0 !important;
          padding: 6px 10px;
          border: 1px solid rgba(183, 138, 72, 0.28);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          color: var(--gold) !important;
          font-size: 11px !important;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 18px;
        }

        .hero-actions button,
        .hero-actions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          border: 0;
          border-radius: 999px;
          padding: 11px 12px;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
        }

        .hero-actions button {
          background: var(--accent);
          color: #fff;
          box-shadow: 0 12px 24px rgba(178, 65, 51, 0.2);
        }

        .hero-actions a {
          background: #fff;
          color: var(--ink);
          border: 1px solid var(--line);
        }

        .hero-card {
          padding: 16px;
          border-radius: 24px;
          background: #3f342c;
          color: #fff;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .hero-card p {
          margin: 0 0 6px;
          color: rgba(255, 255, 255, 0.68);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .hero-card strong {
          display: block;
          font-size: 24px;
          line-height: 1.1;
        }

        .hero-card span {
          display: block;
          margin-top: 10px;
          color: rgba(255, 255, 255, 0.74);
          font-size: 13px;
          line-height: 1.65;
        }

        .trust-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 14px;
        }

        .trust-card {
          min-height: 128px;
          padding: 12px 10px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: rgba(255, 250, 246, 0.84);
          box-shadow: 0 10px 26px rgba(77, 55, 38, 0.06);
        }

        .trust-card span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--soft);
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 900;
        }

        .trust-card h3 {
          margin: 9px 0 5px;
          color: var(--ink);
          font-size: 14px;
          line-height: 1.25;
        }

        .trust-card p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
        }

        .featured-section,
        .filter-section,
        .notice-section {
          margin-top: 24px;
        }

        .section-heading {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-bottom: 12px;
        }

        .section-heading.compact {
          margin-bottom: 10px;
        }

        .section-heading p {
          margin: 0;
          color: var(--gold);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .section-heading h2 {
          margin: 0;
          color: var(--ink);
          font-size: 24px;
          line-height: 1.2;
          letter-spacing: -0.04em;
        }

        .section-heading span {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .featured-card {
          display: grid;
          grid-template-columns: 42% 1fr;
          gap: 12px;
          min-height: 180px;
          padding: 12px;
          border: 1px solid rgba(183, 138, 72, 0.22);
          border-radius: 26px;
          background: rgba(255, 250, 246, 0.95);
          box-shadow: 0 12px 34px rgba(77, 55, 38, 0.09);
        }

        .featured-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .featured-info h3 {
          margin: 6px 0 6px;
          color: var(--ink);
          font-size: 18px;
          line-height: 1.25;
          letter-spacing: -0.03em;
        }

        .featured-info .description {
          -webkit-line-clamp: 3;
        }

        .category-bar,
        .subcategory-bar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 3px 1px 9px;
          scrollbar-width: none;
        }

        .category-bar::-webkit-scrollbar,
        .subcategory-bar::-webkit-scrollbar {
          display: none;
        }

        .category-button,
        .subcategory-button {
          flex: 0 0 auto;
          border: 1px solid var(--line);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.78);
          color: var(--muted);
          font-weight: 900;
          white-space: nowrap;
        }

        .category-button {
          padding: 11px 15px;
          font-size: 14px;
        }

        .subcategory-button {
          padding: 9px 12px;
          font-size: 13px;
        }

        .category-button.active,
        .subcategory-button.active {
          background: var(--ink);
          color: #fff;
          border-color: var(--ink);
          box-shadow: 0 10px 22px rgba(61, 48, 40, 0.18);
        }

        .catalog-helper-card {
          display: grid;
          gap: 5px;
          padding: 12px 14px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.82);
          color: var(--ink);
        }

        .catalog-helper-card strong {
          font-size: 14px;
          line-height: 1.4;
        }

        .catalog-helper-card span {
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
          font-weight: 800;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .product-card {
          display: flex;
          min-width: 0;
          min-height: 100%;
          flex-direction: column;
          border: 1px solid rgba(234, 219, 208, 0.95);
          border-radius: 24px;
          overflow: hidden;
          background: var(--card-strong);
          box-shadow: 0 12px 30px rgba(77, 55, 38, 0.08);
        }

        .product-image {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1.06;
          background:
            radial-gradient(circle at center, rgba(255, 255, 255, 0.95), rgba(242, 229, 218, 0.78));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .featured-image {
          height: 100%;
          min-height: 156px;
          aspect-ratio: auto;
          border-radius: 20px;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          max-width: none;
          max-height: none;
          object-fit: contain;
          transform: scale(1.12);
          filter: drop-shadow(0 10px 14px rgba(55, 40, 30, 0.08));
        }

        .image-placeholder {
          width: calc(100% - 24px);
          min-height: 82%;
          border: 1px dashed rgba(183, 138, 72, 0.38);
          border-radius: 20px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.74), rgba(247, 236, 225, 0.66));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px;
          text-align: center;
        }

        .image-placeholder span {
          color: var(--gold);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .image-placeholder strong {
          margin-top: 6px;
          color: var(--ink);
          font-size: 13px;
          line-height: 1.35;
        }

        .product-info {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 12px;
        }

        .product-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }

        .product-meta-row span {
          flex-shrink: 0;
          border-radius: 999px;
          padding: 3px 7px;
          background: #f4e7dd;
          color: var(--accent-dark);
          font-size: 10px;
          font-weight: 900;
        }

        .sold-out-badge {
          background: #eee7e0 !important;
          color: #8a7d72 !important;
        }

        .series-label {
          margin: 0;
          color: var(--gold);
          font-size: 11px;
          font-weight: 900;
          line-height: 1.3;
          letter-spacing: 0.02em;
        }

        .product-info h3 {
          margin: 5px 0 7px;
          color: var(--ink);
          font-size: 16px;
          line-height: 1.34;
          letter-spacing: -0.03em;
        }

        .description {
          display: -webkit-box;
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .price-block {
          margin-top: auto;
          padding-top: 10px;
        }

        .original-price {
          margin: 0 0 3px;
          color: #a5978b;
          font-size: 12px;
          line-height: 1.35;
          text-decoration: line-through;
        }

        .price {
          margin: 0;
          color: var(--accent);
          font-size: 19px;
          font-weight: 950;
          line-height: 1.25;
          letter-spacing: -0.04em;
        }

        .price.inquiry {
          color: var(--ink);
          font-size: 17px;
        }

        .add-cart-button {
          width: 100%;
          margin-top: 12px;
          border: 0;
          border-radius: 999px;
          padding: 11px 12px;
          background: var(--ink);
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          box-shadow: 0 9px 18px rgba(61, 48, 40, 0.14);
        }

        .add-cart-button:disabled {
          background: #c9c0b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .detail-button {
          width: 100%;
          margin-top: 8px;
          border: 1px solid rgba(178, 65, 51, 0.32);
          border-radius: 999px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.82);
          color: var(--accent-dark);
          font-size: 13px;
          font-weight: 900;
        }

        .detail-backdrop {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0, 0, 0, 0.38);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 12px;
        }

        .detail-panel {
          width: min(100%, 520px);
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 30px 30px 18px 18px;
          background: #fffaf5;
          box-shadow: 0 -18px 42px rgba(0, 0, 0, 0.26);
        }

        .detail-header {
          position: sticky;
          top: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255, 250, 245, 0.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--line);
        }

        .detail-header h2 {
          margin: 0;
          color: var(--ink);
          font-size: 18px;
          letter-spacing: -0.03em;
        }

        .detail-close,
        .detail-cart-button {
          border: 0;
          border-radius: 999px;
          background: #efe4db;
          color: var(--ink);
          font-weight: 900;
        }

        .detail-close {
          width: 38px;
          height: 38px;
          font-size: 28px;
          line-height: 1;
        }

        .detail-cart-button {
          padding: 9px 12px;
          font-size: 13px;
        }

        .detail-main-image {
          width: calc(100% - 24px);
          aspect-ratio: 1 / 1.06;
          margin: 12px auto 0;
          border-radius: 24px;
          background: radial-gradient(circle at center, #ffffff 0%, #f5eadf 78%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid rgba(234, 219, 208, 0.9);
        }

        .detail-main-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transform: scale(1.08);
          filter: drop-shadow(0 14px 20px rgba(55, 40, 30, 0.10));
        }

        .detail-placeholder {
          width: calc(100% - 36px);
          height: calc(100% - 36px);
        }

        .detail-content {
          padding: 16px;
        }

        .detail-title-row h1 {
          margin: 7px 0 6px;
          color: var(--ink);
          font-size: 26px;
          line-height: 1.18;
          letter-spacing: -0.05em;
        }

        .detail-description {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .detail-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 12px;
        }

        .detail-price-card {
          margin-top: 14px;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: #ffffff;
        }

        .detail-price-card .price {
          font-size: 26px;
        }

        .detail-add-button {
          width: 100%;
          margin-top: 12px;
          border: 0;
          border-radius: 999px;
          padding: 15px 16px;
          background: var(--accent);
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
          box-shadow: 0 12px 24px rgba(178, 65, 51, 0.22);
        }

        .detail-add-button:disabled {
          background: #c9c0b8;
          box-shadow: none;
          cursor: not-allowed;
        }

        .detail-info-block {
          margin-top: 14px;
          padding: 15px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: #ffffff;
        }

        .detail-info-block.soft {
          background: #fff4eb;
          border-style: dashed;
        }

        .detail-info-block h3,
        .related-heading h3 {
          margin: 0 0 9px;
          color: var(--ink);
          font-size: 17px;
          letter-spacing: -0.03em;
        }

        .detail-info-block p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .detail-info-block p + p {
          margin-top: 6px;
        }

        .related-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .related-heading span {
          color: var(--muted);
          font-size: 12px;
          white-space: nowrap;
        }

        .related-products {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .related-card {
          min-width: 0;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: #fffaf6;
          padding: 8px;
          text-align: left;
        }

        .related-image {
          width: 100%;
          aspect-ratio: 1 / 0.9;
          border-radius: 14px;
          background: var(--soft-2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .related-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transform: scale(1.08);
        }

        .related-image span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 900;
        }

        .related-card strong {
          display: -webkit-box;
          margin-top: 8px;
          color: var(--ink);
          font-size: 13px;
          line-height: 1.35;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .related-card p {
          margin: 5px 0 0;
          color: var(--accent);
          font-size: 13px;
          font-weight: 900;
        }

        .floating-cart-button {
          position: fixed;
          right: max(16px, calc((100vw - 520px) / 2 + 16px));
          bottom: 18px;
          z-index: 30;
          border: 0;
          border-radius: 999px;
          padding: 13px 18px;
          background: var(--accent);
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          box-shadow: 0 14px 32px rgba(178, 65, 51, 0.28);
        }

        .notice-card {
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: rgba(255, 250, 246, 0.84);
          box-shadow: 0 10px 26px rgba(77, 55, 38, 0.06);
        }

        .notice-card p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.75;
        }

        .notice-card p + p {
          margin-top: 8px;
        }

        .cart-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.36);
          display: flex;
          justify-content: center;
          align-items: flex-end;
          padding: 14px;
        }

        .cart-panel {
          width: min(100%, 520px);
          max-height: 88vh;
          overflow-y: auto;
          background: #fffaf5;
          border-radius: 28px 28px 18px 18px;
          padding: 18px;
          box-shadow: 0 -12px 34px rgba(0, 0, 0, 0.24);
        }

        .cart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .cart-eyebrow {
          margin: 0 0 4px;
          font-size: 12px;
          color: var(--gold);
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .cart-header h2 {
          margin: 0;
          color: var(--ink);
          font-size: 24px;
        }

        .cart-header span {
          display: block;
          margin-top: 5px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.55;
        }

        .cart-close {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: #eee4db;
          color: var(--ink);
          font-size: 28px;
          line-height: 1;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 12px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid var(--line);
        }

        .cart-item h3 {
          margin: 3px 0 6px;
          color: var(--ink);
          font-size: 15px;
          line-height: 1.35;
        }

        .cart-item p {
          margin: 0;
          color: var(--accent);
          font-size: 13px;
          font-weight: 900;
          line-height: 1.45;
        }

        .cart-item-series {
          color: var(--muted) !important;
          font-size: 12px !important;
          font-weight: 900 !important;
        }

        .cart-quantity-control {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .cart-quantity-control button {
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 50%;
          background: #eee4db;
          color: var(--ink);
          font-size: 19px;
          font-weight: 900;
        }

        .cart-quantity-control span {
          min-width: 18px;
          text-align: center;
          font-weight: 900;
          color: var(--ink);
        }

        .clear-cart-button {
          margin: 12px 0 16px;
          border: 0;
          background: transparent;
          color: var(--accent);
          font-weight: 900;
          text-decoration: underline;
        }

        .order-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid var(--line);
        }

        .order-form label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: var(--ink);
          font-size: 14px;
          font-weight: 900;
        }

        .order-form label span {
          color: var(--accent);
        }

        .order-form input,
        .order-form select,
        .order-form textarea {
          width: 100%;
          border: 1px solid #e1d5cb;
          border-radius: 14px;
          padding: 12px 13px;
          background: #ffffff;
          color: var(--ink);
          font-size: 16px;
          outline: none;
        }

        .order-form textarea {
          min-height: 92px;
          resize: vertical;
        }

        .submit-order-button {
          width: 100%;
          border: 0;
          border-radius: 999px;
          padding: 14px 16px;
          background: var(--accent);
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
          box-shadow: 0 12px 24px rgba(178, 65, 51, 0.20);
        }

        .submit-order-button:disabled {
          opacity: 0.65;
        }

        .form-message {
          margin: 0;
          padding: 11px 12px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.5;
        }

        .form-message.success {
          background: #e9f6ed;
          color: #267144;
        }

        .form-message.error {
          background: #fff0ee;
          color: var(--accent);
        }

        .order-form-note {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.65;
        }

        .empty-cart,
        .empty-section {
          padding: 24px 8px 10px;
          text-align: center;
        }

        .empty-cart h3,
        .empty-card h3 {
          margin: 0 0 8px;
          color: var(--ink);
        }

        .empty-cart p,
        .empty-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
        }

        .empty-card {
          padding: 20px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--card);
        }

        .footer {
          margin-top: 26px;
          padding: 26px 18px 24px;
          border-radius: 30px;
          background:
            linear-gradient(135deg, #3f342c, #261f1a);
          color: #fff;
          text-align: center;
          box-shadow: var(--shadow);
        }

        .footer h2 {
          margin: 0 0 8px;
          font-size: 24px;
          letter-spacing: -0.04em;
        }

        .line-id {
          margin: 12px 0 14px;
          font-size: 18px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.02em;
        }

        .line-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          padding: 12px 20px;
          background: #ffffff;
          color: var(--ink);
          border-radius: 999px;
          font-size: 15px;
          font-weight: 900;
          text-decoration: none;
        }

        .line-qr-card {
          width: 180px;
          height: 180px;
          margin: 4px auto 14px;
          padding: 10px;
          background: #ffffff;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .line-qr-card img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .footer-note {
          margin: 8px auto 0;
          color: rgba(255, 255, 255, 0.86);
          font-size: 14px;
          line-height: 1.7;
        }

        .footer-price-note {
          margin: 12px auto 0;
          color: rgba(255, 255, 255, 0.62);
          font-size: 13px;
          line-height: 1.7;
        }



        /* Phase 2: bigger mobile storefront cards */
        .product-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .product-card .product-image {
          aspect-ratio: 4 / 5;
        }

        .product-image img {
          transform: scale(1.18);
        }

        .product-card .description {
          display: none;
        }

        .product-info {
          padding: 13px;
        }

        .product-info h3 {
          display: -webkit-box;
          min-height: 44px;
          margin-bottom: 9px;
          font-size: 17px;
          line-height: 1.3;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .product-card .price {
          font-size: 21px;
        }

        .product-card .price.inquiry {
          font-size: 18px;
        }

        .tag-row {
          min-height: 30px;
        }

        .add-cart-button {
          min-height: 43px;
        }

        .featured-card .description {
          display: -webkit-box;
        }

        @media (max-width: 370px) {
          .site-shell {
            padding-left: 10px;
            padding-right: 10px;
          }

          .top-header {
            margin-left: -10px;
            margin-right: -10px;
          }

          .hero-copy h2 {
            font-size: 28px;
          }

          .trust-section {
            grid-template-columns: 1fr;
          }

          .featured-card {
            grid-template-columns: 1fr;
          }

          .featured-image {
            min-height: 190px;
          }

          .product-grid {
            gap: 10px;
          }

          .product-info {
            padding: 10px;
          }

          .product-info h3 {
            font-size: 15px;
          }

          .price {
            font-size: 17px;
          }
        }

        .announcement-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          margin: -14px -14px 0;
          padding: 8px 14px;
          background: linear-gradient(90deg, #3d3028, #6b4939);
          color: #fff7ef;
          font-size: 12px;
          font-weight: 900;
          line-height: 1.55;
          text-align: center;
          letter-spacing: 0.01em;
          overflow: visible;
        }

        .top-header {
          top: 0;
        }

        .hero-card .shipping-rule {
          display: grid;
          gap: 8px;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.16);
        }

        .hero-card .shipping-rule em {
          font-style: normal;
          color: #fff;
          font-size: 14px;
          font-weight: 900;
        }

        .skin-guide-section {
          margin-top: 24px;
          padding: 16px;
          border: 1px solid rgba(183, 138, 72, 0.24);
          border-radius: 28px;
          background:
            radial-gradient(circle at right top, rgba(255, 221, 183, 0.55), transparent 40%),
            rgba(255, 250, 246, 0.90);
          box-shadow: 0 12px 34px rgba(77, 55, 38, 0.08);
        }

        .skin-guide-copy {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .skin-guide-copy h2 {
          margin: 0 0 5px;
          color: var(--ink);
          font-size: 22px;
          letter-spacing: -0.04em;
        }

        .skin-guide-copy p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .skin-mascot {
          flex-shrink: 0;
          width: 58px;
          height: 58px;
          border-radius: 20px;
          background: linear-gradient(135deg, #fff2e6, #e9d2bc);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.75);
          color: var(--accent-dark);
          font-size: 28px;
        }

        .skin-filter-grid {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none;
        }

        .skin-filter-grid::-webkit-scrollbar {
          display: none;
        }

        .skin-filter-button {
          flex: 0 0 auto;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.82);
          color: var(--muted);
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
        }

        .skin-filter-button.active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
          box-shadow: 0 10px 22px rgba(178, 65, 51, 0.18);
        }

        .active-filter-note {
          margin: 10px 0 0;
          color: var(--accent-dark);
          font-size: 13px;
          font-weight: 900;
          line-height: 1.5;
        }

        .tag-row {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin: 7px 0 0;
        }

        .need-tag,
        .combo-badge,
        .combo-badge-mini {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 999px;
          padding: 4px 7px;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.2;
          white-space: nowrap;
        }

        .need-tag {
          background: #f4e9df;
          color: var(--muted);
        }

        .combo-badge,
        .combo-badge-mini {
          background: #fff0df;
          color: var(--accent-dark);
          border: 1px solid rgba(183, 138, 72, 0.28);
          cursor: pointer;
        }

        .combo-badge-mini {
          margin-top: 9px;
          width: fit-content;
          padding: 6px 9px;
          font-size: 11px;
        }

        .delivery-summary {
          display: grid;
          gap: 6px;
          padding: 12px;
          border-radius: 18px;
          background: #fff3e6;
          border: 1px solid rgba(183, 138, 72, 0.26);
          color: var(--ink);
          font-size: 13px;
          line-height: 1.55;
        }

        .delivery-summary strong {
          color: var(--accent-dark);
        }

        .success-backdrop {
          position: fixed;
          inset: 0;
          z-index: 70;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(0, 0, 0, 0.38);
        }

        .success-modal {
          width: min(100%, 460px);
          border-radius: 30px;
          padding: 22px 18px 18px;
          background:
            radial-gradient(circle at top right, rgba(255, 218, 181, 0.55), transparent 42%),
            #fffaf5;
          box-shadow: 0 22px 60px rgba(0,0,0,0.25);
          border: 1px solid rgba(234, 219, 208, 0.95);
          text-align: center;
        }

        .success-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 12px;
          border-radius: 24px;
          background: linear-gradient(135deg, #f8dfcb, #fff4e8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-dark);
          font-size: 32px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .success-modal h2 {
          margin: 0 0 8px;
          color: var(--ink);
          font-size: 25px;
          letter-spacing: -0.04em;
        }

        .success-modal > p {
          margin: 0 auto 14px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .success-checklist {
          display: grid;
          gap: 8px;
          margin: 14px 0;
          padding: 14px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid var(--line);
          text-align: left;
        }

        .success-checklist p {
          margin: 0;
          color: var(--ink);
          font-size: 13px;
          font-weight: 800;
          line-height: 1.5;
        }

        .success-actions {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .success-line-button,
        .success-continue-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          border-radius: 999px;
          padding: 12px 15px;
          font-size: 15px;
          font-weight: 900;
          text-decoration: none;
        }

        .success-line-button {
          background: var(--accent);
          color: #fff;
          box-shadow: 0 12px 24px rgba(178, 65, 51, 0.20);
        }

        .success-continue-button {
          border: 1px solid var(--line);
          background: #fff;
          color: var(--ink);
        }

        .notice-card strong {
          color: var(--accent-dark);
        }



        /* Phase 2: bigger mobile storefront cards */
        .product-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .product-card .product-image {
          aspect-ratio: 4 / 5;
        }

        .product-image img {
          transform: scale(1.18);
        }

        .product-card .description {
          display: none;
        }

        .product-info {
          padding: 13px;
        }

        .product-info h3 {
          display: -webkit-box;
          min-height: 44px;
          margin-bottom: 9px;
          font-size: 17px;
          line-height: 1.3;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .product-card .price {
          font-size: 21px;
        }

        .product-card .price.inquiry {
          font-size: 18px;
        }

        .tag-row {
          min-height: 30px;
        }

        .add-cart-button {
          min-height: 43px;
        }

        .featured-card .description {
          display: -webkit-box;
        }

        @media (max-width: 370px) {
          .skin-guide-copy {
            flex-direction: column;
          }
        }

        .announcement-bar {
          margin: 0 -14px 0;
          padding: 8px 12px;
          background: linear-gradient(90deg, #5a4034, #a96f3f);
          color: #fff;
          text-align: center;
          font-size: 12px;
          font-weight: 900;
          line-height: 1.35;
        }

        .hero-home-section,
        .quick-entry-section,
        .home-product-section,
        .skin-guide-home-section,
        .series-entry-section,
        .brand-entry-section {
          margin-top: 18px;
        }

        .hero-home-banner {
          position: relative;
          min-height: 300px;
          padding: 24px 18px;
          border: 1px solid rgba(183, 138, 72, 0.26);
          border-radius: 32px;
          background-size: cover;
          background-position: center;
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .hero-home-banner::before,
        .home-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 18% 24%, rgba(255, 255, 255, 0.9), transparent 22%),
            radial-gradient(circle at 82% 20%, rgba(183, 138, 72, 0.16), transparent 26%);
          pointer-events: none;
        }

        .hero-home-copy {
          position: relative;
          z-index: 2;
          max-width: 72%;
        }

        .hero-home-copy p,
        .home-banner-copy p {
          margin: 0 0 8px;
          color: var(--gold);
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .hero-home-copy h2 {
          margin: 0 0 8px;
          color: var(--ink);
          font-size: 34px;
          line-height: 1.06;
          letter-spacing: -0.07em;
        }

        .hero-home-copy strong {
          display: block;
          color: var(--accent-dark);
          font-size: 17px;
          line-height: 1.35;
        }

        .hero-home-copy span {
          display: block;
          margin-top: 10px;
          color: var(--muted);
          font-size: 14px;
          font-weight: 750;
          line-height: 1.65;
        }

        .hero-home-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 16px;
        }

        .hero-home-actions button {
          min-height: 42px;
          border: 0;
          border-radius: 999px;
          background: var(--accent);
          color: #fff;
          font-size: 13px;
          font-weight: 950;
          box-shadow: 0 12px 24px rgba(178, 65, 51, 0.2);
        }

        .hero-home-actions button.ghost {
          background: rgba(255, 255, 255, 0.86);
          color: var(--ink);
          border: 1px solid var(--line);
          box-shadow: none;
        }

        .mascot-image {
          display: block;
          object-fit: contain;
          pointer-events: none;
          user-select: none;
        }

        .hero-mascot {
          position: absolute;
          z-index: 1;
          bottom: -12px;
          max-height: 185px;
          filter: drop-shadow(0 14px 18px rgba(77, 55, 38, 0.12));
        }

        .hero-mascot.left {
          left: -14px;
          width: 34%;
          opacity: 0.92;
        }

        .hero-mascot.right {
          right: -12px;
          width: 36%;
          opacity: 0.96;
        }

        .quick-entry-grid,
        .need-card-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .quick-entry-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .quick-entry-grid button,
        .need-card,
        .series-entry-card,
        .brand-entry-card {
          border: 1px solid var(--line);
          border-radius: 22px;
          background: rgba(255, 250, 246, 0.92);
          color: var(--ink);
          box-shadow: 0 10px 24px rgba(77, 55, 38, 0.06);
          text-align: left;
        }

        .quick-entry-grid button {
          min-height: 88px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 3px;
          text-align: center;
        }

        .quick-entry-grid strong,
        .need-card strong,
        .series-entry-card strong,
        .brand-entry-card strong {
          display: block;
          color: var(--ink);
          font-size: 15px;
          font-weight: 950;
          line-height: 1.25;
        }

        .quick-entry-grid span,
        .need-card span,
        .series-entry-card span,
        .brand-entry-card span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
          line-height: 1.45;
        }

        .home-banner {
          position: relative;
          min-height: 166px;
          margin-top: 24px;
          padding: 18px;
          border: 1px solid rgba(183, 138, 72, 0.25);
          border-radius: 28px;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          box-shadow: 0 14px 34px rgba(77, 55, 38, 0.09);
        }

        .home-banner.deal {
          border-color: rgba(178, 65, 51, 0.24);
          background-color: #fff1e6;
        }

        .home-banner.green {
          background-color: #f0f3e7;
        }

        .home-banner.pink {
          background-color: #fff0f2;
        }

        .home-banner.wood {
          background-color: #f6eadc;
        }

        .home-banner-copy {
          position: relative;
          z-index: 2;
          max-width: 70%;
        }

        .home-banner-copy h2 {
          margin: 0 0 5px;
          color: var(--ink);
          font-size: 26px;
          line-height: 1.1;
          letter-spacing: -0.05em;
        }

        .home-banner-copy strong {
          display: block;
          color: var(--accent-dark);
          font-size: 15px;
          line-height: 1.45;
        }

        .home-banner-copy span {
          display: block;
          margin-top: 7px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
          line-height: 1.55;
        }

        .home-banner-mascots {
          position: absolute;
          right: 12px;
          bottom: -6px;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          gap: 0;
          width: 42%;
          min-height: 120px;
        }

        .mini-mascot {
          width: 58%;
          max-height: 130px;
          margin-left: -20px;
          filter: drop-shadow(0 12px 16px rgba(77, 55, 38, 0.12));
        }

        .single-mascot {
          width: 96%;
          max-height: 150px;
          margin-left: auto;
          filter: drop-shadow(0 12px 16px rgba(77, 55, 38, 0.12));
        }

        .home-product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .home-more-button {
          width: 100%;
          min-height: 46px;
          margin-top: 12px;
          border: 1px solid rgba(178, 65, 51, 0.2);
          border-radius: 999px;
          background: #fff;
          color: var(--accent-dark);
          font-size: 14px;
          font-weight: 950;
          box-shadow: 0 10px 22px rgba(77, 55, 38, 0.06);
        }

        .need-card {
          min-height: 84px;
          padding: 14px;
        }

        .need-card.active {
          border-color: rgba(178, 65, 51, 0.34);
          background: #fff3ed;
          box-shadow: 0 12px 26px rgba(178, 65, 51, 0.10);
        }

        .series-entry-grid,
        .brand-entry-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .series-entry-card,
        .brand-entry-card {
          min-height: 76px;
          padding: 15px 16px;
        }


        @media (max-width: 380px) {
          .quick-entry-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero-home-copy,
          .home-banner-copy {
            max-width: 76%;
          }

          .hero-home-copy h2 {
            font-size: 30px;
          }
        }


        /* Phase 3 fix: announcement bar flush top + visible text */
        .site-shell {
          padding-top: 0;
        }

        .announcement-bar {
          margin: 0 -14px 0 !important;
          min-height: 38px;
          padding: 9px 12px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible !important;
          white-space: nowrap;
          background: linear-gradient(90deg, #5a4034, #a96f3f);
          color: #fff;
          text-align: center;
          font-size: 12px;
          font-weight: 950;
          line-height: 1.45 !important;
          letter-spacing: 0.01em;
        }

        .top-header {
          margin: 0 -14px 14px !important;
          top: 0;
        }

        .search-panel {
          margin-top: 0;
        }

        .search-results-block {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(234, 219, 208, 0.92);
        }

        .search-results-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .search-results-head strong {
          color: var(--ink);
          font-size: 15px;
          font-weight: 950;
        }

        .search-results-head span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 850;
        }

        .search-result-list {
          display: grid;
          gap: 10px;
        }

        .search-result-card {
          display: grid;
          grid-template-columns: 88px minmax(0, 1fr);
          gap: 10px;
          padding: 9px;
          border: 1px solid rgba(234, 219, 208, 0.95);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 10px 22px rgba(77, 55, 38, 0.07);
        }

        .search-result-image {
          position: relative;
          width: 88px;
          aspect-ratio: 4 / 5;
          border-radius: 14px;
          overflow: hidden;
          background:
            radial-gradient(circle at 35% 20%, rgba(255, 255, 255, 0.9), transparent 42%),
            linear-gradient(135deg, #fff8ef, #f1dfd0);
        }

        .search-result-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
          transform: scale(1.08);
        }

        .search-result-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 8px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 900;
          text-align: center;
          line-height: 1.35;
        }

        .search-result-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .search-result-info p {
          margin: 0;
          color: var(--gold);
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.04em;
        }

        .search-result-info h3 {
          display: -webkit-box;
          margin: 0;
          color: var(--ink);
          font-size: 14px;
          font-weight: 900;
          line-height: 1.35;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .search-result-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          min-height: 18px;
        }

        .search-result-tags span {
          border-radius: 999px;
          padding: 2px 6px;
          background: #f6e8dd;
          color: var(--accent-dark);
          font-size: 10px;
          font-weight: 950;
          line-height: 1.4;
        }

        .search-result-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
          min-width: 0;
        }

        .search-result-price strong {
          color: var(--accent);
          font-size: 17px;
          font-weight: 950;
          letter-spacing: -0.03em;
        }

        .search-result-price span {
          color: #a8978a;
          font-size: 12px;
          font-weight: 850;
          text-decoration: line-through;
        }

        .search-result-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: auto;
        }

        .search-result-actions button {
          min-height: 30px;
          border: 1px solid var(--line);
          border-radius: 999px;
          background: #fffaf6;
          color: var(--ink);
          font-size: 12px;
          font-weight: 950;
        }

        .search-result-actions button.primary {
          border: 0;
          background: var(--accent);
          color: #fff;
        }

        .search-result-actions button:disabled {
          opacity: 0.48;
          cursor: not-allowed;
        }

        .search-result-empty {
          padding: 14px;
          border: 1px dashed var(--line);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.74);
          color: var(--muted);
          font-size: 13px;
          font-weight: 800;
          line-height: 1.6;
        }

        .search-result-note {
          margin: 10px 2px 0 !important;
          color: var(--muted);
          font-size: 12px;
          font-weight: 750;
          line-height: 1.55;
        }

        @media (max-width: 370px) {
          .site-shell {
            padding-top: 0;
          }

          .announcement-bar {
            margin-left: -10px !important;
            margin-right: -10px !important;
            font-size: 11px;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .top-header {
            margin: 0 -10px 14px !important;
          }

          .search-result-card {
            grid-template-columns: 76px minmax(0, 1fr);
            gap: 8px;
          }

          .search-result-image {
            width: 76px;
          }

          .search-result-info h3 {
            font-size: 13px;
          }

          .search-result-price strong {
            font-size: 16px;
          }
        }


        /* Phase 4 fix: search opens as a dedicated page view */
        .search-page-view {
          position: fixed !important;
          inset: 0 !important;
          z-index: 3000 !important;
          width: 100% !important;
          max-width: none !important;
          height: 100dvh !important;
          margin: 0 !important;
          padding: calc(env(safe-area-inset-top, 0px) + 14px) 14px calc(env(safe-area-inset-bottom, 0px) + 24px) !important;
          border: 0 !important;
          border-radius: 0 !important;
          background:
            radial-gradient(circle at top left, rgba(245, 201, 176, 0.45), transparent 34%),
            linear-gradient(180deg, #fff8f1 0%, #f4e4d7 100%) !important;
          box-shadow: none !important;
          overflow-y: auto !important;
          overscroll-behavior: contain;
        }

        .search-page-head {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
          padding: 6px 2px 2px;
        }

        .search-page-head p {
          margin: 0 0 2px !important;
          color: var(--gold);
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .search-page-head h2 {
          margin: 0;
          color: var(--ink);
          font-size: 23px;
          font-weight: 950;
          letter-spacing: -0.04em;
        }

        .search-page-head span {
          display: block;
          margin-top: 2px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
          line-height: 1.45;
        }

        .search-back-button {
          width: 64px;
          min-height: 42px;
          border: 1px solid rgba(229, 213, 201, 0.95);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          color: var(--ink);
          font-size: 14px;
          font-weight: 950;
          box-shadow: 0 10px 24px rgba(78, 55, 35, 0.10);
        }

        .search-page-view .search-input-wrap {
          position: sticky;
          top: 0;
          z-index: 2;
          margin-bottom: 10px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 24px rgba(78, 55, 35, 0.08);
        }

        .search-page-view > p {
          margin: 10px 4px 12px !important;
          color: var(--muted);
          font-size: 13px;
          font-weight: 800;
          line-height: 1.65;
        }

        .search-page-view .search-results-block {
          margin-top: 12px;
          padding: 14px;
          border: 1px solid rgba(234, 219, 208, 0.92);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.74);
          box-shadow: 0 16px 38px rgba(78, 55, 35, 0.08);
        }

        .search-page-view .search-result-list {
          gap: 12px;
        }

        @media (min-width: 720px) {
          .search-page-view {
            max-width: 520px !important;
            left: 50% !important;
            transform: translateX(-50%);
            border-left: 1px solid rgba(234, 219, 208, 0.92) !important;
            border-right: 1px solid rgba(234, 219, 208, 0.92) !important;
          }
        }

        @media (max-width: 370px) {
          .search-page-head {
            grid-template-columns: 58px minmax(0, 1fr);
            gap: 10px;
          }

          .search-back-button {
            width: 58px;
            min-height: 40px;
            font-size: 13px;
          }

          .search-page-head h2 {
            font-size: 21px;
          }

          .search-page-view {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .search-page-view .search-results-block {
            padding: 10px;
            border-radius: 20px;
          }
        }


        /* Phase 5: series-style shopping homepage */
        .hero-home-notice {
          position: relative;
          z-index: 2;
          display: inline-flex;
          margin: 14px 0 0 !important;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.78);
          color: var(--muted) !important;
          font-size: 12px !important;
          font-weight: 850 !important;
          line-height: 1.45 !important;
          box-shadow: 0 10px 20px rgba(77, 55, 38, 0.08);
        }

        .home-product-section {
          padding: 0 2px;
          margin-top: 14px;
        }

        .home-product-section + .home-banner {
          margin-top: 34px;
        }

        .home-product-section .section-heading.compact {
          padding: 0 2px;
          margin-bottom: 12px;
        }

        .home-product-grid {
          gap: 18px 12px;
        }

        .home-more-button {
          display: none;
        }

        .product-grid {
          gap: 20px 12px;
        }

        .product-card {
          border: 0;
          border-radius: 0;
          overflow: visible;
          background: transparent;
          box-shadow: none;
        }

        .product-image {
          aspect-ratio: 4 / 5;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 8px 18px rgba(77, 55, 38, 0.08);
        }

        .product-image img {
          padding: 4px;
          transform: scale(1.06);
        }

        .product-info {
          padding: 10px 2px 0;
        }

        .product-meta-row {
          margin-bottom: 3px;
        }

        .series-label {
          color: #8e7c70;
          font-size: 11px;
          font-weight: 850;
        }

        .product-meta-row span {
          padding: 2px 6px;
          font-size: 10px;
        }

        .product-info h3 {
          display: -webkit-box;
          margin: 5px 0 8px;
          min-height: 42px;
          color: #26201d;
          font-size: 15.5px;
          line-height: 1.36;
          letter-spacing: -0.03em;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .product-info .description {
          display: none;
        }

        .tag-row {
          min-height: 22px;
          margin-bottom: 4px;
        }

        .need-tag,
        .combo-badge {
          padding: 3px 6px;
          font-size: 10.5px;
        }

        .price-block {
          padding-top: 4px;
        }

        .price {
          font-size: 22px;
          color: #d94c5c;
        }

        .price.inquiry {
          font-size: 18px;
        }

        .original-price {
          margin-bottom: 2px;
          font-size: 13px;
        }

        .add-cart-button {
          min-height: 36px;
          margin-top: 9px;
          padding: 9px 10px;
          font-size: 13px;
          box-shadow: none;
        }

        .detail-button {
          min-height: 32px;
          margin-top: 7px;
          padding: 8px 10px;
          font-size: 12.5px;
          background: #fff;
        }

        .filter-section {
          margin-top: 34px;
        }

        .catalog-helper-card {
          background: rgba(255, 255, 255, 0.78);
        }

        @media (max-width: 370px) {
          .home-product-grid,
          .product-grid {
            gap: 18px 10px;
          }

          .product-info h3 {
            font-size: 14.5px;
            min-height: 40px;
          }

          .price {
            font-size: 20px;
          }

          .add-cart-button {
            font-size: 12.5px;
          }
        }


        /* Phase 6: image-to-frame auto fit */
        .hero-home-banner,
        .home-banner {
          background-size: cover !important;
          background-position: center center !important;
          background-repeat: no-repeat !important;
        }

        .product-image,
        .featured-image,
        .search-result-image,
        .related-image {
          background: #fff !important;
        }

        .product-image img,
        .featured-image img,
        .related-image img {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
          object-fit: cover !important;
          object-position: center center !important;
          padding: 0 !important;
          transform: none !important;
        }

        .search-result-image img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center center !important;
          padding: 0 !important;
          transform: none !important;
        }

        .detail-main-image img {
          object-fit: contain !important;
          padding: 8px !important;
          transform: none !important;
        }

        .product-card.fit-contain .product-image img {
          object-fit: contain !important;
          padding: 6px !important;
        }


        /* Phase 7: product detail image fit */
        .detail-main-image {
          aspect-ratio: 1 / 1 !important;
          background: #fff !important;
        }

        .detail-main-image img {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
          object-fit: cover !important;
          object-position: center center !important;
          padding: 0 !important;
          transform: none !important;
          filter: none !important;
        }

        @media (max-width: 430px) {
          .detail-main-image {
            width: calc(100% - 18px) !important;
            border-radius: 22px !important;
          }
        }


        /* Phase 8: full-page product detail view */
        .detail-backdrop {
          position: fixed !important;
          inset: 0 !important;
          z-index: 3200 !important;
          display: block !important;
          padding: 0 !important;
          background:
            radial-gradient(circle at top left, rgba(245, 201, 176, 0.35), transparent 34%),
            linear-gradient(180deg, #fff8f1 0%, #fffaf5 46%, #f3e1d5 100%) !important;
          overflow-y: auto !important;
          overscroll-behavior: contain;
        }

        .detail-panel {
          width: min(100%, 520px) !important;
          min-height: 100dvh !important;
          max-height: none !important;
          margin: 0 auto !important;
          overflow: visible !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .detail-header {
          position: sticky !important;
          top: 0 !important;
          z-index: 5 !important;
          padding: calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px !important;
          border-bottom: 1px solid rgba(234, 219, 208, 0.95) !important;
          background: rgba(255, 250, 245, 0.94) !important;
          backdrop-filter: blur(18px) !important;
        }

        .detail-header h2 {
          font-size: 17px !important;
          font-weight: 950 !important;
        }

        .detail-close {
          width: 44px !important;
          height: 44px !important;
          background: rgba(239, 228, 219, 0.95) !important;
          font-size: 30px !important;
        }

        .detail-cart-button {
          min-height: 40px !important;
          padding: 10px 14px !important;
          background: rgba(239, 228, 219, 0.95) !important;
        }

        .detail-main-image {
          width: calc(100% - 28px) !important;
          aspect-ratio: 1 / 1 !important;
          margin: 16px auto 0 !important;
          border-radius: 24px !important;
          border: 1px solid rgba(234, 219, 208, 0.95) !important;
          background: #ffffff !important;
          box-shadow: 0 16px 34px rgba(77, 55, 38, 0.10) !important;
        }

        .detail-main-image img {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
          object-fit: cover !important;
          object-position: center center !important;
          padding: 0 !important;
          transform: none !important;
          filter: none !important;
        }

        .detail-content {
          padding: 18px 18px calc(env(safe-area-inset-bottom, 0px) + 34px) !important;
        }

        .detail-title-row {
          padding-top: 2px;
        }

        .detail-title-row h1 {
          font-size: 27px !important;
          line-height: 1.16 !important;
          letter-spacing: -0.055em !important;
        }

        .detail-description {
          font-size: 14px !important;
          line-height: 1.7 !important;
        }

        .detail-price-card {
          margin-top: 16px !important;
          border-radius: 22px !important;
          box-shadow: 0 12px 28px rgba(77, 55, 38, 0.08) !important;
        }

        .detail-price-card .price {
          font-size: 28px !important;
          color: #d94c5c !important;
        }

        .detail-add-button {
          min-height: 54px !important;
          margin-top: 14px !important;
          font-size: 17px !important;
          box-shadow: 0 14px 30px rgba(178, 65, 51, 0.22) !important;
        }

        .detail-info-block {
          margin-top: 16px !important;
          border-radius: 24px !important;
          box-shadow: 0 10px 24px rgba(77, 55, 38, 0.06) !important;
        }

        .related-products {
          gap: 10px !important;
        }

        .related-card {
          border-radius: 18px !important;
        }

        @media (min-width: 720px) {
          .detail-panel {
            border-left: 1px solid rgba(234, 219, 208, 0.95);
            border-right: 1px solid rgba(234, 219, 208, 0.95);
          }
        }

        @media (max-width: 370px) {
          .detail-main-image {
            width: calc(100% - 20px) !important;
            border-radius: 20px !important;
          }

          .detail-content {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .detail-title-row h1 {
            font-size: 24px !important;
          }

          .detail-price-card .price {
            font-size: 25px !important;
          }
        }


        /* Phase 9: formal commerce product content fields */
        .price-note {
          margin: 7px 0 0 !important;
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
          line-height: 1.55;
        }

        .detail-suitable-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .detail-suitable-tags span {
          padding: 7px 10px;
          border-radius: 999px;
          background: #f6e8dd;
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 950;
          line-height: 1.2;
        }

        .product-info .description,
        .featured-info .description {
          color: var(--muted);
          font-size: 12px;
          font-weight: 750;
          line-height: 1.45;
        }


        /* Phase 10: all-product editable commerce content */
        .detail-expiry-card {
          margin: 14px 0 0;
          padding: 13px 14px;
          border: 1px solid rgba(227, 202, 188, 0.95);
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(253, 239, 230, 0.92));
          box-shadow: 0 10px 22px rgba(77, 55, 38, 0.06);
        }

        .detail-expiry-card span {
          display: inline-flex;
          margin-bottom: 5px;
          padding: 4px 8px;
          border-radius: 999px;
          background: #f6e8dd;
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 950;
        }

        .detail-expiry-card p {
          margin: 0;
          color: var(--ink);
          font-size: 13px;
          font-weight: 850;
          line-height: 1.55;
        }

        .detail-info-block p {
          line-height: 1.7;
        }


        /* Phase 11: merge product intro + expiry into one 商品資訊 card */
        .product-summary-card {
          margin-top: 14px !important;
        }

        .product-info-lines {
          display: grid;
          gap: 8px;
          margin-top: 10px;
        }

        .product-info-lines > div {
          display: grid;
          grid-template-columns: 54px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          padding: 9px 10px;
          border-radius: 16px;
          background: #fff7f0;
          border: 1px solid rgba(234, 219, 208, 0.9);
        }

        .product-info-lines span {
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 950;
          line-height: 1.45;
        }

        .product-info-lines p {
          margin: 0 !important;
          color: var(--ink);
          font-size: 13px;
          font-weight: 850;
          line-height: 1.55 !important;
        }

        .product-intro-text {
          margin: 12px 2px 0 !important;
          color: var(--muted);
          font-size: 14px;
          font-weight: 780;
          line-height: 1.75 !important;
        }

        .detail-expiry-card {
          display: none !important;
        }


        /* Phase 12: formal mobile mall homepage V1 */
        .top-header {
          border-bottom: 1px solid rgba(234, 219, 208, 0.95);
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 8px 18px rgba(77, 55, 38, 0.06);
        }

        .brand-block h1 {
          color: var(--accent);
          font-size: 25px;
          letter-spacing: 0.02em;
        }

        .brand-block h1::after {
          content: "商城";
          display: inline-flex;
          margin-left: 5px;
          padding: 2px 6px 3px;
          border-radius: 7px;
          background: var(--accent);
          color: #fff;
          font-size: 17px;
          letter-spacing: 0;
          vertical-align: 2px;
        }

        .brand-block h1 {
          font-size: 0;
        }

        .brand-block h1::before {
          content: "佐登";
          color: var(--accent);
          font-size: 25px;
          letter-spacing: 0.02em;
        }

        .store-promo-stack {
          display: grid;
          gap: 14px;
          margin-top: 18px;
        }

        .store-promo-stack .home-banner {
          margin-top: 0;
        }

        .home-banner {
          min-height: 150px !important;
          border-radius: 10px !important;
          border: 1px solid rgba(234, 219, 208, 0.98) !important;
          background-position: center !important;
          box-shadow: none !important;
        }

        .home-banner::before {
          background:
            linear-gradient(90deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.58) 48%, rgba(255, 255, 255, 0.18)) !important;
        }

        .home-banner-copy {
          max-width: 74% !important;
        }

        .home-banner-copy p {
          color: var(--accent) !important;
          font-size: 11px !important;
          letter-spacing: 0.16em !important;
        }

        .home-banner-copy h2 {
          color: #2b221e !important;
          font-size: 24px !important;
          letter-spacing: -0.04em !important;
        }

        .home-banner-copy strong {
          color: var(--accent-dark) !important;
          font-size: 15px !important;
          font-weight: 950 !important;
        }

        .home-banner-copy span {
          color: #75665e !important;
          font-size: 12px !important;
          font-weight: 850 !important;
        }

        .home-banner-mascots,
        .mascot-image,
        .hero-mascot,
        .mini-mascot,
        .single-mascot {
          display: none !important;
        }

        .home-product-section {
          margin-top: 28px !important;
          padding: 0 !important;
        }

        .home-product-section + .home-product-section {
          margin-top: 32px !important;
        }

        .home-product-section + .home-banner {
          margin-top: 38px !important;
        }

        .home-product-section .section-heading.compact {
          align-items: center;
          margin-bottom: 16px;
          text-align: center;
        }

        .home-product-section .section-heading.compact p {
          color: var(--accent);
          font-size: 13px;
          letter-spacing: 0.18em;
        }

        .home-product-section .section-heading.compact h2 {
          font-size: 24px;
          letter-spacing: 0.02em;
        }

        .home-product-section .section-heading.compact h2::before,
        .home-product-section .section-heading.compact h2::after {
          color: var(--accent);
          font-weight: 700;
        }

        .home-product-section .section-heading.compact h2::before {
          content: "- ";
        }

        .home-product-section .section-heading.compact h2::after {
          content: " -";
        }

        .home-product-section .section-heading.compact span {
          max-width: 300px;
          color: #8b7a70;
          font-size: 12px;
          font-weight: 800;
        }

        .home-product-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 14px 12px !important;
        }

        .product-card {
          position: relative !important;
          display: flex !important;
          min-height: 100% !important;
          flex-direction: column !important;
          border: 1px solid rgba(224, 224, 224, 0.98) !important;
          border-radius: 0 !important;
          overflow: hidden !important;
          background: #fff !important;
          box-shadow: none !important;
        }

        .product-card::before {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          top: 10px;
          height: 28px;
          border-radius: 999px;
          background: transparent;
          pointer-events: none;
        }

        .product-image {
          aspect-ratio: 1 / 1.05 !important;
          border-radius: 0 !important;
          background: #fff !important;
          box-shadow: none !important;
          border-bottom: 0 !important;
        }

        .product-image img {
          padding: 12px !important;
          object-fit: contain !important;
          transform: none !important;
          filter: none !important;
        }

        .product-info {
          display: flex !important;
          flex: 1 !important;
          padding: 8px 10px 11px !important;
          text-align: center;
        }

        .product-meta-row {
          justify-content: center !important;
          gap: 5px !important;
          min-height: 24px;
          margin-bottom: 4px !important;
        }

        .series-label {
          padding: 5px 10px !important;
          border-radius: 999px !important;
          background: #f5eee8 !important;
          color: var(--accent-dark) !important;
          font-size: 11px !important;
          font-weight: 950 !important;
          line-height: 1 !important;
        }

        .product-meta-row span,
        .sold-out-badge {
          padding: 5px 8px !important;
          border-radius: 999px !important;
          background: var(--accent) !important;
          color: #fff !important;
          font-size: 11px !important;
          font-weight: 950 !important;
        }

        .product-info h3 {
          display: -webkit-box !important;
          min-height: 43px !important;
          margin: 8px 0 6px !important;
          color: #2b2927 !important;
          font-size: 15.5px !important;
          font-weight: 850 !important;
          line-height: 1.38 !important;
          letter-spacing: 0 !important;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-info .description {
          display: -webkit-box !important;
          min-height: 34px;
          color: #9a8b84 !important;
          font-size: 12px !important;
          font-weight: 750 !important;
          line-height: 1.45 !important;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .tag-row {
          justify-content: center !important;
          min-height: 26px !important;
          margin-top: 6px !important;
          margin-bottom: 5px !important;
        }

        .need-tag,
        .combo-badge {
          background: #fff3ed !important;
          color: var(--accent-dark) !important;
          border: 0 !important;
          font-size: 10.5px !important;
          font-weight: 950 !important;
        }

        .price-block {
          margin-top: auto !important;
          padding-top: 7px !important;
          text-align: center !important;
        }

        .original-price {
          margin-bottom: 2px !important;
          color: #b9aca4 !important;
          font-size: 13px !important;
          text-decoration-thickness: 1px;
        }

        .price {
          color: var(--accent) !important;
          font-size: 20px !important;
          font-weight: 950 !important;
          letter-spacing: 0.02em !important;
        }

        .price.inquiry {
          color: #db4d65 !important;
          font-size: 18px !important;
        }

        .add-cart-button {
          margin-top: 10px !important;
          min-height: 38px !important;
          border-radius: 999px !important;
          font-size: 13px !important;
        }

        .detail-button {
          min-height: 34px !important;
          margin-top: 7px !important;
          border-radius: 999px !important;
          background: #fff !important;
          font-size: 12px !important;
        }

        #delivery-home {
          margin-bottom: 30px !important;
        }

        @media (max-width: 370px) {
          .home-product-grid {
            gap: 12px 9px !important;
          }

          .product-info h3 {
            font-size: 14.5px !important;
          }

          .price {
            font-size: 18px !important;
          }
        }


        /* Phase 13: remove all IP/background character images from homepage banners */
        .home-banner {
          background-image: linear-gradient(135deg, rgba(255, 250, 246, 0.98), rgba(255, 239, 226, 0.92)) !important;
        }

        .home-banner::after {
          content: "";
          position: absolute;
          right: 14px;
          top: 18px;
          width: 84px;
          height: 84px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(178, 65, 51, 0.13), rgba(178, 65, 51, 0));
          pointer-events: none;
        }


        /* Phase 14: single purchase notice */
        .notice-section {
          margin-top: 30px !important;
        }

        .notice-card strong {
          color: var(--accent-dark);
        }

        .notice-card p:last-child {
          margin-top: 10px;
          font-weight: 900;
          color: var(--ink);
        }


        /* Phase 15: Beili Workshop + soap combo additions */
        .drawer-section button {
          word-break: keep-all;
        }


        /* Phase 16: drawer opens real collection pages */
        .collection-page-view {
          z-index: 3000 !important;
        }

        .collection-page-head,
        .collection-helper-card,
        .collection-product-grid,
        .collection-empty-card {
          width: min(100%, 520px);
          margin-left: auto;
          margin-right: auto;
        }

        .collection-helper-card {
          display: grid;
          gap: 5px;
          margin-top: 4px;
          margin-bottom: 14px;
          padding: 12px 14px;
          border: 1px solid rgba(234, 219, 208, 0.96);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 10px 24px rgba(77, 55, 38, 0.07);
        }

        .collection-helper-card strong {
          color: var(--ink);
          font-size: 14px;
          font-weight: 950;
          line-height: 1.4;
        }

        .collection-helper-card span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
          line-height: 1.55;
        }

        .collection-product-grid {
          margin-top: 14px;
          padding-bottom: 28px;
        }

        .collection-empty-card {
          margin-top: 14px;
          padding: 18px;
          border: 1px solid rgba(234, 219, 208, 0.95);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.9);
          text-align: center;
        }

        .collection-empty-card h3 {
          margin: 0 0 6px;
          color: var(--ink);
          font-size: 18px;
        }

        .collection-empty-card p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          font-weight: 800;
          line-height: 1.6;
        }


        /* Phase 17: new combo campaigns */
        .product-info h3 {
          word-break: break-word;
        }


        /* Phase 18: collagen drink + EC lutein combo */
        .product-image img {
          background: #fff;
        }


        /* Phase 19: dragon shampoo + argan scalp care combo */
        .product-image img {
          background: #fff;
        }


        /* Phase 20: perfume + hand cream combo */
        .product-info h3 {
          word-break: break-word;
        }


        /* Phase 21: Metolo combo + missing combo singles */
        .product-info h3 {
          word-break: break-word;
        }


      `}</style>
    </main>
  );
}
