import api from "./api";

// Defines the shape of an attendance record received from the backend
export interface AttendanceRecord {
  id: string;
  checkIn: string; // ISO date string
  checkOut: string | null; // ISO date string or null
  workingHours: number | null;
  employeeId: string;
  createdAt: string; // ISO date string
}

/**
 * @service getAttendanceHistory
 * @description Fetches all attendance records for the logged-in user.
 */
export const getAttendanceHistory = async (): Promise<AttendanceRecord[]> => {
  const response = await api.get("/attendance/history");
  return response.data.data;
};

/**
 * @service checkIn
 * @description Sends a check-in request for the logged-in user.
 */
export const checkIn = async (): Promise<AttendanceRecord> => {
  const response = await api.post("/attendance/check-in");
  return response.data.data;
};

/**
 * @service checkOut
 * @description Sends a check-out request for the logged-in user.
 */
export const checkOut = async (): Promise<AttendanceRecord> => {
  const response = await api.patch("/attendance/check-out");
  return response.data.data;
};
