Jourdeness CMS Core v1
======================

目標
----
這一版是「架構重構」，不是新增商城功能。

原本：
lib/homepage-publish-repository.ts
    同時包含 Homepage-specific data model
    + Snapshot parsing
    + Version helper logic
    + Publish / Rollback logic

現在：
lib/cms/
  core/
    publication-types.ts
    snapshot.ts

  modules/
    homepage/
      publication.ts

首頁模組只保留 Homepage 的資料與 SQL。
共用的小型 publication / snapshot 能力開始搬到 CMS Core。

相容策略
--------
lib/homepage-publish-repository.ts 不刪除。

它現在只是 Compatibility Re-export：

  export * from "./cms/modules/homepage/publication";

因此舊 API route 或尚未搬移的 import 不會突然壞掉。

Homepage Studio 本身已改成直接引用：

  lib/cms/modules/homepage/publication

代表 Module Boundary 已真正開始使用。

Website Studio
--------------
新增：

  /admin/website-studio

目前是 CMS 總入口 Shell。

Homepage Builder：可使用
Website Settings：規劃中
Navigation Builder：規劃中
Banner Builder：規劃中
Footer Builder：規劃中
Publish Center：規劃中

沒有 Migration
--------------
本版沒有改資料表、沒有移資料、沒有改 Snapshot 格式。

安裝
----
1. 先 git commit / 備份。
2. 依 ZIP 路徑覆蓋 / 新增檔案。
3. 不需要 migration。
4. 執行：

   npx tsc --noEmit

5. 執行：

   npm run dev

第一個測試
----------
先只測「重構沒有破壞 Homepage」。

開：

  /admin/homepage-studio

確認：
- 頁面正常載入
- Version History 還在
- Homepage Sections 還在
- 手機 Preview 還在

先不要 Publish / Rollback。

第二個測試之後再測 Website Studio。
