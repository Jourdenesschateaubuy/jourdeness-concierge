"use client";

import { useState } from "react";

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
  ],
  保健食品: ["全部", "益生菌系列", "晶眸保健系列", "美妍飲品系列"],
  洗沐: ["全部", "洗沐系列"],
  精油: ["全部", "10mL 精油系列", "50mL 精萃油系列", "擴香設備"],
  牙膏: ["全部", "牙膏"],
  肥皂: ["全部", "肥皂"],
  護手霜: ["全部", "護手霜"],
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
    image: "/products/placeholder.jpg",
    description: "8mL / 盒。茶樹控油系列。",
  },
  {
    id: 50,
    name: "茶樹控油化妝水",
    category: "保養品",
    series: "茶樹控油系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "150mL。茶樹控油系列。",
  },
  {
    id: 51,
    name: "茶樹控油保濕乳",
    category: "保養品",
    series: "茶樹控油系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "100mL。茶樹控油系列。",
  },
  {
    id: 52,
    name: "肌可佳膠原蛋白彈潤原液",
    category: "保養品",
    series: "膠原蛋白系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
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
    image: "/products/placeholder.jpg",
    description: "22mL x 10pcs。",
  },
  {
    id: 58,
    name: "水搖滾保濕面膜",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
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
    image: "/products/placeholder.jpg",
    description: "x 35pcs。",
  },
  {
    id: 61,
    name: "水光肌能化妝水",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "140mL。水光肌能系列。",
  },
  {
    id: 62,
    name: "水光肌能乳液",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "130mL。水光肌能系列。",
  },
  {
    id: 63,
    name: "水光肌能晚霜",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "50mL。水光肌能系列。",
  },
  {
    id: 64,
    name: "苦杏仁酸溫和煥顏露",
    category: "保養品",
    series: "杏仁酸系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
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
    image: "/products/placeholder.jpg",
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
    image: "/products/placeholder.jpg",
    description: "150mL。櫻の雪傳明酸美白系列。",
  },
  {
    id: 72,
    name: "櫻の雪傳明酸美白化妝水",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
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
    image: "/products/placeholder.jpg",
    description: "30mL。綠茶多酚保濕平衡系列。",
  },
  {
    id: 105,
    name: "綠茶多酚保濕平衡面膜",
    category: "保養品",
    series: "綠茶多酚保濕平衡系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "20mL x 5片 / 盒。綠茶多酚保濕平衡系列。",
  },
  {
    id: 106,
    name: "白金密集煥白淡斑筆",
    category: "保養品",
    series: "白金密集煥白系列",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "白金密集煥白系列。",
  },
  {
    id: 107,
    name: "賽洛美潤膚美體油(C+E)",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "頂級養護品項。",
  },
  {
    id: 108,
    name: "24小時賦活液",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "頂級養護品項。",
  },
  {
    id: 109,
    name: "鉑金無痕煥白雙導精華",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "頂級養護品項。",
  },
  {
    id: 110,
    name: "黑耀緊緻奢華眼霜",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
    description: "頂級養護品項。",
  },
  {
    id: 111,
    name: "24小時黃金璀璨賦活液",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價待補",
    price: "產地價待補",
    image: "/products/placeholder.jpg",
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

];

export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<MainCategory>("組合價");
  const [selectedSeries, setSelectedSeries] = useState("全部");

  const mainCategories = Object.keys(categoryConfig) as MainCategory[];

  const seriesList = categoryConfig[selectedCategory];

  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategory === "全部" || product.category === selectedCategory;

    const matchSeries =
      selectedSeries === "全部" || product.series === selectedSeries;

    return matchCategory && matchSeries;
  });

  function handleCategoryChange(category: MainCategory) {
    setSelectedCategory(category);
    setSelectedSeries("全部");
  }

  return (
    <main>
      <header className="header">
        <div>
          <h1>佐登妮絲城堡回購群</h1>
          <p>用產地價回饋給支持我們的顧客</p>
        </div>
      </header>

      <section className="hero">
        <p className="small-title">產品資訊價格以供參考，如須購買請洽詢佐登妮絲城堡line官方回購群</p>
        <h2>佐登妮絲城堡產地價</h2>
        <p>查看目前商品價格與優惠組合。</p>
      </section>

      <section className="filter-section">
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

        <p className="product-count">目前顯示 {filteredProducts.length} 項商品</p>
      </section>

      {filteredProducts.length > 0 ? (
        <section className="product-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>

              <div className="product-info">
                <p className="series-label">{product.series}</p>
                <h3>{product.name}</h3>
                <p className="description">{product.description}</p>

                <p className="original-price">{product.originalPrice ?? "原價待補"}</p>

                <p className="price">{product.price}</p>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-section">
          <div className="empty-card">
            <h3>此分類尚未建立商品</h3>
            <p>商品圖片、名稱與價格可以之後再逐項加入。</p>
          </div>
        </section>
      )}

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
    </main>
  );
}
