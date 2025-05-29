SignalsDemo
本專案為 Angular Signals 應用範例，展示 Signals 在狀態管理、非同步處理、RxJS 整合等多種情境下的實作方式。每個功能模組皆有對應的教學與實作，適合學習與參考。

目錄結構
主要技術
Angular 19（含 Signals API）
RxJS
ngxtension（signalSlice、connect 等輔助函式）
Tailwind CSS
各功能模組簡介
1. signal
展示 signal、computed、effect 的基本用法。
包含物件 signal、untracked、effect 監聽等進階技巧。
2. derived-async
使用 derivedAsync 處理 Promise、Observable 非同步資料。
支援 switch、merge、concat、exhaust 等行為模式。
3. derived-from
結合多個 signal 或 observable，並可用 RxJS operator 處理。
支援 initialValue、注入 context 等進階用法。
4. observable-signal
展示 signal 與 observable 互轉，並於 UI 中即時反映。
5. lazy-signal
使用 toLazySignal 實現資料的懶加載，優化效能。
6. connect
connect 可將 observable 或多個 stream 連接到 signal。
支援 reducer、auto save 等進階應用。
7. signal-slice
以 signalSlice 管理複雜狀態，支援 sources、actionSources、selectors。
適合大型應用的狀態切片管理。
8. signal-demos
setTimeout、setInterval、Promise 等常見非同步情境下的 signal 實作。

如何啟動
啟動本地開發伺服器：
```
ng serve
```
瀏覽器開啟 http://localhost:4200/，程式碼異動會自動重載。


參考資源
Angular Signals 官方文件
RxJS 與 Signals 整合
[ngxtension](https://ngxtension.netlify.app/utilities/signals/computed-async/)
Angular CLI 指令
如需更詳細的範例與說明，請參考 features 內各資料夾的 .md 文件與元件程式碼。
