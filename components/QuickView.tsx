import { Grid, Card } from "@geist-ui/react";
import TeamLogoVersus from "./TeamLogoVersus";
import { GamePlus, LiveGameLinePlus } from "../backend/src/database";

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

  return (
    <Grid.Container gap={1} justify="center">
      {[liveGames, completeGames, notStartedGames].map((gameSet) =>
        gameSet.map((game) => (
          <Grid key={game?.id} xs={24}>
            <Card shadow width="100%">
              <Grid>
                <TeamLogoVersus game={game} />
              </Grid>
            </Card>
          </Grid>
        ))
      )}
    </Grid.Container>
  );
}

export default QuickView;
