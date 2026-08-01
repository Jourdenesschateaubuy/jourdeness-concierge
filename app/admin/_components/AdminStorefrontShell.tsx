"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import ProductDetailStudioEditor from "./ProductDetailStudioEditor";
import ProductStudioEditor from "./ProductStudioEditor";
import styles from "../admin-v2-shell.module.css";

type StudioSelection =
  | {
      type: "product";
      productId: number;
      label?: string;
    }
  | {
      type: "product-detail";
      productId: number;
      label?: string;
    }
  | {
      type: "hero";
      label?: string;
    }
  | {
      type: "ranking";
      rank: number;
      label?: string;
    }
  | {
      type: "series";
      categoryId?: number;
      label?: string;
    }
  | null;

type ProductCardPreviewDraft = {
  cardName: string;
  cardSubtitle: string;
  originalPrice: string;
  price: string;
  priceNote: string;
  status:
    | "active"
    | "inactive"
    | "coming_soon"
    | "sold_out";
  image: string;
};

type ExpandedInfoItem = {
  title: string;
  content: string;
};

type ProductDetailPreviewDraft = {
  name: string;
  spec: string;
  description: string;
  intro: string;
  expiryNote: string;
  features: string[];
  suitableFor: string[];
  usage: string;
  notice: string;
  gallery: string[];
  expandedInfo: ExpandedInfoItem[];
};

