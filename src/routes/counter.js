const express = require("express");
const db = require("../db/database");
const state = require("../state");
const path = require("path");
const router = express.Router();

// NFCタグからアクセスされるエンドポイント
router.get("/increment", (req, res) => {
  if (!state.getCountingEnabled()) {
    return res.status(403).send("現在カウントは有効ではありません。");
  }

  res.sendFile(path.join(__dirname, "..", "..", "public", "read.html"));

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
        // res.send(`来場者数は現在: ${row.totalVisitors + 1}です。`);
      });
    } else {
      // レコードが存在しない場合、新しいレコードを作成
      const insertSql = `INSERT INTO visitor_counts (day, totalVisitors) VALUES (strftime('%Y-%m-%d', 'now', 'localtime'), 0)`;
      db.run(insertSql, function (err) {
        if (err) {
          return console.error(err.message);
        }
        // res.send("来場者数は1から始まります。");
      });
    }
  });
});

// 来場者数を取得するためのエンドポイント
router.get("/count", (req, res) => {
  // 今日の日付に対応するレコードを取得して来場者数を返す
  const sql = `SELECT totalVisitors FROM visitor_counts WHERE day = strftime('%Y-%m-%d', 'now', 'localtime')`;

  db.get(sql, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.json({ count: row ? row.totalVisitors : 0 });
  });
});

module.exports = router;
