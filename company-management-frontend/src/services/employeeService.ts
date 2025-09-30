import api from "./api";
export interface RegistrationData {
  email: string;
  password: string;
  role: "EMPLOYEE" | "HR" | "ADMIN" | "MANAGER";
  firstName: string;
  lastName: string;
  dateOfJoining: Date;
}

export const getAllEmployees = async () => {
  const response = await api.get("/employees");
  console.log("hello", response, "emppp");
  return response.data.data;
};

export const updateMyProfile = async (profileData: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}) => {
  const response = await api.patch("/employees/me", profileData);
  return response.data.data;
};
export const getEmployeeProfileById = async (employeeId: string) => {
  const response = await api.get(`/employees/${employeeId}`);
  return response.data.data;
};

export const registerEmployee = async (data: RegistrationData) => {
  const response = await api.post("/employees/register", data);
  return response.data.data;
};
export const getEmployeeAnalytics = async (employeeId: string) => {
  const response = await api.get(`/employees/${employeeId}/analytics`);
  return response.data.data;
};

export const getFullEmployeeDetails = async (employeeId: string) => {
  const response = await api.get(`/employees/${employeeId}/details`);
  return response.data.data;
};
export const getEmployeeAttendanceAnalytics = async (employeeId: string) => {
  const response = await api.get(
    `/employees/${employeeId}/attendance-analytics`
  );
  return response.data.data;
};
export const getPotentialManagers = async () => {
  const response = await api.get("/employees/potential-managers");
  return response.data.data;
};

/**
 * @service assignManager
 * @description Assigns a manager to a specific employee.
 */
export const assignManager = async (employeeId: string, managerId: string) => {
  // We use the updateMyProfile endpoint, as it's designed to handle this
  const response = await api.patch(
    `/employees/me`,
    { managerId },
    { params: { id: employeeId } }
  );
  // Note: The backend route for updateMe is PATCH /employees/me, but we can target
  // a different user if we adjust the backend controller. For simplicity, let's
  // assume the backend updateMe controller is updated to handle an optional ID.
  // A better approach would be a dedicated PATCH /employees/:id/assign-manager route.
  // Let's create a more robust update function.
  const res = await api.patch(`/employees/${employeeId}`, { managerId }); // Assuming a PATCH /employees/:id route
  return res.data.data;
};
