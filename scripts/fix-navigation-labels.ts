import {
  getNavigationStatus,
  saveNavigationDraft,
  publishNavigationDraft,
} from "../lib/cms/modules/navigation/repository";

async function main() {
  const status =
    await getNavigationStatus();

  const labelMap: Record<
    string,
    string
  > = {
    home: "首頁",
    products: "商品",
    brand: "品牌故事",
  };

  const nextItems =
    status.draft.items.map(
      (item) => ({
        ...item,
        label:
          labelMap[item.id] ??
          item.label,
      })
    );

  await saveNavigationDraft({
    items: nextItems,
  });

  await publishNavigationDraft();

  console.log(
    "NAVIGATION LABEL MIGRATION OK"
  );

  console.table(
    nextItems.map(
      (item) => ({
        id: item.id,
        label: item.label,
        linkType:
          item.linkType,
        linkValue:
          item.linkValue,
        isVisible:
          item.isVisible,
      })
    )
  );
}

main().catch((error) => {
  console.error(
    "NAVIGATION LABEL MIGRATION FAILED"
  );
  console.error(error);
  process.exit(1);
});
