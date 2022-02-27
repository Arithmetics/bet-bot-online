import { PrismaClient, Game, LiveGameLine } from "@prisma/client";
import { createPacificPrismaDate } from "./utils";
import {
  getDraftKingsListings,
  filterNotStartedGames,
  filterActiveGames,
} from "./draftKings";
import { PeriodLookup } from "./DraftKingsTypes";
import { getESPNGames, completePrismaGames } from "./espn";

const prisma = new PrismaClient();

export type LiveGameLinePlus = LiveGameLine & {
  totalMinutes?: number;
  botProjectedTotal?: number;
  grade?: number;
};

export type GamePlus = Game & {
  liveGameLines: LiveGameLinePlus[];
};

function getTotalSeconds(
  quarter: number,
  minute: number,
  second: number
): number {
  const secondsPlayedInQuarter = (12 - minute) * 60 - second;
  const oldQuarterSeconds = (quarter - 1) * 12 * 60;

  return secondsPlayedInQuarter + oldQuarterSeconds;
}

function botPredictedTotal(
  currentTotalScore: number,
  closingTotalLine: number,
  secondsLeft: number
): number {
  const expectedRatePerSecond = closingTotalLine / (48 * 60); // pts / minute

  return parseFloat(
    (currentTotalScore + secondsLeft * expectedRatePerSecond).toFixed(2)
  );
}

function addBettingData(game: GamePlus): GamePlus {
  game.liveGameLines = game.liveGameLines.map((line) => {
    const totalSeconds = getTotalSeconds(
      line.quarter,
      line.minute,
      line.second
    );

    const secondsLeftInRegulation = 48 * 60 - totalSeconds;

    const totalMinutes =
      Math.round((totalSeconds / 60 + Number.EPSILON) * 10) / 10;

    const botProjectedTotal = botPredictedTotal(
      line.awayScore + line.homeScore,
      game.closingTotalLine,
      secondsLeftInRegulation
    );

    return {
      ...line,
      totalMinutes,
      botProjectedTotal,
      grade: parseFloat((botProjectedTotal - line.totalLine).toFixed(2)),
    };
  });

  return { ...game };
}

export async function getAllTodaysGames(): Promise<GamePlus[]> {
  const games = await prisma.game.findMany({
    where: {
      date: createPacificPrismaDate(),
    },
    include: {
      liveGameLines: true,
    },
  });
  return games.map(addBettingData);
}

export async function updateFinalScore(
  id: number,
  finalAwayScore: number,
  finalHomeScore: number
): Promise<void> {
  await prisma.game.update({
    where: { id },
    data: {
      finalAwayScore,
      finalHomeScore,
    },
  });
}

export async function updateData() {
  const allListedGames = await getDraftKingsListings();
  const allEspnGames = await getESPNGames();

  const scheduledGames = filterNotStartedGames(allListedGames);

  console.log(
    "Querying Draft Kings, found scheduled games:",
    scheduledGames.length
  );
  for await (const scheduledGame of scheduledGames) {
    const matching = await prisma.game.findFirst({
      where: {
        homeTeam: scheduledGame.homeTeam,
        awayTeam: scheduledGame.awayTeam,
        date: createPacificPrismaDate(),
      },
    });
    if (scheduledGame.totalLine !== undefined) {
      if (!matching) {
        await prisma.game.create({
          data: {
            awayTeam: scheduledGame.awayTeam,
            homeTeam: scheduledGame.homeTeam,
            date: createPacificPrismaDate(),
            closingAwayLine: 99,
            closingTotalLine: scheduledGame.totalLine,
          },
        });
      } else {
        console.log("updating a pregame line:");
        console.log(
          `${scheduledGame.awayTeam}/${scheduledGame.homeTeam} from ${matching.closingTotalLine} to ${scheduledGame.totalLine}`
        );
        await prisma.game.update({
          where: { id: matching.id },
          data: {
            closingAwayLine: 99,
            closingTotalLine: scheduledGame.totalLine,
          },
        });
      }
    }
  }

  const activeGames = filterActiveGames(allListedGames);

  console.log("Scraping Draft Kings, found active games:", activeGames.length);
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
      // activeGame.awayLine &&
      activeGame.totalLine !== undefined &&
      activeGame.period !== undefined &&
      activeGame.minute !== undefined &&
      activeGame.homeTeamScore !== undefined &&
      activeGame.awayTeamScore !== undefined
    ) {
      await prisma.liveGameLine.create({
        data: {
          gameId: matching.id,
          awayLine: 99,
          totalLine: activeGame.totalLine,
          quarter: PeriodLookup[activeGame.period],
          minute: activeGame.minute,
          second: activeGame.second,
          awayScore: activeGame.awayTeamScore,
          homeScore: activeGame.homeTeamScore,
          timestamp: new Date(),
        },
      });
    }
  }

  await completePrismaGames(allEspnGames);
}
