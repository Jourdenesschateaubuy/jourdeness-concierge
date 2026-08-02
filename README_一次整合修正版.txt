Jourdeness Website Studio 一次整合修正版
日期：2026-08-02

【這一版一次修正】
1. 商品價格編輯
   - 原價與售價可輸入 660、$660、產地價 $660 等常見格式。
   - 儲存時統一整理為穩定資料格式。
   - 商品卡與商品詳情顯示同一組價格。
   - 改為局部更新，不會因只改價格而覆蓋其他商品內容。

2. JSON／紅色 1 Issue 錯誤
   - 補齊 /api/storefront/site-studio。
   - 補齊 /api/storefront/catalog。
   - 管理介面的 API 讀取改為安全 JSON 處理。
   - API 出錯時顯示可理解訊息，不再直接出現 <!DOCTYPE is not valid JSON。

3. 主視覺與副主視覺
   - 兩張圖都能在右側點選。
   - 左側可更換圖片、查看建議／實際尺寸、格式與檔案大小。
   - 左側修改時右側即時預覽，儲存後寫入資料庫。
   - 副主視覺原本被 CSS 禁止點擊的問題已修正。
   - 主／副視覺的標題、副標題與按鈕文字都可預覽。

4. TOP 1～6 排行榜
   - 拿掉「查看商品」「開始選配」等按鈕文字。
   - 整張 TOP 卡都可以點。
   - 前台點擊後統一先進入對應商品詳情。
   - 管理模式點擊仍會開啟該排名位置的編輯器。

5. 分類與系列
   - 前台只使用六大主分類：本月優惠、臉部保養、身體洗護、健康補給、精油香氛、新品預告。
   - 牙膏、貼布、精油等內部分類不再誤當前台主分類。
   - 系列可新增、改名、移動主分類、上移、下移、啟用與停用。
   - 前台漢堡選單改讀取同一套分類資料。

6. 漢堡選單
   - 第一次按漢堡開啟。
   - 再按一次同一個漢堡即可關閉。
   - 點背景與右上角關閉仍保留。

7. 既有操作保留
   - 單擊商品卡：精簡商品卡編輯。
   - 雙擊商品卡：商品詳情編輯。
   - 商品卡與商品詳情可互相切換。
   - 左側修改、右側即時同步。
   - 儲存後盡量保留右側手機預覽位置。

【安裝方式】
1. 在 PowerShell 按 Ctrl + C，停止 npm run dev。
2. 建議先複製整個專案資料夾做備份。
3. 將本 ZIP 解壓縮。
4. 把 ZIP 裡的 app 與 lib 資料夾複製到專案根目錄：
   C:\Users\ad829\OneDrive\Desktop\WebProjects\jourdeness-concierge
5. Windows 詢問時選「取代目的地中的檔案」。
6. 在專案根目錄執行：

   Remove-Item -Recurse -Force .\app\api\admin\series -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   npm run build

7. Build 成功後執行：

   npm run dev

8. 開啟：
   http://localhost:3000/admin

也可以在覆蓋完成後執行 ZIP 裡的：

   powershell -ExecutionPolicy Bypass -File ".\verify-jourdeness-fix.ps1"

【建議測試順序】
1. 單擊商品卡，將價格改成 660，確認右側顯示「產地價 $ 660」，儲存後重新整理仍正常。
2. 點主視覺，更換文字或圖片，測試即時預覽與儲存。
3. 點副主視覺，確認左側能開啟並儲存。
4. 點 TOP 1～6，確認前台整張卡會進商品詳情，且沒有舊按鈕文字。
5. 點漢堡兩次，確認可以開啟再關閉。
6. 在分類與系列新增一個測試系列，確認右側選單同步。

【重要部署提醒】
目前圖片上傳使用 UPLOAD_ROOT（例如 D:\JourdenessData），適合本機／公司主機。
若正式網站部署在 Vercel，正式上線前仍要改成雲端物件儲存，否則 Vercel 無法長期保存本機硬碟圖片。

【驗證說明】
本包已完成：
- 50 個 TS／TSX 檔案語法轉譯檢查：0 個語法錯誤。
- app 與 lib 相對引用檢查：0 個缺失。
- 舊錯誤路徑 app/api/admin/series/route.ts：未包含。
- 管理前端直接 response.json() 風險檢查：已改為安全 JSON 讀取。

因此環境無法連線下載本專案的 npm 套件，完整 Next.js production build 需以你的本機 npm run build 結果為最終確認。


【v2 額外修正】
- 修正首頁同時呼叫多個 API 時，預設分類「本月優惠」被重複建立的資料庫競態。
- catalog_categories 改用 UPSERT，並加入 PostgreSQL transaction advisory lock。
- 避免 duplicate key value violates unique constraint catalog_categories_name_key。
