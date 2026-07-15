"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode, type SyntheticEvent } from "react";

const categoryConfig = {
  本月精選: ["全部", "回購主打", "組合優惠", "即期優惠"],
  保養美肌: [
    "全部",
    "龍血系列",
    "薰衣草系列",
    "水光肌能系列",
    "櫻の雪傳明酸美白系列",
    "玫瑰超微晶萃系列",
    "肌光緊緻速妍系列",
    "冰河淨化系列",
    "杏仁酸系列",
    "冷杉系列",
    "面膜",
  ],
  健康保健: ["全部", "益生菌系列", "晶眸保健系列", "美妍飲品系列", "口腔保健", "魚油組合"],
  精油香氛: ["全部", "單方精油", "複方精油", "10mL 精油系列", "50mL 精萃油系列", "滾珠精油", "精油配件", "擴香設備", "香氛皂"],
  即將上架: ["全部", "準備上架", "滾珠精油", "護手霜組合", "其他香型"],

  // 以下舊分類保留為資料型別相容與內部搜尋用，不再顯示為前台主分類。
  組合價: ["全部", "本月主打", "保健食品組合", "貼布組合", "牙膏組合", "保養套組", "肥皂組合", "護唇膏組合", "面膜組合"],
  全部: ["全部"],
  保養品: ["全部", "冷杉系列", "薰衣草系列", "龍血系列", "INSK乳酸平衡系列", "水光肌能系列", "晶淬雪系列", "玫瑰超微晶萃系列", "肌光緊緻速妍系列", "冰河淨化系列", "櫻の雪傳明酸美白系列", "茶樹控油系列", "杏仁酸系列", "膠原蛋白系列", "鳳梨酵素系列", "防曬", "特殊護理", "頂級養護", "面膜"],
  保健食品: ["全部", "益生菌系列", "晶眸保健系列", "美妍飲品系列"],
  洗沐: ["全部", "洗沐系列", "阿甘綠柔護髮系列"],
  精油: ["全部", "單方精油", "複方精油", "精油配件", "擴香設備", "10mL 精油系列", "50mL 精萃油系列", "滾珠精油"],
  牙膏: ["全部", "牙膏"],
  肥皂: ["全部", "肥皂"],
  護唇膏: ["全部", "護唇膏"],
  護手霜: ["全部", "護手霜"],
  香水: ["全部", "香水"],
  面膜: ["全部", "保濕面膜", "亮白面膜", "修護面膜", "面膜組合"],
  貼布: ["全部", "貼布"],
  外部廠商: ["全部"],
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

type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

type LiffProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

type LiffApi = {
  init: (config: { liffId: string }) => Promise<void>;
  isLoggedIn: () => boolean;
  login: () => void;
  getProfile: () => Promise<LiffProfile>;
};

declare global {
  interface Window {
    liff?: LiffApi;
  }
}

// V3.1.0：佐登妮絲自家回購館，移除外部廠商、重整少分類與準備上架品項。
const ORDER_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwr7F_SU5JNCzDaos4AP0690pCYFFTO-F-inAudZqhVwzbENYxfhlc8Lna5TXtzgl-0_A/exec";

const CART_STORAGE_KEY = "jourdeness_saved_cart_v1";
const CUSTOMER_DRAFT_STORAGE_KEY = "jourdeness_customer_draft_v1";
const LINE_PROFILE_STORAGE_KEY = "jourdeness_line_profile_v1";
const LINE_LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID || "";
const LIFF_SDK_SRC = "https://static.line-scdn.net/liff/edge/2/sdk.js";

const allProducts: Product[] = [
{
    id: 1,
    name: "BC-CA複合益生菌高鈣活力配方",
    category: "健康保健",
    series: "益生菌系列",
    originalPrice: "原價 $ 800",
    price: "產地價 3盒 $ 1,100",
    image: "/products/probiotic-bc-ca.jpg",
    description: "3g x 30包 / 盒。複合益生菌 × 高鈣活力配方，日常保健與補鈣一起補給。",
  },
{
    id: 2,
    name: "蔓越莓益生菌速酵力配方",
    category: "健康保健",
    series: "益生菌系列",
    originalPrice: "原價 $ 960",
    price: "產地價 3盒 $ 1,600",
    image: "/products/probiotic-cranberry.jpg",
    description: "3g x 30包 / 盒。蔓越莓 × 益生菌複合配方，適合女性日常保健補給。",
  },
{
    id: 4,
    name: "EC晶眸葉黃素",
    category: "健康保健",
    series: "晶眸保健系列",
    originalPrice: "原價 $ 1,500",
    price: "產地價 $ 1,125",
    image: "/products/Lutein.jpg",
    description: "精華凍 + 精華飲綜合組。適合 3C 族、學生與上班族日常晶亮營養補給。",
  },
{
    id: 5,
    name: "亮妍魚膠原蛋白飲",
    category: "健康保健",
    series: "美妍飲品系列",
    originalPrice: "原價 $ 2,200",
    price: "產地價 $ 1,650",
    image: "/products/FISH-Collagen.jpg",
    description: "15mL x 10瓶 / 盒。魚膠原蛋白美妍飲，日常美容保健與水潤光澤補給。",
  },
{
    id: 6,
    name: "薰衣草肌安舒緩化妝水",
    category: "保養品",
    series: "薰衣草系列",
    originalPrice: "原價 $ 790",
    price: "產地價 $ 590",
    image: "/products/Lavender1.jpg",
    description: "150mL。薰衣草肌安舒緩系列。",
  },
{
    id: 7,
    name: "薰衣草肌安舒緩精華液",
    category: "保養品",
    series: "薰衣草系列",
    originalPrice: "原價 $ 890",
    price: "產地價 $ 660",
    image: "/products/Lavender2.jpg",
    description: "30mL。薰衣草肌安舒緩系列。",
  },
{
    id: 8,
    name: "薰衣草肌安舒緩保濕乳",
    category: "保養品",
    series: "薰衣草系列",
    originalPrice: "原價 $ 890",
    price: "產地價 $ 660",
    image: "/products/Lavender3.jpg",
    description: "100mL。薰衣草肌安舒緩系列。",
  },
{
    id: 10,
    name: "冷杉型男淨化保濕化妝水",
    category: "保養品",
    series: "冷杉系列",
    originalPrice: "原價 $ 590",
    price: "即期出清 單瓶 $199",
    image: "/products/Men's Abies3.jpg",
    description: "150mL。冷杉系列保養品。",
  },
{
    id: 11,
    name: "冷杉型男淨化保濕乳",
    category: "保養品",
    series: "冷杉系列",
    originalPrice: "原價 $ 790",
    price: "即期出清 單瓶 $199",
    image: "/products/Men's Abies1.jpg",
    description: "100mL。冷杉系列保養品。",
  },
{
    id: 14,
    name: "玫瑰超微晶萃活膚液",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/products/rose1.jpg",
    description: "130mL / 瓶。玫瑰超微晶萃活膚液，洗臉後調理肌膚並維持柔嫩光澤。",
  },
{
    id: 16,
    name: "玫瑰超微晶萃瞬效霜",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    originalPrice: "原價 $ 2,880",
    price: "產地價 $ 2,160",
    image: "/products/rose4.jpg",
    description: "50mL / 瓶。玫瑰超微晶萃瞬效霜，保養最後一步加強鎖水與潤澤。",
  },
{
    id: 17,
    name: "龍血求麗化妝水",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 1,190",
    price: "產地價 $ 890",
    image: "/products/db-1.jpg",
    description: "120mL / 瓶。前導補水、油水平衡，龍血系列肌膚乖乖水。",
  },
{
    id: 18,
    name: "龍血求麗精華",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 1,290",
    price: "產地價 $ 695",
    image: "/products/db-2.jpg",
    description: "30mL / 瓶。龍血小橘瓶，熬夜、初老與疲憊肌修護精華。",
  },
{
    id: 19,
    name: "龍血求麗修護乳",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 1,290",
    price: "產地價 $ 1,290",
    image: "/products/db-3.jpg",
    description: "80mL / 瓶。買一送一，清爽水凝質地修護乳。",
  },
{
    id: 20,
    name: "龍血求麗修護霜",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 1,490",
    price: "產地價 $ 1,190",
    image: "/products/db-4.jpg",
    description: "35mL / 瓶。第二件五折，夜間深層鎖水修護霜。",
  },
{
    id: 21,
    name: "肌光緊緻速妍雪膚液",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 3,280",
    price: "產地價 $ 2,460",
    image: "/products/Radiance and Lifting1.jpg",
    description: "130mL / 瓶。緊緻前導雪膚液，洗臉後調理肌膚紋理與彈力光澤。",
  },
{
    id: 22,
    name: "肌光緊緻速妍精華露",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 3,880",
    price: "產地價 $ 2,910",
    image: "/products/Radiance and Lifting2.jpg",
    description: "35mL / 瓶。高濃縮緊緻精華，適合細紋、鬆弛感與熬夜疲憊肌加強保養。",
  },
{
    id: 23,
    name: "肌光緊緻速妍霜",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 4,680",
    price: "產地價 $ 3,510",
    image: "/products/Radiance and Lifting4.jpg",
    description: "50mL / 瓶。緊緻修護霜，保養最後一步鎖住水分與滋養。",
  },
{
    id: 24,
    name: "肌光緊緻速妍面膜",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    originalPrice: "原價 $ 3,680",
    price: "產地價 $ 2,760",
    image: "/products/Radiance and Lifting5.jpg",
    description: "23mL x 10入 / 盒。集中型緊緻修護面膜，適合重要場合前與熬夜後加強保養。",
  },
{
    id: 29,
    name: "龍血求麗頭皮修護洗髮精",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 790",
    price: "任選3瓶 $ 1,100",
    image: "/products/BDwash2.jpg",
    description: "500mL / 瓶。龍血頭皮修護洗髮精，0矽靈配方，洗後蓬鬆柔順。",
  },
{
    id: 30,
    name: "龍血求麗潤澤修護沐浴乳",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 790",
    price: "任選3瓶 $ 1,100",
    image: "/products/BDwash1.jpg",
    description: "500mL / 瓶。龍血潤澤修護沐浴乳，洗後水潤柔嫩不緊繃。",
  },
{
    id: 31,
    name: "純淨洗髮精",
    category: "洗沐",
    series: "洗沐系列",
    originalPrice: "原價 $ 780",
    price: "產地價 $ 585",
    image: "/products/Refined Hair Shampoo.jpg",
    description: "洗髮品項。",
  },
{
    id: 35,
    name: "薰衣草齒齦保健牙膏",
    category: "牙膏",
    series: "牙膏",
    originalPrice: "原價 $ 250",
    price: "任選3條 $ 500",
    image: "/products/lav-washtoothpaste.jpg",
    description: "120g / 支。薰衣草草本香氣，溫和潔牙並維持口氣清新。",
  },
{
    id: 36,
    name: "龍血齒齦保健牙膏",
    category: "牙膏",
    series: "牙膏",
    originalPrice: "原價 $ 250",
    price: "任選3條 $ 500",
    image: "/products/bd-washtoothpaste.jpg",
    description: "120g / 支。龍血齒齦保健牙膏，溫和清潔牙齒與齒齦邊緣。",
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
    name: "高頻霧化香薰機一台（買1台送1瓶茶樹精油10ml）",
    category: "精油",
    series: "擴香設備",
    price: "售價 $ 1,980",
    image: "/products/Ultrasonic Aroma Diffuser.jpg",
    description: "高頻霧化香薰機一台，買1台送1瓶茶樹精油10mL。",
  },
{
    id: 47,
    name: "石墨烯電氣石精油貼布(涼感)",
    category: "貼布",
    series: "貼布",
    originalPrice: "原價 $ 800",
    price: "產地價 $ 500",
    image: "/products/patch 1.png",
    description: "10片 / 盒。清爽涼感款，適合運動後、久坐肩頸與炎熱天氣的局部放鬆保養。",
  },
{
    id: 48,
    name: "石墨烯電氣石精油貼布(溫感)",
    category: "貼布",
    series: "貼布",
    originalPrice: "原價 $ 800",
    price: "產地價 $ 500",
    image: "/products/patch 5.png",
    description: "10片 / 盒。溫感款，適合冷氣房、家事勞動後與肩頸腰背局部放鬆保養。",
  },
{
    id: 49,
    name: "茶樹K痘精華",
    category: "保養品",
    series: "茶樹控油系列",
    originalPrice: "原價 $ 290",
    price: "產地價 $ 240",
    image: "/products/tt6.jpg",
    description: "8mL / 盒。局部控油淨痘精華，適合粉刺、痘痘與局部油光調理。",
  },
{
    id: 50,
    name: "茶樹控油化妝水",
    category: "保養品",
    series: "茶樹控油系列",
    originalPrice: "原價 $ 590",
    price: "產地價待補",
    image: "/products/tt1.jpg",
    description: "150mL / 瓶。清潔後的控油第一步，清爽調理毛孔與油光。",
  },
{
    id: 51,
    name: "茶樹控油保濕乳",
    category: "保養品",
    series: "茶樹控油系列",
    originalPrice: "原價 $ 790",
    price: "產地價待補",
    image: "/products/tee3.jpg",
    description: "100mL / 瓶。清爽不悶厚的控油保濕乳，維持油水平衡。",
  },
{
    id: 52,
    name: "肌可佳膠原蛋白彈潤原液",
    category: "保養品",
    series: "膠原蛋白系列",
    originalPrice: "原價 $ 1,290",
    price: "產地價 $ 960",
    image: "/products/collagen 1.jpg",
    description: "30mL / 瓶。膠原蛋白彈潤原液，適合加強澎潤、保濕與肌膚彈性感。",
  },
{
    id: 53,
    name: "龍血玻尿酸保濕精華液",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 3,390",
    price: "產地價 $ 1,980",
    image: "/products/DBME.jpg",
    description: "300mL / 瓶。買一送一，城堡必敗國民保濕精華。",
  },
{
    id: 54,
    name: "龍血求麗卸妝油",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 890",
    price: "產地價 $ 590",
    image: "/products/BD001.jpg",
    description: "150mL / 瓶。輕盈卸妝油，快速溶解彩妝、防曬與毛孔髒污。",
  },
{
    id: 55,
    name: "龍血求麗潔顏慕絲",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 790",
    price: "產地價 $ 590",
    image: "/products/BD0.jpg",
    description: "150mL / 瓶。細緻綿密潔顏慕絲，洗後不緊繃、不乾澀。",
  },
{
    id: 56,
    name: "水搖滾保濕面膜 (5片裝)",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "5片裝售價請洽小幫手",
    image: "/products/DBMUSK 5.jpg",
    description: "22mL x 5pcs / 盒。水搖滾保濕面膜，適合乾燥缺水與急救補水。",
  },
{
    id: 57,
    name: "水搖滾保濕面膜 (10片裝)",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "10片裝售價請洽小幫手",
    image: "/products/water 5.jpg",
    description: "22mL x 10pcs / 盒。水搖滾保濕面膜，日常補水與集中保養。",
  },
{
    id: 58,
    name: "水搖滾保濕面膜 (35片大容量桶裝)",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 3,000",
    price: "1桶 $ 599",
    image: "/products/water 35.png",
    description: "22mL x 35pcs / 桶。水搖滾保濕面膜大容量桶裝，適合長期補水保養。",
  },
{
    id: 59,
    name: "極光白美白面膜 (5片裝)",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價待補",
    price: "5片裝售價請洽小幫手",
    image: "/products/DBMUSK 5 W.jpg",
    description: "5pcs / 盒。極光白美白面膜，集中亮白調理膚色不均與熬夜暗沉。",
  },
{
    id: 60,
    name: "極光白美白面膜 (35片大容量桶裝)",
    category: "保養品",
    series: "龍血系列",
    originalPrice: "原價 $ 3,000",
    price: "1桶 $ 599",
    image: "/products/white 35.png",
    description: "35pcs / 桶。極光白美白面膜大容量桶裝，適合日常亮白集中保養。",
  },
{
    id: 62,
    name: "水光肌能乳液",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價 $ 2,180",
    price: "產地價 $ 1,185",
    image: "/products/glassskin 3.jpg",
    description: "130mL / 瓶。水光肌能乳液，清爽鎖水並維持柔嫩彈潤感。",
  },
{
    id: 63,
    name: "水光肌能晚霜",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價 $ 2,380",
    price: "產地價 $ 1,785",
    image: "/products/glassskin 4.jpg",
    description: "50mL / 瓶。水光肌能晚霜，夜間加強潤澤與保濕，維持柔嫩澎潤感。",
  },
{
    id: 64,
    name: "苦杏仁酸溫和煥顏露",
    category: "保養品",
    series: "杏仁酸系列",
    originalPrice: "原價 $ 880",
    price: "產地價 $ 630",
    image: "/products/mandelic acid.jpg",
    description: "30mL / 瓶。溫和煥顏保養品項，適合日常代謝老廢角質與維持細緻光澤。",
  },
{
    id: 66,
    name: "冰河淨化淨膚露",
    category: "保養品",
    series: "冰河淨化系列",
    originalPrice: "原價 $ 1,380",
    price: "產地價 $ 1,035",
    image: "/products/Glacial 1.jpg",
    description: "120mL / 瓶。冰河淨化淨膚露，調理老廢皮脂、油光與毛孔。",
  },
{
    id: 67,
    name: "冰河淨化柔膚面膜",
    category: "保養品",
    series: "冰河淨化系列",
    originalPrice: "原價 $ 1,280",
    price: "產地價 $ 960",
    image: "/products/Glacial 5.jpg",
    description: "100mL / 瓶。冰河淨化柔膚面膜，水洗式淨化保養，維持肌膚潔淨柔嫩。",
  },
{
    id: 69,
    name: "鳳梨酵素代謝角質凝露",
    category: "保養品",
    series: "鳳梨酵素系列",
    originalPrice: "原價 $ 590",
    price: "產地價 $ 460",
    image: "/products/pineapple 0.jpg",
    description: "120g / 瓶。溫和代謝老廢角質，改善粗糙暗沉與吸收感不佳。",
  },
{
    id: 70,
    name: "鳳梨酵素活膚面膜",
    category: "保養品",
    series: "鳳梨酵素系列",
    originalPrice: "原價 $ 390",
    price: "產地價洽詢",
    image: "/products/pineapple 5.jpg",
    description: "22mL x 5pcs / 盒。鳳梨酵素活膚面膜，補水並提升透亮細緻感。",
  },
{
    id: 71,
    name: "櫻の雪淨白潔顏慕絲",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價 $ 590",
    price: "準備上架",
    image: "/products/sukola0.jpg",
    description: "150mL / 瓶。櫻の雪淨白潔顏慕絲準備上架中，正式開放後可加入清單確認。",
  },
{
    id: 72,
    name: "櫻の雪傳明酸美白化妝水",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價 $ 790",
    price: "產地價 $ 590",
    image: "/products/sukola1.jpg",
    description: "150mL / 瓶。亮白前導化妝水，補充亮白水分並打開吸收通道。",
  },
{
    id: 141,
    name: "櫻の雪傳明酸美白精華液",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價 $ 890",
    price: "產地價 $ 660",
    image: "/products/su2.jpg",
    description: "30mL / 瓶。密集亮白核心精華，針對斑點、暗沉與膚色不均加強調理。",
  },
{
    id: 142,
    name: "櫻の雪傳明酸美白乳液",
    category: "保養品",
    series: "櫻の雪傳明酸美白系列",
    originalPrice: "原價 $ 790",
    price: "產地價 $ 660",
    image: "/products/su3.jpg",
    description: "100mL / 瓶。美白乳液，鎖住亮白保養並維持水嫩不黏膩。",
  },
{
    id: 82,
    name: "龍血薰衣草舒緩皂",
    category: "肥皂",
    series: "肥皂",
    price: "單入 $ 290｜4入優惠 $ 799",
    image: "/products/soap lav.png",
    description: "200g±10g / 塊。目前上架薰衣草款，單入 $290，4入優惠 $799。",
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
    series: "口腔保健",
    originalPrice: "原價待補",
    price: "3罐贈1條牙膏 $ 1,500",
    image: "/products/watertooth 31.png",
    description: "能量牛樟芝保健潔口液 3罐，贈齒齦保健薰衣草舒緩牙膏120g 1條。",
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
    originalPrice: "原價 $ 3,000 / 桶",
    price: "1桶 $ 599｜任選2桶 $ 1,100｜任選5桶 $ 2,750",
    image: "/products/white water 5.png",
    description: "水搖滾保濕面膜22mL x35pcs / 極光白美白面膜 x35pcs 可任選。任選5桶再送10片水搖滾保濕面膜。",
  },
{
    id: 92,
    name: "挪威 EPAX 高活性 rTG 魚油軟膠囊買一送一",
    category: "組合價",
    series: "口腔保健",
    originalPrice: "原價待補",
    price: "買一送一 $ 1,580",
    image: "/products/fishoil1+1.png",
    description: "挪威 EPAX 高活性 rTG 魚油軟膠囊買1送1，共2盒，規格依商品標示。",
  },
{
    id: 93,
    name: "阿甘甦醒髮根養護液",
    category: "洗沐",
    series: "阿甘綠柔護髮系列",
    originalPrice: "原價 $ 1,680",
    price: "產地價 $ 1,260",
    image: "/products/Argan Oil3.jpg",
    description: "80mL / 瓶。阿甘甦醒髮根養護液，適合日常頭皮與髮根養護。",
  },
{
    id: 100,
    name: "BC-HA 複合益生菌 2盒組",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價價值 $ 2,600",
    price: "產地價 2盒 $ 2,000",
    image: "/products/BCHA2000.png",
    description: "BC-HA 複合益生菌 3g x 60包 / 盒，共2盒。",
  },
{
    id: 101,
    name: "龍血求麗潔顏慕絲 + 龍血求麗卸妝油 1+1組",
    category: "組合價",
    series: "保養套組",
    originalPrice: "原價價值 $ 1,680",
    price: "1+1 兩瓶 $ 1,080",
    image: "/products/wash11.png",
    description: "龍血求麗潔顏慕絲150mL + 龍血求麗卸妝油150mL，各1瓶，共2瓶。",
  },
{
    id: 105,
    name: "綠茶多酚保濕平衡面膜",
    category: "保養品",
    series: "綠茶多酚保濕平衡系列",
    originalPrice: "原價 $ 390",
    price: "產地價洽詢",
    image: "/products/tee 5.jpg",
    description: "20mL x 5片 / 盒。綠茶多酚保濕平衡系列。",
  },
{
    id: 107,
    name: "賽洛美潤膚美體油(C+E)",
    category: "保養品",
    series: "特殊護理系列",
    originalPrice: "原價 $ 2,280",
    price: "產地價 $ 1,710",
    image: "/products/Ceramide Body Oil (C+E).jpg",
    description: "200mL / 瓶。賽洛美潤膚美體油(C+E)，沐浴後滋潤乾燥粗糙肌膚。",
  },
{
    id: 108,
    name: "24小時賦活液",
    category: "保養品",
    series: "特殊護理系列",
    originalPrice: "原價 $ 2,980",
    price: "產地價 $ 2,160",
    image: "/products/24H Revitalizing Essence.jpg",
    description: "100mL / 瓶。24小時賦活液，適合疲憊暗沉與保養撞牆期加強打底。",
  },
{
    id: 111,
    name: "24小時黃金璀璨賦活液",
    category: "保養品",
    series: "特殊護理系列",
    originalPrice: "原價 $ 2,280",
    price: "產地價 $ 1,710",
    image: "/products/24K Gold.jpg",
    description: "40mL / 瓶。24小時黃金璀璨賦活液，維持澎潤、透亮與細緻光澤。",
  },
{
    id: 116,
    name: "水光苦杏仁酸慕絲",
    category: "保養品",
    series: "水光肌能系列",
    originalPrice: "原價 $ 1,280",
    price: "產地價 $ 960",
    image: "/products/glassskin 0.jpg",
    description: "150mL / 瓶。水光苦杏仁酸慕絲，溫和清潔並維持肌膚細緻透亮感。",
  },
{
    id: 118,
    name: "超導水網瞬效面膜",
    category: "保養品",
    series: "特殊護理系列",
    originalPrice: "原價 $ 1,680",
    price: "產地價 $ 1,260",
    image: "/products/super water.png",
    description: "26mL x 6入 / 盒。超導水網瞬效面膜，集中補水並加強柔嫩光澤。",
  },
{
    id: 119,
    name: "冰河淨化柔膚面膜",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價 $ 1,280",
    price: "產地價 $ 960",
    image: "/products/Glacial 5.jpg",
    description: "100mL / 瓶。冰河淨化柔膚面膜，水洗式淨化保養，維持肌膚潔淨柔嫩。",
  },
{
    id: 120,
    name: "Exo-雙粹秘泌凍晶組",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價 $ 1,580",
    price: "產地價 $ 1,185",
    image: "/products/Plant Exosome.jpg",
    description: "一組 / 盒裝。頂級凍晶密集保養組，使用時混合激活，適合急救修護。",
  },
{
    id: 121,
    name: "奧勒岡小白花美體乳",
    category: "保養品",
    series: "頂級養護",
    originalPrice: "原價 $ 1,280",
    price: "產地價 $ 960",
    image: "/products/smell white.jpg",
    description: "500mL / 瓶。小白花美體乳，水潤好推不黏膩，適合每日全身保養。",
  },
{
    id: 122,
    name: "肌光緊緻速妍面膜",
    category: "面膜",
    series: "面膜",
    originalPrice: "原價 $ 3,680",
    price: "產地價 $ 2,760",
    image: "/products/Radiance and Lifting5.jpg",
    description: "23mL x 10入 / 盒。集中型緊緻修護面膜，適合重要場合前與熬夜後加強保養。",
  },
{
    id: 124,
    name: "水搖滾保濕面膜 (5片裝)",
    category: "面膜",
    series: "面膜",
    originalPrice: "原價待補",
    price: "5片裝售價請洽小幫手",
    image: "/products/DBMUSK 5.jpg",
    description: "22mL x 5pcs / 盒。水搖滾保濕面膜，適合乾燥缺水與急救補水。",
  },
{
    id: 125,
    name: "水搖滾保濕面膜 (10片裝)",
    category: "面膜",
    series: "面膜",
    originalPrice: "原價待補",
    price: "10片裝售價請洽小幫手",
    image: "/products/water 5.jpg",
    description: "22mL x 10pcs / 盒。水搖滾保濕面膜，日常補水與集中保養。",
  },
{
    id: 126,
    name: "水搖滾保濕面膜 (35片大容量桶裝)",
    category: "面膜",
    series: "面膜",
    originalPrice: "原價 $ 3,000",
    price: "1桶 $ 599",
    image: "/products/water 35.png",
    description: "22mL x 35pcs / 桶。水搖滾保濕面膜大容量桶裝，適合長期補水保養。",
  },
{
    id: 127,
    name: "極光白美白面膜 (5片裝)",
    category: "面膜",
    series: "面膜",
    originalPrice: "原價待補",
    price: "5片裝售價請洽小幫手",
    image: "/products/DBMUSK 5 W.jpg",
    description: "5pcs / 盒。極光白美白面膜，集中亮白調理膚色不均與熬夜暗沉。",
  },
{
    id: 128,
    name: "極光白美白面膜 (35片大容量桶裝)",
    category: "面膜",
    series: "面膜",
    originalPrice: "原價 $ 3,000",
    price: "1桶 $ 599",
    image: "/products/white 35.png",
    description: "35pcs / 桶。極光白美白面膜大容量桶裝，適合日常亮白集中保養。",
  },
{
    id: 129,
    name: "冰河淨化柔膚面膜",
    category: "面膜",
    series: "面膜",
    originalPrice: "原價 $ 1,280",
    price: "產地價 $ 960",
    image: "/products/Glacial 5.jpg",
    description: "100mL / 瓶。冰河淨化柔膚面膜，水洗式淨化保養，維持肌膚潔淨柔嫩。",
  },
{
    id: 130,
    name: "鳳梨酵素活膚面膜",
    category: "面膜",
    series: "面膜",
    originalPrice: "原價 $ 390",
    price: "產地價洽詢",
    image: "/products/pineapple 5.jpg",
    description: "22mL x 5pcs / 盒。鳳梨酵素活膚面膜，補水並提升透亮細緻感。",
  },
{
    id: 131,
    name: "綠茶多酚保濕平衡面膜",
    category: "保養品",
    series: "面膜",
    originalPrice: "原價 $ 390",
    price: "產地價洽詢",
    image: "/products/tee 5.jpg",
    description: "20mL x 5片 / 盒。綠茶多酚保濕平衡系列面膜。",
  },
{
    id: 132,
    name: "超導水網瞬效面膜",
    category: "保養品",
    series: "特殊護理系列",
    originalPrice: "原價 $ 1,680",
    price: "產地價 $ 1,260",
    image: "/products/super water.png",
    description: "26mL x 6入 / 盒。超導水網瞬效面膜，集中補水並加強柔嫩光澤。",
  },
{
    id: 135,
    name: "龍血薰衣草舒緩皂 4入優惠",
    category: "組合價",
    series: "肥皂組合",
    originalPrice: "原價價值 $ 1,160",
    price: "4入優惠 $ 799",
    image: "/products/soap lav.png",
    description: "目前上架薰衣草款，購買 4 塊同款享優惠價 $799。",
  },
{
    id: 136,
    name: "櫻の雪傳明酸美白精華液 + 美白乳液贈化妝水",
    category: "組合價",
    series: "保養套組",
    originalPrice: "原價價值 $ 2,470",
    price: "組合價 $ 1,780",
    image: "/products/su2+1.png",
    description: "購買櫻の雪傳明酸美白精華液30mL + 櫻の雪傳明酸美白乳液100mL，贈送櫻の雪傳明酸美白化妝水150mL。",
  },
{
    id: 138,
    name: "亮妍魚膠原蛋白飲兩盒贈 EC 晶眸葉黃素",
    category: "組合價",
    series: "保健食品組合",
    originalPrice: "原價價值 $ 5,900",
    price: "組合價 $ 4,400",
    image: "/products/bb2+1.png",
    description: "亮妍魚膠原蛋白飲-玫瑰風味 50mL/10入 共兩盒，贈 EC 晶眸葉黃素精華凍+精華飲綜合組。",
  },
{
    id: 145,
    name: "龍血求麗甦醒精油滾珠",
    category: "精油",
    series: "精油",
    originalPrice: "牌價 $ 390",
    price: "$ 390",
    image: "/products/dragon roller.png",
    description: "9mL。龍血系列隨身精油滾珠，適合日常香氛與放鬆舒緩保養。",
  },
{
    id: 146,
    name: "薰衣草萬用精油滾珠",
    category: "精油",
    series: "精油",
    originalPrice: "牌價 $ 390",
    price: "$ 390",
    image: "/products/lavender roller.png",
    description: "9mL。薰衣草香氛精油滾珠，適合睡前放鬆與日常隨身舒緩。",
  },
{
    id: 148,
    name: "絕美溫感變色護唇膏",
    category: "護唇膏",
    series: "護唇膏",
    originalPrice: "原價 $ 290",
    price: "單支 $ 290",
    image: "/products/lip tint.jpg",
    description: "3.5g / 支。溫感變色護唇膏，依唇溫呈現自然氣色。",
  },
{
    id: 149,
    name: "絕美保濕護唇膏",
    category: "護唇膏",
    series: "護唇膏",
    originalPrice: "原價 $ 290",
    price: "單支 $ 290",
    image: "/products/lip balm.jpg",
    description: "3.5g / 支。日常保濕護唇膏，滋潤乾燥雙唇。",
  },
{
    id: 179,
    name: "甜橙單方精油",
    category: "精油",
    series: "單方精油",
    originalPrice: "原價 $ 1,200",
    price: "產地價 $ 899",
    image: "/products/placeholder.jpg",
    description: "30mL。甜橙單方精油，適合日常擴香營造清新愉悅的香氣氛圍。",
  },
{
    id: 180,
    name: "尤加利精油",
    category: "精油",
    series: "單方精油",
    originalPrice: "原價 $ 1,200",
    price: "產地價 $ 899",
    image: "/products/placeholder.jpg",
    description: "30mL。尤加利精油，適合居家擴香與清新空間香氣使用。",
  },
{
    id: 181,
    name: "45格精油木盒",
    category: "精油",
    series: "精油配件",
    originalPrice: "原價 $ 980",
    price: "產地價 $ 680",
    image: "/products/placeholder.jpg",
    description: "精油收納木盒，適合整理單方、複方精油與居家香氛收藏。",
  },
{
    id: 182,
    name: "擴香木球5入禮盒",
    category: "精油",
    series: "精油配件",
    originalPrice: "原價 $ 250",
    price: "產地價 $ 168",
    image: "/products/placeholder.jpg",
    description: "5入禮盒。可搭配精油滴入使用，適合桌面、衣櫃或小空間擴香。",
  },
{
    id: 183,
    name: "薰衣草單方精油",
    category: "精油",
    series: "單方精油",
    originalPrice: "原價 $ 1,200",
    price: "產地價 $ 899",
    image: "/products/placeholder.jpg",
    description: "30mL。薰衣草單方精油，適合睡前、放鬆與居家香氛擴香。",
  },
{
    id: 184,
    name: "佐登妮絲5號複方精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/products/placeholder.jpg",
    description: "10mL。佐登妮絲5號複方精油，適合搭配擴香設備或擴香配件使用。",
  },
{
    id: 185,
    name: "呼暢護隨精油（30mL）",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,280",
    price: "產地價 $ 1,710",
    image: "/products/placeholder.jpg",
    description: "30mL。呼暢護隨精油，適合日常擴香，營造清爽舒適的空間感。",
  },
{
    id: 186,
    name: "佐登妮絲OMA律動精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/products/placeholder.jpg",
    description: "10mL。OMA律動精油，適合日常香氛儀式與擴香搭配。",
  },
{
    id: 187,
    name: "快樂鼠尾草精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/products/placeholder.jpg",
    description: "10mL。快樂鼠尾草精油，適合營造柔和、放鬆的香氛氛圍。",
  },
{
    id: 188,
    name: "魔力輕盈精油（30mL）",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 3,280",
    price: "產地價 $ 2,460",
    image: "/products/placeholder.jpg",
    description: "30mL。魔力輕盈精油，適合日常擴香與空間香氛使用。",
  },
{
    id: 189,
    name: "柚見快樂精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/products/placeholder.jpg",
    description: "15mL。柚見快樂精油，適合營造明亮、清新的香氣氛圍。",
  },
{
    id: 190,
    name: "佐登4號複方精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,620",
    image: "/products/placeholder.jpg",
    description: "功效：清新醒腦。適合日常擴香，讓空間維持清新感。",
  },
{
    id: 191,
    name: "佐登妮絲1號複方精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 2,080",
    price: "產地價 $ 1,560",
    image: "/products/placeholder.jpg",
    description: "10mL。佐登妮絲1號複方精油，適合居家擴香與日常香氛使用。",
  },
{
    id: 192,
    name: "智慧之冠精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。智慧之冠精油，適合工作、閱讀與日常空間香氛搭配。",
  },
{
    id: 193,
    name: "魔力輕盈精油（10mL）",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。魔力輕盈精油小容量規格，適合初次體驗或外出攜帶。",
  },
{
    id: 194,
    name: "能量之源精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。能量之源精油，適合日常擴香與空間活力氛圍。",
  },
{
    id: 195,
    name: "順暢平衡精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。順暢平衡精油，適合日常香氛與放鬆儀式使用。",
  },
{
    id: 196,
    name: "亮采橙真精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。亮采橙真精油，適合喜歡明亮果香調的日常擴香。",
  },
{
    id: 197,
    name: "心之綻放精油",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。心之綻放精油，適合營造柔和、溫暖的居家香氣。",
  },
{
    id: 198,
    name: "呼暢護隨精油（10mL）",
    category: "精油",
    series: "複方精油",
    originalPrice: "原價 $ 1,800",
    price: "產地價 $ 1,350",
    image: "/products/placeholder.jpg",
    description: "10mL。呼暢護隨精油小容量規格，適合日常擴香與初次體驗。",
  },
{
    id: 199,
    name: "無印風簡約水氧機（粉）",
    category: "精油",
    series: "擴香設備",
    price: "售價 $ 899",
    image: "/products/placeholder.jpg",
    description: "精油香氛擴香設備，簡約粉色外型，適合居家與辦公空間使用。",
  },
{
    id: 200,
    name: "木紋USB夜光霧化機",
    category: "精油",
    series: "擴香設備",
    price: "售價 $ 899",
    image: "/products/placeholder.jpg",
    description: "USB 霧化擴香設備，木紋外型搭配夜光氛圍，適合居家香氛使用。",
  }

];

const comingSoonRollerProducts: Product[] = [
  {
    id: 12,
    name: "冷杉酷涼活絡精油滾珠",
    category: "即將上架",
    series: "準備上架",
    originalPrice: "牌價 $ 390",
    price: "準備上架",
    image: "/products/Men's Abies roller.jpg",
    description: "9mL。冷杉系列滾珠先放回準備上架區，正式開賣前不開放加入清單。",
    cardSubtitle: "9mL・冷杉系列滾珠",
    priceNote: "準備上架，開放後將更新價格與庫存。",
    features: ["目前先列為準備上架。", "正式開賣前不開放加入清單。"],
    usage: "依商品標示使用，避免接觸眼睛與傷口。",
    notice: "準備上架品項，實際價格、庫存與開放時間以 LINE 小幫手確認為準。",
  },
];

const keepSelfComboIdsV31 = new Set<number>([88, 92]);
const removedProductIdsV31 = new Set<number>([
  74, 89, 95, 96, 97, 98, 99, 102, 103, 139, 143, 144,
  160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171,
  172, 173, 174, 175, 176, 177, 178,
]);
const externalVendorKeywordsV31: string[] = [];

function isRemovedPublicProductV31(product: Product) {
  if (keepSelfComboIdsV31.has(product.id)) return false;
  if (removedProductIdsV31.has(product.id)) return true;
  if (product.series.includes("洗沐組合")) return true;
  if (product.name.includes("龍血洗沐任選")) return true;
  if (product.name.includes("櫻の雪潔顏慕絲任選")) return true;

  const fullText = `${product.name} ${product.category} ${product.series} ${product.description}`;
  if (product.category === "外部廠商") return true;
  return externalVendorKeywordsV31.some((keyword) => fullText.includes(keyword));
}

function normalizeProductForV31(product: Product): Product {
  if (product.id === 145) {
    return {
      ...product,
      category: "即將上架",
      series: "準備上架",
      price: "準備上架",
      priceNote: "準備上架，開放後將更新價格與庫存。",
      description: "9mL。龍血求麗甦醒精油滾珠先列為準備上架，正式開賣前不開放加入清單。",
    };
  }

  if (product.id === 146) {
    return {
      ...product,
      category: "即將上架",
      series: "準備上架",
      price: "準備上架",
      priceNote: "準備上架，開放後將更新價格與庫存。",
      description: "9mL。薰衣草萬用精油滾珠先列為準備上架，正式開賣前不開放加入清單。",
    };
  }

  if (product.id === 88) {
    return {
      ...product,
      category: "健康保健",
      series: "口腔保健",
      originalPrice: "原價 / 單品參考見商品資訊",
      price: "3罐贈1條牙膏 $ 1,500",
      priceNote: "列表只保留組合價；單品參考價放在商品資訊中。",
    };
  }

  if (product.id === 92) {
    return {
      ...product,
      category: "健康保健",
      series: "魚油組合",
      originalPrice: "原價 / 單品參考見商品資訊",
      price: "買一送一 $ 1,580",
      priceNote: "列表只保留組合價；單品參考價放在商品資訊中。",
    };
  }

  if (product.id === 82) {
    return {
      ...product,
      category: "精油香氛",
      series: "香氛皂",
      price: "單入 $ 290｜4入優惠 $ 799",
      description: "200g±10g / 塊。目前上架薰衣草款，單入 $290，4入優惠 $799。其他香型先不顯示。",
    };
  }

  return product;
}

const products: Product[] = [...allProducts, ...comingSoonRollerProducts]
  .filter((product) => !isRemovedPublicProductV31(product))
  .map(normalizeProductForV31);

const productContentOverrides: Record<number, Partial<Product>> = {
  1: {
    cardName: "BC-CA複合益生菌高鈣活力配方",
    cardSubtitle: "3g x 30包 / 盒・高鈣活力益生菌",
    spec: "3g x 30包 / 盒",
    intro: "BC-CA複合益生菌高鈣活力配方為益生菌系列品項，結合複合益生菌與高鈣營養補給，適合作為全家日常保健參考。",
    features: [
      "採用 BC-198 芽孢桿菌，作為日常消化道機能與營養補給參考。",
      "內含 14 種複合益生菌，適合 2 歲以上依產品標示補充。",
      "選用德國檸檬酸鈣，適合重視補鈣與日常活力補給的人。",
    ],
    suitableFor: [
      "日常保健",
      "補鈣需求",
      "益生菌補給",
      "全家營養補充",
    ],
    usage: "每日 1～3 包，餐前餐後均可食用；2 歲以上可依產品標示或客服說明補充。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前保留既有回購群優惠：3 盒 $1,100；庫存、效期與最終金額依 LINE 小幫手確認為準。",
  },
  2: {
    cardName: "蔓越莓益生菌速酵力配方",
    cardSubtitle: "3g x 30包 / 盒・女性日常保健",
    spec: "3g x 30包 / 盒",
    intro: "蔓越莓益生菌速酵力配方為女性日常保健與益生菌補給品項，結合蔓越莓與複合益生菌，適合重視私密環境日常維持的客人。",
    features: [
      "蔓越莓益生菌酵素複合配方，適合作為女性日常營養補給參考。",
      "含 A 型原花青素與蔓越莓濃縮配方，幫助維持日常健康狀態。",
      "適合想補充益生菌、蔓越莓與女性保健營養的人。",
    ],
    suitableFor: [
      "日常保健",
      "私密修護保養",
      "女性保健",
      "益生菌補給",
    ],
    usage: "每日建議依產品標示食用，可依客服說明於早上或睡前補充。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前保留既有回購群優惠：3 盒 $1,600；庫存、效期與最終金額依 LINE 小幫手確認為準。",
  },
  3: {
    cardName: "BC-HA 複合益生菌",
    cardSubtitle: "3g x 60包 / 盒・大容量順暢美妍補給",
    spec: "3g x 60包 / 盒",
    intro: "BC-HA 複合益生菌為大容量日常保健補給品項，結合益生菌、小分子玻尿酸與菊糖益生質，適合久坐族與想維持順暢養顏的人。",
    features: [
      "60 包大容量設計，適合作為日常益生菌補給。",
      "採用 BC-198 穩定菌株概念，常溫保存也方便日常攜帶與補充。",
      "添加小分子玻尿酸與益生質菊糖，兼顧順暢與美妍營養補給。",
    ],
    suitableFor: [
      "日常保健",
      "排便卡卡",
      "久坐上班族",
      "順暢養顏補給",
    ],
    usage: "每日建議依產品標示或客服說明食用。",
    notice: "請依產品標示食用。若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前保留既有回購群優惠：2 盒 $2,000；庫存、效期與最終金額依 LINE 小幫手確認為準。",
  },
  4: {
    cardName: "EC晶眸葉黃素",
    cardSubtitle: "精華凍 + 精華飲綜合組・3C族晶亮補給",
    spec: "精華凍 + 精華飲綜合組（20g x 10入 + 20mL x 10入）/ 盒",
    intro: "EC晶眸葉黃素為晶眸保健系列明星品項，結合精華凍與精華飲雙劑型，適合重度 3C 使用者、學生與上班族作為日常晶亮營養補給。",
    features: [
      "精華凍 + 精華飲雙劑型設計，攜帶與補充都方便。",
      "含葉黃素、玉米黃素與花青素相關營養成分，適合作為日常晶眸保健參考。",
      "一盒兼具 Q 彈果凍與水感飲品，適合全家依產品標示補充。",
    ],
    suitableFor: [
      "重度3C學生",
      "久看螢幕上班族",
      "中老年日常保健",
      "晶眸營養補給需求者",
    ],
    usage: "每日建議依產品標示或客服說明食用；兒童每日 1 包、成人每日 1～2 包，餐後補充更適合日常安排。",
    notice: "請依產品標示食用。內含維生素 A 有助於維持在暗處的視覺；若有特殊體質、孕哺乳或正在接受醫囑，建議先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  5: {
    cardName: "亮妍魚膠原蛋白飲",
    cardSubtitle: "15mL x 10瓶 / 盒・美妍飲品系列",
    spec: "美妍保健飲品（15mL x 10瓶）/ 盒",
    intro: "亮妍魚膠原蛋白飲為美妍飲品系列，結合魚膠原蛋白、鮭魚蛋白聚醣與植萃亮妍成分，適合作為日常美容保健與水潤光澤補給。",
    features: [
      "採用小分子魚膠原蛋白肽，適合日常美妍營養補給。",
      "搭配鮭魚蛋白聚醣與保濕概念營養成分，支持水潤光澤保養。",
      "融入燕窩、玫瑰與櫻花植萃概念，作為日常亮妍保健參考。",
    ],
    suitableFor: [
      "日常美容保健",
      "膠原蛋白補給",
      "水潤光澤需求",
      "熬夜疲憊保養族",
    ],
    usage: "每日建議依產品標示食用，一瓶即飲；可依客服說明安排早上或睡前補充。",
    notice: "請依產品標示食用。本產品含有大豆、魚類及其製品，為動物性來源、非素食；不適合對其過敏體質者食用。若有特殊體質或孕哺乳，請先洽詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "售價 $1,980，庫存依 LINE 小幫手確認為準。",
  },
  10: {
    cardName: "冷杉保濕化妝水",
    cardSubtitle: "150mL・即期出清・單瓶 $199",
    spec: "150mL",
    intro: "冷杉型男淨化保濕化妝水為冷杉系列清爽保濕品項，目前為單瓶 $199 即期出清。",
    features: [
      "即期出清單瓶 $199，適合想補充清爽保濕品項的客人。",
      "清爽水感質地，適合男士日常保養使用。",
      "即期優惠品項，實際效期請以 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "即期出清",
      "男士保養",
      "清爽保濕",
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "即期商品售出前會由客服協助確認效期。使用後若有不適，請暫停使用。",
    expiryNote: "此為即期出清品項，實際效期請以 LINE 小幫手確認為準。",
    priceNote: "即期出清單瓶 $199，庫存與效期依 LINE 小幫手確認為準。",
  },

  11: {
    cardName: "冷杉保濕乳",
    cardSubtitle: "100mL・即期出清・單瓶 $199",
    spec: "100mL",
    intro: "冷杉型男淨化保濕乳為冷杉系列清爽保濕品項，目前為單瓶 $199 即期出清。",
    features: [
      "即期出清單瓶 $199，適合想補充清爽保濕品項的客人。",
      "乳液質地可作為日常保濕步驟，適合男士簡單保養。",
      "即期優惠品項，實際效期請以 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "即期出清",
      "男士保養",
      "清爽保濕",
    ],
    usage: "化妝水後取適量均勻塗抹於臉部與頸部。",
    notice: "即期商品售出前會由客服協助確認效期。使用後若有不適，請暫停使用。",
    expiryNote: "此為即期出清品項，實際效期請以 LINE 小幫手確認為準。",
    priceNote: "即期出清單瓶 $199，庫存與效期依 LINE 小幫手確認為準。",
  },

  12: {
    cardName: "冷杉酷涼活絡精油滾珠",
    cardSubtitle: "9mL・冷杉系列",
    spec: "9mL",
    intro: "冷杉酷涼活絡精油滾珠為冷杉系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 小幫手協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "男士保養",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠依 LINE 小幫手確認為準。",
  },
  17: {
    cardName: "龍血求麗化妝水",
    cardSubtitle: "120mL・肌膚乖乖水・前導補水",
    spec: "120mL / 瓶",
    intro: "網美與美妝部落客口碑盛讚的「肌膚乖乖水」，專為日間醒膚與夜間調理打造。洗臉後第一步快速補水、穩定膚況，幫助調控皮脂與油水平衡，讓後續精華與乳液更好吸收。",
    features: [
      "秘魯龍血前導修護：嚴選歐盟 ECOCERT 有機認證秘魯龍血素，幫助安撫不穩定膚況，強化肌膚防禦力。",
      "玻尿酸鈉高效補水：快速補充肌膚水分，提升長效保濕續航力，讓肌膚維持水潤光澤。",
      "調理油水平衡：溫和調理肌膚紋理，改善因乾燥引起的出油問題，妝前使用也能讓妝感更服貼。",
      "4 大安心零負擔：無酒精、無香精、無色素、無 PARABEN 防腐劑，搭配檸檬、尤加利等天然精油植萃香調。",
    ],
    suitableFor: [
      "乾燥缺水",
      "油水不平衡",
      "熬夜暗沉肌",
      "3C 壓力疲憊肌",
      "保養吸收感不佳",
    ],
    usage: "每日早晚於臉部清潔後，取適量化妝水於掌心或化妝棉上，均勻輕拍、擦拭於臉部與頸部肌膚直到吸收。也可針對局部乾燥部位短時間濕敷。",
    notice: "本產品含天然植物萃取成分，可能因產地、氣候或季節不同，使色澤或氣味略有差異，屬正常現象。使用後若有不適請立即停止使用並諮詢皮膚科醫師。對精油成分過敏者，建議先於手臂內側測試。請存放於避免陽光直射、高溫或潮濕處，並放置於孩童不易取得處。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  18: {
    name: "龍血求麗精華",
    cardName: "龍血求麗精華",
    cardSubtitle: "30mL・龍血小橘瓶・熬夜修護",
    spec: "30mL / 瓶",
    intro: "風靡美妝圈、被譽為熬夜族神級救星的「龍血小橘瓶」。專為初老肌、嬌弱肌與經常面對 3C 螢幕的疲憊肌打造，清透水感質地快速吸收，幫助穩定膚況、修護疲憊暗沉肌。",
    features: [
      "秘魯龍血樹脂修護力：嚴選通過歐盟 ECOCERT 有機認證與公平交易的秘魯龍血素，幫助修護肌膚、穩定膚況並強化屏障。",
      "日本富士雨生紅球藻：添加藻紅素成分，幫助對抗初老、維持肌膚彈潤度與細緻光澤感。",
      "IRB 人體實測有感：舒緩度有感提升，並同步幫助保濕、亮白與緊緻。",
      "4 大安心無添加：無酒精、香精、色素與 PARABEN 防腐劑，搭配檸檬、尤加利、快樂鼠尾草等天然植萃精油香調。",
    ],
    suitableFor: [
      "敏感舒緩",
      "抗皺緊緻",
      "熬夜暗沉肌",
      "初老肌",
      "3C 壓力疲憊肌",
    ],
    usage: "每日早晚於化妝水後，使用玻璃滴管取適量精華液，均勻塗抹於臉部與頸部肌膚，順著肌膚紋理輕柔拍勻並按摩至吸收。妝前使用也可提升肌膚保濕度，使底妝更服貼。",
    notice: "本產品含天然植物萃取成分，可能因產地、氣候或季節不同，使色澤或氣味略有差異，屬正常現象。使用後若有不適請立即停止使用並諮詢皮膚科醫師。配方含天然植物精油，對精油成分過敏者建議先於手臂內側測試。請存放於避免陽光直射、高溫或潮濕處，並放置於孩童不易取得處。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  19: {
    cardName: "龍血求麗修護乳",
    cardSubtitle: "80mL・修護水乳液・買一送一",
    spec: "80mL / 瓶",
    intro: "網美口碑盛讚、被譽為地表最強的「修護水乳液」。專為亞洲氣候與膚質研發，水凝科技打造清爽如厚精華般的質地，幫助穩定換季不乖肌，補水、修護、鎖水一次完成。",
    features: [
      "輕盈水凝科技質地：擁有乳液與乳霜的滋養力，卻能甩掉黏膩感，一年四季皆適用。",
      "秘魯龍血樹脂 × 五、六胜肽：結合 ECOCERT 有機認證龍血素與高效撫紋胜肽，幫助修護屏障、找回彈潤膚感。",
      "三大黃金鎖水因子：添加玫瑰花水、玻尿酸鈉與卵磷脂，建立保濕防護網，提升肌膚持水力。",
      "植萃精油香調紓壓：無酒精、無色素、無香精與 PARABEN 防腐劑，搭配檸檬、尤加利、快樂鼠尾草等天然植物精油。",
    ],
    suitableFor: [
      "乾燥缺水",
      "敏感舒緩",
      "初老暗沉肌",
      "怕乳液厚重黏膩",
      "冷氣房與換季乾燥",
    ],
    usage: "每日早晚於化妝水與精華液後使用。建議全臉約 1.5 次按壓量，點塗於臉部與頸部肌膚，順著肌膚紋理輕柔拍勻、按壓至完全吸收。妝前使用也能讓後續底妝更服貼。",
    notice: "本產品含天然植物萃取成分，可能因產地、氣候或季節不同，使色澤或氣味略有差異，屬正常現象。使用後若有不適請立即停止使用並諮詢皮膚科醫師。配方含天然植物精油，對精油成分過敏者建議先於手臂內側測試。請存放於避免陽光直射、高溫或潮濕處，並放置於孩童不易取得處。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "買一送一，實際活動、庫存與最終金額依 LINE 小幫手確認為準。",
  },
  20: {
    cardName: "龍血求麗修護霜",
    cardSubtitle: "35mL・夜間鎖水・第二件五折",
    spec: "35mL / 瓶",
    intro: "美妝社群與網美口碑盛讚、被譽為初老肌對抗細紋的「神奇撫紋小熨燙」。作為保養最後一步，幫助夜間深層封存滋養，讓肌膚重回彈嫩、緊實與細緻透亮感。",
    features: [
      "秘魯龍血樹脂 × 五、六胜肽：深層修護並強健肌膚屏障，幫助撫平乾燥細紋，改善初老疲憊肌。",
      "摩洛哥堅果油 × 乳木果油：富含維生素 E 與植物油脂，帶來柔潤滋養，幫助緊實並平滑肌膚。",
      "24 小時長效鎖水防護膜：玻尿酸鈉幫助封存水分，即使長時間待在冷氣房，也能維持水嫩飽滿。",
      "4 大安心零負擔：無酒精、無香精、無色素、無 PARABEN 防腐劑，敏弱肌與換季不穩定肌也能安心使用。",
    ],
    suitableFor: [
      "乾燥缺水",
      "抗皺緊緻",
      "敏感舒緩",
      "初老細紋",
      "夜間鎖水修護",
    ],
    usage: "每日早晚於化妝水、精華液或修護乳後使用。利用挖勺取適量修護霜塗抹於臉部與頸部肌膚，順著肌膚紋理以指腹輕柔畫圈按摩，透過指腹溫熱幫助霜體吸收並封存滋養。",
    notice: "本產品含天然植物萃取成分，可能因產地、氣候或季節不同，使色澤或氣味略有差異，屬正常現象。使用後若有不適請立即停止使用並諮詢皮膚科醫師。配方含天然植物精油，對精油成分過敏者建議先於手臂內側測試。請存放於避免陽光直射、高溫或潮濕處，並放置於孩童不易取得處。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "第二件五折，實際活動、庫存與最終金額依 LINE 小幫手確認為準。",
  },
  21: {
    cardName: "肌光緊緻速妍雪膚液",
    cardSubtitle: "130mL・肌光緊緻速妍系列",
    spec: "130mL / 瓶",
    intro: "洗臉後的緊緻前導第一步，幫助調理肌膚紋理，為肌底注入細緻彈力與光澤。",
    features: [
      "清潔後第一道緊緻前導保養。",
      "可搭配同系列精華露、霜與面膜層層加乘。",
      "支援初老、暗沉與彈力不足的日常保養。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "初老保養",
      "彈力光澤",
      "肌光緊緻速妍系列"
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  22: {
    cardName: "肌光緊緻速妍精華露",
    cardSubtitle: "30mL・肌光緊緻速妍系列",
    spec: "30mL / 瓶",
    intro: "高濃縮加強型緊緻精華，適合局部細紋、鬆弛與熬夜疲憊肌，幫助密集修護老態感。",
    features: [
      "加強型精華品項，密集補充緊緻修護能量。",
      "可搭配雪膚液與霜，封存保養活性。",
      "適合細紋、鬆弛與熟齡修護需求。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "局部細紋",
      "熟齡修護",
      "熬夜疲憊肌"
    ],
    usage: "化妝水後取適量塗抹全臉，再依需求搭配乳液或乳霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  23: {
    cardName: "肌光緊緻速妍霜",
    cardSubtitle: "50mL・肌光緊緻速妍系列",
    spec: "50mL / 瓶",
    intro: "滋潤細緻的緊緻修護霜，適合保養後段使用，幫助鎖住水分與滋養，維持澎彈立體感。",
    features: [
      "保養最後步驟，長效潤澤並鎖住前序保養。",
      "適合搭配雪膚液與精華露加強抗皺修護。",
      "支援乾燥、彈力不足與熟齡肌日常保養。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "長效潤澤",
      "熟齡肌",
      "乾燥缺水"
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  24: {
    cardName: "肌光緊緻速妍面膜",
    cardSubtitle: "單片 / 盒裝・肌光緊緻速妍系列",
    spec: "單片 / 盒裝",
    intro: "集中型緊緻修護面膜，適合約會前、熬夜後或需要快速加強保養時使用。",
    features: [
      "特殊場合與急救保養時的集中修護。",
      "敷後幫助肌膚維持水亮、潤澤與彈力感。",
      "可搭配同系列日常保養維持緊緻光澤。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "面膜保養",
      "約會前",
      "熬夜後"
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  25: {
    cardName: "INSK乳酸平衡機能水",
    cardSubtitle: "150mL・INSK乳酸平衡系列",
    spec: "150mL / 瓶",
    intro: "INSK乳酸平衡機能水是洗臉後的關鍵第一步，幫助溫和調理肌膚表層，維持健康菌叢與油水平衡。",
    features: [
      "清潔後作為保養前導，幫助平衡肌膚環境。",
      "可搭配同系列精華、乳液或乳霜，層層加乘。",
      "建立日常保養基礎步驟，提升肌膚自我防禦力。"
    ],
    suitableFor: [
      "INSK乳酸平衡系列",
      "外油內乾",
      "油水平衡",
      "不穩定膚況"
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  26: {
    cardName: "INSK乳酸平衡修護乳",
    cardSubtitle: "100mL・INSK乳酸平衡系列",
    spec: "100mL / 瓶",
    intro: "質地輕盈好吸收的乳酸平衡修護乳，深度滋潤並修護肌膚水脂膜，長效鎖水、告別粗糙紊亂。",
    features: [
      "保養程序後段使用，幫助維持肌膚潤澤度。",
      "可搭配同系列化妝水或精華，加強鎖水屏障。",
      "適合日常保濕、修護與平衡滋潤需求。"
    ],
    suitableFor: [
      "INSK乳酸平衡系列",
      "乾燥缺水",
      "油水平衡",
      "外油內乾"
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  27: {
    cardName: "BA-5肌密抗皺精華",
    cardSubtitle: "30mL・BA-5肌密抗皺系列",
    spec: "30mL / 瓶",
    intro: "高階密集抗皺精華，質地細緻高滲透，針對細紋、乾紋與熟齡肌膚進行深度修護。",
    features: [
      "日常保養中的加強型精華，密集補充抗老能量。",
      "可搭配同系列化妝水與抗皺霜，層層封存營養。",
      "適合特定抗皺、淡化細紋與極致修護需求。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "熟齡肌",
      "初老細紋",
      "高階保養"
    ],
    usage: "化妝水後取適量均勻塗抹於臉部，再依需求搭配乳液或抗皺霜。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  28: {
    cardName: "BA-5肌密抗皺霜",
    cardSubtitle: "50mL・BA-5肌密抗皺系列",
    spec: "50mL / 瓶",
    intro: "奢華豐潤抗皺霜，作為保養最後一道鎖水修護防線，幫助封存抗老成分與滋養。",
    features: [
      "保養程序最後步驟使用，維持長效潤澤。",
      "搭配同系列化妝水或精華，帶來深層滋養與撫紋修護。",
      "適合高階保濕、密集修護與深度抗老保養。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "極度乾燥",
      "熟齡肌",
      "夜間鎖水"
    ],
    usage: "化妝水與精華液後，取適量均勻塗抹於臉部與頸部肌膚，並以指腹按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  29: {
    cardName: "龍血求麗頭皮修護洗髮精",
    cardSubtitle: "500mL・龍血洗沐髮品",
    spec: "500mL / 瓶",
    intro: "沙龍級頭皮能量系洗髮精，採用秘魯龍血樹脂與 0 矽靈配方，深層潔淨並修護頭皮，幫助改善髮根扁塌。",
    features: [
      "0 矽靈配方，洗後蓬鬆不厚重。",
      "龍血修護概念，幫助頭皮與髮根維持健康狀態。",
      "搭配自然精油草本香氣，洗後柔順有光澤。"
    ],
    suitableFor: [
      "頭皮修護",
      "髮根扁塌",
      "乾枯受損髮",
      "任選3瓶1100"
    ],
    usage: "取適量洗髮精於濕髮與頭皮，按摩起泡後以清水沖洗；可視需求重複清潔一次。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單瓶產地價 $590；同系列可搭配任選 3 瓶 $1,100 活動，庫存與優惠依 LINE 小幫手確認為準。",
  },
  30: {
    cardName: "龍血求麗潤澤修護沐浴乳",
    cardSubtitle: "500mL・龍血洗沐髮品",
    spec: "500mL / 瓶",
    intro: "主打肌質養潤的龍血沐浴乳，結合秘魯龍血樹脂與多重植萃，洗後肌膚水潤柔嫩、不緊繃。",
    features: [
      "龍血修護概念，洗淨同時維持肌膚柔嫩。",
      "燕麥、洋甘菊等舒緩植萃，適合乾燥粗糙肌日常使用。",
      "水潤滑順不緊繃，搭配精油香氛提升沐浴感。"
    ],
    suitableFor: [
      "乾燥粗糙",
      "水潤不緊繃",
      "沐浴乳",
      "任選3瓶1100"
    ],
    usage: "取適量沐浴乳於濕潤肌膚或沐浴球，搓揉起泡後按摩全身，再以清水沖洗。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單瓶產地價 $590；同系列可搭配任選 3 瓶 $1,100 活動，庫存與優惠依 LINE 小幫手確認為準。",
  },
  31: {
    cardName: "純淨洗髮精",
    cardSubtitle: "洗髮品項・洗沐系列",
    spec: "洗髮品項",
    intro: "純淨洗髮精為洗沐系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "洗沐",
      "洗沐系列",
    ],
    usage: "取適量於濕髮或身體肌膚，搓揉清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  32: {
    cardName: "阿甘絲柔洗髮精",
    cardSubtitle: "洗髮品項・洗沐系列",
    spec: "洗髮品項",
    intro: "阿甘絲柔洗髮精為洗沐系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "洗沐",
      "洗沐系列",
    ],
    usage: "取適量於濕髮或身體肌膚，搓揉清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  33: {
    cardName: "INSK乳酸淨痘修護膠",
    cardSubtitle: "15mL・INSK乳酸平衡系列",
    spec: "15mL / 支",
    intro: "針對局部瑕疵與不安定膚況設計，溫和調理毛孔、安撫粉刺與痘痘問題，是隨身控油修護好物。",
    features: [
      "保養程序後段使用，針對局部瑕疵密集調理。",
      "可搭配同系列化妝水或精華，維持全臉油水平衡。",
      "適合局部保濕、控油、修護與面皰保養需求。"
    ],
    suitableFor: [
      "油性毛孔",
      "粉刺痘痘",
      "控油調理",
      "INSK乳酸平衡系列"
    ],
    usage: "化妝水與精華後，取適量局部塗抹於臉部瑕疵或易出油部位。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  34: {
    cardName: "INSK乳酸平衡水嫩膜",
    cardSubtitle: "23mL x 6片・INSK乳酸平衡系列",
    spec: "23mL x 6片 / 盒",
    intro: "集中型乳酸平衡水嫩膜，適合乾燥缺水與膚況不穩時加強保養，快速補水並回復透亮。",
    features: [
      "日常保養或急救保養時搭配使用。",
      "幫助補充水分、舒緩與平衡不穩定膚況。",
      "敷臉後再搭配日常保養程序，維持潤澤感。"
    ],
    suitableFor: [
      "面膜保養",
      "乾燥缺水",
      "不穩定膚況",
      "INSK乳酸平衡系列"
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  35: {
    cardName: "薰衣草齒齦保健牙膏",
    cardSubtitle: "120g・牙膏",
    spec: "120g / 支",
    intro: "薰衣草齒齦保健牙膏，添加薰衣草植萃香氣，溫和清潔牙齒與牙齦邊緣，適合喜歡草本香氛與夜間舒緩潔牙的人。",
    features: [
      "薰衣草精油草本調理，帶來溫和口腔舒適感。",
      "泡沫細緻，協助維護牙齒與牙齦健康。",
      "天然薰衣草氣息，刷牙同時維持口氣怡人。"
    ],
    suitableFor: [
      "口腔清潔",
      "齒齦保健",
      "薰衣草香氣",
      "夜間潔牙"
    ],
    usage: "每天至少刷牙兩次，取適量牙膏於牙刷上，輕柔刷洗牙齒與牙齦邊緣，最後以清水徹底漱口吐出。",
    notice: "請配合正確刷牙習慣。不可吞食，刷牙後應徹底漱口吐出。若不慎出現敏感不適，請暫停使用並諮詢牙醫師。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "可搭配齒齦保健牙膏任選活動，庫存與優惠依 LINE 小幫手確認為準。",
  },
  36: {
    cardName: "龍血齒齦保健牙膏",
    cardSubtitle: "120g・牙膏",
    spec: "120g / 支",
    intro: "龍血齒齦保健牙膏，將秘魯龍血樹脂調理概念融入日常潔牙，幫助溫和清潔牙齒與齒縫，維持牙齦健康與清新口氣。",
    features: [
      "秘魯龍血調理概念，溫和呵護牙齦與口腔環境。",
      "協助維持日常口腔清潔與牙齦健康。",
      "溫和潔淨不刺激，刷後維持乾淨舒爽。"
    ],
    suitableFor: [
      "口腔清潔",
      "齒齦保健",
      "龍血牙膏",
      "清新口氣"
    ],
    usage: "每天至少刷牙兩次，每次 2–3 分鐘；取適量牙膏於牙刷上仔細刷洗牙齒各面，最後以清水徹底漱口吐出。",
    notice: "請配合正確刷牙習慣。不可吞食，刷牙後應徹底漱口吐出。6 歲以下孩童使用量約綠豆大小，需成人在旁指導。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "可搭配齒齦保健牙膏任選活動，庫存與優惠依 LINE 小幫手確認為準。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "實際優惠與庫存依 LINE 小幫手確認為準。",
  },
  46: {
    cardName: "高頻霧化香薰機一台（買1台送1瓶茶樹精油10ml）",
    cardSubtitle: "擴香設備・售價 $1,980",
    spec: "買1台送1瓶茶樹精油10mL",
    intro: "高頻霧化香薰機一台，活動含贈茶樹精油10mL一瓶，適合日常香氛擴香使用。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "售價 $1,980，庫存依 LINE 小幫手確認為準。",
  },
  47: {
    cardName: "石墨烯電氣石精油貼布｜涼感",
    cardSubtitle: "10片 / 盒・清爽沁涼款",
    spec: "10片 / 盒",
    intro: "石墨烯電氣石精油貼布涼感款結合石墨烯、電氣石與草本薄荷精油概念，帶來清爽沁涼的局部放鬆感，適合運動後、久坐肩頸與炎熱天氣日常保健使用。",
    features: [
      "石墨烯科技概念，幫助涼感精油氣息與清爽感更均勻延展。",
      "電氣石能量概念，適合肩頸、腰背與四肢局部舒緩放鬆。",
      "草本薄荷精油配方，帶來溫和沁涼感，適合喜歡清爽貼布的人。",
    ],
    suitableFor: [
      "運動後放鬆",
      "久坐肩頸緊繃",
      "喜歡涼感清爽",
      "日常局部保健",
    ],
    usage: "清潔並擦乾需要貼敷的部位，撕去背膠紙後將貼布平整貼於肌膚。建議每片貼敷時間不超過 4～6 小時。",
    notice: "本產品僅供外用，請勿直接貼敷於傷口、濕疹、潰爛或黏膜受損部位。使用後若出現發紅、搔癢或刺痛等不適，請立即撕除並以清水洗淨。請存放於避免陽光直射、高溫或潮濕的陰涼密閉場所，並放置於孩童不易取得處。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單盒價格保留既有設定；另有任選 4 盒、10 盒優惠組合，庫存與最終金額依 LINE 小幫手確認為準。",
    gallery: ["/products/patch 1.png", "/products/blue 100.jpg"],
  },
  48: {
    cardName: "石墨烯電氣石精油貼布｜溫感",
    cardSubtitle: "10片 / 盒・溫熱舒緩款",
    spec: "10片 / 盒",
    intro: "石墨烯電氣石精油貼布溫感款主打溫和持續的溫熱感，像為肩頸、腰背與四肢局部敷上一層舒適熱毛巾，適合冷氣房、家事勞動後與日常放鬆保養。",
    features: [
      "石墨烯科技概念，幫助溫感精油氣息與溫熱感更均勻延展。",
      "電氣石能量概念，適合久坐、勞動後的局部放鬆保養。",
      "溫感草本精油帶來持續暖感，避免過度辛辣刺激的貼布感受。",
    ],
    suitableFor: [
      "冷氣房族群",
      "家事勞動後",
      "肩頸腰背緊繃",
      "喜歡溫熱放鬆",
    ],
    usage: "清潔肌膚表面並擦乾後，取一片貼布撕下襯紙，平整貼於肩頸、腰背或四肢關節等需要溫熱調理之處。",
    notice: "本產品僅供外用，請勿直接貼敷於傷口、紅腫潰爛或皮膚異常部位。孕婦、哺乳期婦女及 2 歲以下兒童使用前，請先諮詢專業醫師。撕除時請勿用力猛撕，建議溫和地順著毛髮生長方向撕下。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單盒價格保留既有設定；另有任選 4 盒、10 盒優惠組合，庫存與最終金額依 LINE 小幫手確認為準。",
    gallery: ["/products/patch 5.png", "/products/red 100.jpg"],
  },
  49: {
    cardName: "茶樹K痘精華",
    cardSubtitle: "8mL・茶樹控油系列",
    spec: "8mL / 盒",
    intro: "高濃縮茶樹局部精華，針對局部出油、粗大毛孔與不安定油脂肌膚進行重點平衡調理。",
    features: [
      "日常控油保養中的局部加強品項。",
      "可搭配茶樹化妝水與保濕乳，形成完整控油流程。",
      "適合特定皮脂粗糙、毛孔油光與面皰瑕疵需求。"
    ],
    suitableFor: [
      "油性毛孔",
      "粉刺痘痘",
      "局部控油",
      "茶樹控油系列"
    ],
    usage: "化妝水後取適量點塗於局部出油或面皰瑕疵部位，再依需求搭配乳液。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  50: {
    cardName: "茶樹控油化妝水",
    cardSubtitle: "150mL・茶樹控油系列",
    spec: "150mL / 瓶",
    intro: "清潔後的控油第一步，質地清爽如水，幫助安撫油性肌膚、清透毛孔並建立控油基礎。",
    features: [
      "洗臉清潔後作為皮脂調理前導補水。",
      "可搭配同系列精華與控油保濕乳，使流程完整。",
      "建立日常控油基礎步驟，揮別油光滿面。"
    ],
    suitableFor: [
      "油性毛孔",
      "混合偏油",
      "熬夜出油",
      "粉刺粗糙"
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  51: {
    cardName: "茶樹控油保濕乳",
    cardSubtitle: "100mL・茶樹控油系列",
    spec: "100mL / 瓶",
    intro: "清爽不悶厚的控油保濕乳，補水同時維持油水平衡，讓肌膚維持乾淨不黏膩的清爽膚觸。",
    features: [
      "保養程序最後階段使用，封存水分並控油潤澤。",
      "可搭配化妝水或 K 痘精華，強化水脂防禦網。",
      "適合日常保濕、調理油光與舒緩修護。"
    ],
    suitableFor: [
      "乾燥缺水",
      "油性毛孔",
      "外油內乾",
      "季節皮脂不穩"
    ],
    usage: "化妝水與精華後，取適量均勻塗抹於臉部與頸部。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  52: {
    cardName: "肌可佳膠原蛋白彈潤原液",
    cardSubtitle: "30mL・膠原蛋白系列",
    spec: "30mL",
    intro: "肌可佳膠原蛋白彈潤原液為膠原蛋白系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 小幫手協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "乾燥缺水",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  53: {
    cardName: "龍血玻尿酸保濕精華液",
    cardSubtitle: "300mL・國民保濕精華・買一送一",
    spec: "300mL / 瓶",
    intro: "被譽為佐登妮絲城堡必敗的「國民保濕精華」，專為現代人因作息不正常、生活壓力大而導致的缺水、暗沉與脫屑問題設計。清爽好吸收，臉部、頸部到身體肌膚皆可使用。",
    features: [
      "雙倍保濕 × 長效補水：嚴選日本小分子玻尿酸，幫助補充肌膚水分，維持長時間水潤感。",
      "秘魯龍血樹脂修護力：蘊含穩膚與修護力，幫助強健肌膚屏障，改善缺水疲憊感。",
      "解鎖四大危肌：針對壓力、疲憊、乾燥、脫屑等肌膚狀態，提供日常快充修護。",
      "300mL 大容量高 CP 值：臉部、頸部到身體肌膚皆可使用，適合日常大量保濕。",
    ],
    suitableFor: [
      "乾燥缺水",
      "敏感舒緩",
      "熬夜暗沉肌",
      "外油內乾肌",
      "全身保濕",
    ],
    usage: "每日早晚於化妝水後，取適量精華液，均勻塗抹於臉部與頸部肌膚，以指腹輕柔拍勻並按摩至吸收。也可作為身體保濕精華，塗抹於手臂、腿部或容易乾燥的部位。",
    notice: "僅供外用，請勿使用於傷口或肌膚不適部位。使用後若出現敏感或不適，請立即停止使用並諮詢皮膚科醫師。本產品含天然植物萃取成分，可能因產地、氣候或季節不同，使色澤與氣味略有差異，屬正常現象。請存放於避免陽光直射、高溫或潮濕處，並放置於孩童不易取得處。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "買一送一，依通路活動為準。實際活動、庫存與最終金額依 LINE 小幫手確認。",
  },
  54: {
    cardName: "龍血求麗卸妝油",
    cardSubtitle: "150mL・龍血系列",
    spec: "150mL / 瓶",
    intro: "龍血系列卸妝油，輕盈高親膚質地能快速溶解彩妝、防曬與毛孔髒污，遇水迅速乳化、好沖洗。",
    features: [
      "柔滑好推勻，能包覆並溶解頑固彩妝與防曬。",
      "溫和潔膚，卸妝同時維持肌膚水潤舒適。",
      "乳化快速、洗後不留厚重殘留感，可搭配龍血潔顏慕絲。"
    ],
    suitableFor: [
      "清潔卸妝",
      "毛孔潔淨",
      "卸後不緊繃",
      "龍血系列"
    ],
    usage: "保持雙手及臉部乾燥，取適量卸妝油按摩全臉；加少量清水乳化變白後，以清水徹底沖洗。",
    notice: "使用後若有不適，請暫停使用。請避免直接接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  55: {
    cardName: "龍血求麗潔顏慕絲",
    cardSubtitle: "150mL・龍血系列",
    spec: "150mL / 瓶",
    intro: "龍血系列潔顏慕絲，細緻綿密泡泡溫和帶走毛孔髒污與多餘皮脂，洗後不緊繃、不乾澀。",
    features: [
      "免手動搓泡，超微米泡泡溫和包覆髒污。",
      "日常潔顏與保養前清潔使用，為後續保養打好基礎。",
      "溫和潔淨不傷肌膚屏障，可與龍血卸妝油搭配雙重清潔。"
    ],
    suitableFor: [
      "清潔卸妝",
      "洗後不緊繃",
      "龍血系列",
      "日常潔顏"
    ],
    usage: "每日早晚打濕臉部後，按壓適量慕絲於掌心，均勻塗抹全臉並輕柔按摩，再以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，若不慎入眼請立即以大量清水沖洗。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  56: {
    cardName: "水搖滾保濕面膜 (5片裝)",
    cardSubtitle: "22mL x 5pcs・保濕面膜",
    spec: "22mL x 5pcs / 盒",
    intro: "明星保濕面膜，滿載澎湃保濕精華，快速浸潤乾燥缺水肌，適合日常補水、熬夜後急救與集中保養。",
    features: [
      "長效爆水續航力，適合日常基礎保養或急救補水。",
      "高持水面膜剪裁，快速補足肌膚日常保濕需求。",
      "敷臉後搭配乳液或乳霜，封存透亮水光感。"
    ],
    suitableFor: [
      "乾燥缺水",
      "外油內乾",
      "面膜保養",
      "龍血系列"
    ],
    usage: "臉部清潔後取出面膜並撕下外層襯膜，均勻敷於臉部約 10–15 分鐘或依標示時間，取下後輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  57: {
    cardName: "水搖滾保濕面膜 (10片裝)",
    cardSubtitle: "22mL x 10pcs・保濕面膜",
    spec: "22mL x 10pcs / 盒",
    intro: "明星保濕面膜 10 片裝，適合日常補水、熬夜後急救與集中保養。",
    features: [
      "長效爆水續航力，適合日常基礎保養或急救補水。",
      "高持水面膜剪裁，快速補足肌膚日常保濕需求。",
      "敷臉後搭配乳液或乳霜，封存透亮水光感。"
    ],
    suitableFor: [
      "乾燥缺水",
      "外油內乾",
      "面膜保養",
      "龍血系列"
    ],
    usage: "臉部清潔後取出面膜並撕下外層襯膜，均勻敷於臉部約 10–15 分鐘或依標示時間，取下後輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  58: {
    cardName: "水搖滾保濕面膜 (35片桶裝)",
    cardSubtitle: "22mL x 35pcs・保濕面膜",
    spec: "22mL x 35pcs / 桶",
    intro: "明星保濕面膜大容量桶裝，適合長期日常補水、乾燥缺水與面膜集中保養。",
    features: [
      "長效爆水續航力，適合日常基礎保養或急救補水。",
      "35 片大容量，適合固定敷臉與家庭回購。",
      "敷臉後搭配乳液或乳霜，封存透亮水光感。"
    ],
    suitableFor: [
      "乾燥缺水",
      "外油內乾",
      "面膜保養",
      "大容量桶裝"
    ],
    usage: "臉部清潔後取出面膜，均勻敷於臉部約 10–15 分鐘或依標示時間，取下後輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  59: {
    cardName: "極光白美白面膜 (5片裝)",
    cardSubtitle: "5pcs・亮白面膜",
    spec: "5pcs / 盒",
    intro: "集中亮白面膜，適合膚色不均、熬夜暗沉與蠟黃肌膚加強保養，敷後維持透亮水嫩光澤。",
    features: [
      "密集勻亮去暗沉，適合日常亮白特別調理。",
      "集中注入亮白保養精華，改善疲憊膚色。",
      "敷後搭配日常保養，維持柔嫩、透亮與妝前服貼感。"
    ],
    suitableFor: [
      "美白淡斑",
      "膚色不均",
      "熬夜暗沉",
      "面膜保養"
    ],
    usage: "臉部清潔後取出面膜，均勻平整敷於全臉；依標示時間取下後，輕拍幫助吸收，再進行鎖水保養。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  60: {
    cardName: "極光白美白面膜 (35片桶裝)",
    cardSubtitle: "35pcs・亮白面膜",
    spec: "35pcs / 桶",
    intro: "集中亮白面膜大容量桶裝，適合膚色不均、熬夜暗沉與日常亮白集中保養。",
    features: [
      "密集勻亮去暗沉，適合日常亮白特別調理。",
      "35 片大容量，適合長期固定亮白保養。",
      "敷後搭配日常保養，維持柔嫩、透亮與妝前服貼感。"
    ],
    suitableFor: [
      "美白淡斑",
      "膚色不均",
      "熬夜暗沉",
      "大容量桶裝"
    ],
    usage: "臉部清潔後取出面膜，均勻平整敷於全臉；依標示時間取下後，輕拍幫助吸收，再進行鎖水保養。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  61: {
    cardName: "水光肌能化妝水",
    cardSubtitle: "130mL・水光肌能系列",
    spec: "130mL / 瓶",
    intro: "水光肌能化妝水是洗臉後的補水前導第一步，幫助溫和浸潤角質層，為後續精華與乳液打開水合通道。",
    features: [
      "復活草保濕複方，幫助肌膚維持長時間水潤。",
      "洗臉後作為第一道前導補水，提升後續保養延展與吸收感。",
      "適合換季乾燥、粗糙暗沉或環境壓力造成的不穩膚況。"
    ],
    suitableFor: [
      "乾燥缺水",
      "換季乾燥",
      "粗糙暗沉",
      "水光肌能系列"
    ],
    usage: "早晚清潔後，取適量於掌心或化妝棉，輕拍或擦拭於臉部與頸部至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  62: {
    cardName: "水光肌能乳液",
    cardSubtitle: "130mL・水光肌能系列",
    spec: "130mL / 瓶",
    intro: "水光肌能乳液主打清爽鎖水與水屏障保養，補充水分同時封存潤澤，讓肌膚維持柔嫩彈潤。",
    features: [
      "Double 保濕水屏障，補水並減少乾燥流失。",
      "質地清爽好推，適合日常油水平衡與保濕修護。",
      "可搭配同系列化妝水與晚霜，完成水光保養流程。"
    ],
    suitableFor: [
      "乾燥缺水",
      "外油內乾",
      "換季修護",
      "水光肌能系列"
    ],
    usage: "化妝水或精華後，取適量均勻塗抹於臉部與頸部，按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  63: {
    cardName: "水光肌能晚霜",
    cardSubtitle: "50mL・水光肌能系列",
    spec: "50mL / 瓶",
    intro: "水光肌能晚霜是夜間深度潤澤奇肌霜，適合乾燥、疲憊與粗糙肌在睡前加強鎖水修護。",
    features: [
      "夜間鎖水保養，幫助肌膚醒來維持柔嫩光澤。",
      "復活草保濕概念，支援乾燥細紋與疲憊膚況保養。",
      "滋潤但不厚重，適合作為晚間保養最後一步。"
    ],
    suitableFor: [
      "乾燥缺水",
      "夜間鎖水",
      "乾燥細紋",
      "水光肌能系列"
    ],
    usage: "夜間於化妝水、精華或乳液後，取適量塗抹全臉與頸部並按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  64: {
    cardName: "苦杏仁酸溫和煥顏露",
    cardSubtitle: "30mL・杏仁酸系列",
    spec: "30mL",
    intro: "苦杏仁酸溫和煥顏露為杏仁酸系列保養品項，可依日常膚況與保養需求搭配使用。",
    features: [
      "適合依膚況與日常保養需求搭配使用。",
      "可加入清單後由 LINE 小幫手協助確認適合搭配。",
      "商品優惠與庫存依客服確認為準。",
    ],
    suitableFor: [
      "油性毛孔",
    ],
    usage: "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  65: {
    cardName: "冰河淨化潔顏慕絲",
    cardSubtitle: "150mL・冰河淨化系列",
    spec: "150mL / 瓶",
    intro: "冰河淨化系列清潔第一步，豐盈細緻慕絲溫和洗去多餘皮脂與環境髒污，洗後清爽柔嫩。",
    features: [
      "適合日常清潔、卸妝後或保養前潔膚步驟。",
      "溫和慕絲質地，深層潔淨毛孔同時不傷肌膚屏障。",
      "洗卸清潔後再保養，讓肌膚回到清爽潔淨狀態。"
    ],
    suitableFor: [
      "清潔卸妝",
      "油性毛孔",
      "毛孔清潔",
      "冰河淨化系列"
    ],
    usage: "取適量慕絲於掌心，在濕潤臉部輕柔按摩，再以清水徹底洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  66: {
    cardName: "冰河淨化淨膚露",
    cardSubtitle: "120mL・冰河淨化系列",
    spec: "120mL / 瓶",
    intro: "清透高滲透質地，洗臉後迅速浸潤角質，調理老廢皮脂、平衡出油並收斂毛孔。",
    features: [
      "清潔後作為保養前導，溫和淨化多餘角質。",
      "可搭配同系列精華、乳液或霜，建立完整淨化保養。",
      "維持臉部澄淨不泛油光。"
    ],
    suitableFor: [
      "油性毛孔",
      "油水平衡",
      "粗糙肌",
      "冰河淨化系列"
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或均勻擦拭於臉部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  67: {
    cardName: "冰河淨化柔膚面膜",
    cardSubtitle: "100mL・水洗泥膜",
    spec: "100mL / 瓶",
    intro: "水洗式冰河淨化泥膜，富含高礦物質淨化因子，幫助吸附毛孔髒污與多餘油脂，重塑平滑透亮膚質。",
    features: [
      "適合特別保養或深層淨化髒污時使用。",
      "泥膜調理可溫和舒緩，同步補足保濕修護需求。",
      "水洗後搭配日常保養，維持細緻潤澤感。"
    ],
    suitableFor: [
      "油性毛孔",
      "毛孔粗大",
      "面膜保養",
      "深層淨化"
    ],
    usage: "臉部清潔後，避開眼唇均勻塗抹全臉，依標示時間靜置後以清水溫和洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  68: {
    cardName: "晶淬雪潤白乳",
    cardSubtitle: "100mL・晶淬雪系列",
    spec: "100mL / 瓶",
    intro: "主打亮白與高保濕的晶淬雪潤白乳，質地絲滑清爽，幫助改善暗沉、膚色不均與乾燥粗糙。",
    features: [
      "添加傳明酸與多重亮白複方，支援膚色均勻保養。",
      "拉絲精華質地清爽好吸收，為乾燥肌建立持水保護膜。",
      "亮白同時兼顧高保濕，適合日常早晚使用。"
    ],
    suitableFor: [
      "美白淡斑",
      "膚色不均",
      "暗沉蠟黃",
      "乾燥缺水"
    ],
    usage: "每日早晚於化妝水與精華後，取適量塗抹於全臉及頸部，輕拍至吸收。",
    notice: "含天然植物萃取與精油成分，色澤或氣味隨時間變化屬正常現象。若使用後不適請暫停使用，並置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  69: {
    cardName: "鳳梨酵素代謝角質凝露",
    cardSubtitle: "120g・鳳梨酵素系列",
    spec: "120g / 瓶",
    intro: "溫和代謝老廢角質的鳳梨酵素凝露，改善角質堆積造成的粗糙、暗沉與吸收感不佳。",
    features: [
      "運用鳳梨酵素溫和分解肌膚表層髒污與粗糙角質。",
      "定期調理角質，平滑肌膚紋理並提升透亮感。",
      "清爽凝露質地好推勻，幫助後續精華與面膜更好吸收。"
    ],
    suitableFor: [
      "清潔卸妝",
      "暗沉粗糙",
      "保養吸收不佳",
      "鳳梨酵素系列"
    ],
    usage: "卸妝清潔後擦乾臉部，避開眼唇塗抹並輕柔畫圈按摩至出屑，再以清水洗淨；建議每週 1–2 次。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  70: {
    cardName: "鳳梨酵素活膚面膜",
    cardSubtitle: "22mL x 5pcs・鳳梨酵素系列",
    spec: "22mL x 5pcs / 盒",
    intro: "集中型鳳梨酵素活膚面膜，適合暗沉、疲憊與粗糙肌膚加強保養，快速補水並提升透亮細緻感。",
    features: [
      "酵素活膚密集調理，適合亮白、嫩膚與平滑膚觸需求。",
      "集中注入水嫩精華，補足保濕與修護需求。",
      "敷臉後搭配乳液或乳霜，延續光滑澎潤感。"
    ],
    suitableFor: [
      "面膜保養",
      "暗沉粗糙",
      "透亮保養",
      "鳳梨酵素系列"
    ],
    usage: "清潔後取出面膜敷於臉部約 10–15 分鐘或依標示時間，取下後輕拍吸收，再進行鎖水保養。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  71: {
    cardName: "櫻の雪淨白潔顏慕絲",
    cardSubtitle: "150mL・準備上架",
    spec: "150mL / 瓶",
    intro: "櫻の雪淨白潔顏慕絲目前準備上架中，正式開放後可加入清單確認庫存與優惠。",
    features: [
      "準備上架品項，先保留商品資訊與圖片。",
      "正式開放後可加入清單確認庫存與優惠。",
      "適合放在櫻の雪亮白保養系列中作為清潔第一步。",
    ],
    suitableFor: ["準備上架", "清潔卸妝", "櫻の雪系列"],
    usage: "正式上架後請依商品標示方式使用。",
    notice: "準備上架中，暫不開放加入清單。",
    expiryNote: "上架後依商品標示或 LINE 小幫手確認為準。",
    priceNote: "準備上架中，暫不開放加入清單。",
  },
  72: {
    cardName: "櫻の雪傳明酸美白化妝水",
    cardSubtitle: "150mL・櫻の雪系列",
    spec: "150mL / 瓶",
    intro: "洗臉後的亮白前導化妝水，水感輕盈好吸收，補充亮白水分並打開後續美白吸收通道。",
    features: [
      "清潔後前導使用，迅速浸潤角質層。",
      "傳明酸亮白保養概念，調理蠟黃與暗沉。",
      "可搭配同系列精華與乳液，讓亮白流程更完整。"
    ],
    suitableFor: [
      "美白淡斑",
      "膚色不均",
      "暗沉蠟黃",
      "櫻の雪系列"
    ],
    usage: "清潔後取適量於掌心或化妝棉，輕拍或擦拭於臉部與頸部至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  142: {
    cardName: "櫻の雪傳明酸美白乳液",
    cardSubtitle: "100mL・櫻の雪系列",
    spec: "100mL / 瓶",
    intro: "櫻の雪美白乳液負責鎖住亮白保養，質地輕盈好推勻，兼顧保濕與亮白，維持水嫩透亮不黏膩。",
    features: [
      "保養程序後段使用，幫助鎖水補水。",
      "傳明酸與滋潤因子雙效加成，亮白同時滋潤。",
      "維持油水平衡，打造清爽亮白防護網。"
    ],
    suitableFor: [
      "美白淡斑",
      "乾燥缺水",
      "膚色不均",
      "櫻の雪系列"
    ],
    usage: "化妝水與精華液後，取適量均勻塗抹於臉部與頸部肌膚。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  75: {
    cardName: "櫻の雪亮澤護手霜",
    cardSubtitle: "50mL・護手霜",
    spec: "50mL / 支",
    intro: "亮澤護手霜，幫助手背暗沉、關節蠟黃與乾燥粗糙問題，質地快速吸收、不黏膩。",
    features: [
      "亮澤精華注入，支援手部暗沉與斑點感保養。",
      "密集修護頻繁洗手或做家事造成的乾荒。",
      "絲滑不黏膩，抹後用手機或電腦也不厚重。"
    ],
    suitableFor: [
      "手部暗沉",
      "乾燥粗糙",
      "護手霜",
      "亮澤保養"
    ],
    usage: "洗手後或覺得雙手乾燥時，取適量塗抹雙手，按摩手背、手指與指緣至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  76: {
    cardName: "茶樹防禦護手霜",
    cardSubtitle: "50mL・護手霜",
    spec: "50mL / 支",
    intro: "茶樹精油系輕質護手霜，清爽不厚重，適合夏天、易流手汗或害怕護手霜黏膩感的人。",
    features: [
      "茶樹精油清爽防護，為雙手建立清透保養感。",
      "保濕補水同時拒絕油光，減少悶厚感。",
      "適合夏天或容易流手汗者，無負擔持潤。"
    ],
    suitableFor: [
      "護手霜",
      "茶樹香氣",
      "易流手汗",
      "清爽不黏"
    ],
    usage: "取適量塗抹於清潔後雙手，順著肌理推開，並針對指緣粗糙處加強按摩。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  77: {
    cardName: "薰衣草舒緩護手霜",
    cardSubtitle: "50mL・護手霜",
    spec: "50mL / 支",
    intro: "薰衣草香氛護手霜，適合日間疲憊或睡前滋養，幫助粗糙乾燥雙手維持柔嫩、潤澤與放鬆感。",
    features: [
      "薰衣草精華舒緩，安撫頻繁洗手造成的乾燥不適。",
      "深度鎖水滋養，改善乾燥引起的乾紋感。",
      "療癒薰衣草香氣，擦拭時同步放鬆思緒。"
    ],
    suitableFor: [
      "護手霜",
      "乾燥缺水",
      "夜間舒緩",
      "薰衣草香氣"
    ],
    usage: "取適量護手霜於雙手，雙掌搓揉溫熱後按摩手背與指緣至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  78: {
    cardName: "麝香棉花香氛護手霜",
    cardSubtitle: "50mL・護手霜",
    spec: "50mL / 支",
    intro: "白麝香與棉花香調的香氛護手霜，質地絲滑潤澤，幫助乾燥粗糙雙手維持柔嫩水潤。",
    features: [
      "奢華絲滑觸感，滋潤但不膩。",
      "建立日常水屏障，抵禦環境乾燥。",
      "經典白麝香與棉花香，乾淨溫暖又療癒。"
    ],
    suitableFor: [
      "護手霜",
      "白麝香",
      "乾燥粗糙",
      "香氛保養"
    ],
    usage: "每日日常或雙手乾燥時，取適量均勻塗抹全手，並以指腹按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  82: {
    cardName: "龍血薰衣草舒緩皂",
    cardSubtitle: "單入 $290｜4入 $799",
    spec: "200g±10g / 塊",
    intro: "目前上架薰衣草款，單入 $290，購買 4 塊同款享 $799 優惠。",
    features: [
      "目前肥皂區先上架薰衣草款。",
      "單入 $290，4入優惠 $799。",
      "其他香型陸續整理中，前台暫不顯示任選4款。",
    ],
    suitableFor: ["肥皂", "薰衣草舒緩", "日常清潔", "4入優惠"],
    usage: "將手工皂沾水起泡後清潔肌膚，再以清水沖淨。",
    notice: "目前僅薰衣草款上架，其餘香型陸續整理中。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前上架薰衣草款；單入 $290，4入優惠 $799。",
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
    usage: "每日 1–3 包，餐前餐後均可食用；可直接食用或加入溫涼飲品中。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
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
    usage: "依高鈣益生菌與蔓越莓益生菌各自商品標示食用；可依日常需求分時補充。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
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
    usage: "蔓越莓益生菌請依商品標示固定補充；高鈣益生菌可於餐後搭配食用。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
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
    usage: "清潔並擦乾欲貼敷部位，撕下背膠後平整貼上；建議每片貼敷時間不超過 4–6 小時。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
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
    usage: "依照組合內各品項使用方式使用；保健食品依商品標示食用，保養與生活用品依品項標示操作。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
  },
  88: {
    cardName: "牛樟芝潔口液3罐組",
    cardSubtitle: "贈薰衣草牙膏1條・$1,500",
    spec: "能量牛樟芝保健潔口液 3罐 + 齒齦保健薰衣草舒緩牙膏120g 1條",
    intro: "能量牛樟芝保健潔口液 3罐組為回購組合優惠，贈齒齦保健薰衣草舒緩牙膏120g 1條。",
    features: [
      "能量牛樟芝保健潔口液 3罐，搭配薰衣草舒緩牙膏1條。",
      "組合價 $1,500，適合日常口腔清潔用品補貨。",
      "組合內容、效期與庫存依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "口腔清潔",
    ],
    usage: "刷牙後取適量潔口液漱口約 30 秒至 1 分鐘後吐出；牙膏依日常刷牙方式使用並徹底漱口。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "3罐潔口液贈薰衣草牙膏1條，組合價 $1,500；庫存與效期依 LINE 小幫手確認為準。",
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
    usage: "每天至少刷牙兩次，每次 2–3 分鐘；取適量牙膏刷洗牙齒各面後徹底漱口吐出。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
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
    usage: "清潔後取出面膜平整敷於臉部，依標示時間使用後取下，輕拍殘留精華至吸收。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
  },

  93: {
    cardName: "阿甘甦醒髮根養護液",
    cardSubtitle: "80mL・洗沐系列",
    spec: "80mL",
    intro: "阿甘甦醒髮根養護液為洗沐系列日常用品，適合搭配日常清潔、保養或香氛使用。",
    features: [
      "適合日常清潔、保養或香氛搭配使用。",
      "可依個人使用習慣加入回購清單。",
      "商品優惠與庫存依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "洗沐",
      "洗沐系列",
    ],
    usage: "取適量於濕髮或身體肌膚，搓揉清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    usage: "每日 1–2 包，早晚或餐後依商品標示食用；持續補充作為日常營養保健。",
    notice: "商品規格、使用方式與注意事項請依商品標示或客服說明為準。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "組合優惠、庫存與最終金額依 LINE 小幫手確認為準。",
  },
  101: {
    cardName: "龍血洗卸1+1組",
    cardSubtitle: "潔顏慕絲 + 卸妝油・$1,080",
    spec: "龍血求麗潔顏慕絲150mL + 龍血求麗卸妝油150mL，各1瓶，共2瓶",
    intro: "龍血洗卸1+1組固定搭配龍血求麗潔顏慕絲與龍血求麗卸妝油，各1瓶，共2瓶。",
    features: [
      "固定搭配潔顏慕絲 1 瓶與卸妝油 1 瓶，不是任選。",
      "洗卸清潔一次補齊，適合日常卸妝與潔顏流程。",
      "組合價 $1,080，庫存與效期依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "龍血系列",
      "清潔卸妝",
    ],
    usage: "手臉乾燥時先以卸妝油按摩全臉並加水乳化沖淨，再使用潔顏慕絲清潔後以清水洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，若不慎入眼請以清水沖洗。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "潔顏慕絲 1 瓶 + 卸妝油 1 瓶，1+1 兩瓶 $1,080；庫存與效期依 LINE 小幫手確認為準。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  106: {
    cardName: "白金密集煥白淡斑筆",
    cardSubtitle: "單支・白金密集煥白系列",
    spec: "單支 / 盒裝",
    intro: "針對局部斑點、曬斑與痘疤暗沉設計的精準淡斑筆，筆型設計方便局部加強，幫助暗沉部位集中亮白保養。",
    features: [
      "局部精準亮白，針對色素沉澱、雀斑或痘疤暗沉加強保養。",
      "白金級煥白複方，支援局部瑕疵調理。",
      "攜帶方便好導入，可作為保養程序中的特殊局部加強品項。"
    ],
    suitableFor: [
      "美白淡斑",
      "局部斑點",
      "痘疤暗沉",
      "精準保養"
    ],
    usage: "化妝水與精華液後，取適量精準塗抹於斑點或暗沉部位，再進行後續乳液鎖水。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  107: {
    cardName: "賽洛美潤膚美體油(C+E)",
    cardSubtitle: "單瓶・頂級養護",
    spec: "單瓶 / 盒裝",
    intro: "頂級身體養護美體油，結合賽洛美與維他命 C、E 滋養因子，沐浴後使用能幫助乾燥粗糙肌膚維持柔嫩光澤。",
    features: [
      "賽洛美修護概念，滋養並強化身體肌膚水脂屏障。",
      "C+E 養膚因子，保濕同時兼顧亮澤與彈嫩感。",
      "輕盈植物油質地快速吸收，潤而不膩。"
    ],
    suitableFor: [
      "乾燥粗糙",
      "身體保養",
      "美白淡斑",
      "頂級養護"
    ],
    usage: "沐浴後擦乾身體，取適量美體油均勻塗抹並按摩於全身；手肘、膝蓋等乾燥處可加強。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  108: {
    cardName: "24小時賦活液",
    cardSubtitle: "單瓶・頂級養護",
    spec: "單瓶 / 盒裝",
    intro: "頂級養護前導賦活液，適合保養撞牆期與疲憊暗沉肌，水感質地快速吸收，幫助後續精華與乳霜延展吸收。",
    features: [
      "全天候持續滋養肌底，強化日常環境防禦感。",
      "迅速安撫環境壓力造成的疲憊暗沉。",
      "高效前導加乘，打通肌膚保養通道。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "初老肌",
      "熟齡肌",
      "保養撞牆期"
    ],
    usage: "每日早晚清潔後，取適量賦活液於掌心，均勻輕拍並按摩於臉部與頸部至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  109: {
    cardName: "鉑金無痕煥白雙導精華",
    cardSubtitle: "單瓶・頂級養護",
    spec: "單瓶 / 盒裝",
    intro: "雙管設計高階精華，結合緊緻抗老與煥白保養，適合想同時改善暗沉、細紋與鬆弛感的熟齡肌膚。",
    features: [
      "雙管雙導科技，新鮮封存亮白與抗老雙精華。",
      "鉑金級撫紋抗老概念，支援緊緻與細紋保養。",
      "密集勻亮去暗沉，改善蠟黃與斑點感。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "美白淡斑",
      "熟齡肌",
      "膚色不均"
    ],
    usage: "每日早晚於化妝水後，按壓適量雙導精華於掌心混合，塗抹全臉與頸部並往上按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  110: {
    cardName: "黑耀緊緻奢華眼霜",
    cardSubtitle: "單瓶・頂級養護",
    spec: "單瓶 / 盒裝",
    intro: "專為眼周設計的奢華緊緻眼霜，豐潤細緻質地幫助滋養眼周乾紋與細紋，適合高階眼部抗老保養。",
    features: [
      "黑耀緊緻能量概念，支援眼周屏障與彈力保養。",
      "淡化乾燥、熬夜或老化引起的細紋感。",
      "豐潤但好吸收，適合眼周日常滋養。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "眼周細紋",
      "乾燥乾紋",
      "熟齡肌"
    ],
    usage: "每日早晚於保養最後步驟，用無名指取適量眼霜，輕點眼周並由內向外溫和按壓至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免直接接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  111: {
    cardName: "24小時黃金璀璨賦活液",
    cardSubtitle: "單瓶・頂級養護",
    spec: "單瓶 / 盒裝",
    intro: "奢華金箔前導賦活液，結合 24K 金箔與高效保濕修護精華，幫助肌膚維持澎潤、透亮與細緻光澤。",
    features: [
      "24K 金箔導入奢華保養感。",
      "24 小時持潤，改善乾燥引起的暗沉與乾紋感。",
      "頂級抗老活化肌底概念，提升細緻度與彈力感。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "乾燥缺水",
      "透亮光澤",
      "頂級養護"
    ],
    usage: "每日早晚清潔後，取適量黃金賦活液塗抹於全臉與頸部，以手掌溫熱按壓幫助吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  120: {
    cardName: "Exo-雙粹秘泌凍晶組",
    cardSubtitle: "一組・頂級養護",
    spec: "一組 / 盒裝",
    intro: "頂級凍晶密集保養組，使用時混合激活，適合膚況不穩、暗沉粗糙與想做高階急救修護保養的人。",
    features: [
      "植物外泌體概念，搭配高效修護能量保養。",
      "凍晶真空新鮮封存，使用時才混合激活。",
      "密集改善鬆弛、細紋、粗糙、敏弱與暗沉感。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "敏感舒緩",
      "暗沉粗糙",
      "高階修護"
    ],
    usage: "依產品標示說明，將精華液與凍晶粉按比例混合，每天取適量塗抹於全臉與頸部；開封後請依標示時間使用完畢。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  121: {
    cardName: "奧勒岡小白花美體乳",
    cardSubtitle: "500mL・頂級養護",
    spec: "500mL / 瓶",
    intro: "500mL 大容量身體乳，結合奧勒岡草本與小白花保濕精華，質地水潤好推不黏膩，適合每日沐浴後全身保養。",
    features: [
      "小白花高持水柔膚，柔嫩身體粗糙角質。",
      "草本安撫與屏障修護，適合季節乾燥不適。",
      "大容量高 CP 值，適合每日全身大量保養。"
    ],
    suitableFor: [
      "乾燥粗糙",
      "身體保養",
      "香氛保養",
      "頂級養護"
    ],
    usage: "每日沐浴清潔後，取適量美體乳均勻塗抹全身，順著肌肉線條按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  122: {
    cardName: "肌光緊緻速妍面膜",
    cardSubtitle: "單片 / 盒裝・面膜專區",
    spec: "單片 / 盒裝",
    intro: "集中型緊緻修護面膜，適合約會前、熬夜後或需要快速加強保養時使用。",
    features: [
      "特殊場合與急救保養時的集中修護。",
      "敷後幫助肌膚維持水亮、潤澤與彈力感。",
      "可搭配同系列日常保養維持緊緻光澤。"
    ],
    suitableFor: [
      "抗皺緊緻",
      "面膜保養",
      "約會前",
      "熬夜後"
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  123: {
    cardName: "INSK乳酸平衡水嫩膜",
    cardSubtitle: "23mL x 6片 / 盒・面膜專區",
    spec: "23mL x 6片 / 盒",
    intro: "集中型乳酸平衡水嫩膜，適合乾燥缺水與膚況不穩時加強保養，快速補水並回復透亮。",
    features: [
      "日常保養或急救保養時搭配使用。",
      "幫助補充水分、舒緩與平衡不穩定膚況。",
      "敷臉後再搭配日常保養程序，維持潤澤感。"
    ],
    suitableFor: [
      "面膜保養",
      "乾燥缺水",
      "不穩定膚況",
      "INSK乳酸平衡系列"
    ],
    usage: "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  124: {
    cardName: "水搖滾保濕面膜 (5片裝)",
    cardSubtitle: "22mL x 5pcs / 盒・面膜專區",
    spec: "22mL x 5pcs / 盒",
    intro: "明星保濕面膜，滿載澎湃保濕精華，快速浸潤乾燥缺水肌，適合日常補水、熬夜後急救與集中保養。",
    features: [
      "長效爆水續航力，適合日常基礎保養或急救補水。",
      "高持水面膜剪裁，快速補足肌膚日常保濕需求。",
      "敷臉後搭配乳液或乳霜，封存透亮水光感。"
    ],
    suitableFor: [
      "乾燥缺水",
      "外油內乾",
      "面膜保養",
      "龍血系列"
    ],
    usage: "臉部清潔後取出面膜並撕下外層襯膜，均勻敷於臉部約 10–15 分鐘或依標示時間，取下後輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  125: {
    cardName: "水搖滾保濕面膜 (10片裝)",
    cardSubtitle: "22mL x 10pcs / 盒・面膜專區",
    spec: "22mL x 10pcs / 盒",
    intro: "明星保濕面膜 10 片裝，適合日常補水、熬夜後急救與集中保養。",
    features: [
      "長效爆水續航力，適合日常基礎保養或急救補水。",
      "高持水面膜剪裁，快速補足肌膚日常保濕需求。",
      "敷臉後搭配乳液或乳霜，封存透亮水光感。"
    ],
    suitableFor: [
      "乾燥缺水",
      "外油內乾",
      "面膜保養",
      "龍血系列"
    ],
    usage: "臉部清潔後取出面膜並撕下外層襯膜，均勻敷於臉部約 10–15 分鐘或依標示時間，取下後輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  126: {
    cardName: "水搖滾保濕面膜 (35片大容量桶裝)",
    cardSubtitle: "22mL x 35pcs / 桶・面膜專區",
    spec: "22mL x 35pcs / 桶",
    intro: "明星保濕面膜大容量桶裝，適合長期日常補水、乾燥缺水與面膜集中保養。",
    features: [
      "長效爆水續航力，適合日常基礎保養或急救補水。",
      "35 片大容量，適合固定敷臉與家庭回購。",
      "敷臉後搭配乳液或乳霜，封存透亮水光感。"
    ],
    suitableFor: [
      "乾燥缺水",
      "外油內乾",
      "面膜保養",
      "大容量桶裝"
    ],
    usage: "臉部清潔後取出面膜，均勻敷於臉部約 10–15 分鐘或依標示時間，取下後輕拍吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  127: {
    cardName: "極光白美白面膜 (5片裝)",
    cardSubtitle: "5pcs / 盒・面膜專區",
    spec: "5pcs / 盒",
    intro: "集中亮白面膜，適合膚色不均、熬夜暗沉與蠟黃肌膚加強保養，敷後維持透亮水嫩光澤。",
    features: [
      "密集勻亮去暗沉，適合日常亮白特別調理。",
      "集中注入亮白保養精華，改善疲憊膚色。",
      "敷後搭配日常保養，維持柔嫩、透亮與妝前服貼感。"
    ],
    suitableFor: [
      "美白淡斑",
      "膚色不均",
      "熬夜暗沉",
      "面膜保養"
    ],
    usage: "臉部清潔後取出面膜，均勻平整敷於全臉；依標示時間取下後，輕拍幫助吸收，再進行鎖水保養。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  128: {
    cardName: "極光白美白面膜 (35片大容量桶裝)",
    cardSubtitle: "35pcs / 桶・面膜專區",
    spec: "35pcs / 桶",
    intro: "集中亮白面膜大容量桶裝，適合膚色不均、熬夜暗沉與日常亮白集中保養。",
    features: [
      "密集勻亮去暗沉，適合日常亮白特別調理。",
      "35 片大容量，適合長期固定亮白保養。",
      "敷後搭配日常保養，維持柔嫩、透亮與妝前服貼感。"
    ],
    suitableFor: [
      "美白淡斑",
      "膚色不均",
      "熬夜暗沉",
      "大容量桶裝"
    ],
    usage: "臉部清潔後取出面膜，均勻平整敷於全臉；依標示時間取下後，輕拍幫助吸收，再進行鎖水保養。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  129: {
    cardName: "冰河淨化柔膚面膜",
    cardSubtitle: "100mL / 瓶・面膜專區",
    spec: "100mL / 瓶",
    intro: "水洗式冰河淨化泥膜，富含高礦物質淨化因子，幫助吸附毛孔髒污與多餘油脂，重塑平滑透亮膚質。",
    features: [
      "適合特別保養或深層淨化髒污時使用。",
      "泥膜調理可溫和舒緩，同步補足保濕修護需求。",
      "水洗後搭配日常保養，維持細緻潤澤感。"
    ],
    suitableFor: [
      "油性毛孔",
      "毛孔粗大",
      "面膜保養",
      "深層淨化"
    ],
    usage: "臉部清潔後，避開眼唇均勻塗抹全臉，依標示時間靜置後以清水溫和洗淨。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  130: {
    cardName: "鳳梨酵素活膚面膜",
    cardSubtitle: "22mL x 5pcs / 盒・面膜專區",
    spec: "22mL x 5pcs / 盒",
    intro: "集中型鳳梨酵素活膚面膜，適合暗沉、疲憊與粗糙肌膚加強保養，快速補水並提升透亮細緻感。",
    features: [
      "酵素活膚密集調理，適合亮白、嫩膚與平滑膚觸需求。",
      "集中注入水嫩精華，補足保濕與修護需求。",
      "敷臉後搭配乳液或乳霜，延續光滑澎潤感。"
    ],
    suitableFor: [
      "面膜保養",
      "暗沉粗糙",
      "透亮保養",
      "鳳梨酵素系列"
    ],
    usage: "清潔後取出面膜敷於臉部約 10–15 分鐘或依標示時間，取下後輕拍吸收，再進行鎖水保養。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
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
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  135: {
    cardName: "龍血薰衣草舒緩皂 4入優惠",
    cardSubtitle: "目前上架薰衣草款・4入優惠",
    spec: "龍血薰衣草舒緩皂 200g±10g / 塊，共4塊",
    intro: "目前肥皂區先上架薰衣草款，購買 4 塊同款享優惠價 $799。",
    features: [
      "目前上架薰衣草款。",
      "共4塊，適合自用囤貨或送禮。",
      "單顆 $290，4入優惠 $799。",
    ],
    suitableFor: ["組合優惠", "肥皂", "薰衣草舒緩", "日常清潔"],
    usage: "依一般手工皂使用方式，沾濕搓揉起泡後清潔肌膚，再以清水沖淨。",
    notice: "目前僅薰衣草款上架，其餘香型陸續整理中。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前薰衣草款 4入優惠 $799。",
  },
  136: {
    cardName: "櫻の雪美白精華乳液組",
    cardSubtitle: "買精華液+乳液・贈化妝水・$1,780",
    spec: "精華液30mL + 乳液100mL，贈化妝水150mL",
    intro: "櫻の雪傳明酸美白組合為亮白保養套組，購買精華液與乳液，贈送同系列化妝水。",
    features: [
      "購買櫻の雪傳明酸美白精華液30mL + 美白乳液100mL。",
      "贈送櫻の雪傳明酸美白化妝水150mL。",
      "組合價 $1,780，庫存與效期依 LINE 小幫手確認為準。",
    ],
    suitableFor: [
      "組合優惠",
      "美白淡斑",
      "櫻の雪系列",
    ],
    usage: "臉部清潔後依序使用化妝水、精華液與乳液，均勻塗抹並輕拍按摩至吸收。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "購買精華液30mL + 乳液100mL，贈化妝水150mL，組合價 $1,780；庫存與效期依 LINE 小幫手確認為準。",
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
        "護手霜",
    ],
    usage: "淡香水可噴灑於手腕、耳後或衣物適當位置；護手霜取適量塗抹於手部肌膚。",
    notice: "香水與護手霜請避免接觸眼睛與敏感部位，並放置於陰涼處保存。",
    expiryNote: "淡香水效期至 2027/03/05；護手霜效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "時光瑞亞淡香水30mL + 櫻の雪亮澤護手霜JDST 30g，組合價 $780；庫存與效期依 LINE 小幫手確認為準。",
  },


  141: {
    cardName: "櫻の雪傳明酸美白精華液",
    cardSubtitle: "30mL・櫻の雪系列",
    spec: "30mL / 瓶",
    intro: "櫻の雪系列密集亮白核心精華，針對斑點、曬後暗沉與蠟黃膚色加強調理，幫助肌膚找回透亮感。",
    features: [
      "日常保養中的加強型亮白精華。",
      "傳明酸核心精華，支援膚色均勻與暗沉保養。",
      "高滲透質地清爽不黏膩，適合局部亮白需求。"
    ],
    suitableFor: [
      "美白淡斑",
      "斑點暗沉",
      "痘疤暗沉",
      "櫻の雪系列"
    ],
    usage: "化妝水後取適量均勻塗抹於臉部與頸部，再搭配同系列美白乳液。",
    notice: "使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。",
  },
  145: {
    cardName: "龍血求麗甦醒精油滾珠",
    cardSubtitle: "9mL・精油滾珠",
    spec: "9mL / 支",
    intro: "龍血系列隨身精油滾珠，適合日常香氛、肩頸放鬆感與隨身舒緩保養。",
    features: [
      "滾珠設計方便隨身使用。",
      "龍血系列香氣，適合日常放鬆與香氛保養。",
      "小容量好攜帶，可放包包或辦公桌備用。",
    ],
    suitableFor: [
      "精油滾珠",
      "龍血系列",
      "隨身香氛",
      "生活選品",
    ],
    usage: "取適量滾珠輕抹於手腕、耳後、肩頸等部位，避開眼周與傷口。",
    notice: "僅供外用。使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "牌價 $390；庫存與效期依 LINE 小幫手確認為準。",
  },
  146: {
    cardName: "薰衣草萬用精油滾珠",
    cardSubtitle: "9mL・精油滾珠",
    spec: "9mL / 支",
    intro: "薰衣草香氛精油滾珠，適合睡前放鬆、隨身舒緩與日常香氣保養。",
    features: [
      "薰衣草香氣，適合夜間與日常放鬆使用。",
      "滾珠設計方便局部塗抹，不易沾手。",
      "小容量好攜帶，適合隨身香氛保養。",
    ],
    suitableFor: [
      "薰衣草精油",
      "隨身滾珠",
      "睡前放鬆",
      "生活選品",
    ],
    usage: "取適量滾珠輕抹於手腕、耳後、肩頸等部位，避開眼周與傷口。",
    notice: "僅供外用。使用後若有不適，請暫停使用。請避免接觸眼睛，並放置於陰涼處保存。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "牌價 $390；庫存與效期依 LINE 小幫手確認為準。",
  },
  148: {
    cardName: "絕美溫感變色護唇膏",
    cardSubtitle: "3.5g・護唇膏",
    spec: "3.5g / 支",
    intro: "溫感變色護唇膏，依唇溫呈現自然氣色，素顏也有柔嫩紅潤感。",
    features: [
      "依唇溫呈現自然顯色效果。",
      "兼具護唇滋潤與氣色修飾感。",
      "質地輕盈好塗抹，適合日常補擦。",
    ],
    suitableFor: [
      "護唇膏",
      "變色護唇",
      "保濕潤澤",
      "生活選品",
    ],
    usage: "日常感到雙唇乾燥或想提升氣色時，轉出適量護唇膏均勻塗抹於雙唇；可單獨使用或作為唇膏前打底。",
    notice: "請避免轉出過長以免折斷。使用後若有不適，請暫停使用。請放置於陰涼處，避免陽光直射與高溫。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單支 $290；護唇膏任選2條 $500。",
  },
  149: {
    cardName: "絕美保濕護唇膏",
    cardSubtitle: "3.5g・護唇膏",
    spec: "3.5g / 支",
    intro: "日常保濕護唇膏，滋潤乾燥雙唇，適合白天補擦或夜間厚敷保養。",
    features: [
      "滋潤乾燥、緊繃的雙唇。",
      "可日常補擦，也可睡前厚敷加強保養。",
      "溫和植萃保養感，維持柔嫩不緊繃。",
    ],
    suitableFor: [
      "護唇膏",
      "保濕護唇",
      "乾燥唇",
      "夜間厚敷",
    ],
    usage: "每日日常或感覺嘴唇乾燥時，適量塗抹於雙唇；夜間睡前可加量厚敷，作為夜間密集護唇保養。",
    notice: "請避免轉出過長以免折斷。使用後若有紅腫或不適，請暫停使用並視情況諮詢專業人員。",
    expiryNote: "效期依商品標示或 LINE 小幫手確認為準。",
    priceNote: "單支 $290；護唇膏任選2條 $500。",
  }

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
  99, 141, 142,
  29, 30,
  35, 36,
  47, 48,
  54, 55,
  56, 57, 58, 59, 60,
  71,
  79, 80, 81, 82, 93, 94, 147, 148, 149, 150,
]);

const expiringProductIds = new Set<number>([10, 11]);


const productImageFallbacks: Record<number, string[]> = {
  47: ["/products/patch 1.png", "/products/blue 100.jpg"],
  48: ["/products/patch 5.png", "/products/red 100.jpg"],
  35: [
    "/products/lav-washtoothpaste.jpg",
    "/products/toothpaste lav.png",
    "/products/toothpaste-lav.png",
    "/products/toothpaste_lav.png",
    "/products/tooth500.png",
  ],
  36: [
    "/products/bd-washtoothpaste.jpg",
    "/products/toothpaste bd.png",
    "/products/toothpaste-bd.png",
    "/products/toothpaste_bd.png",
    "/products/tooth500.png",
  ],
  79: ["/products/soap rose.png", "/products/bdsoap.png"],
  80: ["/products/soap Artemisia.png", "/products/bdsoap.png"],
  81: ["/products/soap lemo.png", "/products/bdsoap.png"],
  82: ["/products/soap lav.png", "/products/bdsoap.png"],
  94: ["/products/soap sandalwood.png", "/products/bdsoap.png"],
  145: ["/products/dragon roller.png", "/products/龍血求麗甦醒精油滾珠.jpg", "/products/龍血求麗甦醒精油滾珠.png"],
  146: ["/products/lavender roller.png", "/products/薰衣草萬用精油滾珠.jpg", "/products/薰衣草萬用精油滾珠.png"],
  147: ["/products/soap Hydrangea.png", "/products/soap hydrangea.png", "/products/bdsoap.png"],
  148: ["/products/lip tint.jpg", "/products/lip tint.png", "/products/lip combo.jpg"],
  149: ["/products/lip balm.jpg", "/products/lip balm.png", "/products/lip combo.jpg"],
  150: ["/products/lip combo.jpg", "/products/lip tint.jpg", "/products/lip balm.jpg"],
};


function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<MainCategory>("本月精選");
  const [selectedSeries, setSelectedSeries] = useState("全部");
  const [selectedSkinFilter, setSelectedSkinFilter] =
    useState<SkinFilter>("全部");
  const [commerceFilter, setCommerceFilter] = useState("");
  const [collectionViewLabel, setCollectionViewLabel] = useState("");
  const [expandedDrawerGroup, setExpandedDrawerGroup] = useState<string | null>("本月精選");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [detailHistoryActive, setDetailHistoryActive] = useState(false);
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
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
  const [lineBindingStatus, setLineBindingStatus] =
    useState<"idle" | "loading" | "ready" | "unavailable" | "error">("idle");
  const [lineBindingMessage, setLineBindingMessage] = useState("");
  const [hasRestoredSavedDraft, setHasRestoredSavedDraft] = useState(false);

  const mainCategories = ["本月精選", "保養美肌", "健康保健", "精油香氛", "即將上架"] as MainCategory[];
  const seriesList = categoryConfig[selectedCategory];

  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const featuredProductIdsV31 = new Set([53, 83, 100, 101, 91, 82, 90, 4, 5, 88, 92]);

  function isFeaturedProductV31(product: Product) {
    return featuredProductIdsV31.has(product.id) || product.series.includes("本月主打");
  }

  function matchesMainCategoryV31(product: Product) {
    const fullText = `${product.name} ${product.category} ${product.series} ${product.description} ${product.price}`;

    if (selectedCategory === "本月精選") return isFeaturedProductV31(product);
    if (selectedCategory === "保養美肌") {
      return (
        ["保養品", "面膜"].includes(product.category) ||
        product.series.includes("面膜") ||
        ["龍血", "薰衣草", "水光", "櫻", "玫瑰", "肌光", "冰河", "杏仁酸", "茶樹", "冷杉", "潔顏", "卸妝", "美體"].some((keyword) => fullText.includes(keyword))
      ) && !isComingSoon(product);
    }
    if (selectedCategory === "健康保健") {
      return (
        product.category === "保健食品" ||
        ["益生菌", "葉黃素", "晶眸", "膠原", "魚油", "牛樟芝", "營養"].some((keyword) => fullText.includes(keyword))
      ) && !isComingSoon(product);
    }
    if (selectedCategory === "精油香氛") {
      return (
        product.category === "精油" ||
        ["精油", "擴香", "水氧", "霧化", "香氛", "牙膏", "肥皂", "護唇", "薰衣草舒緩皂"].some((keyword) => fullText.includes(keyword))
      ) && !isComingSoon(product);
    }
    if (selectedCategory === "即將上架") return isComingSoon(product);

    return selectedCategory === "全部" || product.category === selectedCategory;
  }

  function matchesSeriesV31(product: Product) {
    if (selectedSeries === "全部") return true;

    const fullText = `${product.name} ${product.category} ${product.series} ${product.description} ${product.price}`;
    const tags = getProductTags(product);

    if (selectedSeries === "回購主打") return isFeaturedProductV31(product);
    if (selectedSeries === "組合優惠") return product.category === "組合價" || hasComboPrice(product) || tags.includes("組合優惠") || fullText.includes("組合");
    if (selectedSeries === "即期優惠") return isExpiringDeal(product) || fullText.includes("即期");
    if (selectedSeries === "準備上架") return isComingSoon(product);
    if (selectedSeries === "滾珠精油") return fullText.includes("滾珠");
    if (selectedSeries === "其他香型") return fullText.includes("其他香型") || fullText.includes("肥皂");

    return product.series === selectedSeries || tags.includes(selectedSeries) || fullText.includes(selectedSeries);
  }

  const filteredProducts = products
    .map((product, index) => ({
      product,
      index,
      searchScore: getProductSearchScore(product, normalizedSearchQuery),
    }))
    .filter(({ product, searchScore }) => {
      if (normalizedSearchQuery) return searchScore !== null;

      if (commerceFilter) {
        return productMatchesCommerceFilter(product, commerceFilter);
      }

      const matchCategory = matchesMainCategoryV31(product);
      const matchSeries = matchesSeriesV31(product);

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

  const featuredProductIds = [53, 83, 100, 101, 91, 82, 90, 4, 5, 88, 92];
  const featuredProducts = featuredProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean) as Product[];

  const homeComboProducts = getProductsByIds([53, 83, 100, 101, 91, 82, 90, 88, 92]);
  const homeClearanceProducts = getProductsByIds([10, 11]);
  const homeDragonBloodProducts = getProductsByIds([53, 101, 89, 135]);
  const homeWaterGlowProducts = getProductsByIds([61, 62, 63, 116]);
  const homeTeaControlProducts = getProductsByIds([49, 50, 51, 64, 69, 70]);
  const homeBrighteningProducts = getProductsByIds([136, 141, 142, 127, 128]);
  const homeFirmingProducts = getProductsByIds([21, 22, 23, 24, 108, 120]);
  const homeMaskProducts = getProductsByIds([91, 126, 128]);
  const homeHealthProducts = getProductsByIds([83, 100, 84, 85, 1, 2]);
  const homeDailyLifeProducts = getProductsByIds([82, 90, 145, 146, 12]);

  const campaignHeroProducts = getProductsByIds([53, 83, 100, 86]);
  const campaignSpotlightProducts = getProductsByIds([53, 83, 100, 101, 91, 82]);

  const heroTopProduct = products.find((product) => product.id === 53);
  const heroSecondaryProducts = getProductsByIds([83, 100, 82]);
  const heroComboProducts = getProductsByIds([53, 83, 100, 101, 91, 82]);
  const heroSeriesEntries: {
    title: string;
    text: string;
    category?: MainCategory;
    series?: string;
    filter?: string;
    label?: string;
    product?: Product;
  }[] = [
    {
      title: "龍血主打",
      text: "玻尿酸精華、洗卸保養熱賣",
      category: "保養美肌",
      series: "龍血系列",
      product: products.find((product) => product.id === 53),
    },
    {
      title: "益生菌熱賣",
      text: "高鈣、蔓越莓、BC-HA 組合",
      category: "健康保健",
      series: "益生菌系列",
      product: products.find((product) => product.id === 83),
    },
    {
      title: "精油香氛",
      text: "單方、複方與擴香設備",
      category: "精油香氛",
      series: "全部",
      product: products.find((product) => product.id === 190) ?? products.find((product) => product.id === 82),
    },
    {
      title: "薰衣草舒緩皂",
      text: "目前上架薰衣草款，單入與4入優惠",
      category: "精油香氛",
      series: "香氛皂",
      product: products.find((product) => product.id === 82),
    },
    {
      title: "即期良品",
      text: "短效期優惠，數量有限",
      filter: "clearance-all",
      label: "即期良品",
      product: products.find((product) => product.id === 10) ?? products.find((product) => product.id === 11),
    },
  ];

  const mallQuickEntries = [
    {
      title: "本月精選",
      text: "主打優惠・回購熱賣",
      badge: "PICK",
      onClick: () => jumpToCategory("本月精選", "全部"),
    },
    {
      title: "保養美肌",
      text: "龍血・水光・櫻の雪",
      badge: "SKIN",
      onClick: () => jumpToCategory("保養美肌", "全部"),
    },
    {
      title: "健康保健",
      text: "益生菌・葉黃素・膠原飲",
      badge: "HEALTH",
      onClick: () => jumpToCategory("健康保健", "全部"),
    },
    {
      title: "精油香氛",
      text: "精油・皂品・擴香設備",
      badge: "AROMA",
      onClick: () => jumpToCategory("精油香氛", "全部"),
    },
    {
      title: "即將上架",
      text: "滾珠・護手霜・待整理品項",
      badge: "SOON",
      onClick: () => jumpToCategory("即將上架", "全部"),
    },
  ];

  const mallDealProducts = getProductsByIds([53, 83, 100, 101, 91, 82]);
  const mallHotProducts = getProductsByIds([53, 83, 100, 101, 91, 82]);
  const mallSkincareShelfProducts = getProductsByIds([53, 101, 54, 55, 61, 62]);
  const mallHealthShelfProducts = getProductsByIds([83, 100, 84, 4, 5, 138, 88, 92]);
  const mallAromaShelfProducts = getProductsByIds([190, 179, 184, 187, 82, 90]);
  const mallComingSoonProducts = getProductsByIds([145, 146, 12, 59]);

  const mallBrandEntries = [
    {
      title: "組合優惠",
      badge: "DEAL",
      text: "買一送一、2盒組、4入優惠與回購組合。",
      onClick: () => openCommerceFilter("deals-combo", "組合優惠"),
    },
    {
      title: "即期優惠",
      badge: "LIMIT",
      text: "短效期或限量出清品項，以 LINE 確認庫存。",
      onClick: () => openCommerceFilter("clearance-all", "即期優惠"),
    },
    {
      title: "即將上架",
      badge: "SOON",
      text: "尚在整理中的品項集中展示，不誤導客人下單。",
      onClick: () => jumpToCategory("即將上架", "全部"),
    },
  ];

  const quickSearchTerms = [
    "本月精選",
    "買一送一",
    "BC-HA",
    "益生菌",
    "龍血",
    "薰衣草皂",
    "精油",
    "貼布",
    "準備上架",
  ];

  const collectionSeriesChips = seriesList.filter((series) => series !== "全部").slice(0, 14);

  const hotCollectionProductIds = [
    53, 83, 100, 101, 91, 82, 90, 4, 5, 88, 92,
    84, 85, 138, 1, 2,
    29, 30, 93,
    35, 36,
    126, 128, 124, 127,
    135, 79,
    54, 55, 17, 18, 19, 20, 136, 141, 142, 68, 71, 72, 61, 62, 63, 49, 50, 51,
    145, 146, 12, 179, 184, 190,
    47, 48, 134,
  ];

  const maxCollectionProducts = 8;
  const collectionProducts = normalizedSearchQuery
    ? filteredProducts
    : (() => {
        if (filteredProducts.length <= maxCollectionProducts) return filteredProducts;

        const selected = new Set<number>();
        const prioritized = hotCollectionProductIds
          .map((id) => filteredProducts.find((product) => product.id === id))
          .filter((product): product is Product => {
            if (!product || selected.has(product.id)) return false;
            selected.add(product.id);
            return true;
          });

        const fillers = filteredProducts.filter((product) => !selected.has(product.id));

        return [...prioritized, ...fillers].slice(0, maxCollectionProducts);
      })();

  const collectionFeaturedProducts = collectionProducts.slice(0, 3);
  const cartUpsellProducts = getCartUpsellProducts();

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
    { title: "頂級養護", text: "高階修護與精華保養" },
  ];

  const lifestyleBrandEntries: { title: string; text: string }[] = [];

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
    setCommerceFilter("");
    setCollectionViewLabel("");
    setSelectedCategory(category);
    setSelectedSeries("全部");
    setSelectedSkinFilter("全部");
    setSearchQuery("");
  }

  function jumpToCategory(category: MainCategory, series = "全部") {
    setCommerceFilter("");
    setCollectionViewLabel("");
    setSelectedCategory(category);
    setSelectedSeries(series);
    setSelectedSkinFilter("全部");
    setSearchQuery("");
  }

  function handleSkinFilterChange(filter: SkinFilter) {
    setCommerceFilter("");
    setCollectionViewLabel("");
    setSelectedSkinFilter(filter);
    setSearchQuery("");

    if (filter !== "全部" && selectedCategory !== "保養美肌" && selectedCategory !== "全部") {
      setSelectedCategory("保養美肌");
      setSelectedSeries("全部");
    }
  }

  function clearSearch() {
    setSearchQuery("");
  }

  function productMatchesCommerceFilter(product: Product, filter: string) {
    const fullText = `${product.name} ${product.series} ${product.description} ${product.price}`;
    const tags = getProductTags(product);
    const externalVendors: string[] = [];

    const isExternal =
      product.category === "外部廠商" ||
      (product.category === "組合價" &&
        externalVendors.some((vendor) => product.series.includes(vendor) || fullText.includes(vendor)));

    const isLife =
      ["牙膏", "肥皂", "護唇膏", "精油", "貼布"].includes(product.category) ||
      (product.category === "組合價" &&
        ["牙膏組合", "貼布組合", "肥皂組合", "香氛組合", "護唇膏組合"].some((series) => product.series.includes(series)));

    const isHealth =
      product.category === "保健食品" ||
      (product.category === "組合價" && product.series.includes("保健食品組合"));

    const isMask =
      product.series.includes("面膜") ||
      product.name.includes("面膜") ||
      product.description.includes("面膜");

    const isWashHair =
      product.category === "洗沐" ||
      (product.category === "組合價" && product.series.includes("洗沐組合"));

    switch (filter) {
      case "deals-all":
        return product.category === "組合價" || hasComboPrice(product);
      case "v3-featured":
        return [53, 83, 100, 101, 91, 82, 90, 4, 5, 88, 92].includes(product.id);
      case "deals-monthly":
        return product.category === "組合價" && product.series.includes("本月主打");
      case "deals-combo":
        return product.category === "組合價";
      case "deals-bogo":
        return fullText.includes("買一送一") || fullText.includes("買一送二") || fullText.includes("1+1");
      case "deals-pick":
        return fullText.includes("任選");


      case "need-hot":
        return [53, 83, 100, 101, 91, 82, 90, 4, 5, 88, 92].includes(product.id);
      case "need-dragon":
        return fullText.includes("龍血") || product.series.includes("龍血");
      case "need-cleansing":
        return fullText.includes("潔顏") || fullText.includes("卸妝") || fullText.includes("洗卸") || fullText.includes("去角質") || fullText.includes("角質凝露");
      case "need-health":
        return isHealth || ["益生菌", "葉黃素", "晶眸", "膠原", "魚油", "牛樟芝"].some((keyword) => fullText.includes(keyword));
      case "need-life":
        return isLife || ["牙膏", "肥皂", "護唇膏", "潔口液", "精油", "擴香", "香氛", "美體"].some((keyword) => fullText.includes(keyword));

      case "skincare-all":
        return product.category === "保養品";
      case "skincare-dragon":
        return product.category === "保養品" && product.series.includes("龍血");
      case "skincare-hydration":
        return product.category === "保養品" && (tags.includes("乾燥缺水") || product.series.includes("水光") || product.series.includes("玫瑰"));
      case "skincare-brightening":
        return product.category === "保養品" && tags.includes("美白淡斑");
      case "skincare-firming":
        return product.category === "保養品" && tags.includes("抗皺緊緻");
      case "skincare-oil":
        return product.category === "保養品" && tags.includes("油性毛孔");
      case "skincare-sensitive":
        return product.category === "保養品" && tags.includes("敏感舒緩");
      case "skincare-men":
        return product.category === "保養品" && tags.includes("男士保養");

      case "wash-all":
        return isWashHair;
      case "wash-shampoo":
        return isWashHair && product.name.includes("洗髮");
      case "wash-body":
        return isWashHair && product.name.includes("沐浴");
      case "wash-scalp":
        return isWashHair && (fullText.includes("頭皮") || fullText.includes("髮根") || fullText.includes("養護"));
      case "wash-combo":
        return product.category === "組合價" && product.series.includes("洗沐組合");

      case "health-all":
        return isHealth && !isExternal;
      case "health-probiotic":
        return product.category === "保健食品" && product.series.includes("益生菌");
      case "health-eye":
        return product.category === "保健食品" && (product.series.includes("晶眸") || fullText.includes("葉黃素"));
      case "health-collagen":
        return product.category === "保健食品" && (product.series.includes("美妍") || fullText.includes("膠原"));
      case "health-fish":
        return product.category === "保健食品" && (fullText.includes("魚油") || product.series.includes("魚油") || product.name.includes("魚油"));

      case "mask-all":
        return isMask;
      case "mask-hydration":
        return isMask && (fullText.includes("保濕") || fullText.includes("水") || tags.includes("乾燥缺水"));
      case "mask-brightening":
        return isMask && (fullText.includes("亮白") || fullText.includes("美白") || fullText.includes("極光") || tags.includes("美白淡斑"));
      case "mask-repair":
        return isMask && (fullText.includes("修護") || fullText.includes("龍血") || fullText.includes("舒緩"));
      case "mask-combo":
        return product.category === "組合價" && product.series.includes("面膜組合");

      case "life-all":
        return isLife;
      case "life-tooth":
        return product.category === "牙膏" || fullText.includes("牙膏") || fullText.includes("潔口");
      case "life-patch":
        return product.category === "貼布" || product.series.includes("貼布");
      case "life-soap":
        return product.category === "肥皂" || product.series.includes("肥皂");
      case "life-handcream":
        return fullText.includes("護手霜");
      case "life-lip":
        return product.category === "護唇膏" || fullText.includes("護唇") || product.series.includes("護唇膏");
      case "life-perfume":
        return product.category === "香水" || fullText.includes("香水");
      case "life-essential":
        return product.category === "精油" || fullText.includes("精油") || fullText.includes("擴香");

      case "coming-soon":
        return isComingSoon(product) || fullText.includes("準備上架");

      case "clearance-all":
        return isExpiringDeal(product) || fullText.includes("即期") || fullText.includes("效期至");
      case "clearance-fir":
        return product.series.includes("冷杉") && (isExpiringDeal(product) || fullText.includes("即期"));
      case "clearance-limited":
        return fullText.includes("即期") || fullText.includes("限量") || fullText.includes("效期至");

      default:
        return true;
    }
  }

  function getHomeSectionIdByCategory(category: MainCategory, series = "全部") {
    if (category === "本月精選" || category === "組合價") return "home-combo-products";
    if (category === "健康保健" || category === "保健食品") return "home-health-products";

    if (
      category === "洗沐" ||
      category === "精油" ||
      category === "牙膏" ||
      category === "肥皂" ||
      category === "護手霜" ||
      category === "護唇膏" ||
      category === "香水" ||
      category === "貼布" ||
      category === "外部廠商"
    ) {
      return "home-daily-life-products";
    }

    if (category === "保養美肌" || category === "保養品") {
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

  function openCommerceFilter(filter: string, label: string) {
    setIsMenuOpen(false);
    setCommerceFilter(filter);
    setCollectionViewLabel(label);
    setSearchQuery("");
    setSelectedCategory("全部");
    setSelectedSeries("全部");
    setSelectedSkinFilter("全部");
    openCollectionPage();
  }

  function toggleDrawerGroup(group: string) {
    setExpandedDrawerGroup((current) => (current === group ? null : group));
  }

  function goToComboSection() {
    jumpToCategory("本月精選", "全部");
    openCollectionPage();
  }

  function openRelatedDetail(product: Product) {
    openProductDetail(product);
  }

  function hasKnownOriginalPrice(product: Product) {
    if (!product.originalPrice) return false;
    return !(
      product.originalPrice.includes("待補") ||
      product.originalPrice.includes("???") ||
      /原價\s*\$?\s*0+\b/.test(product.originalPrice)
    );
  }

  function hasInquiryPrice(product: Product) {
    return product.price.includes("待補") || product.price.includes("???");
  }

  function displayPrice(product: Product) {
    if (hasInquiryPrice(product)) return "售價請洽小幫手";
    return product.price;
  }

  function isComingSoon(product: Product) {
    return product.price.includes("準備上架") || productContent(product).priceNote?.includes("準備上架") || false;
  }

  function isSoldOut(product: Product) {
    return product.price.includes("缺貨");
  }

  function isCartDisabled(product: Product) {
    return isSoldOut(product) || isComingSoon(product);
  }

  function getNameBasedImageCandidates(product: Product) {
    const content = productContent(product);
    const rawNames = [
      product.name,
      product.cardName ?? "",
      content.cardName ?? "",
      product.name.replace(/\s+/g, ""),
      product.name.replace(/[\/\|｜＋+()（）:：]/g, " ").replace(/\s+/g, " ").trim(),
      product.name.replace(/[\/\|｜＋+()（）:：\s]/g, ""),
    ];

    const baseNames = Array.from(new Set(rawNames.map((name) => name.trim()).filter(Boolean)));
    const extensions = ["jpg", "png", "jpeg", "webp"];
    const candidates: string[] = [];

    for (const baseName of baseNames) {
      for (const extension of extensions) {
        candidates.push(`/products/${baseName}.${extension}`);
      }
    }

    return candidates;
  }

  function getImageCandidates(product: Product) {
    const override = productContent(product);
    const candidates = [
      product.image,
      ...(productImageFallbacks[product.id] ?? []),
      ...(override.gallery ?? []),
      ...(product.gallery ?? []),
      ...getNameBasedImageCandidates(product),
    ].filter((image): image is string => Boolean(image && !image.includes("placeholder")));

    return Array.from(new Set(candidates));
  }

  function getPrimaryImage(product: Product) {
    return getImageCandidates(product)[0] ?? product.image;
  }

  function getDetailGalleryImages(product: Product) {
    const override = productContent(product);
    const candidates = [
      ...(override.gallery ?? []),
      ...(product.gallery ?? []),
      product.image,
      ...(productImageFallbacks[product.id] ?? []),
      ...getNameBasedImageCandidates(product),
    ].filter((image): image is string => Boolean(image && !image.includes("placeholder")));

    return Array.from(new Set(candidates)).slice(0, 8);
  }

  function hasRealImage(product: Product) {
    return getImageCandidates(product).length > 0;
  }

  function handleProductImageError(product: Product, event: SyntheticEvent<HTMLImageElement>) {
    const target = event.currentTarget;
    const candidates = getImageCandidates(product);
    const currentIndex = Number(target.dataset.fallbackIndex ?? "0");
    const nextIndex = currentIndex + 1;
    const nextImage = candidates[nextIndex];

    if (nextImage) {
      target.dataset.fallbackIndex = String(nextIndex);
      target.src = nextImage;
      return;
    }

    target.parentElement?.classList.add("image-load-failed");
    target.style.display = "none";
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
    const configuredTags = productContent(product).suitableFor ?? product.suitableFor ?? [];

    for (const item of configuredTags) {
      if (item.includes("缺水") || item.includes("保濕") || item.includes("乾燥")) tags.add("乾燥缺水");
      if (item.includes("油水") || item.includes("出油") || item.includes("控油") || item.includes("毛孔")) tags.add("油性毛孔");
      if (item.includes("敏弱") || item.includes("嬌弱") || item.includes("舒緩") || item.includes("不穩定") || item.includes("不乖")) tags.add("敏感舒緩");
      if (item.includes("亮白") || item.includes("美白") || item.includes("暗沉") || item.includes("淡斑")) tags.add("美白淡斑");
      if (item.includes("初老") || item.includes("細紋") || item.includes("抗老") || item.includes("緊緻")) tags.add("抗皺緊緻");
    }

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
    const promoText = `${product.price} ${product.originalPrice ?? ""} ${productContent(product).priceNote ?? ""}`;

    if (isComingSoon(product)) {
      tags.push("準備上架");
    }

    if (isExpiringDeal(product)) {
      tags.push("即期優惠");
    }

    if (promoText.includes("買一送一")) tags.push("買一送一");
    if (promoText.includes("買一送二")) tags.push("買一送二");
    if (promoText.includes("第二件五折")) tags.push("第二件五折");
    if (promoText.includes("任選3瓶") || promoText.includes("任選 3 瓶") || promoText.includes("3瓶1100") || promoText.includes("任選3條") || promoText.includes("任選4款") || promoText.includes("4入優惠")) tags.push("組合優惠");

    for (const tag of getProductTags(product)) {
      if (!tags.includes(tag)) tags.push(tag);
    }

    return tags.slice(0, 2);
  }


  function getCommerceBadgeLabel(product: Product) {
    const priceText = displayPrice(product);
    const fullText = `${product.name} ${product.description} ${priceText} ${product.series}`;

    if (isComingSoon(product)) return "準備上架";
    if (isSoldOut(product)) return "缺貨";
    if (isExpiringDeal(product)) return "即期出清";
    if (fullText.includes("買一送二")) return "買一送二";
    if (fullText.includes("買一送一")) return "買一送一";
    if (fullText.includes("贈")) return "贈品組";
    if (fullText.includes("任選")) return "任選優惠";
    if (product.category === "組合價") return "回購優惠";
    if (hasComboPrice(product)) return "有組合價";
    if (hasInquiryPrice(product)) return "LINE 詢價";

    return product.series;
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

  function openSearchTerm(term: string) {
    setCommerceFilter("");
    setCollectionViewLabel("");
    setSearchQuery(term);
    setIsCollectionOpen(false);
    setIsSearchOpen(true);
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  }

  function selectCollectionSeries(series: string) {
    setCommerceFilter("");
    setCollectionViewLabel("");
    setSelectedSeries(series);
    setSelectedSkinFilter("全部");
    setSearchQuery("");
  }

  function getCollectionSubtitle() {
    if (collectionViewLabel) {
      return "依照前台購物分類整理商品，讓客人可以用需求、優惠與品牌來源快速找到想看的品項。";
    }

    if (selectedCategory === "本月精選") {
      return "本月主打、組合優惠與熟客回購熱賣集中在這裡。";
    }

    if (selectedCategory === "保養美肌") {
      return "龍血、水光、玫瑰、櫻の雪與面膜等自家保養品項集中查看。";
    }

    if (selectedCategory === "健康保健") {
      return "益生菌、葉黃素、膠原飲與健康保健回購組合。";
    }

    if (selectedCategory === "精油香氛") {
      return "精油、香氛、皂品與口腔香氣相關品項集中查看。";
    }

    if (selectedCategory === "即將上架") {
      return "整理中品項先集中展示，不開放加入清單，避免誤下單。";
    }

    return "可加入清單或查看商品資訊，送出後由 LINE 小幫手確認庫存、效期與金額。";
  }

  function getCollectionHeroLabel() {
    if (collectionViewLabel) return collectionViewLabel;
    if (selectedSeries !== "全部") return selectedSeries;
    if (selectedSkinFilter !== "全部") return selectedSkinFilter;
    if (selectedCategory === "全部") return "全部商品";
    return selectedCategory;
  }

  function getCartUpsellProducts() {
    const currentIds = new Set(cartItems.map((item) => item.product.id));
    const recommendIds = [
      90, 89, 143, 92, 88, 100, 35, 36, 47, 48, 1, 2, 74, 99, 144, 133, 134,
    ];

    return getProductsByIds(recommendIds)
      .filter((product) => !currentIds.has(product.id) && !isCartDisabled(product))
      .slice(0, 4);
  }

  function openProductDetail(product: Product, pushHistory = true) {
    setSelectedDetailProduct(product);

    if (pushHistory && typeof window !== "undefined") {
      const currentHash = window.location.hash;
      const nextHash = `#product-${product.id}`;

      if (currentHash !== nextHash) {
        window.history.pushState(
          {
            jourdenessDetail: true,
            productId: product.id,
          },
          "",
          nextHash
        );
      }

      setDetailHistoryActive(true);
    }

    window.setTimeout(() => {
      const detailScroller = document.querySelector(".detail-backdrop") as HTMLElement | null;
      detailScroller?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 0);
  }

  function closeProductDetail(useBrowserBack = true) {
    if (useBrowserBack && detailHistoryActive && typeof window !== "undefined") {
      window.history.back();
      return;
    }

    setSelectedDetailProduct(null);
    setDetailHistoryActive(false);

    if (typeof window !== "undefined" && window.location.hash.startsWith("#product-")) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  function currentFilterText() {
    if (searchQuery.trim()) return `模糊搜尋：${searchQuery.trim()}`;
    if (collectionViewLabel) return collectionViewLabel;

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
    subtitle?: string;
    products: Product[];
    actionLabel?: string;
    onAction?: () => void;
  }) {
    return (
      <section className="home-product-section mall-shelf-section-v271" id={id}>
        <div className="section-heading compact">
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          {subtitle && <span>{subtitle}</span>}
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
          <img
            src={getPrimaryImage(product)}
            alt={product.name}
            data-fallback-index="0"
            onError={(event) => handleProductImageError(product, event)}
          />
        ) : (
          <div className="image-placeholder">
            <span>Jourdeness Castle</span>
            <strong>圖片更新中</strong>
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

  function compactCardText(text: string) {
    return text.replace(/\s+/g, " ").replace(/。$/, "").trim();
  }

  function shortCardText(text: string, maxLength = 18) {
    const cleaned = compactCardText(text);
    const firstSentence = cleaned.split(/[。！!；;]/)[0]?.trim() || cleaned;
    const source = firstSentence.length >= 10 ? firstSentence : cleaned;

    if (source.length <= maxLength) return source;
    return `${source.slice(0, maxLength)}…`;
  }

  function isSpecOnlySubtitle(text: string) {
    const cleaned = text.trim();
    return (
      cleaned.length <= 18 &&
      (/\d/.test(cleaned) || cleaned.includes("mL") || cleaned.includes("g") || cleaned.includes("片") || cleaned.includes("支")) &&
      (cleaned.includes("・") || cleaned.includes("/") || cleaned.includes("系列") || cleaned.includes("牙膏") || cleaned.includes("面膜"))
    );
  }

  function getCardSubtitle(product: Product) {
    const content = productContent(product);
    const customSubtitle = content.cardSubtitle ?? product.cardSubtitle;
    const intro = content.intro ?? product.intro;

    if (customSubtitle && !isSpecOnlySubtitle(customSubtitle)) {
      return shortCardText(customSubtitle);
    }

    if (intro) {
      return shortCardText(intro);
    }

    return shortCardText(customSubtitle ?? product.description);
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
      return "即期優惠品項，效期與庫存請以 LINE 小幫手確認為準。";
    }

    if (hasInquiryPrice(product)) {
      return "目前售價由 LINE 小幫手確認，送出清單後會協助回覆。";
    }

    if (hasComboPrice(product)) {
      return "若有組合價活動，客服會協助確認最適合的優惠方案。";
    }

    return "實際優惠與庫存依 LINE 小幫手確認為準。";
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
      return "此為即期優惠品項，實際效期請以 LINE 小幫手確認為準。";
    }

    return "效期依商品標示或 LINE 小幫手確認為準。";
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

    if (product.category === "精油") {
      if (product.series === "精油配件" || product.series === "擴香設備") {
        return "依商品標示搭配精油或擴香配件使用，實際操作請以產品說明為準。";
      }
      return "依商品標示搭配擴香設備或擴香配件使用，請避免直接接觸眼周與黏膜。";
    }

    if (product.category === "洗沐" || product.category === "牙膏" || product.category === "護唇膏") {
      return "依商品標示方式日常使用，使用後如有不適請暫停使用並洽詢客服。";
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
      bullets.push("加入清單後由 LINE 小幫手確認庫存、價格與適合搭配品項。");
    }

    return bullets.slice(0, 4);
  }

  function getShelfBrandLabel(product: Product) {
    if (product.category === "外部廠商") return product.series;
    if (product.category === "組合價") return "組合優惠";
    return "佐登妮絲";
  }

  function getPriceModeLabel(product: Product) {
    if (product.category === "外部廠商") return "售價";
    if (product.category === "組合價") return "活動價";
    if (hasInquiryPrice(product)) return "產地價洽詢";
    if (product.price.includes("售價") || product.price.trim().startsWith("$")) return "售價";
    return "產地價";
  }

  function getShelfTypeLabel(product: Product) {
    if (product.category === "外部廠商") return "外部品牌";
    if (product.category === "組合價") return "優惠組合";
    return product.series;
  }

  function getRelatedProducts(product: Product) {
    const manualRelatedIds: Record<number, number[]> = {
      99: [144, 92, 88, 74, 143],
      144: [99, 92, 88, 74, 143],
      29: [139, 30, 93, 89],
      30: [89, 29, 139, 93],
      54: [101, 55, 17, 19],
      55: [101, 54, 71, 137],
      71: [137, 136, 72, 141, 142],
      75: [140, 117, 76, 77],
      74: [92, 99, 144, 88],
      4: [138, 5, 74, 92],
      5: [138, 4, 1, 2],
    };

    const manual = getProductsByIds(manualRelatedIds[product.id] ?? []);

    const sameSeries = products.filter(
      (item) =>
        item.id !== product.id &&
        item.category === product.category &&
        item.series === product.series
    );

    const comboMatches = products.filter((item) => {
      if (item.id === product.id || item.category !== "組合價") return false;
      return item.name.includes(product.name.slice(0, 4)) || item.description.includes(product.name.slice(0, 4));
    });

    const sameCategory = products.filter(
      (item) =>
        item.id !== product.id &&
        item.category === product.category &&
        item.series !== product.series
    );

    const seen = new Set<number>();
    return [...manual, ...comboMatches, ...sameSeries, ...sameCategory]
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, 6);
  }

  function ProductCard({
    product,
    featured = false,
  }: {
    product: Product;
    featured?: boolean;
  }) {
    const soldOut = isSoldOut(product);
    const comingSoon = isComingSoon(product);
    const unavailable = isCartDisabled(product);
    const inquiry = hasInquiryPrice(product);
    const tags = displayTags(product);
    const badgeLabel = getCommerceBadgeLabel(product);

    return (
      <article
        className={`${featured ? "featured-card" : "product-card"} commerce-product-card clickable-product-card-v246 shelf-card-v271`}
        key={featured ? `featured-${product.id}` : product.id}
        role="button"
        tabIndex={0}
        onClick={() => openProductDetail(product)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProductDetail(product);
          }
        }}
      >
        <div className={`commerce-card-badge ${unavailable ? "soldout" : inquiry ? "inquiry" : ""}`}>
          {badgeLabel}
        </div>

        <ProductVisual product={product} variant={featured ? "featured" : "normal"} />

        <div className={featured ? "featured-info product-info" : "product-info"}>
          <div className="shelf-brand-line-v271">
            <span>{getShelfBrandLabel(product)}</span>
            <em>{getShelfTypeLabel(product)}</em>
          </div>

          <div className="product-meta-row">
            <p className="series-label">{product.series}</p>
            {inquiry && !unavailable && <span>可詢價</span>}
            {comingSoon && <span className="sold-out-badge">準備上架</span>}
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
                onClick={(event) => {
                  event.stopPropagation();
                  goToComboSection();
                }}
              >
                有組合價
              </button>
            )}
          </div>

          <div className="price-block commerce-price-block shelf-price-block-v271">
            <span className="price-mode-v271">{getPriceModeLabel(product)}</span>
            {hasKnownOriginalPrice(product) && (
              <p className="original-price">{product.originalPrice}</p>
            )}

            <p className={`price ${inquiry ? "inquiry" : ""}`}>
              {displayPrice(product)}
            </p>
          </div>

          <div className="commerce-card-actions">
            <button
              className="add-cart-button"
              onClick={(event) => {
                event.stopPropagation();
                addToCart(product);
              }}
              disabled={unavailable}
            >
              {comingSoon ? "準備上架" : soldOut ? "缺貨中" : "加入清單"}
            </button>

            <button
              type="button"
              className="detail-button"
              onClick={(event) => {
                event.stopPropagation();
                openProductDetail(product);
              }}
            >
              商品詳情
            </button>
          </div>
        </div>
      </article>
    );
  }

  function addToCart(product: Product) {
    if (isCartDisabled(product)) return;

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

  const saveLineProfile = useCallback((profile: LineProfile) => {
    setLineProfile(profile);
    setLineBindingStatus("ready");
    setLineBindingMessage("");

    try {
      window.localStorage.setItem(LINE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      // localStorage 失敗時不影響訂購流程。
    }
  }, []);

  const fetchAndSaveLineProfile = useCallback(async () => {
    if (!window.liff) return;

    const profile = await window.liff.getProfile();

    saveLineProfile({
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    });
  }, [saveLineProfile]);

  const loadLiffSdk = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.liff) {
        resolve();
        return;
      }

      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${LIFF_SDK_SRC}"]`
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("LIFF SDK 載入失敗")),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = LIFF_SDK_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("LIFF SDK 載入失敗"));
      document.body.appendChild(script);
    });
  }, []);

  const startLineBinding = useCallback(async () => {
    if (!LINE_LIFF_ID) {
      setLineBindingStatus("unavailable");
      setLineBindingMessage("LINE 綁定尚未啟用");
      return;
    }

    try {
      setLineBindingStatus("loading");
      setLineBindingMessage("");
      await loadLiffSdk();
      await window.liff?.init({ liffId: LINE_LIFF_ID });

      if (!window.liff?.isLoggedIn()) {
        window.liff?.login();
        return;
      }

      await fetchAndSaveLineProfile();
    } catch (error) {
      setLineBindingStatus("error");
      setLineBindingMessage("LINE 綁定暫時無法使用");
    }
  }, [fetchAndSaveLineProfile, loadLiffSdk]);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          const restoredCart = parsedCart
            .map((savedItem) => {
              const productId = Number(savedItem?.id);
              const quantity = Number(savedItem?.quantity);
              const product = products.find((item) => item.id === productId);

              if (!product || !Number.isFinite(quantity) || quantity <= 0) {
                return null;
              }

              return {
                product,
                quantity: Math.min(Math.max(Math.floor(quantity), 1), 99),
              };
            })
            .filter((item): item is CartItem => item !== null);

          if (restoredCart.length > 0) {
            setCartItems(restoredCart);
          }
        }
      }

      const savedCustomerDraft = window.localStorage.getItem(CUSTOMER_DRAFT_STORAGE_KEY);

      if (savedCustomerDraft) {
        const parsedCustomer = JSON.parse(savedCustomerDraft) as Partial<CustomerForm>;

        setCustomer((current) => ({
          ...current,
          customerName:
            typeof parsedCustomer.customerName === "string"
              ? parsedCustomer.customerName
              : current.customerName,
          lineId:
            typeof parsedCustomer.lineId === "string"
              ? parsedCustomer.lineId
              : current.lineId,
          phone:
            typeof parsedCustomer.phone === "string" ? parsedCustomer.phone : current.phone,
          deliveryMethod:
            typeof parsedCustomer.deliveryMethod === "string"
              ? parsedCustomer.deliveryMethod
              : current.deliveryMethod,
          address:
            typeof parsedCustomer.address === "string" ? parsedCustomer.address : current.address,
          note:
            typeof parsedCustomer.note === "string" ? parsedCustomer.note : current.note,
        }));
      }

      const savedLineProfile = window.localStorage.getItem(LINE_PROFILE_STORAGE_KEY);

      if (savedLineProfile) {
        const parsedLineProfile = JSON.parse(savedLineProfile) as Partial<LineProfile>;

        if (
          typeof parsedLineProfile.userId === "string" &&
          typeof parsedLineProfile.displayName === "string"
        ) {
          setLineProfile({
            userId: parsedLineProfile.userId,
            displayName: parsedLineProfile.displayName,
            pictureUrl:
              typeof parsedLineProfile.pictureUrl === "string"
                ? parsedLineProfile.pictureUrl
                : undefined,
            statusMessage:
              typeof parsedLineProfile.statusMessage === "string"
                ? parsedLineProfile.statusMessage
                : undefined,
          });
        }
      }
    } catch (error) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(CUSTOMER_DRAFT_STORAGE_KEY);
    } finally {
      setHasRestoredSavedDraft(true);
    }
  }, []);

  useEffect(() => {
    if (!LINE_LIFF_ID) {
      setLineBindingStatus("unavailable");
      return;
    }

    let cancelled = false;

    async function initLineBinding() {
      try {
        setLineBindingStatus("loading");
        await loadLiffSdk();
        await window.liff?.init({ liffId: LINE_LIFF_ID });

        if (cancelled) return;

        if (window.liff?.isLoggedIn()) {
          await fetchAndSaveLineProfile();
        } else {
          setLineBindingStatus("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setLineBindingStatus("error");
          setLineBindingMessage("LINE 綁定暫時無法使用");
        }
      }
    }

    initLineBinding();

    return () => {
      cancelled = true;
    };
  }, [fetchAndSaveLineProfile, loadLiffSdk]);

  useEffect(() => {
    if (!hasRestoredSavedDraft) return;

    if (cartItems.length === 0) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(
        cartItems.map((item) => ({
          id: item.product.id,
          quantity: item.quantity,
        }))
      )
    );
  }, [cartItems, hasRestoredSavedDraft]);

  useEffect(() => {
    if (!hasRestoredSavedDraft) return;

    const hasCustomerDraft =
      customer.customerName.trim() ||
      customer.lineId.trim() ||
      customer.phone.trim() ||
      customer.address.trim() ||
      customer.note.trim();

    if (!hasCustomerDraft) {
      window.localStorage.removeItem(CUSTOMER_DRAFT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(CUSTOMER_DRAFT_STORAGE_KEY, JSON.stringify(customer));
  }, [customer, hasRestoredSavedDraft]);

  useEffect(() => {
    function handlePopState() {
      setSelectedDetailProduct(null);
      setDetailHistoryActive(false);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function formatTaiwanOrderTime(date: Date) {
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  }

  function createOrderNumber(date: Date) {
    const taipeiParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .formatToParts(date)
      .reduce<Record<string, string>>((parts, part) => {
        if (part.type !== "literal") parts[part.type] = part.value;
        return parts;
      }, {});

    const randomCode = Math.floor(100 + Math.random() * 900);
    return `JD${taipeiParts.year}${taipeiParts.month}${taipeiParts.day}${taipeiParts.hour}${taipeiParts.minute}${taipeiParts.second}${randomCode}`;
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

    if (!lineProfile && !customer.lineId.trim() && !customer.phone.trim()) {
      setSubmitStatus("error");
      setSubmitMessage("請填寫 LINE ID 或電話，或先綁定 LINE 帳號。");
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

    const orderCreatedAt = new Date();
    const orderTime = formatTaiwanOrderTime(orderCreatedAt);
    const orderNumber = createOrderNumber(orderCreatedAt);
    const customerNote = customer.note.trim();
    const noteWithAddress = [
      `宅配地址：${customer.address.trim()}`,
      customerNote ? `備註：${customerNote}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const lineContactText = [
      lineProfile ? `${lineProfile.displayName}｜${lineProfile.userId}` : "",
      customer.lineId.trim() ? `手填：${customer.lineId.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const itemsText = cartItems
      .map((item) => `${item.product.name} × ${item.quantity}｜${displayPrice(item.product)}`)
      .join("\n");

    const sheetHeaders = [
      "訂單時間",
      "訂單編號",
      "姓名",
      "LINE ID",
      "電話",
      "取貨方式",
      "商品內容",
      "備註",
      "狀態",
    ];

    const sheetRow = {
      訂單時間: orderTime,
      訂單編號: orderNumber,
      姓名: customer.customerName.trim(),
      "LINE ID": lineContactText,
      電話: customer.phone.trim(),
      取貨方式: "宅配",
      商品內容: itemsText,
      備註: noteWithAddress,
      狀態: "待確認",
    };

    const payload = {
      orderTime,
      orderNumber,
      status: "待確認",
      sheetHeaders,
      sheetRow,
      customerName: customer.customerName.trim(),
      lineId: customer.lineId.trim(),
      lineDisplayName: lineProfile?.displayName || "",
      lineUserId: lineProfile?.userId || "",
      linePictureUrl: lineProfile?.pictureUrl || "",
      lineContactText,
      phone: customer.phone.trim(),
      deliveryMethod: "宅配",
      address: customer.address.trim(),
      note: noteWithAddress,
      itemsText,
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

      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(CUSTOMER_DRAFT_STORAGE_KEY);
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
        滿 NT$3000 免運｜加入清單後由 LINE 小幫手確認
      </div>

      <header className="top-header">
        <button
          className="menu-button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="開啟選單"
        >
          ☰
        </button>

        <div className="brand-logo-wrap" aria-hidden="true">
          <img
            src="/products/logo.png"
            alt=""
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="brand-block">
          <p className="top-eyebrow">Jourdeness Castle</p>
          <h1>佐登妮絲城堡</h1>
          <p>回購選品館</p>
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

          <button className="header-cart-button header-cart-button-v273" onClick={() => setIsCartOpen(true)}>
            我的清單 <span>{cartTotalQuantity}</span>
          </button>
        </div>
      </header>

      <section className="market-route-strip-v272 v3-route-strip" aria-label="賣場快速導覽">
        <button type="button" onClick={() => openCommerceFilter("v3-featured", "本月精選")}>
          <span>PICK</span>
          <strong>本月精選</strong>
        </button>
        <button type="button" onClick={() => handleDrawerCategory("保養品", "全部")}>
          <span>SKIN</span>
          <strong>保養美肌</strong>
        </button>
        <button type="button" onClick={() => openCommerceFilter("need-health", "健康保健 / 全部選品")}>
          <span>HEALTH</span>
          <strong>健康保健</strong>
        </button>
        <button type="button" onClick={() => openCommerceFilter("life-essential", "精油香氛 / 全部選品")}>
          <span>AROMA</span>
          <strong>精油香氛</strong>
        </button>
        <button type="button" onClick={() => openCommerceFilter("need-life", "生活選品 / 全部選品")}>
          <span>LIFE</span>
          <strong>生活選品</strong>
        </button>
      </section>

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
            </div>
          </div>

          <div className="search-input-wrap">
            <span>🔍</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="模糊搜尋：龍血、益生菌、BC-HA、精油、薰衣草皂"
              autoFocus
            />
            {searchQuery.trim() && (
              <button type="button" onClick={clearSearch}>清除</button>
            )}
          </div>
          <div className="search-hot-panel-v22 search-hot-panel-v272">
            <div>
              <strong>熱門搜尋</strong>
              <span>也可以直接輸入品牌、系列或品項名稱。</span>
            </div>

            <div className="search-hot-chip-row-v22">
              {quickSearchTerms.map((term) => (
                <button type="button" key={`hot-${term}`} onClick={() => openSearchTerm(term)}>
                  {term}
                </button>
              ))}
            </div>
          </div>

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
                          <img src={getPrimaryImage(product)} alt={product.name} data-fallback-index="0" onError={(event) => handleProductImageError(product, event)} />
                        ) : (
                          <div className="search-result-placeholder">圖片更新中</div>
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
                          <button type="button" onClick={() => openProductDetail(product)}>
                            查看
                          </button>
                          <button
                            type="button"
                            className="primary"
                            onClick={() => addToCart(product)}
                            disabled={isCartDisabled(product)}
                          >
                            {isComingSoon(product) ? "準備上架" : isSoldOut(product) ? "缺貨" : hasInquiryPrice(product) ? "詢問" : "加入"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="search-result-empty">
                  找不到符合的商品，可以換短一點的關鍵字，例如「龍血」、「BC-HA」、「精油」、「薰衣草皂」。
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
        <section className="search-panel search-page-view collection-page-view collection-page-v22" aria-label="分類商品頁面">
          <div className="search-page-head collection-page-head collection-head-v22">
            <button
              type="button"
              className="search-back-button"
              onClick={closeCollectionPage}
            >
              ← 返回
            </button>

            <div>
              <p>Catalog</p>
              <h2>{getCollectionHeroLabel()}</h2>
              <span>精選 {collectionProducts.length} 項熱門商品｜可加入清單或查看商品資訊</span>
            </div>
          </div>

          <section className="collection-hero-v22">
            <div>
              <p>Collection</p>
              <h2>{getCollectionHeroLabel()}</h2>
              <span>{getCollectionSubtitle()}</span>
            </div>

            <div className="collection-stat-grid-v22">
              <div>
                <strong>{collectionProducts.length}</strong>
                <span>熱門精選</span>
              </div>
              <div>
                <strong>{selectedSeries === "全部" ? "全部" : selectedSeries}</strong>
                <span>目前系列</span>
              </div>
              <div>
                <strong>{cartTotalQuantity}</strong>
                <span>清單件數</span>
              </div>
            </div>
          </section>

          <section className="collection-guide-v272" aria-label="分類頁快速操作">
            <div>
              <strong>目前在：{getCollectionHeroLabel()}</strong>
              <span>可以繼續篩選系列，也可以切換館別或直接搜尋商品。</span>
            </div>
            <div>
              <button type="button" onClick={() => setIsMenuOpen(true)}>切換館別</button>
              <button
                type="button"
                onClick={() => {
                  setIsCollectionOpen(false);
                  setIsSearchOpen(true);
                }}
              >
                搜尋商品
              </button>
              <button type="button" onClick={() => openCommerceFilter("v3-featured", "本月精選")}>看優惠</button>
            </div>
          </section>

          <section className="collection-filter-panel-v22">
            <div className="collection-filter-title-v22">
              <strong>快速篩選</strong>
              <span>點選系列或需求，直接切換目前賣場。</span>
            </div>

            <div className="collection-chip-row-v22">
              <button
                type="button"
                className={selectedSeries === "全部" && selectedSkinFilter === "全部" ? "active" : ""}
                onClick={() => {
                  setSelectedSeries("全部");
                  setSelectedSkinFilter("全部");
                  setSearchQuery("");
                }}
              >
                全部
              </button>

              {collectionSeriesChips.map((series) => (
                <button
                  type="button"
                  key={`collection-series-${series}`}
                  className={selectedSeries === series ? "active" : ""}
                  onClick={() => selectCollectionSeries(series)}
                >
                  {series}
                </button>
              ))}
            </div>

            {selectedCategory === "保養品" && (
              <div className="collection-chip-row-v22 skin">
                {skinFilters.filter((filter) => filter !== "全部").slice(0, 8).map((filter) => (
                  <button
                    type="button"
                    key={`collection-skin-${filter}`}
                    className={selectedSkinFilter === filter ? "active" : ""}
                    onClick={() => {
                      setSelectedSkinFilter(filter);
                      setSelectedSeries("全部");
                      setSearchQuery("");
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </section>

          {collectionFeaturedProducts.length > 0 && (
            <section className="collection-featured-strip-v22">
              <div>
                <p>Featured</p>
                <h3>精選商品</h3>
              </div>

              <div className="collection-featured-list-v22">
                {collectionFeaturedProducts.map((product) => (
                  <button
                    type="button"
                    key={`collection-featured-${product.id}`}
                    onClick={() => openProductDetail(product)}
                  >
                    {hasRealImage(product) ? (
                      <img src={getPrimaryImage(product)} alt={product.name} data-fallback-index="0" onError={(event) => handleProductImageError(product, event)} />
                    ) : (
                      <span>商品圖</span>
                    )}
                    <strong>{getCardName(product)}</strong>
                  </button>
                ))}
              </div>
            </section>
          )}

          {collectionProducts.length > 0 ? (
            <div className="home-product-grid collection-product-grid collection-grid-v22">
              {collectionProducts.map((product) => (
                <ProductCard product={product} key={`collection-${product.id}`} />
              ))}
            </div>
          ) : (
            <div className="collection-empty-card collection-empty-v22">
              <h3>目前這個分類暫時沒有商品</h3>
              <p>可以返回選單切換其他分類，或點右上角搜尋商品。</p>
              <button type="button" onClick={() => openSearchTerm("組合價")}>
                看本月主打優惠
              </button>
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
                <h2>佐登妮絲城堡選品館</h2>
                <span>館別導覽｜熟客回購賣場</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} aria-label="關閉選單">×</button>
            </div>

            <div className="drawer-rule-card">
              <strong>🚚 滿 NT$3000 免運</strong>
              <span>📦 僅提供宅配，送出清單後由 LINE 小幫手確認。</span>
            </div>

            <nav className="drawer-nav drawer-accordion-v25" aria-label="商城分類選單">
              <div className="drawer-accordion-item-v25">
                <button type="button" className="drawer-accordion-title-v25" onClick={() => jumpToCategory("本月精選", "全部")}>
                  <span>本月精選</span>
                </button>
              </div>

              <div className="drawer-accordion-item-v25">
                <button type="button" className="drawer-accordion-title-v25" onClick={() => toggleDrawerGroup("保養美肌")}>
                  <span>保養美肌</span>
                </button>
                {expandedDrawerGroup === "保養美肌" && (
                  <div className="drawer-sublist-v25">
                    <button type="button" onClick={() => jumpToCategory("保養美肌", "全部")}>全部保養</button>
                    <button type="button" onClick={() => jumpToCategory("保養美肌", "龍血系列")}>龍血系列</button>
                    <button type="button" onClick={() => jumpToCategory("保養美肌", "薰衣草系列")}>薰衣草系列</button>
                    <button type="button" onClick={() => jumpToCategory("保養美肌", "水光肌能系列")}>水光肌能</button>
                    <button type="button" onClick={() => jumpToCategory("保養美肌", "面膜")}>面膜保養</button>
                    <button type="button" onClick={() => openCommerceFilter("clearance-all", "即期優惠")}>即期優惠</button>
                  </div>
                )}
              </div>

              <div className="drawer-accordion-item-v25">
                <button type="button" className="drawer-accordion-title-v25" onClick={() => toggleDrawerGroup("健康保健")}>
                  <span>健康保健</span>
                </button>
                {expandedDrawerGroup === "健康保健" && (
                  <div className="drawer-sublist-v25">
                    <button type="button" onClick={() => jumpToCategory("健康保健", "全部")}>全部保健</button>
                    <button type="button" onClick={() => jumpToCategory("健康保健", "益生菌系列")}>益生菌</button>
                    <button type="button" onClick={() => jumpToCategory("健康保健", "晶眸保健系列")}>葉黃素 / 晶眸</button>
                    <button type="button" onClick={() => jumpToCategory("健康保健", "美妍飲品系列")}>膠原飲品</button>
                    <button type="button" onClick={() => jumpToCategory("健康保健", "魚油組合")}>魚油組合</button>
                  </div>
                )}
              </div>

              <div className="drawer-accordion-item-v25">
                <button type="button" className="drawer-accordion-title-v25" onClick={() => toggleDrawerGroup("精油香氛")}>
                  <span>精油香氛</span>
                </button>
                {expandedDrawerGroup === "精油香氛" && (
                  <div className="drawer-sublist-v25">
                    <button type="button" onClick={() => jumpToCategory("精油香氛", "全部")}>全部香氛</button>
                    <button type="button" onClick={() => jumpToCategory("精油香氛", "單方精油")}>單方精油</button>
                    <button type="button" onClick={() => jumpToCategory("精油香氛", "複方精油")}>複方精油</button>
                    <button type="button" onClick={() => jumpToCategory("精油香氛", "擴香設備")}>擴香設備</button>
                    <button type="button" onClick={() => jumpToCategory("精油香氛", "香氛皂")}>香氛皂</button>
                  </div>
                )}
              </div>

              <div className="drawer-accordion-item-v25">
                <button type="button" className="drawer-accordion-title-v25" onClick={() => jumpToCategory("即將上架", "全部")}>
                  <span>即將上架</span>
                </button>
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

      <section className="mall-hero-v26 mall-hero-v27" aria-label="佐登妮絲城堡回購館首頁">
        <div className="mall-hero-copy-v26">
          <p className="mall-hero-eyebrow-v26">Jourdeness Castle Reorder</p>
          <h2>佐登妮絲城堡回購館</h2>
          <span>自家產品・產地價・會員回購清單。精選保養美肌、健康保健與精油香氛回購品項；加入清單後由 LINE 小幫手確認庫存、金額與取貨方式。</span>

          <button
            type="button"
            className="mall-search-trigger-v26"
            onClick={() => {
              setIsCollectionOpen(false);
              setIsSearchOpen(true);
            }}
          >
            <span>🔍</span>
            <strong>搜尋商品、系列、活動</strong>
            <em>龍血 / 益生菌 / BC-HA / 精油 / 薰衣草皂</em>
          </button>

          <div className="mall-hero-actions-v26">
            <button type="button" onClick={() => openCommerceFilter("v3-featured", "本月精選")}>查看本月精選</button>
            <button type="button" onClick={() => setIsCartOpen(true)}>我的回購清單</button>
          </div>

          <div className="mall-proof-row-v27" aria-label="賣場特色">
            <span>自家產品回購</span>
            <span>產地價 / 活動價清楚</span>
            <span>LINE 確認訂單</span>
            <span>滿額免運</span>
          </div>
        </div>

        {heroTopProduct && (
          <button
            type="button"
            className="mall-hero-product-v26"
            onClick={() => openProductDetail(heroTopProduct)}
          >
            <span className="mall-top-pill-v26">本月主打｜買一送一</span>
            <div className="mall-hero-product-image-v26">
              {hasRealImage(heroTopProduct) ? (
                <img
                  src={getPrimaryImage(heroTopProduct)}
                  alt={heroTopProduct.name}
                  data-fallback-index="0"
                  onError={(event) => handleProductImageError(heroTopProduct, event)}
                />
              ) : (
                <span>圖片更新中</span>
              )}
            </div>
            <strong>{getCardName(heroTopProduct)}</strong>
            <p>{getCardSubtitle(heroTopProduct)}</p>
            <em>{displayPrice(heroTopProduct)}</em>
          </button>
        )}
      </section>

      <section className="mall-editorial-banners-v27" aria-label="選品館主題入口">
        <button type="button" className="mall-editorial-card-v27 primary" onClick={() => openCommerceFilter("deals-all", "本月優惠 / 全部優惠")}>
          <span>Monthly Focus</span>
          <strong>本月精選</strong>
          <p>精選本月主打與熟客回購熱賣，不用在太多分類裡迷路。</p>
        </button>

        <button type="button" className="mall-editorial-card-v27" onClick={() => handleDrawerCategory("保健食品", "全部")}>
          <span>Health Care</span>
          <strong>健康保健</strong>
          <p>益生菌、BC-HA、葉黃素與日常營養補給集中查看。</p>
        </button>

        <button type="button" className="mall-editorial-card-v27" onClick={() => openCommerceFilter("need-life", "生活選品 / 全部選品")}>
          <span>Life Select</span>
          <strong>生活選品</strong>
          <p>皂品、牙膏與精油香氛品項集中整理，不再切太碎。</p>
        </button>
      </section>

      <section className="mall-hall-section-v26 mall-hall-section-v27" aria-label="賣場館別入口">
        <div className="mall-section-head-v26">
          <p>Shop by Category</p>
          <h2>四大主分類</h2>
          <span>移除外部廠商後，主分類改少而精，讓每一區都有商品可看。</span>
        </div>

        <div className="mall-hall-grid-v26">
          {mallQuickEntries.map((entry) => (
            <button type="button" key={`mall-hall-${entry.title}`} onClick={entry.onClick}>
              <span>{entry.badge}</span>
              <strong>{entry.title}</strong>
              <p>{entry.text}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mall-deal-wall-v26 mall-deal-wall-v27" aria-label="本月精選">
        <div className="mall-section-head-v26 compact">
          <p>Monthly Picks</p>
          <h2>本月精選</h2>
          <span>先放 4～6 個自家回購主打品項，首頁不再塞成大雜貨清單。</span>
        </div>

        <div className="mall-deal-grid-v26">
          {mallDealProducts.map((product, index) => (
            <article className={index === 0 ? "mall-deal-card-v26 feature" : "mall-deal-card-v26"} key={`mall-deal-${product.id}`}>
              <button type="button" className="mall-deal-image-v26" onClick={() => openProductDetail(product)}>
                {hasRealImage(product) ? (
                  <img
                    src={getPrimaryImage(product)}
                    alt={product.name}
                    data-fallback-index="0"
                    onError={(event) => handleProductImageError(product, event)}
                  />
                ) : (
                  <span>圖片更新中</span>
                )}
              </button>

              <div>
                <span>{getCommerceBadgeLabel(product)}</span>
                <h3>{getCardName(product)}</h3>
                <p>{getCardSubtitle(product)}</p>
                <strong>{displayPrice(product)}</strong>
                <button type="button" onClick={() => openProductDetail(product)}>查看商品</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mall-brand-section-v26 mall-brand-section-v27 v3-tag-section" aria-label="選品標籤入口">
        <div className="mall-section-head-v26 compact">
          <p>Product Tags</p>
          <h2>選品標籤</h2>
          <span>即期優惠與即將上架改用標籤 / 專區處理，不再混入主購買流程。</span>
        </div>

        <div className="mall-brand-grid-v26 mall-brand-grid-v271">
          {mallBrandEntries.map((brand) => (
            <button type="button" key={`mall-brand-${brand.title}`} onClick={brand.onClick}>
              <em className="mall-brand-badge-v271">{brand.badge}</em>
              <strong>{brand.title}</strong>
              <p>{brand.text}</p>
              <span>查看商品</span>
            </button>
          ))}
        </div>
      </section>

      <HomeProductSection
        id="home-hot-products-v26"
        eyebrow="Monthly Picks"
        title="本月精選・熟客常買"
        subtitle="目前先用精選商品撐起首頁質感，避免分類太多但內容太薄。"
        products={mallHotProducts}
        actionLabel="看本月精選"
        onAction={() => openCommerceFilter("v3-featured", "本月精選")}
      />

      <HomeProductSection
        id="home-skincare-hall-v271"
        eyebrow="Skin Care Hall"
        title="保養美肌館精選"
        subtitle="龍血、水光、玫瑰與高階保養，維持佐登妮絲主品牌質感。"
        products={mallSkincareShelfProducts}
        actionLabel="進入保養美肌館"
        onAction={() => jumpToCategory("保養美肌", "全部")}
      />

      <HomeProductSection
        id="home-health-hall-v271"
        eyebrow="Health Hall"
        title="健康保健精選"
        subtitle="益生菌、膠原蛋白飲、葉黃素與熟客回購組合。"
        products={mallHealthShelfProducts}
        actionLabel="進入健康保健"
        onAction={() => jumpToCategory("健康保健", "全部")}
      />

      <HomeProductSection
        id="home-aroma-hall-v271"
        eyebrow="Aroma Hall"
        title="精油香氛館精選"
        subtitle="精油、香氛與居家儀式感選品，之後可持續擴充。"
        products={mallAromaShelfProducts}
        actionLabel="進入精油香氛館"
        onAction={() => jumpToCategory("精油香氛", "全部")}
      />

      <HomeProductSection
        id="home-coming-soon-hall-v31"
        eyebrow="Coming Soon"
        title="即將上架"
        subtitle="整理中品項先集中展示，正式開賣前不開放加入清單。"
        products={mallComingSoonProducts}
        actionLabel="查看即將上架"
        onAction={() => jumpToCategory("即將上架", "全部")}
      />

      <section className="commerce-trust-flow-v23 trust-flow-after-deals-v24" aria-label="購買流程">
        <div className="trust-flow-title-v23">
          <p>How to Order</p>
          <h2>購物流程</h2>
        </div>

        <div className="trust-flow-steps-v23">
          <div>
            <strong>01</strong>
            <span>加入清單</span>

          </div>
          <div>
            <strong>02</strong>
            <span>送出資料</span>

          </div>
          <div>
            <strong>03</strong>
            <span>LINE 確認</span>

          </div>
          <div>
            <strong>04</strong>
            <span>匯款成立</span>
            <p>確認無誤後提供匯款資訊，完成後成立。</p>
          </div>
        </div>
      </section>


      {cartTotalQuantity > 0 && (
        <button className="floating-cart-button floating-cart-button-v273" onClick={() => setIsCartOpen(true)}>
          <span>我的清單</span>
          <strong>{cartTotalQuantity}</strong>
        </button>
      )}

      {isCartOpen && (
        <section className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="cart-panel checkout-panel-v21" onClick={(event) => event.stopPropagation()}>
            <div className="cart-header checkout-header-v21">
              <div>
                <p className="cart-eyebrow">Saved List</p>
                <h2>我的回購清單</h2>
                <span>這裡先整理想買的品項；送出後由 LINE 小幫手確認庫存、效期、金額與付款方式。</span>
              </div>
              <button className="cart-close" onClick={() => setIsCartOpen(false)}>
                ×
              </button>
            </div>

            {cartItems.length > 0 ? (
              <>
                <div className="checkout-step-strip" aria-label="訂購流程">
                  <div>
                    <strong>1</strong>
                    <span>確認清單</span>
                  </div>
                  <div>
                    <strong>2</strong>
                    <span>填宅配資料</span>
                  </div>
                  <div>
                    <strong>3</strong>
                    <span>LINE 確認</span>
                  </div>
                  <div>
                    <strong>4</strong>
                    <span>匯款成立</span>
                  </div>
                </div>

                <section className="cart-summary-ribbon-v273" aria-label="回購清單提醒">
                  <div>
                    <strong>{cartTotalQuantity}</strong>
                    <span>件商品已加入</span>
                  </div>
                  <p>清單會自動保存；重新整理或從 LINE 再打開，也會優先恢復同一台裝置上的內容。</p>
                </section>

                <section className="checkout-card-v21">
                  <div className="checkout-card-title">
                    <p>Order Items</p>
                    <h3>商品明細</h3>
                    <span>共 {cartTotalQuantity} 件商品，實際組合優惠與金額由 LINE 小幫手確認。</span>
                  </div>

                  <div className="cart-items checkout-items-v21">
                    {cartItems.map((item) => (
                      <div className="cart-item checkout-item-v21" key={item.product.id}>
                        <div className="checkout-item-image">
                          {hasRealImage(item.product) ? (
                            <img src={item.product.image} alt={item.product.name} />
                          ) : (
                            <span>圖片準備中</span>
                          )}
                        </div>

                        <div className="checkout-item-main">
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

                        <div className="cart-quantity-control checkout-quantity-v21">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
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
                </section>

                <section className="checkout-free-shipping-card">
                  <div>
                    <p>Free Shipping</p>
                    <h3>滿 NT$3000 免運</h3>
                    <span>部分商品為任選、組合價或待確認價格，最終免運金額以 LINE 小幫手確認為準。</span>
                  </div>
                  <strong>宅配限定</strong>
                </section>

                {cartUpsellProducts.length > 0 && (
                  <section className="checkout-upsell-card-v22">
                    <div className="checkout-card-title">
                      <p>Add-on Ideas</p>
                      <h3>可加購湊免運</h3>
                      <span>實際金額由 LINE 小幫手確認。</span>
                    </div>

                    <div className="checkout-upsell-list-v22">
                      {cartUpsellProducts.map((product) => (
                        <button
                          type="button"
                          key={`cart-upsell-${product.id}`}
                          onClick={() => addToCart(product)}
                        >
                          {hasRealImage(product) ? (
                            <img src={getPrimaryImage(product)} alt={product.name} data-fallback-index="0" onError={(event) => handleProductImageError(product, event)} />
                          ) : (
                            <span>商品圖</span>
                          )}
                          <strong>{getCardName(product)}</strong>
                          <em>{displayPrice(product)}</em>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                <form className="order-form checkout-form-v21" onSubmit={submitOrder}>
                  <div className="checkout-card-title">
                    <p>Delivery Info</p>
                    <h3>宅配資料</h3>
                    <span>這裡只做訂購清單送出，不會直接付款。</span>
                  </div>

                  <div className="delivery-summary checkout-line-flow">
                    <strong>送出後流程</strong>
                    <span>LINE 小幫手會確認商品庫存、效期、訂單金額與宅配資訊；確認無誤後才會提供匯款資訊。</span>
                  </div>

                  <div className="checkout-assurance-grid-v23" aria-label="訂購保障">
                    <div>
                      <strong>不會直接付款</strong>
                      <span>送出後只是建立清單。</span>
                    </div>
                    <div>
                      <strong>確認後成立</strong>
                      <span>庫存、效期、金額確認後成立。</span>
                    </div>
                    <div>
                      <strong>滿額免運</strong>
                      <span>滿 NT$3000 免運。</span>
                    </div>
                  </div>

                  <div className="line-bind-card-v25313">
                    <div>
                      <span>LINE 帳號</span>
                      {lineProfile ? (
                        <strong>已綁定：{lineProfile.displayName}</strong>
                      ) : (
                        <strong>清單可綁定 LINE 保存</strong>
                      )}
                      {lineBindingMessage ? <em>{lineBindingMessage}</em> : null}
                    </div>
                    {lineProfile ? (
                      <small>送出時會帶入 LINE 身分</small>
                    ) : (
                      <button
                        type="button"
                        onClick={startLineBinding}
                        disabled={lineBindingStatus === "loading" || !LINE_LIFF_ID}
                      >
                        {lineBindingStatus === "loading" ? "綁定中" : "綁定 LINE"}
                      </button>
                    )}
                  </div>

                  <div className="checkout-field-grid">
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
                      LINE ID（備用）
                      <input
                        value={customer.lineId}
                        onChange={(event) =>
                          setCustomer({ ...customer, lineId: event.target.value })
                        }
                        placeholder="未綁定時可填寫"
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

                    <label className="checkout-field-full">
                      宅配地址 <span>*</span>
                      <input
                        value={customer.address}
                        onChange={(event) =>
                          setCustomer({ ...customer, address: event.target.value })
                        }
                        placeholder="請輸入宅配地址"
                      />
                    </label>

                    <label className="checkout-field-full">
                      備註
                      <textarea
                        value={customer.note}
                        onChange={(event) =>
                          setCustomer({ ...customer, note: event.target.value })
                        }
                        placeholder="可填寫想確認庫存、品項搭配、指定需求"
                      />
                    </label>
                  </div>

                  {submitMessage && (
                    <p className={submitStatus === "success" ? "form-message success" : "form-message error"}>
                      {submitMessage}
                    </p>
                  )}

                  <button className="submit-order-button checkout-submit-v21" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "送出中..." : "送出訂購清單"}
                  </button>

                  <p className="order-form-note">
                    送出清單不代表付款完成。商品價格、庫存、優惠組合、滿額免運與付款方式，仍依 LINE 小幫手確認為準。
                  </p>
                </form>
              </>
            ) : (
              <div className="empty-cart checkout-empty-v21">
                <h3>清單目前是空的</h3>
                <p>回商品列表加入想詢問或訂購的品項。</p>
              </div>
            )}
          </div>
        </section>
      )}

      {selectedDetailProduct && (
        <section className="detail-backdrop" onClick={() => closeProductDetail()}>
          <div className="detail-panel" onClick={(event) => event.stopPropagation()}>
            <div className="detail-header">
              <button className="detail-close" onClick={() => closeProductDetail()}>
                ‹
              </button>
              <h2>商品詳情</h2>
              <button className="detail-cart-button" onClick={() => setIsCartOpen(true)}>
                清單 {cartTotalQuantity}
              </button>
            </div>

            <div className="detail-gallery-v291" aria-label="商品圖片">
              {getDetailGalleryImages(selectedDetailProduct).length > 0 ? (
                <>
                  <div className="detail-gallery-track-v291">
                    {getDetailGalleryImages(selectedDetailProduct).map((image, index) => (
                      <figure className="detail-gallery-item-v291" key={`detail-gallery-${selectedDetailProduct.id}-${image}-${index}`}>
                        <img
                          src={image}
                          alt={`${selectedDetailProduct.name} 圖片 ${index + 1}`}
                          data-fallback-index={String(index)}
                          onError={(event) => handleProductImageError(selectedDetailProduct, event)}
                        />
                      </figure>
                    ))}
                  </div>

                  {getDetailGalleryImages(selectedDetailProduct).length > 1 && (
                    <div className="detail-gallery-hint-v291">
                      <span>左右滑動看更多圖片</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="image-placeholder detail-placeholder detail-placeholder-v291">
                  <span>Jourdeness Castle</span>
                  <strong>圖片更新中</strong>
                </div>
              )}
            </div>

            <div className="detail-content commerce-detail-content-v21">
              <div className="detail-title-row commerce-detail-title-v21">
                <div>
                  <div className="detail-commerce-badge-row">
                    <p className="series-label">{selectedDetailProduct.series}</p>
                    <span className="detail-commerce-badge">{getCommerceBadgeLabel(selectedDetailProduct)}</span>
                  </div>

                  <h1>{getDetailName(selectedDetailProduct)}</h1>
                  <p className="detail-description">{getSpecLine(selectedDetailProduct)}</p>
                </div>
              </div>

              <div className="detail-tags commerce-detail-tags-v21">
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

              <section className="detail-price-hero-v273" aria-label="價格與加入清單">
                <div>
                  <p>{getPriceModeLabel(selectedDetailProduct)}</p>
                  {hasKnownOriginalPrice(selectedDetailProduct) && (
                    <span className="original-price">{selectedDetailProduct.originalPrice}</span>
                  )}
                  <strong className={`price ${hasInquiryPrice(selectedDetailProduct) ? "inquiry" : ""}`}>
                    {displayPrice(selectedDetailProduct)}
                  </strong>
                  <em>{getPriceNote(selectedDetailProduct)}</em>
                </div>

                <div className="detail-price-actions-v273">
                  <button
                    type="button"
                    className="primary"
                    disabled={isCartDisabled(selectedDetailProduct)}
                    onClick={() => addToCart(selectedDetailProduct)}
                  >
                    {isComingSoon(selectedDetailProduct) ? "準備上架" : isSoldOut(selectedDetailProduct) ? "缺貨中" : "加入清單"}
                  </button>
                  <button type="button" onClick={() => setIsCartOpen(true)}>
                    我的清單 {cartTotalQuantity}
                  </button>
                </div>
              </section>

              <section className="detail-info-block product-summary-card commerce-summary-v21">
                <h3>商品資訊</h3>

                <div className="product-info-lines">
                  <div>
                    <span>規格 / 組合內容</span>
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

              <section className="detail-service-grid-v21" aria-label="購買服務提醒">
                <div>
                  <strong>滿額免運</strong>
                  <span>滿 NT$3000 免運</span>
                </div>
                <div>
                  <strong>宅配出貨</strong>
                  <span>目前僅提供宅配</span>
                </div>
                <div>
                  <strong>LINE 確認</strong>
                  <span>庫存效期確認</span>
                </div>
              </section>

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

              <section className="detail-buybox-v21">
                <div>
                  <p>回購群專屬價</p>
                  {hasKnownOriginalPrice(selectedDetailProduct) && (
                    <span className="original-price">{selectedDetailProduct.originalPrice}</span>
                  )}
                  <strong className={`price ${hasInquiryPrice(selectedDetailProduct) ? "inquiry" : ""}`}>
                    {displayPrice(selectedDetailProduct)}
                  </strong>
                  <em>{getPriceNote(selectedDetailProduct)}</em>
                </div>

                <button
                  className="detail-add-button detail-buybox-button-v21"
                  disabled={isCartDisabled(selectedDetailProduct)}
                  onClick={() => addToCart(selectedDetailProduct)}
                >
                  {isComingSoon(selectedDetailProduct) ? "準備上架" : isSoldOut(selectedDetailProduct) ? "缺貨中" : "加入清單"}
                </button>
              </section>

              <section className="detail-info-block soft">
                <h3>配送提醒</h3>
                <p>滿 NT$3000 免運，僅提供宅配。</p>
                <p>送出清單後，請至 LINE 與小幫手確認庫存、效期、金額、付款方式與宅配資訊。</p>
              </section>

              <section className="detail-info-block">
                <div className="related-heading related-heading-v22">
                  <h3>你可能也會喜歡</h3>
                  <span>同系列、同分類或可搭配的回購推薦</span>
                </div>
                <div className="related-products related-products-v22">
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

      <section className="line-confirm-section-v244" aria-label="LINE 訂單確認">
        <div className="line-confirm-card-v244">
          <div className="line-confirm-copy-v244">
            <p>Order Confirm</p>
            <h2>LINE 訂單確認</h2>
            <span>
              送出清單後，請加入 LINE 小幫手確認訂單。小幫手會協助確認庫存、效期、金額與宅配資訊，確認完成後才會提供匯款資訊。
            </span>

            <strong>LINE ID：@chateau-buy</strong>

            <a
              className="line-confirm-button-v244"
              href="https://line.me/R/ti/p/@chateau-buy"
              target="_blank"
              rel="noopener noreferrer"
            >
              點我加入 LINE
            </a>
          </div>

          <div className="line-confirm-qr-wrap-v244">
            <div className="line-confirm-qr-v244">
              <img src="/line-qrcode.png" alt="LINE QR Code" />
            </div>
            <span>掃碼加入</span>
          </div>

          <div className="line-confirm-rule-v244">
            滿 NT$3000 免運｜僅提供宅配｜付款完成後訂單才正式成立
          </div>
        </div>
      </section>

      <footer className="company-footer-v2535" aria-label="公司資訊與購物說明">
        <div className="company-footer-brand-v2535">
          <img
            src="/products/logo.png"
            alt="Château de Jourdeness logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div>
            <p>Jourdeness Castle</p>
            <h2>佐登妮絲城堡回購館</h2>
            <span>城堡回購群｜產地價與精選生活賣場</span>
          </div>
        </div>

        <div className="company-info-grid-v2535">
          <div>
            <span>客服方式</span>
            <strong>LINE 小幫手 @chateau-buy</strong>
          </div>
          <div>
            <span>配送方式</span>
            <strong>滿 NT$3000 免運｜目前僅提供宅配</strong>
          </div>
          <div>
            <span>訂購流程</span>
            <strong>加入清單送出後，由 LINE 小幫手確認庫存、效期、金額與付款資訊。</strong>
          </div>
          <div>
            <span>公司名稱</span>
            <strong>佐登妮絲國際股份有限公司</strong>
          </div>
          <div>
            <span>統一編號</span>
            <strong>89826011</strong>
          </div>
          <div>
            <span>公司地址</span>
            <strong>臺中市北區賴旺里中清路一段812號、816號</strong>
          </div>
        </div>

        <p className="company-footer-note-v2535">
          本站商品價格、組合活動、庫存與效期，皆以 LINE 小幫手最終確認內容為準。
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


        /* Commerce Visual V2：首頁 + 商品卡 + 商品頁 + 清單頁更像手機電商 */
        .announcement-bar {
          position: sticky !important;
          top: 0 !important;
          z-index: 40 !important;
          margin: -14px -14px 0 !important;
          padding: 8px 12px !important;
          background: linear-gradient(90deg, #2f241f, #7b2d24) !important;
          color: #fff8ef !important;
          font-size: 12px !important;
          font-weight: 950 !important;
          text-align: center !important;
          letter-spacing: 0.02em !important;
          box-shadow: 0 8px 20px rgba(61, 48, 40, 0.18) !important;
        }

        .top-header {
          top: 31px !important;
          margin-top: 0 !important;
          border-bottom: 1px solid rgba(226, 211, 199, 0.9) !important;
          background: rgba(255, 255, 255, 0.94) !important;
          box-shadow: 0 10px 26px rgba(61, 48, 40, 0.08) !important;
        }

        .brand-block h1,
        .top-header h1 {
          font-size: 19px !important;
          font-weight: 1000 !important;
          letter-spacing: -0.04em !important;
        }

        .header-cart-button {
          background: linear-gradient(135deg, var(--accent-dark), var(--accent)) !important;
          box-shadow: 0 10px 22px rgba(178, 65, 51, 0.22) !important;
        }

        .commerce-hero-v2 {
          position: relative;
          overflow: hidden;
          margin: 12px 0 12px;
          padding: 22px 18px 16px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 30px;
          background:
            radial-gradient(circle at 92% 12%, rgba(183, 138, 72, 0.22), transparent 28%),
            linear-gradient(135deg, #fff8ef 0%, #fff 43%, #f4e2d4 100%);
          box-shadow: 0 20px 44px rgba(77, 55, 38, 0.12);
        }

        .commerce-hero-v2::before {
          content: "";
          position: absolute;
          right: -28px;
          bottom: -48px;
          width: 170px;
          height: 170px;
          border-radius: 999px;
          background: rgba(178, 65, 51, 0.10);
          pointer-events: none;
        }

        .commerce-hero-copy {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 8px;
        }

        .commerce-hero-eyebrow {
          width: fit-content;
          margin: 0;
          padding: 6px 10px;
          border: 1px solid rgba(178, 65, 51, 0.18);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.75);
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 1000;
          letter-spacing: 0.08em;
        }

        .commerce-hero-copy h2 {
          margin: 0;
          max-width: 370px;
          color: var(--ink);
          font-size: 28px;
          line-height: 1.12;
          letter-spacing: -0.07em;
        }

        .commerce-hero-copy span {
          max-width: 390px;
          color: #76645a;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.65;
        }

        .commerce-hero-actions {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 10px;
          margin-top: 16px;
        }

        .hero-primary-button,
        .hero-secondary-button {
          min-height: 44px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 1000;
        }

        .hero-primary-button {
          border: 0;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: #fff;
          box-shadow: 0 13px 26px rgba(178, 65, 51, 0.24);
        }

        .hero-secondary-button {
          border: 1px solid rgba(178, 65, 51, 0.20);
          background: #fff;
          color: var(--accent-dark);
        }

        .commerce-service-strip {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 7px;
          margin-top: 14px;
        }

        .commerce-service-strip span {
          padding: 8px 6px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.72);
          color: #6d5b51;
          font-size: 11px;
          font-weight: 950;
          text-align: center;
          box-shadow: inset 0 0 0 1px rgba(232, 214, 198, 0.75);
        }

        .commerce-shortcut-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin: 0 0 14px;
        }

        .commerce-shortcut-grid button {
          display: grid;
          gap: 4px;
          min-height: 72px;
          padding: 12px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.88);
          text-align: left;
          box-shadow: 0 12px 28px rgba(77, 55, 38, 0.07);
        }

        .commerce-shortcut-grid strong {
          color: var(--ink);
          font-size: 15px;
          font-weight: 1000;
          letter-spacing: -0.03em;
        }

        .commerce-shortcut-grid span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 850;
          line-height: 1.35;
        }

        .store-promo-stack {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 12px !important;
          margin-top: 12px !important;
        }

        .home-banner {
          min-height: 132px !important;
          padding: 18px !important;
          border: 1px solid rgba(232, 214, 198, 0.95) !important;
          border-radius: 26px !important;
          background:
            radial-gradient(circle at 90% 20%, rgba(178, 65, 51, 0.15), transparent 27%),
            linear-gradient(135deg, #fff, #fff4eb) !important;
          box-shadow: 0 16px 34px rgba(77, 55, 38, 0.10) !important;
        }

        .home-banner-copy p,
        .section-heading.compact p {
          color: var(--accent) !important;
          font-weight: 1000 !important;
          letter-spacing: 0.12em !important;
        }

        .home-banner-copy h2 {
          color: var(--ink) !important;
          font-size: 24px !important;
          font-weight: 1000 !important;
          letter-spacing: -0.055em !important;
        }

        .home-banner-copy strong {
          display: inline-flex !important;
          width: fit-content !important;
          padding: 6px 10px !important;
          border-radius: 999px !important;
          background: rgba(178, 65, 51, 0.09) !important;
          color: var(--accent-dark) !important;
          font-size: 12px !important;
        }

        .home-product-section {
          margin-top: 16px !important;
          padding: 14px 0 2px !important;
        }

        .home-product-section .section-heading.compact {
          align-items: flex-start !important;
          margin-bottom: 12px !important;
          padding: 0 2px !important;
          text-align: left !important;
        }

        .home-product-section .section-heading.compact h2 {
          font-size: 24px !important;
          font-weight: 1000 !important;
          letter-spacing: -0.06em !important;
        }

        .home-product-section .section-heading.compact span {
          max-width: 100% !important;
          font-size: 13px !important;
          line-height: 1.55 !important;
        }

        .home-product-grid {
          gap: 12px !important;
        }

        .product-card.commerce-product-card,
        .featured-card.commerce-product-card {
          position: relative !important;
          border: 1px solid rgba(226, 226, 226, 0.98) !important;
          border-radius: 22px !important;
          overflow: hidden !important;
          background: #fff !important;
          box-shadow: 0 12px 28px rgba(77, 55, 38, 0.08) !important;
          transform: translateZ(0);
        }

        .commerce-card-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 3;
          max-width: calc(100% - 20px);
          padding: 6px 9px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: #fff;
          font-size: 11px;
          font-weight: 1000;
          line-height: 1;
          box-shadow: 0 8px 16px rgba(178, 65, 51, 0.22);
        }

        .commerce-card-badge.inquiry {
          background: linear-gradient(135deg, #8a7669, #5d4b41);
        }

        .commerce-card-badge.soldout {
          background: linear-gradient(135deg, #8d8d8d, #555);
        }

        .product-card .product-image,
        .featured-card .product-image {
          aspect-ratio: 1 / 1.02 !important;
          border-bottom: 1px solid rgba(238, 232, 226, 0.9) !important;
          background:
            linear-gradient(180deg, #fff, #fffaf6) !important;
        }

        .product-card .product-image img,
        .featured-card .product-image img {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          padding: 10px !important;
          object-fit: contain !important;
          transform: none !important;
        }

        .product-info {
          gap: 6px !important;
          padding: 10px 10px 12px !important;
          text-align: left !important;
        }

        .product-meta-row {
          justify-content: flex-start !important;
          min-height: 20px !important;
          margin-bottom: 0 !important;
        }

        .series-label {
          max-width: 100%;
          padding: 5px 8px !important;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          background: #f7eee7 !important;
          color: var(--accent-dark) !important;
          font-size: 11.5px !important;
        }

        .product-info h3 {
          min-height: 48px !important;
          margin: 0 !important;
          color: #2f2621 !important;
          font-size: 18px !important;
          font-weight: 1000 !important;
          line-height: 1.28 !important;
          letter-spacing: -0.05em !important;
          text-align: left !important;
        }

        .product-info .description {
          display: -webkit-box !important;
          min-height: 59px !important;
          margin: 0 !important;
          overflow: hidden !important;
          color: #7d6b62 !important;
          font-size: 13.4px !important;
          font-weight: 780 !important;
          line-height: 1.45 !important;
          text-align: left !important;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .tag-row {
          min-height: 26px !important;
          justify-content: flex-start !important;
          gap: 5px !important;
        }

        .need-tag,
        .combo-badge {
          border-radius: 999px !important;
          font-size: 10.5px !important;
          font-weight: 950 !important;
        }

        .commerce-price-block {
          margin-top: auto !important;
          padding-top: 6px !important;
          text-align: left !important;
        }

        .original-price {
          margin: 0 0 2px !important;
          color: #b4a59c !important;
          font-size: 12px !important;
          font-weight: 850 !important;
          text-decoration: line-through !important;
        }

        .price {
          margin: 0 !important;
          color: #c0352a !important;
          font-size: 21px !important;
          font-weight: 1000 !important;
          line-height: 1.15 !important;
          letter-spacing: -0.04em !important;
        }

        .price.inquiry {
          color: #755f53 !important;
          font-size: 19px !important;
        }

        .commerce-card-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 7px;
          margin-top: 8px;
        }

        .add-cart-button {
          min-height: 42px !important;
          margin-top: 0 !important;
          border: 0 !important;
          border-radius: 14px !important;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark)) !important;
          color: #fff !important;
          font-size: 14px !important;
          font-weight: 1000 !important;
          box-shadow: 0 10px 20px rgba(178, 65, 51, 0.18) !important;
        }

        .add-cart-button:disabled {
          background: #aaa !important;
          box-shadow: none !important;
        }

        .detail-button {
          min-height: 36px !important;
          margin-top: 0 !important;
          border: 1px solid rgba(178, 65, 51, 0.18) !important;
          border-radius: 14px !important;
          background: #fff !important;
          color: var(--accent-dark) !important;
          font-size: 13px !important;
          font-weight: 1000 !important;
        }

        .cart-panel {
          border-radius: 30px 30px 18px 18px !important;
          background: #fff !important;
        }

        .cart-eyebrow {
          color: var(--accent) !important;
        }

        .cart-header h2 {
          font-size: 25px !important;
          font-weight: 1000 !important;
          letter-spacing: -0.06em !important;
        }

        .cart-item {
          border: 1px solid rgba(232, 214, 198, 0.9) !important;
          background: #fffaf6 !important;
        }

        .delivery-summary {
          border: 1px solid rgba(178, 65, 51, 0.14) !important;
          background: linear-gradient(135deg, #fff8ef, #fff) !important;
        }

        .order-form label {
          padding: 11px 12px !important;
          border: 1px solid rgba(232, 214, 198, 0.9) !important;
          border-radius: 18px !important;
          background: #fff !important;
        }

        .submit-order-button {
          min-height: 48px !important;
          border-radius: 999px !important;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark)) !important;
          box-shadow: 0 12px 24px rgba(178, 65, 51, 0.22) !important;
        }

        .detail-panel {
          border-radius: 28px 28px 0 0 !important;
          background: #fff !important;
        }

        .detail-header {
          position: sticky !important;
          top: 0 !important;
          z-index: 2 !important;
          background: rgba(255, 255, 255, 0.94) !important;
          backdrop-filter: blur(16px) !important;
          border-bottom: 1px solid rgba(232, 214, 198, 0.8) !important;
        }

        .detail-main-image {
          margin: 12px !important;
          border: 1px solid rgba(232, 214, 198, 0.9) !important;
          border-radius: 24px !important;
          background: linear-gradient(180deg, #fff, #fffaf6) !important;
        }

        .detail-content {
          padding-bottom: 88px !important;
        }

        .detail-price-card {
          border: 1px solid rgba(178, 65, 51, 0.14) !important;
          background: linear-gradient(135deg, #fff8ef, #fff) !important;
        }

        .detail-add-button {
          position: sticky !important;
          bottom: 10px !important;
          z-index: 3 !important;
          min-height: 50px !important;
          border-radius: 999px !important;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark)) !important;
          box-shadow: 0 14px 26px rgba(178, 65, 51, 0.28) !important;
        }

        .floating-cart-button {
          border-radius: 999px !important;
          background: linear-gradient(135deg, #2f241f, var(--accent-dark)) !important;
          box-shadow: 0 14px 30px rgba(61, 48, 40, 0.25) !important;
        }

        .notice-card,
        .footer,
        .search-panel {
          border-radius: 24px !important;
          background: rgba(255, 255, 255, 0.92) !important;
          box-shadow: 0 12px 28px rgba(77, 55, 38, 0.08) !important;
        }

        @media (max-width: 370px) {
          .commerce-hero-copy h2 {
            font-size: 24px !important;
          }

          .commerce-service-strip {
            grid-template-columns: 1fr !important;
          }

          .product-info h3 {
            font-size: 14px !important;
          }

          .price {
            font-size: 17px !important;
          }
        }


        /* Commerce V2.1：商品頁 + 結帳頁升級 */
        .checkout-panel-v21 {
          max-height: 94vh !important;
          padding: 16px !important;
          background:
            linear-gradient(180deg, rgba(255, 250, 246, 0.98), #fff) !important;
        }

        .checkout-header-v21 {
          position: sticky;
          top: 0;
          z-index: 4;
          margin: -16px -16px 14px;
          padding: 16px;
          border-bottom: 1px solid rgba(232, 214, 198, 0.9);
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(18px);
        }

        .checkout-step-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin: 8px 0 14px;
        }

        .checkout-step-strip div {
          display: grid;
          place-items: center;
          gap: 5px;
          min-height: 70px;
          padding: 10px 6px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 10px 22px rgba(77, 55, 38, 0.06);
        }

        .checkout-step-strip strong {
          display: grid;
          place-items: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: #fff;
          font-size: 13px;
          font-weight: 1000;
        }

        .checkout-step-strip span {
          color: #6f5d53;
          font-size: 11.5px;
          font-weight: 950;
          text-align: center;
        }

        .checkout-card-v21,
        .checkout-form-v21 {
          padding: 14px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 14px 30px rgba(77, 55, 38, 0.08);
        }

        .checkout-card-title {
          display: grid;
          gap: 3px;
          margin-bottom: 12px;
        }

        .checkout-card-title p {
          margin: 0;
          color: var(--accent);
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .checkout-card-title h3 {
          margin: 0;
          color: var(--ink);
          font-size: 20px;
          font-weight: 1000;
          letter-spacing: -0.05em;
        }

        .checkout-card-title span {
          color: var(--muted);
          font-size: 12.5px;
          font-weight: 800;
          line-height: 1.55;
        }

        .checkout-items-v21 {
          gap: 10px !important;
        }

        .checkout-item-v21 {
          display: grid !important;
          grid-template-columns: 68px 1fr auto;
          align-items: center;
          gap: 10px !important;
          padding: 10px !important;
          border-radius: 20px !important;
          background: #fffaf6 !important;
        }

        .checkout-item-image {
          display: grid;
          place-items: center;
          width: 68px;
          height: 68px;
          overflow: hidden;
          border: 1px solid rgba(232, 214, 198, 0.9);
          border-radius: 16px;
          background: #fff;
        }

        .checkout-item-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 5px;
        }

        .checkout-item-image span {
          padding: 6px;
          color: var(--muted);
          font-size: 10px;
          font-weight: 900;
          text-align: center;
          line-height: 1.25;
        }

        .checkout-item-main {
          min-width: 0;
        }

        .checkout-item-main h3 {
          display: -webkit-box;
          margin: 3px 0 5px !important;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .checkout-quantity-v21 {
          flex-direction: column;
          gap: 5px !important;
        }

        .checkout-quantity-v21 button {
          width: 28px !important;
          height: 28px !important;
          background: #fff !important;
          box-shadow: inset 0 0 0 1px rgba(232, 214, 198, 0.9);
        }

        .checkout-free-shipping-card {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin: 12px 0;
          padding: 14px;
          border: 1px solid rgba(178, 65, 51, 0.14);
          border-radius: 22px;
          background:
            radial-gradient(circle at 96% 10%, rgba(178, 65, 51, 0.12), transparent 28%),
            linear-gradient(135deg, #fff8ef, #fff);
          box-shadow: 0 12px 26px rgba(77, 55, 38, 0.06);
        }

        .checkout-free-shipping-card p {
          margin: 0 0 3px;
          color: var(--accent);
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .checkout-free-shipping-card h3 {
          margin: 0 0 4px;
          color: var(--ink);
          font-size: 18px;
          font-weight: 1000;
          letter-spacing: -0.04em;
        }

        .checkout-free-shipping-card span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 820;
          line-height: 1.55;
        }

        .checkout-free-shipping-card > strong {
          align-self: flex-start;
          padding: 7px 9px;
          border-radius: 999px;
          background: var(--accent);
          color: #fff;
          font-size: 11px;
          font-weight: 1000;
          white-space: nowrap;
        }

        .checkout-line-flow {
          display: grid;
          gap: 5px;
          margin-bottom: 12px !important;
          padding: 12px 13px !important;
          border-style: solid !important;
          border-radius: 18px !important;
        }

        .checkout-line-flow strong {
          color: var(--accent-dark);
          font-size: 14px;
          font-weight: 1000;
        }

        .checkout-line-flow span {
          color: #746257;
          font-size: 12.5px;
          font-weight: 850;
          line-height: 1.6;
        }

        .checkout-field-grid {
          display: grid;
          gap: 10px;
        }

        .checkout-field-full {
          grid-column: 1 / -1;
        }

        .checkout-submit-v21 {
          margin-top: 12px !important;
          font-size: 15px !important;
        }

        .checkout-empty-v21 {
          padding: 34px 18px !important;
          border: 1px dashed rgba(178, 65, 51, 0.22);
          border-radius: 24px;
          background: #fffaf6;
        }

        .commerce-detail-content-v21 {
          padding: 16px 16px 96px !important;
        }

        .commerce-detail-title-v21 {
          margin-top: 2px;
        }

        .detail-commerce-badge-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .detail-commerce-badge {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 6px 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: #fff;
          font-size: 11px;
          font-weight: 1000;
          box-shadow: 0 8px 18px rgba(178, 65, 51, 0.18);
        }

        .commerce-detail-tags-v21 {
          margin-top: 10px !important;
        }

        .detail-buybox-v21 {
          display: grid;
          gap: 12px;
          margin-top: 14px;
          padding: 15px;
          border: 1px solid rgba(178, 65, 51, 0.15);
          border-radius: 24px;
          background:
            radial-gradient(circle at 94% 0%, rgba(178, 65, 51, 0.12), transparent 32%),
            linear-gradient(135deg, #fff8ef, #fff);
          box-shadow: 0 16px 32px rgba(77, 55, 38, 0.08);
        }

        .detail-buybox-v21 p {
          margin: 0 0 5px;
          color: var(--accent);
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .detail-buybox-v21 .original-price {
          display: block;
          margin-bottom: 2px !important;
        }

        .detail-buybox-v21 strong.price {
          display: block;
          color: #c0352a !important;
          font-size: 30px !important;
          font-weight: 1000;
          letter-spacing: -0.055em;
          line-height: 1.08;
        }

        .detail-buybox-v21 em {
          display: block;
          margin-top: 7px;
          color: var(--muted);
          font-size: 12.5px;
          font-style: normal;
          font-weight: 800;
          line-height: 1.55;
        }

        .detail-buybox-button-v21 {
          position: static !important;
          bottom: auto !important;
          margin-top: 0 !important;
          min-height: 48px !important;
        }

        .commerce-summary-v21 {
          margin-top: 12px !important;
        }

        .detail-service-grid-v21 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 12px;
        }

        .detail-service-grid-v21 div {
          display: grid;
          gap: 4px;
          min-height: 68px;
          padding: 10px 7px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 18px;
          background: #fff;
          text-align: center;
          box-shadow: 0 10px 22px rgba(77, 55, 38, 0.05);
        }

        .detail-service-grid-v21 strong {
          color: var(--ink);
          font-size: 12.5px;
          font-weight: 1000;
        }

        .detail-service-grid-v21 span {
          color: var(--muted);
          font-size: 11px;
          font-weight: 850;
          line-height: 1.35;
        }

        .detail-info-block {
          box-shadow: 0 10px 24px rgba(77, 55, 38, 0.05);
        }

        .detail-info-block.soft {
          background:
            linear-gradient(135deg, #fff8ef, #fff) !important;
          border-style: solid !important;
        }

        @media (min-width: 560px) {
          .checkout-field-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 380px) {
          .checkout-item-v21 {
            grid-template-columns: 58px 1fr auto;
            gap: 8px !important;
          }

          .checkout-item-image {
            width: 58px;
            height: 58px;
          }

          .detail-service-grid-v21,
          .checkout-step-strip {
            grid-template-columns: 1fr;
          }

          .detail-buybox-v21 strong.price {
            font-size: 25px !important;
          }
        }


        /* Commerce V2.2：導購動線 + 分類頁 + 搜尋 + 推薦升級 */
        .search-hot-panel-v22 {
          display: grid;
          gap: 12px;
          margin: 12px 0 16px;
          padding: 14px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 22px;
          background: linear-gradient(135deg, #fff8ef, #fff);
          box-shadow: 0 12px 26px rgba(77, 55, 38, 0.07);
        }

        .search-hot-panel-v22 strong {
          display: block;
          margin-bottom: 4px;
          color: var(--ink);
          font-size: 16px;
          font-weight: 1000;
          letter-spacing: -0.04em;
        }

        .search-hot-panel-v22 span {
          color: var(--muted);
          font-size: 12.5px;
          font-weight: 820;
          line-height: 1.55;
        }

        .search-hot-chip-row-v22 {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none;
        }

        .search-hot-chip-row-v22::-webkit-scrollbar {
          display: none;
        }

        .search-hot-chip-row-v22 button {
          flex: 0 0 auto;
          min-height: 36px;
          padding: 8px 12px;
          border: 1px solid rgba(178, 65, 51, 0.18);
          border-radius: 999px;
          background: #fff;
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 1000;
        }

        .collection-page-v22 {
          background:
            linear-gradient(180deg, rgba(255, 250, 246, 0.98), #fff) !important;
        }

        .collection-head-v22 {
          position: sticky;
          top: 0;
          z-index: 6;
          margin: -18px -18px 12px;
          padding: 16px 18px;
          border-bottom: 1px solid rgba(232, 214, 198, 0.95);
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(18px);
        }

        .collection-hero-v22 {
          position: relative;
          overflow: hidden;
          display: grid;
          gap: 14px;
          margin-bottom: 12px;
          padding: 18px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 28px;
          background:
            radial-gradient(circle at 94% 8%, rgba(178, 65, 51, 0.13), transparent 30%),
            linear-gradient(135deg, #fff8ef, #fff);
          box-shadow: 0 16px 34px rgba(77, 55, 38, 0.09);
        }

        .collection-hero-v22 p,
        .collection-featured-strip-v22 p {
          margin: 0;
          color: var(--accent);
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .collection-hero-v22 h2 {
          margin: 4px 0 6px;
          color: var(--ink);
          font-size: 27px;
          font-weight: 1000;
          letter-spacing: -0.065em;
          line-height: 1.15;
        }

        .collection-hero-v22 span {
          color: var(--muted);
          font-size: 13px;
          font-weight: 840;
          line-height: 1.65;
        }

        .collection-stat-grid-v22 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .collection-stat-grid-v22 div {
          display: grid;
          gap: 4px;
          min-height: 66px;
          padding: 10px 8px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: inset 0 0 0 1px rgba(232, 214, 198, 0.82);
          text-align: center;
        }

        .collection-stat-grid-v22 strong {
          overflow: hidden;
          color: var(--ink);
          font-size: 17px;
          font-weight: 1000;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .collection-stat-grid-v22 span {
          color: var(--muted);
          font-size: 11px;
          font-weight: 900;
        }

        .collection-filter-panel-v22 {
          display: grid;
          gap: 10px;
          margin-bottom: 12px;
          padding: 13px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 12px 26px rgba(77, 55, 38, 0.06);
        }

        .collection-filter-title-v22 {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: end;
        }

        .collection-filter-title-v22 strong {
          color: var(--ink);
          font-size: 16px;
          font-weight: 1000;
          letter-spacing: -0.04em;
        }

        .collection-filter-title-v22 span {
          color: var(--muted);
          font-size: 11.5px;
          font-weight: 820;
          text-align: right;
        }

        .collection-chip-row-v22 {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none;
        }

        .collection-chip-row-v22::-webkit-scrollbar {
          display: none;
        }

        .collection-chip-row-v22 button {
          flex: 0 0 auto;
          min-height: 36px;
          padding: 8px 12px;
          border: 1px solid rgba(178, 65, 51, 0.16);
          border-radius: 999px;
          background: #fffaf6;
          color: #6f5d53;
          font-size: 12px;
          font-weight: 1000;
        }

        .collection-chip-row-v22 button.active {
          border-color: transparent;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: #fff;
          box-shadow: 0 9px 18px rgba(178, 65, 51, 0.18);
        }

        .collection-chip-row-v22.skin button {
          background: #f8f2ed;
        }

        .collection-featured-strip-v22 {
          display: grid;
          gap: 10px;
          margin-bottom: 14px;
          padding: 13px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 24px;
          background: linear-gradient(135deg, #fff, #fff8ef);
          box-shadow: 0 12px 26px rgba(77, 55, 38, 0.06);
        }

        .collection-featured-strip-v22 h3 {
          margin: 2px 0 0;
          color: var(--ink);
          font-size: 18px;
          font-weight: 1000;
          letter-spacing: -0.04em;
        }

        .collection-featured-list-v22 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .collection-featured-list-v22 button {
          display: grid;
          gap: 7px;
          justify-items: center;
          min-height: 116px;
          padding: 8px;
          border: 1px solid rgba(232, 214, 198, 0.9);
          border-radius: 18px;
          background: #fff;
          color: var(--ink);
          text-align: center;
        }

        .collection-featured-list-v22 img,
        .collection-featured-list-v22 span {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          object-fit: contain;
          border-radius: 15px;
          background: #fffaf6;
        }

        .collection-featured-list-v22 strong {
          display: -webkit-box;
          overflow: hidden;
          color: var(--ink);
          font-size: 11.5px;
          font-weight: 950;
          line-height: 1.35;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .collection-grid-v22 {
          padding-bottom: 24px;
        }

        .collection-empty-v22 {
          display: grid;
          gap: 10px;
          justify-items: center;
        }

        .collection-empty-v22 button {
          min-height: 42px;
          padding: 9px 14px;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: #fff;
          font-size: 13px;
          font-weight: 1000;
        }

        .related-heading-v22 span {
          color: var(--accent-dark) !important;
          font-weight: 900 !important;
        }

        .related-products-v22 {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 10px !important;
        }

        .related-products-v22 .related-card {
          min-height: 156px !important;
          padding: 10px !important;
          border: 1px solid rgba(232, 214, 198, 0.95) !important;
          border-radius: 20px !important;
          background: #fff !important;
          box-shadow: 0 10px 22px rgba(77, 55, 38, 0.06) !important;
        }

        .related-products-v22 .related-image {
          height: 82px !important;
          border-radius: 16px !important;
          background: #fffaf6 !important;
        }

        .related-products-v22 strong {
          display: -webkit-box;
          overflow: hidden;
          min-height: 34px;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .checkout-upsell-card-v22 {
          margin: 12px 0;
          padding: 14px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 12px 26px rgba(77, 55, 38, 0.06);
        }

        .checkout-upsell-list-v22 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .checkout-upsell-list-v22 button {
          display: grid;
          grid-template-columns: 52px 1fr;
          grid-template-rows: auto auto;
          align-items: center;
          column-gap: 9px;
          min-height: 76px;
          padding: 8px;
          border: 1px solid rgba(232, 214, 198, 0.9);
          border-radius: 18px;
          background: #fffaf6;
          text-align: left;
        }

        .checkout-upsell-list-v22 img,
        .checkout-upsell-list-v22 > button > span {
          grid-row: 1 / 3;
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          object-fit: contain;
          border-radius: 14px;
          background: #fff;
          color: var(--muted);
          font-size: 10px;
          font-weight: 900;
          text-align: center;
        }

        .checkout-upsell-list-v22 strong {
          display: -webkit-box;
          overflow: hidden;
          color: var(--ink);
          font-size: 12px;
          font-weight: 1000;
          line-height: 1.35;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .checkout-upsell-list-v22 em {
          color: #c0352a;
          font-size: 11.5px;
          font-style: normal;
          font-weight: 1000;
        }

        @media (max-width: 380px) {
          .collection-stat-grid-v22,
          .collection-featured-list-v22 {
            grid-template-columns: 1fr;
          }

          .checkout-upsell-list-v22 {
            grid-template-columns: 1fr;
          }

          .related-products-v22 {
            grid-template-columns: 1fr !important;
          }
        }


        /* Commerce V2.3：上線前精修 + 轉換率優化 */
        .site-shell {
          background:
            radial-gradient(circle at 50% -10%, rgba(178, 65, 51, 0.06), transparent 34%),
            linear-gradient(180deg, #fffaf6 0%, #fff 44%, #fffaf6 100%) !important;
        }

        .commerce-product-card {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          min-height: 455px !important;
        }

        .home-product-grid,
        .collection-product-grid,
        .collection-grid-v22 {
          align-items: stretch !important;
        }

        .commerce-product-card .product-image {
          flex: 0 0 auto !important;
          min-height: 178px !important;
          max-height: 205px !important;
        }

        .commerce-product-card .product-info {
          display: flex !important;
          flex: 1 1 auto !important;
          flex-direction: column !important;
          min-height: 242px !important;
        }

        .commerce-product-card .tag-row {
          flex-wrap: wrap !important;
          align-content: flex-start !important;
        }

        .commerce-product-card .commerce-price-block {
          min-height: 50px !important;
        }

        .commerce-product-card .commerce-card-actions {
          margin-top: auto !important;
        }

        .product-info h3 {
          display: -webkit-box !important;
          overflow: hidden !important;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .commerce-product-card .product-info .description {
          -webkit-line-clamp: 2 !important;
        }

        .price.inquiry,
        .search-result-price strong:has(+ span) {
          letter-spacing: -0.03em !important;
        }

        .price.inquiry {
          color: #6f5d53 !important;
          font-size: 16px !important;
        }

        .image-load-failed {
          position: relative !important;
          display: grid !important;
          place-items: center !important;
          background:
            linear-gradient(135deg, #fff8ef, #fff) !important;
        }

        .image-load-failed::after {
          content: "圖片更新中";
          display: grid;
          place-items: center;
          width: calc(100% - 28px);
          min-width: calc(100% - 28px);
          height: calc(100% - 28px);
          border: 1px dashed rgba(178, 65, 51, 0.22);
          border-radius: 18px;
          color: #9a8378;
          font-size: 13px;
          font-weight: 1000;
          letter-spacing: 0.04em;
        }

        .image-placeholder,
        .detail-placeholder,
        .search-result-placeholder {
          border: 1px dashed rgba(178, 65, 51, 0.22) !important;
          background:
            linear-gradient(135deg, #fff8ef, #fff) !important;
          color: #9a8378 !important;
        }

        .image-placeholder strong,
        .detail-placeholder strong {
          color: #9a8378 !important;
        }

        .commerce-trust-flow-v23 {
          margin: 14px 0 14px;
          padding: 15px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 26px;
          background:
            radial-gradient(circle at 94% 8%, rgba(178, 65, 51, 0.10), transparent 28%),
            linear-gradient(135deg, #fff, #fff8ef);
          box-shadow: 0 14px 30px rgba(77, 55, 38, 0.08);
        }

        .trust-flow-title-v23 {
          display: grid;
          gap: 4px;
          margin-bottom: 12px;
        }

        .trust-flow-title-v23 p {
          margin: 0;
          color: var(--accent);
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .trust-flow-title-v23 h2 {
          margin: 0;
          color: var(--ink);
          font-size: 22px;
          font-weight: 1000;
          letter-spacing: -0.055em;
        }

        .trust-flow-title-v23 span {
          color: var(--muted);
          font-size: 12.5px;
          font-weight: 850;
          line-height: 1.55;
        }

        .trust-flow-steps-v23 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .trust-flow-steps-v23 div {
          display: grid;
          gap: 5px;
          min-height: 108px;
          padding: 10px 8px;
          border: 1px solid rgba(232, 214, 198, 0.92);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.78);
        }

        .trust-flow-steps-v23 strong {
          width: fit-content;
          padding: 0;
          border-radius: 0;
          background: transparent;
          color: var(--accent);
          font-size: 13px;
          font-weight: 1000;
          letter-spacing: 0.04em;
        }

        .trust-flow-steps-v23 span {
          color: var(--ink);
          font-size: 13px;
          font-weight: 1000;
          line-height: 1.2;
        }

        .trust-flow-steps-v23 p {
          margin: 0;
          color: var(--muted);
          font-size: 11px;
          font-weight: 820;
          line-height: 1.45;
        }

        .checkout-assurance-grid-v23 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin: 0 0 12px;
        }

        .checkout-assurance-grid-v23 div {
          display: grid;
          gap: 4px;
          min-height: 70px;
          padding: 10px 8px;
          border: 1px solid rgba(232, 214, 198, 0.92);
          border-radius: 17px;
          background: #fffaf6;
          text-align: center;
        }

        .checkout-assurance-grid-v23 strong {
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 1000;
          line-height: 1.25;
        }

        .checkout-assurance-grid-v23 span {
          color: var(--muted);
          font-size: 10.5px;
          font-weight: 850;
          line-height: 1.35;
        }

        .order-form-note {
          padding: 10px 12px !important;
          border: 1px solid rgba(178, 65, 51, 0.12) !important;
          border-radius: 16px !important;
          background: #fff8ef !important;
          color: #705d52 !important;
          font-weight: 850 !important;
          line-height: 1.65 !important;
        }

        .detail-buybox-v21,
        .checkout-free-shipping-card,
        .checkout-upsell-card-v22,
        .collection-hero-v22,
        .collection-filter-panel-v22,
        .search-hot-panel-v22 {
          box-shadow: 0 14px 30px rgba(77, 55, 38, 0.07) !important;
        }

        .search-result-card,
        .related-card,
        .checkout-item-v21 {
          box-shadow: 0 10px 22px rgba(77, 55, 38, 0.055) !important;
        }

        .search-back-button,
        .detail-close,
        .cart-close {
          touch-action: manipulation;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        @media (max-width: 520px) {
          .trust-flow-steps-v23 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .checkout-assurance-grid-v23 {
            grid-template-columns: 1fr;
          }

          .commerce-product-card {
            min-height: 438px !important;
          }

          .commerce-product-card .product-image {
            min-height: 160px !important;
          }

          .commerce-product-card .product-info {
            min-height: 246px !important;
          }
        }

        @media (max-width: 370px) {
          .trust-flow-steps-v23 {
            grid-template-columns: 1fr;
          }

          .commerce-product-card {
            min-height: 420px !important;
          }

          .commerce-product-card .product-image {
            min-height: 150px !important;
          }

          .commerce-product-card .product-info {
            min-height: 238px !important;
          }
        }


        /* Commerce V2.4：首頁吸引力重做版 */
        .announcement-bar {
          background: linear-gradient(90deg, #341d18, #a2362b, #6f211c) !important;
          font-size: 12px !important;
          letter-spacing: 0.04em !important;
        }

        .campaign-hero-v24 {
          position: relative;
          overflow: hidden;
          display: grid;
          gap: 16px;
          margin: 12px 0 12px;
          padding: 20px 18px 16px;
          border: 1px solid rgba(236, 202, 174, 0.95);
          border-radius: 30px;
          background:
            radial-gradient(circle at 88% 16%, rgba(255, 217, 164, 0.42), transparent 24%),
            radial-gradient(circle at 98% 86%, rgba(178, 65, 51, 0.18), transparent 30%),
            linear-gradient(135deg, #fff8ed 0%, #fff 44%, #f2d9c8 100%);
          box-shadow: 0 20px 46px rgba(87, 48, 34, 0.16);
        }

        .campaign-hero-v24::before {
          content: "SALE";
          position: absolute;
          right: -18px;
          top: 16px;
          transform: rotate(12deg);
          color: rgba(178, 65, 51, 0.08);
          font-size: 74px;
          font-weight: 1000;
          letter-spacing: -0.08em;
          pointer-events: none;
        }

        .campaign-copy-v24 {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 8px;
        }

        .campaign-eyebrow-v24 {
          width: fit-content;
          margin: 0;
          padding: 7px 11px;
          border: 1px solid rgba(178, 65, 51, 0.20);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.76);
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 1000;
          letter-spacing: 0.10em;
        }

        .campaign-copy-v24 h2 {
          margin: 0;
          color: #2c211d;
          font-size: 34px;
          font-weight: 1000;
          line-height: 1.02;
          letter-spacing: -0.085em;
        }

        .campaign-copy-v24 > strong {
          display: inline-flex;
          width: fit-content;
          padding: 7px 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, #b53b30, #7c251f);
          color: #fff;
          font-size: 13px;
          font-weight: 1000;
          box-shadow: 0 10px 20px rgba(178, 65, 51, 0.22);
        }

        .campaign-copy-v24 > span {
          max-width: 390px;
          color: #66544c;
          font-size: 13px;
          font-weight: 850;
          line-height: 1.65;
        }

        .campaign-hero-actions-v24 {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 10px;
          margin-top: 4px;
        }

        .campaign-deal-board-v24 {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .campaign-board-sticker-v24 {
          position: absolute;
          z-index: 5;
          right: 10px;
          top: -10px;
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border: 2px solid #fff;
          border-radius: 50%;
          background: linear-gradient(135deg, #f7c46a, #b53b30);
          color: #fff;
          font-size: 11px;
          font-weight: 1000;
          box-shadow: 0 10px 18px rgba(101, 52, 30, 0.22);
        }

        .campaign-deal-card-v24 {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: 74px 1fr;
          gap: 9px;
          min-height: 96px;
          padding: 9px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 12px 24px rgba(77, 55, 38, 0.08);
        }

        .campaign-deal-card-v24.deal-1 {
          grid-column: 1 / -1;
          grid-template-columns: 96px 1fr;
          min-height: 118px;
          border-color: rgba(178, 65, 51, 0.23);
          background: linear-gradient(135deg, #fff, #fff1e8);
        }

        .campaign-deal-image-v24 {
          display: grid;
          place-items: center;
          width: 100%;
          min-height: 74px;
          overflow: hidden;
          border: 0;
          border-radius: 16px;
          background: #fffaf6;
        }

        .campaign-deal-card-v24.deal-1 .campaign-deal-image-v24 {
          min-height: 96px;
        }

        .campaign-deal-image-v24 img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
        }

        .campaign-deal-image-v24 > span {
          color: #a48b7e;
          font-size: 10px;
          font-weight: 950;
        }

        .campaign-deal-info-v24 {
          display: grid;
          align-content: center;
          gap: 5px;
          min-width: 0;
        }

        .campaign-deal-info-v24 span {
          width: fit-content;
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(178, 65, 51, 0.10);
          color: var(--accent-dark);
          font-size: 10px;
          font-weight: 1000;
        }

        .campaign-deal-info-v24 strong {
          display: -webkit-box;
          overflow: hidden;
          color: var(--ink);
          font-size: 13px;
          font-weight: 1000;
          line-height: 1.3;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .campaign-deal-card-v24.deal-1 strong {
          font-size: 16px;
        }

        .campaign-deal-info-v24 p {
          margin: 0;
          color: #c0352a;
          font-size: 13px;
          font-weight: 1000;
          line-height: 1.25;
        }

        .campaign-deal-card-v24.deal-1 p {
          font-size: 18px;
          letter-spacing: -0.04em;
        }

        .campaign-service-strip-v24 {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 7px;
        }

        .campaign-service-strip-v24 span {
          display: grid;
          place-items: center;
          min-height: 31px;
          padding: 7px 5px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.80);
          color: #674f45;
          font-size: 11px;
          font-weight: 1000;
          text-align: center;
          box-shadow: inset 0 0 0 1px rgba(232, 214, 198, 0.86);
        }

        .campaign-promo-rail-v24 {
          display: flex;
          gap: 10px;
          margin: 0 0 13px;
          overflow-x: auto;
          padding: 1px 1px 5px;
          scrollbar-width: none;
        }

        .campaign-promo-rail-v24::-webkit-scrollbar {
          display: none;
        }

        .campaign-promo-rail-v24 button {
          position: relative;
          flex: 0 0 132px;
          display: grid;
          gap: 5px;
          min-height: 72px;
          padding: 12px;
          overflow: hidden;
          border: 1px solid rgba(236, 202, 174, 0.95);
          border-radius: 20px;
          background: linear-gradient(135deg, #fff, #fff7ef);
          text-align: left;
          box-shadow: 0 12px 24px rgba(77, 55, 38, 0.07);
        }

        .campaign-promo-rail-v24 button::after {
          content: "";
          position: absolute;
          right: -18px;
          bottom: -20px;
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: rgba(178, 65, 51, 0.08);
        }

        .campaign-promo-rail-v24 strong {
          position: relative;
          z-index: 1;
          color: var(--ink);
          font-size: 15px;
          font-weight: 1000;
          letter-spacing: -0.04em;
        }

        .campaign-promo-rail-v24 span {
          position: relative;
          z-index: 1;
          color: var(--accent-dark);
          font-size: 11.5px;
          font-weight: 900;
          line-height: 1.35;
        }

        .campaign-spotlight-strip-v24 {
          display: grid;
          gap: 10px;
          margin: 0 0 14px;
          padding: 14px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 12px 26px rgba(77, 55, 38, 0.07);
        }

        .spotlight-title-v24 p {
          margin: 0 0 2px;
          color: var(--accent);
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .spotlight-title-v24 h3 {
          margin: 0;
          color: var(--ink);
          font-size: 19px;
          font-weight: 1000;
          letter-spacing: -0.05em;
        }

        .spotlight-list-v24 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .spotlight-list-v24 button {
          display: grid;
          gap: 5px;
          min-height: 92px;
          padding: 10px;
          border: 1px solid rgba(232, 214, 198, 0.92);
          border-radius: 18px;
          background: #fffaf6;
          text-align: left;
        }

        .spotlight-list-v24 span {
          width: fit-content;
          padding: 4px 7px;
          border-radius: 999px;
          background: rgba(178, 65, 51, 0.10);
          color: var(--accent-dark);
          font-size: 10px;
          font-weight: 1000;
        }

        .spotlight-list-v24 strong {
          display: -webkit-box;
          overflow: hidden;
          color: var(--ink);
          font-size: 13px;
          font-weight: 1000;
          line-height: 1.35;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .spotlight-list-v24 em {
          color: #c0352a;
          font-size: 12px;
          font-style: normal;
          font-weight: 1000;
        }

        .home-product-section#home-combo-products {
          margin-top: 12px !important;
          padding: 16px 0 4px !important;
          border-top: 1px solid rgba(232, 214, 198, 0.55);
        }

        .home-product-section#home-combo-products .section-heading.compact h2 {
          font-size: 28px !important;
        }

        .trust-flow-after-deals-v24 {
          margin-top: 16px !important;
        }

        .store-promo-stack {
          display: none !important;
        }

        @media (min-width: 560px) {
          .campaign-hero-v24 {
            grid-template-columns: 0.92fr 1.08fr;
            align-items: center;
          }

          .campaign-service-strip-v24 {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 380px) {
          .campaign-copy-v24 h2 {
            font-size: 29px;
          }

          .campaign-hero-actions-v24,
          .campaign-service-strip-v24,
          .spotlight-list-v24 {
            grid-template-columns: 1fr;
          }

          .campaign-deal-board-v24 {
            grid-template-columns: 1fr;
          }

          .campaign-deal-card-v24,
          .campaign-deal-card-v24.deal-1 {
            grid-column: auto;
            grid-template-columns: 72px 1fr;
            min-height: 96px;
          }

          .campaign-deal-card-v24.deal-1 .campaign-deal-image-v24 {
            min-height: 74px;
          }
        }


        /* Commerce V2.4.1：首屏爆品改以自家產品為主 */
        .campaign-hero-v24 {
          background:
            radial-gradient(circle at 88% 16%, rgba(255, 217, 164, 0.36), transparent 24%),
            radial-gradient(circle at 98% 86%, rgba(178, 65, 51, 0.14), transparent 30%),
            linear-gradient(135deg, #fffaf4 0%, #fff 42%, #f4dfd1 100%) !important;
        }

        .campaign-hero-v24::before {
          content: "BEST";
          right: -10px;
          top: 22px;
          font-size: 68px;
        }

        .campaign-copy-v24 h2 {
          max-width: 430px;
          font-size: 32px !important;
          line-height: 1.08 !important;
        }

        .campaign-copy-v24 > strong {
          background: linear-gradient(135deg, #9f2f27, #6f211c) !important;
        }

        .campaign-deal-board-v24 {
          align-items: stretch;
        }

        .campaign-deal-card-v24 {
          min-height: 118px !important;
          align-items: center;
        }

        .campaign-deal-card-v24.deal-1 {
          min-height: 132px !important;
        }

        .campaign-deal-image-v24 {
          min-height: 86px !important;
          background: linear-gradient(135deg, #fff, #fff8ef) !important;
        }

        .campaign-deal-card-v24.deal-1 .campaign-deal-image-v24 {
          min-height: 104px !important;
        }

        .campaign-deal-info-v24 strong {
          font-size: 14px !important;
        }

        .campaign-deal-card-v24.deal-1 strong {
          font-size: 18px !important;
        }

        .campaign-deal-info-v24 p {
          color: #b72f28 !important;
        }

        .campaign-promo-rail-v24 button:first-child {
          border-color: rgba(178, 65, 51, 0.26);
          background:
            radial-gradient(circle at 92% 10%, rgba(178, 65, 51, 0.12), transparent 28%),
            linear-gradient(135deg, #fff, #fff2eb);
        }

        .spotlight-list-v24 button {
          background: linear-gradient(135deg, #fff, #fff8ef) !important;
        }

        @media (max-width: 380px) {
          .campaign-copy-v24 h2 {
            font-size: 27px !important;
          }

          .campaign-deal-card-v24,
          .campaign-deal-card-v24.deal-1 {
            min-height: 108px !important;
          }
        }


        /* Commerce V2.4.2：爆品區新版，一大卡 + 兩中卡 + 組合價 + 系列入口 */
        .best-hero-v242 {
          position: relative;
          overflow: hidden;
          display: grid;
          gap: 16px;
          margin: 12px 0;
          padding: 20px 18px 18px;
          border: 1px solid rgba(236, 202, 174, 0.95);
          border-radius: 30px;
          background:
            radial-gradient(circle at 92% 14%, rgba(178, 65, 51, 0.12), transparent 28%),
            radial-gradient(circle at 5% 100%, rgba(255, 217, 164, 0.38), transparent 30%),
            linear-gradient(135deg, #fffaf4 0%, #fff 45%, #f4dfd1 100%);
          box-shadow: 0 20px 46px rgba(87, 48, 34, 0.15);
        }

        .best-hero-v242::before {
          content: "BEST";
          position: absolute;
          right: -8px;
          top: 16px;
          transform: rotate(10deg);
          color: rgba(178, 65, 51, 0.07);
          font-size: 72px;
          font-weight: 1000;
          letter-spacing: -0.08em;
          pointer-events: none;
        }

        .best-hero-copy-v242 {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 9px;
        }

        .best-hero-eyebrow-v242 {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          width: fit-content;
          max-width: 100%;
          margin: 0 0 7px;
          padding: 10px 18px 11px;
          border: 1px solid rgba(178, 65, 51, 0.25);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.94);
          color: #8f2f2a;
          white-space: nowrap;
          box-shadow: 0 10px 22px rgba(178, 65, 51, 0.10);
        }

        .best-hero-eyebrow-v242 span,
        .best-hero-eyebrow-v242 strong {
          display: inline-block;
          color: #8f2f2a;
          font-size: clamp(22px, 6.2vw, 30px);
          font-weight: 1000;
          line-height: 1;
          white-space: nowrap;
        }

        .best-hero-eyebrow-v242 span {
          letter-spacing: 0.02em;
        }

        .best-hero-eyebrow-v242 strong {
          margin-top: 0;
          letter-spacing: -0.025em;
        }

        .best-hero-copy-v242 h2 {
          margin: 0;
          color: #2c211d;
          font-size: 23px;
          font-weight: 1000;
          line-height: 1.16;
          letter-spacing: -0.04em;
        }

        .best-hero-copy-v242 > strong {
          color: #9f2f27;
          font-size: 15px;
          font-weight: 1000;
          line-height: 1.35;
        }

        .best-hero-copy-v242 > span {
          color: #68564d;
          font-size: 13px;
          font-weight: 850;
          line-height: 1.65;
        }

        .best-tag-row-v242 {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .best-tag-row-v242 span {
          padding: 6px 9px;
          border-radius: 999px;
          background: rgba(178, 65, 51, 0.09);
          color: var(--accent-dark);
          font-size: 11px;
          font-weight: 1000;
        }

        .best-hero-actions-v242 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 3px;
        }

        .best-hero-image-card-v242 {
          position: relative;
          z-index: 2;
          display: grid;
          place-items: center;
          gap: 8px;
          min-height: 260px;
          padding: 18px;
          overflow: hidden;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 16px 32px rgba(77, 55, 38, 0.10);
        }

        .best-hero-image-card-v242 img {
          width: 100%;
          height: 218px;
          object-fit: contain;
        }

        .best-top-badge-v242 {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 7px 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, #b53b30, #7c251f);
          color: #fff;
          font-size: 11px;
          font-weight: 1000;
          box-shadow: 0 9px 18px rgba(178, 65, 51, 0.20);
        }

        .best-hero-image-card-v242 > strong {
          color: #b72f28;
          font-size: 18px;
          font-weight: 1000;
          line-height: 1.2;
          text-align: center;
        }

        .best-image-placeholder-v242 {
          display: grid;
          place-items: center;
          width: 100%;
          height: 218px;
          border: 1px dashed rgba(178, 65, 51, 0.24);
          border-radius: 20px;
          color: #9a8378;
          font-size: 13px;
          font-weight: 1000;
        }

        .secondary-best-grid-v242 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin: 0 0 14px;
        }

        .secondary-best-card-v242 {
          overflow: hidden;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 14px 28px rgba(77, 55, 38, 0.08);
        }

        .secondary-best-image-v242 {
          display: grid;
          place-items: center;
          width: 100%;
          min-height: 142px;
          padding: 12px;
          border: 0;
          border-bottom: 1px solid rgba(232, 214, 198, 0.82);
          background: linear-gradient(135deg, #fff, #fff8ef);
        }

        .secondary-best-image-v242 img {
          width: 100%;
          height: 126px;
          object-fit: contain;
        }

        .secondary-best-image-v242 span {
          color: #9a8378;
          font-size: 12px;
          font-weight: 1000;
        }

        .secondary-best-card-v242 > div {
          display: grid;
          gap: 6px;
          padding: 12px;
        }

        .secondary-best-card-v242 > div > span,
        .combo-showcase-list-v242 span {
          width: fit-content;
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(178, 65, 51, 0.09);
          color: var(--accent-dark);
          font-size: 10.5px;
          font-weight: 1000;
        }

        .secondary-best-card-v242 h3 {
          display: -webkit-box;
          min-height: 40px;
          margin: 0;
          overflow: hidden;
          color: var(--ink);
          font-size: 15px;
          font-weight: 1000;
          line-height: 1.34;
          letter-spacing: -0.04em;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .secondary-best-card-v242 p {
          display: -webkit-box;
          min-height: 34px;
          margin: 0;
          overflow: hidden;
          color: var(--muted);
          font-size: 12px;
          font-weight: 820;
          line-height: 1.45;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .secondary-best-card-v242 strong {
          color: #b72f28;
          font-size: 15px;
          font-weight: 1000;
        }

        .secondary-best-card-v242 button:not(.secondary-best-image-v242) {
          min-height: 36px;
          border: 1px solid rgba(178, 65, 51, 0.18);
          border-radius: 999px;
          background: #fff;
          color: var(--accent-dark);
          font-size: 12px;
          font-weight: 1000;
        }

        .combo-showcase-v242,
        .series-entry-section-v242 {
          margin: 0 0 14px;
          padding: 14px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 26px;
          background: #fff;
          box-shadow: 0 14px 30px rgba(77, 55, 38, 0.07);
        }

        .combo-showcase-head-v242,
        .series-entry-head-v242 {
          display: grid;
          gap: 4px;
          margin-bottom: 12px;
        }

        .combo-showcase-head-v242 p,
        .series-entry-head-v242 p {
          margin: 0;
          color: var(--accent);
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .combo-showcase-head-v242 h2,
        .series-entry-head-v242 h2 {
          margin: 0;
          color: var(--ink);
          font-size: 23px;
          font-weight: 1000;
          letter-spacing: -0.055em;
        }

        .combo-showcase-head-v242 span,
        .series-entry-head-v242 span {
          color: var(--muted);
          font-size: 12.5px;
          font-weight: 840;
          line-height: 1.55;
        }

        .combo-showcase-list-v242 {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }

        .combo-showcase-list-v242::-webkit-scrollbar {
          display: none;
        }

        .combo-feature-card-v242,
        .combo-mini-card-v242 {
          flex: 0 0 250px;
          display: grid;
          grid-template-columns: 92px 1fr;
          gap: 10px;
          align-items: center;
          min-height: 124px;
          padding: 10px;
          border: 1px solid rgba(232, 214, 198, 0.92);
          border-radius: 22px;
          background: linear-gradient(135deg, #fff, #fff8ef);
        }

        .combo-feature-card-v242 {
          flex-basis: 300px;
          border-color: rgba(178, 65, 51, 0.20);
        }

        .combo-showcase-list-v242 button {
          display: grid;
          place-items: center;
          width: 92px;
          height: 92px;
          overflow: hidden;
          border: 0;
          border-radius: 17px;
          background: #fff;
        }

        .combo-showcase-list-v242 img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
        }

        .combo-showcase-list-v242 button > span {
          color: #9a8378;
          font-size: 11px;
          font-weight: 1000;
        }

        .combo-showcase-list-v242 div {
          display: grid;
          gap: 5px;
          min-width: 0;
        }

        .combo-showcase-list-v242 h3 {
          display: -webkit-box;
          margin: 0;
          overflow: hidden;
          color: var(--ink);
          font-size: 14px;
          font-weight: 1000;
          line-height: 1.34;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .combo-showcase-list-v242 p {
          display: -webkit-box;
          margin: 0;
          overflow: hidden;
          color: var(--muted);
          font-size: 11.5px;
          font-weight: 820;
          line-height: 1.4;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .combo-showcase-list-v242 strong {
          color: #b72f28;
          font-size: 14px;
          font-weight: 1000;
          line-height: 1.2;
        }

        .series-entry-grid-v242 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .series-entry-grid-v242 button {
          display: grid;
          gap: 7px;
          min-height: 166px;
          padding: 10px;
          border: 1px solid rgba(232, 214, 198, 0.92);
          border-radius: 20px;
          background: linear-gradient(135deg, #fff, #fff8ef);
          text-align: left;
        }

        .series-entry-grid-v242 button > div {
          display: grid;
          place-items: center;
          height: 78px;
          overflow: hidden;
          border-radius: 16px;
          background: #fff;
        }

        .series-entry-grid-v242 img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
        }

        .series-entry-grid-v242 button > div > span {
          color: #9a8378;
          font-size: 11px;
          font-weight: 1000;
        }

        .series-entry-grid-v242 strong {
          color: var(--ink);
          font-size: 14px;
          font-weight: 1000;
          letter-spacing: -0.03em;
        }

        .series-entry-grid-v242 p {
          margin: 0;
          color: var(--muted);
          font-size: 11.5px;
          font-weight: 820;
          line-height: 1.45;
        }

        .series-entry-grid-v242 em {
          color: var(--accent-dark);
          font-size: 11px;
          font-style: normal;
          font-weight: 1000;
        }

        .campaign-hero-v24,
        .campaign-promo-rail-v24,
        .campaign-spotlight-strip-v24 {
          display: none !important;
        }

        @media (min-width: 560px) {
          .best-hero-v242 {
            grid-template-columns: 1fr 0.86fr;
            align-items: center;
          }
        }

        @media (max-width: 380px) {
          .best-hero-eyebrow-v242 {
            padding: 9px 13px 10px;
            gap: 10px;
          }

          .best-hero-eyebrow-v242 span,
          .best-hero-eyebrow-v242 strong {
            font-size: clamp(21px, 6.4vw, 25px);
          }

          .best-hero-eyebrow-v242 span {
            letter-spacing: 0.01em;
          }

          .best-hero-copy-v242 h2 {
            font-size: 21px;
          }

          .best-hero-actions-v242,
          .secondary-best-grid-v242,
          .series-entry-grid-v242 {
            grid-template-columns: 1fr;
          }

          .best-hero-image-card-v242 {
            min-height: 220px;
          }

          .best-hero-image-card-v242 img,
          .best-image-placeholder-v242 {
            height: 176px;
          }

          .combo-feature-card-v242,
          .combo-mini-card-v242 {
            flex-basis: 260px;
          }
        }


        /* Commerce V2.4.3：系列入口圖片 + LINE QR 區塊修正 */
        .series-entry-section-v242 {
          padding: 14px !important;
        }

        .series-entry-grid-v242 {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 12px !important;
        }

        .series-entry-grid-v242 button {
          display: grid !important;
          grid-template-rows: auto auto auto auto !important;
          gap: 8px !important;
          min-height: 212px !important;
          padding: 12px !important;
          overflow: hidden !important;
        }

        .series-entry-grid-v242 button > div {
          width: 100% !important;
          height: 112px !important;
          overflow: hidden !important;
          border: 1px solid rgba(232, 214, 198, 0.86) !important;
          border-radius: 18px !important;
          background:
            linear-gradient(135deg, #fff, #fff8ef) !important;
        }

        .series-entry-grid-v242 img {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
          object-position: center center !important;
          padding: 8px !important;
          transform: none !important;
          filter: none !important;
          background: transparent !important;
        }

        .series-entry-grid-v242 strong {
          min-height: 22px !important;
          font-size: 15px !important;
          line-height: 1.25 !important;
        }

        .series-entry-grid-v242 p {
          display: -webkit-box !important;
          min-height: 34px !important;
          overflow: hidden !important;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .series-entry-grid-v242 em {
          margin-top: auto !important;
          width: fit-content !important;
          padding: 5px 8px !important;
          border-radius: 999px !important;
          background: rgba(178, 65, 51, 0.08) !important;
        }

        .footer-compact-v243 {
          margin-top: 22px !important;
          padding: 16px !important;
          border-radius: 24px !important;
          text-align: left !important;
        }

        .footer-line-main-v243 {
          display: grid;
          grid-template-columns: 1fr 104px;
          gap: 14px;
          align-items: center;
        }

        .footer-line-copy-v243 {
          min-width: 0;
        }

        .footer-line-copy-v243 p {
          margin: 0 0 4px;
          color: rgba(255, 255, 255, 0.66);
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .footer-line-copy-v243 h2 {
          margin: 0 0 7px !important;
          font-size: 20px !important;
          line-height: 1.2 !important;
          letter-spacing: -0.04em !important;
        }

        .footer-line-copy-v243 span {
          display: block;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.84);
          font-size: 13px;
          font-weight: 900;
        }

        .footer-compact-v243 .line-button {
          margin: 0 !important;
          min-height: 40px !important;
          padding: 9px 15px !important;
          font-size: 13px !important;
        }

        .line-qr-compact-v243 {
          width: 104px !important;
          height: 104px !important;
          margin: 0 !important;
          padding: 6px !important;
          overflow: hidden !important;
          border-radius: 18px !important;
          background: #fff !important;
        }

        .line-qr-compact-v243 img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center center !important;
          transform: scale(1.28) !important;
          transform-origin: center center !important;
        }

        .footer-compact-v243 .footer-note {
          margin: 13px 0 0 !important;
          color: rgba(255, 255, 255, 0.76) !important;
          font-size: 12.5px !important;
          line-height: 1.55 !important;
        }

        .footer-compact-v243 .footer-price-note {
          margin: 8px 0 0 !important;
          color: rgba(255, 255, 255, 0.52) !important;
          font-size: 11.5px !important;
          line-height: 1.55 !important;
        }

        @media (max-width: 380px) {
          .series-entry-grid-v242 {
            grid-template-columns: 1fr !important;
          }

          .series-entry-grid-v242 button {
            grid-template-columns: 112px 1fr !important;
            grid-template-rows: auto auto auto !important;
            align-items: center !important;
            min-height: 132px !important;
          }

          .series-entry-grid-v242 button > div {
            grid-row: 1 / 4;
            width: 112px !important;
            height: 112px !important;
          }

          .footer-line-main-v243 {
            grid-template-columns: 1fr 92px;
            gap: 12px;
          }

          .line-qr-compact-v243 {
            width: 92px !important;
            height: 92px !important;
          }
        }


        /* Commerce V2.4.3.1：修正最後 LINE QR 白色大方塊 */
        .footer.footer-compact-v243 {
          margin-top: 18px !important;
          padding: 14px !important;
          border: 1px solid rgba(132, 97, 76, 0.18) !important;
          border-radius: 26px !important;
          background: linear-gradient(135deg, #5a4034, #3f2d25) !important;
          color: #fff !important;
          text-align: left !important;
          box-shadow: 0 16px 34px rgba(66, 43, 31, 0.18) !important;
        }

        .footer-compact-v243 h2 {
          color: #fff !important;
        }

        .footer-line-main-v243 {
          grid-template-columns: 1fr 88px !important;
          gap: 12px !important;
          align-items: center !important;
        }

        .footer-line-copy-v243 p {
          color: rgba(255, 244, 238, 0.7) !important;
        }

        .footer-line-copy-v243 h2 {
          font-size: 18px !important;
          margin-bottom: 6px !important;
        }

        .footer-line-copy-v243 span {
          margin-bottom: 8px !important;
          color: rgba(255, 246, 240, 0.84) !important;
          font-size: 12.5px !important;
        }

        .footer-compact-v243 .line-button {
          display: inline-flex !important;
          width: fit-content !important;
          min-height: 38px !important;
          padding: 8px 14px !important;
          border-radius: 999px !important;
          background: #fff7f1 !important;
          color: #9d2f23 !important;
          box-shadow: none !important;
        }

        .line-qr-card.line-qr-compact-v243 {
          width: 88px !important;
          height: 88px !important;
          padding: 5px !important;
          border-radius: 18px !important;
          background: rgba(255, 255, 255, 0.96) !important;
          border: 1px solid rgba(214, 193, 181, 0.7) !important;
          box-shadow: none !important;
          justify-self: end !important;
        }

        .line-qr-card.line-qr-compact-v243 img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center center !important;
          transform: scale(1.18) !important;
          border-radius: 12px !important;
        }

        .footer-compact-v243 .footer-note {
          margin-top: 12px !important;
          color: rgba(255, 247, 241, 0.76) !important;
          font-size: 12px !important;
        }

        .footer-compact-v243 .footer-price-note {
          margin-top: 6px !important;
          color: rgba(255, 247, 241, 0.54) !important;
          font-size: 11px !important;
        }

        @media (max-width: 380px) {
          .footer.footer-compact-v243 {
            padding: 12px !important;
            border-radius: 22px !important;
          }

          .footer-line-main-v243 {
            grid-template-columns: 1fr 76px !important;
            gap: 10px !important;
          }

          .line-qr-card.line-qr-compact-v243 {
            width: 76px !important;
            height: 76px !important;
          }

          .footer-line-copy-v243 h2 {
            font-size: 17px !important;
          }
        }


        /* Commerce V2.4.4：LINE 訂單確認極簡整合版 */
        .line-confirm-section-v244 {
          margin: 18px 0 0 !important;
        }

        .line-confirm-card-v244 {
          display: grid;
          grid-template-columns: 1fr 104px;
          gap: 14px;
          align-items: center;
          padding: 16px;
          border: 1px solid rgba(132, 97, 76, 0.18);
          border-radius: 26px;
          background:
            radial-gradient(circle at 92% 12%, rgba(255, 223, 188, 0.12), transparent 24%),
            linear-gradient(135deg, #5a4034, #3f2d25);
          color: #fff;
          box-shadow: 0 16px 34px rgba(66, 43, 31, 0.18);
        }

        .line-confirm-copy-v244 {
          min-width: 0;
          display: grid;
          gap: 7px;
        }

        .line-confirm-copy-v244 p {
          margin: 0;
          color: rgba(255, 244, 238, 0.68);
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .line-confirm-copy-v244 h2 {
          margin: 0;
          color: #fff;
          font-size: 22px;
          font-weight: 1000;
          line-height: 1.16;
          letter-spacing: -0.05em;
        }

        .line-confirm-copy-v244 span {
          color: rgba(255, 247, 241, 0.80);
          font-size: 12.5px;
          font-weight: 820;
          line-height: 1.6;
        }

        .line-confirm-copy-v244 strong {
          color: #fff;
          font-size: 13px;
          font-weight: 1000;
        }

        .line-confirm-button-v244 {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
          min-height: 38px;
          padding: 8px 14px;
          border-radius: 999px;
          background: #fff7f1;
          color: #9d2f23;
          font-size: 13px;
          font-weight: 1000;
          text-decoration: none;
        }

        .line-confirm-qr-wrap-v244 {
          display: grid;
          justify-items: center;
          gap: 6px;
        }

        .line-confirm-qr-v244 {
          display: grid;
          place-items: center;
          width: 104px;
          height: 104px;
          padding: 6px;
          overflow: hidden;
          border: 1px solid rgba(214, 193, 181, 0.74);
          border-radius: 18px;
          background: #fff;
        }

        .line-confirm-qr-v244 img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          transform: scale(1.16);
          border-radius: 12px;
        }

        .line-confirm-qr-wrap-v244 > span {
          color: rgba(255, 247, 241, 0.74);
          font-size: 11px;
          font-weight: 900;
        }

        .line-confirm-rule-v244 {
          grid-column: 1 / -1;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 247, 241, 0.62);
          font-size: 11.5px;
          font-weight: 820;
          line-height: 1.45;
        }

        @media (max-width: 380px) {
          .line-confirm-card-v244 {
            grid-template-columns: 1fr 82px;
            gap: 10px;
            padding: 13px;
            border-radius: 22px;
          }

          .line-confirm-copy-v244 h2 {
            font-size: 19px;
          }

          .line-confirm-copy-v244 span {
            display: -webkit-box;
            overflow: hidden;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
          }

          .line-confirm-qr-v244 {
            width: 82px;
            height: 82px;
            border-radius: 16px;
          }

          .line-confirm-button-v244 {
            min-height: 36px;
            padding: 7px 12px;
            font-size: 12.5px;
          }
        }


        /* Commerce V2.4.5：商品頁售價卡移到配送提醒上方 */
        .detail-buybox-v21 {
          margin-top: 14px !important;
          margin-bottom: 12px !important;
        }

        .detail-info-block.soft {
          margin-top: 0 !important;
        }

        .detail-buybox-button-v21 {
          width: 100% !important;
        }


        /* Commerce V2.4.6：商品卡整張可點 + 手機返回鍵回商品列表 */
        .clickable-product-card-v246 {
          cursor: pointer;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .clickable-product-card-v246:active {
          transform: scale(0.985);
        }

        .clickable-product-card-v246 .product-image,
        .clickable-product-card-v246 .product-info h3,
        .clickable-product-card-v246 .description {
          pointer-events: none;
        }

        .clickable-product-card-v246 button,
        .clickable-product-card-v246 .combo-badge {
          pointer-events: auto;
        }

        .detail-close {
          cursor: pointer;
        }


        /* Commerce V2.5：前台購物分類手風琴選單 */
        .drawer-accordion-v25 {
          gap: 10px !important;
        }

        .drawer-category-intro-v25 {
          display: grid;
          gap: 4px;
          padding: 12px 13px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.72);
        }

        .drawer-category-intro-v25 strong {
          color: var(--ink);
          font-size: 16px;
          font-weight: 1000;
          letter-spacing: -0.04em;
        }

        .drawer-category-intro-v25 span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 820;
          line-height: 1.45;
        }

        .drawer-accordion-item-v25 {
          overflow: hidden;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 19px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 10px 24px rgba(77, 55, 38, 0.06);
        }

        .drawer-accordion-title-v25 {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          width: 100% !important;
          min-height: 52px !important;
          padding: 13px 14px !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          color: var(--ink) !important;
          text-align: left !important;
        }

        .drawer-accordion-title-v25 span {
          color: var(--ink);
          font-size: 16px;
          font-weight: 1000;
          letter-spacing: -0.035em;
        }

        .drawer-accordion-title-v25 em {
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(178, 65, 51, 0.08);
          color: var(--accent-dark);
          font-size: 11px;
          font-style: normal;
          font-weight: 1000;
        }

        .drawer-sublist-v25 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          padding: 0 12px 12px;
        }

        .drawer-sublist-v25 button {
          min-height: 40px;
          padding: 9px 11px;
          border: 1px solid rgba(232, 214, 198, 0.95);
          border-radius: 14px;
          background: #fffaf6;
          color: #5c473d;
          font-size: 13px;
          font-weight: 900;
          text-align: left;
        }

        .drawer-sublist-v25 button:active {
          transform: scale(0.985);
        }

        .collection-hero-v22 h2 {
          word-break: keep-all;
        }

        @media (max-width: 380px) {
          .drawer-sublist-v25 {
            grid-template-columns: 1fr;
          }
        }


        /* Commerce V2.5.1：分類小修定稿
           - 本月優惠移除買一送一 / 買一送二獨立分類
           - 保健食品補上魚油
        */


        /* Commerce V2.5.2：龍血商品資訊整理版
           - 已整理龍血玻尿酸保濕精華液
           - 已整理龍血求麗化妝水 / 精華 / 修護乳 / 修護霜
           - 商品卡加入買一送一、第二件五折等促銷標籤
        */


        /* Commerce V2.5.3.2：商品名稱放大 + 店名改為佐登城堡回購商城 */
        .brand-block h1,
        .top-header h1 {
          display: block !important;
          margin: 1px 0 1px !important;
          color: var(--accent) !important;
          font-size: clamp(17px, 4.5vw, 22px) !important;
          font-weight: 1000 !important;
          line-height: 1.08 !important;
          letter-spacing: -0.065em !important;
          white-space: nowrap !important;
        }

        .brand-block h1::before,
        .brand-block h1::after {
          content: none !important;
          display: none !important;
        }

        .product-info h3,
        .commerce-product-card .product-info h3,
        .featured-card.commerce-product-card .product-info h3 {
          min-height: 46px !important;
          font-size: 18px !important;
          font-weight: 1000 !important;
          line-height: 1.25 !important;
          letter-spacing: -0.045em !important;
        }

        @media (max-width: 420px) {
          .brand-block h1,
          .top-header h1 {
            font-size: 18px !important;
            letter-spacing: -0.075em !important;
          }

          .product-info h3,
          .commerce-product-card .product-info h3,
          .featured-card.commerce-product-card .product-info h3 {
            min-height: 44px !important;
            font-size: 17px !important;
          }
        }

        @media (max-width: 370px) {
          .brand-block h1,
          .top-header h1 {
            font-size: 16.5px !important;
            letter-spacing: -0.08em !important;
          }

          .product-info h3,
          .commerce-product-card .product-info h3,
          .featured-card.commerce-product-card .product-info h3 {
            min-height: 42px !important;
            font-size: 16.2px !important;
          }
        }




        /* V2.5.3.3：商品卡可讀性強化與圖片不裁切 */
        .product-card .product-image img,
        .featured-card .product-image img {
          object-fit: contain !important;
          transform: none !important;
          padding: 10px !important;
        }

        .product-info h3 {
          font-size: 18px !important;
          line-height: 1.28 !important;
          min-height: 48px !important;
        }

        .product-info .description {
          font-size: 13.4px !important;
          line-height: 1.45 !important;
          -webkit-line-clamp: 3 !important;
          min-height: 59px !important;
        }



        /* Commerce V2.5.3.5：Header Logo、公司資訊 Footer、商品卡文案精簡、加入清單文案統一 */
        .brand-logo-wrap {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(234, 219, 208, 0.9);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 8px 18px rgba(77, 55, 38, 0.08);
        }

        .brand-logo-wrap img {
          width: 42px;
          height: 42px;
          object-fit: contain;
          display: block;
        }

        .product-info .description,
        .commerce-product-card .product-info .description,
        .featured-info .description {
          font-size: 14.2px !important;
          line-height: 1.46 !important;
          font-weight: 800 !important;
          color: #7b6a60 !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          min-height: 42px !important;
          max-height: 42px !important;
        }

        .product-info h3,
        .commerce-product-card .product-info h3,
        .featured-card.commerce-product-card .product-info h3 {
          font-size: 19px !important;
          line-height: 1.24 !important;
          min-height: 48px !important;
          letter-spacing: -0.05em !important;
        }

        .company-footer-v2535 {
          margin: 26px 0 0;
          padding: 22px 18px 26px;
          border: 1px solid rgba(234, 219, 208, 0.95);
          border-radius: 28px 28px 0 0;
          background:
            radial-gradient(circle at top left, rgba(183, 138, 72, 0.13), transparent 36%),
            rgba(255, 250, 246, 0.96);
          box-shadow: 0 -12px 34px rgba(77, 55, 38, 0.08);
        }

        .company-footer-brand-v2535 {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(234, 219, 208, 0.95);
        }

        .company-footer-brand-v2535 img {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          border-radius: 18px;
          object-fit: contain;
          background: #fff;
          border: 1px solid rgba(234, 219, 208, 0.95);
          padding: 6px;
        }

        .company-footer-brand-v2535 p {
          margin: 0 0 3px;
          color: var(--gold);
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .company-footer-brand-v2535 h2 {
          margin: 0;
          color: var(--accent);
          font-size: 22px;
          line-height: 1.1;
          font-weight: 1000;
          letter-spacing: -0.06em;
        }

        .company-footer-brand-v2535 span {
          display: block;
          margin-top: 4px;
          color: var(--muted);
          font-size: 13px;
          font-weight: 800;
        }

        .company-info-grid-v2535 {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .company-info-grid-v2535 div {
          padding: 12px 13px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid rgba(234, 219, 208, 0.9);
        }

        .company-info-grid-v2535 span {
          display: block;
          margin-bottom: 3px;
          color: var(--gold);
          font-size: 12px;
          font-weight: 950;
        }

        .company-info-grid-v2535 strong {
          display: block;
          color: #5f4f46;
          font-size: 13.5px;
          line-height: 1.55;
          font-weight: 850;
        }

        .company-footer-note-v2535 {
          margin: 14px 2px 0;
          color: #9a897d;
          font-size: 12.5px;
          line-height: 1.65;
          font-weight: 750;
        }

        /* Commerce V2.5.3.13：LINE 綁定提示卡 */
        .line-bind-card-v25313 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 14px 0 16px;
          padding: 14px 15px;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(255, 250, 246, 0.96), rgba(255, 244, 236, 0.9));
          border: 1px solid rgba(234, 219, 208, 0.95);
          box-shadow: 0 10px 24px rgba(77, 55, 38, 0.06);
        }

        .line-bind-card-v25313 div {
          min-width: 0;
        }

        .line-bind-card-v25313 span {
          display: block;
          margin-bottom: 3px;
          color: var(--gold);
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.08em;
        }

        .line-bind-card-v25313 strong {
          display: block;
          color: #4c332b;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 950;
        }

        .line-bind-card-v25313 em {
          display: block;
          margin-top: 4px;
          color: #9a897d;
          font-size: 12px;
          font-style: normal;
          font-weight: 800;
        }

        .line-bind-card-v25313 small {
          flex-shrink: 0;
          color: #9a897d;
          font-size: 12px;
          font-weight: 850;
          white-space: nowrap;
        }

        .line-bind-card-v25313 button {
          flex-shrink: 0;
          border: 0;
          border-radius: 999px;
          padding: 10px 14px;
          background: #06c755;
          color: #fff;
          font-size: 13px;
          font-weight: 950;
          box-shadow: 0 8px 18px rgba(6, 199, 85, 0.2);
        }

        .line-bind-card-v25313 button:disabled {
          background: #d8ccc3;
          color: #fff;
          box-shadow: none;
        }


        @media (max-width: 420px) {
          .brand-logo-wrap {
            width: 44px;
            height: 44px;
            border-radius: 14px;
          }

          .brand-logo-wrap img {
            width: 37px;
            height: 37px;
          }

          .top-header {
            gap: 8px !important;
          }

          .line-bind-card-v25313 {
            align-items: flex-start;
            flex-direction: column;
          }

          .line-bind-card-v25313 button,
          .line-bind-card-v25313 small {
            width: 100%;
            text-align: center;
          }

          .product-info h3,
          .commerce-product-card .product-info h3,
          .featured-card.commerce-product-card .product-info h3 {
            font-size: 18px !important;
            min-height: 46px !important;
          }
        }

        @media (max-width: 370px) {
          .brand-logo-wrap {
            display: none;
          }
        }


        /* Commerce V2.5.3.6：商品卡一句話短文案 + 價格置中 */
        .product-info .description,
        .commerce-product-card .product-info .description,
        .featured-info .description {
          font-size: 13.8px !important;
          line-height: 1.42 !important;
          font-weight: 800 !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          min-height: 38px !important;
          max-height: 39px !important;
        }

        .commerce-price-block,
        .product-card .price-block,
        .featured-card .price-block {
          width: 100% !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
        }

        .commerce-price-block .original-price,
        .commerce-price-block .price,
        .product-card .price-block .original-price,
        .product-card .price-block .price,
        .featured-card .price-block .original-price,
        .featured-card .price-block .price {
          width: 100% !important;
          text-align: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        /* Commerce V2.5.3.7：品項名稱置中 + 分類頁只顯示熱門精選 */
        .product-info h3,
        .commerce-product-card .product-info h3,
        .featured-card.commerce-product-card .product-info h3 {
          text-align: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
          width: 100% !important;
        }

        .product-info .description,
        .commerce-product-card .product-info .description,
        .featured-info .description {
          text-align: center !important;
          -webkit-line-clamp: 1 !important;
          min-height: 22px !important;
          max-height: 22px !important;
          font-size: 13.2px !important;
          line-height: 1.35 !important;
        }

        .product-meta-row,
        .tag-row {
          justify-content: center !important;
          text-align: center !important;
        }

        .collection-product-grid.collection-grid-v22 {
          padding-bottom: 16px !important;
        }



        /* Commerce V2.5.3.8.2.1：修正精選首頁樣式區塊位置 */
        .simple-more-gateway-v25382 {
          margin: 18px 16px 30px;
          padding: 22px 18px;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(255, 250, 246, 0.96), rgba(255, 236, 222, 0.9));
          border: 1px solid rgba(190, 115, 73, 0.16);
          box-shadow: 0 18px 46px rgba(116, 70, 45, 0.1);
          text-align: center;
        }

        .simple-more-gateway-v25382 p {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b96f45;
        }

        .simple-more-gateway-v25382 h2 {
          margin: 0;
          font-size: 24px;
          color: #45261d;
          letter-spacing: -0.04em;
        }

        .simple-more-gateway-v25382 span {
          display: block;
          margin-top: 8px;
          font-size: 14px;
          line-height: 1.7;
          color: #8b7567;
          font-weight: 700;
        }

        .simple-more-actions-v25382 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 16px;
        }

        .simple-more-actions-v25382 button {
          border: 0;
          border-radius: 999px;
          padding: 12px 10px;
          background: #fff;
          color: #8a3f2f;
          font-size: 13px;
          font-weight: 900;
          box-shadow: inset 0 0 0 1px rgba(178, 99, 68, 0.18);
        }

        .secondary-best-grid-v242 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .combo-showcase-list-v242 {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .series-entry-grid-v242 {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }


        .site-shell {
          background:
            radial-gradient(circle at top left, rgba(139, 30, 43, 0.08), transparent 34%),
            linear-gradient(180deg, #fff9f2 0%, #fffdf9 38%, #fff8f1 100%);
        }

        .mall-hero-v26,
        .mall-hall-section-v26,
        .mall-deal-wall-v26,
        .mall-brand-section-v26 {
          margin: 18px 16px;
          border-radius: 32px;
        }

        .mall-hero-v26 {
          display: grid;
          grid-template-columns: minmax(0, 1.18fr) minmax(220px, 0.82fr);
          gap: 16px;
          padding: 20px;
          background:
            linear-gradient(135deg, rgba(255, 253, 247, 0.98), rgba(255, 235, 221, 0.94)),
            radial-gradient(circle at 80% 10%, rgba(139, 30, 43, 0.16), transparent 34%);
          border: 1px solid rgba(139, 30, 43, 0.12);
          box-shadow: 0 24px 60px rgba(95, 47, 34, 0.12);
          overflow: hidden;
        }

        .mall-hero-copy-v26 {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }

        .mall-hero-eyebrow-v26,
        .mall-section-head-v26 p {
          margin: 0 0 8px;
          color: #a84d39;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .mall-hero-copy-v26 h2 {
          margin: 0;
          color: #3f241d;
          font-size: clamp(32px, 8vw, 54px);
          line-height: 0.98;
          letter-spacing: -0.08em;
        }

        .mall-hero-copy-v26 > span {
          display: block;
          margin-top: 12px;
          color: #765f53;
          font-size: 15px;
          line-height: 1.7;
          font-weight: 750;
        }

        .mall-search-trigger-v26 {
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-areas: "icon title" "icon sub";
          gap: 2px 10px;
          align-items: center;
          width: 100%;
          margin-top: 18px;
          padding: 14px 16px;
          border: 0;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: inset 0 0 0 1px rgba(139, 30, 43, 0.12), 0 14px 32px rgba(93, 45, 34, 0.08);
          text-align: left;
          color: #42251f;
        }

        .mall-search-trigger-v26 span { grid-area: icon; font-size: 20px; }
        .mall-search-trigger-v26 strong { grid-area: title; font-size: 15px; font-weight: 950; }
        .mall-search-trigger-v26 em { grid-area: sub; color: #9a8174; font-size: 12px; font-style: normal; font-weight: 800; }

        .mall-hero-actions-v26 {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .mall-hero-actions-v26 button {
          border: 0;
          border-radius: 999px;
          padding: 12px 16px;
          background: #8b1e2b;
          color: #fff;
          font-size: 13px;
          font-weight: 950;
          box-shadow: 0 12px 24px rgba(139, 30, 43, 0.18);
        }

        .mall-hero-actions-v26 button:nth-child(2) {
          background: #fff;
          color: #8b1e2b;
          box-shadow: inset 0 0 0 1px rgba(139, 30, 43, 0.2);
        }

        .mall-hero-product-v26 {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 0;
          padding: 16px;
          border: 0;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: inset 0 0 0 1px rgba(139, 30, 43, 0.1);
          color: #3f241d;
          text-align: center;
        }

        .mall-top-pill-v26 {
          align-self: flex-start;
          margin-bottom: 10px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff;
          color: #8b1e2b;
          font-size: 13px;
          font-weight: 950;
          box-shadow: inset 0 0 0 1px rgba(139, 30, 43, 0.18);
        }

        .mall-hero-product-image-v26 {
          width: min(100%, 220px);
          aspect-ratio: 1 / 1;
          display: grid;
          place-items: center;
          border-radius: 24px;
          background: linear-gradient(180deg, #fff, #fff4eb);
          overflow: hidden;
        }

        .mall-hero-product-image-v26 img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
        }

        .mall-hero-product-v26 strong {
          margin-top: 12px;
          font-size: 18px;
          line-height: 1.25;
          letter-spacing: -0.04em;
        }

        .mall-hero-product-v26 p {
          margin: 6px 0 0;
          color: #8b7567;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 750;
        }

        .mall-hero-product-v26 em {
          margin-top: 10px;
          color: #b42332;
          font-size: 20px;
          font-style: normal;
          font-weight: 1000;
        }

        .mall-section-head-v26 {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 14px;
        }

        .mall-section-head-v26.compact {
          margin: 0 16px 14px;
        }

        .mall-section-head-v26 h2 {
          margin: 0;
          color: #3f241d;
          font-size: 24px;
          letter-spacing: -0.05em;
        }

        .mall-section-head-v26 span {
          color: #8c7468;
          font-size: 13px;
          font-weight: 750;
          line-height: 1.6;
        }

        .mall-hall-section-v26,
        .mall-brand-section-v26 {
          padding: 18px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(139, 30, 43, 0.08);
          box-shadow: 0 18px 46px rgba(91, 49, 32, 0.08);
        }

        .mall-hall-grid-v26 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .mall-hall-grid-v26 button,
        .mall-brand-grid-v26 button {
          border: 0;
          border-radius: 22px;
          padding: 14px;
          background: linear-gradient(180deg, #fff, #fff8f2);
          box-shadow: inset 0 0 0 1px rgba(139, 30, 43, 0.09);
          text-align: left;
        }

        .mall-hall-grid-v26 span {
          display: inline-flex;
          margin-bottom: 8px;
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(139, 30, 43, 0.08);
          color: #9e3a35;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .mall-hall-grid-v26 strong,
        .mall-brand-grid-v26 strong {
          display: block;
          color: #43251e;
          font-size: 15px;
          font-weight: 950;
          letter-spacing: -0.03em;
        }

        .mall-hall-grid-v26 p,
        .mall-brand-grid-v26 p {
          margin: 6px 0 0;
          color: #8a7569;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 760;
        }

        .mall-deal-wall-v26 {
          padding: 18px 0;
          background: linear-gradient(180deg, rgba(139, 30, 43, 0.96), rgba(98, 42, 32, 0.94));
          box-shadow: 0 22px 54px rgba(139, 30, 43, 0.18);
        }

        .mall-deal-wall-v26 .mall-section-head-v26 p,
        .mall-deal-wall-v26 .mall-section-head-v26 h2,
        .mall-deal-wall-v26 .mall-section-head-v26 span {
          color: #fff;
        }

        .mall-deal-grid-v26 {
          display: grid;
          grid-template-columns: 1.15fr 1fr 1fr;
          gap: 10px;
          padding: 0 16px;
        }

        .mall-deal-card-v26 {
          display: grid;
          grid-template-columns: 92px 1fr;
          gap: 10px;
          align-items: center;
          padding: 10px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.96);
          min-width: 0;
        }

        .mall-deal-card-v26.feature {
          grid-row: span 2;
          grid-template-columns: 1fr;
          align-content: start;
        }

        .mall-deal-image-v26 {
          width: 100%;
          aspect-ratio: 1 / 1;
          border: 0;
          border-radius: 18px;
          background: #fff7ef;
          overflow: hidden;
        }

        .mall-deal-image-v26 img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
        }

        .mall-deal-card-v26 span {
          color: #a84d39;
          font-size: 10px;
          font-weight: 950;
        }

        .mall-deal-card-v26 h3 {
          margin: 3px 0;
          color: #392019;
          font-size: 14px;
          line-height: 1.3;
        }

        .mall-deal-card-v26 p {
          margin: 0;
          color: #806a5f;
          font-size: 12px;
          line-height: 1.45;
        }

        .mall-deal-card-v26 strong {
          display: block;
          margin-top: 6px;
          color: #b42332;
          font-size: 15px;
          font-weight: 1000;
        }

        .mall-deal-card-v26 div > button {
          margin-top: 8px;
          border: 0;
          border-radius: 999px;
          padding: 8px 12px;
          background: #8b1e2b;
          color: #fff;
          font-size: 12px;
          font-weight: 950;
        }

        .mall-brand-grid-v26 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .mall-brand-grid-v26 span {
          display: inline-flex;
          margin-top: 10px;
          color: #9e3a35;
          font-size: 12px;
          font-weight: 950;
        }

        @media (max-width: 720px) {
          .mall-hero-v26 {
            grid-template-columns: 1fr;
            padding: 16px;
            border-radius: 28px;
          }

          .mall-hall-grid-v26,
          .mall-brand-grid-v26 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .mall-deal-grid-v26 {
            grid-template-columns: 1fr;
          }

          .mall-deal-card-v26,
          .mall-deal-card-v26.feature {
            grid-row: auto;
            grid-template-columns: 92px 1fr;
          }

          .mall-section-head-v26.compact {
            margin: 0 14px 12px;
          }

          .secondary-best-grid-v242,
          .combo-showcase-list-v242,
          .series-entry-grid-v242 {
            grid-template-columns: 1fr;
          }

          .simple-more-actions-v25382 {
            grid-template-columns: 1fr;
          }
        }


        /* V2.7 精選生活賣場版：更像完整手機賣場，而不是一頁式微商城 */
        .announcement-bar {
          background: linear-gradient(90deg, #3d2b28, #6b302f, #4b2f25);
          color: #fff8ef;
          letter-spacing: 0.04em;
          font-weight: 900;
        }

        .top-header {
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(255, 253, 248, 0.94);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(93, 55, 42, 0.08);
        }

        .brand-block h1 {
          letter-spacing: -0.04em;
        }

        .site-shell {
          background:
            radial-gradient(circle at 12% 0%, rgba(162, 82, 61, 0.10), transparent 32%),
            radial-gradient(circle at 90% 14%, rgba(209, 170, 108, 0.16), transparent 30%),
            linear-gradient(180deg, #fffaf4 0%, #fffdf9 44%, #fff7ef 100%);
        }

        .mall-hero-v27 {
          position: relative;
          border-radius: 34px;
          background:
            radial-gradient(circle at 82% 15%, rgba(220, 175, 105, 0.30), transparent 30%),
            linear-gradient(135deg, rgba(255, 253, 247, 0.98), rgba(250, 231, 215, 0.98));
          border: 1px solid rgba(121, 62, 45, 0.12);
          box-shadow: 0 28px 70px rgba(83, 47, 34, 0.13);
        }

        .mall-hero-v27::before {
          content: "";
          position: absolute;
          inset: 14px;
          border-radius: 26px;
          border: 1px solid rgba(255, 255, 255, 0.58);
          pointer-events: none;
        }

        .mall-hero-v27 .mall-hero-copy-v26 h2 {
          max-width: 9.5em;
          font-size: clamp(33px, 7.5vw, 56px);
          color: #35221c;
        }

        .mall-hero-v27 .mall-hero-copy-v26 > span {
          max-width: 31em;
          color: #725a4e;
        }

        .mall-proof-row-v27 {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .mall-proof-row-v27 span {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 7px 10px;
          background: rgba(255, 255, 255, 0.64);
          color: #6d3b31;
          font-size: 12px;
          font-weight: 900;
          box-shadow: inset 0 0 0 1px rgba(139, 30, 43, 0.10);
        }

        .mall-search-trigger-v26 {
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
        }

        .mall-hero-product-v26 {
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow: inset 0 0 0 1px rgba(125, 69, 46, 0.10), 0 18px 46px rgba(95, 55, 38, 0.10);
        }

        .mall-top-pill-v26 {
          background: #fff6eb;
          color: #8b1e2b;
        }

        .mall-editorial-banners-v27 {
          display: grid;
          grid-template-columns: 1.15fr 1fr 1fr;
          gap: 12px;
          margin: 18px 16px;
        }

        .mall-editorial-card-v27 {
          min-height: 134px;
          border: 0;
          border-radius: 28px;
          padding: 18px;
          background: linear-gradient(135deg, #ffffff, #fff4eb);
          box-shadow: inset 0 0 0 1px rgba(139, 30, 43, 0.08), 0 16px 42px rgba(92, 48, 34, 0.08);
          text-align: left;
          color: #3f241d;
        }

        .mall-editorial-card-v27.primary {
          background: linear-gradient(135deg, #8b1e2b, #b64e3b);
          color: #fff;
        }

        .mall-editorial-card-v27 span {
          display: inline-flex;
          margin-bottom: 10px;
          color: inherit;
          opacity: 0.74;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .mall-editorial-card-v27 strong {
          display: block;
          font-size: 18px;
          font-weight: 1000;
          letter-spacing: -0.04em;
        }

        .mall-editorial-card-v27 p {
          margin: 8px 0 0;
          color: inherit;
          opacity: 0.78;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 760;
        }

        .mall-hall-section-v27,
        .mall-brand-section-v27 {
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(10px);
        }

        .mall-hall-grid-v26 button,
        .mall-brand-grid-v26 button {
          min-height: 116px;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .mall-hall-grid-v26 button:active,
        .mall-brand-grid-v26 button:active,
        .mall-editorial-card-v27:active {
          transform: scale(0.98);
        }

        .mall-deal-wall-v27 {
          background:
            radial-gradient(circle at 0% 0%, rgba(255, 222, 169, 0.22), transparent 38%),
            linear-gradient(135deg, #4b2b25, #8b1e2b 58%, #b75b42);
        }

        .mall-deal-card-v26 {
          box-shadow: 0 14px 34px rgba(40, 20, 15, 0.10);
        }

        .mall-brand-grid-v26 button {
          background: linear-gradient(180deg, #fff, #fbf4ec);
        }

        .mall-brand-grid-v26 button:first-child {
          background: linear-gradient(135deg, #fff7ec, #ffffff);
          box-shadow: inset 0 0 0 1px rgba(183, 129, 65, 0.20), 0 16px 38px rgba(92, 48, 34, 0.07);
        }

        @media (max-width: 720px) {
          .mall-hero-v26,
          .mall-hall-section-v26,
          .mall-deal-wall-v26,
          .mall-brand-section-v26,
          .mall-editorial-banners-v27 {
            margin-left: 10px;
            margin-right: 10px;
          }

          .mall-editorial-banners-v27 {
            grid-template-columns: 1fr;
          }

          .mall-editorial-card-v27 {
            min-height: auto;
            border-radius: 24px;
          }

          .mall-hero-v27 .mall-hero-copy-v26 h2 {
            font-size: 36px;
            line-height: 1.05;
          }

          .mall-proof-row-v27 span {
            font-size: 11px;
          }
        }


        /* V2.7.1: selected-market shelf refinements */
        .mall-shelf-section-v271 {
          position: relative;
        }

        .shelf-card-v271 {
          border: 1px solid rgba(120, 75, 55, 0.12);
          box-shadow: 0 14px 34px rgba(72, 43, 35, 0.08);
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,250,244,0.9));
        }

        .shelf-card-v271 .product-image {
          background: linear-gradient(145deg, #fbf5ee, #f7eee3);
          border-bottom: 1px solid rgba(120, 75, 55, 0.08);
        }

        .shelf-brand-line-v271 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
          font-size: 11px;
          letter-spacing: 0.06em;
          color: #8a6a55;
        }

        .shelf-brand-line-v271 span {
          font-weight: 900;
          color: #7d302c;
        }

        .shelf-brand-line-v271 em {
          max-width: 58%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-style: normal;
          color: #a2846f;
        }

        .shelf-price-block-v271 {
          padding: 10px 0 2px;
          border-top: 1px solid rgba(120, 75, 55, 0.08);
        }

        .price-mode-v271 {
          display: inline-flex;
          width: fit-content;
          margin-bottom: 4px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(126, 48, 44, 0.08);
          color: #7d302c;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .shelf-card-v271 .commerce-card-actions {
          gap: 8px;
        }

        .shelf-card-v271 .add-cart-button {
          flex: 1.25;
          background: linear-gradient(135deg, #7b302d, #a45645);
          box-shadow: 0 10px 20px rgba(123, 48, 45, 0.18);
        }

        .shelf-card-v271 .detail-button {
          flex: 0.9;
          border-color: rgba(120, 75, 55, 0.2);
          color: #6f5242;
          background: rgba(255,255,255,0.72);
        }

        .mall-brand-grid-v271 button {
          position: relative;
          min-height: 142px;
          overflow: hidden;
          text-align: left;
        }

        .mall-brand-grid-v271 button::after {
          content: "";
          position: absolute;
          right: -28px;
          bottom: -30px;
          width: 110px;
          height: 110px;
          border-radius: 999px;
          background: rgba(191, 150, 96, 0.15);
        }

        .mall-brand-badge-v271 {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          margin-bottom: 12px;
          padding: 5px 9px;
          border-radius: 999px;
          background: #f5eadc;
          color: #7d302c;
          font-style: normal;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .mall-brand-grid-v271 button span {
          position: relative;
          z-index: 1;
        }

        #home-skincare-hall-v271,
        #home-health-hall-v271,
        #home-aroma-hall-v271,
        #home-vendor-hall-v271 {
          padding-top: 2px;
        }

        #home-vendor-hall-v271 .shelf-card-v271 .price-mode-v271 {
          background: rgba(85, 71, 63, 0.08);
          color: #5d514a;
        }



        /* V2.7.2: top route strip and collection navigation refinements */
        .market-route-strip-v272 {
          position: sticky;
          top: 74px;
          z-index: 18;
          display: flex;
          gap: 8px;
          margin: -6px -4px 14px;
          padding: 6px 4px 8px;
          overflow-x: auto;
          scrollbar-width: none;
          background: linear-gradient(180deg, rgba(255,250,246,0.94), rgba(255,250,246,0.72));
          backdrop-filter: blur(14px);
        }

        .market-route-strip-v272::-webkit-scrollbar {
          display: none;
        }

        .market-route-strip-v272 button {
          flex: 0 0 auto;
          min-width: 92px;
          border: 1px solid rgba(183, 138, 72, 0.22);
          border-radius: 18px;
          padding: 9px 10px;
          background: rgba(255,255,255,0.86);
          box-shadow: 0 10px 24px rgba(82, 55, 38, 0.08);
          color: #4b3328;
          text-align: left;
        }

        .market-route-strip-v272 button:first-child {
          background: linear-gradient(135deg, #7b302d, #b95a49);
          color: #fffaf2;
          border-color: rgba(255,255,255,0.3);
        }

        .market-route-strip-v272 span {
          display: block;
          margin-bottom: 3px;
          color: inherit;
          opacity: 0.74;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .market-route-strip-v272 strong {
          display: block;
          font-size: 13px;
          font-weight: 950;
          white-space: nowrap;
        }

        .search-hot-panel-v272 > div:first-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .search-hot-panel-v272 > div:first-child span {
          color: #9a8174;
          font-size: 12px;
          font-weight: 750;
        }

        .collection-guide-v272 {
          display: grid;
          gap: 12px;
          margin: 12px 0;
          padding: 14px;
          border: 1px solid rgba(183, 138, 72, 0.22);
          border-radius: 24px;
          background: rgba(255,255,255,0.78);
          box-shadow: 0 12px 30px rgba(82, 55, 38, 0.08);
        }

        .collection-guide-v272 strong {
          display: block;
          margin-bottom: 4px;
          color: #4b3328;
          font-size: 15px;
          font-weight: 950;
        }

        .collection-guide-v272 span {
          color: #8f7466;
          font-size: 12px;
          font-weight: 760;
          line-height: 1.55;
        }

        .collection-guide-v272 > div:last-child {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .collection-guide-v272 button {
          border: 1px solid rgba(123, 48, 45, 0.15);
          border-radius: 14px;
          padding: 10px 8px;
          background: #fffaf6;
          color: #7b302d;
          font-size: 12px;
          font-weight: 950;
        }

        .collection-guide-v272 button:first-child {
          background: #7b302d;
          color: #fffaf2;
        }


        /* V2.7.3：商品詳情與我的回購清單流程細修 */
        .header-cart-button-v273 {
          white-space: nowrap;
        }

        .floating-cart-button-v273 {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 14px 10px 16px !important;
          background: linear-gradient(135deg, #7b302d, #b24133) !important;
          box-shadow: 0 16px 34px rgba(123, 48, 45, 0.30) !important;
        }

        .floating-cart-button-v273 span {
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.02em;
        }

        .floating-cart-button-v273 strong {
          display: grid;
          place-items: center;
          min-width: 27px;
          height: 27px;
          border-radius: 999px;
          background: #fff8ef;
          color: #8f2e29;
          font-size: 14px;
          font-weight: 1000;
        }

        .cart-summary-ribbon-v273 {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          margin: -2px 0 14px;
          padding: 12px;
          border: 1px solid rgba(183, 138, 72, 0.24);
          border-radius: 20px;
          background:
            radial-gradient(circle at top right, rgba(183, 138, 72, 0.18), transparent 38%),
            linear-gradient(135deg, #fff8ef, #fff);
          box-shadow: 0 12px 26px rgba(77, 55, 38, 0.07);
        }

        .cart-summary-ribbon-v273 div {
          display: grid;
          place-items: center;
          min-width: 70px;
          min-height: 60px;
          border-radius: 18px;
          background: #7b302d;
          color: #fff8ef;
        }

        .cart-summary-ribbon-v273 strong {
          font-size: 24px;
          font-weight: 1000;
          line-height: 1;
        }

        .cart-summary-ribbon-v273 span {
          margin-top: 4px;
          color: rgba(255, 248, 239, 0.84);
          font-size: 11px;
          font-weight: 850;
        }

        .cart-summary-ribbon-v273 p {
          margin: 0;
          color: #7f6658;
          font-size: 12.5px;
          font-weight: 780;
          line-height: 1.6;
        }

        .detail-price-hero-v273 {
          display: grid;
          gap: 14px;
          margin: 13px 0 14px;
          padding: 16px;
          border: 1px solid rgba(178, 65, 51, 0.18);
          border-radius: 26px;
          background:
            radial-gradient(circle at 96% 0%, rgba(183, 138, 72, 0.20), transparent 34%),
            linear-gradient(135deg, #fff8ef 0%, #fff 100%);
          box-shadow: 0 18px 36px rgba(77, 55, 38, 0.09);
        }

        .detail-price-hero-v273 p {
          margin: 0 0 6px;
          color: #b78a48;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .detail-price-hero-v273 .original-price {
          display: block;
          margin-bottom: 2px !important;
        }

        .detail-price-hero-v273 strong.price {
          display: block;
          color: #c0352a !important;
          font-size: 32px !important;
          font-weight: 1000;
          letter-spacing: -0.055em;
          line-height: 1.05;
        }

        .detail-price-hero-v273 em {
          display: block;
          margin-top: 7px;
          color: #8f7466;
          font-size: 12.5px;
          font-style: normal;
          font-weight: 780;
          line-height: 1.55;
        }

        .detail-price-actions-v273 {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        .detail-price-actions-v273 button {
          min-height: 46px;
          border: 1px solid rgba(123, 48, 45, 0.16);
          border-radius: 16px;
          padding: 0 14px;
          background: #fff;
          color: #7b302d;
          font-size: 13px;
          font-weight: 950;
        }

        .detail-price-actions-v273 button.primary {
          border-color: transparent;
          background: linear-gradient(135deg, #7b302d, #b24133);
          color: #fffaf2;
          box-shadow: 0 12px 24px rgba(123, 48, 45, 0.20);
        }

        .detail-price-actions-v273 button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (max-width: 380px) {
          .cart-summary-ribbon-v273 {
            grid-template-columns: 1fr;
          }

          .detail-price-actions-v273 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .market-route-strip-v272 {
            top: 72px;
          }

          .collection-guide-v272 > div:last-child {
            grid-template-columns: 1fr;
          }

          .shelf-brand-line-v271 {
            font-size: 10px;
          }

          .shelf-card-v271 .commerce-card-actions {
            grid-template-columns: 1fr;
          }

          .mall-brand-grid-v271 button {
            min-height: 132px;
          }
        }


        /* V2.9.3 完成版：精選生活賣場總整理 */
        .app-shell {
          background:
            radial-gradient(circle at 12% 0%, rgba(255, 231, 196, 0.62), transparent 30%),
            radial-gradient(circle at 86% 8%, rgba(123, 48, 45, 0.10), transparent 32%),
            linear-gradient(180deg, #fffaf2 0%, #f7eee2 48%, #fffaf4 100%);
        }

        .mall-hero-v27 {
          border: 1px solid rgba(163, 117, 74, 0.18);
          box-shadow: 0 26px 70px rgba(80, 41, 26, 0.14);
        }

        .mall-hero-v27 .mall-hero-copy-v26 h2 {
          max-width: 11em;
          letter-spacing: -0.055em;
        }

        .mall-proof-row-v27 span,
        .market-route-strip-v272 button,
        .mall-editorial-card-v27,
        .mall-hall-section-v27 button,
        .mall-brand-grid-v271 button,
        .shelf-card-v271 {
          backdrop-filter: blur(14px);
        }

        .shelf-card-v271 {
          border-color: rgba(163, 117, 74, 0.14);
          box-shadow: 0 18px 34px rgba(76, 45, 28, 0.08);
        }

        .shelf-card-v271:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 48px rgba(76, 45, 28, 0.13);
        }

        .shelf-card-v271 .product-info h3 {
          letter-spacing: -0.03em;
        }

        .price-mode-v271 {
          border: 1px solid rgba(123, 48, 45, 0.12);
          background: linear-gradient(135deg, rgba(255, 250, 244, 0.96), rgba(255, 238, 219, 0.92));
        }

        .mall-deal-wall-v27 button,
        .mall-editorial-card-v27.primary {
          box-shadow: 0 18px 40px rgba(123, 48, 45, 0.18);
        }

        .floating-cart-button-v273 {
          box-shadow: 0 18px 42px rgba(123, 48, 45, 0.24);
        }

        .drawer-panel,
        .cart-panel,
        .detail-panel {
          border-left: 1px solid rgba(163, 117, 74, 0.18);
        }

        @media (max-width: 520px) {
          .mall-hero-v27 {
            margin-top: 8px;
          }

          .mall-hero-v27 .mall-hero-copy-v26 h2 {
            font-size: clamp(34px, 12vw, 54px);
          }
        }


        /* V2.9.0 企業風格選品館版：降低促銷感、提升品牌 CI 與可讀性 */
        :root {
          --castle-cream: #fbf4ea;
          --castle-paper: #fffdf8;
          --castle-paper-soft: #fff8f0;
          --castle-ink: #35241f;
          --castle-brown: #6e5146;
          --castle-muted: #9a867b;
          --castle-wine: #8f2632;
          --castle-wine-deep: #6f2028;
          --castle-gold: #c7a46a;
          --castle-line: rgba(121, 82, 60, 0.13);
          --castle-shadow: 0 18px 44px rgba(70, 42, 28, 0.08);
        }

        .site-shell {
          max-width: 820px;
          margin: 0 auto;
          background:
            radial-gradient(circle at 10% 0%, rgba(199, 164, 106, 0.18), transparent 32%),
            radial-gradient(circle at 90% 4%, rgba(143, 38, 50, 0.07), transparent 34%),
            linear-gradient(180deg, var(--castle-paper) 0%, var(--castle-cream) 46%, #fffaf4 100%) !important;
          color: var(--castle-ink);
        }

        .announcement-bar {
          background: linear-gradient(90deg, #4b352e, #6f2a2f) !important;
          color: #fff9f1 !important;
          font-size: 13px;
          letter-spacing: 0.03em;
          box-shadow: none !important;
        }

        .top-header {
          background: rgba(255, 253, 248, 0.96) !important;
          border-bottom: 1px solid rgba(120, 82, 60, 0.10) !important;
          box-shadow: 0 10px 24px rgba(70, 42, 28, 0.05) !important;
        }

        .top-header .brand-logo-wrap {
          box-shadow: inset 0 0 0 1px rgba(199, 164, 106, 0.26), 0 8px 18px rgba(80, 45, 28, 0.06) !important;
          background: #fffaf2 !important;
        }

        .brand-block .top-eyebrow {
          color: #b28a4d !important;
          letter-spacing: 0.14em;
        }

        .brand-block h1 {
          color: var(--castle-wine-deep) !important;
          font-size: clamp(21px, 4.4vw, 30px) !important;
          letter-spacing: -0.045em !important;
        }

        .brand-block > p:not(.top-eyebrow) {
          color: var(--castle-muted) !important;
          font-weight: 760 !important;
        }

        .menu-button,
        .icon-button,
        .header-cart-button {
          border: 1px solid rgba(120, 82, 60, 0.13) !important;
          background: rgba(255,255,255,0.86) !important;
          box-shadow: 0 10px 24px rgba(70, 42, 28, 0.06) !important;
          color: var(--castle-ink) !important;
        }

        .header-cart-button {
          background: var(--castle-wine) !important;
          color: #fffaf3 !important;
          border-color: transparent !important;
        }

        .market-route-strip-v272 {
          margin: 12px 14px 4px !important;
          padding: 0 2px 4px !important;
          gap: 8px !important;
        }

        .market-route-strip-v272 button {
          min-width: 114px !important;
          border: 1px solid rgba(120, 82, 60, 0.12) !important;
          background: rgba(255,255,255,0.78) !important;
          box-shadow: 0 8px 20px rgba(70, 42, 28, 0.05) !important;
        }

        .market-route-strip-v272 button:first-child {
          background: rgba(143, 38, 50, 0.08) !important;
          border-color: rgba(143, 38, 50, 0.15) !important;
        }

        .market-route-strip-v272 span {
          color: #b28a4d !important;
        }

        .market-route-strip-v272 strong {
          color: var(--castle-ink) !important;
        }

        /* 第一屏：改成品牌入口，不用巨大促銷框壓迫使用者 */
        .mall-hero-v26,
        .mall-hero-v27 {
          display: block !important;
          margin: 16px 14px 22px !important;
          padding: 26px 22px !important;
          border-radius: 26px !important;
          background:
            radial-gradient(circle at 88% 4%, rgba(199, 164, 106, 0.22), transparent 30%),
            linear-gradient(135deg, rgba(255,253,248,0.98), rgba(250,241,230,0.96)) !important;
          border: 1px solid var(--castle-line) !important;
          box-shadow: var(--castle-shadow) !important;
          overflow: hidden;
        }

        .mall-hero-v27::before {
          display: none !important;
        }

        .mall-hero-copy-v26 {
          max-width: 100% !important;
        }

        .mall-hero-eyebrow-v26 {
          color: #a9793f !important;
          font-size: 10px !important;
          letter-spacing: 0.18em !important;
          margin-bottom: 10px !important;
        }

        .mall-hero-v27 .mall-hero-copy-v26 h2,
        .mall-hero-copy-v26 h2 {
          max-width: 10.5em !important;
          color: var(--castle-ink) !important;
          font-size: clamp(28px, 8vw, 42px) !important;
          line-height: 1.08 !important;
          letter-spacing: -0.055em !important;
        }

        .mall-hero-copy-v26 > span {
          max-width: 36em !important;
          margin-top: 10px !important;
          color: var(--castle-brown) !important;
          font-size: 14px !important;
          line-height: 1.78 !important;
          font-weight: 760 !important;
        }

        .mall-search-trigger-v26 {
          max-width: 560px;
          margin-top: 18px !important;
          border-radius: 18px !important;
          background: rgba(255,255,255,0.92) !important;
          border: 1px solid rgba(120,82,60,0.12) !important;
          box-shadow: 0 12px 28px rgba(70, 42, 28, 0.06) !important;
        }

        .mall-search-trigger-v26 strong {
          color: var(--castle-ink) !important;
        }

        .mall-search-trigger-v26 em {
          color: var(--castle-muted) !important;
        }

        .mall-hero-actions-v26 button {
          background: var(--castle-wine) !important;
          box-shadow: 0 10px 22px rgba(143, 38, 50, 0.14) !important;
        }

        .mall-hero-actions-v26 button:nth-child(2) {
          background: #fffaf3 !important;
          color: var(--castle-wine) !important;
          box-shadow: inset 0 0 0 1px rgba(143, 38, 50, 0.18) !important;
        }

        .mall-proof-row-v27 span {
          background: rgba(255,255,255,0.74) !important;
          color: var(--castle-brown) !important;
          box-shadow: inset 0 0 0 1px rgba(199,164,106,0.20) !important;
        }

        .mall-hero-product-v26 {
          display: none !important;
        }

        /* 主題入口：降低方框感 */
        .mall-editorial-banners-v27,
        .mall-hall-section-v26,
        .mall-brand-section-v26,
        .mall-deal-wall-v26,
        .home-product-section {
          margin-left: 14px !important;
          margin-right: 14px !important;
        }

        .mall-editorial-banners-v27 {
          grid-template-columns: 1fr !important;
          gap: 10px !important;
          margin-top: 12px !important;
        }

        @media (min-width: 760px) {
          .mall-editorial-banners-v27 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        .mall-editorial-card-v27,
        .mall-hall-grid-v26 button,
        .mall-brand-grid-v26 button,
        .shelf-card-v271,
        .commerce-product-card {
          border-radius: 20px !important;
          border: 1px solid rgba(120,82,60,0.11) !important;
          background: rgba(255,255,255,0.82) !important;
          box-shadow: 0 12px 30px rgba(70, 42, 28, 0.06) !important;
        }

        .mall-editorial-card-v27.primary {
          background: linear-gradient(135deg, #fff7ee, #ffffff) !important;
          color: var(--castle-ink) !important;
          border-color: rgba(143,38,50,0.18) !important;
        }

        .mall-editorial-card-v27 span,
        .mall-section-head-v26 p,
        .section-heading.compact p {
          color: #a9793f !important;
          letter-spacing: 0.16em !important;
        }

        .mall-editorial-card-v27 strong,
        .mall-section-head-v26 h2,
        .section-heading.compact h2 {
          color: var(--castle-ink) !important;
        }

        .mall-editorial-card-v27 p,
        .mall-section-head-v26 span,
        .section-heading.compact span {
          color: var(--castle-brown) !important;
        }

        .mall-hall-section-v26,
        .mall-brand-section-v26 {
          padding: 18px !important;
          border-radius: 24px !important;
          background: rgba(255,255,255,0.66) !important;
          border: 1px solid rgba(120,82,60,0.09) !important;
          box-shadow: 0 14px 36px rgba(70, 42, 28, 0.055) !important;
        }

        .mall-hall-grid-v26 {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        @media (min-width: 760px) {
          .mall-hall-grid-v26 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
        }

        .mall-hall-grid-v26 span {
          background: rgba(199,164,106,0.14) !important;
          color: #9a6e36 !important;
        }

        /* 活動牆：改成高質感白底大卡，避免文字直排和壓迫感 */
        .mall-deal-wall-v26,
        .mall-deal-wall-v27 {
          padding: 20px 0 !important;
          border-radius: 24px !important;
          background: rgba(255,255,255,0.68) !important;
          border: 1px solid rgba(120,82,60,0.10) !important;
          box-shadow: 0 14px 36px rgba(70, 42, 28, 0.055) !important;
        }

        .mall-deal-wall-v26 .mall-section-head-v26 p,
        .mall-deal-wall-v26 .mall-section-head-v26 h2,
        .mall-deal-wall-v26 .mall-section-head-v26 span {
          color: inherit !important;
        }

        .mall-deal-wall-v26 .mall-section-head-v26 p { color: #a9793f !important; }
        .mall-deal-wall-v26 .mall-section-head-v26 h2 { color: var(--castle-ink) !important; }
        .mall-deal-wall-v26 .mall-section-head-v26 span { color: var(--castle-brown) !important; }

        .mall-deal-grid-v26 {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
          padding: 0 16px !important;
        }

        @media (min-width: 760px) {
          .mall-deal-grid-v26 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        .mall-deal-card-v26,
        .mall-deal-card-v26.feature {
          grid-row: auto !important;
          display: grid !important;
          grid-template-columns: 112px minmax(0, 1fr) !important;
          gap: 14px !important;
          align-items: center !important;
          min-height: 144px !important;
          padding: 14px !important;
          border-radius: 22px !important;
          background: rgba(255,253,248,0.96) !important;
          border: 1px solid rgba(120,82,60,0.11) !important;
          box-shadow: 0 12px 30px rgba(70, 42, 28, 0.06) !important;
          overflow: hidden !important;
        }

        .mall-deal-image-v26 {
          border-radius: 18px !important;
          background: #fbf4ea !important;
        }

        .mall-deal-card-v26 div {
          min-width: 0 !important;
        }

        .mall-deal-card-v26 span {
          display: inline-flex;
          width: fit-content;
          margin-bottom: 6px;
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(143,38,50,0.08);
          color: var(--castle-wine) !important;
          font-size: 10px !important;
          font-weight: 950 !important;
          line-height: 1.1 !important;
        }

        .mall-deal-card-v26 h3 {
          color: var(--castle-ink) !important;
          font-size: 17px !important;
          line-height: 1.35 !important;
          letter-spacing: -0.035em !important;
          word-break: normal !important;
          overflow-wrap: anywhere !important;
        }

        .mall-deal-card-v26 p {
          color: var(--castle-brown) !important;
          font-size: 13px !important;
          line-height: 1.5 !important;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .mall-deal-card-v26 strong {
          color: var(--castle-wine) !important;
          font-size: 18px !important;
          line-height: 1.2 !important;
        }

        .mall-deal-card-v26 div > button {
          background: var(--castle-wine) !important;
          color: #fff9f1 !important;
          box-shadow: 0 8px 18px rgba(143,38,50,0.15) !important;
        }

        /* 品牌館：專櫃感、可擴充 */
        .mall-brand-grid-v26,
        .mall-brand-grid-v271 {
          grid-template-columns: 1fr !important;
          gap: 10px !important;
        }

        @media (min-width: 760px) {
          .mall-brand-grid-v26,
          .mall-brand-grid-v271 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        .mall-brand-badge-v271 {
          background: rgba(199,164,106,0.16) !important;
          color: #926b35 !important;
        }

        .mall-brand-grid-v26 button:first-child {
          background: linear-gradient(135deg, rgba(255,248,238,0.96), #ffffff) !important;
        }

        /* 商品貨架：提升留白和可讀性 */
        .home-product-section {
          border-radius: 24px !important;
          background: rgba(255,255,255,0.48) !important;
          box-shadow: none !important;
          border: 1px solid rgba(120,82,60,0.07) !important;
        }

        .home-product-grid {
          gap: 12px !important;
        }

        .commerce-product-card .product-info h3,
        .featured-card.commerce-product-card .product-info h3 {
          color: var(--castle-ink) !important;
          line-height: 1.42 !important;
          letter-spacing: -0.025em !important;
          word-break: normal !important;
          overflow-wrap: anywhere !important;
        }

        .commerce-product-card .product-info .description {
          color: var(--castle-brown) !important;
          line-height: 1.55 !important;
        }

        .price-mode-v271 {
          color: var(--castle-wine) !important;
          background: rgba(143,38,50,0.07) !important;
          border-color: rgba(143,38,50,0.12) !important;
        }

        .product-card .price-block .price,
        .featured-card .price-block .price,
        .commerce-product-card .price,
        .mall-hero-product-v26 em {
          color: var(--castle-wine) !important;
        }

        .add-cart-button,
        .home-more-button,
        .floating-cart-button-v273 {
          background: var(--castle-wine) !important;
          color: #fff9f1 !important;
          box-shadow: 0 12px 26px rgba(143,38,50,0.16) !important;
        }

        /* SEO/結構視覺輔助：讓區塊標題清楚但不吵 */
        .section-heading.compact,
        .mall-section-head-v26 {
          padding: 0 2px;
        }

        @media (max-width: 520px) {
          .top-header {
            gap: 8px !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .brand-block h1 {
            font-size: 22px !important;
          }

          .brand-block > p:not(.top-eyebrow) {
            font-size: 11px !important;
          }

          .mall-hero-v26,
          .mall-hero-v27 {
            margin: 12px 10px 18px !important;
            padding: 22px 16px !important;
          }

          .mall-hero-v27 .mall-hero-copy-v26 h2,
          .mall-hero-copy-v26 h2 {
            font-size: 30px !important;
          }

          .mall-hero-actions-v26 button {
            flex: 1 1 auto;
          }

          .mall-deal-card-v26,
          .mall-deal-card-v26.feature {
            grid-template-columns: 104px minmax(0, 1fr) !important;
          }

          .mall-deal-card-v26 h3 {
            font-size: 16px !important;
          }

          .mall-deal-card-v26 strong {
            font-size: 17px !important;
          }
        }


        /* V2.9.1 手機版版面修正＋商品圖系統版 */
        .mall-hero-copy-v26 h2,
        .mall-hero-v27 .mall-hero-copy-v26 h2 {
          max-width: 10.5em !important;
          font-size: clamp(38px, 8.5vw, 64px) !important;
          line-height: 1.04 !important;
          letter-spacing: -0.075em !important;
          text-wrap: balance;
        }

        .mall-deal-grid-v26 {
          grid-template-columns: 1fr !important;
          gap: 14px !important;
          padding: 0 18px !important;
        }

        @media (min-width: 980px) {
          .mall-deal-grid-v26 {
            grid-template-columns: repeat(2, minmax(360px, 1fr)) !important;
          }
        }

        .mall-deal-card-v26,
        .mall-deal-card-v26.feature {
          grid-template-columns: minmax(132px, 35%) minmax(0, 1fr) !important;
          min-height: 176px !important;
          gap: 16px !important;
          padding: 16px !important;
          align-items: center !important;
          overflow: hidden !important;
        }

        .mall-deal-image-v26 {
          width: 100% !important;
          min-width: 0 !important;
          aspect-ratio: 1 / 1 !important;
          border-radius: 20px !important;
        }

        .mall-deal-image-v26 img {
          padding: 8px !important;
        }

        .mall-deal-card-v26 div {
          min-width: 0 !important;
          display: grid !important;
          justify-items: start !important;
        }

        .mall-deal-card-v26 span,
        .mall-deal-card-v26 h3,
        .mall-deal-card-v26 p,
        .mall-deal-card-v26 strong {
          max-width: 100% !important;
          text-align: left !important;
          word-break: normal !important;
          overflow-wrap: break-word !important;
          writing-mode: horizontal-tb !important;
        }

        .mall-deal-card-v26 h3 {
          display: -webkit-box !important;
          overflow: hidden !important;
          margin: 2px 0 2px !important;
          font-size: clamp(18px, 4.8vw, 22px) !important;
          line-height: 1.32 !important;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .mall-deal-card-v26 p {
          -webkit-line-clamp: 2 !important;
        }

        .mall-deal-card-v26 strong {
          font-size: clamp(19px, 5vw, 24px) !important;
          letter-spacing: -0.035em !important;
        }

        .mall-deal-card-v26 div > button {
          min-height: 40px !important;
          padding: 9px 15px !important;
          white-space: nowrap !important;
        }

        .commerce-product-card .product-image,
        .featured-card.commerce-product-card .product-image {
          min-height: 190px !important;
        }

        .commerce-product-card .product-image img,
        .featured-card.commerce-product-card .product-image img {
          object-fit: contain !important;
          padding: 8px !important;
        }

        .detail-gallery-v291 {
          position: relative;
          padding: 16px 16px 8px;
          background: linear-gradient(180deg, #fffdf8, #fbf4ea);
        }

        .detail-gallery-track-v291 {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          overscroll-behavior-x: contain;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          padding-bottom: 4px;
        }

        .detail-gallery-track-v291::-webkit-scrollbar {
          display: none;
        }

        .detail-gallery-item-v291 {
          flex: 0 0 100%;
          display: grid;
          place-items: center;
          min-height: min(72vw, 430px);
          margin: 0;
          border: 1px solid rgba(120,82,60,0.10);
          border-radius: 26px;
          background: #fff;
          box-shadow: 0 14px 34px rgba(70,42,28,0.07);
          overflow: hidden;
          scroll-snap-align: start;
        }

        .detail-gallery-item-v291 img {
          width: 100%;
          height: 100%;
          max-height: min(72vw, 430px);
          object-fit: contain;
          padding: 14px;
        }

        .detail-gallery-hint-v291 {
          display: flex;
          justify-content: center;
          margin-top: 8px;
        }

        .detail-gallery-hint-v291 span {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(143,38,50,0.07);
          color: var(--castle-wine, #8f2632);
          font-size: 12px;
          font-weight: 900;
        }

        .detail-placeholder-v291 {
          min-height: min(72vw, 430px) !important;
          border-radius: 26px !important;
        }

        @media (max-width: 520px) {
          .mall-hero-copy-v26 h2,
          .mall-hero-v27 .mall-hero-copy-v26 h2 {
            max-width: 9.5em !important;
            font-size: clamp(34px, 10.5vw, 44px) !important;
            letter-spacing: -0.07em !important;
          }

          .mall-deal-card-v26,
          .mall-deal-card-v26.feature {
            grid-template-columns: 122px minmax(0, 1fr) !important;
            min-height: 168px !important;
            padding: 14px !important;
            gap: 13px !important;
          }

          .mall-deal-card-v26 h3 {
            font-size: 18px !important;
            -webkit-line-clamp: 3;
          }
        }

        @media (max-width: 390px) {
          .mall-deal-card-v26,
          .mall-deal-card-v26.feature {
            grid-template-columns: 1fr !important;
          }

          .mall-deal-image-v26 {
            max-width: 180px !important;
            justify-self: center !important;
          }

          .mall-deal-card-v26 div {
            justify-items: center !important;
            text-align: center !important;
          }

          .mall-deal-card-v26 span,
          .mall-deal-card-v26 h3,
          .mall-deal-card-v26 p,
          .mall-deal-card-v26 strong {
            text-align: center !important;
          }
        }


        /* V2.9.2.1 手機首屏與 Header 安全版：先處理爆版、重疊與過度大字 */
        .top-header {
          display: grid !important;
          grid-template-columns: auto auto minmax(0, 1fr) auto !important;
          align-items: center !important;
          column-gap: 10px !important;
        }

        .brand-block {
          min-width: 0 !important;
          overflow: hidden !important;
        }

        .brand-block h1,
        .top-header h1 {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 100% !important;
          letter-spacing: -0.04em !important;
        }

        .header-actions {
          min-width: max-content !important;
          flex-shrink: 0 !important;
        }

        .mall-hero-v27 .mall-hero-copy-v26 h2,
        .mall-hero-copy-v26 h2 {
          max-width: 100% !important;
          font-size: clamp(31px, 8.8vw, 42px) !important;
          line-height: 1.12 !important;
          letter-spacing: -0.055em !important;
          text-wrap: balance;
        }

        .mall-hero-copy-v26 > span {
          max-width: 100% !important;
        }

        .mall-search-trigger-v26 {
          width: 100% !important;
          box-sizing: border-box !important;
          display: grid !important;
          grid-template-columns: auto minmax(0, 1fr) !important;
          align-items: center !important;
          column-gap: 10px !important;
        }

        .mall-search-trigger-v26 strong,
        .mall-search-trigger-v26 em {
          min-width: 0 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .mall-deal-grid-v26 {
          grid-template-columns: 1fr !important;
        }

        .mall-deal-card-v26,
        .mall-deal-card-v26.feature {
          width: 100% !important;
          box-sizing: border-box !important;
          grid-template-columns: 132px minmax(0, 1fr) !important;
          align-items: center !important;
        }

        .mall-deal-card-v26 span,
        .mall-deal-card-v26 h3,
        .mall-deal-card-v26 p,
        .mall-deal-card-v26 strong {
          writing-mode: horizontal-tb !important;
          text-orientation: mixed !important;
          word-break: normal !important;
          overflow-wrap: break-word !important;
        }

        @media (max-width: 560px) {
          .announcement-bar {
            min-height: 38px !important;
            padding: 9px 12px !important;
            font-size: 12px !important;
            line-height: 1.35 !important;
            text-align: center !important;
          }

          .top-header {
            grid-template-columns: 44px 48px minmax(0, 1fr) auto !important;
            gap: 7px !important;
            padding: 11px 10px !important;
          }

          .menu-button,
          .icon-button {
            width: 44px !important;
            height: 44px !important;
            min-width: 44px !important;
            border-radius: 999px !important;
          }

          .brand-logo-wrap {
            width: 48px !important;
            height: 48px !important;
            min-width: 48px !important;
            border-radius: 16px !important;
          }

          .brand-block .top-eyebrow {
            display: none !important;
          }

          .brand-block h1,
          .top-header h1 {
            margin: 0 !important;
            font-size: clamp(17px, 5vw, 20px) !important;
            line-height: 1.12 !important;
          }

          .brand-block > p:not(.top-eyebrow) {
            display: none !important;
          }

          .header-actions {
            gap: 6px !important;
          }

          .header-actions .icon-button {
            display: none !important;
          }

          .header-cart-button,
          .header-cart-button-v273 {
            min-width: 92px !important;
            height: 44px !important;
            padding: 0 10px !important;
            border-radius: 999px !important;
            font-size: 13px !important;
            white-space: nowrap !important;
          }

          .header-cart-button span,
          .header-cart-button-v273 span {
            min-width: 22px !important;
            height: 22px !important;
            font-size: 12px !important;
          }

          .market-route-strip-v272 {
            margin: 10px 10px 0 !important;
            padding-bottom: 6px !important;
          }

          .market-route-strip-v272 button {
            min-width: 126px !important;
            padding: 13px 14px !important;
          }

          .mall-hero-v26,
          .mall-hero-v27 {
            margin: 12px 10px 18px !important;
            padding: 22px 18px !important;
            border-radius: 24px !important;
          }

          .mall-hero-eyebrow-v26 {
            font-size: 9px !important;
            letter-spacing: 0.16em !important;
            margin-bottom: 8px !important;
          }

          .mall-hero-v27 .mall-hero-copy-v26 h2,
          .mall-hero-copy-v26 h2 {
            font-size: clamp(30px, 9.2vw, 36px) !important;
            line-height: 1.13 !important;
            letter-spacing: -0.05em !important;
          }

          .mall-hero-copy-v26 > span {
            font-size: 13px !important;
            line-height: 1.65 !important;
          }

          .mall-search-trigger-v26 {
            margin-top: 16px !important;
            padding: 14px 15px !important;
            border-radius: 18px !important;
          }

          .mall-search-trigger-v26 span {
            width: 28px !important;
            height: 28px !important;
            font-size: 20px !important;
          }

          .mall-search-trigger-v26 strong {
            font-size: 15px !important;
          }

          .mall-search-trigger-v26 em {
            font-size: 11px !important;
          }

          .mall-hero-actions-v26 {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }

          .mall-hero-actions-v26 button {
            min-height: 48px !important;
            padding: 11px 10px !important;
            font-size: 14px !important;
            white-space: nowrap !important;
          }

          .mall-proof-row-v27 {
            gap: 8px !important;
          }

          .mall-proof-row-v27 span {
            font-size: 11px !important;
            padding: 7px 10px !important;
          }

          .mall-deal-card-v26,
          .mall-deal-card-v26.feature {
            grid-template-columns: 116px minmax(0, 1fr) !important;
            gap: 12px !important;
            padding: 14px !important;
            min-height: 162px !important;
          }

          .mall-deal-image-v26 {
            min-height: 116px !important;
          }

          .mall-deal-card-v26 h3 {
            font-size: 17px !important;
            line-height: 1.34 !important;
            -webkit-line-clamp: 2 !important;
          }

          .mall-deal-card-v26 strong {
            font-size: 18px !important;
          }
        }

        @media (max-width: 390px) {
          .top-header {
            grid-template-columns: 42px 44px minmax(0, 1fr) auto !important;
            gap: 6px !important;
          }

          .menu-button,
          .icon-button {
            width: 42px !important;
            height: 42px !important;
            min-width: 42px !important;
          }

          .brand-logo-wrap {
            width: 44px !important;
            height: 44px !important;
            min-width: 44px !important;
          }

          .brand-block h1,
          .top-header h1 {
            font-size: 16px !important;
          }

          .header-cart-button,
          .header-cart-button-v273 {
            min-width: 84px !important;
            padding: 0 9px !important;
            font-size: 12px !important;
          }

          .mall-hero-v27 .mall-hero-copy-v26 h2,
          .mall-hero-copy-v26 h2 {
            font-size: 29px !important;
          }

          .mall-deal-card-v26,
          .mall-deal-card-v26.feature {
            grid-template-columns: 1fr !important;
          }

          .mall-deal-image-v26 {
            width: min(100%, 220px) !important;
            margin: 0 auto !important;
          }
        }


        /* V3.0.0：品牌型回購選品館首頁，少分類、多標籤 */
        .v3-route-strip,
        .market-route-strip-v272.v3-route-strip {
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          gap: 7px !important;
          padding: 10px 12px !important;
          background: rgba(255, 252, 246, 0.96) !important;
          border-bottom: 1px solid rgba(166, 124, 82, 0.16) !important;
        }

        .v3-route-strip button,
        .market-route-strip-v272.v3-route-strip button {
          min-width: 0 !important;
          padding: 9px 4px !important;
          border-radius: 16px !important;
          background: #fffaf1 !important;
          border: 1px solid rgba(174, 132, 87, 0.18) !important;
          box-shadow: 0 8px 18px rgba(72, 45, 28, 0.06) !important;
        }

        .v3-route-strip button span {
          font-size: 9px !important;
          letter-spacing: 0.08em !important;
          color: #a67c52 !important;
        }

        .v3-route-strip button strong {
          font-size: 12px !important;
          color: #4d3429 !important;
          white-space: nowrap !important;
        }

        .mall-hero-v26.mall-hero-v27 {
          margin: 14px 12px 12px !important;
          padding: 22px 18px !important;
          border-radius: 30px !important;
          background:
            radial-gradient(circle at 88% 18%, rgba(181, 39, 57, 0.13), transparent 28%),
            linear-gradient(142deg, #fff8ed 0%, #fffdf8 44%, #f7eadb 100%) !important;
          border: 1px solid rgba(181, 145, 96, 0.28) !important;
          box-shadow: 0 22px 54px rgba(77, 52, 41, 0.12) !important;
        }

        .mall-hero-copy-v26 h2 {
          color: #3f2a21 !important;
          font-size: clamp(30px, 9vw, 48px) !important;
          line-height: 1.08 !important;
          letter-spacing: -0.05em !important;
          margin-bottom: 12px !important;
        }

        .mall-hero-copy-v26 > span {
          color: #6f5748 !important;
          font-size: 15px !important;
          line-height: 1.8 !important;
        }

        .mall-hero-eyebrow-v26 {
          color: #9c724a !important;
          font-weight: 800 !important;
        }

        .mall-search-trigger-v26 {
          background: rgba(255, 255, 255, 0.78) !important;
          border: 1px solid rgba(166, 124, 82, 0.18) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.85), 0 12px 26px rgba(92, 63, 43, 0.08) !important;
        }

        .mall-hero-actions-v26 button:first-child {
          background: linear-gradient(135deg, #8d1f2d, #b54554) !important;
          color: #fff !important;
          border-color: transparent !important;
        }

        .mall-hero-actions-v26 button:last-child {
          background: #fffaf1 !important;
          color: #5a3b2d !important;
          border: 1px solid rgba(166, 124, 82, 0.22) !important;
        }

        .mall-proof-row-v27 span {
          background: rgba(255, 255, 255, 0.72) !important;
          color: #6b4a38 !important;
          border: 1px solid rgba(166, 124, 82, 0.14) !important;
        }

        .mall-hero-product-v26 {
          background: rgba(255, 255, 255, 0.86) !important;
          border: 1px solid rgba(166, 124, 82, 0.2) !important;
          box-shadow: 0 18px 38px rgba(78, 50, 35, 0.12) !important;
        }

        .mall-hall-grid-v26 {
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        }

        .mall-hall-grid-v26 button {
          min-height: 116px !important;
          background: #fffaf1 !important;
          border: 1px solid rgba(174, 132, 87, 0.18) !important;
        }

        .mall-hall-grid-v26 button span {
          color: #a67c52 !important;
        }

        .mall-section-head-v26 h2,
        .home-product-section-v25 h2 {
          color: #3f2a21 !important;
        }

        .v3-tag-section .mall-brand-grid-v26,
        .v3-tag-section .mall-brand-grid-v271 {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .commerce-product-card.shelf-card-v271 {
          background: #fffdf8 !important;
          border: 1px solid rgba(174, 132, 87, 0.16) !important;
          box-shadow: 0 12px 28px rgba(77, 52, 41, 0.08) !important;
        }

        .commerce-product-card .commerce-card-badge {
          background: #8d1f2d !important;
          color: #fff !important;
        }

        .commerce-product-card .commerce-card-badge.inquiry,
        .commerce-product-card .commerce-card-badge.soldout {
          background: #8d7a66 !important;
        }

        .add-cart-button:disabled,
        .detail-add-button:disabled,
        .detail-price-actions-v273 button:disabled {
          opacity: 0.7 !important;
          cursor: not-allowed !important;
        }

        @media (max-width: 720px) {
          .mall-hall-grid-v26 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .mall-hall-grid-v26 button:first-child {
            grid-column: span 2 !important;
          }
        }

        @media (max-width: 430px) {
          .v3-route-strip,
          .market-route-strip-v272.v3-route-strip {
            overflow-x: auto !important;
            grid-template-columns: repeat(5, 92px) !important;
            justify-content: start !important;
            scrollbar-width: none !important;
          }

          .v3-route-strip::-webkit-scrollbar,
          .market-route-strip-v272.v3-route-strip::-webkit-scrollbar {
            display: none !important;
          }

          .mall-hero-v26.mall-hero-v27 {
            margin-inline: 10px !important;
            border-radius: 26px !important;
          }

          .v3-tag-section .mall-brand-grid-v26,
          .v3-tag-section .mall-brand-grid-v271 {
            grid-template-columns: 1fr !important;
          }
        }


      `}
</style>
    </main>
  );
}

export default function Page() {
  return <Home />;
}
