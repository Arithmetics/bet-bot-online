import { useTheme, useMediaQuery, Grid } from "@geist-ui/react";
import { ResponsiveBar, BarDatum, BarTooltipProps } from "@nivo/bar";
import { GamePlus } from "../backend/src/database";
import { line } from "d3-shape";

const Line = (barProps: unknown) => {
  const { palette } = useTheme();
  const lineColor = palette.violetLight;
  // @ts-ignore
  const { bars, yScale } = barProps;

  const lineGenerator = line()
    // @ts-ignore
    .x((bar: { x: number }) => {
      return bar.x * 2;
    })
    .y(() => yScale(5));

  // const lineGenerator1 = line()
  //   // @ts-ignore
  //   .x((bar: { x: number }) => {
  //     return bar.x * 2;
  //   })
  //   .y(() => yScale(10));

  const lineGenerator2 = line()
    // @ts-ignore
    .x((bar: { x: number }) => {
      return bar.x * 2;
    })
    .y(() => yScale(-5));

  // const lineGenerator3 = line()
  //   // @ts-ignore
  //   .x((bar: { x: number }) => {
  //     return bar.x * 2;
  //   })
  //   .y(() => yScale(-10));

  const lineGenerator3 = line()
    // @ts-ignore
    .x((bar: { x: number }) => {
      return bar.x * 2;
    })
    .y(() => yScale(0));

  return (
    <>
      <path
        d={lineGenerator(bars) ?? undefined}
        fill="none"
        stroke={lineColor}
        style={{ pointerEvents: "none" }}
      />
      {/* <path
        d={lineGenerator1(bars) ?? undefined}
        fill="none"
        stroke={lineColor}
        style={{ pointerEvents: "none" }}
      /> */}
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

interface LiveGameBarDatum extends BarDatum {
  minute: number;
  grade: number;
  underGrade: number;
  total: number;
}

interface CompleteGameBarDatum extends BarDatum {
  minute: number;
  winGrade: number;
  lossGrade: number;
  total: number;
}

function createLiveBarGraphData(game: GamePlus): LiveGameBarDatum[] {
  const datum: LiveGameBarDatum[] = game.liveGameLines.map((line) => {
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

  [50, 60, 70, 80].forEach((n) => {
    datum.push({
      minute: n,
      grade: 0,
      underGrade: 0,
      total: 0,
    });
  });

  return datum;
}

function createCompleteBarGraphData(game: GamePlus): CompleteGameBarDatum[] {
  const finalScore = (game.finalAwayScore || 0) + (game.finalHomeScore || 0);

  const datum: CompleteGameBarDatum[] = game.liveGameLines.map((line) => {
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

  [50, 60, 70, 80].forEach((n) => {
    datum.push({
      minute: n,
      winGrade: 0,
      lossGrade: 0,
      total: 0,
    });
  });

  return datum;
}

type BarGraphProps = {
  game?: GamePlus;
};

export function TotalBarGraph({ game }: BarGraphProps): JSX.Element | null {
  const { palette } = useTheme();
  const isUpMD = useMediaQuery("md", { match: "up" });

  const marginBottom = isUpMD ? 50 : 30;

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
      // @ts-ignore
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
        right: 10,
        bottom: marginBottom,
        left: 60,
      }}
      enableLabel={false}
      axisTop={null}
      axisRight={null}
      gridXValues={10}
      gridYValues={0}
      minValue={-10}
      maxValue={10}
      axisBottom={{
        tickValues: 5,
        format: ".2s",
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
      tooltip={function (bar: BarTooltipProps<LiveGameBarDatum>): JSX.Element {
        return (
          <Grid padding={1} style={{ backgroundColor: palette.accents_3 }}>
            Bet {bar.data.grade > 0 || bar.data.winGrade > 0 ? "OVER" : "UNDER"}{" "}
            {bar.data.total} at {bar.data.minute} mins
          </Grid>
        );
      }}
      layers={["grid", "axes", "bars", Line, "markers", "legends"]}
    />
  );
}

export default TotalBarGraph;
