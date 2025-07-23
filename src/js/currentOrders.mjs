// currentOrders.mjs - Module for handling current orders
import { checkLogin } from "./auth.mjs";
import { getOrders } from "./externalServices.mjs";

// Function to get current orders with authentication
export async function getCurrentOrders() {
  // Check if user is authenticated
  const token = checkLogin();
  
  if (token) {
    try {
      // Show loading message
      displayLoading();
      
      // Get orders from the server
      const orders = await getOrders(token);
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  } else {
    // checkLogin will handle the redirect if not authenticated
    return null;
  }
}

function displayLoading() {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `
      <section class="products">
        <h2>Your Orders</h2>
        <p>Loading orders...</p>
      </section>
    `;
  }
}
