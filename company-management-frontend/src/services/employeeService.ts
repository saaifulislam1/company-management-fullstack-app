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
  // This is the only line that should be in this function.
  // It correctly calls the PATCH /employees/:id endpoint.
  const response = await api.patch(`/employees/${employeeId}`, { managerId });
  return response.data.data;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateEmployeeProfile = async (employeeId: string, data: any) => {
  const response = await api.patch(`/employees/${employeeId}`, data);
  return response.data.data;
};
