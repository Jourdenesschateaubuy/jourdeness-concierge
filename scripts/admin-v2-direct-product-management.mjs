import fs from "node:fs";

const pagePath = "./app/page.tsx";
const storefrontPath = "./app/storefront-client.tsx";
const adminShellPath = "./app/admin/_components/AdminStorefrontShell.tsx";
const adminCssPath = "./app/admin/admin-v2-shell.module.css";

/* -------------------------------------------------------
   1. 把目前完整商城搬成可共用的 Storefront Client
------------------------------------------------------- */

if (!fs.existsSync(storefrontPath)) {
  if (!fs.existsSync(pagePath)) {
    console.error("❌ 找不到 app/page.tsx");
    process.exit(1);
  }

  fs.renameSync(pagePath, storefrontPath);
}

let source = fs.readFileSync(storefrontPath, "utf8").replace(/\r\n/g, "\n");

if (!source.includes("type StorefrontClientProps")) {
  const marker = "function Home() {";

  if (!source.includes(marker)) {
    console.error("❌ 找不到 Home() 插入點");
    process.exit(1);
  }

  source = source.replace(
    marker,
`type StorefrontClientProps = {
  managementMode?: boolean;
};

function Home({ managementMode = false }: StorefrontClientProps) {`
  );
}

/* -------------------------------------------------------
   2. Admin V2 商品管理 state
------------------------------------------------------- */

const homeMarker =
  "function Home({ managementMode = false }: StorefrontClientProps) {\n";

if (
  !source.includes("managedProductId") &&
  source.includes(homeMarker)
) {
  source = source.replace(
    homeMarker,
`${homeMarker}  const [managedProductId, setManagedProductId] =
    useState<number | null>(null);

  const managementPressTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const managementPressStartRef =
    useRef<{ x: number; y: number } | null>(null);

  const suppressManagementClickRef = useRef(false);

`
  );
}

/* -------------------------------------------------------
   3. 長按判定
------------------------------------------------------- */

if (!source.includes("function startProductManagementPress")) {
  const marker = "  const activeComboConfig =";

  if (!source.includes(marker)) {
    console.error("❌ 找不到長按函式插入點");
    process.exit(1);
  }

  const helpers = `  function clearProductManagementPress() {
    if (managementPressTimerRef.current) {
      clearTimeout(managementPressTimerRef.current);
      managementPressTimerRef.current = null;
    }
  }

  function startProductManagementPress(
    productId: number,
    x: number,
    y: number
  ) {
    if (!managementMode) return;

    clearProductManagementPress();

    suppressManagementClickRef.current = false;
    managementPressStartRef.current = { x, y };

    managementPressTimerRef.current = setTimeout(() => {
      suppressManagementClickRef.current = true;
      setManagedProductId(productId);

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function"
      ) {
        navigator.vibrate(35);
      }
    }, 550);
  }

  function moveProductManagementPress(x: number, y: number) {
    const start = managementPressStartRef.current;
    if (!start) return;

    const distance = Math.hypot(x - start.x, y - start.y);

    if (distance > 12) {
      clearProductManagementPress();
      managementPressStartRef.current = null;
    }
  }

  function finishProductManagementPress() {
    clearProductManagementPress();
    managementPressStartRef.current = null;
  }

`;

  source = source.replace(marker, helpers + marker);
}

/* -------------------------------------------------------
   4. 商品卡加入管理狀態 class
------------------------------------------------------- */

const oldClass =
  'className={`${featured ? "featured-card" : "product-card"} commerce-product-card clickable-product-card-v246 shelf-card-v271 compact-commerce-card-v350`}';

const newClass =
  'className={`${featured ? "featured-card" : "product-card"} commerce-product-card clickable-product-card-v246 shelf-card-v271 compact-commerce-card-v350 ${managementMode ? "admin-v2-manageable-product" : ""} ${managedProductId === product.id ? "admin-v2-product-selected" : ""}`}';

if (source.includes(oldClass)) {
  source = source.replace(oldClass, newClass);
} else if (!source.includes("admin-v2-manageable-product")) {
  console.error("❌ 找不到商品卡 className");
  process.exit(1);
}

/* -------------------------------------------------------
   5. 商品卡加入 pointer 長按事件
------------------------------------------------------- */

if (!source.includes("data-admin-product-id")) {
  const keyMarker =
    '        key={featured ? `featured-${product.id}` : product.id}\n';

  if (!source.includes(keyMarker)) {
    console.error("❌ 找不到商品卡 key 插入點");
    process.exit(1);
  }

  source = source.replace(
    keyMarker,
`${keyMarker}        data-admin-product-id={managementMode ? product.id : undefined}
        onPointerDown={(event) =>
          startProductManagementPress(
            product.id,
            event.clientX,
            event.clientY
          )
        }
        onPointerMove={(event) =>
          moveProductManagementPress(
            event.clientX,
            event.clientY
          )
        }
        onPointerUp={finishProductManagementPress}
        onPointerCancel={finishProductManagementPress}
        onPointerLeave={finishProductManagementPress}
        onContextMenu={(event) => {
          if (!managementMode) return;

          event.preventDefault();
          clearProductManagementPress();
          setManagedProductId(product.id);
        }}
`
  );
}

