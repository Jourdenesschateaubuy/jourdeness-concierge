import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
}

function write(path, source) {
  fs.writeFileSync(path, source, "utf8");
}

function replaceOnce(source, before, after, label) {
  const count = source.split(before).length - 1;

  if (count !== 1) {
    throw new Error(
      `${label}：預期找到 1 處，實際找到 ${count} 處`
    );
  }

  return source.replace(before, after);
}

// --------------------------------------------------
// ProductForm：舊標準價格轉成後台純數字
// --------------------------------------------------

const productFormPath =
  "app/admin/products/_components/ProductForm.tsx";

let productForm = read(productFormPath);

productForm = replaceOnce(
  productForm,
  `const categories = Object.keys(categoryConfig);`,
  `const categories = Object.keys(categoryConfig);

function normalizeOriginalPriceInput(value: string) {
  const match = value.trim().match(/^原價\\s*\\$\\s*([\\d,]+)$/);
  return match ? match[1].replace(/,/g, "") : value;
}

function normalizeSellingPriceInput(value: string) {
  const match = value.trim().match(/^產地價\\s*\\$\\s*([\\d,]+)$/);
  return match ? match[1].replace(/,/g, "") : value;
}`,
  "ProductForm：加入輸入正規化"
);

productForm = replaceOnce(
  productForm,
  `  const initialOriginalPrice = product?.originalPrice ?? "";`,
  `  const initialOriginalPrice = normalizeOriginalPriceInput(
    product?.originalPrice ?? ""
  );`,
  "ProductForm：正規化原價"
);

productForm = replaceOnce(
  productForm,
  `              defaultValue={product?.price ?? ""}`,
  `              defaultValue={normalizeSellingPriceInput(
                product?.price ?? ""
              )}`,
  "ProductForm：正規化售價"
);

write(productFormPath, productForm);

// --------------------------------------------------
// ProductCardEditForm：輸入與即時預覽格式化
// --------------------------------------------------

const cardFormPath =
  "app/admin/products/_components/ProductCardEditForm.tsx";

let cardForm = read(cardFormPath);

cardForm = replaceOnce(
  cardForm,
  `const categories = Object.keys(categoryConfig);`,
  `const categories = Object.keys(categoryConfig);

function normalizeOriginalPriceInput(value: string) {
  const match = value.trim().match(/^原價\\s*\\$\\s*([\\d,]+)$/);
  return match ? match[1].replace(/,/g, "") : value;
}

function normalizeSellingPriceInput(value: string) {
  const match = value.trim().match(/^產地價\\s*\\$\\s*([\\d,]+)$/);
  return match ? match[1].replace(/,/g, "") : value;
}

function formatMoney(value: string) {
  const normalized = value.trim().replace(/,/g, "");

  if (!/^\\d+$/.test(normalized)) return null;

  return Number(normalized).toLocaleString("en-US");
}

function formatOriginalPricePreview(value: string) {
  const formatted = formatMoney(value);
  return formatted ? \`原價 $ \${formatted}\` : value;
}

function formatSellingPricePreview(
  value: string,
  category: string
) {
  const formatted = formatMoney(value);

  if (!formatted) return value;

  const label =
    category === "外部廠商"
      ? "售價"
      : category === "組合價"
        ? "活動價"
        : "產地價";

  return \`\${label} $ \${formatted}\`;
}`,
  "ProductCardEditForm：加入價格函式"
);

cardForm = replaceOnce(
  cardForm,
  `  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice ?? ""
  );`,
  `  const [originalPrice, setOriginalPrice] = useState(
    normalizeOriginalPriceInput(product.originalPrice ?? "")
  );`,
  "ProductCardEditForm：正規化原價"
);

cardForm = replaceOnce(
  cardForm,
  `  const [price, setPrice] = useState(product.price ?? "");`,
  `  const [price, setPrice] = useState(
    normalizeSellingPriceInput(product.price ?? "")
  );`,
  "ProductCardEditForm：正規化售價"
);

cardForm = replaceOnce(
  cardForm,
  `            {originalPrice && <del>{originalPrice}</del>}

            <b>{price || "尚未設定售價"}</b>`,
  `            {originalPrice && (
              <del>{formatOriginalPricePreview(originalPrice)}</del>
            )}

            <b>
              {price
                ? formatSellingPricePreview(price, category)
                : "尚未設定售價"}
            </b>`,
  "ProductCardEditForm：格式化即時預覽"
);

write(cardFormPath, cardForm);

// --------------------------------------------------
// app/page.tsx：前台集中格式化
// --------------------------------------------------

const pagePath = "app/page.tsx";
let page = read(pagePath);

page = replaceOnce(
  page,
  `  function hasKnownOriginalPrice(product: Product) {`,
  `  function formatMoneyValue(value: string) {
    const normalized = value.trim().replace(/,/g, "");

    if (!/^\\d+$/.test(normalized)) return null;

    return Number(normalized).toLocaleString("en-US");
  }

  function displayOriginalPrice(product: Product) {
    const value = product.originalPrice?.trim() ?? "";
    const legacyMatch = value.match(
      /^原價\\s*\\$\\s*([\\d,]+)$/
    );
    const formatted = formatMoneyValue(
      legacyMatch?.[1] ?? value
    );

    return formatted ? \`原價 $ \${formatted}\` : value;
  }

  function hasKnownOriginalPrice(product: Product) {`,
  "app/page：加入原價格式化"
);

page = replaceOnce(
  page,
  `  function displayPrice(product: Product) {
    if (hasInquiryPrice(product)) return "售價請洽小幫手";
    return product.price;
  }`,
  `  function displayPrice(product: Product) {
    if (hasInquiryPrice(product)) return "售價請洽小幫手";

    const value = product.price.trim();
    const legacyMatch = value.match(
      /^產地價\\s*\\$\\s*([\\d,]+)$/
    );
    const formatted = formatMoneyValue(
      legacyMatch?.[1] ?? value
    );

    if (!formatted) return value;

    const label =
      product.category === "外部廠商"
        ? "售價"
        : product.category === "組合價"
          ? "活動價"
          : "產地價";

    return \`\${label} $ \${formatted}\`;
  }`,
  "app/page：格式化售價"
);

const originalDisplays = [
  [
    `<p className="original-price">{product.originalPrice}</p>`,
    `<p className="original-price">{displayOriginalPrice(product)}</p>`,
  ],
  [
    `{hasKnownOriginalPrice(product) && <span>{product.originalPrice}</span>}`,
    `{hasKnownOriginalPrice(product) && (
                            <span>{displayOriginalPrice(product)}</span>
                          )}`,
  ],
  [
    `<span className="original-price">{selectedDetailProduct.originalPrice}</span>`,
    `<span className="original-price">
                      {displayOriginalPrice(selectedDetailProduct)}
                    </span>`,
  ],
];

for (const [before, after] of originalDisplays) {
  page = replaceOnce(
    page,
    before,
    after,
    `app/page：更新原價顯示 ${before}`
  );
}

write(pagePath, page);

console.log("✓ 後台標準原價已轉為純數字輸入");
console.log("✓ 後台標準售價已轉為純數字輸入");
console.log("✓ 即時預覽已加入固定文字與千分位");
console.log("✓ 前台商品卡、搜尋及詳情價格已格式化");
console.log("✓ 特殊價格文字維持原樣");
