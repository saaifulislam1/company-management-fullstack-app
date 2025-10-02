"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";

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
  getTeamLeaveRequests,
  managerUpdateLeaveStatus,
  LeaveRecordWithEmployee,
} from "@/services/leaveService";

// --- TYPE DEFINITIONS ---
// These types must match the data structure from your backend service.
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LeaveRecord {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  managerStatus: LeaveStatus;
  adminStatus: LeaveStatus | null; // Admin status can be null
}

export default function TeamRequestsPage() {
  const [requests, setRequests] = useState<LeaveRecordWithEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetches all leave requests for the manager's team
  const fetchTeamRequests = async () => {
    try {
      setIsLoading(true);
      const data = await getTeamLeaveRequests();
      setRequests(data);
    } catch (error) {
      toast.error("Failed to fetch team's leave requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamRequests();
  }, []);

  // Handles the manager's decision to update the status
  const handleStatusChange = async (leaveId: string, status: LeaveStatus) => {
    try {
      await managerUpdateLeaveStatus(leaveId, status);
      toast.success(`Request status has been updated.`);
      // Refresh the list to show the change
      fetchTeamRequests();
    } catch (error) {
      toast.error("Failed to update the request.");
    }
  };

  // Helper to determine the color of the status badge
  const getStatusBadgeVariant = (status: LeaveStatus | null) => {
    if (!status) return "secondary";
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team Leave Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests from Your Team</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Manager Status</TableHead>
                <TableHead>Admin Status</TableHead>
                <TableHead className="text-left">Your Action</TableHead>
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
                  <TableRow key={req.id}>
                    {/* Employee Name */}
                    <TableCell className="font-medium">
                      {req.employee.profile
                        ? `${req.employee.profile.firstName} ${req.employee.profile.lastName}`
                        : "N/A"}
                    </TableCell>

                    {/* Dates */}
                    <TableCell>
                      {format(parseISO(req.startDate), "dd MMM")} -{" "}
                      {format(parseISO(req.endDate), "dd MMM, yyyy")}
                    </TableCell>

                    {/* Reason (via HoverCard) */}
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

                    {/* Manager's current decision */}
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(req.managerStatus)}>
                        {req.managerStatus}
                      </Badge>
                    </TableCell>

                    {/* Admin's final decision */}
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(req.adminStatus)}>
                        {req.adminStatus || "Awaiting"}
                      </Badge>
                    </TableCell>

                    {/* Manager's Action Dropdown */}
                    <TableCell className="text-right">
                      <Select
                        defaultValue={req.managerStatus}
                        // The manager can only act if the admin has not yet made a final decision.
                        disabled={!!req.adminStatus}
                        onValueChange={(newStatus: LeaveStatus) => {
                          handleStatusChange(req.id, newStatus);
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
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
                    No leave requests found from your team.
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
