const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// データベース接続を開く
const dbPath = path.join(__dirname, "..", "..", "visitors.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the visitors database.");
});

module.exports = db;
