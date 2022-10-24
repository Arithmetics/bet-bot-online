-- CreateEnum
CREATE TYPE "BetType" AS ENUM ('TOTAL', 'ATS');

-- CreateTable
CREATE TABLE "LiveBet" (
    "id" SERIAL NOT NULL,
    "liveGameLineId" INTEGER NOT NULL,
    "betType" "BetType" NOT NULL,
    "unitSize" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "LiveBet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LiveBet" ADD CONSTRAINT "LiveBet_liveGameLineId_fkey" FOREIGN KEY ("liveGameLineId") REFERENCES "LiveGameLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
