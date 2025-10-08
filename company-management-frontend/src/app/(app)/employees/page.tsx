"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getAllEmployees } from "@/services/employeeService";
import { RegisterEmployeeForm } from "@/components/shared/RegisterEmployeeForm";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

// Define the shape of the employee data we expect
interface EmployeeData {
  id: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    dateOfJoining: string;
  } | null;
}
const ITEMS_PER_PAGE = 8;
export default function AllEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error("Failed to fetch employee list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  useEffect(() => {
    setCurrentPage(1); // Reset to the first page whenever the search term changes
  }, [searchTerm]);
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) {
      return employees; // If search is empty, return all employees
    }
    return employees.filter((employee) => {
      const fullName = employee.profile
        ? `${employee.profile.firstName} ${employee.profile.lastName}`
        : "";
      const email = employee.email;
      // Return true if the full name or email includes the search term (case-insensitive)
      return (
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [employees, searchTerm]);

  // --- 3. Create a paginated list from the filtered list ---
  const { paginatedEmployees, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginated = filteredEmployees.slice(startIndex, endIndex);
    const total = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

    return { paginatedEmployees: paginated, totalPages: total };
  }, [filteredEmployees, currentPage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Employees</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Register New Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Employee Registration</DialogTitle>
            </DialogHeader>
            <RegisterEmployeeForm
              onSuccess={fetchEmployees} // Refresh the list on success
              onClose={() => setIsDialogOpen(false)} // Close the dialog
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date of Joining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                // filteredEmployees.map((employee) => (
                paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/employees/${employee.id}`}
                        className="hover:underline text-blue-600 dark:text-blue-400"
                      >
                        {employee.profile
                          ? `${employee.profile.firstName} ${employee.profile.lastName}`
                          : "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      {employee.profile
                        ? format(
                            parseISO(employee.profile.dateOfJoining),
                            "dd MMM, yyyy"
                          )
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Pagination className="ml-auto mr-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  // Disable the button if on the first page
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  // Disable the button if on the last page
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}
