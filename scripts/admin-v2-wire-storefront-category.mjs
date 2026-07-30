import fs from "node:fs";

function editFile(file, edits) {
  let source = fs.readFileSync(file, "utf8");
  const eol = source.includes("\r\n") ? "\r\n" : "\n";

  function replaceOnce(label, from, to) {
    from = from.replace(/\r?\n/g, eol);
    to = to.replace(/\r?\n/g, eol);

    if (!source.includes(from)) {
      throw new Error(`${file}: cannot find ${label}`);
    }

    source = source.replace(from, to);
  }

  for (const edit of edits) {
    replaceOnce(edit.label, edit.from, edit.to);
  }

  fs.writeFileSync(file, source, "utf8");
  console.log(`updated ${file}`);
}

/* 1. Product type */
editFile("lib/storefront-core.ts", [
  {
    label: "Product storefrontCategory",
    from: `  category: MainCategory;
  series: string;
  originalPrice?: string;`,
    to: `  category: MainCategory;
  series: string;
  storefrontCategory?: MainCategory;
  originalPrice?: string;`,
  },
]);

/* 2. Repository */
editFile("lib/product-repository.ts", [
  {
    label: "ProductWriteInput storefrontCategory",
    from: `  category: string;
  series: string;
  originalPrice?: string;`,
    to: `  category: string;
  series: string;
  storefrontCategory?: string;
  originalPrice?: string;`,
  },
  {
    label: "ProductRow storefront_category",
    from: `  category: string;
  series: string;
  original_price: string | null;`,
    to: `  category: string;
  series: string;
  storefront_category: string | null;
  original_price: string | null;`,
  },
  {
    label: "rowToProduct storefrontCategory",
    from: `    category: row.category as MainCategory,
    series: row.series,
    originalPrice: optional(row.original_price),`,
    to: `    category: row.category as MainCategory,
    series: row.series,
    storefrontCategory: optional(row.storefront_category) as MainCategory | undefined,
    originalPrice: optional(row.original_price),`,
  },
  {
    label: "INSERT columns",
    from: `            id, sku, name, category, series, original_price, price, image,
            description, card_name, card_subtitle, spec, intro, price_note,`,
    to: `            id, sku, name, category, series, storefront_category, original_price, price, image,
            description, card_name, card_subtitle, spec, intro, price_note,`,
  },
  {
    label: "INSERT placeholders",
    from: `            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
            $17::jsonb,$18::jsonb,$19,$20,$21::jsonb,$22::jsonb,$23::jsonb,$24,$25,NOW()`,
    to: `            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
            $18::jsonb,$19::jsonb,$20,$21,$22::jsonb,$23::jsonb,$24::jsonb,$25,$26,NOW()`,
  },
  {
    label: "INSERT values",
    from: `          input.category,
          input.series,
          input.originalPrice || null,
          input.price,`,
    to: `          input.category,
          input.series,
          input.storefrontCategory || null,
          input.originalPrice || null,
          input.price,`,
  },
  {
    label: "UPDATE assignments",
    from: `        category = $4,
        series = $5,
        original_price = $6,
        price = $7,
        image = $8,
        description = $9,
        card_name = $10,
        card_subtitle = $11,
        spec = $12,
        intro = $13,
        price_note = $14,
        expiry_note = $15,
        internal_expiry_date = $16,
        features = $17::jsonb,
        suitable_for = $18::jsonb,
        usage = $19,
        notice = $20,
        gallery = $21::jsonb,
        expanded_info = $22::jsonb,
        combo_config = COALESCE($23::jsonb, combo_config),
        status = $24,
        sort_order = $25,`,
    to: `        category = $4,
        series = $5,
        storefront_category = COALESCE($6, storefront_category),
        original_price = $7,
        price = $8,
        image = $9,
        description = $10,
        card_name = $11,
        card_subtitle = $12,
        spec = $13,
        intro = $14,
        price_note = $15,
        expiry_note = $16,
        internal_expiry_date = $17,
        features = $18::jsonb,
        suitable_for = $19::jsonb,
        usage = $20,
        notice = $21,
        gallery = $22::jsonb,
        expanded_info = $23::jsonb,
        combo_config = COALESCE($24::jsonb, combo_config),
        status = $25,
        sort_order = $26,`,
  },
]);

/* 3. Admin form action */
editFile("app/admin/products/actions.ts", [
  {
    label: "form storefrontCategory",
    from: `    category,
    series: stringValue(formData, "series"),
    originalPrice: optionalString(formData, "originalPrice"),`,
    to: `    category,
    series: stringValue(formData, "series"),
    storefrontCategory: optionalString(formData, "storefrontCategory"),
    originalPrice: optionalString(formData, "originalPrice"),`,
  },
]);

/* 4. Storefront: new category first, legacy whitelist fallback */
editFile("app/page.tsx", [
  {
    label: "main category compatibility",
    from: `    if (selectedCategory === "臉部保養") return faceCareProductIdsV368.has(product.id);
    if (selectedCategory === "身體洗護") return bodyCareProductIdsV368.has(product.id);
    if (selectedCategory === "健康補給") return healthProductIdsV368.has(product.id);
    if (selectedCategory === "精油香氛") return essentialOilProductIdsV359.has(product.id);`,
    to: `    if (selectedCategory === "臉部保養") {
      return product.storefrontCategory
        ? product.storefrontCategory === "臉部保養"
        : faceCareProductIdsV368.has(product.id);
    }

    if (selectedCategory === "身體洗護") {
      return product.storefrontCategory
        ? product.storefrontCategory === "身體洗護"
        : bodyCareProductIdsV368.has(product.id);
    }

    if (selectedCategory === "健康補給") {
      return product.storefrontCategory
        ? product.storefrontCategory === "健康補給"
        : healthProductIdsV368.has(product.id);
    }

    if (selectedCategory === "精油香氛") {
      return product.storefrontCategory
        ? product.storefrontCategory === "精油香氛"
        : essentialOilProductIdsV359.has(product.id);
    }`,
  },
  {
    label: "main category alias compatibility",
    from: `    if (alias === "臉部保養") return faceCareProductIdsV368.has(product.id);
    if (alias === "身體洗護") return bodyCareProductIdsV368.has(product.id);
    if (alias === "健康補給") return healthProductIdsV368.has(product.id);
    if (alias === "精油香氛") return essentialOilProductIdsV359.has(product.id);`,
    to: `    if (alias === "臉部保養") {
      return product.storefrontCategory
        ? product.storefrontCategory === "臉部保養"
        : faceCareProductIdsV368.has(product.id);
    }

    if (alias === "身體洗護") {
      return product.storefrontCategory
        ? product.storefrontCategory === "身體洗護"
        : bodyCareProductIdsV368.has(product.id);
    }

    if (alias === "健康補給") {
      return product.storefrontCategory
        ? product.storefrontCategory === "健康補給"
        : healthProductIdsV368.has(product.id);
    }

    if (alias === "精油香氛") {
      return product.storefrontCategory
        ? product.storefrontCategory === "精油香氛"
        : essentialOilProductIdsV359.has(product.id);
    }`,
  },
]);

console.log("Admin V2 storefront category compatibility layer added.");
