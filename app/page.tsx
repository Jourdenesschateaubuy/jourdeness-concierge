"use client";

import { useState, type FormEvent } from "react";

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
  外部廠商: ["全部", "歐思佛", "上山採藥", "生福科技", "良冠", "木匠兄妹", "F.SEASONS 富雨洋傘"],
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
    price: "產地價待補",
    image: "/products/Men's Abies3.jpg",
    description: "150mL。冷杉系列保養品。",
  },
  {
    id: 11,
    name: "冷杉型男淨化保濕乳",
    category: "保養品",
    series: "冷杉系列",
    originalPrice: "原價待補",
    price: "產地價待補",
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
    image: "/products/Essential Oil EC.jpg",
    description: "50mL。精萃油系列。",
  },
  {
    id: 44,
    name: "防護盾牌維 C 精萃油",
    category: "精油",
    series: "50mL 精萃油系列",
    originalPrice: "原價 $ 2,200",
    price: "產地價 $ 1,650",
    image: "/products/Essential Oil EC.jpg",
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
    id: 73,
    name: "能量牛樟芝保健潔口液",
    category: "外部廠商",
    series: "生福科技",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "生福科技品項。",
  },
  {
    id: 74,
    name: "挪威 EPAX 高活性 rTG 魚油軟膠囊",
    category: "外部廠商",
    series: "生福科技",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "生福科技品項。",
  },

  {
    id: 75,
    name: "櫻の雪亮澤護手霜",
    category: "護手霜",
    series: "護手霜",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/sakura hand cream.jpg",
    description: "30mL。護手霜品項。",
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
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "200g。肥皂品項。",
  },
  {
    id: 80,
    name: "龍血艾草保庇皂",
    category: "肥皂",
    series: "肥皂",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "200g。肥皂品項。",
  },
  {
    id: 81,
    name: "龍血檸檬馬鞭草皂",
    category: "肥皂",
    series: "肥皂",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "200g。肥皂品項。",
  },
  {
    id: 82,
    name: "龍血薰衣草舒緩皂",
    category: "肥皂",
    series: "肥皂",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "200g。肥皂品項。",
  },

  {
    id: 83,
    name: "高鈣益生菌 11盒組",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價 $ 8,800",
    price: "產地價 $ 3,600",
    image: "/products/probiotic-bc-ca.jpg",
    description: "BC-CA複合益生菌高鈣活力配方 11盒。",
  },
  {
    id: 84,
    name: "高鈣益生菌6盒 + 蔓越莓益生菌5盒",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價 $ 9,600",
    price: "產地價 $ 4,200",
    image: "/products/probiotic-cranberry.jpg",
    description: "BC-CA高鈣益生菌 6盒 + 蔓越莓益生菌 5盒。",
  },
  {
    id: 85,
    name: "蔓越莓益生菌10盒 + 高鈣益生菌1盒",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價 $ 10,400",
    price: "產地價 $ 4,800",
    image: "/products/probiotic-cranberry.jpg",
    description: "蔓越莓益生菌 10盒 + BC-CA高鈣益生菌 1盒。",
  },
  {
    id: 86,
    name: "石墨烯電氣石精油貼布任選4盒",
    category: "組合價",
    series: "貼布組合",
    originalPrice: "原價 $ 3,200",
    price: "產地價 $ 1,099",
    image: "/products/placeholder.jpg",
    description: "涼感 / 溫感可任選搭配，共4盒。",
  },
  {
    id: 87,
    name: "石墨烯電氣石精油貼布任選10盒",
    category: "組合價",
    series: "貼布組合",
    originalPrice: "原價 $ 8,000",
    price: "產地價 $ 2,500",
    image: "/products/placeholder.jpg",
    description: "涼感 / 溫感可任選搭配，共10盒。",
  },
  {
    id: 88,
    name: "能量牛樟芝保健潔口液 3瓶組",
    category: "組合價",
    series: "生福科技組合",
    originalPrice: "原價待補",
    price: "產地價 $ 1,500",
    image: "/products/placeholder.jpg",
    description: "能量牛樟芝保健潔口液 3瓶，送齒齦保健薰衣草舒緩牙膏120g 3條。",
  },
  {
    id: 89,
    name: "龍血洗沐任選3瓶",
    category: "組合價",
    series: "洗沐組合",
    originalPrice: "原價 $ 2,370",
    price: "產地價 $ 1,100",
    image: "/products/BDwash2.jpg",
    description: "龍血洗髮精 / 龍血沐浴乳可自由搭配，共3瓶。",
  },
  {
    id: 90,
    name: "齒齦保健牙膏任選3條",
    category: "組合價",
    series: "牙膏組合",
    originalPrice: "原價 $ 750",
    price: "產地價 $ 500",
    image: "/products/Lavender-washtoothpaste.jpg",
    description: "薰衣草舒緩 / 龍血修護可混搭，共3條。",
  },
  {
    id: 91,
    name: "水搖滾 / 極光白美白面膜桶裝任選組",
    category: "組合價",
    series: "面膜組合",
    originalPrice: "原價待補",
    price: "1桶 $ 599｜任選2桶 $ 1,100｜任選5桶 $ 2,750",
    image: "/products/placeholder.jpg",
    description: "水搖滾保濕面膜22mL x35pcs / 極光白美白面膜 x35pcs 可任選。任選5桶再送10片水搖滾保濕面膜。",
  },
  {
    id: 92,
    name: "冷杉型男保濕任選2瓶",
    category: "組合價",
    series: "保養套組",
    originalPrice: "原價待補",
    price: "產地價 任選2瓶 $ 590",
    image: "/products/Men's Abies3.jpg",
    description: "冷杉型男淨化保濕化妝水150mL / 冷杉型男淨化保濕乳100mL 可任選，共2瓶。",
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
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "200g。肥皂品項。",
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
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "生福科技品項。",
  },
  {
    id: 100,
    name: "BC-HA 複合益生菌 2盒組",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價待補",
    price: "產地價 2盒 $ 2,000",
    image: "/products/BC-HA.jpg",
    description: "BC-HA 複合益生菌 3g x 60包 / 盒，共2盒。",
  },
  {
    id: 101,
    name: "龍血卸妝清潔任選2件組",
    category: "組合價",
    series: "保養套組",
    originalPrice: "原價待補",
    price: "產地價 任選2件 $ 1,080",
    image: "/products/placeholder.jpg",
    description: "龍血求麗潔顏慕絲 / 龍血求麗卸妝油可任選，共2件。",
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
    image: "/products/placeholder.jpg",
    description: "水光肌能系列品項。",
  },
  {
    id: 117,
    name: "時光瑞亞淡香水",
    category: "香水",
    series: "香水",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "30mL。香水品項。",
  },
  {
    id: 118,
    name: "超導水網瞬效面膜",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
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
    image: "/products/placeholder.jpg",
    description: "頂級養護品項。",
  },
  {
    id: 121,
    name: "奧勒岡小白花美體乳",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
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
    image: "/products/water 5.jpg",
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
    image: "/products/white 5.jpg",
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
    image: "/products/placeholder.jpg",
    description: "頂級養護面膜品項。",
  },


];


