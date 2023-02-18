import { Grid, Text } from "@geist-ui/react";
import Meh from "@geist-ui/react-icons/meh";

export default function NoResult(): JSX.Element {
  return (
    <Grid.Container
      direction="column"
      justify="center"
      alignItems="center"
      style={{ marginTop: "10rem" }}
    >
      <Text type="warning" h4>
        No Games
      </Text>
      <Meh color="#F5A623" size={36} />
    </Grid.Container>
  );
}
