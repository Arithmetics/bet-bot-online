import Head from "next/head";
import { useState, useEffect } from "react";
import { Page, Text, Display, Grid, useToasts, Loading } from "@geist-ui/react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { RefreshCounter } from "./RefreshCounter";
import { GameCard } from "./TotalGraph";

const websocketUrl = "ws://localhost:8999";

export default function Home() {
  const [_, setToast] = useToasts();

  const { sendMessage, lastMessage, readyState } = useWebSocket(websocketUrl);

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
  }, [readyState]);

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
          <Loading type="error" marginTop={10}></Loading>
        ) : (
          <>
            <Grid.Container justify="center" gap={3}>
              <Grid>
                <RefreshCounter />
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
