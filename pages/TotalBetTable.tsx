import { Table, Text } from "@geist-ui/react";

export enum OverOrUnder {
  OVER = "OVER",
  UNDER = "UNDER",
}

export type LiveTotalBetRow = {
  awayTeam: string;
  homeTeam: string;
  choicePick: OverOrUnder;
  currentTotalScore: number;
  currentTotalLine: number;
  closingTotalLine: number;
  grade: number;
};

const data: Array<LiveTotalBetRow> = [
  {
    awayTeam: "MEM Grizzlies",
    homeTeam: "LA Lakers",
    choicePick: OverOrUnder.OVER,
    currentTotalScore: 44,
    currentTotalLine: 234,
    closingTotalLine: 113,
    grade: 23.2,
  },
];

export function TotalBetTable() {
  return (
    <>
      <Text h3>Pending Total Bets</Text>
      <Table<LiveTotalBetRow> data={data}>
        <Table.Column<LiveTotalBetRow> prop="awayTeam" label="Away" />
        <Table.Column<LiveTotalBetRow> prop="homeTeam" label="Home" />
        <Table.Column<LiveTotalBetRow>
          prop="currentTotalScore"
          label="Current Total"
        />
        <Table.Column<LiveTotalBetRow>
          prop="closingTotalLine"
          label="Closing Line"
        />
        <Table.Column<LiveTotalBetRow>
          prop="currentTotalLine"
          label="Current Line"
        />
        <Table.Column<LiveTotalBetRow> prop="choicePick" label="Bet Side" />
        <Table.Column<LiveTotalBetRow> prop="grade" label="Units Bet" />
      </Table>
    </>
  );
}
