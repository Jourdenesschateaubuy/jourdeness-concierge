const fs = require("fs");

const file = "app/page.tsx";
let text = fs.readFileSync(file, "utf8");

const pattern =
  /<button\s+type="button"\s+disabled>\s*<span className="admin-v2-create-option-icon">\+<\/span>\s*<span>\s*<strong>商品<\/strong>\s*<small>新增一般或組合商品<\/small>\s*<\/span>\s*<\/button>/;

const matches = text.match(new RegExp(pattern.source, "g")) ?? [];

if (matches.length !== 1) {
  throw new Error(
    `預期找到 1 個停用中的商品按鈕，實際找到 ${matches.length} 個`
  );
}

const replacement = `<button
                      type="button"
                      onClick={() => setAdminCreateView("product")}
                    >
                      <span className="admin-v2-create-option-icon">+</span>
                      <span>
                        <strong>商品</strong>
                        <small>新增一般或組合商品</small>
                      </span>
                    </button>`;

text = text.replace(pattern, replacement);

fs.writeFileSync(file, text, "utf8");

console.log("✓ 商品按鈕已啟用，可切換到 product 畫面");
