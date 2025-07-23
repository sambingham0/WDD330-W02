import { loadHeaderFooter, alertMessage } from "./utils.mjs";
import { checkLogin } from "./auth.mjs";
import { getCurrentOrders } from "./currentOrders.mjs";

// Load header and footer
loadHeaderFooter();

// Check authentication and load orders when page loads
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check if user is authenticated and get orders
    const orders = await getCurrentOrders();
    
    if (orders !== null) {
      // User is authenticated, display orders
      displayOrders(orders);
    }
    // If orders is null, getCurrentOrders will have handled the redirect
    
  } catch (error) {
    console.error('Error loading orders:', error);
    displayError('Unable to load orders. Please try again later.');
  }
});

function displayLoading() {
  const main = document.querySelector('main');
  main.innerHTML = `
    <section class="products">
      <h2>Your Orders</h2>
      <p>Loading orders...</p>
    </section>
  `;
}

function displayError(message) {
  const main = document.querySelector('main');
  main.innerHTML = `
    <section class="products">
      <h2>Your Orders</h2>
      <div class="error-message">
        <p>${message}</p>
        <button onclick="window.location.reload()">Try Again</button>
      </div>
    </section>
  `;
  alertMessage(message);
}

function displayOrders(orders) {
  const main = document.querySelector('main');
  
  if (!orders || orders.length === 0) {
    main.innerHTML = `
      <section class="products">
        <h2>Your Orders</h2>
        <div class="no-orders">
          <p>No orders found.</p>
          <p><a href="/product-list/" class="button">Start Shopping</a></p>
        </div>
      </section>
    `;
    return;
  }
  
  // Helper function to safely format currency
  function formatCurrency(value) {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  }
  
  // Sort orders by date (newest first)
  const sortedOrders = orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  
  const ordersHtml = sortedOrders.map(order => {
    // Debug: log the order structure to see what we're working with
    console.log('Order data:', order);
    if (order.items && order.items.length > 0) {
      console.log('First item:', order.items[0]);
    }
    
    const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const itemCount = order.items ? order.items.length : 0;
    const totalItems = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    
    return `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3>Order #${order.id}</h3>
            <p class="order-date">${orderDate}</p>
          </div>
          <div class="order-status">
            <span class="status-badge ${getStatusClass(order.status)}">${order.status || 'Processing'}</span>
          </div>
        </div>
        
        <div class="order-summary">
          <div class="summary-item">
            <span class="label">Items:</span>
            <span class="value">${totalItems} item${totalItems !== 1 ? 's' : ''} (${itemCount} product${itemCount !== 1 ? 's' : ''})</span>
          </div>
          <div class="summary-item">
            <span class="label">Total:</span>
            <span class="value total-amount">$${formatCurrency(order.orderTotal)}</span>
          </div>
        </div>
        
        <div class="shipping-info">
          <h4>Ship to:</h4>
          <p>${order.fname} ${order.lname}</p>
          <p>${order.street}</p>
          <p>${order.city}, ${order.state} ${order.zip}</p>
        </div>
        
        <div class="order-items">
          <h4>Items:</h4>
          ${order.items ? order.items.map(item => {
            // Try different possible field names
            const name = item.Name || item.name || item.title || item.product || 'Unknown Item';
            const price = item.FinalPrice || item.finalPrice || item.price || item.cost || 0;
            const qty = item.quantity || item.qty || 1;
            
            return `
            <div class="item-row">
              <span class="item-name">${name}</span>
              <span class="item-details">
                Qty: ${qty} × $${formatCurrency(price)} = 
                <strong>$${formatCurrency(price * qty)}</strong>
              </span>
            </div>
            `;
          }).join('') : '<p>No items found</p>'}
        </div>
        
        <div class="order-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${formatCurrency((order.orderTotal || 0) - (order.tax || 0) - (order.shipping || 10))}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>$${formatCurrency(order.shipping || 10)}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>$${formatCurrency(order.tax)}</span>
          </div>
          <div class="total-row final-total">
            <span>Total:</span>
            <span>$${formatCurrency(order.orderTotal)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  main.innerHTML = `
    <section class="products">
      <h2>Your Orders</h2>
      <div class="orders-container">
        ${ordersHtml}
      </div>
    </section>
  `;
}

function getStatusClass(status) {
  switch(status?.toLowerCase()) {
    case 'pending':
      return 'status-pending';
    case 'processing':
      return 'status-processing';
    case 'shipped':
      return 'status-shipped';
    case 'delivered':
      return 'status-delivered';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return 'status-processing';
  }
}