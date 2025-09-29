import api from "./api";
export interface RegistrationData {
  email: string;
  password: string;
  role: "EMPLOYEE" | "HR" | "ADMIN";
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
