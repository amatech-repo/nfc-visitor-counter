const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

// 静的ファイルを提供するディレクトリを設定
app.use(express.static("public"));

// カウントが有効かどうかを追跡するフラグ
let isCountingEnabled = false;

// データベース接続を開く
const db = new sqlite3.Database("./visitors.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the visitors database.");
});

// データベーステーブルを作成する
db.run(`CREATE TABLE IF NOT EXISTS visitor_counts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT,
    totalVisitors INTEGER DEFAULT 0
  );`);

// ルートエンドポイント
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// カウントを開始するエンドポイント
app.get("/start-count", (req, res) => {
  isCountingEnabled = true;
  res.send("Counting started.");
});

// カウントを停止するエンドポイント
app.get("/stop-count", (req, res) => {
  isCountingEnabled = false;
  res.send("Counting stopped.");
});

// NFCタグからアクセスされるエンドポイント
app.get("/increment", (req, res) => {
  if (!isCountingEnabled) {
    return res.send("Counting is disabled.");
  }

  // 今日の日付に対応するレコードを取得
  const selectSql = `SELECT id, totalVisitors FROM visitor_counts WHERE day = DATE('now');`;

  db.get(selectSql, (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    if (row) {
      // レコードが存在する場合、訪問者数を更新
      const updateSql = `UPDATE visitor_counts SET totalVisitors = totalVisitors + 1 WHERE id = ?`;
      db.run(updateSql, [row.id], function (err) {
        if (err) {
          return console.error(err.message);
        }
        res.send(`Visitor count is now: ${row.totalVisitors + 1}`);
      });
    } else {
      // レコードが存在しない場合、新しいレコードを作成
      const insertSql = `INSERT INTO visitor_counts (day, totalVisitors) VALUES (DATE('now'), 1)`;
      db.run(insertSql, function (err) {
        if (err) {
          return console.error(err.message);
        }
        res.send(`Visitor count started at: 1`);
      });
    }
  });
});

// 来場者数を取得するためのエンドポイント
app.get("/count", (req, res) => {
  // 今日の日付に対応するレコードを取得して来場者数を返す
  const sql = `SELECT totalVisitors FROM visitor_counts WHERE day = DATE('now')`;

  db.get(sql, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.json({ count: row ? row.totalVisitors : 0 });
  });
});

// サーバーを起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
