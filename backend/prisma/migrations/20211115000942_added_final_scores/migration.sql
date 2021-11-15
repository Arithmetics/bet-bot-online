/*
  Warnings:

  - Added the required column `finalAwayScore` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalHomeScore` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "finalAwayScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "finalHomeScore" DOUBLE PRECISION NOT NULL;
