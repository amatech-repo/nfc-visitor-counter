const express = require("express");
const path = require("path");
const config = require("./config/config");

const indexRoutes = require("./routes/index");
const adminRoutes = require("./routes/admin");
const counterRoutes = require("./routes/counter");

const app = express();

// `public` ディレクトリを静的ファイルとして設定する
app.use(express.static(path.join(__dirname, "..", "public")));

// ルートの使用
app.use("/", indexRoutes);
app.use("/admin", adminRoutes);
app.use("/counter", counterRoutes);

// サーバーを起動
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}/`);
});
