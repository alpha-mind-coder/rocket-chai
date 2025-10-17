// const express = require("express");
// const path = require("path");
// const multer = require("multer");
// const upload = multer({ storage: multer.memoryStorage() });

// const { createClient } = require("@supabase/supabase-js");
// const cors = require("cors");
// require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
// const session = require("express-session");

// const port = process.env.PORT || 3000;
// const app = express();

// // ✅ Supabase client
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// const corsOptions = {
//   origin: ["https://rocket-chai.vercel.app", "http://localhost:3000"],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true,
// };

// // ✅ CORS for Vercel frontend
// app.use(cors(corsOptions));

// // ✅ EJS setup
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.set("trust proxy", 1);

// // ✅ Static assets
// app.use(express.static(path.join(__dirname, "public")));
// app.use(
//   express.static(path.join(__dirname, "..", "frontend"), {
//     index: false,
//   })
// );

// // ✅ JSON parsing
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ Session middleware
// app.use(
//   session({
//     secret: "rocket-secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       maxAge: 1000 * 60 * 30,
//     },
//   })
// );

// // ✅ Clear cookie if session gone
// app.use((req, res, next) => {
//   if (!req.session || !req.session.item) {
//     res.clearCookie("connect.sid");
//   }
//   next();
// });

// // ✅ Health check
// app.get("/healthz", (req, res) => res.send("OK"));

// // ✅ Check session contents
// app.get("/session-check", (req, res) => {
//   console.log("📦 Session check:", req.session.item);
//   res.json({
//     item: req.session.item || null,
//     quantity: req.session.quantity || 0,
//   });
// });

// // ✅ Homepage
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
// });

// // ✅ Menu routes
// app.get("/pizza", (req, res) => res.render("vegpizza.ejs"));
// app.get("/mania", (req, res) => res.render("mania.ejs"));
// app.get("/burger", (req, res) => res.render("burger.ejs"));
// app.get("/coconut", (req, res) => res.render("coconut.ejs"));
// app.get("/garlic", (req, res) => res.render("garlic.ejs"));
// app.get("/taco", (req, res) => res.render("taco.ejs"));
// app.get("/dessert", (req, res) => res.render("dessert.ejs"));
// app.get("/NVpizza", (req, res) => res.render("NVpizza.ejs"));

// // ✅ Scan page
// app.get("/scan", (req, res) => {
//   console.log("🧪 /scan hit");
//   console.log("🧪 Session at /scan:", req.session);

//   let cart = req.session.item || {};
//   if (typeof cart === "string") cart = JSON.parse(cart);
//   const quantity = req.session.quantity || 0;

//   let hasItems = false;
//   for (const id in cart) {
//     for (const size in cart[id]) {
//       if (cart[id][size].quantity > 0) {
//         hasItems = true;
//         break;
//       }
//     }
//     if (hasItems) break;
//   }

//   if (!hasItems || quantity <= 0) {
//     req.session.flash = "🛒 Please choose your items before scanning to pay.";
//     return res.redirect("/");
//   }

//   let total = 0;
//   for (const id in cart) {
//     for (const size in cart[id]) {
//       total += cart[id][size].price * cart[id][size].quantity;
//     }
//   }

//   res.render("scan", { cart, quantity, total });
// });

// // ✅ Handle scan form POST (manual order upload)
// app.post("/scan", upload.single("payment_screenshot"), (req, res) => {
//   console.log("📩 POST /scan hit");

//   const { name, student_id, phone, email, upi_id } = req.body;
//   const file = req.file;

//   if (!file) {
//     return res.send("❌ Please upload a payment screenshot");
//   }

//   console.log("✅ Order received:", { name, student_id, phone, email, upi_id });
//   console.log("🛒 Cart from session:", req.session.item);

//   // ✅ Destroy session & clear cookie
//   req.session.destroy((err) => {
//     if (err) console.error("❌ Session destroy failed:", err);
//     else console.log("🧹 Session destroyed successfully!");
//     res.clearCookie("connect.sid", {
//       path: "/",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       secure: process.env.NODE_ENV === "production",
//     });
//     res.status(200).send("✅ Order placed successfully, cart cleared!");
//   });
// });

// // ✅ Flash message endpoint
// app.get("/flash.js", (req, res) => {
//   const message = req.session.flash || "";
//   delete req.session.flash;
//   res.type("application/javascript").send(`window.flashMessage = "${message}";`);
// });

// // ✅ Save cart to session
// app.post("/save-cart", upload.none(), (req, res) => {
//   let cart = {};
//   let quantity = 0;

//   if (req.body.item) {
//     cart = JSON.parse(req.body.item);
//     quantity = parseInt(req.body.quantity) || 0;
//   }

//   req.session.item = cart;
//   req.session.quantity = quantity;

//   console.log("✅ Cart received:", cart);

//   res.render("scan.ejs", {
//     cart,
//     quantity,
//     total: Object.values(cart).reduce(
//       (acc, sizes) =>
//         acc + Object.values(sizes).reduce((s, i) => s + i.price * i.quantity, 0),
//       0
//     ),
//   });
// });

