import Head from "next/head";
import { useState, useEffect } from "react";
import { Page, Text, Display, Grid, useToasts, Loading } from "@geist-ui/react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { RefreshCounter } from "./RefreshCounter";
import { GameCard } from "./TotalGraph";

type ConnectionMessage = {
  messageTimestamp: number;
  games: string[];
  msUntilNextUpdate: number;
};

const websocketUrl = "ws://localhost:8999";

export default function Home(): JSX.Element {
  const [, setToast] = useToasts();

  const { lastMessage, readyState } = useWebSocket(websocketUrl);

  const [currentMessage, setCurrentMessage] =
    useState<ConnectionMessage | null>(null);

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      setToast({
        text: "Lost connection with server. Refresh and try again.",
        type: "error",
      });
    }
    if (readyState === ReadyState.OPEN) {
      setToast({
        text: "Connected successfully",
        type: "success",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState]);

  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      console.log("setting new message");
      setCurrentMessage(JSON.parse(lastMessage.data));
    }
  }, [lastMessage, setCurrentMessage]);

  const isConnecting = readyState === ReadyState.CONNECTING;

  return (
    <div>
      <Head>
        <title>bet bot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page dotBackdrop width="1200px" padding={0}>
        <Display
          title="bet bot"
          caption={<>welcome to the bet bot</>}
          margin={0}
        >
          <Text h1>🤖 🏀</Text>
        </Display>

        {isConnecting ? (
          <Loading marginTop={10} type="error">
            Loading
          </Loading>
        ) : (
          <>
            <Grid.Container justify="center" gap={3}>
              <Grid>
                {currentMessage?.msUntilNextUpdate &&
                currentMessage.messageTimestamp ? (
                  <RefreshCounter
                    msUntilNextUpdate={currentMessage?.msUntilNextUpdate}
                    messageTimestamp={currentMessage?.messageTimestamp}
                  />
                ) : undefined}
              </Grid>
            </Grid.Container>
            <Grid.Container gap={2} justify="center">
              <Grid width="600px">
                <GameCard isLoading />
              </Grid>
              <Grid width="600px">
                <GameCard />
              </Grid>
              <Grid>
                <GameCard />
              </Grid>
              <Grid>
                <GameCard />
              </Grid>
              <Grid>
                <GameCard />
              </Grid>
              <Grid>
                <GameCard />
              </Grid>
            </Grid.Container>
          </>
        )}
      </Page>
    </div>
  );
}
