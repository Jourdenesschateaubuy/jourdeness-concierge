import fs from "node:fs";

const pagePath = "./app/page.tsx";
const shellPath = "./app/admin/_components/AdminStorefrontShell.tsx";

let source = fs.readFileSync(pagePath, "utf8").replace(/\r\n/g, "\n");
let shell = fs.readFileSync(shellPath, "utf8").replace(/\r\n/g, "\n");

function replaceOnce(text, before, after, label) {
  if (!text.includes(before)) {
    console.error(`❌ 找不到：${label}`);
    process.exit(1);
  }

  return text.replace(before, after);
}

/* 1. 加入 Admin 管理狀態 */
if (!source.includes("const [isAdminMode")) {
  const marker =
`  const [comboEditingItemKey, setComboEditingItemKey] = useState<string | null>(null);`;

  const replacement =
`${marker}
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [managedProductId, setManagedProductId] = useState<number | null>(null);

  const adminPressTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const adminPressStartRef =
    useRef<{ x: number; y: number } | null>(null);

  const suppressAdminProductClickRef = useRef(false);`;

  source = replaceOnce(
    source,
    marker,
    replacement,
    "Admin 管理 state 插入點"
  );
}

/* 2. 讀取 ?admin=1 */
if (!source.includes('params.get("admin") === "1"')) {
  const marker =
`  useEffect(() => {
    let cancelled = false;`;

  const replacement =
`  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsAdminMode(params.get("admin") === "1");

    return () => {
      if (adminPressTimerRef.current) {
        clearTimeout(adminPressTimerRef.current);
      }
    };
  }, []);

${marker}`;

  source = replaceOnce(
    source,
    marker,
    replacement,
    "第一個 useEffect"
  );
}

/* 3. 長按控制函式 */
if (!source.includes("function startAdminProductPress")) {
  const marker =
`  function ProductCard({
    product,
    featured = false,`;

  const helpers =
`  function clearAdminProductPress() {
    if (adminPressTimerRef.current) {
      clearTimeout(adminPressTimerRef.current);
      adminPressTimerRef.current = null;
    }
  }

  function startAdminProductPress(
    productId: number,
    x: number,
    y: number,
    target: EventTarget | null
  ) {
    if (!isAdminMode) return;

    if (
      target instanceof Element &&
      target.closest("button, a, input, select, textarea")
    ) {
      return;
    }

    clearAdminProductPress();

    suppressAdminProductClickRef.current = false;
    adminPressStartRef.current = { x, y };

    adminPressTimerRef.current = setTimeout(() => {
      suppressAdminProductClickRef.current = true;
      setManagedProductId(productId);

      if (
        typeof navigator !== "undefined" &&
        "vibrate" in navigator
      ) {
        navigator.vibrate(25);
      }

      adminPressTimerRef.current = null;
    }, 550);
  }

  function moveAdminProductPress(x: number, y: number) {
    const start = adminPressStartRef.current;
    if (!start) return;

    const distance = Math.hypot(
      x - start.x,
      y - start.y
    );

    if (distance > 12) {
      clearAdminProductPress();
      adminPressStartRef.current = null;
    }
  }

  function finishAdminProductPress() {
    clearAdminProductPress();
    adminPressStartRef.current = null;
  }

${marker}`;

  source = replaceOnce(
    source,
    marker,
    helpers,
    "ProductCard 前方"
  );
}

/* 4. 商品卡加入管理 class */
if (!source.includes("admin-v2-manageable-product")) {
  const before =
`        className={\`\${featured ? "featured-card" : "product-card"} commerce-product-card clickable-product-card-v246 shelf-card-v271 compact-commerce-card-v350\`}`;

  const after =
`        className={\`\${featured ? "featured-card" : "product-card"} commerce-product-card clickable-product-card-v246 shelf-card-v271 compact-commerce-card-v350 \${isAdminMode ? "admin-v2-manageable-product" : ""} \${managedProductId === product.id ? "admin-v2-product-selected" : ""}\`}`;

  source = replaceOnce(
    source,
    before,
    after,
    "商品卡 className"
  );
}

/* 5. 商品卡加入 pointer 事件 */
if (!source.includes("data-admin-product-id")) {
  const marker =
`        key={featured ? \`featured-\${product.id}\` : product.id}
        role="button"`;

  const replacement =
`        key={featured ? \`featured-\${product.id}\` : product.id}
        data-admin-product-id={isAdminMode ? product.id : undefined}
        onPointerDown={(event) =>
          startAdminProductPress(
            product.id,
            event.clientX,
            event.clientY,
            event.target
          )
        }
        onPointerMove={(event) =>
          moveAdminProductPress(
            event.clientX,
            event.clientY
          )
        }
        onPointerUp={finishAdminProductPress}
        onPointerCancel={finishAdminProductPress}
        onPointerLeave={finishAdminProductPress}
        onContextMenu={(event) => {
          if (isAdminMode) {
            event.preventDefault();
          }
        }}
        role="button"`;

  source = replaceOnce(
    source,
    marker,
    replacement,
    "商品卡 key"
  );
}

