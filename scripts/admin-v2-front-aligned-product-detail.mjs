import fs from "node:fs";

const formPath =
  "./app/admin/products/_components/ProductCardEditForm.tsx";

const cssPath =
  "./app/admin/products/_components/product-card-edit-form.module.css";

let source = fs
  .readFileSync(formPath, "utf8")
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
   A. 配送提醒：沒存過資料時，編輯器也直接顯示
   客人目前實際看到的預設內容
===================================================== */

replaceOnce(
`  const [notice, setNotice] = useState(product.notice ?? "");`,
`  const [notice, setNotice] = useState(
    product.notice ??
      "滿 NT$3,000 享免運，僅提供宅配。\\n送出資料後，請至 LINE 與小幫手確認庫存、效期、金額、付款方式與宅配資訊。"
  );`,
  "notice state"
);

/* =====================================================
   B. 價格下方說明移到「商品卡」
   因為它實際顯示在前台價格下面
===================================================== */

replaceOnce(
`            </div>

            <label>
              <span>商品狀態</span>`,
`            </div>

            <label>
              <span>價格下方說明</span>
              <textarea
                name="priceNote"
                rows={3}
                value={priceNote}
                onChange={(event) =>
                  setPriceNote(event.target.value)
                }
                placeholder="例如：實際優惠與庫存依 LINE 小幫手確認為準。"
              />
            </label>

            <label>
              <span>商品狀態</span>`,
  "商品卡價格說明"
);

/* =====================================================
   C. 整個商品資訊分頁依前台順序重排
===================================================== */

const startMarker = `      {tab === "detail" && (`;
const endMarker = `      <div className={styles.actions}>`;

const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker);

if (start < 0 || end < 0 || end <= start) {
  console.error("❌ 找不到商品資訊分頁範圍");
  process.exit(1);
}