// // ✅ Submit order to Supabase
// app.post("/submit-order", upload.single("payment_screenshot"), async (req, res) => {
//   console.log("Received file:", req.file);
//   console.log("Received body:", req.body);

//   const { name, student_id, phone, email } = req.body;
//   const cart = req.body.item ? JSON.parse(req.body.item) : null;
//   const quantity = req.body.quantity ? parseInt(req.body.quantity, 10) : 0;

//   if (!cart || quantity <= 0) return res.status(400).send("Cart is empty");
//   if (!req.file) return res.status(400).send("Payment screenshot is required");

//   try {
//     const fileName = `orders/${Date.now()}_${req.file.originalname}`;

//     const { error: uploadError } = await supabase.storage
//       .from("screenshots")
//       .upload(fileName, req.file.buffer, {
//         contentType: req.file.mimetype,
//         upsert: false,
//       });

//     if (uploadError) {
//       console.error("Upload error:", uploadError);
//       return res.status(500).send("Failed to upload screenshot");
//     }

//     const { data } = supabase.storage.from("screenshots").getPublicUrl(fileName);
//     const publicURL = data.publicUrl;

//     const { error: insertError } = await supabase.from("orders").insert([
//       {
//         name,
//         student_id,
//         phone,
//         email,
//         item: JSON.stringify(cart),
//         quantity,
//         screenshot_url: publicURL,
//       },
//     ]);

//     if (insertError) {
//       console.error("Supabase insert error:", insertError.message);
//       return res.status(500).send("Error saving order");
//     }

//     // ✅ Destroy session completely & clear cookie
//     req.session.destroy((err) => {
//       if (err) console.error("❌ Session destroy failed:", err);
//       else console.log("🧹 Session destroyed successfully!");
//       res.clearCookie("connect.sid", {
//         path: "/",
//         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//         secure: process.env.NODE_ENV === "production",
//       });
//       res.status(200).send("✅ Order placed successfully, cart cleared!");
//     });
//   } catch (err) {
//     console.error("Unexpected error:", err);
//     res.status(500).send("Server error");
//   }
// });

// // ✅ Admin login
// app.get("/login-admin", (req, res) => {
//   const { code } = req.query;
//   console.log("🔐 Admin login attempt with code:", code);
//   if (code === process.env.ADMIN_PASS) {
//     req.session.isAdmin = true;
//     req.session.save(() => res.redirect("/admin"));
//   } else {
//     console.log("❌ Access denied – wrong code");
//     res.status(403).send("Access denied");
//   }
// });

// // ✅ Admin dashboard
// app.get("/admin", async (req, res) => {
//   if (!req.session.isAdmin) return res.status(403).send("Access denied");

//   const { data, error } = await supabase.from("orders").select("*");
//   if (error) {
//     console.error("❌ Supabase fetch error:", error.message);
//     return res.status(500).send("Error fetching orders");
//   }

//   res.render("admin", { orders: data });
// });

// // ✅ Delete order (admin)
// app.delete("/admin/delete-order/:id", async (req, res) => {
//   if (!req.session.isAdmin) return res.status(403).send("Access denied");

//   const orderId = req.params.id;

//   try {
//     const { error } = await supabase.from("orders").delete().eq("id", orderId);
//     if (error) {
//       console.error("Supabase delete error:", error.message);
//       return res.status(500).send("Error deleting order");
//     }
//     res.status(200).send("Order deleted");
//   } catch (err) {
//     console.error("Unexpected error deleting order:", err);
//     res.status(500).send("Server error");
//   }
// });

// // ✅ Start server
// app.listen(port, () => {
//   console.log(`🚀 Rocket Chai backend running at http://localhost:${port}`);
// });


const express = require("express");
const path = require("path");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");

const port = process.env.PORT || 3000;
const app = express();

// ✅ Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const corsOptions = {
  origin: ["https://rocket-chai.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

// ✅ CORS for frontend
app.use(cors(corsOptions));

// ✅ EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

// ✅ Static assets
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.static(path.join(__dirname, "..", "frontend"), {
    index: false,
  })
);

// ✅ JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session middleware
app.use(
  session({
    secret: "rocket-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 30,
    },
  })
);

// ✅ Clear cookie if session gone
app.use((req, res, next) => {
  if (!req.session || !req.session.cart) {
    res.clearCookie("connect.sid");
  }
  next();
});

// ✅ Health check
app.get("/healthz", (req, res) => res.send("OK"));

// ✅ Check session contents
app.get("/session-check", (req, res) => {
  res.json({
    cart: req.session.cart || {},
    quantity: req.session.quantity || 0,
  });
});

// ✅ Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

