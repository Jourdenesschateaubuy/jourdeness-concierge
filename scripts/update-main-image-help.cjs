const fs = require("fs");

const file = "app/admin/products/_components/ProductCardEditForm.tsx";
let source = fs.readFileSync(file, "utf8");

const oldBlock = `          <small>
            建議 750 × 795 px
            <br />
            比例 1 : 1.06
          </small>`;

const newBlock = `          <small>
            建議尺寸：750 × 795 px
            <br />
            建議比例：1 : 1.06
            <br />
            建議格式：JPG
            <br />
            使用位置：商品卡＋商品詳情主圖
          </small>`;

if (!source.includes(oldBlock)) {
  console.error("找不到原本的商品主圖規格文字，沒有修改檔案。");
  process.exit(1);
}

source = source.replace(oldBlock, newBlock);
fs.writeFileSync(file, source, "utf8");

console.log("已更新商品主圖規格說明。");
