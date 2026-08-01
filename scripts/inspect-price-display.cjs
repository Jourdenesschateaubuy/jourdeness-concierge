const fs = require("fs");

const file = "app/page.tsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

const keywords = [
  "original-price",
  "hasKnownOriginalPrice(product)",
  "selectedDetailProduct.originalPrice",
  "return \"產地價\"",
];

const printed = new Set();

for (const keyword of keywords) {
  lines.forEach((line, index) => {
    if (!line.includes(keyword)) return;

    const start = Math.max(0, index - 12);
    const end = Math.min(lines.length, index + 15);
    const key = `${start}-${end}`;

    if (printed.has(key)) return;
    printed.add(key);

    console.log("\n========================================");
    console.log(`搜尋：${keyword}｜第 ${index + 1} 行`);
    console.log("========================================");

    for (let i = start; i < end; i++) {
      console.log(
        String(i + 1).padStart(5, " ") + " | " + lines[i]
      );
    }
  });
}
