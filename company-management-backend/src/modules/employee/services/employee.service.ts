import { prisma } from '@/prisma/client';
import { ApiError } from '@/utils/apiError';
import { hashPassword } from '@/utils/password';
import { Prisma, Profile } from '@prisma/client';

/**
 * @async
 * @function registerEmployee
 * @description Creates a new employee and their profile in a single transaction.
 * @param {Prisma.EmployeeCreateInput & { profile: Omit<Profile, 'id' | 'employeeId'> }} data
 * @returns {Promise<object>} The newly created employee object without the password.
 */
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
        employeeId: employee.id, // Link the profile to the new employee
      },
    });

    return employee;
  });

  // 4. Return the new employee, omitting the password for security
  const { password: _, ...employeeWithoutPassword } = newEmployee;
  return employeeWithoutPassword;
};

/**
 * @async
 * @function getEmployeeProfile
 * @description Fetches the profile for a given employee ID.
 * @param {string} employeeId - The ID of the employee.
 * @returns {Promise<object>} The employee's data including their profile.
 */
export const getEmployeeProfile = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      profile: true, // Eagerly load the related profile data
    },
  });

  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  const { password: _, ...employeeWithoutPassword } = employee;
  return employeeWithoutPassword;
};

/**
 * @async
 * @function updateEmployeeProfile
 * @description Updates an employee's profile.
 * @param {string} employeeId - The ID of the employee whose profile is to be updated.
 * @param {Prisma.ProfileUpdateInput} data - The data to update.
 * @returns {Promise<Profile>} The updated profile object.
 */
export const updateEmployeeProfile = async (
  employeeId: string,
  data: Prisma.ProfileUpdateInput,
) => {
  return prisma.profile.update({
    where: { employeeId: employeeId },
    data,
  });
};
