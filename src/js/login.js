import { loadHeaderFooter, getParam } from "./utils.mjs";
import { login } from "./auth.mjs";

// Load the header and footer onto the page
loadHeaderFooter();

// Check for a url parameter called redirect
const redirect = getParam('redirect');

// Add an event listener to login form's button
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, looking for login form...');
  const loginForm = document.getElementById('login-form');
  const loginButton = document.getElementById('login-btn');
  
  if (loginForm) {
    console.log('Login form found, adding event listener');
    loginForm.addEventListener('submit', handleLogin);
  } else {
    console.log('Login form NOT found!');
  }
  
  if (loginButton) {
    console.log('Login button found, adding click listener');
    loginButton.addEventListener('click', handleButtonClick);
  } else {
    console.log('Login button NOT found!');
  }
});

async function handleButtonClick(event) {
  console.log('Button clicked, preventing default...');
  event.preventDefault();
  event.stopPropagation();
  
  const form = document.getElementById('login-form');
  if (form) {
    await handleLogin({ target: form, preventDefault: () => {}, stopPropagation: () => {} });
  }
}

async function handleLogin(event) {
  console.log('handleLogin called, preventing default...');
  event.preventDefault();
  event.stopPropagation();
  
  console.log('Login form submitted - page should not refresh');
  
  // Get the username and password out of the form fields
  const form = event.target;
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value.trim();
  
  console.log('Login attempt with email:', email);
  
  // Basic validation
  if (!email || !password) {
    console.log('Missing email or password');
    alert('Please enter both email and password');
    return;
  }
  
  // Create credentials object
  const creds = {
    email: email,
    password: password
  };
  
  try {
    // Pass those to the login function along with the redirect information
    console.log('Calling login function with redirect:', redirect);
    await login(creds, redirect);
    console.log('Login function completed');
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + (error.message || 'Unknown error'));
  }
}