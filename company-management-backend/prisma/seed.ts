// @ts-nocheck

import { PrismaClient, Department, UserRole } from '@prisma/client';
import { hashPassword } from '../src/utils/password'; // Assuming this path is correct

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Hash the admin password
  const hashedPassword = await hashPassword('saiful1');

  // Use `upsert` to create the admin user only if they don't exist
  const admin = await prisma.employee.upsert({
    where: { email: 'admin@example.com' },
    update: {}, // Do nothing if the user already exists
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          dateOfJoining: new Date(),
          department: Department.ADMIN,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log(`Seeding finished. Created admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
