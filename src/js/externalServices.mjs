
// Use Netlify proxy in production, otherwise use the original URL
const isProd = window.location.hostname.endsWith('netlify.app');
const baseURL = isProd ? '/api/' : (import.meta.env.VITE_SERVER_URL || 'http://server-nodejs.cit.byui.edu:3000/');
const checkoutURL = isProd ? '/api/checkout' : (import.meta.env.VITE_CHECKOUT_URL || 'http://server-nodejs.cit.byui.edu:3000/checkout');

async function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    console.log('=== ERROR RESPONSE DEBUG ===');
    console.log('Status:', res.status);
    console.log('Status Text:', res.statusText);
    console.log('Headers:', [...res.headers.entries()]);
    
    // Try to get response text first
    const responseText = await res.text();
    console.log('Raw Response Text:', responseText);
    
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
      console.log('Parsed JSON Response:', jsonResponse);
    } catch (e) {
      console.log('Response is not valid JSON');
      jsonResponse = { message: responseText || 'Unknown error' };
    }
    
    console.log('=== END ERROR DEBUG ===');
    throw { name: 'servicesError', message: jsonResponse };
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
  console.log('=== CHECKOUT DEBUG ===');
  console.log('Card Number Value:', payload.cardNumber);
  console.log('Card Number Type:', typeof payload.cardNumber);
  
  if (typeof payload.cardNumber === 'string') {
    console.log('Card Number Length:', payload.cardNumber.length);
    console.log('Card Number Characters:', payload.cardNumber.split('').map(c => c.charCodeAt(0)));
  } else if (typeof payload.cardNumber === 'number') {
    console.log('Card Number as String:', payload.cardNumber.toString());
    console.log('Card Number Length:', payload.cardNumber.toString().length);
    console.log('Is Safe Integer:', Number.isSafeInteger(payload.cardNumber));
  }
  
  console.log('Full Payload:', JSON.stringify(payload, null, 2));
  console.log('=== END DEBUG ===');

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };

  const response = await fetch(checkoutURL, options);
  const data = await convertToJson(response);
  return data;
}

export async function loginRequest(creds) {
  console.log('LoginRequest called with:', creds);
  console.log('Making request to:', baseURL + 'login');
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(creds)
  };

  const response = await fetch(baseURL + 'login', options);
  console.log('Login response status:', response.status);
  const data = await convertToJson(response);
  console.log('Login response data:', data);
  return data;
}

export async function getOrders(token) {
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const response = await fetch(baseURL + 'orders', options);
  const data = await convertToJson(response);
  return data;
}