/* 6. 長按完成後不要又打開商品詳情 */
if (!source.includes("suppressAdminProductClickRef.current = false;\n            return;")) {
  const before =
`        onClick={() => {
                                  setIsCartOpen(false);`;

  const after =
`        onClick={(event) => {
          if (
            isAdminMode &&
            suppressAdminProductClickRef.current
          ) {
            event.preventDefault();
            suppressAdminProductClickRef.current = false;
            return;
          }

                                  setIsCartOpen(false);`;

  source = replaceOnce(
    source,
    before,
    after,
    "商品卡 onClick"
  );
}

/* 7. 選取中的商品顯示「管理中」 */
if (!source.includes("admin-v2-selected-badge")) {
  const marker =
`      >
        <ProductVisual product={product} variant={featured ? "featured" : "normal"} />`;

  const replacement =
`      >
        {isAdminMode && managedProductId === product.id && (
          <span className="admin-v2-selected-badge">
            管理中
          </span>
        )}

        <ProductVisual product={product} variant={featured ? "featured" : "normal"} />`;

  source = replaceOnce(
    source,
    marker,
    replacement,
    "ProductVisual"
  );
}

/* 8. 管理樣式 + 底部工具列 */
if (!source.includes("admin-v2-product-management-bar")) {
  const mainRegex =
    /(<main className="site-shell" data-build="[^"]+">)/;

  if (!mainRegex.test(source)) {
    console.error("❌ 找不到 site-shell");
    process.exit(1);
  }

  source = source.replace(
    mainRegex,
`$1
      {isAdminMode && (
        <>
          <style>{\`
            .admin-v2-manageable-product {
              position: relative !important;
              user-select: none;
              -webkit-user-select: none;
              -webkit-touch-callout: none;
              touch-action: pan-y;
            }

            .admin-v2-product-selected {
              outline: 3px solid #7d2638 !important;
              outline-offset: 2px !important;
              z-index: 20 !important;
            }

            .admin-v2-selected-badge {
              position: absolute;
              top: 8px;
              right: 8px;
              z-index: 60;
              min-height: 25px;
              padding: 0 9px;
              border-radius: 999px;
              background: #7d2638;
              color: #fff;
              display: inline-flex;
              align-items: center;
              font-size: 10px;
              font-weight: 900;
              pointer-events: none;
              box-shadow: 0 6px 16px rgba(72, 30, 39, .22);
            }

            .admin-v2-product-management-bar {
              position: fixed;
              left: 10px;
              right: 10px;
              bottom: calc(10px + env(safe-area-inset-bottom));
              z-index: 9999;
              min-height: 68px;
              padding: 10px 11px;
              border: 1px solid rgba(125, 38, 56, .18);
              border-radius: 17px;
              background: rgba(255, 252, 248, .98);
              box-shadow: 0 12px 34px rgba(65, 34, 39, .22);
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
              backdrop-filter: blur(12px);
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
              padding: 0 14px;
              border-radius: 11px;
              font: inherit;
              font-size: 11px;
              font-weight: 900;
              cursor: pointer;
            }

            .admin-v2-product-edit-button {
              border: 0;
              background: #7d2638;
              color: #fff;
            }

            .admin-v2-product-done-button {
              border: 1px solid #ddd2ce;
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
          )}
        </>
      )}
`
  );
}

/* 9. /admin iframe 改成 ?admin=1 */
if (!shell.includes('src="/?admin=1"')) {
  const before =
`      <iframe
        className={styles.storefrontFrame}
        src="/"
        title="佐登妮絲城堡管理畫面"
      />`;

  const after =
`      <iframe
        className={styles.storefrontFrame}
        src="/?admin=1"
        title="佐登妮絲城堡管理畫面"
      />`;

  shell = replaceOnce(
    shell,
    before,
    after,
    "Admin 管理 iframe"
  );
}

shell = shell.replace(
  "Admin V2｜商品管理功能建置中",
  "長按商品卡約半秒即可管理"
);

fs.writeFileSync(pagePath, source, "utf8");
fs.writeFileSync(shellPath, shell, "utf8");

console.log("✅ 正式商城結構未搬動");
console.log("✅ /admin 已使用 ?admin=1");
console.log("✅ 商品卡長按管理已加入");
console.log("✅ 滑動超過 12px 會取消長按");
console.log("✅ 已加入修改 / 完成工具列");
