let cart = {};
let totalPrice = 0;
let itemCount = 0;

const backendURL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://rocket-chai-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  // Handle Add to Cart buttons
  const buttons = document.querySelectorAll(".item-btn");

  buttons.forEach(button => {
    button.addEventListener("click", function () {
      const card = this.closest(".item-card");
      const name = card.querySelector("h3").textContent;
      const price = parseInt(card.getAttribute("data-price"));

      // Cart logic
      if (!cart[name]) {
        cart[name] = { quantity: 1, price };
      } else {
        cart[name].quantity += 1;
      }

      itemCount++;
      totalPrice += price;
      updateCartDisplay();

      // animation
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 800);
    });
  });

  // Handle Scan to Pay button
  const scanBtn = document.getElementById("scan-btn");
  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      fetch(`${backendURL}/save-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, total: totalPrice })
      }).then(() => {
        window.location.href = `${backendURL}/scan`;
      });
    });
  }
});

// Update cart summary display
function updateCartDisplay() {
  const itemCountEl = document.getElementById("item-count");
  const totalPriceEl = document.getElementById("total-price");
  const cartListEl = document.getElementById("cart-list");

  if (itemCountEl) itemCountEl.textContent = itemCount;
  if (totalPriceEl) totalPriceEl.textContent = totalPrice;

  if (cartListEl) {
    cartListEl.innerHTML = "";
    for (let item in cart) {
      const li = document.createElement("li");
      li.textContent = `${item} × ${cart[item].quantity} = ₹${cart[item].quantity * cart[item].price}`;
      cartListEl.appendChild(li);
    }
  }
}