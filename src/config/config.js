require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  adminApiKey: process.env.ADMIN_API_KEY,
  adminPassword: process.env.ADMIN_PASSWORD,
};
