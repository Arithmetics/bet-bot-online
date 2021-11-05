import { PrismaClient, Game, LiveGameLine } from "@prisma/client";
import {
  filterActiveGames,
  filterNotStartedGames,
  scrapeListedGames,
} from "./scrape";

const prisma = new PrismaClient();

export type LiveGameLinePlus = LiveGameLine & {
  totalMinutes?: number;
  botProjectedTotal?: number;
  grade?: number;
};

export type GamePlus = Game & {
  liveGameLines: LiveGameLinePlus[];
};

function getTotalMinutes(quarter: number, minute: number): number {
  const minutesPlayedInQuarter = 12 - minute;
  const oldQuarterMinues = (quarter - 1) * 12;

  return minutesPlayedInQuarter + oldQuarterMinues;
}

function addBettingData(game: GamePlus): GamePlus {
  game.liveGameLines = game.liveGameLines.map((line) => {
    return {
      ...line,
      totalMinutes: getTotalMinutes(line.quarter, line.minute),
      botProjectedTotal: 160,
    };
  });

  return game;
}

export async function getAllTodaysGames() {
  const pstDate = new Date();
  pstDate.setHours(pstDate.getHours() - 8);
  const games = await prisma.game.findMany({
    where: {
      date: pstDate,
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
    const pstDate = new Date();
    pstDate.setHours(pstDate.getHours() - 8);

    const matching = await prisma.game.findFirst({
      where: {
        homeTeam: scheduledGame.homeTeam,
        awayTeam: scheduledGame.awayTeam,
        date: pstDate,
      },
    });
    if (scheduledGame.awayLine && scheduledGame.overLine) {
      if (!matching) {
        await prisma.game.create({
          data: {
            awayTeam: scheduledGame.awayTeam,
            homeTeam: scheduledGame.homeTeam,
            date: pstDate,
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

  for await (const activeGame of activeGames) {
    const matching = await prisma.game.findFirst({
      where: {
        homeTeam: activeGame.homeTeam,
        awayTeam: activeGame.awayTeam,
        date: new Date(),
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
