import got from "got";
import {
  DraftKingsResponse,
  OfferLabelEnum,
  OutcomeLabelEnum,
  PeriodEnum,
  StateEnum,
} from "./DraftKingsTypes";
import { convertToPacificPrismaDate, createPacificPrismaDate } from "./utils";
// @ts-ignore
import log from "log-to-file";

const GAME_LINES_ID = 487;
const SUBCATEGOGERY = 4511;

export type DraftKingsGameReduced = {
  eventId: number;
  startDate: Date;
  period?: PeriodEnum;
  minute: number;
  second: number;
  homeTeam: string;
  awayTeam: string;
  state: StateEnum;
  isClockRunning: boolean;
  homeTeamScore?: number;
  awayTeamScore?: number;
  totalLine?: number;
  atsLine?: number;
  isBettingAllowed?: number;
};

export function filterNotStartedGames(
  games: DraftKingsGameReduced[]
): DraftKingsGameReduced[] {
  return games.filter((game) => game.state === StateEnum.NOT_STARTED);
}

export function filterActiveGames(
  games: DraftKingsGameReduced[]
): DraftKingsGameReduced[] {
  return games.filter(
    (game) => game.state === StateEnum.STARTED && !game.isClockRunning
  );
}

export function filterNotTodaysGames(
  games: DraftKingsGameReduced[]
): DraftKingsGameReduced[] {
  const today = createPacificPrismaDate();
  return games.filter((game) => {
    const gamePacificDate = convertToPacificPrismaDate(game.startDate);
    return gamePacificDate.getDay() === today.getDay();
  });
}

function reduceDraftKingsGames(
  draftKingsResponse: DraftKingsResponse
): DraftKingsGameReduced[] {
  const games: DraftKingsGameReduced[] = [];

  const offeredLines = draftKingsResponse.eventGroup.offerCategories
    ?.find((oc) => oc.offerCategoryId === GAME_LINES_ID)
    ?.offerSubcategoryDescriptors?.find(
      (osd) => osd.subcategoryId === SUBCATEGOGERY
    );

  draftKingsResponse.eventGroup.events?.forEach((event) => {
    const {
      eventId,
      teamName1,
      teamName2,
      startDate,
      eventStatus,
      providerEventId,
    } = event;
    const {
      state,
      isClockRunning,
      period,
      minute,
      second,
      homeTeamScore,
      awayTeamScore,
    } = eventStatus;

    const matchingOffer = offeredLines?.offerSubcategory?.offers?.find((o) =>
      o?.some((p) => p.providerEventId === providerEventId)
    );

    const matchingTotalOutcome = matchingOffer
      ?.find((mo) => mo.label === OfferLabelEnum.TOTAL)
      ?.outcomes?.find((oc) => oc.label === OutcomeLabelEnum.OVER);

    const matchingSpreadOutcome = matchingOffer?.find(
      (mo) => mo.label === OfferLabelEnum.SPREAD
    )?.outcomes?.[0];

    games.push({
      eventId,
      startDate: new Date(startDate),
      period: period ?? undefined,
      minute,
      second,
      state,
      awayTeam: teamName1,
      homeTeam: teamName2,
      isClockRunning,
      // draft kings reversed?
      awayTeamScore: homeTeamScore ? parseInt(homeTeamScore) : undefined,
      homeTeamScore: awayTeamScore ? parseInt(awayTeamScore) : undefined,
      totalLine: matchingTotalOutcome?.line
        ? matchingTotalOutcome?.line
        : undefined,
      atsLine: matchingSpreadOutcome?.line
        ? matchingSpreadOutcome?.line
        : undefined,
    });
  });

  return games;
}

export async function getDraftKingsListings(): Promise<
  DraftKingsGameReduced[]
> {
  try {
    const url = `https://sportsbook-us-or.draftkings.com//sites/US-OR-SB/api/v4/eventgroups/88670846/categories/487?format=json`;

    const response = await got(url, {});

    const data = JSON.parse(response.body) as DraftKingsResponse;

    const games = reduceDraftKingsGames(data);

    games.forEach((g) => {
      log(JSON.stringify(g), "draft-kings.log");
    });

    return games;
  } catch (e) {
    console.log("DRAFT KINGS ERROR");
    console.log(e);
    return [];
  }
}

export async function printData() {
  const games = await getDraftKingsListings();
  console.log(games);
}
