/*
  Warnings:

  - You are about to drop the column `rating` on the `reviews` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rental_orders" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "rating",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
