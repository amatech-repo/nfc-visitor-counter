const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;
require("dotenv").config();

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
  isCountingEnabled = true; // カウントが有効になる
  res.json({ message: "カウントを開始しました。" });
});

// カウントを停止するエンドポイント
app.get("/stop-count", (req, res) => {
  isCountingEnabled = false;
  res.json({ message: "カウントを停止しました。" });
});

// NFCタグからアクセスされるエンドポイント
app.get("/increment", (req, res) => {
  if (!isCountingEnabled) {
    return res.status(403).send("現在カウントは有効ではありません。");
  }

  const selectSql = `SELECT id, totalVisitors FROM visitor_counts WHERE day = strftime('%Y-%m-%d', 'now', 'localtime');`;

  db.get(selectSql, (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    console.log(row);

    if (row) {
      // レコードが存在する場合、訪問者数を更新
      const updateSql = `UPDATE visitor_counts SET totalVisitors = totalVisitors + 1 WHERE id = ?`;
      db.run(updateSql, [row.id], function (err) {
        if (err) {
          return console.error(err.message);
        }
        res.send(`来場者数は現在: ${row.totalVisitors + 1}です。`);
      });
    } else {
      // レコードが存在しない場合、新しいレコードを作成
      const insertSql = `INSERT INTO visitor_counts (day, totalVisitors) VALUES (strftime('%Y-%m-%d', 'now', 'localtime'), 0)`;
      db.run(insertSql, function (err) {
        if (err) {
          return console.error(err.message);
        }
        res.send("来場者数は1から始まります。");
      });
    }
  });
});

// 来場者数を取得するためのエンドポイント
app.get("/count", (req, res) => {
  // 今日の日付に対応するレコードを取得して来場者数を返す
  const sql = `SELECT totalVisitors FROM visitor_counts WHERE day = strftime('%Y-%m-%d', 'now', 'localtime')`;

  db.get(sql, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.json({ count: row ? row.totalVisitors : 0 });
  });
});

// 管理者画面に直接アクセスするためのルートを追加
app.get("/admin", (req, res) => {
  res.sendFile("admin.html", { root: __dirname });
});

// 管理者用のエンドポイントを追加（セキュリティ対策として基本的なAPIキーとパスワードを使用）
app.get("/reset-count", (req, res) => {
  const apiKey = req.query.apiKey; // URLパラメータからAPIキーを取得
  const password = req.query.password; // URLパラメータからパスワードを取得
  const resetDate =
    req.query.date || "strftime('%Y-%m-%d', 'now', 'localtime')"; // パラメータからリセットする日付を取得、なければ今日

  console.log(apiKey, password, resetDate);
  console.log(process.env.ADMIN_API_KEY, process.env.ADMIN_PASSWORD);

  // 簡易的なAPIキー認証とパスワード認証（本番環境ではより堅牢な認証方法を実装してください）
  if (
    password !== process.env.ADMIN_PASSWORD ||
    apiKey !== process.env.ADMIN_API_KEY
  ) {
    return res.status(403).send("Unauthorized");
  }

  console.log(".env: ", process.env.ADMIN_API_KEY, process.env.ADMIN_PASSWORD);

  // 来場者数をリセットするSQLクエリ
  const resetSql = `UPDATE visitor_counts SET totalVisitors = 0 WHERE day = ${resetDate}`;

  db.run(resetSql, function (err) {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .send("An error occurred while resetting the visitor count.");
    }
    res.send(`Visitor count has been reset for ${resetDate}.`);
  });
});

// サーバーを起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
