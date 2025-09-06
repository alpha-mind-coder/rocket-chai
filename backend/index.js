const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const session = require("express-session");
const mysql = require("mysql2");

const app = express();

// ✅ Connect to MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});

// ✅ Set up EJS for dynamic rendering
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Serve static frontend and public assets
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Enable JSON parsing
app.use(express.json());

// ✅ Initialize session middleware BEFORE routes
app.use(session({
  secret: "rocket-secret",
  resave: false,
  saveUninitialized: true
}));

// ✅ Debug session state
app.use((req, res, next) => {
  console.log("Session state:", req.session);
  next();
});

// ✅ Homepage route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ✅ Scan page route — shows QR + form
app.get("/scan", (req, res) => {
  const cart = req.session.cart || {};
  const total = req.session.total || 0;
  res.render("scan", { cart, total });
});

// ✅ Save cart before redirecting to /scan
app.post("/save-cart", (req, res) => {
  req.session.cart = req.body.cart;
  req.session.total = req.body.total;
  res.sendStatus(200);
});

// ✅ Save confirmed order to MySQL
app.post("/save-order", (req, res) => {
  const { customer, cart, total } = req.body;

  if (!customer || typeof customer !== "object") {
    console.warn("❌ Invalid customer data:", customer);
    return res.status(400).send("Invalid customer info");
  }

  const query = `
    INSERT INTO orders (name, studentid, contact, email, cart, total)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    customer.name || "N/A",
    customer.studentid || "N/A",
    customer.contact || "N/A",
    customer.email || "N/A",
    JSON.stringify(cart || {}),
    total || 0
  ];

  db.query(query, values, (err) => {
    if (err) {
      console.error("❌ Failed to save order:", err);
      return res.sendStatus(500);
    }
    res.sendStatus(200);
  });
});
// ✅ Secure admin login with password
app.get("/login-admin", (req, res) => {
  const { code } = req.query;
  if (code === process.env.ADMIN_PASS) {
    req.session.isAdmin = true;
    req.session.save(() => {
      res.redirect("/admin");
    });
  } else {
    res.status(403).send("Access denied");
  }
});

// ✅ Admin dashboard route
app.get("/admin", (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send("Access denied");

  db.query("SELECT * FROM orders", (err, results) => {
    if (err) return res.status(500).send("Error fetching orders");

    const orders = results.map(order => {
      let customer = {};
      let cart = {};

      try {
        customer = JSON.parse(order.customer);
      } catch (e) {
        console.warn("⚠️ Failed to parse customer JSON:", e.message);
      }

      try {
        cart = JSON.parse(order.cart);
      } catch (e) {
        console.warn("⚠️ Failed to parse cart JSON:", e.message);
      }

      return { ...order, customer, cart };
    });

    res.render("admin", { orders });
  });
});

// ✅ Start server
app.listen(3000, () => {
  console.log("🚀 Rocket Chai running at http://localhost:3000");
});