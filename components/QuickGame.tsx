import { Grid, Card, Text, Tag, useMediaQuery } from "@geist-ui/react";
import TeamLogoVersus from "./TeamLogoVersus";
import { GamePlus } from "../backend/src/database";
import { Stat } from "./Stat";
import { formatTime, getGameDisplays } from "./gameUtils";
import { getTotalSecondsPlayed } from "./SpreadGraph";
import { GeistUIThemesPalette } from "@geist-ui/react/dist/themes/presets";

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
    atsAwayBet,
    atsHomeBet,
    totalOverBet,
    totalUnderBet,
    stale,
  } = getGameDisplays(game, messageTimestamp);

  const totalSeconds = getTotalSecondsPlayed(
    mostRecentLine?.quarter || 0,
    mostRecentLine?.minute || 0,
    mostRecentLine?.second || 0
  );

  const inSecondOrThird = totalSeconds > 720 && totalSeconds < 2160;

  const finalAwayDeficit =
    (game.finalAwayScore || 0) - (game.finalHomeScore || 0);
  const finalTotal = (game.finalAwayScore || 0) + (game.finalHomeScore || 0);

  const atsBetMiddleDisplay = () => {
    if (atsAwayBet) {
      return `${
        atsAwayBet.awayLine < 0 ? "-" : "+"
      }${atsAwayBet.awayLine.toFixed(1)}`;
    }
    if (atsHomeBet) {
      return `${atsHomeBet.awayLine > 0 ? "-" : "+"}${(
        atsHomeBet.awayLine * -1
      ).toFixed(1)}`;
    }
    return "-";
  };

  const didWinATSBet = (): boolean => {
    if (atsAwayBet) {
      return atsAwayBet.awayLine < finalAwayDeficit;
    }
    if (atsHomeBet) {
      return atsHomeBet.awayLine > finalAwayDeficit;
    }
    return false;
  };

  const didWinOverBet = (): boolean => {
    if (totalOverBet) {
      return totalOverBet.totalLine < finalTotal;
    }
    if (totalUnderBet) {
      return totalUnderBet.totalLine > finalTotal;
    }
    return false;
  };

  const atsBetAlertColor = (): keyof GeistUIThemesPalette | undefined => {
    if (!Boolean(atsHomeBet || atsAwayBet)) {
      return undefined;
    }
    if (!gameComplete) {
      return "purple";
    }
    if (didWinATSBet()) {
      return "cyan";
    }
    return "error";
  };

  const totalBetAlertColor = (): keyof GeistUIThemesPalette | undefined => {
    if (!Boolean(totalOverBet || totalUnderBet)) {
      return undefined;
    }
    if (!gameComplete) {
      return "purple";
    }
    if (didWinOverBet()) {
      return "cyan";
    }
    return "error";
  };

  const atsBetBottomDisplay = () => {
    if (atsAwayBet) {
      return `AWAY`;
    }
    if (atsHomeBet) {
      return "HOME";
    }
    return "-";
  };

  const totalBetMiddleDisplay = () => {
    if (totalOverBet) {
      return `${totalOverBet.totalLine.toFixed(1)}`;
    }
    if (totalUnderBet) {
      return `${totalUnderBet.totalLine.toFixed(1)}`;
    }
    return "-";
  };

  const totalBetBottomDisplay = () => {
    if (totalOverBet) {
      return `OVER`;
    }
    if (totalUnderBet) {
      return "UNDER";
    }
    return "-";
  };

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
                {!gameComplete && (
                  <Text h6 margin={0} style={{ whiteSpace: "nowrap" }}>
                    {formatTime(mostRecentLine)}
                  </Text>
                )}
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
                {gameComplete && <Tag type="default">Complete</Tag>}
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
              {!gameComplete ? (
                <Stat
                  top="ATS Live"
                  middle={`${
                    mostRecentLine?.awayLine && mostRecentLine.awayLine >= 0
                      ? "+"
                      : ""
                  }${mostRecentLine?.awayLine || "-"}`}
                  bottom="AWAY"
                />
              ) : (
                <Stat
                  top="Final Diff"
                  middle={`${
                    finalAwayDeficit >= 0 ? "+" : ""
                  }${finalAwayDeficit}`}
                  bottom="AWAY"
                />
              )}
              <Stat
                top="ATS Grade"
                middle={
                  !gameComplete && inSecondOrThird
                    ? Math.abs(mostRecentLine?.atsGrade || 0).toFixed(1)
                    : (0).toFixed(1)
                }
                bottom={mostRecentLineSpreadTag}
                color={
                  mostRecentLine?.isAwayATSBet || mostRecentLine?.isHomeATSBet
                    ? "purple"
                    : undefined
                }
              />
              <Stat
                top="ATS Live Bet"
                middle={atsBetMiddleDisplay()}
                bottom={atsBetBottomDisplay()}
                color={atsBetAlertColor()}
              />
            </Grid>

            <Grid xs={0} md={1}></Grid>

            <Grid xs={24} md={6}>
              <Stat
                top="Total Close"
                middle={`${game.closingTotalLine}`}
                bottom="TOTAL"
              />
              {!gameComplete ? (
                <Stat
                  top="Total Live"
                  middle={`${mostRecentLine?.totalLine || "-"}`}
                  bottom="TOTAL"
                />
              ) : (
                <Stat top="Final" middle={`${finalTotal}`} bottom="TOTAL" />
              )}
              <Stat
                top="Total Grade"
                middle={
                  !gameComplete
                    ? Math.abs(mostRecentLine?.grade || 0).toFixed(1)
                    : (0).toFixed(1)
                }
                bottom={mostRecentLineTotalTag}
                color={
                  mostRecentLine?.isOverTotalBet ||
                  mostRecentLine?.isUnderTotalBet
                    ? "purple"
                    : undefined
                }
              />
              <Stat
                top="Total Live Bet"
                middle={totalBetMiddleDisplay()}
                bottom={totalBetBottomDisplay()}
                color={totalBetAlertColor()}
              />
            </Grid>
          </Grid.Container>
        </Card.Content>
      </Card>
    </Grid>
  );
}

export default QuickGame;
