import { Button, Grid, Text } from "@geist-ui/react";
import AlertTriangle from "@geist-ui/react-icons/alertTriangle";

export default function DisconnectedApp(): JSX.Element {
  const refresh = () => {
    window.location.reload();
  };
  return (
    <Grid.Container
      direction="column"
      justify="center"
      alignItems="center"
      style={{ marginTop: "10rem" }}
    >
      <Grid xs={12}>
        <Text type="error" h4>
          Disconnected
        </Text>
      </Grid>
      <Grid xs={12}>
        <AlertTriangle color="red" size={36} />
      </Grid>
      <Grid xs={24}>
        <Button
          type="error"
          ghost
          scale={0.5}
          onClick={refresh}
          style={{
            marginTop: "16px",
          }}
        >
          Reload
        </Button>
      </Grid>
    </Grid.Container>
  );
}
