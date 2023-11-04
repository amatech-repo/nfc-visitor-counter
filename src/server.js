const express = require("express");
const app = express();
const port = 3000;

// 静的ファイルを提供するディレクトリを設定
app.use(express.static("public"));

// 簡易的なデータベース代わりにカウンターを使用
let visitorCount = 0;

// ルートエンドポイント
app.get("/", (req, res) => {
  res.send("Welcome to the NFC Counter Server!");
});

// NFCタグからアクセスされるエンドポイント
app.get("/increment", (req, res) => {
  visitorCount++; // 来場者カウントを増やす
  res.send(`Visitor count is now: ${visitorCount}`);
});

// 来場者数を取得するためのエンドポイント
app.get("/count", (req, res) => {
  res.json({ count: visitorCount });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
