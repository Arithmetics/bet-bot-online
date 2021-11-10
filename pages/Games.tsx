import { Grid } from "@geist-ui/react";

import { GamePlus } from "../backend/src/database";

import { GameCard } from "./GameCard";

type GamesProps = {
  games?: GamePlus[];
  disconnected: boolean;
};

function sortStarted(a: GamePlus, b: GamePlus): number {
  if (!a.liveGameLines.length) {
    return 1;
  }
  if (!b.liveGameLines.length) {
    return -1;
  }

  return a.liveGameLines.length > b.liveGameLines.length ? 1 : -1;
}

export function Games({ games, disconnected }: GamesProps): JSX.Element {
  return (
    <Grid.Container gap={2} justify="center">
      {games?.sort(sortStarted).map((game) => (
        <Grid key={game?.id} width="600px">
          <GameCard game={game} disconnected={disconnected} />
        </Grid>
      ))}
    </Grid.Container>
  );
}

export default Games;
