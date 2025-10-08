import api from "./api"; // Import our configured Axios instance

/**
 * @service login
 * @description Makes an API call to the backend's login endpoint.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<any>} The response data from the API.
 */
export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data; // The backend wraps data in a `data` property
};

/**
 * @service getMyProfile
 * @description Fetches the profile of the currently logged-in user.
 * The token is attached automatically by the Axios interceptor.
 * @returns {Promise<any>} The user's profile data.
 */
export const getMyProfile = async () => {
  const response = await api.get("/employees/me");
  return response.data;
};
export const logout = async () => {
  // const response = await api.post("/auth/logout");
  // return response.data;
  await api.post("/auth/logout");
};
