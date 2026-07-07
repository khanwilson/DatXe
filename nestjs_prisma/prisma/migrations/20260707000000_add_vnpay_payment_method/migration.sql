-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'VNPAY';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "vehicle_type" TEXT;
