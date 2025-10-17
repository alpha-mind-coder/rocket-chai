// // // ====================== FRONTEND JS ======================
// // alert("scan.js loaded");
// // // --- Get elements and initialize variables ---
// // const orderData = document.getElementById("order-data");
// // const cartDataInput = document.getElementById("cart-data");
// // const cartQtyInput = document.getElementById("cart-qty");
// // const totalElem = document.querySelector(".img-wrapper h3");
// // const customerForm = document.getElementById("customer-form");
// // const submitButton = customerForm.querySelector('button[type="submit"]');
// // const fileInput = document.getElementById("payment-screenshot");
// // const fileSelectedText = document.getElementById("file-selected-text");
// // const BASE_URL =
// //   window.location.hostname === "localhost"
// //     ? "http://localhost:3000"
// //     : "https://rocket-chai-backend.onrender.com";

// const { response } = require("express");


// // let cart = {};
// // let total = 0;
// // let totalQuantity = 0;
// // let isSubmitting = false;
// // console.log("🚀 Page loaded, checking localStorage cart:", localStorage.getItem("cart"));


// // // ================== SESSION CHECK ==================
// // // Check backend session to clear stale localStorage
// // fetch("/session-check")
// //   .then(res => res.json())
// //   .then(data => {
// //     if (!data.item) {
// //       localStorage.removeItem("cart");
// //       console.log("🧹 Cart cleared because backend session is empty");
// //     }

// //     // ================== PARSE CART ==================
// //     if (orderData && orderData.dataset.item) {
// //       try {
// //         cart = JSON.parse(orderData.dataset.item);
// //         total = parseFloat(orderData.dataset.total) || 0;
// //         totalQuantity = parseInt(orderData.dataset.quantity) || 0;
// //       } catch (err) {
// //         console.error("Failed to parse cart data:", err);
// //       }
// //     } else {
// //       cart = JSON.parse(localStorage.getItem("cart")) || {};
// //       total = Object.values(cart).reduce((acc, sizes) => {
// //         return acc + Object.values(sizes).reduce((sum, i) => sum + i.price * i.quantity, 0);
// //       }, 0);
// //       totalQuantity = Object.values(cart).reduce((acc, sizes) => {
// //         return acc + Object.values(sizes).reduce((sum, i) => sum + i.quantity, 0);
// //       }, 0);
// //     }

// //     // ================== UPDATE HIDDEN INPUTS ==================
// //     if (cartDataInput) cartDataInput.value = JSON.stringify(cart);
// //     if (cartQtyInput) cartQtyInput.value = totalQuantity;

// //     // ================== UPDATE TOTAL ON PAGE ==================
// //     if (totalElem) totalElem.innerText = `Your Total is : ₹ ${total}`;

// //     // ================== CLEAR CART AFTER ORDER SUCCESS ==================
// //     if (localStorage.getItem("orderSuccess") === "true") {
// //       localStorage.removeItem("cart");
// //       localStorage.removeItem("orderSuccess");
// //       console.log("🧹 Cart cleared after order success");
// //     }
// //   })
// //   .catch(err => console.error("Error checking session:", err));

// // // ================== HANDLE FORM SUBMISSION ==================
// // customerForm.addEventListener("submit", async (e) => {
// //   e.preventDefault();
// //   if (isSubmitting) return;
// //   isSubmitting = true;

// //   submitButton.disabled = true;
// //   submitButton.innerText = "Processing...";

// //   if (total <= 0) {
// //     alert("❌ Cart is empty! Please add items before placing an order.");
// //     submitButton.disabled = false;
// //     submitButton.innerText = "Click to place order after payment";
// //     isSubmitting = false;
// //     return;
// //   }

// //   const formData = new FormData(customerForm);
// //   formData.append("item", JSON.stringify(cart));
// //   formData.append("quantity", totalQuantity);

// //   try {
// //     const response = await fetch(`${BASE_URL}/submit-order`, {
// //       method: "POST",
// //       body: formData
// //     });
// // console.log("🔁 Response received:", response.status);
// //     if (response.ok) {
// //         console.log("✅ Backend confirmed order success");
// //       alert("✅ Order confirmed! Thank you.");

// //       localStorage.removeItem("cart"); // clear cart
// //         console.log("🧹 Cart removed from localStorage");

// //       localStorage.setItem("orderSuccess", "true"); // mark success
// //         console.log("✅ orderSuccess flag set");
// //       window.location.href = "/"; // redirect
// //     } else {
// //       const text = await response.text();
// //       alert("❌ Something went wrong: " + text);
// //       submitButton.disabled = false;
// //       submitButton.innerText = "Click to place order after payment";
// //       isSubmitting = false;
// //     }
// //   } catch (err) {
// //     console.error(err);
// //     alert("❌ Network error, please try again.");
// //     submitButton.disabled = false;
// //     submitButton.innerText = "Click to place order after payment";
// //     isSubmitting = false;
// //   }
// // });

// // // ================== FILE INPUT LABEL UPDATE ==================
// // if (fileInput) {
// //   fileInput.addEventListener("change", () => {
// //     if (!fileSelectedText) return;
// //     if (fileInput.files.length > 0) {
// //       fileSelectedText.textContent = fileInput.files[0].name;
// //       fileSelectedText.style.display = "inline-flex";
// //       fileSelectedText.classList.add("file-selected");
// //     } else {
// //       fileSelectedText.textContent = "Choose";
// //       fileSelectedText.style.display = "inline-flex";
// //       fileSelectedText.classList.remove("file-selected");
// //     }
// //   });
// // }






// // ====================== FRONTEND JS ======================
// // ====================== scan.js ======================

// // ✅ Clear cart if orderSuccess flag is set
// if (localStorage.getItem("orderSuccess") === "true") {
//   localStorage.removeItem("cart");
//   localStorage.removeItem("orderSuccess");
//   console.log("🧹 Cart cleared after order success");
// }

// // ✅ Clear cart if backend session is empty
// fetch("/session-check")
//   .then(res => res.json())
//   .then(data => {
//     if (!data.item) {
//       localStorage.removeItem("cart");
//       console.log("🧹 Cart cleared because backend session is empty");
//     }
//   })
//   .catch(err => console.error("Error checking session:", err));

// // ================== Handle form submission ==================
// const customerForm = document.getElementById("customer-form");
// if (customerForm) {
//   customerForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const submitButton = customerForm.querySelector('button[type="submit"]');
//     submitButton.disabled = true;
//     submitButton.innerText = "Processing...";

//     const formData = new FormData(customerForm);

//     try {
//       const response = await fetch(customerForm.action, {
//         method: "POST",
//         body: formData
//       });

//       if (response.ok) {
//         console.log("✅ Backend confirmed order success");
//         alert("✅ Order confirmed! Thank you.");

//         // Clear cart after successful order
//         localStorage.removeItem("cart");
//         localStorage.setItem("orderSuccess", "true");

//         window.location.href = "/";
//       } else {
//         const text = await response.text();
//         alert("❌ Something went wrong: " + text);
//         submitButton.disabled = false;
//         submitButton.innerText = "Click to place order after payment";
//       }
//     } catch (err) {
//       console.error(err);
//       alert("❌ Network error, please try again.");
//       submitButton.disabled = false;
//       submitButton.innerText = "Click to place order after payment";
//     }
//   });
// }
