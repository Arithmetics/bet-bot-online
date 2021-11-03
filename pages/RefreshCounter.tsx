import { useState } from "react";
import { Text, Input, Button, Grid, Modal } from "@geist-ui/react";
import RefreshCcw from "@geist-ui/react-icons/refreshCcw";

type RefreshCounterProps = {
  messageTimestamp?: number;
  msUntilNextUpdate?: number;
};

export function RefreshCounter({
  messageTimestamp,
  msUntilNextUpdate,
}: RefreshCounterProps): JSX.Element {
  const [state, setState] = useState(false);

  const handler = () => setState(true);

  const closeHandler = () => {
    setState(false);
  };

  const nextUpdateTime = new Date(
    Date.now() + (msUntilNextUpdate || 0)
  ).toLocaleTimeString();

  return (
    <Grid justify="center">
      <Text h2>Next update: {nextUpdateTime}</Text>
      <Text h4>
        Data is 4 minutes and 42 seconds stale &nbsp;{" "}
        <Button
          iconRight={<RefreshCcw />}
          auto
          scale={2 / 3}
          onClick={handler}
        />
      </Text>

      <Modal visible={state} onClose={closeHandler}>
        <Modal.Content>
          <Grid.Container justify="center" padding={0} gap={2}>
            <Grid>
              <Input.Password placeholder="Password" height="2.5rem" />
            </Grid>
            <Grid>
              <Button icon={<RefreshCcw />} height="2.5rem" type="error" ghost>
                Refresh
              </Button>
            </Grid>
          </Grid.Container>
        </Modal.Content>
        <Modal.Action passive onClick={() => setState(false)}>
          Cancel
        </Modal.Action>
      </Modal>
    </Grid>
  );
}
