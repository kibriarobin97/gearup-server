-- DropForeignKey
ALTER TABLE "rental_orders" DROP CONSTRAINT "rental_orders_gearId_fkey";

-- AddForeignKey
ALTER TABLE "rental_orders" ADD CONSTRAINT "rental_orders_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "gear_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
