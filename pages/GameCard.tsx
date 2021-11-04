import {
  Text,
  Card,
  Divider,
  Badge,
  Spacer,
  Grid,
  Image,
  Loading,
} from "@geist-ui/react";
import { GameWithLines } from "../backend/src/database";
import { Serie } from "@nivo/line";

import { TotalGraph } from "./TotalGraph";

type GameCardProps = {
  game?: GameWithLines;
  isLoading?: boolean;
  disconnected: boolean;
};

function getLogoUrl(teamName: string): string {
  const noSpaces = teamName.replace(/\s/g, "");
  console.log(noSpaces);
  return `/nba_team_logos/${noSpaces}.png`;
}

export function GameCard({
  isLoading,
  game,
  disconnected,
}: GameCardProps): JSX.Element | null {
  if (!game) {
    return null;
  }

  const started = game.liveGameLines.length;
  const stale = disconnected;
  const gameData: Serie[] = [];

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
                      src={getLogoUrl(game.awayTeam)}
                      alt={game.awayTeam}
                      marginRight={1}
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
                      marginLeft={1}
                    />
                  </Grid>
                </Grid.Container>
              </Grid>
            </Grid.Container>
            <Spacer h={0.5} />
            <Text h4 margin={0}>
              {started ? "Score: 45 - 42" : "Not Started"}
            </Text>
          </Grid>
          <Grid
            xs={8}
            direction="column"
            alignItems="flex-end"
            justify="space-between"
          >
            <Badge> Grade: ---</Badge>
            <Spacer h={0.5} />
            {/* <Badge type="error">Grade: OVER +4.3</Badge> */}
            {/* <Spacer h={0.5} /> */}
            {stale ? (
              <>
                <Badge type="warning">Stale: Not updated</Badge>
                <Spacer h={0.5} />
              </>
            ) : undefined}

            {started ? (
              <Text h3 margin={0}>
                12:00 - 1st
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
            height: "300px",
            width: "100%",
            marginTop: "-1.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <Grid.Container height="100%" alignItems="center">
              <Grid xs={24}>
                <Loading type="error">Loading</Loading>
              </Grid>
            </Grid.Container>
          ) : (
            <TotalGraph data={gameData} />
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
