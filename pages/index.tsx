import Head from "next/head";
import { useState, useEffect } from "react";
import { Page, Text, Display, Grid, useToasts, Loading } from "@geist-ui/react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { GamePlus } from "../backend/src/database";

import { Games } from "./Games";
import { RefreshCounter } from "./RefreshCounter";

type ConnectionMessage = {
  messageTimestamp: number;
  games: GamePlus[];
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
      console.log("setting new message", JSON.parse(lastMessage.data));
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
          <Loading style={{ marginTop: "10rem" }} type="error">
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
            <Games
              games={currentMessage?.games}
              disconnected={readyState === ReadyState.CLOSED}
            />
          </>
        )}
      </Page>
    </div>
  );
}
