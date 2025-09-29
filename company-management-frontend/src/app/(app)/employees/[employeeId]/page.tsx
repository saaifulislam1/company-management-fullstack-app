/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  getEmployeeProfileById,
  getEmployeeAnalytics,
} from "@/services/employeeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Clock, BarChart2, AlertTriangle, CalendarDays } from "lucide-react";

// Define the shape of the data we expect
interface ProfileData {
  id: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    department: string;
    dateOfJoining: string;
  } | null;
}

interface AnalyticsData {
  monthlyAttendance: any[]; // Define a stricter type if needed
  stats: {
    totalDaysWorked: number;
    totalHoursWorked: number;
    averageWorkHours: number;
    lateCheckIns: number;
  };
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const employeeId = params.employeeId as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      if (employeeId) {
        try {
          setIsLoading(true);
          // Fetch both profile and analytics data in parallel for speed
          const [profileData, analyticsData] = await Promise.all([
            getEmployeeProfileById(employeeId),
            getEmployeeAnalytics(employeeId),
          ]);
          setProfile(profileData);
          setAnalytics(analyticsData);
        } catch (error) {
          console.error("Failed to fetch employee data", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchAllData();
  }, [employeeId]);

  if (isLoading)
    return <div className="text-center py-10">Loading employee data...</div>;
  if (!profile)
    return <div className="text-center py-10">Employee not found.</div>;

  const { firstName = "", lastName = "" } = profile.profile || {};
  const fallback =
    (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "??";

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    return formatInTimeZone(date, "Asia/Dhaka", "hh:mm:ss a");
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="text-4xl">{fallback}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold">
            {firstName} {lastName}
          </h1>
          <p className="text-lg text-muted-foreground">{profile.email}</p>
          <p className="text-sm text-muted-foreground">
            Department: {profile.profile?.department || "N/A"}
          </p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Hours (This Month)"
          value={analytics?.stats.totalHoursWorked.toString() || "0"}
          icon={Clock}
        />
        <DashboardCard
          title="Avg. Hours / Day"
          value={analytics?.stats.averageWorkHours.toString() || "0"}
          icon={BarChart2}
        />
        <DashboardCard
          title="Late Check-ins"
          value={analytics?.stats.lateCheckIns.toString() || "0"}
          icon={AlertTriangle}
        />
        <DashboardCard
          title="Days Worked (This Month)"
          value={analytics?.stats.totalDaysWorked.toString() || "0"}
          icon={CalendarDays}
        />
      </div>

      {/* Detailed Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Attendance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Working Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.monthlyAttendance.map((record) => (
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
