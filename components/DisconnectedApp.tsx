import {
  Page,
  Text,
  Display,
  Grid,
  useToasts,
  Loading,
  ButtonGroup,
  useMediaQuery,
  Button,
  useTheme,
} from "@geist-ui/react";
import AlertTriangle from "@geist-ui/react-icons/alertTriangle";

export default function DisconnectedApp(): JSX.Element {
  return (
    <Grid.Container
      direction="column"
      justify="center"
      alignItems="center"
      style={{ marginTop: "10rem" }}
    >
      <Grid xs={12}>
        <Text type="error" h4>
          Disconnected (Try Refresh)
        </Text>
      </Grid>
      <Grid xs={12}>
        <AlertTriangle color="red" size={36} />
      </Grid>
    </Grid.Container>
  );
}
