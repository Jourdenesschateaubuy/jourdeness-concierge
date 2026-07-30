import fs from "node:fs";

const repoPath = "./lib/product-repository.ts";
const actionPath = "./app/admin/products/actions.ts";
const formPath =
  "./app/admin/products/_components/ProductCardEditForm.tsx";

let repo = fs.readFileSync(repoPath, "utf8").replace(/\r\n/g, "\n");
let actions = fs.readFileSync(actionPath, "utf8").replace(/\r\n/g, "\n");
let form = fs.readFileSync(formPath, "utf8").replace(/\r\n/g, "\n");

function replaceOnce(source, before, after, label) {
  if (!source.includes(before)) {
    console.error(`❌ 找不到：${label}`);
    process.exit(1);
  }

  return source.replace(before, after);
}

/* ======================================================
   A. ProductWriteInput 補齊商品詳情欄位
====================================================== */

if (!repo.includes("features: string[];")) {
  repo = replaceOnce(
    repo,
`  internalExpiryDate?: string;
  status: ProductStatus;`,
`  internalExpiryDate?: string;
  features: string[];
  suitableFor: string[];
  usage?: string;
  notice?: string;
  gallery: string[];
  expandedInfo: NonNullable<Product["expandedInfo"]>;
  status: ProductStatus;`,
    "ProductWriteInput"
  );
}

/* ======================================================
   B. CREATE 寫入完整欄位
====================================================== */

if (!repo.includes("features, suitable_for, usage, notice, gallery, expanded_info")) {
  repo = replaceOnce(
    repo,
`            description, card_name, card_subtitle, spec, intro, price_note,
            expiry_note, internal_expiry_date, status, sort_order, updated_at`,
`            description, card_name, card_subtitle, spec, intro, price_note,
            expiry_note, internal_expiry_date,
            features, suitable_for, usage, notice, gallery, expanded_info,
            status, sort_order, updated_at`,
    "CREATE 欄位"
  );

  repo = replaceOnce(
    repo,
`            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW()`,
`            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
            $17::jsonb,$18::jsonb,$19,$20,$21::jsonb,$22::jsonb,$23,$24,NOW()`,
    "CREATE placeholders"
  );

  repo = replaceOnce(
    repo,
`          input.expiryNote || null,
          input.internalExpiryDate || null,
          input.status,
          input.sortOrder,`,
`          input.expiryNote || null,
          input.internalExpiryDate || null,
          JSON.stringify(input.features ?? []),
          JSON.stringify(input.suitableFor ?? []),
          input.usage || null,
          input.notice || null,
          JSON.stringify(input.gallery ?? []),
          JSON.stringify(input.expandedInfo ?? []),
          input.status,
          input.sortOrder,`,
    "CREATE params"
  );
}

/* ======================================================
   C. UPDATE 寫入完整欄位
====================================================== */

if (!repo.includes("features = $17::jsonb")) {
  repo = replaceOnce(
    repo,
`        expiry_note = $15,
        internal_expiry_date = $16,
        status = $17,
        sort_order = $18,`,
`        expiry_note = $15,
        internal_expiry_date = $16,
        features = $17::jsonb,
        suitable_for = $18::jsonb,
        usage = $19,
        notice = $20,
        gallery = $21::jsonb,
        expanded_info = $22::jsonb,
        status = $23,
        sort_order = $24,`,
    "UPDATE 欄位"
  );

  repo = replaceOnce(
    repo,
`      input.expiryNote || null,
      input.internalExpiryDate || null,
      input.status,
      input.sortOrder,`,
`      input.expiryNote || null,
      input.internalExpiryDate || null,
      JSON.stringify(input.features ?? []),
      JSON.stringify(input.suitableFor ?? []),
      input.usage || null,
      input.notice || null,
      JSON.stringify(input.gallery ?? []),
      JSON.stringify(input.expandedInfo ?? []),
      input.status,
      input.sortOrder,`,
    "UPDATE params"
  );
}

/* ======================================================
   D. Server Action 解析重複欄位
====================================================== */

if (!actions.includes("function stringValues(")) {
  actions = replaceOnce(
    actions,
`function optionalString(formData: FormData, name: string) {
  const value = stringValue(formData, name);
  return value || undefined;
}`,
`function optionalString(formData: FormData, name: string) {
  const value = stringValue(formData, name);
  return value || undefined;
}

function stringValues(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function expandedInfoValues(formData: FormData) {
  const titles = formData
    .getAll("expandedInfoTitle")
    .map((value) => String(value).trim());

  const contents = formData
    .getAll("expandedInfoContent")
    .map((value) => String(value).trim());

  const length = Math.max(titles.length, contents.length);

  return Array.from({ length }, (_, index) => ({
    title: titles[index] ?? "",
    content: contents[index] ?? "",
  })).filter((item) => item.title && item.content);
}`,
    "Action parser helpers"
  );
}

if (!actions.includes("features: stringValues(formData")) {
  actions = replaceOnce(
    actions,
`    internalExpiryDate: optionalString(formData, "internalExpiryDate"),
    status: parseStatus(stringValue(formData, "status")),`,
`    internalExpiryDate: optionalString(formData, "internalExpiryDate"),
    features: stringValues(formData, "features"),
    suitableFor: stringValues(formData, "suitableFor"),
    usage: optionalString(formData, "usage"),
    notice: optionalString(formData, "notice"),
    gallery: stringValues(formData, "gallery"),
    expandedInfo: expandedInfoValues(formData),
    status: parseStatus(stringValue(formData, "status")),`,
    "productInputFromForm"
  );
}

/* ======================================================
   E. 目前商品卡編輯器先保留完整詳情資料
   避免尚未做 UI 前儲存造成資料被清空
====================================================== */

if (!form.includes('name="features"')) {
  const marker =
`      <input
        type="hidden"
        name="sortOrder"
        value={product.sortOrder ?? 0}
      />`;

  const hiddenFields =
`      {(product.features ?? []).map((item, index) => (
        <input
          key={"feature-" + index}
          type="hidden"
          name="features"
          value={item}
        />
      ))}

      {(product.suitableFor ?? []).map((item, index) => (
        <input
          key={"suitable-" + index}
          type="hidden"
          name="suitableFor"
          value={item}
        />
      ))}

      <input
        type="hidden"
        name="usage"
        value={product.usage ?? ""}
      />

      <input
        type="hidden"
        name="notice"
        value={product.notice ?? ""}
      />

      {(product.gallery ?? []).map((item, index) => (
        <input
          key={"gallery-" + index}
          type="hidden"
          name="gallery"
          value={item}
        />
      ))}

      {(product.expandedInfo ?? []).map((item, index) => (
        <div key={"expanded-" + index}>
          <input
            type="hidden"
            name="expandedInfoTitle"
            value={item.title}
          />
          <input
            type="hidden"
            name="expandedInfoContent"
            value={item.content}
          />
        </div>
      ))}

${marker}`;

  form = replaceOnce(
    form,
    marker,
    hiddenFields,
    "商品卡編輯器保留詳情資料"
  );
}

fs.writeFileSync(repoPath, repo, "utf8");
fs.writeFileSync(actionPath, actions, "utf8");
fs.writeFileSync(formPath, form, "utf8");

console.log("✅ ProductWriteInput 已補齊完整商品資訊");
console.log("✅ CREATE / UPDATE 已接入 JSONB 詳情欄位");
console.log("✅ Server Action 已能接收特色、需求、圖片與更多資訊");
console.log("✅ 現有商品卡編輯器儲存時不會清掉詳情資料");
