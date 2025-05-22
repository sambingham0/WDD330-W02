import { getData } from "./productData.mjs";
import { renderWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  return `<li class="product-card">
    <a href="product_pages/index.html?product=${product.Id}">
    <img
      src="${product.Image}"
      alt="Image of ${product.Name}"
    />
    <h3 class="card__brand">${product.Brand.Name}</h3>
    <h2 class="card__name">${product.NameWithoutBrand}</h2>
    <p class="product-card__price">$${product.FinalPrice}</p></a>
  </li>`;
}

export default async function productList(selector, category) {
  // get the element we will insert the list into from the selector
  const el = document.querySelector(selector);
  // get the list of products
  let products = await getData(category);

  // Log all products to verify data
  console.log("All products:", products);

  //only show the 4 tents we need
  const allowedIds = ["880RR", "985RF", "344YJ", "985PR"];
  products = products.filter(product => allowedIds.includes(product.Id));


  // Log products missing Brand or Brand.Name
  products.forEach(product => {
    if (!product.Brand || !product.Brand.Name) {
      console.log("Missing Brand or Brand.Name:", product);
    }
  });

  // render out the product list to the element
  products.forEach(product => {
    renderWithTemplate(productCardTemplate, el, product);
  });
}

