import fs from "node:fs";

const shellPath = "./app/admin/_components/AdminStorefrontShell.tsx";
const shellCssPath = "./app/admin/admin-v2-shell.module.css";
const pagePath = "./app/page.tsx";

let shell = fs.readFileSync(shellPath, "utf8").replace(/\r\n/g, "\n");
let shellCss = fs.readFileSync(shellCssPath, "utf8").replace(/\r\n/g, "\n");
let page = fs.readFileSync(pagePath, "utf8").replace(/\r\n/g, "\n");

function replaceOnce(source, before, after, label) {
  if (!source.includes(before)) {
    console.error(`❌ 找不到：${label}`);
    process.exit(1);
  }

  return source.replace(before, after);
}

/* =========================================================
   A. Admin 外框：加入「修改模式」
========================================================= */

shell = replaceOnce(
  shell,
  `import { useState } from "react";`,
  `import { useRef, useState } from "react";`,
  "Admin shell React import"
);

shell = replaceOnce(
  shell,
`export default function AdminStorefrontShell() {
  const [previewMode, setPreviewMode] = useState(false);`,
`export default function AdminStorefrontShell() {
  const [previewMode, setPreviewMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const storefrontFrameRef = useRef<HTMLIFrameElement>(null);

  function updateEditMode(next: boolean) {
    setEditMode(next);

    storefrontFrameRef.current?.contentWindow?.postMessage(
      {
        type: "jourdeness-admin-edit-mode",
        enabled: next,
      },
      window.location.origin
    );
  }`,
  "Admin shell editMode state"
);

shell = replaceOnce(
  shell,
`          <span className={styles.manageBadge}>管理模式</span>

          <div>
            <strong>佐登妮絲城堡</strong>
            <small>直接在網站畫面上管理內容</small>
          </div>`,
`          <span className={styles.manageBadge}>
            {editMode ? "正在修改" : "管理模式"}
          </span>

          <div>
            <strong>佐登妮絲城堡</strong>
            <small>
              {editMode
                ? "點選要修改的商品"
                : "直接在網站畫面上管理內容"}
            </small>
          </div>`,
  "Admin shell title"
);

shell = replaceOnce(
  shell,
`        <button
          type="button"
          className={styles.previewButton}
          onClick={() => setPreviewMode(true)}
        >
          預覽
        </button>`,
`        <div className={styles.manageActions}>
          <button
            type="button"
            className={
              editMode
                ? \`\${styles.editModeButton} \${styles.editModeButtonActive}\`
                : styles.editModeButton
            }
            onClick={() => updateEditMode(!editMode)}
          >
            {editMode ? "完成" : "修改模式"}
          </button>

          <button
            type="button"
            className={styles.previewButton}
            onClick={() => {
              updateEditMode(false);
              setPreviewMode(true);
            }}
          >
            預覽
          </button>
        </div>`,
  "Admin shell actions"
);

shell = replaceOnce(
  shell,
`      <div className={styles.manageHint}>
        長按商品卡約半秒即可管理
      </div>`,
`      <div className={styles.manageHint}>
        {editMode
          ? "點選商品卡，再按下方「修改」"
          : "按「修改模式」開始編輯網站"}
      </div>`,
  "Admin shell hint"
);

shell = replaceOnce(
  shell,
`      <iframe
        className={styles.storefrontFrame}
        src="/?admin=1"
        title="佐登妮絲城堡管理畫面"
      />`,
`      <iframe
        ref={storefrontFrameRef}
        className={styles.storefrontFrame}
        src="/?admin=1"
        title="佐登妮絲城堡管理畫面"
        onLoad={() => {
          storefrontFrameRef.current?.contentWindow?.postMessage(
            {
              type: "jourdeness-admin-edit-mode",
              enabled: editMode,
            },
            window.location.origin
          );
        }}
      />`,
  "Admin storefront iframe"
);

/* =========================================================
   B. Admin 外框按鈕樣式
========================================================= */

if (!shellCss.includes(".manageActions")) {
  shellCss += `

/* Admin V2：點選式修改模式 */
.manageActions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editModeButton {
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(125, 38, 56, 0.22);
  border-radius: 12px;
  background: #fff;
  color: #7d2638;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.editModeButtonActive {
  border-color: #7d2638;
  background: #7d2638;
  color: #fff;
  box-shadow: 0 7px 18px rgba(125, 38, 56, 0.2);
}

@media (max-width: 560px) {
  .manageActions {
    gap: 6px;
  }

  .editModeButton {
    min-height: 40px;
    padding: 0 11px;
    font-size: 11px;
  }
}
`;
}

/* =========================================================
   C. 商城 iframe：新增「是否正在修改」狀態
========================================================= */

page = replaceOnce(
  page,
`  const [isAdminMode, setIsAdminMode] = useState(false);
  const [managedProductId, setManagedProductId] = useState<number | null>(null);`,
`  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminEditMode, setIsAdminEditMode] = useState(false);
  const [managedProductId, setManagedProductId] = useState<number | null>(null);`,
  "isAdminEditMode state"
);

