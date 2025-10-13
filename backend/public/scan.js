// --- Get order data from page or LocalStorage ---
const orderData = document.getElementById("order-data");
let cart = {};
let total = 0;
let totalQuantity = 0;

// Parse cart and total from orderData or fallback to localStorage
if (orderData && orderData.dataset.item) {
  try {
    cart = JSON.parse(orderData.dataset.item);
    total = parseFloat(orderData.dataset.total) || 0;
    totalQuantity = parseInt(orderData.dataset.quantity) || 0;
  } catch (err) {
    console.error("Failed to parse cart data:", err);
  }
} else {
  cart = JSON.parse(localStorage.getItem("cart")) || {};
  total = Object.values(cart).reduce((acc, sizes) => {
    return acc + Object.values(sizes).reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, 0);
  totalQuantity = Object.values(cart).reduce((acc, sizes) => {
    return acc + Object.values(sizes).reduce((sum, i) => sum + i.quantity, 0);
  }, 0);
}

// --- Update hidden inputs in the form ---
const cartDataInput = document.getElementById("cart-data");
const cartQtyInput = document.getElementById("cart-qty");

if (cartDataInput) cartDataInput.value = JSON.stringify(cart);
if (cartQtyInput) cartQtyInput.value = totalQuantity;

// --- Update total dynamically on the page ---
const totalElem = document.querySelector(".img-wrapper h3");
if (totalElem) {
  totalElem.innerText = `Your Total is : ₹ ${total}`;
}

// --- Handle form submission ---
const customerForm = document.getElementById("customer-form");
const submitButton = customerForm.querySelector('button[type="submit"]');
let isSubmitting = false;
customerForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // prevent default form submission

  if (isSubmitting) return; // ignore further clicks
  isSubmitting = true;

 submitButton.disabled = true;
  submitButton.innerText = "Processing...";
  if (total <= 0) {
    alert("❌ Cart is empty! Please add items before placing an order.");
     submitButton.disabled = false;
    submitButton.innerText = "Click to place order after payment";
    isSubmitting = false;
    return;
  }

  const formData = new FormData(customerForm);
  formData.append("item", JSON.stringify(cart));
  formData.append("quantity", totalQuantity);

  try {
    const response = await fetch("/submit-order", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("✅ Order confirmed! Thank you.");
      localStorage.removeItem("cart"); // clear cart
      window.location.href = "/"; // redirect after successful order
    } else {
      const text = await response.text();
      alert("❌ Something went wrong: " + text);
      submitButton.disabled = false;
      submitButton.innerText = "Click to place order after payment";
       isSubmitting = false;
    }
  } catch (err) {
    console.error(err);
    alert("❌ Network error, please try again.");
     submitButton.disabled = false;
    submitButton.innerText = "Click to place order after payment";
    isSubmitting = false;

  }
});

// --- File input label update (optional) ---
const fileInput = document.getElementById("payment-screenshot");
const fileSelectedText = document.getElementById("file-selected-text"); // optional element

if (fileInput) {
  fileInput.addEventListener("change", () => {
    if (!fileSelectedText) return;

    if (fileInput.files.length > 0) {
      fileSelectedText.textContent = fileInput.files[0].name;
      fileSelectedText.style.display = "inline-flex";
      fileSelectedText.classList.add("file-selected");
    } else {
      fileSelectedText.textContent = "Choose";
      fileSelectedText.style.display = "inline-flex";
      fileSelectedText.classList.remove("file-selected");
    }
  });
}
