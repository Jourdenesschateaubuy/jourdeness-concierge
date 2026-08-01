const fs = require("fs");

const file = "app/admin/products/_components/ProductForm.tsx";
let text = fs.readFileSync(file, "utf8");

const propsBefore = `type ProductFormProps = {
  product?: DatabaseProduct;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
};`;

const propsAfter = `type ProductFormProps = {
  product?: DatabaseProduct;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  productType?: "product" | "combo";
};`;

if (!text.includes(propsBefore)) {
  throw new Error("找不到 ProductFormProps");
}

text = text.replace(propsBefore, propsAfter);

const functionBefore = `export default function ProductForm({
  product,
  action,
  submitLabel,
}: ProductFormProps) {`;

const functionAfter = `export default function ProductForm({
  product,
  action,
  submitLabel,
  productType = "product",
}: ProductFormProps) {`;

if (!text.includes(functionBefore)) {
  throw new Error("找不到 ProductForm 參數");
}

text = text.replace(functionBefore, functionAfter);

const formBefore = `    <form action={action} className={styles.form}>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}`;

const formAfter = `    <form action={action} className={styles.form}>
      <input
        type="hidden"
        name="productType"
        value={productType}
      />

      {product ? <input type="hidden" name="id" value={product.id} /> : null}`;

if (!text.includes(formBefore)) {
  throw new Error("找不到表單開頭");
}

text = text.replace(formBefore, formAfter);

fs.writeFileSync(file, text, "utf8");

console.log("✓ ProductForm 已支援 productType");
