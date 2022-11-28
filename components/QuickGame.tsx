import { Grid, Card, Text, Badge, Tag } from "@geist-ui/react";
import TeamLogoVersus from "./TeamLogoVersus";
import { GamePlus } from "../backend/src/database";
import ATSBarGraph from "./ATSBarGraph";
import TotalBarGraph from "./BarGraph";
import { Stat } from "./Stat";
import { formatTime, getGameDisplays } from "./gameUtils";

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
    timeStampNumber,
    stale,
  } = getGameDisplays(game, messageTimestamp);

  return (
    <Grid key={game?.id} xs={24}>
      <Card shadow width="100%" padding={0} height="75px">
        <Card.Content padding={0.5}>
          <Grid padding={0}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TeamLogoVersus game={game} />
              </div>
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

              <Stat
                top="Closing ATS"
                middle={`${
                  game.closingAwayLine && game.closingAwayLine >= 0 ? "+" : ""
                }${game.closingAwayLine}`}
                bottom="AWAY"
              />
              <Stat
                top="Current ATS"
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
              />
              <Stat
                top="Closing Total"
                middle={`${game.closingTotalLine}`}
                bottom="TOTAL"
              />
              <Stat
                top="Current Total"
                middle={`${mostRecentLine?.totalLine || "-"}`}
                bottom="TOTAL"
              />
              <Stat
                top="Total Grade"
                middle={Math.abs(mostRecentLine?.grade || 0).toFixed(1)}
                bottom={mostRecentLineTotalTag}
              />
              <div
                style={{
                  //   height: "150px",
                  width: "200px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* <TotalBarGraph game={game} /> */}
              </div>
              <div
                style={{
                  //   height: "150px",
                  width: "200px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* <ATSBarGraph game={game} /> */}
              </div>
            </div>
          </Grid>
        </Card.Content>
      </Card>
    </Grid>
  );
}

export default QuickGame;
