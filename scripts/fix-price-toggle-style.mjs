import fs from "node:fs";

const targets = [
  {
    component:
      "app/admin/products/_components/ProductForm.tsx",
    css:
      "app/admin/products/_components/product-form.module.css",
    cssText: `
.grid .priceToggle {
  display: flex;
  align-items: center;
  width: fit-content;
}

.grid .priceToggle > span {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.grid .priceToggleBox {
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
`,
  },
  {
    component:
      "app/admin/products/_components/ProductCardEditForm.tsx",
    css:
      "app/admin/products/_components/product-card-edit-form.module.css",
    cssText: `
.fields .priceToggle {
  display: flex;
  align-items: center;
  width: fit-content;
}

.fields .priceToggle > span {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.fields .priceToggleBox {
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
`,
  },
];

for (const target of targets) {
  let component = fs
    .readFileSync(target.component, "utf8")
    .replace(/\r\n/g, "\n");

  const before = `            <label>
              <span>
                <input
                  type="checkbox"
                  checked={showOriginalPrice}`;

  const after = `            <label className={styles.priceToggle}>
              <span>
                <input
                  className={styles.priceToggleBox}
                  type="checkbox"
                  checked={showOriginalPrice}`;

  const count = component.split(before).length - 1;

  if (count !== 1) {
    throw new Error(
      `${target.component}：Checkbox 預期找到 1 處，實際找到 ${count} 處`
    );
  }

  component = component.replace(before, after);
  fs.writeFileSync(target.component, component, "utf8");

  let css = fs.readFileSync(target.css, "utf8");

  if (!css.includes(".priceToggleBox")) {
    css = `${css.trimEnd()}\n${target.cssText}`;
    fs.writeFileSync(target.css, css, "utf8");
  }
}

console.log("✓ ProductForm 原價開關樣式修正完成");
console.log("✓ ProductCardEditForm 原價開關樣式修正完成");
