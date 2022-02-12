/*
  Warnings:

  - Added the required column `second` to the `LiveGameLine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LiveGameLine" ADD COLUMN     "second" INTEGER NOT NULL;
