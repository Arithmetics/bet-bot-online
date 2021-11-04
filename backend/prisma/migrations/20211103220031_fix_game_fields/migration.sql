/*
  Warnings:

  - You are about to drop the column `overLine` on the `LiveGameLine` table. All the data in the column will be lost.
  - Added the required column `closingAwayLine` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `closingTotalLine` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLine` to the `LiveGameLine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "closingAwayLine" INTEGER NOT NULL,
ADD COLUMN     "closingTotalLine" INTEGER NOT NULL,
ADD COLUMN     "date" DATE NOT NULL;

-- AlterTable
ALTER TABLE "LiveGameLine" DROP COLUMN "overLine",
ADD COLUMN     "totalLine" INTEGER NOT NULL;
