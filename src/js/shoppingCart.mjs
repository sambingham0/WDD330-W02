import { getLocalStorage } from "./utils.mjs";
import { renderWithTemplate } from "./utils.mjs";

function cartItemTemplate(item) {
  const imageUrl = item.Images?.PrimaryMedium || item.Images?.Primary || item.Image || '';

  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${imageUrl}" alt="${item.Name}" />
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors && item.Colors[0] ? item.Colors[0].ColorName : ""}</p>
    <p class="cart-card__quantity">qty: ${item.quantity || 1}</p>
    <p class="cart-card__price">$${item.FinalPrice || item.price}</p>
  </li>`;
}

function calculateTotal(cartItems) {
  return cartItems.reduce((total, item) => {
    const price = parseFloat(item.FinalPrice || item.price || 0);
    const quantity = parseInt(item.quantity || 1);
    return total + (price * quantity);
  }, 0);
}

export default function shoppingCartList(selector) {
  const el = document.querySelector(selector);
  el.innerHTML = "";
  const cartItems = getLocalStorage("so-cart") || [];
  
  cartItems.forEach(item => {
    renderWithTemplate(cartItemTemplate, el, item);
  });
  
  // Calculate and display total
  const total = calculateTotal(cartItems);
  const totalElement = document.getElementById("cart-total");
  if (totalElement) {
    totalElement.textContent = `$${total.toFixed(2)}`;
  }
}