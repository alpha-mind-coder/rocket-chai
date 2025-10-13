// --- Initialize cart from localStorage ---
let cart = JSON.parse(localStorage.getItem("cart")) || {};

// --- Update footer ---
function updateCartFooter() {
  let totalItems = 0;
  let totalPrice = 0;

  for (const id in cart) {
    for (const size in cart[id]) {
      const item = cart[id][size];
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
    }
  }

  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.innerText = totalItems;

  const viewCartBtn = document.getElementById("view-cart-btn");
  if (viewCartBtn) {
    viewCartBtn.innerHTML = `<span id="cart-count">${totalItems}</span> 🛒 View Cart | ₹${totalPrice}`;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

// --- Update cart ---
function updateCart(id, name, size, price, quantity) {
  if (!cart[id]) cart[id] = {};
  if (quantity <= 0) {
    delete cart[id][size];
    if (Object.keys(cart[id]).length === 0) delete cart[id];
  } else {
    cart[id][size] = { name, quantity, price };
  }
  updateCartFooter();
  renderCartPanel();
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
    updateCart(id, name, size, price, quantity);
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

// --- Render cart panel with + / - buttons ---
function renderCartPanel() {
  cartItemsEl.innerHTML = "";
  let total = 0;

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
    }
  }

  cartTotalPanel.innerText = total;

  // Attach + / - in cart panel
  document.querySelectorAll(".cart-increase, .cart-decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const size = btn.dataset.size;
      let quantity = cart[id][size].quantity;
      quantity = btn.classList.contains("cart-increase") ? quantity + 1 : Math.max(0, quantity - 1);

      updateCart(id, cart[id][size].name, size, cart[id][size].price, quantity);
      renderCartPanel();
    });
  });
}

// --- Restore cart on page load ---
document.addEventListener("DOMContentLoaded", () => {
  for (const id in cart) {
    const card = document.querySelector(`.pizza-card[data-pizza-id="${id}"], .bur-1[data-pizza-id="${id}"]`);
    if (!card) continue;
    for (const size in cart[id]) {
      const qtyElem = card.querySelector(`.qty[data-size="${size}"]`) || card.querySelector(".qty");
      if (qtyElem) qtyElem.innerText = cart[id][size].quantity;
    }
  }
  updateCartFooter();
});

// --- Handle Order Form Submission ---
document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("order-form");
  orderForm?.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent default form submission

    const formData = new FormData(orderForm);
    formData.append("item", JSON.stringify(cart));
    formData.append("quantity", Object.values(cart).reduce(
      (acc, itemSizes) => acc + Object.values(itemSizes).reduce((s, i) => s + i.quantity, 0),
      0
    ));

    try {
      const response = await fetch("/save-cart", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (response.ok) {
        const html = await response.text();
        // Replace current page with scan page content
        document.open();
        document.write(html);
        document.close();
      } else {
        const text = await response.text();
        alert("❌ Failed to save cart: " + text);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Network error, please try again.");
    }
  });
});

