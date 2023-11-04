const express = require("express");
const path = require("path");
const db = require("../db/database");
const state = require("../state");
const router = express.Router();

// 管理者画面に直接アクセスするためのルート
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "admin.html"));
});

// カウントを開始するエンドポイント
router.get("/start-count", (req, res) => {
  state.setCountingEnabled(true);
  res.json({ message: "カウントを開始しました。" });
});

// カウントを停止するエンドポイント
router.get("/stop-count", (req, res) => {
  state.setCountingEnabled(false);
  res.json({ message: "カウントを停止しました。" });
});

// 管理者用のエンドポイントを追加（セキュリティ対策として基本的なAPIキーとパスワードを使用）
router.get("/reset-count", (req, res) => {
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

module.exports = router;
