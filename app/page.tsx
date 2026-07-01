"use client";

import { useState } from "react";

const lineBaseUrl = "https://line.me/R/oaMessage/@@chateau-buy/?text=";

const categoryConfig = {
  保養品: [
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
    "櫻の雪傳明酸美白（日本吉野櫻）系列",
    "茶樹控油系列（油痘肌適用）",
  ],
  保健食品: ["益生菌系列", "晶眸保健系列", "美妍飲品系列"],
  洗沐類用品: ["添加精油系列", "洗沐系列"],
  牙膏: ["牙膏"],
  肥皂: ["肥皂"],
} as const;

type MainCategory = keyof typeof categoryConfig;

type Product = {
  id: number;
  name: string;
  category: MainCategory;
  series: string;
  price: string;
  image: string;
  description?: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "BC-CA複合益生菌高鈣活力配方3gx30包/盒",
    category: "保健食品",
    series: "益生菌系列",
    price: "3 盒 NT$ 1,100",
    image: "/products/BC-HA複合益生菌.jpg",
    description: "BC-198芽孢桿菌，維持消化道機能，詳細食用方式可透過 LINE 詢問。",
  },
  {
    id: 2,
    name: "蔓越莓益生菌保護力配方 3g x 30包",
    category: "保健食品",
    series: "益生菌系列",
    price: "3盒 NT$ 1,600",
    image: "/products/蔓越莓益生菌.jpg",
    description: "蔓越莓益生菌保護力配方，詳細食用方式可透過 LINE 詢問。",
  },
  {
    id: 3,
    name: "BC-HA複合益生菌 3g x 60包 / 盒",
    category: "保健食品",
    series: "益生菌系列",
    price: "NT$ 1,500",
    image: "/products/RCHA.jpg",
    description: "BC-HA複合益生菌，詳細食用方式可透過 LINE 詢問。",
  },
  {
    id: 4,
    name: "EC晶眸葉黃素（精華凍 + 精華飲綜合組）",
    category: "保健食品",
    series: "晶眸保健系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "晶眸葉黃素綜合組，詳細內容可透過 LINE 詢問。",
  },
  {
    id: 5,
    name: "亮妍魚膠原蛋白飲",
    category: "保健食品",
    series: "美妍飲品系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "美妍保健飲品，詳細內容可透過 LINE 詢問。",
  },

  {
    id: 6,
    name: "薰衣草肌安舒緩化妝水 150mL",
    category: "保養品",
    series: "薰衣草系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "薰衣草肌安舒緩系列，適合日常保養使用。",
  },
  {
    id: 7,
    name: "薰衣草肌安舒緩精華液 30mL",
    category: "保養品",
    series: "薰衣草系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "薰衣草肌安舒緩系列，適合日常保養使用。",
  },
  {
    id: 8,
    name: "薰衣草肌安舒緩保濕乳 100mL",
    category: "保養品",
    series: "薰衣草系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "薰衣草肌安舒緩系列，適合日常保養使用。",
  },

  {
    id: 9,
    name: "冷杉型男淨化潔顏乳 120mL",
    category: "保養品",
    series: "冰河系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "冰河系列保養品，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 10,
    name: "冷杉型男淨化保濕化妝水 150mL",
    category: "保養品",
    series: "冰河系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "冰河系列保養品，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 11,
    name: "冷杉型男淨化保濕乳 100mL",
    category: "保養品",
    series: "冰河系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "冰河系列保養品，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 12,
    name: "冷杉酷涼活絡精油滾珠 9mL",
    category: "保養品",
    series: "冰河系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "冰河系列保養品，詳細使用方式可透過 LINE 詢問。",
  },

  {
    id: 13,
    name: "玫瑰超微晶萃潔顏慕絲 150mL",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "玫瑰超微晶萃系列，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 14,
    name: "玫瑰超微晶萃活膚液 130mL",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "玫瑰超微晶萃系列，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 15,
    name: "玫瑰超微晶萃瞬效乳 130mL",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "玫瑰超微晶萃系列，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 16,
    name: "玫瑰超微晶萃瞬效霜 50g",
    category: "保養品",
    series: "玫瑰超微晶萃系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "玫瑰超微晶萃系列，詳細使用方式可透過 LINE 詢問。",
  },

  {
    id: 17,
    name: "龍血求麗化妝水",
    category: "保養品",
    series: "龍血系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "龍血系列保養品，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 18,
    name: "龍血求麗修護乳",
    category: "保養品",
    series: "龍血系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "龍血系列保養品，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 19,
    name: "龍血求麗修護霜",
    category: "保養品",
    series: "龍血系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "龍血系列保養品，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 20,
    name: "龍血精華液",
    category: "保養品",
    series: "龍血系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "龍血系列保養品，詳細使用方式可透過 LINE 詢問。",
  },

  {
    id: 21,
    name: "肌光緊緻速妍雪膚液",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "肌光緊緻速妍系列，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 22,
    name: "肌光緊緻速妍精華露",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "肌光緊緻速妍系列，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 23,
    name: "肌光緊緻速妍霜",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "肌光緊緻速妍系列，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 24,
    name: "肌光緊緻速妍面膜",
    category: "保養品",
    series: "肌光緊緻速妍系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "肌光緊緻速妍系列，詳細使用方式可透過 LINE 詢問。",
  },

  {
    id: 25,
    name: "INSK乳酸平衡機能水",
    category: "保養品",
    series: "INSK乳酸平衡系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "INSK乳酸平衡系列，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 26,
    name: "INSK乳酸平衡修護乳",
    category: "保養品",
    series: "INSK乳酸平衡系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "INSK乳酸平衡系列，詳細使用方式可透過 LINE 詢問。",
  },

  {
    id: 27,
    name: "BA-5肌密抗皺精華",
    category: "保養品",
    series: "BA-5肌密抗皺系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "BA-5肌密抗皺系列，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 28,
    name: "BA-5肌密抗皺霜",
    category: "保養品",
    series: "BA-5肌密抗皺系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "BA-5肌密抗皺系列，詳細使用方式可透過 LINE 詢問。",
  },

  {
    id: 29,
    name: "龍血求麗頭皮修護洗髮精",
    category: "洗沐類用品",
    series: "洗沐系列",
    price: "3瓶 NT$ 1,100",
    image: "/products/placeholder.jpg",
    description: "龍血洗髮沐浴系列，可透過 LINE 詢問搭配方式。",
  },
  {
    id: 30,
    name: "阿甘絲柔洗髮精",
    category: "洗沐類用品",
    series: "洗沐系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "洗沐系列用品，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 31,
    name: "純淨洗髮精",
    category: "洗沐類用品",
    series: "洗沐系列",
    price: "價格待補",
    image: "/products/placeholder.jpg",
    description: "洗沐系列用品，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 32,
    name: "龍血求麗潤澤修護沐浴乳",
    category: "洗沐類用品",
    series: "洗沐系列",
    price: "3瓶 NT$ 1,100",
    image: "/products/placeholder.jpg",
    description: "龍血洗髮沐浴系列，可透過 LINE 詢問搭配方式。",
  },
];
function lineLink(productName: string) {
  const message = `您好，我想詢問這項產品：${productName}`;
  return `${lineBaseUrl}${encodeURIComponent(message)}`;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<MainCategory>("保養品");
  const [selectedSeries, setSelectedSeries] = useState("全部");

  const mainCategories = Object.keys(categoryConfig) as MainCategory[];

  const seriesList = ["全部", ...categoryConfig[selectedCategory]];

  const filteredProducts = products.filter((product) => {
    const matchCategory = product.category === selectedCategory;
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
    <p>產品與價格</p>
  </div>

        <a
          className="line-button"
          href={lineLink("產品")}
          target="_blank"
          rel="noopener noreferrer"
        >
          LINE 詢問
        </a>
      </header>

      <section className="hero">
  <p className="small-title">Product List</p>
  <h2>佐登妮絲城堡產地價</h2>
        <p>
          選擇分類與系列後，即可查看產品圖片、名稱與價格。需要庫存、使用方式或購買方式，
          可以直接透過 LINE 詢問。
        </p>
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

        <p className="product-count">
          目前分類：{selectedCategory}
          {selectedSeries !== "全部" ? ` / ${selectedSeries}` : ""}，
          顯示 {filteredProducts.length} 項產品
        </p>
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

                {product.description ? (
                  <p className="description">{product.description}</p>
                ) : null}

                <p className="price">{product.price}</p>

                <a
                  className="product-button"
                  href={lineLink(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  詢問 / 下單
                </a>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-section">
          <div className="empty-card">
            <h3>此系列產品整理中</h3>
            <p>
              目前已建立分類架構，產品圖片、名稱與價格可以之後再逐項加入。
            </p>

            <a
              className="line-button"
              href={lineLink(`${selectedCategory} ${selectedSeries}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              透過 LINE 詢問
            </a>
          </div>
        </section>
      )}

      <footer className="footer">
        <h2>找不到想看的產品嗎？</h2>
        <p>可以直接透過 LINE 詢問產品、價格、庫存或使用方式。</p>

        <a
          className="line-button"
          href={lineLink("產品")}
          target="_blank"
          rel="noopener noreferrer"
        >
          開啟 LINE
        </a>
      </footer>
    </main>
  );
}