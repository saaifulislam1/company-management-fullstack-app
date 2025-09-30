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

// Services and Types
import {
  getTeamLeaveRequests,
  managerUpdateLeaveStatus,
  LeaveRecord,
  LeaveRecordWithEmployee,
} from "@/services/leaveService";

export default function TeamRequestsPage() {
  const [requests, setRequests] = useState<LeaveRecordWithEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamRequests = async () => {
    try {
      setIsLoading(true);
      // Fetches only the requests for the manager's team
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

  const handleStatusChange = async (
    leaveId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      await managerUpdateLeaveStatus(leaveId, status);
      toast.success(`Request status has been updated.`);
      // Refresh the list to show the change
      fetchTeamRequests();
    } catch (error) {
      toast.error("Failed to update the request.");
    }
  };

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team Leave Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests from Your Team</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      {req.employee.profile
                        ? `${req.employee.profile.firstName} ${req.employee.profile.lastName}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{req.leaveType}</TableCell>
                    <TableCell>
                      {format(parseISO(req.startDate), "dd MMM")} -{" "}
                      {format(parseISO(req.endDate), "dd MMM, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        defaultValue={req.status}
                        onValueChange={(newStatus: "APPROVED" | "REJECTED") => {
                          handleStatusChange(req.id, newStatus);
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No pending requests from your team.
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
