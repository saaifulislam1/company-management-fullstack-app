/*
  Warnings:

  - You are about to drop the column `status` on the `Leave` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Leave" DROP COLUMN "status",
ADD COLUMN     "adminStatus" "public"."LeaveStatus",
ADD COLUMN     "managerStatus" "public"."LeaveStatus" NOT NULL DEFAULT 'PENDING';
