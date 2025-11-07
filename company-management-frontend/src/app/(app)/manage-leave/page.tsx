"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

// Services and Types
import {
  getAllLeaveRequests,
  adminUpdateLeaveStatus,
  LeaveRecordWithEmployee,
} from "@/services/leaveService";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export default function ManageLeavePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRecordWithEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllRequests = async () => {
    try {
      setIsLoading(true);
      // Fetches only requests approved by managers
      const data = await getAllLeaveRequests();
      setRequests(data);
    } catch (error) {
      toast.error("Failed to fetch leave requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  // Use toast.promise for better feedback during the API call
  const handleStatusChange = (leaveId: string, status: LeaveStatus) => {
    const promise = adminUpdateLeaveStatus(leaveId, status).then(() => {
      // Refresh data on success
      fetchAllRequests();
    });

    toast.promise(promise, {
      loading: "Updating status...",
      success: "Status updated successfully!",
      error: "Failed to update status.",
    });
  };

  const getStatusBadgeClasses = (status: LeaveStatus | null) => {
    if (!status) return "bg-gray-200 text-gray-800"; // Awaiting

    switch (status) {
      case "APPROVED":
        return "bg-green-600 text-white";
      case "PENDING":
        return "bg-yellow-400 text-black";

      case "REJECTED":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Leave Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manager-Approved Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Managers Decision</TableHead>
                <TableHead>Final Status</TableHead>
                <TableHead className="text-left">Your Final Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow
                    key={req.id}
                    onClick={() => router.push(`/leave/${req.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/employees/${req.employeeId}`}
                        className="hover:underline"
                      >
                        {req.employee.profile
                          ? `${req.employee.profile.firstName} ${req.employee.profile.lastName}`
                          : "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(req.startDate), "dd MMM")} -{" "}
                      {format(parseISO(req.endDate), "dd MMM, yyyy")}
                    </TableCell>
                    <TableCell>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Info className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <p className="text-sm font-semibold">
                            Reason for Leave:
                          </p>
                          <p className="text-sm">{req.reason}</p>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(getStatusBadgeClasses(req.managerStatus))}
                      >
                        {req.managerStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(getStatusBadgeClasses(req.adminStatus))}
                      >
                        {req.adminStatus || "PENDING"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        defaultValue={req.adminStatus || "PENDING"}
                        onValueChange={(newStatus: LeaveStatus) => {
                          handleStatusChange(req.id, newStatus);
                        }}
                      >
                        <SelectTrigger className="w-[120px] ">
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Awaiting</SelectItem>
                          <SelectItem value="APPROVED">Approve</SelectItem>
                          <SelectItem value="REJECTED">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No manager-approved requests to show.
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
