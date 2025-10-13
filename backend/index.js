const express = require("express");
const path = require("path");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { createClient } = require('@supabase/supabase-js');
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const session = require("express-session");

const port = process.env.PORT || 3000;
const app = express();

// ✅ Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const corsOptions = {
  origin: ["https://rocket-chai.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
};
// ✅ CORS for Vercel frontend
app.use(cors(corsOptions));

// ✅ EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set('trust proxy', 1);


// ✅ Static assets (used by scan/admin views)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname,"..", "frontend"),{
  index:false,
}));


// ✅ JSON parsing
app.use(express.json());

// ✅ Parse URL-encoded form data (important for forms)
app.use(express.urlencoded({ extended: true }));

// ✅ Session middleware
app.use(session({
  secret: "rocket-secret",
  resave: false,
  saveUninitialized: true,
    cookie: {
     secure: process.env.NODE_ENV === "production", // true in prod, false locally
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"

  }
}));

// ✅ Debug session
app.use((req, res, next) => {
  console.log("Session state:", req.session);
  next();
});

// ✅ Health check (single route)
app.get("/healthz", (req, res) => res.send("OK"));

// ✅ Redirect homepage to Vercel
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,"..","frontend", "index.html"));
});

app.get("/pizza",(req,res)=>{
  res.render("vegpizza.ejs")
})
app.get("/mania",(req,res)=>{
  res.render("mania.ejs")
})
app.get("/burger",(req,res)=>{
  res.render("burger.ejs")
})
app.get("/coconut",(req,res)=>{
  res.render("coconut.ejs")
})
app.get("/garlic",(req,res)=>{
  res.render("garlic.ejs")
})
app.get("/taco",(req,res)=>{
  res.render("taco.ejs")
})
app.get("/dessert",(req,res)=>{
  res.render("dessert.ejs")
})
app.get("/NVpizza",(req,res)=>{
  res.render("NVpizza.ejs")
})

// ✅ Scan page (EJS view)
app.get("/scan", (req, res) => {
   console.log("🧪 /scan hit");
  console.log("🧪 Session at /scan:", req.session);
  const cart = req.session.item || {};
   if (typeof cart === "string") cart = JSON.parse(cart);
  const quantity = req.session.quantity || 0;
  
 let hasItems = false;
for (const id in cart) {
  for (const size in cart[id]) {
    if (cart[id][size].quantity > 0) {
      hasItems = true;
      break;
    }
  }
  if (hasItems) break;
}

  if (!hasItems || quantity <= 0) {
    req.session.flash = "🛒 Please choose your items before scanning to pay.";
    return res.redirect("/");
  }

  let total = 0;
  for (const id in cart) {
  for (const size in cart[id]) {
    total += cart[id][size].price * cart[id][size].quantity;
  }
}
  res.render("scan", { cart, quantity, total });
});
app.post("/scan", upload.single("payment_screenshot"), (req, res) => {
  console.log("📩 POST /scan hit");

  const { name, student_id, phone, email, upi_id } = req.body;
  const file = req.file;

  if (!file) {
    return res.send("❌ Please upload a payment screenshot");
  }

  console.log("✅ Order received:", { name, student_id, phone, email, upi_id });
  console.log("🛒 Cart from session:", req.session.item);

  // Optionally clear session cart
  req.session.item = null;
  req.session.quantity = null;

  // Show confirmation message
  res.send("<h1>✅ Order placed successfully! Thank you for ordering.</h1>");
});

// Flash message endpoint
app.get("/flash.js", (req, res) => {
  const message = req.session.flash || "";
  delete req.session.flash;
  res.type("application/javascript").send(`window.flashMessage = "${message}";`);
});

// Save cart to session
app.post("/save-cart", upload.none(), (req, res) => {
  // Parse cart from request if present, else empty
  let cart = {};
  let quantity = 0;

  if (req.body.item) {
    cart = JSON.parse(req.body.item);
    quantity = parseInt(req.body.quantity) || 0;
  }

  // Save in session (optional, or skip if not using session)
  req.session.item = cart;
  req.session.quantity = quantity;

  console.log("✅ Cart received:", cart);

  // Always render scan page, even if cart empty
  res.render("scan.ejs", {
    cart: cart,
    quantity: quantity,
    total: Object.values(cart).reduce(
      (acc, sizes) => acc + Object.values(sizes).reduce((s, i) => s + i.price * i.quantity, 0),
      0
    )
  });
});



// Submit order to Supabase
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

      req.session.item = null;
      req.session.quantity = null;  
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

// Admin login
app.get("/login-admin", (req, res) => {
  const { code } = req.query;
  console.log("🔐 Admin login attempt with code:", code);
  console.log("Expected ADMIN_PASS:", process.env.ADMIN_PASS);
  if (code === process.env.ADMIN_PASS) {
    req.session.isAdmin = true;
    req.session.save(() => {
      res.redirect("/admin");
    });
  } else {
    console.log("❌ Access denied – wrong code");
    res.status(403).send("Access denied");
  }
});

// Admin dashboard
app.get("/admin", async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send("Access denied");

  const { data, error } = await supabase.from("orders").select("*");
  if (error) {
    console.error("❌ Supabase fetch error:", error.message);
    return res.status(500).send("Error fetching orders");
  }

  res.render("admin", { orders: data });
});
// Delete an order from admin dashboard
app.delete("/admin/delete-order/:id", async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send("Access denied");

  const orderId = req.params.id;

  try {
    // Optionally, fetch order first if you want to delete its screenshot
    const { data: orderData, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 = no rows found
      console.error("Supabase fetch error:", fetchError.message);
      return res.status(500).send("Error fetching order");
    }

    // Delete the order from Supabase
    const { data, error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("Supabase delete error:", error.message);
      return res.status(500).send("Error deleting order");
    }

    res.status(200).send("Order deleted");
  } catch (err) {
    console.error("Unexpected error deleting order:", err);
    res.status(500).send("Server error");
  }
});


// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Rocket Chai backend running at http://localhost:${port}`);
});
