import { Grid } from "@geist-ui/react";

import { GamePlus } from "../backend/src/database";

import { GameCard } from "./GameCard";

type GamesProps = {
  games?: GamePlus[];
  messageTimestamp?: number;
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

export function Games({ games, messageTimestamp }: GamesProps): JSX.Element {
  return (
    <Grid.Container gap={2} justify="center">
      {games?.sort(sortStarted).map((game) => (
        <Grid key={game?.id} style={{ width: "500px", maxWidth: "95vw" }}>
          <GameCard game={game} messageTimestamp={messageTimestamp} />
        </Grid>
      ))}
    </Grid.Container>
  );
}

export default Games;
