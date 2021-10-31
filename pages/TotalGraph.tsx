import {
  useTheme,
  useMediaQuery,
  Text,
  Card,
  Divider,
  Badge,
  Spacer,
  Grid,
  Image,
  Loading,
} from "@geist-ui/react";
import { ResponsiveLine, Serie, PointTooltipProps } from "@nivo/line";
import { LegendAnchor } from "@nivo/legends";

const data: Serie[] = [
  {
    id: "Real Score",
    data: [
      {
        x: 0,
        y: 10,
      },
      {
        x: 10,
        y: 20,
      },
      {
        x: 20,
        y: 80,
      },
      {
        x: 35,
        y: 150,
      },
      {
        x: 48,
        y: 220,
      },
    ],
  },
  {
    id: "Vegas Line",
    data: [
      {
        x: 12,
        y: 201,
      },
      {
        x: 15,
        y: 199,
      },
      {
        x: 24,
        y: 211,
      },
      {
        x: 29,
        y: 214,
      },
      {
        x: 39,
        y: 210,
      },
    ],
  },
  {
    id: "Bot Projected",
    data: [
      {
        x: 12,
        y: 205,
      },
      {
        x: 15,
        y: 244,
      },
      {
        x: 24,
        y: 244,
      },
      {
        x: 29,
        y: 221,
      },
      {
        x: 39,
        y: 210,
      },
    ],
  },
  {
    id: "Final Score",
    data: [
      {
        x: 0,
        y: 220,
      },
      {
        x: 48,
        y: 220,
      },
    ],
  },
];

type GameCardProps = {
  isLoading: boolean;
};

export function GameCard({ isLoading }: GameCardProps): JSX.Element {
  return (
    <Card width="500px">
      <Card.Content>
        <Grid.Container gap={1} justify="space-between">
          <Grid xs={12} direction="column">
            <Grid.Container alignItems="flex-start" marginBottom={1}>
              <Grid xs={24}>
                <Grid.Container alignItems="center">
                  <Grid>
                    <Image
                      height="50px"
                      src="/nba_team_logos/lakers.png"
                      alt="lakers"
                      marginRight={1}
                    />
                  </Grid>
                  <Grid>
                    <Text h4>@</Text>
                  </Grid>
                  <Grid>
                    <Image
                      height="50px"
                      src="/nba_team_logos/grizzlies.png"
                      alt="grizzlies"
                      marginLeft={1}
                    />
                  </Grid>
                </Grid.Container>
              </Grid>
            </Grid.Container>
            <Spacer h={0.5} />
            <Text h3 margin={0}>
              Score: 45 - 42
            </Text>
          </Grid>
          <Grid
            xs={8}
            direction="column"
            alignItems="flex-end"
            justify="space-between"
          >
            <Badge type="error">Grade: OVER +4.3</Badge> <Spacer h={0.5} />
            <Text h3 margin={0}>
              4:34 - 3rd
            </Text>
          </Grid>
        </Grid.Container>
      </Card.Content>
      <Divider />
      <Card.Content>
        <div style={{ height: "300px", width: "100%", marginTop: "-1.5rem" }}>
          {isLoading ? (
            <Grid.Container height="100%" alignItems="center">
              <Grid xs={24}>
                <Loading type="error">Loading</Loading>
              </Grid>
            </Grid.Container>
          ) : (
            <TotalGraph />
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

// export function TotalGraph({ data }: ResponsiveLineProps): JSX.Element {
export function TotalGraph(): JSX.Element {
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