const detailBlock = `      {tab === "detail" && (
        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <span>商品資訊</span>
            <h2>照客人看到的商品頁順序修改</h2>
            <p className={styles.frontOrderNote}>
              從上往下就是前台商品資訊的顯示順序。
            </p>
          </div>

          {/* 1. 商品資訊 */}
          <section className={styles.detailSection}>
            <div className={styles.frontSectionHeading}>
              <span>01</span>
              <div>
                <h3>商品資訊</h3>
                <small>對應前台「商品資訊」卡片</small>
              </div>
            </div>

            <label>
              <span>規格／組合內容</span>
              <input
                name="spec"
                value={spec}
                onChange={(event) =>
                  setSpec(event.target.value)
                }
                placeholder="例如：30mL／瓶"
              />
            </label>

            <label>
              <span>效期</span>
              <textarea
                name="expiryNote"
                rows={3}
                value={expiryNote}
                onChange={(event) =>
                  setExpiryNote(event.target.value)
                }
                placeholder="例如：2029.06.14　實際效期以商品包裝標示為準"
              />
            </label>

            <label>
              <span>商品簡介</span>
              <textarea
                name="intro"
                rows={4}
                value={intro}
                onChange={(event) =>
                  setIntro(event.target.value)
                }
                placeholder="顯示在規格、效期下方的商品介紹文字"
              />
            </label>
          </section>

          {/* 2. 三張全站共用服務卡 */}
          <section className={styles.detailSection}>
            <div className={styles.frontSectionHeading}>
              <span>02</span>
              <div>
                <h3>購買服務提醒</h3>
                <small>目前為全站共用內容</small>
              </div>
            </div>

            <div className={styles.servicePreviewGrid}>
              <div className={styles.servicePreviewCard}>
                <strong>滿額免運</strong>
                <span>滿 NT$3,000 享免運</span>
              </div>

              <div className={styles.servicePreviewCard}>
                <strong>宅配出貨</strong>
                <span>目前僅提供宅配</span>
              </div>

              <div className={styles.servicePreviewCard}>
                <strong>LINE 確認</strong>
                <span>庫存效期確認</span>
              </div>
            </div>

            <p className={styles.sectionHelp}>
              這三張卡片屬於全站設定，因此在單一商品內先顯示預覽，不重複修改。
            </p>
          </section>

          {/* 3. 商品特色 */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitleRow}>
              <div className={styles.frontSectionHeading}>
                <span>03</span>
                <div>
                  <h3>商品特色</h3>
                  <small>前台一條一條顯示</small>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFeatures([...features, ""])
                }
              >
                ＋新增
              </button>
            </div>

            <div className={styles.repeatList}>
              {features.map((feature, index) => (
                <div
                  className={styles.repeatItem}
                  key={\`feature-\${index}\`}
                >
                  <input
                    name="features"
                    value={feature}
                    placeholder={\`商品特色 \${index + 1}\`}
                    onChange={(event) => {
                      const next = [...features];
                      next[index] = event.target.value;
                      setFeatures(next);
                    }}
                  />

                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      onClick={() =>
                        setFeatures(
                          moveItem(features, index, index - 1)
                        )
                      }
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFeatures(
                          moveItem(features, index, index + 1)
                        )
                      }
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFeatures(
                          features.filter(
                            (_, itemIndex) =>
                              itemIndex !== index
                          )
                        )
                      }
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. 了解更多 */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitleRow}>
              <div className={styles.frontSectionHeading}>
                <span>04</span>
                <div>
                  <h3>了解更多</h3>
                  <small>前台可展開的完整產品資訊</small>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setExpandedInfo([
                    ...expandedInfo,
                    { title: "", content: "" },
                  ])
                }
              >
                ＋新增
              </button>
            </div>

            {expandedInfo.length === 0 ? (
              <p className={styles.emptyText}>
                目前沒有額外資訊。
              </p>
            ) : (
              <div className={styles.repeatList}>
                {expandedInfo.map((item, index) => (
                  <div
                    className={styles.expandedItem}
                    key={\`expanded-\${index}\`}
                  >
                    <input
                      name="expandedInfoTitle"
                      value={item.title}
                      placeholder="區塊標題"
                      onChange={(event) => {
                        const next = [...expandedInfo];

                        next[index] = {
                          ...next[index],
                          title: event.target.value,
                        };

                        setExpandedInfo(next);
                      }}
                    />

                    <textarea
                      name="expandedInfoContent"
                      rows={3}
                      value={item.content}
                      placeholder="區塊內容"
                      onChange={(event) => {
                        const next = [...expandedInfo];

                        next[index] = {
                          ...next[index],
                          content: event.target.value,
                        };

                        setExpandedInfo(next);
                      }}
                    />

                    <button
                      type="button"
                      className={styles.deleteWide}
                      onClick={() =>
                        setExpandedInfo(
                          expandedInfo.filter(
                            (_, itemIndex) =>
                              itemIndex !== index
                          )
                        )
                      }
                    >
                      刪除這一段
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 5. 適合需求 */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitleRow}>
              <div className={styles.frontSectionHeading}>
                <span>05</span>
                <div>
                  <h3>適合需求</h3>
                  <small>前台會顯示成標籤</small>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSuitableFor([...suitableFor, ""])
                }
              >
                ＋新增
              </button>
            </div>

            <div className={styles.repeatList}>
              {suitableFor.map((item, index) => (
                <div
                  className={styles.repeatItem}
                  key={\`suitable-\${index}\`}
                >
                  <input
                    name="suitableFor"
                    value={item}
                    placeholder={\`需求標籤 \${index + 1}\`}
                    onChange={(event) => {
                      const next = [...suitableFor];
                      next[index] = event.target.value;
                      setSuitableFor(next);
                    }}
                  />

                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      onClick={() =>
                        setSuitableFor(
                          moveItem(
                            suitableFor,
                            index,
                            index - 1
                          )
                        )
                      }
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSuitableFor(
                          moveItem(
                            suitableFor,
                            index,
                            index + 1
                          )
                        )
                      }
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSuitableFor(
                          suitableFor.filter(
                            (_, itemIndex) =>
                              itemIndex !== index
                          )
                        )
                      }
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. 使用方式 */}
          <section className={styles.detailSection}>
            <div className={styles.frontSectionHeading}>
              <span>06</span>
              <div>
                <h3>
                  {category === "保健食品"
                    ? "食用方式"
                    : "使用方式"}
                </h3>
                <small>對應前台使用說明</small>
              </div>
            </div>

            <textarea
              name="usage"
              rows={5}
              value={usage}
              onChange={(event) =>
                setUsage(event.target.value)
              }
              placeholder="輸入客人會在商品頁看到的完整使用方式"
            />
          </section>

          {/* 7. 配送提醒 */}
          <section className={styles.detailSection}>
            <div className={styles.frontSectionHeading}>
              <span>07</span>
              <div>
                <h3>配送提醒</h3>
                <small>前台會依換行分成不同段落</small>
              </div>
            </div>

            <textarea
              name="notice"
              rows={5}
              value={notice}
              onChange={(event) =>
                setNotice(event.target.value)
              }
              placeholder="每一段可用換行分開"
            />
          </section>

          {/* 8. 更多商品圖片 */}
          <section className={styles.detailSection}>
            <div className={styles.frontSectionHeading}>
              <span>08</span>
              <div>
                <h3>更多商品圖片</h3>
                <small>商品資訊頁的其他圖片</small>
              </div>
            </div>

            <p className={styles.emptyText}>
              目前共 {product.gallery?.length ?? 0} 張。
              多圖片上傳與拖曳排序會在圖片管理階段接入；
              現有圖片這次儲存不會遺失。
            </p>
          </section>

          {/* 管理資料，不屬於商品頁內容 */}
          <section
            className={\`\${styles.detailSection} \${styles.managementSection}\`}
          >
            <div className={styles.frontSectionHeading}>
              <span>⚙</span>
              <div>
                <h3>管理設定</h3>
                <small>客人不會直接看到這一區</small>
              </div>
            </div>

            <div className={styles.twoColumns}>
              <label>
                <span>商品分類</span>
                <select
                  name="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>商品系列</span>
                <input
                  name="series"
                  value={series}
                  onChange={(event) =>
                    setSeries(event.target.value)
                  }
                />
              </label>
            </div>
          </section>
        </div>
      )}

`;

