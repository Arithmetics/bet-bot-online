import { Table, Text, useTheme } from "@geist-ui/react";
import { HistoricalBetting, Bet } from "../backend/src/database";
import ProfitGraph from "./ProfitGraph";

type BetTableProps = {
  historicalBetting: HistoricalBetting | null;
};

export default function BetTable({
  historicalBetting,
}: BetTableProps): JSX.Element {
  const { palette } = useTheme();

  if (!historicalBetting) {
    return (
      <Text
        h3
        marginBottom={2}
        style={{
          textAlign: "center",
        }}
      >
        No betting data found
      </Text>
    );
  }

  // @ts-ignore
  const resultRender = (_value, rowData) => {
    return (
      <Text style={{ color: rowData.win ? palette.cyan : palette.errorLight }}>
        {rowData.win ? "Win" : "Loss"}
      </Text>
    );
  };

  // @ts-ignore
  const unitRender = (_value, rowData) => {
    return (
      <Text style={{ color: rowData.win ? palette.cyan : palette.errorLight }}>
        {Math.abs(rowData.units)}
      </Text>
    );
  };

  // @ts-ignore
  const dateRender = (_value, rowData) => {
    return rowData.date.split("T")[0];
  };

  const totals: Array<Bet> = historicalBetting.weeksBets.filter(
    (b) => b.betType === "total"
  );

  const ats: Array<Bet> = historicalBetting.weeksBets.filter(
    (b) => b.betType === "ats"
  );

  return (
    <div
      style={{
        maxWidth: "1000px",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div style={{ height: "500px" }}>
        <ProfitGraph profits={historicalBetting.profits} />
      </div>
      <Text h3 type="secondary">
        This Week&apos;s Totals
      </Text>
      <Table<Bet> data={totals}>
        <Table.Column<Bet> prop="date" label="Date" render={dateRender} />
        <Table.Column<Bet> prop="title" label="Bet" />
        <Table.Column<Bet> prop="units" label="Units" render={unitRender} />
        <Table.Column<Bet> prop="win" label="Result" render={resultRender} />
      </Table>
      <Text h3 marginTop={2} type="secondary">
        This Week&apos;s ATS
      </Text>
      <Table<Bet> data={ats}>
        <Table.Column<Bet> prop="date" label="Date" render={dateRender} />
        <Table.Column<Bet> prop="title" label="Bet" />
        <Table.Column<Bet> prop="units" label="Units" render={unitRender} />
        <Table.Column<Bet> prop="win" label="Result" render={resultRender} />
      </Table>
    </div>
  );
}
