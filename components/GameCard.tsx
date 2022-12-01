import {
  Text,
  Card,
  Divider,
  Badge,
  BadgeProps,
  Spacer,
  Grid,
  Image,
  useMediaQuery,
} from "@geist-ui/react";
import Activity from "@geist-ui/react-icons/activity";
import { GamePlus, LiveGameLinePlus } from "../backend/src/database";
import { View } from "../pages/index";
import { TotalGraph } from "./TotalGraph";
import { TotalBarGraph } from "./BarGraph";
import { ATSBarGraph } from "./ATSBarGraph";
import SpreadGraph from "./SpreadGraph";
import TeamLogoVersus from "./TeamLogoVersus";
import { formatTime, getGameDisplays } from "./gameUtils";

type GameCardProps = {
  game?: GamePlus;
  isLoading?: boolean;
  messageTimestamp?: number;
  view: View;
};

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
  view,
}: GameCardProps): JSX.Element | null {
  if (!game) {
    return null;
  }

  const { started, gameComplete, mostRecentLine, stale } = getGameDisplays(
    game,
    messageTimestamp
  );

  const mostRecentLineTotalGrade =
    (mostRecentLine?.grade || 0) < 0
      ? `UNDER ${Math.abs(mostRecentLine?.grade || 0)}`
      : `OVER ${Math.abs(mostRecentLine?.grade || 0)}`;

  const mostRecentLineSpreadGrade =
    (mostRecentLine?.grade || 0) > 0
      ? `AWAY ${Math.abs(mostRecentLine?.atsGrade || 0)}`
      : `HOME ${Math.abs(mostRecentLine?.atsGrade || 0)}`;

  return (
    <Card>
      <Card.Content padding={1}>
        <Grid.Container gap={1} justify="space-between">
          <Grid xs={12} direction="column">
            <Grid.Container
              alignItems="flex-start"
              style={{ marginBottom: "1rem" }}
            >
              <TeamLogoVersus game={game} />
            </Grid.Container>
            <Spacer h={0.4} />
            <div>
              <Text h5 margin={0}>
                {!started && !gameComplete && "Not Started"}
                {started &&
                  !gameComplete &&
                  `Score: ${mostRecentLine?.awayScore} - ${mostRecentLine?.homeScore}`}
                {gameComplete &&
                  `Final: ${game.finalAwayScore} - ${game.finalHomeScore}`}
              </Text>
              {started && (
                <Text h6 margin={0}>
                  {`Closed @ ${
                    view === "total"
                      ? `${game.closingTotalLine} Total`
                      : `Away ${game.closingAwayLine}`
                  }  `}
                </Text>
              )}
            </div>
          </Grid>
          <Grid
            xs={10}
            direction="column"
            alignItems="flex-end"
            justify="space-between"
          >
            {view === "total" && (
              <Badge
                type={determineBadgeType(
                  started,
                  Math.abs(parseFloat(mostRecentLineTotalGrade)) > 6
                )}
              >
                Grade:{" "}
                {started && !gameComplete ? mostRecentLineTotalGrade : "---"}
              </Badge>
            )}
            {view === "ats" && (
              <Badge
                type={determineBadgeType(
                  started,
                  Math.abs(parseFloat(mostRecentLineSpreadGrade)) > 6
                )}
              >
                Grade:{" "}
                {started && !gameComplete ? mostRecentLineSpreadGrade : "---"}
              </Badge>
            )}
            <Spacer h={0.4} />
            {stale && started && !gameComplete ? (
              <>
                <Badge type="warning">Stale: Not updated</Badge>
                <Spacer h={0.4} />
              </>
            ) : undefined}
            {gameComplete ? (
              <>
                <Badge type="secondary">Complete</Badge>
                <Spacer h={0.4} />
              </>
            ) : undefined}

            {started && !gameComplete ? (
              <Text h5 margin={0}>
                {formatTime(mostRecentLine)}
              </Text>
            ) : undefined}
            {gameComplete && view === "total" ? (
              <Text h5 margin={0}>
                {`Final Total: ${
                  (game.finalAwayScore || 0) + (game.finalHomeScore || 0)
                }`}
              </Text>
            ) : undefined}
            {gameComplete && view === "ats" ? (
              <Text h5 margin={0}>
                {`Final Away: ${
                  (game.finalAwayScore || 0) - (game.finalHomeScore || 0)
                }`}
              </Text>
            ) : undefined}
            {!started ? (
              <Text h5 margin={0} style={{ textAlign: "right" }}>
                {view === "total" && `Total Line: ${game.closingTotalLine}`}
                {view === "ats" &&
                  `Away Spread: ${game.closingAwayLine >= 0 ? "+" : ""}${
                    game.closingAwayLine
                  }`}
              </Text>
            ) : undefined}
          </Grid>
        </Grid.Container>
      </Card.Content>
      <Divider />
      <Card.Content>
        <div
          style={{
            height: !started ? "100px" : "420px",
            width: "100%",
            marginTop: "-1.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {started && view === "total" ? <TotalGraph game={game} /> : undefined}
          {started && view === "ats" ? <SpreadGraph game={game} /> : undefined}
          {!started && <Activity color="red" size={36} />}
        </div>
        {started ? (
          <div
            style={{
              height: "200px",
              width: "100%",
              marginTop: "-1.5rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {view === "total" && <TotalBarGraph game={game} />}
            {view === "ats" && <ATSBarGraph game={game} />}
          </div>
        ) : undefined}
      </Card.Content>
    </Card>
  );
}

export default GameCard;
