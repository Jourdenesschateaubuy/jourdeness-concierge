const lineBaseUrl = "https://line.me/R/oaMessage/@chateau-buy/?text=";

const products = [
  {
    name: "晶鑽白金靚顏霜",
    price: "NT$ 2,980",
    image: "/products/product-1.jpg",
    description: "保濕、修護、提升肌膚光澤感。",
  },
  {
    name: "玻尿酸保濕精華",
    price: "NT$ 1,880",
    image: "/products/product-2.jpg",
    description: "適合乾燥、缺水、妝前保濕使用。",
  },
  {
    name: "舒敏修護精華",
    price: "NT$ 2,280",
    image: "/products/product-3.jpg",
    description: "適合敏弱、泛紅、膚況不穩時使用。",
  },
  {
    name: "亮白煥膚精華",
    price: "NT$ 2,680",
    image: "/products/product-4.jpg",
    description: "改善暗沉，提升肌膚明亮感。",
  },
  {
    name: "緊緻修護乳霜",
    price: "NT$ 3,280",
    image: "/products/product-5.jpg",
    description: "適合細紋、乾燥、彈性下降肌膚。",
  },
  {
    name: "清透平衡化妝水",
    price: "NT$ 1,280",
    image: "/products/product-6.jpg",
    description: "調理油水平衡，讓肌膚維持清爽穩定。",
  },
];

function lineLink(productName: string) {
  const message = `您好，我想詢問這項產品：${productName}`;
  return `${lineBaseUrl}${encodeURIComponent(message)}`;
}

export default function Home() {
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
        <h2>簡單查看產品與價格</h2>
        <p>
          點選喜歡的產品，即可透過 LINE 詢問庫存、使用方式與購買方式。
        </p>
      </section>

      <section className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.name}>
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>

            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="description">{product.description}</p>
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

      <footer className="footer">
        <h2>需要協助嗎？</h2>
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