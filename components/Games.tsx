import { Grid } from "@geist-ui/react";

import { GamePlus, LiveGameLinePlus } from "../backend/src/database";

import { GameCard } from "./GameCard";
import { View } from "../pages/index";
import NoResult from "./NoResult";

type GamesProps = {
  games?: GamePlus[];
  messageTimestamp?: number;
  view: View;
};

function sortTimestamp(a: LiveGameLinePlus, b: LiveGameLinePlus): number {
  return a.timestamp > b.timestamp ? 1 : -1;
}

export function Games({
  games,
  messageTimestamp,
  view,
}: GamesProps): JSX.Element {
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
    <Grid.Container gap={2} justify="center">
      {isEmpty && <NoResult />}
      {allGames.map((gameSet) =>
        gameSet.map((game) => (
          <Grid key={game?.id} style={{ width: "425px", maxWidth: "95vw" }}>
            <GameCard
              game={game}
              messageTimestamp={messageTimestamp}
              view={view}
            />
          </Grid>
        ))
      )}
    </Grid.Container>
  );
}

export default Games;
