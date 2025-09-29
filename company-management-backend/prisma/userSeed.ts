//@ts-nocheck
import { PrismaClient, Department, UserRole } from '@prisma/client';
import { hashPassword } from '../src/utils/password';
import { subDays, addDays, setHours, setMinutes, setSeconds } from 'date-fns';

const prisma = new PrismaClient();

// Helper to create random times within a given hour range
const randomTime = (date: Date, startHour: number, endHour: number) => {
  const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
  const minute = Math.floor(Math.random() * 60);
  return setSeconds(setMinutes(setHours(date, hour), minute), 0);
};

async function main() {
  console.log(`Start seeding 30 days of data...`);

  const targetEmail = 'saiful@gmail.com';

  // 1. Create a test employee if they don't exist
  const hashedPassword = await hashPassword('saifulislam1');
  const employee = await prisma.employee.upsert({
    where: { email: targetEmail },
    update: {},
    create: {
      email: targetEmail,
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
      profile: {
        create: {
          firstName: 'Test',
          lastName: 'Employee',
          department: Department.SOFTWARE,
          dateOfJoining: subDays(new Date(), 40), // Joined 40 days ago
        },
      },
    },
  });
  console.log(`Upserted test employee: ${employee.email}`);

  // 2. Clean up old data for this employee
  await prisma.attendance.deleteMany({ where: { employeeId: employee.id } });
  await prisma.leave.deleteMany({ where: { employeeId: employee.id } });
  console.log('Cleaned old attendance and leave data.');

  const leaveRecordsToCreate = [];
  const attendanceRecordsToCreate = [];
  const datesWithLeave = new Set<string>();
  const today = new Date();

  // 3. Generate Leave Data for the last 30 days
  for (let i = 0; i < 3; i++) {
    // Create 3 random leave records
    const startDate = subDays(today, Math.floor(Math.random() * 30));
    const leaveDuration = Math.floor(Math.random() * 3) + 1; // 1 to 3 days
    const endDate = addDays(startDate, leaveDuration - 1);

    // Mark these dates as leave days to avoid creating attendance records
    for (let d = 0; d < leaveDuration; d++) {
      datesWithLeave.add(format(addDays(startDate, d), 'yyyy-MM-dd'));
    }

    leaveRecordsToCreate.push({
      employeeId: employee.id,
      leaveType: Math.random() > 0.5 ? 'Vacation' : 'Sick Leave',
      startDate,
      endDate,
      reason: 'Personal time off.',
      status: ['APPROVED', 'PENDING', 'REJECTED'][
        Math.floor(Math.random() * 3)
      ] as any,
    });
  }

  // 4. Generate Attendance Data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    // Skip weekends (Saturday=6, Sunday=0) and days with leave
    if (dayOfWeek === 6 || dayOfWeek === 0 || datesWithLeave.has(dateString)) {
      continue;
    }

    // Simulate 1 to 3 work sessions per day
    const sessions = Math.floor(Math.random() * 3) + 1;
    let lastCheckOut = randomTime(date, 9, 10); // First check-in of the day

    for (let j = 0; j < sessions; j++) {
      const checkIn = lastCheckOut;
      const workDurationHours = Math.random() * 3 + 1; // Work for 1 to 4 hours per session
      const checkOut = new Date(
        checkIn.getTime() + workDurationHours * 60 * 60 * 1000,
      );

      attendanceRecordsToCreate.push({
        employeeId: employee.id,
        checkIn,
        checkOut,
        workingHours: workDurationHours,
      });

      // Simulate a break of 30 mins to 1.5 hours before next check-in
      const breakDurationMs = (Math.random() * 60 + 30) * 60 * 1000;
      lastCheckOut = new Date(checkOut.getTime() + breakDurationMs);
    }
  }

  // 5. Create all records in the database
  await prisma.leave.createMany({ data: leaveRecordsToCreate });
  await prisma.attendance.createMany({ data: attendanceRecordsToCreate });

  console.log(
    `Seeding finished. Generated ${leaveRecordsToCreate.length} leave records and ${attendanceRecordsToCreate.length} attendance records.`,
  );
}

// Helper to format date to yyyy-MM-dd string
import { format } from 'date-fns';

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
