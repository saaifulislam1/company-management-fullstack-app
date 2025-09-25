import api from "./api";

// Defines the shape of a leave record from the backend
export interface LeaveRecord {
  id: string;
  leaveType: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

// Defines the shape of the data needed to apply for leave
export interface LeaveApplicationData {
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

/**
 * @service getLeaveHistory
 * @description Fetches the leave history for the logged-in user.
 */
export const getLeaveHistory = async (): Promise<LeaveRecord[]> => {
  const response = await api.get("/leave/history");
  return response.data.data;
};

/**
 * @service applyForLeave
 * @description Submits a new leave application.
 */
export const applyForLeave = async (
  data: LeaveApplicationData
): Promise<LeaveRecord> => {
  const response = await api.post("/leave/apply", data);
  return response.data.data;
};