export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<MainCategory>("組合價");
  const [selectedSeries, setSelectedSeries] = useState("全部");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [customer, setCustomer] = useState<CustomerForm>({
    customerName: "",
    lineId: "",
    phone: "",
    deliveryMethod: "LINE確認",
    note: "",
  });

  const mainCategories = Object.keys(categoryConfig) as MainCategory[];
  const seriesList = categoryConfig[selectedCategory];

  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategory === "全部" || product.category === selectedCategory;

    const matchSeries =
      selectedSeries === "全部" || product.series === selectedSeries;

    return matchCategory && matchSeries;
  });

  const featuredProductIds = [83, 100, 101, 89, 91, 88];
  const featuredProducts = featuredProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean) as Product[];

  const cartTotalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  function handleCategoryChange(category: MainCategory) {
    setSelectedCategory(category);
    setSelectedSeries("全部");
  }

  function jumpToCategory(category: MainCategory, series = "全部") {
    setSelectedCategory(category);
    setSelectedSeries(series);
    window.setTimeout(() => {
      document.getElementById("product-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
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

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    const payload = {
      customerName: customer.customerName.trim(),
      lineId: customer.lineId.trim(),
      phone: customer.phone.trim(),
      deliveryMethod: customer.deliveryMethod,
      note: customer.note.trim(),
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
      setSubmitMessage(
        "訂購清單已送出！我們會再透過 LINE 或電話確認庫存、金額與付款方式。"
      );
      setCartItems([]);
      setCustomer({
        customerName: "",
        lineId: "",
        phone: "",
        deliveryMethod: "LINE確認",
        note: "",
      });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage("送出時發生問題，請稍後再試，或直接加入 LINE：@chateau-buy。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-shell">
      <header className="top-header">
        <div>
          <p className="top-eyebrow">Jourdeness Castle</p>
          <h1>佐登妮絲城堡回購群</h1>
          <p>產地價訂購清單・LINE 客服確認</p>
        </div>

        <button className="header-cart-button" onClick={() => setIsCartOpen(true)}>
          清單 <span>{cartTotalQuantity}</span>
        </button>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="small-title">Castle Price List</p>
          <h2>回購群專屬產地價訂購站</h2>
          <p>
            選擇想詢問或訂購的商品，送出清單後由 LINE 客服協助確認價格、庫存與取貨方式。
          </p>

          <div className="hero-actions">
            <button onClick={() => jumpToCategory("組合價")}>查看本月優惠</button>
            <a
              href="https://line.me/R/ti/p/@chateau-buy"
              target="_blank"
              rel="noopener noreferrer"
            >
              加入 LINE 詢問
            </a>
          </div>
        </div>

        <div className="hero-card">
          <p>LINE ID</p>
          <strong>@chateau-buy</strong>
          <span>送出清單不代表付款完成，客服會再確認明細。</span>
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-card">
          <span>01</span>
          <h3>選擇商品</h3>
          <p>從分類或組合價中加入想詢問的品項。</p>
        </div>

        <div className="trust-card">
          <span>02</span>
          <h3>送出清單</h3>
          <p>留下姓名與 LINE ID，資料會進入訂單表。</p>
        </div>

        <div className="trust-card">
          <span>03</span>
          <h3>客服確認</h3>
          <p>由 LINE 確認庫存、金額、付款與取貨方式。</p>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <p>Featured</p>
          <h2>本月主打優惠</h2>
          <span>精選組合價與熱門回購品項</span>
        </div>

        <div className="featured-grid">
          {featuredProducts.map((product) => (
            <article className="featured-card" key={`featured-${product.id}`}>
              <ProductVisual product={product} variant="featured" />
              <div className="featured-info">
                <p className="series-label">{product.series}</p>
                <h3>{product.name}</h3>
                <p className="description">{product.description}</p>
                {hasKnownOriginalPrice(product) && (
                  <p className="original-price">{product.originalPrice}</p>
                )}
                <p className={`price ${hasInquiryPrice(product) ? "inquiry" : ""}`}>
                  {displayPrice(product)}
                </p>
                <button
                  className="add-cart-button"
                  onClick={() => addToCart(product)}
                  disabled={isSoldOut(product)}
                >
                  {isSoldOut(product)
                    ? "缺貨中"
                    : hasInquiryPrice(product)
                    ? "加入詢問清單"
                    : "加入清單"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="filter-section" id="product-section">
        <div className="section-heading compact">
          <p>Catalog</p>
          <h2>商品分類</h2>
          <span>目前顯示 {filteredProducts.length} 項商品</span>
        </div>

        <div className="category-bar">
          {mainCategories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="subcategory-bar">
          {seriesList.map((series) => (
            <button
              key={series}
              className={
                selectedSeries === series
                  ? "subcategory-button active"
                  : "subcategory-button"
              }
              onClick={() => setSelectedSeries(series)}
            >
              {series}
            </button>
          ))}
        </div>
      </section>

      {filteredProducts.length > 0 ? (
        <section className="product-grid">
          {filteredProducts.map((product) => {
            const soldOut = isSoldOut(product);
            const inquiry = hasInquiryPrice(product);

            return (
              <article className="product-card" key={product.id}>
                <ProductVisual product={product} />

                <div className="product-info">
                  <div className="product-meta-row">
                    <p className="series-label">{product.series}</p>
                    {inquiry && !soldOut && <span>可詢價</span>}
                    {soldOut && <span className="sold-out-badge">缺貨</span>}
                  </div>

                  <h3>{product.name}</h3>
                  <p className="description">{product.description}</p>

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
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="empty-section">
          <div className="empty-card">
            <h3>此分類尚未建立商品</h3>
            <p>商品圖片、名稱與價格可以之後再逐項加入。</p>
          </div>
        </section>
      )}

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
                <span>送出後由 LINE 客服確認，尚未完成付款。</span>
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
                    取貨 / 配送方式
                    <select
                      value={customer.deliveryMethod}
                      onChange={(event) =>
                        setCustomer({ ...customer, deliveryMethod: event.target.value })
                      }
                    >
                      <option>LINE確認</option>
                      <option>城堡自取</option>
                      <option>宅配</option>
                      <option>其他</option>
                    </select>
                  </label>

                  <label>
                    備註
                    <textarea
                      value={customer.note}
                      onChange={(event) =>
                        setCustomer({ ...customer, note: event.target.value })
                      }
                      placeholder="可填寫顏色、口味、想確認庫存、其他需求"
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
                    送出清單不代表付款完成。商品價格、庫存、優惠組合與取貨方式，仍依 LINE 客服確認為準。
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

      <section className="notice-section">
        <div className="section-heading compact">
          <p>Notice</p>
          <h2>購買提醒</h2>
        </div>

        <div className="notice-card">
          <p>商品價格與優惠組合依當日公告為準。</p>
          <p>送出訂購清單後，客服會再透過 LINE 或電話確認庫存、金額與付款方式。</p>
          <p>若遇缺貨、價格異動或組合活動調整，將以客服確認內容為準。</p>
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
          商品價格與優惠組合依當日公告為準。
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
      `}</style>
    </main>
  );
}
