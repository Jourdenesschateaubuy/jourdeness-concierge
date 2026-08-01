import fs from "node:fs";

const file =
  "app/admin/products/_components/ProductCardEditForm.tsx";

let source = fs.readFileSync(file, "utf8");
const originalNewline = source.includes("\r\n") ? "\r\n" : "\n";
source = source.replace(/\r\n/g, "\n");

function replaceOnce(before, after, label) {
  const count = source.split(before).length - 1;

  if (count !== 1) {
    throw new Error(
      `${label}：預期找到 1 處，實際找到 ${count} 處`
    );
  }

  source = source.replace(before, after);
}

replaceOnce(
`  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice ?? ""
  );
  const [price, setPrice] = useState(product.price ?? "");`,
`  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice ?? ""
  );
  const [showOriginalPrice, setShowOriginalPrice] = useState(
    Boolean((product.originalPrice ?? "").trim())
  );
  const [price, setPrice] = useState(product.price ?? "");`,
  "加入原價顯示狀態"
);

replaceOnce(
`            <div className={styles.twoColumns}>
              <label>
                <span>原價</span>
                <input
                  name="originalPrice"
                  value={originalPrice}
                  onChange={(event) =>
                    setOriginalPrice(event.target.value)
                  }
                  placeholder="例如：原價 $2,980"
                />
              </label>

              <label>
                <span>售價／活動價</span>
                <input
                  name="price"
                  required
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="例如：產地價 $2,160"
                />
              </label>
            </div>`,
`            <label>
              <span>
                <input
                  type="checkbox"
                  checked={showOriginalPrice}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setShowOriginalPrice(checked);

                    if (!checked) {
                      setOriginalPrice("");
                    }
                  }}
                />
                顯示原價
              </span>
            </label>

            <div className={styles.twoColumns}>
              <label>
                <span>原價（NT$）</span>
                <input
                  name="originalPrice"
                  value={showOriginalPrice ? originalPrice : ""}
                  disabled={!showOriginalPrice}
                  inputMode="numeric"
                  onChange={(event) =>
                    setOriginalPrice(event.target.value)
                  }
                  placeholder="例如：2980"
                />
                {!showOriginalPrice ? (
                  <input
                    type="hidden"
                    name="originalPrice"
                    value=""
                  />
                ) : null}
              </label>

              <label>
                <span>售價（NT$）</span>
                <input
                  name="price"
                  required
                  inputMode="numeric"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="例如：2160"
                />
              </label>
            </div>`,
  "更新價格欄位"
);

if (originalNewline === "\r\n") {
  source = source.replace(/\n/g, "\r\n");
}

fs.writeFileSync(file, source, "utf8");

console.log("✓ ProductCardEditForm 價格欄位修改完成");
console.log("✓ 兩個後台表單現在都已完成 Step 1");
