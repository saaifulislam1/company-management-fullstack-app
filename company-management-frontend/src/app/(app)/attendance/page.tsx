"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import * as attendanceService from "@/services/attendanceService";
import type { AttendanceRecord } from "@/services/attendanceService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the user's current attendance status
type AttendanceStatus = "CheckedIn" | "CheckedOut" | "Loading";

export default function AttendancePage() {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [status, setStatus] = useState<AttendanceStatus>("Loading");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to fetch and update attendance data
  const fetchAttendanceData = async () => {
    try {
      const data = await attendanceService.getAttendanceHistory();
      setHistory(data);

      // Determine current status from the latest record
      if (data.length > 0) {
        const latestRecord = data[0];
        // If the latest record has a check-in but no check-out, user is checked in
        setStatus(
          latestRecord.checkIn && !latestRecord.checkOut
            ? "CheckedIn"
            : "CheckedOut"
        );
      } else {
        // No records exist, so user must be checked out
        setStatus("CheckedOut");
      }
    } catch (error) {
      toast("Failed to fetch attendance history.");
      setStatus("CheckedOut"); // Default to CheckedOut on error
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Handler for the Check In button
  const handleCheckIn = async () => {
    setIsSubmitting(true);
    try {
      await attendanceService.checkIn();
      toast("You have successfully checked in.");
      // Refresh data to show the new record and update status
      await fetchAttendanceData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast("Check-in Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for the Check Out button
  const handleCheckOut = async () => {
    setIsSubmitting(true);
    try {
      await attendanceService.checkOut();
      toast("You have successfully checked out.");
      // Refresh data
      await fetchAttendanceData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast("Check-out Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format dates and times correctly for Bangladesh
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    // Using date-fns-tz to format the time in the correct timezone
    return formatInTimeZone(date, "Asia/Dhaka", "hh:mm:ss a");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance</h1>
        {status !== "Loading" && (
          <Button
            onClick={status === "CheckedIn" ? handleCheckOut : handleCheckIn}
            disabled={isSubmitting}
            className={
              status === "CheckedIn"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }
          >
            {isSubmitting
              ? "Processing..."
              : status === "CheckedIn"
              ? "Check Out"
              : "Check In"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In Time</TableHead>
                <TableHead>Check Out Time</TableHead>
                <TableHead>Working Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(parseISO(record.checkIn), "dd MMM, yyyy")}
                  </TableCell>
                  <TableCell>{formatDateTime(record.checkIn)}</TableCell>
                  <TableCell>{formatDateTime(record.checkOut)}</TableCell>
                  <TableCell>
                    {record.workingHours?.toFixed(2) || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
