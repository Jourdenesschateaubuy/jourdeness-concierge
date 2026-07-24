import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "app", "page.tsx");
const backupDir = path.join(root, "backup");
const backupPath = path.join(backupDir, "page-before-buyget-v3c1b.txt");

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pagePath)) {
  fail("找不到 app/page.tsx");
}

let source = fs.readFileSync(pagePath, "utf8");

if (source.includes("getBuyGetGiftQuantityV3C1B")) {
  console.log("ℹ️ Phase 3C-1B 已套用，不重複修改。");
  process.exit(0);
}

const requiredMarkers = [
  "getBuyGetConfigV3C1A",
  "const productItemsText = cartItems",
  "<strong>{getCartItemDisplayPrice(item)}</strong>",
  "const cartRegularSubtotalV361 = cartItems.reduce(",
];

for (const marker of requiredMarkers) {
  if (!source.includes(marker)) {
    fail(`找不到 Phase 3C-1B 插入點：${marker}`);
  }
}

fs.mkdirSync(backupDir, { recursive: true });
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, source, "utf8");
  console.log(`✅ 備份：${path.relative(root, backupPath)}`);
}

// ---------------------------------------------------------------------------
// 1) 買送計算 helper：免費品不寫入 cartItems，所以永遠不會被計價。
//    任搭組合優先：combo item 或目前有 combo config 的商品不套買送。
// ---------------------------------------------------------------------------
const helper = `
  function getBuyGetGiftQuantityV3C1B(item: CartItem) {
    const config = getBuyGetConfigV3C1A(item.product.id);

    if (!config) return 0;
    if (config.giftMode !== "same_product") return 0;
    if (item.comboSelections) return 0;
    if (getComboConfig(item.product.id)) return 0;
    if (config.buyQuantity <= 0 || config.giftQuantity <= 0) return 0;

    const qualifyingSets = config.repeatable
      ? Math.floor(item.quantity / config.buyQuantity)
      : item.quantity >= config.buyQuantity
        ? 1
        : 0;

    return qualifyingSets * config.giftQuantity;
  }

  function getBuyGetLabelV3C1B(item: CartItem) {
    const config = getBuyGetConfigV3C1A(item.product.id);
    if (!config) return "";

    return \`買\${config.buyQuantity}送\${config.giftQuantity}\`;
  }

  const cartBuyGetGiftTotalV3C1B = cartItems.reduce(
    (total, item) => total + getBuyGetGiftQuantityV3C1B(item),
    0
  );

`;

source = source.replace(
  "  const cartRegularSubtotalV361 = cartItems.reduce(",
  helper + "  const cartRegularSubtotalV361 = cartItems.reduce("
);

// ---------------------------------------------------------------------------
// 2) LINE / 訂單文字：在每個商品後附上免費贈品。
// ---------------------------------------------------------------------------
const orderStart = source.indexOf("const productItemsText = cartItems");
const orderEnd = source.indexOf("const maskPromotionOrderText", orderStart);

if (orderStart < 0 || orderEnd < 0) {
  fail("找不到訂單商品文字區塊。");
}

let orderBlock = source.slice(orderStart, orderEnd);

const comboJoinMarker = `.join("\\n");

        return \`\${item.product.name} x \${item.quantity} | \${getCartItemDisplayPrice(item)}\${`;
const comboJoinMarkerAlt = `.join("\\n");

        return \`\${item.product.name} × \${item.quantity}｜\${getCartItemDisplayPrice(item)}\${`;

let returnMarker = null;
if (orderBlock.includes(comboJoinMarker)) {
  returnMarker = comboJoinMarker;
} else if (orderBlock.includes(comboJoinMarkerAlt)) {
  returnMarker = comboJoinMarkerAlt;
}

