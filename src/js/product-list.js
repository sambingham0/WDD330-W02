import productList from './productList.mjs';
import { loadHeaderFooter, getParam } from "./utils.mjs";

loadHeaderFooter();

const category = getParam('category') || 'tents'; // default to tents if not specified
productList(".product-list", category);


if (category) {
  const heading = document.getElementById('product-heading');
  if (heading) {
    // Capitalize first letter
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
    heading.textContent = `${categoryName}: `;
  }
}