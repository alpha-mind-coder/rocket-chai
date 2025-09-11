const express = require("express");
const path = require("path");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { createClient } = require('@supabase/supabase-js');
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const session = require("express-session");

const app = express();

// ✅ Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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
  const cart = req.session.item || {};       // ✅ Use 'item' instead of 'cart'
  const quantity = req.session.quantity || 0;
  const hasItems = Object.keys(cart).length > 0;

  if (!hasItems || quantity <= 0) {
    req.session.flash = "🛒 Please choose your items before scanning to pay.";
    return res.redirect("/");
  }
   let total = 0;
  for (const key in cart) {
    total += cart[key].price * cart[key].quantity;
  }
  res.render("scan", { cart, quantity ,total});
});


app.get("/flash.js", (req, res) => {
  const message = req.session.flash || "";
  delete req.session.flash;
  res.type("application/javascript").send(`window.flashMessage = "${message}";`);
});

// ✅ Save cart
app.post("/save-cart", (req, res) => {
  req.session.item = req.body.item;
  req.session.quantity = req.body.quantity;
  res.sendStatus(200);
});

// ✅ Submit order to Supabase
app.post("/submit-order", upload.single("payment_screenshot"), async (req, res) => {
  console.log("Received file:", req.file);
  console.log("Received body:", req.body);

  const { name, student_id, phone, email } = req.body;
  
  const cart = req.body.item ? JSON.parse(req.body.item) : null;
  const quantity = req.body.quantity ? parseInt(req.body.quantity, 10) : 0;

  if (!cart || quantity <= 0) {
    return res.status(400).send("Cart is empty");
  }

  if (!req.file) {
    return res.status(400).send("Payment screenshot is required");
  }

  try {
    const fileName = `orders/${Date.now()}_${req.file.originalname}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).send("Failed to upload screenshot");
    }

    const { data } = supabase.storage
      .from('screenshots')
      .getPublicUrl(fileName);

    const publicURL = data.publicUrl;

    if (!publicURL) {
      console.error("Failed to get public URL for uploaded screenshot");
      return res.status(500).send("Failed to get screenshot URL");
    }

    const { data: insertedData, error: insertError } = await supabase
      .from("orders")
      .insert([{
        name,
        student_id,
        phone,
        email,
        item: JSON.stringify(cart),
        quantity,
        screenshot_url: publicURL,
      }]);

    if (insertError) {
      console.error("Supabase insert error:", insertError.message);
      return res.status(500).send("Error saving order");
    }

    res.status(200).send("Order saved!");
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Server error");
  }
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