source =
  source.slice(0, start) +
  detailBlock +
  source.slice(end);

/* =====================================================
   D. 新版商品資訊視覺
===================================================== */

if (!css.includes(".frontSectionHeading")) {
  css += `

/* Admin V2：商品資訊與前台對照式編輯 */
.frontOrderNote {
  margin: 5px 0 0;
  color: #9a8589;
  font-size: 11px;
  line-height: 1.6;
}

.frontSectionHeading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.frontSectionHeading > span {
  flex: 0 0 auto;
  min-width: 30px;
  height: 30px;
  padding: 0 7px;
  border-radius: 999px;
  background: #f8e9ec;
  color: #932a39;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 950;
}

.frontSectionHeading > div {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.frontSectionHeading h3 {
  margin: 0;
}

.frontSectionHeading small {
  color: #a18c90;
  font-size: 10px;
  font-weight: 700;
}

.servicePreviewGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.servicePreviewCard {
  min-height: 82px;
  padding: 12px 8px;
  border: 1px solid #ead6d9;
  border-radius: 16px;
  background: #fffdfa;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.servicePreviewCard strong {
  color: #50373b;
  font-size: 11px;
}

.servicePreviewCard span {
  color: #a1867f;
  font-size: 9px;
  line-height: 1.45;
}

.sectionHelp {
  margin: 0;
  color: #a08e91;
  font-size: 10px;
  line-height: 1.6;
}

.managementSection {
  border-style: dashed;
  background: #faf8f7;
}

@media (max-width: 560px) {
  .servicePreviewGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .servicePreviewCard {
    min-height: 76px;
    padding: 9px 5px;
  }

  .servicePreviewCard strong {
    font-size: 10px;
  }

  .servicePreviewCard span {
    font-size: 8px;
  }
}
`;
}

fs.writeFileSync(formPath, source, "utf8");
fs.writeFileSync(cssPath, css, "utf8");

console.log("✅ 價格下方說明已移到商品卡");
console.log("✅ 商品資訊順序已改成與前台一致");
console.log("✅ 購買服務提醒已加入後台對照預覽");
console.log("✅ 分類／系列已移到最底部管理設定");
console.log("✅ 注意事項已改成真正的「配送提醒」");
console.log("✅ 商品資訊新版手機樣式已加入");
