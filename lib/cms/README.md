Jourdeness CMS
===============

目前架構
--------

網站內容管理已分為獨立模組：

- media
- navigation
- website-settings

首頁內容與發布目前由 Site Studio 負責：

- lib/site-studio-repository.ts
- lib/site-studio-types.ts
- /api/admin/site-studio
- /api/storefront/site-studio
- /admin/homepage-studio

Site Studio 使用自己的 draft / published 設定，
資料儲存在 site_studio_content。

Legacy Homepage Publication
---------------------------

舊 Homepage Publication runtime 已退役。

以下舊程式已移除：

- lib/homepage-publish-repository.ts
- lib/cms/modules/homepage/publication.ts
- lib/cms/core/publication-types.ts
- lib/cms/core/snapshot.ts

舊資料表 homepage_versions 與 homepage_publish_state
目前暫時保留，不在本次程式碼清理中刪除。

Storefront Sections
-------------------

lib/storefront-section-repository.ts 仍由
/admin/storefront 使用，因此目前保留。

Legacy homepage-specific CRUD 會另行評估與清理，
不影響一般 Storefront Section 管理功能。
