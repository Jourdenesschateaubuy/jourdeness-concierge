import fs from "node:fs";

const path = "./app/page.tsx";
let source = fs.readFileSync(path, "utf8");

if (source.includes("buyGetConfigsStateV3C")) {
  console.log("ℹ️ React buyGet state 已經存在，不重複修改");
  process.exit(0);
}

const stateMarker =
  "  const [, setPromotionRevisionV3B] = useState(0);";

if (!source.includes(stateMarker)) {
  console.error("❌ 找不到 Promotion state 插入點");
  process.exit(1);
}

const assignment =
  "        databaseBuyGetConfigsV3C1A = nextBuyGetConfigsV3C1A;";

if (!source.includes(assignment)) {
  console.error("❌ 找不到 buyGetConfigs assignment");
  process.exit(1);
}

const oldLookup =
  "    const config = getBuyGetConfigV3C1A(item.product.id);";

const matches = source.split(oldLookup).length - 1;

if (matches < 2) {
  console.error(
    "❌ 預期至少 2 個 buyGet config lookup，實際找到 " + matches
  );
  process.exit(1);
}

source = source.replace(
  stateMarker,
  stateMarker +
    '\n  const [buyGetConfigsStateV3C, setBuyGetConfigsStateV3C] = useState<Record<number, StorefrontBuyGetConfigV3C1A>>({});'
);

source = source.replace(
  assignment,
  assignment +
    "\n        setBuyGetConfigsStateV3C(nextBuyGetConfigsV3C1A);"
);

source = source.replaceAll(
  oldLookup,
  "    const config = buyGetConfigsStateV3C[item.product.id] ?? null;"
);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 買幾送幾已改成 React state");
console.log("✅ 找到並替換 " + matches + " 個 buyGet config lookup");
