import api from "./api";

// Defines the shape of a leave record from the backend
export interface LeaveRecord {
  id: string;
  leaveType: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  employeeId: string;
  managerStatus: LeaveStatus;
  adminStatus: LeaveStatus | null; // Can be null
  attachmentUrl: string | null;
}
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
// Defines the shape of the data needed to apply for leave
export interface LeaveApplicationData {
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface LeaveRecordWithEmployee extends LeaveRecord {
  employee: {
    id: string;
    managerId: string | null;
    profile: {
      firstName: string;
      lastName: string;
    } | null;
  };
}
/**
 * @service getLeaveHistory
 * @description Fetches the leave history for the logged-in user.
 */
export const getLeaveHistory = async (): Promise<LeaveRecord[]> => {
  const response = await api.get("/leave/history");
  return response.data.data;
};

export const getAllLeaveRequests = async (): Promise<
  LeaveRecordWithEmployee[]
> => {
  const response = await api.get("/leave/requests");
  // The actual data is nested under `data` twice due to our backend ApiResponse and axios response
  return response.data.data;
};

/**
 * @service applyForLeave
 * @description Submits a new leave application.
 */
export const applyForLeave = async (
  formData: FormData
): Promise<LeaveRecord> => {
  const response = await api.post("/leave/apply", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Important for file uploads
    },
  });
  return response.data.data;
};
export const updateLeaveStatus = async (
  leaveId: string,
  status: "APPROVED" | "REJECTED" | "PENDING"
): Promise<LeaveRecord> => {
  const response = await api.patch(`/leave/requests/${leaveId}`, { status });
  return response.data.data;
};

export const getTeamLeaveRequests = async (): Promise<
  LeaveRecordWithEmployee[]
> => {
  const response = await api.get("/leave/team-requests");
  return response.data.data;
};
export const adminUpdateLeaveStatus = async (
  leaveId: string,
  status: LeaveStatus
): Promise<LeaveRecord> => {
  const response = await api.patch(`/leave/requests/${leaveId}`, { status });
  return response.data.data;
};

export const managerUpdateLeaveStatus = async (
  leaveId: string,
  status: "APPROVED" | "REJECTED" | "PENDING"
): Promise<LeaveRecord> => {
  const response = await api.patch(`/leave/team-requests/${leaveId}`, {
    status,
  });
  return response.data.data;
};
export const getLeaveById = async (
  leaveId: string
): Promise<LeaveRecordWithEmployee> => {
  const response = await api.get(`/leave/${leaveId}`);
  return response.data.data;
};

export const employeeUpdateLeave = async (
  leaveId: string,
  data: LeaveApplicationData
): Promise<LeaveRecord> => {
  const response = await api.patch(`/leave/${leaveId}`, data);
  return response.data.data;
};