if (!returnMarker) {
  // 用較寬鬆的方式找 comboDetails 後的 return。
  const regex =
    /(\.join\("\\n"\);\s*)(return `\$\{item\.product\.name\}[^`]*getCartItemDisplayPrice\(item\)[\s\S]*?`;)/m;
  const match = orderBlock.match(regex);
  if (!match) {
    fail("找不到 productItemsText 的 return 區塊。");
  }

  const originalReturn = match[2];
  const enhancedReturn = `const buyGetGiftQuantityV3C1B =
          getBuyGetGiftQuantityV3C1B(item);
        const buyGetGiftTextV3C1B =
          buyGetGiftQuantityV3C1B > 0
            ? \`🎁【\${getBuyGetLabelV3C1B(item)}】免費贈送 \${item.product.name} × \${buyGetGiftQuantityV3C1B}\`
            : "";

        ${originalReturn.replace(
          /`;$/,
          '${buyGetGiftTextV3C1B ? `\\n${buyGetGiftTextV3C1B}` : ""}`;'
        )}`;

  orderBlock = orderBlock.replace(
    match[0],
    match[1] + enhancedReturn
  );
} else {
  // 目前正式版常見格式；若命中則走 regex 分支會更安全。
  const regex =
    /(\.join\("\\n"\);\s*)(return `\$\{item\.product\.name\}[^`]*getCartItemDisplayPrice\(item\)[\s\S]*?`;)/m;
  const match = orderBlock.match(regex);
  if (!match) {
    fail("找不到 productItemsText 的 return 區塊。");
  }

  const originalReturn = match[2];
  const enhancedReturn = `const buyGetGiftQuantityV3C1B =
          getBuyGetGiftQuantityV3C1B(item);
        const buyGetGiftTextV3C1B =
          buyGetGiftQuantityV3C1B > 0
            ? \`🎁【\${getBuyGetLabelV3C1B(item)}】免費贈送 \${item.product.name} × \${buyGetGiftQuantityV3C1B}\`
            : "";

        ${originalReturn.replace(
          /`;$/,
          '${buyGetGiftTextV3C1B ? `\\n${buyGetGiftTextV3C1B}` : ""}`;'
        )}`;

  orderBlock = orderBlock.replace(
    match[0],
    match[1] + enhancedReturn
  );
}

source =
  source.slice(0, orderStart) +
  orderBlock +
  source.slice(orderEnd);

// ---------------------------------------------------------------------------
// 3) 購物車 UI：在商品價格下直接顯示買送與免費贈品。
//    只處理購物車商品明細區的第一個價格 strong。
// ---------------------------------------------------------------------------
const cartListStart = source.indexOf(
  '<div className="cart-item-list-v355">'
);

if (cartListStart < 0) {
  fail("找不到購物車商品列表。");
}

const cartListEnd = source.indexOf("</section>", cartListStart);
if (cartListEnd < 0) {
  fail("找不到購物車商品列表結尾。");
}

let cartBlock = source.slice(cartListStart, cartListEnd);

const priceMarker = "<strong>{getCartItemDisplayPrice(item)}</strong>";

if (!cartBlock.includes(priceMarker)) {
  fail("購物車商品列找不到價格插入點。");
}

const giftUi = `${priceMarker}

                              {getBuyGetGiftQuantityV3C1B(item) > 0 && (
                                <div
                                  className="cart-buyget-gift-v3c1b"
                                  style={{
                                    marginTop: 8,
                                    padding: "9px 10px",
                                    borderRadius: 10,
                                    background: "#f8eee5",
                                    border: "1px solid rgba(154, 48, 66, 0.16)",
                                    display: "grid",
                                    gap: 3,
                                  }}
                                >
                                  <b
                                    style={{
                                      color: "#9a3042",
                                      fontSize: 12,
                                      fontWeight: 900,
                                    }}
                                  >
                                    {getBuyGetLabelV3C1B(item)}
                                  </b>
                                  <span
                                    style={{
                                      color: "#6a4a3a",
                                      fontSize: 11,
                                      fontWeight: 800,
                                      lineHeight: 1.45,
                                    }}
                                  >
                                    🎁 免費贈送 {item.product.name} ×{" "}
                                    {getBuyGetGiftQuantityV3C1B(item)}
                                  </span>
                                </div>
                              )}`;

cartBlock = cartBlock.replace(priceMarker, giftUi);

source =
  source.slice(0, cartListStart) +
  cartBlock +
  source.slice(cartListEnd);

// ---------------------------------------------------------------------------
// 4) 底部件數補充：不改 paid cart count，只額外標示免費贈品數。
// ---------------------------------------------------------------------------
const countMarker = "<span>共 {cartTotalQuantity} 件</span>";
if (source.includes(countMarker)) {
  source = source.replace(
    countMarker,
    `<span>
                          共 {cartTotalQuantity} 件
                          {cartBuyGetGiftTotalV3C1B > 0 &&
                            \` ＋ 贈\${cartBuyGetGiftTotalV3C1B}件\`}
                        </span>`
  );
}

// ---------------------------------------------------------------------------
// 5) payload items 補一個安全的 gift quantity 欄位；舊後端可忽略未知欄位。
// ---------------------------------------------------------------------------
const payloadQuantityMarker = "        quantity: item.quantity,";
if (source.includes(payloadQuantityMarker)) {
  source = source.replace(
    payloadQuantityMarker,
    `        quantity: item.quantity,
        buyGetGiftQuantity: getBuyGetGiftQuantityV3C1B(item),`
  );
}

fs.writeFileSync(pagePath, source, "utf8");

console.log("✅ Phase 3C-1B 已套用");
console.log("   同商品買幾送幾 → 購物車免費贈品");
console.log("   免費品不進 cartItems，不影響小計");
console.log("   LINE / 訂單商品文字會列出免費贈品");
console.log("   repeatable=true 會依倍數贈送");
console.log("   任搭組合優先於買幾送幾");
console.log("");
console.log("下一步：npm run build");
