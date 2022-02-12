import { useTheme, useMediaQuery, Grid } from "@geist-ui/react";
import { ResponsiveBar, BarDatum, BarTooltipProps } from "@nivo/bar";
import { GamePlus } from "../backend/src/database";
import { line } from "d3-shape";
// import { LegendAnchor } from "@nivo/legends";

const Line = (barProps: unknown) => {
  const { palette } = useTheme();
  const lineColor = palette.violetLight;
  // @ts-ignore
  const { bars, xScale, yScale } = barProps;

  const lineGenerator = line()
    // @ts-ignore
    .x((bar: { x: number }) => {
      return bar.x * 2;
    })
    .y(() => yScale(5));

  const lineGenerator1 = line()
    // @ts-ignore
    .x((bar: { x: number }) => {
      return bar.x * 2;
    })
    .y(() => yScale(10));

  const lineGenerator2 = line()
    // @ts-ignore
    .x((bar: { x: number }) => {
      return bar.x * 2;
    })
    .y(() => yScale(-5));

  const lineGenerator3 = line()
    // @ts-ignore
    .x((bar: { x: number }) => {
      return bar.x * 2;
    })
    .y(() => yScale(-10));

  return (
    <>
      <path
        d={lineGenerator(bars) ?? undefined}
        fill="none"
        stroke={lineColor}
        style={{ pointerEvents: "none" }}
      />
      <path
        d={lineGenerator1(bars) ?? undefined}
        fill="none"
        stroke={lineColor}
        style={{ pointerEvents: "none" }}
      />
      <path
        d={lineGenerator2(bars) ?? undefined}
        fill="none"
        stroke={lineColor}
        style={{ pointerEvents: "none" }}
      />
      <path
        d={lineGenerator3(bars) ?? undefined}
        fill="none"
        stroke={lineColor}
        style={{ pointerEvents: "none" }}
      />
    </>
  );
};

function createLiveBarGraphData(game: GamePlus): BarDatum[] {
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

function createCompleteBarGraphData(game: GamePlus): BarDatum[] {
  const finalScore = (game.finalAwayScore || 0) + (game.finalHomeScore || 0);

  const datum: BarDatum[] = game.liveGameLines.map((line) => {
    if (line.grade === undefined) {
      return {
        minute: 0,
        winGrade: 0,
        lossGrade: 0,
        total: 0,
      };
    }

    const projected = line.totalLine + line.grade;
    const projectedWin =
      (finalScore > projected && line.totalLine < projected) ||
      (finalScore < projected && line.totalLine > projected);

    const winGrade = projectedWin ? line.grade : 0;
    const lossGrade = !projectedWin ? line.grade : 0;

    return {
      minute: line.totalMinutes || 0,
      winGrade,
      lossGrade,
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

  const gameComplete =
    game.finalAwayScore && game.finalHomeScore ? true : false;

  const data = gameComplete
    ? createCompleteBarGraphData(game)
    : createLiveBarGraphData(game);

  const colors = gameComplete
    ? [palette.cyan, palette.error]
    : [palette.warning, palette.success];

  const keys = gameComplete
    ? ["winGrade", "lossGrade"]
    : ["grade", "underGrade"];

  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy="minute"
      theme={{
        fontSize: 10,
        textColor: "#fff",
      }}
      colors={colors}
      margin={{
        top: 50,
        right: marginRight,
        bottom: marginBottom,
        left: 60,
      }}
      label={(d) => {
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
      layers={["grid", "axes", "bars", Line, "markers", "legends"]}
    />
  );
}

export default BarGraph;
