/* eslint-disable no-unused-vars */
export interface DraftKingsResponse {
  eventGroup: EventGroup;
}

export interface EventGroup {
  eventGroupId: number;
  providerEventGroupId: string;
  providerId: number;
  displayGroupId: number;
  name: string;
  offerCategories?: OfferCategoriesEntity[] | null;
  events?: EventsEntity[] | null;
}

export interface OfferCategoriesEntity {
  offerCategoryId: number;
  name: string;
  offerSubcategoryDescriptors?: OfferSubcategoryDescriptorsEntity[] | null;
}

export interface OfferSubcategoryDescriptorsEntity {
  subcategoryId: number;
  name: string;
  offerSubcategory?: OfferSubcategory | null;
}

export interface OfferSubcategory {
  name: string;
  subcategoryId: number;
  componentId: number;
  offers?: (EntityOrOffersEntityEntity[] | null)[] | null;
}

export enum OfferLabelEnum {
  SPREAD = "Spread",
  TOTAL = "Total",
}

export interface EntityOrOffersEntityEntity {
  providerOfferId: string;
  providerId: number;
  providerEventId: string;
  providerEventGroupId?: string | null;
  label?: OfferLabelEnum | null;
  isSuspended: boolean;
  isOpen: boolean;
  offerSubcategoryId: number;
  isSubcategoryFeatured: boolean;
  betOfferTypeId: number;
  displayGroupId: number;
  eventGroupId: number;
  providerCriterionId?: string | null;
  outcomes?: OutcomesEntity[] | null;
  offerUpdateState: string;
  offerSequence: number;
  source?: string | null;
  main: boolean;
}

export enum OutcomeLabelEnum {
  OVER = "Over",
  UNDER = "Under",
}

export interface OutcomesEntity {
  providerOutcomeId?: string | null;
  providerId: number;
  providerOfferId?: string | null;
  label?: OutcomeLabelEnum | null;
  oddsAmerican?: string | null;
  oddsDecimal: number;
  oddsDecimalDisplay?: string | null;
  oddsFractional?: string | null;
  line?: number | null;
  main: boolean;
  hidden?: boolean | null;
}

export interface EventsEntity {
  eventId: number;
  displayGroupId: number;
  eventGroupId: number;
  eventGroupName: string;
  providerEventId: string;
  providerId: number;
  name: string;
  startDate: string;
  teamName1: string;
  teamName2: string;
  teamShortName1: string;
  teamShortName2: string;
  eventStatus: EventStatus;
  eventScorecard: EventScorecard;
  mediaList?: MediaListEntity[] | null;
  liveBettingOffered: boolean;
  liveBettingEnabled: boolean;
  flashBetOfferCount: number;
  isSameGameParlayEligible?: boolean | null;
}

export enum PeriodEnum {
  FOURTH_QUARTER = "4th Quarter",
  THIRD_QUARTER = "3rd Quarter",
  SECOND_QUARTER = "2nd Quarter",
  FIRST_QUARTER = "1st Quarter",
}

export const PeriodLookup: Record<PeriodEnum, number> = {
  [PeriodEnum.FIRST_QUARTER]: 1,
  [PeriodEnum.SECOND_QUARTER]: 2,
  [PeriodEnum.THIRD_QUARTER]: 3,
  [PeriodEnum.FOURTH_QUARTER]: 4,
};

export enum StateEnum {
  STARTED = "STARTED",
  NOT_STARTED = "NOT_STARTED",
}

export interface EventStatus {
  state: StateEnum;
  isClockDisabled: boolean;
  period?: PeriodEnum | null;
  minute: number;
  second: number;
  isClockRunning: boolean;
  homeTeamScore?: string | null;
  awayTeamScore?: string | null;
}

export interface EventScorecard {
  mainScorecard?: ScoreCardsEntityOrMainScorecard | null;
  scoreCards?: ScoreCardsEntityOrMainScorecard[] | null;
  scorecardComponentId: number;
}

export interface ScoreCardsEntityOrMainScorecard {
  intervalName: string;
  intervalNumber: number;
  firstTeamScore: string;
  secondTeamScore: string;
}

export interface MediaListEntity {
  eventId: number;
  mediaProviderName: string;
  mediaId: string;
  mediaTypeName: string;
  updatedAt: string;
}

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
