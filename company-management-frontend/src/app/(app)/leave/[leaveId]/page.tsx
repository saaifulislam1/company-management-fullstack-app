"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import * as leaveService from "@/services/leaveService";
import { LeaveApplicationForm } from "@/components/shared/LeaveApplicationForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Ban,
  CheckCircle,
  Calendar,
  User,
  Info,
  FileText,
} from "lucide-react";
import Link from "next/link";

// --- TYPE DEFINITIONS ---
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LeaveDetails {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachmentUrl: string | null;
  managerStatus: LeaveStatus;
  adminStatus: LeaveStatus | null;
  employeeId: string;
  employee: {
    managerId: string | null;
    profile: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

export default function LeaveDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const leaveId = params.leaveId as string;

  const [leave, setLeave] =
    useState<leaveService.LeaveRecordWithEmployee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchLeave = async () => {
    if (!leaveId) return;
    try {
      setIsLoading(true);
      const data = await leaveService.getLeaveById(leaveId);
      setLeave(data);
    } catch (error) {
      toast.error("Failed to fetch leave details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeave();
  }, [leaveId]);

  const handleManagerApproval = (status: "APPROVED" | "REJECTED") => {
    const promise = leaveService
      .managerUpdateLeaveStatus(leaveId, status)
      .then(fetchLeave);
    toast.promise(promise, {
      loading: "Updating...",
      success: "Status updated!",
      error: "Update failed.",
    });
  };

  const handleAdminApproval = (status: "APPROVED" | "REJECTED") => {
    const promise = leaveService
      .adminUpdateLeaveStatus(leaveId, status)
      .then(fetchLeave);
    toast.promise(promise, {
      loading: "Updating...",
      success: "Final status updated!",
      error: "Update failed.",
    });
  };

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

  // Determine user's permissions for this specific request
  const canEdit =
    user?.id === leave?.employeeId && leave?.managerStatus === "PENDING";
  const isManagerForThisRequest =
    user?.id === leave?.employee?.managerId && !leave?.adminStatus;
  const isAdminActionable =
    (user?.role === "ADMIN" || user?.role === "HR") &&
    leave?.managerStatus === "APPROVED";

  if (isLoading)
    return <div className="text-center py-10">Loading Leave Details...</div>;
  if (!leave)
    return <div className="text-center py-10">Leave request not found.</div>;

  const {
    employee,
    startDate,
    endDate,
    leaveType,
    reason,
    attachmentUrl,
    managerStatus,
    adminStatus,
  } = leave;
  const { firstName = "N/A", lastName = "" } = employee.profile || {};
  const fallback = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>

      {isEditing && canEdit ? (
        // --- EDITING VIEW (for Employee) ---
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Leave Application</DialogTitle>
            </DialogHeader>
            <LeaveApplicationForm
              onSuccess={() => {
                setIsEditing(false);
                fetchLeave();
              }}
              onClose={() => setIsEditing(false)}
              initialData={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                leaveType: leave.leaveType as any,
                startDate: parseISO(leave.startDate),
                endDate: parseISO(leave.endDate),
                reason: leave.reason,
              }}
              leaveId={leave.id}
            />
          </DialogContent>
        </Dialog>
      ) : (
        // --- DETAIL VIEW (for everyone) ---
        <>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Leave Request</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <Link
                  className="text-blue-600"
                  href={`/employees/${employee.id}`}
                >
                  <span>
                    {firstName} {lastName}
                  </span>
                </Link>
              </div>
            </div>
            {canEdit && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Request
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start">
                  <Calendar className="mr-3 h-4 w-4 mt-1 text-muted-foreground" />
                  <p>
                    <strong>Dates:</strong>{" "}
                    {format(parseISO(startDate), "dd MMM, yyyy")} to{" "}
                    {format(parseISO(endDate), "dd MMM, yyyy")}
                  </p>
                </div>
                <div className="flex items-start">
                  <User className="mr-3 h-4 w-4 mt-1 text-muted-foreground" />
                  <p>
                    <strong>Type:</strong> {leaveType}
                  </p>
                </div>
                <div className="flex items-start">
                  <Info className="mr-3 h-4 w-4 mt-1 text-muted-foreground" />
                  <p>
                    <strong>Reason:</strong> {reason}
                  </p>
                </div>
                {/* {attachmentUrl && (
                  <div className="flex items-start">
                    <FileText className="mr-3 h-4 w-4 mt-1 text-muted-foreground" />
                    <p>
                      <strong>Attachment:</strong>{" "}
                      <Link
                        href={attachmentUrl}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        View Document
                      </Link>
                    </p>
                  </div>
                )} */}
                {attachmentUrl && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Attachment
                    </p>
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={attachmentUrl}
                        alt="Leave Attachment"
                        className="max-w-xs rounded-md border object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">Manager's Decision</p>
                  <Badge variant={getStatusBadgeVariant(managerStatus)}>
                    {managerStatus}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">
                    Final (Admin) Decision
                  </p>
                  <Badge variant={getStatusBadgeVariant(adminStatus)}>
                    {adminStatus || "Awaiting"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- ACTION BUTTONS --- */}
          {isManagerForThisRequest && (
            <Card>
              <CardHeader>
                <CardTitle>Your Action (Manager)</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button onClick={() => handleManagerApproval("APPROVED")}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleManagerApproval("REJECTED")}
                >
                  <Ban className="mr-2 h-4 w-4" /> Reject
                </Button>
              </CardContent>
            </Card>
          )}
          {isAdminActionable && (
            <Card>
              <CardHeader>
                <CardTitle>Your Action (Admin)</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button onClick={() => handleAdminApproval("APPROVED")}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Final Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAdminApproval("REJECTED")}
                >
                  <Ban className="mr-2 h-4 w-4" /> Final Reject
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
