import { loadHeaderFooter } from "./utils.mjs";
import { getLocalStorage } from "./utils.mjs";
import CheckoutProcess from "./checkoutProcess.mjs";

loadHeaderFooter();

const checkout = new CheckoutProcess("so-cart", ".checkout-container");

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
  checkout.init();
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
      checkout.calculateOrderTotal();
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
  
  try {
    // Show loading state
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    // Calculate totals before checkout
    checkout.calculateOrderTotal();
    
    // Process the checkout
    const response = await checkout.checkout(form);
    
    console.log('Checkout successful:', response);
    
    // Show success message
    alert('Order placed successfully!');
    
    // Clear cart and redirect
    localStorage.removeItem('so-cart');
    window.location.href = '../';
    
  } catch (error) {
    console.error('Checkout failed:', error);
    
    // Show specific error message based on response
    let errorMessage = 'There was an error processing your order. Please try again.';
    if (error.message.includes('400')) {
      errorMessage = 'Invalid order information. Please check your details.';
    } else if (error.message.includes('500')) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    alert(errorMessage);
    
    // Re-enable submit button
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}