import StorefrontSectionSorter from "../../storefront/StorefrontSectionSorter";
import Link from "next/link";

import {
  listStorefrontSectionItems,
  listStorefrontSections,
} from "../../../../lib/storefront-section-repository";

import {
  listDatabaseProducts,
} from "../../../../lib/product-repository";

import {
  addProductAction,
} from "../actions";


export const dynamic = "force-dynamic";


export default async function HomepageSectionProductsPage(
  {
    params,
  }: {
    params: Promise<{
      sectionId: string;
    }>;
  }
) {

  const { sectionId } = await params;

  const id = Number(sectionId);


  const sections = await listStorefrontSections({
    includeInactive: true,
  });


  const section = sections.find(
    (item) => item.id === id
  );


  if (!section) {
    return (
      <main>
        找不到首頁區塊
      </main>
    );
  }


  const [
    currentItems,
    products,
  ] = await Promise.all([
    listStorefrontSectionItems(id, {
      includeHidden: true,
      includeInactiveProducts: true,
    }),

    listDatabaseProducts({
      includeInactive: true,
    }),
  ]);


  const currentProductIds = new Set(
    currentItems.map(
      (item) => item.productId
    )
  );


  const availableProducts =
    products.filter(
      (product) =>
        !currentProductIds.has(product.id)
    );


  return (
    <main style={styles.page}>

      <Link
        href="/admin/homepage-studio"
        style={styles.back}
      >
        ← 回首頁配置
      </Link>


      <h1 style={styles.title}>
        {section.name}
      </h1>


      <p>
        管理此首頁區塊商品
      </p>


      <section style={styles.card}>

        <h2>
          目前商品
        </h2>


        <StorefrontSectionSorter
  sectionId={id}
  initialItems={currentItems}
/>

      </section>


      <section style={styles.card}>

        <h2>
          加入商品
        </h2>


        {
          availableProducts.map(
            (product) => (

              <form
                key={product.id}
                action={addProductAction}
              >

                <input
                  type="hidden"
                  name="sectionId"
                  value={id}
                />


                <input
                  type="hidden"
                  name="productId"
                  value={product.id}
                />


                <button
                  type="submit"
                  style={styles.button}
                >
                  ＋ {product.name}
                </button>

              </form>

            )
          )
        }

      </section>

    </main>
  );
}



const styles = {

  page:{
    padding:"40px",
  },

  title:{
    fontSize:"36px",
  },

  back:{
    color:"#8c2940",
  },

  card:{
    marginTop:"30px",
    padding:"24px",
    border:
      "1px solid #eee",
    borderRadius:"20px",
  },

  item:{
    padding:"12px",
    borderBottom:
      "1px solid #eee",
  },

  button:{
    margin:"6px",
    padding:"10px 18px",
    borderRadius:"999px",
    border:"1px solid #8c2940",
    background:"#fff",
    cursor:"pointer",
  },

};