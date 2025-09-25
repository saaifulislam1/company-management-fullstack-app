"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { getAllLeaveRequests, LeaveRecord } from "@/services/leaveService";
import {
  getAttendanceHistory,
  AttendanceRecord,
} from "@/services/attendanceService";
import { Users, CalendarOff, Briefcase, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { getAllEmployees } from "@/services/employeeService";

export default function DashboardPage() {
  const { user } = useAuth();
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
      <DashboardCard
        title="Total Employees"
        value={isLoading ? "..." : stats.employeeCount.toString()}
        icon={Users}
      />
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
      <DashboardCard title="Leave Balance" value="15 Days" icon={Briefcase} />
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
