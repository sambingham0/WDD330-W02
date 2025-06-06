const baseURL = import.meta.env.VITE_SERVER_URL || 'http://server-nodejs.cit.byui.edu:3000/';
const checkoutURL = import.meta.env.VITE_CHECKOUT_URL || 'http://server-nodejs.cit.byui.edu:3000/checkout';

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    // Log the response text for debugging
    res.text().then(text => {
      console.error('Server response:', text);
    });
    throw new Error(`Bad Response: ${res.status} ${res.statusText}`);
  }
}

export async function getProductsByCategory(category) {
  const response = await fetch(baseURL + `products/search/${category}`);
  const data = await convertToJson(response);
  return data.Result;
}

export async function findProductById(id) {
  const response = await fetch(baseURL + `product/${id}`);
  const data = await convertToJson(response);
  return data.Result;
}

export async function checkout(payload) {

  // Clean up the data before sending
  const cleanedPayload = {
    ...payload,
    cardNumber: payload.cardNumber.replace(/\s/g, ''), // Remove spaces from card number
  };

  console.log('Checkout payload:', JSON.stringify(cleanedPayload, null, 2));

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cleanedPayload)
  };

  const response = await fetch(checkoutURL, options);
  const data = await convertToJson(response);
  return data;
}