/* -------------------------------------------------------
   6. 長按之後不要又觸發正常「商品詳情」
------------------------------------------------------- */

const cardClassIndex = source.indexOf("admin-v2-manageable-product");

if (cardClassIndex === -1) {
  console.error("❌ 商品卡管理 class 不存在");
  process.exit(1);
}

const clickMarker = "        onClick={() => {";
const clickIndex = source.indexOf(clickMarker, cardClassIndex);

if (clickIndex === -1) {
  console.error("❌ 找不到商品卡 onClick");
  process.exit(1);
}

const afterClickIndex = clickIndex + clickMarker.length;

if (
  !source
    .slice(clickIndex, clickIndex + 500)
    .includes("suppressManagementClickRef.current")
) {
  source =
    source.slice(0, afterClickIndex) +
`
          if (
            managementMode &&
            suppressManagementClickRef.current
          ) {
            suppressManagementClickRef.current = false;
            return;
          }
` +
    source.slice(afterClickIndex);
}

/* -------------------------------------------------------
   7. 在商城管理模式加入選取 UI
------------------------------------------------------- */

if (!source.includes("admin-v2-product-management-bar")) {
  const mainPattern =
    /    <main className="site-shell" data-build="[^"]+">\r?\n/;

  if (!mainPattern.test(source)) {
    console.error("❌ 找不到商城 main");
    process.exit(1);
  }

  source = source.replace(
    mainPattern,
(match) => `${match}      {managementMode && (
        <>
          <style>{\`
            .admin-v2-manageable-product {
              position: relative !important;
              -webkit-user-select: none;
              user-select: none;
              -webkit-touch-callout: none;
            }

            .admin-v2-product-selected {
              outline: 3px solid #7d2638 !important;
              outline-offset: 2px !important;
              transform: scale(.985);
              z-index: 4;
            }

            .admin-v2-product-selected::after {
              content: "管理中";
              position: absolute;
              top: 8px;
              right: 8px;
              z-index: 30;
              padding: 5px 9px;
              border-radius: 999px;
              background: #7d2638;
              color: #fff;
              font-size: 10px;
              font-weight: 900;
              line-height: 1;
              pointer-events: none;
              box-shadow: 0 5px 14px rgba(60, 25, 34, .22);
            }

            .admin-v2-product-management-bar {
              position: fixed;
              left: 10px;
              right: 10px;
              bottom: calc(12px + env(safe-area-inset-bottom));
              z-index: 6000;
              min-height: 68px;
              padding: 10px 11px;
              border: 1px solid rgba(125, 38, 56, .18);
              border-radius: 17px;
              background: rgba(255, 252, 248, .98);
              box-shadow: 0 12px 36px rgba(63, 33, 37, .22);
              backdrop-filter: blur(12px);
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
            }

            .admin-v2-product-management-copy {
              min-width: 0;
              display: grid;
              gap: 3px;
            }

            .admin-v2-product-management-copy small {
              color: #9a6a73;
              font-size: 10px;
              font-weight: 850;
            }

            .admin-v2-product-management-copy strong {
              overflow: hidden;
              color: #442f33;
              font-size: 13px;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .admin-v2-product-management-actions {
              flex: 0 0 auto;
              display: flex;
              gap: 7px;
            }

            .admin-v2-product-management-actions button {
              min-height: 42px;
              padding: 0 13px;
              border-radius: 11px;
              font: inherit;
              font-size: 11px;
              font-weight: 900;
            }

            .admin-v2-product-edit-button {
              border: 0;
              background: #7d2638;
              color: #fff;
            }

            .admin-v2-product-done-button {
              border: 1px solid #ded2cf;
              background: #fff;
              color: #665451;
            }
          \`}</style>

          {managedProductId !== null && (
            <div
              className="admin-v2-product-management-bar"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-v2-product-management-copy">
                <small>已選取商品</small>
                <strong>
                  {products.find(
                    (product) => product.id === managedProductId
                  )?.name ?? "商品"}
                </strong>
              </div>

              <div className="admin-v2-product-management-actions">
                <button
                  type="button"
                  className="admin-v2-product-edit-button"
                  onClick={() => {
                    window.location.href =
                      \`/admin/products/\${managedProductId}/edit\`;
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
          )}
        </>
      )}

`
  );
}

/* -------------------------------------------------------
   8. 把 storefront-client 改成可傳 managementMode
------------------------------------------------------- */

const oldExport = `export default function Page() {
  return <Home />;
}`;

