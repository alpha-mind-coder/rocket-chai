window.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form[id$='form']"); // all category forms
  const messageDiv = document.getElementById("order-message");

  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, ...
  const hour = now.getHours();

  // Determine if orders are allowed
  let canOrder = false;
  if (day === 1 || day === 2) {
    // Monday & Tuesday - always open
    canOrder = true;
  } else if (day === 3 && hour === 12) {
    // Wednesday - only at 12 noon
    canOrder = true;
  }

  forms.forEach(form => {
    const btn = form.querySelector("button");
    if (!canOrder) {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
    }
    // form.addEventListener("submit", (e) => {
    //   if (!canOrder) {
    //     e.preventDefault();
    //     if (messageDiv) {
    //       messageDiv.textContent = "⚠️ Orders are accepted Monday & Tuesday all day, and Wednesday at 12 noon only.";
    //       messageDiv.style.display = "block";

    //       setTimeout(() => {
    //         messageDiv.style.display = "none";
    //       }, 4000);
    //     }
    //   }
    // });
  });

  // Show message immediately if orders are closed
  if (!canOrder && messageDiv) {
    messageDiv.innerHTML = "🚨 Notice: Domino’s orders are open Monday to Wednesday (till 12 noon) only. 🥥Coconut Water available daily at 9:30PM OAT   See you then!!! ☺️ &nbsp;  Warm-regards => By Team Rocket Chai.";
    messageDiv.style.display = "block";
  }
});
