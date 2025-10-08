import {
  PrismaClient,
  Department,
  UserRole,
  LeaveStatus,
} from '@prisma/client';
import { hashPassword } from '@/utils/password';
import {
  subDays,
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  format,
  subYears,
} from 'date-fns';

const prisma = new PrismaClient();

// --- HELPER FUNCTIONS (No Faker) ---

/** Generates a random integer between min (inclusive) and max (inclusive). */
const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Selects a random element from an array. */
const getRandomElement = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// --- MAIN SEEDING LOGIC ---

async function main() {
  console.log(`🔥 Starting the seeding process (without faker)...`);

  // 1. --- CLEAN UP THE DATABASE ---
  console.log('🧹 Cleaning old data...');
  await prisma.attendance.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.employee.deleteMany();
  console.log('✅ Old data cleaned successfully.');

  // 2. --- DEFINE THE COMPANY STRUCTURE ---
  const companyStructure = [
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
      email: 'dev1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.SOFTWARE,
      managerEmail: 'eng.manager@example.com',
      firstName: 'Dev',
      lastName: 'One',
    },
    {
      email: 'dev2@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.SOFTWARE,
      managerEmail: 'eng.manager@example.com',
      firstName: 'Dev',
      lastName: 'Two',
    },
    {
      email: 'qa1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.ENGINEERING,
      managerEmail: 'eng.manager@example.com',
      firstName: 'Tess',
      lastName: 'Tur',
    },
    {
      email: 'hr1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.HR,
      managerEmail: 'hr.manager@example.com',
      firstName: 'Rec',
      lastName: 'Ruter',
    },
    {
      email: 'sales1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.SALES,
      managerEmail: 'sales.manager@example.com',
      firstName: 'Rep',
      lastName: 'One',
    },
    {
      email: 'marketing1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.MARKETING,
      managerEmail: 'admin@example.com',
      firstName: 'Mark',
      lastName: 'Ketter',
    },
    {
      email: 'accountant1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.ACCOUNTING,
      managerEmail: 'admin@example.com',
      firstName: 'Count',
      lastName: 'Er',
    },
    {
      email: 'intern1@example.com',
      role: UserRole.EMPLOYEE,
      department: Department.INTERN,
      managerEmail: 'eng.manager@example.com',
      firstName: 'New',
      lastName: 'Bie',
    },
  ];

  // 3. --- CREATE ALL EMPLOYEES AND PROFILES ---
  console.log(
    `👤 Creating ${companyStructure.length} employee and profile records...`,
  );
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
            firstName: userData.firstName,
            lastName: userData.lastName,
            department: userData.department,
            dateOfJoining: subYears(new Date(), getRandomInt(1, 3)),
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
        const updatedEmployee = await prisma.employee.update({
          where: { id: employee.id },
          data: { managerId: manager.id },
        });
        employeeMap.set(employee.email, { ...employee, ...updatedEmployee });
      }
    }
  }
  console.log('✅ Manager hierarchy linked.');

  // 5. --- GENERATE DATA FOR EACH EMPLOYEE ---
  console.log(
    '📊 Generating attendance and leave records for all employees...',
  );
  const allLeaveRecords = [];
  const allAttendanceRecords = [];
  const today = new Date();

  for (const employee of employeeMap.values()) {
    const datesWithLeave = new Set<string>();

    // Generate ~5 leave requests per employee
    for (let i = 0; i < 5; i++) {
      const startDate = subDays(today, getRandomInt(10, 365));
      const leaveDuration = getRandomInt(1, 3);
      const endDate = addDays(startDate, leaveDuration);

      const managerStatus = getRandomElement([
        LeaveStatus.APPROVED,
        LeaveStatus.PENDING,
        LeaveStatus.REJECTED,
      ]);
      const adminStatus =
        managerStatus === 'APPROVED'
          ? getRandomElement([LeaveStatus.APPROVED, LeaveStatus.REJECTED, null])
          : null;

      if (adminStatus === 'APPROVED') {
        for (let d = 0; d < leaveDuration; d++) {
          datesWithLeave.add(format(addDays(startDate, d), 'yyyy-MM-dd'));
        }
      }
      allLeaveRecords.push({
        employeeId: employee.id,
        leaveType: getRandomElement(['VACATION', 'SICK']),
        startDate,
        endDate,
        reason: 'Personal time off request.',
        managerStatus,
        adminStatus,
        approvedById: employee.managerId,
      });
    }

    // Generate attendance for the last year (365 days)
    for (let i = 0; i < 365; i++) {
      const date = subDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();

      if (
        dayOfWeek === 6 ||
        dayOfWeek === 0 ||
        datesWithLeave.has(dateString) ||
        Math.random() < 0.15
      )
        continue;

      const sessions = getRandomInt(1, 3);
      let lastCheckOut = new Date(setHours(date, getRandomInt(9, 10)));

      for (let j = 0; j < sessions; j++) {
        const checkIn = lastCheckOut;
        const workDurationHours = Math.random() * 3.5 + 1;
        const checkOut = new Date(
          checkIn.getTime() + workDurationHours * 60 * 60 * 1000,
        );
        allAttendanceRecords.push({
          employeeId: employee.id,
          checkIn,
          checkOut,
          workingHours: workDurationHours,
        });

        const breakDurationMs = getRandomInt(30, 90) * 60 * 1000;
        lastCheckOut = new Date(checkOut.getTime() + breakDurationMs);
      }
    }
  }

  // 6. --- PERFORM BULK DATABASE INSERT ---
  console.log(
    `💾 Inserting ${allLeaveRecords.length} leave records and ${allAttendanceRecords.length} attendance records...`,
  );
  await prisma.leave.createMany({ data: allLeaveRecords });
  await prisma.attendance.createMany({ data: allAttendanceRecords });

  console.log(`\n🎉 Seeding finished successfully!`);
  console.log(`- Default Password for all users: "password123"`);
}

main()
  .catch((e) => {
    console.error('❌ An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
