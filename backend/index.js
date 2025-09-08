const express = require("express");
const path = require("path");
const { createClient } = require('@supabase/supabase-js');
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const session = require("express-session");

const app = express();

// ✅ Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

// ✅ EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Static assets
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "public")));

// ✅ JSON parsing
app.use(express.json());

// ✅ Session middleware
app.use(session({
  secret: "rocket-secret",
  resave: false,
  saveUninitialized: true
}));

// ✅ Debug session
app.use((req, res, next) => {
  console.log("Session state:", req.session);
  next();
});

// ✅ Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ✅ Scan page
app.get("/scan", (req, res) => {
  const cart = req.session.cart || {};
  const total = req.session.total || 0;
   const hasItems = Object.keys(cart).length > 0;

  if (!hasItems || total <= 0) {
     req.session.flash = "🛒 Please choose your items before scanning to pay.";

    return res.redirect("/"); // or show a message page if you prefer
  }

  res.render("scan", { cart, total });
});
app.get("/flash.js", (req, res) => {
  const message = req.session.flash || "";
  delete req.session.flash;
  res.type("application/javascript").send(`window.flashMessage = "${message}";`);
});

// ✅ Save cart
app.post("/save-cart", (req, res) => {
  req.session.cart = req.body.cart;
  req.session.total = req.body.total;
  res.sendStatus(200);
});

// ✅ Submit order to Supabase
app.post("/submit-order", async (req, res) => {
  const { name, student_id, phone, email, item, quantity } = req.body;
  const { data, error } = await supabase
    .from("orders")
    .insert([{ name, student_id, phone, email, item, quantity }]);

  if (error) {
    console.error("❌ Supabase insert error:", error.message);
    return res.status(500).send("Error saving order");
  }

  res.status(200).send("Order saved!");
});

// ✅ Admin login
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

// ✅ Admin dashboard
app.get("/admin", async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send("Access denied");

  const { data, error } = await supabase.from("orders").select("*");
  console.log("Fetched orders:", data);
  if (error) {
    console.error("❌ Supabase fetch error:", error.message);
    return res.status(500).send("Error fetching orders");
  }

  res.render("admin", { orders: data });
});
app.get("/healthz", (req, res) => res.send("OK"));
// ✅ Start server
app.listen(3000, () => {
  console.log("🚀 Rocket Chai running at http://localhost:3000");
});
