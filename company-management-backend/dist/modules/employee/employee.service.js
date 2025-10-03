"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeProfile = exports.findPotentialManagers = exports.getEmployeeAttendanceAnalytics = exports.getFullEmployeeDetails = exports.getEmployeeAnalytics = exports.findEmployeeById = exports.findAllEmployees = exports.getEmployeeProfile = exports.registerEmployee = void 0;
const client_1 = require("../../prisma/client");
const apiError_1 = require("../../utils/apiError");
const password_1 = require("../../utils/password");
const date_fns_1 = require("date-fns");
const formatDuration_1 = require("../../utils/formatDuration");
const date_fns_2 = require("date-fns");
const registerEmployee = async (data) => {
    // 1. Check if an employee with this email already exists
    const existingEmployee = await client_1.prisma.employee.findUnique({
        where: { email: data.email },
    });
    if (existingEmployee) {
        throw new apiError_1.ApiError(409, 'An employee with this email already exists.');
    }
    // 2. Hash the password
    const hashedPassword = await (0, password_1.hashPassword)(data.password);
    // 3. Use a Prisma transaction to ensure both records are created or neither is.
    // This maintains data integrity. If creating the profile fails, the employee record will be rolled back.
    const newEmployee = await client_1.prisma.$transaction(async (tx) => {
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
exports.registerEmployee = registerEmployee;
const getEmployeeProfile = async (employeeId) => {
    const employee = await client_1.prisma.employee.findUnique({
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
        throw new apiError_1.ApiError(404, 'Employee not found');
    }
    const { password: _, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword;
};
exports.getEmployeeProfile = getEmployeeProfile;
const findAllEmployees = async () => {
    const employees = await client_1.prisma.employee.findMany({
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
exports.findAllEmployees = findAllEmployees;
// export const updateEmployeeProfile = async (
//   employeeId: string,
//   data: {
//     managerId?: string;
//     firstName?: string;
//     lastName?: string;
//     phone?: string;
//     address?: string;
//     // Add any other profile fields here
//   },
// ) => {
//   // 1. Separate the managerId from the rest of the profile fields.
//   const { managerId, ...profileData } = data;
//   // 2. Use the separated variables in the correct places in the query.
//   return prisma.employee.update({
//     where: { id: employeeId },
//     data: {
//       // `managerId` is updated directly on the Employee model.
//       managerId: managerId,
//       // The rest of the data (`profileData`) is for the nested Profile model.
//       profile: {
//         upsert: {
//           // 'create' is used if no profile exists for this employee
//           create: {
//             firstName: profileData.firstName || 'New',
//             lastName: profileData.lastName || 'User',
//             dateOfJoining: new Date(),
//             ...profileData,
//           },
//           // 'update' is used if a profile already exists
//           update: profileData,
//         },
//       },
//     },
//     include: {
//       profile: true,
//     },
//   });
// };
const findEmployeeById = async (employeeId) => {
    const employee = await client_1.prisma.employee.findUnique({
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
        throw new apiError_1.ApiError(404, 'Employee not found');
    }
    return employee;
};
exports.findEmployeeById = findEmployeeById;
const getEmployeeAnalytics = async (employeeId) => {
    const now = new Date();
    const startOfCurrentMonth = (0, date_fns_1.startOfMonth)(now);
    const endOfCurrentMonth = (0, date_fns_1.endOfMonth)(now);
    // 1. Fetch all attendance records for the employee for the current month
    const monthlyAttendance = await client_1.prisma.attendance.findMany({
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
    const totalHoursWorked = monthlyAttendance.reduce((sum, record) => sum + (record.workingHours || 0), 0);
    const averageWorkHours = totalDaysWorked > 0 ? totalHoursWorked / totalDaysWorked : 0;
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
exports.getEmployeeAnalytics = getEmployeeAnalytics;
const getFullEmployeeDetails = async (employeeId) => {
    // 1. Fetch the employee and all related data in one query
    const employee = await client_1.prisma.employee.findUnique({
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
        throw new apiError_1.ApiError(404, 'Employee not found');
    }
    // 2. Fetch all leave records
    const leaveHistory = await client_1.prisma.leave.findMany({
        where: { employeeId },
        orderBy: { startDate: 'desc' },
    });
    // 3. Fetch today's attendance and calculate total work time
    const today = new Date();
    const todaysAttendance = await client_1.prisma.attendance.findMany({
        where: {
            employeeId,
            checkIn: {
                gte: (0, date_fns_1.startOfDay)(today),
                lte: (0, date_fns_1.endOfDay)(today),
            },
        },
        orderBy: { checkIn: 'asc' },
    });
    const totalHoursToday = todaysAttendance.reduce((sum, record) => sum + (record.workingHours || 0), 0);
    // 4. Structure and return all the data
    return {
        ...employee,
        leaveHistory,
        todaysAttendance: {
            records: todaysAttendance,
            totalHoursFormatted: (0, formatDuration_1.formatDuration)(totalHoursToday),
        },
    };
};
exports.getFullEmployeeDetails = getFullEmployeeDetails;
const getEmployeeAttendanceAnalytics = async (employeeId) => {
    const allAttendance = await client_1.prisma.attendance.findMany({
        where: { employeeId, workingHours: { not: null } },
        orderBy: { checkIn: 'desc' },
    });
    // Group data by year, month, and week
    const analytics = allAttendance.reduce((acc, record) => {
        const year = (0, date_fns_2.getYear)(record.checkIn);
        const month = (0, date_fns_2.getMonth)(record.checkIn); // 0-11
        const week = (0, date_fns_2.getWeek)(record.checkIn);
        const day = (0, date_fns_2.format)(record.checkIn, 'yyyy-MM-dd');
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
    }, { byYear: {}, byMonth: {}, byWeek: {}, byDay: {} });
    // Format monthly data for charts
    const monthlyChartData = Object.entries(analytics.byMonth)
        .map(([key, hours]) => {
        const [year, month] = key.split('-');
        return {
            name: (0, date_fns_2.format)(new Date(Number(year), Number(month)), 'MMM yy'),
            hours: parseFloat(hours.toFixed(2)),
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
exports.getEmployeeAttendanceAnalytics = getEmployeeAttendanceAnalytics;
const findPotentialManagers = async () => {
    return client_1.prisma.employee.findMany({
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
exports.findPotentialManagers = findPotentialManagers;
const updateEmployeeProfile = async (employeeId, data) => {
    // 1. Separate fields belonging to the Employee model
    const { email, role, managerId, 
    // The rest of the data belongs to the Profile model
    ...profileData } = data;
    // 2. Create an object with only the defined Employee fields
    const employeeDataToUpdate = {};
    if (email)
        employeeDataToUpdate.email = email;
    if (role)
        employeeDataToUpdate.role = role;
    if (managerId !== undefined)
        employeeDataToUpdate.managerId = managerId;
    // 3. Perform the update
    return client_1.prisma.employee.update({
        where: { id: employeeId },
        data: {
            // Update Employee fields
            ...employeeDataToUpdate,
            // Update nested Profile fields
            profile: {
                update: profileData,
            },
        },
        include: {
            profile: true,
            manager: {
                select: {
                    id: true,
                    profile: { select: { firstName: true, lastName: true } },
                },
            },
        },
    });
};
exports.updateEmployeeProfile = updateEmployeeProfile;
