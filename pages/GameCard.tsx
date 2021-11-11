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
import { GamePlus } from "../backend/src/database";
import { Serie } from "@nivo/line";

import { TotalGraph } from "./TotalGraph";

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
  const realScore = {
    id: "Real Score",
    data:
      game?.liveGameLines.map((line) => ({
        x: line.totalMinutes,
        y: line.awayScore + line.homeScore,
      })) || [],
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

  return [realScore, vegasLine, botProj];
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

  const mostRecentLineGrade =
    (mostRecentLine?.grade || 0) < 0
      ? `UNDER ${Math.abs(mostRecentLine?.grade || 0)}`
      : `OVER ${Math.abs(mostRecentLine?.grade || 0)}`;

  // const gradeInAlert = Math.abs(mostRecentLine?.grade || 0)

  const stale = disconnected;
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
               Grade: {started ? mostRecentLineGrade : "---"}
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
                {mostRecentLine.minute} mins - {mostRecentLine.quarter}Q
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
      </Card.Content>
    </Card>
  );
}

export default GameCard;
