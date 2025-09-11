let cart = {};
let totalPrice = 0;
let itemCount = 0;

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
      fetch("/save-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: cart,          // ✅ Rename cart to item
          quantity: itemCount  // ✅ Rename total to quantity
        })
      }).then(() => {
        window.location.href = "/scan";
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
