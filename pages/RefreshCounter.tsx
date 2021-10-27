import { Text, Input, Button, Grid } from "@geist-ui/react";
import RefreshCcw from "@geist-ui/react-icons/refreshCcw";

export function RefreshCounter() {
  return (
    <>
      <Text h2>Next update: 17:23 (PST)</Text>
      <Text h4>Data is 4 minutes and 42 seconds stale</Text>
      <Grid.Container justify="flex-start" padding={0} gap={2}>
        <Grid>
          <Input.Password placeholder="Password" height="2.5rem" />
        </Grid>
        <Grid>
          <Button icon={<RefreshCcw />} height="2.5rem" type="error" ghost>
            Refresh
          </Button>
        </Grid>
      </Grid.Container>
    </>
  );
}
