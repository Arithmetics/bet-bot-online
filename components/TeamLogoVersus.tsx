import { Grid, Image, Text } from "@geist-ui/react";
import { GamePlus } from "../backend/src/database";

type TeamLogoVersusProps = {
  game: GamePlus;
};

function getLogoUrl(teamName: string): string {
  const noSpaces = teamName.replace(/\s/g, "");
  return `/nba_team_logos/${noSpaces}.png`;
}

export function TeamLogoVersus({
  game,
}: TeamLogoVersusProps): JSX.Element | null {
  return (
    <Grid xs={24}>
      <Grid.Container alignItems="center" gap={1} wrap="nowrap">
        <Grid>
          <Image
            height="35px"
            src={getLogoUrl(game.awayTeam)}
            alt={game.awayTeam}
          />
        </Grid>
        <Grid>
          <Text h4>@</Text>
        </Grid>
        <Grid>
          <Image
            height="35px"
            src={getLogoUrl(game.homeTeam)}
            alt={game.homeTeam}
          />
        </Grid>
      </Grid.Container>
    </Grid>
  );
}

export default TeamLogoVersus;
