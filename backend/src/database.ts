import { PrismaClient, Game, LiveGameLine } from "@prisma/client";
import {
  filterActiveGames,
  filterNotStartedGames,
  scrapeListedGames,
} from "./scrape";
import { createPacificPrismaDate } from "./utils";

const prisma = new PrismaClient();

export type LiveGameLinePlus = LiveGameLine & {
  totalMinutes?: number;
  botProjectedTotal?: number;
  grade?: number;
};

export type GamePlus = Game & {
  liveGameLines: LiveGameLinePlus[];
};

function botPredictedTotal(
  currentTotalScore: number,
  currentTotalLine: number,
  closingTotalLine: number,
  minutesLeft: number
): number {
  const expectedRate = closingTotalLine / 48; // pts / minute
  // adding average 30 in to account for extra time
  return parseFloat(
    (currentTotalScore + (minutesLeft + 0.5) * expectedRate).toFixed(2)
  );
}

function getTotalMinutes(quarter: number, minute: number): number {
  const minutesPlayedInQuarter = 12 - minute;
  const oldQuarterMinues = (quarter - 1) * 12;

  return minutesPlayedInQuarter + oldQuarterMinues;
}

function addBettingData(game: GamePlus): GamePlus {
  game.liveGameLines = game.liveGameLines.map((line) => {
    const totalMinutes = getTotalMinutes(line.quarter, line.minute);
    const botProjectedTotal = botPredictedTotal(
      line.awayScore + line.homeScore,
      line.totalLine,
      game.closingTotalLine,
      48 - totalMinutes
    );
    return {
      ...line,
      totalMinutes,
      botProjectedTotal,
      grade: parseFloat((botProjectedTotal - line.totalLine).toFixed(2)),
    };
  });

  return game;
}

export async function getAllTodaysGames() {
  const games = await prisma.game.findMany({
    where: {
      date: createPacificPrismaDate(),
    },
    include: {
      liveGameLines: true,
    },
  });
  console.log("xxx", games.length);
  return games.map(addBettingData);
}

export async function updateData() {
  const allListedGames = await scrapeListedGames();
  const scheduledGames = filterNotStartedGames(allListedGames);

  for await (const scheduledGame of scheduledGames) {
    const matching = await prisma.game.findFirst({
      where: {
        homeTeam: scheduledGame.homeTeam,
        awayTeam: scheduledGame.awayTeam,
        date: createPacificPrismaDate(),
      },
    });
    if (scheduledGame.awayLine && scheduledGame.overLine) {
      if (!matching) {
        await prisma.game.create({
          data: {
            awayTeam: scheduledGame.awayTeam,
            homeTeam: scheduledGame.homeTeam,
            date: createPacificPrismaDate(),
            closingAwayLine: scheduledGame.awayLine,
            closingTotalLine: scheduledGame.overLine,
          },
        });
      } else {
        await prisma.game.update({
          where: { id: matching.id },
          data: {
            closingAwayLine: scheduledGame.awayLine,
            closingTotalLine: scheduledGame.overLine,
          },
        });
      }
    }
  }

  const activeGames = filterActiveGames(allListedGames);

  console.log("found active games:", activeGames.length);
  for await (const activeGame of activeGames) {
    const matching = await prisma.game.findFirst({
      where: {
        homeTeam: activeGame.homeTeam,
        awayTeam: activeGame.awayTeam,
        date: createPacificPrismaDate(),
      },
    });

    if (
      matching &&
      activeGame.awayLine &&
      activeGame.overLine &&
      activeGame.quarter !== undefined &&
      activeGame.minute !== undefined &&
      activeGame.awayScore !== undefined &&
      activeGame.homeScore !== undefined
    ) {
      await prisma.liveGameLine.create({
        data: {
          gameId: matching.id,
          awayLine: activeGame.awayLine,
          totalLine: activeGame.overLine,
          quarter: activeGame.quarter,
          minute: activeGame.minute,
          awayScore: activeGame.awayScore,
          homeScore: activeGame.homeScore,
        },
      });
    }
  }
}
