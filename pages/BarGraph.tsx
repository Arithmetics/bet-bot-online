import { useTheme, useMediaQuery, Grid } from "@geist-ui/react";
import { ResponsiveBar, BarDatum, BarTooltipProps } from "@nivo/bar";
import { GamePlus } from "../backend/src/database";
// import { LegendAnchor } from "@nivo/legends";

function createBarGraphData(game: GamePlus): BarDatum[] {
  const datum: BarDatum[] = game.liveGameLines.map((line) => {
    if (line.grade === undefined) {
      return {
        minute: 0,
        grade: 0,
        underGrade: 0,
        total: 0,
      };
    }

    const underGrade = line.grade < 0 ? line.grade : 0;
    const overGrade = line.grade >= 0 ? line.grade : 0;
    return {
      minute: line.totalMinutes || 0,
      grade: overGrade,
      underGrade,
      total: line.totalLine,
    };
  });

  return datum;
}

type BarGraphProps = {
  game?: GamePlus;
};

export function BarGraph({ game }: BarGraphProps): JSX.Element | null {
  const { palette } = useTheme();
  const isUpMD = useMediaQuery("md", { match: "up" });

  const marginRight = isUpMD ? 120 : 20;
  const marginBottom = isUpMD ? 60 : 130;

  if (!game) {
    return null;
  }

  const data = createBarGraphData(game);

  return (
    <ResponsiveBar
      data={data}
      keys={["grade", "underGrade"]}
      indexBy="minute"
      theme={{
        fontSize: 10,
        textColor: "#fff",
      }}
      colors={[palette.error, palette.success, palette.warning, palette.cyan]}
      margin={{
        top: 50,
        right: marginRight,
        bottom: marginBottom,
        left: 60,
      }}
      label={(d) => {
        console.log(d);
        // @ts-ignore
        return String(d.data.total);
      }}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 3]],
      }}
      axisTop={null}
      axisRight={null}
      gridXValues={0}
      gridYValues={0}
      minValue={-20}
      maxValue={20}
      axisBottom={{
        tickValues: 10,
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Minutes",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickValues: 8,
        tickSize: 1,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Grade",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      tooltip={function (): JSX.Element {
        return <></>;
      }}
    />
  );
}

export default BarGraph;
