-- Decouple payment state from booking state: payment lives in the Payment table
-- (PaymentStatus), so PAYMENT_PENDING / PAYMENT_COMPLETED no longer belong on
-- BookingStatus. Remap any existing rows off those values, then drop them.

-- Remap rows still on the payment values. PAYMENT_COMPLETED meant "paid, waiting
-- for dispatch"; the paid fact is on the Payment row, so PENDING is the correct
-- booking lifecycle value. PAYMENT_PENDING was never written in practice.
UPDATE "bookings" SET "status" = 'PENDING'
  WHERE "status" IN ('PAYMENT_PENDING', 'PAYMENT_COMPLETED');

-- AlterEnum: rebuild BookingStatus without the payment values.
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM (
  'PENDING', 'CONFIRMED', 'ACCEPTED', 'DRIVER_ARRIVING', 'IN_PROGRESS',
  'COMPLETED', 'CANCELLED', 'NO_SHOW',
  'LOOKING_DRIVER', 'NO_DRIVER', 'DRIVER_ARRIVED',
  'CANCELLED_BY_USER', 'CANCELLED_BY_DRIVER', 'AWAITING_USER_DECISION'
);
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus_new"
  USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
