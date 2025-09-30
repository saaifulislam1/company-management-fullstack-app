"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import toast from "react-hot-toast";

// in employees/[employeeId]/page.tsx

import { Button } from "@/components/ui/button";
import { BarChartHorizontalBig } from "lucide-react";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Services and Hooks
import { getFullEmployeeDetails } from "@/services/employeeService";

// Icons
import { Clock, Phone, Home, AlertTriangle, CalendarDays } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/shared/StatCard";

// --- TYPE DEFINITIONS ---
// These interfaces define the exact shape of the data we expect from our API,
// ensuring full type safety throughout the component.

interface Profile {
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  emergencyContact: string | null;
  department: string;
  dateOfJoining: string; // ISO String
}

interface LeaveRecord {
  id: string;
  leaveType: string;
  startDate: string; // ISO String
  endDate: string; // ISO String
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface AttendanceRecord {
  id: string;
  checkIn: string; // ISO String
  checkOut: string | null; // ISO String or null
}

interface FullEmployeeData {
  id: string;
  email: string;
  role: "EMPLOYEE" | "HR" | "ADMIN";
  profile: Profile | null;
  leaveHistory: LeaveRecord[];
  todaysAttendance: {
    records: AttendanceRecord[];
    totalHours: string;
  };
}

export default function EmployeeDetailPage() {
  // Get the dynamic employeeId from the URL
  const params = useParams();
  const employeeId = params.employeeId as string;

  // --- STATE MANAGEMENT ---
  // A single state object to hold all data for the employee
  const [employeeData, setEmployeeData] = useState<FullEmployeeData | null>(
    null
  );
  // A state to handle the loading UI
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA FETCHING ---
  useEffect(() => {
    // This effect runs when the component mounts or when the employeeId changes.
    const fetchDetails = async () => {
      if (!employeeId) return; // Don't fetch if there's no ID

      try {
        setIsLoading(true);
        // Call our single, comprehensive API endpoint
        const data = await getFullEmployeeDetails(employeeId);
        setEmployeeData(data);
      } catch (error) {
        toast.error("Failed to fetch employee details.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [employeeId]);

  // --- HELPER FUNCTIONS ---
  // These functions keep our JSX clean and logic reusable.

  /** Formats an ISO date string to a time in the 'Asia/Dhaka' timezone. */
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "In Progress";
    const date = parseISO(dateString);
    return formatInTimeZone(date, "Asia/Dhaka", "hh:mm:ss a");
  };

  /** Formats an ISO date string to a simple date format. */
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "dd MMM, yyyy");
  };

  /** Determines the color of the status badge based on leave status. */
  const getStatusBadgeVariant = (status: LeaveRecord["status"]) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  // --- RENDER LOGIC ---

  // Display a loading state while fetching data
  if (isLoading) {
    return (
      <div className="text-center py-10 text-lg">
        Loading employee details...
      </div>
    );
  }

  // Display an error state if data fetching fails
  if (!employeeData) {
    return (
      <div className="text-center py-10 text-lg text-destructive">
        Could not find data for this employee.
      </div>
    );
  }

  // Destructure data for easier access in JSX
  const { profile, leaveHistory, todaysAttendance } = employeeData;
  console.log(todaysAttendance, "tdd");
  const { firstName = "Unknown", lastName = "User" } = profile || {};
  const fallback = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  console.log("timetable", todaysAttendance.totalHours);
  return (
    <div className="space-y-8">
      {/* 1. Header Section: Displays the employee's name, avatar, and core info. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
        <Avatar className="h-28 w-28 mb-4 sm:mb-0">
          <AvatarFallback className="text-5xl">{fallback}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold">
            {firstName} {lastName}
          </h1>
          <Link href={`/employees/${employeeData.id}/analytics`}>
            <Button variant="outline" className="mt-4">
              <BarChartHorizontalBig className="mr-2 h-4 w-4" />
              View Detailed Analytics
            </Button>
          </Link>
          <p className="text-xl text-muted-foreground">{employeeData.email}</p>
          <div className="mt-2 flex items-center gap-4">
            <Badge variant="outline">{employeeData.role}</Badge>
            <Badge variant="secondary">
              Dept: {profile?.department || "N/A"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          title="Total Hours Worked Today"
          value={todaysAttendance.totalHours}
          icon={Clock}
        />
        {/* You can add more summary cards here in the future */}
      </div>

      {/* 2. Details Grid: Shows key profile and attendance information at a glance. */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" /> Todays Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysAttendance.records.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysAttendance.records.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{formatTime(rec.checkIn)}</TableCell>
                      <TableCell>{formatTime(rec.checkOut)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No attendance records for today.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center">
              <Phone className="mr-3 h-4 w-4 text-muted-foreground" />{" "}
              {profile?.phone || "Not provided"}
            </div>
            <div className="flex items-center">
              <Home className="mr-3 h-4 w-4 text-muted-foreground" />{" "}
              {profile?.address || "Not provided"}
            </div>
            <div className="flex items-center">
              <AlertTriangle className="mr-3 h-4 w-4 text-muted-foreground" />{" "}
              {profile?.emergencyContact || "Not provided"}
            </div>
            <div className="flex items-center">
              <CalendarDays className="mr-3 h-4 w-4 text-muted-foreground" />{" "}
              Joined on {profile ? formatDate(profile.dateOfJoining) : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Leave History Table: A full log of the employee's leave requests. */}
      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveHistory.length > 0 ? (
                leaveHistory.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      {leave.leaveType}
                    </TableCell>
                    <TableCell>{formatDate(leave.startDate)}</TableCell>
                    <TableCell>{formatDate(leave.endDate)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(leave.status)}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No leave records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
