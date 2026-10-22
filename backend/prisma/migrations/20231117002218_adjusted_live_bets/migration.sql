/*
  Warnings:

  - Added the required column `choice` to the `LiveBet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placedLine` to the `LiveBet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BetChoice" AS ENUM ('UNDER', 'OVER');

-- AlterTable
ALTER TABLE "LiveBet" ADD COLUMN     "choice" "BetChoice" NOT NULL,
ADD COLUMN     "placedLine" DOUBLE PRECISION NOT NULL;
