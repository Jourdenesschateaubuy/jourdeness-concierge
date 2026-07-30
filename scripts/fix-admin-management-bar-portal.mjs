import fs from "node:fs";

const path = "./app/page.tsx";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

/* 1. 加 createPortal */
if (!source.includes('from "react-dom"')) {
  const marker =
`import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode, type SyntheticEvent } from "react";`;

  if (!source.includes(marker)) {
    console.error("❌ 找不到 React import");
    process.exit(1);
  }

  source = source.replace(
    marker,
`${marker}
import { createPortal } from "react-dom";`
  );
}

/* 2. 提高管理工具列層級 */
source = source.replace(
  "z-index: 9999;",
  "z-index: 2147483647;"
);

/* 3. 將工具列 Portal 到 body */
const before = `          {managedProductId !== null && (
            <div
              className="admin-v2-product-management-bar"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-v2-product-management-copy">
                <small>已選取商品</small>
                <strong>
                  {products.find(
                    (item) => item.id === managedProductId
                  )?.name ?? "商品"}
                </strong>
              </div>

              <div className="admin-v2-product-management-actions">
                <button
                  type="button"
                  className="admin-v2-product-edit-button"
                  onClick={() => {
                    const url =
                      \`/admin/products/\${managedProductId}/edit\`;

                    if (window.parent !== window) {
                      window.parent.location.href = url;
                    } else {
                      window.location.href = url;
                    }
                  }}
                >
                  修改
                </button>

                <button
                  type="button"
                  className="admin-v2-product-done-button"
                  onClick={() => setManagedProductId(null)}
                >
                  完成
                </button>
              </div>
            </div>
          )}`;

const after = `          {managedProductId !== null &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="admin-v2-product-management-bar"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="admin-v2-product-management-copy">
                  <small>已選取商品</small>
                  <strong>
                    {products.find(
                      (item) => item.id === managedProductId
                    )?.name ?? "商品"}
                  </strong>
                </div>

                <div className="admin-v2-product-management-actions">
                  <button
                    type="button"
                    className="admin-v2-product-edit-button"
                    onClick={() => {
                      const url =
                        \`/admin/products/\${managedProductId}/edit\`;

                      if (window.parent !== window) {
                        window.parent.location.href = url;
                      } else {
                        window.location.href = url;
                      }
                    }}
                  >
                    修改
                  </button>

                  <button
                    type="button"
                    className="admin-v2-product-done-button"
                    onClick={() => setManagedProductId(null)}
                  >
                    完成
                  </button>
                </div>
              </div>,
              document.body
            )}`;

if (!source.includes(before)) {
  console.error("❌ 找不到目前的管理工具列區塊");
  process.exit(1);
}

source = source.replace(before, after);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 管理工具列已移到 document.body");
console.log("✅ 不再受商城容器 overflow / stacking 影響");
console.log("✅ z-index 已提高到最上層");
console.log("✅ 長按邏輯與修改網址維持不變");
