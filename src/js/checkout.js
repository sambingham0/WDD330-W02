import { loadHeaderFooter, getLocalStorage, alertMessage, removeAllAlerts } from "./utils.mjs";
import checkoutProcess from "./checkoutProcess.mjs";

loadHeaderFooter();

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize checkout process if we're on the checkout page
  if (window.location.pathname.includes('/checkout/') && !window.location.pathname.includes('/success')) {
    checkoutProcess.init("so-cart", ".checkout-container");
    displayOrderSummary();
    setupFormHandlers();
  }
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
    
    // Limit to 16 digits
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    
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
      checkoutProcess.calculateOrdertotal(); // Note: lowercase 't'
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  
  // Clear any existing alerts
  removeAllAlerts();
  
  // Validate form before submission
  if (!validateForm(form)) {
    return; // Stop submission if validation fails
  }
  
  try {
    // Show loading state
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    // Calculate totals before checkout
    checkoutProcess.calculateOrdertotal();
    
    // Process the checkout
    const response = await checkoutProcess.checkout(form);
    
    console.log('Checkout successful:', response);
    
    // Show success message
    alertMessage('Order placed successfully!');
    
    // Clear cart and redirect
    localStorage.removeItem('so-cart');
    window.location.href = '../checkout/success.html';
  } catch (error) {
    console.error('Checkout failed:', error);
    
    // Show specific error message based on response
    let errorMessage = 'There was an error processing your order. Please try again.';
    const errorString = error.message || error.toString() || '';
    
    if (errorString.includes && errorString.includes('400')) {
      errorMessage = 'Invalid order information. Please check your details.';
    } else if (errorString.includes && errorString.includes('500')) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    alertMessage(errorMessage);
    
    // Re-enable submit button
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

function validateForm(form) {
  let isValid = true;
  
  // Get form elements
  const fname = form.querySelector('#fname').value.trim();
  const lname = form.querySelector('#lname').value.trim();
  const street = form.querySelector('#street').value.trim();
  const city = form.querySelector('#city').value.trim();
  const state = form.querySelector('#state').value.trim();
  const zip = form.querySelector('#zip').value.trim();
  const cardNumber = form.querySelector('#cardNumber').value.replace(/\s/g, '');
  const expiration = form.querySelector('#expiration').value.trim();
  const code = form.querySelector('#code').value.trim();
  
  // Validate required fields
  if (!fname) {
    alertMessage('First name is required.');
    isValid = false;
  }
  
  if (!lname) {
    alertMessage('Last name is required.');
    isValid = false;
  }
  
  if (!street) {
    alertMessage('Street address is required.');
    isValid = false;
  }
  
  if (!city) {
    alertMessage('City is required.');
    isValid = false;
  }
  
  if (!state) {
    alertMessage('State is required.');
    isValid = false;
  }
  
  // Validate ZIP code (5 or 9 digits)
  if (!zip || !/^\d{5}(-\d{4})?$/.test(zip)) {
    alertMessage('Please enter a valid ZIP code (12345 or 12345-6789).');
    isValid = false;
  }
  
  // Validate credit card number (16 digits)
  if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
    alertMessage('Please enter a valid 16-digit credit card number.');
    isValid = false;
  }
  
  // Validate expiration date (MM/YY format)
  if (!expiration || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiration)) {
    alertMessage('Please enter expiration date in MM/YY format.');
    isValid = false;
  } else {
    // Check if expiration date is in the future
    const [month, year] = expiration.split('/');
    const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    if (expDate < now) {
      alertMessage('Credit card has expired.');
      isValid = false;
    }
  }
  
  // Validate security code (3 or 4 digits)
  if (!code || !/^\d{3,4}$/.test(code)) {
    alertMessage('Please enter a valid 3 or 4-digit security code.');
    isValid = false;
  }
  
  return isValid;
}