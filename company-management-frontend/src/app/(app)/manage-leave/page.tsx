"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
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
  getAllLeaveRequests,
  updateLeaveStatus,
  LeaveRecord,
} from "@/services/leaveService";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// We need to add the employee's profile to the LeaveRecord type for this page
type LeaveRecordWithEmployee = LeaveRecord & {
  employee: {
    profile: {
      firstName: string;
      lastName: string;
    } | null;
  };
};

export default function ManageLeavePage() {
  const [requests, setRequests] = useState<LeaveRecordWithEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllRequests = async () => {
    try {
      setIsLoading(true);
      const data = await getAllLeaveRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleUpdateRequest = async (
    leaveId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      await updateLeaveStatus(leaveId, status);
      toast(`Request has been ${status.toLowerCase()}.`);
      // Refresh the list to show the change
      fetchAllRequests();
    } catch (error) {
      console.error(error);
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
                <TableHead className="text-right">Actions</TableHead>
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
                      {req.employee.profile
                        ? `${req.employee.profile.firstName} ${req.employee.profile.lastName}`
                        : "N/A"}
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
                      {/* Only show buttons for PENDING requests */}
                      {req.status === "PENDING" && (
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                            onClick={() =>
                              handleUpdateRequest(req.id, "APPROVED")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() =>
                              handleUpdateRequest(req.id, "REJECTED")
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
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
