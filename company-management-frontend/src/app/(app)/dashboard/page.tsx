"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { getAllLeaveRequests, LeaveRecord } from "@/services/leaveService";
import {
  getAttendanceHistory,
  AttendanceRecord,
} from "@/services/attendanceService";
import { Users, CalendarOff, Briefcase, Clock, HeartPulse } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { getAllEmployees } from "@/services/employeeService";
import { getMyProfile } from "@/services/authService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    pendingLeaves: 0,
    latestCheckIn: "N/A",
    employeeCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        if (user.role === "EMPLOYEE" || user.role === "MANAGER") {
          const profileData = await getMyProfile();
          setProfile(profileData.data.profile);
        }
        // Admin/HR users fetch all pending leave requests
        if (user.role === "ADMIN" || user.role === "HR") {
          const allRequests = await getAllLeaveRequests();
          const pendingCount = allRequests.filter(
            (req) => req.status === "PENDING"
          ).length;
          const allEmployees = await getAllEmployees();
          setStats((prev) => ({
            ...prev,
            pendingLeaves: pendingCount,
            employeeCount: allEmployees.length,
          }));
        }

        // All users can fetch their own attendance for a summary
        const attendanceHistory = await getAttendanceHistory();
        if (attendanceHistory.length > 0) {
          const latestRecord = attendanceHistory[0];
          const checkInTime = format(parseISO(latestRecord.checkIn), "hh:mm a");
          setStats((prev) => ({ ...prev, latestCheckIn: checkInTime }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const renderAdminDashboard = () => (
    <>
      <DashboardCard
        title="Pending Leave Requests"
        value={isLoading ? "..." : stats.pendingLeaves.toString()}
        icon={CalendarOff}
      />
      <Link href={"/employees"}>
        <DashboardCard
          title="Total Employees"
          value={isLoading ? "..." : stats.employeeCount.toString()}
          icon={Users}
        />
      </Link>
      {/* Add more admin-specific cards here */}
    </>
  );

  const renderEmployeeDashboard = () => (
    <>
      <DashboardCard
        title="Today's Check-in"
        value={isLoading ? "..." : stats.latestCheckIn}
        icon={Clock}
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Vacation Balance
          </CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : `${profile?.vacationBalance || 0} Days`}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Sick Leave Balance
          </CardTitle>
          <HeartPulse className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : `${profile?.sickLeaveBalance || 0} Days`}
          </div>
        </CardContent>
      </Card>
      {/* Add more employee-specific cards here */}
    </>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Welcome back, {user ? user.email : "Guest"}!
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {user?.role === "ADMIN" || user?.role === "HR"
          ? renderAdminDashboard()
          : renderEmployeeDashboard()}
      </div>

      {/* Quick Actions / Recent Activity Section */}
      <div className="mt-6">
        {/* Admins see a link to manage leave requests */}
        {(user?.role === "ADMIN" || user?.role === "HR") &&
          stats.pendingLeaves > 0 && (
            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-md">
              <p>
                There are {stats.pendingLeaves} pending leave requests that need
                your attention.
                <Link
                  href="/manage-leave"
                  className="ml-2 font-bold text-yellow-800 hover:underline"
                >
                  View Requests
                </Link>
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
