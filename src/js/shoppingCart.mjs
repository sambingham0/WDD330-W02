import { getLocalStorage } from "./utils.mjs";
import { renderWithTemplate } from "./utils.mjs";

function cartItemTemplate(item) {
  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${item.Image}" alt="${item.Name}" />
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors && item.Colors[0] ? item.Colors[0].ColorName : ""}</p>
    <p class="cart-card__quantity">qty: ${item.quantity || 1}</p>
    <p class="cart-card__price">$${item.FinalPrice || item.price}</p>
  </li>`;
}

export default function shoppingCartList(selector) {
  const el = document.querySelector(selector);
  el.innerHTML = "";
  const cartItems = getLocalStorage("so-cart") || [];
  cartItems.forEach(item => {
    renderWithTemplate(cartItemTemplate, el, item);
  });
}