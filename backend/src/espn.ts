/* eslint-disable no-unused-vars */
import got from "got";
import { GamePlus, getAllTodaysGames, updateFinalScore } from "./database";
import { DraftKingsGameReduced } from "./draftKings";
import { createPacificPrismaDate } from "./utils";

type ESPNCompetitor = {
  team: { shortDisplayName: string };
  homeAway: string;
  score: string;
};

export enum ESPNStatusEnum {
  STATUS_SCHEDULED = "STATUS_SCHEDULED",
  STATUS_HALFTIME = "STATUS_HALFTIME",
  STATUS_IN_PROGRESS = "STATUS_IN_PROGRESS",
  STATUS_FINAL = "STATUS_FINAL",
}

type ESPNCompetitionStatus = {
  clock: number;
  period: number;
  type: {
    name: ESPNStatusEnum;
  };
};

type ESPNCompetition = {
  competitors: ESPNCompetitor[];
  status: ESPNCompetitionStatus;
};

type ESPNEvent = {
  competitions: ESPNCompetition[];
};

export type ESPNResponse = {
  events: ESPNEvent[];
};

export type ESPNGameReduced = {
  awayTeam: string;
  homeTeam: string;
  awayScore: number;
  homeScore: number;
  quarter: number;
  secondsRemaining: number;
  status: ESPNStatusEnum;
};

function reduceESPNGames(espnResponse: ESPNResponse): ESPNGameReduced[] {
  const games: ESPNGameReduced[] = [];

  espnResponse.events.forEach((event) => {
    event.competitions.forEach((competition) => {
      const homeTeam = competition.competitors.find(
        (c) => c.homeAway === "home"
      );
      const awayTeam = competition.competitors.find(
        (c) => c.homeAway === "away"
      );

      if (!homeTeam || !awayTeam) {
        return;
      }

      games.push({
        awayTeam: awayTeam.team.shortDisplayName,
        awayScore: parseInt(awayTeam.score, 10),
        homeTeam: homeTeam.team.shortDisplayName,
        homeScore: parseInt(homeTeam.score),
        quarter: competition.status.period,
        secondsRemaining: competition.status.clock,
        status: competition.status.type.name,
      });
    });
  });

  return games;
}

export async function getESPNGames(): Promise<ESPNGameReduced[]> {
  try {
    const today = createPacificPrismaDate();

    const todaysDateString = `${today.getFullYear()}${(
      "0" + (today.getMonth() + 1).toString()
    ).slice(-2)}${("0" + today.getDate().toString()).slice(-2)}`;

    const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${todaysDateString}`;
    console.log(`scraping: ${url}`);

    const response = await got(url, {});

    const data = JSON.parse(response.body) as ESPNResponse;

    return reduceESPNGames(data);
  } catch (e) {
    console.log("ESPN ERROR");
    console.log(e);
    return [];
  }
}

// export function findMatchingESPNScore(
//   draftKings: DraftKingsGameReduced,
//   scores: ESPNGameReduced[]
// ): ESPNGameReduced | undefined {
//   return scores.find((s) => {
//     return (
//       draftKings.awayTeam.includes(s.awayTeam) &&
//       draftKings.homeTeam.includes(s.homeTeam)
//     );
//   });
// }

export function findMatchingPrismaGame(
  espn: ESPNGameReduced,
  games: GamePlus[]
): GamePlus | undefined {
  return games.find((s) => {
    return (
      s.awayTeam.includes(espn.awayTeam) && s.homeTeam.includes(espn.homeTeam)
    );
  });
}

export async function completePrismaGames(
  espnGames: ESPNGameReduced[]
): Promise<void> {
  const completedGames = espnGames.filter(
    (g) => g.status === ESPNStatusEnum.STATUS_FINAL
  );
  const prismaGames = await getAllTodaysGames();

  for await (const espn of completedGames) {
    const matchingPrisma = findMatchingPrismaGame(espn, prismaGames);
    if (matchingPrisma) {
      await updateFinalScore(
        matchingPrisma?.id,
        espn.awayScore,
        espn.homeScore
      );
    }
  }
}
