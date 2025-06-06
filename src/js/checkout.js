import { loadHeaderFooter } from "./utils.mjs";
import { getLocalStorage } from "./utils.mjs";
import checkoutProcess from "./checkoutProcess.mjs";

loadHeaderFooter();

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the checkout process
  checkoutProcess.init("so-cart", ".checkout-container");
  displayOrderSummary();
  setupFormHandlers();
});

function displayOrderSummary() {
  const cartItems = getLocalStorage("so-cart") || [];
  const orderItemsContainer = document.getElementById("order-items");
  
  // Clear existing content
  orderItemsContainer.innerHTML = "";
  
  // Display each cart item
  cartItems.forEach(item => {
    const itemElement = document.createElement("div");
    itemElement.className = "order-item";
    itemElement.innerHTML = `
      <div class="order-item-details">
        <h4>${item.Name}</h4>
        <p>Qty: ${item.quantity || 1}</p>
        <p>$${(parseFloat(item.FinalPrice || item.price || 0)).toFixed(2)}</p>
      </div>
    `;
    orderItemsContainer.appendChild(itemElement);
  });
}

function setupFormHandlers() {
  const form = document.getElementById("checkout-form");
  const cardNumberInput = document.getElementById("cardNumber");
  const expirationInput = document.getElementById("expiration");
  const zipInput = document.getElementById("zip");
  
  // Format credit card number input
  cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
  });
  
  // Format expiration date input
  expirationInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
  });
  
  // Calculate totals when zip code is entered
  zipInput.addEventListener('input', (e) => {
    if (e.target.value.length >= 5) {
      checkoutProcess.calculateOrderTotal();
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  // Validate all required fields are filled
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.style.borderColor = 'red';
    } else {
      field.style.borderColor = '';
    }
  });
  
  if (!isValid) {
    alert('Please fill out all required fields.');
    return;
  }
  
  // Prepare order data
  const orderData = prepareOrderData(formData);
  
  // Here you would typically send the order to a server
  console.log('Order data:', orderData);
  
  // For now, just show a success message
  alert('Order placed successfully!');
  
  // Clear cart and redirect
  localStorage.removeItem('so-cart');
  window.location.href = '../';
}

function prepareOrderData(formData) {
  const cartItems = getLocalStorage("so-cart") || [];
  const totals = checkoutProcess.calculateOrderTotal();
  
  return {
    orderDate: new Date().toISOString(),
    fname: formData.get('fname'),
    lname: formData.get('lname'),
    street: formData.get('street'),
    city: formData.get('city'),
    state: formData.get('state'),
    zip: formData.get('zip'),
    cardNumber: formData.get('cardNumber'),
    expiration: formData.get('expiration'),
    code: formData.get('code'),
    items: cartItems,
    orderSubtotal: totals.subtotal,
    orderTax: totals.tax,
    orderTotal: totals.total,
    shipping: totals.shipping
  };
}