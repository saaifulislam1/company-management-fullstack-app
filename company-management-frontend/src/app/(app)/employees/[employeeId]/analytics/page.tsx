/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { getEmployeeAttendanceAnalytics } from "@/services/employeeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  parseISO,
  startOfMonth,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardCard } from "@/components/shared/DashboardCard";
import { BarChart2, Clock, CalendarDays } from "lucide-react";
import { formatDuration } from "@/lib/utils"; // <-- Import our new utility

export default function EmployeeAnalyticsPage() {
  const params = useParams();
  const employeeId = params.employeeId as string;

  // --- STATE MANAGEMENT ---
  const [allRecords, setAllRecords] = useState<any[]>([]); // Stores all attendance records
  const [selectedDate, setSelectedDate] = useState(new Date()); // Controls the currently viewed month
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!employeeId) return;
      try {
        setIsLoading(true);
        const data = await getEmployeeAttendanceAnalytics(employeeId);
        setAllRecords(data.allRecords || []);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [employeeId]);

  // --- CLIENT-SIDE CALCULATION ---
  // useMemo will re-calculate stats only when allRecords or selectedDate changes.
  const monthlyStats = useMemo(() => {
    // 1. Filter records for the selected month
    const recordsInMonth = allRecords.filter((rec) =>
      isSameMonth(parseISO(rec.checkIn), selectedDate)
    );

    // 2. Group records by day and sum their hours
    const dailyTotals: { [key: string]: number } = {};
    for (const record of recordsInMonth) {
      const day = format(parseISO(record.checkIn), "yyyy-MM-dd");
      dailyTotals[day] = (dailyTotals[day] || 0) + (record.workingHours || 0);
    }

    // 3. Calculate aggregate stats for the month
    const totalHours = Object.values(dailyTotals).reduce(
      (sum, hours) => sum + hours,
      0
    );
    const daysWorked = Object.keys(dailyTotals).length;
    const averageHours = daysWorked > 0 ? totalHours / daysWorked : 0;

    // 4. Format data for the daily summary table
    const dailyData = Object.entries(dailyTotals)
      .map(([date, hours]) => ({
        date: format(parseISO(date), "dd MMM, yyyy"),
        totalHours: hours,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent date

    return {
      totalHours,
      averageHours,
      daysWorked,
      dailyData,
    };
  }, [allRecords, selectedDate]);

  if (isLoading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Attendance Analytics</h1>

        {/* Date Selector */}
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
              >
                {format(selectedDate, "MMMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Monthly Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Total Hours (Month)"
          value={formatDuration(monthlyStats.totalHours)}
          icon={Clock}
        />
        <DashboardCard
          title="Average Hours / Day"
          value={formatDuration(monthlyStats.averageHours)}
          icon={BarChart2}
        />
        <DashboardCard
          title="Days Worked (Month)"
          value={monthlyStats.daysWorked.toString()}
          icon={CalendarDays}
        />
      </div>

      {/* Daily Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daily Summary for {format(selectedDate, "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total Hours Worked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyStats.dailyData.length > 0 ? (
                monthlyStats.dailyData.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium">{day.date}</TableCell>
                    <TableCell className="text-right">
                      {formatDuration(day.totalHours)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No attendance records for this month.
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
