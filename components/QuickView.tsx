import { Grid } from "@geist-ui/react";
import { GamePlus, LiveGameLinePlus } from "../backend/src/database";
import NoResult from "./NoResult";
import QuickGame from "./QuickGame";

type QuickViewProps = {
  games?: GamePlus[];
  messageTimestamp?: number;
};

function sortTimestamp(a: LiveGameLinePlus, b: LiveGameLinePlus): number {
  return a.timestamp > b.timestamp ? 1 : -1;
}

export function QuickView({
  games,
  messageTimestamp,
}: QuickViewProps): JSX.Element {
  const gamesWithSortedLines = games?.map((game) => {
    const lines = [...game.liveGameLines];
    lines.sort(sortTimestamp);
    game.liveGameLines = lines;
    return game;
  });

  const completeGames =
    gamesWithSortedLines?.filter((g) => g.finalAwayScore && g.finalHomeScore) ||
    [];
  const liveGames =
    gamesWithSortedLines?.filter(
      (g) =>
        g.liveGameLines.length > 0 && !g.finalAwayScore && !g.finalHomeScore
    ) || [];
  const notStartedGames =
    gamesWithSortedLines?.filter((g) => g.liveGameLines.length === 0) || [];

  const allGames = [liveGames, completeGames, notStartedGames];
  const isEmpty = allGames.every((g) => g.length === 0);
  return (
    <Grid.Container
      gap={1}
      justify="center"
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: "min(1080px, 100%)",
      }}
    >
      {isEmpty && <NoResult />}
      {allGames.map((gameSet) =>
        gameSet.map((game) => (
          <QuickGame
            key={game.id}
            game={game}
            messageTimestamp={messageTimestamp}
          />
        ))
      )}
    </Grid.Container>
  );
}

export default QuickView;
