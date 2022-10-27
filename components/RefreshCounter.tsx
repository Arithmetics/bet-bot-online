import { useState, useEffect } from "react";
import {
  Text,
  Input,
  Button,
  Grid,
  Modal,
  useMediaQuery,
} from "@geist-ui/react";
import RefreshCcw from "@geist-ui/react-icons/refreshCcw";
import NProgress from "nprogress";
import TimeAgo from "react-timeago";

type RefreshCounterProps = {
  messageTimestamp: number;
  msUntilNextUpdate: number;
};

export function RefreshCounter({
  messageTimestamp,
  msUntilNextUpdate,
}: RefreshCounterProps): JSX.Element {
  const [state, setState] = useState(false);

  const downMd = useMediaQuery("sm", { match: "down" });

  const closeHandler = () => {
    setState(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const percentage = (Date.now() - messageTimestamp) / msUntilNextUpdate;
      NProgress.set(percentage);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nextUpdateTime = new Date(
    messageTimestamp + msUntilNextUpdate
  ).toLocaleTimeString();

  return (
    <Grid justify="center">
      {!downMd && <Text h3>🤖 🏀 Next update: {nextUpdateTime}</Text>}
      {downMd && <Text h5>🤖 🏀 Next update: {nextUpdateTime}</Text>}

      <TimeAgo
        date={new Date(messageTimestamp)}
        formatter={(val, unit) => {
          const time = `${val} ${unit}${val === 1 ? "" : "s"}`;
          return (
            <Text h4 type="error" style={{ textAlign: "center" }}>
              Data is {time} stale
            </Text>
          );
        }}
      />
      {/* <Button iconRight={<RefreshCcw />} auto scale={2 / 3} onClick={handler} /> */}

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

export default RefreshCounter;
