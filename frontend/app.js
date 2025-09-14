let cart = {};
let totalPrice = 0;
let itemCount = 0;

const backendURL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://rocket-chai-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const incButtons = document.querySelectorAll(".inc-btn");
  const decButtons = document.querySelectorAll(".dec-btn");

  incButtons.forEach(button => {
    button.addEventListener("click", function () {
      const card = this.closest(".item-card");
      const name = card.querySelector("h3").textContent;
      const price = parseInt(card.getAttribute("data-price"));
      const quantitySpan = card.querySelector(".quantity");

      if (!cart[name]) {
        cart[name] = { quantity: 1, price };
      } else {
        cart[name].quantity += 1;
      }

      itemCount++;
      totalPrice += price;

      quantitySpan.textContent = cart[name].quantity;

      updateCartDisplay();

      // animation
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 800);
    });
  });

  decButtons.forEach(button => {
    button.addEventListener("click", function () {
      const card = this.closest(".item-card");
      const name = card.querySelector("h3").textContent;
      const price = parseInt(card.getAttribute("data-price"));
      const quantitySpan = card.querySelector(".quantity");

      if (cart[name] && cart[name].quantity > 0) {
        cart[name].quantity -= 1;
        itemCount--;
        totalPrice -= price;

        quantitySpan.textContent = cart[name].quantity;

        if (cart[name].quantity === 0) {
          delete cart[name];
        }

        updateCartDisplay();

        this.classList.add("clicked");
        setTimeout(() => this.classList.remove("clicked"), 800);
      }
    });
  });

  const scanBtn = document.getElementById("scan-btn");
  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      fetch(`${backendURL}/save-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 

       body: JSON.stringify({
        item: cart,          // ✅ must be 'item'
        quantity: itemCount  // ✅ must be 'quantity'
      })
    })
     .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text(); // or text(), depending on your backend response
  })
  .then(data => {
    console.log("✅ /save-cart success:", data);
    window.location.href = `${backendURL}/scan`;
  })
    .catch(err => {
      console.error("Error saving cart:", err);
      alert("Failed to proceed. Please try again.");
    });
    });
  }
});

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
