
"use client";

import Link from "next/link";
import {
  changePromotionStatusAction,
  deletePromotionAction,
} from "../actions";
import type { Promotion } from "../../../../lib/promotion-repository";
import styles from "./promotion-manager.module.css";

export default function PromotionManager({
  promotions,
}: {
  promotions: Promotion[];
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.top}>
        <div>
          <strong>{promotions.length} 筆優惠</strong>
          <span>來源：Neon PostgreSQL</span>
        </div>
        <Link href="/admin/promotions/new">＋ 新增優惠</Link>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>優惠名稱</th>
              <th>類型</th>
              <th>規則</th>
              <th>商品</th>
              <th>優先級</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => {
              const relevantProducts = promotion.products.filter((item) =>
                promotion.type === "mix_match"
                  ? item.role === "eligible"
                  : item.role === "buy"
              );

              const rule =
                promotion.type === "mix_match"
                  ? `任選 ${promotion.requiredQuantity ?? 0} 件・NT$${(
                      promotion.bundlePrice ?? 0
                    ).toLocaleString("zh-TW")}`
                  : `買 ${promotion.buyQuantity ?? 0} 送 ${
                      promotion.giftQuantity ?? 0
                    }`;

              return (
                <tr key={promotion.id}>
                  <td>#{promotion.id}</td>
                  <td>
                    <strong>{promotion.name}</strong>
                    {promotion.description ? (
                      <small>{promotion.description}</small>
                    ) : null}
                  </td>
                  <td>
                    <span className={styles.typeBadge}>
                      {promotion.type === "mix_match"
                        ? "任搭組合"
                        : "買幾送幾"}
                    </span>
                  </td>
                  <td>{rule}</td>
                  <td>
                    <div className={styles.productNames}>
                      {relevantProducts.slice(0, 3).map((item) => (
                        <span key={`${item.role}-${item.productId}`}>
                          {item.name}
                        </span>
                      ))}
                      {relevantProducts.length > 3 ? (
                        <em>＋{relevantProducts.length - 3}</em>
                      ) : null}
                    </div>
                  </td>
                  <td>{promotion.priority}</td>
                  <td>
                    <form action={changePromotionStatusAction}>
                      <input type="hidden" name="id" value={promotion.id} />
                      <select
                        name="status"
                        defaultValue={promotion.status}
                        onChange={(event) =>
                          event.currentTarget.form?.requestSubmit()
                        }
                      >
                        <option value="active">啟用</option>
                        <option value="inactive">停用</option>
                      </select>
                    </form>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/promotions/${promotion.id}/edit`}>
                        編輯
                      </Link>
                      <form
                        action={deletePromotionAction}
                        onSubmit={(event) => {
                          if (
                            !window.confirm(
                              `確定要刪除「${promotion.name}」嗎？`
                            )
                          ) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={promotion.id} />
                        <button type="submit">刪除</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {promotions.length === 0 ? (
          <div className={styles.empty}>
            <strong>目前還沒有資料庫優惠</strong>
            <p>先建立一筆任搭組合或買幾送幾來測試。</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
