"use client";

import { useState } from "react";

const lineBaseUrl = "https://line.me/R/oaMessage/@你的LINE官方帳號ID/?text=";

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
    "肌光緊緻系列",
  ],
  保健食品: ["益生菌系列"],
  洗沐類用品: ["添加精油系列", "肥皂系列"],
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
    name: "蔓越莓益生菌速酵力配方 3g x 30包 / 盒",
    category: "保健食品",
    series: "益生菌系列",
    price: "價格待補",
    image: "/products/health-1.jpg",
    description: "保健食品品項，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 2,
    name: "BC-CA複合益生菌高鈣活力配方 3g x 30包 / 盒",
    category: "保健食品",
    series: "益生菌系列",
    price: "價格待補",
    image: "/products/health-2.jpg",
    description: "保健食品品項，詳細使用方式可透過 LINE 詢問。",
  },
  {
    id: 3,
    name: "BC-HA複合益生菌 3g x 60包",
    category: "保健食品",
    series: "益生菌系列",
    price: "價格待補",
    image: "/products/health-3.jpg",
    description: "保健食品品項，詳細使用方式可透過 LINE 詢問。",
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
          <h1>JOURDENESS</h1>
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
        <h2>產品分類與價格</h2>
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