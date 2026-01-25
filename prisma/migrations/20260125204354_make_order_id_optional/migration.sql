-- DropForeignKey
ALTER TABLE "notification_logs" DROP CONSTRAINT "notification_logs_order_id_fkey";

-- AlterTable
ALTER TABLE "notification_logs" ALTER COLUMN "order_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
