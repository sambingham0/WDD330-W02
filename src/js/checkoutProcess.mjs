import { getLocalStorage, setLocalStorage } from './utils.mjs';
import { checkout } from './externalServices.mjs';

// takes the items currently stored in the cart (localstorage) and returns them in a simplified form.
function packageItems(items) {
  // convert the list of products from localStorage to the simpler form required for the checkout process
  return items.map(item => ({
    id: item.Id,
    name: item.Name,
    price: parseFloat(item.FinalPrice || item.price || 0),
    quantity: parseInt(item.quantity || 1)
  }));
}

// takes a form element and returns an object where the key is the "name" of the form input.
function formDataToJSON(formElement) {
  const formData = new FormData(formElement),
    convertedJSON = {};

  formData.forEach(function (value, key) {
    convertedJSON[key] = value;
  });

  return convertedJSON;
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSummary();
  }

  calculateItemSummary() {
    const summaryElement = document.querySelector(this.outputSelector + " #order-summary");
    const itemNumElement = document.querySelector(this.outputSelector + " #num-items");
    
    // calculate the total of all the items in the cart
    this.itemTotal = this.list.reduce((total, item) => {
      const price = parseFloat(item.FinalPrice || item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + (price * quantity);
    }, 0);

    if (itemNumElement) {
      itemNumElement.innerText = this.list.length;
    }
  }

  calculateOrderTotal() {
    // calculate shipping and tax
    this.shipping = 10 + (this.list.length - 1) * 2;
    this.tax = (this.itemTotal * 0.06);
    this.orderTotal = this.itemTotal + this.shipping + this.tax;

    // display the totals
    this.displayOrderTotals();

    return {
      subtotal: this.itemTotal,
      shipping: this.shipping,
      tax: this.tax,
      total: this.orderTotal
    };
  }

  displayOrderTotals() {
    const summaryElement = document.querySelector(this.outputSelector + " .order-summary");
    
    if (summaryElement) {
      const totalsHtml = `
        <div class="order-totals">
          <p>Subtotal: <span>$${this.itemTotal.toFixed(2)}</span></p>
          <p>Shipping: <span>$${this.shipping.toFixed(2)}</span></p>
          <p>Tax: <span>$${this.tax.toFixed(2)}</span></p>
          <p class="order-total">Total: <span>$${this.orderTotal.toFixed(2)}</span></p>
        </div>
      `;
      
      // Find existing totals or append new ones
      const existingTotals = summaryElement.querySelector('.order-totals');
      if (existingTotals) {
        existingTotals.outerHTML = totalsHtml;
      } else {
        summaryElement.insertAdjacentHTML('beforeend', totalsHtml);
      }
    }
  }

  async checkout(form) {
    // build the data object from the calculated fields, the items in the cart, and the information entered into the form
    const formData = formDataToJSON(form);
    const packagedItems = packageItems(this.list);
    
    const orderData = {
      orderDate: new Date().toISOString(),
      fname: formData.fname,
      lname: formData.lname,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      cardNumber: formData.cardNumber,
      expiration: formData.expiration,
      code: formData.code,
      items: packagedItems,
      orderTotal: this.orderTotal.toFixed(2),
      shipping: this.shipping,
      tax: this.tax.toFixed(2)
    };

    // call the checkout method in our externalServices module and send it our data object
    try {
      const response = await checkout(orderData);
      return response;
    } catch (error) {
      throw new Error(`Checkout failed: ${error.message}`);
    }
  }
}