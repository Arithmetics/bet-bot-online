import Head from "next/head";
import { useState, useEffect } from "react";
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
import useWebSocket, { ReadyState } from "react-use-websocket";
import { GamePlus, HistoricalBetting } from "../backend/src/database";
import DisconnectedApp from "../components/DisconnectedApp";
import { Games } from "../components/Games";
import { RefreshCounter } from "../components/RefreshCounter";
import NProgress from "nprogress";
import BetTable from "../components/BetTable";

type ConnectionMessage = {
  messageTimestamp: number;
  games: GamePlus[];
  msUntilNextUpdate: number;
  historicalBetting: HistoricalBetting | null;
};

export type View = "ats" | "total" | "bets";

// const websocketUrl = "ws://localhost:8999";
const websocketUrl = "wss://brockcastle.pagekite.me/";

export default function Home(): JSX.Element {
  const [, setToast] = useToasts();
  const { palette } = useTheme();
  const downMd = useMediaQuery("sm", { match: "down" });

  const { lastMessage, readyState } = useWebSocket(websocketUrl);

  const [view, setView] = useState<View>("total");

  const [currentMessage, setCurrentMessage] =
    useState<ConnectionMessage | null>(null);

  useEffect(() => {
    NProgress.configure({ trickle: false });
    NProgress.start();
  }, []);

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
      setCurrentMessage(JSON.parse(lastMessage.data));
      NProgress.set(0);
    }
  }, [lastMessage, setCurrentMessage]);

  const isConnecting = readyState === ReadyState.CONNECTING;
  const isDisconnected = readyState === ReadyState.CLOSED;
  const isConnected = readyState === ReadyState.OPEN;

  return (
    <div>
      <Head>
        <title>bet bot</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>"
        />
      </Head>
      <Page
        dotBackdrop
        style={{
          maxWidth: "2200px",
          width: downMd ? "100%" : "95%",
          padding: "0px",
        }}
        padding={0}
      >
        <Display
          title="bet bot"
          caption={<>welcome to the bet bot</>}
          margin={0}
        >
          {/* <Text h1>🤖 🏀</Text> */}
        </Display>

        {isDisconnected ? <DisconnectedApp /> : undefined}

        {isConnecting ? (
          <Loading style={{ marginTop: "10rem" }} type="error">
            Loading
          </Loading>
        ) : undefined}

        {isConnected ? (
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
            <Grid.Container justify="center" gap={3} marginBottom={2}>
              <Grid>
                <ButtonGroup>
                  <Button
                    style={{
                      backgroundColor:
                        view === "total" ? palette.violet : "inherit",
                      color: view === "total" ? palette.foreground : "inherit",
                    }}
                    onClick={() => setView("total")}
                  >
                    Totals
                  </Button>
                  <Button
                    style={{
                      backgroundColor:
                        view === "ats" ? palette.violet : "inherit",
                      color: view === "ats" ? palette.foreground : "inherit",
                    }}
                    onClick={() => setView("ats")}
                  >
                    Spreads
                  </Button>
                  <Button
                    style={{
                      backgroundColor:
                        view === "bets" ? palette.violet : "inherit",
                      color: view === "bets" ? palette.foreground : "inherit",
                    }}
                    onClick={() => setView("bets")}
                  >
                    Bets
                  </Button>
                </ButtonGroup>
              </Grid>
            </Grid.Container>
            {view === "total" || view === "ats" ? (
              <Games
                view={view}
                games={currentMessage?.games}
                messageTimestamp={currentMessage?.messageTimestamp}
              />
            ) : undefined}
            {view === "bets" ? (
              <BetTable
                historicalBetting={currentMessage?.historicalBetting || null}
              />
            ) : undefined}
          </>
        ) : undefined}
      </Page>
    </div>
  );
}
