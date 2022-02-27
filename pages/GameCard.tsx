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

type GameCardProps = {
  game?: GamePlus;
  isLoading?: boolean;
  messageTimestamp?: number;
};

function getLogoUrl(teamName: string): string {
  const noSpaces = teamName.replace(/\s/g, "");
  return `/nba_team_logos/${noSpaces}.png`;
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
  messageTimestamp,
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

  const timeStampNumber = mostRecentLine?.timestamp
    ? new Date(mostRecentLine?.timestamp).getTime()
    : 0;

  const stale = (messageTimestamp || 0) - timeStampNumber > 30 * 1000;

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
                <Grid.Container alignItems="center" gap={1} wrap="nowrap">
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
              {!started && !gameComplete && "Not Started"}
              {started &&
                !gameComplete &&
                `Score: ${mostRecentLine.awayScore} - ${mostRecentLine.homeScore}`}
              {gameComplete &&
                `Final: ${game.finalAwayScore} - ${game.finalHomeScore}`}
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
            {stale && started && !gameComplete ? (
              <>
                <Badge type="warning">Stale: Not updated</Badge>
                <Spacer h={0.5} />
              </>
            ) : undefined}
            {gameComplete ? (
              <>
                <Badge type="secondary">Complete</Badge>
                <Spacer h={0.5} />
              </>
            ) : undefined}

            {started && !gameComplete ? (
              <Text h3 margin={0}>
                {formatTime(mostRecentLine)}
              </Text>
            ) : undefined}
            {gameComplete ? (
              <Text h3 margin={0}>
                {`Total: ${
                  (game.finalAwayScore || 0) + (game.finalHomeScore || 0)
                }`}
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
            <TotalGraph game={game} />
          ) : (
            <Activity color="red" size={36} />
          )}
        </div>
        {started ? (
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
            <BarGraph game={game} />
          </div>
        ) : undefined}
      </Card.Content>
    </Card>
  );
}

export default GameCard;
