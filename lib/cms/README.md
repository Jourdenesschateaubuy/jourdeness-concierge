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

以下舊資料表已於 2026-08-29
從正式 Neon PostgreSQL 移除：

- homepage_versions
- homepage_publish_state

Legacy Storefront Sections
--------------------------

舊商城展示配置已退役。

以下 runtime / admin 已移除：

- /admin/storefront
- lib/storefront-section-repository.ts

以下舊資料表已於 2026-08-29
從正式 Neon PostgreSQL 移除：

- storefront_sections
- storefront_section_items

刪除前的歷史資料已另外備份。

Historical Migration Scripts
----------------------------

舊 homepage / storefront migration scripts
仍保留在 scripts 目錄作為架構歷史紀錄。

這些 legacy migration scripts 可能建立或操作
已退役的資料表，因此不得重新套用至目前正式資料庫。

目前正式首頁內容應以 Site Studio 架構為準。
