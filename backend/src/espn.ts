import got from "got";
import { GamePlus } from "./database";
import { createPacificPrismaDate } from "./utils";

const url = "https://sports.oregonlottery.org/sports/basketball/nba";

type ESPNCompetitor = {
  team: { shortDisplayName: string };
  score: number;
};

enum ESPNStatusEnum {
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
  minute: number;
  status: ESPNStatusEnum;
};

function reduceESPNGames(espnResponse: ESPNResponse): ESPNGameReduced[] {
  const games: ESPNGameReduced[] = [];

  espnResponse.events.forEach((event) => {
    event.competitions.forEach((competition) => {
      games.push({
        awayTeam: competition.competitors[0].team.shortDisplayName,
        awayScore: competition.competitors[0].score,
        homeTeam: competition.competitors[1].team.shortDisplayName,
        homeScore: competition.competitors[1].score,
        quarter: competition.status.period,
        minute: competition.status.clock,
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

export function findMatchingESPNScore(
  ats: GamePlus,
  scores: ESPNGameReduced[]
): ESPNGameReduced | undefined {
  return scores.find((s) => {
    return (
      ats.awayTeam.includes(s.awayTeam) && ats.homeTeam.includes(s.homeTeam)
    );
  });
}
