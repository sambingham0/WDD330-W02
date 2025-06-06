import { setLocalStorage, getLocalStorage } from "./utils.mjs";
import { findProductById } from "./externalServices.mjs";

let product = {}; // Changed from productId to product

export async function productDetails(productId) {
    // fetch product data
    product = await findProductById(productId);
    renderProductDetails();
    // Only add event listener once, after the product is loaded
    document.getElementById("addToCart").addEventListener("click", addToCart);
}

function addToCart() {
    // Get existing cart items or initialize empty array
    let cartItems = getLocalStorage("so-cart") || [];
    
    // Ensure cartItems is always an array
    if (!Array.isArray(cartItems)) {
        cartItems = [];
    }

    // Check if item already exists in cart
    let existingItem = cartItems.find(item => item.Id === product.Id);
    
    if (existingItem) {
        // If item exists, increment quantity
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        // If new item, add it with quantity 1
        product.quantity = 1;
        cartItems.push(product);
    }
    
    // Save updated cart back to localStorage
    setLocalStorage("so-cart", cartItems);
    
    alert("Item added to cart!");
}

function renderProductDetails() {
    if (!product || !product.Brand) {
        console.error("Product data is incomplete:", product);
        return;
    }

    try {
        document.querySelector("#productName").innerText = product.Brand.Name;
        document.querySelector("#productNameWithoutBrand").innerText = product.NameWithoutBrand;
        document.querySelector("#productImage").src = product.Images.PrimaryLarge;
        document.querySelector("#productImage").alt = product.Name;
        document.querySelector("#productFinalPrice").innerText = `$${product.FinalPrice}`;
        document.querySelector("#productColorName").innerText = product.Colors[0].ColorName;
        document.querySelector("#productDescriptionHtmlSimple").innerHTML = product.DescriptionHtmlSimple;
        document.querySelector("#addToCart").dataset.id = product.Id;
    } catch (error) {
        console.error("Error rendering product details:", error);
    }
}