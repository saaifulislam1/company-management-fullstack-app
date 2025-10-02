"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Services & Components
import {
  getFullEmployeeDetails,
  updateEmployeeProfile,
} from "@/services/employeeService";
import { AssignManagerForm } from "@/components/shared/AssignManagerForm";
import { useAuth } from "@/hooks/useAuth";

// Icons
import {
  Clock,
  Phone,
  Home,
  CalendarDays,
  UserPlus,
  Info,
  Briefcase,
  HeartPulse,
  BarChartHorizontalBig,
  Edit,
  XCircle,
  Siren,
  User,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard"; // Assuming StatCard exists

// --- TYPE DEFINITIONS (Corrected & Final) ---
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
type UserRole = "EMPLOYEE" | "HR" | "ADMIN" | "MANAGER";
type Department =
  | "HR"
  | "SOFTWARE"
  | "ACCOUNTING"
  | "INTERN"
  | "ADMIN"
  | "ENGINEERING"
  | "MARKETING"
  | "SALES";

interface FullEmployeeData {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    phone: string | null;
    address: string | null;
    emergencyContact: string | null;
    department: Department;
    dateOfJoining: string; // ISO String
    vacationBalance: number; // Changed to number
    sickLeaveBalance: number; // Changed to number
  } | null;
  leaveHistory: {
    id: string;
    leaveType: string;
    startDate: string; // ISO String
    endDate: string; // ISO String
    reason: string; // Added reason
    managerStatus: LeaveStatus;
    adminStatus: LeaveStatus | null;
  }[];
  todaysAttendance: {
    records: { id: string; checkIn: string; checkOut: string | null }[];
    totalHoursFormatted: string; // Corrected property name
  };
  manager: {
    id: string;
    profile: { firstName: string; lastName: string } | null;
  } | null;
}

