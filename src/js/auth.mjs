import { loginRequest } from "./externalServices.mjs";
import { alertMessage, getLocalStorage, setLocalStorage } from "./utils.mjs";
import { jwtDecode } from "jwt-decode";

const tokenKey = "so-token";

export async function login(creds, redirect = "/") {
    console.log('Auth login called with:', creds, 'redirect:', redirect);
    try {
        console.log('Making login request...');
        const response = await loginRequest(creds);
        console.log('Login request successful, response received:', response);
        
        // Extract the actual token from the response
        const token = response.accessToken || response.token || response;
        console.log('Extracted token:', token);
        
        setLocalStorage(tokenKey, token);
        console.log('Token stored, redirecting to:', redirect);
        // because of the default arg provided above...if no redirect is provided send them Home.
        window.location = redirect;
    } catch (err) {
        console.error('Login failed:', err);
        alertMessage(err.message.message);
    }
}

export function isTokenValid(token) {
  // Check to make sure that something was passed into our function
  if (!token) {
    return false;
  }
  
  try {
    // Use the jwtDecode function to decode the token
    const decoded = jwtDecode(token);
    
    // Get the current date using the built in Date()
    const currentTime = new Date().getTime();
    
    // Compare the expiration in the token with the current time
    // Note: current time is in milliseconds, expiration is in seconds
    if (decoded.exp * 1000 < currentTime) {
      // Token is expired
      console.log("Token is expired");
      return false;
    }
    
    // Token is OK
    return true;
  } catch (error) {
    // If token is malformed, consider it invalid
    console.log("Token is malformed");
    return false;
  }
}

export function checkLogin() {
  // Get the token from localStorage
  const token = getLocalStorage(tokenKey);
  
  // Check the token with the isTokenValid function
  if (!isTokenValid(token)) {
    // Remove the token from localStorage
    localStorage.removeItem(tokenKey);
    
    // Get the path of the current location
    const currentPath = window.location.pathname + window.location.search;
    
    // Redirect the user to the login page, sending in the current path as a parameter
    window.location = `/login/?redirect=${encodeURIComponent(currentPath)}`;
  } else {
    // If token is valid: return the token
    return token;
  }
}