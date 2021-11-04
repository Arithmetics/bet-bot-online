import { PrismaClient, Prisma } from "@prisma/client";
import {
  filterActiveGames,
  filterNotStartedGames,
  scrapeListedGames,
} from "./scrape";

const prisma = new PrismaClient();

async function getAGame(id: number) {
  return await prisma.game.findFirst({
    where: {
      id,
    },
    include: {
      liveGameLines: true,
    },
  });
}

export async function getAllTodaysGames() {
  return await prisma.game.findMany({
    where: {
      date: new Date(),
    },
    include: {
      liveGameLines: true,
    },
  });
}

export type GameWithLines = Prisma.PromiseReturnType<typeof getAGame>;

export async function updateData() {
  const allListedGames = await scrapeListedGames();
  const scheduledGames = filterNotStartedGames(allListedGames);

  for await (const scheduledGame of scheduledGames) {
    const matching = await prisma.game.findFirst({
      where: {
        homeTeam: scheduledGame.homeTeam,
        awayTeam: scheduledGame.awayTeam,
        date: new Date(),
      },
    });
    if (scheduledGame.awayLine && scheduledGame.overLine) {
      if (!matching) {
        await prisma.game.create({
          data: {
            awayTeam: scheduledGame.awayTeam,
            homeTeam: scheduledGame.homeTeam,
            date: new Date(),
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
