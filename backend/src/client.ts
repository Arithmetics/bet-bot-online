import { PrismaClient, BetChoice, BetType } from "@prisma/client";
import { createPacificPrismaDate, secondsLeftInRegulation } from "./utils";
import { addGradingDataToLine, addBettingDataToLine } from "./database";

const prisma = new PrismaClient();

type Period =
  | "1ST QUARTER"
  | "2ND QUARTER"
  | "3RD QUARTER"
  | "4TH QUARTER"
  | "1st Quarter"
  | "2nd Quarter"
  | "3rd Quarter"
  | "4th Quarter";

type HTMLGame = {
  homeTeam: string;
  awayTeam: string;
  minute: number;
  second: number;
  period?: Period;
  homeTeamScore?: number;
  awayTeamScore?: number;
  totalLine?: number;
};

type BetOrder = {
  liveLineId: number;
  homeTeam: string;
  awayTeam: string;
  grade: number;
  totalLine: number;
  choice: BetChoice;
};

export const PeriodLookup: Record<Period, number> = {
  "1ST QUARTER": 1,
  "2ND QUARTER": 2,
  "3RD QUARTER": 3,
  "4TH QUARTER": 4,
  "1st Quarter": 1,
  "2nd Quarter": 2,
  "3rd Quarter": 3,
  "4th Quarter": 4,
};

export function filterActiveGames(games: HTMLGame[]): HTMLGame[] {
  return games.filter(
    (game) =>
      (game.minute !== 12 ||
        game.second !== 0 ||
        game.period !== "1ST QUARTER") &&
      // @ts-expect-error
      game.period !== "HALFTIME" &&
      // @ts-expect-error
      game.period !== ""
  );
}

export function filterNotStartedGames(games: HTMLGame[]): HTMLGame[] {
  return games.filter(
    (game) =>
      game.minute === 12 &&
      game.second === 0 &&
      // @ts-expect-error
      game.period === "" &&
      game.awayTeamScore === 0 &&
      game.homeTeamScore === 0
  );
}

export function validateHtmlGame(game: HTMLGame): boolean {
  const gameHasTeamNames =
    game.homeTeam !== game.awayTeam &&
    game.homeTeam !== undefined &&
    game.awayTeam !== undefined;

  const totalLineIsReasonable =
    game.totalLine !== undefined &&
    game.totalLine > 100 &&
    game.totalLine < 500;

  return gameHasTeamNames && totalLineIsReasonable;
}

export async function enterFoundHtmlGamesAndCreateBets(
  htmlGames: HTMLGame[]
): Promise<BetOrder[]> {
  const validGames = htmlGames.filter(validateHtmlGame);
  const scheduledGames = filterNotStartedGames(validGames);
  const activeGames = filterActiveGames(validGames);
  console.log({ scheduledGames });
  console.log({ activeGames });

  const betsToMake: BetOrder[] = [];

  // update or create games for scheduled games
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
            closingAwayLine: 999,
            closingTotalLine: scheduledGame.totalLine,
          },
        });
      } else {
        const liveGameLine = await prisma.liveGameLine.findFirst({
          where: {
            gameId: matching.id,
          },
        });

        // dont accidently update game that has already started
        if (!liveGameLine) {
          await prisma.game.update({
            where: { id: matching.id },
            data: {
              closingAwayLine: 999,
              closingTotalLine: scheduledGame.totalLine,
            },
          });
        }
      }
    }
  }

  // update or create live game lines for active games
  for await (const activeGame of activeGames) {
    const game = await prisma.game.findFirst({
      where: {
        homeTeam: activeGame.homeTeam,
        awayTeam: activeGame.awayTeam,
        date: createPacificPrismaDate(),
      },
    });
    if (
      game &&
      activeGame.totalLine &&
      //   activeGame.atsLine !== undefined &&
      activeGame.period &&
      activeGame.minute !== undefined &&
      activeGame.homeTeamScore !== undefined &&
      activeGame.awayTeamScore !== undefined
    ) {
      const lastLiveGameLines = await prisma.liveGameLine.findMany({
        where: {
          gameId: game.id,
        },
        orderBy: {
          timestamp: "desc",
        },
      });

      const lastLine = lastLiveGameLines[0];

      const lastLineSecondsLeft = lastLine
        ? secondsLeftInRegulation(
            lastLine.quarter,
            lastLine.minute,
            lastLine.second
          )
        : 48 * 60 * 60;

      const currentLineSecondsLeft = secondsLeftInRegulation(
        PeriodLookup[activeGame.period],
        activeGame.minute,
        activeGame.second
      );

      if (currentLineSecondsLeft < lastLineSecondsLeft) {
        const liveLine = await prisma.liveGameLine.create({
          data: {
            game: { connect: { id: game.id } },
            awayLine: 999,
            totalLine: activeGame.totalLine,
            quarter: PeriodLookup[activeGame.period],
            minute: activeGame.minute,
            second: activeGame.second,
            awayScore: activeGame.awayTeamScore,
            homeScore: activeGame.homeTeamScore,
            timestamp: new Date(),
          },
        });

        // need to account for previously bet lines (need bet track for this)

        const linePlus = addBettingDataToLine(
          addGradingDataToLine(liveLine, game)
        );

        console.log({ enteredLine: linePlus });

        if (linePlus.isOverTotalBet) {
          betsToMake.push({
            liveLineId: linePlus.id,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            totalLine: linePlus.totalLine,
            choice: BetChoice.OVER,
            grade: linePlus.grade ?? 0,
          });
        }
        if (linePlus.isUnderTotalBet) {
          betsToMake.push({
            liveLineId: linePlus.id,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            totalLine: linePlus.totalLine,
            choice: BetChoice.UNDER,
            grade: linePlus.grade ?? 0,
          });
        }
      }
    }
  }

  for (const bet of betsToMake) {
    await prisma.liveBet.create({
      data: {
        liveGameLine: { connect: { id: bet.liveLineId } },
        grade: bet.grade,
        choice: bet.choice,
        betType: BetType.TOTAL,
        placedLine: 0,
        wasPlaced: false,
        timestamp: new Date(),
      },
    });
  }

  return betsToMake;
}
