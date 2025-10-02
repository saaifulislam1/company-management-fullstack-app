import { prisma } from '@/prisma/client';
import { ApiError } from '@/utils/apiError';
import { hashPassword } from '@/utils/password';
import { Prisma, Profile } from '@prisma/client';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { formatDuration } from '@/utils/formatDuration';
import { getYear, getMonth, getWeek, format } from 'date-fns';

export const registerEmployee = async (data: any) => {
  // 1. Check if an employee with this email already exists
  const existingEmployee = await prisma.employee.findUnique({
    where: { email: data.email },
  });
  if (existingEmployee) {
    throw new ApiError(409, 'An employee with this email already exists.');
  }

  // 2. Hash the password
  const hashedPassword = await hashPassword(data.password);

  // 3. Use a Prisma transaction to ensure both records are created or neither is.
  // This maintains data integrity. If creating the profile fails, the employee record will be rolled back.
  const newEmployee = await prisma.$transaction(async (tx) => {
    const employee = await tx.employee.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    await tx.profile.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfJoining: data.dateOfJoining,
        department: data.department,
        employeeId: employee.id, // Link the profile to the new employee
      },
    });

    return employee;
  });

  // 4. Return the new employee, omitting the password for security
  const { password: _, ...employeeWithoutPassword } = newEmployee;
  return employeeWithoutPassword;
};

export const getEmployeeProfile = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      profile: true,
      manager: {
        select: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  const { password: _, ...employeeWithoutPassword } = employee;
  return employeeWithoutPassword;
};

export const findAllEmployees = async () => {
  const employees = await prisma.employee.findMany({
    // Using 'select' to explicitly exclude the password field for security
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      profile: true, // Include the employee's profile information
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return employees;
};

export const updateEmployeeProfile = async (
  employeeId: string,
  data: {
    managerId?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    // Add any other profile fields here
  },
) => {
  // 1. Separate the managerId from the rest of the profile fields.
  const { managerId, ...profileData } = data;

  // 2. Use the separated variables in the correct places in the query.
  return prisma.employee.update({
    where: { id: employeeId },
    data: {
      // `managerId` is updated directly on the Employee model.
      managerId: managerId,

      // The rest of the data (`profileData`) is for the nested Profile model.
      profile: {
        upsert: {
          // 'create' is used if no profile exists for this employee
          create: {
            firstName: profileData.firstName || 'New',
            lastName: profileData.lastName || 'User',
            dateOfJoining: new Date(),
            ...profileData,
          },
          // 'update' is used if a profile already exists
          update: profileData,
        },
      },
    },
    include: {
      profile: true,
    },
  });
};
export const findEmployeeById = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    // Use `select` to explicitly choose which fields to return for security
    select: {
      id: true,
      email: true,
      role: true,
      profile: true,
    },
  });

  // If no employee is found with that ID, throw a clear error
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  return employee;
};

export const getEmployeeAnalytics = async (employeeId: string) => {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);

  // 1. Fetch all attendance records for the employee for the current month
  const monthlyAttendance = await prisma.attendance.findMany({
    where: {
      employeeId,
      checkIn: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
      workingHours: { not: null }, // Only consider completed days
    },
    orderBy: { checkIn: 'desc' },
  });

  // 2. Perform calculations
  const totalDaysWorked = monthlyAttendance.length;
  const totalHoursWorked = monthlyAttendance.reduce(
    (sum, record) => sum + (record.workingHours || 0),
    0,
  );
  const averageWorkHours =
    totalDaysWorked > 0 ? totalHoursWorked / totalDaysWorked : 0;

  // Define "late" as checking in after 10:00 AM local time
  const lateCheckInTime = 10;
  const lateCheckIns = monthlyAttendance.filter((record) => {
    const checkInHour = record.checkIn.getHours(); // Note: This uses server's local time
    return checkInHour >= lateCheckInTime;
  }).length;

  // 3. Return a structured analytics object
  return {
    monthlyAttendance, // The raw data for a detailed view
    stats: {
      totalDaysWorked,
      totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
      averageWorkHours: parseFloat(averageWorkHours.toFixed(2)),
      lateCheckIns,
    },
  };
};

export const getFullEmployeeDetails = async (employeeId: string) => {
  // 1. Fetch the employee and all related data in one query
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    // Use `select` to get exactly what you need, including the manager's profile
    select: {
      id: true,
      email: true,
      role: true,
      profile: true,
      manager: {
        select: {
          id: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  // 2. Fetch all leave records
  const leaveHistory = await prisma.leave.findMany({
    where: { employeeId },
    orderBy: { startDate: 'desc' },
  });

  // 3. Fetch today's attendance and calculate total work time
  const today = new Date();
  const todaysAttendance = await prisma.attendance.findMany({
    where: {
      employeeId,
      checkIn: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
    },
    orderBy: { checkIn: 'asc' },
  });

  const totalHoursToday = todaysAttendance.reduce(
    (sum, record) => sum + (record.workingHours || 0),
    0,
  );

  // 4. Structure and return all the data
  return {
    ...employee,
    leaveHistory,
    todaysAttendance: {
      records: todaysAttendance,
      totalHoursFormatted: formatDuration(totalHoursToday),
    },
  };
};
export const getEmployeeAttendanceAnalytics = async (employeeId: string) => {
  const allAttendance = await prisma.attendance.findMany({
    where: { employeeId, workingHours: { not: null } },
    orderBy: { checkIn: 'desc' },
  });

  // Group data by year, month, and week
  const analytics = allAttendance.reduce(
    (acc, record) => {
      const year = getYear(record.checkIn);
      const month = getMonth(record.checkIn); // 0-11
      const week = getWeek(record.checkIn);
      const day = format(record.checkIn, 'yyyy-MM-dd');

      // Yearly
      acc.byYear[year] = (acc.byYear[year] || 0) + (record.workingHours || 0);

      // Monthly
      const monthKey = `${year}-${month}`;
      acc.byMonth[monthKey] =
        (acc.byMonth[monthKey] || 0) + (record.workingHours || 0);

      // Weekly
      const weekKey = `${year}-${week}`;
      acc.byWeek[weekKey] =
        (acc.byWeek[weekKey] || 0) + (record.workingHours || 0);

      // Daily
      acc.byDay[day] = (acc.byDay[day] || 0) + (record.workingHours || 0);

      return acc;
    },
    { byYear: {}, byMonth: {}, byWeek: {}, byDay: {} } as any,
  );

  // Format monthly data for charts
  const monthlyChartData = Object.entries(analytics.byMonth)
    .map(([key, hours]) => {
      const [year, month] = key.split('-');
      return {
        name: format(new Date(Number(year), Number(month)), 'MMM yy'),
        hours: parseFloat((hours as number).toFixed(2)),
      };
    })
    .reverse(); // Reverse to show most recent months first

  return {
    allRecords: allAttendance,
    dailySummary: analytics.byDay,
    weeklySummary: analytics.byWeek,
    monthlyChartData,
  };
};
export const findPotentialManagers = async () => {
  return prisma.employee.findMany({
    where: {
      role: {
        in: ['MANAGER', 'ADMIN', 'HR'],
      },
    },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          department: true,
        },
      },
    },
  });
};
