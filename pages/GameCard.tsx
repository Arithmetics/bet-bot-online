import {
  Text,
  Card,
  Divider,
  Badge,
  BadgeProps,
  Spacer,
  Grid,
  Image,
} from "@geist-ui/react";
import Activity from "@geist-ui/react-icons/activity";
import { GamePlus, LiveGameLinePlus } from "../backend/src/database";
import { Serie } from "@nivo/line";

import { TotalGraph } from "./TotalGraph";
import { BarGraph } from "./BarGraph";

function getTotalSecondsPlayed(
  quarter: number,
  minute: number,
  second: number
): number {
  const secondsPlayedInQuarter = 12 * 60 - minute * 60 - second;
  const secondsPlayedInPreviousQuarters = (quarter - 1) * 12 * 60;
  return secondsPlayedInQuarter + secondsPlayedInPreviousQuarters;
}

type GameCardProps = {
  game?: GamePlus;
  isLoading?: boolean;
  disconnected: boolean;
};

function getLogoUrl(teamName: string): string {
  const noSpaces = teamName.replace(/\s/g, "");
  return `/nba_team_logos/${noSpaces}.png`;
}

function createTotalGraphData(game: GamePlus): Serie[] {
  const series: Serie[] = [];

  const totalSecondsInRegulation = 48 * 60;

  const realScore = {
    id: "Current Pace",
    data:
      game?.liveGameLines.map((line) => {
        const pace =
          (line.awayScore + line.homeScore) *
          (totalSecondsInRegulation /
            getTotalSecondsPlayed(line.quarter, line.minute, line.second));
        return {
          x: line.totalMinutes,
          y: Math.round(pace),
        };
      }) || [],
  };

  const vegasLine = {
    id: "Vegas Line",
    data:
      game?.liveGameLines.map((line) => ({
        x: line.totalMinutes,
        y: line.totalLine,
      })) || [],
  };

  const botProj = {
    id: "Bot Projected",
    data:
      game?.liveGameLines.map((line) => ({
        x: line.totalMinutes,
        y: line.botProjectedTotal,
      })) || [],
  };

  series.push(realScore);
  series.push(vegasLine);
  series.push(botProj);

  if (game.finalAwayScore && game.finalHomeScore) {
    series.push({
      id: "Final Total",
      data: [
        {
          x: 0,
          y: game.finalAwayScore + game.finalHomeScore,
        },
        {
          x: 48,
          y: game.finalAwayScore + game.finalHomeScore,
        },
      ],
    });
  }

  return series;
}

function determineBadgeType(
  started: boolean,
  highEnough: boolean
): BadgeProps["type"] {
  if (!started) {
    return "secondary";
  }
  if (highEnough) {
    return "error";
  }
  return "default";
}

export function GameCard({
  game,
  disconnected,
}: GameCardProps): JSX.Element | null {
  if (!game) {
    return null;
  }

  const started = game.liveGameLines.length > 0;

  const mostRecentLine = game.liveGameLines.reduce((acc, cur) => {
    if ((cur.totalMinutes || 0) > (acc.totalMinutes || 0)) {
      acc = cur;
    }
    return acc;
  }, game.liveGameLines[0]);

  const formatTime = (line: LiveGameLinePlus) => {
    const secondString = line.second < 10 ? `0${line.second}` : line.second;
    return `${line.minute}: ${secondString} - ${line.quarter}Q`;
  };

  const mostRecentLineGrade =
    (mostRecentLine?.grade || 0) < 0
      ? `UNDER ${Math.abs(mostRecentLine?.grade || 0)}`
      : `OVER ${Math.abs(mostRecentLine?.grade || 0)}`;

  const gameComplete = game.finalAwayScore && game.finalHomeScore;

  const stale = disconnected || game.isStale === undefined;
  const gameData: Serie[] = createTotalGraphData(game);

  return (
    <Card>
      <Card.Content>
        <Grid.Container gap={1} justify="space-between">
          <Grid xs={12} direction="column">
            <Grid.Container
              alignItems="flex-start"
              style={{ marginBottom: "1rem" }}
            >
              <Grid xs={24}>
                <Grid.Container alignItems="center" gap={1}>
                  <Grid>
                    <Image
                      height="50px"
                      src={getLogoUrl(game.awayTeam)}
                      alt={game.awayTeam}
                    />
                  </Grid>
                  <Grid>
                    <Text h4>@</Text>
                  </Grid>
                  <Grid>
                    <Image
                      height="50px"
                      src={getLogoUrl(game.homeTeam)}
                      alt={game.homeTeam}
                    />
                  </Grid>
                </Grid.Container>
              </Grid>
            </Grid.Container>
            <Spacer h={0.5} />
            <Text h4 margin={0}>
              {started
                ? `Score: ${mostRecentLine.awayScore} - ${mostRecentLine.homeScore}`
                : "Not Started"}
            </Text>
          </Grid>
          <Grid
            xs={10}
            direction="column"
            alignItems="flex-end"
            justify="space-between"
          >
            <Badge
              type={determineBadgeType(
                started,
                Math.abs(parseFloat(mostRecentLineGrade)) > 6
              )}
            >
              Grade: {started && !gameComplete ? mostRecentLineGrade : "---"}
            </Badge>
            <Spacer h={0.5} />
            {stale ? (
              <>
                <Badge type="warning">Stale: Not updated</Badge>
                <Spacer h={0.5} />
              </>
            ) : undefined}

            {started ? (
              <Text h3 margin={0}>
                {formatTime(mostRecentLine)}
              </Text>
            ) : undefined}
            {gameComplete ? (
              <Text h3 margin={0}>
                Final
              </Text>
            ) : undefined}
            {!started ? (
              <Text h4 margin={0}>
                Total Line: {game.closingTotalLine}
              </Text>
            ) : undefined}
          </Grid>
        </Grid.Container>
      </Card.Content>
      <Divider />
      <Card.Content>
        <div
          style={{
            height: "600px",
            width: "100%",
            marginTop: "-1.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {started ? (
            <TotalGraph data={gameData} />
          ) : (
            <Activity color="red" size={36} />
          )}
        </div>
        <div
          style={{
            height: "300px",
            width: "100%",
            marginTop: "-1.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BarGraph />
        </div>
      </Card.Content>
    </Card>
  );
}

export default GameCard;
