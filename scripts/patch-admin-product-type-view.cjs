const fs = require("fs");

const file = "app/page.tsx";
const original = fs.readFileSync(file, "utf8");
const newline = original.includes("\r\n") ? "\r\n" : "\n";
const lines = original.split(/\r?\n/);

function findLine(text, start = 0) {
  return lines.findIndex((line, index) => index >= start && line.includes(text));
}

const kickerIndex = findLine(
  '{adminCreateView === "series" ? "系列" : "新增"}'
);

if (kickerIndex < 0) {
  throw new Error("找不到新增視窗的小標題");
}

lines[kickerIndex] =
  '                    {adminCreateView === "series"' +
  ' ? "系列"' +
  ' : adminCreateView === "product"' +
  ' ? "商品"' +
  ' : "新增"}';

const titleIndex = findLine(
  '{adminCreateView === "series" ? "新增系列" : "新增內容"}'
);

if (titleIndex < 0) {
  throw new Error("找不到新增視窗的主標題");
}

lines[titleIndex] =
  '                    {adminCreateView === "series"' +
  ' ? "新增系列"' +
  ' : adminCreateView === "product"' +
  ' ? "新增商品"' +
  ' : "新增內容"}';

const menuStartIndex = findLine(
  '{adminCreateView === "menu" ? ('
);

if (menuStartIndex < 0) {
  throw new Error("找不到 adminCreateView menu 區塊");
}

const seriesFormIndex = findLine(
  '<form',
  menuStartIndex
);

if (
  seriesFormIndex < 1 ||
  !lines[seriesFormIndex + 1]?.includes(
    'className="admin-v2-series-form"'
  )
) {
  throw new Error("找不到系列新增表單");
}

const branchIndex = seriesFormIndex - 1;

if (!lines[branchIndex].includes(") : (")) {
  throw new Error("找不到 menu 與 series 之間的分支位置");
}

lines[branchIndex] =
  '              ) : adminCreateView === "product" ? (';

const productView = [
  '                <>',
  '                  <div className="admin-v2-create-options">',
  '                    <button',
  '                      type="button"',
  '                      onClick={() => {',
  '                        window.location.href =',
  '                          "/admin/products/new?type=product";',
  '                      }}',
  '                    >',
  '                      <span className="admin-v2-create-option-icon">+</span>',
  '                      <span>',
  '                        <strong>一般商品</strong>',
  '                        <small>建立單一品項商品</small>',
  '                      </span>',
  '                    </button>',
  '',
  '                    <button',
  '                      type="button"',
  '                      onClick={() => {',
  '                        window.location.href =',
  '                          "/admin/products/new?type=combo";',
  '                      }}',
  '                    >',
  '                      <span className="admin-v2-create-option-icon">+</span>',
  '                      <span>',
  '                        <strong>組合商品</strong>',
  '                        <small>建立可選方案或多品項組合</small>',
  '                      </span>',
  '                    </button>',
  '                  </div>',
  '',
  '                  <button',
  '                    type="button"',
  '                    className="admin-v2-create-cancel"',
  '                    onClick={() => setAdminCreateView("menu")}',
  '                  >',
  '                    返回',
  '                  </button>',
  '                </>',
  '              ) : (',
];

lines.splice(seriesFormIndex, 0, ...productView);

const previewNoteIndex = findLine(
  "商品與分類功能將陸續開放"
);

if (previewNoteIndex >= 0) {
  lines[previewNoteIndex] =
    lines[previewNoteIndex].replace(
      "商品與分類功能將陸續開放",
      "分類功能將陸續開放"
    );
}

fs.writeFileSync(file, lines.join(newline), "utf8");

console.log("✓ 已加入一般商品／組合商品選擇畫面");
console.log("✓ 既有系列新增流程未修改");
