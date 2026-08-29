Jourdeness CMS
===============

目前架構
--------

網站內容管理目前分為：

- media
- navigation
- website-settings

首頁內容與發布由 Site Studio 負責：

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

舊資料表 homepage_versions 與 homepage_publish_state
目前暫時保留，不在程式碼清理階段刪除。

Legacy Storefront Sections
--------------------------

舊商城展示配置已退役。

以下 runtime / admin 已移除：

- /admin/storefront
- lib/storefront-section-repository.ts

storefront_sections 與 storefront_section_items
目前僅保留為歷史資料表。

相關 migration scripts 暫時保留作為歷史紀錄，
本次不修改或刪除 Neon 資料。
