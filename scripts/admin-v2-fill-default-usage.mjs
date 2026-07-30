import fs from "node:fs";

const path =
  "./app/admin/products/_components/ProductCardEditForm.tsx";

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

/* =====================================================
   前台與後台共用概念：
   DB 沒有 usage 時，依商品類型顯示目前前台的預設使用方式
===================================================== */

if (!source.includes("function defaultUsageText(")) {
  const marker =
`function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}`;

  const replacement =
`${marker}

function defaultUsageText(product: DatabaseProduct) {
  const existing = product.usage?.trim();
  if (existing) return existing;

  const fullText = [
    product.name,
    product.series,
    product.category,
    ...(product.suitableFor ?? []),
  ].join(" ");

  if (
    product.category === "保健食品" ||
    product.category === "健康補給"
  ) {
    return "每日建議依產品標示或客服說明食用。";
  }

  if (
    fullText.includes("卸妝") ||
    fullText.includes("潔顏") ||
    fullText.includes("洗顏")
  ) {
    return "取適量於掌心，加水搓揉後輕柔按摩臉部，再以清水洗淨。";
  }

  if (fullText.includes("面膜")) {
    return "清潔後取出面膜敷於臉部，依產品標示時間使用後取下，再輕拍吸收。";
  }

  if (product.category === "保養品") {
    return "清潔後依日常保養程序使用，實際使用方式可依商品標示或客服建議調整。";
  }

  if (
    product.category === "精油" ||
    product.category === "精油香氛"
  ) {
    if (
      product.series.includes("精油配件") ||
      product.series.includes("擴香設備") ||
      fullText.includes("擴香機") ||
      fullText.includes("水氧機")
    ) {
      return "依商品標示搭配精油或擴香配件使用，實際操作請以產品說明為準。";
    }

    return "依商品標示搭配擴香設備或擴香配件使用，請避免直接接觸眼周與黏膜。";
  }

  if (
    product.category === "洗沐" ||
    product.category === "身體洗護" ||
    product.category === "牙膏" ||
    product.category === "護唇膏"
  ) {
    return "依商品標示方式日常使用，使用後如有不適請暫停使用並洽詢客服。";
  }

  return "";
}`;

  replaceOnce(
    marker,
    replacement,
    "defaultUsageText helper"
  );
}

/* 使用方式初始化改成前台同邏輯 */
replaceOnce(
`  const [usage, setUsage] = useState(product.usage ?? "");`,
`  const [usage, setUsage] = useState(
    defaultUsageText(product)
  );`,
  "usage state"
);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 使用方式會優先帶入資料庫內容");
console.log("✅ DB 空白時會帶入前台目前的預設文字");
console.log("✅ 保養品／面膜／清潔／保健／精油／洗沐都已處理");
console.log("✅ 儲存商品後，畫面上的使用方式會正式寫入資料庫");
