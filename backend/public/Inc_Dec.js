
// --- Initialize in-memory cart ---
let cart = window.cart || {};
// --- Sync counts below each product card ---
function updateProductCounts() {
  document.querySelectorAll(".qty").forEach(qtyElem => {
    const card = qtyElem.closest(".pizza-card, .bur-1");
    if (!card) return;
    const id = card.dataset.pizzaId;
    const size = qtyElem.dataset.size || "Regular";

    // Check if this item + size exist in cart
    const item = cart[id]?.[size];
    qtyElem.innerText = item ? item.quantity : 0;
  });
}

// --- Update footer ---
function updateCartFooter(total, totalItems) {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.innerText = totalItems;

  const viewCartBtn = document.getElementById("view-cart-btn");
  if (viewCartBtn) {
    viewCartBtn.innerHTML = `<span id="cart-count">${totalItems}</span> 🛒 View Cart | ₹${total}`;
  }
}

// --- Update cart on backend session ---
async function updateCartSession(id, name, size, price, quantity) {
  if (quantity <= 0) {
    if (cart[id]) delete cart[id][size];
    if (cart[id] && Object.keys(cart[id]).length === 0) delete cart[id];
  } else {
    if (!cart[id]) cart[id] = {};
    cart[id][size] = { name, quantity, price };
  }

  // Calculate totals
  let totalItems = 0, totalPrice = 0;
  for (const pid in cart) {
    for (const sz in cart[pid]) {
      totalItems += cart[pid][sz].quantity;
      totalPrice += cart[pid][sz].price * cart[pid][sz].quantity;
    }
  }

  updateCartFooter(totalPrice, totalItems);

  // Update backend session
  try {
    await fetch("/update-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(cart)
    });
  } catch (err) {
    console.error("Failed to update cart session:", err);
  }

  renderCartPanel();
   updateProductCounts();
   function updateProductCounts() {
  document.querySelectorAll(".pizza-card, .bur-1").forEach(card => {
    const id = card.dataset.pizzaId;
    for (const sizeElem of card.querySelectorAll(".qty")) {
      const size = sizeElem.dataset.size || "Regular";
      const quantity = cart[id]?.[size]?.quantity || 0;
      sizeElem.innerText = quantity;
    }
  });
}
}

// --- Attach listeners for menu + / - ---
document.querySelectorAll(".increase, .decrease").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".pizza-card, .bur-1");
    const id = card.dataset.pizzaId;
    const name = card.querySelector(".pizza-name")?.innerText || card.querySelector("p")?.innerText;
    const size = btn.dataset.size || "Regular";
    const priceElem = card.querySelector(`span[data-size="${size}"]`) || card.querySelector("span[data-price]");
    const price = parseFloat(priceElem.dataset.price || 0);
    const qtyElem = card.querySelector(`.qty[data-size="${size}"]`) || card.querySelector(".qty");

    let quantity = parseInt(qtyElem.innerText) || 0;
    quantity = btn.classList.contains("increase") ? quantity + 1 : Math.max(0, quantity - 1);

    qtyElem.innerText = quantity;
    updateCartSession(id, name, size, price, quantity);
  });
});

// --- Cart panel toggle ---
const viewCartBtn = document.getElementById("view-cart-btn");
const cartPanel = document.getElementById("cart-panel");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalPanel = document.getElementById("cart-total-panel");

viewCartBtn?.addEventListener("click", () => {
  renderCartPanel();
  cartPanel.style.display = "block";
});

closeCartBtn?.addEventListener("click", () => {
  cartPanel.style.display = "none";
});

// --- Render cart panel ---
function renderCartPanel() {
  if (!cartItemsEl || !cartTotalPanel) return;
  cartItemsEl.innerHTML = "";
  let total = 0;
  let totalItems = 0;

  for (const id in cart) {
    for (const size in cart[id]) {
      const item = cart[id][size];
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.name} (${size}) x <span class="cart-qty">${item.quantity}</span> - ₹${item.price * item.quantity}
        <button class="cart-decrease" data-id="${id}" data-size="${size}">-</button>
        <button class="cart-increase" data-id="${id}" data-size="${size}">+</button>
      `;
      cartItemsEl.appendChild(li);
      total += item.price * item.quantity;
      totalItems += item.quantity;
    }
  }

  cartTotalPanel.innerText = total;
  updateCartFooter(total, totalItems);

  document.querySelectorAll(".cart-increase, .cart-decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const size = btn.dataset.size;
      let quantity = cart[id][size].quantity;
      quantity = btn.classList.contains("cart-increase") ? quantity + 1 : Math.max(0, quantity - 1);
      updateCartSession(id, cart[id][size].name, size, cart[id][size].price, quantity);
    });
  });
}
const placeOrderBtn = document.getElementById("place-order");

placeOrderBtn?.addEventListener("click", async () => {
  try {
    const response = await fetch("/save-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        cart: window.cart,
        quantity: Object.values(window.cart).reduce(
          (acc, sizes) => acc + Object.values(sizes).reduce((s, i) => s + i.quantity, 0),
          0
        ),
      }),
    });

    const data = await response.json();
    if (data.success) {
      window.location.href = "/scan"; // navigate to form
    } else {
      alert("❌ Failed to save cart. Try again.");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Network error. Try again.");
  }
});


// --- Submit order ---
// This will now go to /submit-order, which will store cart from session in DB

// --- Initialize footer from session cart on page load ---
document.addEventListener("DOMContentLoaded", () => {
  let totalItems = 0;
  let totalPrice = 0;

  for (const pid in window.cart) {
    for (const size in window.cart[pid]) {
      const item = window.cart[pid][size];
      totalItems += item.quantity;
      totalPrice += item.quantity * item.price;
    }
  }

  updateCartFooter(totalPrice, totalItems);
});


