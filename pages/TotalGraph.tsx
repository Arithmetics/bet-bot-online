import { useTheme, useMediaQuery, Grid } from "@geist-ui/react";
import { ResponsiveLine, Serie, PointTooltipProps } from "@nivo/line";
import { LegendAnchor } from "@nivo/legends";
import Activity from "@geist-ui/react-icons/activity";

// const data: Serie[] = [
//   {
//     id: "Real Score",
//     data: [
//       {
//         x: 0,
//         y: 10,
//       },
//       {
//         x: 10,
//         y: 20,
//       },
//       {
//         x: 20,
//         y: 80,
//       },
//       {
//         x: 35,
//         y: 150,
//       },
//       {
//         x: 48,
//         y: 220,
//       },
//     ],
//   },
//   {
//     id: "Vegas Line",
//     data: [
//       {
//         x: 12,
//         y: 201,
//       },
//       {
//         x: 15,
//         y: 199,
//       },
//       {
//         x: 24,
//         y: 211,
//       },
//       {
//         x: 29,
//         y: 214,
//       },
//       {
//         x: 39,
//         y: 210,
//       },
//     ],
//   },
//   {
//     id: "Bot Projected",
//     data: [
//       {
//         x: 12,
//         y: 205,
//       },
//       {
//         x: 15,
//         y: 244,
//       },
//       {
//         x: 24,
//         y: 244,
//       },
//       {
//         x: 29,
//         y: 221,
//       },
//       {
//         x: 39,
//         y: 210,
//       },
//     ],
//   },
//   {
//     id: "Final Score",
//     data: [
//       {
//         x: 0,
//         y: 220,
//       },
//       {
//         x: 48,
//         y: 220,
//       },
//     ],
//   },
// ];

type TotalGraphProps = {
  data: Serie[];
};

// export function TotalGraph({ data }: ResponsiveLineProps): JSX.Element {
export function TotalGraph({ data }: TotalGraphProps): JSX.Element {
  const { palette } = useTheme();
  const isUpMD = useMediaQuery("md", { match: "up" });

  const marginRight = isUpMD ? 120 : 20;
  const marginBottom = isUpMD ? 60 : 130;
  const translateX = isUpMD ? 120 : 0;
  const translateY = isUpMD ? 0 : 120;

  const anchor: LegendAnchor = isUpMD ? "bottom-right" : "bottom-left";

  const maxY = data.reduce((acc, cur) => {
    const maxData = cur.data.reduce((acc2, cur2) => {
      const yVal = cur2?.y || 0;
      if (yVal > acc2 && typeof yVal === "number") {
        acc2 = yVal;
      }
      return acc2;
    }, 0);

    if (maxData > acc) {
      acc = maxData;
    }
    return acc;
  }, 0);

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
      colors={[palette.error, palette.success, palette.warning, palette.cyan]}
      margin={{
        top: 50,
        right: marginRight,
        bottom: marginBottom,
        left: 60,
      }}
      xScale={{ type: "linear", min: 1, max: 48 }}
      yScale={{ type: "linear", min: 0, max: maxY, reverse: false }}
      yFormat=" >-.2f"
      xFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      gridXValues={0}
      gridYValues={0}
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
        legend: "Total Points",
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
