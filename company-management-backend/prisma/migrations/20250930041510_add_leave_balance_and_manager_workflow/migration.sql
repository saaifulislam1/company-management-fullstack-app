-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "managerId" TEXT;

-- AlterTable
ALTER TABLE "public"."Leave" ADD COLUMN     "approvedById" TEXT;

-- AlterTable
ALTER TABLE "public"."Profile" ADD COLUMN     "sickLeaveBalance" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "vacationBalance" DOUBLE PRECISION NOT NULL DEFAULT 20;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
