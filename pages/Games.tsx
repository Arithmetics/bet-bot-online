import { Grid } from "@geist-ui/react";

import { GameWithLines } from "../backend/src/database";

import { GameCard } from "./GameCard";

type GamesProps = {
  games?: GameWithLines[];
  disconnected: boolean;
};

export function Games({ games, disconnected }: GamesProps): JSX.Element {
  return (
    <Grid.Container gap={2} justify="center">
      {games?.map((game) => (
        <Grid key={game?.id} width="600px">
          <GameCard game={game} disconnected={disconnected} />
        </Grid>
      ))}
    </Grid.Container>
  );
}
