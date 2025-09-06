const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const mysql = require("mysql2");

// Use same DB config as index.js
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Admin route connected to MySQL");
});

router.get("/admin", isAdmin, (req, res) => {
  db.query("SELECT * FROM orders", (err, results) => {
    if (err) return res.status(500).send("Error fetching orders");
    res.render("admin", { orders: results });
  });
});

module.exports = router;