import { useTheme, useMediaQuery, Grid } from "@geist-ui/react";
import { ResponsiveLine, Serie, PointTooltipProps } from "@nivo/line";
import { LegendAnchor } from "@nivo/legends";

// type ResponsiveLineProps = {
//   data: Serie[];
// };

const data: Serie[] = [
  {
    id: "g",
    data: [
      {
        x: 0,
        y: 10,
      },
    ],
  },
];

// export function TotalGraph({ data }: ResponsiveLineProps): JSX.Element {
export function TotalGraph(): JSX.Element {
  const { palette } = useTheme();
  const isUpMD = useMediaQuery("md", { match: "up" });

  const marginRight = isUpMD ? 120 : 20;
  const marginBottom = isUpMD ? 60 : 130;
  const translateX = isUpMD ? 120 : 0;
  const translateY = isUpMD ? 0 : 120;

  const anchor: LegendAnchor = isUpMD ? "bottom-right" : "bottom-left";

  //   const maxX = data.reduce((acc, cur) => {
  //     const maxData = cur.data.reduce((acc2, cur2) => {
  //       const xVal = cur2?.x || 0;
  //       if (xVal > acc2 && typeof xVal === "number") {
  //         acc2 = xVal;
  //       }
  //       return acc2;
  //     }, 0);

  //     if (maxData > acc) {
  //       acc = maxData;
  //     }
  //     return acc;
  //   }, 0);

  return (
    <Grid height="400px" width="900px">
      <p>hey</p>
      <img />
      <ResponsiveLine
        data={data}
        theme={{
          fontSize: 10,
          textColor: "#fff",
        }}
        colors={[palette.error, palette.success, palette.warning, palette.cyan]}
        margin={{ top: 50, right: marginRight, bottom: marginBottom, left: 60 }}
        xScale={{ type: "linear", min: 1, max: 48 }}
        yScale={{ type: "linear", min: 0, max: 1, reverse: false }}
        yFormat=" >-.2f"
        xFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickValues: 1,
          tickSize: 1,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Minutes",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 1,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Points",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        pointSize={10}
        pointBorderWidth={2}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: anchor as LegendAnchor,
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
            <p>test</p>
            //   <Box
            //     padding={1}
            //     border={1}
            //     bg={"gray.700"}
            //     borderColor={"teal.500"}
            //     boxShadow={"dark-lg"}
            //     rounded={"md"}
            //   >
            //     {point.serieId} game {point.data.x} - {point.data.y}
            //   </Box>
          );
        }}
      />
    </Grid>
  );
}
