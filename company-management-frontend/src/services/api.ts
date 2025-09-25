import axios from "axios";

// Create a new Axios instance with a custom configuration
const api = axios.create({
  // Set the base URL for all API requests.
  // We use the environment variable defined in `.env.local`.
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Axios Request Interceptor ---
// This function will run before every single request is sent.
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from localStorage.
    const token = localStorage.getItem("authToken");

    // 2. If the token exists, add it to the Authorization header.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Return the modified config for the request to proceed.
    return config;
  },
  (error) => {
    // If there's an error during the request setup, reject the promise.
    return Promise.reject(error);
  }
);

// --- (Optional but good practice) Axios Response Interceptor ---
// This function runs after every response is received.
api.interceptors.response.use(
  (response) => {
    // If the response is successful (status 2xx), just return it.
    return response;
  },
  (error) => {
    // If the API returns a 401 Unauthorized error (e.g., token expired),
    // it's a good place to automatically log the user out.
    if (error.response?.status === 401) {
      // Note: We avoid calling the logout function directly to prevent circular dependencies.
      // Instead, we can dispatch a custom event or redirect. For now, we'll just
      // remove the token and reload the page to force a re-authentication.
      console.error("Unauthorized access - logging out.");
      localStorage.removeItem("authToken");
      // Redirecting to login page
      window.location.href = "/login";
    }
    // For all other errors, just reject the promise.
    return Promise.reject(error);
  }
);

export default api;