export default function AdminStorefrontShell() {
  const storefrontFrameRef =
    useRef<HTMLIFrameElement>(null);
  const previewScrollYRef = useRef(0);

  const [previewMode, setPreviewMode] =
    useState(false);
  const [selection, setSelection] =
    useState<StudioSelection>(null);
  const [frameKey, setFrameKey] = useState(0);

  const sendProductPreviewPatch = useCallback(
    (
      productId: number,
      patch:
        | ProductCardPreviewDraft
        | ProductDetailPreviewDraft
    ) => {
      storefrontFrameRef.current?.contentWindow?.postMessage(
        {
          type: "jourdeness-studio-product-preview",
          productId,
          patch,
        },
        window.location.origin
      );
    },
    []
  );

  const handleProductCardDraftChange = useCallback(
    (
      productId: number,
      draft: ProductCardPreviewDraft
    ) => {
      sendProductPreviewPatch(productId, draft);

      setSelection((currentSelection) =>
        currentSelection?.type === "product" &&
        currentSelection.productId === productId
          ? {
              ...currentSelection,
              label:
                draft.cardName ||
                currentSelection.label,
            }
          : currentSelection
      );
    },
    [sendProductPreviewPatch]
  );

  const handleProductDetailDraftChange =
    useCallback(
      (
        productId: number,
        draft: ProductDetailPreviewDraft
      ) => {
        sendProductPreviewPatch(productId, draft);

        setSelection((currentSelection) =>
          currentSelection?.type ===
            "product-detail" &&
          currentSelection.productId === productId
            ? {
                ...currentSelection,
                label:
                  draft.name ||
                  currentSelection.label,
              }
            : currentSelection
        );
      },
      [sendProductPreviewPatch]
    );

  useEffect(() => {
    function handleStudioMessage(
      event: MessageEvent
    ) {
      if (event.origin !== window.location.origin) {
        return;
      }

      const data = event.data as
        | {
            type?: string;
            selection?: StudioSelection;
          }
        | undefined;

      if (
        data?.type !==
          "jourdeness-studio-selection" ||
        !data.selection
      ) {
        return;
      }

      setSelection(data.selection);
    }

    window.addEventListener(
      "message",
      handleStudioMessage
    );

    return () => {
      window.removeEventListener(
        "message",
        handleStudioMessage
      );
    };
  }, []);

  function rememberPreviewScroll() {
    try {
      previewScrollYRef.current =
        storefrontFrameRef.current?.contentWindow
          ?.scrollY ?? 0;
    } catch {
      previewScrollYRef.current = 0;
    }
  }

  function reloadPreview() {
    rememberPreviewScroll();
    setFrameKey((current) => current + 1);
  }

  function restorePreviewScroll() {
    const frameWindow =
      storefrontFrameRef.current?.contentWindow;

    frameWindow?.postMessage(
      {
        type: "jourdeness-admin-edit-mode",
        enabled: true,
      },
      window.location.origin
    );

    const savedScrollY = previewScrollYRef.current;

    window.setTimeout(() => {
      try {
        frameWindow?.scrollTo({
          top: savedScrollY,
          behavior: "auto",
        });
      } catch {
        // 預覽載入期間若尚未能捲動，保持原狀即可。
      }

      if (
        selection?.type === "product-detail"
      ) {
        frameWindow?.postMessage(
          {
            type:
              "jourdeness-studio-open-product-detail",
            productId: selection.productId,
          },
          window.location.origin
        );
      }
    }, 350);
  }

  function openFullPreview() {
    setPreviewMode(true);
  }

  function closeFullPreview() {
    setPreviewMode(false);
  }

  function renderEditorPanel() {
    if (!selection) {
      return (
        <div className={styles.emptyEditor}>
          <div
            className={styles.emptyEditorIcon}
          >
            ✦
          </div>

          <h2>選擇要修改的內容</h2>

          <p>
            請在右側手機網站預覽中點選內容。
            商品卡單擊選取，雙擊開啟商品詳情。
          </p>

          <div className={styles.editorTips}>
            <span>
              單擊商品：修改商品卡圖片、名稱與價格
            </span>
            <span>
              雙擊商品：修改商品詳情與輪播圖片
            </span>
            <span>
              點主視覺：更換圖片與查看尺寸
            </span>
            <span>
              點排行榜：修改該排名位置
            </span>
          </div>
        </div>
      );
    }

    if (selection.type === "product") {
      return (
        <ProductStudioEditor
          key={`card-${selection.productId}`}
          productId={selection.productId}
          onDraftChange={
            handleProductCardDraftChange
          }
          onSaved={(updatedProduct) => {
            setSelection({
              type: "product",
              productId: updatedProduct.id,
              label:
                updatedProduct.cardName ||
                updatedProduct.name,
            });

            reloadPreview();
          }}
        />
      );
    }

    if (
      selection.type === "product-detail"
    ) {
      return (
        <ProductDetailStudioEditor
          key={`detail-${selection.productId}`}
          productId={selection.productId}
          onDraftChange={
            handleProductDetailDraftChange
          }
          onSaved={(updatedProduct) => {
            setSelection({
              type: "product-detail",
              productId: updatedProduct.id,
              label: updatedProduct.name,
            });

            reloadPreview();
          }}
        />
      );
    }

    if (selection.type === "hero") {
      return (
        <div
          className={styles.editorPlaceholder}
        >
          <div className={styles.editorHeading}>
            <span>首頁主視覺</span>
            <h2>
              {selection.label ??
                "主視覺圖片"}
            </h2>
          </div>

          <p>
            商品功能完成後，下一步會接上主視覺圖片更換與尺寸檢查。
          </p>
        </div>
      );
    }

    if (selection.type === "ranking") {
      return (
        <div
          className={styles.editorPlaceholder}
        >
          <div className={styles.editorHeading}>
            <span>熱銷排行榜</span>
            <h2>
              排行榜第 {selection.rank} 名
            </h2>
          </div>

          <p>
            下一步會在這裡修改該格商品、圖片與顯示狀態。
          </p>
        </div>
      );
    }

    return (
      <div
        className={styles.editorPlaceholder}
      >
        <div className={styles.editorHeading}>
          <span>選單與系列</span>
          <h2>
            {selection.label ?? "系列管理"}
          </h2>
        </div>

        <p>
          下一步會在這裡新增系列、修改名稱、選擇所屬分類，以及啟用或停用。
        </p>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className={styles.previewShell}>
        <iframe
          className={styles.previewFrame}
          src="/"
          title="佐登妮絲城堡網站預覽"
        />

        <button
          type="button"
          className={
            styles.returnManageButton
          }
          onClick={closeFullPreview}
        >
          返回工作台
        </button>
      </div>
    );
  }

  return (
    <div className={styles.studioShell}>
      <header className={styles.studioHeader}>
        <div className={styles.studioBrand}>
          <span>Website Studio</span>

          <div>
            <strong>
              佐登妮絲城堡網站工作台
            </strong>
            <small>
              單擊商品卡，雙擊商品詳情
            </small>
          </div>
        </div>

        <div className={styles.studioActions}>
          <button
            type="button"
            onClick={reloadPreview}
          >
            重新整理預覽
          </button>

          <button
            type="button"
            onClick={openFullPreview}
          >
            全畫面預覽
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            開啟正式網站
          </a>
        </div>
      </header>

      <div className={styles.studioBody}>
        <aside className={styles.editorPanel}>
          <div
            className={
              styles.editorPanelHeader
            }
          >
            <div>
              <span>內容編輯器</span>
              <strong>
                {selection
                  ? selection.label ??
                    "目前選取內容"
                  : "尚未選取"}
              </strong>
            </div>

            {selection ? (
              <button
                type="button"
                onClick={() =>
                  setSelection(null)
                }
              >
                關閉
              </button>
            ) : null}
          </div>

          <div
            className={
              styles.editorPanelContent
            }
          >
            {renderEditorPanel()}
          </div>
        </aside>

        <main
          className={styles.previewWorkspace}
        >
          <div
            className={styles.phonePreviewTop}
          >
            <div>
              <span
                className={styles.liveDot}
              />
              手機網站預覽
            </div>

            <span>
              單擊選取｜雙擊商品詳情
            </span>
          </div>

          <div className={styles.phoneStage}>
            <div className={styles.phoneFrame}>
              <div
                className={styles.phoneSpeaker}
              />

              <iframe
                key={frameKey}
                ref={storefrontFrameRef}
                className={
                  styles.storefrontFrame
                }
                src="/?admin=1&edit=1&studio=1"
                title="佐登妮絲城堡手機網站管理預覽"
                onLoad={restorePreviewScroll}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
