import Link from "next/link";
import { categoryConfig } from "../../../../lib/storefront-core";
import type { DatabaseProduct } from "../../../../lib/product-repository";
import styles from "./product-form.module.css";
import ProductImageUploader from "./ProductImageUploader";

type ProductFormProps = {
  product?: DatabaseProduct;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
};

const categories = Object.keys(categoryConfig);

export default function ProductForm({
  product,
  action,
  submitLabel,
}: ProductFormProps) {
  return (
    <form action={action} className={styles.form}>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>基本資料</span>
            <h2>商品資訊</h2>
          </div>
          {product ? <strong>商品 ID #{product.id}</strong> : null}
        </div>

        <div className={styles.grid}>
          <label className={styles.span2}>
            <span>商品名稱 *</span>
            <input
              name="name"
              required
              defaultValue={product?.name ?? ""}
            />
          </label>

          <label>
            <span>貨號</span>
            <input
              name="sku"
              defaultValue={product?.sku ?? ""}
              placeholder="可留空"
            />
          </label>

          <label>
            <span>系列</span>
            <input name="series" defaultValue={product?.series ?? ""} />
          </label>

          <label>
            <span>分類 *</span>
            <select
              name="category"
              required
              defaultValue={product?.category ?? "保養品"}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>規格</span>
            <input name="spec" defaultValue={product?.spec ?? ""} />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>價格</span>
            <h2>售價設定</h2>
          </div>
        </div>

        <div className={styles.grid}>
          <label>
            <span>原價</span>
            <input
              name="originalPrice"
              defaultValue={product?.originalPrice ?? ""}
              placeholder="例如：原價 $ 1,290"
            />
          </label>

          <label>
            <span>目前售價／活動價 *</span>
            <input
              name="price"
              required
              defaultValue={product?.price ?? ""}
              placeholder="例如：產地價 $ 890"
            />
          </label>

          <label>
            <span>價格補充</span>
            <input
              name="priceNote"
              defaultValue={product?.priceNote ?? ""}
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>前台內容</span>
            <h2>圖片與說明</h2>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.span2} ${styles.imageField}`}>
            <span>商品圖片 *</span>
            <ProductImageUploader
              initialImage={product?.image ?? ""}
            />
          </div>

          <label>
            <span>商品卡名稱</span>
            <input
              name="cardName"
              defaultValue={product?.cardName ?? ""}
            />
          </label>

          <label>
            <span>商品卡副標</span>
            <input
              name="cardSubtitle"
              defaultValue={product?.cardSubtitle ?? ""}
            />
          </label>

          <label className={styles.span2}>
            <span>商品簡介</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={product?.description ?? ""}
            />
          </label>

          <label className={styles.span2}>
            <span>商品資訊頁介紹</span>
            <textarea
              name="intro"
              rows={4}
              defaultValue={product?.intro ?? ""}
            />
          </label>

          <label>
            <span>效期顯示文字</span>
            <input
              name="expiryNote"
              defaultValue={product?.expiryNote ?? ""}
            />
          </label>

          <label>
            <span>內部效期日期</span>
            <input
              name="internalExpiryDate"
              type="date"
              defaultValue={product?.internalExpiryDate ?? ""}
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>刊登</span>
            <h2>商品狀態</h2>
          </div>
        </div>

        <div className={styles.grid}>
          <label>
            <span>狀態</span>
            <select
              name="status"
              defaultValue={product?.status ?? "active"}
            >
              <option value="active">上架中</option>
              <option value="inactive">下架</option>
              <option value="coming_soon">新品預告</option>
              <option value="sold_out">售罄</option>
            </select>
          </label>

          <label>
            <span>排序</span>
            <input
              name="sortOrder"
              type="number"
              step="1"
              defaultValue={product?.sortOrder ?? 0}
            />
          </label>
        </div>
      </section>

      <div className={styles.actions}>
        <Link href="/admin/products">取消</Link>
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
