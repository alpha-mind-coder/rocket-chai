const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const isAdmin = require("../middleware/isAdmin");
require("dotenv").config({ path: "../.env" });

// ✅ Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Admin dashboard route
router.get("/admin", isAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch error:", error.message);
      return res.status(500).send("Error fetching orders");
    }

    res.render("admin", { orders: data });
  } catch (err) {
    console.error("❌ Unexpected admin fetch error:", err);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;
