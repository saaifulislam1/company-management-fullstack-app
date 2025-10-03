//@ts-nocheck
import { PrismaClient, Department, UserRole } from '@prisma/client';
import { hashPassword } from '../src/utils/password';
import { faker } from '@faker-js/faker';
import {
  subDays,
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  format,
} from 'date-fns';

const prisma = new PrismaClient();

// --- HELPER FUNCTIONS ---

/** Generates a random time for a given date within a specified hour range. */
const randomTime = (date: Date, startHour: number, endHour: number) => {
  const hour = faker.number.int({ min: startHour, max: endHour - 1 });
  const minute = faker.number.int({ min: 0, max: 59 });
  return setSeconds(setMinutes(setHours(date, hour), minute), 0);
};

// --- MAIN SEEDING LOGIC ---

async function main() {
  console.log(`🔥 Starting the seeding process...`);

  // 1. --- CLEAN UP THE DATABASE ---
  // This ensures a fresh start every time you run the seed.
  console.log('🧹 Cleaning old data...');
  // The order is important to avoid foreign key constraint errors.
  await prisma.attendance.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.employee.deleteMany({
    where: {
      email: { not: 'admin@example.com' }, // Keep the main admin if they exist
    },
  });
  await prisma.profile.deleteMany({
    where: {
      employee: {
        email: { not: 'admin@example.com' },
      },
    },
  });
  console.log('✅ Old data cleaned.');

  // 2. --- DEFINE THE COMPANY STRUCTURE ---
  // We'll create users and then link them in a second pass.
  const usersToCreate = [
    // Top Level
    {
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      department: Department.ADMIN,
    },
    // Managers reporting to Admin
    {
      email: 'manager.eng@example.com',
      role: UserRole.MANAGER,
      department: Department.ENGINEERING,
      managerEmail: 'admin@example.com',
    },
    {
      email: 'manager.hr@example.com',
      role: UserRole.HR,
      department: Department.HR,
      managerEmail: 'admin@example.com',
    },
    // Employees
    {
      email: 'dev1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.SOFTWARE,
      managerEmail: 'manager.eng@example.com',
    },
    {
      email: 'dev2@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.SOFTWARE,
      managerEmail: 'manager.eng@example.com',
    },
    {
      email: 'qa1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.ENGINEERING,
      managerEmail: 'manager.eng@example.com',
    },
    {
      email: 'hr1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.HR,
      managerEmail: 'manager.hr@example.com',
    },
    {
      email: 'sales1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.SALES,
      managerEmail: 'admin@example.com',
    },
    {
      email: 'marketing1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.MARKETING,
      managerEmail: 'admin@example.com',
    },
    {
      email: 'accountant1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.ACCOUNTING,
      managerEmail: 'admin@example.com',
    },
    {
      email: 'intern1@example.com',
      role: UserRole.INTERN,
      department: Department.INTERN,
      managerEmail: 'manager.eng@example.com',
    },
  ];

  // 3. --- CREATE ALL EMPLOYEES AND PROFILES ---
  console.log('Creating employee and profile records...');
  const hashedPassword = await hashPassword('password1');
  const createdEmployees = [];

  for (const userData of usersToCreate) {
    const employee = await prisma.employee.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        profile: {
          create: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            department: userData.department,
            dateOfJoining: faker.date.past({ years: 3 }),
            vacationBalance: 20,
            sickLeaveBalance: 10,
          },
        },
      },
    });
    createdEmployees.push({ ...employee, managerEmail: userData.managerEmail });
  }
  console.log(`✅ ${createdEmployees.length} employees created.`);

  // 4. --- LINK MANAGERS TO EMPLOYEES ---
  console.log('Linking managers to subordinates...');
  for (const employee of createdEmployees) {
    if (employee.managerEmail) {
      const manager = await prisma.employee.findUnique({
        where: { email: employee.managerEmail },
      });
      if (manager) {
        await prisma.employee.update({
          where: { id: employee.id },
          data: { managerId: manager.id },
        });
      }
    }
  }
  console.log('✅ Manager hierarchy linked.');

  // 5. --- GENERATE REALISTIC DATA FOR EACH EMPLOYEE ---
  console.log('Generating attendance and leave records for all employees...');
  const allEmployees = await prisma.employee.findMany();
  let totalAttendance = 0;
  let totalLeaves = 0;

  for (const employee of allEmployees) {
    const leaveRecordsToCreate = [];
    const attendanceRecordsToCreate = [];
    const datesWithLeave = new Set<string>();
    const today = new Date();

    // Generate ~5 leave requests per employee for the last year
    for (let i = 0; i < 5; i++) {
      const startDate = faker.date.past({ months: 12 });
      const leaveDuration = faker.number.int({ min: 1, max: 4 });
      const endDate = addDays(startDate, leaveDuration);
      const status = faker.helpers.arrayElement([
        'APPROVED',
        'PENDING',
        'REJECTED',
      ] as const);

      // If leave is approved, block out those dates for attendance
      if (status === 'APPROVED') {
        for (let d = 0; d <= leaveDuration; d++) {
          datesWithLeave.add(format(addDays(startDate, d), 'yyyy-MM-dd'));
        }
      }
      leaveRecordsToCreate.push({
        employeeId: employee.id,
        leaveType: faker.helpers.arrayElement(['VACATION', 'SICK']),
        startDate,
        endDate,
        reason: faker.lorem.sentence(),
        status,
      });
    }

    // Generate attendance for the last ~6 months (approx 180 days)
    for (let i = 0; i < 180; i++) {
      const date = subDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();

      // Skip weekends, leave days, and some random days
      if (
        dayOfWeek === 6 ||
        dayOfWeek === 0 ||
        datesWithLeave.has(dateString) ||
        Math.random() < 0.15
      ) {
        continue;
      }

      // Simulate 1 to 3 work sessions per day
      const sessions = faker.number.int({ min: 1, max: 3 });
      let lastCheckOut = randomTime(date, 9, 10); // First check-in

      for (let j = 0; j < sessions; j++) {
        const checkIn = lastCheckOut;
        const workDurationHours = faker.number.float({
          min: 1,
          max: 4.5,
          precision: 0.1,
        });
        const checkOut = new Date(
          checkIn.getTime() + workDurationHours * 60 * 60 * 1000,
        );

        attendanceRecordsToCreate.push({
          employeeId: employee.id,
          checkIn,
          checkOut,
          workingHours: workDurationHours,
        });

        const breakDurationMs =
          faker.number.int({ min: 30, max: 90 }) * 60 * 1000;
        lastCheckOut = new Date(checkOut.getTime() + breakDurationMs);
      }
    }

    // Create records for the current employee
    await prisma.leave.createMany({ data: leaveRecordsToCreate });
    await prisma.attendance.createMany({ data: attendanceRecordsToCreate });
    totalLeaves += leaveRecordsToCreate.length;
    totalAttendance += attendanceRecordsToCreate.length;
  }

  console.log(`✅ Seeding finished successfully!`);
  console.log(`- Total Employees: ${allEmployees.length}`);
  console.log(`- Total Leave Records: ${totalLeaves}`);
  console.log(`- Total Attendance Records: ${totalAttendance}`);
}

main()
  .catch((e) => {
    console.error('❌ An error occurred during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
