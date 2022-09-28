import { PrismaClient, Game, LiveGameLine } from "@prisma/client";
import { convertToPacificPrismaDate, createPacificPrismaDate } from "./utils";
import {
  getDraftKingsListings,
  filterNotStartedGames,
  filterActiveGames,
  filterNotTodaysGames,
} from "./draftKings";
import { PeriodLookup } from "./DraftKingsTypes";
import { getESPNGames, completePrismaGames } from "./espn";

const prisma = new PrismaClient();

export type LiveGameLinePlus = LiveGameLine & {
  totalMinutes?: number;
  botProjectedTotal?: number;
  botProjectedATS?: number;
  grade?: number;
  atsGrade?: number;
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

function botPredictedATS(
  awayScore: number,
  homeScore: number,
  closingAwayLine: number
): number {
  const factor = 0.65;
  const currentAwayTeamLead = awayScore - homeScore;
  return (
    (-1 * currentAwayTeamLead - closingAwayLine) * factor + closingAwayLine
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

    const botProjectedATS = botPredictedATS(
      line.awayScore,
      line.homeScore,
      game.closingAwayLine
    );

    return {
      ...line,
      totalMinutes,
      botProjectedTotal,
      botProjectedATS,
      grade: parseFloat((botProjectedTotal - line.totalLine).toFixed(2)),
      atsGrade: parseFloat((botProjectedATS - line.awayLine).toFixed(2)),
    };
  });

  return { ...game };
}

export async function getAllGamesBeforeToday(): Promise<GamePlus[]> {
  const games = await prisma.game.findMany({
    where: {
      date: {
        lt: createPacificPrismaDate(),
      },
    },
    include: {
      liveGameLines: true,
    },
  });
  return games.map(addBettingData);
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

export async function runDraftKingsCycle() {
  const allListedGames = await getDraftKingsListings();
  const allEspnGames = await getESPNGames();

  const todaysGames = filterNotTodaysGames(allListedGames);
  const scheduledGames = filterNotStartedGames(todaysGames);

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
            closingAwayLine: scheduledGame.atsLine || 999,
            closingTotalLine: scheduledGame.totalLine,
          },
        });
      } else {
        // console.log("updating a pregame line:");
        // console.log(
        //   `${scheduledGame.awayTeam}/${scheduledGame.homeTeam} from ${matching.closingTotalLine} to ${scheduledGame.totalLine}`
        // );
        await prisma.game.update({
          where: { id: matching.id },
          data: {
            closingAwayLine: scheduledGame.atsLine,
            closingTotalLine: scheduledGame.totalLine,
          },
        });
      }
    }
  }

  const activeGames = filterActiveGames(allListedGames);

  // console.log("Scraping Draft Kings, found active games:", activeGames.length);
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
      activeGame.atsLine !== undefined &&
      activeGame.period !== undefined &&
      activeGame.minute !== undefined &&
      activeGame.homeTeamScore !== undefined &&
      activeGame.awayTeamScore !== undefined
    ) {
      await prisma.liveGameLine.create({
        data: {
          gameId: matching.id,
          awayLine: activeGame.atsLine,
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

export type Bet = {
  date: Date;
  betType: "total" | "ats";
  title: string;
  units: number;
  win: boolean;
};

export type HistoricalBetting = {
  weeksBets: Bet[];
  profits: Record<string, number>;
};

type BetsMade = {
  totals: string[];
  ats: string[];
};

type DuplicateTracker = Record<string, BetsMade>;

function sortTimestamp(a: Bet, b: Bet): number {
  return a.date > b.date ? 1 : -1;
}

export async function getHistoricalBettingData(): Promise<HistoricalBetting> {
  const gradedGames = await getAllGamesBeforeToday();

  const oneWeekAgo = convertToPacificPrismaDate(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const goodBetsStart = convertToPacificPrismaDate(
    // fix this?
    // new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
    new Date("2022-03-02T00:00:00")
  );

  const allBets: Bet[] = [];

  const duplicateTracker: DuplicateTracker = {};

  gradedGames.forEach((game) => {
    const dayKey = game.date.toISOString().split("T")[0];
    if (!duplicateTracker[dayKey]) {
      duplicateTracker[dayKey] = {
        totals: [],
        ats: [],
      };
    }

    game.liveGameLines.forEach((line) => {
      // bet on home team
      const hasATSBet = duplicateTracker[dayKey].ats.some(
        (at) => at === game.awayTeam
      );

      const hasTotalBet = duplicateTracker[dayKey].totals.some(
        (at) => at === game.awayTeam
      );
      if (line.atsGrade && line.atsGrade > 5 && !hasATSBet) {
        duplicateTracker[dayKey].ats.push(game.awayTeam);
        const finalAwayDeficit =
          (game.finalHomeScore || 0) - (game.finalAwayScore || 0);
        allBets.push({
          date: game.date,
          title: `${game.homeTeam} ${line.awayLine < 0 ? "+" : ""}${
            -1 * line.awayLine
          } vs ${game.awayTeam}`,
          betType: "ats",
          units: line.atsGrade,
          win: finalAwayDeficit > line.awayLine,
        });
      }

      // bet on away team
      if (line.atsGrade && line.atsGrade < -5 && !hasATSBet) {
        duplicateTracker[dayKey].ats.push(game.awayTeam);
        const finalAwayDeficit =
          (game.finalHomeScore || 0) - (game.finalAwayScore || 0);
        allBets.push({
          date: game.date,
          title: `${game.awayTeam} ${line.awayLine > 0 ? "+" : ""}${
            line.awayLine
          } vs ${game.homeTeam}`,
          betType: "ats",
          units: line.atsGrade,
          win: finalAwayDeficit < line.awayLine,
        });
      }

      // bet on over
      if (line.grade && line.grade > 5 && !hasTotalBet) {
        duplicateTracker[dayKey].totals.push(game.awayTeam);
        const finalTotal =
          (game.finalAwayScore || 0) + (game.finalHomeScore || 0);
        allBets.push({
          date: game.date,
          title: `${game.awayTeam} @ ${game.homeTeam} over ${line.totalLine}`,
          betType: "total",
          units: line.grade,
          win: finalTotal > line.totalLine,
        });
      }

      // bet on under
      if (line.grade && line.grade < -5 && !hasTotalBet) {
        duplicateTracker[dayKey].totals.push(game.awayTeam);
        const finalTotal =
          (game.finalAwayScore || 0) + (game.finalHomeScore || 0);
        allBets.push({
          date: game.date,
          title: `${game.awayTeam} @ ${game.homeTeam} under ${line.totalLine}`,
          betType: "total",
          units: line.grade,
          win: finalTotal < line.totalLine,
        });
      }
    });
  });

  const weeksBets = allBets
    .filter((g) => g.date.getTime() > oneWeekAgo.getTime())
    .sort(sortTimestamp)
    .reverse();

  const threeWeeksBets = allBets.filter(
    (g) => g.date.getTime() > goodBetsStart.getTime()
  );

  const profits: Record<string, number> = {};

  let lastDaysProfit = 0;
  threeWeeksBets.sort(sortTimestamp).forEach((bet) => {
    const day = bet.date.toISOString().split("T")[0];
    const winSign = bet.win ? 0.9 : -1;
    if (!profits[day]) {
      profits[day] = lastDaysProfit;
    }
    const profit =
      Math.round((Math.abs(bet.units) * winSign + Number.EPSILON) * 100) / 100;
    lastDaysProfit += profit;
    profits[day] += profit;
  });

  return {
    weeksBets,
    profits,
  };
}
