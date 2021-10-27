import { Table, Text } from "@geist-ui/react";

export enum HomeOrAway {
  HOME = "HOME",
  AWAY = "AWAY",
}

type LiveBetTableRow = {
  time: string;
  awayTeam: string;
  homeTeam: string;
  choiceTeam: HomeOrAway;
  currentAwayTeamLead: number;
  currentAwayLine: number;
  closingAwayLine: number;
  grade: number;
};

const data: Array<LiveBetTableRow> = [
  {
    time: "4:43 PST",
    awayTeam: "MEM Grizzlies",
    homeTeam: "LA Lakers",
    choiceTeam: HomeOrAway.HOME,
    currentAwayTeamLead: 23,
    currentAwayLine: 4,
    closingAwayLine: 8,
    grade: 23.2,
  },
  {
    time: "4:43 PST",
    awayTeam: "POR Trailblazers",
    homeTeam: "PHX Suns",
    choiceTeam: HomeOrAway.AWAY,
    currentAwayTeamLead: 23,
    currentAwayLine: 44,
    closingAwayLine: -2,
    grade: 24.2,
  },
  {
    time: "4:43 PST",
    awayTeam: "MEM Grizzlies",
    homeTeam: "LA Lakers",
    choiceTeam: HomeOrAway.HOME,
    currentAwayTeamLead: 23,
    currentAwayLine: 4,
    closingAwayLine: 8,
    grade: 23.2,
  },
];

export function ATSBetTable() {
  return (
    <>
      <Text h3>Pending ATS Bets</Text>
      <Table<LiveBetTableRow> data={data} width="100%">
        <Table.Column<LiveBetTableRow> prop="time" label="Time Placed" />
        <Table.Column<LiveBetTableRow> prop="awayTeam" label="Away" />
        <Table.Column<LiveBetTableRow> prop="homeTeam" label="Home" />
        <Table.Column<LiveBetTableRow>
          prop="currentAwayTeamLead"
          label="Away Lead"
        />
        <Table.Column<LiveBetTableRow>
          prop="closingAwayLine"
          label="Closing Line"
        />
        <Table.Column<LiveBetTableRow>
          prop="currentAwayLine"
          label="Away Line"
        />
        <Table.Column<LiveBetTableRow> prop="choiceTeam" label="Bet Team" />
        <Table.Column<LiveBetTableRow> prop="grade" label="Units Bet" />
      </Table>
    </>
  );
}
