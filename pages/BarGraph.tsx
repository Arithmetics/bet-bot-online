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
      };
    }

    const underGrade = line.grade < 0 ? line.grade : 0;
    const overGrade = line.grade >= 0 ? line.grade : 0;
    return {
      minute: line.totalMinutes || 0,
      grade: overGrade,
      underGrade,
    };
  });

  return datum;
}

// type BarGraphProps = {
//   data?: BarDatum[];
// };

// const fakeData = [
//   {
//     country: "AD",
//     "hot dog": 149,
//     "hot dogColor": "hsl(10, 70%, 50%)",
//     burger: 163,
//     burgerColor: "hsl(221, 70%, 50%)",
//     sandwich: 101,
//     sandwichColor: "hsl(312, 70%, 50%)",
//     kebab: 50,
//     kebabColor: "hsl(115, 70%, 50%)",
//     fries: 151,
//     friesColor: "hsl(16, 70%, 50%)",
//     donut: 79,
//     donutColor: "hsl(88, 70%, 50%)",
//   },
//   {
//     country: "AE",
//     "hot dog": 159,
//     "hot dogColor": "hsl(238, 70%, 50%)",
//     burger: 78,
//     burgerColor: "hsl(165, 70%, 50%)",
//     sandwich: 83,
//     sandwichColor: "hsl(213, 70%, 50%)",
//     kebab: 188,
//     kebabColor: "hsl(333, 70%, 50%)",
//     fries: 196,
//     friesColor: "hsl(240, 70%, 50%)",
//     donut: 196,
//     donutColor: "hsl(87, 70%, 50%)",
//   },
//   {
//     country: "AF",
//     "hot dog": 125,
//     "hot dogColor": "hsl(137, 70%, 50%)",
//     burger: 156,
//     burgerColor: "hsl(3, 70%, 50%)",
//     sandwich: 0,
//     sandwichColor: "hsl(93, 70%, 50%)",
//     kebab: 161,
//     kebabColor: "hsl(98, 70%, 50%)",
//     fries: 187,
//     friesColor: "hsl(342, 70%, 50%)",
//     donut: 26,
//     donutColor: "hsl(307, 70%, 50%)",
//   },
//   {
//     country: "AG",
//     "hot dog": 109,
//     "hot dogColor": "hsl(85, 70%, 50%)",
//     burger: 42,
//     burgerColor: "hsl(355, 70%, 50%)",
//     sandwich: 146,
//     sandwichColor: "hsl(270, 70%, 50%)",
//     kebab: 171,
//     kebabColor: "hsl(337, 70%, 50%)",
//     fries: 61,
//     friesColor: "hsl(150, 70%, 50%)",
//     donut: 53,
//     donutColor: "hsl(214, 70%, 50%)",
//   },
//   {
//     country: "AI",
//     "hot dog": 31,
//     "hot dogColor": "hsl(74, 70%, 50%)",
//     burger: 52,
//     burgerColor: "hsl(85, 70%, 50%)",
//     sandwich: 26,
//     sandwichColor: "hsl(198, 70%, 50%)",
//     kebab: 165,
//     kebabColor: "hsl(97, 70%, 50%)",
//     fries: 53,
//     friesColor: "hsl(8, 70%, 50%)",
//     donut: 83,
//     donutColor: "hsl(95, 70%, 50%)",
//   },
//   {
//     country: "AL",
//     "hot dog": 162,
//     "hot dogColor": "hsl(244, 70%, 50%)",
//     burger: 34,
//     burgerColor: "hsl(149, 70%, 50%)",
//     sandwich: 170,
//     sandwichColor: "hsl(24, 70%, 50%)",
//     kebab: 180,
//     kebabColor: "hsl(314, 70%, 50%)",
//     fries: 51,
//     friesColor: "hsl(207, 70%, 50%)",
//     donut: 153,
//     donutColor: "hsl(236, 70%, 50%)",
//   },
//   {
//     country: "AM",
//     "hot dog": 188,
//     "hot dogColor": "hsl(20, 70%, 50%)",
//     burger: 129,
//     burgerColor: "hsl(144, 70%, 50%)",
//     sandwich: 138,
//     sandwichColor: "hsl(294, 70%, 50%)",
//     kebab: 175,
//     kebabColor: "hsl(18, 70%, 50%)",
//     fries: 45,
//     friesColor: "hsl(20, 70%, 50%)",
//     donut: 116,
//     donutColor: "hsl(94, 70%, 50%)",
//   },
// ];

const fakeData = [
  {
    minute: 2,
    grade: 5,
    underGrade: 0,
  },
  {
    minute: 6,
    grade: 0,
    underGrade: -2,
  },
  {
    minute: 20,
    grade: 1,
    underGrade: 0,
  },
  {
    minute: 29,
    grade: -2,
    underGrade: 0,
  },
  {
    minute: 40,
    grade: 2,
    underGrade: 0,
  },
  {
    minute: 42,
    grade: -4,
    underGrade: 0,
  },
];

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