if (source.includes(oldExport)) {
  source = source.replace(
    oldExport,
`export default function StorefrontClient({
  managementMode = false,
}: StorefrontClientProps) {
  return <Home managementMode={managementMode} />;
}`
  );
}

if (!source.includes("export default function StorefrontClient")) {
  console.error("❌ StorefrontClient export 修改失敗");
  process.exit(1);
}

fs.writeFileSync(storefrontPath, source, "utf8");

/* -------------------------------------------------------
   9. 正式商城 wrapper
------------------------------------------------------- */

fs.writeFileSync(
  pagePath,
`import StorefrontClient from "./storefront-client";

export default function Page() {
  return <StorefrontClient />;
}
`,
  "utf8"
);

/* -------------------------------------------------------
   10. Admin 不再 iframe，直接使用同一套商城
------------------------------------------------------- */

fs.writeFileSync(
  adminShellPath,
`"use client";

import { useState } from "react";
import StorefrontClient from "../../storefront-client";
import styles from "../admin-v2-shell.module.css";

export default function AdminStorefrontShell() {
  const [previewMode, setPreviewMode] = useState(false);

  if (previewMode) {
    return (
      <div className={styles.previewShell}>
        <div className={styles.previewSurface}>
          <StorefrontClient />
        </div>

        <button
          type="button"
          className={styles.returnManageButton}
          onClick={() => setPreviewMode(false)}
        >
          返回管理
        </button>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.manageBar}>
        <div className={styles.manageTitle}>
          <span className={styles.manageBadge}>管理模式</span>

          <div>
            <strong>佐登妮絲城堡</strong>
            <small>長按內容管理・拖曳調整位置</small>
          </div>
        </div>

        <button
          type="button"
          className={styles.previewButton}
          onClick={() => setPreviewMode(true)}
        >
          預覽
        </button>
      </header>

      <div className={styles.manageHint}>
        長按商品卡約半秒即可管理
      </div>

      <div className={styles.storefrontSurface}>
        <StorefrontClient managementMode />
      </div>
    </div>
  );
}
`,
  "utf8"
);

fs.writeFileSync(
  adminCssPath,
`.shell {
  --admin-v2-offset: 96px;
  min-height: 100dvh;
  background: #fffaf5;
  color: #38282b;
  font-family: Arial, "Noto Sans TC", sans-serif;
}

.manageBar {
  position: sticky;
  top: 0;
  z-index: 7000;
  min-height: 62px;
  padding: 9px 12px;
  border-bottom: 1px solid #eaded8;
  background: rgba(255, 252, 248, .98);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  box-shadow: 0 4px 18px rgba(72, 44, 32, .07);
  backdrop-filter: blur(12px);
}

.manageTitle {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}

.manageTitle > div {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.manageTitle strong {
  overflow: hidden;
  color: #5f1f2d;
  font-family: Georgia, "Noto Serif TC", serif;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.manageTitle small {
  color: #8b7974;
  font-size: 10px;
}

.manageBadge {
  flex: 0 0 auto;
  min-height: 30px;
  padding: 0 9px;
  border-radius: 999px;
  background: #7d2638;
  color: #fff;
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 900;
}

.previewButton {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 11px;
  background: #302623;
  color: #fff;
  font: inherit;
  font-size: 11px;
  font-weight: 900;
}

.manageHint {
  position: sticky;
  top: 62px;
  z-index: 6999;
  min-height: 34px;
  padding: 7px 12px;
  border-bottom: 1px solid #eadfd5;
  background: #fff7ed;
  color: #816e67;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 750;
}

.storefrontSurface {
  min-height: 100dvh;
}

.storefrontSurface :global(.top-header) {
  top: var(--admin-v2-offset) !important;
}

.previewShell {
  min-height: 100dvh;
  background: #fffaf5;
}

.previewSurface {
  min-height: 100dvh;
}

.returnManageButton {
  position: fixed;
  right: 13px;
  bottom: max(14px, env(safe-area-inset-bottom));
  z-index: 8000;
  min-height: 46px;
  padding: 0 17px;
  border: 0;
  border-radius: 999px;
  background: #7d2638;
  color: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 10px 28px rgba(76, 31, 40, .26);
}

@media (max-width: 640px) {
  .shell {
    --admin-v2-offset: 88px;
  }

  .manageBar {
    min-height: 56px;
    padding: 7px 8px;
  }

  .manageHint {
    top: 56px;
    min-height: 32px;
    padding: 6px 8px;
  }

  .manageTitle small {
    display: none;
  }

  .previewButton {
    min-height: 38px;
  }
}
`,
  "utf8"
);

console.log("✅ Admin V2 已改為直接使用正式商城元件");
console.log("✅ 商品卡已加入長按管理");
console.log("✅ 正常點擊仍可查看商品詳情");
console.log("✅ 手機滑動超過 12px 會取消長按，避免滑頁誤觸");
