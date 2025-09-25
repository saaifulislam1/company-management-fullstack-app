import api from "./api";

// This service is for fetching general employee data
// Note: Some of these endpoints will be restricted to Admins on the backend

/**
 * @service getAllEmployees (for Admins)
 * @description Fetches a list of all employees in the company.
 */
export const getAllEmployees = async () => {
  const response = await api.get("/employees");
  console.log("hello", response, "emppp");
  return response.data.data;
};

/**
 * @service updateMyProfile
 * @description Updates the profile for the currently logged-in user.
 */
export const updateMyProfile = async (profileData: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}) => {
  const response = await api.patch("/employees/me", profileData);
  return response.data.data;
};
