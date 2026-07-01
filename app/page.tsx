"use client";

import { useState } from "react";

const categoryConfig = {
  全部: ["全部"],
  保養品: [
    "全部",
    "冷杉系列",
    "薰衣草系列",
    "龍血系列",
    "INSK乳酸平衡系列",
    "水光肌能系列",
    "晶淬雪美白系列",
    "玫瑰超微晶萃系列",
    "BA-5肌密抗皺系列",
    "肌光緊緻速妍系列",
    "冰河系列",
    "櫻の雪傳明酸美白系列",
    "茶樹控油系列",
  ],
  保健食品: ["全部", "益生菌系列", "晶眸保健系列", "美妍飲品系列"],
  洗沐: ["全部", "洗沐系列", "添加精油系列"],
  牙膏: ["全部", "牙膏"],
  肥皂: ["全部", "肥皂"],
} as const;

type MainCategory = keyof typeof categoryConfig;

type Product = {
  id: number;
  name: string;
  category: MainCategory;
  series: string;
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
    price: "3盒 NT$ 1,100",
    image: "/products/probiotic-bc-ca.jpg",
    description: "3g x 30包 / 盒。BC-198芽孢桿菌，維持消化道機能。",
  },
  {
    id: 2,
    name: "蔓越莓益生菌速酵力配方",
    category: "保健食品",
    series: "益生菌系列",
    price: "3盒 NT$ 1,600",
    image: "/products/probiotic-cranberry.jpg",
    description: "3g x 30包 / 盒。蔓越莓益生菌配方。",
  },
  {
    id: 3,
    name: "BC-HA複合益生菌",
    category: "保健食品",
    series: "益生菌系列",
    price: "NT$ 1,500",
    image: "/products/BCHA.jpg",
    description: "3g x 60包 / 盒。複合益生菌保健品項。",
  },
  {
    id: 4,
    name: "EC晶眸葉黃素",
    category: "保健食品",
    series: "晶眸保健系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "精華凍 + 精華飲綜合組。",
  },
  {
    id: 5,
    name: "亮妍魚膠原蛋白飲",
    category: "保健食品",
    series: "美妍飲品系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "美妍保健飲品。",
  },

  {
    id: 6,
    name: "薰衣草肌安舒緩化妝水",
    category: "保養品",
    series: "薰衣草系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "150mL。薰衣草肌安舒緩系列。",
  },
  {
    id: 7,
    name: "薰衣草肌安舒緩精華液",
    category: "保養品",
    series: "薰衣草系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "30mL。薰衣草肌安舒緩系列。",
  },
  {
    id: 8,
    name: "薰衣草肌安舒緩保濕乳",
    category: "保養品",
    series: "薰衣草系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "100mL。薰衣草肌安舒緩系列。",
  },

  {
    id: 9,
    name: "冷杉型男淨化潔顏乳",
    category: "保養品",
    series: "冰河系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "120mL。冰河系列保養品。",
  },
  {
    id: 10,
    name: "冷杉型男淨化保濕化妝水",
    category: "保養品",
    series: "冰河系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "150mL。冰河系列保養品。",
  },
  {
    id: 11,
    name: "冷杉型男淨化保濕乳",
    category: "保養品",
    series: "冰河系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "100mL。冰河系列保養品。",
  },
  {
    id: 12,
    name: "冷杉酷涼活絡精油滾珠",
    category: "保養品",
    series: "冰河系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "9mL。滾珠型精油品項。",
  },

  {
    id: 13,
    name: "玫瑰超微晶萃潔顏慕絲",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "150mL。玫瑰超微晶萃系列。",
  },
  {
    id: 14,
    name: "玫瑰超微晶萃活膚液",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "130mL。玫瑰超微晶萃系列。",
  },
  {
    id: 15,
    name: "玫瑰超微晶萃瞬效乳",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "130mL。玫瑰超微晶萃系列。",
  },
  {
    id: 16,
    name: "玫瑰超微晶萃瞬效霜",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "50g。玫瑰超微晶萃系列。",
  },

  {
    id: 17,
    name: "龍血求麗化妝水",
    category: "保養品",
    series: "龍血系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "龍血系列保養品。",
  },
  {
    id: 18,
    name: "龍血求麗修護乳",
    category: "保養品",
    series: "龍血系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "龍血系列保養品。",
  },
  {
    id: 19,
    name: "龍血求麗修護霜",
    category: "保養品",
    series: "龍血系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "龍血系列保養品。",
  },
  {
    id: 20,
    name: "龍血精華液",
    category: "保養品",
    series: "龍血系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "龍血系列保養品。",
  },

  {
    id: 21,
    name: "肌光緊緻速妍雪膚液",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "肌光緊緻速妍系列。",
  },
  {
    id: 22,
    name: "肌光緊緻速妍精華露",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "肌光緊緻速妍系列。",
  },
  {
    id: 23,
    name: "肌光緊緻速妍霜",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "肌光緊緻速妍系列。",
  },
  {
    id: 24,
    name: "肌光緊緻速妍面膜",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "肌光緊緻速妍系列。",
  },

  {
    id: 25,
    name: "INSK乳酸平衡機能水",
    category: "保養品",
    series: "INSK乳酸平衡系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "INSK乳酸平衡系列。",
  },
  {
    id: 26,
    name: "INSK乳酸平衡修護乳",
    category: "保養品",
    series: "INSK乳酸平衡系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "INSK乳酸平衡系列。",
  },

  {
    id: 27,
    name: "BA-5肌密抗皺精華",
    category: "保養品",
    series: "BA-5肌密抗皺系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "BA-5肌密抗皺系列。",
  },
  {
    id: 28,
    name: "BA-5肌密抗皺霜",
    category: "保養品",
    series: "BA-5肌密抗皺系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "BA-5肌密抗皺系列。",
  },

  {
    id: 29,
    name: "龍血求麗頭皮修護洗髮精",
    category: "洗沐",
    series: "洗沐系列",
    price: "3瓶 NT$ 1,100",
    image: "/products/placeholder.jpg",
    description: "龍血洗髮沐浴系列，可搭配活動組合。",
  },
  {
    id: 30,
    name: "阿甘絲柔洗髮精",
    category: "洗沐",
    series: "洗沐系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "洗髮品項。",
  },
  {
    id: 31,
    name: "純淨洗髮精",
    category: "洗沐",
    series: "洗沐系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "洗髮品項。",
  },
  {
    id: 32,
    name: "龍血求麗潤澤修護沐浴乳",
    category: "洗沐",
    series: "洗沐系列",
    price: "3瓶 NT$ 1,100",
    image: "/products/placeholder.jpg",
    description: "龍血洗髮沐浴系列，可搭配活動組合。",
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<MainCategory>("全部");
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
          <p>今日產地價</p>
        </div>
      </header>

      <section className="hero">
        <p className="small-title">Price List</p>
        <h2>佐登妮絲城堡產地價</h2>
        <p>快速查看目前商品價格與優惠組合，價格依當日公告為準。</p>
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
        <h2>價格提醒</h2>
        <p>商品價格與優惠組合依當日公告為準。</p>
      </footer>
    </main>
  );
}