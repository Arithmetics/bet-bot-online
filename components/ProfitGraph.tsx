import { useTheme, useMediaQuery, Grid } from "@geist-ui/react";
import { ResponsiveLine, Serie, PointTooltipProps } from "@nivo/line";
import { LegendAnchor } from "@nivo/legends";

function createGraphData(profits: Record<string, number>): Serie[] {
  const firstDay = Object.keys(profits)[0];

  const x = 0;
  return [
    {
      id: "Profit",
      data: [
        {
          x: firstDay,
          y: x.toFixed(2),
        },
      ].concat(
        Object.keys(profits).map((k, _i) => {
          console.log(k);
          return {
            x: k,
            y: profits[k].toFixed(2),
          };
        })
      ),
    },
  ];
}

type ProfitGraphProps = {
  profits: Record<string, number>;
};

export default function ProfitGraph({
  profits,
}: ProfitGraphProps): JSX.Element {
  const { palette } = useTheme();
  const isUpMD = useMediaQuery("md", { match: "up" });

  const marginRight = isUpMD ? 120 : 20;
  const marginBottom = isUpMD ? 60 : 130;
  const translateX = isUpMD ? 120 : 0;
  const translateY = isUpMD ? 0 : 120;

  const anchor: LegendAnchor = isUpMD ? "bottom-right" : "bottom-left";

  const data: Serie[] = createGraphData(profits);

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
      xScale={{ format: "%Y-%m-%d", type: "time" }}
      yScale={{
        type: "linear",
        reverse: false,
        min: 0,
        max: "auto",
      }}
      yFormat=" >-.2f"
      xFormat="time:%Y-%m-%d"
      axisTop={null}
      axisRight={null}
      gridXValues={0}
      gridYValues={0}
      axisBottom={{
        tickValues: "every 5 days",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        format: "%Y-%m-%d",
        legend: "Day",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickValues: 8,
        tickSize: 1,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Profit (-110 bets)",
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
            {point.serieId}: ${point.data.y}
          </Grid>
        );
      }}
    />
  );
}
