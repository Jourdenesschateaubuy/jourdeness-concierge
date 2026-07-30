import fs from "node:fs";

const path = "./app/page.tsx";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

function replaceOnce(before, after, label) {
  if (!source.includes(before)) {
    console.error(`❌ 找不到：${label}`);
    process.exit(1);
  }

  source = source.replace(before, after);
}

/* 商品標籤判斷：資料庫 suitableFor 優先 */
replaceOnce(
`    const configuredTags = productContent(product).suitableFor ?? product.suitableFor ?? [];`,
`    const configuredTags =
      product.suitableFor?.length
        ? product.suitableFor
        : productContent(product).suitableFor ?? [];`,
  "商品需求標籤"
);

/* 商品卡名稱 */
replaceOnce(
`    return productContent(product).cardName ?? product.cardName ?? product.name;`,
`    return product.cardName ?? productContent(product).cardName ?? product.name;`,
  "商品卡名稱"
);

/* 商品卡副標 */
replaceOnce(
`    const customSubtitle = content.cardSubtitle ?? product.cardSubtitle;
    const intro = content.intro ?? product.intro;`,
`    const customSubtitle = product.cardSubtitle ?? content.cardSubtitle;
    const intro = product.intro ?? content.intro;`,
  "商品卡副標"
);

/* 詳情名稱 */
replaceOnce(
`    return productContent(product).name ?? product.name;`,
`    return product.name || productContent(product).name || "";`,
  "商品詳情名稱"
);

/* 詳情頁上方規格 */
replaceOnce(
`    const spec = productContent(product).spec ?? product.spec;`,
`    const spec = product.spec ?? productContent(product).spec;`,
  "第一個規格來源"
);

/* 價格下方說明 */
replaceOnce(
`    if (productContent(product).priceNote || product.priceNote) {
      return productContent(product).priceNote ?? product.priceNote ?? "";
    }`,
`    if (product.priceNote || productContent(product).priceNote) {
      return product.priceNote ?? productContent(product).priceNote ?? "";
    }`,
  "價格說明"
);

/* 商品介紹 */
replaceOnce(
`  function getIntroText(product: Product) {
    return productContent(product).intro ?? product.intro ?? "";
  }`,
`  function getIntroText(product: Product) {
    return product.intro ?? productContent(product).intro ?? "";
  }`,
  "商品介紹"
);

/* 商品資訊規格 */
replaceOnce(
`  function getSpecText(product: Product) {
    const spec = productContent(product).spec ?? product.spec;
    if (spec) return spec;
    return product.description.split("。")[0] || "依商品標示";
  }`,
`  function getSpecText(product: Product) {
    const spec = product.spec ?? productContent(product).spec;
    if (spec) return spec;
    return product.description.split("。")[0] || "依商品標示";
  }`,
  "商品資訊規格"
);

/* 效期：後台有設定時一定優先 */
replaceOnce(
`  function getExpiryNote(product: Product) {
    if (!shouldShowExpiryInfo(product)) return "";

    if (product.expiryNote !== undefined) return product.expiryNote;`,
`  function getExpiryNote(product: Product) {
    if (product.expiryNote !== undefined) {
      return product.expiryNote;
    }

    if (!shouldShowExpiryInfo(product)) return "";`,
  "效期"
);

/* 配送／注意事項 */
replaceOnce(
`  function getNoticeText(product: Product) {
    return productContent(product).notice ?? product.notice ?? "";
  }`,
`  function getNoticeText(product: Product) {
    return (
      product.notice ??
      productContent(product).notice ??
      "滿 NT$3,000 享免運，僅提供宅配。\\n送出資料後，請至 LINE 與小幫手確認庫存、效期、金額、付款方式與宅配資訊。"
    );
  }

  function getExpandedInfo(product: Product) {
    if (product.expandedInfo?.length) {
      return product.expandedInfo;
    }

    return productContent(product).expandedInfo ?? [];
  }`,
  "配送提醒與了解更多"
);

/* 適合需求 */
replaceOnce(
`    const customItems = productContent(product).suitableFor ?? product.suitableFor;
    if (customItems?.length) return customItems;`,
`    const customItems =
      product.suitableFor?.length
        ? product.suitableFor
        : productContent(product).suitableFor;

    if (customItems?.length) return customItems;`,
  "適合需求"
);

/* 使用方式 */
replaceOnce(
`    const customUsage = productContent(product).usage ?? product.usage;
    if (customUsage) return customUsage;`,
`    const customUsage =
      product.usage || productContent(product).usage;

    if (customUsage) return customUsage;`,
  "使用方式"
);

/* 商品特色：資料庫優先，而且不截斷 */
replaceOnce(
`    const customFeatures = productContent(product).features ?? product.features;
    if (customFeatures?.length) return customFeatures.slice(0, 5);`,
`    const customFeatures =
      product.features?.length
        ? product.features
        : productContent(product).features;

    if (customFeatures?.length) return customFeatures;`,
  "商品特色"
);

/* 了解更多：資料庫優先 */
source = source.replace(
  /productContent\(selectedDetailProduct\)\.expandedInfo\?\.length/g,
  "getExpandedInfo(selectedDetailProduct).length"
);

source = source.replace(
  /productContent\(selectedDetailProduct\)\.expandedInfo\?\.map/g,
  "getExpandedInfo(selectedDetailProduct).map"
);

/* 配送提醒改成後台 notice，一行顯示一段 */
replaceOnce(
`              <section className="detail-info-block soft">
                <h3>配送提醒</h3>
                <p>滿 NT$3,000 享免運，僅提供宅配。</p>
                <p>送出資料後，請至 LINE 與小幫手確認庫存、效期、金額、付款方式與宅配資訊。</p>
              </section>`,
`              <section className="detail-info-block soft">
                <h3>配送提醒</h3>
                {getNoticeText(selectedDetailProduct)
                  .split(/\\n+/)
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, index) => (
                    <p key={\`notice-\${selectedDetailProduct.id}-\${index}\`}>
                      {line}
                    </p>
                  ))}
              </section>`,
  "前台配送提醒"
);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 商品名稱／副標改為資料庫優先");
console.log("✅ 規格／介紹／價格說明改為資料庫優先");
console.log("✅ 商品特色／適合需求／使用方式改為資料庫優先");
console.log("✅ 商品特色不再限制 5 條");
console.log("✅ 了解更多改為資料庫優先");
console.log("✅ 配送提醒正式接上後台 notice");
