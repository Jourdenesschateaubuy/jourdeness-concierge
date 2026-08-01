import fs from "node:fs";

const targets = [
  {
    component:
      "app/admin/products/_components/ProductForm.tsx",
    css:
      "app/admin/products/_components/product-form.module.css",
    prefix: "grid",
  },
  {
    component:
      "app/admin/products/_components/ProductCardEditForm.tsx",
    css:
      "app/admin/products/_components/product-card-edit-form.module.css",
    prefix: "fields",
  },
];

for (const target of targets) {
  let component = fs
    .readFileSync(target.component, "utf8")
    .replace(/\r\n/g, "\n");

  const pattern =
    /<label>\s*<span>\s*<input\s*type="checkbox"\s*checked=\{showOriginalPrice\}/g;

  const matches = component.match(pattern) ?? [];

  if (matches.length !== 1) {
    throw new Error(
      `${target.component}：原價 Checkbox 預期找到 1 處，實際找到 ${matches.length} 處`
    );
  }

  component = component.replace(
    pattern,
    `<label className={styles.priceToggle}>
              <span>
                <input
                  className={styles.priceToggleBox}
                  type="checkbox"
                  checked={showOriginalPrice}`
  );

  fs.writeFileSync(target.component, component, "utf8");

  let css = fs.readFileSync(target.css, "utf8");

  if (!css.includes(".priceToggleBox")) {
    css += `

.${target.prefix} .priceToggle {
  display: flex;
  align-items: center;
  width: fit-content;
}

.${target.prefix} .priceToggle > span {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.${target.prefix} .priceToggleBox {
  appearance: auto;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  min-height: 0;
  padding: 0;
  margin: 0;
  border-radius: 4px;
  box-shadow: none;
  accent-color: #9f2638;
  cursor: pointer;
}
`;

    fs.writeFileSync(target.css, css, "utf8");
  }
}

console.log("✓ ProductForm 原價開關樣式修正完成");
console.log("✓ ProductCardEditForm 原價開關樣式修正完成");
