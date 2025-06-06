import { getLocalStorage } from "./utils.mjs";

const checkoutProcess = {
    key: "",
    outputSelector: "",
    list: [],
    itemTotal: 0,
    shipping: 0,
    tax: 0,
    orderTotal: 0,
    
    init: function (key, outputSelector) {
        this.key = key;
        this.outputSelector = outputSelector;
        this.list = getLocalStorage(key) || [];
        this.calculateItemSummary();
    },
    
    calculateItemSummary: function() {
        // Calculate and display the total amount of the items in the cart, and the number of items
        const itemCount = this.list.reduce((count, item) => {
            return count + (parseInt(item.quantity) || 1);
        }, 0);
        
        this.itemTotal = this.list.reduce((total, item) => {
            const price = parseFloat(item.FinalPrice || item.price || 0);
            const quantity = parseInt(item.quantity || 1);
            return total + (price * quantity);
        }, 0);
        
        // Display the subtotal
        const subtotalElement = document.getElementById("order-subtotal");
        if (subtotalElement) {
            subtotalElement.textContent = `$${this.itemTotal.toFixed(2)}`;
        }
        
        return { itemCount, itemTotal: this.itemTotal };
    },
    
    calculateOrderTotal: function() {
        // Calculate shipping: $10 for first item + $2 for each additional item
        const itemCount = this.list.reduce((count, item) => {
            return count + (parseInt(item.quantity) || 1);
        }, 0);
        
        if (itemCount > 0) {
            this.shipping = 10 + ((itemCount - 1) * 2);
        } else {
            this.shipping = 0;
        }
        
        // Calculate tax: 6% of subtotal
        this.tax = this.itemTotal * 0.06;
        
        // Calculate order total
        this.orderTotal = this.itemTotal + this.shipping + this.tax;
        
        // Display the totals
        this.displayOrderTotals();
        
        return {
            subtotal: this.itemTotal,
            shipping: this.shipping,
            tax: this.tax,
            total: this.orderTotal
        };
    },
    
    displayOrderTotals: function() {
        // Display all calculated totals in the order summary
        const subtotalElement = document.getElementById("order-subtotal");
        const shippingElement = document.getElementById("order-shipping");
        const taxElement = document.getElementById("order-tax");
        const totalElement = document.getElementById("order-total");
        
        if (subtotalElement) {
            subtotalElement.textContent = `$${this.itemTotal.toFixed(2)}`;
        }
        if (shippingElement) {
            shippingElement.textContent = `$${this.shipping.toFixed(2)}`;
        }
        if (taxElement) {
            taxElement.textContent = `$${this.tax.toFixed(2)}`;
        }
        if (totalElement) {
            totalElement.textContent = `$${this.orderTotal.toFixed(2)}`;
        }
    }
};

export default checkoutProcess;