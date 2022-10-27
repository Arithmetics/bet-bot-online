import { useTheme, useMediaQuery, Grid } from "@geist-ui/react";
import { ResponsiveBar, BarDatum, BarTooltipProps } from "@nivo/bar";
import { GamePlus } from "../backend/src/database";
import { line } from "d3-shape";
import { getTotalSecondsPlayed } from "./SpreadGraph";

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

interface LiveGameBarDatum extends BarDatum {
  minute: number;
  homeGrade: number;
  awayGrade: number;
  awayLine: number;
}

interface CompleteGameBarDatum extends BarDatum {
  minute: number;
  winGrade: number;
  lossGrade: number;
  awayLine: number;
}

function createLiveBarGraphData(game: GamePlus): LiveGameBarDatum[] {
  const legalLiveLines = game?.liveGameLines.filter((line) => {
    const secondsPlayed = getTotalSecondsPlayed(
      line.quarter,
      line.minute,
      line.second
    );
    return secondsPlayed > 720 && secondsPlayed < 2160; // second and third quarter only
  });

  const datum: LiveGameBarDatum[] = legalLiveLines.map((line) => {
    if (line.atsGrade === undefined) {
      return {
        minute: 0,
        homeGrade: 0,
        awayGrade: 0,
        awayLine: 0,
      };
    }

    const awayGrade = line.atsGrade < 0 ? line.atsGrade : 0;
    const homeGrade = line.atsGrade >= 0 ? line.atsGrade : 0;

    return {
      minute: line.totalMinutes || 0,
      homeGrade: homeGrade,
      awayGrade: awayGrade,
      awayLine: line.awayLine,
    };
  });

  // [50, 60, 70, 80].forEach((n) => {
  //   datum.push({
  //     minute: n,
  //     homeGrade: 0,
  //     awayGrade: 0,
  //     awayLine: 0,
  //   });
  // });

  return datum;
}

function createCompleteBarGraphData(game: GamePlus): CompleteGameBarDatum[] {
  const finalAwayDeficit =
    (game.finalHomeScore || 0) - (game.finalAwayScore || 0);

  const legalLiveLines = game?.liveGameLines.filter((line) => {
    const secondsPlayed = getTotalSecondsPlayed(
      line.quarter,
      line.minute,
      line.second
    );
    return secondsPlayed > 720 && secondsPlayed < 2160; // second and third quarter only
  });

  const datum: CompleteGameBarDatum[] = legalLiveLines.map((line) => {
    if (line.atsGrade === undefined) {
      return {
        minute: 0,
        winGrade: 0,
        lossGrade: 0,
        awayLine: 0,
      };
    }

    const isBettingAway = line.atsGrade < 0;
    const didAwayCover = finalAwayDeficit - line.awayLine <= 0;

    const projectedWin =
      (isBettingAway && didAwayCover) || (!isBettingAway && !didAwayCover);

    const winGrade = projectedWin ? line.atsGrade : 0;
    const lossGrade = !projectedWin ? line.atsGrade : 0;

    return {
      minute: line.totalMinutes || 0,
      winGrade,
      lossGrade,
      awayLine: line.awayLine,
    };
  });

  // [50, 60, 70, 80].forEach((n) => {
  //   datum.push({
  //     minute: n,
  //     winGrade: 0,
  //     lossGrade: 0,
  //     awayLine: 0,
  //   });
  // });

  return datum;
}

type BarGraphProps = {
  game?: GamePlus;
};

export function ATSBarGraph({ game }: BarGraphProps): JSX.Element | null {
  const { palette } = useTheme();
  const isUpMD = useMediaQuery("md", { match: "up" });

  // const marginRight = isUpMD ? 120 : 20;
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
    : ["awayGrade", "homeGrade"];

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
        // right: marginRight,
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
        const betHome = bar.data.awayGrade > 0 || bar.data.winGrade > 0;
        const lineDisplay = betHome
          ? bar.data.awayLine * -1
          : bar.data.awayLine;
        const sign = lineDisplay >= 0 ? "+" : "";
        return (
          <Grid padding={1} style={{ backgroundColor: palette.accents_3 }}>
            Bet {betHome ? "HOME" : "AWAY"} {sign}
            {lineDisplay} at {bar.data.minute} mins
          </Grid>
        );
      }}
      layers={["grid", "axes", "bars", Line, "markers", "legends"]}
    />
  );
}

export default ATSBarGraph;
