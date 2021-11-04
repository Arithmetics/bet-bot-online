import { Grid } from "@geist-ui/react";

import { Game } from "../backend/node_modules/.prisma/client";

import { GameCard } from "./GameCard";

type GamesProps = {
  games?: Game[];
};

export function Games({ games }: GamesProps): JSX.Element {
  return (
    <Grid.Container gap={2} justify="center">
      {games?.map((game) => (
        <Grid key={game.id} width="600px">
          <GameCard game={game} />
        </Grid>
      ))}
    </Grid.Container>
  );
}