// ✅ Menu routes
app.get("/pizza", (req, res) => res.render("vegpizza.ejs", { cartFromSession: req.session.cart || {} }));
app.get("/mania", (req, res) => res.render("mania.ejs", { cartFromSession: req.session.cart || {} }));
app.get("/burger", (req, res) => res.render("burger.ejs" , { cartFromSession: req.session.cart || {} }));
app.get("/coconut", (req, res) => res.render("coconut.ejs", { cartFromSession: req.session.cart || {} }));
app.get("/garlic", (req, res) => res.render("garlic.ejs", { cartFromSession: req.session.cart || {} }));
app.get("/taco", (req, res) => res.render("taco.ejs", { cartFromSession: req.session.cart || {} }));
app.get("/dessert", (req, res) => res.render("dessert.ejs", { cartFromSession: req.session.cart || {} }));
app.get("/NVpizza", (req, res) => res.render("NVpizza.ejs", { cartFromSession: req.session.cart || {} }));

// ✅ Scan page
app.get("/scan", (req, res) => {
  let cart = req.session.cart|| {};
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

// ✅ Handle scan form POST (manual order upload)
app.post("/scan", upload.single("payment_screenshot"), (req, res) => {
  const { name, student_id, phone, email, upi_id } = req.body;
  const file = req.file;

  if (!file) return res.send("❌ Please upload a payment screenshot");

  // Destroy session & clear cookie
  req.session.destroy((err) => {
    if (err) console.error("❌ Session destroy failed:", err);
    res.clearCookie("connect.sid", {
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).send("✅ Order placed successfully, cart cleared!");
  });
});

// ✅ Flash message endpoint
app.get("/flash.js", (req, res) => {
  const message = req.session.flash || "";
  delete req.session.flash;
  res.type("application/javascript").send(`window.flashMessage = "${message}";`);
});

// ✅ Save cart to session (AJAX call)
app.post("/save-cart", express.json(), (req, res) => {
  try {
    const { cart, quantity } = req.body || {};
    if (!cart || quantity === undefined) return res.status(400).json({ success: false, message: "Invalid cart" });

    // Save cart in session consistently
    req.session.cart = cart;
    req.session.quantity = quantity;

    req.session.save(() => {
      console.log("✅ Cart saved in session:", req.session.cart);
      res.json({ success: true });
    });
  } catch (err) {
    console.error("❌ Error saving cart:", err);
    res.status(500).json({ success: false, message: "Failed to save cart" });
  }
});


// ✅ Optional: update cart via AJAX
app.post("/update-cart", express.json(), (req, res) => {
  try {
    const newCart = req.body || {};
    const existingCart = req.session.cart || {};

    // Merge items
    for (const pid in newCart) {
      if (!existingCart[pid]) existingCart[pid] = {};
      for (const size in newCart[pid]) {
        existingCart[pid][size] = newCart[pid][size];
      }
    }

    req.session.cart = existingCart;

    // Recalculate total quantity
    req.session.quantity = Object.values(existingCart).reduce(
      (acc, sizes) => acc + Object.values(sizes).reduce((s, i) => s + i.quantity, 0),
      0
    );

    console.log("🛠 Updated cart in session:", req.session.cart);
    res.json({ success: true, cart: req.session.cart, quantity: req.session.quantity });
  } catch (err) {
    console.error("❌ Error updating cart:", err);
    res.status(500).json({ success: false, error: "Failed to update cart" });
  }
});

    


// ✅ Submit order to Supabase
app.post("/submit-order", upload.single("payment_screenshot"), async (req, res) => {
  const { name, student_id, phone, email } = req.body;
  const cart = req.session.cart || null;
  const quantity = req.session.quantity || 0;

  if (!cart || quantity <= 0) return res.status(400).json({ success: false, message: "Cart is empty" });
  if (!req.file) return res.status(400).json({ success: false, message: "Payment screenshot is required" });

  try {
    const fileName = `orders/${Date.now()}_${req.file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from("screenshots")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
    if (uploadError) return res.status(500).send("Failed to upload screenshot");

    const { data } = supabase.storage.from("screenshots").getPublicUrl(fileName);
    const publicURL = data.publicUrl;

    const { error: insertError } = await supabase.from("orders").insert([
      {
        name,
        student_id,
        phone,
        email,
        item: JSON.stringify(cart),
        quantity,
        screenshot_url: publicURL,
      },
    ]);
    if (insertError) return res.status(500).send("Error saving order");

    // Destroy session & clear cookie after order
    req.session.destroy((err) => {
      if (err) console.error("❌ Session destroy failed:", err);
      res.clearCookie("connect.sid", {
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.status(200).json({ success: true, message: "Order placed successfully, cart cleared!" });
    });
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
    req.session.save(() => res.redirect("/admin"));
  } else {
    res.status(403).send("Access denied");
  }
});

// ✅ Admin dashboard
app.get("/admin", async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send("Access denied");
  const { data, error } = await supabase.from("orders").select("*");
  if (error) return res.status(500).send("Error fetching orders");
  res.render("admin", { orders: data });
});

// ✅ Delete order (admin)
app.delete("/admin/delete-order/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).send("Deleted successfully");
  } catch (err) {
    console.error("❌ Delete failed:", err.message);
    res.status(500).send("Error deleting order");
  }
});


// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Rocket Chai backend running at http://localhost:${port}`);
});
