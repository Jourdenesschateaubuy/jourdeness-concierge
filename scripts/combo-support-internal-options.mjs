import fs from "node:fs";

const path =
  "./app/admin/products/_components/ComboConfigEditor.tsx";

const cssPath =
  "./app/admin/products/_components/combo-config-editor.module.css";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

let css = fs
  .readFileSync(cssPath, "utf8")
  .replace(/\r\n/g, "\n");

function replaceOnce(before, after, label) {
  if (!source.includes(before)) {
    console.error(`❌ 找不到：${label}`);
    process.exit(1);
  }

  source = source.replace(before, after);
}

/* =====================================================
   1. 組合內獨立品項可以修改名稱
===================================================== */

if (!source.includes("function updateOptionName(")) {
  replaceOnce(
`  function updateOptionPrice(
    index: number,
    value: string
  ) {`,
`  function updateOptionName(
    index: number,
    value: string
  ) {
    setOptions((current) =>
      current.map((option, itemIndex) =>
        itemIndex === index
          ? {
              ...option,
              name: value,
            }
          : option
      )
    );
  }

  function updateOptionPrice(
    index: number,
    value: string
  ) {`,
    "updateOptionName"
  );
}

/* =====================================================
   2. 空白自訂品項不寫進 comboConfig
===================================================== */

replaceOnce(
`      const nextOptions: ComboOption[] =
        options.map((option) => {`,
`      const nextOptions: ComboOption[] =
        options
          .filter((option) => option.name.trim())
          .map((option) => {`,
  "filter empty combo option"
);

/* =====================================================
   3. 可選商品區改成兩種新增方式
===================================================== */

const oldTop = `          <button
            type="button"
            className={styles.primarySmall}
            onClick={() =>
              setPickerOpen(
                (current) => !current
              )
            }
          >
            {pickerOpen
              ? "收起"
              : "＋加入商品"}
          </button>`;

const newTop = `          <div className={styles.sectionActions}>
            <button
              type="button"
              className={styles.primarySmall}
              onClick={() =>
                setOptions((current) => [
                  ...current,
                  {
                    id: createId("option"),
                    name: "",
                    singleUnitPrice: "",
                    singlePriceLabel: "",
                  },
                ])
              }
            >
              ＋組合內品項
            </button>

            <button
              type="button"
              className={styles.primarySmall}
              onClick={() =>
                setPickerOpen(
                  (current) => !current
                )
              }
            >
              {pickerOpen
                ? "收起商品庫"
                : "＋商品庫"}
            </button>
          </div>`;

replaceOnce(
  oldTop,
  newTop,
  "可選商品新增按鈕"
);

/* =====================================================
   4. 商品庫提示文字更清楚
===================================================== */

source = source.replace(
  'placeholder="搜尋商品名稱"',
  'placeholder="搜尋已建立的一般商品"'
);

/* =====================================================
   5. 品項標題標示來源
===================================================== */

replaceOnce(
`                  <small>
                    品項 {index + 1}
                  </small>

                  <strong>
                    {option.name}
                  </strong>`,
`                  <small>
                    品項 {index + 1}・
                    {option.productId
                      ? "商品庫"
                      : "組合內品項"}
                  </small>

                  {option.productId && (
                    <strong>
                      {option.name}
                    </strong>
                  )}`,
  "option header"
);

/* =====================================================
   6. 未連結商品不再當成舊資料警告
      而是正常的「組合內品項」
===================================================== */

replaceOnce(
`              {!option.productId && (
                <div
                  className={
                    styles.legacyNotice
                  }
                >
                  舊資料品項。可從「加入商品」
                  搜尋同名商品重新連結。
                </div>
              )}`,
`              {!option.productId ? (
                <label
                  className={
                    styles.compactField
                  }
                >
                  <span>
                    組合內品項名稱
                  </span>

                  <input
                    value={option.name}
                    onChange={(event) =>
                      updateOptionName(
                        index,
                        event.target.value
                      )
                    }
                    placeholder="例如：薰衣草舒緩護手霜"
                  />

                  <small>
                    此品項只存在這張組合商品內，
                    不會另外建立一般商品卡。
                  </small>
                </label>
              ) : (
                <div
                  className={
                    styles.linkedNotice
                  }
                >
                  已連結商品庫：
                  {option.name}
                </div>
              )}`,
  "組合內品項編輯"
);

/* =====================================================
   7. 空狀態文案
===================================================== */

source = source.replace(
`                按「＋加入商品」從現有商品庫選擇。`,
`                可新增「組合內品項」，或從「商品庫」選擇既有商品。`
);

/* =====================================================
   CSS
===================================================== */

if (!css.includes(".sectionActions")) {
  css += `

/* 組合價：品項來源 */
.sectionActions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.linkedNotice {
  padding: 8px 10px;
  border-radius: 10px;
  background: #f7f3f4;
  color: #7c686d;
  font-size: 9px;
  line-height: 1.5;
}

@media (max-width: 560px) {
  .sectionActions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .sectionActions .primarySmall {
    padding: 0 8px;
  }
}
`;
}

fs.writeFileSync(path, source, "utf8");
fs.writeFileSync(cssPath, css, "utf8");

console.log("✅ 組合價支援「組合內品項」");
console.log("✅ 組合價支援「商品庫品項」");
console.log("✅ 護手霜三款可以直接修改名稱");
console.log("✅ 組合內品項不需要另外建立一般商品");
console.log("✅ 商品庫連結仍然保留");
console.log("✅ 空白品項不會寫進 comboConfig");