// Zod schema for the editable form fields
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("A valid email is required"),
  role: z.enum(["EMPLOYEE", "HR", "ADMIN", "MANAGER"], {
    message: "Invalid role selected",
  }),
  department: z.enum(
    [
      "HR",
      "SOFTWARE",
      "ACCOUNTING",
      "INTERN",
      "ADMIN",
      "ENGINEERING",
      "MARKETING",
      "SALES",
    ],
    { message: "Invalid department selected" }
  ),
  vacationBalance: z.coerce.number().min(0, "Cannot be negative"),
  sickLeaveBalance: z.coerce.number().min(0, "Cannot be negative"),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export default function EmployeeDetailPage() {
  const { user: loggedInUser } = useAuth();
  const params = useParams();
  const employeeId = params.employeeId as string;

  const [employeeData, setEmployeeData] = useState<FullEmployeeData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const fetchDetails = async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      const data = await getFullEmployeeDetails(employeeId);
      setEmployeeData(data);
      // Populate the form with the fetched data
      form.reset({
        firstName: data.profile?.firstName || "",
        lastName: data.profile?.lastName || "",
        email: data.email || "",
        role: data.role,
        department: data.profile?.department,
        vacationBalance: data.profile?.vacationBalance ?? 0,
        sickLeaveBalance: data.profile?.sickLeaveBalance ?? 0,
        phone: data.profile?.phone || "",
        address: data.profile?.address || "",
        emergencyContact: data.profile?.emergencyContact || "",
      });
    } catch (error) {
      toast.error("Failed to fetch employee details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Re-fetch data if employeeId changes
    fetchDetails();
  }, [employeeId]); // Dependency array should only include employeeId

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise = updateEmployeeProfile(employeeId, values).then(() => {
      setIsEditing(false); // Turn off edit mode on success
      fetchDetails(); // Refetch the latest data to update UI
    });

    toast.promise(promise, {
      loading: "Saving changes...",
      success: "Profile updated successfully!",
      error: "Failed to update profile.",
    });
  }

  // Helper Functions
  const formatTime = (dateString: string | null) =>
    dateString
      ? formatInTimeZone(parseISO(dateString), "Asia/Dhaka", "hh:mm:ss a")
      : "In Progress";
  const formatDate = (dateString: string) =>
    format(parseISO(dateString), "dd MMM, yyyy");
  const getStatusBadgeVariant = (status: LeaveStatus | null) => {
    if (!status) return "secondary"; // Default for null or undefined status
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

  if (isLoading) {
    return (
      <div className="text-center py-10 text-lg">
        Loading employee details...
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="text-center py-10 text-lg text-destructive">
        Could not find data for this employee.
      </div>
    );
  }

  const { profile, leaveHistory, todaysAttendance, manager } = employeeData!;
  // When editing, use form values for display, otherwise use employeeData
  const currentFirstName = isEditing
    ? form.getValues("firstName")
    : profile?.firstName || "Unknown";
  const currentLastName = isEditing
    ? form.getValues("lastName")
    : profile?.lastName || "User";
  const fallback = (
    currentFirstName.charAt(0) +
    (currentLastName ? currentLastName.charAt(0) : "")
  ).toUpperCase();
  const isAdminOrHR =
    loggedInUser?.role === "ADMIN" || loggedInUser?.role === "HR";

  // Component for displaying a single detail field (either text or input)
  const DetailField = ({
    name,
    label,
    icon: Icon,
  }: {
    name: keyof z.infer<typeof formSchema>;
    label: string;
    icon?: React.ElementType;
  }) => (
    <div className="space-y-1">
      <FormLabel className="text-sm font-medium text-muted-foreground flex items-center">
        {Icon && <Icon className="mr-2 h-4 w-4" />} {label}
      </FormLabel>
      {isEditing ? (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type={name.includes("Balance") ? "number" : "text"}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <p className="text-base font-semibold">
          {form.getValues(name)?.toString() || "N/A"}
        </p>
      )}
    </div>
  );
  const DetailItem = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value || "N/A"}</p>
    </div>
  );
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex items-center space-x-6">
            <Avatar className="h-28 w-28">
              <AvatarFallback className="text-5xl">{fallback}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold">
                {currentFirstName} {currentLastName}
              </h1>
              <p className="text-xl text-muted-foreground">
                {employeeData.email}
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                Manager:{" "}
                {manager?.profile ? (
                  <Link
                    href={`/employees/${manager.id}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {manager.profile.firstName} {manager.profile.lastName}
                  </Link>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          {isAdminOrHR && (
            <div className="flex flex-col sm:flex-row gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Link href={`/employees/${employeeData.id}/analytics`}>
                    <Button variant="outline">
                      <BarChartHorizontalBig className="mr-2 h-4 w-4" />{" "}
                      Analytics
                    </Button>
                  </Link>
                  <Dialog
                    open={isManagerDialogOpen}
                    onOpenChange={setIsManagerDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Assign Manager
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Manager</DialogTitle>
                      </DialogHeader>
                      <AssignManagerForm
                        employeeId={employeeId}
                        onSuccess={() => {
                          setIsManagerDialogOpen(false);
                          fetchDetails();
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* --- EMPLOYEE DETAILS CARD --- */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailField name="firstName" label="First Name" />
              <DetailField name="lastName" label="Last Name" />
              <DetailField name="email" label="Email" />

              <div className="space-y-1">
                <FormLabel className="text-sm font-medium text-muted-foreground">
                  Role
                </FormLabel>
                {isEditing ? (
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <p className="text-base font-semibold">{employeeData.role}</p>
                )}
              </div>

              <div className="space-y-1">
                <FormLabel className="text-sm font-medium text-muted-foreground">
                  Department
                </FormLabel>
                {isEditing ? (
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SOFTWARE">Software</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="ACCOUNTING">
                              Accounting
                            </SelectItem>
                            <SelectItem value="INTERN">Intern</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="ENGINEERING">
                              Engineering
                            </SelectItem>
                            <SelectItem value="MARKETING">Marketing</SelectItem>
                            <SelectItem value="SALES">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <p className="text-base font-semibold">
                    {profile?.department}
                  </p>
                )}
              </div>

              <DetailField name="phone" label="Phone" icon={Phone} />
              <DetailField name="address" label="Address" icon={Home} />
              <DetailField
                name="emergencyContact"
                label="Emergency Contact"
                icon={Siren}
              />
              <DetailItem
                label="Joined On"
                value={profile ? formatDate(profile.dateOfJoining) : "N/A"}
              />
              <DetailField
                name="vacationBalance"
                label="Vacation Balance (Days)"
                icon={Briefcase}
              />
              <DetailField
                name="sickLeaveBalance"
                label="Sick Leave Balance (Days)"
                icon={HeartPulse}
              />
            </div>
          </CardContent>
        </Card>

        {/* --- Today's Attendance Card --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" /> Today's Log (
              {todaysAttendance.totalHoursFormatted})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysAttendance.records.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysAttendance.records.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{formatTime(rec.checkIn)}</TableCell>
                      <TableCell>{formatTime(rec.checkOut)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No attendance records for today.
              </p>
            )}
          </CardContent>
        </Card>

        {/* --- Leave History Card --- */}
        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Manager Status</TableHead>
                  <TableHead>Final (Admin) Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveHistory.length > 0 ? (
                  leaveHistory.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">
                        {leave.leaveType}
                      </TableCell>
                      <TableCell>
                        {formatDate(leave.startDate)} -{" "}
                        {formatDate(leave.endDate)}
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="h-5 w-5 cursor-pointer text-muted-foreground" />
                          </HoverCardTrigger>
                          <HoverCardContent>
                            Reason: {leave.reason}
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(leave.managerStatus)}
                        >
                          {leave.managerStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(leave.adminStatus)}
                        >
                          {leave.adminStatus || "Awaiting"}
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
      </form>
    </Form>
  );
}
