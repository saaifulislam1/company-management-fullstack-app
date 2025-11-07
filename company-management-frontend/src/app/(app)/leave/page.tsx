"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";

// UI Components
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

// Services and Components
import * as leaveService from "@/services/leaveService";
import type { LeaveRecord } from "@/services/leaveService";
import { LeaveApplicationForm } from "@/components/shared/LeaveApplicationForm";
import { useRouter } from "next/navigation";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export default function LeavePage() {
  const router = useRouter();
  const [history, setHistory] = useState<LeaveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchLeaveHistory = async () => {
    try {
      setIsLoading(true);
      const data = await leaveService.getLeaveHistory();
      setHistory(data);
    } catch (error) {
      toast.error("Failed to fetch leave history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const getStatusBadgeVariant = (status: LeaveStatus | null) => {
    if (!status) return "secondary"; // For null adminStatus
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Apply for Leave</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>New Leave Application</DialogTitle>
            </DialogHeader>
            <LeaveApplicationForm
              onSuccess={() => {
                fetchLeaveHistory(); // Refresh history on success
                setIsDialogOpen(false); // Close the dialog
              }}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Manager Status</TableHead>
                <TableHead>Admin Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : history.length > 0 ? (
                history.map((record) => (
                  <TableRow
                    key={record.id}
                    onClick={() => router.push(`/leave/${record.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {record.leaveType}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(record.startDate), "dd MMM, yyyy")} -{" "}
                      {format(parseISO(record.endDate), "dd MMM, yyyy")}
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
                          <p className="text-sm">{record.reason}</p>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(record.managerStatus)}
                      >
                        {record.managerStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(record.adminStatus)}
                      >
                        {record.adminStatus || "Awaiting"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
