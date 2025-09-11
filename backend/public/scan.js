const orderData = document.getElementById("order-data");

// Parse the JSON string from data-item attribute
const item = JSON.parse(orderData.dataset.item);
const quantity = parseInt(orderData.dataset.quantity, 10);

document.getElementById("customer-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Append item and quantity to formData with keys matching backend expectation
  formData.append('item', JSON.stringify(item));      // 'item' key for cart data
  formData.append('quantity', quantity);              // 'quantity' key for total items

  try {
    const response = await fetch("/submit-order", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      alert("✅ Order confirmed! Thank you.");
      window.location.href = "/";
    } else {
      alert("❌ Something went wrong. Please try again.");
    }
  } catch (err) {
    alert("❌ Network error, please try again.");
  }
});

const fileInput = document.getElementById("payment-screenshot");
const fileSelectedText = document.getElementById("file-selected-text"); // might be null if no element

fileInput.addEventListener("change", () => {
  if (!fileSelectedText) return; // no label to update

  if (fileInput.files.length > 0) {
    fileSelectedText.textContent = fileInput.files[0].name;
    fileSelectedText.style.display = "inline-flex";
    fileSelectedText.classList.add("file-selected");  // show tick/checkmark if styled in CSS
  } else {
    fileSelectedText.textContent = "Choose";
    fileSelectedText.style.display = "inline-flex";
    fileSelectedText.classList.remove("file-selected"); // hide tick/checkmark
  }
});
