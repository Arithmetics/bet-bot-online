import { Grid, Card, Text, Tag, useMediaQuery } from "@geist-ui/react";
import TeamLogoVersus from "./TeamLogoVersus";
import { GamePlus } from "../backend/src/database";
import { Stat } from "./Stat";
import { formatTime, getGameDisplays } from "./gameUtils";
import {
  ATS_BET_THRESHOLD,
  TOTAL_BET_THRESHOLD,
} from "../backend/src/features";

type QuickGameProps = {
  game: GamePlus;
  messageTimestamp?: number;
};

export function QuickGame({
  game,
  messageTimestamp,
}: QuickGameProps): JSX.Element {
  const {
    started,
    gameComplete,
    mostRecentLine,
    mostRecentLineTotalTag,
    mostRecentLineSpreadTag,
    stale,
  } = getGameDisplays(game, messageTimestamp);

  const isUpMD = useMediaQuery("md", { match: "up" });

  return (
    <Grid key={game?.id} xs={24}>
      <Card shadow width="100%" padding={0}>
        <Card.Content padding={0.5}>
          <Grid.Container>
            <Grid
              xs={10}
              md={2}
              style={{
                marginBottom: isUpMD ? "0px" : "16px",
              }}
            >
              <TeamLogoVersus game={game} />
            </Grid>
            <Grid xs={0} md={1} />
            <Grid xs={8} md={2}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text h6 margin={0} style={{ whiteSpace: "nowrap" }}>
                  {formatTime(mostRecentLine)}
                </Text>
                <Text
                  h6
                  margin={0}
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {started &&
                    !gameComplete &&
                    `Score: ${mostRecentLine?.awayScore} - ${mostRecentLine?.homeScore}`}
                  {gameComplete &&
                    `Final: ${game.finalAwayScore} - ${game.finalHomeScore}`}
                </Text>
              </div>
            </Grid>
            <Grid xs={0} md={1} />
            <Grid xs={4} md={2}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!started && !gameComplete && (
                  <Tag type="secondary" style={{ whiteSpace: "nowrap" }}>
                    Not Started
                  </Tag>
                )}
                {stale && started && !gameComplete && (
                  <Tag type="warning">Stale</Tag>
                )}
                {!stale && started && !gameComplete && (
                  <Tag type="success">Live</Tag>
                )}
                {gameComplete && <div style={{ width: "50px" }} />}
              </div>
            </Grid>

            <Grid xs={0} md={2} />

            <Grid
              xs={24}
              md={6}
              style={{
                marginBottom: isUpMD ? "0px" : "16px",
              }}
            >
              <Stat
                top="ATS Close"
                middle={`${
                  game.closingAwayLine && game.closingAwayLine >= 0 ? "+" : ""
                }${game.closingAwayLine}`}
                bottom="AWAY"
              />
              <Stat
                top="ATS Live"
                middle={`${
                  mostRecentLine?.awayLine && mostRecentLine.awayLine >= 0
                    ? "+"
                    : ""
                } ${mostRecentLine?.awayLine || "-"}`}
                bottom="AWAY"
              />
              <Stat
                top="ATS Grade"
                middle={Math.abs(mostRecentLine?.atsGrade || 0).toFixed(1)}
                bottom={mostRecentLineSpreadTag}
                alert={
                  Math.abs(mostRecentLine?.atsGrade || 0) >
                  ATS_BET_THRESHOLD - 1
                }
              />
              <Stat top="ATS Live Bet" middle="-" bottom="-" />
            </Grid>

            <Grid xs={0} md={1}></Grid>

            <Grid xs={24} md={6}>
              <Stat
                top="Total Close"
                middle={`${game.closingTotalLine}`}
                bottom="TOTAL"
              />
              <Stat
                top="Total Live"
                middle={`${mostRecentLine?.totalLine || "-"}`}
                bottom="TOTAL"
              />
              <Stat
                top="Total Grade"
                middle={Math.abs(mostRecentLine?.grade || 0).toFixed(1)}
                bottom={mostRecentLineTotalTag}
                alert={
                  Math.abs(mostRecentLine?.grade || 0) > TOTAL_BET_THRESHOLD - 1
                }
              />
              <Stat top="Total Live Bet" middle="-" bottom="-" />
            </Grid>
          </Grid.Container>
        </Card.Content>
      </Card>
    </Grid>
  );
}

export default QuickGame;
