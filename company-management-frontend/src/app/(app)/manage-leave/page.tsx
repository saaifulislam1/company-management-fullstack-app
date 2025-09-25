"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast"; // <-- 1. Import from react-hot-toast
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
  getAllLeaveRequests,
  updateLeaveStatus,
  LeaveRecord,
  LeaveRecordWithEmployee,
} from "@/services/leaveService";
import Link from "next/link";

export default function ManageLeavePage() {
  const [requests, setRequests] = useState<LeaveRecordWithEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllRequests = async () => {
    try {
      setIsLoading(true);
      const data = await getAllLeaveRequests();
      setRequests(data);
    } catch (error) {
      // 2. Use react-hot-toast for errors
      toast.error("Failed to fetch leave requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleStatusChange = async (
    leaveId: string,
    status: "APPROVED" | "PENDING" | "REJECTED"
  ) => {
    try {
      await updateLeaveStatus(leaveId, status);
      // 3. Use react-hot-toast for success
      toast.success(`Request status has been updated.`);
      fetchAllRequests();
    } catch (error) {
      // 4. Use react-hot-toast for update errors
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
      <h1 className="text-3xl font-bold">Manage Leave Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Submitted Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Change Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/employees/${req.employeeId}`} // <-- Use the employeeId from the record
                        className="hover:underline"
                      >
                        {req.employee.profile
                          ? `${req.employee.profile.firstName} ${req.employee.profile.lastName}`
                          : "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell>{req.leaveType}</TableCell>
                    <TableCell>
                      {format(parseISO(req.startDate), "dd MMM")} -{" "}
                      {format(parseISO(req.endDate), "dd MMM, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(req.status)}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        defaultValue={req.status}
                        onValueChange={(
                          newStatus: "APPROVED" | "PENDING" | "REJECTED"
                        ) => {
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
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
