//@ts-nocheck
import {
  PrismaClient,
  Department,
  UserRole,
  LeaveStatus,
} from '@prisma/client';
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
const randomTime = (date: Date, startHour: number, endHour: number): Date => {
  const hour = faker.number.int({ min: startHour, max: endHour - 1 });
  const minute = faker.number.int({ min: 0, max: 59 });
  return setSeconds(setMinutes(setHours(date, hour), minute), 0);
};

// --- MAIN SEEDING LOGIC ---

async function main() {
  console.log(`🔥 Starting the comprehensive seeding process...`);

  // 1. --- CLEAN UP THE DATABASE ---
  console.log('🧹 Cleaning old data...');
  await prisma.attendance.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.employee.deleteMany();
  console.log('✅ Old data cleaned successfully.');

  // 2. --- DEFINE THE COMPANY STRUCTURE (21 Employees) ---
  const companyStructure = [
    // Top Level
    {
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      department: Department.ADMIN,
      managerEmail: null,
      firstName: 'Super',
      lastName: 'Admin',
    },
    {
      email: 'hr.manager@example.com',
      role: UserRole.HR,
      department: Department.HR,
      managerEmail: 'admin@example.com',
      firstName: 'Harriet',
      lastName: 'Rosso',
    },

    // Managers
    {
      email: 'eng.manager@example.com',
      role: UserRole.MANAGER,
      department: Department.ENGINEERING,
      managerEmail: 'admin@example.com',
      firstName: 'Edward',
      lastName: 'Gineer',
    },
    {
      email: 'sales.manager@example.com',
      role: UserRole.MANAGER,
      department: Department.SALES,
      managerEmail: 'admin@example.com',
      firstName: 'Sally',
      lastName: 'Saleswoman',
    },
    {
      email: 'marketing.manager@example.com',
      role: UserRole.MANAGER,
      department: Department.MARKETING,
      managerEmail: 'admin@example.com',
      firstName: 'Mark',
      lastName: 'Ketter',
    },

    // Teams
    ...Array.from({ length: 5 }, () => ({
      email: faker.internet.email(),
      role: UserRole.EMPLOYEE,
      department: Department.SOFTWARE,
      managerEmail: 'eng.manager@example.com',
    })),
    ...Array.from({ length: 2 }, () => ({
      email: faker.internet.email(),
      role: UserRole.EMPLOYEE,
      department: Department.ENGINEERING,
      managerEmail: 'eng.manager@example.com',
    })),
    ...Array.from({ length: 2 }, () => ({
      email: faker.internet.email(),
      role: UserRole.EMPLOYEE,
      department: Department.HR,
      managerEmail: 'hr.manager@example.com',
    })),
    ...Array.from({ length: 3 }, () => ({
      email: faker.internet.email(),
      role: UserRole.EMPLOYEE,
      department: Department.SALES,
      managerEmail: 'sales.manager@example.com',
    })),
    ...Array.from({ length: 2 }, () => ({
      email: faker.internet.email(),
      role: UserRole.EMPLOYEE,
      department: Department.MARKETING,
      managerEmail: 'marketing.manager@example.com',
    })),
    ...Array.from({ length: 2 }, () => ({
      email: faker.internet.email(),
      role: UserRole.EMPLOYEE,
      department: Department.ACCOUNTING,
      managerEmail: 'admin@example.com',
    })),
    {
      email: faker.internet.email(),
      role: UserRole.INTERN,
      department: Department.INTERN,
      managerEmail: 'eng.manager@example.com',
    },
  ];

  // 3. --- CREATE ALL EMPLOYEES AND PROFILES ---
  console.log('👤 Creating employee and profile records...');
  const hashedPassword = await hashPassword('password123');
  const employeeMap = new Map<string, any>();

  for (const userData of companyStructure) {
    const employee = await prisma.employee.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        profile: {
          create: {
            firstName: userData.firstName || faker.person.firstName(),
            lastName: userData.lastName || faker.person.lastName(),
            department: userData.department,
            dateOfJoining: faker.date.past({ years: 3 }),
            vacationBalance: 20,
            sickLeaveBalance: 10,
          },
        },
      },
    });
    employeeMap.set(employee.email, {
      ...employee,
      managerEmail: userData.managerEmail,
    });
  }
  console.log(`✅ ${employeeMap.size} employees created.`);

  // 4. --- LINK MANAGERS TO SUBORDINATES ---
  console.log('🔗 Linking manager hierarchy...');
  for (const employee of employeeMap.values()) {
    if (employee.managerEmail) {
      const manager = employeeMap.get(employee.managerEmail);
      if (manager) {
        await prisma.employee.update({
          where: { id: employee.id },
          data: { managerId: manager.id },
        });
      }
    }
  }
  console.log('✅ Manager hierarchy linked.');

  // 5. --- GENERATE DATA FOR EACH EMPLOYEE ---
  console.log(
    '📊 Generating attendance and leave records for all employees (this may take a moment)...',
  );
  const allEmployeesWithManager = await prisma.employee.findMany();

  for (const employee of allEmployeesWithManager) {
    const leaveRecordsToCreate = [];
    const attendanceRecordsToCreate = [];
    const datesWithLeave = new Set<string>();
    const today = new Date();

    // Generate ~10 leave requests per employee over the last 2 years
    for (let i = 0; i < 10; i++) {
      const startDate = faker.date.past({ years: 2 });
      const leaveDuration = faker.number.int({ min: 1, max: 4 });
      const endDate = addDays(startDate, leaveDuration);

      const managerStatus = faker.helpers.arrayElement([
        LeaveStatus.APPROVED,
        LeaveStatus.PENDING,
        LeaveStatus.REJECTED,
      ]);
      // Admin only acts if manager approved
      const adminStatus =
        managerStatus === 'APPROVED'
          ? faker.helpers.arrayElement([
              LeaveStatus.APPROVED,
              LeaveStatus.REJECTED,
              null,
            ])
          : null;

      if (adminStatus === 'APPROVED') {
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
        managerStatus,
        adminStatus,
        approvedById: employee.managerId,
      });
    }

    // Generate attendance for the last 2 years (730 days)
    for (let i = 0; i < 730; i++) {
      const date = subDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();

      // Skip weekends, leave days, and some random days
      if (
        dayOfWeek === 6 ||
        dayOfWeek === 0 ||
        datesWithLeave.has(dateString) ||
        Math.random() < 0.1
      ) {
        continue;
      }

      // Simulate 1 to 3 work sessions per day
      const sessions = faker.number.int({ min: 1, max: 3 });
      let lastCheckOut = randomTime(date, 9, 10);

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
          faker.number.int({ min: 30, max: 75 }) * 60 * 1000;
        lastCheckOut = new Date(checkOut.getTime() + breakDurationMs);
      }
    }

    await prisma.leave.createMany({
      data: leaveRecordsToCreate,
      skipDuplicates: true,
    });
    await prisma.attendance.createMany({
      data: attendanceRecordsToCreate,
      skipDuplicates: true,
    });
  }

  console.log(`\n🎉 Seeding finished successfully!`);
  console.log(`- Default Password for all users: "password123"`);
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
