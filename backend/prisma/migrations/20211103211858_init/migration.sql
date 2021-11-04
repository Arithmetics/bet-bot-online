-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "awayTeam" VARCHAR(255) NOT NULL,
    "homeTeam" VARCHAR(255) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveGameLine" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "awayLine" INTEGER NOT NULL,
    "overLine" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "homeScore" INTEGER NOT NULL,

    CONSTRAINT "LiveGameLine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LiveGameLine" ADD CONSTRAINT "LiveGameLine_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
