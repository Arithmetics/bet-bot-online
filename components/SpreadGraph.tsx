import { useTheme, useMediaQuery, Grid } from "@geist-ui/react";
import { GamePlus } from "../backend/src/database";
import { ResponsiveLine, Serie, PointTooltipProps } from "@nivo/line";
import { LegendAnchor } from "@nivo/legends";
import Activity from "@geist-ui/react-icons/activity";

export function getTotalSecondsPlayed(
  quarter: number,
  minute: number,
  second: number
): number {
  const secondsPlayedInQuarter = (12 - minute) * 60 - second;
  const oldQuarterSeconds = (quarter - 1) * 12 * 60;

  return secondsPlayedInQuarter + oldQuarterSeconds;
}

export const totalSecondsInRegulation = 48 * 60;

function createSpreadGraphData(game: GamePlus): Serie[] {
  const series: Serie[] = [];

  const legalLiveLines = game?.liveGameLines.filter((line) => {
    const secondsPlayed = getTotalSecondsPlayed(
      line.quarter,
      line.minute,
      line.second
    );
    return secondsPlayed > 720 && secondsPlayed < 2160; // second and third quarter only
  });

  // const realScore = {
  //   id: "Current Away Deficit",
  //   data:
  //     game?.liveGameLines.map((line) => {
  //       const awayLead = line.awayScore - line.homeScore;
  //       return {
  //         x: line.totalMinutes,
  //         y: -awayLead,
  //       };
  //     }) || [],
  // };

  const vegasLine = {
    id: "Vegas Away Spread",
    data:
      game?.liveGameLines.map((line) => ({
        x: line.totalMinutes,
        y: line.awayLine,
      })) || [],
  };

  const botProj = {
    id: "Bot Projected",
    data:
      legalLiveLines.map((line) => ({
        x: line.totalMinutes,
        y: line.botProjectedATS,
      })) || [],
  };

  // series.push(realScore);
  series.push(vegasLine);
  series.push(botProj);

  if (game.finalAwayScore && game.finalHomeScore) {
    series.push({
      id: "Final Away Deficit",
      data: [
        {
          x: 0,
          y: -1 * (game.finalAwayScore - game.finalHomeScore),
        },
        {
          x: 48,
          y: -1 * (game.finalAwayScore - game.finalHomeScore),
        },
      ],
    });
  }

  return series;
}

type SpreadGraphProps = {
  game?: GamePlus;
};

export function SpreadGraph({ game }: SpreadGraphProps): JSX.Element | null {
  const { palette } = useTheme();
  const isUpMD = useMediaQuery("md", { match: "up" });

  const marginRight = isUpMD ? 125 : 20;
  const marginBottom = isUpMD ? 60 : 130;
  const translateX = isUpMD ? 100 : 0;
  const translateY = isUpMD ? 0 : 120;

  const anchor: LegendAnchor = isUpMD ? "bottom-right" : "bottom-left";

  if (!game) {
    return null;
  }

  const data: Serie[] = createSpreadGraphData(game);

  const yAxis = data.reduce(
    (acc, cur) => {
      const maxData = cur.data.reduce((acc2, cur2) => {
        const yVal = cur2?.y || 0;
        if (yVal > acc2 && typeof yVal === "number") {
          acc2 = yVal;
        }
        return acc2;
      }, 0);

      const minData = cur.data.reduce((acc2, cur2) => {
        const yVal = cur2?.y || 300;
        if (yVal < acc2 && typeof yVal === "number") {
          acc2 = yVal;
        }
        return acc2;
      }, 300);

      if (maxData > acc.maxY) {
        acc.maxY = maxData;
      }

      if (minData < acc.minY) {
        acc.minY = minData;
      }

      return acc;
    },
    { maxY: 0, minY: 300 }
  );

  if (data.length === 0) {
    return <Activity color="red" />;
  }

  return (
    <ResponsiveLine
      data={data}
      theme={{
        fontSize: 10,
        textColor: "#fff",
      }}
      colors={[
        palette.error,
        palette.success,
        // palette.warning,
        palette.cyan,
      ]}
      margin={{
        top: 50,
        right: marginRight,
        bottom: marginBottom,
        left: 60,
      }}
      xScale={{ type: "linear", min: 1, max: 48 }}
      yScale={{
        type: "linear",
        min: Math.min(yAxis.minY, -10),
        max: Math.max(yAxis.maxY, 10),
        reverse: false,
      }}
      yFormat=" >-.2f"
      xFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      gridXValues={0}
      gridYValues={0}
      axisBottom={{
        tickValues: 12,
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
        legend: "Away Spread",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      pointSize={10}
      pointBorderWidth={2}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: anchor,
          direction: "column",
          justify: false,
          translateX: translateX,
          translateY: translateY,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 85,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [],
        },
      ]}
      tooltip={function ({ point }: PointTooltipProps): JSX.Element {
        return (
          <Grid padding={1} style={{ backgroundColor: palette.accents_3 }}>
            {point.serieId}: {point.data.x} mins, {point.data.y} points
          </Grid>
        );
      }}
    />
  );
}

export default SpreadGraph;
