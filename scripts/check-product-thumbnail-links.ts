import fs from "node:fs";
import path from "node:path";

const baseUrl = "http://localhost:3000";

async function main() {
  const response = await fetch(`${baseUrl}/api/storefront/products`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `無法讀取 storefront products API: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const products = Array.isArray(data.products) ? data.products : [];

  console.log("==============================================");
  console.log("Jourdeness Product Thumbnail Check");
  console.log("==============================================");
  console.log(`商品總數：${products.length}`);

  const noImage: any[] = [];
  const ok: any[] = [];
  const failed: any[] = [];

  for (const product of products) {
    const image =
      typeof product.image === "string" ? product.image.trim() : "";

    if (!image) {
      noImage.push({
        id: product.id,
        code: product.displayCode ?? product.display_code ?? "",
        name: product.name,
      });
      continue;
    }

    try {
      const imageUrl = new URL(image, baseUrl).toString();
      const imageResponse = await fetch(imageUrl, {
        cache: "no-store",
      });

      if (imageResponse.ok) {
        ok.push({
          id: product.id,
          code: product.displayCode ?? product.display_code ?? "",
          name: product.name,
          image,
          status: imageResponse.status,
        });
      } else {
        failed.push({
          id: product.id,
          code: product.displayCode ?? product.display_code ?? "",
          name: product.name,
          image,
          status: imageResponse.status,
        });
      }
    } catch (error) {
      failed.push({
        id: product.id,
        code: product.displayCode ?? product.display_code ?? "",
        name: product.name,
        image,
        status: "FETCH_ERROR",
      });
    }
  }

  console.log("");
  console.log("--------------- SUMMARY ----------------");
  console.log(`正常圖片：${ok.length}`);
  console.log(`沒有設定 image：${noImage.length}`);
  console.log(`圖片網址讀取失敗：${failed.length}`);
  console.log("----------------------------------------");

  if (noImage.length > 0) {
    console.log("");
    console.log("=== 沒有設定 image 的商品 ===");
    console.table(noImage);
  }

  if (failed.length > 0) {
    console.log("");
    console.log("=== 有 image，但圖片讀取失敗 ===");
    console.table(failed);
  }

  console.log("");
  console.log("檢查完成。");
}

main().catch((error) => {
  console.error("");
  console.error("檢查失敗：", error);
  process.exit(1);
});