/* =========================================================
   D. iframe 接收 Admin 外框的模式切換
========================================================= */

page = replaceOnce(
  page,
`  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsAdminMode(params.get("admin") === "1");

    return () => {
      if (adminPressTimerRef.current) {
        clearTimeout(adminPressTimerRef.current);
      }
    };
  }, []);`,
`  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsAdminMode(params.get("admin") === "1");
    setIsAdminEditMode(params.get("edit") === "1");

    function handleAdminMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;

      const data = event.data as
        | {
            type?: string;
            enabled?: boolean;
          }
        | undefined;

      if (data?.type !== "jourdeness-admin-edit-mode") {
        return;
      }

      const enabled = Boolean(data.enabled);

      setIsAdminEditMode(enabled);

      if (!enabled) {
        setManagedProductId(null);
      }
    }

    window.addEventListener("message", handleAdminMessage);

    return () => {
      window.removeEventListener("message", handleAdminMessage);

      if (adminPressTimerRef.current) {
        clearTimeout(adminPressTimerRef.current);
      }
    };
  }, []);`,
  "Admin message listener"
);

/* =========================================================
   E. 長按只在修改模式內保留為備用
========================================================= */

page = replaceOnce(
  page,
`    if (!isAdminMode) return;`,
`    if (!isAdminMode || !isAdminEditMode) return;`,
  "long press guard"
);

/* =========================================================
   F. 只有修改模式才標示商品可選
========================================================= */

page = replaceOnce(
  page,
`${'${isAdminMode ? "admin-v2-manageable-product" : ""}'}`,
`${'${isAdminMode && isAdminEditMode ? "admin-v2-manageable-product" : ""}'}`,
  "manageable class"
);

page = replaceOnce(
  page,
`data-admin-product-id={isAdminMode ? product.id : undefined}`,
`data-admin-product-id={
          isAdminMode && isAdminEditMode ? product.id : undefined
        }`,
  "admin product data"
);

page = replaceOnce(
  page,
`          if (isAdminMode) {
            event.preventDefault();
          }`,
`          if (isAdminMode && isAdminEditMode) {
            event.preventDefault();
          }`,
  "context menu"
);

/* =========================================================
   G. 修改模式：點一下商品卡直接選取
========================================================= */

page = replaceOnce(
  page,
`        onClick={(event) => {
          if (
            isAdminMode &&
            suppressAdminProductClickRef.current
          ) {`,
`        onClick={(event) => {
          if (isAdminMode && isAdminEditMode) {
            event.preventDefault();
            event.stopPropagation();

            suppressAdminProductClickRef.current = false;
            setManagedProductId(product.id);
            return;
          }

          if (
            isAdminMode &&
            suppressAdminProductClickRef.current
          ) {`,
  "product card click selection"
);

/* =========================================================
   H. 鍵盤操作也遵守修改模式
========================================================= */

page = replaceOnce(
  page,
`        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProductDetail(product);
          }
        }}`,
`        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (isAdminMode && isAdminEditMode) {
              setManagedProductId(product.id);
              return;
            }

            openProductDetail(product);
          }
        }}`,
  "product keyboard selection"
);

/* =========================================================
   I. 選取標籤文字
========================================================= */

page = page.replace(
`            管理中`,
`            已選取`
);

/* =========================================================
   J. 底部按鈕「完成」改為「取消選取」
========================================================= */

page = replaceOnce(
  page,
`                    完成
                  </button>`,
`                    取消選取
                  </button>`,
  "bottom cancel button"
);

/* =========================================================
   K. 修改模式商品卡：任何位置點下去都選商品
========================================================= */

page = replaceOnce(
  page,
`              touch-action: pan-y;
            }`,
`              touch-action: pan-y;
              outline: 1px dashed rgba(125, 38, 56, .20);
              outline-offset: 1px;
              cursor: pointer;
            }

            .admin-v2-manageable-product button,
            .admin-v2-manageable-product a,
            .admin-v2-manageable-product input,
            .admin-v2-manageable-product select,
            .admin-v2-manageable-product textarea {
              pointer-events: none !important;
            }`,
  "edit mode selectable styling"
);

fs.writeFileSync(shellPath, shell, "utf8");
fs.writeFileSync(shellCssPath, shellCss, "utf8");
fs.writeFileSync(pagePath, page, "utf8");

console.log("✅ Admin 上方已加入「修改模式」按鈕");
console.log("✅ 修改模式改成「點商品卡選取」");
console.log("✅ 底部維持「修改」並改成「取消選取」");
console.log("✅ 上方「完成」可離開修改模式");
console.log("✅ 一般管理狀態仍可正常點商品查看");
console.log("✅ 長按只保留為修改模式內的備用操作");
