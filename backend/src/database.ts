import { PrismaClient, Game, LiveGameLine } from "@prisma/client";
import {
  getESPNGames,
  ESPNStatusEnum,
  findMatchingScoreboardScore,
  ESPNGameReduced,
} from "./espn";
import { scrapeScoreboardGames, LiveGame } from "./scrape";
import { createPacificPrismaDate } from "./utils";

const prisma = new PrismaClient();

export type LiveGameLinePlus = LiveGameLine & {
  totalMinutes?: number;
  botProjectedTotal?: number;
  grade?: number;
};

export type GamePlus = Game & {
  liveGameLines: LiveGameLinePlus[];
  isStale?: boolean;
};

function botPredictedTotal(
  currentTotalScore: number,
  closingTotalLine: number,
  minutesLeft: number
): number {
  const expectedRate = closingTotalLine / 48; // pts / minute
  return parseFloat(
    (currentTotalScore + minutesLeft * expectedRate).toFixed(2)
  );
}

function getTotalMinutes(quarter: number, minute: number): number {
  const minutesPlayedInQuarter = 12 - minute;
  const oldQuarterMinutes = (quarter - 1) * 12;

  return minutesPlayedInQuarter + oldQuarterMinutes;
}

function addBettingData(game: GamePlus): GamePlus {
  game.liveGameLines = game.liveGameLines.map((line) => {
    const totalMinutes = getTotalMinutes(line.quarter, line.minute);
    const botProjectedTotal = botPredictedTotal(
      line.awayScore + line.homeScore,
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

  return { ...game, isStale: false };
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

async function updateCompletedGame(
  espnGame: ESPNGameReduced,
  matchingDBGame: Game | null
): Promise<void> {
  if (!matchingDBGame) {
    console.log(
      `ERROR: Found completed ESPN game with no matching DB game: ${espnGame.awayTeam} vs ${espnGame.homeTeam}`
    );
    return;
  }
  await prisma.game.update({
    where: { id: matchingDBGame.id },
    data: {
      finalAwayScore: espnGame.awayScore,
      finalHomeScore: espnGame.homeScore,
    },
  });
}

async function updatedPendingGame(
  scoreboardGame: LiveGame,
  matchingDBGame: Game | null
): Promise<void> {
  if (!scoreboardGame.awayLine || !scoreboardGame.overLine) {
    return;
  }

  if (!matchingDBGame) {
    await prisma.game.create({
      data: {
        awayTeam: scoreboardGame.awayTeam,
        homeTeam: scoreboardGame.homeTeam,
        date: createPacificPrismaDate(),
        closingAwayLine: scoreboardGame.awayLine,
        closingTotalLine: scoreboardGame.overLine,
      },
    });
    return;
  }

  await prisma.game.update({
    where: { id: matchingDBGame.id },
    data: {
      closingAwayLine: scoreboardGame.awayLine,
      closingTotalLine: scoreboardGame.overLine,
    },
  });
}

async function updateOngoingGame(
  espnGame: ESPNGameReduced,
  scoreboardGame: LiveGame,
  matchingDBGame: Game | null
): Promise<void> {
  if (!matchingDBGame) {
    console.log(
      `ERROR: Found ongoing ESPN game with no matching DB game: ${espnGame.awayTeam} vs ${espnGame.homeTeam}`
    );
    return;
  }

  const minute = Math.round((espnGame.secondsRemaining * 100) / 60) / 100;

  if (
    scoreboardGame.awayLine &&
    scoreboardGame.overLine &&
    scoreboardGame.quarter !== undefined &&
    scoreboardGame.minute !== undefined &&
    scoreboardGame.awayScore !== undefined &&
    scoreboardGame.homeScore !== undefined
  ) {
    await prisma.liveGameLine.create({
      data: {
        gameId: matchingDBGame.id,
        awayLine: scoreboardGame.awayLine,
        totalLine: scoreboardGame.overLine,
        quarter: espnGame.quarter,
        minute,
        awayScore: espnGame.awayScore,
        homeScore: espnGame.homeScore,
      },
    });
  }
}

export async function updateData() {
  const [allScoreboardGames, allESPNGames] = await Promise.all([
    scrapeScoreboardGames(),
    getESPNGames(),
  ]);

  // new cycle
  for await (const espnGame of allESPNGames) {
    const matchingScoreboardGame = findMatchingScoreboardScore(
      espnGame,
      allScoreboardGames
    );

    let matchingDBGame: Game | null = null;

    if (matchingScoreboardGame) {
      matchingDBGame = await prisma.game.findFirst({
        where: {
          homeTeam: matchingScoreboardGame.homeTeam,
          awayTeam: matchingScoreboardGame.awayTeam,
          date: createPacificPrismaDate(),
        },
      });
    }

    if (espnGame.status === ESPNStatusEnum.STATUS_SCHEDULED) {
      // game hasnt started
      if (!matchingScoreboardGame) {
        console.log(
          `Couldn't find a matching Scoreboard listing for ESPN Game: ${espnGame.awayTeam}, ${espnGame.homeTeam}`
        );
        continue;
      }
      await updatedPendingGame(matchingScoreboardGame, matchingDBGame);
    } else if (
      espnGame.status === ESPNStatusEnum.STATUS_IN_PROGRESS ||
      espnGame.status === ESPNStatusEnum.STATUS_HALFTIME
    ) {
      if (!matchingScoreboardGame) {
        console.log(
          `Couldn't find a matching Scoreboard listing for ESPN Game: ${espnGame.awayTeam}, ${espnGame.homeTeam}`
        );
        continue;
      }
      await updateOngoingGame(espnGame, matchingScoreboardGame, matchingDBGame);
      // game in progress
    } else if (espnGame.status === ESPNStatusEnum.STATUS_FINAL) {
      // game complete
      console.log("final game");
      await updateCompletedGame(espnGame, matchingDBGame);
    }
  }
}
