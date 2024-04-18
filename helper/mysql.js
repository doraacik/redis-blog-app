const mysql = require("mysql2/promise");

const connection = mysql.createPool({
  connectionLimit: 100,
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "redis-blog-db",
});

module.exports = connection;